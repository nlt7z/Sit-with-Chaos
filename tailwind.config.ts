import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./registry/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surfaceAlt: "#F5F5F7",
        textPrimary: "#1D1D1F",
        textSecondary: "#6E6E73",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        portfolio: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      transitionDuration: {
        portfolio: "500ms",
      },
      maxWidth: {
        /** Wide portfolio grids */
        content: "72rem",
        /** Section titles — same measure as Studio `SectionTitle` (max-w-[40rem]) */
        caseStudy: "40rem",
        /** Body copy — same as Studio `Prose` (max-w-[42rem]) */
        reading: "42rem",
      },
      keyframes: {
        /** Spell UI — Prism preset: drifting soft color blobs */
        "spell-prism-a": {
          "0%, 100%": { transform: "translate3d(-5%, -3%, 0) scale(1)" },
          "50%": { transform: "translate3d(12%, 10%, 0) scale(1.12)" },
        },
        "spell-prism-b": {
          "0%, 100%": { transform: "translate3d(8%, -6%, 0) scale(1.05)" },
          "50%": { transform: "translate3d(-10%, 8%, 0) scale(1.18)" },
        },
        "spell-prism-c": {
          "0%, 100%": { transform: "translate3d(-4%, 6%, 0) scale(1.08)" },
          "50%": { transform: "translate3d(6%, -8%, 0) scale(0.94)" },
        },
        /** Silver preset — restrained silver mist drift */
        "spell-silver-a": {
          "0%, 100%": { transform: "translate3d(-2%, -1%, 0) scale(1)" },
          "50%": { transform: "translate3d(7%, 4%, 0) scale(1.05)" },
        },
        "spell-silver-b": {
          "0%, 100%": { transform: "translate3d(5%, -3%, 0)" },
          "50%": { transform: "translate3d(-6%, 4%, 0)" },
        },
        /** Gacha omikuji — CTA background gradient drift */
        "gacha-cta-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        /** Gacha omikuji — specular sweep across CTA */
        "gacha-cta-glint": {
          "0%": { transform: "translateX(-140%) skewX(-18deg)", opacity: "0" },
          "12%": { opacity: "0.95" },
          "35%": { transform: "translateX(220%) skewX(-18deg)", opacity: "0" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "spell-prism-a": "spell-prism-a 36s ease-in-out infinite alternate",
        "spell-prism-b": "spell-prism-b 42s ease-in-out infinite alternate",
        "spell-prism-c": "spell-prism-c 44s ease-in-out infinite alternate",
        "spell-silver-a": "spell-silver-a 48s ease-in-out infinite alternate",
        "spell-silver-b": "spell-silver-b 54s ease-in-out infinite alternate",
        "gacha-cta-shimmer": "gacha-cta-shimmer 3.8s ease-in-out infinite",
        "gacha-cta-glint": "gacha-cta-glint 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
