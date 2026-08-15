import Link from "next/link";
import { api } from "@/lib/api";

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

export default async function RadarPage() {
  const filas = await api.radar();

  const conteo = { ROJO: 0, AMBAR: 0, VERDE: 0 };
  for (const f of filas) conteo[f.nivel]++;

  return (
    <div>
      <h1 className="text-3xl font-bold">Radar de prioridad</h1>
      <p className="mt-2 text-gray-600 max-w-2xl">
        Lista priorizada de ninos de este establecimiento. No es una
        probabilidad clinica: es un puntaje deterministico y auditable (ver
        razones en el perfil de cada nino).
      </p>

      <div className="mt-6 flex gap-6">
        {(["ROJO", "AMBAR", "VERDE"] as const).map((nivel) => (
          <div key={nivel} className="rounded-lg border border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-500">
              {NIVEL_EMOJI[nivel]} {nivel}
            </div>
            <div className="text-2xl font-semibold">{conteo[nivel]}</div>
          </div>
        ))}
      </div>

      <table className="mt-6 w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4"></th>
            <th className="py-2 pr-4">Codigo</th>
            <th className="py-2 pr-4">Nivel</th>
            <th className="py-2 pr-4">Puntaje</th>
            <th className="py-2 pr-4">Controles</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nino_id} className="border-b border-gray-100">
              <td className="py-2 pr-4">{NIVEL_EMOJI[f.nivel]}</td>
              <td className="py-2 pr-4">
                <Link
                  href={`/ninos/${f.nino_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {f.codigo}
                </Link>
              </td>
              <td className="py-2 pr-4">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${NIVEL_COLOR[f.nivel]}`}
                >
                  {f.nivel}
                </span>
              </td>
              <td className="py-2 pr-4">{f.puntaje}</td>
              <td className="py-2 pr-4">{f.controles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
