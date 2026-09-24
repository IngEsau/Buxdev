import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { test } from 'node:test'

test('Build stops before Next for unavailable, invalid, redirected or empty API feeds', async () => {
  let mode
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    if (mode === 'unavailable') response.writeHead(503)
    if (mode === 'redirect') response.writeHead(302, { Location: 'https://attacker.invalid/' })
    response.end(mode === 'empty'
      ? JSON.stringify({ schemaVersion: 1, generatedAt: '2026-09-23T00:00:00Z', articles: [] })
      : 'PRIVATE_INVALID_BODY')
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    for (mode of ['unavailable', 'invalid', 'redirect', 'empty']) {
      const child = spawn(process.execPath, ['scripts/build-blog.mjs', `--local-api=http://127.0.0.1:${server.address().port}`], {
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let output = ''
      child.stdout.on('data', chunk => { output += chunk })
      child.stderr.on('data', chunk => { output += chunk })
      const status = await new Promise((resolve, reject) => {
        child.on('error', reject)
        child.on('exit', resolve)
      })
      assert.equal(status, 1, mode)
      assert.doesNotMatch(output, /PRIVATE_INVALID_BODY|Creating an optimized production build/)
      assert.match(output, /Blog API/)
    }
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})
