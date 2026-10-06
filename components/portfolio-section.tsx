"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { AccordionGallery } from "@/components/effects/accordion-gallery"
import { MotionReveal } from "@/components/motion-reveal"
import { useLanguage } from "@/hooks/use-language"

import styles from "./portfolio-section.module.css"

const projects = [
  { id: "valeriaHerrera", href: "/work/valeria-herrera/", image: "/work/valeria-herrera/desktop.webp", mobileImage: "/work/valeria-herrera/mobile.webp" },
  { id: "sociogramaUtp", href: "/work/sociograma-utp/", image: "/work/sociograma-utp/public-login.webp", mobileImage: "/work/sociograma-utp/public-login-mobile.webp" },
  { id: "bandasAsesoria", href: "/work/bandas-asesoria/", image: "/work/bandas-asesoria/desktop.webp", mobileImage: "/work/bandas-asesoria/mobile.webp" },
  { id: "poetsFlowers", href: "/work/poets-flowers/", image: "/work/poets-flowers/desktop.webp", mobileImage: "/work/poets-flowers/mobile.webp" },
  { id: "jillSoftware", href: "/work/jill-software/", image: "/work/jill-software/current-desktop.webp", mobileImage: "/work/jill-software/current-mobile.webp" },
] as const

export function PortfolioSection() {
  const { t } = useLanguage()

  return (
    <section id="trabajos" className={styles.section} aria-labelledby="home-work-title">
      <MotionReveal className={styles.container} disableOnMobile>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{t.nav.trabajos}</p>
            <h2 id="home-work-title" className={styles.title}>
              {t.portfolio.title}
            </h2>
          </div>
          <p className={styles.subtitle}>{t.portfolio.subtitle}</p>
        </header>

        <AccordionGallery
          label={t.portfolio.title}
          items={projects.map(project => ({
            id: project.id,
            image: project.image,
            mobileImage: project.mobileImage,
            label: t.portfolio.projects[project.id].title,
            href: project.href,
          }))}
        />

        <div className={styles.sectionFooter}>
          <Link href="/work/" className={styles.sectionLink}>
            <span>{t.nav.trabajos}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </MotionReveal>
    </section>
  )
}
