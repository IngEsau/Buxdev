import { createHash } from 'node:crypto'
import { readFile, readdir, lstat, unlink, writeFile } from 'node:fs/promises'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'out')
const checkOnly = process.argv.includes('--check')
const routes = '(?:about|services|work|contact|privacidad|terminos|cookies|404|_not-found)'
const allowed = [
  /^\.htaccess$/,
  /^_next\/static\/(?:chunks|media)\/[\w./-]+\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|ico)$/,
  /^_next\/static\/[\w-]+\/_(?:buildManifest|ssgManifest|clientMiddlewareManifest)\.js$/,
  new RegExp(`^(?:${routes}/)?(?:index|404)\\.html$`),
  new RegExp(`^(?:${routes}/)?(?:index|__next[\\w.-]*)\\.txt$`),
  /^(?:robots\.txt|sitemap\.xml)$/,
  /^eb0d64a2c026422a948a7b49af9d1aa1\.txt$/, // Existing domain verification.
  /^(?:brand\/buxdev\/)?[\w-]+\.(?:svg|png|jpe?g|webp|ico)$/,
  /^og\/[\w-]+\.(?:png|jpe?g|webp)$/,
]
const secretPatterns = [
  /xkeysib-[a-zA-Z0-9_-]{30,}/,
  /(?:ghp_|github_pat_)[a-zA-Z0-9_]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:FTP_PASS|BREVO_API_KEY|brevo_api_key)\s*['"]?\s*[:=]\s*['"][^'"\s]{12,}['"]/,
]

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if ((await lstat(path)).isSymbolicLink()) throw new Error(`Symlink rechazado: ${relative(out, path)}`)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (entry.isFile()) files.push(path)
    else throw new Error(`Artefacto no regular: ${relative(out, path)}`)
  }
  return files
}

try {
  if (!checkOnly) {
    // Attribution is preserved in public/ and Git, not in the deployment output.
    await unlink(resolve(out, 'brand/buxdev/SOURCE.md')).catch((error) => {
      if (error.code !== 'ENOENT') throw error
    })
  }
  const files = await walk(out)
  const hashes = new Set()
  let pages = 0
  for (const file of files) {
    const name = relative(out, file)
    if (!allowed.some((pattern) => pattern.test(name))) throw new Error(`Artefacto no autorizado: ${name}`)
    const content = (await readFile(file)).toString('utf8')
    if (secretPatterns.some((pattern) => pattern.test(content))) throw new Error(`Posible secreto en ${name} (valor oculto)`)
    if (name.endsWith('.html')) {
      pages++
      for (const match of content.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
        if (!/\bsrc\s*=/i.test(match[1])) hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`)
      }
    }
  }
  if (!pages || !files.includes(resolve(out, 'index.html'))) throw new Error('Export incompleto')
  const policy = [
    "default-src 'self'",
    `script-src 'self' https://www.googletagmanager.com ${[...hashes].sort().join(' ')}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com",
    "font-src 'self'",
    "connect-src 'self' https://www.googletagmanager.com https://www.google.com https://*.google-analytics.com https://*.analytics.google.com",
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "frame-src 'none'", "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ') + ';'
  const template = await readFile(resolve(root, 'public/.htaccess'), 'utf8')
  const marker = /# BUXDEV_CSP_START[\s\S]*?# BUXDEV_CSP_END/
  if (!marker.test(template)) throw new Error('Falta el marcador CSP')
  const apache = template.replace(marker, `# BUXDEV_CSP_START\n  Header always set Content-Security-Policy "${policy}"\n  # BUXDEV_CSP_END`)
  if (checkOnly) {
    if (await readFile(resolve(out, '.htaccess'), 'utf8') !== apache) throw new Error('CSP/export desactualizado: ejecutar npm run build')
  } else {
    await writeFile(resolve(out, '.htaccess'), apache)
  }
  console.log(`[security] ${files.length} artefactos permitidos, ${pages} HTML, ${hashes.size} hashes CSP; sin patrones de secretos.`)
} catch (error) {
  console.error(`[security] ${error.message}`)
  process.exitCode = 1
}
