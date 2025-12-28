import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#010101",
        foreground: "#FAFAFA",
        card: "#1a1a1a",
        border: "#262626",
        muted: "#A3A3A3",
      },
      padding: {
        '25': '100px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(100.86deg, #FF0075 4.13%, #FF4A15 55.91%, #FFCB45 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;

