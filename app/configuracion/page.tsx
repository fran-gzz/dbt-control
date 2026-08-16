"use client"

import { useState } from "react"
import { AlertTriangle, Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/components/auth-provider"
import { useSettings } from "@/components/settings-provider"
import type { AppSettings } from "@/lib/settings"

function draftFromSettings(settings: AppSettings) {
  return {
    minValue: String(settings.minValue),
    maxValue: String(settings.maxValue),
    weeklySummary: settings.notifications.weeklySummary,
  }
}

export default function ConfiguracionPage() {
  const { user, deleteAccount } = useAuth()
  const { settings, loading, updateSettings } = useSettings()

  const [draft, setDraft] = useState(draftFromSettings(settings))
  const [prevSettings, setPrevSettings] = useState(settings)

  const settingsChanged =
    !loading &&
    (prevSettings.minValue !== settings.minValue ||
      prevSettings.maxValue !== settings.maxValue ||
      prevSettings.notifications.weeklySummary !== settings.notifications.weeklySummary)

  if (settingsChanged) {
    setDraft(draftFromSettings(settings))
    setPrevSettings(settings)
  }

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  async function handleSave() {
    const min = Number(draft.minValue)
    const max = Number(draft.maxValue)

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setError("Ingresá valores numéricos válidos.")
      return
    }
    if (min < 20 || max > 600) {
      setError("Los límites deben estar entre 20 y 600 mg/dL.")
      return
    }
    if (min >= max) {
      setError("El límite inferior debe ser menor que el superior.")
      return
    }

    setSaving(true)
    setError("")
    setSaved(false)
    try {
      await updateSettings({
        minValue: min,
        maxValue: max,
        notifications: { weeklySummary: draft.weeklySummary },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === "permission-denied") {
        setError(
          "Firestore está rechazando la escritura. Actualizá las reglas de seguridad en Firebase Console.",
        )
      } else {
        setError("No se pudieron guardar los cambios. Revisá tu conexión e intentá de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteAccount()
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setDeleteError("Para eliminar la cuenta hay que volver a confirmar tu sesión de Google.")
      } else {
        setDeleteError("No se pudo eliminar la cuenta. Intentá de nuevo más tarde.")
      }
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Configuración" description="Ajustá tus rangos objetivo y preferencias de la aplicación." />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Información de tu cuenta de Google.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={user?.displayName ?? ""} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email ?? ""} readOnly />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu perfil proviene de tu cuenta de Google y no se puede editar acá.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rangos objetivo</CardTitle>
              <CardDescription>
                Estos límites definen qué considerás normal, alto y bajo. Se aplican en el gráfico, las
                estadísticas, el historial y el cálculo de estado de cada medición.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="min">Límite inferior (mg/dL)</Label>
                  <Input
                    id="min"
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={600}
                    value={draft.minValue}
                    onChange={(e) => setDraft((d) => ({ ...d, minValue: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="max">Límite superior (mg/dL)</Label>
                  <Input
                    id="max"
                    type="number"
                    inputMode="numeric"
                    min={20}
                    max={600}
                    value={draft.maxValue}
                    onChange={(e) => setDraft((d) => ({ ...d, maxValue: e.target.value }))}
                  />
                </div>
              </div>
              {!loading && (
                <p className="text-sm text-muted-foreground">
                  Las mediciones entre {draft.minValue || "—"} y {draft.maxValue || "—"} mg/dL se
                  considerarán normales.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Preferencias de avisos por email.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Resumen semanal</span>
                  <span className="text-sm text-muted-foreground">
                    Recibí cada lunes un resumen por email con tus estadísticas de la semana.
                  </span>
                </div>
                <Switch
                  checked={draft.weeklySummary}
                  onCheckedChange={(v) => setDraft((d) => ({ ...d, weeklySummary: v ?? false }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {saved ? (
              <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm text-emerald-600">
                Cambios guardados correctamente.
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Zona de peligro
              </CardTitle>
              <CardDescription>
                Eliminá tu cuenta de forma permanente. Se borrarán todas tus mediciones, comidas y
                preferencias, y ya no podrás recuperarlos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="self-start">
                    Eliminar mi cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">
                      ¿Eliminar tu cuenta para siempre?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Se eliminarán todas tus mediciones, comidas y
                      preferencias de DBT Control, así como tu cuenta de acceso. Para confirmar,
                      escribí tu email: <span className="font-medium text-foreground">{user?.email}</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Escribí tu email para confirmar"
                      autoComplete="off"
                    />
                    {deleteError ? (
                      <p className="text-sm text-destructive">{deleteError}</p>
                    ) : null}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="outline" disabled={deleting}>
                        Cancelar
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        disabled={deleting || confirmEmail !== user?.email}
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete()
                        }}
                      >
                        {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                        {deleting ? "Eliminando..." : "Eliminar cuenta"}
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
