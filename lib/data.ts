import readingsData from "@/data/readings.json"
import mealsData from "@/data/meals.json"
import type { Reading, Meal, MeasurementStatus } from "./types"

export const readings: Reading[] = (readingsData as Reading[])
  .slice()
  .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))

export const meals: Meal[] = mealsData as Meal[]

export function statusColor(status: MeasurementStatus): string {
  switch (status) {
    case "alta":
      return "text-chart-5"
    case "baja":
      return "text-chart-2"
    default:
      return "text-chart-3"
  }
}

export function statusLabel(status: MeasurementStatus): string {
  switch (status) {
    case "alta":
      return "Alta"
    case "baja":
      return "Baja"
    default:
      return "Normal"
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

const allValues = readings.map((r) => r.value)

export const stats = {
  current: readings[0]?.value ?? 0,
  weeklyAverage: average(
    readings
      .filter((r) => {
        const d = new Date(r.date)
        const ref = new Date("2026-06-07")
        const diff = (ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= 7
      })
      .map((r) => r.value),
  ),
  monthCount: readings.length,
  generalAverage: average(allValues),
  max: Math.max(...allValues),
  min: Math.min(...allValues),
}

stats.weeklyAverage = stats.weeklyAverage || average(allValues)

export const hba1c = estimateHbA1c(stats.generalAverage)

// 30-day line trend (one point per day, averaged)
export function dailyTrend() {
  const byDate = new Map<string, number[]>()
  for (const r of readings) {
    if (!byDate.has(r.date)) byDate.set(r.date, [])
    byDate.get(r.date)!.push(r.value)
  }
  return Array.from(byDate.entries())
    .map(([date, values]) => ({
      date: new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      rawDate: date,
      value: average(values),
    }))
    .sort((a, b) => (a.rawDate < b.rawDate ? -1 : 1))
}

// Averages by moment of day
export function timeOfDayAverages() {
  const moments = ["Ayunas", "Desayuno", "Almuerzo", "Cena"]
  return moments.map((moment) => ({
    moment,
    value: average(readings.filter((r) => r.type === moment).map((r) => r.value)),
  }))
}

// Weekly trend (last ~5 weeks)
export function weeklyTrend() {
  const byWeek = new Map<number, number[]>()
  const ref = new Date("2026-06-07")
  for (const r of readings) {
    const d = new Date(r.date)
    const week = Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7))
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
export function distribution() {
  const counts: Record<MeasurementStatus, number> = { normal: 0, alta: 0, baja: 0 }
  for (const r of readings) counts[r.status]++
  return [
    { name: "Normal", value: counts.normal, key: "normal" as const },
    { name: "Alta", value: counts.alta, key: "alta" as const },
    { name: "Baja", value: counts.baja, key: "baja" as const },
  ]
}

export function inRangePercent() {
  const normal = readings.filter((r) => r.status === "normal").length
  return Math.round((normal / readings.length) * 100)
}
