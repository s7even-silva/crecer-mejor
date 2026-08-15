"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowRight,
  Database,
  Layout,
  Server,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Nodo = {
  id: string;
  icono: React.ElementType;
  titulo: string;
  subtitulo: string;
  simple: string;
  tecnico: string[];
  tecnologias: string[];
};

const NODOS: Nodo[] = [
  {
    id: "frontend",
    icono: Layout,
    titulo: "Lo que ve el usuario",
    subtitulo: "Interfaz web",
    simple:
      "La pantalla que el personal de salud usa para ver el radar de niños, revisar el perfil de cada uno y registrar una nueva medición. Funciona en computadora, tablet o celular.",
    tecnico: [
      "Next.js 16 con App Router: cada pantalla se genera en el servidor y se envía ya lista, sin esperar a que el navegador arme la página.",
      "Los datos se piden a la API del backend en cada visita — no hay copia local desactualizada.",
      "Registrar una medición nueva usa una Server Action: el formulario envía los datos directo al servidor sin una llamada JavaScript aparte.",
    ],
    tecnologias: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  },
  {
    id: "backend",
    icono: Server,
    titulo: "El intermediario",
    subtitulo: "API",
    simple:
      "Recibe las peticiones de la interfaz ('dame el radar', 'evalúa a este niño'), busca los datos en la base de datos, les pide al motor que calcule, y devuelve el resultado.",
    tecnico: [
      "FastAPI expone rutas HTTP: /radar, /ninos/{id}/evaluacion, /ninos/{id}/mediciones, /verificacion.",
      "SQLAlchemy traduce esas peticiones a consultas SQL contra Postgres.",
      "No repite ni reescribe la lógica clínica: llama directo a las funciones ya verificadas de motor.py.",
    ],
    tecnologias: ["FastAPI", "SQLAlchemy", "Python 3.11"],
  },
  {
    id: "motor",
    icono: Sparkles,
    titulo: "El cerebro clínico",
    subtitulo: "Motor antropométrico",
    simple:
      "Aquí vive todo el cálculo real: convierte peso y talla a la unidad correcta, calcula el z-score según el estándar de la OMS, detecta si la trayectoria del niño está empeorando, y decide el nivel de prioridad. Es el mismo motor que ya se verificó contra las tablas oficiales de la OMS.",
    tecnico: [
      "Implementa el método LMS-OMS con la restricción de colas fuera de ±3 DE (ver Parte IV del documento maestro).",
      "El paquete pygrowup está vendorizado en el repo (copiado y corregido) para no depender de un paquete de PyPI con un bug de instalación.",
      "Error máximo verificado contra la tabla de referencia oficial: 0.1 DE.",
      "Es el mismo archivo (motor.py) que usa tanto esta arquitectura como la demo en Streamlit — no se duplicó la lógica clínica en ningún lado.",
    ],
    tecnologias: ["Python puro", "Tablas LMS-OMS oficiales"],
  },
  {
    id: "db",
    icono: Database,
    titulo: "Donde vive la información",
    subtitulo: "Base de datos",
    simple:
      "Guarda los datos de cada niño y cada control (peso, talla, fecha, fuente) de forma permanente. Cuando se registra una medición nueva, queda ahí para siempre, no se pierde al cerrar la página.",
    tecnico: [
      "PostgreSQL 18, alojado en Neon (managed, con branching de base de datos y auto-pausado en el tier gratuito).",
      "Dos tablas: ninos (id, código, sexo, fecha de nacimiento) y mediciones (id, nino_id, fecha, fuente, peso, talla).",
      "Los datos originales del prototipo (34 niños sintéticos, 105 mediciones) se cargan una vez con un script de migración desde los CSV del golden dataset.",
    ],
    tecnologias: ["PostgreSQL 18", "Neon"],
  },
];

export function ArquitecturaDiagrama() {
  const [activo, setActivo] = React.useState<string>("frontend");
  const nodoActivo = NODOS.find((n) => n.id === activo)!;

  return (
    <div className="flex flex-col gap-6">
      {/* Diagrama de flujo */}
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        {NODOS.map((nodo, i) => (
          <React.Fragment key={nodo.id}>
            <NodoCard
              nodo={nodo}
              activo={nodo.id === activo}
              onClick={() => setActivo(nodo.id)}
            />
            {i < NODOS.length - 1 && (
              <>
                <ArrowDown className="mx-auto h-5 w-5 shrink-0 text-muted-foreground sm:hidden" />
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Detalle del nodo seleccionado */}
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <nodoActivo.icono className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">
                {nodoActivo.titulo}
              </div>
              <div className="text-sm text-muted-foreground">
                {nodoActivo.subtitulo}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground">
            {nodoActivo.simple}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {nodoActivo.tecnologias.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
              Ver detalle tecnico
            </summary>
            <ul className="mt-3 flex flex-col gap-2 border-l-2 border-primary/20 pl-4 text-sm text-muted-foreground">
              {nodoActivo.tecnico.map((linea, i) => (
                <li key={i}>{linea}</li>
              ))}
            </ul>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}

function NodoCard({
  nodo,
  activo,
  onClick,
}: {
  nodo: Nodo;
  activo: boolean;
  onClick: () => void;
}) {
  const Icono = nodo.icono;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors sm:flex-col sm:items-center sm:text-center",
        activo
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      <Icono
        className={cn(
          "h-5 w-5 shrink-0",
          activo ? "text-primary" : "text-muted-foreground",
        )}
      />
      <div className="sm:mt-1">
        <div className="text-sm font-medium leading-tight">{nodo.titulo}</div>
        <div className="text-xs text-muted-foreground">{nodo.subtitulo}</div>
      </div>
    </button>
  );
}
