"use client"

import { useLanguage } from "@/hooks/use-language"
import { Target, Eye, Heart } from "lucide-react"
import { CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <section id="nosotros" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-[#2c4c9b] to-[#4a6bc7] bg-clip-text text-transparent">
              {t.about.company}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              {t.about.experience}
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedCard>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-[#2c4c9b]/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#2c4c9b]" />
                </div>
                <h3 className="text-2xl font-bold">{t.about.mission.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.about.mission.text}</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-[#2c4c9b]/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-[#2c4c9b]" />
                </div>
                <h3 className="text-2xl font-bold">{t.about.vision.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.about.vision.text}</p>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-[#2c4c9b]/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-[#2c4c9b]" />
                </div>
                <h3 className="text-2xl font-bold">{t.about.values.title}</h3>
                <ul className="space-y-2">
                  {t.about.values.items.map((value, index) => (
                    <li key={index} className="text-muted-foreground flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2c4c9b]" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </section>
  )
}
