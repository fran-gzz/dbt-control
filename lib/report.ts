import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib"
import type { Reading, MeasurementStatus } from "@/lib/types"
import {
  computeStatus,
  dailyTrendFrom,
  distributionFrom,
  hba1cFrom,
  inRangePercentFrom,
  sortReadings,
  statsFrom,
  timeOfDayAveragesFrom,
} from "@/lib/data"

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 48
const MARGIN_BOTTOM = 72
const CONTENT_W = PAGE_W - MARGIN * 2

const INK = rgb(0.13, 0.15, 0.19)
const MUTED = rgb(0.42, 0.45, 0.51)
const BORDER = rgb(0.86, 0.88, 0.91)
const LIGHT = rgb(0.96, 0.97, 0.98)
const ACCENT = rgb(0.07, 0.52, 0.27)
const COLOR_HIPOGLUCEMIA = rgb(0.86, 0.15, 0.15)
const COLOR_BAJA = rgb(0.96, 0.62, 0.04)
const COLOR_EN_OBJETIVO = rgb(0.02, 0.59, 0.27)
const COLOR_ELEVADA = rgb(0.92, 0.7, 0.03)
const COLOR_ALTA = rgb(0.98, 0.45, 0.09)
const COLOR_MUY_ELEVADA = rgb(0.73, 0.11, 0.11)

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateLong(iso: string): string {
  return parseISODate(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function toLocalISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export interface ReportInput {
  name: string
  email: string
  from: string
  to: string
  minValue: number
  maxValue: number
  readings: Reading[]
}

function statusText(status: MeasurementStatus): { label: string; color: RGB } {
  switch (status) {
    case "hipoglucemia":
      return { label: "Hipoglucemia", color: COLOR_HIPOGLUCEMIA }
    case "baja":
      return { label: "Baja", color: COLOR_BAJA }
    case "en_objetivo":
      return { label: "En objetivo", color: COLOR_EN_OBJETIVO }
    case "elevada":
      return { label: "Elevada", color: COLOR_ELEVADA }
    case "alta":
      return { label: "Alta", color: COLOR_ALTA }
    case "muy_elevada":
      return { label: "Muy elevada", color: COLOR_MUY_ELEVADA }
  }
}

function addPage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE_W, PAGE_H])
}

function drawRightAligned(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB,
) {
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: rightX - width, y, size, font, color })
}

function drawFooter(page: PDFPage, font: PDFFont, generatedAt: string) {
  const footerY = MARGIN_BOTTOM - 40
  page.drawText(`DBT Control - Reporte de glucemia`, {
    x: MARGIN,
    y: footerY,
    size: 8,
    font,
    color: MUTED,
  })
  drawRightAligned(page, `Generado el ${formatDateLong(generatedAt)}`, PAGE_W - MARGIN, footerY, 8, font, MUTED)
  page.drawText("Herramienta de apoyo para el autocontrol. No reemplaza la consulta con un profesional de la salud.", {
    x: MARGIN,
    y: footerY - 12,
    size: 7.5,
    font,
    color: MUTED,
  })
}

function drawSectionTitle(
  page: PDFPage,
  fontBold: PDFFont,
  font: PDFFont,
  title: string,
  x: number,
  y: number,
): number {
  page.drawRectangle({
    x,
    y: y + 2,
    width: 3,
    height: 13,
    color: ACCENT,
  })
  page.drawText(title, { x: x + 10, y, size: 12, font: fontBold, color: INK })
  return y - 6
}

export async function buildReportPDF(input: ReportInput): Promise<Uint8Array> {
  const { name, email, from, to, minValue, maxValue } = input

  const periodReadings = sortReadings(
    input.readings.filter((r) => r.date >= from && r.date <= to),
  )
  const stats = statsFrom(periodReadings)
  const avg = stats.generalAverage
  const percentInRange = inRangePercentFrom(periodReadings)
  const hba1c = periodReadings.length > 0 ? hba1cFrom(periodReadings) : 0
  const distribution = distributionFrom(periodReadings)
  const distTotal = distribution.reduce((acc, d) => acc + d.value, 0)
  const generatedIso = toLocalISODate(new Date())

  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = addPage(doc)
  let y = PAGE_H - MARGIN

  // Header
  page.drawText("DBT Control", { x: MARGIN, y: y - 2, size: 18, font: fontBold, color: ACCENT })
  page.drawText("Reporte de control glucémico", {
    x: MARGIN,
    y: y - 18,
    size: 11,
    font,
    color: MUTED,
  })
  drawRightAligned(page, `Período: ${formatDate(from)} - ${formatDate(to)}`, PAGE_W - MARGIN, y - 8, 10, font, INK)
  y -= 34

  page.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_W, height: 1, color: BORDER })
  y -= 22

  page.drawText(`Paciente: ${name}`, { x: MARGIN, y, size: 10, font: fontBold, color: INK })
  if (email) {
    page.drawText(email, { x: MARGIN, y: y - 14, size: 9, font, color: MUTED })
  }
  drawRightAligned(page, `Rango objetivo: ${minValue} - ${maxValue} mg/dL`, PAGE_W - MARGIN, y, 10, font, INK)
  y -= 34

  // Metrics
  const metrics: { label: string; value: string }[] = [
    { label: "Promedio general", value: periodReadings.length > 0 ? `${avg} mg/dL` : "-" },
    { label: "En rango", value: `${percentInRange}%` },
    { label: "HbA1c estimada", value: periodReadings.length > 0 ? `${hba1c}%` : "-" },
    { label: "Mediciones", value: `${periodReadings.length}` },
  ]
  const gap = 12
  const boxW = (CONTENT_W - gap * 3) / 4
  const boxH = 62
  metrics.forEach((m, i) => {
    const x = MARGIN + i * (boxW + gap)
    page.drawRectangle({ x, y: y - boxH, width: boxW, height: boxH, color: LIGHT })
    page.drawText(m.value, {
      x: x + 10,
      y: y - boxH + 32,
      size: 16,
      font: fontBold,
      color: INK,
    })
    page.drawText(m.label, { x: x + 10, y: y - boxH + 14, size: 8, font, color: MUTED })
  })
  y -= boxH + 30

  // Daily trend line chart
  const trend = dailyTrendFrom(periodReadings)
  if (trend.length > 0) {
    y = drawSectionTitle(page, fontBold, font, "Promedio diario (mg/dL)", MARGIN, y) - 10

    const chartH = 120
    const chartBottom = y - chartH
    const chartTop = y
    const chartW = CONTENT_W
    const values = trend.map((t) => t.value)
    const lo = Math.min(...values, minValue)
    const hi = Math.max(...values, maxValue)
    const minY = Math.floor(lo - 20)
    const maxY = Math.ceil(hi + 20)

    const yFor = (v: number) => chartBottom + ((v - minY) / (maxY - minY)) * chartH
    const xFor = (i: number) =>
      trend.length === 1 ? MARGIN + chartW / 2 : MARGIN + (i / (trend.length - 1)) * chartW

    // Reference lines
    const refLines = [
      { value: maxValue, color: COLOR_ALTA },
      { value: minValue, color: COLOR_BAJA },
    ]
    for (const ref of refLines) {
      const ry = yFor(ref.value)
      page.drawLine({
        start: { x: MARGIN, y: ry },
        end: { x: MARGIN + chartW, y: ry },
        thickness: 0.8,
        color: ref.color,
        opacity: 0.4,
        dashArray: [3, 3],
      })
      page.drawText(String(ref.value), { x: MARGIN - 14, y: ry - 4, size: 7, font, color: MUTED })
    }

    // Y axis
    page.drawLine({
      start: { x: MARGIN, y: chartBottom },
      end: { x: MARGIN, y: chartTop },
      thickness: 1,
      color: BORDER,
    })
    for (const tick of [minY, Math.round((minY + maxY) / 2), maxY]) {
      page.drawText(String(tick), { x: MARGIN - 14, y: yFor(tick) - 4, size: 7, font, color: MUTED })
    }

    // X labels (first, middle, last; deduplicated so a single point is drawn once)
    const midIdx = Math.floor((trend.length - 1) / 2)
    const xLabelIndexes = [...new Set([0, midIdx, trend.length - 1])]
    for (const idx of xLabelIndexes) {
      const label = trend[idx]
      const width = font.widthOfTextAtSize(label.date, 7)
      if (trend.length === 1) {
        page.drawText(label.date, {
          x: MARGIN + chartW / 2 - width / 2,
          y: chartBottom - 12,
          size: 7,
          font,
          color: MUTED,
        })
      } else if (idx === 0) {
        page.drawText(label.date, { x: xFor(idx), y: chartBottom - 12, size: 7, font, color: MUTED })
      } else if (idx === trend.length - 1) {
        drawRightAligned(page, label.date, xFor(idx), chartBottom - 12, 7, font, MUTED)
      } else {
        page.drawText(label.date, { x: xFor(idx) - width / 2, y: chartBottom - 12, size: 7, font, color: MUTED })
      }
    }

    // Line
    const points = trend.map((t, i) => ({ x: xFor(i), y: yFor(t.value) }))
    for (let i = 1; i < points.length; i++) {
      page.drawLine({
        start: points[i - 1],
        end: points[i],
        thickness: 1.5,
        color: ACCENT,
      })
    }
    for (const p of points) {
      page.drawRectangle({ x: p.x - 1.5, y: p.y - 1.5, width: 3, height: 3, color: ACCENT })
    }

    y = chartBottom - 40
  }

  // Time of day averages
  const moments = timeOfDayAveragesFrom(periodReadings).filter((m) => m.value > 0)
  if (moments.length > 0) {
    y = drawSectionTitle(page, fontBold, font, "Promedios por momento del día", MARGIN, y) - 14
    const maxMoment = Math.max(...moments.map((m) => m.value))
    const barMaxW = 260
    for (const m of moments) {
      const barW = Math.max((m.value / maxMoment) * barMaxW, 6)
      page.drawText(m.moment, { x: MARGIN, y, size: 9, font, color: INK })
      page.drawRectangle({ x: MARGIN + 130, y: y - 4, width: barW, height: 10, color: ACCENT })
      page.drawText(`${m.value} mg/dL`, { x: MARGIN + 130 + barW + 8, y, size: 9, font: fontBold, color: INK })
      y -= 20
    }
    y -= 14
  }

  // Distribution
  if (distTotal > 0) {
    y = drawSectionTitle(page, fontBold, font, "Distribución", MARGIN, y) - 14
    const barMaxW = 260
    for (const d of distribution) {
      const pct = Math.round((d.value / distTotal) * 100)
      const color =
        d.key === "hipoglucemia"
          ? COLOR_HIPOGLUCEMIA
          : d.key === "baja"
            ? COLOR_BAJA
            : d.key === "en_objetivo"
              ? COLOR_EN_OBJETIVO
              : d.key === "elevada"
                ? COLOR_ELEVADA
                : d.key === "muy_elevada"
                  ? COLOR_MUY_ELEVADA
                  : COLOR_ALTA
      const barW = (d.value / distTotal) * barMaxW
      page.drawText(d.name, { x: MARGIN, y, size: 9, font, color: INK })
      page.drawRectangle({ x: MARGIN + 130, y: y - 4, width: Math.max(barW, 6), height: 10, color })
      page.drawText(`${pct}% (${d.value})`, { x: MARGIN + 130 + barW + 8, y, size: 9, font: fontBold, color: INK })
      y -= 20
    }
    y -= 14
  }

  // Readings table
  if (periodReadings.length > 0) {
    const cols = [
      { label: "Fecha", width: 90 },
      { label: "Hora", width: 55 },
      { label: "Valor", width: 70 },
      { label: "Tipo", width: 130 },
      { label: "Estado", width: 80 },
    ]
    const rowH = 18

    y = drawSectionTitle(page, fontBold, font, `Detalle de mediciones (${periodReadings.length})`, MARGIN, y) - 12

    function drawHeader(page: PDFPage, y: number): number {
      let hx = MARGIN
      page.drawRectangle({ x: MARGIN, y: y - rowH + 4, width: CONTENT_W, height: rowH, color: LIGHT })
      for (const c of cols) {
        page.drawText(c.label, { x: hx + 6, y: y - rowH + 9, size: 8.5, font: fontBold, color: INK })
        hx += c.width
      }
      return y - rowH
    }

    y = drawHeader(page, y)

    for (const r of periodReadings) {
      if (y < MARGIN_BOTTOM) {
        page = addPage(doc)
        drawFooter(page, font, generatedIso)
        y = PAGE_H - MARGIN - 20
        y = drawHeader(page, y)
      }
      const status = statusText(computeStatus(r.value, r.type))
      const cells = [
        { text: formatDate(r.date), w: cols[0].width },
        { text: r.time, w: cols[1].width },
        { text: `${r.value} mg/dL`, w: cols[2].width },
        { text: r.type, w: cols[3].width },
      ]
      let cx = MARGIN
      for (const cell of cells) {
        page.drawText(cell.text, { x: cx + 6, y: y - rowH + 5, size: 9, font, color: INK })
        cx += cell.w
      }
      page.drawText(status.label, {
        x: cx + 6,
        y: y - rowH + 5,
        size: 9,
        font: fontBold,
        color: status.color,
      })
      page.drawLine({
        start: { x: MARGIN, y: y - rowH + 1 },
        end: { x: MARGIN + CONTENT_W, y: y - rowH + 1 },
        thickness: 0.6,
        color: BORDER,
      })
      y -= rowH
    }
  }

  drawFooter(page, font, generatedIso)

  return doc.save()
}
