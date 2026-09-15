"use client"

import { Eye, Heart, Target } from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./about-principles.module.css"

export function AboutPrinciples() {
  const { t } = useLanguage()

  return (
    <MotionReveal className={styles.principles} delay={0.06}>
      <article className={`${styles.principle} ${styles.mission}`}>
        <div className={styles.principleMeta}>
          <span>01</span>
          <Target aria-hidden="true" />
        </div>
        <div>
          <h2>{t.about.mission.title}</h2>
          <p>{t.about.mission.text}</p>
        </div>
      </article>

      <article className={`${styles.principle} ${styles.vision}`}>
        <div className={styles.principleMeta}>
          <span>02</span>
          <Eye aria-hidden="true" />
        </div>
        <div>
          <h2>{t.about.vision.title}</h2>
          <p>{t.about.vision.text}</p>
        </div>
      </article>

      <article className={`${styles.principle} ${styles.values}`}>
        <div className={styles.valuesHeading}>
          <div className={styles.principleMeta}>
            <span>03</span>
            <Heart aria-hidden="true" />
          </div>
          <h2>{t.about.values.title}</h2>
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
    </MotionReveal>
  )
}
