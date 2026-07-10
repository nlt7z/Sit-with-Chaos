"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DECK_SLIDES, type Slide } from "./deckSlides";

const ease = [0.25, 0.1, 0.25, 1] as const;

// Uber Base · light tokens
const UB = {
  bg: "#F6F6F6",
  surface: "#FFFFFF",
  ink: "#000000",
  inkLight: "#545454",
  muted: "#757575",
  hairline: "#E2E2E2",
} as const;

const FONT =
  'var(--font-manrope), -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

function sectionLabel(slide: Slide): string {
  switch (slide.kind) {
    case "title":
      return "封面";
    case "meta":
      return "快照";
    case "quote":
      return "洞察";
    case "loop":
      return "双边循环";
    case "cta":
      return "结束";
    default:
      return slide.eyebrow;
  }
}

function SlideBody({ slide }: { slide: Slide }) {
  const shell = "w-full max-w-[46rem]";
  const eyebrowCls = "font-mono text-[11px] uppercase tracking-[0.18em] text-[#757575]";
  const titleCls =
    "font-[650] leading-[1.08] tracking-[-0.02em] text-black text-[clamp(1.6rem,4.2vw,2.9rem)]";

  switch (slide.kind) {
    case "title":
      return (
        <div className={shell}>
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h1 className="mt-7 font-[750] leading-[0.98] tracking-[-0.035em] text-black text-[clamp(2.6rem,7vw,5rem)]">
            {slide.title}
          </h1>
          <p className="mt-7 text-[clamp(1.05rem,2.4vw,1.45rem)] font-medium tracking-[-0.01em] text-black">
            {slide.kicker}
          </p>
          <p className="mt-6 max-w-[38rem] text-[15px] leading-[1.75] text-[#545454]">{slide.subtitle}</p>
        </div>
      );

    case "meta":
      return (
        <div className={shell}>
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h2 className={`mt-5 ${titleCls}`}>{slide.title}</h2>
          <dl className="mt-11 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {slide.fields.map((f) => (
              <div key={f.label} className="border-t border-[#E2E2E2] pt-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#757575]">{f.label}</dt>
                <dd className="mt-2 text-[16px] font-medium text-black">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case "statement":
      return (
        <div className={shell}>
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h2 className={`mt-5 ${titleCls}`}>{slide.title}</h2>
          <p className="mt-8 max-w-[42rem] text-[clamp(15px,1.9vw,17px)] leading-[1.8] text-[#545454]">
            {slide.body}
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="w-full max-w-[52rem]">
          <span className="block font-[750] leading-[0.9] tracking-[-0.04em] text-black text-[clamp(3rem,9vw,6rem)]">
            &ldquo;
          </span>
          <blockquote className="-mt-4 font-[650] leading-[1.28] tracking-[-0.025em] text-black text-[clamp(1.6rem,4.2vw,3rem)]">
            {slide.quote}
          </blockquote>
        </div>
      );

    case "cards":
      return (
        <div className="w-full max-w-[64rem]">
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h2 className={`mt-5 ${titleCls}`}>{slide.title}</h2>
          <div
            className={`mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
              slide.cards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {slide.cards.map((c) => (
              <div key={c.n} className="flex flex-col rounded-2xl border border-[#E2E2E2] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] tracking-[0.06em] text-[#757575]">{c.n}</span>
                  {c.tag ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] ${
                        c.tag === "P0" ? "bg-black text-white" : "border border-[#E2E2E2] text-[#545454]"
                      }`}
                    >
                      {c.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-[16px] font-semibold leading-[1.25] tracking-[-0.01em] text-black">
                  {c.title}
                </p>
                <p className="mt-2.5 text-[13.5px] leading-[1.6] text-[#545454]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "loop":
      return (
        <div className="w-full max-w-[70rem]">
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h2 className={`mt-5 ${titleCls}`}>{slide.title}</h2>
          <p className="mt-6 max-w-[46rem] text-[14.5px] leading-[1.7] text-[#545454]">{slide.intro}</p>
          <div className="mt-9 flex flex-col gap-2 md:flex-row md:items-stretch">
            {slide.steps.map((s, i) => (
              <div key={s.title} className="flex flex-1 items-stretch gap-2">
                <div className="flex flex-1 flex-col rounded-2xl border border-[#E2E2E2] bg-white p-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.07em] text-[#757575]">{s.role}</span>
                  <span className="mt-2.5 text-[16px] font-semibold tracking-[-0.01em] text-black">{s.title}</span>
                  <span className="mt-1.5 text-[12.5px] leading-[1.5] text-[#545454]">{s.desc}</span>
                </div>
                {i < slide.steps.length - 1 ? (
                  <span className="hidden items-center text-[#AFAFAF] md:flex">→</span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#E2E2E2] py-3 font-mono text-[12px] text-[#757575]">
            <span className="text-[15px] text-[#545454]">↻</span>
            {slide.close}
          </div>
        </div>
      );

    case "outcomes":
      return (
        <div className={shell}>
          <p className={eyebrowCls}>{slide.eyebrow}</p>
          <h2 className={`mt-5 ${titleCls}`}>{slide.title}</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {slide.items.map((it) => (
              <div key={it.label} className="border-t border-black pt-4">
                <p className="text-[16px] font-semibold tracking-[-0.01em] text-black">{it.label}</p>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[#545454]">{it.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-9 max-w-[44rem] text-[13.5px] leading-[1.7] text-[#757575]">{slide.note}</p>
        </div>
      );

    case "cta":
      return (
        <div className={shell}>
          <h2 className="font-[750] leading-[1.02] tracking-[-0.03em] text-black text-[clamp(2.2rem,6vw,4rem)]">
            {slide.title}
          </h2>
          <p className="mt-7 max-w-[38rem] text-[16px] leading-[1.75] text-[#545454]">{slide.body}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {slide.links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={`inline-flex items-center rounded-full px-6 py-3 text-[14px] font-medium transition-colors ${
                  i === 0
                    ? "bg-black text-white hover:bg-[#1F1F1F]"
                    : "border border-[#E2E2E2] text-black hover:bg-[#F0F0F0]"
                }`}
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      );
  }
}

export default function DeckClient() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slides = DECK_SLIDES;
  const total = slides.length;
  const current = slides[index];

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: UB.bg, color: UB.ink, fontFamily: FONT }}>
      <header className="sticky top-0 z-20 border-b border-[#E2E2E2] bg-[#F6F6F6]/85 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <Link href="/work/tiktok" className="text-[13px] font-medium text-black hover:text-[#545454]">
            ← 案例长文
          </Link>
          <p className="hidden text-[12px] tracking-[0.04em] text-[#757575] sm:block">Shared with You · Deck</p>
          <p className="text-[12px] tabular-nums text-[#757575]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col px-6 pb-28 pt-6 md:px-12">
        <p className="mx-auto w-full max-w-[70rem] text-right font-mono text-[11px] tracking-[0.12em] text-[#757575]">
          {sectionLabel(current)}
        </p>
        <div className="mx-auto flex w-full max-w-[76rem] flex-1 items-center justify-center overflow-y-auto py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: reduce ? 0.01 : 0.5, ease }}
              className="flex w-full justify-center"
            >
              <SlideBody slide={current} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* progress ticks */}
        <div className="mx-auto flex w-full max-w-[70rem] items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`第 ${i + 1} 张`}
              onClick={() => setIndex(i)}
              className="h-[3px] flex-1 rounded-full transition-colors"
              style={{ background: i <= index ? UB.ink : UB.hairline }}
            />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#E2E2E2] bg-[#F6F6F6]/85 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="rounded-full px-4 py-2 text-[13px] font-medium hover:bg-black/[0.05] disabled:opacity-30"
          >
            ← 上一张
          </button>
          <p className="hidden text-[12px] text-[#757575] sm:block">← → 空格 · Home / End</p>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="rounded-full bg-black px-5 py-2 text-[13px] font-medium text-white hover:bg-[#1F1F1F] disabled:opacity-30"
          >
            下一张 →
          </button>
        </div>
      </footer>
    </div>
  );
}
