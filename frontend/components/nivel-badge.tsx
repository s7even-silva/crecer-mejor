import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Nivel = "VERDE" | "AMBAR" | "ROJO";

const ESTILOS: Record<Nivel, string> = {
  ROJO: "bg-nivel-rojo-bg text-nivel-rojo border-nivel-rojo/20",
  AMBAR: "bg-nivel-ambar-bg text-nivel-ambar border-nivel-ambar/20",
  VERDE: "bg-nivel-verde-bg text-nivel-verde border-nivel-verde/20",
};

const ICONO: Record<Nivel, string> = {
  ROJO: "fill-nivel-rojo text-nivel-rojo",
  AMBAR: "fill-nivel-ambar text-nivel-ambar",
  VERDE: "fill-nivel-verde text-nivel-verde",
};

export function NivelBadge({ nivel, className }: { nivel: Nivel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        ESTILOS[nivel],
        className,
      )}
    >
      <Circle className={cn("h-2 w-2", ICONO[nivel])} />
      {nivel}
    </span>
  );
}

export function NivelDot({ nivel, className }: { nivel: Nivel; className?: string }) {
  return <Circle className={cn("h-3 w-3 shrink-0", ICONO[nivel], className)} />;
}
