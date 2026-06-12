"use client";
import { useEffect, useState } from "react";
import {
  MapPin, Mail, Phone, Github, Linkedin, Twitter, Instagram,
  Youtube, Dribbble, Globe, FileText,
  GraduationCap, Briefcase, Award, Code2, Zap, Users, Star,
  Heart, Languages, Sparkles, Pencil, Clock, Calendar, Sun, Moon,
  Navigation, Building2,
} from "lucide-react";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";
import GlassCard, { CARD_PALETTE } from "@/components/GlassCard";
import { highlightIcon, type HighlightsData } from "@/lib/highlightIcons";

interface SkillGroup { name: string; items: string[]; }
interface SkillsData { groups: SkillGroup[]; }

interface CareerItem { id: string; type: string; title: string; org: string; years: string; }
interface CareerSection { title: string; items: CareerItem[]; }
interface CareerData { intro?: string; sections: CareerSection[]; }

// ── Count-up animation ──
function Counter({ value }: { value: string }) {
  const parts = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const [shown, setShown] = useState(parts ? "0" : value);

  useEffect(() => {
    if (!parts) { setShown(value); return; }
    const target = parseFloat(parts[2]);
    const decimals = parts[2].includes(".") ? 1 : 0;
    const dur = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown((target * eased).toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!parts) return <>{value}</>;
  return <>{parts[1]}{shown}{parts[3]}</>;
}

// ── Local time clock ──
function useLocalTime(timezone?: string) {
  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function LocalTimeBadge({ location, timezone }: { location?: string; timezone?: string }) {
  const now = useLocalTime(timezone);
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: tz, hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz });
  const hour = parseInt(now.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false, timeZone: tz }));
  const isDaytime = hour >= 6 && hour < 20;
  const tzShort = (() => { try { return new Intl.DateTimeFormat("en", { timeZoneName: "short", timeZone: tz }).formatToParts(now).find(p => p.type === "timeZoneName")?.value ?? tz; } catch { return tz; } })();

  return (
    <div className="w-full rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(210 60% 8% / 0.8), hsl(210 60% 5% / 0.6))", border: "1px solid hsl(var(--p) / 0.15)" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid hsl(var(--p) / 0.08)", background: "hsl(var(--p) / 0.05)" }}>
        <div className="flex items-center gap-1.5">
          <Navigation size={10} style={{ color: "hsl(var(--p))" }} />
          <span className="text-[9px] uppercase tracking-widest font-syne" style={{ color: "hsl(var(--p))" }}>Location</span>
        </div>
        <div className="flex items-center gap-1">
          {isDaytime
            ? <Sun size={10} style={{ color: "#f59e0b" }} />
            : <Moon size={10} style={{ color: "#818cf8" }} />}
          <span className="text-[9px]" style={{ color: isDaytime ? "#f59e0b" : "#818cf8" }}>{isDaytime ? "Day" : "Night"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 flex flex-col gap-2.5">
        {/* Location name */}
        {location && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--p) / 0.12)", border: "1px solid hsl(var(--p) / 0.2)" }}>
              <MapPin size={11} style={{ color: "hsl(var(--p))" }} />
            </div>
            <span className="text-white/70 text-xs font-medium">{location}</span>
          </div>
        )}

        {/* Time display */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-2xl font-syne leading-none tracking-tight">{timeStr}</p>
            <p className="text-white/35 text-[10px] mt-1 flex items-center gap-1">
              <Calendar size={8} />{dateStr}
            </p>
          </div>
          <div className="text-right">
            <div className="px-2 py-0.5 rounded-lg text-[9px] font-mono"
              style={{ background: "hsl(var(--p) / 0.1)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.2)" }}>
              {tzShort}
            </div>
          </div>
        </div>

        {/* Time bars — hour progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-white/20 text-[8px] uppercase tracking-widest">Day progress</span>
            <span className="text-white/25 text-[8px]">{Math.round(((hour * 60 + now.getMinutes()) / 1440) * 100)}%</span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "hsl(210 60% 12%)" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${((hour * 60 + now.getMinutes()) / 1440) * 100}%`,
                background: isDaytime
                  ? "linear-gradient(90deg, hsl(185 100% 48%), hsl(45 95% 55%))"
                  : "linear-gradient(90deg, hsl(205 90% 56%), hsl(270 80% 65%))",
              }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const TYPE_ICON: Record<string, typeof Briefcase> = {
  "Bachelor": GraduationCap, "Master": GraduationCap,
  "Full-Time": Briefcase, "Intern": Code2,
  "Certificate": Award, "Freelance": Users,
};

export default function PersonalPage() {
  const cfg = useSiteConfig();
  const [skills, setSkills] = useState<SkillsData | null>(null);
  const [career, setCareer] = useState<CareerData | null>(null);
  const [highlights, setHighlights] = useState<HighlightsData | null>(null);

  useEffect(() => {
    fetch("/api/skills").then(r => r.json()).then(setSkills).catch(() => {});
    fetch("/api/career").then(r => r.json()).then(setCareer).catch(() => {});
    fetch("/api/highlights").then(r => r.json()).then(setHighlights).catch(() => {});
  }, []);

  const contacts = [
    { icon: Mail,     label: "Email",     value: cfg.email,                         href: `mailto:${cfg.email}` },
    { icon: Phone,    label: "Phone",     value: cfg.phone,                         href: `tel:${cfg.phone}` },
    { icon: FileText, label: "Resume",    value: cfg.resumeURL ? "Download CV" : "", href: cfg.resumeURL },
    { icon: Github,   label: "GitHub",    value: cfg.github   ? "View profile" : "", href: cfg.github },
    { icon: Linkedin, label: "LinkedIn",  value: cfg.linkedin ? "View profile" : "", href: cfg.linkedin },
    { icon: Twitter,  label: "Twitter",   value: cfg.twitter  ? "View profile" : "", href: cfg.twitter },
    { icon: Instagram,label: "Instagram", value: cfg.instagram? "View profile" : "", href: cfg.instagram },
    { icon: Youtube,  label: "YouTube",   value: cfg.youtube  ? "View channel" : "", href: cfg.youtube },
    { icon: Dribbble, label: "Dribbble",  value: cfg.dribbble ? "View profile" : "", href: cfg.dribbble },
    { icon: Globe,    label: "Website",   value: cfg.website  ? "Visit site"   : "", href: cfg.website },
  ].filter(c => c.value);

  const stats = (cfg.stats ?? []).filter(s => s.value || s.label);

  // Flatten all career items into a single timeline (most-recent first)
  const timeline = career?.sections.flatMap(sec =>
    sec.items.map(item => ({ ...item, section: sec.title }))
  ) ?? [];

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-20 px-4 pb-24 md:pb-12 pt-8">
      <div className="max-w-4xl mx-auto fade-up">

        {/* ── Header ── */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(var(--p))" }}>About</p>
          <h1 className="text-3xl font-bold font-syne text-white">Personal</h1>
        </div>

        {/* ── Top grid: profile + skills ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Profile card */}
          <GlassCard className="md:col-span-1 rounded-2xl p-6 flex flex-col items-center text-center gap-4 relative" depth={6}>
            {/* Admin link */}
            <a
              href="/admin/dashboard"
              title="Edit in Admin Panel"
              className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium font-syne transition-all duration-200 hover:scale-105"
              style={{ background: "hsl(var(--p) / 0.1)", border: "1px solid hsl(var(--p) / 0.25)", color: "hsl(var(--p))" }}
            >
              <Pencil size={10} /> Edit
            </a>

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden"
              style={{ border: "2px solid hsl(var(--p) / 0.3)", background: "hsl(210 60% 12%)" }}>
              {cfg.photoURL
                ? <img src={cfg.photoURL} alt="Profile" className="w-full h-full object-cover" style={{ objectPosition: cfg.photoFocus }} />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🧑‍💻</div>}
            </div>

            {/* Name / role */}
            <div>
              <h2 className="text-white font-bold text-lg font-syne">{cfg.heroTitle}</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "hsl(var(--p))" }}>{cfg.heroSubtitle}</p>
              {cfg.location && (
                <div className="flex items-center justify-center gap-1 mt-2 text-white/35 text-xs">
                  <MapPin size={10} /> {cfg.location}
                </div>
              )}
            </div>

            {cfg.aboutText && (
              <p className="text-white/45 text-xs leading-relaxed">{cfg.aboutText}</p>
            )}

            {/* Availability status badge */}
            {(() => {
              const color = cfg.availabilityColor === "amber"
                ? { bg: "hsl(40 96% 54% / 0.1)", border: "hsl(40 96% 54% / 0.3)", dot: "#f59e0b", glow: "#f59e0b" }
                : cfg.availabilityColor === "red"
                ? { bg: "hsl(0 84% 60% / 0.1)", border: "hsl(0 84% 60% / 0.3)", dot: "#ef4444", glow: "#ef4444" }
                : { bg: "hsl(142 70% 45% / 0.1)", border: "hsl(142 70% 45% / 0.3)", dot: "#22c55e", glow: "#22c55e" };
              return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs w-fit"
                  style={{ background: color.bg, border: `1px solid ${color.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color.dot, boxShadow: `0 0 6px ${color.glow}` }} />
                  <span className="text-white/60">{cfg.availabilityStatus || "Open to work"}</span>
                </div>
              );
            })()}

            {/* Currently working on */}
            {cfg.currentlyWorkingOn && (
              <div className="w-full rounded-xl px-3 py-2.5 text-left"
                style={{ background: "hsl(var(--p) / 0.06)", border: "1px solid hsl(var(--p) / 0.12)" }}>
                <p className="text-white/30 text-[9px] uppercase tracking-widest font-syne mb-1 flex items-center gap-1">
                  <Sparkles size={9} /> Currently working on
                </p>
                <p className="text-white/65 text-xs leading-relaxed">{cfg.currentlyWorkingOn}</p>
              </div>
            )}

            {/* Personality tags */}
            {cfg.personalityTags && (
              <div className="w-full text-left">
                <p className="text-white/25 text-[9px] uppercase tracking-widest font-syne mb-2 flex items-center gap-1">
                  <Star size={9} /> Traits
                </p>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {cfg.personalityTags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{ background: "hsl(var(--p2) / 0.08)", color: "hsl(var(--p2))", border: "1px solid hsl(var(--p2) / 0.18)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {cfg.interests && (
              <div className="w-full text-left">
                <p className="text-white/25 text-[9px] uppercase tracking-widest font-syne mb-2 flex items-center gap-1">
                  <Heart size={9} /> Interests
                </p>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {cfg.interests.split(",").map(t => t.trim()).filter(Boolean).map(interest => (
                    <span key={interest}
                      className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(195 70% 75%)", border: "1px solid hsl(var(--p) / 0.15)" }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {cfg.languages && (
              <div className="w-full text-left">
                <p className="text-white/25 text-[9px] uppercase tracking-widest font-syne mb-2 flex items-center gap-1">
                  <Languages size={9} /> Languages
                </p>
                <div className="flex flex-col gap-1.5">
                  {cfg.languages.split(",").map(l => l.trim()).filter(Boolean).map(lang => {
                    const [name, ...rest] = lang.split("(");
                    const level = rest.join("(").replace(")", "").trim();
                    return (
                      <div key={lang} className="flex items-center justify-between px-3 py-1.5 rounded-xl"
                        style={{ background: "hsl(var(--p) / 0.05)", border: "1px solid hsl(var(--p) / 0.1)" }}>
                        <span className="text-white/60 text-xs">{name.trim()}</span>
                        {level && <span className="text-[10px]" style={{ color: "hsl(var(--p))" }}>{level}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Local time & place card ── */}
            <LocalTimeBadge location={cfg.location} />

            {/* ── Quick info row ── */}
            {(cfg.age || cfg.location) && (
              <div className="w-full grid grid-cols-2 gap-2">
                {cfg.location && (
                  <div className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
                    style={{ background: "hsl(185 100% 48% / 0.06)", border: "1px solid hsl(185 100% 48% / 0.15)" }}>
                    <div className="flex items-center gap-1">
                      <Building2 size={9} style={{ color: "hsl(185 100% 48%)" }} />
                      <span className="text-[8px] uppercase tracking-widest font-syne" style={{ color: "hsl(185 100% 48%)" }}>Based in</span>
                    </div>
                    <p className="text-white/65 text-[11px] font-medium leading-tight">{cfg.location}</p>
                  </div>
                )}
                {cfg.age && (
                  <div className="rounded-xl px-3 py-2.5 flex flex-col gap-1"
                    style={{ background: "hsl(270 80% 65% / 0.06)", border: "1px solid hsl(270 80% 65% / 0.15)" }}>
                    <div className="flex items-center gap-1">
                      <Calendar size={9} style={{ color: "hsl(270 80% 65%)" }} />
                      <span className="text-[8px] uppercase tracking-widest font-syne" style={{ color: "hsl(270 80% 65%)" }}>Age</span>
                    </div>
                    <p className="text-white/65 text-[11px] font-medium">{cfg.age}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact links */}
            <div className="w-full flex flex-col gap-2 mt-auto">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ background: "hsl(var(--p) / 0.05)", border: "1px solid hsl(var(--p) / 0.1)" }}>
                  <Icon size={13} style={{ color: "hsl(var(--p))" }} />
                  <span className="text-white/50 text-xs flex-1 truncate">{value}</span>
                </a>
              ))}
            </div>
          </GlassCard>

          {/* Right column — Beyond Code highlights fill the upper area, skills below */}
          <div className="md:col-span-2 flex flex-col gap-4">

            {/* ── Beyond Code — editable highlight cards (fills the upper-right) ── */}
            {highlights && highlights.items.length > 0 && (
              <GlassCard className="rounded-2xl p-5 md:p-6" depth={6}>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest font-syne flex items-center gap-1.5" style={{ color: "hsl(var(--p))" }}>
                    <Sparkles size={12} /> {highlights.title || "Beyond Code"}
                  </p>
                  {highlights.intro && <p className="text-white/45 text-sm mt-1.5">{highlights.intro}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.items.map((item, i) => {
                    const accent = CARD_PALETTE[i % CARD_PALETTE.length];
                    const Icon = highlightIcon(item.icon);
                    return (
                      <div key={item.id}
                        className="rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:scale-[1.02]"
                        style={{ background: `linear-gradient(150deg, hsl(${accent} / 0.1), hsl(210 60% 8% / 0.5))`, border: `1px solid hsl(${accent} / 0.22)` }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `hsl(${accent} / 0.14)`, border: `1px solid hsl(${accent} / 0.32)`, boxShadow: `0 0 16px hsl(${accent} / 0.18)` }}>
                          <Icon size={20} style={{ color: `hsl(${accent})` }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/90 text-sm font-semibold font-syne leading-tight">{item.title}</p>
                          {item.description && <p className="text-white/50 text-xs mt-1 leading-relaxed">{item.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* Skills */}
            {skills?.groups.map((group, gi) => {
              const accent = CARD_PALETTE[gi % CARD_PALETTE.length];
              return (
                <GlassCard key={group.name} accent={accent} className="rounded-2xl p-5" depth={6}>
                  <p className="text-xs uppercase tracking-widest mb-3 font-syne" style={{ color: `hsl(${accent})` }}>{group.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(skill => (
                      <span key={skill}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 cursor-default"
                        style={{ background: `hsl(${accent} / 0.1)`, color: "hsl(195,70%,82%)", border: `1px solid hsl(${accent} / 0.22)` }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              );
            })}

            {/* ── Career & Education (moved beside the profile card) ── */}
            {timeline.length > 0 && (
              <GlassCard className="rounded-2xl p-6" depth={5}>
                <p className="text-xs uppercase tracking-widest mb-5 font-syne" style={{ color: "hsl(var(--p))" }}>
                  Career &amp; Education
                </p>
                <div className="relative flex flex-col gap-0">
                  {/* vertical line */}
                  <div className="absolute left-[18px] top-3 bottom-3 w-px"
                    style={{ background: "linear-gradient(180deg, hsl(var(--p) / 0.5), hsl(var(--p2) / 0.2))" }} />

                  {timeline.map((item, i) => {
                    const Icon = TYPE_ICON[item.type] ?? Briefcase;
                    const accent = CARD_PALETTE[i % CARD_PALETTE.length];
                    return (
                      <div key={item.id} className="relative flex items-start gap-4 pb-5 last:pb-0 group">
                        {/* dot + icon */}
                        <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: `hsl(${accent} / 0.15)`,
                            border: `1px solid hsl(${accent} / 0.35)`,
                            boxShadow: `0 0 12px hsl(${accent} / 0.15)`,
                          }}>
                          <Icon size={15} style={{ color: `hsl(${accent})` }} />
                        </div>
                        {/* text */}
                        <div className="flex-1 pt-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-white/85 text-sm font-semibold font-syne leading-tight">{item.title}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `hsl(${accent} / 0.12)`, color: `hsl(${accent})`, border: `1px solid hsl(${accent} / 0.2)` }}>
                              {item.years}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs mt-0.5">{item.org}
                            <span className="ml-2 opacity-60">· {item.type}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Star,      color: CARD_PALETTE[0] },
              { icon: Briefcase, color: CARD_PALETTE[1] },
              { icon: Users,     color: CARD_PALETTE[2] },
              { icon: Zap,       color: CARD_PALETTE[4] },
            ].slice(0, stats.length).map(({ icon: Icon, color }, i) => (
              <GlassCard key={i} accent={color} className="rounded-2xl p-4 text-center" depth={5}>
                <Icon size={16} className="mx-auto mb-2" style={{ color: `hsl(${color})` }} />
                <p className="font-syne font-extrabold text-2xl" style={{ color: `hsl(${color})` }}>
                  <Counter value={stats[i].value} />
                </p>
                <p className="text-white/40 text-[11px] mt-0.5 leading-tight">{stats[i].label}</p>
              </GlassCard>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
