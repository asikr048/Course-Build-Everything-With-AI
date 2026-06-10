"use client";
import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import GlassCard, { CARD_PALETTE } from "@/components/GlassCard";

interface Testimonial { id: string; name: string; role: string; quote: string; avatar: string; }
interface TestiData { intro: string; items: Testimonial[]; }

export default function TestimonialsPage() {
  const [data, setData] = useState<TestiData | null>(null);

  useEffect(() => {
    fetch("/api/testimonials").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const items = data?.items ?? [];

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-8 pt-8">
      <div className="max-w-4xl mx-auto fade-up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(var(--p))" }}>Kind words</p>
          <h1 className="text-3xl font-bold font-syne text-white">Testimonials</h1>
          {data?.intro && <p className="text-white/40 text-sm mt-2">{data.intro}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t, i) => {
            const accent = CARD_PALETTE[i % CARD_PALETTE.length];
            return (
              <GlassCard key={t.id} accent={accent} className="rounded-2xl p-6 flex flex-col gap-4" depth={6}>
                <Quote size={22} style={{ color: `hsl(${accent} / 0.7)` }} />
                <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0"
                    style={{ background: `hsl(${accent} / 0.18)`, border: `1px solid hsl(${accent} / 0.35)` }}>
                    {t.avatar
                      ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: `hsl(${accent})` }}>{(t.name || "?").charAt(0)}</div>}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold font-syne">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 text-white/25">
            <Quote size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No testimonials yet. Add some from the admin panel.</p>
          </div>
        )}
      </div>
    </main>
  );
}
