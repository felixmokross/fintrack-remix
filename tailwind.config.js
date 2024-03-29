const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.75rem" }],
      lg: ["1.125rem", { lineHeight: "2rem" }],
      xl: ["1.25rem", { lineHeight: "2rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["2rem", { lineHeight: "2.5rem" }],
      "4xl": ["2.5rem", { lineHeight: "3.5rem" }],
      "5xl": ["3rem", { lineHeight: "3.5rem" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1.1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    extend: {
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Lexend", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        // cards: width 56 (14rem), gaps and padding: 6 (1.5rem)
        "accounts-1": "calc(1.5rem + 1 * (14rem + 1.5rem)) auto",
        "accounts-2": "calc(1.5rem + 2 * (14rem + 1.5rem)) auto",
        "accounts-3": "calc(1.5rem + 3 * (14rem + 1.5rem)) auto",
        "accounts-4": "calc(1.5rem + 4 * (14rem + 1.5rem)) auto",
      },
      height: {
        // nav bar height: 16 (4rem)
        app: "calc(100vh - 4rem)",
      },
      maxWidth: {
        "2xl": "40rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
