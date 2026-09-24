import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { prepareNotification, notifyIndexNow } from '../../scripts/notify-indexnow.mjs'

const key = 'eb0d64a2c026422a948a7b49af9d1aa1'
const urls = ['/', '/about/', '/services/', '/contact/'].map(path => `https://buxdev.com${path}`)
const xml = list => `<urlset>${list.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`

async function fixture() {
  const root = await mkdtemp(resolve(tmpdir(), 'buxdev-indexnow-'))
  for (const dir of ['public', 'out/_next', 'scripts', 'server/api', 'bin']) {
    await mkdir(resolve(root, dir), { recursive: true })
  }
  for (const dir of ['public', 'out']) await writeFile(resolve(root, dir, `${key}.txt`), key)
  await writeFile(resolve(root, 'out/sitemap.xml'), xml(urls))
  return root
}

test('IndexNow validates the preserved key and exactly the approved sitemap URLs', async () => {
  const root = await fixture()
  try {
    assert.deepEqual(await prepareNotification(root), {
      host: 'buxdev.com', key, keyLocation: `https://buxdev.com/${key}.txt`, urlList: urls,
    })
    for (const list of [urls.slice(1), [...urls, 'https://buxdev.com/work/'],
      [urls[0], urls[0], urls[2], urls[3]],
      ['https://attacker.invalid/', ...urls.slice(1)],
      ['https://buxdev.com/?preview=1', ...urls.slice(1)]]) {
      await writeFile(resolve(root, 'out/sitemap.xml'), xml(list))
      await assert.rejects(prepareNotification(root), /cuatro URLs/)
    }
    await writeFile(resolve(root, 'out/sitemap.xml'), xml(urls))
    await writeFile(resolve(root, 'out', `${key}.txt`), 'wrong-key')
    await assert.rejects(prepareNotification(root), /key pública/)
    await rm(resolve(root, 'out', `${key}.txt`))
    await assert.rejects(prepareNotification(root), /ENOENT/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('IndexNow sends one bounded HTTPS JSON request without redirects; handles HTTP and network errors', async () => {
  const payload = { host: 'buxdev.com', key, keyLocation: `https://buxdev.com/${key}.txt`, urlList: urls }
  for (const status of [200, 202, 301, 400, 403, 422, 429, 500]) {
    let calls = 0
    const submit = notifyIndexNow(payload, async (endpoint, options) => {
      calls++
      assert.equal(endpoint, 'https://api.indexnow.org/indexnow')
      assert.equal(options.method, 'POST')
      assert.equal(options.redirect, 'error')
      assert.ok(options.signal instanceof AbortSignal)
      assert.deepEqual(JSON.parse(options.body), payload)
      return new Response('', { status })
    })
    if ([200, 202].includes(status)) assert.match(await submit, new RegExp(`HTTP ${status}`))
    else await assert.rejects(submit, new RegExp(`HTTP ${status}`))
    assert.equal(calls, 1)
  }
  for (const error of [new TypeError('TLS failure'), new DOMException('Timeout', 'TimeoutError')]) {
    await assert.rejects(notifyIndexNow(payload, async () => { throw error }), error)
  }
})

test('Exported blog URLs may appear in the sitemap without extending notifications', async () => {
  const root = await fixture()
  try {
    await writeFile(resolve(root, 'out/sitemap.xml'), xml([...urls, 'https://buxdev.com/blog/', 'https://buxdev.com/blog/caso-real/']))
    await assert.rejects(prepareNotification(root), /ENOENT/)
    for (const path of ['blog', 'blog/caso-real']) {
      await mkdir(resolve(root, 'out', path), { recursive: true })
      await writeFile(resolve(root, 'out', path, 'index.html'), '<h1>Blog</h1>')
    }
    assert.deepEqual((await prepareNotification(root)).urlList, urls)
    for (const path of ['blog/../work/', 'blog/case/?draft=1', 'blog/case/nested/', 'blog//evil/']) {
      await writeFile(resolve(root, 'out/sitemap.xml'), xml([...urls, `https://buxdev.com/${path}`]))
      await assert.rejects(prepareNotification(root), /cuatro URLs/)
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('Deploy notifies only after successful FTP; failed notification preserves exit 0 (offline stubs)', async () => {
  const root = await fixture()
  try {
    await cp('scripts/deploy-ftp.sh', resolve(root, 'scripts/deploy-ftp.sh'))
    await cp('scripts/notify-indexnow.mjs', resolve(root, 'scripts/notify-indexnow.mjs'))
    for (const file of ['out/index.html', 'out/.htaccess', 'server/api/contact.php', 'server/api/contact-security.php']) {
      await writeFile(resolve(root, file), 'fixture')
    }
    const stub = async (name, body) => writeFile(resolve(root, 'bin', name), `#!/bin/bash\n${body}\n`, { mode: 0o700 })
    await stub('npm', 'exit "${TEST_BUILD_EXIT:-0}"')
    await stub('npx', 'exit 0')
    await stub('php', 'exit 0')
    await stub('lftp', `input="$(</dev/stdin)"
if [[ "$input" == *'mirror --reverse'* ]]; then
  printf 'ftp\\n' >> "$TEST_TRACE"
  exit "\${TEST_FTP_EXIT:-0}"
fi
printf 'index.html\\n_next\\n'`)
    await stub('node', `if [[ "\${2:-}" == '--submit' ]]; then
  printf 'notify\\n' >> "$TEST_TRACE"
  exit "\${TEST_NOTIFY_EXIT:-0}"
fi
exec "$TEST_NODE" "$@"`)
    const trace = resolve(root, 'trace')
    const run = async overrides => {
      await writeFile(trace, '')
      const result = spawnSync('bash', [resolve(root, 'scripts/deploy-ftp.sh')], {
        encoding: 'utf8', timeout: 15_000,
        // Do not inherit real deploy credentials or environment files.
        env: {
          PATH: `${resolve(root, 'bin')}:/usr/bin:/bin`, TEST_NODE: process.execPath,
          TEST_TRACE: trace, DEPLOY_ENV_FILE: resolve(root, 'absent.env'),
          FTP_PASS: 'test-only', FTP_DIR: '/', CONFIRM_DEPLOY: 'y', SKIP_INSTALL: '1',
          ...overrides,
        },
      })
      return { ...result, trace: await readFile(trace, 'utf8') }
    }
    const success = await run({})
    assert.equal(success.status, 0, success.stderr)
    assert.equal(success.trace, 'ftp\nnotify\n')
    const failedNotification = await run({ TEST_NOTIFY_EXIT: '1' })
    assert.equal(failedNotification.status, 0)
    assert.match(failedNotification.stdout, /ADVERTENCIA: IndexNow/)
    assert.equal(failedNotification.trace, 'ftp\nnotify\n')
    const failedFtp = await run({ TEST_FTP_EXIT: '1' })
    assert.notEqual(failedFtp.status, 0)
    assert.equal(failedFtp.trace, 'ftp\n')
    for (const overrides of [{ DRY_RUN: '1' }, { TEST_BUILD_EXIT: '1' }, { CONFIRM_DEPLOY: 'n' }]) {
      const result = await run(overrides)
      assert.equal(result.trace, '')
      assert.equal(result.status === 0, overrides.DRY_RUN === '1')
    }
    await rm(resolve(root, 'out', `${key}.txt`))
    const missingKey = await run({})
    assert.notEqual(missingKey.status, 0)
    assert.equal(missingKey.trace, '')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
