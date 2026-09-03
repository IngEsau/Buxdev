"use client"

import { useEffect, useRef } from "react"

import { useConsent } from "@/components/consent-provider"
import {
  hasGoogleTagManagerStarted,
  loadGoogleTagManager,
  revokeGoogleAnalyticsAndReload,
} from "@/lib/google-tag-manager"

export function GoogleTagManager() {
  const { consent, hasLoaded } = useConsent()
  const previousAnalytics = useRef<boolean | null>(null)

  useEffect(() => {
    if (!hasLoaded) return

    const analytics = consent?.analytics === true

    if (analytics && consent) {
      loadGoogleTagManager(consent)
    } else if (previousAnalytics.current === true && hasGoogleTagManagerStarted()) {
      revokeGoogleAnalyticsAndReload()
    }

    previousAnalytics.current = analytics
  }, [consent, hasLoaded])

  return null
}
