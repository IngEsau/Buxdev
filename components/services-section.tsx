"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import type { LucideIcon } from "lucide-react"
import { Code2, Globe2, Search, ShoppingCart, Smartphone, Sparkles } from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./services-section.module.css"

type ServiceVisualKind = "web" | "commerce" | "app" | "mobile" | "redesign" | "search"

const serviceDesigns: Array<{
  Icon: LucideIcon
  visual: ServiceVisualKind
  span: string
}> = [
  { Icon: Globe2, visual: "web", span: styles.spanSeven },
  { Icon: ShoppingCart, visual: "commerce", span: styles.spanFive },
  { Icon: Code2, visual: "app", span: styles.spanFour },
  { Icon: Smartphone, visual: "mobile", span: styles.spanEight },
  { Icon: Sparkles, visual: "redesign", span: styles.spanSeven },
  { Icon: Search, visual: "search", span: styles.spanFive },
]

function ServiceVisual({ kind }: { kind: ServiceVisualKind }) {
  if (kind === "web") {
    return (
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.browserWindow}>
          <div className={styles.windowBar}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.browserBody}>
            <div className={styles.browserSide}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.browserMain}>
              <div className={styles.copyLines}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.browserCards}>
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (kind === "commerce") {
    return (
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.productWindow}>
          <div className={styles.productPreview} />
          <div className={styles.checkout}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }

  if (kind === "app") {
    return (
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.appWindow}>
          <div className={styles.appSide}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.appMain}>
            <div className={styles.appMetric} />
            <div className={styles.appGraph} />
          </div>
        </div>
      </div>
    )
  }

  if (kind === "mobile") {
    return (
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.phoneShell}>
          <div className={styles.phoneScreen}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }

  if (kind === "redesign") {
    return (
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.redesignWindow}>
          <div className={styles.designHalf}>
            <span />
            <span />
            <span />
          </div>
          <div className={styles.designHalf}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.searchWindow}>
        <div className={styles.searchBar}>
          <Search />
          <span />
        </div>
        <div className={styles.resultLines}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

export function ServicesSection() {
  const { t } = useLanguage()

  return (
    <section id="servicios" className={styles.section} aria-labelledby="home-services-title">
      <MotionReveal className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.nav.servicios}</p>
            <h2 id="home-services-title" className={styles.title}>
              {t.services.title}
            </h2>
          </div>
          <p className={styles.subtitle}>{t.services.subtitle}</p>
        </header>

        <div className={styles.bento}>
          {t.services.items.map((service, index) => {
            const design = serviceDesigns[index]
            const Icon = design.Icon

            return (
              <article key={service.title} className={`${styles.service} ${design.span}`}>
                <div className={styles.serviceTop}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.serviceIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                </div>

                <ServiceVisual kind={design.visual} />

                <div className={styles.serviceContent}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className={styles.sectionFooter}>
          <Link href="/services/" className={styles.sectionLink}>
            <span>{t.nav.servicios}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </MotionReveal>
    </section>
  )
}
