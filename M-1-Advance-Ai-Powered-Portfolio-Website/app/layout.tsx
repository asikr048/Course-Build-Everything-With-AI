import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import AiChat from "@/components/AiChat";
import { getDoc } from "@/lib/store";
import { withDefaults, type SiteConfig } from "@/lib/siteConfig";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

async function loadConfig(): Promise<SiteConfig> {
  try {
    return withDefaults(await getDoc<Partial<SiteConfig>>("config"));
  } catch {
    return withDefaults(null);
  }
}

/** Build a branded favicon: the uploaded one, or an auto-generated premium
 *  GOLD monogram — a dark tile with a gilded ring and gold-gradient initial. */
function buildFavicon(c: SiteConfig): string {
  if (c.faviconURL) return c.faviconURL;
  const initial = (c.brandName || c.heroTitle || "A").trim().charAt(0).toUpperCase() || "A";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#FFF1C2"/>
<stop offset="0.42" stop-color="#E8B23D"/>
<stop offset="1" stop-color="#9C6B16"/>
</linearGradient>
<linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#241a0a"/>
<stop offset="1" stop-color="#0a0a0c"/>
</linearGradient>
</defs>
<rect width="64" height="64" rx="16" fill="url(#tile)"/>
<rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
<rect width="64" height="26" rx="16" fill="#ffffff" fill-opacity="0.06"/>
<text x="32" y="35" dominant-baseline="central" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="40" fill="url(#gold)">${initial}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await loadConfig();
  const title = c.seoTitle || c.brandName || "Portfolio";
  const description = c.seoDescription || c.heroSubtitle || "Portfolio";
  const favicon = buildFavicon(c);
  return {
    title,
    description,
    keywords: c.seoKeywords || undefined,
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    openGraph: {
      title,
      description,
      images: c.ogImage ? [{ url: c.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: c.ogImage ? [c.ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await loadConfig();
  const isLight = c.themeMode === "light";

  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${syne.variable}`}>
      <head>
        {/* Runtime theme — primary accent is fully controlled from the admin panel */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--p:${c.themePrimary};--p2:${c.themeSecondary};--bg:${c.themeBackground};}`,
          }}
        />
      </head>
      <body
        className="antialiased overflow-hidden h-screen w-screen font-sans text-white"
        style={{ backgroundColor: `hsl(${c.themeBackground})` }}
      >

        {/* Base gradient */}
        <div className="fixed inset-0 z-0" style={{
          background: isLight
            ? `radial-gradient(ellipse at 20% 50%, hsl(${c.themeBackground}) 0%, #ffffff 80%)`
            : `radial-gradient(ellipse at 25% 15%, hsl(var(--p) / 0.08) 0%, transparent 45%), radial-gradient(ellipse at 80% 90%, hsl(var(--p2) / 0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 50%, hsl(${c.themeBackground}) 0%, #020810 100%)`,
        }} />

        {/* Ambient background image (optional — set from admin) */}
        {c.backgroundImage && (
          <div className="fixed inset-0 z-0" style={{
            backgroundImage: `url('${c.backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 60%",
            opacity: Number(c.backgroundOpacity) || 0,
            mixBlendMode: isLight ? "multiply" : "screen",
          }} />
        )}

        {/* ── Premium aurora — slow-drifting color fields ── */}
        {!isLight && (
          <>
            {/* primary, top-right */}
            <div className="fixed -top-[15%] -right-[10%] w-[70vw] h-[70vw] max-w-[820px] max-h-[820px] z-0 pointer-events-none aurora-a" style={{
              background: "radial-gradient(circle at 50% 50%, hsl(var(--p) / 0.16) 0%, transparent 60%)",
            }} />
            {/* secondary, bottom-left */}
            <div className="fixed -bottom-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[760px] max-h-[760px] z-0 pointer-events-none aurora-b" style={{
              background: "radial-gradient(circle at 50% 50%, hsl(var(--p2) / 0.15) 0%, transparent 60%)",
            }} />
            {/* violet wash, center */}
            <div className="fixed top-[25%] left-[30%] w-[55vw] h-[55vw] max-w-[640px] max-h-[640px] z-0 pointer-events-none aurora-c" style={{
              background: "radial-gradient(circle at 50% 50%, hsl(270 80% 62% / 0.10) 0%, transparent 60%)",
            }} />
          </>
        )}

        {/* Vignette */}
        {!isLight && (
          <div className="fixed inset-0 z-[1] pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,16,0.7) 100%)",
          }} />
        )}

        {/* Noise grain */}
        <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }} />

        <Navbar />

        {/* Page content */}
        <div className="relative z-10 h-screen w-screen overflow-hidden">
          {children}
        </div>

        <BottomBar />
        <AiChat />
        <Toaster position="bottom-right" richColors theme={isLight ? "light" : "dark"} />
      </body>
    </html>
  );
}
