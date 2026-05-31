"use client";
import { useState, useEffect } from "react";

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  photoURL: string;
  photoFocus: string;
  location: string;
  age: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  website: string;
  updatedAt: string;
}

const DEFAULTS: SiteConfig = {
  heroTitle: "Your Name",
  heroSubtitle: "Creative Developer",
  aboutText: "Building things for the web.",
  photoURL: "",
  photoFocus: "50% 30%",
  location: "Your City",
  age: "",
  email: "hello@example.com",
  phone: "",
  github: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  website: "",
  updatedAt: "",
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULTS);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setConfig({ ...DEFAULTS, ...d }))
      .catch(() => {});
  }, []);

  return config;
}
