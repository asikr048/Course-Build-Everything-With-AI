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

export async function generateMetadata(): Promise<Metadata> {
  const c = await loadConfig();
  const title = c.seoTitle || c.brandName || "Portfolio";
  const description = c.seoDescription || c.heroSubtitle || "Portfolio";
  return {
    title,
    description,
    keywords: c.seoKeywords || undefined,
    icons: c.faviconURL ? { icon: c.faviconURL } : undefined,
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
            : `radial-gradient(ellipse at 20% 50%, hsl(var(--p) / 0.06) 0%, hsl(${c.themeBackground}) 45%, #020810 100%)`,
        }} />

        {/* Ambient background image */}
        {c.backgroundImage && (
          <div className="fixed inset-0 z-0" style={{
            backgroundImage: `url('${c.backgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center 60%",
            opacity: Number(c.backgroundOpacity) || 0,
            mixBlendMode: isLight ? "multiply" : "screen",
          }} />
        )}

        {/* Accent orb top-right */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] z-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 80% 20%, hsl(var(--p) / 0.10) 0%, transparent 65%)",
        }} />

        {/* Secondary orb bottom-left */}
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] z-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 20% 80%, hsl(var(--p2) / 0.10) 0%, transparent 65%)",
        }} />

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
