"use client"

/*!
 * Adapted from React Bits Scroll Expand by David Haz (c) 2026.
 * https://reactbits.dev/animations/scroll-expand
 * MIT + Commons Clause License Condition v1.0
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of
 * an application, website, or product, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * Commons Clause Restriction: You may use this Software, including for any
 * commercial purpose, so long as you do not sell, sublicense, or redistribute
 * the components themselves-whether alone, in a bundle, or as a ported version.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { useEffect, useRef, type ReactNode, type RefObject } from "react"

// Expand only the background, not a sticky stage or an artificial scroll track.
export function ScrollExpand({
  children,
  className,
  surfaceClassName,
  targetRef,
}: {
  children: ReactNode
  className?: string
  surfaceClassName?: string
  targetRef: RefObject<HTMLElement | null>
}) {
  const surfaceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const surface = surfaceRef.current
    const target = targetRef.current
    if (!surface || !target) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const compact = window.matchMedia("(max-width: 48rem)")
    let frame = 0
    let visible = false
    let current = 0
    let progress = 0
    let last = 0

    const apply = (value: number) => {
      const eased = value * value * (3 - 2 * value)
      const insetX = (compact.matches ? 6 : 14) * (1 - eased)
      const insetY = 11 * (1 - eased)
      surface.style.clipPath = `inset(${insetY}% ${insetX}% round 0px)`
      const mask = [
        `linear-gradient(90deg, transparent ${insetX}%, #000 ${insetX + 12}%, #000 ${88 - insetX}%, transparent ${100 - insetX}%)`,
        `linear-gradient(180deg, transparent ${insetY}%, #000 ${insetY + 12}%, #000 ${88 - insetY}%, transparent ${100 - insetY}%)`,
      ].join(", ")
      surface.style.maskImage = mask
      surface.style.setProperty("-webkit-mask-image", mask)
      surface.style.transform = `scale(${1.12 - 0.12 * eased})`
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
      last = now
      current += (progress - current) * (1 - Math.exp(-dt / 0.12))
      if (Math.abs(progress - current) < 0.0004) current = progress
      apply(current)
      if (current !== progress) frame = requestAnimationFrame(tick)
      else last = 0
    }
    const sync = () => {
      if (reduced.matches) {
        stop()
        current = progress = 1
        apply(1)
        return
      }
      if (!visible || document.hidden) {
        stop()
        return
      }
      progress = Math.max(0, Math.min(1, -target.getBoundingClientRect().top / (window.innerHeight * 0.65)))
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(surface)
    window.addEventListener("scroll", sync, { passive: true })
    window.addEventListener("resize", sync)
    document.addEventListener("visibilitychange", sync)
    reduced.addEventListener("change", sync)
    apply(reduced.matches ? 1 : 0)
    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
      document.removeEventListener("visibilitychange", sync)
      reduced.removeEventListener("change", sync)
    }
  }, [targetRef])

  return (
    <div className={className} aria-hidden="true">
      <div ref={surfaceRef} className={surfaceClassName}>{children}</div>
    </div>
  )
}
