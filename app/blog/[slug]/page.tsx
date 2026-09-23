import { notFound } from "next/navigation"

import { BlogContent } from "@/components/blog-content"
import { BlogArticle } from "@/components/blog-page"
import { getPublishedBlogArticles } from "@/lib/blog-build"
import { articleMetadata, serializeBlogJsonLd } from "@/lib/blog-seo"

export const dynamicParams = false

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedBlogArticles()).map(article => ({ slug: article.slug }))
}

async function findArticle(slug: string) {
  const article = (await getPublishedBlogArticles()).find(article => article.slug === slug)
  if (!article) notFound()
  return article
}

export async function generateMetadata({ params }: Props) {
  return articleMetadata(await findArticle((await params).slug))
}

export default async function ArticlePage({ params }: Props) {
  const article = await findArticle((await params).slug)
  const { content, ...summary } = article
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeBlogJsonLd(article) }} />
      <BlogArticle article={summary}><BlogContent blocks={content} /></BlogArticle>
    </>
  )
}
