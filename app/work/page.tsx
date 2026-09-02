import { PageHero } from "@/components/page-hero"
import { WorkPageContent } from "@/components/work-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Trabajos de Desarrollo de Software",
  description:
    "Consulta el espacio de trabajos de BUXDEV, donde próximamente presentaremos una selección de proyectos con información real y suficiente.",
  path: "/work/",
  index: false,
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero page="work" />
      <WorkPageContent />
    </main>
  )
}
