import { PotencialCapas } from "@/components/potencial-capas";
import { PotencialTimeline } from "@/components/potencial-timeline";

export default function PotencialPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Hacia donde va esto
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Toca cualquier caja para ver que hace. Verde es lo que ya
          funciona, punteado es lo que falta construir.
        </p>
      </div>

      <PotencialCapas />

      <p className="max-w-2xl text-sm text-muted-foreground">
        No inventamos una encuesta nueva: usamos el peso y la talla que
        CRED ya obliga a registrar. La plataforma lee lo que ya existe
        (HIS-MINSA, SIEN, Padron Nominal), no compite con eso.
      </p>

      <div>
        <h2 className="text-lg font-semibold">De aca a donde queremos llegar</h2>
        <div className="mt-4">
          <PotencialTimeline />
        </div>
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Sobre la norma: hoy el prototipo usa solo datos sinteticos y no
        cambia ningun protocolo clinico. Para usar datos reales hace falta
        comite de etica primero, y revisar que la NTS vigente de CRED ya
        cubra lo que proponemos -- no estamos pidiendo modificar ninguna
        ley.
      </p>
    </div>
  );
}
