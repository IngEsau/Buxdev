import { LegalDocument } from "@/components/legal-document"

export default function Page() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LegalDocument source="BUXDEV_Terminos_y_Condiciones.md" title="Términos y Condiciones" />
    </main>
  )
}
