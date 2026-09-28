"use client"

/*!
 * Adapted from React Bits Tech Text by David Haz (c) 2026.
 * https://reactbits.dev/text-animations/tech-text
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

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"
import styles from "./tech-text.module.css"

type Glyph = { left: number; right: number; top: number; bottom: number }

export function TechText({ text }: { text: string }) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theme = useTheme((state) => state.theme)
  const hydrated = useTheme((state) => state.hasHydrated)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas || !hydrated) return
    const ctx = canvas.getContext("2d")
    if (!ctx || !("letterSpacing" in ctx)) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const interaction = window.matchMedia("(hover: hover) and (pointer: fine)")
    const compact = window.matchMedia("(max-width: 48rem)")
    const padding = 12
    let alive = true
    let fontsReady = false
    let visible = false
    let frame = 0
    let last = 0
    let elapsed = 0
    let width = 1
    let height = 1
    let dpr = 1
    let baseline = 0
    let font = ""
    let spacing = "0px"
    let color = ""
    let accent = ""
    let glyphs: Glyph[] = []
    let outlines: number[] = []
    const pointer = { inside: false, x: 0, y: 0 }
    const selection = { left: 0, right: 0, top: 0, bottom: 0, initialized: false }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }
    const setFont = () => {
      ctx.font = font
      ctx.letterSpacing = spacing
      ctx.textAlign = "left"
      ctx.textBaseline = "alphabetic"
    }
    const render = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      setFont()
      ctx.fillStyle = color
      ctx.fillText(text, padding, baseline)
      const sweep = padding + (width - padding * 2) * (0.5 - 0.5 * Math.cos(elapsed * 0.55))
      const focus = pointer.inside
        ? glyphs.findIndex(glyph => pointer.x >= glyph.left - 2 && pointer.x <= glyph.right + 2 && pointer.y >= glyph.top - 12 && pointer.y <= glyph.bottom + 12)
        : glyphs.findIndex(glyph => sweep >= glyph.left && sweep <= glyph.right)
      const ease = 1 - Math.exp(-dt / 0.12)
      glyphs.forEach((glyph, index) => {
        outlines[index] += ((index === focus ? 0.94 : 0) - outlines[index]) * ease
        const alpha = outlines[index]
        if (alpha < 0.002) return
        ctx.save()
        ctx.beginPath()
        ctx.rect(glyph.left - 1, glyph.top - 2, glyph.right - glyph.left + 2, glyph.bottom - glyph.top + 4)
        ctx.clip()
        ctx.clearRect(glyph.left - 1, glyph.top - 2, glyph.right - glyph.left + 2, glyph.bottom - glyph.top + 4)
        ctx.globalAlpha = 1 - alpha
        ctx.fillText(text, padding, baseline)
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = 1.1
        ctx.lineJoin = "round"
        ctx.setLineDash([4, 2])
        ctx.strokeText(text, padding, baseline)
        ctx.restore()
      })
      if (focus >= 0) {
        const glyph = glyphs[focus]
        for (const key of ["left", "right", "top", "bottom"] as const) {
          selection[key] = selection.initialized ? selection[key] + (glyph[key] - selection[key]) * ease : glyph[key]
        }
        selection.initialized = true
        const x = selection.left - 5, y = selection.top - 6
        const w = selection.right - selection.left + 10, h = selection.bottom - selection.top + 12
        ctx.strokeStyle = accent
        ctx.lineWidth = 0.8
        ctx.globalAlpha = 0.6
        ctx.strokeRect(x, y, w, h)
        ctx.globalAlpha = 0.9
        for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
          ctx.strokeRect(cx - 1.5, cy - 1.5, 3, 3)
        }
        ctx.globalAlpha = 1
      }
      root.dataset.techReady = "true"
    }
    const loop = (now: number) => {
      frame = 0
      if (reduced.matches) {
        delete root.dataset.techReady
        last = 0
        return
      }
      if (!alive || !visible || document.hidden) return
      if (!last || now - last >= 1000 / (compact.matches ? 20 : 30)) {
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 30
        last = now
        elapsed += dt
        render(dt)
      }
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      if (reduced.matches) {
        stop()
        delete root.dataset.techReady
      } else if (!visible || document.hidden) stop()
      else if (!frame && glyphs.length && fontsReady) frame = requestAnimationFrame(loop)
    }
    const measure = () => {
      if (!alive) return
      const style = getComputedStyle(root)
      font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      spacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing
      color = getComputedStyle(root.parentElement!).color
      accent = style.getPropertyValue("--brand").trim() || "#2C4C9B"
      width = root.clientWidth + padding * 2
      height = root.clientHeight + padding * 2
      dpr = Math.min(window.devicePixelRatio || 1, compact.matches ? 1 : 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      setFont()
      const metrics = ctx.measureText(text)
      const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent
      const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent
      baseline = padding + (root.clientHeight - ascent - descent) / 2 + ascent
      glyphs = Array.from(text, (char, index) => {
        const prefix = ctx.measureText(text.slice(0, index + 1))
        const own = ctx.measureText(char)
        const x = padding + prefix.width - own.width
        return { left: x - own.actualBoundingBoxLeft, right: x + own.actualBoundingBoxRight,
          top: baseline - own.actualBoundingBoxAscent, bottom: baseline + own.actualBoundingBoxDescent }
      })
      outlines = glyphs.map(() => 0)
      selection.initialized = false
      sync()
    }
    const onPointer = (event: PointerEvent) => {
      if (!interaction.matches || event.pointerType !== "mouse") return
      const rect = canvas.getBoundingClientRect()
      pointer.inside = true
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }
    const leave = () => { pointer.inside = false }
    const syncInteraction = () => {
      root.removeEventListener("pointermove", onPointer)
      root.removeEventListener("pointerleave", leave)
      leave()
      if (interaction.matches) {
        root.addEventListener("pointermove", onPointer, { passive: true })
        root.addEventListener("pointerleave", leave)
      }
    }
    const resize = new ResizeObserver(measure)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    resize.observe(root)
    intersection.observe(root)
    reduced.addEventListener("change", sync)
    interaction.addEventListener("change", syncInteraction)
    document.addEventListener("visibilitychange", sync)
    syncInteraction()
    // Keep real DOM text until the actual Montserrat font is ready.
    void document.fonts.ready.then(() => {
      if (!alive) return
      measure()
      const finish = () => {
        if (!alive) return
        fontsReady = true
        measure()
      }
      void document.fonts.load(font, text).then(finish, finish)
    })
    return () => {
      alive = false
      stop()
      delete root.dataset.techReady
      resize.disconnect()
      intersection.disconnect()
      reduced.removeEventListener("change", sync)
      interaction.removeEventListener("change", syncInteraction)
      document.removeEventListener("visibilitychange", sync)
      root.removeEventListener("pointermove", onPointer)
      root.removeEventListener("pointerleave", leave)
    }
  }, [text, theme, hydrated])

  return (
    <span ref={rootRef} className={styles.text}>
      <span className={styles.content}>{text}</span>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </span>
  )
}
