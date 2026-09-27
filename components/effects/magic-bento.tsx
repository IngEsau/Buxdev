"use client"

/*!
 * MagicBento interaction adapted from React Bits:
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/MagicBento/MagicBento.tsx
 * MIT + Commons Clause License Condition v1.0
 * Copyright (c) 2026 David Haz
 *
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

import { useEffect, useRef, type ReactNode } from "react"

import styles from "./magic-bento.module.css"

export function MagicBento({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = root.current
    if (!grid) return
    const allowed = matchMedia("(min-width: 64.0625rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)")
    let disposed = false
    let visible = false
    let loading = false
    let stop: (() => void) | undefined

    const start = async () => {
      if (disposed || loading || stop || !visible || !allowed.matches || document.hidden) return
      loading = true
      try {
        const { gsap } = await import("gsap")
        if (disposed || !visible || !allowed.matches || document.hidden) return
        const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-magic-card]"))
        const spotlight = grid.querySelector<HTMLElement>("[data-magic-spotlight]")!
        const ripples = new Set<HTMLElement>()
        let hovered: HTMLElement | undefined
        grid.dataset.magicEnabled = "true"

        const resetCard = (card: HTMLElement, instant = false) => {
          gsap.killTweensOf(card)
          gsap.to(card, { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: instant ? 0 : 0.3,
            ease: "power2.out", onComplete: () => { gsap.set(card, { clearProps: "transform,zIndex" }) } })
        }
        const leave = () => {
          if (hovered) resetCard(hovered)
          hovered = undefined
          cards.forEach(card => card.style.setProperty("--glow-intensity", "0"))
          gsap.to(spotlight, { opacity: 0, duration: 0.25, overwrite: true })
        }
        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return
          const bounds = grid.getBoundingClientRect()
          const x = event.clientX - bounds.left
          const y = event.clientY - bounds.top
          // Untransformed layout bounds prevent feedback/jitter from tilt + magnetism.
          const target = cards.find(card => x >= card.offsetLeft && x <= card.offsetLeft + card.offsetWidth
            && y >= card.offsetTop && y <= card.offsetTop + card.offsetHeight)
          if (hovered && hovered !== target) resetCard(hovered)
          hovered = target
          cards.forEach(card => {
            const localX = x - card.offsetLeft
            const localY = y - card.offsetTop
            const distance = Math.hypot(Math.max(0, -localX, localX - card.offsetWidth), Math.max(0, -localY, localY - card.offsetHeight))
            card.style.setProperty("--glow-x", `${localX}px`)
            card.style.setProperty("--glow-y", `${localY}px`)
            card.style.setProperty("--glow-intensity", String(Math.max(0, 1 - distance / 300)))
          })
          gsap.to(spotlight, { x, y, opacity: 1, duration: 0.15, ease: "power2.out", overwrite: true })
          if (!target) return
          const dx = x - target.offsetLeft - target.offsetWidth / 2
          const dy = y - target.offsetTop - target.offsetHeight / 2
          gsap.to(target, {
            rotationX: -dy / (target.offsetHeight / 2) * 10,
            rotationY: dx / (target.offsetWidth / 2) * 10,
            x: dx * 0.05, y: dy * 0.05, transformPerspective: 1000, zIndex: 2,
            duration: 0.3, ease: "power2.out", overwrite: true,
          })
        }
        const click = (event: MouseEvent) => {
          if (!hovered || event.detail === 0) return
          const rect = hovered.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top
          const size = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y)) * 2
          const ripple = document.createElement("span")
          ripple.className = styles.ripple
          ripple.setAttribute("aria-hidden", "true")
          Object.assign(ripple.style, { width: `${size}px`, height: `${size}px`, left: `${x - size / 2}px`, top: `${y - size / 2}px` })
          hovered.appendChild(ripple)
          ripples.add(ripple)
          gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out",
            onComplete: () => { ripple.remove(); ripples.delete(ripple) } })
        }
        grid.addEventListener("pointermove", move)
        grid.addEventListener("pointerleave", leave)
        grid.addEventListener("click", click)
        window.addEventListener("scroll", leave, { passive: true })
        stop = () => {
          grid.removeEventListener("pointermove", move)
          grid.removeEventListener("pointerleave", leave)
          grid.removeEventListener("click", click)
          window.removeEventListener("scroll", leave)
          gsap.killTweensOf(spotlight)
          gsap.set(spotlight, { clearProps: "all" })
          cards.forEach(card => {
            gsap.killTweensOf(card)
            gsap.set(card, { clearProps: "transform,zIndex" })
            for (const prop of ["--glow-x", "--glow-y", "--glow-intensity"]) card.style.removeProperty(prop)
          })
          ripples.forEach(ripple => { gsap.killTweensOf(ripple); ripple.remove() })
          delete grid.dataset.magicEnabled
          stop = undefined
        }
      } catch { /* Cards remain unchanged if the optional effect cannot load. */ }
      finally { loading = false }
    }
    const sync = () => {
      if (!allowed.matches || !visible || document.hidden) stop?.()
      else void start()
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(grid)
    allowed.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      disposed = true
      observer.disconnect()
      allowed.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
      stop?.()
    }
  }, [children])

  return (
    <div ref={root} className={`${styles.grid} ${className ?? ""}`}>
      {children}
      <span className={styles.spotlight} data-magic-spotlight aria-hidden="true" />
    </div>
  )
}
