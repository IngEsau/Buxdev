import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Jill Software — Propuesta visual y sitio actual",
  description: "Comparación entre el sitio público actual de Jill Software y una propuesta visual UX/UI para desktop y móvil. La propuesta no se presenta como sitio implementado.",
  path: "/work/jill-software/",
})

export default function Page() {
  return <NewWorkCaseStudy project="jillSoftware" />
}
