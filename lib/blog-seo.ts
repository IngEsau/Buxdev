import type { Metadata } from "next"

import type { Article } from "./blog-schema"
import { absoluteUrl, createPageMetadata, SITE_NAME, SOCIAL_IMAGE } from "./seo"

export function articlePath(slug: string) {
  return `/blog/${slug}/`
}

export function articleMetadata(article: Article): Metadata {
  const metadata = createPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: articlePath(article.slug),
  })
  return {
    ...metadata,
    authors: [{ name: article.author.name }],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      locale: article.locale === "es" ? "es_MX" : "en_US",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
    },
  }
}

export function articleStructuredData(article: Article) {
  const url = absoluteUrl(articlePath(article.slug))
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.excerpt,
    inLanguage: article.locale,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": article.author.name === SITE_NAME ? "Organization" : "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/buxdev/logo-on-light.svg") },
    },
    image: SOCIAL_IMAGE.url,
  }
}

export function serializeBlogJsonLd(article: Article) {
  return JSON.stringify(articleStructuredData(article))
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}
