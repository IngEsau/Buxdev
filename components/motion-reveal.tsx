"use client"

import type { HTMLMotionProps } from "motion/react"
import { motion, useReducedMotion } from "motion/react"

type MotionRevealProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "initial" | "transition" | "viewport" | "whileInView"
> & {
  delay?: number
  distance?: number
  revealOnView?: boolean
}

export function MotionReveal({
  children,
  delay = 0,
  distance = 12,
  revealOnView = true,
  ...props
}: MotionRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const initial = shouldReduceMotion ? false : { opacity: 0, y: distance }
  const visible = { opacity: 1, y: 0 }
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.52,
    delay: shouldReduceMotion ? 0 : delay,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  if (!revealOnView) {
    return (
      <motion.div {...props} initial={initial} animate={visible} transition={transition}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      {...props}
      initial={initial}
      whileInView={visible}
      viewport={{ once: true, amount: 0.16 }}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
