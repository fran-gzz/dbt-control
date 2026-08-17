import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MeasurementStatus } from "@/lib/types"

const config: Record<MeasurementStatus, { label: string; className: string }> = {
  hipoglucemia: { label: "Hipoglucemia", className: "bg-red-600/15 text-red-600 border-red-600/30" },
  baja: { label: "Baja", className: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  en_objetivo: { label: "En objetivo", className: "bg-emerald-600/15 text-emerald-600 border-emerald-600/30" },
  elevada: { label: "Elevada", className: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
  alta: { label: "Alta", className: "bg-orange-500/15 text-orange-500 border-orange-500/30" },
  muy_elevada: { label: "Muy elevada", className: "bg-red-700/15 text-red-700 border-red-700/30" },
}

export function StatusBadge({ status }: { status: MeasurementStatus }) {
  const c = config[status]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}
