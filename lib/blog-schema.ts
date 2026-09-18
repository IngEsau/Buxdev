import { z } from "zod"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CODE_LANGUAGE_PATTERN = /^[a-z0-9][a-z0-9+#.-]*$/i

export const BLOG_LIMITS = {
  articles: 200,
  articleBlocks: 250,
  inlineItems: 64,
  listItems: 50,
  id: 128,
  slug: 100,
  title: 160,
  excerpt: 500,
  authorName: 100,
  heading: 240,
  inlineText: 5_000,
  code: 50_000,
  codeLanguage: 32,
  url: 2_048,
} as const

const nonBlankString = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .refine((value) => value.trim().length > 0, "Must not be blank")

const identifierSchema = z.string().trim().min(1).max(BLOG_LIMITS.id)

export const blogLocaleSchema = z.enum(["es", "en"])

export const slugSchema = z
  .string()
  .min(1)
  .max(BLOG_LIMITS.slug)
  .regex(SLUG_PATTERN, "Invalid slug")

export const isoDateSchema = z.string().datetime({ offset: true })

function isAllowedLink(value: string) {
  if (value.startsWith("/")) {
    return (
      !value.startsWith("//") &&
      !value.includes("\\") &&
      !/[\u0000-\u001f\u007f\s]/.test(value)
    )
  }

  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.username === "" && url.password === ""
  } catch {
    return false
  }
}

export const articleLinkSchema = z
  .string()
  .min(1)
  .max(BLOG_LIMITS.url)
  .refine(isAllowedLink, "Links must use HTTPS or an internal absolute path")

const textInlineSchema = z
  .object({
    type: z.literal("text"),
    value: nonBlankString(BLOG_LIMITS.inlineText),
  })
  .strict()

const linkInlineSchema = z
  .object({
    type: z.literal("link"),
    text: nonBlankString(BLOG_LIMITS.inlineText),
    href: articleLinkSchema,
  })
  .strict()

export const inlineContentSchema = z.discriminatedUnion("type", [
  textInlineSchema,
  linkInlineSchema,
])

const inlineContentListSchema = z
  .array(inlineContentSchema)
  .min(1)
  .max(BLOG_LIMITS.inlineItems)

const headingBlockSchema = z
  .object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    id: slugSchema,
    text: nonBlankString(BLOG_LIMITS.heading),
  })
  .strict()

const paragraphBlockSchema = z
  .object({
    type: z.literal("paragraph"),
    content: inlineContentListSchema,
  })
  .strict()

const listBlockSchema = z
  .object({
    type: z.literal("list"),
    ordered: z.boolean(),
    items: z.array(inlineContentListSchema).min(1).max(BLOG_LIMITS.listItems),
  })
  .strict()

const codeBlockSchema = z
  .object({
    type: z.literal("code"),
    code: nonBlankString(BLOG_LIMITS.code),
    language: z
      .string()
      .min(1)
      .max(BLOG_LIMITS.codeLanguage)
      .regex(CODE_LANGUAGE_PATTERN, "Invalid code language")
      .optional(),
  })
  .strict()

const quoteBlockSchema = z
  .object({
    type: z.literal("quote"),
    content: inlineContentListSchema,
  })
  .strict()

export const articleBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  listBlockSchema,
  codeBlockSchema,
  quoteBlockSchema,
])

export const articleSchema = z
  .object({
    id: identifierSchema,
    locale: blogLocaleSchema,
    slug: slugSchema,
    title: nonBlankString(BLOG_LIMITS.title),
    excerpt: nonBlankString(BLOG_LIMITS.excerpt),
    author: z
      .object({
        name: nonBlankString(BLOG_LIMITS.authorName),
      })
      .strict(),
    content: z.array(articleBlockSchema).min(1).max(BLOG_LIMITS.articleBlocks),
    publishedAt: isoDateSchema,
    updatedAt: isoDateSchema,
  })
  .strict()
  .superRefine((article, context) => {
    if (Date.parse(article.updatedAt) < Date.parse(article.publishedAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updatedAt"],
        message: "updatedAt must not precede publishedAt",
      })
    }

    const headingIds = new Set<string>()
    article.content.forEach((block, index) => {
      if (block.type !== "heading") return
      if (headingIds.has(block.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content", index, "id"],
          message: "Heading IDs must be unique within an article",
        })
      }
      headingIds.add(block.id)
    })
  })

export const blogFeedSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: isoDateSchema,
    articles: z.array(articleSchema).max(BLOG_LIMITS.articles),
  })
  .strict()
  .superRefine((feed, context) => {
    const slugs = new Set<string>()

    feed.articles.forEach((article, index) => {
      const localizedSlug = `${article.locale}:${article.slug}`
      if (slugs.has(localizedSlug)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["articles", index, "slug"],
          message: "Slugs must be unique per locale",
        })
      }
      slugs.add(localizedSlug)
    })
  })

export type BlogLocale = z.infer<typeof blogLocaleSchema>
export type InlineContent = z.infer<typeof inlineContentSchema>
export type ArticleBlock = z.infer<typeof articleBlockSchema>
export type Article = z.infer<typeof articleSchema>
export type BlogFeed = z.infer<typeof blogFeedSchema>
