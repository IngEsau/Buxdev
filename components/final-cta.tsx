"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import { Layers3 } from "lucide-react"

import { ShapeGrid } from "@/components/effects/shape-grid"
import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./final-cta.module.css"

export function FinalCta() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} aria-labelledby="home-final-cta-title">
      <div className={styles.grid} aria-hidden="true" />
      <ShapeGrid />
      <MotionReveal className={styles.container} disableOnMobile>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{t.contact.title}</p>
            <h2 id="home-final-cta-title" className={styles.title}>
              {t.contact.subtitle}
            </h2>
            <p className={styles.description}>{t.hero.description}</p>

            <div className={styles.actions}>
              <Link href="/contact/" className={styles.primaryAction}>
                <span>{t.hero.primaryCta}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="/services/" className={styles.secondaryAction}>
                <span>{t.nav.servicios}</span>
                <Layers3 aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </MotionReveal>
    </section>
  )
}
