/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#480102",
        secondary: "#F59E0B",
        accent: {
          pink: "#F472B6",
          rust: "#DFD6C4",
          light: "#EFEEE5",
          mango: "#F3DEAA",
        },
      },
      fontFamily: {
        noto: ["var(--font-noto)"],
        anton: ["var(--font-anton)"],
      },
    },
  },
  plugins: [],
};
