import { ValeriaHerreraCaseStudy } from "@/components/valeria-herrera-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Valeria Herrera — Caso de estudio",
  description:
    "Caso de estudio de un catálogo digital de repostería desarrollado por BUXDEV con UX/UI, frontend responsive y fundamentos de SEO técnico.",
  path: "/work/valeria-herrera/",
})

export default function Page() {
  return <ValeriaHerreraCaseStudy />
}
