import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Montserrat } from "next/font/google"
import { SiteShell } from "@/components/site-shell"
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo"
import "./globals.css"

const initialPreferencesScript = `
  (() => {
    const root = document.documentElement;
    const readPreference = (key, fallback) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || "null");
        return value?.state ?? fallback;
      } catch {
        return fallback;
      }
    };
    const theme = readPreference("buxdev-theme", { theme: "dark" }).theme;
    const language = readPreference("buxdev-language", { language: "es" }).language;
    root.classList.toggle("dark", theme !== "light");
    root.lang = language === "en" ? "en" : "es";
    if (language === "en") {
      root.setAttribute("data-language-pending", "true");
      window.setTimeout(() => root.removeAttribute("data-language-pending"), 1500);
    }
  })();
`

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_TITLE,
    template: "%s | BUXDEV",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: "/brand/buxdev/mark-on-light.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/buxdev/mark-on-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          id="buxdev-initial-preferences"
          dangerouslySetInnerHTML={{ __html: initialPreferencesScript }}
        />
      </head>
      <body className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
