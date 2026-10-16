import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

test('Home shows six linked brands with local assets and arrow-only navigation', () => {
  const html = readFileSync('out/index.html', 'utf8')
  const section = html.match(/<section\b[^>]*id="clientes"[\s\S]*?<\/section>/)?.[0]
  assert.ok(section)
  assert.match(section, /aria-label="Marcas y colaboraciones de BUXDEV"/)
  assert.doesNotMatch(section, /Quienes confían en nosotros|home-clients-title|<h2|<header|aria-pressed/)
  assert.doesNotMatch(html, /id="home-about-title"|id="nosotros"/)
  for (const url of [
    'https://valeriaherrera.buxdev.com/', 'https://bandasyasesoria.com.mx/',
    'https://poetsflowers.buxdev.com/', 'https://montblan.mx/', 'https://www.utpuebla.edu.mx/',
    'https://jillsoftware.com.mx/',
  ]) {
    const links = [...section.matchAll(/<a\b[^>]*>/g)].filter(([tag]) => tag.includes(`href="${url}"`))
    assert.equal(links.length, 1, url)
    assert.match(links[0][0], /rel="noopener noreferrer"/)
    assert.match(links[0][0], /target="_blank"/)
    assert.match(links[0][0], /aria-label=/)
  }
  assert.equal([...section.matchAll(/<li\b/g)].length, 6)
  for (const [, tag] of section.matchAll(/(<img\b[^>]*>)/g)) {
    const src = tag.match(/src="([^"]+)"/)[1]
    assert.ok(src.startsWith('/brand/clients/'))
    assert.ok(readFileSync(`out${src}`).length)
    assert.match(tag, /loading="lazy"/)
    assert.match(tag, /width="\d+" height="\d+"/)
  }
  assert.doesNotMatch(section, /backstabber|portfolio\.buxdev/)
  assert.match(section, /POET’S/)
  assert.match(section, />BANDAS ASESORÍA Y MONTAJE<\/span>/)
  assert.equal([...section.matchAll(/<button\b/g)].length, 2)
  const source = readFileSync('components/clients-section.tsx', 'utf8')
  assert.doesNotMatch(source, /setInterval|setTimeout|IntersectionObserver/)
  const css = readFileSync('components/clients-section.module.css', 'utf8')
  assert.match(css, /filter: grayscale\(1\) invert\(1\)/)
  assert.doesNotMatch(css, /border-bottom/)
  // This replacement is Home-only; the complete About page remains intact.
  const about = readFileSync('out/about/index.html', 'utf8')
  assert.doesNotMatch(about, /id="clientes"/)
  assert.match(about, /<title>Nosotros e Ingeniería de Software \| BUXDEV<\/title>/)
})
