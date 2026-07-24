import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        background: "#F5F5F7",
        foreground: "#1D1D1F",
        accent: "#00A651",
      },
      textWrap: {
        balance: "balance",
      },
    },
  },
  plugins: [],
};

export default config;
