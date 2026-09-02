"use client"

import Link from "next/link"
import { ArrowUpRight, Layers3 } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./portfolio-section.module.css"

export function PortfolioSection() {
  const { t } = useLanguage()

  return (
    <section id="trabajos" className={styles.section} aria-labelledby="home-work-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.nav.trabajos}</p>
            <h2 id="home-work-title" className={styles.title}>
              {t.portfolio.title}
            </h2>
          </div>
          <p className={styles.subtitle}>{t.portfolio.subtitle}</p>
        </header>

        <div className={styles.showcase}>
          <div className={styles.axisHorizontal} aria-hidden="true" />
          <div className={styles.axisVertical} aria-hidden="true" />

          <div className={styles.previewShell} aria-hidden="true">
            <div className={styles.previewBar}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewNavigation}>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.previewCanvas}>
                <div className={styles.previewCopy}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.previewPanels}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.emptyMessage}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <Layers3 />
            </span>
            <p>{t.portfolio.empty}</p>
          </div>
        </div>

        <div className={styles.sectionFooter}>
          <Link href="/work/" className={styles.sectionLink}>
            <span>{t.nav.trabajos}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
