"use client"

import Link from "next/link"
import { ArrowUpRight, FolderKanban, ScanLine } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./work-page.module.css"

export function WorkPageContent() {
  const { t } = useLanguage()

  return (
    <section className={styles.work} aria-labelledby="work-state-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {t.portfolio.stateLabel}
          </p>
          <h2 id="work-state-title">{t.portfolio.stateTitle}</h2>
          <p>{t.portfolio.stateDescription}</p>

          <div className={styles.actions}>
            <Link href="/services" className={styles.secondaryAction}>
              <span>{t.common.viewServices}</span>
              <FolderKanban aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.primaryAction}>
              <span>{t.common.startProject}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.emptyVisual} aria-hidden="true">
          <div className={styles.frame}>
            <div className={styles.frameHeader}>
              <div>
                <span />
                <span />
                <span />
              </div>
              <p>BUXDEV / {t.nav.trabajos.toUpperCase()}</p>
              <ScanLine />
            </div>

            <div className={styles.canvas}>
              <div className={styles.canvasGrid} />
              <div className={`${styles.projectSlot} ${styles.slotLeft}`}>
                <span />
                <i />
                <i />
              </div>
              <div className={`${styles.projectSlot} ${styles.slotCenter}`}>
                <div className={styles.slotIcon}>
                  <FolderKanban />
                </div>
                <span />
                <i />
                <i />
              </div>
              <div className={`${styles.projectSlot} ${styles.slotRight}`}>
                <span />
                <i />
                <i />
              </div>
              <div className={styles.scanLine} />
            </div>

            <div className={styles.frameFooter}>
              <span>01</span>
              <i />
              <strong>{t.common.comingSoon}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
