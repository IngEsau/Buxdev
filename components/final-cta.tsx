"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Code2, Layers3, MonitorSmartphone } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./final-cta.module.css"

export function FinalCta() {
  const { t } = useLanguage()

  return (
    <section className={styles.section} aria-labelledby="home-final-cta-title">
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{t.contact.title}</p>
            <h2 id="home-final-cta-title" className={styles.title}>
              {t.contact.subtitle}
            </h2>
            <p className={styles.description}>{t.hero.description}</p>

            <div className={styles.actions}>
              <Link href="/contact" className={styles.primaryAction}>
                <span>{t.hero.primaryCta}</span>
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="/services" className={styles.secondaryAction}>
                <span>{t.nav.servicios}</span>
                <Layers3 aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.axisHorizontal} />
            <div className={styles.axisVertical} />
            <div className={`${styles.node} ${styles.nodeTop}`}>
              <Code2 />
            </div>
            <div className={`${styles.node} ${styles.nodeRight}`}>
              <MonitorSmartphone />
            </div>
            <div className={`${styles.node} ${styles.nodeBottom}`}>
              <Layers3 />
            </div>
            <div className={styles.orbitOuter} />
            <div className={styles.orbitInner} />
            <div className={styles.core}>
              <Image
                src="/brand/buxdev/mark-on-light.svg"
                alt=""
                width={281}
                height={303}
                className={styles.markOnLight}
              />
              <Image
                src="/brand/buxdev/mark-on-dark.svg"
                alt=""
                width={281}
                height={303}
                className={styles.markOnDark}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
