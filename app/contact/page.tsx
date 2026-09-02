import { ContactSection } from "@/components/contact-section"
import { PageHero } from "@/components/page-hero"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Contacto para tu Proyecto de Software",
  description:
    "Contacta a BUXDEV para solicitar una cotización, pedir información o conversar sobre las necesidades de tu proyecto de software.",
  path: "/contact/",
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero page="contact" />
      <ContactSection />
    </main>
  )
}
