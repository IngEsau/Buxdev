"use client"

import { useEffect } from "react"
import { useThemeEffect } from "@/hooks/use-theme"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ServicesSection } from "@/components/services-section"
import { ContactSection } from "@/components/contact-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { Footer } from "@/components/footer"
import { FloatingChat } from "@/components/floating-chat"
import { Toaster } from "@/components/ui/toaster"

export default function Page() {
  useThemeEffect()

  useEffect(() => {
    const element = document.getElementById("servicios")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <ContactSection />
        <PortfolioSection />
      </main>
      <Footer />
      <FloatingChat />
      <Toaster />
    </>
  )
}