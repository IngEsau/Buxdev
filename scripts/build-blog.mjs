import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const dev = args.includes('--dev')
const localArg = args.find(arg => arg.startsWith('--local-api='))
if (args.some(arg => arg !== '--dev' && arg !== localArg)) {
  throw new Error('Supported options: --dev, --local-api=http://127.0.0.1:8000')
}

// This explicit local-only transport preserves the production HTTPS allowlist.
let localOrigin
if (localArg) {
  const url = new URL(localArg.slice('--local-api='.length))
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password
    || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Local API must be an HTTP origin on 127.0.0.1.')
  }
  localOrigin = url.origin
}

// Compile existing validation modules without introducing a TS runner dependency.
// This private directory is outside .next, which Next clears during a build.
const directory = await mkdtemp(resolve(root, '.blog-build-'))
const snapshotDirectory = await mkdtemp(resolve(tmpdir(), 'buxdev-blog-feed-'))
try {
  for (const name of ['blog-schema', 'blog-api']) {
    const source = await readFile(resolve(root, 'lib', `${name}.ts`), 'utf8')
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText.replace('"./blog-schema"', '"./blog-schema.mjs"')
    await writeFile(resolve(directory, `${name}.mjs`), output, { mode: 0o600 })
  }
  const { createBlogApiLoader } = await import(pathToFileURL(resolve(directory, 'blog-api.mjs')).href)
  const load = createBlogApiLoader(localOrigin ? {
    fetchImpl: (url, options) => {
      const target = new URL(url)
      return fetch(`${localOrigin}${target.pathname}${target.search}`, options)
    },
  } : {})
  const feed = await load('es')
  if (!feed.articles.length) throw new Error('Blog API returned no published Spanish articles. Build stopped.')
  const snapshot = resolve(snapshotDirectory, 'articles.json')
  await writeFile(snapshot, JSON.stringify(feed), { mode: 0o600 })
  console.log(`[blog] ${feed.articles.length} validated article(s); ${localOrigin ? 'local API' : 'production API'}.`)
  const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), dev ? 'dev' : 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, BUXDEV_BLOG_SNAPSHOT: snapshot },
  })
  const forwardSignal = signal => child.kill(signal)
  process.on('SIGINT', forwardSignal)
  process.on('SIGTERM', forwardSignal)
  try {
    process.exitCode = await new Promise((resolve, reject) => {
      child.on('error', reject)
      child.on('exit', (code) => resolve(code ?? 1))
    })
  } finally {
    process.off('SIGINT', forwardSignal)
    process.off('SIGTERM', forwardSignal)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Blog build failed.')
  process.exitCode = 1
} finally {
  await rm(directory, { recursive: true, force: true })
  await rm(snapshotDirectory, { recursive: true, force: true })
}
