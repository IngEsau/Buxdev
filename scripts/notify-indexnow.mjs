import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url))
const KEY = 'eb0d64a2c026422a948a7b49af9d1aa1'
const ORIGIN = 'https://buxdev.com'
// Keep the approved notification scope; blog URLs are discovered through the sitemap.
const INDEXABLE_URLS = ['/', '/about/', '/services/', '/contact/'].map(path => ORIGIN + path)

export async function prepareNotification(root = PROJECT_ROOT) {
  const filename = `${KEY}.txt`
  const [sourceKey, exportedKey, sitemap] = await Promise.all([
    readFile(resolve(root, 'public', filename), 'utf8'),
    readFile(resolve(root, 'out', filename), 'utf8'),
    readFile(resolve(root, 'out/sitemap.xml'), 'utf8'),
  ])
  if (sourceKey.trim() !== KEY || exportedKey !== sourceKey) {
    throw new Error('La key pública falta, cambió o no coincide con la exportación.')
  }
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(match => match[1])
  const blogUrl = /^https:\/\/buxdev\.com\/blog\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?$/
  if (new Set(sitemapUrls).size !== sitemapUrls.length ||
      INDEXABLE_URLS.some(url => !sitemapUrls.includes(url)) ||
      sitemapUrls.some(url => !INDEXABLE_URLS.includes(url) && !blogUrl.test(url))) {
    throw new Error('El sitemap debe conservar las cuatro URLs aprobadas y solo añadir rutas válidas del blog.')
  }
  for (const url of sitemapUrls.filter(url => blogUrl.test(url))) {
    // No added URL is accepted unless its static HTML actually exists.
    await readFile(resolve(root, 'out', new URL(url).pathname.slice(1), 'index.html'))
  }
  const urlList = INDEXABLE_URLS
  return { host: 'buxdev.com', key: KEY, keyLocation: `${ORIGIN}/${filename}`, urlList }
}

export async function notifyIndexNow(payload, fetchRequest = globalThis.fetch) {
  // Fixed HTTPS destination, default TLS verification, no redirects or automatic retries.
  const response = await fetchRequest('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  })
  // Do not print or consume an untrusted response body.
  await response.body?.cancel()
  if (response.status === 200) return 'Cuatro URLs recibidas por IndexNow (HTTP 200).'
  if (response.status === 202) return 'Cuatro URLs aceptadas; validación de key pendiente (HTTP 202).'
  throw new Error(`IndexNow respondió HTTP ${response.status}.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const mode = process.argv[2]
    if (!['--check', '--submit'].includes(mode) || process.argv.length !== 3) {
      throw new Error('Uso: node scripts/notify-indexnow.mjs --check|--submit')
    }
    const payload = await prepareNotification()
    const message = mode === '--check'
      ? 'Key preservada y cuatro URLs del sitemap validadas; sin notificación.'
      : await notifyIndexNow(payload)
    console.log(`[indexnow] ${message}`)
  } catch (error) {
    // Network errors may include untrusted URLs/details; emit only controlled diagnostics.
    const message = error instanceof Error && /^(La key|El sitemap|Uso:|IndexNow respondió HTTP)/.test(error.message)
      ? error.message
      : 'No fue posible validar o notificar IndexNow (archivos, red, TLS o timeout).'
    console.error(`[indexnow] ${message}`)
    process.exitCode = 1
  }
}
