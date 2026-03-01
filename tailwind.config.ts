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
        background: "#f8f9fa",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#c4d600",
          foreground: "#1a1a1a",
        },
        accent: {
          DEFAULT: "#a3b200",
          foreground: "#ffffff",
        },
        neutral: {
          light: "#f8f9fa",
          dark: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
