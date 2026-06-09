"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Briefcase, User, Mail, Wrench, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/hooks/useSiteConfig";

export default function BottomBar() {
  const pathname = usePathname();
  const cfg = useSiteConfig();
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", icon: Home, label: "Home", show: true },
    { href: "/projects", icon: FolderOpen, label: "Projects", show: cfg.showProjects },
    { href: "/career", icon: Briefcase, label: "Career", show: cfg.showCareer },
    { href: "/services", icon: Wrench, label: "Services", show: cfg.showServices },
    { href: "/testimonials", icon: Quote, label: "Quotes", show: cfg.showTestimonials },
    { href: "/personal", icon: User, label: "About", show: true },
    { href: "/contact", icon: Mail, label: "Contact", show: cfg.showContact },
  ].filter((l) => l.show);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <nav className="flex items-center gap-1 px-3 py-2 rounded-2xl max-w-full overflow-x-auto no-scrollbar"
        style={{
          background: "hsl(210 60% 8% / 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(var(--p) / 0.12)",
        }}
      >
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl transition-all duration-200 shrink-0",
                active ? "" : "text-white/30"
              )}
              style={active ? { color: "hsl(var(--p))", background: "hsl(var(--p) / 0.1)" } : {}}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
