import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        editor: {
          bg: "#f8f9fa",
          border: "#e9ecef",
          text: "#212529",
        },
        preview: {
          bg: "#ffffff",
          border: "#e9ecef",
        },
      },
      keyframes: {
        'rainbow-border': {
          '0%, 100%': { 
            'background-position': '0% 50%',
            'transform': 'scale(1.02)'
          },
          '50%': { 
            'background-position': '100% 50%',
            'transform': 'scale(1)'
          },
        },
      },
      animation: {
        'rainbow-border': 'rainbow-border 3s ease-in-out infinite',
        'rainbow-border-fast': 'rainbow-border 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;