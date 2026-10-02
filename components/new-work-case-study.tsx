"use client"

import { CaseStudyPage } from "@/components/case-study-page"
import { useLanguage } from "@/hooks/use-language"

type Project = "montblanMobile" | "sociogramaUtp" | "backstabber" | "bandasAsesoria" | "jillSoftware"

export function NewWorkCaseStudy({ project }: { project: Project }) {
  const { t } = useLanguage()
  const content = t.caseStudies[project]

  if (project === "montblanMobile") {
    return <CaseStudyPage
      content={content}
      compactMobile
      projectUrl="https://github.com/IngEsau/montblan-mobile"
      mobileCover={{
        src: "/work/montblan-mobile/login.webp",
        alt: t.portfolio.projects.montblanMobile.mobileAlt,
        width: 393,
        height: 869,
      }}
    />
  }

  if (project === "sociogramaUtp") {
    return <CaseStudyPage
      content={content}
      desktopCover={{
        src: "/work/sociograma-utp/public-login.webp",
        alt: t.portfolio.projects.sociogramaUtp.desktopAlt,
        width: 1440,
        height: 900,
      }}
      mobileCover={{
        src: "/work/sociograma-utp/public-login-mobile.webp",
        alt: t.portfolio.projects.sociogramaUtp.mobileAlt,
        width: 430,
        height: 830,
      }}
    />
  }

  if (project === "bandasAsesoria") {
    return <CaseStudyPage content={content} projectUrl="https://bandasyasesoria.com.mx/"
      desktopCover={{ src: "/work/bandas-asesoria/desktop.webp", alt: t.portfolio.projects.bandasAsesoria.desktopAlt, width: 1600, height: 834 }}
      mobileCover={{ src: "/work/bandas-asesoria/mobile.webp", alt: t.portfolio.projects.bandasAsesoria.mobileAlt, width: 408, height: 901 }} />
  }

  if (project === "jillSoftware") {
    return <CaseStudyPage content={content}
      desktopCover={{ src: "/work/jill-software/proposal-desktop.webp", alt: t.portfolio.projects.jillSoftware.proposalDesktopAlt, width: 1920, height: 1080 }}
      mobileCover={{ src: "/work/jill-software/proposal-mobile.webp", alt: t.portfolio.projects.jillSoftware.proposalMobileAlt, width: 402, height: 874 }} />
  }

  return <CaseStudyPage content={content} desktopCover={{
    src: "/work/backstabber-toolkit/overview.webp",
    alt: t.portfolio.projects.backstabber.desktopAlt,
    width: 1852,
    height: 950,
  }} />
}
