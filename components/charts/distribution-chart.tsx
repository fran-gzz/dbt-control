"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"

const colorMap: Record<string, string> = {
  hipoglucemia: "#dc2626",
  baja: "#f59e0b",
  en_objetivo: "#059669",
  elevada: "#eab308",
  alta: "#f97316",
  muy_elevada: "#b91c1c",
}

const chartConfig = {
  value: { label: "Mediciones" },
  Hipoglucemia: { label: "Hipoglucemia", color: "#dc2626" },
  Baja: { label: "Baja", color: "#f59e0b" },
  "En objetivo": { label: "En objetivo", color: "#059669" },
  Elevada: { label: "Elevada", color: "#eab308" },
  Alta: { label: "Alta", color: "#f97316" },
  "Muy elevada": { label: "Muy elevada", color: "#b91c1c" },
}

export function DistributionChart({
  data,
}: {
  data: { name: string; value: number; key: string }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de mediciones</CardTitle>
        <CardDescription>Cantidad de lecturas por estado</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <ChartContainer config={chartConfig} className="h-55 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={colorMap[entry.key]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {data.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-full" style={{ backgroundColor: colorMap[entry.key] }} />
              <span className="text-muted-foreground">
                {entry.name} · <span className="font-medium text-foreground">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
