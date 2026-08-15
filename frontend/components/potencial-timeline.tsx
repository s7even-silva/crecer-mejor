"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FASES = [
  { trl: "TRL 3", titulo: "Hoy", nota: "motor + radar", hecho: true },
  { trl: "TRL 4", titulo: "Validacion", nota: "datos reales + etica", hecho: false },
  { trl: "TRL 5", titulo: "Piloto", nota: "1-2 postas", hecho: false },
  { trl: "TRL 6+", titulo: "Escala", nota: "conectado a MINSA", hecho: false },
];

export function PotencialTimeline() {
  return (
    <div className="flex items-start gap-1 sm:gap-2">
      {FASES.map((fase, i) => (
        <div key={fase.trl} className="flex flex-1 items-start">
          <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                fase.hecho
                  ? "bg-primary text-primary-foreground"
                  : "border border-dashed border-muted-foreground/40 text-muted-foreground",
              )}
            >
              {fase.hecho ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <div className="text-xs font-semibold">{fase.titulo}</div>
            <div className="text-[11px] text-muted-foreground">{fase.trl}</div>
            <div className="text-[11px] text-muted-foreground">{fase.nota}</div>
          </div>
          {i < FASES.length - 1 && (
            <div className="mt-3.5 h-px flex-1 bg-border" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}
