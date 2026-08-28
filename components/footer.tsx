"use client"

import { useLanguage } from "@/hooks/use-language"
import { Mail, Phone } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const { t } = useLanguage()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div className="space-y-4">
              <Image src="/darklogo.svg" alt="BUXDEV" width={120} height={40} className="h-8 w-auto" />
              <p className="text-sm text-muted-foreground leading-relaxed">{t.about.experience.split(",")[0]}</p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.services}</h3>
              <ul className="space-y-2">
                {t.services.items.slice(0, 4).map((service, index) => (
                  <li key={index}>
                    <button
                      onClick={() => scrollToSection("servicios")}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {service.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.company}</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("nosotros")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.about.mission.title}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("nosotros")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.about.vision.title}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("nosotros")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.about.values.title}
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-4">{t.footer.contact}</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${t.footer.email}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {t.footer.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${t.footer.phone}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {t.footer.phone}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">{t.footer.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
