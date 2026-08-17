import type { Reading, MeasurementStatus, MeasurementType } from "./types"
import { parseISODate } from "./utils"

export function statusColor(status: MeasurementStatus): string {
  switch (status) {
    case "hipoglucemia":
      return "text-red-600"
    case "baja":
      return "text-amber-500"
    case "en_objetivo":
      return "text-emerald-600"
    case "elevada":
      return "text-yellow-500"
    case "alta":
      return "text-orange-500"
    case "muy_elevada":
      return "text-red-700"
  }
}

export function statusLabel(status: MeasurementStatus): string {
  switch (status) {
    case "hipoglucemia":
      return "Hipoglucemia"
    case "baja":
      return "Baja"
    case "en_objetivo":
      return "En objetivo"
    case "elevada":
      return "Elevada"
    case "alta":
      return "Alta"
    case "muy_elevada":
      return "Muy elevada"
  }
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function estimateHbA1c(avgGlucose: number): number {
  // ADAG formula: A1c = (avg + 46.7) / 28.7
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10
}

export function computeStatus(value: number, type: MeasurementType): MeasurementStatus {
  if (type === "Ayunas" || type === "Antes de dormir") {
    if (value < 70) return "hipoglucemia"
    if (value < 80) return "baja"
    if (value <= 130) return "en_objetivo"
    if (value <= 180) return "elevada"
    return "alta"
  }
  if (value < 70) return "hipoglucemia"
  if (value < 180) return "en_objetivo"
  if (value < 250) return "elevada"
  return "muy_elevada"
}

export function sortReadings(readings: Reading[]): Reading[] {
  return [...readings].sort((a, b) => {
    const key = a.date + a.time
    const other = b.date + b.time
    if (key < other) return 1
    if (key > other) return -1
    return 0
  })
}

export function statsFrom(readings: Reading[]) {
  const allValues = readings.map((r) => r.value)
  const latest = sortReadings(readings)[0]
  const now = new Date()
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`
  const ref = parseISODate(todayIso).getTime()

  return {
    current: latest?.value ?? 0,
    weeklyAverage: average(
      readings
        .filter((r) => {
          const diff = (ref - parseISODate(r.date).getTime()) / (1000 * 60 * 60 * 24)
          return diff >= 0 && diff <= 7
        })
        .map((r) => r.value),
    ),
    monthCount: readings.length,
    generalAverage: average(allValues),
    max: allValues.length > 0 ? Math.max(...allValues) : 0,
    min: allValues.length > 0 ? Math.min(...allValues) : 0,
  }
}

export function hba1cFrom(readings: Reading[]): number {
  const avg = statsFrom(readings).generalAverage
  return avg > 0 ? estimateHbA1c(avg) : 0
}

// Daily trend (one point per day, averaged). Optionally limited to the last
// N days relative to the most recent reading.
export function dailyTrendFrom(readings: Reading[], days?: number) {
  const latest = sortReadings(readings)[0]
  const ref = latest ? new Date(latest.date).getTime() : 0
  const byDate = new Map<string, number[]>()
  for (const r of readings) {
    if (days !== undefined) {
      const diff = (ref - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)
      if (diff < 0 || diff > days) continue
    }
    if (!byDate.has(r.date)) byDate.set(r.date, [])
    byDate.get(r.date)!.push(r.value)
  }
  return Array.from(byDate.entries())
    .map(([date, values]) => ({
      date: parseISODate(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      rawDate: date,
      value: average(values),
    }))
    .sort((a, b) => (a.rawDate < b.rawDate ? -1 : 1))
}

// Averages by moment of day
export function timeOfDayAveragesFrom(readings: Reading[]) {
  const moments: MeasurementType[] = ["Ayunas", "Desayuno", "Almuerzo", "Cena", "Antes de dormir"]
  return moments.map((moment) => ({
    moment,
    value: average(readings.filter((r) => r.type === moment).map((r) => r.value)),
  }))
}

// Weekly trend (one bar per week relative to the most recent reading),
// optionally limited to the last N weeks.
export function weeklyTrendFrom(readings: Reading[], weeks?: number) {
  const byWeek = new Map<number, number[]>()
  const latest = sortReadings(readings)[0]
  const ref = latest ? new Date(latest.date) : new Date(0)
  for (const r of readings) {
    const d = new Date(r.date)
    const diff = (ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) continue
    const week = Math.floor(diff / 7)
    if (weeks !== undefined && week >= weeks) continue
    if (!byWeek.has(week)) byWeek.set(week, [])
    byWeek.get(week)!.push(r.value)
  }
  return Array.from(byWeek.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([week, values]) => ({
      week: week === 0 ? "Esta semana" : `Hace ${week} sem`,
      value: average(values),
    }))
    .reverse()
}

// Distribution of measurements by status
export function distributionFrom(readings: Reading[]) {
  const counts: Record<MeasurementStatus, number> = {
    hipoglucemia: 0,
    baja: 0,
    en_objetivo: 0,
    elevada: 0,
    alta: 0,
    muy_elevada: 0,
  }
  for (const r of readings) counts[computeStatus(r.value, r.type)]++
  return [
    { name: "Hipoglucemia", value: counts.hipoglucemia, key: "hipoglucemia" as const },
    { name: "Baja", value: counts.baja, key: "baja" as const },
    { name: "En objetivo", value: counts.en_objetivo, key: "en_objetivo" as const },
    { name: "Elevada", value: counts.elevada, key: "elevada" as const },
    { name: "Alta", value: counts.alta, key: "alta" as const },
    { name: "Muy elevada", value: counts.muy_elevada, key: "muy_elevada" as const },
  ]
}

export function inRangePercentFrom(readings: Reading[]): number {
  if (readings.length === 0) return 0
  const inRange = readings.filter((r) => computeStatus(r.value, r.type) === "en_objetivo").length
  return Math.round((inRange / readings.length) * 100)
}
