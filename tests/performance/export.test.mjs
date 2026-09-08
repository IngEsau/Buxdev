import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

test('Home keeps the LCP logos eager, high priority and deduplicated in the initial HTML', () => {
  const html = readFileSync('out/index.html', 'utf8')
  for (const theme of ['dark', 'light']) {
    const src = `/brand/buxdev/logo-on-${theme}.svg`
    const images = (html.match(/<img\b[^>]*>/g) || []).filter(tag => tag.includes(`src="${src}"`) && tag.includes('loading="eager"'))
    assert.equal(images.length, 1)
    assert.match(images[0], /fetchpriority="high"/i)
    assert.match(images[0], /width="613" height="404"/)
    const preloads = (html.match(/<link\b[^>]*>/g) || []).filter(tag => tag.includes('as="image"') && tag.includes(`href="${src}"`))
    assert.equal(preloads.length, 1)
    assert.match(preloads[0], /fetchpriority="high"/i)
  }
  assert.match(html, /id="home-hero-title"/)
  assert.match(html, /rel="canonical" href="https:\/\/buxdev.com\/"/)
})

test('Home blocking CSS stays within budget and only the two Latin fonts are preloaded', () => {
  const html = readFileSync('out/index.html', 'utf8')
  const links = html.match(/<link\b[^>]*>/g) || []
  const css = links.filter(tag => tag.includes('rel="stylesheet"')).map(tag => tag.match(/href="([^"]+)"/)[1])
  assert.equal(new Set(css).size, css.length)
  const bytes = css.reduce((total, url) => total + readFileSync(`out${url}`).length, 0)
  assert.ok(bytes <= 135_000, `Blocking CSS grew to ${bytes} bytes; budget 135000 (baseline 198461)`)
  const fonts = links.filter(tag => tag.includes('as="font"'))
  assert.equal(fonts.length, 2)
  assert.ok(fonts.every(tag => tag.includes('type="font/woff2"')))
})
