"use client"

import { useMemo, useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/stat-card"
import { useAuth } from "@/components/auth-provider"
import { useReadings } from "@/components/readings-provider"
import { useSettings } from "@/components/settings-provider"
import { buildReportPDF } from "@/lib/report"
import {
  hba1cFrom,
  inRangePercentFrom,
  statsFrom,
} from "@/lib/data"
import { Gauge, ListChecks, Activity, ClipboardList } from "lucide-react"

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export default function ReportePage() {
  const { user } = useAuth()
  const { readings } = useReadings()
  const { settings } = useSettings()

  const today = new Date()
  const defaultFrom = new Date(today.getTime() - 29 * 86400000)

  const [from, setFrom] = useState(toISODate(defaultFrom))
  const [to, setTo] = useState(toISODate(today))
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const periodReadings = useMemo(
    () => readings.filter((r) => r.date >= from && r.date <= to),
    [readings, from, to],
  )
  const stats = useMemo(() => statsFrom(periodReadings), [periodReadings])
  const percentInRange = useMemo(
    () => inRangePercentFrom(periodReadings),
    [periodReadings],
  )
  const hba1c = useMemo(
    () => (periodReadings.length > 0 ? hba1cFrom(periodReadings) : 0),
    [periodReadings],
  )

  const isValidRange = from <= to && from.length === 10 && to.length === 10

  async function handleGenerate() {
    if (!isValidRange) {
      setError("El período no es válido. Verificá las fechas.")
      return
    }
    setError("")
    setGenerating(true)
    try {
      const pdf = await buildReportPDF({
        name: user?.displayName || user?.email?.split("@")[0] || "Usuario",
        email: user?.email ?? "",
        from,
        to,
        minValue: settings.minValue,
        maxValue: settings.maxValue,
        readings,
      })
      const blob = new Blob([pdf.slice()], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte-glucemia-${from}-a-${to}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      setError("No se pudo generar el PDF. Intentá de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Reporte PDF"
        description="Generá un informe de tus mediciones para compartir con tu médico."
      />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Período del reporte</CardTitle>
              <CardDescription>
                Elegí el rango de fechas. El PDF incluirá métricas, gráficos y el detalle de cada
                medición del período.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="desde">Desde</Label>
                  <Input id="desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hasta">Hasta</Label>
                  <Input id="hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>
              {periodReadings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay mediciones en el período seleccionado. El PDF se generará igual pero sin
                  datos.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Promedio general"
              value={periodReadings.length > 0 ? String(stats.generalAverage) : "—"}
              unit="mg/dL"
              icon={Gauge}
              accent
            />
            <StatCard
              label="En rango"
              value={`${percentInRange}%`}
              icon={ListChecks}
              hint={`Rango ${settings.minValue}-${settings.maxValue}`}
            />
            <StatCard
              label="HbA1c estimada"
              value={periodReadings.length > 0 ? String(hba1c) : "—"}
              unit="%"
              icon={Activity}
              hint="Estimación ADAG"
            />
            <StatCard
              label="Mediciones"
              value={String(periodReadings.length)}
              icon={ClipboardList}
              hint="En el período"
            />
          </div>

          <div className="flex flex-col gap-3">
            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleGenerate} disabled={generating || !isValidRange}>
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                {generating ? "Generando..." : "Descargar PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
