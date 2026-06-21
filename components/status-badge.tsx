import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MeasurementStatus } from "@/lib/types"

const config: Record<MeasurementStatus, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  alta: { label: "Alta", className: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  baja: { label: "Baja", className: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
}

export function StatusBadge({ status }: { status: MeasurementStatus }) {
  const c = config[status]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}
