"use client"

import { useState } from "react"
import { Clock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ReadingDetailsSheet } from "@/components/reading-details-sheet"
import { useSettings } from "@/components/settings-provider"
import { computeStatus } from "@/lib/data"
import { parseISODate } from "@/lib/utils"
import type { Reading } from "@/lib/types"

function formatDate(date: string) {
  return parseISODate(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

interface ReadingCardProps {
  reading: Reading
  onEdit?: () => void
  onDelete?: () => void
}

export function ReadingCard({ reading, onEdit, onDelete }: ReadingCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { settings } = useSettings()

  const status = computeStatus(reading.value, settings.minValue, settings.maxValue)

  function openDetails() {
    setDetailsOpen(true)
  }

  const actions = (onEdit || onDelete) ? (
    <div className="flex items-center gap-0.5">
      {onEdit ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Editar medición del ${formatDate(reading.date)} ${reading.time}`}
          onClick={(e) => {
            e.stopPropagation()
            setDetailsOpen(false)
            onEdit()
          }}
        >
          <Pencil className="size-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Eliminar medición del ${formatDate(reading.date)} ${reading.time}`}
          className="hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            setDetailsOpen(false)
            onDelete()
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  ) : null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de la medición del ${formatDate(reading.date)} ${reading.time}`}
        onClick={openDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openDetails()
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-3 py-2 text-center">
            <span className="text-lg font-semibold leading-none">{reading.value}</span>
            <span className="text-[10px] text-muted-foreground">mg/dL</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{reading.type}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatDate(reading.date)} · {reading.time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {actions}
          <StatusBadge status={status} />
        </div>
      </div>
      <ReadingDetailsSheet reading={reading} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  )
}
