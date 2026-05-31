"use client";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center gap-6 md:pl-16 fade-up">
      <div className="text-center">
        <p className="text-8xl font-bold font-syne" style={{ color: "hsl(185,100%,48%)", opacity: 0.3 }}>404</p>
        <h1 className="text-white font-bold text-2xl font-syne mt-2">Page not found</h1>
        <p className="text-white/35 text-sm mt-2">Looks like this page drifted out to sea.</p>
      </div>
      <Link href="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-syne transition-all hover:scale-105"
        style={{ background: "hsl(185 100% 48% / 0.12)", color: "hsl(185,100%,60%)", border: "1px solid hsl(185 100% 48% / 0.2)" }}>
        <Home size={15} /> Back home
      </Link>
    </main>
  );
}
