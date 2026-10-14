"use client"

import Link from "next/link"
import { ArrowDown, ArrowUpRight } from "iconoir-react"
import { useRef } from "react"

import { useLanguage } from "@/hooks/use-language"
import { useServicesScroll } from "@/hooks/use-services-scroll"
import { AutomationVisual, FullstackVisual, SecurityVisual, UXUIVisual } from "./services-visuals"
import styles from "./services-experience.module.css"

const chapters = [
  { id: "fullstack", Visual: FullstackVisual, phases: ["FOUNDATION", "LAYERS", "CONNECTIONS", "SYSTEM"], href: "/work/valeria-herrera/" },
  { id: "design", Visual: UXUIVisual, phases: ["STRUCTURE", "WIREFRAME", "SYSTEM", "INTERFACE"], href: "/work/valeria-herrera/" },
  { id: "security", Visual: SecurityVisual, phases: ["DETECT", "TRACE", "ISOLATE", "HARDEN"], href: "https://github.com/IngEsau/wp-xmlrpc-attack-analysis", external: true },
  { id: "automation", Visual: AutomationVisual, phases: ["EVENT", "QUEUE", "ORCHESTRATE", "AUDIT"], href: "/contact/" },
] as const

export function ServicesExperience() {
  const { t, language } = useLanguage()
  const root = useRef<HTMLDivElement>(null)
  useServicesScroll(root, language)

  return (
    <div ref={root} className={styles.experience}>
      {chapters.map((chapter, index) => {
        const service = t.servicesPage.items[index]
        const ampersand = service.title.indexOf(" & ")
        const split = ampersand > 0 ? ampersand + 2 : service.title.indexOf(" ")
        const { Visual } = chapter
        const linkContent = <><span>{service.cta}</span><ArrowUpRight aria-hidden="true" /></>

        return (
          <article key={chapter.id} id={`service-${chapter.id}`} className={styles.scene}
            data-scroll-scene data-kind={chapter.id} data-stage="3" aria-labelledby={`service-${chapter.id}-title`}>
            <div className={styles.stage} data-scene-stage>
              <div className={styles.sceneGrid} aria-hidden="true" />
              <div className={styles.chapterMeta}>
                <span>{String(index + 1).padStart(2, "0")} <i aria-hidden="true" /> {t.common.service}</span>
                <span aria-hidden="true">BUXDEV / CONCEPTUAL</span>
              </div>

              <div className={styles.composition}>
                <div className={styles.copy}>
                  <h3 id={`service-${chapter.id}-title`}>
                    {split > 0 ? <>
                      <span>{service.title.slice(0, split)}</span>{" "}
                      <span className={styles.titleTail} data-long={service.title.slice(split + 1).length > 10}>{service.title.slice(split + 1)}</span>
                    </> : service.title}
                  </h3>
                  <p className={styles.descriptor} data-range="0.08,0.32">{service.description}</p>
                  <div className={styles.ctaReveal} data-range="0.74,0.9" data-scene-cta>
                    {"external" in chapter ? (
                      <a href={chapter.href} className={styles.cta} target="_blank" rel="noopener noreferrer">{linkContent}</a>
                    ) : (
                      <Link href={chapter.href} className={styles.cta}>{linkContent}</Link>
                    )}
                  </div>
                </div>

                <div className={styles.art} aria-hidden="true">
                  <Visual compact={false} />
                  <Visual compact />
                </div>
              </div>

              <div className={styles.sceneFooter} aria-hidden="true">
                <ol className={styles.phases}>
                  {chapter.phases.map(phase => <li key={phase}>{phase}</li>)}
                </ol>
                <span className={styles.conceptLabel}>CONCEPTUAL / {String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true"><span /></div>
              {index < chapters.length - 1 ? (
                <div className={styles.handoff} aria-hidden="true">
                  <span>{t.servicesPage.items[index + 1].title}</span><ArrowDown />
                </div>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
