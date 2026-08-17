export type MeasurementStatus =
  | "hipoglucemia"
  | "baja"
  | "en_objetivo"
  | "elevada"
  | "alta"
  | "muy_elevada"

export type MeasurementType = "Ayunas" | "Desayuno" | "Almuerzo" | "Cena" | "Antes de dormir"

export interface Reading {
  id: string
  value: number
  date: string // ISO date YYYY-MM-DD
  time: string // HH:mm
  type: MeasurementType
  meal: string
  activity: string
  mood: string
  notes: string
  status: MeasurementStatus
}

export interface Meal {
  id: string
  name: string
  ingredients: string[]
  carbs: number
  protein: number
  fat: number
}

export interface DailyTrend {
  date: string // display label
  value: number
}

export interface TimeOfDayAverage {
  moment: string
  value: number
}

export interface WeeklyTrend {
  week: string
  value: number
}
