"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Briefcase, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",          icon: Home,       label: "Home" },
  { href: "/projects",  icon: FolderOpen, label: "Projects" },
  { href: "/career",    icon: Briefcase,  label: "Career" },
  { href: "/personal",  icon: User,       label: "About" },
  { href: "/contact",   icon: Mail,       label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-16 z-50 flex-col items-center justify-center gap-2">
      {/* Glassy sidebar strip */}
      <div className="flex flex-col items-center gap-1 py-4 px-2 rounded-2xl"
        style={{
          background: "hsl(210 60% 8% / 0.5)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(185 100% 48% / 0.1)",
          boxShadow: "0 0 40px hsl(185 100% 48% / 0.04)",
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
                active
                  ? "text-[hsl(185,100%,48%)]"
                  : "text-white/30 hover:text-white/70"
              )}
              style={active ? {
                background: "hsl(185 100% 48% / 0.1)",
                boxShadow: "0 0 12px hsl(185 100% 48% / 0.2)",
              } : {}}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "hsl(185,100%,48%)", boxShadow: "0 0 8px hsl(185 100% 48%)" }} />
              )}
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />

              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-1 group-hover:translate-x-0"
                style={{
                  background: "hsl(210 60% 8% / 0.95)",
                  border: "1px solid hsl(185 100% 48% / 0.15)",
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
