export const CONSENT_STORAGE_KEY = "buxdev_consent"
export const CONSENT_SCHEMA_VERSION = 1 as const
export const CONSENT_CHANGE_EVENT = "buxdev:consent-change"

export interface ConsentState {
  version: typeof CONSENT_SCHEMA_VERSION
  necessary: true
  analytics: boolean
  updatedAt: string
}

export interface BasicConsentModeState {
  analytics_storage: "granted" | "denied"
  ad_storage: "denied"
  ad_user_data: "denied"
  ad_personalization: "denied"
}

export interface ConsentChangeDetail {
  consent: ConsentState | null
  mode: BasicConsentModeState
}

export interface ConsentSnapshot {
  hasLoaded: boolean
  consent: ConsentState | null
}

const serverSnapshot: ConsentSnapshot = {
  hasLoaded: false,
  consent: null,
}

let memoryConsent: ConsentState | null = null
let snapshotRevision = 0
let cachedSnapshotRevision = -1
let cachedSnapshot: ConsentSnapshot = serverSnapshot

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<ConsentState>

  return (
    candidate.version === CONSENT_SCHEMA_VERSION &&
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.updatedAt === "string" &&
    !Number.isNaN(Date.parse(candidate.updatedAt))
  )
}

function createConsentState(analytics: boolean): ConsentState {
  return {
    version: CONSENT_SCHEMA_VERSION,
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  }
}

export function mapConsentToBasicMode(consent: ConsentState | null): BasicConsentModeState {
  return {
    analytics_storage: consent?.analytics === true ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  }
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null

  try {
    const storedValue = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!storedValue) return memoryConsent

    const parsedValue: unknown = JSON.parse(storedValue)
    return isConsentState(parsedValue) ? parsedValue : null
  } catch {
    return memoryConsent
  }
}

function notifyConsentChange(consent: ConsentState | null) {
  snapshotRevision += 1

  if (typeof window === "undefined") return

  const detail: ConsentChangeDetail = {
    consent,
    mode: mapConsentToBasicMode(consent),
  }

  window.dispatchEvent(new CustomEvent<ConsentChangeDetail>(CONSENT_CHANGE_EVENT, { detail }))
}

export function saveConsent(analytics: boolean): ConsentState {
  const consent = createConsentState(analytics)
  memoryConsent = consent

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
    } catch {
      // The in-memory state keeps the choice for this page when storage is unavailable.
    }
  }

  notifyConsentChange(consent)
  return consent
}

export function acceptAnalytics(): ConsentState {
  return saveConsent(true)
}

export function rejectAnalytics(): ConsentState {
  return saveConsent(false)
}

export function resetConsent(): void {
  memoryConsent = null

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
    } catch {
      // The preference is also cleared from the in-memory fallback.
    }
  }

  notifyConsentChange(null)
}

export function getConsentServerSnapshot(): ConsentSnapshot {
  return serverSnapshot
}

export function getConsentSnapshot(): ConsentSnapshot {
  if (typeof window === "undefined") return serverSnapshot

  if (cachedSnapshotRevision !== snapshotRevision) {
    cachedSnapshot = {
      hasLoaded: true,
      consent: readConsent(),
    }
    cachedSnapshotRevision = snapshotRevision
  }

  return cachedSnapshot
}

export function subscribeToConsent(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined

  const handleConsentChange = () => {
    snapshotRevision += 1
    onStoreChange()
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== CONSENT_STORAGE_KEY) return

    memoryConsent = null
    handleConsentChange()
  }

  window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
    window.removeEventListener("storage", handleStorage)
  }
}
