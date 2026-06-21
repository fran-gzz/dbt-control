"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import type { Reading } from "@/lib/types"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function HistoryTable({ readings }: { readings: Reading[] }) {
  const [date, setDate] = useState("")
  const [type, setType] = useState("todos")
  const [range, setRange] = useState("todos")
  

  const filtered = useMemo(() => {
    return readings.filter((r) => {
      if (date && r.date !== date) return false
      if (type !== "todos" && r.type !== type) return false
      if (range === "normal" && r.status !== "normal") return false
      if (range === "alta" && r.status !== "alta") return false
      if (range === "baja" && r.status !== "baja") return false
      return true
    })
  }, [readings, date, type, range])

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="f-date">Fecha</Label>
            <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="f-type">Tipo de medición</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "todos")}>
              <SelectTrigger id="f-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Ayunas">Ayunas</SelectItem>
                <SelectItem value="Desayuno">Desayuno</SelectItem>
                <SelectItem value="Almuerzo">Almuerzo</SelectItem>
                <SelectItem value="Cena">Cena</SelectItem>
                <SelectItem value="Antes de dormir">Antes de dormir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="f-range">Rango glucémico</Label>
            <Select value={range} onValueChange={(v) => setRange(v ?? "todos")}>
              <SelectTrigger id="f-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal (70-140)</SelectItem>
                <SelectItem value="alta">{"Alta (>140)"}</SelectItem>
                <SelectItem value="baja">{"Baja (<70)"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Comida</TableHead>
                  <TableHead className="hidden lg:table-cell">Estado emocional</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No se encontraron mediciones con esos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{formatDate(r.date)}</TableCell>
                      <TableCell className="text-muted-foreground">{r.time}</TableCell>
                      <TableCell className="font-semibold">{r.value} mg/dL</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{r.meal}</TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">{r.mood}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Mostrando {filtered.length} de {readings.length} mediciones.
      </p>
    </div>
  )
}
