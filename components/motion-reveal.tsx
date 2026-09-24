"use client"

import type { HTMLMotionProps } from "motion/react"
import { motion, useReducedMotion } from "motion/react"
import { useSyncExternalStore } from "react"
import styles from "./motion-reveal.module.css"

const mobileQuery = "(max-width: 48rem)"
const serverSnapshot = () => false
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches
const noopSubscribe = () => () => {}

function subscribeToMobile(onChange: () => void) {
  const query = window.matchMedia(mobileQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

type MotionRevealProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "initial" | "transition" | "viewport" | "whileInView"
> & {
  delay?: number
  distance?: number
  revealOnView?: boolean
  disableOnMobile?: boolean
}

export function MotionReveal({
  children,
  delay = 0,
  distance = 12,
  revealOnView = true,
  disableOnMobile = false,
  className,
  ...props
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useSyncExternalStore(
    disableOnMobile ? subscribeToMobile : noopSubscribe,
    disableOnMobile ? mobileSnapshot : serverSnapshot,
    serverSnapshot,
  )
  const skipReveal = shouldReduceMotion || (disableOnMobile && isMobile)
  const revealClassName = [className, disableOnMobile && styles.staticOnMobile].filter(Boolean).join(" ")
  const initial = skipReveal ? false : { opacity: 0, y: distance }
  const visible = { opacity: 1, y: 0 }
  const transition = {
    duration: skipReveal ? 0 : 0.52,
    delay: skipReveal ? 0 : delay,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  if (!revealOnView || skipReveal) {
    return (
      <motion.div {...props} className={revealClassName} initial={initial} animate={visible} transition={transition}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      {...props}
      className={revealClassName}
      initial={initial}
      whileInView={visible}
      viewport={{ once: true, amount: 0.16 }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
