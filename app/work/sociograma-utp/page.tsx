import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Sistema de sociometría UTP — Caso de estudio colaborativo",
  description: "Caso colaborativo de la Universidad Tecnológica de Puebla: UX/UI, desarrollo fullstack y automatización de credenciales. Participación de Esaú Aguilar dentro del equipo.",
  path: "/work/sociograma-utp/",
})

export default function Page() {
  return <NewWorkCaseStudy project="sociogramaUtp" />
}
