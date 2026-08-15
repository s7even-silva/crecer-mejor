import { ArrowRight } from "lucide-react";

export function ComparaCard({ malo, bueno }: { malo: string; bueno: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
      <span className="text-muted-foreground line-through decoration-muted-foreground/50">
        {malo}
      </span>
      <span className="flex items-center gap-1.5 font-medium text-primary">
        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        {bueno}
      </span>
    </div>
  );
}
