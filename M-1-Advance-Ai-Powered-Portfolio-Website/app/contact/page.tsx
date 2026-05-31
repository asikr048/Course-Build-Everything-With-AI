"use client";
import { useState } from "react";
import { Send, Mail, Github, Linkedin, Twitter, MapPin } from "lucide-react";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";
import GlassCard from "@/components/GlassCard";

export default function ContactPage() {
  const cfg = useSiteConfig();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const socials = [
    { icon: Github, label: "GitHub", href: cfg.github },
    { icon: Linkedin, label: "LinkedIn", href: cfg.linkedin },
    { icon: Twitter, label: "Twitter", href: cfg.twitter },
  ].filter(s => s.href);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Contact from ${form.name}`;
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <main className="h-screen w-screen flex items-center justify-center md:pl-20 px-4 pb-20 md:pb-4 pt-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-4 fade-up">

        {/* Left info panel */}
        <GlassCard className="md:col-span-2 rounded-2xl p-6 flex flex-col justify-between gap-6" depth={6}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 font-syne" style={{ color: "hsl(185,100%,55%)" }}>Get in touch</p>
            <h1 className="text-2xl font-bold font-syne text-white leading-tight">Let&apos;s build<br/>something together</h1>
            <p className="text-white/40 text-xs mt-3 leading-relaxed">
              Whether you have a project in mind, a question, or just want to say hi — my inbox is always open.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {cfg.email && (
              <a href={`mailto:${cfg.email}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: "hsl(185 100% 48% / 0.06)", border: "1px solid hsl(185 100% 48% / 0.12)" }}>
                <Mail size={15} style={{ color: "hsl(185,100%,55%)" }} />
                <span className="text-white/60 text-xs">{cfg.email}</span>
              </a>
            )}
            {cfg.location && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "hsl(185 100% 48% / 0.04)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
                <MapPin size={15} style={{ color: "hsl(185,100%,55%)" }} />
                <span className="text-white/40 text-xs">{cfg.location}</span>
              </div>
            )}
          </div>

          {socials.length > 0 && (
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(185,100%,55%)", border: "1px solid hsl(185 100% 48% / 0.15)" }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Contact form */}
        <GlassCard className="md:col-span-3 rounded-2xl p-6" depth={10}>
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "hsl(185 100% 48% / 0.1)" }}>✉️</div>
              <h2 className="text-white font-semibold font-syne">Opening your mail client!</h2>
              <p className="text-white/40 text-sm">Your message is ready to send.</p>
              <button onClick={() => setSent(false)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: "hsl(185 100% 48% / 0.1)", color: "hsl(185,100%,60%)", border: "1px solid hsl(185 100% 48% / 0.2)" }}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Name</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: "hsl(210 60% 6% / 0.8)", border: "1px solid hsl(185 100% 48% / 0.12)",
                      caretColor: "hsl(185,100%,55%)" }}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: "hsl(210 60% 6% / 0.8)", border: "1px solid hsl(185 100% 48% / 0.12)",
                      caretColor: "hsl(185,100%,55%)" }}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Message</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell me about your project, idea, or just say hi..."
                  rows={6}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-sm text-white outline-none resize-none transition-all"
                  style={{ background: "hsl(210 60% 6% / 0.8)", border: "1px solid hsl(185 100% 48% / 0.12)",
                    caretColor: "hsl(185,100%,55%)" }}
                  onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                  onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
              </div>
              <button type="submit"
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-syne"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 38%), hsl(200 100% 35%))",
                  color: "hsl(210 100% 4%)", boxShadow: "0 4px 24px hsl(185 100% 48% / 0.25)" }}>
                <Send size={14} /> Send message
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
