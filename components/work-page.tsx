"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "iconoir-react"

import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"
import type { TranslationKey } from "@/lib/i18n"

import styles from "./work-page.module.css"

type ProjectId = keyof TranslationKey["portfolio"]["projects"]
type ProjectCover =
  | { kind: "pair"; desktop: string; mobile: string }
  | { kind: "mobile" | "desktop"; src: string }

type WorkProject = {
  id: ProjectId
  cover?: ProjectCover
  caseHref?: string
  repositoryUrl?: string
  publicUrl?: string
  referenceUrl?: string
}

const workProjects: readonly WorkProject[] = [
  {
    id: "valeriaHerrera",
    cover: { kind: "pair", desktop: "/work/valeria-herrera/desktop.webp", mobile: "/work/valeria-herrera/mobile.webp" },
    caseHref: "/work/valeria-herrera/",
  },
  {
    id: "sociogramaUtp",
    cover: { kind: "pair", desktop: "/work/sociograma-utp/admin-panel.webp", mobile: "/work/sociograma-utp/public-login-mobile.webp" },
    caseHref: "/work/sociograma-utp/",
  },
  {
    id: "bandasAsesoria",
    cover: { kind: "pair", desktop: "/work/bandas-asesoria/desktop.webp", mobile: "/work/bandas-asesoria/mobile.webp" },
  },
  {
    id: "montblanMobile",
    cover: { kind: "mobile", src: "/work/montblan-mobile/login.webp" },
    caseHref: "/work/montblan-mobile/",
    repositoryUrl: "https://github.com/IngEsau/montblan-mobile",
  },
  {
    id: "jillSoftware",
    cover: { kind: "pair", desktop: "/work/jill-software/current-desktop.webp", mobile: "/work/jill-software/current-mobile.webp" },
    referenceUrl: "https://jillsoftware.com.mx/",
  },
  {
    id: "backstabber",
    caseHref: "/work/backstabber-toolkit/",
    repositoryUrl: "https://github.com/IngEsau/Backstabber",
  },
  {
    id: "wordpressIncidentResponse",
    cover: { kind: "pair", desktop: "/work/wordpress-incident-response/desktop.webp", mobile: "/work/wordpress-incident-response/mobile.webp" },
    repositoryUrl: "https://github.com/IngEsau/wp-xmlrpc-attack-analysis",
  },
  {
    id: "portfolio",
    cover: { kind: "pair", desktop: "/work/portfolio/desktop.webp", mobile: "/work/portfolio/mobile.webp" },
    publicUrl: "https://portfolio.buxdev.com/",
  },
]

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
            const cover = project.cover
            const status = "status" in projectCopy ? projectCopy.status : undefined
            const attribution = "attribution" in projectCopy ? projectCopy.attribution : undefined

            return (
              <article key={project.id} className={`${styles.projectCard} ${!cover ? styles.projectCardTextOnly : ""}`}>
                {cover ? (
                  <div className={`${styles.projectCover} ${cover.kind === "desktop" ? styles.projectCoverDesktopOnly : ""} ${cover.kind === "mobile" ? styles.projectCoverMobileOnly : ""} ${project.id === "sociogramaUtp" || project.id === "jillSoftware" ? styles.projectCoverDesktopRatio : ""} ${project.id === "jillSoftware" ? styles.projectCoverJill : ""}`}>
                    {cover.kind === "pair" || cover.kind === "desktop" ? (
                      <div className={styles.desktopFrame}>
                        <Image
                          src={cover.kind === "pair" ? cover.desktop : cover.src}
                          alt={"desktopAlt" in projectCopy ? projectCopy.desktopAlt : projectCopy.title}
                          width={cover.kind === "pair" ? 1600 : 1440}
                          height={cover.kind === "pair" ? 834 : 900}
                          sizes="(max-width: 48rem) 78vw, (max-width: 80rem) 39vw, 30rem"
                        />
                      </div>
                    ) : null}
                    {cover.kind === "pair" ? (
                      <div className={styles.mobileFrame}>
                        <Image src={cover.mobile} alt={"mobileAlt" in projectCopy ? projectCopy.mobileAlt : projectCopy.title} width={408} height={901} sizes="(max-width: 48rem) 20vw, 7rem" />
                      </div>
                    ) : cover.kind === "mobile" ? (
                      <div className={styles.mobileOnlyFrame}>
                        <Image src={cover.src} alt={"mobileAlt" in projectCopy ? projectCopy.mobileAlt : projectCopy.title} width={393} height={869} sizes="(max-width: 48rem) 35vw, 14rem" />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.projectBody}>
                  <div className={styles.projectMeta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <ul aria-label={t.portfolio.categoriesLabel}>
                      {projectCopy.categories.map((category) => <li key={category}>{category}</li>)}
                    </ul>
                  </div>

                  {status ? <p className={styles.projectStatus}>{status}</p> : null}
                  <h3>{projectCopy.title}</h3>
                  <p>{projectCopy.description}</p>
                  {attribution ? <p className={styles.projectAttribution}>{attribution}</p> : null}

                  <div className={styles.projectActions}>
                    {project.caseHref ? (
                      <Link href={project.caseHref} className={styles.projectLink}>
                        <span>{t.portfolio.actions.viewCaseStudy}</span><ArrowUpRight aria-hidden="true" />
                      </Link>
                    ) : null}
                    {project.repositoryUrl ? (
                      <a href={project.repositoryUrl} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                        <span>{t.portfolio.actions.viewRepository}</span><ArrowUpRight aria-hidden="true" />
                      </a>
                    ) : null}
                    {project.publicUrl ? (
                      <a href={project.publicUrl} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                        <span>{t.portfolio.actions.visitProject}</span><ArrowUpRight aria-hidden="true" />
                      </a>
                    ) : null}
                    {project.referenceUrl ? (
                      <a href={project.referenceUrl} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                        <span>{t.portfolio.actions.viewCurrentSite}</span><ArrowUpRight aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </MotionReveal>
    </section>
  )
}
