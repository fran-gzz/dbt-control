"use client"

import { useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useReadings } from "@/components/readings-provider"
import { useMeals } from "@/components/meals-provider"
import { useSettings } from "@/components/settings-provider"
import { computeStatus } from "@/lib/data"
import { Loader2, Save } from "lucide-react"
import type { MeasurementType, Reading } from "@/lib/types"

const mealTypes = ["Ayunas", "Desayuno", "Almuerzo", "Cena", "Antes de dormir"] as const
const activities = ["Ninguna", "Caminata 30 min", "Gimnasio", "Bicicleta", "Yoga", "Trote"]
const moods = ["Tranquilo", "Feliz", "Enérgico", "Cansado", "Estresado", "Ansioso"]

interface ReadingFormProps {
  reading: Reading
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReadingForm({ reading, open, onOpenChange }: ReadingFormProps) {
  const { updateReading } = useReadings()
  const { meals } = useMeals()
  const { settings } = useSettings()

  const [fecha, setFecha] = useState(reading.date)
  const [hora, setHora] = useState(reading.time)
  const [value, setValue] = useState(String(reading.value))
  const [tipo, setTipo] = useState<MeasurementType>(reading.type)
  const [meal, setMeal] = useState(reading.meal || "Ninguna")
  const [activity, setActivity] = useState(reading.activity || "Ninguna")
  const [mood, setMood] = useState(reading.mood || "Tranquilo")
  const [notes, setNotes] = useState(reading.notes)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const numericValue = Number(value)
    setSaving(true)
    setError("")
    try {
      await updateReading(reading.id, {
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
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === "permission-denied") {
        setError(
          "Firestore está rechazando la operación. Actualizá las reglas de seguridad en Firebase Console.",
        )
      } else {
        setError("No se pudo guardar la medición. Revisá tu conexión e intentá de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar medición</SheetTitle>
          <SheetDescription>Modificá los datos de la medición registrada.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-fecha">Fecha</Label>
              <Input id="r-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-hora">Hora</Label>
              <Input id="r-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="r-valor">Valor glucémico (mg/dL)</Label>
            <Input
              id="r-valor"
              type="number"
              inputMode="numeric"
              min={20}
              max={600}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="r-tipo">Tipo de medición</Label>
            <Select value={tipo} onValueChange={(v) => setTipo((v as MeasurementType) ?? "Ayunas")}>
              <SelectTrigger id="r-tipo">
                <SelectValue />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-comida">Comida</Label>
              <Select value={meal} onValueChange={(v) => setMeal(v ?? "Ninguna")}>
                <SelectTrigger id="r-comida">
                  <SelectValue />
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
              <Label htmlFor="r-actividad">Actividad</Label>
              <Select value={activity} onValueChange={(v) => setActivity(v ?? "Ninguna")}>
                <SelectTrigger id="r-actividad">
                  <SelectValue />
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
            <Label htmlFor="r-mood">Estado emocional</Label>
            <Select value={mood} onValueChange={(v) => setMood(v ?? "Tranquilo")}>
              <SelectTrigger id="r-mood">
                <SelectValue />
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
            <Label htmlFor="r-notes">Observaciones</Label>
            <Textarea
              id="r-notes"
              placeholder="Notas adicionales sobre esta medición..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <span className="font-medium text-destructive">{error}</span>
            </div>
          ) : null}

          <SheetFooter className="mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !fecha || !hora}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
