import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

// Execute the real hook with deterministic browser geometry and animation frames.
async function scrollHarness() {
  const frames = new Map()
  const events = new Map()
  const preferences = new Map()
  let sequence = 0
  let time = 0
  let reads = 0
  let samples = 0
  let writes = 0
  let cleanup
  const style = () => {
    const values = new Map()
    return { setProperty: (key, value) => { writes++; values.set(key, value) }, getPropertyValue: key => values.get(key) }
  }
  const target = { dataset: { range: '0.15,0.8' }, style: style(), closest: () => null }
  const path = { getTotalLength: () => 100, getPointAtLength: x => { samples++; return { x, y: 0 } } }
  const traveler = {
    dataset: { travel: '0,1', route: 'main' }, closest: () => null,
    ownerSVGElement: { querySelector: () => path }, setAttribute: () => { writes++ },
  }
  const window = {
    scrollY: 0, innerHeight: 800,
    addEventListener: (name, handler) => events.set(name, handler),
    removeEventListener: name => events.delete(name),
  }
  const stage = { offsetHeight: 700, position: 'sticky' }
  const scene = {
    dataset: {}, style: style(), offsetHeight: 1800,
    querySelector: () => stage,
    querySelectorAll: selector => selector === '[data-travel]' ? [traveler] : [target],
    getBoundingClientRect: () => { reads++; return { top: 1000 - window.scrollY } },
  }
  const root = { dataset: {}, parentElement: null, querySelectorAll: () => [scene] }
  const media = query => {
    if (!preferences.has(query)) preferences.set(query, {
      matches: false, handler: null,
      addEventListener(_name, handler) { this.handler = handler },
      removeEventListener() { this.handler = null },
    })
    return preferences.get(query)
  }
  const testModule = { exports: {} }
  const context = vm.createContext({
    module: testModule, exports: testModule.exports,
    require: name => {
      assert.equal(name, 'react')
      return { useEffect: effect => { cleanup = effect() } }
    },
    window, innerHeight: 800,
    document: { hidden: false, fonts: { ready: Promise.resolve() }, addEventListener() {}, removeEventListener() {} },
    matchMedia: media,
    getComputedStyle: element => ({ top: '84px', position: element.position }),
    requestAnimationFrame: callback => { frames.set(++sequence, callback); return sequence },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback }
      observe(target) { this.callback([{ target, isIntersecting: true }]) }
      disconnect() {}
    },
    ResizeObserver: class { observe() {} disconnect() {} },
  })
  const source = readFileSync('hooks/use-services-scroll.ts', 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInContext(compiled, context)
  testModule.exports.useServicesScroll({ current: root }, 'es')
  await Promise.resolve()
  const tick = () => {
    const callbacks = [...frames.values()]
    frames.clear()
    time += 16.67
    callbacks.forEach(callback => callback(time))
  }
  const settle = () => {
    let count = 0
    while (frames.size && count++ < 150) tick()
    assert.equal(frames.size, 0, 'Scroll animation must stop when caught up')
  }
  settle()
  return {
    scene, stage, root, target, frames, tick, settle,
    reads: () => reads, samples: () => samples, writes: () => writes,
    progress: () => +scene.style.getPropertyValue('--progress'),
    scroll: value => { window.scrollY = value; events.get('scroll')() },
    resize: () => events.get('resize')(),
    reduced: value => { const query = media('(prefers-reduced-motion: reduce)'); query.matches = value; query.handler() },
    cleanup: () => cleanup(),
  }
}

test('Services scroll is progressive, reversible, geometry-cached and idle-free', async () => {
  const h = await scrollHarness()
  const reads = h.reads(), samples = h.samples()
  assert.equal(h.progress(), 0)
  h.scroll(916 + 968 * 0.5)
  h.tick()
  assert.ok(h.progress() > 0 && h.progress() < 0.5, 'Wheel/touch changes should catch up gradually')
  h.settle()
  assert.ok(Math.abs(h.progress() - 0.5) < 0.001)
  assert.equal(h.reads(), reads, 'Scrolling must not remeasure layout')
  assert.equal(h.samples(), samples, 'Scrolling must not resample SVG paths')
  const writes = h.writes()
  h.scroll(916 + 968 * 0.5)
  h.settle()
  assert.equal(h.writes(), writes, 'Unchanged progress must not rewrite styles')
  h.scroll(916 + 968 * 0.2)
  h.settle()
  assert.ok(Math.abs(h.progress() - 0.2) < 0.001, 'Scrolling up must reverse the scene')
  h.scroll(916 + 1100 * 0.9)
  h.settle()
  assert.equal(h.progress(), 1, 'The complete diagram must hold before the sticky frame releases')
  h.resize()
  h.settle()
  assert.ok(h.reads() > reads)
  h.cleanup()
  assert.equal(h.frames.size, 0)
})

test('Reduced motion finishes every scene; short flow layouts have a real scroll range', async () => {
  const h = await scrollHarness()
  h.reduced(true)
  h.settle()
  assert.equal(h.root.dataset.scrollMode, 'reduced')
  assert.equal(h.progress(), 1)
  assert.equal(h.target.style.getPropertyValue('--phase'), '1.0000')
  const writes = h.writes()
  h.scroll(0)
  h.settle()
  assert.equal(h.writes(), writes)
  h.stage.position = 'relative'
  h.reduced(false)
  h.settle()
  // Flow start = 1000 - .72 * 800; duration = 1800 + .25 * 800.
  h.scroll(424 + 2000 * 0.5)
  h.settle()
  assert.ok(Math.abs(h.progress() - 0.5) < 0.001)
  h.cleanup()
})

test('Security status captions do not crossfade over one another', () => {
  const source = readFileSync('components/services-visuals.tsx', 'utf8')
  const statuses = [...source.matchAll(/data-window="([\d.,]+)"><text[^>]*className=\{styles.traceText\}/g)]
    .map(match => match[1].split(',').map(Number))
  assert.equal(statuses.length, 3)
  statuses.slice(1).forEach((range, index) => assert.ok(range[0] >= statuses[index][3]))
  assert.match(source, /className=\{styles.transient\} data-range="0.71,0.86"/)
})
