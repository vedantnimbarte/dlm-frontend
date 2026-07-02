import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "accent-stream": "var(--accent-stream)",
        "accent-compute": "var(--accent-compute)",
        "accent-pinned": "var(--accent-pinned)",
        danger: "var(--danger)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1rem" }],
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.5" }],
        xl: ["1.5rem", { lineHeight: "1.35" }],
        "2xl": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "3xl": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "4xl": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        card: "8px",
        btn: "6px",
      },
      maxWidth: {
        shell: "1180px",
      },
      letterSpacing: {
        eyebrow: "0.08em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
