"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  Boxes,
  Braces,
  Code2,
  Database,
  GitBranch,
  Layers3,
  MonitorSmartphone,
  ServerCog,
} from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./hero-section.module.css"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section id="inicio" className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.technicalGrid} aria-hidden="true" />
      <div className={styles.ambientLight} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {t.hero.eyebrow}
          </p>

          <h1 id="home-hero-title" className={styles.headline}>
            <span>{t.hero.headlineStart}</span>
            <span className={styles.headlineAccent}>{t.hero.headlineEnd}</span>
          </h1>

          <p className={styles.description}>{t.hero.description}</p>

          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.primaryAction}>
              <span>{t.hero.primaryCta}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/work" className={styles.secondaryAction}>
              <span>{t.hero.secondaryCta}</span>
              <Layers3 aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.engineeringVisual} aria-hidden="true">
          <div className={styles.visualAxisHorizontal} />
          <div className={styles.visualAxisVertical} />

          <div className={`${styles.sidePanel} ${styles.leftPanel}`}>
            <div className={styles.panelHeader}>
              <span>{t.hero.interface.experience}</span>
              <Code2 />
            </div>
            <div className={styles.interfacePreview}>
              <div className={styles.previewSidebar}>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.previewContent}>
                <div className={styles.previewTitle} />
                <div className={styles.previewLine} />
                <div className={styles.previewLineShort} />
                <div className={styles.previewCards}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <span className={styles.statusDot} />
              {t.hero.interface.responsiveInterface}
            </div>
          </div>

          <div className={styles.mainPanel}>
            <div className={styles.windowBar}>
              <div className={styles.windowControls}>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.windowPath}>{t.hero.interface.productPath}</span>
              <GitBranch />
            </div>

            <div className={styles.productCanvas}>
              <div className={styles.canvasGrid} />
              <div className={styles.orbitLarge} />
              <div className={styles.orbitSmall} />

              <div className={`${styles.systemNode} ${styles.nodeTop}`}>
                <Braces />
              </div>
              <div className={`${styles.systemNode} ${styles.nodeRight}`}>
                <Database />
              </div>
              <div className={`${styles.systemNode} ${styles.nodeBottom}`}>
                <MonitorSmartphone />
              </div>
              <div className={`${styles.systemNode} ${styles.nodeLeft}`}>
                <Boxes />
              </div>

              <div className={styles.coreGlow} />
              <div className={styles.brandCore}>
                <Image src="/brand/buxdev/mark-on-dark.svg" alt="" width={375} height={404} preload />
              </div>

              <div className={styles.canvasLabel}>
                <span className={styles.statusDot} />
                {t.hero.interface.productCore}
              </div>
            </div>

            <div className={styles.systemMetrics}>
              <div>
                <span>{t.hero.interface.status}</span>
                <strong>{t.hero.interface.operational}</strong>
              </div>
              <div>
                <span>{t.hero.interface.layers}</span>
                <strong>WEB · APP · API</strong>
              </div>
              <div>
                <span>{t.hero.interface.delivery}</span>
                <strong>{t.hero.interface.iterative}</strong>
              </div>
            </div>
          </div>

          <div className={`${styles.sidePanel} ${styles.rightPanel}`}>
            <div className={styles.panelHeader}>
              <span>{t.hero.interface.systems}</span>
              <ServerCog />
            </div>
            <div className={styles.serviceStack}>
              <div>
                <span className={styles.serviceIcon}>
                  <Braces />
                </span>
                <span>{t.hero.interface.application}</span>
                <span className={styles.serviceState}>{t.hero.interface.active}</span>
              </div>
              <div>
                <span className={styles.serviceIcon}>
                  <Database />
                </span>
                <span>{t.hero.interface.services}</span>
                <span className={styles.serviceState}>{t.hero.interface.ready}</span>
              </div>
              <div>
                <span className={styles.serviceIcon}>
                  <MonitorSmartphone />
                </span>
                <span>{t.hero.interface.interfaces}</span>
                <span className={styles.serviceState}>{t.hero.interface.synced}</span>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <span className={styles.statusDot} />
              {t.hero.interface.connectedSystem}
            </div>
          </div>

          <div className={styles.capabilityRail}>
            <span>
              <Code2 /> {t.hero.interface.webDevelopment}
            </span>
            <i />
            <span>
              <MonitorSmartphone /> {t.hero.interface.applications}
            </span>
            <i />
            <span>
              <Boxes /> {t.hero.interface.digitalProduct}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.heroFade} aria-hidden="true" />
    </section>
  )
}
