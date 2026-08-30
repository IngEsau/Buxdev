import type { Metadata } from "next"

import { ContactSection } from "@/components/contact-section"
import { PageHero } from "@/components/page-hero"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a BUXDEV para solicitar una cotización, información o resolver una duda sobre tu proyecto.",
  alternates: {
    canonical: "/contact/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "BUXDEV",
    url: "/contact/",
    title: "Contacto | BUXDEV",
    description: "Cuéntanos qué necesitas para comenzar la conversación sobre tu próximo proyecto de software.",
  },
}

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero page="contact" />
      <ContactSection />
    </main>
  )
}
