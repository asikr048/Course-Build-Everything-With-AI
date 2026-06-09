# 🌊 Advanced AI Portfolio — Next.js 15

A fully **admin-editable**, rebrandable portfolio with glassmorphism UI, a built-in
multi-provider AI assistant, image uploads, and one-click **Vercel + Neon** deploy.
Anyone can fork it and make it their own entirely from the admin panel — no code edits.

## ✨ Features

- **Edit everything from the admin panel** — identity, bio, photo, CTAs, resume, socials, footer
- **Live theming** — pick primary/secondary colors, background, light/dark mode; applies site-wide
- **SEO controls** — page title, meta description, keywords, favicon, social share (OG) image
- **Section toggles** — show/hide Projects, Career, Skills, Services, Testimonials, Contact
- **Content sections** — Projects, Career timeline, Skills, **Services**, **Testimonials**
- **Image uploads** — drag & drop to Vercel Blob, or paste a URL (works with no setup)
- **AI assistant** — "Ask AI" chat powered by Claude / OpenAI / Gemini / OpenRouter (your key)
- **Persistent storage** — Neon Postgres in production, JSON files for local dev (auto-seeded)
- **Auth** — admin routes protected by a session cookie

## 🚀 Getting Started (local)

```bash
npm install          # if SSL errors on a corporate/AV network: npm install --strict-ssl=false
npm run dev          # → http://localhost:3000
```

Local dev needs **no** environment variables — data reads/writes the JSON files in `/data/`,
and images use the "paste URL" field.

### Admin Panel

```
URL:      http://localhost:3000/admin/login
Username: admin
Password: admin123
```

> ⚠️ Change the password immediately after first login (Admin → Password).

## 🌐 Deploy to Vercel (free) — persistent data + uploads

1. **Push to GitHub** and import the repo at [vercel.com/new](https://vercel.com/new).
2. **Add a database (Neon):**
   - Create a free Postgres DB at [neon.tech](https://neon.tech) (or Vercel → Storage → Postgres).
   - Copy the **pooled** connection string.
   - In Vercel → Project → Settings → Environment Variables, add:
     `DATABASE_URL = postgresql://…-pooler…/neondb?sslmode=require`
   - Tables and seed data are created automatically on first request.
3. **Enable image uploads (Vercel Blob):**
   - Vercel → Storage → **Blob** → create a store.
   - Add env var `BLOB_READ_WRITE_TOKEN = vercel_blob_rw_…`
   - (Skip this and just paste image URLs in the admin if you prefer.)
4. **Redeploy.** Done.

See [.env.example](.env.example) for the full list. Both variables are optional —
without `DATABASE_URL`, data won't persist across serverless invocations on Vercel,
so adding Neon is strongly recommended for production.

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Homepage (bento grid)
│   ├── projects|career|personal|contact/
│   ├── services/             # Services page (admin-managed)
│   ├── testimonials/         # Testimonials page (admin-managed)
│   ├── admin/{login,dashboard}/
│   └── api/                  # config, projects, career, skills, services,
│                             # testimonials, ai-settings, chat, upload, admin/*
├── components/
│   ├── GlassCard.tsx  Navbar.tsx  BottomBar.tsx  TealBadge.tsx
│   └── admin/ImageUpload.tsx # drag/drop upload + URL fallback
├── data/                     # local-dev JSON store + production seed
│   ├── config|projects|career|skills|services|testimonials|ai-settings|credentials .json
├── lib/
│   ├── store.ts              # Neon Postgres KV  ↔  JSON-file fallback
│   ├── siteConfig.ts         # SiteConfig schema + defaults
│   └── hooks/useSiteConfig.ts
└── middleware.ts             # protects /admin/dashboard
```

## 🎨 Theming

All of this is in **Admin → Design** (no code needed): primary & secondary colors,
background base, ambient image + opacity, light/dark mode, and section visibility.
Under the hood the accent color is the CSS variable `--p`, injected from config in
`app/layout.tsx`, so changing it recolors the entire site.

## 🤖 AI Assistant

In **Admin → AI Settings**, pick a provider (Claude / OpenAI / Gemini / OpenRouter),
paste your API key, choose a model, and set the assistant's name + greeting.
The chat answers questions using only your portfolio content.

## 🏗️ Build

```bash
npm run build && npm start
```

## 📦 Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Neon Postgres ·
Vercel Blob · Lucide · Sonner · Framer Motion

---

Made with ☕ — fork it, theme it, make it yours.
