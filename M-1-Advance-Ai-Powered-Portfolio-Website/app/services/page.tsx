"use client";
import { useEffect, useState } from "react";
import {
  Sparkles, Code, Palette, Lightbulb, Wrench, Smartphone, Globe, PenTool,
  Camera, Megaphone, BarChart, ShoppingCart, Server, Database, Cloud, Cpu,
  Zap, Rocket, Search, Mail, MessageSquare, Layout, Layers, Brush, Video,
  Music, FileText, Briefcase, Star, Heart, Shield, Settings, Terminal, type LucideIcon,
} from "lucide-react";
import GlassCard, { CARD_PALETTE } from "@/components/GlassCard";

interface Service { id: string; title: string; description: string; icon: string; }
interface ServicesData { intro: string; items: Service[]; }

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles, code: Code, palette: Palette, lightbulb: Lightbulb, wrench: Wrench,
  smartphone: Smartphone, globe: Globe, pentool: PenTool, camera: Camera, megaphone: Megaphone,
  barchart: BarChart, shoppingcart: ShoppingCart, server: Server, database: Database, cloud: Cloud,
  cpu: Cpu, zap: Zap, rocket: Rocket, search: Search, mail: Mail, messagesquare: MessageSquare,
  layout: Layout, layers: Layers, brush: Brush, video: Video, music: Music, filetext: FileText,
  briefcase: Briefcase, star: Star, heart: Heart, shield: Shield, settings: Settings, terminal: Terminal,
};

function IconFor({ name }: { name: string }) {
  const Cmp = ICON_MAP[(name || "").toLowerCase().replace(/[^a-z]/g, "")] ?? Sparkles;
  return <Cmp size={20} />;
}

export default function ServicesPage() {
  const [data, setData] = useState<ServicesData | null>(null);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const items = data?.items ?? [];

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-8 pt-8">
      <div className="max-w-5xl mx-auto fade-up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(var(--p))" }}>What I do</p>
          <h1 className="text-3xl font-bold font-syne text-white">Services</h1>
          {data?.intro && <p className="text-white/40 text-sm mt-2">{data.intro}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s, i) => {
            const accent = CARD_PALETTE[i % CARD_PALETTE.length];
            return (
              <GlassCard key={s.id} accent={accent} className="rounded-2xl p-6 flex flex-col gap-3" depth={8}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `hsl(${accent} / 0.14)`, border: `1px solid hsl(${accent} / 0.28)`, color: `hsl(${accent})` }}>
                  <IconFor name={s.icon} />
                </div>
                <p className="text-white font-semibold text-base font-syne">{s.title}</p>
                <p className="text-white/45 text-sm leading-relaxed">{s.description}</p>
              </GlassCard>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 text-white/25">
            <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No services yet. Add some from the admin panel.</p>
          </div>
        )}
      </div>
    </main>
  );
}
