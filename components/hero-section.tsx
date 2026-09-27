"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"

import { useLanguage } from "@/hooks/use-language"
import { MotionReveal } from "@/components/motion-reveal"
import { ColorBends } from "@/components/effects/color-bends"

import styles from "./hero-section.module.css"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section id="inicio" className={styles.hero} aria-labelledby="home-hero-title">
      <ColorBends className={styles.colorBends} />
      <div className={styles.technicalGrid} aria-hidden="true" />

      <div className={styles.heroInner}>
        <MotionReveal className={styles.heroCopy} revealOnView={false} distance={10} disableOnMobile>
          <p className={styles.eyebrow}>{t.hero.eyebrow}</p>

          <h1 id="home-hero-title" className={styles.headline}>
            <span>{t.hero.headlineStart}{" "}</span>
            <span className={styles.headlineAccent}>{t.hero.headlineEnd}</span>
          </h1>

          <p className={styles.description}>{t.hero.supportingText}</p>

          <Link href="/contact/" className={styles.primaryAction}>
            <span>{t.hero.projectCta}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </MotionReveal>
      </div>
    </section>
  )
}
