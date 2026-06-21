import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge";
import type { Reading } from "@/lib/types"
import { Clock } from "lucide-react"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

export function RecentReadings({ readings }: { readings: Reading[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas mediciones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {readings.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded-lg bg-secondary px-3 py-2 text-center">
                <span className="text-lg font-semibold leading-none">{r.value}</span>
                <span className="text-[10px] text-muted-foreground">mg/dL</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{r.type}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {formatDate(r.date)} · {r.time}
                </span>
              </div>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
