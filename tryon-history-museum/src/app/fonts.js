import { Playfair_Display_SC, Montserrat } from "next/font/google";

// Official THM brand fonts (Phase 1 — brand foundations).
// These expose CSS variables consumed by the `font-brand-*` Tailwind
// families. They do not affect the legacy Cormorant Garamond /
// Source Sans 3 stacks used by existing pages.
//
// Typography system:
//   Playfair Display SC — primary headings / display typography
//   Syntax              — secondary sans (labels, nav, identity text)
//   Montserrat          — body text / reading content
//
// Syntax is a commercial family and no licensed webfont files exist in
// this project yet (verified: no .woff/.woff2/.otf/.ttf outside
// node_modules and build output). Once licensed files are supplied,
// add a next/font/local definition here with `variable: "--font-syntax"`
// and the `font-brand-secondary` Tailwind family will pick it up
// automatically — no token changes needed.

export const playfairDisplaySC = Playfair_Display_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-brand-display",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-brand-body",
  display: "swap",
});
