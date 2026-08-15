import { api } from "@/lib/api";
import FormularioNuevaMedicion from "./formulario";

export default async function NuevaMedicionPage() {
  const ninos = await api.ninos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Registrar nueva medicion
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Al guardar, el historial, la curva y la prioridad de este niño se
          recalculan en vivo con el motor real.
        </p>
      </div>
      <FormularioNuevaMedicion ninos={ninos} />
    </div>
  );
}
