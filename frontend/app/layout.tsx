import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Leaf } from "lucide-react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavLinks } from "@/components/nav-links";
import { SiteHeader } from "@/components/site-header";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Crecer Mejor",
  description:
    "Lectura longitudinal de la trayectoria antropometrica infantil",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-full">
            <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
              <div className="flex h-14 items-center gap-2 border-b px-5 text-sm font-semibold">
                <Leaf className="h-4.5 w-4.5 text-primary" />
                Crecer Mejor
              </div>
              <div className="flex-1 p-3">
                <NavLinks />
              </div>
              <div className="flex items-center justify-between border-t p-3">
                <span className="px-2 text-xs text-muted-foreground">Tema</span>
                <ThemeToggle />
              </div>
            </aside>

            <div className="flex min-h-full flex-1 flex-col">
              <SiteHeader />
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                <div className="mx-auto max-w-5xl">{children}</div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
