"use client"

import { useState } from "react"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import {
  Check,
  Lock as LockKeyhole,
  SettingsProfiles as SlidersHorizontal,
  Xmark as X,
} from "iconoir-react"

import { useConsent } from "@/components/consent-provider"
import { useLanguage } from "@/hooks/use-language"

import styles from "./consent.module.css"

export function PrivacyPreferences() {
  const {
    consent,
    isPreferencesOpen,
    openPreferences,
    closePreferences,
    rejectAnalytics,
    saveAnalyticsPreference,
  } = useConsent()
  const { t } = useLanguage()
  const [draftAnalytics, setDraftAnalytics] = useState<boolean | null>(null)
  const analyticsEnabled = draftAnalytics ?? consent?.analytics ?? false

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openPreferences()
      return
    }

    setDraftAnalytics(null)
    closePreferences()
  }

  const handleReject = () => {
    setDraftAnalytics(null)
    rejectAnalytics()
  }

  const handleSave = () => {
    saveAnalyticsPreference(analyticsEnabled)
    setDraftAnalytics(null)
  }

  return (
    <Dialog.Root open={isPreferencesOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content
          className={styles.dialogContent}
          data-privacy-preferences
          aria-labelledby="privacy-preferences-title"
          aria-describedby="privacy-preferences-description"
        >
          <div className={styles.dialogHeader}>
            <span className={styles.dialogIcon} aria-hidden="true">
              <SlidersHorizontal />
            </span>
            <div>
              <Dialog.Title id="privacy-preferences-title">
                {t.consent.preferencesTitle}
              </Dialog.Title>
              <Dialog.Description id="privacy-preferences-description">
                {t.consent.preferencesDescription}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className={styles.closeButton} aria-label={t.consent.closePreferences}>
                <X aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className={styles.categories}>
            <section className={styles.category} aria-labelledby="necessary-category-title">
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon} aria-hidden="true">
                  <LockKeyhole />
                </span>
                <div>
                  <h3 id="necessary-category-title">{t.consent.necessaryTitle}</h3>
                  <p>{t.consent.necessaryStatus}</p>
                </div>
                <span className={styles.requiredBadge}>
                  <Check aria-hidden="true" />
                  {t.consent.alwaysActive}
                </span>
              </div>
              <p className={styles.categoryDescription}>{t.consent.necessaryDescription}</p>
            </section>

            <section className={styles.category} aria-labelledby="analytics-category-title">
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon} aria-hidden="true">
                  <SlidersHorizontal />
                </span>
                <div>
                  <h3 id="analytics-category-title">{t.consent.analyticsTitle}</h3>
                  <p>{t.consent.analyticsStatus}</p>
                </div>
                <label className={styles.switch}>
                  <span className={styles.visuallyHidden}>{t.consent.analyticsToggleLabel}</span>
                  <input
                    type="checkbox"
                    data-analytics-consent-toggle
                    checked={analyticsEnabled}
                    onChange={(event) => setDraftAnalytics(event.target.checked)}
                    aria-describedby="analytics-category-description"
                  />
                  <span className={styles.switchTrack} aria-hidden="true">
                    <span />
                  </span>
                </label>
              </div>
              <p id="analytics-category-description" className={styles.categoryDescription}>
                {t.consent.analyticsDescription}
              </p>
            </section>
          </div>

          <p className={styles.dialogPolicy}>
            {t.consent.moreInformation} <Link href="/cookies/">{t.consent.policyLink}</Link>.
          </p>

          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.secondaryAction}
              data-consent-action="modal-reject"
              onClick={handleReject}
            >
              {t.consent.rejectAnalytics}
            </button>
            <button
              type="button"
              className={styles.primaryAction}
              data-consent-action="save"
              onClick={handleSave}
            >
              {t.consent.savePreferences}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
