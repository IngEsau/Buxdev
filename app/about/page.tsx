import { AboutPageContent } from "@/components/about-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Nosotros e Ingeniería de Software",
  description:
    "Conoce la experiencia, misión, visión y valores de BUXDEV y nuestro enfoque en el desarrollo de software multiplataforma.",
  path: "/about/",
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <AboutPageContent />
    </main>
  )
}
