import emailjs from "@emailjs/browser"

type SendEmailParams = {
  type: string
  email: string
  cellphone: string
  description: string
}

const emailServiceConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() ?? "",
}

export function isEmailServiceConfigured() {
  return Object.values(emailServiceConfig).every(Boolean)
}

export const sendEmail = async ({
  type,
  email,
  cellphone,
  description,
}: SendEmailParams) => {
  if (!isEmailServiceConfigured()) {
    throw new Error("Email service is not configured")
  }

  const templateParams = {
    type,
    email,
    cellphone,
    description,
    time: new Date().toLocaleString(),
  }

  return emailjs.send(
    emailServiceConfig.serviceId,
    emailServiceConfig.templateId,
    templateParams,
    emailServiceConfig.publicKey,
  )
}
