"use client"

import { MotionReveal } from "@/components/motion-reveal"
import { Aurora } from "@/components/effects/aurora"
import { ScrollExpand } from "@/components/effects/scroll-expand"
import { TechText } from "@/components/effects/tech-text"
import { useLanguage } from "@/hooks/use-language"
import { useRef } from "react"

import { AboutPrinciples } from "./about-principles"

import styles from "./about-page.module.css"

export function AboutPageContent() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className={styles.about} aria-labelledby="about-story-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.introduction}>
          <ScrollExpand className={styles.ambient} surfaceClassName={styles.expandSurface} targetRef={sectionRef}>
            <Aurora className={styles.aurora} />
          </ScrollExpand>
          <MotionReveal className={styles.introContent} revealOnView={false} distance={10}>
            <p className={styles.kicker}>{t.about.title}</p>
            <div className={styles.introCopy}>
              <h1 id="about-story-title"><TechText text={t.about.company} /></h1>
              <p className={styles.lead}>{t.about.experience}</p>
            </div>
          </MotionReveal>
        </div>

        <AboutPrinciples />
      </div>
    </section>
  )
}
