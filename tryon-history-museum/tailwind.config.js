/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tryon: {
          red: "#7B2D26",
          "dark-red": "#5C1F1A",
          black: "#1A1311",
          cream: "#FAF7F4",
          white: "#FFFDF9",
          warm: "#F5F0EB",
          muted: "#A8584F",
          gold: "#C4A35A",
        },
        // Redesign brand kit — namespaced, additive only.
        // Legacy `tryon.*` tokens above remain the production palette
        // until redesigned components are migrated and verified.
        brand: {
          heritage: "#9C3A2E",
          ink: "#222222",
          stone: "#C8B79A",
          parchment: "#E7E2D6",
          cream: "#F6F2EA",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Garamond", "serif"],
        body: ['"Source Sans 3"', '"Source Sans Pro"', "sans-serif"],
        // Redesign fonts — loaded via next/font in src/app/fonts.js.
        // Do not point existing components at these; `font-display` and
        // `font-body` above stay in place for legacy pages.
        "brand-display": ["var(--font-fraunces)", "Georgia", "serif"],
        "brand-body": ["var(--font-inter)", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
