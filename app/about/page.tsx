import type { Metadata } from "next"

import { AboutPageContent } from "@/components/about-page"

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce a BUXDEV, empresa mexicana dedicada al desarrollo de software multiplataforma y comprometida con la excelencia.",
  alternates: {
    canonical: "/about/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "BUXDEV",
    url: "/about/",
    title: "Nosotros | BUXDEV",
    description:
      "Experiencia, misión, visión y valores de BUXDEV como empresa de desarrollo de software multiplataforma.",
  },
}

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <AboutPageContent />
    </main>
  )
}
