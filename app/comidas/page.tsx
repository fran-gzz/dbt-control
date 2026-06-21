import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { meals } from "@/lib/data"
import { ArrowRight, UtensilsCrossed } from "lucide-react"

export default function ComidasPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Biblioteca de comidas" description="Tus comidas frecuentes con información nutricional." />
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <Card key={meal.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <UtensilsCrossed className="size-4" />
                  </div>
                  <CardTitle className="text-base">{meal.name}</CardTitle>
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
                <Button
                asChild
                  variant="outline"
                  className="w-full bg-transparent"
                  >
<Link href={`/nueva-medicion?comida=${encodeURIComponent(meal.name)}`}>
                      Usar en nueva medición
                      <ArrowRight className="size-4" />
                    </Link>

                  </Button>
                    
                  
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
