import { PageHero } from "@/components/page-hero"
import { WorkPageContent } from "@/components/work-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Trabajos de Desarrollo de Software",
  description:
    "Explora proyectos reales, colaboraciones, herramientas en desarrollo y propuestas de diseño de BUXDEV con alcance y atribución claros.",
  path: "/work/",
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageHero page="work" />
      <WorkPageContent />
    </main>
  )
}
