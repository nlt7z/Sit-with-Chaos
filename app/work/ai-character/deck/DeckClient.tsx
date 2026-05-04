"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DECK_SLIDES, type Slide } from "./deckSlides";

/** Matches CaseStudyContent.tsx */
const easePremium = [0.16, 1, 0.3, 1] as const;
const mediaRound = "rounded-xl";

const BROADCAST_ID = "xingchen-ai-character-deck-v1";

/** 内容区：在画布中水平居中，块内左对齐（中文阅读） */
const slideShell = "mx-auto w-full max-w-[36rem] text-left md:max-w-[42rem]";

const eyebrowCn = "font-sans text-[11px] font-medium tracking-wide text-textSecondary/90";

function slideHeading(s: Slide): string {
  switch (s.kind) {
    case "title":
      return s.title;
    case "meta":
      return s.title;
    case "statement":
      return s.title;
    case "quote":
      return "核心追问";
    case "threeCards":
      return s.title;
    case "gridMedia":
      return s.title;
    case "innovations":
      return s.title;
    case "media":
      return s.title ?? s.eyebrow ?? "产品展示";
    case "twoVideos":
      return s.title;
    case "outcomes":
      return s.title;
    case "cta":
      return s.title;
  }
}

/** Video frame scales with viewport so controls stay reachable on small screens. */
function DeckVideo({
  src,
  poster,
  label,
  className = "",
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const type = src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
  return (
    <video
      key={src}
      className={`max-h-[min(30svh,240px)] w-full object-contain shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] sm:max-h-[min(40svh,380px)] md:max-h-[min(48svh,480px)] lg:max-h-[min(52vh,540px)] ${mediaRound} ${className}`}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={label}
    >
      <source src={src} type={type} />
    </video>
  );
}

type InnovationsSlide = Extract<Slide, { kind: "innovations" }>;

/** Same disclosure pattern as CaseStudyContent InteractionInnovationList — tap to reveal full workflow SVG. */
function InnovationsDeckSlide({ slide }: { slide: InnovationsSlide }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className={`flex min-h-0 flex-col ${slideShell}`}>
      <p className="font-sans text-[11px] font-medium tracking-wide text-textSecondary/90">{slide.eyebrow}</p>
      <h2 className="mt-3 font-display text-[clamp(1.35rem,4.2vw,2.1rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.4rem,3.5vw,2.35rem)]">
        {slide.title}
      </h2>
      <p className="mt-2 font-sans text-[12px] leading-relaxed text-textSecondary/90 sm:hidden">
        点击卡片，点「<span className="font-medium text-textPrimary/90">展开流程</span>」查看完整大模型流程图；再次点击可收起。
      </p>
      <div className="mt-5 max-h-[min(calc(100svh-11rem),680px)] space-y-3 overflow-y-auto pb-1 sm:mt-7 sm:max-h-[min(calc(100svh-12rem),760px)] sm:space-y-4 sm:pb-2 md:max-h-[min(calc(100svh-12.5rem),820px)]">
        {slide.items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <article
              key={item.id}
              className={`block ${mediaRound} focus-within:ring-2 focus-within:ring-textPrimary focus-within:ring-offset-2`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`deck-workflow-${item.id}`}
                id={`deck-innovation-${item.id}`}
                onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                className="group w-full rounded-xl bg-white px-5 py-6 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_18px_56px_-28px_rgba(0,0,0,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2 sm:px-8 sm:py-8 md:px-10 md:py-9"
              >
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <h3 className="max-w-[18ch] font-display text-[1.15rem] font-light leading-snug tracking-tight text-textPrimary sm:max-w-none sm:text-[1.35rem] md:text-[1.5rem]">
                    {item.name}
                  </h3>
                  <span className="shrink-0 rounded-md border border-black/[0.08] bg-black/[0.02] px-2.5 py-1 font-sans text-[11px] font-medium text-textSecondary sm:text-xs">
                    {isOpen ? "收起" : "展开流程"}
                  </span>
                </div>
                <p className="mt-2.5 font-sans text-[11px] font-medium leading-snug tracking-wide text-textSecondary/90 sm:mt-3 sm:text-xs">
                  {item.capability}
                </p>
                <p className="mt-3 max-w-prose text-[14px] leading-[1.75] text-textSecondary sm:mt-4 sm:text-[15px] md:text-[16px] md:leading-[1.8]">
                  {item.line}
                </p>
                {!isOpen ? (
                  <p className="mt-3 font-sans text-[11px] leading-relaxed text-textSecondary/80 sm:mt-4 sm:text-xs">
                    点击查看完整大模型流程图
                  </p>
                ) : null}
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key={`wf-${item.id}`}
                      id={`deck-workflow-${item.id}`}
                      role="region"
                      aria-labelledby={`deck-innovation-${item.id}`}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: 6 }}
                      transition={{ duration: reduce ? 0.01 : 0.34, ease: easePremium }}
                      className="mt-6 border-t border-black/[0.06] pt-6 sm:mt-8 sm:pt-8"
                    >
                      <p className="mb-3 font-sans text-[11px] font-medium tracking-wide text-textSecondary sm:mb-4 sm:text-xs">
                        大模型流程图
                      </p>
                      <div
                        className={`max-h-[min(42svh,360px)] w-full overflow-auto rounded-lg bg-black/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-black/[0.06] sm:max-h-[min(50svh,440px)] md:max-h-[min(58svh,560px)] lg:rounded-xl ${mediaRound}`}
                      >
                        <img
                          src={item.workflowSrc}
                          alt={item.workflowAlt}
                          className="min-w-[min(100%,520px)] w-full object-contain object-left-top p-2 sm:min-w-[min(100%,640px)] sm:p-3 md:p-4"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <p className="mt-3 font-sans text-[11px] leading-relaxed text-textSecondary/80 sm:mt-4 sm:text-xs">
                        再次点击卡片可收起
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SlideBody({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className="flex min-h-[min(52svh,420px)] flex-col items-center justify-center px-3 sm:min-h-[min(60svh,520px)] md:min-h-[min(68svh,600px)] lg:min-h-[min(72vh,640px)]">
          <div className={`${slideShell} flex flex-col`}>
            <p className={eyebrowCn}>{slide.eyebrow}</p>
            <h1 className="mt-5 font-display text-[clamp(1.5rem,6.2vw,2.85rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-6 md:text-[clamp(1.65rem,5vw,3.25rem)]">
              {slide.title}
            </h1>
            <p className="mt-5 font-sans text-[15px] leading-[1.75] text-textSecondary sm:mt-6 sm:text-[16px] md:text-lg md:leading-[1.8]">
              {slide.subtitle}
            </p>
            <p className="mt-5 font-sans text-[12px] font-medium tracking-wide text-textPrimary/85 sm:mt-6 sm:text-[13px]">
              {slide.kicker}
            </p>
          </div>
        </div>
      );
    case "meta":
      return (
        <div className={slideShell}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.3rem,3.8vw,2.15rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.4rem,3.2vw,2.5rem)]">
            {slide.title}
          </h2>
          <dl className="mt-8 grid gap-x-8 gap-y-6 sm:mt-10 sm:grid-cols-2 sm:gap-y-8 md:mt-11">
            {slide.fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="font-sans text-[11px] font-medium tracking-wide text-textSecondary/90">{label}</dt>
                <dd className="mt-1.5 font-sans text-[14px] leading-relaxed text-textPrimary sm:mt-2 sm:text-[15px]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "statement":
      return (
        <div className={slideShell}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.25rem,3.8vw,2.1rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,3.2vw,2.5rem)]">
            {slide.title}
          </h2>
          <p className="mt-5 font-sans text-[15px] leading-[1.8] text-textSecondary sm:mt-7 sm:text-[16px] md:text-[17px] md:leading-[1.85]">
            {slide.body}
          </p>
        </div>
      );
    case "quote":
      return (
        <div className="flex min-h-[min(44svh,380px)] flex-col items-center justify-center py-4 sm:min-h-[min(52svh,460px)] md:min-h-[min(56vh,520px)]">
          <blockquote
            className={`${slideShell} font-display text-[clamp(1.1rem,4.2vw,1.85rem)] font-light not-italic leading-[1.65] tracking-tight text-textPrimary sm:text-[clamp(1.2rem,3.5vw,2.1rem)] md:leading-snug`}
          >
            {slide.quote}
          </blockquote>
        </div>
      );
    case "threeCards":
      return (
        <div className={slideShell}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.25rem,3.5vw,2rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,2.8vw,2.35rem)]">
            {slide.title}
          </h2>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3 md:gap-6">
            {slide.cards.map((c) => (
              <div
                key={c.n}
                className="rounded-xl bg-white/90 px-5 py-6 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] sm:px-6 sm:py-8 md:px-7 md:py-9"
              >
                <p className="font-sans text-[11px] font-medium tabular-nums tracking-wide text-textSecondary/90">{c.n}</p>
                <p className="mt-2.5 font-display text-[1.05rem] font-light leading-snug tracking-tight text-textPrimary sm:mt-3 sm:text-lg md:text-xl">
                  {c.title}
                </p>
                <p className="mt-2.5 font-sans text-[13px] leading-[1.75] text-textSecondary sm:mt-3 sm:text-[14px]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "gridMedia":
      return (
        <div className={`${slideShell} max-w-[40rem] md:max-w-[48rem]`}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.25rem,3.5vw,2rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,2.8vw,2.35rem)]">
            {slide.title}
          </h2>
          <div
            className={`mt-8 grid gap-4 text-left sm:mt-10 sm:gap-5 md:gap-6 ${
              slide.items.length === 1
                ? "mx-auto w-full max-w-3xl"
                : slide.items.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
            }`}
          >
            {slide.items.map((item) => (
              <div
                key={item.src}
                className={`relative max-h-[min(38svh,320px)] overflow-hidden bg-black/[0.02] shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] sm:max-h-[min(46svh,400px)] md:max-h-none ${mediaRound}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`h-auto w-full object-contain object-center ${mediaRound}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "innovations":
      return <InnovationsDeckSlide slide={slide} />;
    case "media":
      return (
        <div className={`${slideShell} max-w-[40rem] md:max-w-[48rem]`}>
          {slide.eyebrow ? <p className={eyebrowCn}>{slide.eyebrow}</p> : null}
          {slide.title ? (
            <h2 className="mt-3 font-display text-[clamp(1.25rem,3.5vw,2rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,2.8vw,2.35rem)]">
              {slide.title}
            </h2>
          ) : null}
          <div className="mt-6 flex w-full justify-center sm:mt-8">
            {slide.media === "video" ? (
              <DeckVideo src={slide.src} poster={slide.poster} label={slide.alt} className="w-full max-w-4xl" />
            ) : (
              <div
                className={`relative max-h-[min(34svh,280px)] w-full max-w-4xl overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] sm:max-h-[min(44svh,400px)] md:max-h-[min(52vh,540px)] ${mediaRound}`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className={`h-full w-full object-contain ${mediaRound}`}
                  loading="lazy"
                />
              </div>
            )}
          </div>
          {slide.caption ? (
            <p className="mt-3 max-w-3xl font-sans text-[13px] leading-relaxed text-textSecondary sm:mt-4 sm:text-[14px]">
              {slide.caption}
            </p>
          ) : null}
        </div>
      );
    case "twoVideos":
      return (
        <div className={`${slideShell} max-w-[40rem] md:max-w-[48rem]`}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.25rem,3.5vw,2rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,2.8vw,2.35rem)]">
            {slide.title}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 md:grid-cols-2">
            <figure className="min-w-0 text-left">
              <DeckVideo src={slide.left.src} poster={slide.left.poster} label={slide.left.alt} />
              <figcaption className="mt-2 font-sans text-[11px] leading-snug text-textSecondary sm:text-[12px]">
                {slide.left.caption}
              </figcaption>
            </figure>
            <figure className="min-w-0 text-left">
              <DeckVideo src={slide.right.src} poster={slide.right.poster} label={slide.right.alt} />
              <figcaption className="mt-2 font-sans text-[11px] leading-snug text-textSecondary sm:text-[12px]">
                {slide.right.caption}
              </figcaption>
            </figure>
          </div>
        </div>
      );
    case "outcomes":
      return (
        <div className={slideShell}>
          <p className={eyebrowCn}>{slide.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(1.25rem,3.5vw,2rem)] font-light leading-snug tracking-tight text-textPrimary sm:mt-4 md:text-[clamp(1.35rem,2.8vw,2.35rem)]">
            {slide.title}
          </h2>
          <ul className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
            {slide.items.map((item) => (
              <li key={item.label}>
                <p className="font-sans text-[11px] font-semibold tracking-wide text-textSecondary/90 sm:text-xs">{item.label}</p>
                <p className="mt-1.5 font-sans text-[15px] leading-relaxed text-textPrimary/90 sm:mt-2 sm:text-[16px] md:text-[17px]">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      );
    case "cta":
      return (
        <div className="mx-auto grid w-full max-w-[40rem] gap-8 text-left sm:gap-10 md:max-w-[48rem] lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start lg:gap-12 xl:grid-cols-[1fr_minmax(0,320px)]">
          <div className="min-w-0">
            <h2 className="font-display text-[clamp(1.25rem,3.6vw,1.95rem)] font-light leading-snug tracking-tight text-textPrimary md:text-[clamp(1.35rem,3vw,2.1rem)]">
              {slide.title}
            </h2>
            <p className="mt-5 font-sans text-[15px] leading-[1.8] text-textSecondary sm:mt-6 sm:text-[16px] md:text-[17px]">
              {slide.body}
            </p>
            <a
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 border-b border-textPrimary/25 pb-0.5 font-sans text-sm font-medium text-textPrimary transition-colors hover:border-textPrimary/50 sm:mt-10"
            >
              {slide.linkLabel}
              <span aria-hidden className="text-xs opacity-70">
                ↗
              </span>
            </a>
            <div className="mt-10 sm:mt-12">
              <Link
                href="/work/ai-character"
                className="font-sans text-[14px] text-textSecondary underline decoration-black/15 underline-offset-[5px] transition-colors hover:text-textPrimary"
              >
                ← 返回案例长文
              </Link>
            </div>
          </div>
          {slide.imageSrc ? (
            <div
              className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] lg:mx-0 lg:max-w-none ${mediaRound}`}
            >
              <Image src={slide.imageSrc} alt={slide.imageAlt ?? ""} fill className="object-cover" sizes="320px" />
            </div>
          ) : null}
        </div>
      );
    default:
      return null;
  }
}

export default function DeckClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isSpeaker = searchParams.get("speaker") === "1";
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const total = DECK_SLIDES.length;
  const slide = DECK_SLIDES[index];
  const nextSlide = index < total - 1 ? DECK_SLIDES[index + 1] : null;

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const ch = new BroadcastChannel(BROADCAST_ID);
    channelRef.current = ch;
    ch.onmessage = (e: MessageEvent<{ type?: string; index?: number }>) => {
      if (e.data?.type !== "slide" || typeof e.data.index !== "number") return;
      const next = Math.max(0, Math.min(total - 1, e.data.index));
      setIndex(next);
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [total]);

  const broadcast = useCallback((i: number) => {
    channelRef.current?.postMessage({ type: "slide", index: i });
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setIndex((prev) => {
        const clamped = Math.max(0, Math.min(total - 1, target));
        if (clamped !== prev) broadcast(clamped);
        return clamped;
      });
    },
    [broadcast, total],
  );

  const prev = useCallback(() => {
    setIndex((i) => {
      const n = Math.max(0, i - 1);
      if (n !== i) broadcast(n);
      return n;
    });
  }, [broadcast]);

  const next = useCallback(() => {
    setIndex((i) => {
      const n = Math.min(total - 1, i + 1);
      if (n !== i) broadcast(n);
      return n;
    });
  }, [broadcast, total]);

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
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, next, prev, total]);

  const openSpeaker = () => {
    const url = `${window.location.origin}${pathname}?speaker=1`;
    window.open(url, "xingchen-deck-speaker", "width=560,height=780,noopener,noreferrer");
  };

  const enterFullscreen = async () => {
    const el = shellRef.current;
    if (!el?.requestFullscreen) return;
    try {
      await el.requestFullscreen();
    } catch {
      /* ignore */
    }
  };

  const dur = reduce ? 0.01 : 0.52;
  const ease = easePremium;

  return (
    <div
      ref={shellRef}
      lang="zh-Hans"
      className="relative flex min-h-screen flex-col bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(29,29,31,0.045),transparent_55%),linear-gradient(180deg,#fff_0%,#f7f7f8_100%)] text-textPrimary"
    >
      <div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full bg-black/[0.06]"
        aria-hidden
      >
        <motion.div
          className="h-full bg-textPrimary/90"
          initial={false}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.45, ease }}
        />
      </div>

      <header className="relative z-40 flex shrink-0 items-center justify-between gap-4 border-b border-black/[0.06] bg-white/80 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/work/ai-character"
            className="shrink-0 font-sans text-[12px] font-medium text-textSecondary transition-colors hover:text-textPrimary"
          >
            ← 案例长文
          </Link>
          <span className="hidden font-sans text-[11px] tracking-wide text-textSecondary/75 sm:inline">
            {isSpeaker ? "讲者提示" : "演示"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isSpeaker ? (
            <button
              type="button"
              onClick={openSpeaker}
              className="inline-flex rounded-full border border-black/[0.08] bg-white px-3 py-1.5 font-sans text-[11px] font-medium text-textPrimary shadow-sm transition-[box-shadow,transform] hover:shadow-md"
            >
              讲者
            </button>
          ) : null}
          {!isSpeaker ? (
            <button
              type="button"
              onClick={enterFullscreen}
              className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 font-sans text-[11px] font-medium text-textPrimary shadow-sm transition-[box-shadow,transform] hover:shadow-md"
            >
              全屏
            </button>
          ) : null}
          <span className="font-sans text-[11px] tabular-nums text-textSecondary">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {!isSpeaker ? (
        <>
          <button
            type="button"
            aria-label="上一张幻灯片"
            onClick={prev}
            disabled={index === 0}
            className="fixed bottom-0 left-0 top-14 z-30 hidden w-[min(12%,7rem)] cursor-pointer disabled:cursor-default disabled:opacity-0 md:block"
          />
          <button
            type="button"
            aria-label="下一张幻灯片"
            onClick={next}
            disabled={index === total - 1}
            className="fixed bottom-0 right-0 top-14 z-30 hidden w-[min(12%,7rem)] cursor-pointer disabled:cursor-default disabled:opacity-0 md:block"
          />
        </>
      ) : null}

      <main className="relative z-10 flex min-h-0 flex-1 flex-col">
        {isSpeaker ? (
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 text-left md:px-8 md:py-10">
            <p className="font-sans text-[11px] font-medium tracking-wide text-textSecondary/90">
              第 {index + 1} 页 · 讲者提示
            </p>
            <h1 className="mt-3 font-display text-2xl font-light leading-snug tracking-tight text-textPrimary md:text-3xl">
              {slideHeading(slide)}
            </h1>
            {slide.kind === "quote" ? (
              <p className="mt-2 font-sans text-sm leading-relaxed text-textSecondary/90">
                「{(slide as Extract<Slide, { kind: "quote" }>).quote}」
              </p>
            ) : null}
            <div
              className="mt-8 flex-1 overflow-y-auto rounded-xl border border-black/[0.06] bg-white/90 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-8"
              role="region"
              aria-label="讲者提示全文"
            >
              <p className="font-sans text-[16px] leading-[1.85] text-textSecondary md:text-[17px]">{slide.speakerNotes}</p>
            </div>
            {nextSlide ? (
              <p className="mt-6 border-t border-black/[0.06] pt-4 font-sans text-[11px] tracking-wide text-textSecondary/90">
                下一页 · {slideHeading(nextSlide)}
              </p>
            ) : (
              <p className="mt-6 font-sans text-[11px] tracking-wide text-textSecondary/90">演示结束</p>
            )}
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-28 pt-6 md:px-12 md:pb-32 md:pt-10">
            <p
              className="pointer-events-none absolute right-6 top-6 font-mono text-[10px] uppercase tracking-[0.24em] text-textSecondary/50 md:right-10"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <div
              className="relative mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-y-auto overflow-x-hidden"
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -18 }}
                  transition={{ duration: dur, ease }}
                >
                  <SlideBody slide={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/90 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="shrink-0 rounded-full border border-black/[0.1] bg-white px-3 py-2 font-sans text-[12px] font-medium text-textPrimary transition-opacity disabled:opacity-35 sm:px-4"
          >
            ← 上一张
          </button>
          <p className="hidden min-w-0 flex-1 truncate px-2 text-left text-[12px] leading-snug text-textSecondary sm:block">
            {slideHeading(slide)}
          </p>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="shrink-0 rounded-full border border-black/[0.1] bg-white px-3 py-2 font-sans text-[12px] font-medium text-textPrimary transition-opacity disabled:opacity-35 sm:px-4"
          >
            下一张 →
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-center font-sans text-[10px] leading-relaxed tracking-wide text-textSecondary/65">
          键盘：← → 空格 · Home / End
          {!isSpeaker ? " · 讲者窗口与主窗口同步" : " · 已与主演示窗口同步"}
        </p>
      </footer>
    </div>
  );
}
