"use client"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { Activity, ClipboardList, Droplet, PlusCircle, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/stat-card";
import { GlucoseLineChart } from "@/components/charts/glucose-line-chart";
import { dailyTrend, readings, timeOfDayAverages } from "@/lib/data";
import { TimeOfDayBarChart } from "@/components/charts/time-of-day-bar-chart";
import { RecentReadings } from "@/components/recent-readings";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col mb-20">
      <PageHeader title="Hola Fran 👋" description="Este es un ejemplo de descripción.">
        <Button asChild>
          <Link href="/nueva-medicion">
            <PlusCircle className="size-4" />
            <span className="hidden sm:inline">Nueva medición</span>
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Glucemia actual" value="108" unit="mg/dL" icon={Droplet} accent hint="Última medición" />
          <StatCard label="Promedio semanal" value="115" unit="mg/dL" icon={TrendingUp} hint="Últimos 7 días" />
          <StatCard label="HbA1c estimada" value="5.7" unit="%" icon={Activity} hint="Estimación ADAG" />
          <StatCard label="Mediciones este mes" value="94" icon={ClipboardList} hint="Registros totales" />
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <GlucoseLineChart data={dailyTrend()} />
          </div>
          <div className="lg:col-span-2">
            <TimeOfDayBarChart data={timeOfDayAverages()} />
          </div>
        </div>
        <RecentReadings readings={readings.slice(0, 6)} />
      </div>
    </div>
  );
}
