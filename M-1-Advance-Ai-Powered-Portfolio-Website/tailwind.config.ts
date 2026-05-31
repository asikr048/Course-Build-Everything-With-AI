import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        syne: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      colors: {
        teal: {
          DEFAULT: "hsl(185,100%,48%)",
          dim: "hsl(185,100%,30%)",
          glow: "hsl(185,100%,60%)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
