import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, stat } from 'node:fs/promises'

const read = path => readFile(`out/${path}`, 'utf8')

test('Home features only the approved projects with real desktop and mobile images', async () => {
  const html = await read('index.html')
  const gallery = html.match(/<section id="trabajos"[\s\S]*?<\/section>/)?.[0]
  assert.ok(gallery, 'Home work gallery missing')
  const names = ['Valeria Herrera', 'Sistema de sociometría', 'Bandas Asesoría y Montaje']
  let previous = -1
  for (const name of names) {
    const position = gallery.indexOf(name)
    assert.ok(position > previous, `${name} must follow the previous featured project`)
    previous = position
  }
  for (const project of ['valeria-herrera', 'sociograma-utp', 'bandas-asesoria']) {
    assert.ok(gallery.includes(`/work/${project}/`), `${project} must use real assets`)
  }
  assert.doesNotMatch(gallery, /Montblan Mobile System|Lux Garage|WordPress Incident Response|Backstabber Toolkit/)
})

test('The exported Work catalog keeps the approved order, case links and truthful states', async () => {
  const html = await read('work/index.html')
  const names = [
    'Valeria Herrera',
    'Sistema de sociometría',
    'Bandas Asesoría y Montaje',
    'Montblan Mobile System',
    'Jill Software',
    'Backstabber Toolkit',
    'WordPress Incident Response',
    'Portfolio personal',
  ]
  let previous = -1
  for (const name of names) {
    const position = html.indexOf(name)
    assert.ok(position > previous, `${name} must follow the previous project`)
    previous = position
  }
  assert.doesNotMatch(html, /Poets Flowers/)
  assert.doesNotMatch(html, /Lux Garage/)
  for (const route of ['montblan-mobile', 'sociograma-utp', 'valeria-herrera', 'backstabber-toolkit']) {
    assert.ok(html.includes(`/work/${route}/`))
  }
  assert.match(html, /Proyecto propiedad de la Universidad Tecnológica de Puebla/)
  assert.match(html, /En desarrollo · Sin demo pública/)
  assert.match(html, /Sitio actual documentado · Propuesta pendiente/)
  assert.match(html, /https:\/\/jillsoftware\.com\.mx\//)
})

test('New cases are static, indexable, attributed and backed by real public assets', async () => {
  const sitemap = await read('sitemap.xml')
  for (const route of ['work', 'work/montblan-mobile', 'work/sociograma-utp',
    'work/valeria-herrera', 'work/backstabber-toolkit']) {
    const url = `https://buxdev.com/${route}/`
    assert.ok(sitemap.includes(`<loc>${url}</loc>`))
    const html = await read(`${route}/index.html`)
    assert.ok(html.includes(url), `canonical missing for ${route}`)
    assert.doesNotMatch(html, /name="robots" content="noindex"/)
  }
  const sociograma = await read('work/sociograma-utp/index.html')
  assert.match(sociograma, /Proyecto propiedad de la Universidad Tecnológica de Puebla/)
  assert.match(sociograma, /Acceso restringido/)
  assert.doesNotMatch(sociograma, /SociogramaUTP-Front-End/)
  const backstabber = await read('work/backstabber-toolkit/index.html')
  assert.match(backstabber, /En desarrollo/)
  assert.ok(backstabber.includes('sin demo oficial'))
  for (const path of ['work/montblan-mobile/login.webp', 'work/montblan-mobile/order-form.webp',
    'work/montblan-mobile/orders.webp', 'work/montblan-mobile/products.webp',
    'work/montblan-mobile/receivables.webp', 'work/montblan-mobile/warehouse-postdated.webp',
    'work/sociograma-utp/public-login.webp', 'work/sociograma-utp/public-login-mobile.webp',
    'work/sociograma-utp/admin-panel.webp', 'work/sociograma-utp/credential-worker.webp',
    'work/sociograma-utp/groups.webp', 'work/sociograma-utp/questionnaires.webp',
    'work/sociograma-utp/question-bank.webp', 'work/sociograma-utp/import-overview.webp',
    'work/sociograma-utp/import-form.webp',
    'work/jill-software/current-desktop.webp', 'work/jill-software/current-mobile.webp']) {
    assert.ok((await stat(`out/${path}`)).size > 1000, `${path} missing or empty`)
  }
  assert.match(await read('work/valeria-herrera/index.html'), /Valeria Herrera/)
})
