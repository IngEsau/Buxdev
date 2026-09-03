import { LegalDocument } from "@/components/legal-document"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Política de Cookies",
  description:
    "Consulta cómo BUXDEV utiliza tecnologías necesarias y gestiona el consentimiento para analítica opcional.",
  path: "/cookies/",
  index: false,
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LegalDocument source="BUXDEV_Politica_de_Cookies.md" title="Política de Cookies" />
    </main>
  )
}
