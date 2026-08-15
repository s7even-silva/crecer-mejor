"use client";

import { useActionState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Nino } from "@/lib/api";
import { NivelDot } from "@/components/nivel-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarMedicionAction, type ResultadoRegistro } from "./actions";

const FUENTE_LABEL: Record<string, string> = {
  CRED: "CRED",
  VISITA_DOMICILIARIA: "Visita domiciliaria",
  PROGRAMA_SOCIAL: "Programa social",
};

export default function FormularioNuevaMedicion({ ninos }: { ninos: Nino[] }) {
  const [resultado, formAction, pending] = useActionState<
    ResultadoRegistro | null,
    FormData
  >(registrarMedicionAction, null);

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-xl">
        <CardContent>
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nino_id">Niño</Label>
              <Select name="nino_id" defaultValue={ninos[0]?.id}>
                <SelectTrigger id="nino_id" className="w-full">
                  <SelectValue placeholder="Selecciona un niño">
                    {(value: string) =>
                      ninos.find((n) => n.id === value)?.codigo ?? value
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ninos.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fecha">Fecha del control</Label>
                <Input
                  id="fecha"
                  type="date"
                  name="fecha"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fuente">Fuente</Label>
                <Select name="fuente" defaultValue="CRED">
                  <SelectTrigger id="fuente" className="w-full">
                    <SelectValue>
                      {(value: string) => FUENTE_LABEL[value] ?? value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRED">CRED</SelectItem>
                    <SelectItem value="VISITA_DOMICILIARIA">
                      Visita domiciliaria
                    </SelectItem>
                    <SelectItem value="PROGRAMA_SOCIAL">
                      Programa social
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="peso_valor">Peso</Label>
                <Input
                  id="peso_valor"
                  type="number"
                  step="0.001"
                  name="peso_valor"
                  placeholder="0.000"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="peso_unidad">Unidad de peso</Label>
                <Select name="peso_unidad" defaultValue="kg">
                  <SelectTrigger id="peso_unidad" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="talla_valor">Talla</Label>
                <Input
                  id="talla_valor"
                  type="number"
                  step="0.01"
                  name="talla_valor"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="talla_unidad">Unidad de talla</Label>
                <Select name="talla_unidad" defaultValue="cm">
                  <SelectTrigger id="talla_unidad" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                    <SelectItem value="in">in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Guardando..." : "Guardar y recalcular"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {resultado && !resultado.ok && (
        <div className="flex max-w-xl items-start gap-2 rounded-md bg-nivel-rojo-bg px-4 py-3 text-sm text-nivel-rojo">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {resultado.error}
        </div>
      )}

      {resultado?.ok && (
        <Card className="max-w-xl">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <NivelDot nivel={resultado.evaluacion.prioridad.nivel} className="h-4 w-4" />
            <CardTitle className="text-lg">
              Nueva prioridad: {resultado.evaluacion.prioridad.nivel} (
              {resultado.evaluacion.prioridad.puntaje}%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {resultado.evaluacion.prioridad.razones.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
