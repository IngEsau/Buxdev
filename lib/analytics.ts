import { readConsent } from "@/lib/consent"
import { hasGoogleTagManagerStarted } from "@/lib/google-tag-manager"
import type { ContactLeadType } from "@/services/contact"

export type GenerateLeadEvent = {
  event: "generate_lead"
  lead_type: ContactLeadType
}

export function trackGenerateLead(leadType: ContactLeadType): boolean {
  if (typeof window === "undefined") return false

  const consent = readConsent()
  if (consent?.analytics !== true || !hasGoogleTagManagerStarted()) return false

  const dataLayer: unknown[] | undefined = window.dataLayer
  if (!Array.isArray(dataLayer)) return false

  const event: GenerateLeadEvent = {
    event: "generate_lead",
    lead_type: leadType,
  }

  dataLayer.push(event)
  return true
}
