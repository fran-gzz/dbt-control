"use client"

import { Droplet } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/status-badge"
import { useSettings } from "@/components/settings-provider"
import { computeStatus } from "@/lib/data"
import { parseISODate } from "@/lib/utils"
import type { Reading } from "@/lib/types"

function formatDate(date: string) {
  return parseISODate(date).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

interface ReadingDetailsSheetProps {
  reading: Reading | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReadingDetailsSheet({ reading, open, onOpenChange }: ReadingDetailsSheetProps) {
  const { settings } = useSettings()
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalle de medición</SheetTitle>
          {reading ? (
            <SheetDescription>
              {formatDate(reading.date)} · {reading.time}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {reading ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Droplet className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold leading-none">{reading.value}</span>
                  <span className="text-xs text-muted-foreground">mg/dL</span>
                </div>
              </div>
              <StatusBadge status={computeStatus(reading.value, settings.minValue, settings.maxValue)} />
            </div>

            <div className="divide-y divide-border rounded-xl border border-border px-4">
              <DetailRow label="Tipo de medición" value={reading.type} />
              <DetailRow label="Comida relacionada" value={reading.meal} />
              <DetailRow label="Actividad física" value={reading.activity} />
              <DetailRow label="Estado emocional" value={reading.mood} />
              <DetailRow label="Observaciones" value={reading.notes} />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
