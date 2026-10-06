"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "iconoir-react"
import { Fragment } from "react"

import { useLanguage } from "@/hooks/use-language"
import type { TranslationKey } from "@/lib/i18n"

import styles from "./work-page.module.css"

type ProjectId = keyof TranslationKey["portfolio"]["projects"]
type ProjectCover =
  | { kind: "pair"; desktop: string; mobile: string; desktopSize?: readonly [number, number]; mobileSize?: readonly [number, number] }
  | { kind: "screenshotLogo"; screenshot: string; logo: string; screenshotSize: readonly [number, number]; logoSize: readonly [number, number] }
  | { kind: "mobile" | "desktop" | "logo"; src: string; size?: readonly [number, number] }

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
    publicUrl: "https://valeriaherrera.buxdev.com/",
  },
  {
    id: "sociogramaUtp",
    cover: { kind: "pair", desktop: "/work/sociograma-utp/public-login.webp", mobile: "/work/sociograma-utp/public-login-mobile.webp", desktopSize: [1440, 900], mobileSize: [430, 830] },
    caseHref: "/work/sociograma-utp/",
  },
  {
    id: "bandasAsesoria",
    cover: { kind: "pair", desktop: "/work/bandas-asesoria/desktop.webp", mobile: "/work/bandas-asesoria/mobile.webp" },
    caseHref: "/work/bandas-asesoria/",
    publicUrl: "https://bandasyasesoria.com.mx/",
  },
  {
    id: "poetsFlowers",
    cover: { kind: "pair", desktop: "/work/poets-flowers/desktop.webp", mobile: "/work/poets-flowers/mobile.webp", desktopSize: [1600, 1000], mobileSize: [780, 1688] },
    caseHref: "/work/poets-flowers/",
    publicUrl: "https://poetsflowers.buxdev.com/",
    repositoryUrl: "https://github.com/IngEsau/poets-flowers",
  },
  {
    id: "jillSoftware",
    cover: { kind: "pair", desktop: "/work/jill-software/current-desktop.webp", mobile: "/work/jill-software/current-mobile.webp", desktopSize: [1440, 900], mobileSize: [430, 900] },
    caseHref: "/work/jill-software/",
    referenceUrl: "https://jillsoftware.com.mx/",
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
  {
    id: "backstabber",
    cover: { kind: "screenshotLogo", screenshot: "/work/backstabber-toolkit/overview.webp", logo: "/work/backstabber-toolkit/logo.webp", screenshotSize: [1852, 950], logoSize: [640, 640] },
    caseHref: "/work/backstabber-toolkit/",
    repositoryUrl: "https://github.com/IngEsau/Backstabber",
  },
  {
    id: "montblanMobile",
    cover: { kind: "mobile", src: "/work/montblan-mobile/login.webp" },
    caseHref: "/work/montblan-mobile/",
    repositoryUrl: "https://github.com/IngEsau/montblan-mobile",
  },
]

export function WorkPageContent() {
  const { t } = useLanguage()

  return (
    <section className={styles.work} aria-labelledby="work-state-title">
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
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
            const titleHref = project.caseHref ?? project.publicUrl ?? project.repositoryUrl ?? project.referenceUrl

            const card = (
              <article className={`${styles.projectCard} ${!cover ? styles.projectCardTextOnly : ""}`}>
                {cover ? (
                  <div className={`${styles.projectCover} ${cover.kind === "desktop" ? styles.projectCoverDesktopOnly : ""} ${cover.kind === "mobile" ? styles.projectCoverMobileOnly : ""} ${cover.kind === "logo" ? styles.projectCoverLogo : ""} ${project.id === "sociogramaUtp" || project.id === "jillSoftware" || project.id === "poetsFlowers" ? styles.projectCoverDesktopRatio : ""} ${project.id === "jillSoftware" ? styles.projectCoverJill : ""} ${project.id === "poetsFlowers" ? styles.projectCoverPoets : ""}`}>
                    {cover.kind === "pair" || cover.kind === "desktop" || cover.kind === "screenshotLogo" ? (
                      <div className={styles.desktopFrame}>
                        <Image src={cover.kind === "pair" ? cover.desktop : cover.kind === "screenshotLogo" ? cover.screenshot : cover.src}
                          alt={"desktopAlt" in projectCopy ? projectCopy.desktopAlt : projectCopy.title}
                          width={cover.kind === "pair" ? (cover.desktopSize?.[0] ?? 1600) : cover.kind === "screenshotLogo" ? cover.screenshotSize[0] : (cover.size?.[0] ?? 1440)}
                          height={cover.kind === "pair" ? (cover.desktopSize?.[1] ?? 834) : cover.kind === "screenshotLogo" ? cover.screenshotSize[1] : (cover.size?.[1] ?? 900)}
                          sizes="(max-width: 48rem) 78vw, (max-width: 80rem) 39vw, 30rem" />
                      </div>
                    ) : null}
                    {cover.kind === "pair" ? (
                      <div className={styles.mobileFrame}>
                        <Image src={cover.mobile} alt={"mobileAlt" in projectCopy ? projectCopy.mobileAlt : projectCopy.title}
                          width={cover.mobileSize?.[0] ?? 408} height={cover.mobileSize?.[1] ?? 901} sizes="(max-width: 48rem) 20vw, 7rem" />
                      </div>
                    ) : cover.kind === "mobile" ? (
                      <div className={styles.mobileOnlyFrame}>
                        <Image src={cover.src} alt={"mobileAlt" in projectCopy ? projectCopy.mobileAlt : projectCopy.title}
                          width={cover.size?.[0] ?? 393} height={cover.size?.[1] ?? 869} sizes="(max-width: 48rem) 35vw, 14rem" />
                      </div>
                    ) : cover.kind === "logo" || cover.kind === "screenshotLogo" ? (
                      <div className={cover.kind === "screenshotLogo" ? styles.logoOverlay : styles.logoFrame}>
                        <Image src={cover.kind === "screenshotLogo" ? cover.logo : cover.src} alt={"logoAlt" in projectCopy ? projectCopy.logoAlt : projectCopy.title}
                          width={cover.kind === "screenshotLogo" ? cover.logoSize[0] : (cover.size?.[0] ?? 640)}
                          height={cover.kind === "screenshotLogo" ? cover.logoSize[1] : (cover.size?.[1] ?? 640)} sizes="(max-width: 48rem) 25vw, 8rem" />
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
                  <h3>{titleHref ? project.caseHref ? (
                    <Link href={titleHref} className={styles.projectTitleLink}>{projectCopy.title}</Link>
                  ) : (
                    <a href={titleHref} className={styles.projectTitleLink} target="_blank" rel="noopener noreferrer">{projectCopy.title}</a>
                  ) : projectCopy.title}</h3>
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
                        <span>{project.id === "valeriaHerrera" ? t.portfolio.actions.viewLiveSite : t.portfolio.actions.visitProject}</span><ArrowUpRight aria-hidden="true" />
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
            return project.id === "montblanMobile" ? (
              <section key={project.id} className={styles.mobileAppsSection} aria-labelledby="mobile-apps-title">
                <h3 id="mobile-apps-title">{t.portfolio.mobileAppsTitle}</h3>
                <div className={styles.projectGrid}>{card}</div>
              </section>
            ) : <Fragment key={project.id}>{card}</Fragment>
          })}
        </div>
      </div>
    </section>
  )
}
