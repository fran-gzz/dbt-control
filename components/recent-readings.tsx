import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReadingCard } from "@/components/reading-card";
import type { Reading } from "@/lib/types"

export function RecentReadings({ readings }: { readings: Reading[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas mediciones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {readings.map((r) => (
          <ReadingCard key={r.id} reading={r} />
        ))}
      </CardContent>
    </Card>
  )
}
