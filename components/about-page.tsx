"use client"

import { Eye, Heart, Target } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

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

        <div className={styles.principles}>
          <article className={`${styles.principle} ${styles.mission}`}>
            <div className={styles.principleMeta}>
              <span>01</span>
              <Target aria-hidden="true" />
            </div>
            <div>
              <h3>{t.about.mission.title}</h3>
              <p>{t.about.mission.text}</p>
            </div>
          </article>

          <article className={`${styles.principle} ${styles.vision}`}>
            <div className={styles.principleMeta}>
              <span>02</span>
              <Eye aria-hidden="true" />
            </div>
            <div>
              <h3>{t.about.vision.title}</h3>
              <p>{t.about.vision.text}</p>
            </div>
          </article>

          <article className={`${styles.principle} ${styles.values}`}>
            <div className={styles.valuesHeading}>
              <div className={styles.principleMeta}>
                <span>03</span>
                <Heart aria-hidden="true" />
              </div>
              <h3>{t.about.values.title}</h3>
            </div>
            <ol>
              {t.about.values.items.map((value, index) => (
                <li key={value}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{value}</strong>
                  <i aria-hidden="true" />
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>
    </section>
  )
}
