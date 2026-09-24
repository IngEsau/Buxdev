import type { MetadataRoute } from "next"

import { absoluteUrl, INDEXABLE_PATHS } from "@/lib/seo"
import { getPublishedBlogArticles } from "@/lib/blog-build"

export const dynamic = "force-static"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedBlogArticles()
  return [...INDEXABLE_PATHS.map((path) => ({
    url: absoluteUrl(path),
  })), { url: absoluteUrl("/blog/") }, ...articles.map(article => ({
    url: absoluteUrl(`/blog/${article.slug}/`),
    lastModified: article.updatedAt,
  }))]
}
