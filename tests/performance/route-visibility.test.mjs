import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

for (const route of ['services', 'work']) {
  test(`${route} exports its hero and long content visible without hydration`, () => {
    const html = readFileSync(`out/${route}/index.html`, 'utf8')
    const heroCopy = html.match(/<div[^>]*class="[^"]*page-hero-module[^"]*__copy"[^>]*>/)?.[0]
    const content = html.match(new RegExp(`<div[^>]*class="[^"]*${route}-page-module[^"]*__inner"[^>]*>`))?.[0]

    assert.ok(heroCopy, 'Page hero copy is missing')
    assert.ok(content, 'Page content is missing')
    assert.doesNotMatch(heroCopy, /style=|motion-reveal-module/, 'Hero must be visible before JavaScript runs')
    assert.doesNotMatch(content, /style=|motion-reveal-module/, 'Long content must not wait for a scroll observer')
  })
}
