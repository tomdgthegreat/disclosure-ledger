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
          DEFAULT: "#0a1628",
          soft: "#12233f",
          muted: "#475569",
        },
        azure: {
          DEFAULT: "#2563eb",
          bright: "#3b82f6",
          deep: "#1d4ed8",
          soft: "#dbeafe",
        },
        coral: {
          DEFAULT: "#f97356",
          bright: "#fb8a6e",
          soft: "#fff1ed",
        },
        amber: {
          DEFAULT: "#f59e0b",
          soft: "#fef3c7",
        },
        gold: {
          DEFAULT: "#f97356",
          bright: "#fb8a6e",
          soft: "#fff1ed",
        },
        cream: "#f8fafc",
        border: "#c8d4e8",
      },
      boxShadow: {
        card: "0 2px 4px rgba(10,22,40,0.05), 0 12px 32px rgba(37,99,235,0.08)",
        glow: "0 0 0 1px rgba(37,99,235,0.28), 0 10px 32px rgba(37,99,235,0.18)",
        "glow-coral":
          "0 0 0 1px rgba(249,115,86,0.3), 0 10px 28px rgba(249,115,86,0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
