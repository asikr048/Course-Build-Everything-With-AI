"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, FolderOpen, Code, Lock, LogOut, Save, Plus, Trash2, ChevronRight, Bot, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Tab = "profile" | "projects" | "career" | "skills" | "password" | "ai";

interface Project {
  id: string; title: string; category: string; description: string;
  tech: string[]; year: string; link: string; imageURL: string; featured: boolean;
}
interface CareerItem { id: string; type: string; title: string; org: string; years: string; }
interface CareerSection { title: string; items: CareerItem[]; }
interface SkillGroup { name: string; items: string[]; }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Career state
  const [careerIntro, setCareerIntro] = useState("");
  const [careerSections, setCareerSections] = useState<CareerSection[]>([]);

  // Skills state
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);

  // Password state
  const [pwForm, setPwForm] = useState({ newPassword: "", confirm: "" });

  // AI settings state
  const [aiSettings, setAiSettings] = useState<Record<string, string>>({
    provider: "claude", assistantName: "Portfolio Assistant", greeting: "",
    openaiKey: "", openaiModel: "gpt-4.1-mini",
    geminiKey: "", geminiModel: "gemini-2.5-flash",
    claudeKey: "", claudeModel: "claude-haiku-4-5-20251001",
    openrouterKey: "", openrouterModel: "meta-llama/llama-3.1-8b-instruct:free",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [aiSaving, setAiSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    const r = await fetch("/api/config");
    if (r.ok) setProfile(await r.json());
  }, []);

  const loadProjects = useCallback(async () => {
    const r = await fetch("/api/projects");
    if (r.ok) { const d = await r.json(); setProjects(d.items ?? []); }
  }, []);

  const loadCareer = useCallback(async () => {
    const r = await fetch("/api/career");
    if (r.ok) { const d = await r.json(); setCareerIntro(d.intro ?? ""); setCareerSections(d.sections ?? []); }
  }, []);

  const loadSkills = useCallback(async () => {
    const r = await fetch("/api/skills");
    if (r.ok) { const d = await r.json(); setSkillGroups(d.groups ?? []); }
  }, []);

  const loadAiSettings = useCallback(async () => {
    const r = await fetch("/api/ai-settings", { method: "POST" });
    if (r.ok) setAiSettings(await r.json());
  }, []);

  useEffect(() => { loadProfile(); loadProjects(); loadCareer(); loadSkills(); loadAiSettings(); }, [loadProfile, loadProjects, loadCareer, loadSkills, loadAiSettings]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  // ── Profile save ──
  async function saveProfile() {
    setProfileLoading(true);
    const r = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    setProfileLoading(false);
    r.ok ? toast.success("Profile saved!") : toast.error("Failed to save.");
  }

  // ── Projects ──
  function newProject(): Project {
    return { id: uid(), title: "", category: "Web App", description: "", tech: [], year: new Date().getFullYear().toString(), link: "", imageURL: "", featured: false };
  }
  async function saveProject(p: Project) {
    const list = editProject && projects.find(x => x.id === editProject.id)
      ? projects.map(x => x.id === p.id ? p : x)
      : [...projects, p];
    const r = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: list }) });
    if (r.ok) { setProjects(list); setEditProject(null); toast.success("Project saved!"); }
    else toast.error("Failed.");
  }
  async function deleteProject(id: string) {
    const list = projects.filter(p => p.id !== id);
    const r = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: list }) });
    if (r.ok) { setProjects(list); toast.success("Deleted."); }
  }

  // ── Career save ──
  async function saveCareer() {
    const r = await fetch("/api/career", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intro: careerIntro, sections: careerSections }) });
    r.ok ? toast.success("Career saved!") : toast.error("Failed.");
  }

  // ── Skills save ──
  async function saveSkills() {
    const r = await fetch("/api/skills", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groups: skillGroups }) });
    r.ok ? toast.success("Skills saved!") : toast.error("Failed.");
  }

  // ── Password ──
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match.");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    const r = await fetch("/api/admin/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: pwForm.newPassword }) });
    r.ok ? (toast.success("Password updated!"), setPwForm({ newPassword: "", confirm: "" })) : toast.error("Failed.");
  }

  const navItems: { id: Tab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { id: "profile",  icon: User,       label: "Profile" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "career",   icon: Briefcase,  label: "Career" },
    { id: "skills",   icon: Code,       label: "Skills" },
    { id: "ai",       icon: Bot,        label: "AI Settings" },
    { id: "password", icon: Lock,       label: "Password" },
  ];

  // ── AI Settings save ──
  async function saveAiSettings() {
    setAiSaving(true);
    const r = await fetch("/api/ai-settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiSettings),
    });
    setAiSaving(false);
    r.ok ? toast.success("AI settings saved!") : toast.error("Failed to save.");
  }
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all";
  const inputStyle = { background: "hsl(210 60% 6%)", border: "1px solid hsl(185 100% 48% / 0.12)" };

  return (
    <div className="h-screen w-screen flex overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 20% 50%,#041628,#020b14 50%,#020810)" }}>

      {/* Sidebar */}
      <aside className="w-56 flex flex-col py-6 px-3 shrink-0"
        style={{ borderRight: "1px solid hsl(185 100% 48% / 0.08)", background: "hsl(210 60% 5% / 0.5)" }}>
        <div className="px-3 mb-6">
          <p className="text-white font-bold text-sm font-syne">Admin</p>
          <p className="text-white/25 text-xs mt-0.5">Portfolio Dashboard</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
              style={tab === id
                ? { background: "hsl(185 100% 48% / 0.12)", color: "hsl(185,100%,60%)", border: "1px solid hsl(185 100% 48% / 0.2)" }
                : { color: "rgba(255,255,255,0.35)", border: "1px solid transparent" }}>
              <Icon size={15} /> {label}
              {tab === id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <button onClick={logout}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">

        {/* ── Profile ── */}
        {tab === "profile" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["heroTitle", "Name"], ["heroSubtitle", "Subtitle"], ["location", "Location"],
                ["email", "Email"], ["phone", "Phone"], ["github", "GitHub URL"],
                ["linkedin", "LinkedIn URL"], ["twitter", "Twitter URL"], ["photoURL", "Photo URL"],
              ].map(([key, label]) => (
                <div key={key} className={`flex flex-col gap-1.5 ${key === "photoURL" ? "col-span-2" : ""}`}>
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{label}</label>
                  <input value={profile[key] ?? ""} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    className={inputCls} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-white/35 text-xs uppercase tracking-wider font-syne">About Text</label>
                <textarea value={profile["aboutText"] ?? ""} onChange={e => setProfile(p => ({ ...p, aboutText: e.target.value }))}
                  rows={3} className={inputCls + " resize-none"} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                  onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={profileLoading}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] font-syne"
              style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
              <Save size={14} /> {profileLoading ? "Saving…" : "Save profile"}
            </button>
          </div>
        )}

        {/* ── Projects ── */}
        {tab === "projects" && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg font-syne">Projects</h2>
              <button onClick={() => setEditProject(newProject())}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-syne transition-all hover:scale-105"
                style={{ background: "hsl(185 100% 48% / 0.12)", color: "hsl(185,100%,60%)", border: "1px solid hsl(185 100% 48% / 0.2)" }}>
                <Plus size={13} /> New project
              </button>
            </div>

            {editProject ? (
              <div className="rounded-2xl p-6" style={{ background: "hsl(210 60% 8% / 0.6)", border: "1px solid hsl(185 100% 48% / 0.1)" }}>
                <h3 className="text-white font-semibold font-syne mb-4">{editProject.id && projects.find(p => p.id === editProject.id) ? "Edit" : "New"} Project</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["title", "category", "year", "link", "imageURL"] as const).map(f => (
                    <div key={f} className={`flex flex-col gap-1.5 ${f === "imageURL" || f === "link" ? "col-span-2" : ""}`}>
                      <label className="text-white/35 text-xs uppercase tracking-wider font-syne">{f}</label>
                      <input value={editProject[f] ?? ""} onChange={e => setEditProject(p => p ? { ...p, [f]: e.target.value } : p)}
                        className={inputCls} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                    </div>
                  ))}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Description</label>
                    <textarea value={editProject.description} onChange={e => setEditProject(p => p ? { ...p, description: e.target.value } : p)}
                      rows={3} className={inputCls + " resize-none"} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                      onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Tech (comma-separated)</label>
                    <input value={editProject.tech.join(", ")} onChange={e => setEditProject(p => p ? { ...p, tech: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } : p)}
                      className={inputCls} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                      onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={editProject.featured}
                      onChange={e => setEditProject(p => p ? { ...p, featured: e.target.checked } : p)}
                      className="w-4 h-4 rounded" />
                    <label htmlFor="featured" className="text-white/60 text-sm">Featured project</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => saveProject(editProject)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-syne"
                    style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
                    <Save size={13} /> Save
                  </button>
                  <button onClick={() => setEditProject(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
                    {p.imageURL && <img src={p.imageURL} alt={p.title} className="w-14 h-10 object-cover rounded-lg shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium font-syne truncate">{p.title}</p>
                      <p className="text-white/35 text-xs">{p.category} · {p.year}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditProject(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(185,100%,55%)", border: "1px solid hsl(185 100% 48% / 0.15)" }}>Edit</button>
                      <button onClick={() => deleteProject(p.id)}
                        className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-white/25 text-sm text-center py-8">No projects yet. Click &quot;New project&quot; to add one.</p>}
              </div>
            )}
          </div>
        )}

        {/* ── Career ── */}
        {tab === "career" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Career</h2>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Intro text</label>
              <textarea value={careerIntro} onChange={e => setCareerIntro(e.target.value)} rows={2}
                className={inputCls + " resize-none"} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
            </div>
            {careerSections.map((section, si) => (
              <div key={section.title} className="mb-5 rounded-xl p-4"
                style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider font-syne mb-3">{section.title}</p>
                {section.items.map((item, ii) => (
                  <div key={item.id} className="grid grid-cols-4 gap-2 mb-2">
                    {(["type", "title", "org", "years"] as const).map(f => (
                      <input key={f} placeholder={f} value={item[f]} className={inputCls} style={inputStyle}
                        onChange={e => {
                          const s = [...careerSections]; s[si] = { ...s[si], items: s[si].items.map((it, j) => j === ii ? { ...it, [f]: e.target.value } : it) };
                          setCareerSections(s);
                        }}
                        onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                    ))}
                  </div>
                ))}
                <button onClick={() => { const s = [...careerSections]; s[si].items.push({ id: uid(), type: "", title: "", org: "", years: "" }); setCareerSections(s); }}
                  className="text-xs flex items-center gap-1 mt-1" style={{ color: "hsl(185,100%,50%)" }}>
                  <Plus size={11} /> Add item
                </button>
              </div>
            ))}
            <button onClick={saveCareer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
              <Save size={14} /> Save career
            </button>
          </div>
        )}

        {/* ── Skills ── */}
        {tab === "skills" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Skills</h2>
            {skillGroups.map((group, gi) => (
              <div key={group.name} className="mb-4 rounded-xl p-4"
                style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
                <input value={group.name} placeholder="Group name" className={inputCls + " mb-3 font-semibold"} style={inputStyle}
                  onChange={e => { const g = [...skillGroups]; g[gi] = { ...g[gi], name: e.target.value }; setSkillGroups(g); }}
                  onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                  onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs">Skills (comma-separated)</label>
                  <input value={group.items.join(", ")} className={inputCls} style={inputStyle}
                    onChange={e => { const g = [...skillGroups]; g[gi] = { ...g[gi], items: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; setSkillGroups(g); }}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
              </div>
            ))}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setSkillGroups([...skillGroups, { name: "New Group", items: [] }])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background: "hsl(185 100% 48% / 0.08)", color: "hsl(185,100%,55%)", border: "1px solid hsl(185 100% 48% / 0.15)" }}>
                <Plus size={12} /> Add group
              </button>
              <button onClick={saveSkills}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
                <Save size={14} /> Save skills
              </button>
            </div>
          </div>
        )}

        {/* ── AI Settings ── */}
        {tab === "ai" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-lg font-syne mb-1">AI Settings</h2>
            <p className="text-white/35 text-xs mb-6">Configure the AI assistant that powers the &quot;Ask AI&quot; chat on your portfolio.</p>

            {/* Provider selector */}
            <div className="mb-6">
              <p className="text-white/35 text-xs uppercase tracking-wider font-syne mb-3">AI Provider</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: "openai",      label: "ChatGPT",   emoji: "🤖", color: "hsl(142,70%,45%)" },
                  { id: "gemini",      label: "Gemini",    emoji: "✦",  color: "hsl(220,90%,60%)" },
                  { id: "claude",      label: "Claude",    emoji: "🔶", color: "hsl(30,90%,55%)" },
                  { id: "openrouter",  label: "OpenRouter",emoji: "🌐", color: "hsl(280,70%,60%)" },
                ].map(p => (
                  <button key={p.id} onClick={() => setAiSettings(s => ({ ...s, provider: p.id }))}
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold font-syne transition-all hover:scale-105"
                    style={aiSettings.provider === p.id
                      ? { background: `${p.color}22`, border: `1px solid ${p.color}55`, color: p.color }
                      : { background: "hsl(210 60% 7%)", border: "1px solid hsl(185 100% 48% / 0.08)", color: "rgba(255,255,255,0.3)" }
                    }>
                    <span className="text-lg">{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider-specific settings */}
            <div className="rounded-xl p-5 mb-5"
              style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>

              {aiSettings.provider === "openai" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne">ChatGPT / OpenAI</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">API Key</label>
                    <div className="relative">
                      <input type={showKeys.openai ? "text" : "password"} value={aiSettings.openaiKey ?? ""}
                        onChange={e => setAiSettings(s => ({ ...s, openaiKey: e.target.value }))}
                        placeholder="sk-..."
                        className={inputCls + " pr-10"} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "hsl(142 70% 45% / 0.5)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                      <button type="button" onClick={() => setShowKeys(k => ({ ...k, openai: !k.openai }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showKeys.openai ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                      className="text-[11px]" style={{ color: "hsl(185,100%,45%)" }}>
                      ↗ Get your API key from platform.openai.com
                    </a>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Model</label>
                    <select value={aiSettings.openaiModel ?? "gpt-4.1-mini"}
                      onChange={e => setAiSettings(s => ({ ...s, openaiModel: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="gpt-4.1-mini">gpt-4.1-mini — fast, beats gpt-4o ⭐</option><option value="gpt-4.1-nano">gpt-4.1-nano — fastest &amp; cheapest</option><option value="gpt-4.1">gpt-4.1 — best quality</option><option value="gpt-4o">gpt-4o — multimodal flagship</option><option value="gpt-4o-mini">gpt-4o-mini — legacy budget</option><option value="o4-mini">o4-mini — fast reasoning</option>
                      <option value="gpt-4o">gpt-4o (best quality)</option>
                      <option value="gpt-4-turbo">gpt-4-turbo</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo (budget)</option>
                    </select>
                  </div>
                </div>
              )}

              {aiSettings.provider === "gemini" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne">Google Gemini</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">API Key</label>
                    <div className="relative">
                      <input type={showKeys.gemini ? "text" : "password"} value={aiSettings.geminiKey ?? ""}
                        onChange={e => setAiSettings(s => ({ ...s, geminiKey: e.target.value }))}
                        placeholder="AIza..."
                        className={inputCls + " pr-10"} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "hsl(220 90% 60% / 0.5)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                      <button type="button" onClick={() => setShowKeys(k => ({ ...k, gemini: !k.gemini }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showKeys.gemini ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                      className="text-[11px]" style={{ color: "hsl(185,100%,45%)" }}>
                      ↗ Get your API key from Google AI Studio
                    </a>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Model</label>
                    <select value={aiSettings.geminiModel ?? "gemini-2.5-flash"}
                      onChange={e => setAiSettings(s => ({ ...s, geminiModel: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="gemini-2.5-flash">gemini-2.5-flash — fast + smart ⭐</option><option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite — cheapest</option><option value="gemini-2.5-pro">gemini-2.5-pro — most capable</option><option value="gemini-2.0-flash">gemini-2.0-flash — balanced</option><option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite — budget</option><option value="gemini-3.1-flash-lite-preview">gemini-3.1-flash-lite-preview — new gen</option>
                      
                      
                    </select>
                  </div>
                </div>
              )}

              {aiSettings.provider === "claude" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne">Anthropic Claude</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">API Key</label>
                    <div className="relative">
                      <input type={showKeys.claude ? "text" : "password"} value={aiSettings.claudeKey ?? ""}
                        onChange={e => setAiSettings(s => ({ ...s, claudeKey: e.target.value }))}
                        placeholder="sk-ant-..."
                        className={inputCls + " pr-10"} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "hsl(30 90% 55% / 0.5)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                      <button type="button" onClick={() => setShowKeys(k => ({ ...k, claude: !k.claude }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showKeys.claude ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer"
                      className="text-[11px]" style={{ color: "hsl(185,100%,45%)" }}>
                      ↗ Get your API key from Anthropic Console
                    </a>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Model</label>
                    <select value={aiSettings.claudeModel ?? "claude-haiku-4-5-20251001"}
                      onChange={e => setAiSettings(s => ({ ...s, claudeModel: e.target.value }))}
                      className={inputCls} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="claude-haiku-4-5-20251001">claude-haiku-4-5 — fastest ⭐</option><option value="claude-sonnet-4-6">claude-sonnet-4-6 — smart everyday</option><option value="claude-opus-4-6">claude-opus-4-6 — most powerful</option><option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet — excellent quality</option>
                      
                      
                    </select>
                  </div>
                </div>
              )}

              {aiSettings.provider === "openrouter" && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne">OpenRouter (100+ models)</p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">API Key</label>
                    <div className="relative">
                      <input type={showKeys.openrouter ? "text" : "password"} value={aiSettings.openrouterKey ?? ""}
                        onChange={e => setAiSettings(s => ({ ...s, openrouterKey: e.target.value }))}
                        placeholder="sk-or-..."
                        className={inputCls + " pr-10"} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "hsl(280 70% 60% / 0.5)"}
                        onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                      <button type="button" onClick={() => setShowKeys(k => ({ ...k, openrouter: !k.openrouter }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showKeys.openrouter ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                      className="text-[11px]" style={{ color: "hsl(185,100%,45%)" }}>
                      ↗ Get your API key from openrouter.ai
                    </a>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Model string</label>
                    <input value={aiSettings.openrouterModel ?? ""}
                      onChange={e => setAiSettings(s => ({ ...s, openrouterModel: e.target.value }))}
                      placeholder="e.g. meta-llama/llama-3.1-8b-instruct:free"
                      className={inputCls} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "hsl(280 70% 60% / 0.5)"}
                      onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {["meta-llama/llama-3.3-70b-instruct:free","google/gemini-2.0-flash-lite:free","mistralai/mistral-small-3.1-24b-instruct:free","openai/gpt-4.1-mini"].map(m => (
                        <button key={m} onClick={() => setAiSettings(s => ({ ...s, openrouterModel: m }))}
                          className="text-[10px] px-2 py-0.5 rounded-lg transition-all hover:scale-105"
                          style={{ background: "hsl(280 70% 60% / 0.1)", color: "hsl(280,70%,70%)", border: "1px solid hsl(280 70% 60% / 0.2)" }}>
                          {m.split("/")[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assistant personality */}
            <div className="rounded-xl p-5 mb-5"
              style={{ background: "hsl(210 60% 8% / 0.5)", border: "1px solid hsl(185 100% 48% / 0.08)" }}>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider font-syne mb-4">Assistant Personality</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Assistant Name</label>
                  <input value={aiSettings.assistantName ?? ""} onChange={e => setAiSettings(s => ({ ...s, assistantName: e.target.value }))}
                    placeholder="e.g. Portfolio Assistant" className={inputCls} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Greeting Message</label>
                  <textarea value={aiSettings.greeting ?? ""} onChange={e => setAiSettings(s => ({ ...s, greeting: e.target.value }))}
                    rows={2} placeholder="Hi! I'm here to answer any questions about this portfolio..."
                    className={inputCls + " resize-none"} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
              </div>
            </div>

            <button onClick={saveAiSettings} disabled={aiSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
              <Save size={14} /> {aiSaving ? "Saving…" : "Save AI settings"}
            </button>
          </div>
        )}

        {/* ── Password ── */}
        {tab === "password" && (
          <div className="max-w-sm">
            <h2 className="text-white font-bold text-lg font-syne mb-6">Change Password</h2>
            <form onSubmit={changePassword} className="flex flex-col gap-4 p-5 rounded-2xl"
              style={{ background: "hsl(210 60% 8% / 0.6)", border: "1px solid hsl(185 100% 48% / 0.1)" }}>
              {["newPassword", "confirm"].map(f => (
                <div key={f} className="flex flex-col gap-1.5">
                  <label className="text-white/35 text-xs uppercase tracking-wider font-syne">
                    {f === "newPassword" ? "New password" : "Confirm password"}
                  </label>
                  <input type="password" required value={pwForm[f as keyof typeof pwForm]}
                    onChange={e => setPwForm(p => ({ ...p, [f]: e.target.value }))}
                    className={inputCls} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                    onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                </div>
              ))}
              <button type="submit"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))", color: "hsl(210 100% 4%)" }}>
                <Lock size={13} /> Update password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
