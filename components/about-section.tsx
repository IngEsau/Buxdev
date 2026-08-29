"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./about-section.module.css"

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section id="nosotros" className={styles.section} aria-labelledby="home-about-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>{t.about.title}</p>
            <h2 id="home-about-title" className={styles.title}>
              {t.about.company}
            </h2>
          </div>

          <p className={styles.lead}>{t.about.preview}</p>
        </div>

        <div className={styles.sectionFooter}>
          <Link
            href="/about"
            className={styles.sectionLink}
            aria-label={`${t.nav.nosotros}: ${t.about.company}`}
          >
            <span>{t.common.viewAbout}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
