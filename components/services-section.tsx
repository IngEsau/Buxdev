"use client"

import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import type { LucideIcon } from "lucide-react"
import { Code2, PanelsTopLeft, Search, ShieldCheck, Workflow } from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./services-section.module.css"

type ServiceVisualKind = "web" | "app" | "redesign" | "search"

const serviceDesigns: Array<{
  Icon: LucideIcon
  visual: ServiceVisualKind
  span: string
}> = [
  { Icon: Code2, visual: "web", span: styles.spanSeven },
  { Icon: PanelsTopLeft, visual: "redesign", span: styles.spanFive },
  { Icon: ShieldCheck, visual: "search", span: styles.spanFive },
  { Icon: Workflow, visual: "app", span: styles.spanSeven },
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
              {t.servicesPage.title}
            </h2>
          </div>
          <p className={styles.subtitle}>{t.servicesPage.subtitle}</p>
        </header>

        <div className={styles.bento}>
          {t.servicesPage.items.map((service, index) => {
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
