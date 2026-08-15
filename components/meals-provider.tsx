"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onSnapshot } from "firebase/firestore"
import {
  addMeal as writeMeal,
  deleteMeal as removeMeal,
  mealsCollection,
  updateMeal as patchMeal,
} from "@/lib/firestore"
import { useAuth } from "@/components/auth-provider"
import type { Meal } from "@/lib/types"
import type { NewMeal } from "@/lib/firestore"

interface MealsContextValue {
  meals: Meal[]
  loading: boolean
  error: string
  addMeal: (meal: NewMeal) => Promise<string>
  updateMeal: (mealId: string, meal: NewMeal) => Promise<void>
  deleteMeal: (mealId: string) => Promise<void>
}

const MealsContext = createContext<MealsContextValue | undefined>(undefined)

export function MealsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!uid) return

    const unsub = onSnapshot(
      mealsCollection(uid),
      (snap) => {
        const items = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Meal,
        )
        setMeals(items)
        setLoading(false)
      },
      (err) => {
        setError(
          `No se pudo conectar con Firestore (${err.message}). Verificá que las reglas de seguridad permitan leer tus datos.`,
        )
        setLoading(false)
      },
    )

    return unsub
  }, [uid])

  async function addMeal(meal: NewMeal) {
    if (!user) throw new Error("No hay sesión iniciada")
    return writeMeal(user.uid, meal)
  }

  async function updateMeal(mealId: string, meal: NewMeal) {
    if (!user) throw new Error("No hay sesión iniciada")
    await patchMeal(user.uid, mealId, meal)
  }

  async function deleteMeal(mealId: string) {
    if (!user) throw new Error("No hay sesión iniciada")
    await removeMeal(user.uid, mealId)
  }

  return (
    <MealsContext.Provider value={{ meals, loading, error, addMeal, updateMeal, deleteMeal }}>
      {children}
    </MealsContext.Provider>
  )
}

export function MealsBoundary({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return (
    <MealsProvider key={user?.uid ?? "signed-out"}>{children}</MealsProvider>
  )
}

export function useMeals() {
  const ctx = useContext(MealsContext)
  if (!ctx) throw new Error("useMeals debe usarse dentro de MealsProvider")
  return ctx
}
