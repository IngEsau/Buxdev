import type { Metadata } from "next"

import { NotFoundPage } from "@/components/not-found-page"
import { SITE_NAME } from "@/lib/seo"

const notFoundTitle = "Página no encontrada | " + SITE_NAME
const notFoundDescription =
  "La página solicitada no existe. Regresa al inicio de BUXDEV o utiliza la navegación del sitio."

export const metadata: Metadata = {
  title: {
    absolute: notFoundTitle,
  },
  description: notFoundDescription,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE_NAME,
    title: notFoundTitle,
    description: notFoundDescription,
  },
  twitter: {
    card: "summary",
    title: notFoundTitle,
    description: notFoundDescription,
  },
  // Next adds noindex to not-found responses. Omitting robots avoids a duplicate tag; follow remains the default.
}

export default function NotFound() {
  return <NotFoundPage />
}
