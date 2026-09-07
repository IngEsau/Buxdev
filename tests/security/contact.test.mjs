import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { createServer } from 'node:net'

test('PHP contact: HTTP, validation, private rate limit, encoding and generic errors (mock Brevo)', async () => {
  const tmp = await mkdtemp(resolve(tmpdir(), 'buxdev-security-'))
  const webroot = resolve(tmp, 'www')
  await mkdir(resolve(webroot, 'api'), { recursive: true })
  const security = resolve(tmp, 'security')
  const phpQuote = (value) => value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
  let endpoint = (await readFile('server/api/contact.php', 'utf8'))
    .replace('/home/buxdevco/private/brevo-config.php', resolve(tmp, 'config.php'))
  // Substitute only the external transport in the temporary fixture, not validation.
  for (const operation of ['init', 'setopt_array', 'exec', 'getinfo', 'close']) {
    endpoint = endpoint.replaceAll(`curl_${operation}(`, `buxdev_mock_curl_${operation}(`)
  }
  endpoint = endpoint.replace("function_exists('curl_init')", "function_exists('buxdev_mock_curl_init')")
  await writeFile(resolve(webroot, 'api/contact.php'), endpoint)
  await writeFile(resolve(webroot, 'api/contact-security.php'), (await readFile('server/api/contact-security.php', 'utf8'))
    .replace('/home/buxdevco/private/contact-security', security))
  await writeFile(resolve(tmp, 'config.php'), `<?php return ['brevo_api_key'=>'mock-only', 'from_email'=>'info@buxdev.com', 'from_name'=>'BUXDEV', 'to_email'=>'info@buxdev.com', 'allowed_origins'=>['https://buxdev.com','https://www.buxdev.com']];`)
  await writeFile(resolve(webroot, 'router.php'), await readFile('tests/security/contact-router.php'))
  const probe = createServer()
  await new Promise((done) => probe.listen(0, '127.0.0.1', done))
  const port = probe.address().port
  await new Promise((done) => probe.close(done))
  const ctype = spawnSync('php', ['-n', '-r', 'exit(function_exists("ctype_digit") ? 0 : 1);']).status === 0
    ? [] : ['-d', 'extension=ctype']
  const server = spawn('php', ['-n', ...ctype, '-S', `127.0.0.1:${port}`, '-t', webroot, resolve(webroot, 'router.php')], { stdio: 'ignore' })
  const url = `http://127.0.0.1:${port}/api/contact.php`
  const payload = { type: 'cotizacion', email: 'qa@example.test', cellphone: '+522221234567', description: 'Hola, información de software.', privacyAcknowledged: true, whatsappConsent: false, website: '' }
  let checked = 0
  async function request({ method = 'POST', body = payload, headers = {}, status = 200, reset = true, origin = true } = {}) {
    if (reset) await rm(resolve(security, 'rate.json'), { force: true })
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: 'https://buxdev.com' } : {}), ...headers },
      ...(method !== 'GET' && method !== 'HEAD' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
    })
    const text = await response.text()
    assert.equal(response.status, status, `${method}: ${text}`)
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('access-control-allow-origin'), null)
    assert.equal(response.headers.get('x-powered-by'), null)
    assert.doesNotMatch(text, /mock-only|\/home\/|\/tmp\/|stack|curl|api-key|qa@example/)
    assert.equal(JSON.parse(text).success, status === 200)
    checked++
    return response
  }
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      try { await fetch(url); break } catch { await new Promise((done) => setTimeout(done, 30)) }
    }
    for (const method of ['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
      const response = await request({ method, status: 405 })
      assert.equal(response.headers.get('allow'), 'POST')
    }
    await request()
    await request({ body: '{', status: 400 })
    await request({ body: 'null', status: 400 })
    await request({ body: '[]', status: 400 })
    await request({ body: ' '.repeat(16385), status: 413 })
    await request({ headers: { 'Content-Type': 'text/plain' }, status: 415 })
    await request({ headers: { 'Content-Type': 'Application/JSON; charset=UTF-8' } })
    await request({ headers: { Origin: 'https://evil.example' }, status: 403 })
    await request({ headers: { Origin: 'https://buxdev.com.evil.example' }, status: 403 })
    await request({ headers: { 'Sec-Fetch-Site': 'cross-site' }, status: 403 })
    await request({ origin: false, status: 403 })
    await request({ origin: false, headers: { Referer: 'https://buxdev.com/contact/' } })
    await request({ origin: false, headers: { 'Sec-Fetch-Site': 'same-origin' } })
    for (const override of [
      { email: 'not-an-email' }, { email: 'q'.repeat(255) + '@example.test' },
      { email: 'qa@example.test\r\nBcc: other@example.test' }, { cellphone: '+52\r\n2221234567' },
      { type: 'other' }, { description: 'x'.repeat(2001) }, { description: '\u0000' },
      { email: [] }, { description: {} }, { privacyAcknowledged: 'true' }, { privacyAcknowledged: false },
      { whatsappConsent: 'false' }, { to: 'other@example.test' }, { apiKey: 'untrusted' }, { website: 'bot' },
    ]) await request({ body: { ...payload, ...override }, status: 400 })
    await request({ body: { ...payload, description: '<script>alert("QA")</script> & café 漢字\nSegunda línea' } })
    const email = JSON.parse(await readFile(resolve(tmp, 'last-email.json'), 'utf8'))
    assert.match(email.htmlContent, /&lt;script&gt;/)
    assert.doesNotMatch(email.htmlContent, /<script>/)
    assert.match(email.textContent, /<script>/)
    assert.match(email.htmlContent, /café 漢字/)
    assert.equal(email.to[0].email, 'info@buxdev.com')
    await request({ headers: { 'X-Test-Brevo': 'failure' }, status: 502 })
    await request({ headers: { 'X-Test-Brevo': 'timeout' }, status: 502 })
    await request()
    for (let i = 1; i < 5; i++) await request({ reset: false, headers: { 'X-Forwarded-For': `192.0.2.${i}` } })
    const limited = await request({ reset: false, status: 429 })
    assert.ok(Number(limited.headers.get('retry-after')) > 0)
    assert.equal((await stat(security)).mode & 0o777, 0o700)
    assert.equal((await stat(resolve(security, 'rate.json'))).mode & 0o777, 0o600)
    const logs = await readFile(resolve(security, 'events.log'), 'utf8')
    assert.doesNotMatch(logs, /qa@example|2221234567|<script>|mock-only/)
    const state = await readFile(resolve(security, 'rate.json'), 'utf8')
    assert.doesNotMatch(state, /127\.0\.0\.1|192\.0\.2/)

    await rm(resolve(security, 'rate.json'), { force: true })
    const worker = resolve(tmp, 'worker.php')
    await writeFile(worker, `<?php require '${phpQuote(resolve(webroot, 'api/contact-security.php'))}'; try { echo buxdev_rate_limit('127.0.0.1') === 0 ? 'allowed' : 'limited'; } catch (Throwable) { echo 'busy'; }`)
    const concurrent = await Promise.all(Array.from({ length: 16 }, () => new Promise((done) => {
      const child = spawn('php', ['-n', worker])
      let output = ''
      child.stdout.on('data', (chunk) => { output += chunk })
      child.on('close', () => done(output))
    })))
    assert.ok(concurrent.filter((value) => value === 'allowed').length <= 5)
    assert.ok(concurrent.filter((value) => value === 'allowed').length > 0)
    await rm(resolve(security, 'rate.json'), { force: true })
    const globalTest = `require '${phpQuote(resolve(webroot, 'api/contact-security.php'))}'; for ($i=0;$i<100;$i++) { if (buxdev_rate_limit('192.0.2.'.$i, 10000)!==0) exit(1); } if (buxdev_rate_limit('192.0.2.101',10000)!==3600) exit(2); if (buxdev_rate_limit('192.0.2.101',13601)!==0) exit(3);`
    assert.equal(spawnSync('php', ['-n', '-r', globalTest]).status, 0, 'global limit and expiry')
    await writeFile(resolve(security, 'rate.json'), '{broken')
    await request({ reset: false, status: 503 })
    console.log(`${checked} HTTP cases; concurrency, global cap, expiry, permissions, log minimization: OK`)
  } finally {
    server.kill()
    await new Promise((done) => server.once('close', done))
    await rm(tmp, { recursive: true, force: true })
  }
})
