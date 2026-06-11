/**
 * Single source of truth for the site configuration shape + defaults.
 * Server (layout, API) and client (hooks) both import from here so the
 * portfolio is fully rebrandable from the admin panel with no code edits.
 */

export interface Stat {
  value: string;  // e.g. "30+", "5", "100%"
  label: string;  // e.g. "Projects Completed"
}

export interface SiteConfig {
  // ── Identity ──
  brandName: string;            // nav / logo text
  heroTagline: string;          // small eyebrow text above the name
  heroTitle: string;            // big name
  heroSubtitle: string;         // role / headline
  roles: string;                // newline/comma separated — typing animation
  aboutText: string;

  // ── Hero extras ──
  techStack: string;            // comma-separated — marquee
  stats: Stat[];                // animated counters
  showStats: boolean;
  showMarquee: boolean;
  photoURL: string;
  photoFocus: string;           // object-position, e.g. "50% 30%"
  location: string;
  age: string;
  email: string;
  phone: string;

  // ── Personal page extras (left card) ──
  availabilityStatus: string;   // e.g. "Open to work", "Freelancing", "Not available"
  availabilityColor: string;    // "green" | "amber" | "red"
  currentlyWorkingOn: string;   // short note, e.g. "Building a SaaS product"
  interests: string;            // comma-separated, e.g. "Hiking, Photography, Chess"
  languages: string;            // comma-separated, e.g. "English (Native), Bengali (Fluent)"
  personalityTags: string;      // comma-separated, e.g. "Creative, Curious, Detail-oriented"

  // ── Call to action (hero buttons) ──
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  resumeURL: string;

  // ── Socials ──
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  youtube: string;
  dribbble: string;
  website: string;

  // ── Theme / Design ──
  themeMode: "dark" | "light";
  themePrimary: string;         // HSL triplet "H S% L%"
  themeSecondary: string;       // HSL triplet
  themeBackground: string;      // HSL triplet (page base)
  backgroundImage: string;      // optional ambient image URL
  backgroundOpacity: string;    // "0".."1" as string for inputs

  // ── SEO ──
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  faviconURL: string;

  // ── Section visibility ──
  showProjects: boolean;
  showCareer: boolean;
  showSkills: boolean;
  showServices: boolean;
  showTestimonials: boolean;
  showContact: boolean;

  footerText: string;
  updatedAt: string;
}

export const DEFAULT_CONFIG: SiteConfig = {
  brandName: "Portfolio",
  heroTagline: "Available for freelance & full-time work",
  heroTitle: "Your Name",
  heroSubtitle: "Creative Developer & Designer",
  roles: "Full-Stack Developer\nUI/UX Designer\nOpen-Source Contributor",
  aboutText: "Building things for the web at the intersection of design and engineering.",

  techStack: "React, Next.js, TypeScript, Node.js, Tailwind CSS, PostgreSQL, Figma, AWS",
  stats: [
    { value: "30+", label: "Projects Completed" },
    { value: "5+", label: "Years Experience" },
    { value: "20+", label: "Happy Clients" },
    { value: "15+", label: "Technologies" },
  ],
  showStats: true,
  showMarquee: true,
  photoURL: "",
  photoFocus: "50% 30%",
  location: "Your City",
  age: "",
  email: "hello@example.com",
  phone: "",

  availabilityStatus: "Open to work",
  availabilityColor: "green",
  currentlyWorkingOn: "",
  interests: "",
  languages: "",
  personalityTags: "",

  ctaPrimaryText: "View Work",
  ctaPrimaryLink: "/projects",
  ctaSecondaryText: "Contact Me",
  ctaSecondaryLink: "/contact",
  resumeURL: "",

  github: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  youtube: "",
  dribbble: "",
  website: "",

  themeMode: "dark",
  themePrimary: "185 100% 48%",
  themeSecondary: "210 100% 40%",
  themeBackground: "210 100% 4%",
  backgroundImage: "",
  backgroundOpacity: "0.18",

  seoTitle: "Portfolio",
  seoDescription: "Full-Stack Developer & Designer Portfolio",
  seoKeywords: "developer, designer, portfolio",
  ogImage: "",
  faviconURL: "",

  showProjects: true,
  showCareer: true,
  showSkills: true,
  showServices: true,
  showTestimonials: true,
  showContact: true,

  footerText: "",
  updatedAt: "",
};

/** Merge stored config over defaults so missing keys always have a value. */
export function withDefaults(partial: Partial<SiteConfig> | null | undefined): SiteConfig {
  return { ...DEFAULT_CONFIG, ...(partial ?? {}) };
}
