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
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Garamond", "serif"],
        body: ['"Source Sans 3"', '"Source Sans Pro"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
