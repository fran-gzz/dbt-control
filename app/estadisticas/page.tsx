"use client"

import { Activity, ArrowDown, ArrowUp, Gauge, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { EmptyState } from "@/components/empty-state"
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart"
import { DistributionChart } from "@/components/charts/distribution-chart"
import { InRangeChart } from "@/components/charts/in-range-chart"
import { useReadings } from "@/components/readings-provider"
import { useSettings } from "@/components/settings-provider"
import {
  distributionFrom,
  hba1cFrom,
  inRangePercentFrom,
  statsFrom,
  weeklyTrendFrom,
} from "@/lib/data"

export default function EstadisticasPage() {
  const { readings, loading } = useReadings()
  const { settings } = useSettings()
  const stats = statsFrom(readings)
  const hba1c = hba1cFrom(readings)
  const hasReadings = readings.length > 0

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Estadísticas" description="Analizá tus tendencias y métricas de glucemia." />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {loading && !hasReadings ? null : !hasReadings ? (
          <EmptyState
            icon={TrendingUp}
            title="No hay datos para mostrar todavía"
            description="Una vez que registres algunas mediciones, acá vas a poder analizar tus promedios, tendencias y distribución."
            action={{ label: "Guardar primera medición", href: "/nueva-medicion" }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Promedio general" value={String(stats.generalAverage)} unit="mg/dL" icon={Gauge} accent />
              <StatCard label="Máximo registrado" value={String(stats.max)} unit="mg/dL" icon={ArrowUp} />
              <StatCard label="Mínimo registrado" value={String(stats.min)} unit="mg/dL" icon={ArrowDown} />
              <StatCard label="HbA1c estimada" value={hasReadings ? String(hba1c) : "—"} unit="%" icon={Activity} />
            </div>

            <WeeklyTrendChart data={weeklyTrendFrom(readings, 8)} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <DistributionChart
                data={distributionFrom(readings, settings.minValue, settings.maxValue)}
              />
              <InRangeChart
                percent={inRangePercentFrom(readings, settings.minValue, settings.maxValue)}
                minValue={settings.minValue}
                maxValue={settings.maxValue}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
