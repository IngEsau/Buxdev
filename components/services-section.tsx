"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import { useEffect, useRef, type RefObject } from "react"

import { useLanguage } from "@/hooks/use-language"
import styles from "./services-section.module.css"

const disciplines = [
  { anchor: "fullstack", detail: "API / DATA / INTEGRATIONS" },
  { anchor: "design", detail: "STRUCTURE / SYSTEM / INTERFACE" },
  { anchor: "security", detail: "ASSESSMENT / HARDENING / RESPONSE" },
  { anchor: "automation", detail: "EVENTS / WORKFLOWS / INTEGRATIONS" },
] as const

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

// A short, native-scroll index, independent from the sticky scenes on /services/.
function useIndexProgress(rootRef: RefObject<HTMLElement | null>, locale: string) {
  useEffect(() => {
    const root = rootRef.current
    const index = root?.querySelector<HTMLOListElement>("[data-service-index]")
    if (!root || !index) return

    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const rows = Array.from(index.querySelectorAll<HTMLElement>("[data-discipline]"))
      .map(element => ({ element, offset: 0, length: 1, previous: "" }))
    const plane = root.querySelector<SVGSVGElement>("[data-service-connectors]")
    const connectors = Array.from(root.querySelectorAll<SVGGElement>("[data-service-connector]"))
      .map(element => ({ element, start: 0, length: 1, previous: "" }))
    let indexStart = 0
    let indexDuration = 1
    let visible = false
    let needsMeasure = true
    let frame = 0
    let disposed = false

    const measure = () => {
      const scroll = window.scrollY
      const viewport = window.innerHeight
      const bounds = index.getBoundingClientRect()
      const mobile = matchMedia("(max-width: 48rem)").matches
      const geometry = rows.map(row => {
        const link = row.element.querySelector<HTMLElement>("a")!
        const number = row.element.querySelector<HTMLElement>("[data-service-number]")!
        const offset = row.element.offsetTop
        return {
          offset, length: row.element.offsetHeight,
          link: { x: link.offsetLeft, top: offset + link.offsetTop, bottom: offset + link.offsetTop + link.offsetHeight },
          number: { x: number.offsetLeft + number.offsetWidth / 2, top: offset + number.offsetTop },
        }
      })
      // Measure resting layout, not animated rectangles. Only resize/font changes
      // rebuild the routes; scrolling simply draws their cached lengths.
      const routes = connectors.map((_, i) => {
        const from = geometry[i]
        const to = geometry[i + 1]
        const x = from.link.x + 16
        const start = from.link.bottom + 16
        const end = (mobile ? to.link.top : to.number.top) - 16
        const middle = (start + end) / 2
        const endX = mobile ? to.link.x + 16 : to.number.x
        const path = mobile
          ? `M ${x} ${start} V ${middle} H ${to.link.x - 8} V ${end} H ${endX}`
          : `M ${x} ${start} V ${middle} H ${endX} V ${end}`
        return { path, start, length: Math.max(1, end - start) }
      })
      indexStart = bounds.top + scroll - viewport * 0.78
      indexDuration = Math.max(1, bounds.height)
      rows.forEach((row, i) => {
        row.offset = geometry[i].offset
        row.length = Math.max(1, geometry[i].length)
        row.previous = ""
      })
      plane?.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`)
      connectors.forEach((connector, i) => {
        for (const path of connector.element.querySelectorAll("path")) path.setAttribute("d", routes[i].path)
        connector.start = routes[i].start
        connector.length = routes[i].length
        connector.previous = ""
      })
      needsMeasure = false
    }

    const paint = () => {
      frame = 0
      if (disposed || document.hidden) return
      if (needsMeasure) measure()
      if (!visible && !reduced.matches) return
      const cursor = window.scrollY - indexStart
      const progress = reduced.matches ? 1 : clamp(cursor / indexDuration)
      for (const row of rows) {
        const travel = reduced.matches ? 1 : clamp((cursor - row.offset) / row.length)
        const phase = ease(travel)
        const metadata = ease((travel - 0.12) / 0.65)
        const passed = ease((cursor - row.offset - row.length) / row.length)
        const finish = ease((progress - 0.9) / 0.1)
        const emphasis = reduced.matches ? 1 : 0.84 + phase * 0.16 - passed * 0.1 * (1 - finish)
        const values = [phase, travel, metadata, emphasis].map(value => value.toFixed(4))
        const signature = values.join(",")
        if (row.previous === signature) continue
        const properties = ["--chapter-progress", "--number-progress", "--metadata-progress", "--emphasis"]
        properties.forEach((property, i) => row.element.style.setProperty(property, values[i]))
        row.previous = signature
      }
      for (const connector of connectors) {
        const value = (reduced.matches ? 1 : ease((cursor - connector.start) / connector.length)).toFixed(4)
        if (connector.previous === value) continue
        connector.element.style.setProperty("--connector-progress", value)
        connector.previous = value
      }
    }
    const requestPaint = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(paint)
    }
    const onScroll = () => { if (visible && !reduced.matches) requestPaint() }
    const onResize = () => { needsMeasure = true; requestPaint() }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      requestPaint()
    }, { rootMargin: "160px 0px" })
    const resize = new ResizeObserver(onResize)
    observer.observe(root)
    resize.observe(root)
    if (root.parentElement) resize.observe(root.parentElement)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize, { passive: true })
    window.addEventListener("pageshow", onResize)
    document.addEventListener("visibilitychange", onResize)
    reduced.addEventListener("change", onResize)
    void document.fonts.ready.then(() => { if (!disposed) onResize() })
    requestPaint()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pageshow", onResize)
      document.removeEventListener("visibilitychange", onResize)
      reduced.removeEventListener("change", onResize)
    }
  }, [rootRef, locale])
}

export function ServicesSection() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLElement>(null)
  useIndexProgress(root, language)

  return (
    <section ref={root} id="servicios" className={styles.section} aria-labelledby="home-services-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.nav.servicios} / 01–04</p>
            <h2 id="home-services-title" className={styles.title}>{t.servicesPage.title}</h2>
          </div>
          <p className={styles.subtitle}>{t.servicesPage.subtitle}</p>
        </header>

        <div className={styles.indexFrame}>
          <svg className={styles.connectors} data-service-connectors aria-hidden="true" focusable="false" preserveAspectRatio="none">
            {disciplines.slice(0, -1).map(discipline => (
              <g key={discipline.anchor} data-service-connector>
                <path className={styles.connectorGuide} />
                <path className={styles.connectorProgress} pathLength="1" />
              </g>
            ))}
          </svg>
          <ol className={styles.index} data-service-index role="list">
            {t.servicesPage.items.map((service, i) => (
              <li key={disciplines[i].anchor} className={styles.discipline} data-discipline>
                <span className={styles.number} data-service-number aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <Link href="/services/" className={styles.disciplineLink}>
                  <h3>{service.title}</h3>
                  <ArrowUpRight aria-hidden="true" />
                  <span className={styles.detail} aria-hidden="true">{disciplines[i].detail}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.sectionFooter}>
          <span className={styles.footerIndex} aria-hidden="true">01 — 04 / BUXDEV</span>
          <Link href="/services/" className={styles.sectionLink}>
            <span>{t.services.explore}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
