"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./work-page.module.css"

const workProjects = [
  {
    id: "valeriaHerrera",
    desktop: "/work/valeria-herrera/desktop.webp",
    mobile: "/work/valeria-herrera/mobile.webp",
    href: "/work/valeria-herrera/",
    action: "viewCaseStudy",
    external: false,
  },
  {
    id: "bandasAsesoria",
    desktop: "/work/bandas-asesoria/desktop.webp",
    mobile: "/work/bandas-asesoria/mobile.webp",
    href: null,
    action: null,
    external: false,
  },
  {
    id: "wordpressIncidentResponse",
    desktop: "/work/wordpress-incident-response/desktop.webp",
    mobile: "/work/wordpress-incident-response/mobile.webp",
    href: "https://github.com/IngEsau/wp-xmlrpc-attack-analysis",
    action: "viewRepository",
    external: true,
  },
  {
    id: "portfolio",
    desktop: "/work/portfolio/desktop.webp",
    mobile: "/work/portfolio/mobile.webp",
    href: "https://portfolio.buxdev.com/",
    action: "visitProject",
    external: true,
  },
] as const

export function WorkPageContent() {
  const { t } = useLanguage()

  return (
    <section className={styles.work} aria-labelledby="work-state-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <MotionReveal className={styles.inner}>
        <div className={styles.copy}>
          <div>
            <p className={styles.eyebrow}>{t.portfolio.stateLabel}</p>
            <h2 id="work-state-title">{t.portfolio.stateTitle}</h2>
          </div>
          <p>{t.portfolio.stateDescription}</p>
        </div>

        <div className={styles.projectGrid}>
          {workProjects.map((project, index) => {
            const projectCopy = t.portfolio.projects[project.id]

            return (
              <article key={project.id} className={styles.projectCard}>
                <div className={styles.projectCover}>
                  <div className={styles.desktopFrame}>
                    <Image
                      src={project.desktop}
                      alt={projectCopy.desktopAlt}
                      width={1600}
                      height={834}
                      sizes="(max-width: 48rem) 78vw, (max-width: 80rem) 39vw, 30rem"
                    />
                  </div>
                  <div className={styles.mobileFrame}>
                    <Image
                      src={project.mobile}
                      alt={projectCopy.mobileAlt}
                      width={408}
                      height={901}
                      sizes="(max-width: 48rem) 20vw, 7rem"
                    />
                  </div>
                </div>

                <div className={styles.projectBody}>
                  <div className={styles.projectMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <ul aria-label={t.portfolio.categoriesLabel}>
                      {projectCopy.categories.map((category) => (
                        <li key={category}>{category}</li>
                      ))}
                    </ul>
                  </div>

                  <h3>{projectCopy.title}</h3>
                  <p>{projectCopy.description}</p>

                  {project.href && project.action && project.external ? (
                    <a
                      href={project.href}
                      className={styles.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{t.portfolio.actions[project.action]}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : project.href && project.action ? (
                    <Link href={project.href} className={styles.projectLink}>
                      <span>{t.portfolio.actions[project.action]}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </MotionReveal>
    </section>
  )
}
