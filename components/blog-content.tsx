import Link from "next/link"

import type { ArticleBlock, InlineContent } from "@/lib/blog-schema"

function Inline({ content }: { content: InlineContent[] }) {
  return content.map((item, index) => {
    if (item.type === "text") return <span key={index}>{item.value}</span>
    if (item.href.startsWith("/")) return <Link key={index} href={item.href}>{item.text}</Link>
    return <a key={index} href={item.href} rel="noopener noreferrer">{item.text}</a>
  })
}

export function BlogContent({ blocks }: { blocks: ArticleBlock[] }) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading": {
        const Heading = block.level === 2 ? "h2" : "h3"
        return <Heading key={index} id={`article-${block.id}`}>{block.text}</Heading>
      }
      case "paragraph":
        return <p key={index}><Inline content={block.content} /></p>
      case "quote":
        return <blockquote key={index}><p><Inline content={block.content} /></p></blockquote>
      case "list": {
        const List = block.ordered ? "ol" : "ul"
        return <List key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><Inline content={item} /></li>)}</List>
      }
      case "code":
        return <pre key={index} tabIndex={0} aria-label={block.language ? `Código: ${block.language}` : "Código"}><code>{block.code}</code></pre>
    }
  })
}
