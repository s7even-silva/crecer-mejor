"use client";

import * as React from "react";
import {
  Baby,
  Bell,
  Calculator,
  HeartHandshake,
  Home,
  Layers,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Caja = {
  id: string;
  icono: React.ElementType;
  titulo: string;
  nota: string;
};

type Fila = {
  id: string;
  etiqueta: string;
  construido: boolean;
  cajas: Caja[];
};

const FILAS: Fila[] = [
  {
    id: "captura",
    etiqueta: "Punto de captura",
    construido: true,
    cajas: [
      { id: "cred", icono: Stethoscope, titulo: "CRED", nota: "El control que ya existe hoy" },
      { id: "visita", icono: Home, titulo: "Visita domiciliaria", nota: "Otra fuente que ya se registra" },
      { id: "programa", icono: HeartHandshake, titulo: "Programa social", nota: "Otra fuente que ya se registra" },
      { id: "offline", icono: WifiOff, titulo: "Sin conexion", nota: "Se guarda local y sincroniza despues" },
    ],
  },
  {
    id: "motor",
    etiqueta: "Motor (TRL 3, ya funciona)",
    construido: true,
    cajas: [
      { id: "normaliza", icono: Layers, titulo: "Normaliza", nota: "kg, g, lb, cm, m -- todo a la misma unidad" },
      { id: "calcula", icono: Calculator, titulo: "Calcula z-score", nota: "Metodo LMS-OMS, verificado" },
      { id: "alerta", icono: Bell, titulo: "Detecta caida", nota: "Compara la trayectoria completa, no solo el ultimo dato" },
    ],
  },
  {
    id: "red",
    etiqueta: "Red y roles (falta construir)",
    construido: false,
    cajas: [
      { id: "login", icono: Shield, titulo: "Login por rol", nota: "Cada quien entra con su propio usuario" },
      { id: "personal", icono: Stethoscope, titulo: "Salud", nota: "Ve su radar completo" },
      { id: "comunitario", icono: Users, titulo: "Comunitario", nota: "Ve solo sus casos asignados" },
      { id: "familia", icono: Baby, titulo: "Familia", nota: "Ve solo a su propio nino" },
      { id: "ia", icono: Sparkles, titulo: "IA", nota: "Explica el resultado, no lo calcula ni diagnostica" },
    ],
  },
];

export function PotencialCapas() {
  return (
    <div className="flex flex-col gap-6">
      {FILAS.map((fila, i) => (
        <div key={fila.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                fila.construido ? "bg-primary" : "bg-muted-foreground/40",
              )}
            />
            {fila.etiqueta}
          </div>

          <div className="flex flex-wrap gap-2">
            {fila.cajas.map((caja) => (
              <CajaFlujo key={caja.id} caja={caja} construido={fila.construido} />
            ))}
          </div>

          {i < FILAS.length - 1 && (
            <div className="ml-3 h-5 w-px bg-border" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

function CajaFlujo({ caja, construido }: { caja: Caja; construido: boolean }) {
  const Icono = caja.icono;
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
          construido
            ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
            : "border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent",
        )}
      >
        <Icono className="h-3.5 w-3.5 shrink-0" />
        {caja.titulo}
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-56 px-3 py-2 text-xs">
        {caja.nota}
      </PopoverContent>
    </Popover>
  );
}
