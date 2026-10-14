"use client"

import { useEffect, type RefObject } from "react"

type StyledElement = HTMLElement | SVGElement
type PhaseTarget = { element: StyledElement; range: number[]; windowed: boolean }
type TravelTarget = { element: SVGElement; range: number[]; points: { x: number; y: number }[] }
type Scene = {
  element: HTMLElement
  stage: HTMLElement
  cta: HTMLElement | null
  start: number
  duration: number
  visible: boolean
  previous: number
  targets: PhaseTarget[] | null
  travelers: TravelTarget[]
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ramp = (value: number, start: number, end: number) => {
  const t = clamp((value - start) / Math.max(0.001, end - start))
  return t * t * (3 - 2 * t)
}
const parse = (value: string) => value.split(",").map(Number)

// One scroll source for all four chapters. Scroll only requests a paint;
// geometry is read separately on resize, font loading and content resizing.
export function useServicesScroll(rootRef: RefObject<HTMLDivElement | null>, locale: string) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const compact = matchMedia("(max-width: 48rem), (max-width: 64rem) and (max-height: 520px)")
    const scenes: Scene[] = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-scene]")).map(element => ({
      element, stage: element.querySelector<HTMLElement>("[data-scene-stage]")!,
      cta: element.querySelector<HTMLElement>("[data-scene-cta]"),
      start: 0, duration: 1, visible: false, previous: -1, targets: null, travelers: [],
    }))
    let frame = 0
    let needsMeasure = true
    let disposed = false

    const prepare = (scene: Scene) => {
      const mode = compact.matches ? "mobile" : "desktop"
      const relevant = (element: StyledElement) => {
        const art = element.closest<SVGElement>("[data-scene-art]")
        return !art || art.dataset.sceneArt === mode
      }
      scene.targets = Array.from(scene.element.querySelectorAll<StyledElement>("[data-range], [data-window]"))
        .filter(relevant).map(element => ({
          element,
          range: parse(element.dataset.window ?? element.dataset.range ?? "0,1"),
          windowed: Boolean(element.dataset.window),
        }))
      scene.travelers = Array.from(scene.element.querySelectorAll<SVGElement>("[data-travel]")).filter(relevant).flatMap(element => {
        const path = element.ownerSVGElement?.querySelector<SVGPathElement>(`[data-route-path="${element.dataset.route}"]`)
        if (!path) return []
        const length = path.getTotalLength()
        const points = Array.from({ length: 121 }, (_, index) => {
          const point = path.getPointAtLength(length * index / 120)
          return { x: point.x, y: point.y }
        })
        return [{ element, range: parse(element.dataset.travel!), points }]
      })
    }

    const apply = (scene: Scene, progress: number) => {
      if (scene.targets && Math.abs(scene.previous - progress) < 0.0001) return
      if (!scene.targets) prepare(scene)
      scene.previous = progress
      const style = scene.element.style
      style.setProperty("--progress", progress.toFixed(4))
      style.setProperty("--back-y", `${(0.5 - progress) * 36}px`)
      style.setProperty("--mid-y", `${(0.5 - progress) * 64}px`)
      style.setProperty("--front-y", `${(0.5 - progress) * 92}px`)
      style.setProperty("--title-phase", ramp(progress, 0, 0.22).toFixed(4))
      style.setProperty("--handoff", ramp(progress, 0.82, 1).toFixed(4))
      scene.element.dataset.stage = String(Math.min(3, Math.floor(progress * 4)))
      for (const target of scene.targets!) {
        const [start, end, exitStart, exitEnd] = target.range
        const phase = ramp(progress, start, end) * (target.windowed ? 1 - ramp(progress, exitStart, exitEnd) : 1)
        target.element.style.setProperty("--phase", phase.toFixed(4))
      }
      for (const target of scene.travelers) {
        const t = clamp((progress - target.range[0]) / (target.range[1] - target.range[0])) * 120
        const index = Math.min(119, Math.floor(t))
        const fraction = t - index
        const a = target.points[index], b = target.points[index + 1]
        target.element.setAttribute("transform", `translate(${a.x + (b.x - a.x) * fraction} ${a.y + (b.y - a.y) * fraction})`)
      }
      const cta = scene.cta
      if (cta) {
        cta.style.pointerEvents = !reduced.matches && progress < 0.74 ? "none" : ""
      }
    }

    const measure = () => {
      const scroll = window.scrollY
      // Read every scene before applying any styles.
      const geometry = scenes.map(scene => ({
        start: scene.element.getBoundingClientRect().top + scroll - (parseFloat(getComputedStyle(scene.stage).top) || 0),
        duration: Math.max(1, scene.element.offsetHeight - scene.stage.offsetHeight),
      }))
      scenes.forEach((scene, index) => {
        scene.start = geometry[index].start
        scene.duration = geometry[index].duration
        scene.previous = -1
        scene.targets = null
      })
      needsMeasure = false
    }

    const paint = () => {
      frame = 0
      if (disposed || document.hidden) return
      if (needsMeasure) measure()
      const scroll = window.scrollY
      for (const scene of scenes) {
        if (scene.visible || reduced.matches) {
          apply(scene, reduced.matches ? 1 : clamp((scroll - scene.start) / scene.duration))
        }
      }
    }
    const requestPaint = () => {
      if (!frame && !document.hidden && !disposed) frame = requestAnimationFrame(paint)
    }
    const onScroll = () => { if (!reduced.matches) requestPaint() }
    const onResize = () => { needsMeasure = true; requestPaint() }
    const onPreference = () => {
      root.dataset.scrollMode = reduced.matches ? "reduced" : "active"
      onResize()
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const scene = scenes.find(item => item.element === entry.target)
        if (scene) scene.visible = entry.isIntersecting
      }
      requestPaint()
    }, { rootMargin: "100% 0px" })
    const resize = new ResizeObserver(onResize)
    resize.observe(root)
    if (root.parentElement) resize.observe(root.parentElement)
    for (const scene of scenes) {
      observer.observe(scene.element)
      resize.observe(scene.stage)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
    window.addEventListener("pageshow", onResize)
    document.addEventListener("visibilitychange", requestPaint)
    reduced.addEventListener("change", onPreference)
    compact.addEventListener("change", onResize)
    void document.fonts.ready.then(() => { if (!disposed) onResize() })
    onPreference()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pageshow", onResize)
      document.removeEventListener("visibilitychange", requestPaint)
      reduced.removeEventListener("change", onPreference)
      compact.removeEventListener("change", onResize)
    }
  }, [rootRef, locale])
}
