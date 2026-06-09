"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Briefcase, User, Mail, Wrench, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";

export default function Navbar() {
  const pathname = usePathname();
  const cfg = useSiteConfig();
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", icon: Home, label: "Home", show: true },
    { href: "/projects", icon: FolderOpen, label: "Projects", show: cfg.showProjects },
    { href: "/career", icon: Briefcase, label: "Career", show: cfg.showCareer },
    { href: "/services", icon: Wrench, label: "Services", show: cfg.showServices },
    { href: "/testimonials", icon: Quote, label: "Testimonials", show: cfg.showTestimonials },
    { href: "/personal", icon: User, label: "About", show: true },
    { href: "/contact", icon: Mail, label: "Contact", show: cfg.showContact },
  ].filter((l) => l.show);

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-16 z-50 flex-col items-center justify-center gap-2">
      <div className="flex flex-col items-center gap-1 py-4 px-2 rounded-2xl"
        style={{
          background: "hsl(210 60% 8% / 0.5)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(var(--p) / 0.1)",
          boxShadow: "0 0 40px hsl(var(--p) / 0.04)",
        }}
      >
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group",
                active ? "" : "text-white/30 hover:text-white/70"
              )}
              style={active ? {
                color: "hsl(var(--p))",
                background: "hsl(var(--p) / 0.1)",
                boxShadow: "0 0 12px hsl(var(--p) / 0.2)",
              } : {}}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "hsl(var(--p))", boxShadow: "0 0 8px hsl(var(--p))" }} />
              )}
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />

              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-1 group-hover:translate-x-0"
                style={{
                  background: "hsl(210 60% 8% / 0.95)",
                  border: "1px solid hsl(var(--p) / 0.15)",
                  color: "hsl(195 80% 90%)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
