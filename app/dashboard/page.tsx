"use client"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { Activity, ClipboardList, Droplet, PlusCircle, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/stat-card";
import { GlucoseLineChart } from "@/components/charts/glucose-line-chart";
import { TimeOfDayBarChart } from "@/components/charts/time-of-day-bar-chart";
import { RecentReadings } from "@/components/recent-readings";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useReadings } from "@/components/readings-provider";
import { useSettings } from "@/components/settings-provider";
import {
  dailyTrendFrom,
  hba1cFrom,
  sortReadings,
  statsFrom,
  timeOfDayAveragesFrom,
} from "@/lib/data";

export default function DashboardPage() {
  const { user } = useAuth()
  const { readings, loading } = useReadings()
  const { settings } = useSettings()

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || ""

  const sorted = sortReadings(readings)
  const stats = statsFrom(readings)
  const hba1c = hba1cFrom(readings)
  const hasReadings = readings.length > 0

  return (
    <div className="flex flex-1 flex-col mb-20">
      <PageHeader title={`Hola${firstName ? `, ${firstName}` : ""} 👋`} description="Tu panel de control de glucemia.">
        {hasReadings ? (
          <Button asChild>
            <Link href="/nueva-medicion">
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">Nueva medición</span>
            </Link>
          </Button>
        ) : null}
      </PageHeader>

      <div className="flex flex-1 flex-col gap-6 p-4">
        {loading && !hasReadings ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : !hasReadings ? (
          <EmptyState
            icon={Droplet}
            title="No hay mediciones recientes"
            description="Comenzá a guardar tus mediciones para ver tus estadísticas, tendencias e historial en un solo lugar."
            action={{ label: "Comenzar a guardar mediciones", href: "/nueva-medicion" }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Glucemia actual" value={String(stats.current)} unit="mg/dL" icon={Droplet} accent hint="Última medición" />
              <StatCard label="Promedio semanal" value={String(stats.weeklyAverage)} unit="mg/dL" icon={TrendingUp} hint="Últimos 7 días" />
              <StatCard label="HbA1c estimada" value={hasReadings ? String(hba1c) : "—"} unit="%" icon={Activity} hint="Estimación ADAG" />
              <StatCard label="Mediciones" value={String(stats.monthCount)} icon={ClipboardList} hint="Registros totales" />
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <GlucoseLineChart
                  data={dailyTrendFrom(readings)}
                  minValue={settings.minValue}
                  maxValue={settings.maxValue}
                />
              </div>
              <div className="lg:col-span-2">
                <TimeOfDayBarChart data={timeOfDayAveragesFrom(readings)} />
              </div>
            </div>
            <RecentReadings readings={sorted.slice(0, 6)} />
          </>
        )}
      </div>
    </div>
  );
}
