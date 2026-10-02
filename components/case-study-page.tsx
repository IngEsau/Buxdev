import Link from "next/link"
import { ArrowUpRight, NavArrowLeft } from "iconoir-react"

import { ImageZoom } from "@/components/image-zoom"
import { MotionReveal } from "@/components/motion-reveal"

import styles from "./case-study-page.module.css"

interface CaseStudyFact {
  label: string
  value: string
}

interface CaseStudyFeature {
  title: string
  description: string
}

interface CaseStudySection {
  id: string
  index: string
  title: string
  paragraphs: readonly string[]
  features?: readonly CaseStudyFeature[]
  technologies?: readonly string[]
  results?: readonly string[]
}

interface CaseStudyGalleryItem {
  src: string
  alt: string
  caption: string
  portrait?: boolean
  uncropped?: boolean
  width?: number
  height?: number
}

export interface CaseStudyContent {
  backToWork: string
  label: string
  title: string
  description: string
  categories: readonly string[]
  categoriesLabel: string
  facts: readonly CaseStudyFact[]
  attribution?: string
  referencesLabel?: string
  references?: readonly { label: string; url: string }[]
  visitSite?: string
  sections: readonly CaseStudySection[]
  galleryLabel?: string
  galleryTitle?: string
  galleryDescription?: string
  gallery?: readonly CaseStudyGalleryItem[]
  finalLabel?: string
  finalTitle?: string
  finalDescription?: string
  visitProject?: string
}

interface CaseStudyPageProps {
  content: CaseStudyContent
  compactMobile?: boolean
  projectUrl?: string
  desktopCover?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  mobileCover?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
}

export function CaseStudyPage({
  content,
  compactMobile = false,
  projectUrl,
  desktopCover,
  mobileCover,
}: CaseStudyPageProps) {
  return (
    <main id="main-content" tabIndex={-1} className={styles.caseStudy}>
      <section className={styles.hero} aria-labelledby="case-study-title">
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={styles.inner}>
          <MotionReveal className={styles.heroContent} revealOnView={false}>
            <Link href="/work/" className={styles.backLink}>
              <NavArrowLeft aria-hidden="true" />
              <span>{content.backToWork}</span>
            </Link>

            <div className={styles.heroLayout}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>{content.label}</p>
                <h1 id="case-study-title">{content.title}</h1>
                <p className={styles.heroDescription}>{content.description}</p>
                {content.attribution ? <p className={styles.attributionNote}>{content.attribution}</p> : null}

                <ul className={styles.categories} aria-label={content.categoriesLabel}>
                  {content.categories.map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.projectMeta}>
                <dl>
                  {content.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                {projectUrl && content.visitSite ? (
                  <a href={projectUrl} className={styles.primaryAction} target="_blank" rel="noopener noreferrer">
                    <span>{content.visitSite}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
                {content.references?.length ? (
                  <nav className={styles.references} aria-label={content.referencesLabel}>
                    {content.references.map((reference) => (
                      <a key={reference.url} href={reference.url} target="_blank" rel="noopener noreferrer">
                        {reference.label}<ArrowUpRight aria-hidden="true" />
                      </a>
                    ))}
                  </nav>
                ) : null}
              </div>
            </div>
          </MotionReveal>

          {desktopCover || mobileCover ? (
            <MotionReveal className={`${styles.showcase} ${desktopCover && !mobileCover ? styles.showcaseDesktopOnly : ""} ${mobileCover && !desktopCover ? styles.showcaseMobileOnly : ""} ${compactMobile ? styles.showcaseCompactMobile : ""}`} delay={0.08} revealOnView={false}>
              {desktopCover ? <ImageZoom className={styles.desktopFrame} src={desktopCover.src} alt={desktopCover.alt}
                width={desktopCover.width ?? 1600} height={desktopCover.height ?? 834} priority sizes="(max-width: 48rem) 92vw, 75rem" /> : null}
              {mobileCover ? <ImageZoom className={styles.mobileFrame} src={mobileCover.src} alt={mobileCover.alt}
                width={mobileCover.width ?? 408} height={mobileCover.height ?? 901} priority sizes="(max-width: 48rem) 25vw, 12rem" /> : null}
            </MotionReveal>
          ) : null}
        </div>
      </section>

      <div className={styles.story}>
        <div className={styles.inner}>
          {content.sections.map((section) => (
            <MotionReveal key={section.id} className={styles.sectionReveal}>
              <article className={styles.storySection} aria-labelledby={`${section.id}-title`}>
                <header className={styles.sectionHeader}>
                  <span>{section.index}</span>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                </header>

                <div className={styles.sectionContent}>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.features ? (
                    <dl className={styles.featureList}>
                      {section.features.map((feature) => (
                        <div key={feature.title}>
                          <dt>{feature.title}</dt>
                          <dd>{feature.description}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {section.technologies ? (
                    <ul className={styles.technologyList}>
                      {section.technologies.map((technology, index) => (
                        <li key={technology}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {technology}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.results ? (
                    <ul className={styles.resultList}>
                      {section.results.map((result) => (
                        <li key={result}>{result}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </MotionReveal>
          ))}
        </div>
      </div>

      {content.gallery?.length && content.galleryTitle ? <section className={`${styles.gallery} ${compactMobile ? styles.galleryCompactMobile : ""}`} aria-labelledby="case-study-gallery-title">
        <div className={styles.galleryGrid} aria-hidden="true" />
        <div className={styles.inner}>
          <MotionReveal className={styles.galleryHeader}>
            <p>{content.galleryLabel}</p>
            <div>
              <h2 id="case-study-gallery-title">{content.galleryTitle}</h2>
              <span>{content.galleryDescription}</span>
            </div>
          </MotionReveal>

          <div className={styles.galleryList}>
            {content.gallery.map((item, index) => (
              <MotionReveal
                key={item.src}
                className={index === 0 && !compactMobile ? styles.galleryItemWide : styles.galleryItem}
              >
                <figure>
                  <ImageZoom className={`${styles.galleryImage} ${item.portrait ? styles.galleryImagePortrait : ""} ${item.uncropped ? styles.galleryImageUncropped : ""}`}
                    src={item.src} alt={item.alt} width={item.width ?? (item.portrait ? 393 : 1440)} height={item.height ?? (item.portrait ? 869 : 900)}
                    sizes={compactMobile ? "(max-width: 48rem) 18rem, 20rem" : index === 0 ? "(max-width: 48rem) 92vw, 75rem" : "(max-width: 48rem) 92vw, 37rem"} />
                  <figcaption>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.caption}
                  </figcaption>
                </figure>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section> : null}

      {projectUrl && content.finalTitle && content.visitProject ? <section className={styles.finalCta} aria-labelledby="case-study-final-title">
        <div className={styles.inner}>
          <MotionReveal className={styles.finalLayout}>
            <div>
              <p>{content.finalLabel}</p>
              <h2 id="case-study-final-title">{content.finalTitle}</h2>
              <span>{content.finalDescription}</span>
            </div>
            <a
              href={projectUrl}
              className={styles.finalAction}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{content.visitProject}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </MotionReveal>
        </div>
      </section> : null}
    </main>
  )
}
