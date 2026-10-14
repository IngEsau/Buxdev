"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"
import { createColorBendsRenderer } from "./color-bends-renderer"

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
    let initializationFrame = 0
    let initializationTimer = 0
    let idleCallback = 0
    let failed = false
    let animationFrame = 0
    let lastFrame = 0
    let elapsed = 0
    let renderFrame: ((delta: number) => void) | undefined
    let releaseRenderer: (() => void) | undefined

    const canRun = () => !disposed && media.matches && inView && !document.hidden && !failed
    const cancelInitialization = () => {
      cancelAnimationFrame(initializationFrame)
      clearTimeout(initializationTimer)
      if (idleCallback) window.cancelIdleCallback(idleCallback)
      initializationFrame = initializationTimer = idleCallback = 0
      loading = false
    }
    const stop = () => {
      cancelInitialization()
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

    const initialize = () => {
      initializationTimer = idleCallback = 0
      if (renderFrame || !canRun()) { loading = false; return }
      try {
        const renderer = createColorBendsRenderer(settings)
        const { canvas } = renderer
        releaseRenderer = renderer.dispose
        const targetPointer = { x: 0, y: 0 }
        const currentPointer = { x: 0, y: 0 }
        const interaction = window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)")
        const resize = () => {
          const width = Math.max(container.clientWidth, 1)
          const height = Math.max(container.clientHeight, 1)
          const pixelRatio = Math.min(width < 768 ? 0.65 : width <= 1024 ? 0.75 : 1, 1440 / width)
          renderer.setSize(width, height, pixelRatio)
        }
        const onPointerMove = (event: PointerEvent) => {
          if (!canRun() || !interaction.matches || event.pointerType !== "mouse") return
          const rect = surface.getBoundingClientRect()
          targetPointer.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
          targetPointer.y = Math.max(-1, Math.min(1, -((event.clientY - rect.top) / rect.height * 2 - 1)))
        }
        const onPointerLeave = () => { targetPointer.x = targetPointer.y = 0 }
        const syncInteraction = () => {
          surface.removeEventListener("pointermove", onPointerMove)
          surface.removeEventListener("pointerleave", onPointerLeave)
          targetPointer.x = targetPointer.y = currentPointer.x = currentPointer.y = 0
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
          renderer.dispose()
        }
        canvas.addEventListener("webglcontextlost", onContextLost)
        interaction.addEventListener("change", syncInteraction)
        syncInteraction()
        resizeObserver.observe(container)
        resize()
        container.appendChild(canvas)
        renderFrame = (delta) => {
          // Same inertial lerp as the reference; no pointer-driven React renders.
          const smoothing = Math.min(1, delta * 8)
          currentPointer.x += (targetPointer.x - currentPointer.x) * smoothing
          currentPointer.y += (targetPointer.y - currentPointer.y) * smoothing
          renderer.render({
            time: elapsed,
            speed: variant === "page" && compact.matches ? mobilePageSpeed : settings.speed,
            pointerX: currentPointer.x, pointerY: currentPointer.y,
            mouseInfluence: interaction.matches ? settings.mouseInfluence : 0,
            parallax: interaction.matches ? settings.parallax : 0,
          })
        }
        start()
      } catch {
        failed = true
        disposeRenderer()
      } finally {
        loading = false
      }
    }

    const scheduleInitialization = () => {
      if (loading || !canRun()) return
      loading = true
      // Give content a paint before compiling the decorative shader. Keep the
      // static background until ready, and cancel pending work when offscreen.
      initializationFrame = requestAnimationFrame(() => {
        initializationFrame = 0
        if (!canRun()) { loading = false; return }
        if (typeof window.requestIdleCallback === "function") {
          idleCallback = window.requestIdleCallback(initialize, { timeout: 500 })
        } else {
          initializationTimer = window.setTimeout(initialize, 0)
        }
      })
    }

    const sync = () => {
      if (!media.matches) disposeRenderer()
      else if (!canRun()) stop()
      else if (renderFrame) start()
      else scheduleInitialization()
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
