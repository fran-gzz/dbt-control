"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"

export default function ConfiguracionPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Configuración" description="Ajustá tu perfil y preferencias de la aplicación." />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Información personal de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" defaultValue={user?.displayName ?? ""} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email ?? ""} readOnly />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Conectado con tu cuenta de Google ({user?.email ?? "Sin sesión"}).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rangos objetivo</CardTitle>
              <CardDescription>Definí tus límites de glucemia para el seguimiento.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="min">Límite inferior (mg/dL)</Label>
                  <Input id="min" type="number" defaultValue={70} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="max">Límite superior (mg/dL)</Label>
                  <Input id="max" type="number" defaultValue={140} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="unidad">Unidad de medida</Label>
                <Select defaultValue="mgdl">
                  <SelectTrigger id="unidad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mgdl">mg/dL</SelectItem>
                    <SelectItem value="mmol">mmol/L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configurá los recordatorios de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Recordatorios de medición</span>
                  <span className="text-sm text-muted-foreground">Recibí avisos para registrar tu glucemia.</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Resumen semanal</span>
                  <span className="text-sm text-muted-foreground">Recibí un informe con tus estadísticas.</span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Alertas de valores fuera de rango</span>
                  <span className="text-sm text-muted-foreground">Avisos cuando una lectura esté alta o baja.</span>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg">Guardar cambios</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
