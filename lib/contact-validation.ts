// Contact-format validation, not a check that a number/mailbox exists.
export const CONTACT_COUNTRIES = [
  { code: "+1", country: "US/CA", min: 10, max: 10 },
  { code: "+52", country: "MX", min: 10, max: 10 },
  { code: "+34", country: "ES", min: 9, max: 9 },
  { code: "+54", country: "AR", min: 10, max: 11 },
  { code: "+56", country: "CL", min: 9, max: 9 },
  { code: "+57", country: "CO", min: 10, max: 10 },
] as const

export const MAX_OTHER_INTEREST_LENGTH = 160

export function normalizeNationalPhone(phone: string, countryCode: string): string | null {
  if (/[\x00-\x1f\x7f]/.test(phone)) return null
  const value = phone.trim()
  if (!/^\+?[0-9 ().-]+$/.test(value)) return null
  const digits = value.replace(/\D/g, "")
  if (!value.startsWith("+")) return digits
  const prefix = countryCode.replace(/\D/g, "")
  return digits.startsWith(prefix) ? digits.slice(prefix.length) : null
}

export function getPhoneError(phone: string, countryCode: string): "phoneRequired" | "phoneInvalid" | undefined {
  if (!phone.trim()) return "phoneRequired"
  const plan = CONTACT_COUNTRIES.find((country) => country.code === countryCode)
  const national = normalizeNationalPhone(phone, countryCode)
  if (!plan || !national || national.length < plan.min || national.length > plan.max
    || /^0/.test(national) || /^(\d)\1+$/.test(national)
    || countryCode.length - 1 + national.length > 15) return "phoneInvalid"
  if (countryCode === "+1" && !/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return "phoneInvalid"
  if (countryCode === "+54" && national.length === 11 && !national.startsWith("9")) return "phoneInvalid"
  return undefined
}

export function getEmailError(email: string): "emailRequired" | "emailInvalid" | undefined {
  if (!email.trim()) return "emailRequired"
  if (/[\x00-\x1f\x7f]/.test(email)) return "emailInvalid"
  const value = email.trim()
  const parts = value.split("@")
  if (value.length > 254 || parts.length !== 2) return "emailInvalid"
  const [local, domain] = parts
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")
    || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return "emailInvalid"
  const labels = domain.split(".")
  if (labels.length < 2 || labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))
    || labels.at(-1)!.length < 2 || /^\d+$/.test(labels.at(-1)!)) return "emailInvalid"
  return undefined
}

export function getOtherInterestError(value: string): "otherInterestRequired" | "otherInterestInvalid" | undefined {
  if (!value.trim()) return "otherInterestRequired"
  return /[\x00-\x1f\x7f]/.test(value) || Array.from(value.trim()).length > MAX_OTHER_INTEREST_LENGTH
    ? "otherInterestInvalid" : undefined
}
