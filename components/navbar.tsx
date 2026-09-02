"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Globe2, Menu, Moon, Sun, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

import styles from "./navbar.module.css"

const navigation = [
  { key: "inicio", href: "/" },
  { key: "nosotros", href: "/about/" },
  { key: "servicios", href: "/services/" },
  { key: "trabajos", href: "/work/" },
  { key: "contacto", href: "/contact/" },
] as const

const normalizePathname = (value: string) => value.replace(/\/+$/, "") || "/"

interface NavbarContentProps {
  pathname: string
}

export function Navbar() {
  const pathname = usePathname()

  return <NavbarContent key={pathname} pathname={pathname} />
}

function NavbarContent({ pathname }: NavbarContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState<"desktop" | "mobile" | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { t, language, setLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const normalizedPathname = normalizePathname(pathname)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 56.0625rem)")
    const handleDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false)
      setLanguageMenuOpen(null)
    }

    desktopQuery.addEventListener("change", handleDesktop)
    return () => desktopQuery.removeEventListener("change", handleDesktop)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = "hidden"

    return () => {
      root.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (headerRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-slot="dropdown-menu-content"]')) return

      setIsOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown, true)
    return () => document.removeEventListener("pointerdown", handlePointerDown, true)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || languageMenuOpen) return

      setIsOpen(false)
      menuButtonRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, languageMenuOpen])

  const themeLabel = theme === "dark" ? t.header.themeToLight : t.header.themeToDark

  const renderLanguageMenu = (scope: "desktop" | "mobile", tabIndex?: number) => (
    <DropdownMenu
      open={languageMenuOpen === scope}
      onOpenChange={(open) => setLanguageMenuOpen(open ? scope : null)}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={styles.utilityButton}
          aria-label={`${t.header.language}: ${language === "es" ? "Español" : "English"}`}
          tabIndex={tabIndex}
        >
          <Globe2 aria-hidden="true" />
          <span>{language.toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.languageMenu}>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (value === "es" || value === "en") setLanguage(value)
          }}
        >
          <DropdownMenuRadioItem value="es" className={styles.languageOption}>
            Español
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en" className={styles.languageOption}>
            English
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header ref={headerRef} className={cn(styles.header, scrolled && styles.scrolled)}>
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
            loading="eager"
          />
          <Image
            src="/brand/buxdev/logo-on-dark.svg"
            alt=""
            width={613}
            height={404}
            className={styles.logoOnDark}
            loading="eager"
          />
        </Link>

        <nav className={styles.desktopNav} aria-label={t.header.primaryNavigation}>
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.navLink}
              onClick={() => setIsOpen(false)}
              aria-current={normalizedPathname === normalizePathname(item.href) ? "page" : undefined}
            >
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className={styles.desktopActions}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.iconButton}
            aria-label={themeLabel}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          {renderLanguageMenu("desktop")}
          <Link href="/contact/" className={styles.headerCta}>
            <span>{t.header.projectCta}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.mobileActions}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.iconButton}
            aria-label={themeLabel}
          >
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
              aria-current={normalizedPathname === normalizePathname(item.href) ? "page" : undefined}
            >
              <span>{t.nav[item.key]}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>

        <div className={styles.mobileMenuFooter}>
          {renderLanguageMenu("mobile", isOpen ? 0 : -1)}
          <Link
            href="/contact/"
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
