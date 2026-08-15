import { api, type Control } from "@/lib/api";

const NIVEL_COLOR: Record<string, string> = {
  ROJO: "bg-red-100 text-red-800",
  AMBAR: "bg-amber-100 text-amber-800",
  VERDE: "bg-green-100 text-green-800",
};

const NIVEL_EMOJI: Record<string, string> = {
  ROJO: "\u{1F534}",
  AMBAR: "\u{1F7E1}",
  VERDE: "\u{1F7E2}",
};

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
  const { prioridad, controles } = evaluacion;

  return (
    <div>
      <h1 className="text-3xl font-bold">Perfil y trayectoria</h1>
      <p className="mt-1 text-gray-500">{nino?.codigo ?? ninoId}</p>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-2xl">{NIVEL_EMOJI[prioridad.nivel]}</span>
        <h2 className="text-xl font-semibold">
          Prioridad: {prioridad.nivel} ({prioridad.puntaje}/100)
        </h2>
      </div>
      <ul className="mt-2 list-disc pl-6 text-gray-700">
        {prioridad.razones.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Curva de z-score (peso/talla)</h2>
      <ZScoreTable controles={controles} />

      <h2 className="mt-8 text-xl font-semibold">Historial de controles</h2>
      <div className="mt-3 flex flex-col gap-3">
        {controles.map((c, i) => (
          <details
            key={i}
            className="rounded border border-gray-200 p-3"
            open={i === controles.length - 1}
          >
            <summary className="cursor-pointer font-medium">
              {c.fecha} &middot; {c.fuente} &middot;{" "}
              {c.valido ? "✅ valido" : "❌ invalido"}
            </summary>
            {!c.valido ? (
              <p className="mt-2 text-red-700">
                Razones de invalidez: {c.razones_invalidez.join("; ")}
              </p>
            ) : (
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>
                  Peso: {c.peso_kg} kg (original: {c.peso_original[0]}{" "}
                  {c.peso_original[1]})
                </p>
                <p>
                  Talla: {c.talla_cm} cm (original: {c.talla_original[0]}{" "}
                  {c.talla_original[1]})
                </p>
                <p>Edad: {c.edad_meses} meses</p>
                <p>
                  Z-scores: P/E {c.zscores["P/E"]} &middot; T/E{" "}
                  {c.zscores["T/E"]} &middot; P/T {c.zscores["P/T"]}
                </p>
                <p>
                  Clasificacion: P/E {c.clasificacion["P/E"]} &middot; T/E{" "}
                  {c.clasificacion["T/E"]} &middot; P/T {c.clasificacion["P/T"]}
                </p>
                <p>Confianza: {c.confianza}</p>
                {Object.values(c.flags_biv).some(Boolean) && (
                  <p className="text-amber-700">
                    Flags BIV (valor biologicamente implausible):{" "}
                    {JSON.stringify(c.flags_biv)}
                  </p>
                )}
              </div>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

function ZScoreTable({ controles }: { controles: Control[] }) {
  return (
    <table className="mt-3 w-full max-w-xl text-sm border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-500">
          <th className="py-1 pr-4">Fecha</th>
          <th className="py-1 pr-4">P/E</th>
          <th className="py-1 pr-4">T/E</th>
          <th className="py-1 pr-4">P/T</th>
        </tr>
      </thead>
      <tbody>
        {controles.map((c, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="py-1 pr-4">{c.fecha}</td>
            <td className="py-1 pr-4">{c.valido ? c.zscores["P/E"] : "-"}</td>
            <td className="py-1 pr-4">{c.valido ? c.zscores["T/E"] : "-"}</td>
            <td className="py-1 pr-4">{c.valido ? c.zscores["P/T"] : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
