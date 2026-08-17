"use client"

import { PageHeader } from "@/components/page-header"
import { CsvTools } from "@/components/csv-tools"

export default function ImportarPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Importar / Exportar"
        description="Importá mediciones desde un CSV o exportá tu historial."
      />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <CsvTools />
        </div>
      </div>
    </div>
  )
}
