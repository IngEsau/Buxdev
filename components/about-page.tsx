"use client"

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
          <div className={styles.index} aria-hidden="true">
            <span>01</span>
            <i />
            <span>BUXDEV</span>
          </div>

          <div className={styles.introCopy}>
            <p className={styles.kicker}>{t.about.title}</p>
            <h2 id="about-story-title">{t.about.company}</h2>
            <p className={styles.lead}>{t.about.experience}</p>
          </div>
        </div>

        <AboutPrinciples />
      </div>
    </section>
  )
}
