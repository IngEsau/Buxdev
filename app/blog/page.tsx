import { BlogListing } from "@/components/blog-page"
import { getPublishedBlogArticles } from "@/lib/blog-build"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Blog técnico",
  description: "Casos reales y aprendizajes de BUXDEV sobre desarrollo de software y ciberseguridad.",
  path: "/blog/",
})

export default async function BlogPage() {
  const articles = await getPublishedBlogArticles()
  const summaries = articles.map(({ id, locale, slug, title, excerpt, author, publishedAt, updatedAt }) => ({
    id, locale, slug, title, excerpt, author, publishedAt, updatedAt,
  }))
  return <BlogListing articles={summaries} />
}
