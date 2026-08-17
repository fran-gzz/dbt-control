import { NextResponse, type NextRequest } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { sendEmail } from "@/lib/email"
import { estimateHbA1c, inRangePercentFrom, statsFrom } from "@/lib/data"
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/settings"
import type { Reading } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET

async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      await fn(items[index])
    }
  })
  await Promise.all(workers)
}

function dateNDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${month}-${day}`
}

function weeklySummaryEmail(settings: AppSettings, userEmail: string, origin: string) {
  return {
    to: userEmail,
    subject: "Tu resumen semanal de DBT Control",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h1 style="font-size:20px;color:#111827;">Tu resumen semanal</h1>
        <p style="color:#6b7280;">Estadísticas de tus mediciones de la última semana.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Mediciones registradas</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">TODO_MEDICIONES</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Promedio semanal</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">TODO_PROMEDIO mg/dL</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">% dentro de rango (${settings.minValue}-${settings.maxValue})</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">TODO_PORCENTAJE%</td>
          </tr>
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#6b7280;">HbA1c estimada</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">TODO_HBA1C%</td>
          </tr>
        </table>
        <p style="margin-top:20px;">
          <a href="${origin}/estadisticas" style="display:inline-block;background:#16a34a;color:#ffffff;padding:10px 16px;border-radius:8px;text-decoration:none;">Ver mis estadísticas</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Si ya no querés recibir estos resúmenes, desactivá la opción en Configuración → Notificaciones.</p>
      </div>
    `,
    text: `Tu resumen semanal de DBT Control\n\nMediciones registradas: TODO_MEDICIONES\nPromedio semanal: TODO_PROMEDIO mg/dL\n% dentro de rango: TODO_PORCENTAJE%\nHbA1c estimada: TODO_HBA1C%\n\nPara dejar de recibirlo, desactivá la opción en Configuración.`,
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const origin = new URL(request.url).origin
  const result = { sent: 0, skipped: 0, failed: 0 }
  const errors: string[] = []

  try {
    const db = adminDb()

    async function listAllUsers(nextPageToken?: string): Promise<import("firebase-admin/auth").UserRecord[]> {
      const { users, pageToken } = await adminAuth().listUsers(1000, nextPageToken)
      let all = users
      if (pageToken) {
        all = all.concat(await listAllUsers(pageToken))
      }
      return all
    }

    const users = await listAllUsers()

    await mapWithConcurrency(users, 10, async (user) => {
      try {
        const userEmail = user.email
        if (!userEmail) {
          result.skipped++
          return
        }

        const settingsSnap = await db.collection("users").doc(user.uid).collection("settings").doc("config").get()
        const stored = settingsSnap.exists ? (settingsSnap.data() ?? {}) : {}
        const settings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...stored,
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(stored.notifications ?? {}),
          },
        } as AppSettings

        if (!settings.notifications.weeklySummary) {
          result.skipped++
          return
        }

        const readingsSnap = await db
          .collection("users")
          .doc(user.uid)
          .collection("readings")
          .where("date", ">=", dateNDaysAgo(6))
          .get()

        const readings: Reading[] = readingsSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Reading,
        )

        if (readings.length === 0) {
          result.skipped++
          return
        }

        const stats = statsFrom(readings)
        const avg = stats.generalAverage
        const percent = inRangePercentFrom(readings)
        const hba1c = estimateHbA1c(avg)
        const originSafe = origin || "https://dbt-control.vercel.app"

        const emailPayload = weeklySummaryEmail(settings, userEmail, originSafe)
        await sendEmail({
          to: emailPayload.to,
          subject: emailPayload.subject,
          html: emailPayload.html
            .replaceAll("TODO_MEDICIONES", String(readings.length))
            .replaceAll("TODO_PROMEDIO", String(avg))
            .replaceAll("TODO_PORCENTAJE", String(percent))
            .replaceAll("TODO_HBA1C", String(hba1c)),
          text: emailPayload.text
            .replaceAll("TODO_MEDICIONES", String(readings.length))
            .replaceAll("TODO_PROMEDIO", String(avg))
            .replaceAll("TODO_PORCENTAJE", String(percent))
            .replaceAll("TODO_HBA1C", String(hba1c)),
        })
        result.sent++
      } catch (err) {
        result.failed++
        errors.push(`${user.uid}: ${(err as Error).message}`)
      }
    })
  } catch (err) {
    return NextResponse.json(
      { error: `El resumen semanal falló: ${(err as Error).message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ...result, errors })
}
