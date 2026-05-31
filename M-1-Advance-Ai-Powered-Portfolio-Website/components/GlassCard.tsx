"use client";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  depth?: number;
}

export default function GlassCard({ children, className, style, depth = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x: y * depth, y: -x * depth });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      className={cn("transition-all duration-300", className)}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? 4 : 0}px)`,
        background: "hsl(210 60% 8% / 0.5)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid hsl(185 100% 48% / ${hovered ? 0.2 : 0.08})`,
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.4), 0 0 30px hsl(185 100% 48% / 0.06)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        transition: "transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
