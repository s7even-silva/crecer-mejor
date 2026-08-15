import Link from "next/link";
import { AlertCircle, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { NivelBadge, NivelDot } from "@/components/nivel-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RadarPage() {
  const filas = await api.radar();

  const conteo = { ROJO: 0, AMBAR: 0, VERDE: 0 };
  for (const f of filas) conteo[f.nivel]++;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Radar de prioridad
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Lista priorizada de ninos de este establecimiento. No es una
          probabilidad clinica: es un puntaje deterministico y auditable (ver
          razones en el perfil de cada nino).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        {(["ROJO", "AMBAR", "VERDE"] as const).map((nivel) => (
          <Card key={nivel} className="gap-1 py-4">
            <CardContent className="flex flex-col items-center gap-1 px-3">
              <NivelDot nivel={nivel} className="h-3.5 w-3.5" />
              <span className="text-2xl font-bold tabular-nums">
                {conteo[nivel]}
              </span>
              <span className="text-[11px] font-medium uppercase text-muted-foreground">
                {nivel}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla en pantallas medianas+ */}
      <Card className="hidden overflow-hidden py-0 sm:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>Codigo</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead className="text-right">Puntaje</TableHead>
              <TableHead className="text-right">Controles</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((f) => (
              <TableRow key={f.nino_id} className="group">
                <TableCell>
                  <NivelDot nivel={f.nivel} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/ninos/${f.nino_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {f.codigo}
                  </Link>
                </TableCell>
                <TableCell>
                  <NivelBadge nivel={f.nivel} />
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {f.puntaje}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {f.controles}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Tarjetas apiladas en movil */}
      <div className="flex flex-col gap-2 sm:hidden">
        {filas.map((f) => (
          <Link key={f.nino_id} href={`/ninos/${f.nino_id}`}>
            <Card className="py-3.5 transition-colors active:bg-accent">
              <CardContent className="flex items-center gap-3 px-4">
                <NivelDot nivel={f.nivel} className="h-3.5 w-3.5" />
                <div className="flex-1">
                  <div className="font-medium">{f.codigo}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.controles} control{f.controles === 1 ? "" : "es"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {f.puntaje}
                  </span>
                  <NivelBadge nivel={f.nivel} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filas.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">No hay ninos con mediciones registradas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
