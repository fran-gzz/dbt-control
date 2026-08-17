"use client"

import { useRef, useState } from "react"
import { Upload, Download, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useReadings } from "@/components/readings-provider"
import type { MeasurementType } from "@/lib/types"
import { computeStatus } from "@/lib/data"

interface ParsedRow {
  date: string
  time: string
  type: MeasurementType
  value: number
}

const TYPE_MAP: Record<string, MeasurementType> = {
  ayunas: "Ayunas",
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  "antes de dormir": "Antes de dormir",
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim()
  const dmy = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    const [, y, m, d] = iso
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  return null
}

function parseTime(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return null
  return `${match[1].padStart(2, "0")}:${match[2]}`
}

function parseCsv(text: string): ParsedRow[] {
  const clean = text.replace(/^\uFEFF/, "")
  const lines = clean.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const delimiter = lines[0].includes(";") ? ";" : ","
  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""))

  const fechaIdx = headers.findIndex((h) => h === "fecha")
  const horaIdx = headers.findIndex((h) => h === "hora")
  const tipoIdx = headers.findIndex((h) => h.includes("tipo"))
  const valorIdx = headers.findIndex((h) => h === "valor")

  if (fechaIdx === -1 || horaIdx === -1 || tipoIdx === -1 || valorIdx === -1) {
    throw new Error("El CSV debe tener las columnas: Fecha, Hora, Tipo de control, Valor")
  }

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""))
    if (cols.length < 4) continue
    const date = parseDate(cols[fechaIdx])
    const time = parseTime(cols[horaIdx])
    const type = TYPE_MAP[cols[tipoIdx].toLowerCase()]
    const value = Number(cols[valorIdx].replace(",", "."))
    if (!date || !time || !type || !Number.isFinite(value)) continue
    rows.push({ date, time, type, value })
  }
  return rows
}

function toCsv(rows: { date: string; time: string; type: string; value: number }[]): string {
  const header = "Fecha,Hora,Tipo de control,Valor"
  const lines = rows.map((r) => {
    const [y, m, d] = r.date.split("-")
    return `${d}/${m}/${y},${r.time},${r.type},${r.value}`
  })
  return [header, ...lines].join("\n")
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function CsvTools() {
  const { readings, upsertReading, migrateReadingIds } = useReadings()
  const fileRef = useRef<HTMLInputElement>(null)

  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState("")
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: 0 })
  const [importDone, setImportDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file: File) {
    setParseError("")
    setParsed([])
    setImportDone(false)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCsv(reader.result as string)
        if (rows.length === 0) {
          setParseError("No se encontraron registros válidos en el CSV.")
          return
        }
        setParsed(rows)
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Error al leer el archivo.")
      }
    }
    reader.readAsText(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleImport() {
    if (parsed.length === 0) return
    setImporting(true)
    setProgress({ done: 0, total: parsed.length, errors: 0 })
    setImportDone(false)
    await migrateReadingIds()
    let errors = 0
    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i]
      try {
        await upsertReading({
          value: row.value,
          date: row.date,
          time: row.time,
          type: row.type,
          meal: "",
          activity: "",
          mood: "",
          notes: "",
          status: computeStatus(row.value, row.type),
        })
      } catch {
        errors++
      }
      setProgress({ done: i + 1, total: parsed.length, errors })
    }
    setImporting(false)
    setImportDone(true)
    setParsed([])
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleExport() {
    const sorted = [...readings].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))
    const content = toCsv(sorted)
    const now = new Date()
    downloadCsv(
      `dbt-control-historial-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`,
      content,
    )
  }

  function handleTemplate() {
    downloadCsv(
      "dbt-control-plantilla.csv",
      [
        "Fecha,Hora,Tipo de control,Valor",
        "17/08/2026,08:00,Ayunas,95",
        "17/08/2026,13:30,Almuerzo,142",
        "17/08/2026,20:00,Cena,110",
      ].join("\n"),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Importar mediciones
          </CardTitle>
          <CardDescription>
            Subí un CSV con tus mediciones. Debe tener las columnas: Fecha, Hora, Tipo de control,
            Valor.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileText className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Arrastrá un archivo CSV acá o hacé click para seleccionar
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />

          {parseError ? (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {parseError}
            </div>
          ) : null}

          {parsed.length > 0 && !importing ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                Se encontraron <span className="font-medium">{parsed.length}</span> registros para
                importar.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleImport}>
                  <Upload className="size-4" />
                  Importar {parsed.length} registros
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsed([])
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          {importing ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Importando {progress.done}/{progress.total}
                {progress.errors > 0 ? (
                  <span className="text-destructive">({progress.errors} errores)</span>
                ) : null}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </div>
          ) : null}

          {importDone ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm text-emerald-600">
              <CheckCircle className="size-4 shrink-0" />
              Importación completada correctamente.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Exportar historial
          </CardTitle>
          <CardDescription>Descargá todas tus mediciones en formato CSV.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} disabled={readings.length === 0}>
            <Download className="size-4" />
            Descargar CSV ({readings.length} registros)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Descargar plantilla
          </CardTitle>
          <CardDescription>
            Descargá un CSV de ejemplo con el formato correcto para importar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleTemplate}>
            <FileText className="size-4" />
            Descargar plantilla CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
