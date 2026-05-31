"use client";
import { useEffect, useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import TealBadge from "@/components/TealBadge";

interface Project {
  id: string; title: string; category: string; description: string;
  tech: string[]; year: string; link: string; imageURL: string; featured: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.items ?? [])).catch(() => {});
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-8 pt-8">
      <div className="max-w-5xl mx-auto fade-up">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(185,100%,55%)" }}>Work</p>
          <h1 className="text-3xl font-bold font-syne text-white">Projects</h1>
          <p className="text-white/40 text-sm mt-2">Things I&apos;ve built, shipped and learned from.</p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={filter === cat
                ? { background: "hsl(185 100% 48% / 0.2)", color: "hsl(185,100%,60%)", border: "1px solid hsl(185 100% 48% / 0.3)" }
                : { background: "hsl(210 60% 8% / 0.5)", color: "hsl(185,100%,40%)", border: "1px solid hsl(185 100% 48% / 0.08)" }
              }>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <GlassCard key={p.id} className="rounded-2xl overflow-hidden flex flex-col" depth={10}>
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {p.imageURL
                  ? <img src={p.imageURL} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  : <div className="w-full h-full" style={{ background: "linear-gradient(135deg,hsl(210 80% 12%),hsl(185 80% 10%))" }} />}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,hsl(210 60% 8%) 0%,transparent 60%)" }} />
                <div className="absolute top-3 left-3 flex gap-2">
                  <TealBadge label={p.category} />
                  {p.featured && <TealBadge label="Featured" />}
                </div>
              </div>
              {/* Body */}
              <div className="flex-1 p-4 flex flex-col gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-semibold text-sm font-syne">{p.title}</p>
                    <span className="text-white/25 text-xs shrink-0">{p.year}</span>
                  </div>
                  <p className="text-white/40 text-xs mt-1.5 leading-relaxed line-clamp-3">{p.description}</p>
                </div>
                {/* Tech */}
                <div className="flex flex-wrap gap-1">
                  {p.tech.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{ background: "hsl(185 100% 48% / 0.06)", color: "hsl(185,100%,55%)", border: "1px solid hsl(185 100% 48% / 0.12)" }}>{t}</span>
                  ))}
                </div>
                {/* Links */}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium mt-auto transition-all hover:gap-2"
                    style={{ color: "hsl(185,100%,55%)" }}>
                    <ExternalLink size={12} /> View project
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/25">
            <Github size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No projects yet. Add some from the admin panel.</p>
          </div>
        )}
      </div>
    </main>
  );
}
