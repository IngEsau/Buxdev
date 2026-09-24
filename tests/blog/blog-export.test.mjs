import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { test } from 'node:test'

test('Export contains readable blog articles, metadata, sitemap entries and CSP hashes', async () => {
  const listing = await readFile('out/blog/index.html', 'utf8')
  const sitemap = await readFile('out/sitemap.xml', 'utf8')
  const apache = await readFile('out/.htaccess', 'utf8')
  assert.match(listing, /rel="canonical" href="https:\/\/buxdev.com\/blog\/"/)
  assert.match(sitemap, /<loc>https:\/\/buxdev.com\/blog\/<\/loc>/)
  const directories = (await readdir('out/blog', { withFileTypes: true })).filter(entry => entry.isDirectory())
  assert.ok(directories.length > 0)
  for (const { name: slug } of directories) {
    const html = await readFile(`out/blog/${slug}/index.html`, 'utf8')
    const canonical = `https://buxdev.com/blog/${slug}/`
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`))
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
    assert.ok(listing.includes(`href="/blog/${slug}/"`))
    assert.match(html, /property="og:type" content="article"/)
    assert.match(html, /<article lang="es"/)
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    assert.match(html, /<h2\b/)
    const jsonLd = html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)?.[1]
    assert.ok(jsonLd)
    const data = JSON.parse(jsonLd)
    assert.equal(data['@type'], 'BlogPosting')
    assert.equal(data.mainEntityOfPage['@id'], canonical)
    assert.equal(data.inLanguage, 'es')
    const { createHash } = await import('node:crypto')
    assert.ok(apache.includes(`sha256-${createHash('sha256').update(jsonLd).digest('base64')}`))
  }
  assert.ok(!apache.match(/connect-src[^;]*api\.buxdev\.com/))
  for (const file of await readdir('out/_next/static/chunks')) {
    if (file.endsWith('.js')) {
      assert.ok(!(await readFile(`out/_next/static/chunks/${file}`, 'utf8')).includes('api.buxdev.com'), `Build-only API leaked into ${file}`)
    }
  }
})
