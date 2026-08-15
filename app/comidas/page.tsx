"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { MealForm } from "@/components/meal-form"
import { useMeals } from "@/components/meals-provider"
import { ArrowRight, Pencil, PlusCircle, Trash2, UtensilsCrossed } from "lucide-react"
import type { Meal } from "@/lib/types"

export default function ComidasPage() {
  const { meals, loading, deleteMeal } = useMeals()
  const [formOpen, setFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)

  function openNew() {
    setEditingMeal(null)
    setFormOpen(true)
  }

  function openEdit(meal: Meal) {
    setEditingMeal(meal)
    setFormOpen(true)
  }

  async function handleDelete(meal: Meal) {
    if (!window.confirm(`¿Eliminar "${meal.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteMeal(meal.id)
    } catch (err) {
      const code = (err as { code?: string })?.code
      alert(
        code === "permission-denied"
          ? "Firestore está rechazando la operación. Actualizá las reglas de seguridad en Firebase Console."
          : "No se pudo eliminar la comida. Intentá de nuevo.",
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Biblioteca de comidas" description="Tus comidas frecuentes con información nutricional.">
        <Button onClick={openNew}>
          <PlusCircle className="size-4" />
          <span className="hidden sm:inline">Nueva comida</span>
        </Button>
      </PageHeader>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && meals.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)
            : meals.map((meal) => (
                <Card key={meal.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <UtensilsCrossed className="size-4" />
                      </div>
                      <CardTitle className="flex-1 text-base">{meal.name}</CardTitle>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${meal.name}`}
                          onClick={() => openEdit(meal)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${meal.name}`}
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(meal)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="font-normal">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold">{meal.carbs}g</span>
                        <span className="text-xs text-muted-foreground">Carbos</span>
                      </div>
                      <div className="flex flex-col border-x border-border">
                        <span className="text-base font-semibold">{meal.protein}g</span>
                        <span className="text-xs text-muted-foreground">Proteínas</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold">{meal.fat}g</span>
                        <span className="text-xs text-muted-foreground">Grasas</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/nueva-medicion?comida=${encodeURIComponent(meal.name)}`}>
                        Usar en nueva medición
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
        </div>

        {!loading && meals.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Todavía no tenés comidas cargadas. Tocá <span className="font-medium text-foreground">Nueva comida</span> para
            agregar la primera.
          </div>
        ) : null}
      </div>

      <MealForm meal={editingMeal} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
