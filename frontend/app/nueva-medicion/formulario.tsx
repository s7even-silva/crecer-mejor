"use client";

import { useActionState } from "react";
import type { Nino } from "@/lib/api";
import { registrarMedicionAction, type ResultadoRegistro } from "./actions";

const NIVEL_EMOJI: Record<string, string> = {
  ROJO: "\u{1F534}",
  AMBAR: "\u{1F7E1}",
  VERDE: "\u{1F7E2}",
};

export default function FormularioNuevaMedicion({ ninos }: { ninos: Nino[] }) {
  const [resultado, formAction, pending] = useActionState<
    ResultadoRegistro | null,
    FormData
  >(registrarMedicionAction, null);

  return (
    <div>
      <form action={formAction} className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium">Nino</label>
          <select name="nino_id" className="mt-1 w-full rounded border border-gray-300 p-2">
            {ninos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.codigo}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Fecha del control</label>
            <input
              type="date"
              name="fecha"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fuente</label>
            <select name="fuente" className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="CRED">CRED</option>
              <option value="VISITA_DOMICILIARIA">Visita domiciliaria</option>
              <option value="PROGRAMA_SOCIAL">Programa social</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Peso</label>
            <input
              type="number"
              step="0.001"
              name="peso_valor"
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Unidad de peso</label>
            <select name="peso_unidad" className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Talla</label>
            <input
              type="number"
              step="0.01"
              name="talla_valor"
              className="mt-1 w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Unidad de talla</label>
            <select name="talla_unidad" className="mt-1 w-full rounded border border-gray-300 p-2">
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="mm">mm</option>
              <option value="in">in</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Guardando..." : "Guardar y recalcular"}
        </button>
      </form>

      {resultado && !resultado.ok && (
        <p className="mt-4 rounded bg-red-50 p-3 text-red-700">{resultado.error}</p>
      )}

      {resultado?.ok && (
        <div className="mt-6 max-w-xl rounded border border-gray-200 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            {NIVEL_EMOJI[resultado.evaluacion.prioridad.nivel]} Nueva prioridad:{" "}
            {resultado.evaluacion.prioridad.nivel} (
            {resultado.evaluacion.prioridad.puntaje}/100)
          </h2>
          <ul className="mt-2 list-disc pl-6 text-gray-700">
            {resultado.evaluacion.prioridad.razones.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
