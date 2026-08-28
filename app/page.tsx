import { AboutSection } from "@/components/about-section"
import { FinalCta } from "@/components/final-cta"
import { HeroSection } from "@/components/hero-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ServicesSection } from "@/components/services-section"

export default function Page() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <FinalCta />
    </main>
  )
}
