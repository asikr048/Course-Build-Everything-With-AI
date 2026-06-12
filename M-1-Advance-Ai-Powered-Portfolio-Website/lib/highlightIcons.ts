/**
 * Curated icon set for the editable "Beyond Code" highlights cards.
 * Shared between the admin icon-picker and the public Personal page so both
 * always render the exact same glyphs by name.
 */
import {
  Lightbulb, BookOpen, Camera, Users, Plane, Music, Coffee, Dumbbell,
  Gamepad2, Palette, Mountain, Bike, Globe, Heart, Rocket, Target,
  Trophy, Mic, PenTool, Code2, Brain, Leaf, Star, Zap, Film, Headphones,
  Sparkles, Compass, Sun, Moon, Map, Award,
  type LucideIcon,
} from "lucide-react";

export const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  Lightbulb, BookOpen, Camera, Users, Plane, Music, Coffee, Dumbbell,
  Gamepad2, Palette, Mountain, Bike, Globe, Heart, Rocket, Target,
  Trophy, Mic, PenTool, Code2, Brain, Leaf, Star, Zap, Film, Headphones,
  Sparkles, Compass, Sun, Moon, Map, Award,
};

export const HIGHLIGHT_ICON_NAMES = Object.keys(HIGHLIGHT_ICONS);

/** Resolve an icon name to its component, falling back to Sparkles. */
export function highlightIcon(name?: string): LucideIcon {
  return (name && HIGHLIGHT_ICONS[name]) || Sparkles;
}

export interface HighlightItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}
export interface HighlightsData {
  title: string;
  intro: string;
  items: HighlightItem[];
}
