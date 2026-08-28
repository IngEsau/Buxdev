"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpRight, Mail, Phone, Send } from "lucide-react"

import { sendEmail } from "@/services/email"

import styles from "./contact-section.module.css"

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+52", country: "MX" },
  { code: "+34", country: "ES" },
  { code: "+54", country: "AR" },
  { code: "+56", country: "CL" },
  { code: "+57", country: "CO" },
]

export function ContactSection() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    countryCode: "+52",
    phone: "",
    email: "",
    description: "",
  })

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 10) {
      setFormData({ ...formData, phone: cleaned })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      await sendEmail({
        type: `${formData.type}`,
        email: formData.email,
        cellphone: `${formData.countryCode} ${formData.phone}`,
        description: `${formData.description}\n\n`,
      })

      toast({
        title: t.contact.successTitle,
        description: t.contact.successDescription,
      })

      setFormData({
        type: "",
        countryCode: "+52",
        phone: "",
        email: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorDescription,
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

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

              <a href={`tel:${t.footer.phone}`} className={styles.contactLink}>
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
              <span className={styles.formStatus} aria-hidden="true" />
            </div>

            <form
              onSubmit={handleSubmit}
              className={styles.form}
              aria-labelledby="contact-form-title"
              aria-busy={isSubmitting}
            >
              <div className={styles.field}>
                <Label htmlFor="type">{t.contact.formTitle}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="type" className={styles.selectTrigger}>
                    <SelectValue placeholder={t.contact.formTitle} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotizacion">{t.contact.options.quote}</SelectItem>
                    <SelectItem value="informacion">{t.contact.options.info}</SelectItem>
                    <SelectItem value="duda">{t.contact.options.question}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.field}>
                <Label id="phone-label" htmlFor="phone">{t.contact.phone}</Label>
                <div className={styles.phoneField}>
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    disabled={isSubmitting}
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
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="1234567890"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <Label htmlFor="email">{t.contact.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.contact.emailPlaceholder}
                  required
                  autoComplete="email"
                  className={styles.input}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="description">{t.contact.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.contact.descriptionPlaceholder}
                  required
                  rows={5}
                  className={styles.textarea}
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                <span>{isSubmitting ? t.contact.submitting : t.contact.submit}</span>
                <Send aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
