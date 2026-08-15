import { CheckCircle2, TrendingDown, XCircle } from "lucide-react";
import { api, type Control } from "@/lib/api";
import { NivelBadge, NivelDot } from "@/components/nivel-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PerfilNinoPage({
  params,
}: {
  params: Promise<{ ninoId: string }>;
}) {
  const { ninoId } = await params;
  const [ninos, evaluacion] = await Promise.all([
    api.ninos(),
    api.evaluacion(ninoId),
  ]);
  const nino = ninos.find((n) => n.id === ninoId);
  const { prioridad, controles, tendencia } = evaluacion;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Perfil y trayectoria
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {nino?.codigo ?? ninoId} &middot; {nino?.sexo === "F" ? "Femenino" : "Masculino"}
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <NivelDot nivel={prioridad.nivel} className="h-4 w-4" />
          <CardTitle className="text-lg">
            Prioridad: {prioridad.nivel} ({prioridad.puntaje}/100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {prioridad.razones.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                {r}
              </li>
            ))}
          </ul>
          {tendencia.descenso_detectado && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-nivel-ambar-bg px-3 py-2 text-sm text-nivel-ambar">
              <TrendingDown className="h-4 w-4 shrink-0" />
              Descenso detectado por cruce de canal percentilar
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curva de z-score (peso/talla)</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto px-6 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">P/E</TableHead>
                  <TableHead className="text-right">T/E</TableHead>
                  <TableHead className="text-right">P/T</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {controles.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap">{c.fecha}</TableCell>
                    <ZCell valor={c.valido ? c.zscores["P/E"] : undefined} />
                    <ZCell valor={c.valido ? c.zscores["T/E"] : undefined} />
                    <ZCell valor={c.valido ? c.zscores["P/T"] : undefined} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de controles</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion
            defaultValue={[`c-${controles.length - 1}`]}
            className="w-full"
          >
            {controles.map((c, i) => (
              <AccordionItem key={i} value={`c-${i}`}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <span className="flex flex-1 items-center gap-2.5">
                    {c.valido ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-nivel-verde" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-nivel-rojo" />
                    )}
                    <span className="font-medium">{c.fecha}</span>
                    <span className="text-muted-foreground">{c.fuente}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {!c.valido ? (
                    <p className="rounded-md bg-nivel-rojo-bg px-3 py-2 text-sm text-nivel-rojo">
                      Razones de invalidez: {c.razones_invalidez.join("; ")}
                    </p>
                  ) : (
                    <DetalleControl control={c} />
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function ZCell({ valor }: { valor: number | undefined }) {
  if (valor === undefined) {
    return <TableCell className="text-right text-muted-foreground">&mdash;</TableCell>;
  }
  return <TableCell className="text-right tabular-nums">{valor}</TableCell>;
}

function DetalleControl({ control: c }: { control: Control }) {
  const hayBiv = Object.values(c.flags_biv).some(Boolean);

  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <Dato
        label="Peso"
        valor={`${c.peso_kg} kg`}
        original={`${c.peso_original[0]} ${c.peso_original[1]}`}
      />
      <Dato
        label="Talla"
        valor={`${c.talla_cm} cm`}
        original={`${c.talla_original[0]} ${c.talla_original[1]}`}
      />
      <Dato label="Edad" valor={`${c.edad_meses} meses`} />
      <Dato label="Confianza" valor={c.confianza ?? "normal"} />

      <div className="sm:col-span-2">
        <Separator className="my-1" />
      </div>

      <Dato
        label="Z-scores"
        valor={`P/E ${c.zscores["P/E"]} · T/E ${c.zscores["T/E"]} · P/T ${c.zscores["P/T"]}`}
      />
      <Dato
        label="Clasificacion"
        valor={`${c.clasificacion["P/E"]} · ${c.clasificacion["T/E"]} · ${c.clasificacion["P/T"]}`}
      />

      {hayBiv && (
        <div className="rounded-md bg-nivel-ambar-bg px-3 py-2 text-nivel-ambar sm:col-span-2">
          Flags BIV (valor biologicamente implausible) presentes en este control.
        </div>
      )}
    </div>
  );
}

function Dato({
  label,
  valor,
  original,
}: {
  label: string;
  valor: string;
  original?: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div>
        {valor}
        {original && (
          <span className="text-muted-foreground"> (original: {original})</span>
        )}
      </div>
    </div>
  );
}
