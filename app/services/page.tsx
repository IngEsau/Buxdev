import type { Metadata } from "next"

import { PageHero } from "@/components/page-hero"
import { ServicesPageContent } from "@/components/services-page"

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Páginas web, tiendas en línea, web apps, aplicaciones móviles, rediseño y SEO desarrollados por BUXDEV.",
  alternates: {
    canonical: "/services/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "BUXDEV",
    url: "/services/",
    title: "Servicios | BUXDEV",
    description:
      "Servicios de desarrollo web, comercio electrónico, aplicaciones, rediseño y optimización para buscadores.",
  },
}

export default function Page() {
  return (
    <main>
      <PageHero page="services" />
      <ServicesPageContent />
    </main>
  )
}
