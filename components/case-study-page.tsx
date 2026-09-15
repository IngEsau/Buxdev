import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, NavArrowLeft } from "iconoir-react"

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
}

export interface CaseStudyContent {
  backToWork: string
  label: string
  title: string
  description: string
  categories: readonly string[]
  categoriesLabel: string
  facts: readonly CaseStudyFact[]
  visitSite: string
  sections: readonly CaseStudySection[]
  galleryLabel: string
  galleryTitle: string
  galleryDescription: string
  gallery: readonly CaseStudyGalleryItem[]
  finalLabel: string
  finalTitle: string
  finalDescription: string
  visitProject: string
}

interface CaseStudyPageProps {
  content: CaseStudyContent
  projectUrl: string
  desktopCover: {
    src: string
    alt: string
  }
  mobileCover: {
    src: string
    alt: string
  }
}

export function CaseStudyPage({
  content,
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

                <a
                  href={projectUrl}
                  className={styles.primaryAction}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{content.visitSite}</span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal className={styles.showcase} delay={0.08} revealOnView={false}>
            <div className={styles.desktopFrame}>
              <Image
                src={desktopCover.src}
                alt={desktopCover.alt}
                width={1600}
                height={834}
                priority
                sizes="(max-width: 48rem) 92vw, 75rem"
              />
            </div>
            <div className={styles.mobileFrame}>
              <Image
                src={mobileCover.src}
                alt={mobileCover.alt}
                width={408}
                height={901}
                priority
                sizes="(max-width: 48rem) 25vw, 12rem"
              />
            </div>
          </MotionReveal>
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

      <section className={styles.gallery} aria-labelledby="case-study-gallery-title">
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
                className={index === 0 ? styles.galleryItemWide : styles.galleryItem}
              >
                <figure>
                  <div className={styles.galleryImage}>
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={1440}
                      height={900}
                      sizes={index === 0 ? "(max-width: 48rem) 92vw, 75rem" : "(max-width: 48rem) 92vw, 37rem"}
                    />
                  </div>
                  <figcaption>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.caption}
                  </figcaption>
                </figure>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="case-study-final-title">
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
      </section>
    </main>
  )
}
