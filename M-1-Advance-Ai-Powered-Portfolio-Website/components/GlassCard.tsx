"use client";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Per-card accent palette (HSL triplets) — drives the multi-colored premium
 *  glow used across the site (projects, services, testimonials, …). */
export const CARD_PALETTE = [
  "185 100% 48%", // brand cyan
  "205 90% 56%",  // blue
  "32 95% 55%",   // orange
  "150 78% 45%",  // green
  "270 80% 65%",  // violet
  "330 85% 62%",  // pink
  "45 95% 55%",   // amber
  "190 90% 50%",  // sky
];

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  depth?: number;
  /** Show the glowing accent bar along the bottom edge (premium look). */
  glowBar?: boolean;
  /** Optional per-card accent (HSL triplet). Falls back to the theme primary. */
  accent?: string;
  /** Optional secondary accent for the bottom bar. Falls back to theme secondary. */
  accent2?: string;
}

export default function GlassCard({
  children, className, style, depth = 8, glowBar = true, accent, accent2,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  // Resolve accents — a custom accent themes the whole card; otherwise the
  // global primary/secondary CSS vars are used (back-compat with all callers).
  const a = accent ?? "var(--p)";
  const a2 = accent2 ?? accent ?? "var(--p2)";

  function handleMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * 2 * depth, y: -(px - 0.5) * 2 * depth });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      className={cn("relative overflow-hidden", className)}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? 6 : 0}px)`,
        background: accent
          ? `linear-gradient(160deg, hsl(${a} / ${hovered ? 0.16 : 0.1}), hsl(210 60% 7% / 0.55))`
          : "linear-gradient(165deg, hsl(210 60% 10% / 0.55), hsl(210 60% 7% / 0.5))",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid hsl(${a} / ${hovered ? 0.5 : 0.22})`,
        boxShadow: hovered
          ? `0 24px 70px rgba(0,0,0,0.55), 0 0 0 1px hsl(${a} / 0.38), 0 10px 50px hsl(${a} / 0.2)`
          : `0 10px 36px rgba(0,0,0,0.38), 0 0 26px hsl(${a} / 0.08)`,
        transition: "transform 0.18s ease, box-shadow 0.35s ease, border-color 0.35s ease",
        ...style,
      }}
    >
      {/* top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px"
        style={{ background: `linear-gradient(90deg, transparent, hsl(${a} / 0.6), transparent)` }} />

      {/* hover sheen — a soft accent wash that fades in */}
      <div className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(120% 80% at 80% 0%, hsl(${a} / 0.12) 0%, transparent 55%)`,
        }} />

      {children}

      {/* glowing bottom accent bar — the premium signature */}
      {glowBar && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]"
          style={{
            height: hovered ? 3 : 2,
            background: `linear-gradient(90deg, transparent 5%, hsl(${a}) 35%, hsl(${a2}) 65%, transparent 95%)`,
            boxShadow: `0 0 ${hovered ? 22 : 12}px hsl(${a} / ${hovered ? 0.85 : 0.5})`,
            opacity: hovered ? 1 : 0.7,
            transition: "all 0.35s ease",
          }} />
      )}
    </div>
  );
}
