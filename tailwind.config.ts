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
          DEFAULT: "#06101f",
          soft: "#0d1b33",
          muted: "#3d5270",
        },
        azure: {
          DEFAULT: "#1a6cff",
          bright: "#3d8bff",
          deep: "#0052e0",
          soft: "#cfe2ff",
        },
        coral: {
          DEFAULT: "#ff5a3c",
          bright: "#ff7a62",
          soft: "#ffe5df",
        },
        amber: {
          DEFAULT: "#ffb020",
          soft: "#ffe8b0",
        },
        gold: {
          DEFAULT: "#ff5a3c",
          bright: "#ff7a62",
          soft: "#ffe5df",
        },
        cream: "#f4f8ff",
        border: "#a8c4f0",
      },
      boxShadow: {
        card: "0 8px 32px rgba(26,108,255,0.12)",
        glow: "0 0 0 1px rgba(26,108,255,0.25), 0 14px 40px rgba(26,108,255,0.28)",
        "glow-coral":
          "0 0 0 1px rgba(255,90,60,0.28), 0 14px 36px rgba(255,90,60,0.22)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
