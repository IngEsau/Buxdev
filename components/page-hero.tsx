"use client"

import type { LucideIcon } from "lucide-react"
import { Braces, Layers3, Mail, PanelsTopLeft } from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./page-hero.module.css"

type PageHeroName = "about" | "services" | "work" | "contact"

const pageIcons: Record<PageHeroName, LucideIcon> = {
  about: Braces,
  services: Layers3,
  work: PanelsTopLeft,
  contact: Mail,
}

const pageNavigationKeys = {
  about: "nosotros",
  services: "servicios",
  work: "trabajos",
  contact: "contacto",
} as const

interface PageHeroProps {
  page: PageHeroName
}

export function PageHero({ page }: PageHeroProps) {
  const { t } = useLanguage()
  const copy = t.pages[page]
  const Icon = pageIcons[page]
  const visualLabel = t.nav[pageNavigationKeys[page]]

  return (
    <section className={styles.hero} aria-labelledby={`${page}-page-title`}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <MotionReveal className={styles.copy} revealOnView={false} distance={10}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 id={`${page}-page-title`} className={styles.title}>
            <span>{copy.titleStart}{" "}</span>
            <span className={styles.titleAccent}>{copy.titleAccent}</span>
          </h1>
          <p className={styles.description}>{copy.description}</p>
        </MotionReveal>

        <MotionReveal
          className={styles.visual}
          aria-hidden="true"
          revealOnView={false}
          delay={0.08}
          distance={14}
        >
          <div className={styles.visualShadow} />
          <div className={styles.frame}>
            <div className={styles.frameBar}>
              <span className={styles.controls}>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.path}>buxdev / {visualLabel.toLowerCase()}</span>
              <Braces />
            </div>

            <div className={styles.canvas}>
              <div className={styles.canvasGrid} />
              <div className={styles.ringLarge} />
              <div className={styles.ringSmall} />
              <span className={`${styles.node} ${styles.nodeTop}`} />
              <span className={`${styles.node} ${styles.nodeRight}`} />
              <span className={`${styles.node} ${styles.nodeBottom}`} />
              <span className={`${styles.node} ${styles.nodeLeft}`} />
              <div className={styles.core}>
                <Icon />
              </div>
            </div>

            <div className={styles.frameFooter}>
              <span>01</span>
              <strong>BUXDEV</strong>
              <span>{visualLabel.toUpperCase()}</span>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
