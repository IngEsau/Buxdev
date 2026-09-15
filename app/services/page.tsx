import { PageHero } from "@/components/page-hero"
import { ServicesPageContent } from "@/components/services-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Servicios de Desarrollo de Software",
  description:
    "Servicios de BUXDEV en desarrollo fullstack, UX/UI, ciberseguridad, inteligencia artificial y automatización de procesos.",
  path: "/services/",
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero page="services" />
      <ServicesPageContent />
    </main>
  )
}
