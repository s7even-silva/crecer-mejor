"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardPlus,
  Compass,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const PANTALLAS = [
  { href: "/", label: "Radar", icon: Activity },
  { href: "/ninos", label: "Perfil del niño", icon: Users },
  { href: "/nueva-medicion", label: "Nueva medicion", icon: ClipboardPlus },
  { href: "/verificacion", label: "Verificacion", icon: ShieldCheck },
];

function estaActivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function ItemNav({
  href,
  label,
  icon: Icon,
  activo,
  onClick,
}: {
  href: string;
  label: string;
  icon: ElementType;
  activo: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        activo
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {PANTALLAS.map((p) => (
        <ItemNav
          key={p.href}
          href={p.href}
          label={p.label}
          icon={p.icon}
          activo={estaActivo(pathname, p.href)}
          onClick={onNavigate}
        />
      ))}

      <Separator className="my-2" />

      <ItemNav
        href="/arquitectura"
        label="Como esta construido"
        icon={Network}
        activo={estaActivo(pathname, "/arquitectura")}
        onClick={onNavigate}
      />
      <ItemNav
        href="/potencial"
        label="Hacia donde va esto"
        icon={Compass}
        activo={estaActivo(pathname, "/potencial")}
        onClick={onNavigate}
      />
    </nav>
  );
}
