"use client"

/*!
 * Shape Grid interaction adapted from React Bits:
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/ShapeGrid/ShapeGrid.tsx
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

import { useEffect, useRef } from "react"

import styles from "./shape-grid.module.css"

const size = 100
const speed = 0.3
const trailLength = 4

type Cell = { x: number; y: number }

export function ShapeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.closest("section")
    const context = canvas?.getContext("2d")
    if (!canvas || !section || !context) return

    const motion = matchMedia("(min-width: 48.0625rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)")
    const cells = new Map<string, number>()
    const trail: Cell[] = []
    let hovered: Cell | null = null
    let visible = false
    let frame = 0
    let lastTime = 0
    let offset = 0
    let width = 0
    let height = 0

    const resize = () => {
      const bounds = section.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16.67
      lastTime = time
      offset = (offset - speed * elapsed / 16.67 + size) % size
      context.clearRect(0, 0, width, height)

      const targets = new Map<string, number>()
      for (let index = trail.length - 1; index >= 0; index--) {
        const cell = trail[index]
        targets.set(`${cell.x},${cell.y}`, (trail.length - index) / (trail.length + 1))
      }
      if (hovered) targets.set(`${hovered.x},${hovered.y}`, 1)
      for (const key of targets.keys()) if (!cells.has(key)) cells.set(key, 0)
      for (const [key, opacity] of cells) {
        const next = opacity + ((targets.get(key) ?? 0) - opacity) * 0.15
        if (next < 0.005) cells.delete(key)
        else cells.set(key, next)
      }

      const dark = document.documentElement.classList.contains("dark")
      context.lineWidth = 1
      context.strokeStyle = dark ? "#424242" : "rgba(47, 58, 77, 0.17)"
      for (let x = -size + offset; x < width + size; x += size) {
        for (let y = -size + offset; y < height + size; y += size) {
          const col = Math.round((x - offset) / size)
          const row = Math.round((y - offset) / size)
          const alpha = cells.get(`${col},${row}`) ?? 0
          if (alpha) {
            context.fillStyle = `rgba(44, 76, 155, ${alpha * (dark ? 0.48 : 0.12)})`
            context.fillRect(x, y, size, size)
          }
          context.strokeRect(x + 0.5, y + 0.5, size, size)
        }
      }
      frame = requestAnimationFrame(draw)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
      section.removeAttribute("data-shape-grid-active")
      context.clearRect(0, 0, width, height)
    }
    const sync = () => {
      if (!visible || !motion.matches || document.hidden) { stop(); return }
      if (!frame) {
        resize()
        section.setAttribute("data-shape-grid-active", "true")
        frame = requestAnimationFrame(draw)
      }
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !frame) return
      const bounds = section.getBoundingClientRect()
      const col = Math.floor((event.clientX - bounds.left - offset) / size)
      const row = Math.floor((event.clientY - bounds.top - offset) / size)
      if (hovered?.x === col && hovered.y === row) return
      if (hovered) {
        trail.unshift(hovered)
        trail.length = Math.min(trail.length, trailLength)
      }
      hovered = { x: col, y: row }
    }
    const leave = () => {
      if (hovered) {
        trail.unshift(hovered)
        trail.length = Math.min(trail.length, trailLength)
      }
      hovered = null
    }

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    const resizeObserver = new ResizeObserver(() => { resize(); sync() })
    observer.observe(section)
    resizeObserver.observe(section)
    section.addEventListener("pointermove", move)
    section.addEventListener("pointerleave", leave)
    motion.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)

    return () => {
      stop()
      observer.disconnect()
      resizeObserver.disconnect()
      section.removeEventListener("pointermove", move)
      section.removeEventListener("pointerleave", leave)
      motion.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
