import { cn } from "@/lib/utils";

export default function TealBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase", className)}
      style={{
        background: "hsl(var(--p) / 0.12)",
        color: "hsl(var(--p))",
        border: "1px solid hsl(var(--p) / 0.2)",
      }}
    >
      {label}
    </span>
  );
}
