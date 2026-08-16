"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onSnapshot, orderBy, query } from "firebase/firestore"
import {
  addReading as writeReading,
  deleteReading as removeReading,
  readingsCollection,
  updateReading as patchReading,
} from "@/lib/firestore"
import { useAuth } from "@/components/auth-provider"
import type { Reading } from "@/lib/types"
import type { NewReading } from "@/lib/firestore"

interface ReadingsContextValue {
  readings: Reading[]
  loading: boolean
  error: string
  addReading: (reading: NewReading) => Promise<string>
  updateReading: (readingId: string, reading: NewReading) => Promise<void>
  deleteReading: (readingId: string) => Promise<void>
}

const ReadingsContext = createContext<ReadingsContextValue | undefined>(undefined)

export function ReadingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!uid) return

    const unsub = onSnapshot(
      query(readingsCollection(uid), orderBy("date", "desc")),
      (snap) => {
        const items = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Reading,
        )
        setReadings(items)
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

  async function addReading(reading: NewReading) {
    if (!user) throw new Error("No hay sesión iniciada")
    return writeReading(user.uid, reading)
  }

  async function updateReading(readingId: string, reading: NewReading) {
    if (!user) throw new Error("No hay sesión iniciada")
    await patchReading(user.uid, readingId, reading)
  }

  async function deleteReading(readingId: string) {
    if (!user) throw new Error("No hay sesión iniciada")
    await removeReading(user.uid, readingId)
  }

  return (
    <ReadingsContext.Provider value={{ readings, loading, error, addReading, updateReading, deleteReading }}>
      {children}
    </ReadingsContext.Provider>
  )
}

export function ReadingsBoundary({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return (
    <ReadingsProvider key={user?.uid ?? "signed-out"}>{children}</ReadingsProvider>
  )
}

export function useReadings() {
  const ctx = useContext(ReadingsContext)
  if (!ctx) throw new Error("useReadings debe usarse dentro de ReadingsProvider")
  return ctx
}
