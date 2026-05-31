"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";
import GlassCard from "@/components/GlassCard";
import TealBadge from "@/components/TealBadge";

interface Project {
  id: string; title: string; category: string; description: string;
  tech: string[]; year: string; link: string; imageURL: string; featured: boolean;
}

export default function HomePage() {
  const cfg = useSiteConfig();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.items ?? [])).catch(() => {});
  }, []);

  const featured = projects.filter(p => p.featured).slice(0, 2);
  const rest = projects.filter(p => !p.featured).slice(0, 1);

  const socialLinks = [
    { href: cfg.github, icon: Github, label: "GitHub" },
    { href: cfg.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: cfg.twitter, icon: Twitter, label: "Twitter" },
  ].filter(s => s.href);

  return (
    <main className="h-screen w-screen flex items-center justify-center md:pl-20 px-4 pb-20 md:pb-4 pt-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3 fade-up">

        {/* ── Profile card ── */}
        <GlassCard className="col-span-1 rounded-2xl p-6 flex flex-col gap-4" depth={6}>
          {/* Avatar */}
          <div className="relative w-14 h-14">
            <div className="w-14 h-14 rounded-2xl overflow-hidden"
              style={{ border: "2px solid hsl(185 100% 48% / 0.3)", background: "hsl(210 60% 12%)" }}>
              {cfg.photoURL
                ? <img src={cfg.photoURL} alt="Profile" className="w-full h-full object-cover"
                    style={{ objectPosition: cfg.photoFocus }} />
                : <div className="w-full h-full flex items-center justify-center text-3xl">🧑‍💻</div>}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full pulse-ring"
              style={{ background: "hsl(185,100%,48%)", border: "2px solid hsl(210 100% 4%)" }} />
          </div>

          {/* Name & bio */}
          <div className="flex-1 min-w-0">
            <p className="text-white/30 text-xs mb-0.5 tracking-widest uppercase font-syne">Portfolio</p>
            <h1 className="text-white font-bold text-xl leading-tight font-syne">{cfg.heroTitle}</h1>
            <p className="text-xs mt-0.5 font-medium" style={{ color: "hsl(185,100%,60%)" }}>{cfg.heroSubtitle}</p>
            {cfg.location && (
              <div className="flex items-center gap-1 mt-2 text-white/35 text-xs">
                <MapPin size={10} /> {cfg.location}
              </div>
            )}
            {cfg.aboutText && (
              <p className="text-white/45 text-xs mt-3 leading-relaxed line-clamp-4">{cfg.aboutText}</p>
            )}
          </div>

          {/* Social icons */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(185,100%,55%)",
                    border: "1px solid hsl(185 100% 48% / 0.15)" }}>
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}

          <Link href="/personal"
            className="w-fit flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:gap-2.5"
            style={{ border: "1px solid hsl(185 100% 48% / 0.25)", color: "hsl(185,100%,60%)" }}>
            See more <ArrowRight size={11} />
          </Link>
        </GlassCard>

        {/* ── Featured projects ── */}
        {featured.map((p, i) => (
          <GlassCard key={p.id} className="col-span-1 rounded-2xl overflow-hidden flex flex-col" depth={12}
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
              {p.imageURL
                ? <img src={p.imageURL} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                : <div className="w-full h-full" style={{
                    background: `linear-gradient(135deg, hsl(210 80% ${10 + i * 5}%) 0%, hsl(185 80% ${8 + i * 4}%) 100%)` }} />}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(to top, hsl(210 60% 8% / 0.9) 0%, transparent 60%)" }} />
              <div className="absolute top-3 left-3">
                <TealBadge label={p.category} />
              </div>
              {p.link && (
                <a href={p.link} target="_blank" rel="noopener noreferrer"
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "hsl(210 60% 8% / 0.7)", border: "1px solid hsl(185 100% 48% / 0.2)", color: "hsl(185,100%,60%)" }}>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between gap-2">
              <div>
                <p className="text-white font-semibold text-sm font-syne">{p.title}</p>
                <p className="text-white/45 text-xs mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.tech.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md"
                    style={{ background: "hsl(185 100% 48% / 0.06)", color: "hsl(185,100%,55%)",
                      border: "1px solid hsl(185 100% 48% / 0.12)" }}>{t}</span>
                ))}
              </div>
            </div>
          </GlassCard>
        ))}

        {/* ── Bottom row ── */}
        {/* Quick stats */}
        <GlassCard className="col-span-1 rounded-2xl p-5 flex flex-col justify-between" depth={6}>
          <p className="text-white/25 text-xs uppercase tracking-widest font-syne">At a glance</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { val: projects.length.toString(), label: "Projects" },
              { val: new Date().getFullYear() - 2020 + "+", label: "Yrs exp." },
              { val: "4", label: "Languages" },
              { val: "∞", label: "Coffee" },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-xl p-3 flex flex-col"
                style={{ background: "hsl(185 100% 48% / 0.05)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
                <span className="text-xl font-bold font-syne text-glow" style={{ color: "hsl(185,100%,60%)" }}>{val}</span>
                <span className="text-white/35 text-[11px] mt-0.5">{label}</span>
              </div>
            ))}
          </div>
          <Link href="/projects"
            className="mt-4 flex items-center justify-between text-xs font-medium px-3 py-2 rounded-xl transition-all hover:gap-3"
            style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(185,100%,60%)",
              border: "1px solid hsl(185 100% 48% / 0.15)" }}>
            All projects <ArrowRight size={12} />
          </Link>
        </GlassCard>

        {/* Extra project or skills teaser */}
        {rest[0] ? (
          <GlassCard className="col-span-1 rounded-2xl overflow-hidden relative" depth={10}>
            <div className="h-full min-h-[130px]">
              {rest[0].imageURL
                ? <img src={rest[0].imageURL} alt={rest[0].title} className="w-full h-full object-cover" />
                : <div className="w-full h-full" style={{ background: "linear-gradient(135deg,hsl(210 80% 12%),hsl(185 80% 10%))" }} />}
              <div className="absolute inset-0 flex flex-col justify-end p-4"
                style={{ background: "linear-gradient(to top, hsl(210 80% 6% / 0.95) 0%, transparent 60%)" }}>
                <TealBadge label={rest[0].category} />
                <p className="text-white font-semibold text-sm font-syne mt-1.5">{rest[0].title}</p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="col-span-1 rounded-2xl p-5 flex flex-col justify-center items-center text-center gap-2" depth={6}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "hsl(185 100% 48% / 0.1)" }}>⚡</div>
            <p className="text-white/70 text-sm font-semibold font-syne">Open to work</p>
            <p className="text-white/30 text-xs">Available for freelance & full-time roles</p>
          </GlassCard>
        )}

        {/* Career teaser */}
        <GlassCard className="col-span-1 rounded-2xl p-5 flex flex-col justify-between gap-3" depth={6}>
          <p className="text-white/25 text-xs uppercase tracking-widest font-syne">Latest role</p>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <p className="text-white font-semibold text-sm font-syne">Senior Frontend Engineer</p>
            <p className="text-xs" style={{ color: "hsl(185,100%,55%)" }}>Vercel · 2023–present</p>
            <p className="text-white/35 text-xs mt-1">Building the future of web deployment and edge infrastructure.</p>
          </div>
          <Link href="/career"
            className="flex items-center gap-1.5 text-xs font-medium transition-all hover:gap-2.5"
            style={{ color: "hsl(185,100%,55%)" }}>
            Full timeline <ArrowRight size={11} />
          </Link>
        </GlassCard>
      </div>
    </main>
  );
}
