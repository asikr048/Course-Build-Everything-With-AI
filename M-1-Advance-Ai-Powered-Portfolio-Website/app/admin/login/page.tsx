"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 20% 50%, #041628, #020b14 50%, #020810)" }}>
      {/* Glow orb */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(circle at 80% 20%, hsl(185 100% 48% / 0.08), transparent 60%)" }} />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "hsl(185 100% 48% / 0.12)", border: "1px solid hsl(185 100% 48% / 0.25)",
              boxShadow: "0 0 24px hsl(185 100% 48% / 0.1)" }}>
            <Lock size={20} style={{ color: "hsl(185,100%,60%)" }} />
          </div>
          <h1 className="text-white font-bold text-xl font-syne">Admin Panel</h1>
          <p className="text-white/35 text-xs mt-1">Sign in to manage your portfolio</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6"
          style={{ background: "hsl(210 60% 8% / 0.6)", backdropFilter: "blur(24px)",
            border: "1px solid hsl(185 100% 48% / 0.1)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Username</label>
              <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="admin"
                className="px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: "hsl(210 60% 6%)", border: "1px solid hsl(185 100% 48% / 0.12)" }}
                onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/35 text-xs uppercase tracking-wider font-syne">Password</label>
              <div className="relative">
                <input required type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: "hsl(210 60% 6%)", border: "1px solid hsl(185 100% 48% / 0.12)" }}
                  onFocus={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.35)"}
                  onBlur={e => e.target.style.borderColor = "hsl(185 100% 48% / 0.12)"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className="py-2.5 px-6 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 font-syne mt-1"
              style={{ background: "linear-gradient(135deg,hsl(185 100% 38%),hsl(200 100% 35%))",
                color: "hsl(210 100% 4%)", boxShadow: "0 4px 20px hsl(185 100% 48% / 0.2)" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
