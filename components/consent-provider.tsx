"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  acceptAnalytics as persistAnalyticsAcceptance,
  getConsentServerSnapshot,
  getConsentSnapshot,
  rejectAnalytics as persistAnalyticsRejection,
  saveConsent,
  subscribeToConsent,
  type ConsentState,
} from "@/lib/consent"

interface ConsentContextValue {
  consent: ConsentState | null
  hasLoaded: boolean
  isPreferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
  acceptAnalytics: () => void
  rejectAnalytics: () => void
  saveAnalyticsPreference: (analytics: boolean) => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

interface ConsentProviderProps {
  children: ReactNode
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const snapshot = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  )
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const focusReturnTarget = useRef<HTMLElement | null>(null)

  const openPreferences = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      focusReturnTarget.current = document.activeElement
    }
    setIsPreferencesOpen(true)
  }, [])

  const closePreferences = useCallback(() => {
    const returnTarget = focusReturnTarget.current
    focusReturnTarget.current = null
    setIsPreferencesOpen(false)

    if (returnTarget) {
      window.requestAnimationFrame(() => returnTarget.focus())
    }
  }, [])

  const acceptAnalytics = useCallback(() => {
    persistAnalyticsAcceptance()
    closePreferences()
  }, [closePreferences])

  const rejectAnalytics = useCallback(() => {
    persistAnalyticsRejection()
    closePreferences()
  }, [closePreferences])

  const saveAnalyticsPreference = useCallback((analytics: boolean) => {
    saveConsent(analytics)
    closePreferences()
  }, [closePreferences])

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent: snapshot.consent,
      hasLoaded: snapshot.hasLoaded,
      isPreferencesOpen,
      openPreferences,
      closePreferences,
      acceptAnalytics,
      rejectAnalytics,
      saveAnalyticsPreference,
    }),
    [
      acceptAnalytics,
      closePreferences,
      isPreferencesOpen,
      openPreferences,
      rejectAnalytics,
      saveAnalyticsPreference,
      snapshot.consent,
      snapshot.hasLoaded,
    ],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent() {
  const context = useContext(ConsentContext)

  if (!context) {
    throw new Error("useConsent debe utilizarse dentro de ConsentProvider")
  }

  return context
}
