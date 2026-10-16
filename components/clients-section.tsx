"use client"

import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState } from "react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./clients-section.module.css"

// Original marks from each brand's public website, hosted locally (no hotlinks).
// Jill's proposal was accepted; internal projects are not client endorsements.
const clients = [
  { name: "Valeria Herrera", href: "https://valeriaherrera.buxdev.com/", image: "valeria-herrera.svg", width: 720, height: 160, style: "valeria" },
  { name: "Bandas Asesoría y Montaje", href: "https://bandasyasesoria.com.mx/", image: "bandas-asesoria.png", width: 168, height: 210, style: "bandas" },
  { name: "Jill Software", href: "https://jillsoftware.com.mx/", image: "jill-software.svg", width: 1662, height: 795, style: "jill" },
  { name: "Poet’s Flowers", href: "https://poetsflowers.buxdev.com/", style: "poets" },
  { name: "Montblan", href: "https://montblan.mx/", image: "montblan.png", width: 162, height: 91, style: "montblan" },
  { name: "Universidad Tecnológica de Puebla", href: "https://www.utpuebla.edu.mx/", image: "utp.png", width: 1000, height: 516, style: "utp" },
] as const

export function ClientsSection() {
  const { t } = useLanguage()
  const [viewport, carousel] = useEmblaCarousel({ loop: true, align: "start", duration: 35 })
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(motion.matches)
    motion.addEventListener("change", sync)
    sync()
    return () => motion.removeEventListener("change", sync)
  }, [])

  return (
    <section id="clientes" className={styles.section} aria-label={t.clients.label}
      aria-roledescription={t.clients.carousel}>
      <div className={styles.container}>
        <div ref={viewport} className={styles.viewport} data-ready={Boolean(carousel)}>
          <ul id="home-clients-list" className={styles.track}>
            {clients.map(client => (
              <li key={client.name} className={styles.slide}>
                <a className={`${styles.brand} ${styles[client.style]}`} href={client.href}
                  target="_blank" rel="noopener noreferrer" aria-label={`${client.name} — ${t.clients.visit}`}>
                  {"image" in client ? (
                    <Image src={`/brand/clients/${client.image}`} width={client.width} height={client.height}
                      alt={client.name} loading="lazy" sizes="200px" />
                  ) : <span className={styles.wordmark}>POET’S <span>FLOWERS</span></span>}
                  {client.style === "bandas" && <span className={styles.bandasName}>BANDAS ASESORÍA Y MONTAJE</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.control} aria-label={t.clients.previous}
            aria-controls="home-clients-list" onClick={() => carousel?.scrollPrev(reduced)}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" className={styles.control} aria-label={t.clients.next}
            aria-controls="home-clients-list" onClick={() => carousel?.scrollNext(reduced)}>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
