"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMeals } from "@/components/meals-provider"
import { Loader2, Save } from "lucide-react"
import type { Meal } from "@/lib/types"

interface MealFormProps {
  meal: Meal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MealForm({ meal, open, onOpenChange }: MealFormProps) {
  const { addMeal, updateMeal } = useMeals()

  const [name, setName] = useState(meal?.name ?? "")
  const [ingredients, setIngredients] = useState(meal?.ingredients.join(", ") ?? "")
  const [carbs, setCarbs] = useState(String(meal?.carbs ?? 0))
  const [protein, setProtein] = useState(String(meal?.protein ?? 0))
  const [fat, setFat] = useState(String(meal?.fat ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      name: name.trim(),
      ingredients: ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      carbs: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
    }

    setSaving(true)
    setError("")
    try {
      if (meal) {
        await updateMeal(meal.id, payload)
      } else {
        await addMeal(payload)
      }
      onOpenChange(false)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === "permission-denied") {
        setError(
          "Firestore está rechazando la operación. Actualizá las reglas de seguridad en Firebase Console.",
        )
      } else {
        setError("No se pudo guardar la comida. Revisá tu conexión e intentá de nuevo.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{meal ? "Editar comida" : "Nueva comida"}</SheetTitle>
          <SheetDescription>
            Completá la información nutricional de la comida.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="meal-name">Nombre</Label>
            <Input
              id="meal-name"
              placeholder="Ej. Pollo con arroz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="meal-ingredients">Ingredientes</Label>
            <Input
              id="meal-ingredients"
              placeholder="Ej. Pollo, arroz, brócoli"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separalos con comas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="meal-carbs">Carbos (g)</Label>
              <Input
                id="meal-carbs"
                type="number"
                inputMode="numeric"
                min={0}
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meal-protein">Proteínas (g)</Label>
              <Input
                id="meal-protein"
                type="number"
                inputMode="numeric"
                min={0}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meal-fat">Grasas (g)</Label>
              <Input
                id="meal-fat"
                type="number"
                inputMode="numeric"
                min={0}
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <span className="font-medium text-destructive">{error}</span>
            </div>
          ) : null}

          <SheetFooter className="mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Guardando..." : "Guardar comida"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
