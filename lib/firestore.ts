import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { MeasurementStatus } from "./types"

export interface NewReading {
  value: number
  date: string
  time: string
  type: string
  meal: string
  activity: string
  mood: string
  notes: string
  status: MeasurementStatus
}

export function readingsCollection(userId: string) {
  return collection(db, "users", userId, "readings")
}

export async function addReading(userId: string, reading: NewReading) {
  const docRef = await addDoc(readingsCollection(userId), {
    ...reading,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateReading(userId: string, readingId: string, reading: NewReading) {
  await updateDoc(doc(readingsCollection(userId), readingId), { ...reading })
}

export async function deleteReading(userId: string, readingId: string) {
  await deleteDoc(doc(readingsCollection(userId), readingId))
}

export interface NewMeal {
  name: string
  ingredients: string[]
  carbs: number
  protein: number
  fat: number
}

export function mealsCollection(userId: string) {
  return collection(db, "users", userId, "meals")
}

export async function addMeal(userId: string, meal: NewMeal) {
  const docRef = await addDoc(mealsCollection(userId), {
    ...meal,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateMeal(userId: string, mealId: string, meal: NewMeal) {
  await updateDoc(doc(mealsCollection(userId), mealId), { ...meal })
}

export async function deleteMeal(userId: string, mealId: string) {
  await deleteDoc(doc(mealsCollection(userId), mealId))
}
