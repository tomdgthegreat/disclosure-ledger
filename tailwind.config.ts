import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: {
          DEFAULT: "#0b1220",
          soft: "#141e33",
          muted: "#4a5568",
        },
        gold: {
          DEFAULT: "#d4a017",
          bright: "#e8b923",
          soft: "#fef6e0",
        },
        cream: "#faf8f5",
        border: "#e8e4dc",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 8px 24px rgba(11,18,32,0.04)",
        glow: "0 0 0 1px rgba(212,160,23,0.25), 0 8px 28px rgba(11,18,32,0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
