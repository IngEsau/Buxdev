"use client"

/*!
 * Adapted from React Bits Specular Button by David Haz (c) 2026.
 * https://reactbits.dev/components/specular-button
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

import { useEffect, useRef, type ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import styles from "./specular-button.module.css"

// Two opposing rim highlights with the reference's angle/proximity easing.
// A CSS masked border avoids a WebGL context and an idle GPU loop for one button.
export function SpecularButton({ className, disabled, children, ...props }: ComponentProps<"button">) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = ref.current
    if (!button || disabled) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const interaction = window.matchMedia("(hover: hover) and (pointer: fine)")
    let visible = false
    let frame = 0
    let last = 0
    let angle = 2.4
    let targetAngle = angle
    let brightness = 0
    let targetBrightness = 0

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }
    const canRun = () => visible && !document.hidden && !reduced.matches && interaction.matches
    const tick = (now: number) => {
      frame = 0
      if (!canRun()) return
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now
      const diff = Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle))
      angle += diff * (1 - Math.exp(-dt * 7))
      brightness += (targetBrightness - brightness) * (1 - Math.exp(-dt * 8))
      button.style.setProperty("--specular-angle", `${angle * 180 / Math.PI}deg`)
      button.style.setProperty("--specular-brightness", `${brightness}`)
      if (Math.abs(diff) > 0.002 || Math.abs(targetBrightness - brightness) > 0.002) frame = requestAnimationFrame(tick)
      else last = 0
    }
    const wake = () => {
      if (canRun() && !frame) frame = requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      if (!canRun() || event.pointerType !== "mouse") return
      const rect = button.getBoundingClientRect()
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2
      const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right)
      const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom)
      const distance = Math.hypot(dx, dy)
      targetAngle = distance === 0
        ? Math.atan2(2 / rect.height, -2 / rect.width) + (event.clientX - cx) / (rect.width / 2) * 0.3 + (cy - event.clientY) / (rect.height / 2) * 0.15
        : Math.atan2(cy - event.clientY, event.clientX - cx)
      const proximity = Math.max(0, 1 - distance / 200)
      targetBrightness = proximity * proximity * (3 - 2 * proximity)
      if (brightness || targetBrightness) wake()
    }
    const sync = () => {
      window.removeEventListener("pointermove", onMove)
      stop()
      brightness = targetBrightness = 0
      button.style.removeProperty("--specular-brightness")
      if (canRun()) window.addEventListener("pointermove", onMove, { passive: true })
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(button)
    reduced.addEventListener("change", sync)
    interaction.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
      reduced.removeEventListener("change", sync)
      interaction.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
      button.style.removeProperty("--specular-angle")
      button.style.removeProperty("--specular-brightness")
    }
  }, [disabled])

  return <Button ref={ref} className={[styles.button, className].filter(Boolean).join(" ")} disabled={disabled} {...props}>{children}</Button>
}
