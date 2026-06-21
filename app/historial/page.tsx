import { PageHeader } from "@/components/page-header"
import { HistoryTable } from "@/components/history-table"
import { readings } from "@/lib/data"

export default function HistorialPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Historial" description="Consultá y filtrá todas tus mediciones registradas." />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <HistoryTable readings={readings} />
      </div>
    </div>
  )
}
