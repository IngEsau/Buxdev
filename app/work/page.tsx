import type { Metadata } from "next"

import { PageHero } from "@/components/page-hero"
import { WorkPageContent } from "@/components/work-page"

export const metadata: Metadata = {
  title: "Trabajos",
  description: "Portafolio de trabajos de BUXDEV. Próximamente se publicará una selección de proyectos destacados.",
  alternates: {
    canonical: "/work/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "BUXDEV",
    url: "/work/",
    title: "Trabajos | BUXDEV",
    description: "Próximamente: una selección de proyectos desarrollados por BUXDEV.",
  },
}

export default function Page() {
  return (
    <main>
      <PageHero page="work" />
      <WorkPageContent />
    </main>
  )
}
