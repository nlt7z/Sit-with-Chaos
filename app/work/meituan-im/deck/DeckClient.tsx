"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DECK_SLIDES, DECK_SLIDES_SIMPLE, type Slide } from "./deckSlides";

const ease = [0.25, 0.1, 0.25, 1] as const;

const theme = {
  bg: "bg-[#FBFBFD]",
  label: "text-[#1D1D1F]",
  secondary: "text-[#6E6E73]",
  tertiary: "text-[#86868B]",
} as const;

function heading(slide: Slide): string {
  if (slide.kind === "quote") return "引言";
  if (slide.kind === "cta") return slide.title;
  if (slide.kind === "media") return slide.title ?? slide.eyebrow ?? "图示";
  return slide.title;
}

function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={`${part}-${index}`} className="font-medium text-black">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

/** 与案例长文 PhoneFrame 一致：圆角机身 + 内屏；外框比例 7∶12（宽∶高） */
function DeckPhoneFrame({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      {label ? (
        <p className="mb-3 w-full text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#86868B]">{label}</p>
      ) : null}
      <div
        className="mx-auto w-[200px] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)] sm:w-[210px] md:w-full md:max-w-[200px] lg:max-w-[220px]"
        style={{ aspectRatio: "7 / 12" }}
      >
        <div className="flex h-full w-full flex-col rounded-[2rem] bg-gradient-to-b from-black/[0.04] to-black/[0.08] p-[3px]">
          <div className="min-h-0 flex-1 overflow-hidden rounded-[1.8125rem] border border-black/[0.06] bg-white shadow-inner">
            <img src={src} alt={alt} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  const shell = "mx-auto w-full max-w-[38rem] text-left";
  const titleClass = "font-display text-[clamp(1.35rem,3.5vw,2.4rem)] font-light leading-[1.15] tracking-[-0.03em]";

  switch (slide.kind) {
    case "title":
      return (
        <div className={`${shell} py-10 md:py-14`}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h1 className={`mt-6 font-display text-[clamp(2rem,5.5vw,3.6rem)] font-light leading-[1.04] tracking-[-0.035em] ${theme.label}`}>
            {slide.title}
          </h1>
          <p className={`mt-6 text-[1.05rem] ${theme.secondary}`}>{slide.kicker}</p>
          <p className={`mt-8 text-[15px] leading-[1.75] ${theme.secondary}`}>{slide.subtitle}</p>
        </div>
      );
    case "meta":
      return (
        <div className={shell}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2>
          <dl className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2">
            {slide.fields.map((field) => (
              <div key={field.label}>
                <dt className={`text-[10px] uppercase tracking-[0.18em] ${theme.tertiary}`}>{field.label}</dt>
                <dd className={`mt-2 text-[15px] ${theme.label}`}>{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "statement":
      return (
        <div className={shell}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2>
          <p className={`mt-8 text-[15px] leading-[1.75] ${theme.secondary}`}>
            <RichText>{slide.body}</RichText>
          </p>
        </div>
      );
    case "quote":
      return (
        <blockquote className="mx-auto max-w-[42rem] text-left font-display text-[clamp(1.3rem,3.2vw,2.2rem)] font-light leading-[1.5] tracking-[-0.03em] text-[#1D1D1F]">
          {slide.quote}
        </blockquote>
      );
    case "threeCards":
      return (
        <div className={shell}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2>
          <div className="mt-10 space-y-10">
            {slide.cards.map((card) => (
              <div key={card.n}>
                <p className={`text-[11px] tracking-[0.12em] ${theme.tertiary}`}>{card.n}</p>
                <p className={`mt-3 text-[1.3rem] font-light tracking-[-0.02em] ${theme.label}`}>{card.title}</p>
                <p className={`mt-3 text-[15px] leading-[1.7] ${theme.secondary}`}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "gridMedia": {
      const row = slide.layout === "row" && slide.phoneFrame && slide.items.length === 3;
      const gridShell = row ? "mx-auto w-full max-w-[min(100%,72rem)] text-left px-1" : shell;
      return (
        <div className={gridShell}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2>
          {row ? (
            <p className={`mt-3 font-mono text-[10px] uppercase tracking-[0.16em] ${theme.tertiary}`}>设备外框比例 · 07 / 12</p>
          ) : null}
          <div
            className={
              row
                ? "mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
                : "mt-10 space-y-8"
            }
          >
            {row
              ? slide.items.map((item) => (
                  <div key={item.src} className="shrink-0 snap-center first:pl-1 last:pr-1 md:first:pl-0 md:last:pr-0">
                    <DeckPhoneFrame src={item.src} alt={item.alt} label={item.label} />
                  </div>
                ))
              : slide.items.map((item) => (
                  <img key={item.src} src={item.src} alt={item.alt} className="w-full rounded-2xl object-contain" />
                ))}
          </div>
        </div>
      );
    }
    case "media":
      return (
        <div className={shell}>
          {slide.eyebrow ? <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p> : null}
          {slide.title ? <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2> : null}
          <div className="mt-10">
            {slide.media === "video" ? (
              <video className="w-full rounded-2xl" controls playsInline preload="metadata" poster={slide.poster}>
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <img src={slide.src} alt={slide.alt} className="w-full rounded-2xl object-contain" />
            )}
          </div>
          {slide.caption ? <p className={`mt-5 text-[13px] ${theme.secondary}`}>{slide.caption}</p> : null}
        </div>
      );
    case "outcomes":
      return (
        <div className={shell}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${theme.tertiary}`}>{slide.eyebrow}</p>
          <h2 className={`${titleClass} mt-5 ${theme.label}`}>{slide.title}</h2>
          <ul className="mt-10 space-y-7">
            {slide.items.map((item) => (
              <li key={item.label}>
                <p className={`text-[10px] uppercase tracking-[0.18em] ${theme.tertiary}`}>{item.label}</p>
                <p className={`mt-2 text-[15px] leading-[1.7] ${theme.secondary}`}>
                  <RichText>{item.text}</RichText>
                </p>
              </li>
            ))}
          </ul>
        </div>
      );
    case "cta":
      return (
        <div className={shell}>
          <h2 className={`${titleClass} ${theme.label}`}>{slide.title}</h2>
          <p className={`mt-8 text-[15px] leading-[1.75] ${theme.secondary}`}>
            <RichText>{slide.body}</RichText>
          </p>
          <Link href={slide.href} className="mt-10 inline-flex text-[15px] text-violet-600 transition-colors hover:text-violet-800">
            {slide.linkLabel} →
          </Link>
          {slide.imageSrc ? (
            <div className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image src={slide.imageSrc} alt={slide.imageAlt ?? ""} fill className="object-cover" />
            </div>
          ) : null}
        </div>
      );
  }
}

export default function DeckClient() {
  const searchParams = useSearchParams();
  const simpleMode = searchParams.get("simple") === "1";
  const slides = useMemo(() => (simpleMode ? DECK_SLIDES_SIMPLE : DECK_SLIDES), [simpleMode]);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [simpleMode]);

  const total = slides.length;
  const current = slides[index];

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        prev();
      }
      if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        setIndex(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  return (
    <div lang="zh-Hans" className={`flex min-h-screen flex-col ${theme.bg} ${theme.label}`}>
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/85 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <Link href="/work/meituan-im" className="text-[13px] text-violet-600 hover:text-violet-800">
            ← 案例长文
          </Link>
          <p className={`text-[12px] ${theme.tertiary}`}>{simpleMode ? "演示 · 精简版" : "演示 · 完整版"}</p>
          <p className={`text-[12px] tabular-nums ${theme.tertiary}`}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden px-6 pb-28 pt-8 md:px-12 md:pt-12">
        <p className={`mx-auto w-full max-w-[38rem] text-right text-[11px] tracking-[0.12em] ${theme.tertiary}`}>{heading(current)}</p>
        <div className="mx-auto mt-5 flex w-full max-w-[76rem] flex-1 items-center justify-center overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0.01 : 0.55, ease }}
              className="w-full py-10 md:py-16"
            >
              <SlideContent slide={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-black/[0.06] bg-white/85 px-5 py-4 backdrop-blur-xl md:px-10">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="rounded-full px-4 py-2 text-[13px] hover:bg-violet-500/[0.07] disabled:opacity-30"
          >
            ← 上一张
          </button>
          <p className={`hidden text-[12px] sm:block ${theme.tertiary}`}>键盘：← → 空格 Home End</p>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="rounded-full px-4 py-2 text-[13px] hover:bg-violet-500/[0.07] disabled:opacity-30"
          >
            下一张 →
          </button>
        </div>
      </footer>
    </div>
  );
}
