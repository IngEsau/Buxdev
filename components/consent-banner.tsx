"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"

import { useConsent } from "@/components/consent-provider"
import { useLanguage } from "@/hooks/use-language"

import styles from "./consent.module.css"

export function ConsentBanner() {
  const { consent, hasLoaded, acceptAnalytics, rejectAnalytics, openPreferences } = useConsent()
  const { t } = useLanguage()

  if (!hasLoaded || consent) return null

  return (
    <div className={styles.bannerViewport}>
      <section
        className={styles.banner}
        data-consent-banner
        role="region"
        aria-labelledby="consent-banner-title"
        aria-describedby="consent-banner-description"
        aria-live="polite"
      >
        <div className={styles.bannerCopy}>
          <span className={styles.bannerIcon} aria-hidden="true">
            <ShieldCheck />
          </span>
          <div>
            <h2 id="consent-banner-title">{t.consent.bannerTitle}</h2>
            <p id="consent-banner-description">{t.consent.bannerDescription}</p>
            <div className={styles.bannerLinks}>
              <button type="button" data-consent-action="configure" onClick={openPreferences}>
                {t.consent.configure}
              </button>
              <Link href="/cookies/">{t.consent.policyLink}</Link>
            </div>
          </div>
        </div>

        <div className={styles.bannerActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            data-consent-action="reject"
            onClick={rejectAnalytics}
          >
            {t.consent.rejectAnalytics}
          </button>
          <button
            type="button"
            className={styles.primaryAction}
            data-consent-action="accept"
            onClick={acceptAnalytics}
          >
            {t.consent.acceptAnalytics}
          </button>
        </div>
      </section>
    </div>
  )
}
