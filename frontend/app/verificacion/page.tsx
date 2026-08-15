import { api } from "@/lib/api";

export default async function VerificacionPage() {
  const { filas, error_maximo_absoluto } = await api.verificacion();

  return (
    <div>
      <h1 className="text-3xl font-bold">Tabla de verificacion OMS</h1>
      <p className="mt-2 text-gray-600 max-w-2xl">
        Evidencia de TRL 3: el motor se compara contra los puntos de
        referencia publicados por la OMS (columnas SD3neg..SD3 de las tablas
        LMS oficiales), no contra un calculo propio.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 px-4 py-3 inline-block">
        <div className="text-sm text-gray-500">Error maximo absoluto</div>
        <div className="text-3xl font-semibold">{error_maximo_absoluto} DE</div>
      </div>

      <table className="mt-6 w-full max-w-3xl text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4">Sexo</th>
            <th className="py-2 pr-4">Edad (m)</th>
            <th className="py-2 pr-4">Peso ref (kg)</th>
            <th className="py-2 pr-4">DE esperado</th>
            <th className="py-2 pr-4">z motor</th>
            <th className="py-2 pr-4">Error abs</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-1 pr-4">{f.sexo}</td>
              <td className="py-1 pr-4">{f.edad_meses}</td>
              <td className="py-1 pr-4">{f.peso_referencia_kg}</td>
              <td className="py-1 pr-4">{f.de_esperado}</td>
              <td className="py-1 pr-4">{f.z_motor}</td>
              <td className="py-1 pr-4">{f.error_absoluto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
