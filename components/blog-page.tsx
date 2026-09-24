"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"

import { useLanguage } from "@/hooks/use-language"
import type { Article } from "@/lib/blog-schema"
import styles from "./blog-page.module.css"

export type ArticleSummary = Omit<Article, "content">

function ArticleDate({ value, locale }: { value: string; locale: Article["locale"] }) {
  return <time dateTime={value}>{new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(value))}</time>
}

export function BlogListing({ articles }: { articles: ArticleSummary[] }) {
  const { t, language } = useLanguage()
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>BUXDEV / Blog</p>
          <h1>{t.blog.title}</h1>
          <p className={styles.description}>{t.blog.description}</p>
          <p className={styles.languageNote}>{t.blog.spanishContent}</p>
        </header>
        <div className={styles.list}>
          {articles.map(article => (
            <article key={article.id} className={styles.entry} lang={article.locale}>
              <p className={styles.meta}><ArticleDate value={article.publishedAt} locale={article.locale} /> · {article.author.name}</p>
              <h2><Link href={`/blog/${article.slug}/`}>{article.title}</Link></h2>
              <p>{article.excerpt}</p>
              <Link href={`/blog/${article.slug}/`} className={styles.link} lang={language}>
                {t.blog.readArticle}<ArrowUpRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export function BlogArticle({ article, children }: { article: ArticleSummary; children: ReactNode }) {
  const { t, language } = useLanguage()
  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.inner}>
        <Link href="/blog/" className={styles.back}>{t.blog.back}</Link>
        <article lang={article.locale}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>BUXDEV / Blog</p>
            <h1>{article.title}</h1>
            <p className={styles.description}>{article.excerpt}</p>
            <div className={styles.meta}>
              <span>{article.author.name}</span>
              <span><span lang={language}>{t.blog.published}</span> <ArticleDate value={article.publishedAt} locale={article.locale} /></span>
              {article.updatedAt !== article.publishedAt && <span><span lang={language}>{t.blog.updated}</span> <ArticleDate value={article.updatedAt} locale={article.locale} /></span>}
            </div>
            <p className={styles.languageNote} lang={language}>{t.blog.spanishContent}</p>
          </header>
          <div className={styles.body}>{children}</div>
        </article>
        <div className={styles.end}><Link href="/blog/" className={styles.link}>{t.blog.back}<ArrowUpRight aria-hidden="true" /></Link></div>
      </div>
    </main>
  )
}
