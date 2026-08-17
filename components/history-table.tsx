"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { ReadingForm } from "@/components/reading-form"
import { ReadingCard } from "@/components/reading-card"
import { useReadings } from "@/components/readings-provider"
import { computeStatus } from "@/lib/data"
import { parseISODate } from "@/lib/utils"
import { Pencil, Trash2 } from "lucide-react"
import type { Reading } from "@/lib/types"

function formatDate(date: string) {
  return parseISODate(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function HistoryTable({ readings }: { readings: Reading[] }) {
  const { deleteReading } = useReadings()
  const [date, setDate] = useState("")
  const [type, setType] = useState("todos")
  const [range, setRange] = useState("todos")
  const [editing, setEditing] = useState<Reading | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const filtered = useMemo(() => {
    return readings.filter((r) => {
      if (date && r.date !== date) return false
      if (type !== "todos" && r.type !== type) return false
      const status = computeStatus(r.value, r.type)
      if (range !== "todos" && status !== range) return false
      return true
    })
  }, [readings, date, type, range])

  async function handleDelete(reading: Reading) {
    const label = `${formatDate(reading.date)} ${reading.time} (${reading.value} mg/dL)`
    if (!window.confirm(`¿Eliminar la medición del ${label}? Esta acción no se puede deshacer.`)) return
    try {
      await deleteReading(reading.id)
    } catch (err) {
      const code = (err as { code?: string })?.code
      alert(
        code === "permission-denied"
          ? "Firestore está rechazando la operación. Actualizá las reglas de seguridad en Firebase Console."
          : "No se pudo eliminar la medición. Intentá de nuevo.",
      )
    }
  }

  function openEdit(reading: Reading) {
    setEditing(reading)
    setFormKey((k) => k + 1)
    setFormOpen(true)
  }

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
                <SelectItem value="hipoglucemia">Hipoglucemia (&lt;70)</SelectItem>
                <SelectItem value="baja">Baja (70–79)</SelectItem>
                <SelectItem value="en_objetivo">En objetivo</SelectItem>
                <SelectItem value="elevada">Elevada</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="muy_elevada">Muy elevada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 md:hidden">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground">
            {readings.length === 0
              ? "Todavía no hay mediciones registradas. Comenzá a guardar tus mediciones para verlas acá."
              : "No se encontraron mediciones con esos filtros."}
          </p>
        ) : (
          filtered.map((r) => (
            <ReadingCard
              key={r.id}
              reading={r}
              onEdit={() => openEdit(r)}
              onDelete={() => handleDelete(r)}
            />
          ))
        )}
      </div>

      <Card className="hidden md:block">
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      {readings.length === 0
                        ? "Todavía no hay mediciones registradas. Comenzá a guardar tus mediciones para verlas acá."
                        : "No se encontraron mediciones con esos filtros."}
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
                        <StatusBadge status={computeStatus(r.value, r.type)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Editar medición del ${formatDate(r.date)} ${r.time}`}
                            onClick={() => openEdit(r)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Eliminar medición del ${formatDate(r.date)} ${r.time}`}
                            className="hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(r)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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

      {editing ? (
        <ReadingForm key={`${editing.id}-${formKey}`} reading={editing} open={formOpen} onOpenChange={setFormOpen} />
      ) : null}
    </div>
  )
}
