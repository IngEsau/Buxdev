"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-background px-5"
      aria-labelledby="not-found-title"
    >
      <div className="text-center">
        <p className="text-6xl font-bold text-primary mb-4" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className="text-2xl font-semibold mb-4">
          {t.notFound.title}
        </h1>
        <p className="text-muted-foreground mb-8">{t.notFound.description}</p>
        <Button asChild>
          <Link href="/">{t.notFound.back}</Link>
        </Button>
      </div>
    </main>
  )
}
