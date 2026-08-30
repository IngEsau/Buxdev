"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle, Mail, Phone, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/hooks/use-language"
import { isEmailServiceConfigured, sendEmail } from "@/services/email"

import styles from "./contact-section.module.css"

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+52", country: "MX" },
  { code: "+34", country: "ES" },
  { code: "+54", country: "AR" },
  { code: "+56", country: "CL" },
  { code: "+57", country: "CO" },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const maxDescriptionLength = 2000

type ContactFormData = {
  type: string
  countryCode: string
  phone: string
  email: string
  description: string
  privacyAcknowledged: boolean
  whatsappConsent: boolean
}

type ValidatedField = "type" | "phone" | "email" | "description" | "privacyAcknowledged"
type ContactErrorKey =
  | "typeRequired"
  | "phoneRequired"
  | "phoneInvalid"
  | "emailRequired"
  | "emailInvalid"
  | "descriptionRequired"
  | "descriptionTooLong"
  | "privacyRequired"
type FormErrors = Partial<Record<ValidatedField, ContactErrorKey>>
type SubmissionStatus = "idle" | "submitting" | "success" | "error"

const fieldIds: Record<ValidatedField, string> = {
  type: "type",
  phone: "phone",
  email: "email",
  description: "description",
  privacyAcknowledged: "privacy-acknowledged",
}

const createInitialFormData = (): ContactFormData => ({
  type: "",
  countryCode: "+52",
  phone: "",
  email: "",
  description: "",
  privacyAcknowledged: false,
  whatsappConsent: false,
})

const normalizeNationalPhone = (phone: string, countryCode: string) => {
  const value = phone.trim()
  const digits = value.replace(/\D/g, "")

  if (!/^\+?[\d\s().-]+$/.test(value)) return null
  if (!value.startsWith("+")) return digits

  const countryDigits = countryCode.replace(/\D/g, "")
  return digits.startsWith(countryDigits) ? digits.slice(countryDigits.length) : null
}

const getPhoneError = (phone: string, countryCode: string): ContactErrorKey | undefined => {
  if (!phone.trim()) return "phoneRequired"

  const nationalDigits = normalizeNationalPhone(phone, countryCode)
  if (!nationalDigits) return "phoneInvalid"

  const internationalLength = `${countryCode}${nationalDigits}`.replace(/\D/g, "").length
  return nationalDigits.length < 7 || internationalLength > 15 ? "phoneInvalid" : undefined
}

export function ContactSection() {
  const { language, t } = useLanguage()
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<ContactFormData>(createInitialFormData)
  const emailServiceAvailable = isEmailServiceConfigured()
  const isSubmitting = status === "submitting"
  const hasValidationErrors = Object.keys(errors).length > 0
  const formDisabled = isSubmitting || !emailServiceAvailable
  const phoneHref = `tel:${t.footer.phone.replace(/[^\d+]/g, "")}`

  const clearTransientStatus = () => {
    if (status === "success" || status === "error") {
      setStatus("idle")
    }
  }

  const clearFieldError = (field: ValidatedField) => {
    setErrors((current) => {
      if (!current[field]) return current

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const updateField = <Field extends keyof ContactFormData>(field: Field, value: ContactFormData[Field]) => {
    setFormData((current) => ({ ...current, [field]: value }))

    if (field === "countryCode" && typeof value === "string") {
      setErrors((current) => {
        if (!current.phone) return current

        const phoneError = getPhoneError(formData.phone, value)
        const next = { ...current }

        if (phoneError) next.phone = phoneError
        else delete next.phone

        return next
      })
    } else if (
      field === "type" ||
      field === "phone" ||
      field === "email" ||
      field === "description" ||
      field === "privacyAcknowledged"
    ) {
      clearFieldError(field)
    }
    clearTransientStatus()
  }

  const validateForm = () => {
    const nextErrors: FormErrors = {}
    const email = formData.email.trim()
    const description = formData.description.trim()

    if (!formData.type) nextErrors.type = "typeRequired"

    const phoneError = getPhoneError(formData.phone, formData.countryCode)
    if (phoneError) nextErrors.phone = phoneError

    if (!email) {
      nextErrors.email = "emailRequired"
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "emailInvalid"
    }

    if (!description) {
      nextErrors.description = "descriptionRequired"
    } else if (description.length > maxDescriptionLength) {
      nextErrors.description = "descriptionTooLong"
    }

    if (!formData.privacyAcknowledged) {
      nextErrors.privacyAcknowledged = "privacyRequired"
    }

    return nextErrors
  }

  const focusFirstInvalidField = (nextErrors: FormErrors) => {
    const firstInvalidField = (Object.keys(nextErrors) as ValidatedField[])[0]
    if (!firstInvalidField) return

    window.requestAnimationFrame(() => document.getElementById(fieldIds[firstInvalidField])?.focus())
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !emailServiceAvailable) return

    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus("idle")
      focusFirstInvalidField(nextErrors)
      return
    }

    const nationalDigits = normalizeNationalPhone(formData.phone, formData.countryCode)
    if (!nationalDigits) return

    setErrors({})
    setStatus("submitting")

    try {
      await sendEmail({
        type: formData.type,
        email: formData.email.trim(),
        cellphone: `${formData.countryCode}${nationalDigits}`,
        description: formData.description.trim(),
        privacyAcknowledged: formData.privacyAcknowledged,
        whatsappConsent: formData.whatsappConsent,
      })

      setStatus("success")
      setFormData(createInitialFormData())
    } catch {
      setStatus("error")

      if (process.env.NODE_ENV === "development") {
        console.error("[contact] EmailJS request failed")
      }
    }
  }

  const feedbackVisible =
    !emailServiceAvailable || hasValidationErrors || status === "success" || status === "error"

  return (
    <section id="contacto" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.technicalGrid} aria-hidden="true" />
      <div className={styles.ambientLight} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              {t.contact.title}
            </p>

            <div className={styles.copy}>
              <h2 id="contact-title">{t.contact.subtitle}</h2>
              <p>{t.contact.directDescription}</p>
            </div>

            <address className={styles.contactList}>
              <a href={`mailto:${t.footer.email}`} className={styles.contactLink}>
                <span className={styles.contactIcon} aria-hidden="true">
                  <Mail />
                </span>
                <span>
                  <small>{t.contact.email}</small>
                  <strong>{t.footer.email}</strong>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>

              <a href={phoneHref} className={styles.contactLink}>
                <span className={styles.contactIcon} aria-hidden="true">
                  <Phone />
                </span>
                <span>
                  <small>{t.contact.phone}</small>
                  <strong>{t.footer.phone}</strong>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            </address>

            <div className={styles.signal} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className={styles.formPanel}>
            <div className={styles.formPanelHeader}>
              <span className={styles.formIndex}>01</span>
              <div>
                <p>{t.contact.title}</p>
                <h3 id="contact-form-title">{t.contact.formTitle}</h3>
              </div>
              <span
                className={styles.formStatus}
                data-state={!emailServiceAvailable ? "error" : hasValidationErrors ? "validation-error" : status}
                aria-hidden="true"
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
              aria-labelledby="contact-form-title"
              aria-describedby={feedbackVisible ? "contact-form-feedback" : undefined}
              aria-busy={isSubmitting}
              noValidate
            >
              {!emailServiceAvailable && (
                <div
                  id="contact-form-feedback"
                  className={styles.formFeedback}
                  data-variant="error"
                  role="status"
                >
                  <CircleAlert aria-hidden="true" />
                  <div>
                    <strong>{t.contact.unavailableTitle}</strong>
                    <p>{t.contact.unavailableDescription}</p>
                  </div>
                </div>
              )}

              {emailServiceAvailable && hasValidationErrors && (
                <div
                  id="contact-form-feedback"
                  className={styles.formFeedback}
                  data-variant="error"
                  role="alert"
                >
                  <CircleAlert aria-hidden="true" />
                  <p>{t.contact.validationSummary}</p>
                </div>
              )}

              {emailServiceAvailable && status === "success" && (
                <div
                  id="contact-form-feedback"
                  className={styles.formFeedback}
                  data-variant="success"
                  role="status"
                >
                  <CircleCheck aria-hidden="true" />
                  <div>
                    <strong>{t.contact.successTitle}</strong>
                    <p>{t.contact.successDescription}</p>
                  </div>
                </div>
              )}

              {emailServiceAvailable && status === "error" && (
                <div
                  id="contact-form-feedback"
                  className={styles.formFeedback}
                  data-variant="error"
                  role="alert"
                >
                  <CircleAlert aria-hidden="true" />
                  <div>
                    <strong>{t.contact.errorTitle}</strong>
                    <p>{t.contact.errorDescription}</p>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <Label htmlFor="type">{t.contact.formTitle}</Label>
                <Select
                  name="type"
                  value={formData.type}
                  onValueChange={(value) => updateField("type", value)}
                  disabled={formDisabled}
                  required
                >
                  <SelectTrigger
                    id="type"
                    className={styles.selectTrigger}
                    aria-required="true"
                    aria-invalid={Boolean(errors.type)}
                    aria-describedby={errors.type ? "type-error" : undefined}
                  >
                    <SelectValue placeholder={t.contact.formTitle} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotizacion">{t.contact.options.quote}</SelectItem>
                    <SelectItem value="informacion">{t.contact.options.info}</SelectItem>
                    <SelectItem value="duda">{t.contact.options.question}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p id="type-error" className={styles.fieldError}>
                    {t.contact.errors[errors.type]}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <Label id="phone-label" htmlFor="phone">
                  {t.contact.phone}
                </Label>
                <div className={styles.phoneField}>
                  <Select
                    name="countryCode"
                    value={formData.countryCode}
                    onValueChange={(value) => updateField("countryCode", value)}
                    disabled={formDisabled}
                  >
                    <SelectTrigger
                      id="country-code"
                      className={`${styles.selectTrigger} ${styles.countryCode}`}
                      aria-label={t.contact.countryCode}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.code} {item.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="1234567890"
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    className={styles.input}
                    disabled={formDisabled}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className={styles.fieldError}>
                    {t.contact.errors[errors.phone]}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <Label htmlFor="email">{t.contact.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  required
                  maxLength={254}
                  autoComplete="email"
                  className={styles.input}
                  disabled={formDisabled}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className={styles.fieldError}>
                    {t.contact.errors[errors.email]}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <Label htmlFor="description">{t.contact.description}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder={t.contact.descriptionPlaceholder}
                  required
                  rows={5}
                  className={styles.textarea}
                  disabled={formDisabled}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && (
                  <p id="description-error" className={styles.fieldError}>
                    {t.contact.errors[errors.description]}
                  </p>
                )}
              </div>

              <div id="contact-privacy-summary" className={styles.privacyNotice} lang="es">
                {language === "en" && <small lang="en">{t.legal.languageNotice}</small>}
                <p>
                  {t.contact.privacyNotice}{" "}
                  <Link href="/privacidad">{t.contact.privacyNoticeLink}</Link>.
                </p>
              </div>

              <div className={styles.consentGroup}>
                <div className={styles.consentControl} data-invalid={Boolean(errors.privacyAcknowledged)}>
                  <input
                    id="privacy-acknowledged"
                    name="privacyAcknowledged"
                    type="checkbox"
                    checked={formData.privacyAcknowledged}
                    onChange={(event) => updateField("privacyAcknowledged", event.target.checked)}
                    required
                    disabled={formDisabled}
                    aria-invalid={Boolean(errors.privacyAcknowledged)}
                    aria-describedby={
                      errors.privacyAcknowledged
                        ? "contact-privacy-summary privacy-acknowledged-error"
                        : "contact-privacy-summary"
                    }
                  />
                  <label htmlFor="privacy-acknowledged" lang="es">
                    {t.contact.privacyAcknowledgementPrefix}{" "}
                    <Link href="/privacidad">{t.contact.privacyAcknowledgementLink}</Link>
                    {t.contact.privacyAcknowledgementSuffix}
                  </label>
                </div>
                {errors.privacyAcknowledged && (
                  <p id="privacy-acknowledged-error" className={styles.fieldError}>
                    {t.contact.errors[errors.privacyAcknowledged]}
                  </p>
                )}

                <div className={styles.consentControl}>
                  <input
                    id="whatsapp-consent"
                    name="whatsappConsent"
                    type="checkbox"
                    checked={formData.whatsappConsent}
                    onChange={(event) => updateField("whatsappConsent", event.target.checked)}
                    disabled={formDisabled}
                  />
                  <label htmlFor="whatsapp-consent" lang="es">
                    {t.contact.whatsappConsent}
                  </label>
                </div>
              </div>

              <Button type="submit" className={styles.submitButton} disabled={formDisabled}>
                <span>
                  {!emailServiceAvailable
                    ? t.contact.unavailableSubmit
                    : isSubmitting
                      ? t.contact.submitting
                      : t.contact.submit}
                </span>
                {isSubmitting ? (
                  <LoaderCircle className={styles.loadingIcon} aria-hidden="true" />
                ) : (
                  <Send aria-hidden="true" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
