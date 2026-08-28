import emailjs from "@emailjs/browser"

type SendEmailParams = {
  type: string
  email: string
  cellphone: string
  description: string
}

export const sendEmail = async ({
  type,
  email,
  cellphone,
  description,
}: SendEmailParams) => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

  const templateParams = {
    type,
    email,
    cellphone,
    description,
    time: new Date().toLocaleString(),
  }

  return emailjs.send(serviceId, templateId, templateParams, publicKey)
}
