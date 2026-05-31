# 🌊 Ocean Portfolio — Next.js 15

A stunning dark portfolio website with deep ocean/midnight aesthetics, electric teal accents, glassmorphism cards, and a built-in admin panel.

## ✨ Features

- **Bento-grid homepage** — 3D tilt cards, profile card, project previews, stats
- **Projects page** — filterable project grid with images and tech badges
- **Career page** — timeline layout with sections for education, experience, certifications
- **About/Personal page** — skills grid + contact links
- **Contact page** — contact form that opens your mail client
- **Admin dashboard** — manage all content without touching code
- **JSON-based data** — no database needed, everything stored in `/data/`
- **Middleware** — admin routes protected by session cookies

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** — [Download here](https://nodejs.org)
- **npm** (comes with Node.js)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
# → http://localhost:3000
```

### Admin Panel

```
URL:      http://localhost:3000/admin/login
Username: admin
Password: admin123
```

> ⚠️ Change the password immediately after first login via the admin dashboard.

## 📁 Project Structure

```
portfolio-new/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage (bento grid)
│   ├── projects/           # Projects page
│   ├── career/             # Career timeline
│   ├── personal/           # About + skills
│   ├── contact/            # Contact form
│   ├── admin/              # Admin panel
│   │   ├── login/
│   │   └── dashboard/
│   └── api/                # API routes
│       ├── config/         # Profile data
│       ├── projects/       # Projects CRUD
│       ├── career/         # Career CRUD
│       ├── skills/         # Skills CRUD
│       └── admin/          # Auth routes
├── components/             # Reusable components
│   ├── GlassCard.tsx       # 3D tilt glassmorphism card
│   ├── Navbar.tsx          # Left sidebar navigation
│   ├── BottomBar.tsx       # Mobile bottom nav
│   └── TealBadge.tsx       # Category badge
├── data/                   # JSON "database"
│   ├── config.json         # Your profile info
│   ├── projects.json       # Your projects
│   ├── career.json         # Education & work history
│   ├── skills.json         # Skills groups
│   └── credentials.json    # Admin login (change this!)
├── lib/
│   ├── localDb.ts          # JSON file read/write helpers
│   └── hooks/
│       └── useSiteConfig.ts
└── middleware.ts           # Protects /admin/dashboard
```

## 🎨 Customising

### Quick way (Admin Panel)
Log in at `/admin/login` and edit everything visually.

### Manual way (edit JSON files directly)

**Your profile** → `data/config.json`
```json
{
  "heroTitle": "Your Name",
  "heroSubtitle": "Your Role",
  "aboutText": "Your bio...",
  "location": "Your City",
  "email": "you@email.com",
  "github": "https://github.com/yourusername"
}
```

**Background image** → `app/layout.tsx` (line ~30)
Change the Unsplash URL to any image you like.

**Accent colour** → `app/globals.css`
Search for `hsl(185` and replace with your colour. 185 = teal.
Example: `hsl(280` = purple, `hsl(30` = orange.

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 🌐 Deploying to Vercel

```bash
npm install -g vercel
vercel
```

> Note: Since data is stored as JSON files, Vercel's serverless environment will reset data on redeploy. For persistent data on Vercel, consider using [Vercel KV](https://vercel.com/storage/kv) or any database.

## 📦 Tech Stack

- **Next.js 15** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **Plus Jakarta Sans + Syne** — Fonts (Google Fonts)
- **Lucide React** — Icons
- **Sonner** — Toast notifications
- **Framer Motion** (optional) — Animations

---

Made with ☕ and too many late nights.
