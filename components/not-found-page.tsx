"use client"

import Link from "next/link"

import { useLanguage } from "@/hooks/use-language"

import styles from "./not-found-page.module.css"

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={styles.page}
      aria-labelledby="not-found-title"
      aria-describedby="not-found-description"
    >
      <div className={styles.backgroundGrid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <section className={styles.content}>
        <p className={styles.errorCode} aria-hidden="true">
          404
        </p>

        <div className={styles.copy}>
          <h1 id="not-found-title">{t.notFound.title}</h1>
          <p id="not-found-description">{t.notFound.description}</p>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryAction}>
            {t.notFound.back}
          </Link>
          <Link href="/contact/" className={styles.secondaryAction}>
            {t.notFound.contact}
          </Link>
        </div>
      </section>
    </main>
  )
}
