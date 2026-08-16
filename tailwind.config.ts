import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // „Velké A vysoké okno“ – jen tam má hero plnou desktopovou podobu
        // (nadpis 8xl, kolečka s hodnocením). Samotná šířka nestačí: tablet na
        // šířku i 13" notebook mají přes 1000 px šířky, ale sotva 700 px výšky,
        // takže by hodnocení a počet referencí spadly pod ohyb.
        desktop: { raw: "(min-width: 1280px) and (min-height: 900px)" },
      },
      colors: {
        background: "#f8f9fa",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#c4d600",
          foreground: "#1a1a1a",
          ink: "#5c6a00",
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
