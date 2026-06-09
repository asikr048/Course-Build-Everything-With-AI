"use client";
import { useState, useEffect } from "react";
import { DEFAULT_CONFIG, withDefaults, type SiteConfig } from "@/lib/siteConfig";

export type { SiteConfig };

/**
 * Returns the live site config. Fields are spread at the top level for
 * backward compatibility (`cfg.heroTitle`), plus `loaded` and the full
 * `config` object are available.
 */
export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig(withDefaults(d)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { ...config, config, loaded };
}
