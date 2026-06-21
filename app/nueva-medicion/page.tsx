import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { MeasurementForm } from "@/components/measurement-form";

export default function NuevaMedicionPage() {
    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="Nueva medición" description="Agregá una nueeva lectura a tu registro." />
            <div className="flex flex-1 flex-col p-4 md:p-6">
                <Suspense fallback={null}>
                    <MeasurementForm />
                </Suspense>
            </div>
        </div>
    )
}