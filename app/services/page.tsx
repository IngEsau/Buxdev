import { PageHero } from "@/components/page-hero"
import { ServicesPageContent } from "@/components/services-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Servicios de Desarrollo de Software",
  description:
    "Explora los servicios de BUXDEV: páginas web, tiendas en línea, web apps, aplicaciones móviles, rediseño y optimización SEO.",
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
