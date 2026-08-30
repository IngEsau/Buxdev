"use client"

import type React from "react"

import { FloatingChat } from "@/components/floating-chat"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
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
    <>
      <a href="#main-content" className="skip-link">
        {t.common.skipToContent}
      </a>
      <Navbar />
      {children}
      <Footer />
      <FloatingChat />
      <Toaster />
    </>
  )
}
