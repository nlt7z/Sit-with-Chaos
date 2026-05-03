"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const showrooms = [
  {
    id: "astro" as const,
    label: "Astrology",
    title: "Astro Showroom · Tao Baibai",
    tagline: "Constellation profile updates live while you chat.",
    href: "/work/ai-character/prototype-astro",
    src: "/work/ai-character/prototype-astro?embed=1",
    iframeTitle: "Zodiac Showroom interactive prototype",
    iframeBg: "bg-[#fdfaf5]",
  },
  {
    id: "therapy" as const,
    label: "Therapy",
    title: "Therapy Room · Therapy Space",
    tagline: "Analysis rail beside the thread — what the model understood, visible.",
    href: "/work/ai-character/prototype-psych",
    src: "/work/ai-character/prototype-psych?embed=1",
    iframeTitle: "Therapy Room interactive prototype",
    iframeBg: "bg-[#f8fcff]",
  },
  {
    id: "romance" as const,
    label: "Romance",
    title: "Meet with Lucien",
    tagline: "Long-term memory and emotional pacing in one flow.",
    href: "/work/ai-character/prototype",
    src: "/work/ai-character/prototype?muted=1",
    iframeTitle: "Romance Showroom interactive prototype",
    iframeBg: "bg-[#060608]",
  },
  {
    id: "omikuji" as const,
    label: "Omikuji",
    title: "Omikuji Cabinet · 御神籤",
    tagline: "Draw a fortune, open the drawer, and keep the ritual playful.",
    href: "/code/playground/omikuji",
    src: "/code/playground/omikuji?embed=1",
    iframeTitle: "Omikuji Cabinet interactive prototype",
    iframeBg: "bg-[#060608]",
  },
] as const;

const showroomStyle = {
  astro: {
    card: "border-black/[0.08] bg-[linear-gradient(156deg,#fffdf8_0%,#fff7f3_34%,#f7f8ef_66%,#fff8e9_100%)] ring-1 ring-black/[0.05]",
    eyebrow: "text-[#8a7a52]",
    link: "text-[#7b6a3f] hover:text-[#5f5130]",
    iframeBorder: "border-black/[0.08]",
  },
  therapy: {
    card: "border-black/[0.08] bg-[linear-gradient(158deg,#f7fbff_0%,#eff7ff_42%,#e9f4ff_100%)] ring-1 ring-black/[0.05]",
    eyebrow: "text-[#2f75aa]",
    link: "text-[#1f6ea8] hover:text-[#18557f]",
    iframeBorder: "border-black/[0.08]",
  },
  romance: {
    card: "border-black/[0.08] bg-[linear-gradient(160deg,#fafbfc_0%,#f3f5f8_40%,#eceff4_100%)] ring-1 ring-black/[0.05]",
    eyebrow: "text-[#667085]",
    link: "text-[#344054] hover:text-[#1d2939]",
    iframeBorder: "border-black/[0.08]",
  },
  omikuji: {
    card: "border-[#c9a030]/45 bg-[linear-gradient(170deg,#121a22_0%,#0f1410_45%,#1a1510_100%)] shadow-[0_20px_64px_-20px_rgba(0,0,0,0.42)] ring-1 ring-[#d4af37]/20",
    eyebrow: "text-[#c9a030]/85",
    link: "text-[#e8c84a] hover:text-[#fdf6e8]",
    iframeBorder: "border-[#c9a030]/35",
  },
} as const;

/** Full-height showroom stack (moved from About). */
export function VibeCodingShowrooms() {
  const rm = useReducedMotion();
  return (
    <div className="flex flex-col gap-8">
      {showrooms.map((s, i) => {
        const st = showroomStyle[s.id];
        return (
          <motion.div
            key={s.id}
            initial={rm ? false : { opacity: 0, y: 28 }}
            whileInView={rm ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.65, ease: easePortfolio, delay: rm ? 0 : i * 0.06 }}
            className={`overflow-hidden rounded-3xl border ${st.card}`}
          >
            <div className="border-b border-black/[0.08] px-5 py-5 md:px-6 md:py-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${st.eyebrow}`}>
                  {String(i + 1).padStart(2, "0")} / {String(showrooms.length).padStart(2, "0")}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    s.id === "omikuji"
                      ? "border border-[#c9a030]/40 bg-[#261e18]/90 text-[#f0ddb8]/90"
                      : "border border-black/[0.08] bg-white/80 text-textSecondary"
                  }`}
                >
                  End-to-End Design · Prototype
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-display text-xl font-light leading-snug md:text-[1.35rem] ${
                      s.id === "omikuji" ? "text-[#f0ddb8]" : "text-[#111827]"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p
                    className={`mt-2 max-w-xl text-[14px] leading-relaxed ${
                      s.id === "omikuji" ? "text-[#c9b896]/90" : "text-[#475467]"
                    }`}
                  >
                    {s.tagline}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                  <Link
                    href={s.href}
                    className={`text-[13px] font-medium underline underline-offset-4 transition-opacity hover:opacity-70 ${st.link}`}
                  >
                    Open prototype
                  </Link>
                  {s.id === "romance" && (
                    <Link
                      href="/work/ai-character"
                      className="text-[13px] font-medium text-[#344054] underline underline-offset-4 transition-opacity hover:opacity-70"
                    >
                      Case study
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className={`border-t ${st.iframeBorder}`}>
              <iframe
                key={s.src}
                title={s.iframeTitle}
                src={s.src}
                className={`block h-[min(72vh,780px)] min-h-[480px] w-full md:min-h-[560px] ${s.iframeBg}`}
                loading="lazy"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
