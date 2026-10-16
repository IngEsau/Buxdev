import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

test('Home Services is an open four-node index with three decorative diagram connections', () => {
  const html = readFileSync('out/index.html', 'utf8')
  const section = html.match(/<section\b[^>]*id="servicios"[\s\S]*?<\/section>/)?.[0]
  assert.ok(section)
  const diagram = section.match(/<svg\b[^>]*data-service-connectors[\s\S]*?<\/svg>/)?.[0]
  assert.ok(diagram)
  assert.match(diagram, /aria-hidden="true"/)
  assert.match(diagram, /focusable="false"/)
  assert.equal([...diagram.matchAll(/<g\b/g)].length, 3)
  assert.equal([...diagram.matchAll(/pathLength="1"/g)].length, 3)
  assert.equal([...section.matchAll(/<li\b/g)].length, 4)
  assert.equal([...section.matchAll(/<h3\b/g)].length, 4)
  assert.equal([...section.matchAll(/href="\/services\/"/g)].length, 5)
  for (const label of ['API / DATA / INTEGRATIONS', 'STRUCTURE / SYSTEM / INTERFACE', 'ASSESSMENT / HARDENING / RESPONSE', 'EVENTS / WORKFLOWS / INTEGRATIONS']) {
    assert.ok(section.includes(label))
  }
  const css = readFileSync('components/services-section.module.css', 'utf8')
  assert.doesNotMatch(css, /\.index::(?:before|after)|border-(?:top|bottom|left):|\.rule\s*\{/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /\.connectorProgress\s*\{ stroke-dashoffset: 0; \}/)
})
