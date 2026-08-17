import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { AppSettings } from "./settings"
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

function readingId(reading: { date: string; time: string; type: string; value: number }): string {
  return `${reading.date}_${reading.time}_${reading.type}_${reading.value}`
}

export async function upsertReading(userId: string, reading: NewReading): Promise<string> {
  const id = readingId(reading)
  await setDoc(
    doc(readingsCollection(userId), id),
    { ...reading, createdAt: serverTimestamp() },
    { merge: true },
  )
  return id
}

export async function migrateReadingIds(userId: string): Promise<number> {
  const snap = await getDocs(readingsCollection(userId))
  const byDeterministicId = new Map<string, { docId: string; data: Record<string, unknown> }[]>()

  for (const d of snap.docs) {
    const data = d.data()
    const id = readingId({
      date: data.date as string,
      time: data.time as string,
      type: data.type as string,
      value: data.value as number,
    })
    const list = byDeterministicId.get(id) ?? []
    list.push({ docId: d.id, data: data as Record<string, unknown> })
    byDeterministicId.set(id, list)
  }

  let migrated = 0
  for (const [detId, entries] of byDeterministicId) {
    const alreadyCorrect = entries.length === 1 && entries[0].docId === detId
    if (alreadyCorrect) continue

    const keep = entries.find((e) => e.docId === detId) ?? entries[0]
    await setDoc(doc(readingsCollection(userId), detId), keep.data, { merge: true })

    for (const e of entries) {
      if (e.docId !== detId) {
        await deleteDoc(doc(readingsCollection(userId), e.docId))
        migrated++
      }
    }
  }

  return migrated
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

export function settingsRef(userId: string) {
  return doc(db, "users", userId, "settings", "config")
}

export async function updateSettings(userId: string, settings: Partial<AppSettings>) {
  await setDoc(settingsRef(userId), settings, { merge: true })
}

export async function deleteUserData(userId: string) {
  for (const col of [readingsCollection(userId), mealsCollection(userId)]) {
    const snap = await getDocs(col)
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }
  await deleteDoc(settingsRef(userId)).catch(() => {})
  await deleteDoc(doc(db, "users", userId)).catch(() => {})
}
