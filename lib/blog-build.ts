import { readFile } from "node:fs/promises"

import { getBlogArticles, BLOG_API_MAX_RESPONSE_BYTES } from "./blog-api"
import { blogFeedSchema, type Article } from "./blog-schema"

let articles: Promise<Article[]> | undefined

export function getPublishedBlogArticles(): Promise<Article[]> {
  articles ??= (async () => {
    const snapshot = process.env.BUXDEV_BLOG_SNAPSHOT
    if (!snapshot && process.env.NODE_ENV === "production") {
      throw new Error("Blog build requires a validated snapshot. Run npm run build.")
    }
    let result: Article[]
    if (snapshot) {
      const body = await readFile(snapshot)
      if (body.byteLength > BLOG_API_MAX_RESPONSE_BYTES) throw new Error("Blog snapshot is too large.")
      const parsed = blogFeedSchema.safeParse(JSON.parse(body.toString("utf8")))
      if (!parsed.success) throw new Error("Blog snapshot contract is invalid.")
      result = parsed.data.articles
    } else {
      result = await getBlogArticles("es")
    }
    if (!result.length || result.some(article => article.locale !== "es")) {
      throw new Error("Blog requires published Spanish articles.")
    }
    if (result.some(article => Date.parse(article.publishedAt) > Date.now() || Date.parse(article.updatedAt) > Date.now())) {
      throw new Error("Blog contains future publication dates.")
    }
    return result.toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug))
  })()
  return articles
}
