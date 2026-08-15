"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onSnapshot } from "firebase/firestore"
import { settingsRef, updateSettings as writeSettings } from "@/lib/firestore"
import { useAuth } from "@/components/auth-provider"
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/settings"

interface SettingsContextValue {
  settings: AppSettings
  loading: boolean
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const unsub = onSnapshot(
      settingsRef(uid),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() } as AppSettings)
        } else {
          setSettings(DEFAULT_SETTINGS)
        }
        setLoading(false)
      },
      () => setLoading(false),
    )

    return unsub
  }, [uid])

  async function updateSettings(patch: Partial<AppSettings>) {
    if (!user) throw new Error("No hay sesión iniciada")
    await writeSettings(user.uid, patch)
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function SettingsBoundary({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <SettingsProvider key={user?.uid ?? "signed-out"}>{children}</SettingsProvider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings debe usarse dentro de SettingsProvider")
  return ctx
}
