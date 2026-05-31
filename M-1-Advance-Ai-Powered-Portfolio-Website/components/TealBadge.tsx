import { cn } from "@/lib/utils";

export default function TealBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase", className)}
      style={{
        background: "hsl(185 100% 48% / 0.12)",
        color: "hsl(185 100% 60%)",
        border: "1px solid hsl(185 100% 48% / 0.2)",
      }}
    >
      {label}
    </span>
  );
}
