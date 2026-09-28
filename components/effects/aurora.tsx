"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"
import { auroraFragment, auroraVertex } from "./aurora-shaders"

// React Bits Aurora shader, rendered directly with WebGL2 rather than adding OGL.
export function Aurora({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme((state) => state.theme)
  const hydrated = useTheme((state) => state.hasHydrated)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hydrated || theme !== "dark") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const compact = window.matchMedia("(max-width: 48rem)")
    let visible = false
    let failed = false
    let frame = 0
    let last = 0
    let elapsed = 4
    let render: ((time: number) => void) | undefined
    let release: (() => void) | undefined

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }
    const dispose = () => {
      stop()
      release?.()
      release = undefined
      render = undefined
      delete container.dataset.auroraReady
    }
    const canRun = () => visible && !reduced.matches && !document.hidden && !failed
    const loop = (now: number) => {
      frame = 0
      if (reduced.matches) {
        dispose()
        return
      }
      if (!canRun() || !render) return
      if (!last || now - last >= 1000 / (compact.matches ? 20 : 30)) {
        elapsed += last ? Math.min((now - last) / 1000, 0.1) * 0.22 : 0
        last = now
        render(elapsed)
        container.dataset.auroraReady = "true"
      }
      frame = requestAnimationFrame(loop)
    }
    const initialize = () => {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl2", {
        alpha: true, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: true, powerPreference: "low-power",
      })
      if (!gl) {
        failed = true
        return
      }
      const program = gl.createProgram()
      const buffer = gl.createBuffer()
      const shaders: WebGLShader[] = []
      const resize = () => {
        const width = Math.max(container.clientWidth, 1)
        const height = Math.max(container.clientHeight, 1)
        const ratio = Math.min(compact.matches ? 0.65 : 1, 1440 / width)
        canvas.width = Math.round(width * ratio)
        canvas.height = Math.round(height * ratio)
        gl.viewport(0, 0, canvas.width, canvas.height)
        if (program) gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.width, canvas.height)
      }
      const onLost = () => {
        failed = true
        dispose()
      }
      const observer = new ResizeObserver(resize)
      release = () => {
        observer.disconnect()
        canvas.removeEventListener("webglcontextlost", onLost)
        gl.deleteBuffer(buffer)
        for (const shader of shaders) gl.deleteShader(shader)
        gl.deleteProgram(program)
        gl.getExtension("WEBGL_lose_context")?.loseContext()
        canvas.remove()
      }
      try {
        if (!program || !buffer) throw new Error("Aurora unavailable")
        for (const [type, source] of [[gl.VERTEX_SHADER, auroraVertex], [gl.FRAGMENT_SHADER, auroraFragment]] as const) {
          const shader = gl.createShader(type)
          if (!shader) throw new Error("Aurora unavailable")
          shaders.push(shader)
          gl.shaderSource(shader, source)
          gl.compileShader(shader)
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Aurora unavailable")
          gl.attachShader(program, shader)
        }
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Aurora unavailable")
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
        gl.clearColor(0, 0, 0, 0)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        // Deep blue -> BUXDEV brand blue -> restrained cool highlight.
        gl.uniform3fv(gl.getUniformLocation(program, "uColorStops[0]"),
          new Float32Array([18 / 255, 40 / 255, 86 / 255, 44 / 255, 76 / 255, 155 / 255, 97 / 255, 141 / 255, 197 / 255]))
        gl.uniform1f(gl.getUniformLocation(program, "uAmplitude"), 1.1)
        gl.uniform1f(gl.getUniformLocation(program, "uBlend"), 0.45)
        const time = gl.getUniformLocation(program, "uTime")
        canvas.addEventListener("webglcontextlost", onLost)
        container.appendChild(canvas)
        observer.observe(container)
        resize()
        render = (value) => {
          gl.uniform1f(time, value)
          gl.clear(gl.COLOR_BUFFER_BIT)
          gl.drawArrays(gl.TRIANGLES, 0, 3)
        }
      } catch {
        failed = true
        dispose()
      }
    }
    const sync = () => {
      if (reduced.matches) dispose()
      else if (!canRun()) stop()
      else {
        if (!render) initialize()
        if (render && !frame) frame = requestAnimationFrame(loop)
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(container)
    reduced.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      observer.disconnect()
      reduced.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
      dispose()
    }
  }, [theme, hydrated])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
