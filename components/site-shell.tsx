"use client"

import type React from "react"

import { ConsentBanner } from "@/components/consent-banner"
import { ConsentProvider } from "@/components/consent-provider"
import { FloatingChat } from "@/components/floating-chat"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PrivacyPreferences } from "@/components/privacy-preferences"
import { Toaster } from "@/components/ui/toaster"
import { useLanguage, useLanguageEffect } from "@/hooks/use-language"
import { useThemeEffect } from "@/hooks/use-theme"

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  const { t } = useLanguage()

  useLanguageEffect()
  useThemeEffect()

  return (
    <ConsentProvider>
      <a href="#main-content" className="skip-link">
        {t.common.skipToContent}
      </a>
      <Navbar />
      {children}
      <Footer />
      <FloatingChat />
      <ConsentBanner />
      <PrivacyPreferences />
      <Toaster />
    </ConsentProvider>
  )
}
