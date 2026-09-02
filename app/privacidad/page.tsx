import { LegalDocument } from "@/components/legal-document"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Aviso de Privacidad",
  description:
    "Consulta el Aviso de Privacidad de BUXDEV y cómo se tratan los datos proporcionados mediante sus medios de contacto.",
  path: "/privacidad/",
  index: false,
})

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LegalDocument source="BUXDEV_Aviso_de_Privacidad.md" title="Aviso de Privacidad" />
    </main>
  )
}
