"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"
import { colorBendsFragment, colorBendsVertex } from "./color-bends-shaders"

// Reference baseline, with a slower clock and enough energy for the dark Hero.
export const heroColorBends = {
  color: "#2C4C9B",
  rotation: 90,
  speed: 0.32,
  scale: 1.6,
  frequency: 1.2,
  warpStrength: 1,
  mouseInfluence: 0.65,
  parallax: 0.6,
  noise: 0,
  iterations: 1,
  intensity: 2.2,
  bandWidth: 1,
} as const

const pageColorBends = {
  ...heroColorBends,
  speed: 0.18,
  intensity: 1.5,
  mouseInfluence: 0.08,
  parallax: 0.1,
} as const

// Keep the page backgrounds visibly flowing on mobile, without extra brightness
// or more frames. The main Hero and desktop retain their existing settings.
const mobilePageSpeed = 0.48

const motionQuery = "(prefers-reduced-motion: no-preference)"

export function ColorBends({ className, variant = "hero" }: { className?: string; variant?: "hero" | "page" }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme((state) => state.theme)
  const hasHydrated = useTheme((state) => state.hasHydrated)
  const settings = variant === "page" ? pageColorBends : heroColorBends

  useEffect(() => {
    const container = containerRef.current
    const surface = container?.parentElement
    if (!container || !surface || !hasHydrated || theme !== "dark") return

    const media = window.matchMedia(motionQuery)
    const compact = window.matchMedia("(max-width: 47.999rem)")
    let disposed = false
    let inView = false
    let loading = false
    let failed = false
    let animationFrame = 0
    let lastFrame = 0
    let elapsed = 0
    let renderFrame: ((delta: number) => void) | undefined
    let releaseRenderer: (() => void) | undefined

    const canRun = () => !disposed && media.matches && inView && !document.hidden && !failed
    const stop = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lastFrame = 0
    }
    const disposeRenderer = () => {
      stop()
      releaseRenderer?.()
      releaseRenderer = undefined
      renderFrame = undefined
      delete container.dataset.bendsReady
    }
    const loop = (now: number) => {
      animationFrame = 0
      if (!media.matches) {
        disposeRenderer()
        return
      }
      if (!canRun() || !renderFrame) return
      if (!lastFrame || now - lastFrame >= 1000 / (compact.matches ? 20 : 30)) {
        const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0
        lastFrame = now
        elapsed += delta
        try {
          renderFrame(delta)
          container.dataset.bendsReady = "true"
        } catch {
          failed = true
          disposeRenderer()
          return
        }
      }
      animationFrame = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!animationFrame && canRun() && renderFrame) animationFrame = requestAnimationFrame(loop)
    }

    const initialize = async () => {
      if (loading || renderFrame || !canRun()) return
      loading = true
      try {
        // Load only when visible; reduced-motion keeps the static background.
        const THREE = await import("three")
        if (!canRun()) return
        const renderer = new THREE.WebGLRenderer({
          alpha: true, antialias: false, depth: false, stencil: false,
          powerPreference: "low-power",
        })
        const canvas = renderer.domElement
        releaseRenderer = () => {
          renderer.dispose()
          if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
          canvas.remove()
        }
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(0x000000, 0)
        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const geometry = new THREE.PlaneGeometry(2, 2)
        const colors = Array.from({ length: 8 }, () => new THREE.Vector3())
        // Match the reference's direct RGB uniforms, without color-space conversion.
        colors[0].set(44 / 255, 76 / 255, 155 / 255)
        const rotation = settings.rotation * Math.PI / 180
        const uniforms = {
          uCanvas: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uSpeed: { value: variant === "page" && compact.matches ? mobilePageSpeed : settings.speed },
          uRot: { value: new THREE.Vector2(Math.cos(rotation), Math.sin(rotation)) },
          uColorCount: { value: 1 },
          uColors: { value: colors },
          uTransparent: { value: 1 },
          uScale: { value: settings.scale },
          uFrequency: { value: settings.frequency },
          uWarpStrength: { value: settings.warpStrength },
          uPointer: { value: new THREE.Vector2() },
          uMouseInfluence: { value: 0 },
          uParallax: { value: 0 },
          uNoise: { value: settings.noise },
          uIterations: { value: settings.iterations },
          uIntensity: { value: settings.intensity },
          uBandWidth: { value: settings.bandWidth },
        }
        const material = new THREE.ShaderMaterial({
          vertexShader: colorBendsVertex,
          fragmentShader: colorBendsFragment,
          uniforms, premultipliedAlpha: true, transparent: true,
          depthTest: false, depthWrite: false,
        })
        scene.add(new THREE.Mesh(geometry, material))
        const targetPointer = new THREE.Vector2()
        const currentPointer = new THREE.Vector2()
        const interaction = window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)")
        const resize = () => {
          const width = Math.max(container.clientWidth, 1)
          const height = Math.max(container.clientHeight, 1)
          renderer.setPixelRatio(Math.min(width < 768 ? 0.65 : width <= 1024 ? 0.75 : 1, 1440 / width))
          renderer.setSize(width, height, false)
          uniforms.uCanvas.value.set(width, height)
        }
        const onPointerMove = (event: PointerEvent) => {
          if (!canRun() || !interaction.matches || event.pointerType !== "mouse") return
          const rect = surface.getBoundingClientRect()
          targetPointer.set(
            Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
            Math.max(-1, Math.min(1, -((event.clientY - rect.top) / rect.height * 2 - 1))),
          )
        }
        const onPointerLeave = () => targetPointer.set(0, 0)
        const syncInteraction = () => {
          surface.removeEventListener("pointermove", onPointerMove)
          surface.removeEventListener("pointerleave", onPointerLeave)
          targetPointer.set(0, 0)
          currentPointer.set(0, 0)
          uniforms.uPointer.value.set(0, 0)
          uniforms.uMouseInfluence.value = interaction.matches ? settings.mouseInfluence : 0
          uniforms.uParallax.value = interaction.matches ? settings.parallax : 0
          if (interaction.matches) {
            surface.addEventListener("pointermove", onPointerMove, { passive: true })
            surface.addEventListener("pointerleave", onPointerLeave)
          }
        }
        const onContextLost = () => {
          failed = true
          disposeRenderer()
        }
        const resizeObserver = new ResizeObserver(resize)
        releaseRenderer = () => {
          resizeObserver.disconnect()
          surface.removeEventListener("pointermove", onPointerMove)
          surface.removeEventListener("pointerleave", onPointerLeave)
          interaction.removeEventListener("change", syncInteraction)
          canvas.removeEventListener("webglcontextlost", onContextLost)
          geometry.dispose()
          material.dispose()
          renderer.dispose()
          if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
          canvas.remove()
        }
        // Fall back on a shader compilation failure rather than leave a blank canvas.
        renderer.debug.onShaderError = () => { failed = true }
        canvas.addEventListener("webglcontextlost", onContextLost)
        interaction.addEventListener("change", syncInteraction)
        syncInteraction()
        resizeObserver.observe(container)
        resize()
        container.appendChild(canvas)
        renderFrame = (delta) => {
          // Same inertial lerp as the reference; no pointer-driven React renders.
          currentPointer.lerp(targetPointer, Math.min(1, delta * 8))
          uniforms.uPointer.value.copy(currentPointer)
          uniforms.uTime.value = elapsed
          uniforms.uSpeed.value = variant === "page" && compact.matches ? mobilePageSpeed : settings.speed
          renderer.render(scene, camera)
          if (failed) throw new Error("Color Bends unavailable")
        }
        start()
      } catch {
        failed = true
        disposeRenderer()
      } finally {
        loading = false
      }
    }

    const sync = () => {
      if (!media.matches) disposeRenderer()
      else if (!canRun()) stop()
      else if (renderFrame) start()
      else void initialize()
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    observer.observe(surface)
    media.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)

    return () => {
      disposed = true
      observer.disconnect()
      media.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
      disposeRenderer()
    }
  }, [hasHydrated, settings, theme, variant])

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
