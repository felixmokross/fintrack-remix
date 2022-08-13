/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        // cards: width 56 (14rem), gaps and padding: 6 (1.5rem)
        "accounts-1": "calc(1.5rem + 1 * (14rem + 1.5rem)) auto",
        "accounts-2": "calc(1.5rem + 2 * (14rem + 1.5rem)) auto",
        "accounts-3": "calc(1.5rem + 3 * (14rem + 1.5rem)) auto",
        "accounts-4": "calc(1.5rem + 4 * (14rem + 1.5rem)) auto",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
