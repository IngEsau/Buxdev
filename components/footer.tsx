"use client"

import Image from "next/image"
import Link from "next/link"

import { useConsent } from "@/components/consent-provider"
import { useLanguage } from "@/hooks/use-language"

import styles from "./footer.module.css"

const navigation = [
  { key: "inicio", href: "/" },
  { key: "nosotros", href: "/about/" },
  { key: "servicios", href: "/services/" },
  { key: "trabajos", href: "/work/" },
  { key: "contacto", href: "/contact/" },
] as const

export function Footer() {
  const { t } = useLanguage()
  const { openPreferences } = useConsent()
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
              <span>{t.footer.email}</span>
            </a>
            <a href="tel:+522211310600">
              <span>{t.footer.primaryPhone}</span>
            </a>
            <a
              href={`tel:${t.footer.secondaryPhone.replace(/[^\d+]/g, "")}`}
              className={styles.secondaryPhone}
            >
              <span>{t.footer.secondaryPhone}</span>
            </a>
          </div>

          <div className={styles.social}>
            <p>{t.footer.social}</p>
            <a
              href="https://www.instagram.com/buxdevco/"
              target="_blank"
              rel="me noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © <time dateTime={String(year)}>{year}</time> BUXDEV
          </p>
          <div className={styles.legal} aria-label={t.footer.legalLabel}>
            <Link href="/privacidad/">{t.footer.privacy}</Link>
            <Link href="/terminos/">{t.footer.terms}</Link>
            <Link href="/cookies/">{t.footer.cookies}</Link>
            <button type="button" data-consent-preferences-trigger onClick={openPreferences}>
              {t.footer.preferences}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
