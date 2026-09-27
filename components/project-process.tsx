"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import styles from "./project-process.module.css"

export function ProjectProcess() {
  const { t } = useLanguage()
  const listRef = useRef<HTMLOListElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const list = listRef.current
    if (!list || !("IntersectionObserver" in window)) return

    const markers = Array.from(list.querySelectorAll<HTMLElement>("[data-step-marker]"))
    let observer: IntersectionObserver | undefined

    // Advance at the viewport midpoint. Checking all five markers also handles
    // reverse scrolling and restored/deep scroll positions without a scroll loop.
    const updateStep = () => {
      const midpoint = window.innerHeight / 2
      let nextStep = 0
      markers.forEach((marker, index) => {
        if (marker.getBoundingClientRect().top <= midpoint) nextStep = index
      })
      setActiveStep((current) => current === nextStep ? current : nextStep)
    }

    const observe = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(updateStep, {
        // Percentage root margins resolve against width, so use pixels here.
        rootMargin: `0px 0px -${Math.floor(window.innerHeight / 2)}px 0px`,
        threshold: 0,
      })
      markers.forEach((marker) => observer?.observe(marker))
      updateStep()
    }

    observe()
    window.addEventListener("resize", observe, { passive: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener("resize", observe)
    }
  }, [])

  return (
    <section className={styles.section} aria-labelledby="project-process-title">
      <div className={styles.container}>
        <h2 id="project-process-title" className={styles.title}>{t.hero.process.title}</h2>

        <ol ref={listRef} className={styles.steps} aria-labelledby="project-process-title">
          {t.hero.process.steps.map((step, index) => (
            <li
              key={index}
              className={styles.step}
              data-state={index < activeStep ? "complete" : index === activeStep ? "active" : "upcoming"}
              aria-current={index === activeStep ? "step" : undefined}
            >
              <span className={styles.number} data-step-marker aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.copy}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
