"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { deleteUserData } from "@/lib/firestore"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Firebase only considers a login "recent" for ~5 minutes. Re-authenticating
// with the same window avoids surprises in user.delete() below.
const RECENT_LOGIN_WINDOW_MS = 5 * 60 * 1000

async function hasRecentLogin(user: User): Promise<boolean> {
  try {
    const token = await user.getIdTokenResult()
    return Date.now() - new Date(token.authTime).getTime() < RECENT_LOGIN_WINDOW_MS
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function logout() {
    await signOut(auth)
  }

  async function deleteAccount() {
    if (!user) throw new Error("No hay sesión iniciada")
    if (!(await hasRecentLogin(user))) {
      // Re-authenticate BEFORE deleting any data: if the user cancels the
      // popup, nothing is lost and the account stays intact.
      await reauthenticateWithPopup(user, new GoogleAuthProvider())
    }
    await deleteUserData(user.uid)
    await user.delete()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
