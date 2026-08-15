import { api } from "@/lib/api";
import FormularioNuevaMedicion from "./formulario";

export default async function NuevaMedicionPage() {
  const ninos = await api.ninos();

  return (
    <div>
      <h1 className="text-3xl font-bold">Registrar nueva medicion</h1>
      <p className="mt-2 text-gray-600 max-w-xl">
        Al guardar, el historial, la curva y la prioridad de este nino se
        recalculan en vivo con el motor real.
      </p>
      <FormularioNuevaMedicion ninos={ninos} />
    </div>
  );
}
