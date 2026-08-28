"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Check, Globe2, Menu, Moon, Sun, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

import styles from "./navbar.module.css"

const navigation = [
  { key: "inicio", href: "/" },
  { key: "nosotros", href: "/about" },
  { key: "servicios", href: "/services" },
  { key: "trabajos", href: "/work" },
  { key: "contacto", href: "/contact" },
] as const

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const { t, language, setLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      setIsOpen(false)
      menuButtonRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const themeLabel = theme === "dark" ? t.header.themeToLight : t.header.themeToDark

  const renderLanguageMenu = (tabIndex?: number) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={styles.utilityButton}
          aria-label={t.header.language}
          tabIndex={tabIndex}
        >
          <Globe2 aria-hidden="true" />
          <span>{language.toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.languageMenu}>
        <DropdownMenuItem onClick={() => setLanguage("es")} className={styles.languageOption}>
          <span>Español</span>
          {language === "es" && <Check aria-hidden="true" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className={styles.languageOption}>
          <span>English</span>
          {language === "en" && <Check aria-hidden="true" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className={cn(styles.header, scrolled && styles.scrolled)}>
      <div className={styles.headerInner}>
        <Link
          href="/"
          className={styles.logoLink}
          aria-label={t.header.homeLabel}
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/brand/buxdev/logo-on-light.svg"
            alt=""
            width={613}
            height={404}
            className={styles.logoOnLight}
            priority
          />
          <Image
            src="/brand/buxdev/logo-on-dark.svg"
            alt=""
            width={613}
            height={404}
            className={styles.logoOnDark}
            priority
          />
        </Link>

        <nav className={styles.desktopNav} aria-label={t.header.primaryNavigation}>
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.navLink}
              onClick={() => setIsOpen(false)}
              aria-current={normalizedPathname === item.href ? "page" : undefined}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <button type="button" onClick={toggleTheme} className={styles.iconButton} aria-label={themeLabel}>
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          {renderLanguageMenu()}
          <Link href="/contact" className={styles.headerCta}>
            <span>{t.header.projectCta}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.mobileActions}>
          <button type="button" onClick={toggleTheme} className={styles.iconButton} aria-label={themeLabel}>
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            onClick={() => setIsOpen((current) => !current)}
            aria-label={isOpen ? t.header.closeMenu : t.header.openMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={styles.mobileMenu}
        data-open={isOpen}
        aria-label={t.header.mobileNavigation}
        aria-hidden={!isOpen}
      >
        <div className={styles.mobileLinks}>
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.mobileLink}
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? 0 : -1}
              aria-current={normalizedPathname === item.href ? "page" : undefined}
            >
              <span>{t.nav[item.key]}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>

        <div className={styles.mobileMenuFooter}>
          {renderLanguageMenu(isOpen ? 0 : -1)}
          <Link
            href="/contact"
            className={styles.mobileCta}
            onClick={() => setIsOpen(false)}
            tabIndex={isOpen ? 0 : -1}
          >
            <span>{t.hero.primaryCta}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  )
}
