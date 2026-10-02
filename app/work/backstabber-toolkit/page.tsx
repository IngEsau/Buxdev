import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Backstabber Toolkit — Herramienta en desarrollo",
  description: "Caso de arquitectura modular para una herramienta de evaluaciones autorizadas de seguridad de redes, con CLI, API local y dashboard.",
  path: "/work/backstabber-toolkit/",
})

export default function Page() {
  return <NewWorkCaseStudy project="backstabber" />
}
