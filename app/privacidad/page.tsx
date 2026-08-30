import { LegalDocument } from "@/components/legal-document"

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LegalDocument source="BUXDEV_Aviso_de_Privacidad.md" title="Aviso de Privacidad" />
    </main>
  )
}
