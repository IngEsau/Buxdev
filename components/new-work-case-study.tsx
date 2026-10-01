"use client"

import { CaseStudyPage } from "@/components/case-study-page"
import { useLanguage } from "@/hooks/use-language"

type Project = "montblanMobile" | "sociogramaUtp" | "backstabber"

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
        src: "/work/sociograma-utp/admin-panel.webp",
        alt: t.portfolio.projects.sociogramaUtp.desktopAlt,
        width: 1877,
        height: 955,
      }}
      mobileCover={{
        src: "/work/sociograma-utp/public-login-mobile.webp",
        alt: t.portfolio.projects.sociogramaUtp.mobileAlt,
        width: 430,
        height: 830,
      }}
    />
  }

  return <CaseStudyPage content={content} />
}
