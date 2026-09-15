"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import {
  Code2,
  Globe2,
  Search,
  ShoppingCart,
  Smartphone,
  Sparkles,
} from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./services-page.module.css"

const serviceIcons: LucideIcon[] = [Globe2, ShoppingCart, Code2, Smartphone, Sparkles, Search]

function WebsiteVisual() {
  return (
    <div className={styles.browserVisual}>
      <div className={styles.browserBar}>
        <span />
        <span />
        <span />
        <i />
      </div>
      <div className={styles.browserBody}>
        <div className={styles.browserNav} />
        <div className={styles.browserHeadline} />
        <div className={styles.browserCopy} />
        <div className={styles.browserActions}>
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

function CommerceVisual() {
  return (
    <div className={styles.commerceVisual}>
      <div className={styles.productGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index}>
            <i />
            <b />
          </span>
        ))}
      </div>
      <div className={styles.checkoutPanel}>
        <ShoppingCart />
        <span />
        <span />
        <i />
      </div>
    </div>
  )
}

function WebAppVisual() {
  return (
    <div className={styles.workflowVisual}>
      <span className={`${styles.workflowNode} ${styles.workflowTop}`} />
      <span className={`${styles.workflowNode} ${styles.workflowRight}`} />
      <span className={`${styles.workflowNode} ${styles.workflowBottom}`} />
      <span className={`${styles.workflowNode} ${styles.workflowLeft}`} />
      <div className={styles.workflowCore}>
        <Code2 />
      </div>
      <i className={styles.workflowX} />
      <i className={styles.workflowY} />
    </div>
  )
}

function MobileVisual() {
  return (
    <div className={styles.mobileVisual}>
      <div className={`${styles.phone} ${styles.phoneBack}`}>
        <span />
        <i />
        <i />
      </div>
      <div className={`${styles.phone} ${styles.phoneFront}`}>
        <span />
        <Smartphone />
        <i />
      </div>
      <div className={styles.mobileSignal}>
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

function RedesignVisual() {
  return (
    <div className={styles.redesignVisual}>
      <div className={styles.beforePanel}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.afterPanel}>
        <span />
        <div>
          <i />
          <i />
        </div>
        <span />
      </div>
      <div className={styles.comparisonHandle}>
        <Sparkles />
      </div>
    </div>
  )
}

function SeoVisual() {
  return (
    <div className={styles.seoVisual}>
      <div className={styles.searchField}>
        <Search />
        <span />
      </div>
      <div className={styles.resultLines}>
        <span><i /></span>
        <span><i /></span>
        <span><i /></span>
      </div>
      <div className={styles.rankingBars}>
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

const visuals = [
  WebsiteVisual,
  CommerceVisual,
  WebAppVisual,
  MobileVisual,
  RedesignVisual,
  SeoVisual,
]

export function ServicesPageContent() {
  const { t } = useLanguage()

  return (
    <section className={styles.services} aria-labelledby="services-list-title">
      <div className={styles.grid} aria-hidden="true" />
      <MotionReveal className={styles.inner}>
        <header className={styles.header}>
          <p>{t.services.title}</p>
          <h2 id="services-list-title">{t.services.subtitle}</h2>
        </header>

        <div className={styles.list}>
          {t.services.items.map((service, index) => {
            const Icon = serviceIcons[index]
            const Visual = visuals[index]

            return (
              <article className={styles.service} key={service.title}>
                <div className={styles.serviceCopy}>
                  <div className={styles.serviceMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{t.common.service}</span>
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <div className={styles.visualPanel} aria-hidden="true">
                  <div className={styles.panelGlow} />
                  <div className={styles.panelBar}>
                    <span>BUXDEV</span>
                    <i />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className={styles.visualCanvas}>
                    <Visual />
                  </div>
                  <div className={styles.panelFooter}>
                    <span />
                    <i />
                    <span />
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className={styles.ctaRow}>
          <p>{t.contact.subtitle}</p>
          <Link href="/contact/" className={styles.cta}>
            <span>{t.common.startProject}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </MotionReveal>
    </section>
  )
}
