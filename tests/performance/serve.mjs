// Local measurement fixture only: not a production server or an Apache emulator.
// node tests/performance/serve.mjs [export-directory] [port] [--gzip]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { gzipSync } from 'node:zlib'

const root = resolve(process.argv[2] || 'out')
const port = Number(process.argv[3] || 18772)
const gzip = process.argv.includes('--gzip')
await stat(resolve(root, 'index.html'))
await stat(resolve(root, '_next'))
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.png': 'image/png', '.jpg': 'image/jpeg' }

createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname.split('/').some(part => part.startsWith('.')) || pathname.startsWith('/api/')) { res.writeHead(403).end(); return }
    let path = resolve(root, `.${pathname}`)
    if (!path.startsWith(`${root}/`) && path !== root) { res.writeHead(403).end(); return }
    let status = 200
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html')
      await stat(path)
    } catch { path = resolve(root, '404.html'); status = 404 }
    let body = await readFile(path)
    const headers = { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' }
    // Opt-in infrastructure experiment; no generated assets are modified.
    if (gzip && /\.(html|css|js|svg|txt|xml)$/.test(path) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      body = gzipSync(body)
      headers['Content-Encoding'] = 'gzip'
      headers.Vary = 'Accept-Encoding'
    }
    headers['Content-Length'] = body.length
    res.writeHead(status, headers).end(req.method === 'HEAD' ? undefined : body)
  } catch { res.writeHead(500).end() }
}).listen(port, '127.0.0.1', () => console.log(`Static fixture: ${root}; http://127.0.0.1:${port}; gzip=${gzip}`))
