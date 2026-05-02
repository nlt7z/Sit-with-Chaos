"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { NltBrandPattern } from "@/components/NltBrandPattern";
import { VisualWorksCarousel } from "@/components/VisualWorksCarousel";
import { visualExperimentImages } from "@/lib/visualExperimentImages";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState, type PointerEvent } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;
const patternCols = 8;
const patternRows = 5;

/**
 * Playground-wide corner rhythm (consistent two-step + media):
 * - `outer` — Tailwind rounded-3xl (24px): main section shells (showroom chrome, Omikuji block, placeholder cards)
 * - `inset` — rounded-2xl (16px): nested surfaces inside those shells (iframe chrome, embedded previews)
 * - `media` — rounded-xl (12px): standalone thumbnails / grids & tertiary controls beside large shells
 */
const PLAYGROUND_RADIUS = {
  outer: "rounded-3xl",
  inset: "rounded-2xl",
  media: "rounded-xl",
} as const;

/** Match case-study vibe tabs: all rooms visible, one active. */
const showroomTab = {
  base: "inline-flex items-center justify-center rounded-full border px-4 py-2 font-sans text-[12px] font-semibold tracking-[0.02em] transition-all duration-300 ease-out",
  on: "border-transparent bg-textPrimary text-white shadow-sm",
  off: "border-black/[0.1] bg-neutral-50 text-textSecondary hover:border-black/20 hover:bg-white hover:text-textPrimary",
} as const;

const showroomCardGradients = {
  astro:
    "border-[#ece7d6] bg-[linear-gradient(156deg,#fffdf8_0%,#fff7f3_34%,#f7f8ef_66%,#fff8e9_100%)] shadow-[0_20px_50px_-30px_rgba(148,130,92,0.2)] ring-1 ring-[#d8d19a]/22",
  therapy:
    "border-[#d8e8f6] bg-[linear-gradient(158deg,#f7fbff_0%,#eff7ff_42%,#e9f4ff_100%)] shadow-[0_20px_50px_-30px_rgba(46,116,170,0.2)] ring-1 ring-[#73b7ee]/16",
  romance:
    "border-[#dfe3ea] bg-[linear-gradient(160deg,#fafbfc_0%,#f3f5f8_40%,#eceff4_100%)] shadow-[0_20px_50px_-30px_rgba(66,76,96,0.2)] ring-1 ring-[#a7b0be]/18",
} as const;

/** Copy + accents per showroom palette (against page white + gradient shells). */
const showroomTypography = {
  astro: {
    sectionEyebrow: "text-[#8a7a52]",
    sectionTitle: "text-[#101828]",
    cardLabel: "text-[#9a8a58]",
    cardTitle: "text-[#111827]",
    cardBody: "text-[#475467]",
    link: "font-medium text-[#7b6a3f] decoration-[#d8c987]/65 underline underline-offset-[5px] transition-colors hover:text-[#5f5130] hover:decoration-[#bda95a]/55",
  },
  therapy: {
    sectionEyebrow: "text-[#2f75aa]",
    sectionTitle: "text-[#101828]",
    cardLabel: "text-[#3c83b8]",
    cardTitle: "text-[#111827]",
    cardBody: "text-[#475467]",
    link: "font-medium text-[#1f6ea8] decoration-[#8ec9eb]/65 underline underline-offset-[5px] transition-colors hover:text-[#18557f] hover:decoration-[#63addb]/55",
  },
  romance: {
    sectionEyebrow: "text-[#667085]",
    sectionTitle: "text-[#101828]",
    cardLabel: "text-[#667085]",
    cardTitle: "text-[#111827]",
    cardBody: "text-[#475467]",
    link: "font-medium text-[#344054] decoration-[#98a2b3]/65 underline underline-offset-[5px] transition-colors hover:text-[#1d2939] hover:decoration-[#667085]/55",
    caseStudy:
      "font-medium text-[#344054] decoration-[#98a2b3]/65 underline underline-offset-[5px] transition-colors hover:text-[#1d2939] hover:decoration-[#667085]/55",
  },
} as const;

function showroomChromeTab(side: "astro" | "therapy" | "romance", on: boolean) {
  const base = showroomTab.base;
  if (side === "romance") {
    return `${base} ${
      on
        ? [
            "border-transparent bg-[#1f2937] text-white",
            "shadow-[0_8px_20px_-10px_rgba(31,41,55,0.45)]",
            "ring-1 ring-[#475467]/40",
          ].join(" ")
        : [
            "border-[#d0d5dd] bg-white/88 text-[#475467] backdrop-blur-[1px]",
            "hover:border-[#98a2b3] hover:bg-white hover:text-[#1d2939]",
          ].join(" ")
    }`;
  }
  if (side === "astro") {
    return `${base} ${
      on
        ? "border-transparent bg-[#7f6e42] text-white shadow-md shadow-[#7f6e42]/24"
        : "border-[#e6ddbc] bg-white/90 text-[#796a44] backdrop-blur-[2px] hover:border-[#d5ca9d] hover:bg-white hover:text-[#5f5130]"
    }`;
  }
  return `${base} ${
    on
      ? "border-transparent bg-[#10679f] text-white shadow-md shadow-[#10679f]/24"
      : "border-[#c9deef] bg-white/88 text-[#3b6d90] backdrop-blur-[2px] hover:border-[#9fc9e5] hover:bg-white hover:text-[#1f5a84]"
  }`;
}

function YFInteractivePattern({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<{ x: number; y: number } | null>(null);
  const cells = Array.from({ length: patternCols * patternRows }, (_, i) => {
    const row = Math.floor(i / patternCols);
    const col = i % patternCols;
    return { row, col };
  });

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHot({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [prefersReducedMotion],
  );

  const onLeave = useCallback(() => setHot(null), []);

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="w-fit px-6 py-5"
    >
      <div className="grid grid-cols-8 gap-x-4 gap-y-3.5">
        {cells.map(({ row, col }, i) => {
          const cx = col * 36 + 18;
          const cy = row * 34 + 17;
          const d = hot ? Math.hypot(hot.x - cx, hot.y - cy) : 999;
          const t = Math.max(0, 1 - d / 128);
          const y = prefersReducedMotion ? 0 : -t * 5;
          const o = 0.38 + t * 0.38;
          const s = 1.02 + t * 0.12;

          return (
            <span
              key={i}
              className="select-none font-mono text-[16px] font-medium tracking-[0.08em] text-black/70"
              style={{
                opacity: o,
                transform: `translate3d(0, ${y}px, 0) scale(${s})`,
                transition: "transform 180ms cubic-bezier(0.22,1,0.36,1), opacity 180ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              NLT
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Alessa Design — bento grid: `sm` uses 6 columns, `lg` uses 12.
 * Portraits: sm 1/6 · 2/6 · 3/6 width, lg 3/12 · 4/12 · 5/12. Landscapes: sm 3/6 · 4/6 · 5/6, lg 7/12 · 8/12 · 9/12.
 * so same-aspect images are not locked to identical tile widths. Images stay `w-full h-auto` (no crop).
 */
const alessaDesignImages = [
  {
    src: "/assets/Playground/alessadesign1.jpg",
    width: 900,
    height: 1125,
    alt: "Alessa Design study 1",
    gridClass: "sm:col-span-2 lg:col-span-4",
  },
  {
    src: "/assets/Playground/alessadesign2.jpg",
    width: 1465,
    height: 982,
    alt: "Alessa Design study 2",
    gridClass: "sm:col-span-4 lg:col-span-8",
  },
  {
    src: "/assets/Playground/alessadesign3.jpg",
    width: 900,
    height: 1148,
    alt: "Alessa Design study 3",
    gridClass: "sm:col-span-3 lg:col-span-3",
  },
  {
    src: "/assets/Playground/alessadesign4.jpg",
    width: 900,
    height: 600,
    alt: "Alessa Design study 4",
    gridClass: "sm:col-span-3 lg:col-span-9",
  },
  {
    src: "/assets/Playground/alessadesign5.jpg",
    width: 900,
    height: 1116,
    alt: "Alessa Design study 5",
    /** Narrow portrait strip on tablet (1/6) vs studies 1 & 3 for more variety. */
    gridClass: "sm:col-span-1 lg:col-span-5",
  },
  {
    src: "/assets/Playground/alessadesign6.jpg",
    width: 900,
    height: 600,
    alt: "Alessa Design study 6",
    gridClass: "sm:col-span-5 lg:col-span-7",
  },
] as const;

type PlaceholderCardProps = {
  title: string;
  subtitle: string;
  note: string;
  aspect?: string;
};

const playgroundAiShowrooms = [
  {
    variant: "astro" as const,
    slideLabel: "Astrology",
    title: "Astro Showroom · Tao Baibai",
    tagline: "Constellation profile updates live while you chat.",
    href: "/work/ai-character/prototype-astro",
    iframeSrc: "/work/ai-character/prototype-astro?embed=1",
    iframeTitle: "Zodiac Showroom interactive prototype",
    iframeClass: "block h-[min(84vh,900px)] min-h-[540px] w-full bg-[#fdfaf5] md:min-h-[640px]",
  },
  {
    variant: "therapy" as const,
    slideLabel: "Therapy",
    title: "Therapy Room · Therapy Space",
    tagline: "Analysis rail beside the thread — what the model understood, visible.",
    href: "/work/ai-character/prototype-psych",
    iframeSrc: "/work/ai-character/prototype-psych?embed=1",
    iframeTitle: "Therapy Room interactive prototype",
    iframeClass: "block h-[min(84vh,900px)] min-h-[540px] w-full bg-[#f8fcff] md:min-h-[640px]",
  },
  {
    variant: "romance" as const,
    slideLabel: "Romance",
    title: "Meet with Lucien",
    tagline: "Long-term memory and emotional pacing in one flow.",
    href: "/work/ai-character/prototype",
    iframeSrc: "/work/ai-character/prototype?muted=1",
    iframeTitle: "Romance Showroom interactive prototype",
    iframeClass: "h-[min(84vh,900px)] min-h-[540px] w-full bg-[#060608] md:min-h-[640px]",
  },
];

function PlaygroundAiShowroomGallery({ reduceMotion }: { reduceMotion: boolean }) {
  const [index, setIndex] = useState(0);
  const s = playgroundAiShowrooms[index];
  const t = showroomTypography[s.variant];

  const iframeChrome =
    s.variant === "romance"
      ? "relative isolate overflow-hidden border-t border-[#c8d0da] bg-[#f2f4f7] shadow-[0_12px_32px_rgba(2,8,20,0.08),inset_0_0_0_1px_rgba(255,255,255,0.7)]"
      : s.variant === "astro"
        ? "border-t border-[#e4dbb9] bg-[#fffdf6]"
        : "border-t border-[#cbe0ef] bg-[#f5f9fd]";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.65, ease: easePortfolio }}
      className="mt-10"
      aria-label="Qwen AI Character showroom gallery"
    >
      <div className="mb-5 max-w-3xl transition-colors duration-500">
        <p className={`font-mono text-xs uppercase tracking-widest transition-colors duration-500 ${t.sectionEyebrow}`}>
          Qwen AI Character
        </p>
        <h3 className={`mt-2 font-display text-2xl font-light md:text-3xl transition-colors duration-500 ${t.sectionTitle}`}>
          Showroom prototypes
        </h3>
      </div>

      <div
        className={`overflow-hidden ${PLAYGROUND_RADIUS.outer} border transition-[border-color,box-shadow] duration-500 ease-out ${showroomCardGradients[s.variant]}`}
      >
        <div
          className={`border-b px-4 py-5 md:px-6 md:py-6 ${
            s.variant === "romance"
              ? "border-black/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(246,248,251,0.92)_100%)] text-[#111827] shadow-[inset_0_-1px_0_0_rgba(148,163,184,0.16)] backdrop-blur-[2px]"
              : "border-black/[0.08]"
          }`}
        >
          <p className={`font-mono text-[10px] font-normal uppercase tracking-[0.2em] transition-colors duration-500 ${t.cardLabel}`}>
            Showrooms
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Choose showroom">
            {playgroundAiShowrooms.map((item, i) => {
              const on = i === index;
              return (
                <button
                  key={item.variant}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  id={`playground-showroom-tab-${item.variant}`}
                  aria-controls="playground-showroom-panel"
                  onClick={() => setIndex(i)}
                  className={showroomChromeTab(s.variant, on)}
                >
                  {item.slideLabel}
                </button>
              );
            })}
          </div>

          <div
            className={`mt-5 flex flex-col gap-4 border-t pt-5 md:flex-row md:items-start md:justify-between md:gap-8 ${
              s.variant === "romance" ? "border-black/[0.08]" : "border-black/[0.08]"
            }`}
          >
            <div className="min-w-0 flex-1" id="playground-showroom-panel" role="tabpanel" aria-labelledby={`playground-showroom-tab-${s.variant}`}>
              <p className={`font-display text-xl font-light leading-snug transition-colors duration-500 md:text-[1.35rem] ${t.cardTitle}`}>
                {s.title}
              </p>
              <p className={`mt-2 max-w-xl font-sans text-[14px] leading-relaxed transition-colors duration-500 ${t.cardBody}`}>
                {s.tagline}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
              <Link href={s.href} className={`font-sans text-[13px] font-medium underline ${t.link}`}>
                Open full page
              </Link>
              {s.variant === "romance" ? (
                <Link
                  href="/work/ai-character"
                  className={`font-sans text-[13px] font-medium underline underline-offset-[5px] transition-colors ${showroomTypography.romance.caseStudy}`}
                >
                  Case study
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className={iframeChrome}>
          {s.variant === "romance" ? (
            <>
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 50% at 15% 85%, rgba(140,160,190,0.14) 0%, transparent 55%), radial-gradient(ellipse 45% 45% at 90% 10%, rgba(170,180,200,0.18) 0%, transparent 55%), linear-gradient(170deg, #f6f8fb 0%, #eef2f7 45%, #e9edf3 100%)",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/52 via-transparent to-[#e7ebf2]/70"
                aria-hidden
              />
            </>
          ) : null}
          <iframe key={s.iframeSrc} title={s.iframeTitle} src={s.iframeSrc} className={s.iframeClass} loading="lazy" />
        </div>
      </div>
    </motion.section>
  );
}

function PlaceholderCard({
  title,
  subtitle,
  note,
  aspect = "aspect-[16/10]",
}: PlaceholderCardProps) {
  return (
    <article className={`${PLAYGROUND_RADIUS.outer} border border-[rgba(0,0,0,0.08)] bg-white p-4 shadow-sm`}>
      <div
        className={`relative ${aspect} overflow-hidden ${PLAYGROUND_RADIUS.inset} border border-[rgba(0,0,0,0.08)] bg-neutral-100`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.02),rgba(0,0,0,0.04),rgba(0,0,0,0.02))]" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-neutral-500">{note}</p>
        </div>
      </div>
      <p className="mt-4 font-display text-2xl font-light text-textPrimary">{title}</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-textSecondary">
        {subtitle}
      </p>
    </article>
  );
}

export function PlaygroundPageContent() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-content">
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Playground</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-light leading-tight text-textPrimary md:text-6xl">
            Coding and visual designs.
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-relaxed text-textSecondary">
            A space to archive my ideas, and previous works.
          </p>

          <section className="mt-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">01</p>
                <h2 className="mt-2 font-display text-3xl font-light text-textPrimary md:text-4xl">
                  Coding
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary">
                Play with Code.
              </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:auto-rows-fr lg:items-stretch">
              <motion.section
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.65, ease: easePortfolio }}
                className="flex h-full flex-col p-6 md:p-8"
              >
                <h3 className="font-display text-2xl font-light text-textPrimary md:text-3xl">
                  NLT Brand Pattern
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary">
                  Pointer-reactive micro animation. Hover around the grid to wake each token.
                </p>

                <div className="mt-8 flex flex-1 items-center justify-center p-5">
                  <NltBrandPattern
                    columns={patternCols}
                    rows={patternRows}
                    wrapperClassName="px-6 py-5"
                    gapClassName="gap-x-4 gap-y-3.5"
                  />
                </div>
              </motion.section>

              <motion.section
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.65, ease: easePortfolio }}
                className="flex h-full flex-col bg-white p-6 md:p-8"
              >
                <h3 className="font-display text-2xl font-light text-textPrimary md:text-3xl">
                  NLT Halftone Dense
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary">
                  Dense halftone NLT field with lime hover activation and smooth local response around the cursor.
                </p>
                <div className={`mx-auto mt-7 w-full max-w-[620px] overflow-hidden ${PLAYGROUND_RADIUS.inset}`}>
                  <iframe
                    title="NLT Halftone Dense"
                    src="/assets/Playground/nlt_halftone_dense_v3.html"
                    className="mx-auto block aspect-[31/13] w-full max-w-[620px]"
                    loading="lazy"
                  />
                </div>
              </motion.section>
            </div>

            <PlaygroundAiShowroomGallery reduceMotion={!!reduceMotion} />

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby="playground-omikuji-title"
              className={`relative isolate mt-10 overflow-hidden ${PLAYGROUND_RADIUS.outer} border border-[#c9a030]/45 shadow-[0_20px_64px_-20px_rgba(0,0,0,0.42)] ring-1 ring-[#d4af37]/20`}
            >
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 50% at 15% 85%, rgba(201,160,48,0.14) 0%, transparent 55%), radial-gradient(ellipse 45% 45% at 90% 10%, rgba(60,45,30,0.4) 0%, transparent 55%), linear-gradient(170deg, #121a22 0%, #0f1410 45%, #1a1510 100%)",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#1a1510]/88 via-transparent to-[#0c1018]/90"
                aria-hidden
              />
              <div className="p-6 md:p-8">
                <div className="max-w-3xl">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c9a030]/75">御神籤</p>
                  <h3
                    id="playground-omikuji-title"
                    className="mt-2.5 font-display text-2xl font-light leading-tight tracking-tight text-[#f0ddb8] md:text-3xl"
                  >
                    Omikuji Cabinet
                  </h3>
                  
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Link
                      href="/code/playground/omikuji"
                      className={`inline-flex items-center justify-center ${PLAYGROUND_RADIUS.media} border border-[#c9a030]/55 bg-[#261e18] px-5 py-2 text-[13px] font-medium text-[#e8c84a] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#e8c84a]/90 hover:bg-[#32261c] hover:text-[#fdf6e8]`}
                    >
                      Open Omikuji
                    </Link>
                    <span className="text-[11px] tracking-[0.25em] text-[#8a6820]/85" aria-hidden>
                      金
                    </span>
                  </div>
                </div>
                <div className={`mt-7 overflow-hidden ${PLAYGROUND_RADIUS.inset} border border-[#c9a030]/50 bg-[#141210] shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(232,200,74,0.08)]`}>
                  <div className="flex items-center justify-between border-b border-[#c9a030]/35 px-4 py-3 md:px-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a030]/75">Interactive prototype</p>
                    <Link
                      href="/code/playground/omikuji"
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f0ddb8]/80 underline decoration-[#c9a030]/35 underline-offset-[4px] transition-colors hover:text-[#fdf6e8] hover:decoration-[#e8c84a]/55"
                    >
                      Open full page
                    </Link>
                  </div>
                  <iframe
                    title="Omikuji Cabinet interactive preview"
                    src="/code/playground/omikuji?embed=1"
                    className="h-[min(66vh,720px)] min-h-[420px] w-full bg-[#060608] md:min-h-[500px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.section>

          </section>

          <section className="mt-20 border-t border-[rgba(0,0,0,0.1)] pt-14 md:pt-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">02</p>
              <h2 id="playground-visual-works" className="mt-2 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Visual works
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary">
                Visual experiments.
              </p>
            </div>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.65, ease: easePortfolio }}
              className="mt-16"
              aria-labelledby="playground-visual-works"
            >
              <VisualWorksCarousel images={visualExperimentImages} mediaRoundClass={PLAYGROUND_RADIUS.media} />
            </motion.section>

          </section>

          <section className="mt-20 border-t border-[rgba(0,0,0,0.1)] pt-14 md:pt-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">03</p>
              <h2 className="mt-2 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Previous work projects
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary">
                Back to New York, when I was an Interior Designer.
              </p>
            </div>

            <motion.section
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.65, ease: easePortfolio }}
              className="mt-16"
              aria-labelledby="playground-project-alessa"
            >
              <header className="mb-10 max-w-2xl md:mb-12">
                <h3
                  id="playground-project-alessa"
                  className="font-display text-2xl font-light text-textPrimary md:text-3xl"
                >
                  Alessa Design
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-textSecondary">
                Alessa is an Italian restaurant located in Midtown Manhattan, New York City. The 4,000 sq. ft. first floor greets you with a 45-foot bar—ideal for networking or winding down with friends. As you move through, each area unfolds with unique features to suit a variety of experiences. Upstairs, the 2,500 sq. ft. mezzanine offers a spacious, open layout perfect for large parties and special events. Every section of this space captures a different vibe, making it a place where every guest can find their ideal spot to relax, celebrate, or connect.
                </p>
              </header>

              <div
                className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-6 sm:gap-3 md:gap-4 lg:grid-cols-12 lg:gap-4"
                role="list"
              >
                {alessaDesignImages.map((image, imageIndex) => (
                  <figure
                    key={image.src}
                    role="listitem"
                    className={`group relative overflow-hidden ${PLAYGROUND_RADIUS.media} transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:z-10 hover:-translate-y-0.5 ${image.gridClass}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 45vw, 520px"
                      priority={imageIndex === 0}
                      className="block h-auto w-full max-w-full"
                    />
                  </figure>
                ))}
              </div>
            </motion.section>
          </section>

          <Link
            href="/#work"
            className="mt-12 inline-block text-sm text-textPrimary underline decoration-[rgba(0,0,0,0.2)] underline-offset-4"
          >
            ← Back to selected work
          </Link>
    </section>
  );
}

export default function PlaygroundPage() {
  return (
    <>
      <Nav />
      <main className="bg-white px-6 pb-20 pt-32 md:pt-40">
        <PlaygroundPageContent />
      </main>
      <Footer />
    </>
  );
}
