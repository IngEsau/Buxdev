import { LegalDocument } from "@/components/legal-document"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Términos y Condiciones",
  description: "Consulta los Términos y Condiciones que regulan el acceso y uso del sitio web de BUXDEV.",
  path: "/terminos/",
  index: false,
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LegalDocument source="BUXDEV_Terminos_y_Condiciones.md" title="Términos y Condiciones" />
    </main>
  )
}
