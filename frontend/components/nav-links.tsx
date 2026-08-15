"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ClipboardPlus, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const PANTALLAS = [
  { href: "/", label: "Radar", icon: Activity },
  { href: "/ninos", label: "Perfil del nino", icon: Users },
  { href: "/nueva-medicion", label: "Nueva medicion", icon: ClipboardPlus },
  { href: "/verificacion", label: "Verificacion", icon: ShieldCheck },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {PANTALLAS.map((p) => {
        const activo =
          p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
        const Icon = p.icon;
        return (
          <Link
            key={p.href}
            href={p.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              activo
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
