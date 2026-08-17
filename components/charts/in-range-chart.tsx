"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"

const chartConfig = {
  value: { label: "En rango", color: "var(--chart-1)" },
}

export function InRangeChart({
  percent,
}: {
  percent: number
}) {
  const data = [{ name: "rango", value: percent, fill: "var(--chart-1)" }]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Porcentaje dentro de rango</CardTitle>
        <CardDescription>
          Lecturas clasificadas como &ldquo;En objetivo&rdquo;
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={chartConfig} className="relative h-55 w-full">
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={-270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-semibold tracking-tight">{percent}%</span>
            <span className="text-sm text-muted-foreground">en rango</span>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
