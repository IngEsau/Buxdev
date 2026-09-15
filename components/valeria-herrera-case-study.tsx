"use client"

import { CaseStudyPage } from "@/components/case-study-page"
import { useLanguage } from "@/hooks/use-language"

const PROJECT_URL = "https://valeriaherrera.buxdev.com/"

export function ValeriaHerreraCaseStudy() {
  const { t } = useLanguage()
  const project = t.portfolio.projects.valeriaHerrera

  return (
    <CaseStudyPage
      content={t.caseStudies.valeriaHerrera}
      projectUrl={PROJECT_URL}
      desktopCover={{
        src: "/work/valeria-herrera/desktop.webp",
        alt: project.desktopAlt,
      }}
      mobileCover={{
        src: "/work/valeria-herrera/mobile.webp",
        alt: project.mobileAlt,
      }}
    />
  )
}
