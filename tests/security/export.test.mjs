import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, cp, readFile, writeFile, rm, symlink } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'

test('Export rejects secrets, maps, unexpected files, symlinks and stale CSP', async () => {
  const tmp = await mkdtemp(resolve(tmpdir(), 'buxdev-export-test-'))
  try {
    await mkdir(resolve(tmp, 'scripts'))
    await mkdir(resolve(tmp, 'public'))
    await cp('out', resolve(tmp, 'out'), { recursive: true })
    await cp('public/.htaccess', resolve(tmp, 'public/.htaccess'))
    await cp('scripts/secure-export.mjs', resolve(tmp, 'scripts/secure-export.mjs'))
    const run = () => spawnSync(process.execPath, [resolve(tmp, 'scripts/secure-export.mjs'), '--check'])
    assert.equal(run().status, 0)
    for (const name of ['.env', 'package.json', '_next/static/chunks/leak.js.map', 'api/contact.php']) {
      const file = resolve(tmp, 'out', name)
      await mkdir(resolve(file, '..'), { recursive: true })
      await writeFile(file, 'test')
      assert.notEqual(run().status, 0, name)
      await rm(file)
    }
    const htmlPath = resolve(tmp, 'out/index.html')
    const html = await readFile(htmlPath, 'utf8')
    await writeFile(htmlPath, html + '<script>window.testInjection = true</script>')
    assert.notEqual(run().status, 0, 'stale CSP hashes')
    const fake = 'xkeysib-' + 'a'.repeat(64)
    await writeFile(htmlPath, html + fake)
    const secret = run()
    assert.notEqual(secret.status, 0)
    assert.ok(!secret.stderr.toString().includes(fake), 'secret values are redacted')
    await writeFile(htmlPath, html)
    await symlink(htmlPath, resolve(tmp, 'out/linked.html'))
    assert.notEqual(run().status, 0, 'symlink')
  } finally {
    await rm(tmp, { recursive: true, force: true })
  }
})
