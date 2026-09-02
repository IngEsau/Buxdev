import type { Metadata } from "next"

export const SITE_NAME = "BUXDEV"
export const SITE_ORIGIN = "https://buxdev.com"
export const SITE_URL = new URL(SITE_ORIGIN)
export const HOME_TITLE = "Desarrollo de Software Multiplataforma"
export const SITE_TITLE = `${HOME_TITLE} | ${SITE_NAME}`
export const SITE_DESCRIPTION =
  "Diseñamos y desarrollamos páginas web, tiendas en línea y aplicaciones multiplataforma para impulsar negocios e ideas."

export const INDEXABLE_PATHS = ["/", "/about/", "/services/", "/contact/"] as const

export const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
}

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
}

interface PageMetadataOptions {
  title: string
  description: string
  path: string
  index?: boolean
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path)
  const socialTitle = `${title} | ${SITE_NAME}`

  return {
    title: {
      absolute: socialTitle,
    },
    description,
    alternates: {
      canonical,
    },
    robots: index ? INDEX_ROBOTS : NOINDEX_ROBOTS,
    openGraph: {
      type: "website",
      locale: "es_MX",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  }
}

const organizationId = `${SITE_ORIGIN}/#organization`
const websiteId = `${SITE_ORIGIN}/#website`

export const homepageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
      logo: absoluteUrl("/brand/buxdev/logo-on-light.svg"),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
      description: SITE_DESCRIPTION,
      inLanguage: "es-MX",
      publisher: {
        "@id": organizationId,
      },
    },
  ],
} satisfies Record<string, unknown>
