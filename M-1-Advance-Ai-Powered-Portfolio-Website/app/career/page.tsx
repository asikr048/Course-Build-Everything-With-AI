"use client";
import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Award, BookOpen } from "lucide-react";
import GlassCard, { CARD_PALETTE } from "@/components/GlassCard";
import TealBadge from "@/components/TealBadge";

interface CareerItem { id: string; type: string; title: string; org: string; years: string; }
interface CareerSection { title: string; items: CareerItem[]; }
interface CareerData { intro: string; sections: CareerSection[]; }

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Education: GraduationCap,
  Experience: Briefcase,
  Certifications: Award,
  Courses: BookOpen,
};

export default function CareerPage() {
  const [data, setData] = useState<CareerData | null>(null);

  useEffect(() => {
    fetch("/api/career").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <main className="h-screen w-screen flex items-center justify-center md:pl-20">
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "hsl(var(--p)) transparent transparent transparent" }} />
    </main>
  );

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-8 pt-8">
      <div className="max-w-4xl mx-auto fade-up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(var(--p))" }}>Journey</p>
          <h1 className="text-3xl font-bold font-syne text-white">Career</h1>
          {data.intro && <p className="text-white/40 text-sm mt-2">{data.intro}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.sections.map((section, si) => {
            const Icon = iconMap[section.title] ?? Briefcase;
            const accent = CARD_PALETTE[si % CARD_PALETTE.length];
            return (
              <GlassCard key={section.title} accent={accent} className="rounded-2xl p-5" depth={6}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `hsl(${accent} / 0.14)`, border: `1px solid hsl(${accent} / 0.28)`, color: `hsl(${accent})` }}>
                    <Icon size={16} />
                  </div>
                  <h2 className="text-white font-semibold text-sm font-syne">{section.title}</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {section.items.map((item, i) => (
                    <div key={item.id} className="relative pl-4">
                      {/* Timeline line */}
                      {i < section.items.length - 1 && (
                        <div className="absolute left-[5px] top-4 bottom-0 w-px"
                          style={{ background: `hsl(${accent} / 0.18)` }} />
                      )}
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full"
                        style={{ background: `hsl(${accent})`, boxShadow: `0 0 8px hsl(${accent} / 0.5)` }} />

                      <div className="rounded-xl p-3"
                        style={{ background: `hsl(${accent} / 0.05)`, border: `1px solid hsl(${accent} / 0.1)` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <TealBadge label={item.type} className="mb-1.5" />
                            <p className="text-white text-sm font-medium font-syne">{item.title}</p>
                            {item.org && <p className="text-white/40 text-xs mt-0.5">{item.org}</p>}
                          </div>
                          <span className="text-white/25 text-xs shrink-0 mt-0.5">{item.years}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </main>
  );
}
