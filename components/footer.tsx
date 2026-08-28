"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Mail, Phone } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

import styles from "./footer.module.css"

const navigation = [
  { key: "inicio", href: "/" },
  { key: "nosotros", href: "/about" },
  { key: "servicios", href: "/services" },
  { key: "trabajos", href: "/work" },
  { key: "contacto", href: "/contact" },
] as const

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.logoLink} aria-label={t.header.homeLabel}>
              <Image
                src="/brand/buxdev/logo-on-light.svg"
                alt=""
                width={130}
                height={86}
                className={styles.logoOnLight}
              />
              <Image
                src="/brand/buxdev/logo-on-dark.svg"
                alt=""
                width={130}
                height={86}
                className={styles.logoOnDark}
              />
            </Link>
            <p>{t.hero.description}</p>
          </div>

          <nav className={styles.navigation} aria-label={t.footer.navigationLabel}>
            <p>{t.footer.company}</p>
            <ul>
              {navigation.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>{t.nav[item.key]}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.contact}>
            <p>{t.footer.contact}</p>
            <a href={`mailto:${t.footer.email}`}>
              <Mail aria-hidden="true" />
              <span>{t.footer.email}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={`tel:${t.footer.phone}`}>
              <Phone aria-hidden="true" />
              <span>{t.footer.phone}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © <time dateTime={String(year)}>{year}</time> BUXDEV. {t.footer.rights}
          </p>
          <span>{t.footer.signature}</span>
        </div>
      </div>
    </footer>
  )
}
