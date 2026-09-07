// Prints locations only, never matched values. Pattern scan is not a guarantee.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const patterns = [
  /xkeysib-[a-zA-Z0-9_-]{30,}/,
  /(?:ghp_|github_pat_)[a-zA-Z0-9_]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
]
const git = (...args) => execFileSync('git', args, { maxBuffer: 64 * 1024 * 1024 }).toString()
let findings = 0
const scan = (content, label) => {
  if (patterns.some((pattern) => pattern.test(content))) {
    findings++
    console.error(`Posible secreto: ${label} (valor oculto)`)
  }
}
const files = git('ls-files', '-co', '--exclude-standard', '-z').split('\0').filter(Boolean)
for (const file of files) {
  if (/^(?:\.env(?:\.|$)|private\/)|(?:^|\/)brevo-config\.php$/.test(file)) {
    findings++
    console.error(`Archivo privado versionado: ${file}`)
  }
  try { scan(readFileSync(file).toString(), `working tree:${file}`) } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
const commits = git('rev-list', '--max-count=30', 'HEAD').trim().split('\n')
const seen = new Set()
for (const commit of commits) {
  for (const line of git('ls-tree', '-r', commit).trim().split('\n')) {
    const match = line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/)
    if (!match || seen.has(match[1])) continue
    seen.add(match[1])
    scan(git('cat-file', 'blob', match[1]), `${commit.slice(0, 8)}:${match[2]}`)
  }
}
console.log(`Secret scan: ${files.length} archivos, ${commits.length} commits, ${seen.size} blobs únicos; ${findings} coincidencias.`)
process.exitCode = findings ? 1 : 0
