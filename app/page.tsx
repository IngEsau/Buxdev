import { StructuredData } from "@/components/structured-data"
import { AboutSection } from "@/components/about-section"
import { FinalCta } from "@/components/final-cta"
import { HeroSection } from "@/components/hero-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ServicesSection } from "@/components/services-section"
import { createPageMetadata, HOME_TITLE, homepageStructuredData, SITE_DESCRIPTION } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
})

export default function Page() {
  return (
    <>
      <StructuredData data={homepageStructuredData} />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <FinalCta />
      </main>
    </>
  )
}
