"use client"

import { useLanguage } from "@/hooks/use-language"
import { Globe, ShoppingCart, Code, Smartphone, Sparkles, Search } from "lucide-react"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"

const icons = [Globe, ShoppingCart, Code, Smartphone, Sparkles, Search]

export function ServicesSection() {
  const { t } = useLanguage()

  return (
    <section id="servicios" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">{t.services.title}</h2>
            <p className="text-lg md:text-xl text-muted-foreground">{t.services.subtitle}</p>
          </div>

          {/* Services Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service, index) => {
              const Icon = icons[index]
              return (
                <AnimatedCard
                  key={index}
                >
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-[#2c4c9b]/10 flex items-center justify-center mb-4 group-hover:bg-[#2c4c9b]/20 transition-colors">
                      <Icon className="h-6 w-6 text-[#2c4c9b]" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{service.description}</CardDescription>
                  </CardContent>
                </AnimatedCard>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
