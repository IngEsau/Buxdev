"use client"

import type { CSSProperties } from "react"
import { useEffect, useState } from "react"
import { NavArrowUp, Whatsapp } from "iconoir-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./floating-chat.module.css"

const WHATSAPP_MESSAGE =
  "Hola BUXDEV, vi su sitio web y me gustaría platicar sobre un proyecto."
const WHATSAPP_URL = `https://wa.me/522211310600?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const BACK_TO_TOP_MINIMUM = 480

export function FloatingChat() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [consentOffset, setConsentOffset] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const { t } = useLanguage()

  useEffect(() => {
    const updateVisibility = () => {
      const threshold = Math.max(BACK_TO_TOP_MINIMUM, window.innerHeight * 0.6)
      setShowBackToTop(window.scrollY > threshold)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    window.addEventListener("resize", updateVisibility)

    return () => {
      window.removeEventListener("scroll", updateVisibility)
      window.removeEventListener("resize", updateVisibility)
    }
  }, [])

  useEffect(() => {
    let observedBanner: Element | null = null
    let resizeObserver: ResizeObserver | null = null

    const observeBanner = () => {
      const nextBanner = document.querySelector("[data-consent-banner]")
      if (nextBanner === observedBanner) return

      resizeObserver?.disconnect()
      observedBanner = nextBanner

      if (!nextBanner) {
        setConsentOffset(0)
        return
      }

      const updateOffset = () => setConsentOffset(Math.ceil(nextBanner.getBoundingClientRect().height + 24))
      updateOffset()
      resizeObserver = new ResizeObserver(updateOffset)
      resizeObserver.observe(nextBanner)
    }

    observeBanner()
    const mutationObserver = new MutationObserver(observeBanner)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      resizeObserver?.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" })
  }

  const floatingStyle = {
    "--consent-offset": `${consentOffset}px`,
  } as CSSProperties
  const motionDuration = shouldReduceMotion ? 0 : 0.18

  return (
    <aside className={styles.actions} style={floatingStyle} aria-label={t.floating.actionsLabel}>
      <AnimatePresence initial={false}>
        {showBackToTop && (
          <motion.button
            type="button"
            className={styles.action}
            onClick={handleBackToTop}
            data-back-to-top
            aria-label={t.floating.backToTop}
            title={t.floating.backToTop}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8, scale: shouldReduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 6, scale: shouldReduceMotion ? 1 : 0.96 }}
            transition={{ duration: motionDuration }}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          >
            <NavArrowUp aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.action}
        data-accent="true"
        data-whatsapp
        aria-label={t.floating.whatsapp}
        title={t.floating.whatsapp}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDuration, delay: shouldReduceMotion ? 0 : 0.04 }}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      >
        <Whatsapp aria-hidden="true" />
      </motion.a>
    </aside>
  )
}
