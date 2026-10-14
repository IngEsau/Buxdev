"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"
import { ServicesExperience } from "@/components/services-experience"

import { useLanguage } from "@/hooks/use-language"

import styles from "./services-page.module.css"

const FAQ_HOVER_DELAY_MS = 2300

export function ServicesPageContent() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelFaqHover = () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  useEffect(() => () => {
    if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
  }, [])

  return (
    <section className={styles.services} aria-labelledby="services-list-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <header className={styles.header}>
          <p>{t.servicesPage.title}</p>
          <h2 id="services-list-title">{t.servicesPage.subtitle}</h2>
        </header>

        <ServicesExperience />

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
                    onPointerEnter={event => {
                      if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
                      cancelFaqHover()
                      if (!isOpen) hoverTimer.current = setTimeout(() => {
                        setOpenFaq(index)
                        hoverTimer.current = null
                      }, FAQ_HOVER_DELAY_MS)
                    }}
                    onPointerLeave={cancelFaqHover}
                    onClick={() => {
                      cancelFaqHover()
                      setOpenFaq(isOpen ? null : index)
                    }}
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
      </div>
    </section>
  )
}
