"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";

const chartConfig = {
    value: { label: "Glucemia", color: "var(--chart-1" },
}

export function GlucoseLineChart({ data }: { data: { date: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución glucémica</CardTitle>
        <CardDescription>Promedio diario de los últimos 30 días (mg/dL)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillGlucose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              domain={[60, 160]}
              tick={{ fontSize: 12 }}
            />
            <ReferenceLine y={140} stroke="var(--chart-5)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={70} stroke="var(--chart-2)" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#fillGlucose)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}