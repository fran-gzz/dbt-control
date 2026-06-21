"use client"

import { useState } from "react"
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
import { meals } from "@/lib/data"
import { CheckCircle2, Save } from "lucide-react"

export function MeasurementForm() {
  const searchParams = useSearchParams()
  const prefillMeal = searchParams.get("comida") ?? ""

  const today = "2026-06-07"
  const now = "14:30"

  const [submitted, setSubmitted] = useState(false)
  const [value, setValue] = useState("")
  const [meal, setMeal] = useState(prefillMeal)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3500)
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
              <span className="font-medium">Medición guardada correctamente (demo).</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" type="date" defaultValue={today} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hora">Hora</Label>
              <Input id="hora" type="time" defaultValue={now} required />
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
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipo">Tipo de medición</Label>
              <Select defaultValue="Ayunas">
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ayunas">Ayunas</SelectItem>
                  <SelectItem value="Desayuno">Desayuno</SelectItem>
                  <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                  <SelectItem value="Cena">Cena</SelectItem>
                  <SelectItem value="Antes de dormir">Antes de dormir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="comida">Comida relacionada</Label>
              <Select value={meal} onValueChange={(v) => setMeal(v ?? "")}>
                <SelectTrigger id="comida">
                  <SelectValue placeholder="Seleccionar comida" />
                </SelectTrigger>
                <SelectContent>
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
              <Select defaultValue="Ninguna">
                <SelectTrigger id="actividad">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ninguna">Ninguna</SelectItem>
                  <SelectItem value="Caminata 30 min">Caminata 30 min</SelectItem>
                  <SelectItem value="Gimnasio">Gimnasio</SelectItem>
                  <SelectItem value="Bicicleta">Bicicleta</SelectItem>
                  <SelectItem value="Yoga">Yoga</SelectItem>
                  <SelectItem value="Trote">Trote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="emocional">Estado emocional</Label>
            <Select defaultValue="Tranquilo">
              <SelectTrigger id="emocional">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tranquilo">Tranquilo</SelectItem>
                <SelectItem value="Feliz">Feliz</SelectItem>
                <SelectItem value="Enérgico">Enérgico</SelectItem>
                <SelectItem value="Cansado">Cansado</SelectItem>
                <SelectItem value="Estresado">Estresado</SelectItem>
                <SelectItem value="Ansioso">Ansioso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales sobre esta medición..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              <Save className="size-4" />
              Guardar medición
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
