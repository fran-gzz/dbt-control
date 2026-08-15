const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || "DBT Control <onboarding@resend.dev>"

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no está configurada en el entorno del servidor.")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend respondió ${res.status}: ${body}`)
  }
}
