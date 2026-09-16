import type { Config } from "tailwindcss";

/**
 * PolicyPulse design tokens.
 *
 * Visual direction: warm off-white paper, deep forest green, restrained teal
 * and amber accents, high-contrast editorial typography.
 *
 * Colours are exposed as CSS custom properties in `globals.css` so that the
 * same tokens can be consumed from plain CSS (print styles, SVG charts).
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--pp-paper)",
          raised: "var(--pp-paper-raised)",
          sunken: "var(--pp-paper-sunken)",
          line: "var(--pp-line)",
        },
        ink: {
          DEFAULT: "var(--pp-ink)",
          soft: "var(--pp-ink-soft)",
          faint: "var(--pp-ink-faint)",
        },
        forest: {
          50: "#f1f7f2",
          100: "#dcebdf",
          200: "#bad8c1",
          300: "#8dbe99",
          400: "#5c9d6e",
          500: "#3b7f50",
          600: "#2a663e",
          700: "#225233",
          800: "#1b412a",
          900: "#12301f",
        },
        teal: {
          50: "#eff9f8",
          100: "#d6f0ee",
          200: "#aee1de",
          300: "#7bcbc7",
          400: "#45aeaa",
          500: "#249290",
          600: "#187574",
          700: "#165e5e",
          800: "#154b4b",
          900: "#123e3e",
        },
        amber: {
          50: "#fdf7ed",
          100: "#f9ebd1",
          200: "#f2d49f",
          300: "#e9b666",
          400: "#e09a3c",
          500: "#d2801f",
          600: "#b36216",
          700: "#8f4a15",
          800: "#753c18",
          900: "#623217",
        },
        clay: {
          DEFAULT: "#b4553f",
          soft: "#f6e9e5",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Book Antiqua",
          "Palatino",
          "Georgia",
          "ui-serif",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.375rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26, 24, 18, 0.04), 0 6px 20px -12px rgba(26, 24, 18, 0.18)",
        raised: "0 2px 4px rgba(26, 24, 18, 0.05), 0 18px 40px -20px rgba(26, 24, 18, 0.28)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      keyframes: {
        "pp-fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pp-pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.9" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "pp-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pp-fade-up": "pp-fade-up 320ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
        "pp-pulse-ring": "pp-pulse-ring 2.6s ease-out infinite",
        "pp-sweep": "pp-sweep 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
