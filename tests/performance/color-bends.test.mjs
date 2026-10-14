import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'

// Exercise the production TypeScript without adding a test runtime dependency.
function loadModule(file, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  })
  const exports = {}
  const require = name => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
    return dependencies[name]
  }
  new Function('exports', 'require', outputText)(exports, require)
  return exports
}
const shaders = loadModule('components/effects/color-bends-shaders.ts')
const { createColorBendsRenderer } = loadModule('components/effects/color-bends-renderer.ts', {
  './color-bends-shaders': shaders,
})
const settings = { rotation: 90, scale: 1.6, frequency: 1.2, warpStrength: 1, noise: 0, iterations: 1, intensity: 2.2, bandWidth: 1 }

function withContext(options, run) {
  const calls = [], uniforms = new Map()
  let lost = false
  const canvas = {
    width: 300, height: 150,
    getContext(type) { calls.push(['context', type]); return options.unavailable || (type === 'webgl2' && options.webgl1) ? null : gl },
    remove() { calls.push(['remove']) },
  }
  const gl = {
    VERTEX_SHADER: 35633, FRAGMENT_SHADER: 35632, COMPILE_STATUS: 35713, LINK_STATUS: 35714,
    HIGH_FLOAT: 36338, ARRAY_BUFFER: 34962, STATIC_DRAW: 35044, FLOAT: 5126,
    DEPTH_TEST: 2929, STENCIL_TEST: 2960, BLEND: 3042, ONE: 1, ONE_MINUS_SRC_ALPHA: 771,
    COLOR_BUFFER_BIT: 16384, TRIANGLES: 4,
    get drawingBufferWidth() { return canvas.width },
    get drawingBufferHeight() { return canvas.height },
    getShaderPrecisionFormat: () => ({ precision: 23 }),
    createShader: type => ({ type }), createProgram: () => ({}), createBuffer: () => ({}),
    getShaderParameter: () => !options.compileFailure,
    getProgramParameter: () => !options.linkFailure,
    getUniformLocation: (_program, name) => ({ name }),
    uniform1f: (location, value) => uniforms.set(location.name, value),
    uniform1i: (location, value) => uniforms.set(location.name, value),
    uniform2f: (location, x, y) => uniforms.set(location.name, [x, y]),
    uniform3fv: (location, value) => uniforms.set(location.name, Array.from(value)),
    isContextLost: () => lost,
    getExtension: name => name === 'WEBGL_lose_context' ? { loseContext() { lost = true; calls.push(['loseContext']) } } : null,
  }
  for (const name of ['shaderSource', 'compileShader', 'attachShader', 'bindAttribLocation', 'linkProgram', 'useProgram',
    'bindBuffer', 'bufferData', 'enableVertexAttribArray', 'vertexAttribPointer', 'disable', 'enable', 'blendFuncSeparate',
    'clearColor', 'viewport', 'clear', 'drawArrays', 'deleteBuffer', 'deleteProgram', 'deleteShader']) {
    gl[name] = (...args) => calls.push([name, ...args])
  }
  const previous = globalThis.document
  globalThis.document = { createElement: name => { assert.equal(name, 'canvas'); return canvas } }
  try { run({ canvas, gl, calls, uniforms }) }
  finally {
    if (previous === undefined) delete globalThis.document
    else globalThis.document = previous
  }
}

test('Color Bends preserves its shader, color, alpha blending, UV plane and frame uniforms', () => {
  withContext({}, ({ canvas, gl, calls, uniforms }) => {
    const renderer = createColorBendsRenderer(settings)
    assert.equal(renderer.canvas, canvas)
    assert.ok(calls.some(([name, , source]) => name === 'shaderSource' && source.includes('sumCol += uColors[i] * w;')))
    assert.deepEqual(calls.find(call => call[0] === 'blendFuncSeparate'), ['blendFuncSeparate', gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA])
    assert.equal(calls.find(call => call[0] === 'bufferData')[2].length, 30)
    const colors = uniforms.get('uColors[0]')
    for (const [i, value] of [44 / 255, 76 / 255, 155 / 255].entries()) assert.ok(Math.abs(colors[i] - value) < 0.000001)
    assert.equal(uniforms.get('uIterations'), 1)
    assert.equal(uniforms.get('uIntensity'), 2.2)
    renderer.setSize(390, 844, 0.65)
    assert.deepEqual([canvas.width, canvas.height], [253, 548])
    assert.deepEqual(calls.find(call => call[0] === 'viewport'), ['viewport', 0, 0, 254, 549])
    assert.deepEqual(uniforms.get('uCanvas'), [390, 844])
    renderer.render({ time: 2, speed: 0.48, pointerX: 0.2, pointerY: -0.1, mouseInfluence: 0.65, parallax: 0.6 })
    assert.equal(uniforms.get('uTime'), 2)
    assert.equal(uniforms.get('uSpeed'), 0.48)
    assert.deepEqual(uniforms.get('uPointer'), [0.2, -0.1])
    assert.deepEqual(calls.find(call => call[0] === 'drawArrays'), ['drawArrays', gl.TRIANGLES, 0, 6])
    renderer.dispose()
  })
})

test('Color Bends supports WebGL 1 without changing the shader mathematics', () => {
  withContext({ webgl1: true }, ({ calls }) => {
    const renderer = createColorBendsRenderer(settings)
    assert.deepEqual(calls.filter(call => call[0] === 'context').map(call => call[1]), ['webgl2', 'webgl'])
    const source = calls.filter(call => call[0] === 'shaderSource').map(call => call[2])
    assert.ok(source.some(value => value.includes(shaders.colorBendsFragment)))
    assert.ok(source.every(value => !value.includes('#version 300 es')))
    renderer.dispose()
  })
})

test('Color Bends releases resources on compilation/link failure and disposes only once', () => {
  for (const options of [{ compileFailure: true }, { linkFailure: true }]) {
    withContext(options, ({ calls }) => {
      assert.throws(() => createColorBendsRenderer(settings), /unavailable/)
      assert.ok(calls.some(call => call[0] === 'deleteShader'))
      assert.equal(calls.filter(call => call[0] === 'loseContext').length, 1)
    })
  }
  withContext({ unavailable: true }, () => assert.throws(() => createColorBendsRenderer(settings), /unavailable/))
  withContext({}, ({ calls }) => {
    const renderer = createColorBendsRenderer(settings)
    renderer.dispose()
    renderer.dispose()
    assert.equal(calls.filter(call => call[0] === 'deleteBuffer').length, 1)
    assert.equal(calls.filter(call => call[0] === 'deleteProgram').length, 1)
    assert.equal(calls.filter(call => call[0] === 'loseContext').length, 1)
    assert.throws(() => renderer.render({ time: 0, speed: 0.32, pointerX: 0, pointerY: 0, mouseInfluence: 0, parallax: 0 }), /unavailable/)
  })
})

test('The static export does not regain Three.js or an oversized JavaScript payload', () => {
  const directory = 'out/_next/static/chunks'
  const chunks = readdirSync(directory).filter(file => file.endsWith('.js')).map(file => readFileSync(`${directory}/${file}`))
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  assert.ok(total <= 1_350_000, `Exported JS ${total} bytes; budget 1350000 (native baseline 1262856)`)
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 300_000, `JS chunk ${chunk.length} bytes; budget 300000 (largest baseline 228922)`)
    assert.ok(!chunk.includes(Buffer.from('WebGLRenderer')), 'Color Bends must not ship the Three.js renderer again')
  }
})
