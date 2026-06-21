import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="md:-ml-1" />
                <Separator orientation="vertical" className="h-5" />
                <div className="flex flex-1 flex-col">
                    <h1 className="text-balance text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
                    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
                </div>
                {children ? <div className="flex items-center gap-2">{children}</div> : null}
            </div>
        </header>
    )
}