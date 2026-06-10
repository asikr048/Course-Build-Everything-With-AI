"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Download, MapPin, ChevronDown, Sparkles,
  Github, Linkedin, Twitter, Instagram, Youtube, Dribbble, Globe, Mail,
} from "lucide-react";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";
import type { Stat } from "@/lib/siteConfig";

// ── Typing animation through the configured roles ──
function Typing({ source }: { source: string }) {
  const words = useMemo(
    () => source.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    [source],
  );
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const word = words[wi % words.length];
    let delay = del ? 45 : 90;
    if (!del && text === word) delay = 1500;
    if (del && text === "") delay = 350;
    const t = setTimeout(() => {
      if (!del && text === word) { setDel(true); return; }
      if (del && text === "") { setDel(false); setWi((v) => (v + 1) % words.length); return; }
      setText(word.slice(0, del ? text.length - 1 : text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, del, wi, words]);

  return (
    <span>
      {text}
      <span className="caret" style={{ color: "hsl(var(--p))" }}>|</span>
    </span>
  );
}

// ── Count-up number animation ──
function Counter({ value }: { value: string }) {
  const parts = useMemo(() => value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/), [value]);
  const [shown, setShown] = useState(parts ? "0" : value);

  useEffect(() => {
    if (!parts) { setShown(value); return; }
    const target = parseFloat(parts[2]);
    const decimals = parts[2].includes(".") ? 1 : 0;
    const dur = 1400;
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
  }, [value, parts]);

  if (!parts) return <>{value}</>;
  return <>{parts[1]}{shown}{parts[3]}</>;
}

export default function HomePage() {
  const cfg = useSiteConfig();

  const socials = [
    { href: cfg.github, icon: Github, label: "GitHub" },
    { href: cfg.linkedin, icon: Linkedin, label: "LinkedIn" },
    { href: cfg.twitter, icon: Twitter, label: "Twitter" },
    { href: cfg.instagram, icon: Instagram, label: "Instagram" },
    { href: cfg.youtube, icon: Youtube, label: "YouTube" },
    { href: cfg.dribbble, icon: Dribbble, label: "Dribbble" },
    { href: cfg.website, icon: Globe, label: "Website" },
  ].filter((s) => s.href);

  const stats: Stat[] = (cfg.stats ?? []).filter((s) => s.value || s.label);
  const tech = (cfg.techStack ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <main className="h-screen w-screen overflow-y-auto md:pl-16">
      {/* ─────────── HERO ─────────── */}
      <section className="min-h-screen w-full flex items-center px-5 sm:px-8 lg:px-16 pt-16 pb-28 md:py-0">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">

          {/* Left — text */}
          <div className="flex flex-col gap-5 order-2 md:order-1 text-center md:text-left items-center md:items-start">
            {cfg.heroTagline && (
              <div className="rise inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium w-fit"
                style={{ background: "hsl(var(--p) / 0.08)", border: "1px solid hsl(var(--p) / 0.2)", color: "hsl(var(--p))", animationDelay: "0.05s" }}>
                <span className="w-1.5 h-1.5 rounded-full pulse-ring" style={{ background: "hsl(var(--p))" }} />
                {cfg.heroTagline}
              </div>
            )}

            <h1 className="rise font-syne font-extrabold leading-[1.05] text-4xl sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.12s" }}>
              <span className="text-white/55 text-2xl sm:text-3xl lg:text-4xl font-bold block mb-1">Hi, I&apos;m</span>
              <span className="gradient-text">{cfg.heroTitle}</span>
            </h1>

            <div className="rise font-syne font-bold text-xl sm:text-2xl lg:text-3xl text-white/90 min-h-[1.4em]" style={{ animationDelay: "0.2s" }}>
              <Typing source={cfg.roles || cfg.heroSubtitle} />
            </div>

            {cfg.aboutText && (
              <p className="rise text-white/45 text-sm sm:text-base leading-relaxed max-w-lg" style={{ animationDelay: "0.28s" }}>
                {cfg.aboutText}
              </p>
            )}

            {cfg.location && (
              <div className="rise flex items-center gap-1.5 text-white/40 text-xs" style={{ animationDelay: "0.32s" }}>
                <MapPin size={13} style={{ color: "hsl(var(--p))" }} /> {cfg.location}
              </div>
            )}

            {/* CTAs */}
            <div className="rise flex flex-wrap gap-3 justify-center md:justify-start" style={{ animationDelay: "0.38s" }}>
              {cfg.ctaPrimaryText && (
                <Link href={cfg.ctaPrimaryLink || "/projects"}
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.03]"
                  style={{ background: "linear-gradient(135deg,hsl(var(--p)),hsl(var(--p2)))", color: "hsl(210 100% 4%)", boxShadow: "0 8px 28px hsl(var(--p) / 0.3)" }}>
                  {cfg.ctaPrimaryText}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              {cfg.resumeURL && (
                <a href={cfg.resumeURL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.03]"
                  style={{ background: "hsl(var(--p) / 0.1)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.25)" }}>
                  <Download size={15} /> Resume
                </a>
              )}
              {cfg.ctaSecondaryText && (
                <Link href={cfg.ctaSecondaryLink || "/contact"}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.03] text-white/70 hover:text-white"
                  style={{ border: "1px solid hsl(0 0% 100% / 0.12)" }}>
                  <Mail size={15} /> {cfg.ctaSecondaryText}
                </Link>
              )}
            </div>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="rise flex items-center gap-2.5 mt-1" style={{ animationDelay: "0.44s" }}>
                {socials.map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-0.5"
                    style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right — photo */}
          <div className="rise order-1 md:order-2 flex justify-center md:justify-end" style={{ animationDelay: "0.18s" }}>
            <div className="relative">
              {/* glow */}
              <div className="absolute -inset-6 z-0 rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, hsl(var(--p) / 0.5), transparent 70%)" }} />
              {/* gradient blob ring */}
              <div className="blob relative z-10 p-[3px] floaty"
                style={{ background: "linear-gradient(135deg,hsl(var(--p)),hsl(var(--p2)))", width: "min(72vw, 320px)", height: "min(72vw, 320px)" }}>
                <div className="blob w-full h-full overflow-hidden" style={{ background: "hsl(210 60% 8%)" }}>
                  {cfg.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cfg.photoURL} alt={cfg.heroTitle} className="w-full h-full object-cover" style={{ objectPosition: cfg.photoFocus }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">🧑‍💻</div>
                  )}
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-2 -left-2 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl floaty"
                style={{ background: "hsl(210 60% 8% / 0.85)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--p) / 0.2)", animationDelay: "1s" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
                <span className="text-white/70 text-xs font-medium">Open to work</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      {cfg.showStats && stats.length > 0 && (
        <section className="px-5 sm:px-8 lg:px-16 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 sm:p-6 text-center transition-all hover:scale-[1.02]"
                style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(var(--p) / 0.1)", animationDelay: `${i * 0.08}s` }}>
                <p className="font-syne font-extrabold text-3xl sm:text-4xl text-glow" style={{ color: "hsl(var(--p))" }}>
                  <Counter value={s.value} />
                </p>
                <p className="text-white/45 text-xs sm:text-sm mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────── TECH MARQUEE ─────────── */}
      {cfg.showMarquee && tech.length > 0 && (
        <section className="pb-16">
          <p className="text-center text-white/25 text-xs uppercase tracking-[0.25em] font-syne mb-5">Tech I work with</p>
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track flex w-max gap-3">
              {[...tech, ...tech].map((t, i) => (
                <span key={i} className="shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap"
                  style={{ background: "hsl(var(--p) / 0.06)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.14)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── EXPLORE ─────────── */}
      <section className="px-5 sm:px-8 lg:px-16 pb-24 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-white/30 text-xs mb-5">
            <ChevronDown size={14} /> Explore more
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { show: cfg.showProjects, href: "/projects", label: "Projects", desc: "Things I've built", icon: Sparkles },
              { show: cfg.showServices, href: "/services", label: "Services", desc: "How I can help", icon: Sparkles },
              { show: cfg.showCareer, href: "/career", label: "Career", desc: "My journey", icon: Sparkles },
              { show: cfg.showContact, href: "/contact", label: "Contact", desc: "Let's talk", icon: Mail },
            ].filter((c) => c.show).map((c) => (
              <Link key={c.href} href={c.href}
                className="group rounded-2xl p-5 flex flex-col gap-2 transition-all hover:scale-[1.02]"
                style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(var(--p) / 0.1)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold font-syne text-sm">{c.label}</span>
                  <ArrowRight size={15} style={{ color: "hsl(var(--p))" }} className="transition-transform group-hover:translate-x-1" />
                </div>
                <span className="text-white/35 text-xs">{c.desc}</span>
              </Link>
            ))}
          </div>
          {cfg.footerText && <p className="text-center text-white/25 text-xs mt-10">{cfg.footerText}</p>}
        </div>
      </section>
    </main>
  );
}
