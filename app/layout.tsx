import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SiteShell } from "@/components/site-shell"
import "./globals.css"

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
  metadataBase: new URL("https://buxdev.com"),
  title: {
    default: "BUXDEV - Desarrollo de Software Multiplataforma",
    template: "%s | BUXDEV",
  },
  description:
    "Empresa mexicana de desarrollo de software con más de 3 años de experiencia. Páginas web, tiendas en línea, web apps, mobile apps y más.",
  applicationName: "BUXDEV",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "BUXDEV",
    title: "BUXDEV - Desarrollo de Software Multiplataforma",
    description:
      "Desarrollo de páginas web, tiendas en línea y aplicaciones multiplataforma para impulsar negocios e ideas.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}>
        <SiteShell>{children}</SiteShell>
        <Analytics />
      </body>
    </html>
  )
}
