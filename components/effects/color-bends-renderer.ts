import { colorBendsFragment, colorBendsVertex } from "./color-bends-shaders"

type Settings = {
  rotation: number
  scale: number
  frequency: number
  warpStrength: number
  noise: number
  iterations: number
  intensity: number
  bandWidth: number
}

type Frame = {
  time: number
  speed: number
  pointerX: number
  pointerY: number
  mouseInfluence: number
  parallax: number
}

// This effect needs one fullscreen plane, not a scene graph. Keep the original
// shader, UVs, RGB uniforms and premultiplied blending used by ShaderMaterial.
export function createColorBendsRenderer(settings: Settings) {
  const canvas = document.createElement("canvas")
  const attributes: WebGLContextAttributes = {
    alpha: true, premultipliedAlpha: true, antialias: false,
    depth: false, stencil: false, powerPreference: "low-power",
  }
  const gl2 = canvas.getContext("webgl2", attributes)
  const gl = gl2 ?? canvas.getContext("webgl", attributes)
  if (!gl) throw new Error("Color Bends unavailable")

  let program: WebGLProgram | null = null
  let buffer: WebGLBuffer | null = null
  const shaders: WebGLShader[] = []
  let disposed = false

  const dispose = () => {
    if (disposed) return
    disposed = true
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    for (const shader of shaders) gl.deleteShader(shader)
    if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext()
    canvas.remove()
  }

  try {
    const precision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? "highp" : "mediump"
    const prefix = `${gl2 ? "#version 300 es\n" : ""}precision ${precision} float;\nprecision ${precision} int;\n`
    const vertex = `${prefix}${gl2 ? "in" : "attribute"} vec3 position;\n${gl2 ? "in" : "attribute"} vec2 uv;\n${gl2 ? colorBendsVertex.replace(/\bvarying\b/g, "out") : colorBendsVertex}`
    const fragment = gl2
      ? `${prefix}out vec4 bendsColor;\n${colorBendsFragment.replace(/\bvarying\b/g, "in").replace(/\bgl_FragColor\b/g, "bendsColor")}`
      : `${prefix}${colorBendsFragment}`

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error("Color Bends unavailable")
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Color Bends unavailable")
      return shader
    }
    const vertexShader = compile(gl.VERTEX_SHADER, vertex)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragment)
    program = gl.createProgram()
    if (!program) throw new Error("Color Bends unavailable")
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.bindAttribLocation(program, 0, "position")
    gl.bindAttribLocation(program, 1, "uv")
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Color Bends unavailable")
    gl.useProgram(program)

    buffer = gl.createBuffer()
    if (!buffer) throw new Error("Color Bends unavailable")
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, 1, 0, 0, 1, -1, -1, 0, 0, 0, 1, 1, 0, 1, 1,
      -1, -1, 0, 0, 0, 1, -1, 0, 1, 0, 1, 1, 0, 1, 1,
    ]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.STENCIL_TEST)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const location = (name: string) => gl.getUniformLocation(program!, name)
    const uniforms = {
      canvas: location("uCanvas"), time: location("uTime"), speed: location("uSpeed"),
      pointer: location("uPointer"), mouseInfluence: location("uMouseInfluence"), parallax: location("uParallax"),
    }
    const rotation = settings.rotation * Math.PI / 180
    gl.uniform2f(location("uRot"), Math.cos(rotation), Math.sin(rotation))
    gl.uniform1i(location("uColorCount"), 1)
    const colors = new Float32Array(24)
    colors.set([44 / 255, 76 / 255, 155 / 255])
    gl.uniform3fv(location("uColors[0]"), colors)
    gl.uniform1i(location("uTransparent"), 1)
    gl.uniform1i(location("uIterations"), settings.iterations)
    for (const name of ["scale", "frequency", "warpStrength", "noise", "intensity", "bandWidth"] as const) {
      gl.uniform1f(location(`u${name[0].toUpperCase()}${name.slice(1)}`), settings[name])
    }

    return {
      canvas,
      setSize(width: number, height: number, pixelRatio: number) {
        canvas.width = Math.max(1, Math.floor(width * pixelRatio))
        canvas.height = Math.max(1, Math.floor(height * pixelRatio))
        // WebGLRenderer floored the buffer but rounded the viewport. Preserve
        // that convention too: fractional mobile DPR must not shift the bands.
        gl.viewport(0, 0, Math.round(width * pixelRatio), Math.round(height * pixelRatio))
        gl.uniform2f(uniforms.canvas, width, height)
      },
      render(frame: Frame) {
        if (disposed || gl.isContextLost()) throw new Error("Color Bends unavailable")
        gl.uniform1f(uniforms.time, frame.time)
        gl.uniform1f(uniforms.speed, frame.speed)
        gl.uniform2f(uniforms.pointer, frame.pointerX, frame.pointerY)
        gl.uniform1f(uniforms.mouseInfluence, frame.mouseInfluence)
        gl.uniform1f(uniforms.parallax, frame.parallax)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      },
      dispose,
    }
  } catch (error) {
    dispose()
    throw error
  }
}
