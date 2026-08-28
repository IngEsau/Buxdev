"use client"

import type React from "react"

import { FloatingChat } from "@/components/floating-chat"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { useThemeEffect } from "@/hooks/use-theme"

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  useThemeEffect()

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FloatingChat />
      <Toaster />
    </>
  )
}
