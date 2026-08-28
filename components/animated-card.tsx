"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
}

export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-2 hover:border-[#2c4c9b] transition-all duration-300 hover:shadow-lg hover:shadow-[#2c4c9b]/20 hover:-translate-y-1 before:absolute before:inset-0 before:pointer-events-none before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-gradient-to-r before:from-[#2c4c9b] before:via-[#4a6bc7] before:to-[#2c4c9b] before:animate-border-traverse before:blur-sm",
        className
      )}
      {...props}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {children}
    </Card>
  )
}