"use client"

import { useEffect } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { translations, type Language } from "@/lib/i18n"

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  hasHydrated: boolean
  finishHydration: () => void
}

const getPersistedLanguage = (persistedState: unknown): Language => {
  if (!persistedState || typeof persistedState !== "object") return "es"

  const language = (persistedState as { language?: unknown }).language
  return language === "en" || language === "es" ? language : "es"
}

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (language) => set({ language }),
      hasHydrated: false,
      finishHydration: () => set({ hasHydrated: true }),
    }),
    {
      name: "buxdev-language",
      partialize: (state) => ({ language: state.language }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        language: getPersistedLanguage(persistedState),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state && !error) {
          state.finishHydration()
          return
        }

        queueMicrotask(() => {
          try {
            window.localStorage.removeItem("buxdev-language")
          } catch {
            // Storage can be unavailable in restricted browsing contexts.
          }
          useLanguageStore.setState({ hasHydrated: true })
        })
      },
    },
  ),
)

export function useLanguage() {
  const language = useLanguageStore((state) => state.language)
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const hasHydrated = useLanguageStore((state) => state.hasHydrated)

  return {
    language,
    setLanguage,
    hasHydrated,
    t: translations[language],
  }
}

export function useLanguageEffect() {
  const { language, hasHydrated } = useLanguage()

  useEffect(() => {
    if (!hasHydrated) return

    const root = document.documentElement
    root.lang = language
    root.removeAttribute("data-language-pending")
  }, [hasHydrated, language])
}
