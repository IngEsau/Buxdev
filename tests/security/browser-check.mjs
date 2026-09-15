// Optional local integration: Docker Apache/PHP image + Brave, no production POST.
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const tmp = await mkdtemp(resolve(tmpdir(), 'buxdev-browser-security-'))
const container = `buxdev-security-${process.pid}`
const port = 19443
const debugPort = 19225
const origin = `https://127.0.0.1:${port}`
const wait = (ms) => new Promise((done) => setTimeout(done, ms))
let browser
let socket
let docker
let dockerError = ''
const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  assert.equal(result.status, 0, `${command}: ${result.stderr}`)
  return result.stdout
}

try {
  await cp('out', resolve(tmp, 'out'), { recursive: true })
  await mkdir(resolve(tmp, 'out/.well-known/acme-challenge'), { recursive: true })
  await writeFile(resolve(tmp, 'out/.well-known/acme-challenge/qa'), 'acme-ok')
  await mkdir(resolve(tmp, 'out/.git'))
  await writeFile(resolve(tmp, 'out/.git/config'), 'benign-probe')
  await writeFile(resolve(tmp, 'out/.env'), 'benign-probe')
  await writeFile(resolve(tmp, 'out/package.json'), '{}')
  await writeFile(resolve(tmp, 'out/backup.sql'), 'benign-probe')
  await writeFile(resolve(tmp, 'out/_next/static/probe.map'), '{}')
  run('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', resolve(tmp, 'key.pem'), '-out', resolve(tmp, 'cert.pem'), '-days', '1', '-subj', '/CN=localhost'])
  const modules = ['mpm_event', 'authz_core', 'authz_host', 'headers', 'mime', 'dir', 'rewrite', 'setenvif', 'ssl', 'socache_shmcb', 'filter', 'deflate']
  await writeFile(resolve(tmp, 'httpd.conf'), `
ServerRoot /fixture
PidFile /fixture/httpd.pid
Listen 8443
ServerName buxdev.com
${modules.map((name) => `LoadModule ${name}_module /usr/lib/apache2/modules/mod_${name}.so`).join('\n')}
ErrorLog /fixture/error.log
LogLevel warn
TypesConfig /etc/mime.types
DirectoryIndex index.html
DocumentRoot /fixture/out
SSLEngine on
SSLCertificateFile /fixture/cert.pem
SSLCertificateKeyFile /fixture/key.pem
# Test port uses the canonical Host internally; .htaccess is unmodified.
RequestHeader set Host buxdev.com early
<Directory /fixture/out>
  AllowOverride All
  Require all granted
</Directory>
`)
  docker = spawn('docker', ['run', '--rm', '--name', container, '--user', `${process.getuid()}:${process.getgid()}`, '--cap-drop', 'ALL', '-p', `127.0.0.1:${port}:8443`, '-v', `${tmp}:/fixture:Z`, '--entrypoint', '/usr/sbin/apache2', 'yiisoftware/yii2-php:8.2-apache', '-f', '/fixture/httpd.conf', '-DFOREGROUND'], { stdio: ['ignore', 'ignore', 'pipe'] })
  docker.stderr.on('data', (chunk) => { dockerError += chunk.toString() })
  for (let i = 0; i < 100; i++) {
    const probe = spawnSync('curl', ['-ks', '--max-time', '1', '-o', '/dev/null', '-w', '%{http_code}', origin])
    if (probe.stdout.toString() === '200') break
    if (i === 99 || docker.exitCode !== null) throw new Error(`Apache not ready: ${dockerError} ${await readFile(resolve(tmp, 'error.log'), 'utf8').catch(() => 'no log')}`)
    await wait(100)
  }
  const header = run('curl', ['-ksSI', origin])
  const compressedHeader = run('curl', ['-ksS', '-D', '-', '-o', '/dev/null', '-H', 'Accept-Encoding: gzip', origin])
  assert.match(compressedHeader, /content-encoding: gzip/i, 'Existing Apache configuration compresses HTML when its modules are enabled')
  const brandHeader = run('curl', ['-ksSI', origin + '/brand/buxdev/logo-on-dark.svg'])
  assert.match(brandHeader, /cache-control: public, max-age=86400, must-revalidate/i)
  assert.ok(!brandHeader.includes('immutable'), 'Stable SVG filenames must not be immutable')
  for (const expected of ["Content-Security-Policy:", "X-XSS-Protection: 0", "X-Frame-Options: DENY", "Strict-Transport-Security: max-age=31536000", "X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin"]) {
    assert.ok(header.toLowerCase().includes(expected.toLowerCase()), expected)
  }
  const httpCases = {}
  for (const [path, expected] of Object.entries({ '/.env': 403, '/.git/config': 403, '/package.json': 403, '/backup.sql': 403, '/_next/static/probe.map': 403, '/.well-known/acme-challenge/qa': 200, '/404.html': 404, '/missing-page': 404, '/robots.txt': 200, '/sitemap.xml': 200 })) {
    const code = Number(run('curl', ['-ks', '-o', '/dev/null', '-w', '%{http_code}', origin + path]))
    assert.equal(code, expected, path)
    httpCases[path] = code
  }
  browser = spawn(process.env.BROWSER_BIN || 'brave-browser', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking', '--ignore-certificate-errors', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${resolve(tmp, 'browser')}`, 'about:blank'], { stdio: 'ignore' })
  let target
  for (let i = 0; i < 100; i++) {
    try { target = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json()); break } catch { await wait(100) }
  }
  assert.ok(target, 'browser starts')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((done) => socket.addEventListener('open', done, { once: true }))
  let id = 0
  const pending = new Map()
  const requests = []
  const exceptions = []
  let responseMode = 'success'
  const scriptCache = new Map()
  let interceptionError = null
  const send = (method, params = {}) => new Promise((done, reject) => {
    const number = ++id
    pending.set(number, { done, reject })
    socket.send(JSON.stringify({ id: number, method, params }))
  })
  socket.addEventListener('message', async ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const handler = pending.get(message.id)
      pending.delete(message.id)
      if (handler) {
        if (message.error) handler.reject(message.error)
        else handler.done(message.result)
      }
    } else if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails.text)
    } else if (message.method === 'Fetch.requestPaused') {
      const { requestId, request } = message.params
      try {
        const url = new URL(request.url)
        if (url.origin === origin && url.pathname !== '/api/contact.php') {
          await send('Fetch.continueRequest', { requestId })
          return
        }
        requests.push({ host: url.host, path: url.pathname })
        if (url.origin === origin) {
          if (responseMode === 'network') await send('Fetch.failRequest', { requestId, errorReason: 'TimedOut' })
          else await send('Fetch.fulfillRequest', { requestId, responseCode: responseMode === 'error' ? 502 : 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: btoa(JSON.stringify({ success: responseMode === 'success' })) })
        } else if (url.hostname === 'www.googletagmanager.com' && ['/gtm.js', '/gtag/js'].includes(url.pathname)) {
          // Read public vendor JS only. Measurement/beacons never reach Google.
          if (!scriptCache.has(request.url)) scriptCache.set(request.url, await fetch(request.url).then((r) => r.text()))
          await send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript' }], body: Buffer.from(scriptCache.get(request.url)).toString('base64') })
        } else {
          await send('Fetch.fulfillRequest', { requestId, responseCode: 204 })
        }
      } catch (error) {
        const isCancelledInterception =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          'message' in error &&
          error.code === -32602 &&
          error.message === 'Invalid InterceptionId.'

        if (!isCancelledInterception) interceptionError = error
      }
    }
  })
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    assert.ok(!result.exceptionDetails, result.exceptionDetails?.exception?.description)
    return result.result.value
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.qaViolations=[]; document.addEventListener('securitypolicyviolation', e => window.qaViolations.push({directive:e.effectiveDirective,uri:e.blockedURI}));` })
  const navigate = async (path) => {
    await send('Page.navigate', { url: origin + path })
    await wait(700)
    assert.ok(await evaluate('document.readyState === "complete"'))
  }
  const setPreferences = async (theme, language) => {
    await evaluate(`localStorage.setItem('buxdev-theme', ${JSON.stringify(JSON.stringify({ state: { theme }, version: 0 }))}); localStorage.setItem('buxdev-language', ${JSON.stringify(JSON.stringify({ state: { language }, version: 0 }))})`)
  }
  const inspectLayout = () => evaluate(`({title:document.title,h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,violations:window.qaViolations,fonts:document.fonts.status,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,language:document.documentElement.lang,theme:document.documentElement.classList.contains('dark')?'dark':'light'})`)
  const results = []
  const paths = ['/', '/about/', '/services/', '/work/', '/contact/', '/cookies/', '/privacidad/', '/terminos/']
  const variants = [
    { theme: 'dark', language: 'es' },
    { theme: 'light', language: 'en' },
  ]
  await navigate('/')
  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width <= 430 })
    for (const variant of variants) {
      await setPreferences(variant.theme, variant.language)
      for (const path of paths) {
        await navigate(path)
        const context = `${path} ${variant.theme}/${variant.language} @ ${width}px`
        const result = await inspectLayout()
        assert.equal(result.h1, 1, context)
        assert.equal(result.overflow, false, context)
        assert.deepEqual(result.violations, [], context)
        assert.equal(result.brokenImages, 0, context)
        assert.equal(result.language, variant.language, context)
        assert.equal(result.theme, variant.theme, context)
        results.push({ width, path, variant: `${variant.theme}/${variant.language}`, ...result })
      }
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 1000, deviceScaleFactor: 1, mobile: true })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await setPreferences('dark', 'es')
  await navigate('/')
  assert.equal(await evaluate(`document.querySelector('button[aria-controls="mobile-navigation"]').getAttribute('aria-expanded')`), 'false')
  await evaluate(`document.querySelector('button[aria-controls="mobile-navigation"]').click()`)
  await wait(100)
  assert.equal(await evaluate(`document.querySelector('button[aria-controls="mobile-navigation"]').getAttribute('aria-expanded')`), 'true')
  assert.equal(await evaluate(`document.documentElement.style.overflow`), 'hidden')
  assert.equal(await evaluate(`(() => { const button=document.querySelector('button[aria-controls="mobile-navigation"]');button.focus();window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true}));const controls=[...document.querySelectorAll('#mobile-navigation a[href],#mobile-navigation button:not([disabled])')];return document.activeElement===controls.at(-1) })()`), true)
  assert.equal(await evaluate(`(() => { window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}));return document.activeElement===document.querySelector('button[aria-controls="mobile-navigation"]') })()`), true)
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`)
  await wait(100)
  assert.equal(await evaluate(`document.querySelector('button[aria-controls="mobile-navigation"]').getAttribute('aria-expanded')`), 'false')
  assert.equal(await evaluate(`document.activeElement===document.querySelector('button[aria-controls="mobile-navigation"]')`), true)
  assert.notEqual(await evaluate(`document.documentElement.style.overflow`), 'hidden')
  assert.equal(await evaluate(`document.querySelector('a[href^="https://wa.me/522211310600"]')?.href`), 'https://wa.me/522211310600?text=Hola%20BUXDEV%2C%20vi%20su%20sitio%20web%20y%20me%20gustar%C3%ADa%20platicar%20sobre%20un%20proyecto.')
  await evaluate(`window.scrollTo(0,document.documentElement.scrollHeight)`)
  await wait(250)
  assert.equal(await evaluate(`!!document.querySelector('[data-back-to-top]')`), true)
  await evaluate(`window.qaScrollBehavior=null;window.scrollTo=(options)=>{window.qaScrollBehavior=options.behavior};document.querySelector('[data-back-to-top]').click()`)
  assert.equal(await evaluate(`window.qaScrollBehavior`), 'auto')
  await send('Emulation.setEmulatedMedia', { features: [] })
  await navigate('/contact/')
  assert.equal(await evaluate('typeof window.dataLayer'), 'undefined')
  const fill = async () => {
    await evaluate(`document.querySelector('#type').click()`)
    await wait(100)
    await evaluate(`document.querySelector('[role="option"]').click()`)
    await evaluate(`(() => { for(const [id,value] of [['phone','2221234567'],['email','qa@example.test'],['description','QA local sin correo real']]) { const el=document.getElementById(id); const proto=id==='description'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true})); } const consent=document.querySelector('#privacy-acknowledged');if(!consent.checked)consent.click(); })()`)
    await wait(100)
    await evaluate(`document.querySelector('form').requestSubmit();document.querySelector('form').requestSubmit()`)
    await wait(300)
  }
  await fill()
  assert.ok(await evaluate(`!!document.querySelector('[data-variant="success"]')`))
  assert.equal(await evaluate('typeof window.dataLayer'), 'undefined')
  assert.equal(requests.filter((r) => r.host !== new URL(origin).host).length, 0)
  await evaluate(`document.querySelector('[data-consent-action="accept"]').click()`)
  await wait(2500)
  assert.equal(await evaluate(`(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length`), 0)
  await fill()
  assert.equal(await evaluate(`(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length`), 1)
  assert.deepEqual(await evaluate(`JSON.parse(JSON.stringify(window.dataLayer.find(e=>e.event==='generate_lead'),(k,v)=>k==='gtm.uniqueEventId'?undefined:v))`), { event: 'generate_lead', lead_type: 'cotizacion' })
  for (const mode of ['error', 'network', 'false']) {
    responseMode = mode
    const before = requests.filter((request) => request.path === '/api/contact.php').length
    await fill()
    assert.equal(requests.filter((request) => request.path === '/api/contact.php').length, before + 1)
    assert.equal(await evaluate(`(window.dataLayer||[]).filter(e=>e.event==='generate_lead').length`), 1)
  }
  assert.deepEqual(await evaluate('window.qaViolations'), [])
  await evaluate(`document.querySelector('[data-consent-preferences-trigger]').click()`)
  await wait(100)
  await evaluate(`document.querySelector('[data-consent-action="modal-reject"]').click()`)
  await wait(700)
  assert.equal(await evaluate('typeof window.dataLayer'), 'undefined')
  await evaluate(`(() => { const script=document.createElement('script');script.textContent='window.qaInjected = true';document.head.append(script); })()`)
  assert.equal(await evaluate('window.qaInjected === true'), false, 'unhashed script blocked')
  assert.ok(await evaluate('window.qaViolations.some(v=>v.directive==="script-src-elem")'))
  assert.equal(interceptionError, null)
  console.log(JSON.stringify({ httpCases, pages: results, requests, exceptions, consentLeadCases: 'OK; vendor JS read-only, no measurement or mail transmitted' }, null, 2))
} finally {
  socket?.close()
  if (browser) { browser.kill(); await new Promise((done) => browser.once('close', done)) }
  spawnSync('docker', ['stop', '-t', '1', container], { stdio: 'ignore' })
  if (docker && docker.exitCode === null) await new Promise((done) => docker.once('close', done))
  await rm(tmp, { recursive: true, force: true })
}
