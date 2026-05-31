import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";
import AiChat from "@/components/AiChat";

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

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Full-Stack Developer & Designer Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${syne.variable}`}>
      <body className="antialiased overflow-hidden h-screen w-screen font-sans bg-[#020b14] text-white">

        {/* Deep ocean base */}
        <div className="fixed inset-0 z-0" style={{
          background: "radial-gradient(ellipse at 20% 50%, #041628 0%, #020b14 40%, #020810 100%)",
        }} />

        {/* Ocean background image */}
        <div className="fixed inset-0 z-0" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
          opacity: 0.18,
          mixBlendMode: "screen",
        }} />

        {/* Teal gradient orb top-right */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] z-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 80% 20%, hsl(185 100% 48% / 0.07) 0%, transparent 65%)",
        }} />

        {/* Blue orb bottom-left */}
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] z-0 pointer-events-none" style={{
          background: "radial-gradient(circle at 20% 80%, hsl(210 100% 40% / 0.08) 0%, transparent 65%)",
        }} />

        {/* Dark vignette overlay */}
        <div className="fixed inset-0 z-[1] pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,16,0.7) 100%)",
        }} />

        {/* Noise grain overlay */}
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
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}
