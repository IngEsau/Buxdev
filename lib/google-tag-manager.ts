import { mapConsentToBasicMode, type BasicConsentModeState, type ConsentState } from "@/lib/consent"

export const GTM_CONTAINER_ID = "GTM-WJRPHPQN"

const GTM_SCRIPT_ID = "buxdev-google-tag-manager"
const GTM_SCRIPT_URL = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`

type ConsentCommand = [
  command: "consent",
  action: "default" | "update",
  state: BasicConsentModeState,
]

type GtagQueue = (...args: ConsentCommand) => void

type DataLayerEntry =
  | IArguments
  | {
      "gtm.start": number
      event: "gtm.js"
    }

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[]
    gtag?: GtagQueue
    __buxdevGtmConsentInitialized?: boolean
    __buxdevGtmState?: "loading" | "loaded" | "failed"
    __buxdevGtmReloadScheduled?: boolean
  }
}

function ensureGtagQueue(): GtagQueue {
  window.dataLayer ??= []

  if (!window.gtag) {
    window.gtag = function gtag(..._args: ConsentCommand) {
      void _args
      // GTM's documented queue format uses the native Arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments)
    }
  }

  return window.gtag
}

function queueInitialConsent(consent: ConsentState) {
  if (window.__buxdevGtmConsentInitialized) return

  const gtag = ensureGtagQueue()
  gtag("consent", "default", mapConsentToBasicMode(null))
  gtag("consent", "update", mapConsentToBasicMode(consent))
  window.__buxdevGtmConsentInitialized = true
}

function queueConsentUpdate(state: BasicConsentModeState) {
  if (!window.gtag) return
  window.gtag("consent", "update", state)
}

export function loadGoogleTagManager(consent: ConsentState): void {
  if (typeof window === "undefined" || !consent.analytics) return

  queueInitialConsent(consent)

  if (
    window.__buxdevGtmState ||
    document.getElementById(GTM_SCRIPT_ID)
  ) {
    return
  }

  window.__buxdevGtmState = "loading"
  window.dataLayer?.push({
    "gtm.start": Date.now(),
    event: "gtm.js",
  })

  const script = document.createElement("script")
  script.id = GTM_SCRIPT_ID
  script.async = true
  script.src = GTM_SCRIPT_URL
  script.dataset.consent = "analytics"
  script.addEventListener(
    "load",
    () => {
      window.__buxdevGtmState = "loaded"
    },
    { once: true },
  )
  script.addEventListener(
    "error",
    () => {
      window.__buxdevGtmState = "failed"
    },
    { once: true },
  )

  document.head.append(script)
}

export function hasGoogleTagManagerStarted(): boolean {
  if (typeof window === "undefined") return false

  return Boolean(
    window.__buxdevGtmState ||
      document.getElementById(GTM_SCRIPT_ID),
  )
}

export function clearGoogleAnalyticsCookies(): string[] {
  if (typeof document === "undefined") return []

  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))

  const canTargetBuxdevDomain =
    window.location.hostname === "buxdev.com" ||
    window.location.hostname.endsWith(".buxdev.com")

  for (const cookieName of new Set(cookieNames)) {
    document.cookie = `${cookieName}=; Max-Age=0; Path=/; SameSite=Lax`

    if (canTargetBuxdevDomain) {
      document.cookie = `${cookieName}=; Max-Age=0; Path=/; Domain=.buxdev.com; SameSite=Lax`
    }
  }

  return [...new Set(cookieNames)]
}

export function revokeGoogleAnalyticsAndReload(): void {
  if (typeof window === "undefined" || window.__buxdevGtmReloadScheduled) return

  queueConsentUpdate(mapConsentToBasicMode(null))
  clearGoogleAnalyticsCookies()
  window.__buxdevGtmReloadScheduled = true

  window.setTimeout(() => window.location.reload(), 0)
}
