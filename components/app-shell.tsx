"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-provider"
import { useReadings } from "@/components/readings-provider"

const PUBLIC_PATHS = ["/", "/login"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname)
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { error: readingsError } = useReadings()
  const pathname = usePathname()
  const router = useRouter()

  const publicPage = isPublicPath(pathname)

  useEffect(() => {
    if (loading) return
    if (user && (pathname === "/" || pathname === "/login")) {
      router.replace("/dashboard")
    } else if (!user && !publicPage) {
      router.replace("/login")
    }
  }, [user, loading, publicPage, pathname, router])

  if (loading) return <FullScreenLoader />

  if (publicPage) {
    if (user) return null
    return <>{children}</>
  }

  if (!user) return null

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {readingsError ? (
            <div className="flex flex-col gap-1 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:px-6">
              <span className="font-medium">Error de conexión con Firestore</span>
              <span>{readingsError}</span>
            </div>
          ) : null}
          {children}
          <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground md:px-6">
            <p>
              DBT Control — Herramienta de apoyo para el autocontrol. No reemplaza la consulta con
              un profesional de la salud.
            </p>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
