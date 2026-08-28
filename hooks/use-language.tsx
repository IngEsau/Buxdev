"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { translations, type Language } from "@/lib/i18n"

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.es
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (lang: Language) => set({ language: lang, t: translations[lang] }),
      t: translations.es,
    }),
    {
      name: "buxdev-language",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language]
        }
      },
    },
  ),
)
