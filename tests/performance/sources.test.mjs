import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import ts from 'typescript'

test('Every UI component reachable from App Router is included in Tailwind sources', () => {
  const css = readFileSync('app/globals.css', 'utf8')
  assert.ok(css.includes('@import "tailwindcss" source(none)'))
  const list = css.match(/@source "\.\.\/components\/ui\/\{([^}]+)\}\.tsx";/)
  assert.ok(list, 'Explicit UI sources must exist')
  const included = new Set(list[1].split(',').map(name => `components/ui/${name}.tsx`))
  const visited = new Set()
  function visit(file) {
    if (visited.has(file) || !/\.[jt]sx?$/.test(file)) return
    visited.add(file)
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    function follow(specifier) {
      if (!ts.isStringLiteral(specifier)) return
      const name = specifier.text
      if (!name.startsWith('@/') && !name.startsWith('.')) return
      const base = name.startsWith('@/') ? resolve(name.slice(2)) : resolve(dirname(file), name)
      const target = [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]
        .find(candidate => existsSync(candidate) && statSync(candidate).isFile())
      assert.ok(target, `Unresolved local import ${name} in ${file}`)
      visit(target)
    }
    function walk(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) follow(node.moduleSpecifier)
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0]) follow(node.arguments[0])
      ts.forEachChild(node, walk)
    }
    walk(source)
  }
  for (const file of readdirSync('app', { recursive: true }).filter(name => /\.[jt]sx?$/.test(name))) visit(resolve('app', file))
  const reachableUI = [...visited].map(file => relative(process.cwd(), file)).filter(file => file.startsWith('components/ui/'))
  assert.ok(reachableUI.length > 0)
  for (const file of reachableUI) assert.ok(included.has(file), `Add ${file} to app/globals.css @source before using it`)
})
