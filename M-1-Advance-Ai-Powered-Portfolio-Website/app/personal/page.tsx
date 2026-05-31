"use client";
import { useEffect, useState } from "react";
import { MapPin, Mail, Phone, Github, Linkedin, Twitter } from "lucide-react";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";
import GlassCard from "@/components/GlassCard";

interface SkillGroup { name: string; items: string[]; }
interface SkillsData { groups: SkillGroup[]; }

export default function PersonalPage() {
  const cfg = useSiteConfig();
  const [skills, setSkills] = useState<SkillsData | null>(null);

  useEffect(() => {
    fetch("/api/skills").then(r => r.json()).then(setSkills).catch(() => {});
  }, []);

  const contacts = [
    { icon: Mail, label: "Email", value: cfg.email, href: `mailto:${cfg.email}` },
    { icon: Phone, label: "Phone", value: cfg.phone, href: `tel:${cfg.phone}` },
    { icon: Github, label: "GitHub", value: cfg.github ? "View profile" : "", href: cfg.github },
    { icon: Linkedin, label: "LinkedIn", value: cfg.linkedin ? "View profile" : "", href: cfg.linkedin },
    { icon: Twitter, label: "Twitter", value: cfg.twitter ? "View profile" : "", href: cfg.twitter },
  ].filter(c => c.value);

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-8 pt-8">
      <div className="max-w-4xl mx-auto fade-up">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(185,100%,55%)" }}>About</p>
          <h1 className="text-3xl font-bold font-syne text-white">Personal</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile */}
          <GlassCard className="md:col-span-1 rounded-2xl p-6 flex flex-col items-center text-center gap-4" depth={6}>
            <div className="w-20 h-20 rounded-2xl overflow-hidden"
              style={{ border: "2px solid hsl(185 100% 48% / 0.3)", background: "hsl(210 60% 12%)" }}>
              {cfg.photoURL
                ? <img src={cfg.photoURL} alt="Profile" className="w-full h-full object-cover" style={{ objectPosition: cfg.photoFocus }} />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🧑‍💻</div>}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg font-syne">{cfg.heroTitle}</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(185,100%,60%)" }}>{cfg.heroSubtitle}</p>
              {cfg.location && (
                <div className="flex items-center justify-center gap-1 mt-2 text-white/35 text-xs">
                  <MapPin size={10} /> {cfg.location}
                </div>
              )}
            </div>
            {cfg.aboutText && (
              <p className="text-white/45 text-xs leading-relaxed">{cfg.aboutText}</p>
            )}
            {/* Contact links */}
            <div className="w-full flex flex-col gap-2 mt-auto">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: "hsl(185 100% 48% / 0.05)", border: "1px solid hsl(185 100% 48% / 0.1)" }}>
                  <Icon size={13} style={{ color: "hsl(185,100%,55%)" }} />
                  <span className="text-white/50 text-xs flex-1 truncate">{value}</span>
                </a>
              ))}
            </div>
          </GlassCard>

          {/* Skills */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {skills?.groups.map(group => (
              <GlassCard key={group.name} className="rounded-2xl p-5" depth={6}>
                <p className="text-xs uppercase tracking-widest mb-3 font-syne" style={{ color: "hsl(185,100%,45%)" }}>{group.name}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(skill => (
                    <span key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 cursor-default"
                      style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(195,70%,80%)",
                        border: "1px solid hsl(185 100% 48% / 0.15)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
