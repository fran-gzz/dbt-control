import { Activity, ArrowDown, ArrowUp, Gauge } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart"
import { DistributionChart } from "@/components/charts/distribution-chart"
import { InRangeChart } from "@/components/charts/in-range-chart"
import { stats, hba1c, weeklyTrend, distribution, inRangePercent } from "@/lib/data"

export default function EstadisticasPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Estadísticas" description="Analizá tus tendencias y métricas de glucemia." />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Promedio general" value={String(stats.generalAverage)} unit="mg/dL" icon={Gauge} accent />
          <StatCard label="Máximo registrado" value={String(stats.max)} unit="mg/dL" icon={ArrowUp} />
          <StatCard label="Mínimo registrado" value={String(stats.min)} unit="mg/dL" icon={ArrowDown} />
          <StatCard label="HbA1c estimada" value={String(hba1c)} unit="%" icon={Activity} />
        </div>

        <WeeklyTrendChart data={weeklyTrend()} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DistributionChart data={distribution()} />
          <InRangeChart percent={inRangePercent()} />
        </div>
      </div>
    </div>
  )
}
