"use client"

import { useLanguage } from "@/hooks/use-language"

import styles from "./legal-document.module.css"

export function LegalLanguageNotice() {
  const { language, setLanguage, t } = useLanguage()

  if (language !== "en") return null

  return (
    <div className={styles.languageNotice} lang="en">
      <p>{t.legal.languageNotice}</p>
      <button type="button" onClick={() => setLanguage("es")}>
        {t.legal.switchToSpanish}
      </button>
    </div>
  )
}
