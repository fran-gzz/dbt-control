"use client"

import { ClipboardList } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { HistoryTable } from "@/components/history-table"
import { EmptyState } from "@/components/empty-state"
import { useReadings } from "@/components/readings-provider"
import { sortReadings } from "@/lib/data"

export default function HistorialPage() {
  const { readings, loading } = useReadings()
  const hasReadings = readings.length > 0

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Historial" description="Consultá y filtrá todas tus mediciones registradas." />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        {loading && !hasReadings ? null : !hasReadings ? (
          <EmptyState
            icon={ClipboardList}
            title="No hay mediciones registradas"
            description="Comenzá a guardar tus mediciones y vas a poder consultarlas y filtrarlas desde acá."
            action={{ label: "Guardar primera medición", href: "/nueva-medicion" }}
          />
        ) : (
          <HistoryTable readings={sortReadings(readings)} />
        )}
      </div>
    </div>
  )
}
