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
        magical: {
          100: 'oklch(0.86 0.08 280)',
          200: 'oklch(0.82 0.06 280)',
          300: 'oklch(0.71 0.12 280)',
          400: 'oklch(0.61 0.18 280)',
          500: 'oklch(0.5 0.21 280)',
          600: 'oklch(0.42 0.18 280)',
          800: 'oklch(0.25 0.15 280)',
          900: 'oklch(0.13 0.06 280)',
        }
      },
      keyframes: {
        'rainbow': {
          '0%': { 'background-position': '0%' },
          '100%': { 'background-position': '200%' },
        },
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
        'magical-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 1em 0.5em oklch(0.71 0.12 280)',
            'opacity': '0.6'
          },
          '50%': {
            'box-shadow': '0 0 1.5em 0.75em oklch(0.71 0.12 280)',
            'opacity': '0.8'
          },
        }
      },
      animation: {
        'rainbow': 'rainbow 60s linear infinite',
        'rainbow-border': 'rainbow-border 3s ease-in-out infinite',
        'rainbow-border-fast': 'rainbow-border 2s ease-in-out infinite',
        'magical-glow': 'magical-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;