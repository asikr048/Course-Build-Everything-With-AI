"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, Briefcase, FolderOpen, Code, Lock, LogOut, Save, Plus, Trash2,
  ChevronRight, Bot, Eye, EyeOff, Palette, Search, Wrench, Quote, Sun, Moon, LayoutGrid, GripVertical,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";
import { DEFAULT_CONFIG, type SiteConfig } from "@/lib/siteConfig";

type Tab = "profile" | "home" | "design" | "seo" | "projects" | "career" | "skills" | "services" | "testimonials" | "ai" | "password";

interface Project {
  id: string; title: string; category: string; description: string;
  tech: string[]; year: string; link: string; imageURL: string; featured: boolean;
  focus?: string; // objectPosition for the image, e.g. "50% 30%"
}
interface CareerItem { id: string; type: string; title: string; org: string; years: string; }
interface CareerSection { title: string; items: CareerItem[]; }
interface SkillGroup { name: string; items: string[]; }
interface Service { id: string; title: string; description: string; icon: string; }
interface Testimonial { id: string; name: string; role: string; quote: string; avatar: string; }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

// ── Shared styles (module-level so input components keep focus across renders) ──
const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all";
const inputStyle: React.CSSProperties = { background: "hsl(210 60% 6%)", border: "1px solid hsl(var(--p) / 0.12)" };
const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg,hsl(var(--p)),hsl(var(--p2)))", color: "hsl(210 100% 4%)" };
const cardStyle: React.CSSProperties = { background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(var(--p) / 0.08)" };
const focusOn = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "hsl(var(--p) / 0.35)");
const focusOff = (e: React.FocusEvent<HTMLElement>) => (e.currentTarget.style.borderColor = "hsl(var(--p) / 0.12)");

const COLOR_PRESETS = [
  { name: "Teal", v: "185 100% 48%" }, { name: "Sky", v: "199 100% 50%" },
  { name: "Blue", v: "220 90% 58%" }, { name: "Indigo", v: "245 80% 62%" },
  { name: "Violet", v: "270 80% 62%" }, { name: "Pink", v: "330 85% 60%" },
  { name: "Rose", v: "350 90% 62%" }, { name: "Orange", v: "24 95% 55%" },
  { name: "Amber", v: "40 96% 54%" }, { name: "Emerald", v: "160 84% 42%" },
  { name: "Green", v: "142 70% 45%" }, { name: "Crimson", v: "0 84% 60%" },
];
const BG_PRESETS = [
  { name: "Deep Navy", v: "210 100% 4%" }, { name: "Black", v: "0 0% 3%" },
  { name: "Charcoal", v: "220 18% 8%" }, { name: "Midnight", v: "240 40% 6%" },
  { name: "Plum", v: "280 40% 6%" }, { name: "Forest", v: "160 45% 5%" },
  { name: "Light", v: "210 30% 96%" },
];

// ── Reusable field components (stable identities) ──
function TextField({ label, value, onChange, full, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; full?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{label}</label>
      <input type={type} value={value ?? ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle}
        onFocus={focusOn} onBlur={focusOff} />
    </div>
  );
}
function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="col-span-2 flex flex-col gap-1.5">
      <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{label}</label>
      <textarea value={value ?? ""} rows={rows} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={inputCls + " resize-none"} style={inputStyle}
        onFocus={focusOn} onBlur={focusOff} />
    </div>
  );
}
function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 p-3.5 rounded-xl text-left transition-all w-full" style={cardStyle}>
      <div>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        {desc && <p className="text-white/30 text-xs mt-0.5">{desc}</p>}
      </div>
      <div className="w-10 h-6 rounded-full p-0.5 shrink-0 transition-all"
        style={{ background: checked ? "hsl(var(--p) / 0.9)" : "hsl(210 30% 20%)" }}>
        <div className="w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      </div>
    </button>
  );
}
function SaveBtn({ onClick, saving, label }: { onClick: () => void; saving?: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02] disabled:opacity-60"
      style={btnPrimary}>
      <Save size={14} /> {saving ? "Saving…" : label}
    </button>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const [careerIntro, setCareerIntro] = useState("");
  const [careerSections, setCareerSections] = useState<CareerSection[]>([]);

  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);

  const [servicesIntro, setServicesIntro] = useState("");
  const [services, setServices] = useState<Service[]>([]);

  const [testiIntro, setTestiIntro] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [pwForm, setPwForm] = useState({ newPassword: "", confirm: "" });

  const [aiSettings, setAiSettings] = useState<Record<string, string>>({
    provider: "claude", assistantName: "Portfolio Assistant", greeting: "",
    openaiKey: "", openaiModel: "gpt-4.1-mini",
    geminiKey: "", geminiModel: "gemini-2.5-flash",
    claudeKey: "", claudeModel: "claude-haiku-4-5-20251001",
    openrouterKey: "", openrouterModel: "meta-llama/llama-3.1-8b-instruct:free",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [aiSaving, setAiSaving] = useState(false);

  const setCfg = useCallback(<K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v })), []);

  const loadAll = useCallback(async () => {
    const safe = async (url: string, init?: RequestInit) => { try { const r = await fetch(url, init); return r.ok ? await r.json() : null; } catch { return null; } };
    const [cfg, pr, ca, sk, sv, ts, ai] = await Promise.all([
      safe("/api/config"), safe("/api/projects"), safe("/api/career"),
      safe("/api/skills"), safe("/api/services"), safe("/api/testimonials"),
      safe("/api/ai-settings", { method: "POST" }),
    ]);
    if (cfg) setConfig({ ...DEFAULT_CONFIG, ...cfg });
    if (pr) setProjects(pr.items ?? []);
    if (ca) { setCareerIntro(ca.intro ?? ""); setCareerSections(ca.sections ?? []); }
    if (sk) setSkillGroups(sk.groups ?? []);
    if (sv) { setServicesIntro(sv.intro ?? ""); setServices(sv.items ?? []); }
    if (ts) { setTestiIntro(ts.intro ?? ""); setTestimonials(ts.items ?? []); }
    if (ai) setAiSettings((s) => ({ ...s, ...ai }));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  // ── Savers ──
  async function saveConfig(msg = "Saved!") {
    setSavingConfig(true);
    const r = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    setSavingConfig(false);
    r.ok ? toast.success(msg) : toast.error("Failed to save.");
  }

  function newProject(): Project {
    return { id: uid(), title: "", category: "Web App", description: "", tech: [], year: new Date().getFullYear().toString(), link: "", imageURL: "", featured: false, focus: "50% 50%" };
  }
  async function saveProjectsList(list: Project[], silent = false): Promise<boolean> {
    const r = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: "", items: list }) });
    if (r.ok) { if (!silent) toast.success("Order saved"); return true; }
    toast.error("Failed to save."); return false;
  }
  /** Persist the current (drag-reordered) order without mutating state. */
  function persistOrder() {
    setProjects((curr) => { void saveProjectsList(curr); return curr; });
  }
  async function saveProject(p: Project) {
    const list = editProject && projects.find((x) => x.id === editProject.id) ? projects.map((x) => (x.id === p.id ? p : x)) : [...projects, p];
    if (await saveProjectsList(list, true)) { setProjects(list); setEditProject(null); toast.success("Project saved!"); }
  }
  async function deleteProject(id: string) {
    const list = projects.filter((p) => p.id !== id);
    const r = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: "", items: list }) });
    if (r.ok) { setProjects(list); toast.success("Deleted."); }
  }

  async function saveCareer() {
    const r = await fetch("/api/career", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: careerIntro, sections: careerSections }) });
    r.ok ? toast.success("Career saved!") : toast.error("Failed.");
  }
  async function saveSkills() {
    const r = await fetch("/api/skills", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groups: skillGroups }) });
    r.ok ? toast.success("Skills saved!") : toast.error("Failed.");
  }
  async function saveServices() {
    const r = await fetch("/api/services", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: servicesIntro, items: services }) });
    r.ok ? toast.success("Services saved!") : toast.error("Failed.");
  }
  async function saveTestimonials() {
    const r = await fetch("/api/testimonials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: testiIntro, items: testimonials }) });
    r.ok ? toast.success("Testimonials saved!") : toast.error("Failed.");
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match.");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    const r = await fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: pwForm.newPassword }) });
    r.ok ? (toast.success("Password updated!"), setPwForm({ newPassword: "", confirm: "" })) : toast.error("Failed.");
  }
  async function saveAiSettings() {
    setAiSaving(true);
    const r = await fetch("/api/ai-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(aiSettings) });
    setAiSaving(false);
    r.ok ? toast.success("AI settings saved!") : toast.error("Failed to save.");
  }

  const navItems: { id: Tab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "home", icon: LayoutGrid, label: "Home Hero" },
    { id: "design", icon: Palette, label: "Design" },
    { id: "seo", icon: Search, label: "SEO" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "career", icon: Briefcase, label: "Career" },
    { id: "skills", icon: Code, label: "Skills" },
    { id: "services", icon: Wrench, label: "Services" },
    { id: "testimonials", icon: Quote, label: "Testimonials" },
    { id: "ai", icon: Bot, label: "AI Settings" },
    { id: "password", icon: Lock, label: "Password" },
  ];

  const Swatches = ({ value, onPick, presets }: { value: string; onPick: (v: string) => void; presets: { name: string; v: string }[] }) => (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <button key={p.v} type="button" onClick={() => onPick(p.v)} title={p.name}
          className="w-8 h-8 rounded-lg transition-all hover:scale-110"
          style={{ background: `hsl(${p.v})`, border: value === p.v ? "2px solid white" : "2px solid transparent", boxShadow: value === p.v ? `0 0 12px hsl(${p.v})` : "none" }} />
      ))}
    </div>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 20% 50%,#041628,#020b14 50%,#020810)" }}>

      {/* Sidebar */}
      <aside className="w-56 flex flex-col py-6 px-3 shrink-0 overflow-y-auto"
        style={{ borderRight: "1px solid hsl(var(--p) / 0.08)", background: "hsl(210 60% 5% / 0.5)" }}>
        <div className="px-3 mb-6">
          <p className="text-white font-bold text-sm font-syne">Admin</p>
          <p className="text-white/25 text-xs mt-0.5">{config.brandName || "Portfolio"} Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
              style={tab === id
                ? { background: "hsl(var(--p) / 0.12)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.2)" }
                : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}>
              <Icon size={15} /> {label}
              {tab === id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </nav>
        <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 transition-all mb-1">
          <Eye size={14} /> View site
        </a>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10" style={{ color: "rgba(255,255,255,0.25)" }}>
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">Profile</h2>
            <p className="text-white/35 text-xs mb-6">Your identity, contact details, and links — shown across the site.</p>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Photo</p>
              <div className="w-full max-w-md">
                <ImageUpload value={config.photoURL} onChange={(v) => setCfg("photoURL", v)} aspect="square"
                  focus={config.photoFocus} onFocusChange={(v) => setCfg("photoFocus", v)} />
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Identity</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Brand / Logo name" value={config.brandName} onChange={(v) => setCfg("brandName", v)} />
                <TextField label="Hero tagline (eyebrow)" value={config.heroTagline} onChange={(v) => setCfg("heroTagline", v)} />
                <TextField label="Name" value={config.heroTitle} onChange={(v) => setCfg("heroTitle", v)} />
                <TextField label="Subtitle / Role" value={config.heroSubtitle} onChange={(v) => setCfg("heroSubtitle", v)} />
                <TextArea label="About text" value={config.aboutText} onChange={(v) => setCfg("aboutText", v)} />
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Email" value={config.email} onChange={(v) => setCfg("email", v)} />
                <TextField label="Phone" value={config.phone} onChange={(v) => setCfg("phone", v)} />
                <TextField label="Location" value={config.location} onChange={(v) => setCfg("location", v)} />
                <TextField label="Age" value={config.age} onChange={(v) => setCfg("age", v)} />
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Call-to-action buttons</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Primary button text" value={config.ctaPrimaryText} onChange={(v) => setCfg("ctaPrimaryText", v)} />
                <TextField label="Primary button link" value={config.ctaPrimaryLink} onChange={(v) => setCfg("ctaPrimaryLink", v)} />
                <TextField label="Secondary button text" value={config.ctaSecondaryText} onChange={(v) => setCfg("ctaSecondaryText", v)} />
                <TextField label="Secondary button link" value={config.ctaSecondaryLink} onChange={(v) => setCfg("ctaSecondaryLink", v)} />
                <TextField label="Resume / CV URL" value={config.resumeURL} onChange={(v) => setCfg("resumeURL", v)} full />
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Social links</p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="GitHub" value={config.github} onChange={(v) => setCfg("github", v)} />
                <TextField label="LinkedIn" value={config.linkedin} onChange={(v) => setCfg("linkedin", v)} />
                <TextField label="Twitter / X" value={config.twitter} onChange={(v) => setCfg("twitter", v)} />
                <TextField label="Instagram" value={config.instagram} onChange={(v) => setCfg("instagram", v)} />
                <TextField label="YouTube" value={config.youtube} onChange={(v) => setCfg("youtube", v)} />
                <TextField label="Dribbble" value={config.dribbble} onChange={(v) => setCfg("dribbble", v)} />
                <TextField label="Website" value={config.website} onChange={(v) => setCfg("website", v)} full />
                <TextField label="Footer text" value={config.footerText} onChange={(v) => setCfg("footerText", v)} full placeholder="© 2026 Your Name. All rights reserved." />
              </div>
            </div>

            <SaveBtn onClick={() => saveConfig("Profile saved!")} saving={savingConfig} label="Save profile" />
          </div>
        )}

        {/* ── Home Hero ── */}
        {tab === "home" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">Home Hero</h2>
            <p className="text-white/35 text-xs mb-6">The big landing section: typing roles, stat counters, and the tech marquee.</p>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Typing roles</p>
              <TextArea label="Roles (one per line, or comma-separated)" value={config.roles}
                onChange={(v) => setCfg("roles", v)} rows={4} placeholder={"Full-Stack Developer\nUI/UX Designer\nFreelancer"} />
              <p className="text-white/25 text-[11px] mt-2">These cycle with a typing animation under your name.</p>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-3">Stat counters</p>
              <div className="mb-4"><Toggle label="Show stat counters on the home page" checked={config.showStats} onChange={(v) => setCfg("showStats", v)} /></div>
              {(config.stats ?? []).map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={s.value} placeholder="30+" className={inputCls + " max-w-[120px]"} style={inputStyle}
                    onChange={(e) => setCfg("stats", config.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                  <input value={s.label} placeholder="Projects Completed" className={inputCls} style={inputStyle}
                    onChange={(e) => setCfg("stats", config.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                  <button onClick={() => setCfg("stats", config.stats.filter((_, j) => j !== i))} className="p-2.5 rounded-lg text-red-400/50 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setCfg("stats", [...(config.stats ?? []), { value: "", label: "" }])}
                className="flex items-center gap-1.5 px-3 py-2 mt-1 rounded-xl text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}>
                <Plus size={12} /> Add stat
              </button>
              <p className="text-white/25 text-[11px] mt-2">Numbers count up automatically (e.g. &quot;30+&quot;, &quot;100%&quot;, &quot;5&quot;).</p>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-3">Tech marquee</p>
              <div className="mb-4"><Toggle label="Show scrolling tech marquee" checked={config.showMarquee} onChange={(v) => setCfg("showMarquee", v)} /></div>
              <TextArea label="Tech stack (comma-separated)" value={config.techStack}
                onChange={(v) => setCfg("techStack", v)} rows={2} placeholder="React, Next.js, TypeScript, Node.js" />
            </div>

            <SaveBtn onClick={() => saveConfig("Home hero saved! Refresh the site to see it.")} saving={savingConfig} label="Save home hero" />
          </div>
        )}

        {/* ── Design ── */}
        {tab === "design" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">Design & Theme</h2>
            <p className="text-white/35 text-xs mb-6">Rebrand the whole site — colors apply across every page after saving + refresh.</p>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Mode</p>
              <div className="flex gap-2">
                {([["dark", Moon, "Dark"], ["light", Sun, "Light"]] as const).map(([m, Icon, lbl]) => (
                  <button key={m} onClick={() => setCfg("themeMode", m)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={config.themeMode === m ? { background: "hsl(var(--p) / 0.15)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.3)" } : { ...inputStyle, color: "rgba(255,255,255,0.4)" }}>
                    <Icon size={15} /> {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Primary accent color</p>
              <Swatches value={config.themePrimary} presets={COLOR_PRESETS} onPick={(v) => setCfg("themePrimary", v)} />
              <input value={config.themePrimary} onChange={(e) => setCfg("themePrimary", e.target.value)}
                className={inputCls + " mt-3"} style={inputStyle} placeholder="H S% L%  e.g. 185 100% 48%" onFocus={focusOn} onBlur={focusOff} />
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Secondary color (gradients & orbs)</p>
              <Swatches value={config.themeSecondary} presets={COLOR_PRESETS} onPick={(v) => setCfg("themeSecondary", v)} />
              <input value={config.themeSecondary} onChange={(e) => setCfg("themeSecondary", e.target.value)}
                className={inputCls + " mt-3"} style={inputStyle} placeholder="H S% L%" onFocus={focusOn} onBlur={focusOff} />
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Background base</p>
              <Swatches value={config.themeBackground} presets={BG_PRESETS} onPick={(v) => setCfg("themeBackground", v)} />
              <input value={config.themeBackground} onChange={(e) => setCfg("themeBackground", e.target.value)}
                className={inputCls + " mt-3"} style={inputStyle} placeholder="H S% L%" onFocus={focusOn} onBlur={focusOff} />
              <div className="mt-4">
                <ImageUpload label="Ambient background image (optional)" value={config.backgroundImage} onChange={(v) => setCfg("backgroundImage", v)} />
              </div>
              <div className="mt-3">
                <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Background opacity: {config.backgroundOpacity}</label>
                <input type="range" min={0} max={1} step={0.01} value={Number(config.backgroundOpacity)}
                  onChange={(e) => setCfg("backgroundOpacity", e.target.value)} className="w-full mt-2 accent-[hsl(var(--p))]" />
              </div>
            </div>

            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Visible sections</p>
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Projects" checked={config.showProjects} onChange={(v) => setCfg("showProjects", v)} />
                <Toggle label="Career" checked={config.showCareer} onChange={(v) => setCfg("showCareer", v)} />
                <Toggle label="Skills" checked={config.showSkills} onChange={(v) => setCfg("showSkills", v)} />
                <Toggle label="Services" checked={config.showServices} onChange={(v) => setCfg("showServices", v)} />
                <Toggle label="Testimonials" checked={config.showTestimonials} onChange={(v) => setCfg("showTestimonials", v)} />
                <Toggle label="Contact" checked={config.showContact} onChange={(v) => setCfg("showContact", v)} />
              </div>
            </div>

            <SaveBtn onClick={() => saveConfig("Theme saved! Refresh the site to see it.")} saving={savingConfig} label="Save design" />
          </div>
        )}

        {/* ── SEO ── */}
        {tab === "seo" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">SEO & Sharing</h2>
            <p className="text-white/35 text-xs mb-6">Controls the browser title, search snippets, favicon, and social preview cards.</p>
            <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Page title" value={config.seoTitle} onChange={(v) => setCfg("seoTitle", v)} full />
                <TextArea label="Meta description" value={config.seoDescription} onChange={(v) => setCfg("seoDescription", v)} rows={2} />
                <TextField label="Keywords (comma-separated)" value={config.seoKeywords} onChange={(v) => setCfg("seoKeywords", v)} full />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <ImageUpload label="Social share image (OG)" value={config.ogImage} onChange={(v) => setCfg("ogImage", v)} />
                <ImageUpload label="Favicon" value={config.faviconURL} onChange={(v) => setCfg("faviconURL", v)} aspect="square" />
              </div>
            </div>
            <SaveBtn onClick={() => saveConfig("SEO saved!")} saving={savingConfig} label="Save SEO" />
          </div>
        )}

        {/* ── Projects ── */}
        {tab === "projects" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg font-syne">Projects</h2>
              <button onClick={() => setEditProject(newProject())}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-syne transition-all hover:scale-105"
                style={{ background: "hsl(var(--p) / 0.12)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.2)" }}>
                <Plus size={13} /> New project
              </button>
            </div>
            {editProject ? (
              <div className="rounded-2xl p-6" style={{ background: "hsl(210 60% 8% / 0.6)", border: "1px solid hsl(var(--p) / 0.1)" }}>
                <h3 className="text-white font-semibold font-syne mb-4">{projects.find((p) => p.id === editProject.id) ? "Edit" : "New"} Project</h3>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Title" value={editProject.title} onChange={(v) => setEditProject((p) => p && { ...p, title: v })} />
                  <TextField label="Category" value={editProject.category} onChange={(v) => setEditProject((p) => p && { ...p, category: v })} />
                  <TextField label="Year" value={editProject.year} onChange={(v) => setEditProject((p) => p && { ...p, year: v })} />
                  <TextField label="Link" value={editProject.link} onChange={(v) => setEditProject((p) => p && { ...p, link: v })} />
                  <TextArea label="Description" value={editProject.description} onChange={(v) => setEditProject((p) => p && { ...p, description: v })} />
                  <TextField label="Tech (comma-separated)" value={editProject.tech.join(", ")} onChange={(v) => setEditProject((p) => p && { ...p, tech: v.split(",").map((s) => s.trim()).filter(Boolean) })} full />
                  <div className="col-span-2">
                    <ImageUpload label="Project image" value={editProject.imageURL} onChange={(v) => setEditProject((p) => p && { ...p, imageURL: v })}
                      focus={editProject.focus} onFocusChange={(v) => setEditProject((p) => p && { ...p, focus: v })} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={editProject.featured} onChange={(e) => setEditProject((p) => p && { ...p, featured: e.target.checked })} className="w-4 h-4 rounded" />
                    <label htmlFor="featured" className="text-white/60 text-sm">Featured project</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => saveProject(editProject)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-syne" style={btnPrimary}><Save size={13} /> Save</button>
                  <button onClick={() => setEditProject(null)} className="px-4 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {projects.length > 1 && (
                  <p className="text-white/30 text-xs mb-3 flex items-center gap-1.5">
                    <GripVertical size={12} /> Drag the handle to reorder — this is the order shown on your site.
                  </p>
                )}
                <Reorder.Group axis="y" values={projects} onReorder={setProjects} className="flex flex-col gap-3">
                  {projects.map((p) => (
                    <Reorder.Item key={p.id} value={p} onDragEnd={persistOrder}
                      className="flex items-center gap-3 p-4 rounded-xl" style={cardStyle}>
                      <span className="cursor-grab active:cursor-grabbing text-white/25 hover:text-white/60 transition-colors touch-none">
                        <GripVertical size={16} />
                      </span>
                      {p.imageURL && <img src={p.imageURL} alt={p.title} className="w-14 h-10 object-cover rounded-lg shrink-0" style={{ objectPosition: p.focus || "50% 50%" }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium font-syne truncate">{p.title || "Untitled"}</p>
                        <p className="text-white/35 text-xs">{p.category} · {p.year}{p.featured ? " · ★ Featured" : ""}</p>
                      </div>
                      <button onClick={() => setEditProject(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}>Edit</button>
                      <button onClick={() => deleteProject(p.id)} className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {projects.length === 0 && <p className="text-white/25 text-sm text-center py-8">No projects yet.</p>}
              </>
            )}
          </div>
        )}

        {/* ── Career ── */}
        {tab === "career" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Career</h2>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Intro text</label>
              <textarea value={careerIntro} onChange={(e) => setCareerIntro(e.target.value)} rows={2} className={inputCls + " resize-none"} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            {careerSections.map((section, si) => (
              <div key={si} className="mb-5 rounded-xl p-4" style={cardStyle}>
                <input value={section.title} placeholder="Section title (e.g. Experience)" className={inputCls + " mb-3 font-semibold"} style={inputStyle}
                  onChange={(e) => { const s = [...careerSections]; s[si] = { ...s[si], title: e.target.value }; setCareerSections(s); }} onFocus={focusOn} onBlur={focusOff} />
                {section.items.map((item, ii) => (
                  <div key={item.id} className="flex gap-2 mb-2 items-start">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {(["type", "title", "org", "years"] as const).map((f) => (
                        <input key={f} placeholder={f} value={item[f]} className={inputCls} style={inputStyle}
                          onChange={(e) => { const s = [...careerSections]; s[si] = { ...s[si], items: s[si].items.map((it, j) => (j === ii ? { ...it, [f]: e.target.value } : it)) }; setCareerSections(s); }} onFocus={focusOn} onBlur={focusOff} />
                      ))}
                    </div>
                    <button onClick={() => { const s = [...careerSections]; s[si] = { ...s[si], items: s[si].items.filter((_, j) => j !== ii) }; setCareerSections(s); }} className="p-2.5 rounded-lg text-red-400/50 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                ))}
                <div className="flex justify-between mt-2">
                  <button onClick={() => { const s = [...careerSections]; s[si].items.push({ id: uid(), type: "", title: "", org: "", years: "" }); setCareerSections(s); }} className="text-xs flex items-center gap-1" style={{ color: "hsl(var(--p))" }}><Plus size={11} /> Add item</button>
                  <button onClick={() => setCareerSections(careerSections.filter((_, j) => j !== si))} className="text-xs text-red-400/50 hover:text-red-400">Remove section</button>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setCareerSections([...careerSections, { title: "New Section", items: [] }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}><Plus size={12} /> Add section</button>
              <SaveBtn onClick={saveCareer} label="Save career" />
            </div>
          </div>
        )}

        {/* ── Skills ── */}
        {tab === "skills" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Skills</h2>
            {skillGroups.map((group, gi) => (
              <div key={gi} className="mb-4 rounded-xl p-4" style={cardStyle}>
                <div className="flex gap-2 mb-3">
                  <input value={group.name} placeholder="Group name" className={inputCls + " font-semibold"} style={inputStyle}
                    onChange={(e) => { const g = [...skillGroups]; g[gi] = { ...g[gi], name: e.target.value }; setSkillGroups(g); }} onFocus={focusOn} onBlur={focusOff} />
                  <button onClick={() => setSkillGroups(skillGroups.filter((_, j) => j !== gi))} className="p-2.5 rounded-lg text-red-400/50 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <input value={group.items.join(", ")} placeholder="Skills (comma-separated)" className={inputCls} style={inputStyle}
                  onChange={(e) => { const g = [...skillGroups]; g[gi] = { ...g[gi], items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }; setSkillGroups(g); }} onFocus={focusOn} onBlur={focusOff} />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setSkillGroups([...skillGroups, { name: "New Group", items: [] }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}><Plus size={12} /> Add group</button>
              <SaveBtn onClick={saveSkills} label="Save skills" />
            </div>
          </div>
        )}

        {/* ── Services ── */}
        {tab === "services" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Services</h2>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Intro text</label>
              <textarea value={servicesIntro} onChange={(e) => setServicesIntro(e.target.value)} rows={2} className={inputCls + " resize-none"} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            {services.map((s, i) => (
              <div key={s.id} className="mb-3 rounded-xl p-4" style={cardStyle}>
                <div className="flex gap-2 mb-2">
                  <input value={s.title} placeholder="Service title" className={inputCls + " font-semibold"} style={inputStyle}
                    onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                  <input value={s.icon} placeholder="Icon (e.g. Code)" className={inputCls + " max-w-[140px]"} style={inputStyle}
                    onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                  <button onClick={() => setServices(services.filter((_, j) => j !== i))} className="p-2.5 rounded-lg text-red-400/50 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <textarea value={s.description} placeholder="Description" rows={2} className={inputCls + " resize-none"} style={inputStyle}
                  onChange={(e) => setServices(services.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setServices([...services, { id: uid(), title: "", description: "", icon: "Sparkles" }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}><Plus size={12} /> Add service</button>
              <SaveBtn onClick={saveServices} label="Save services" />
            </div>
          </div>
        )}

        {/* ── Testimonials ── */}
        {tab === "testimonials" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Testimonials</h2>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Intro text</label>
              <textarea value={testiIntro} onChange={(e) => setTestiIntro(e.target.value)} rows={2} className={inputCls + " resize-none"} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
            </div>
            {testimonials.map((t, i) => (
              <div key={t.id} className="mb-3 rounded-xl p-4 flex gap-4" style={cardStyle}>
                <div className="w-20 shrink-0">
                  <ImageUpload value={t.avatar} onChange={(v) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, avatar: v } : x)))} aspect="square" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input value={t.name} placeholder="Name" className={inputCls} style={inputStyle} onChange={(e) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                    <input value={t.role} placeholder="Role / Company" className={inputCls} style={inputStyle} onChange={(e) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                    <button onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))} className="p-2.5 rounded-lg text-red-400/50 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                  <textarea value={t.quote} placeholder="Quote" rows={2} className={inputCls + " resize-none"} style={inputStyle} onChange={(e) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))} onFocus={focusOn} onBlur={focusOff} />
                </div>
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setTestimonials([...testimonials, { id: uid(), name: "", role: "", quote: "", avatar: "" }])} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "hsl(var(--p) / 0.08)", color: "hsl(var(--p))", border: "1px solid hsl(var(--p) / 0.15)" }}><Plus size={12} /> Add testimonial</button>
              <SaveBtn onClick={saveTestimonials} label="Save testimonials" />
            </div>
          </div>
        )}

        {/* ── AI Settings ── */}
        {tab === "ai" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">AI Settings</h2>
            <p className="text-white/35 text-xs mb-6">Configure the AI assistant that powers the &quot;Ask AI&quot; chat on your portfolio.</p>

            <div className="mb-6">
              <p className="text-white/35 text-xs uppercase tracking-wider font-syne mb-3">AI Provider</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: "openai", label: "ChatGPT", emoji: "🤖", color: "hsl(142,70%,45%)" },
                  { id: "gemini", label: "Gemini", emoji: "✦", color: "hsl(220,90%,60%)" },
                  { id: "claude", label: "Claude", emoji: "🔶", color: "hsl(30,90%,55%)" },
                  { id: "openrouter", label: "OpenRouter", emoji: "🌐", color: "hsl(280,70%,60%)" },
                ].map((p) => (
                  <button key={p.id} onClick={() => setAiSettings((s) => ({ ...s, provider: p.id }))}
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold font-syne transition-all hover:scale-105"
                    style={aiSettings.provider === p.id ? { background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color } : { background: "hsl(210 60% 7%)", border: "1px solid hsl(var(--p) / 0.08)", color: "rgba(255,255,255,0.3)" }}>
                    <span className="text-lg">{p.emoji}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5 mb-5" style={cardStyle}>
              {aiSettings.provider === "openai" && (
                <ProviderKey label="ChatGPT / OpenAI" keyField="openaiKey" placeholder="sk-..." link="https://platform.openai.com/api-keys" linkText="platform.openai.com" aiSettings={aiSettings} setAiSettings={setAiSettings} showKeys={showKeys} setShowKeys={setShowKeys}>
                  <select value={aiSettings.openaiModel} onChange={(e) => setAiSettings((s) => ({ ...s, openaiModel: e.target.value }))} className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="gpt-4.1-mini">gpt-4.1-mini — fast ⭐</option><option value="gpt-4.1-nano">gpt-4.1-nano — cheapest</option><option value="gpt-4.1">gpt-4.1 — best</option><option value="gpt-4o">gpt-4o</option><option value="gpt-4o-mini">gpt-4o-mini</option><option value="o4-mini">o4-mini</option>
                  </select>
                </ProviderKey>
              )}
              {aiSettings.provider === "gemini" && (
                <ProviderKey label="Google Gemini" keyField="geminiKey" placeholder="AIza..." link="https://aistudio.google.com/app/apikey" linkText="Google AI Studio" aiSettings={aiSettings} setAiSettings={setAiSettings} showKeys={showKeys} setShowKeys={setShowKeys}>
                  <select value={aiSettings.geminiModel} onChange={(e) => setAiSettings((s) => ({ ...s, geminiModel: e.target.value }))} className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="gemini-2.5-flash">gemini-2.5-flash ⭐</option><option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option><option value="gemini-2.5-pro">gemini-2.5-pro</option><option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  </select>
                </ProviderKey>
              )}
              {aiSettings.provider === "claude" && (
                <ProviderKey label="Anthropic Claude" keyField="claudeKey" placeholder="sk-ant-..." link="https://console.anthropic.com/account/keys" linkText="Anthropic Console" aiSettings={aiSettings} setAiSettings={setAiSettings} showKeys={showKeys} setShowKeys={setShowKeys}>
                  <select value={aiSettings.claudeModel} onChange={(e) => setAiSettings((s) => ({ ...s, claudeModel: e.target.value }))} className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="claude-haiku-4-5-20251001">claude-haiku-4-5 ⭐</option><option value="claude-sonnet-4-6">claude-sonnet-4-6</option><option value="claude-opus-4-6">claude-opus-4-6</option><option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet</option>
                  </select>
                </ProviderKey>
              )}
              {aiSettings.provider === "openrouter" && (
                <ProviderKey label="OpenRouter (100+ models)" keyField="openrouterKey" placeholder="sk-or-..." link="https://openrouter.ai/keys" linkText="openrouter.ai" aiSettings={aiSettings} setAiSettings={setAiSettings} showKeys={showKeys} setShowKeys={setShowKeys}>
                  <input value={aiSettings.openrouterModel} onChange={(e) => setAiSettings((s) => ({ ...s, openrouterModel: e.target.value }))} placeholder="meta-llama/llama-3.1-8b-instruct:free" className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                </ProviderKey>
              )}
            </div>

            <div className="rounded-xl p-5 mb-5" style={cardStyle}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Assistant Personality</p>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Assistant Name" value={aiSettings.assistantName} onChange={(v) => setAiSettings((s) => ({ ...s, assistantName: v }))} full />
                <TextArea label="Greeting Message" value={aiSettings.greeting} onChange={(v) => setAiSettings((s) => ({ ...s, greeting: v }))} rows={2} />
              </div>
            </div>
            <SaveBtn onClick={saveAiSettings} saving={aiSaving} label="Save AI settings" />
          </div>
        )}

        {/* ── Password ── */}
        {tab === "password" && (
          <div className="max-w-sm">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Change Password</h2>
            <form onSubmit={changePassword} className="flex flex-col gap-4 p-5 rounded-2xl" style={{ background: "hsl(210 60% 8% / 0.6)", border: "1px solid hsl(var(--p) / 0.1)" }}>
              {["newPassword", "confirm"].map((f) => (
                <div key={f} className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{f === "newPassword" ? "New password" : "Confirm password"}</label>
                  <input type="password" required value={pwForm[f as keyof typeof pwForm]} onChange={(e) => setPwForm((p) => ({ ...p, [f]: e.target.value }))} className={inputCls} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
                </div>
              ))}
              <button type="submit" className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02]" style={btnPrimary}><Lock size={13} /> Update password</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// ── AI provider key block (module-level to preserve focus) ──
function ProviderKey({ label, keyField, placeholder, link, linkText, aiSettings, setAiSettings, showKeys, setShowKeys, children }: {
  label: string; keyField: string; placeholder: string; link: string; linkText: string;
  aiSettings: Record<string, string>; setAiSettings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showKeys: Record<string, boolean>; setShowKeys: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  children: React.ReactNode;
}) {
  const k = keyField.replace("Key", "");
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne">{label}</p>
      <div className="flex flex-col gap-1.5">
        <label className="text-white/35 text-xs uppercase tracking-wider font-syne">API Key</label>
        <div className="relative">
          <input type={showKeys[k] ? "text" : "password"} value={aiSettings[keyField] ?? ""} placeholder={placeholder}
            onChange={(e) => setAiSettings((s) => ({ ...s, [keyField]: e.target.value }))} className={inputCls + " pr-10"} style={inputStyle} onFocus={focusOn} onBlur={focusOff} />
          <button type="button" onClick={() => setShowKeys((kk) => ({ ...kk, [k]: !kk[k] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            {showKeys[k] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-[11px]" style={{ color: "hsl(var(--p))" }}>↗ Get your API key from {linkText}</a>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Model</label>
        {children}
      </div>
    </div>
  );
}
