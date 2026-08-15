import Link from "next/link";
import { api } from "@/lib/api";

export default async function ListaNinosPage() {
  const ninos = await api.ninos();

  return (
    <div>
      <h1 className="text-3xl font-bold">Perfil y trayectoria</h1>
      <p className="mt-2 text-gray-600">Selecciona un nino para ver su perfil.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ninos.map((n) => (
          <Link
            key={n.id}
            href={`/ninos/${n.id}`}
            className="rounded border border-gray-200 px-4 py-3 text-center hover:bg-gray-50"
          >
            {n.codigo}
          </Link>
        ))}
      </div>
    </div>
  );
}
