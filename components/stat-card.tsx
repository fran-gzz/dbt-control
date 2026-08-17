import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  accent?: boolean
  hint?: string
  tooltip?: string
  href?: string
}

export function StatCard({ label, value, unit, icon: Icon, accent, hint, tooltip, href }: StatCardProps) {
  const content = (
    <CardContent className="flex items-start justify-between gap-3 p-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight md:text-3xl">{value}</span>
          {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
        </div>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          accent ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="size-5" />
      </div>
    </CardContent>
  )

  const card = (
    <Card
      className={cn(
        accent && "border-primary/30 bg-accent/40",
        href && "cursor-pointer transition-colors hover:bg-muted/50",
      )}
    >
      {content}
    </Card>
  )

  const wrapped = href ? <Link href={href} className="block">{card}</Link> : card

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }

  return wrapped
}
