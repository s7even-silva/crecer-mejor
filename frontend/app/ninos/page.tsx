import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export default async function ListaNinosPage() {
  const ninos = await api.ninos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Perfil y trayectoria
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Selecciona un niño para ver su perfil.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ninos.map((n) => (
          <Link key={n.id} href={`/ninos/${n.id}`}>
            <Card className="py-4 text-center transition-colors hover:border-primary/40 hover:bg-accent active:bg-accent">
              <CardContent className="px-2">
                <div className="font-medium">{n.codigo}</div>
                <div className="text-xs text-muted-foreground">
                  {n.sexo === "F" ? "Femenino" : "Masculino"}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
