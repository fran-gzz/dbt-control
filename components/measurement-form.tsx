"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { computeStatus } from "@/lib/data"
import { useReadings } from "@/components/readings-provider"
import { useMeals } from "@/components/meals-provider"
import { useSettings } from "@/components/settings-provider"
import { CheckCircle2, Loader2, Save } from "lucide-react"
import type { MeasurementType } from "@/lib/types"

const mealTypes = ["Ayunas", "Desayuno", "Almuerzo", "Cena", "Antes de dormir"] as const
const activities = ["Ninguna", "Caminata 30 min", "Gimnasio", "Bicicleta", "Yoga", "Trote"]
const moods = ["Tranquilo", "Feliz", "Enérgico", "Cansado", "Estresado", "Ansioso"]

export function MeasurementForm() {
  const searchParams = useSearchParams()
  const prefillMeal = searchParams.get("comida") ?? ""
  const { addReading } = useReadings()
  const { meals, loading: mealsLoading } = useMeals()
  const { settings } = useSettings()

  const [fecha, setFecha] = useState("")
  const [hora, setHora] = useState("")
  const [value, setValue] = useState("")
  const [tipo, setTipo] = useState<MeasurementType>("Ayunas")
  const [meal, setMeal] = useState(prefillMeal || "Ninguna")
  const [mealReset, setMealReset] = useState(false)
  const [activity, setActivity] = useState("Ninguna")
  const [mood, setMood] = useState("Tranquilo")
  const [notes, setNotes] = useState("")

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const now = new Date()
      setFecha(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
          now.getDate(),
        ).padStart(2, "0")}`,
      )
      setHora(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      )
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const mealIsValid = meal === "Ninguna" || meals.some((m) => m.name === meal)
  if (!mealsLoading && !mealIsValid && !mealReset) {
    setMeal("Ninguna")
    setMealReset(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const numericValue = Number(value)
    setSaving(true)
    setError("")
    try {
      await addReading({
        value: numericValue,
        date: fecha,
        time: hora,
        type: tipo,
        meal,
        activity,
        mood,
        notes,
        status: computeStatus(numericValue, settings.minValue, settings.maxValue),
      })
      setSubmitted(true)
      setValue("")
      setNotes("")
      setTimeout(() => setSubmitted(false), 3500)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === "permission-denied") {
        setError(
          "Firestore está rechazando la escritura. Actualizá las reglas de seguridad en Firebase Console (Reglas del Cloud Firestore).",
        )
      } else {
        setError("No se pudo guardar la medición. Revisá tu conexión e intentá de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Registrar medición</CardTitle>
          <CardDescription>Completá los datos de tu medición de glucemia.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {submitted ? (
            <div className="flex items-center gap-3 rounded-xl border border-chart-3/30 bg-chart-3/10 p-4 text-sm">
              <CheckCircle2 className="size-5 text-chart-3" />
              <span className="font-medium">Medición guardada correctamente.</span>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <span className="font-medium text-destructive">{error}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="valor">Valor glucémico (mg/dL)</Label>
              <Input
                id="valor"
                type="number"
                inputMode="numeric"
                placeholder="Ej. 108"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                min={20}
                max={600}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo de medición</Label>
              <Select value={tipo} onValueChange={(v) => setTipo((v as MeasurementType) ?? "Ayunas")}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="comida">Comida relacionada</Label>
              <Select value={meal} onValueChange={(v) => setMeal(v ?? "Ninguna")}>
                <SelectTrigger id="comida">
                  <SelectValue placeholder="Seleccionar comida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguna">Ninguna</SelectItem>
                  {meals.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="actividad">Actividad física</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v ?? "Ninguna")}>
                <SelectTrigger id="actividad">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="emocional">Estado emocional</Label>
            <Select value={mood} onValueChange={(v) => setMood(v ?? "Tranquilo")}>
              <SelectTrigger id="emocional">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {moods.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales sobre esta medición..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={saving || !fecha || !hora}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Guardando..." : "Guardar medición"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
