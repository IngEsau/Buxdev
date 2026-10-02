import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Bandas Asesoría y Montaje — Caso de estudio web",
  description: "Rework del sitio de Bandas Asesoría y Montaje: arquitectura de información, presentación de productos y vías de contacto comercial.",
  path: "/work/bandas-asesoria/",
})

export default function Page() {
  return <NewWorkCaseStudy project="bandasAsesoria" />
}
