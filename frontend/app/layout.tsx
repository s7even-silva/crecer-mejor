import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crecer Mejor",
  description: "Lectura longitudinal de la trayectoria antropometrica infantil",
};

const PANTALLAS = [
  { href: "/", label: "Radar" },
  { href: "/ninos", label: "Perfil del nino" },
  { href: "/nueva-medicion", label: "Nueva medicion" },
  { href: "/verificacion", label: "Verificacion" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex bg-white text-gray-900">
        <aside className="w-56 shrink-0 border-r border-gray-200 p-4">
          <nav className="flex flex-col gap-1">
            {PANTALLAS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}
