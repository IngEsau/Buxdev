import {
  blogFeedSchema,
  blogLocaleSchema,
  type BlogFeed,
  type BlogLocale,
} from "./blog-schema"

export const BLOG_API_ENDPOINT = "https://api.buxdev.com/v1/build/articles"
export const BLOG_API_TIMEOUT_MS = 8_000
export const BLOG_API_MAX_RESPONSE_BYTES = 1_048_576

interface BlogApiLoaderOptions {
  endpoint?: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
  maxResponseBytes?: number
}

function validateEndpoint(endpoint: string) {
  let url: URL

  try {
    url = new URL(endpoint)
  } catch {
    throw new Error("Blog API endpoint is invalid.")
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "api.buxdev.com" ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/v1/build/articles" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("Blog API endpoint is not allowed.")
  }

  return url
}

function validatePositiveInteger(value: number, name: string) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`)
  }
}

async function readBoundedResponse(response: Response, maxResponseBytes: number) {
  const declaredLength = response.headers.get("content-length")
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength)
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      throw new Error("Blog API returned an invalid content length.")
    }
    if (parsedLength > maxResponseBytes) {
      throw new Error("Blog API response exceeds the allowed size.")
    }
  }

  if (!response.body) {
    throw new Error("Blog API returned an empty response.")
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let receivedBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    receivedBytes += value.byteLength
    if (receivedBytes > maxResponseBytes) {
      await reader.cancel().catch(() => undefined)
      throw new Error("Blog API response exceeds the allowed size.")
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(receivedBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    throw new Error("Blog API response is not valid UTF-8.")
  }
}

async function fetchBlogFeed(
  locale: BlogLocale,
  endpoint: URL,
  fetchImpl: typeof fetch,
  timeoutMs: number,
  maxResponseBytes: number,
): Promise<BlogFeed> {
  const url = new URL(endpoint)
  url.searchParams.set("locale", locale)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const request = async () => {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      redirect: "error",
      cache: "no-store",
      signal: controller.signal,
    })
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined)
      throw new Error(`Blog API returned HTTP ${response.status}.`)
    }

    const mediaType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase()
    if (mediaType !== "application/json") {
      await response.body?.cancel().catch(() => undefined)
      throw new Error("Blog API response must use application/json.")
    }

    const body = await readBoundedResponse(response, maxResponseBytes)
    let payload: unknown

    try {
      payload = JSON.parse(body)
    } catch {
      throw new Error("Blog API returned invalid JSON.")
    }

    const result = blogFeedSchema.safeParse(payload)
    if (!result.success) {
      throw new Error("Blog API returned an invalid contract.")
    }

    if (result.data.articles.some((article) => article.locale !== locale)) {
      throw new Error("Blog API returned articles for an unexpected locale.")
    }

    return result.data
  }

  try {
    // The deadline covers headers AND streaming the body (including a stalled body).
    return await Promise.race([
      request(),
      new Promise<never>((_resolve, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new Error("Blog API request timed out."))
        }, { once: true })
      }),
    ])
  } catch (error) {
    if (controller.signal.aborted) throw new Error("Blog API request timed out.")
    if (error instanceof Error && error.message.startsWith("Blog API ")) throw error
    throw new Error("Blog API request failed.")
  } finally {
    clearTimeout(timeout)
  }
}

export function createBlogApiLoader(options: BlogApiLoaderOptions = {}) {
  const endpoint = validateEndpoint(options.endpoint ?? BLOG_API_ENDPOINT)
  const fetchImpl = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? BLOG_API_TIMEOUT_MS
  const maxResponseBytes = options.maxResponseBytes ?? BLOG_API_MAX_RESPONSE_BYTES
  validatePositiveInteger(timeoutMs, "timeoutMs")
  validatePositiveInteger(maxResponseBytes, "maxResponseBytes")

  const loads = new Map<BlogLocale, Promise<BlogFeed>>()

  return (requestedLocale: BlogLocale = "es") => {
    const locale = blogLocaleSchema.parse(requestedLocale)
    const existingLoad = loads.get(locale)
    if (existingLoad) return existingLoad

    const load = fetchBlogFeed(
      locale,
      endpoint,
      fetchImpl,
      timeoutMs,
      maxResponseBytes,
    )
    loads.set(locale, load)
    return load
  }
}

export const loadBlogFeed = createBlogApiLoader()

export async function getBlogArticles(locale: BlogLocale = "es") {
  return (await loadBlogFeed(locale)).articles
}
