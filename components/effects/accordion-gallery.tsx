"use client"

/*!
 * AccordionGallery interaction adapted from React Bits:
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/AccordionGallery/AccordionGallery.tsx
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

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import styles from "./accordion-gallery.module.css"

type GalleryItem = {
  id: string
  image: string
  mobileImage: string
  label: string
  href: string
}

export function AccordionGallery({ items, label }: { items: GalleryItem[]; label: string }) {
  const root = useRef<HTMLOListElement>(null)
  const current = useRef(0)
  const pointer = useRef({ x: -1, y: -1 })
  const paint = useRef<((instant?: boolean) => void) | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const gallery = root.current
    if (!gallery) return
    const panels = Array.from(gallery.children) as HTMLElement[]
    const media = panels.map(panel => panel.querySelector<HTMLElement>("[data-gallery-media]")!)
    const labels = panels.map(panel => panel.querySelector<HTMLElement>("[data-gallery-label]")!)
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const vertical = matchMedia("(max-width: 40rem)")
    const fine = matchMedia("(hover: hover) and (pointer: fine)")
    let gsap: typeof import("gsap").gsap | undefined
    let timeline: ReturnType<typeof import("gsap").gsap.timeline> | undefined
    let disposed = false
    let visible = false
    let loading = false

    // React Bits' flex-ratio, grayscale, parallax and perspective transitions.
    // Contain the actual captures so the expanded project's header stays visible.
    const update = (instant = false) => {
      timeline?.kill()
      const usable = (vertical.matches ? gallery.clientHeight : gallery.clientWidth) - (items.length - 1) * 10
      const expanded = usable * 0.62
      const grow = (0.62 * (items.length - 1)) / 0.38
      const animate = gsap && !reduced.matches && !instant && visible
      timeline = animate ? gsap!.timeline({ defaults: { duration: 0.6, ease: "power3.out" } }) : undefined
      panels.forEach((panel, index) => {
        const selected = index === current.current
        const tilt = fine.matches && !vertical.matches && !reduced.matches
          ? (selected ? 0 : index < current.current ? 5 : -5) : 0
        const panelVars = { flexGrow: selected ? grow : 1, rotationY: tilt, transformPerspective: 1400 }
        media[index].style.width = vertical.matches ? "100%" : `${expanded}px`
        media[index].style.height = vertical.matches ? `${expanded}px` : "100%"
        const mediaVars = {
          x: fine.matches && !vertical.matches && !reduced.matches && !selected
            ? Math.max(-1.5, Math.min(1.5, current.current - index)) * expanded * 0.025 : 0,
          "--gray": selected ? 0 : 1,
          "--dim": selected ? 0 : 0.3,
        }
        const labelVars = { opacity: selected || vertical.matches ? 1 : 0, x: selected || vertical.matches ? 0 : -14 }
        if (timeline) {
          timeline.to(panel, panelVars, 0).to(media[index], mediaVars, 0).to(labels[index], labelVars, selected ? 0.06 : 0)
        } else if (gsap) {
          gsap.set(panel, panelVars)
          gsap.set(media[index], mediaVars)
          gsap.set(labels[index], labelVars)
        } else {
          panel.style.flexGrow = String(selected ? grow : 1)
          media[index].style.setProperty("--gray", String(selected ? 0 : 1))
          media[index].style.setProperty("--dim", String(selected ? 0 : 0.3))
        }
      })
    }
    paint.current = update
    const load = async () => {
      if (disposed || !visible || reduced.matches || gsap || loading) return
      loading = true
      try {
        const animation = await import("gsap")
        if (!disposed) { gsap = animation.gsap; update(true) }
      } catch { /* The gallery remains operable without the animation chunk. */ }
      finally { loading = false }
    }
    const preferences = () => { update(true); void load() }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) void load()
      else update(true)
    }, { rootMargin: "150px" })
    observer.observe(gallery)
    const resize = new ResizeObserver(() => update(true))
    resize.observe(gallery)
    for (const query of [reduced, vertical, fine]) query.addEventListener("change", preferences)
    update(true)
    return () => {
      disposed = true
      timeline?.kill()
      paint.current = null
      observer.disconnect()
      resize.disconnect()
      for (const query of [reduced, vertical, fine]) query.removeEventListener("change", preferences)
    }
  }, [items.length])

  const select = (index: number) => {
    if (index === current.current) return
    current.current = index
    setActive(index)
    paint.current?.()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
      : ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % items.length
        : ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index - 1 + items.length) % items.length : null
    if (next === null) return
    event.preventDefault()
    root.current?.querySelectorAll<HTMLAnchorElement>("[data-gallery-trigger]")[next]?.focus()
  }

  return (
    <ol ref={root} className={styles.gallery} aria-label={label}>
      {items.map((item, index) => (
        <li key={item.id} className={styles.panel} data-active={active === index} data-project={item.id}>
          <Link href={item.href} data-gallery-trigger className={styles.trigger} aria-label={item.label}
            onFocus={() => select(index)} onKeyDown={event => onKeyDown(event, index)}
            onPointerMove={event => {
              if (event.pointerType !== "mouse" || (event.clientX === pointer.current.x && event.clientY === pointer.current.y)) return
              pointer.current = { x: event.clientX, y: event.clientY }
              select(index)
            }}>
            <span className={styles.media} data-gallery-media aria-hidden="true">
              <picture>
                <source media="(max-width: 40rem)" srcSet={item.mobileImage} />
                <Image src={item.image} alt="" fill sizes="(max-width: 640px) 90vw, 65vw" className={styles.image} />
              </picture>
            </span>
            <span className={styles.shade} aria-hidden="true" />
            <span className={styles.label} data-gallery-label><span className={styles.bar} aria-hidden="true" />{item.label}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
