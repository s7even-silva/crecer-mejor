import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function VerificacionPage() {
  const { filas, error_maximo_absoluto } = await api.verificacion();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Tabla de verificacion OMS
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Evidencia de TRL 3: el motor se compara contra los puntos de
          referencia publicados por la OMS (columnas SD3neg..SD3 de las
          tablas LMS oficiales), no contra un calculo propio.
        </p>
      </div>

      <Card className="max-w-xs border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 px-5 py-4">
          <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Error maximo absoluto
            </div>
            <div className="text-3xl font-bold tabular-nums">
              {error_maximo_absoluto} DE
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">
            Puntos de referencia ({filas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Sexo</TableHead>
                <TableHead className="text-right">Edad (m)</TableHead>
                <TableHead className="text-right">Peso ref (kg)</TableHead>
                <TableHead className="text-right">DE esperado</TableHead>
                <TableHead className="text-right">z motor</TableHead>
                <TableHead className="text-right">Error abs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map((f, i) => (
                <TableRow key={i}>
                  <TableCell>{f.sexo}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.edad_meses}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.peso_referencia_kg}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.de_esperado}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.z_motor}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {f.error_absoluto}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
