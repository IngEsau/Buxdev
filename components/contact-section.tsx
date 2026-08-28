"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import { sendEmail } from "@/services/email"

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

    // sendEmail pasando los datos del formulario
    try {
      await sendEmail({
        type: `${formData.type}`,  // Asunto del email
        email: formData.email,  // El correo que el usuario ingresa
        cellphone: `${formData.countryCode} ${formData.phone}`,
        description: `${formData.description}\n\n`, // Contenido del correo
      })

      toast({
        title: "¡Mensaje enviado!",
        description: "Nos pondremos en contacto contigo pronto.",
      })

      // Resetear el formulario
      setFormData({
        type: "",
        countryCode: "+52",
        phone: "",
        email: "",
        description: "",
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar el mensaje. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <section id="contacto" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-balance">{t.contact.title}</h2>
            <p className="text-lg md:text-xl text-muted-foreground">{t.contact.subtitle}</p>
          </div>

          {/* Contact Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t.contact.formTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">{t.contact.formTitle}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder={t.contact.formTitle} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cotizacion">{t.contact.options.quote}</SelectItem>
                      <SelectItem value="informacion">{t.contact.options.info}</SelectItem>
                      <SelectItem value="duda">{t.contact.options.question}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t.contact.phone}</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    >
                      <SelectTrigger className="w-28">
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
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t.contact.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.contact.description}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t.contact.descriptionPlaceholder}
                    required
                    rows={5}
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2c4c9b] hover:bg-[#4a6bc7] text-white">
                  {t.contact.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
