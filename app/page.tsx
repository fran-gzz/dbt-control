import Link from "next/link"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Droplet,
  HeartPulse,
  History,
  LineChart,
  LogIn,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

const features = [
  {
    icon: Droplet,
    title: "Registro rápido de mediciones",
    description: "Guardá tus valores de glucemia con fecha, hora, contexto de comida, actividad física y estado emocional.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas y tendencias",
    description: "Evolución diaria, promedios semanales y porcentaje de mediciones dentro de tu rango objetivo.",
  },
  {
    icon: History,
    title: "Historial filtrable",
    description: "Buscá y filtrá tus mediciones por fecha, tipo de medición o rango glucémico.",
  },
  {
    icon: UtensilsCrossed,
    title: "Biblioteca de comidas",
    description: "Cargá tus comidas frecuentes con su información nutricional y vinculalas a tus mediciones.",
  },
  {
    icon: Activity,
    title: "HbA1c estimada",
    description: "Obtené una estimación de tu hemoglobina glicosilada a partir del promedio de tus lecturas.",
  },
  {
    icon: ShieldCheck,
    title: "Tus datos, protegidos",
    description: "Toda tu información se guarda de forma segura en Firebase y solo vos podés acceder a ella.",
  },
]

const steps = [
  {
    icon: LogIn,
    step: "01",
    title: "Creá tu cuenta",
    description: "Iniciá sesión con tu cuenta de Google en segundos. No hace falta configuración.",
  },
  {
    icon: Droplet,
    step: "02",
    title: "Registrá tus mediciones",
    description: "Anotá cada lectura con el contexto: comida, actividad física y cómo te sentís.",
  },
  {
    icon: LineChart,
    step: "03",
    title: "Analizá tus tendencias",
    description: "Visualizá tus avances con gráficos claros y estadísticas que te ayudan a entender tu glucemia.",
  },
]

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function PreviewChart() {
  const bars = [38, 52, 45, 64, 58, 72, 66, 80, 70, 85, 74, 90]
  const max = 90
  return (
    <div className="flex h-32 items-end gap-1.5 sm:h-40">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-primary/50"
          style={{ height: `${Math.max((height / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl px-4">
      <div className="rounded-3xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
        <div className="flex flex-col gap-4 rounded-2xl bg-muted/40 p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat value="112" label="Glucemia actual" />
            <MiniStat value="118" label="Promedio semanal" />
            <MiniStat value="5.7%" label="HbA1c estimada" />
            <MiniStat value="87" label="Mediciones" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Evolución glucémica</span>
              <span className="text-xs text-muted-foreground">Últimos 30 días</span>
            </div>
            <PreviewChart />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenshotPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Sparkles className="size-5" />
        <span className="text-sm font-medium">Próximamente: captura de {title}</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">DBT Control</span>
              <span className="text-xs text-muted-foreground">Control de glucemia</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="#caracteristicas" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Características
            </Link>
            <Link href="#como-funciona" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Cómo funciona
            </Link>
            <Link href="#capturas" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Capturas
            </Link>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/login">
                Iniciar sesión
                <ArrowRight className="size-3.5" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center md:px-6 md:pt-24">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <HeartPulse className="size-3.5 text-primary" />
            Tu glucemia, bajo control todos los días
          </Badge>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Registrá tus mediciones y{" "}
            <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
              entendé tu glucemia
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            DBT Control te ayuda a registrar tus mediciones de glucosa, seguir tus tendencias y descubrir
            cómo la comida y la actividad afectan tus niveles, todo desde un panel simple y privado.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                <LogIn className="size-4" />
                Iniciar sesión gratis
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#como-funciona">Ver cómo funciona</Link>
            </Button>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="caracteristicas" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Características
          </Badge>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Todo lo que necesitás para cuidar tu glucemia
          </h2>
          <p className="mt-4 text-muted-foreground">
            Una herramienta pensada para simplificar el registro diario y darte claridad sobre tu salud.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Cómo funciona
          </Badge>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Empezá en tres pasos
          </h2>
          <p className="mt-4 text-muted-foreground">
            De la primera medición a tus estadísticas, el camino es corto y directo.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{step.step}</span>
              </div>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="capturas" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
            Capturas
          </Badge>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Mirá DBT Control en acción
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un vistazo al panel, las estadísticas y la biblioteca de comidas.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ScreenshotPlaceholder title="Dashboard" />
          <ScreenshotPlaceholder title="Estadísticas" />
          <ScreenshotPlaceholder title="Comidas" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-6">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-chart-4/15 px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-7" />
          </div>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tomá el control de tu glucemia hoy
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Creá tu cuenta gratis y empezá a registrar tus mediciones en menos de un minuto.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link href="/login">
              <LogIn className="size-4" />
              Iniciar sesión gratis
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="size-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">DBT Control</span>
              <span className="text-xs text-muted-foreground">Control de glucemia</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DBT Control. Hecho con cuidado para tu salud.
          </p>
        </div>
      </footer>
    </div>
  )
}
