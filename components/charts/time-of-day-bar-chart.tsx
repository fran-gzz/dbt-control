"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: { label: "Promedio", color: "var(--chart-1)" },
}

export function TimeOfDayBarChart({ data }: { data: { moment: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promedios por momento del día</CardTitle>
        <CardDescription>Glucemia media según el momento (mg/dL)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <BarChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="moment" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={36} tick={{ fontSize: 12 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
