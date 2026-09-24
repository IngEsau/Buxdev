"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import {
  Code2,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./services-page.module.css"

const serviceIcons: LucideIcon[] = [Code2, PanelsTopLeft, ShieldCheck, Workflow]

const serviceCtas = [
  { href: "/work/valeria-herrera/" },
  { href: "/work/valeria-herrera/" },
  {
    href: "https://github.com/IngEsau/wp-xmlrpc-attack-analysis",
    external: true,
  },
  { href: "/contact/" },
]

const serviceCtaClassName =
  "group mt-5 inline-flex items-center gap-2 py-1 text-xs font-semibold text-[var(--foreground-muted)] no-underline transition-colors duration-200 hover:text-[var(--foreground)] motion-reduce:transition-none"

const serviceCtaIconClassName =
  "h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"

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

function SecurityAuditVisual() {
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
  RedesignVisual,
  SecurityAuditVisual,
  WebAppVisual,
]

export function ServicesPageContent() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className={styles.services} aria-labelledby="services-list-title">
      <div className={styles.grid} aria-hidden="true" />
      <MotionReveal className={styles.inner} disableOnMobile>
        <header className={styles.header}>
          <p>{t.servicesPage.title}</p>
          <h2 id="services-list-title">{t.servicesPage.subtitle}</h2>
        </header>

        <div className={styles.list}>
          {t.servicesPage.items.map((service, index) => {
            const Icon = serviceIcons[index]
            const Visual = visuals[index]
            const cta = serviceCtas[index]

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
                  {cta.external ? (
                    <a
                      href={cta.href}
                      className={serviceCtaClassName}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{service.cta}</span>
                      <ArrowUpRight className={serviceCtaIconClassName} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link href={cta.href} className={serviceCtaClassName}>
                      <span>{service.cta}</span>
                      <ArrowUpRight className={serviceCtaIconClassName} aria-hidden="true" />
                    </Link>
                  )}
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

        <section className={styles.faq} aria-labelledby="services-faq-title">
          <header className={styles.faqHeader}>
            <div>
              <p className={styles.faqEyebrow}>{t.servicesPage.faq.eyebrow}</p>
              <h2 id="services-faq-title">{t.servicesPage.faq.title}</h2>
            </div>
            <p className={styles.faqIntroduction}>{t.servicesPage.faq.description}</p>
          </header>

          <div className={styles.faqList}>
            {t.servicesPage.faq.items.map((item, index) => {
              const isOpen = openFaq === index
              const triggerId = `services-faq-trigger-${index}`
              const panelId = `services-faq-panel-${index}`

              return (
                <div className={styles.faqItem} key={item.question}>
                  <button
                    id={triggerId}
                    type="button"
                    className={styles.faqTrigger}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span className={styles.faqIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.faqQuestion}>{item.question}</span>
                    <span className={styles.faqMark} data-open={isOpen} aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>

                  <div
                    id={panelId}
                    className={styles.faqAnswer}
                    data-open={isOpen}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.faqAnswerInner}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

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
