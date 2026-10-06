import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile, stat } from 'node:fs/promises'

const read = path => readFile(`out/${path}`, 'utf8')

test('Home features only the approved projects with real desktop and mobile images', async () => {
  const html = await read('index.html')
  const gallery = html.match(/<section id="trabajos"[\s\S]*?<\/section>/)?.[0]
  assert.ok(gallery, 'Home work gallery missing')
  const names = ['Valeria Herrera', 'Sistema de sociometría', 'Bandas Asesoría y Montaje', 'Poet’s Flowers', 'Jill Software']
  let previous = -1
  for (const name of names) {
    const position = gallery.indexOf(name)
    assert.ok(position > previous, `${name} must follow the previous featured project`)
    previous = position
  }
  for (const project of ['valeria-herrera', 'sociograma-utp', 'bandas-asesoria', 'poets-flowers', 'jill-software']) {
    assert.match(gallery, new RegExp(`<a[^>]+href="/work/${project}/"`), `${project} must link to its case`)
    assert.ok(gallery.includes(`/work/${project}/`), `${project} must use real assets`)
  }
  assert.doesNotMatch(gallery, /Montblan Mobile System|Lux Garage|WordPress Incident Response|Backstabber Toolkit/)
  assert.doesNotMatch(gallery, /Ampliar imagen/, 'Home gallery must not open the image viewer')
})

test('The exported Work catalog keeps the approved order, case links and truthful states', async () => {
  const html = await read('work/index.html')
  const names = [
    'Valeria Herrera',
    'Sistema de sociometría',
    'Bandas Asesoría y Montaje',
    'Poet’s Flowers',
    'Jill Software',
    'WordPress Incident Response',
    'Portfolio personal',
    'Backstabber Toolkit',
    'Apps móviles',
    'Montblan Mobile System',
  ]
  let previous = -1
  for (const name of names) {
    const position = html.indexOf(name)
    assert.ok(position > previous, `${name} must follow the previous project`)
    previous = position
  }
  assert.doesNotMatch(html, /Lux Garage/)
  for (const route of ['montblan-mobile', 'sociograma-utp', 'bandas-asesoria', 'poets-flowers', 'jill-software', 'valeria-herrera', 'backstabber-toolkit']) {
    assert.ok(html.includes(`/work/${route}/`))
  }
  const titleLinks = [...html.matchAll(/<h3><a[^>]+href="([^"]+)"[^>]*>[^<]+<\/a><\/h3>/g)].map(match => match[1])
  assert.deepEqual(titleLinks, [
    '/work/valeria-herrera/', '/work/sociograma-utp/', '/work/bandas-asesoria/',
    '/work/poets-flowers/', '/work/jill-software/',
    'https://github.com/IngEsau/wp-xmlrpc-attack-analysis', 'https://portfolio.buxdev.com/',
    '/work/backstabber-toolkit/', '/work/montblan-mobile/',
  ])
  assert.match(html, /Proyecto propiedad de la Universidad Tecnológica de Puebla/)
  assert.match(html, /En desarrollo · Sin demo pública/)
  assert.match(html, /Sitio actual · Propuesta visual/)
  assert.match(html, /https:\/\/jillsoftware\.com\.mx\//)
  assert.match(html, /https:\/\/valeriaherrera\.buxdev\.com\//)
  assert.match(html, /\/work\/backstabber-toolkit\/logo\.webp/)
  assert.match(html, /\/work\/backstabber-toolkit\/overview\.webp/)
  assert.match(html, /https:\/\/poetsflowers\.buxdev\.com\//)
  assert.match(html, /\/work\/poets-flowers\/desktop\.webp/)
  assert.doesNotMatch(html, /Ampliar imagen/, 'Work cards must not open the image viewer')
})

test('New cases are static, indexable, attributed and backed by real public assets', async () => {
  const sitemap = await read('sitemap.xml')
  for (const route of ['work', 'work/montblan-mobile', 'work/sociograma-utp', 'work/bandas-asesoria', 'work/poets-flowers', 'work/jill-software',
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
  assert.match(backstabber, /\/work\/backstabber-toolkit\/overview.webp/)
  const jill = await read('work/jill-software/index.html')
  assert.match(jill, /Propuesta no implementada/)
  assert.match(jill, /\/work\/jill-software\/proposal-desktop.webp/)
  const bandas = await read('work/bandas-asesoria/index.html')
  assert.match(bandas, /Catálogo de productos/)
  assert.match(bandas, /Ampliar imagen/, 'Case images must retain the zoom viewer')
  for (const name of ['home-featured', 'home-about', 'home-presence', 'catalog-early', 'catalog-more', 'catalog-final']) {
    assert.ok(bandas.includes(`/work/bandas-asesoria/${name}.webp`))
  }
  const poets = await read('work/poets-flowers/index.html')
  assert.match(poets, /Poet’s Flowers/)
  assert.match(poets, /Colección por ocasión/)
  assert.match(poets, /https:\/\/poetsflowers\.buxdev\.com\//)
  assert.match(poets, /https:\/\/github\.com\/IngEsau\/poets-flowers/)
  assert.match(poets, /Ampliar imagen/, 'Case images must retain the zoom viewer')
  for (const path of ['work/montblan-mobile/login.webp', 'work/montblan-mobile/order-form.webp',
    'work/montblan-mobile/orders.webp', 'work/montblan-mobile/products.webp',
    'work/montblan-mobile/receivables.webp', 'work/montblan-mobile/warehouse-postdated.webp',
    'work/sociograma-utp/public-login.webp', 'work/sociograma-utp/public-login-mobile.webp',
    'work/sociograma-utp/admin-panel.webp', 'work/sociograma-utp/credential-worker.webp',
    'work/sociograma-utp/groups.webp', 'work/sociograma-utp/questionnaires.webp',
    'work/sociograma-utp/question-bank.webp', 'work/sociograma-utp/import-overview.webp',
    'work/sociograma-utp/import-form.webp',
    'work/jill-software/current-desktop.webp', 'work/jill-software/current-mobile.webp',
    'work/jill-software/proposal-desktop.webp', 'work/jill-software/proposal-mobile.webp',
    'work/backstabber-toolkit/overview.webp', 'work/backstabber-toolkit/assessment.webp',
    'work/backstabber-toolkit/approvals.webp', 'work/backstabber-toolkit/audit.webp',
    'work/backstabber-toolkit/logo.webp',
    'work/bandas-asesoria/products.webp', 'work/bandas-asesoria/services.webp',
    'work/bandas-asesoria/company.webp', 'work/bandas-asesoria/home-presence.webp',
    'work/bandas-asesoria/home-featured.webp', 'work/bandas-asesoria/home-about.webp',
    'work/bandas-asesoria/catalog-early.webp', 'work/bandas-asesoria/catalog-more.webp',
    'work/bandas-asesoria/catalog-final.webp',
    'work/poets-flowers/desktop.webp', 'work/poets-flowers/mobile.webp',
    'work/poets-flowers/meaning.webp', 'work/poets-flowers/collection.webp',
    'work/poets-flowers/collection-mobile.webp', 'work/poets-flowers/contact.webp']) {
    assert.ok((await stat(`out/${path}`)).size > 1000, `${path} missing or empty`)
  }
  assert.match(await read('work/valeria-herrera/index.html'), /Valeria Herrera/)
})
