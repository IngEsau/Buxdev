import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const fixturePath = resolve('tests/blog/fixtures/articles.json')
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
const cloneFixture = () => structuredClone(fixture)

// Transpile the two isolated TypeScript modules into an ignored temporary
// directory so Node tests the same extensionless imports used by Next.js.
await mkdir('.next', { recursive: true })
const compiledDirectory = await mkdtemp(resolve('.next', 'blog-contract-test-'))
for (const name of ['blog-schema', 'blog-api', 'blog-seo', 'seo']) {
  const source = await readFile(resolve('lib', `${name}.ts`), 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
  }).outputText.replace('"./blog-schema"', '"./blog-schema.mjs"').replace('"./seo"', '"./seo.mjs"')
  await writeFile(resolve(compiledDirectory, `${name}.mjs`), output)
}
const {
  BLOG_API_ENDPOINT,
  createBlogApiLoader,
} = await import(pathToFileURL(resolve(compiledDirectory, 'blog-api.mjs')).href)
const {
  BLOG_LIMITS,
  articleSchema,
  blogFeedSchema,
} = await import(pathToFileURL(resolve(compiledDirectory, 'blog-schema.mjs')).href)
const { articleMetadata, serializeBlogJsonLd } = await import(pathToFileURL(resolve(compiledDirectory, 'blog-seo.mjs')).href)

after(async () => {
  await rm(compiledDirectory, { recursive: true, force: true })
})

function assertInvalid(payload, message) {
  assert.equal(blogFeedSchema.safeParse(payload).success, false, message)
}

test('The development fixture implements the complete version 1 contract', () => {
  const parsed = blogFeedSchema.parse(fixture)
  assert.equal(parsed.schemaVersion, 1)
  assert.equal(parsed.articles.length, 2)
  assert.deepEqual(new Set(parsed.articles.map((article) => article.locale)), new Set(['es']))
  assert.deepEqual(
    new Set(parsed.articles.flatMap((article) => article.content.map((block) => block.type))),
    new Set(['heading', 'paragraph', 'list', 'code', 'quote']),
  )
})

test('Article fields, locales, dates, headings and structured blocks are strict', () => {
  for (const [label, mutate] of [
    ['blank ID', (feed) => { feed.articles[0].id = '   ' }],
    ['unsupported locale', (feed) => { feed.articles[0].locale = 'fr' }],
    ['invalid publication date', (feed) => { feed.articles[0].publishedAt = '2026-99-99' }],
    ['update before publication', (feed) => { feed.articles[0].updatedAt = '2020-01-01T00:00:00Z' }],
    ['h1 heading', (feed) => { feed.articles[0].content[0].level = 1 }],
    ['invalid heading ID', (feed) => { feed.articles[0].content[0].id = 'Invalid ID' }],
    ['arbitrary HTML block', (feed) => { feed.articles[0].content[0] = { type: 'html', value: '<script>run()</script>' } }],
    ['unknown article field', (feed) => { feed.articles[0].status = 'published' }],
  ]) {
    const candidate = cloneFixture()
    mutate(candidate)
    assertInvalid(candidate, label)
  }

  const duplicateHeading = cloneFixture()
  duplicateHeading.articles[0].content.push({
    ...duplicateHeading.articles[0].content[0],
  })
  assertInvalid(duplicateHeading, 'duplicate heading ID')

  assert.equal(articleSchema.safeParse(fixture.articles[0]).success, true)
})

test('Slugs are normalized and unique inside each locale', () => {
  for (const slug of ['Uppercase', 'two--hyphens', '-leading', 'trailing-', 'with space']) {
    const candidate = cloneFixture()
    candidate.articles[0].slug = slug
    assertInvalid(candidate, slug)
  }

  const duplicate = cloneFixture()
  duplicate.articles[1].slug = duplicate.articles[0].slug
  assertInvalid(duplicate, 'same slug in Spanish')

  const translated = cloneFixture()
  translated.articles[1].locale = 'en'
  translated.articles[1].slug = translated.articles[0].slug
  assert.equal(blogFeedSchema.safeParse(translated).success, true)
})

test('Links allow HTTPS and internal paths only', () => {
  const href = (candidate) => candidate.articles[0].content[1].content[1]

  for (const allowed of ['https://buxdev.com/blog/', '/blog/article/', '/']) {
    const candidate = cloneFixture()
    href(candidate).href = allowed
    assert.equal(blogFeedSchema.safeParse(candidate).success, true, allowed)
  }

  for (const rejected of [
    'http://buxdev.com/',
    'javascript:alert(1)',
    'data:text/html,test',
    'mailto:info@buxdev.com',
    '//attacker.example/path',
    '/\\attacker.example/path',
    'relative/path',
    'https://user:password@buxdev.com/',
  ]) {
    const candidate = cloneFixture()
    href(candidate).href = rejected
    assertInvalid(candidate, rejected)
  }
})

test('Contract limits bound strings and collections', () => {
  const longTitle = cloneFixture()
  longTitle.articles[0].title = 'x'.repeat(BLOG_LIMITS.title + 1)
  assertInvalid(longTitle, 'title limit')

  const longInlineList = cloneFixture()
  longInlineList.articles[0].content[1].content = Array.from(
    { length: BLOG_LIMITS.inlineItems + 1 },
    () => ({ type: 'text', value: 'bounded' }),
  )
  assertInvalid(longInlineList, 'inline content limit')

  const tooManyArticles = cloneFixture()
  tooManyArticles.articles = Array.from(
    { length: BLOG_LIMITS.articles + 1 },
    (_, index) => ({
      ...structuredClone(fixture.articles[0]),
      id: `article-${index}`,
      slug: `article-${index}`,
    }),
  )
  assertInvalid(tooManyArticles, 'article count limit')
})

test('Loader validates the endpoint and reuses one validated request per locale', async () => {
  const calls = []
  const body = JSON.stringify(fixture)
  const load = createBlogApiLoader({
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options })
      return new Response(body, {
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      })
    },
  })

  const [first, second] = await Promise.all([load('es'), load('es')])
  assert.strictEqual(first, second)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, `${BLOG_API_ENDPOINT}?locale=es`)
  assert.equal(calls[0].options.method, 'GET')
  assert.equal(calls[0].options.redirect, 'error')
  assert.equal(calls[0].options.headers.Accept, 'application/json')
  assert.ok(calls[0].options.signal instanceof AbortSignal)

  for (const endpoint of [
    'http://api.buxdev.com/v1/build/articles',
    'https://evil.example/v1/build/articles',
    'https://api.buxdev.com.evil.example/v1/build/articles',
    'https://api.buxdev.com:8443/v1/build/articles',
    'https://user@api.buxdev.com/v1/build/articles',
    'https://api.buxdev.com/v1/other',
    'https://api.buxdev.com/v1/build/articles?locale=es',
  ]) {
    assert.throws(() => createBlogApiLoader({ endpoint }), /not allowed/)
  }
})

test('Loader rejects unsafe responses without exposing their bodies', async () => {
  const failingLoader = (response, options = {}) => createBlogApiLoader({
    fetchImpl: async () => response,
    ...options,
  })

  const upstreamError = failingLoader(new Response('PRIVATE RESPONSE BODY', { status: 502 }))
  await assert.rejects(upstreamError('es'), (error) => {
    assert.match(error.message, /HTTP 502/)
    assert.doesNotMatch(error.message, /PRIVATE RESPONSE BODY/)
    return true
  })

  await assert.rejects(
    failingLoader(new Response('{}', { headers: { 'Content-Type': 'text/plain' } }))('es'),
    /application\/json/,
  )
  await assert.rejects(
    failingLoader(new Response('{', { headers: { 'Content-Type': 'application/json' } }))('es'),
    /invalid JSON/,
  )

  const wrongVersion = cloneFixture()
  wrongVersion.schemaVersion = 2
  await assert.rejects(
    failingLoader(new Response(JSON.stringify(wrongVersion), {
      headers: { 'Content-Type': 'application/json' },
    }))('es'),
    /invalid contract/,
  )

  const wrongLocale = cloneFixture()
  wrongLocale.articles[0].locale = 'en'
  await assert.rejects(
    failingLoader(new Response(JSON.stringify(wrongLocale), {
      headers: { 'Content-Type': 'application/json' },
    }))('es'),
    /unexpected locale/,
  )

  await assert.rejects(
    failingLoader(new Response('{}', {
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '100',
      },
    }), { maxResponseBytes: 10 })('es'),
    /exceeds the allowed size/,
  )
  await assert.rejects(
    failingLoader(new Response('12345', {
      headers: { 'Content-Type': 'application/json' },
    }), { maxResponseBytes: 4 })('es'),
    /exceeds the allowed size/,
  )
})

test('Loader applies a bounded timeout without making a real network request', async () => {
  const load = createBlogApiLoader({
    timeoutMs: 10,
    fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'))
      }, { once: true })
    }),
  })

  await assert.rejects(load('es'), /timed out/)
})

test('Timeout also bounds a stalled response body, and failed loads are never replaced by an empty feed', async () => {
  let calls = 0
  const load = createBlogApiLoader({
    timeoutMs: 20,
    fetchImpl: async (_url, options) => {
      calls++
      return new Response(new ReadableStream({
        start(controller) {
          options.signal.addEventListener('abort', () => controller.error(new Error('aborted')), { once: true })
        },
      }), { headers: { 'Content-Type': 'application/json' } })
    },
  })
  await assert.rejects(load('es'), /timed out/)
  await assert.rejects(load('es'), /timed out/)
  assert.equal(calls, 1)
})

test('Article metadata uses canonical URLs and JSON-LD cannot break out of its script', () => {
  const article = structuredClone(fixture.articles[0])
  article.title = '</script><script>alert(1)</script>'
  const metadata = articleMetadata(article)
  assert.equal(metadata.alternates.canonical, `https://buxdev.com/blog/${article.slug}/`)
  assert.equal(metadata.openGraph.type, 'article')
  assert.equal(metadata.openGraph.publishedTime, article.publishedAt)
  const serialized = serializeBlogJsonLd(article)
  assert.ok(!serialized.includes('<'))
  const data = JSON.parse(serialized)
  assert.equal(data['@type'], 'BlogPosting')
  assert.equal(data.headline, article.title)
  assert.equal(data.dateModified, article.updatedAt)
})
