"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Briefcase, User, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/",         icon: Home,       label: "Home" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/career",   icon: Briefcase,  label: "Career" },
  { href: "/personal", icon: User,       label: "About" },
  { href: "/contact",  icon: Mail,       label: "Contact" },
];

export default function BottomBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <nav className="flex items-center gap-1 px-3 py-2 rounded-2xl"
        style={{
          background: "hsl(210 60% 8% / 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid hsl(185 100% 48% / 0.12)",
        }}
      >
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200",
                active ? "text-[hsl(185,100%,48%)]" : "text-white/30"
              )}
              style={active ? { background: "hsl(185 100% 48% / 0.1)" } : {}}
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
