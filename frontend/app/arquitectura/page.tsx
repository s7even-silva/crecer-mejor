import { ExternalLink, GitBranch } from "lucide-react";
import { ArquitecturaDiagrama } from "@/components/arquitectura-diagrama";
import { Card, CardContent } from "@/components/ui/card";

export default function ArquitecturaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Como esta construido
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Cuatro piezas, cada una con un trabajo especifico. Toca cualquiera
          para ver que hace y con que tecnologia esta hecha.
        </p>
      </div>

      <ArquitecturaDiagrama />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3">
          <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed">
            <strong>El motor clinico no se duplico.</strong> Esta version
            (Next.js + FastAPI + Postgres) y la demo original en Streamlit
            comparten exactamente el mismo archivo{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              motor.py
            </code>
            . Cambiar la interfaz o la base de datos no cambia ni un numero
            del calculo clinico, que ya esta verificado contra las tablas
            oficiales de la OMS.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="text-sm font-medium">En produccion</div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="https://crecer-mejor.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              crecer-mejor.vercel.app
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-muted-foreground">
              Frontend en Vercel, API en Railway, base de datos en Neon.
              Cada cambio de codigo se despliega automaticamente.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
