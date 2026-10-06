import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Poet’s Flowers — Sitio editorial y catálogo floral",
  description: "Caso de estudio de Poet’s Flowers: experiencia web editorial, colección floral por ocasiones y contacto directo en un sitio responsive.",
  path: "/work/poets-flowers/",
})

export default function Page() {
  return <NewWorkCaseStudy project="poetsFlowers" />
}
