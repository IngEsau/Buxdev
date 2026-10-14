"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import { MotionReveal } from "@/components/motion-reveal"
import { TechText } from "@/components/effects/tech-text"
import { useLanguage } from "@/hooks/use-language"

import { AboutPrinciples } from "./about-principles"

import styles from "./about-page.module.css"

export function AboutPageContent() {
  const { t } = useLanguage()

  return (
    <section className={styles.about} aria-labelledby="about-story-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.introduction}>
          <MotionReveal className={styles.introContent} revealOnView={false} distance={10}>
            <p className={styles.kicker}>{t.about.title}</p>
            <div className={styles.introCopy}>
              <h1 id="about-story-title"><TechText text={t.about.company} /></h1>
              <p className={styles.lead}>{t.about.experience}</p>
            </div>
          </MotionReveal>
        </div>

        <AboutPrinciples />
        <div className={styles.nextStep}>
          <Link href="/services/">
            <span>{t.services.explore}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
