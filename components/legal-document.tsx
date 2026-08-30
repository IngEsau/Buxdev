import type { ReactNode } from "react"
import { readFileSync } from "node:fs"
import path from "node:path"

import { LegalLanguageNotice } from "@/components/legal-language-notice"

import styles from "./legal-document.module.css"

type LegalSource = "BUXDEV_Aviso_de_Privacidad.md" | "BUXDEV_Terminos_y_Condiciones.md"

interface LegalDocumentProps {
  source: LegalSource
  title: string
}

type LegalBlock =
  | { type: "heading"; content: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "separator" }

const noteMarker = "Nota de implementación (NO PUBLICAR EN EL SITIO)"
const inlinePattern = /(\*\*[^*]+\*\*|https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g

function renderInline(content: string, keyPrefix: string): ReactNode[] {
  return content.split(inlinePattern).filter(Boolean).map((token, index) => {
    const key = `${keyPrefix}-${index}`

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={key}>{renderInline(token.slice(2, -2), `${key}-strong`)}</strong>
    }

    if (token.startsWith("http://") || token.startsWith("https://")) {
      return (
        <a key={key} href={token}>
          {token}
        </a>
      )
    }

    if (token.includes("@")) {
      return (
        <a key={key} href={`mailto:${token}`}>
          {token}
        </a>
      )
    }

    return token
  })
}

function renderParagraph(lines: string[], keyPrefix: string) {
  return lines.map((line, index) => {
    const hasHardBreak = line.endsWith("  ")

    return (
      <span key={`${keyPrefix}-${index}`}>
        {renderInline(line.trimEnd(), `${keyPrefix}-${index}-inline`)}
        {index < lines.length - 1 && (hasHardBreak ? <br /> : " ")}
      </span>
    )
  })
}

function parseBlocks(lines: string[]): LegalBlock[] {
  const blocks: LegalBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", content: line.slice(3).trim() })
      index += 1
      continue
    }

    if (line.trim() === "---") {
      blocks.push({ type: "separator" })
      index += 1
      continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2).trim())
        index += 1
      }
      blocks.push({ type: "unordered-list", items })
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s/, "").trim())
        index += 1
      }
      blocks.push({ type: "ordered-list", items })
      continue
    }

    const paragraphLines: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("## ") &&
      !lines[index].startsWith("- ") &&
      !/^\d+\.\s/.test(lines[index]) &&
      lines[index].trim() !== "---"
    ) {
      paragraphLines.push(lines[index])
      index += 1
    }
    blocks.push({ type: "paragraph", lines: paragraphLines })
  }

  return blocks
}

function readLegalSource(source: LegalSource) {
  const sourcePath = path.join(process.cwd(), "legal", source)
  const lines = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n").split("\n")
  const noteIndex = lines.findIndex((line) => line.includes(noteMarker))
  const publicLines = (noteIndex >= 0 ? lines.slice(0, noteIndex) : lines).slice()

  while (!publicLines.at(-1)?.trim() || publicLines.at(-1)?.trim() === "---") {
    publicLines.pop()
  }

  const titleIndex = publicLines.findIndex((line) => line.startsWith("# "))
  const sourceTitle = titleIndex >= 0 ? publicLines[titleIndex].slice(2).trim() : ""
  const updateIndex = publicLines.findIndex((line, index) => index > titleIndex && line.trim())
  const updateLine = updateIndex >= 0 ? publicLines[updateIndex] : ""
  const contentLines = publicLines.slice(updateIndex + 1)

  return {
    sourceTitle,
    updateLine,
    blocks: parseBlocks(contentLines),
  }
}

export function LegalDocument({ source, title }: LegalDocumentProps) {
  const document = readLegalSource(source)

  return (
    <section className={styles.page} aria-labelledby="legal-page-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Legal
          </p>
          <h1 id="legal-page-title">{title}</h1>
          <p className={styles.sourceTitle}>{document.sourceTitle}</p>
          <p className={styles.updated}>{renderInline(document.updateLine, "updated")}</p>
          <LegalLanguageNotice />
        </header>

        <article className={styles.document} lang="es" aria-labelledby="legal-page-title">
          {document.blocks.map((block, index) => {
            const key = `${block.type}-${index}`

            if (block.type === "heading") {
              return <h2 key={key}>{renderInline(block.content, key)}</h2>
            }

            if (block.type === "paragraph") {
              return <p key={key}>{renderParagraph(block.lines, key)}</p>
            }

            if (block.type === "unordered-list") {
              return (
                <ul key={key}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                  ))}
                </ul>
              )
            }

            if (block.type === "ordered-list") {
              return (
                <ol key={key}>
                  {block.items.map((item, itemIndex) => (
                    <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                  ))}
                </ol>
              )
            }

            return <hr key={key} />
          })}
        </article>
      </div>
    </section>
  )
}
