export type ContactRequestPayload = {
  type: string
  email: string
  cellphone: string
  description: string
  privacyAcknowledged: boolean
  whatsappConsent: boolean
  website: string
}

type ContactResponse = {
  success?: unknown
}

export class ContactRequestError extends Error {
  constructor(readonly status: number | null) {
    super("Contact request failed")
    this.name = "ContactRequestError"
  }
}

export async function sendContactRequest(payload: ContactRequestPayload) {
  let response: Response

  try {
    response = await fetch("/api/contact.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ContactRequestError(null)
  }

  let body: ContactResponse | null = null

  try {
    body = (await response.json()) as ContactResponse
  } catch {
    throw new ContactRequestError(response.status)
  }

  if (!response.ok || body.success !== true) {
    throw new ContactRequestError(response.status)
  }
}
