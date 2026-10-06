"use client"

import { ColorBends } from "@/components/effects/color-bends"
import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./page-hero.module.css"

type PageHeroName = "about" | "services" | "work" | "contact"

interface PageHeroProps {
  page: PageHeroName
}

export function PageHero({ page }: PageHeroProps) {
  const { t } = useLanguage()
  const copy = t.pages[page]
  const content = (
    <>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id={`${page}-page-title`} className={styles.title}>
        <span>{copy.titleStart}{" "}</span>
        <span className={styles.titleAccent}>{copy.titleAccent}</span>
      </h1>
      <p className={styles.description}>{copy.description}</p>
    </>
  )

  return (
    <section className={styles.hero} aria-labelledby={`${page}-page-title`}>
      <div className={styles.grid} aria-hidden="true" />
      <ColorBends className={styles.colorBends} variant="page" />

      <div className={styles.inner}>
        {page === "services" || page === "work" ? (
          <div className={styles.copy}>{content}</div>
        ) : (
          <MotionReveal className={styles.copy} revealOnView={false} distance={10}>
            {content}
          </MotionReveal>
        )}
      </div>
    </section>
  )
}
