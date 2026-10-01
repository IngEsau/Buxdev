import { NewWorkCaseStudy } from "@/components/new-work-case-study"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Montblan Mobile System — Caso de estudio",
  description: "Caso de aplicación móvil React Native y Expo integrada con un backend Yii2 para pedidos, catálogos y operación comercial.",
  path: "/work/montblan-mobile/",
})

export default function Page() {
  return <NewWorkCaseStudy project="montblanMobile" />
}
