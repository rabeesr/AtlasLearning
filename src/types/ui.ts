export interface ThemeTokens {
  background: string;
  backgroundAlt: string;
  panel: string;
  panelAlt: string;
  panelMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  glow: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  radius: string;
  radiusLarge: string;
  strokeWidth: string;
}

export interface AppSection {
  href: string;
  label: string;
  description: string;
}

export interface NavGroup {
  id: string;
  label: string;
  description: string;
  items: AppSection[];
}

export interface WorkbenchNavItem {
  href: string;
  label: string;
  description: string;
}

export interface ConceptVariant {
  slug: "research-atelier" | "mission-control" | "museum-of-ideas" | "industrial-schematic";
  name: string;
  tagline: string;
  description: string;
  tokens: ThemeTokens;
}

export interface PlaceholderPageMeta {
  href: string;
  title: string;
  eyebrow: string;
  journey: string;
  purpose: string;
  whyItMatters: string;
  inputs: string[];
  outputs: string[];
  comingNext: string[];
  readiness: string;
  related: Array<{ href: string; label: string }>;
}

export interface DashboardModuleConfig {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "accent" | "success" | "warning" | "neutral";
}

export interface TopicPageSectionConfig {
  id: string;
  label: string;
  description: string;
}
