import { Fraunces, Inter } from "next/font/google";

// Redesign brand fonts (Phase 1 — brand foundations).
// These expose CSS variables consumed by the `font-brand-display` and
// `font-brand-body` Tailwind families. They do not affect the legacy
// Cormorant Garamond / Source Sans 3 stacks used by existing pages.

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Fraunces is variable; include opsz + soft/wonk axes for editorial use.
  axes: ["opsz", "SOFT", "WONK"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
