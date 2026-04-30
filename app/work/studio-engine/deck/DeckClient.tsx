"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DECK_SLIDES, DECK_SLIDES_SIMPLE, type Slide } from "./deckSlides";

/** Smooth deceleration — reads closer to apple.com product pages */
const easeApple = [0.25, 0.1, 0.25, 1] as const;
const easePremium = easeApple;
const mediaRound = "rounded-2xl";

const BROADCAST_ID = "studio-engine-deck-v1";

/** Light surfaces, muted body, minimal chrome — airy hierarchy */
const theme = {
  bg: "bg-[#FBFBFD]",
  label: "text-[#1D1D1F]",
  secondary: "text-[#6E6E73]",
  tertiary: "text-[#86868B]",
  accent: "text-violet-600",
  accentHover: "hover:text-violet-800",
  separator: "border-black/[0.06]",
  chrome: "border-black/[0.06] bg-white/80 backdrop-blur-xl",
  dotPattern:
    "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.035)_1px,transparent_1.5px)] [background-size:28px_28px]",
  mediaRing: "shadow-[0_4px_32px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04]",
} as const;

const SLIDE_MAX = "max-w-[36rem] md:max-w-[38rem]";
const SLIDE_MAX_PROTOTYPE = "max-w-[min(100%,68rem)] md:max-w-[72rem]";
const slideShell = `mx-auto w-full ${SLIDE_MAX} text-left font-sans`;
const slideShellMedia = `mx-auto flex w-full ${SLIDE_MAX} flex-col items-start text-left font-sans`;
const slideShellPrototype = `mx-auto flex w-full ${SLIDE_MAX_PROTOTYPE} flex-col items-start text-left font-sans`;

const space = {
  afterEyebrow: "mt-4 sm:mt-5",
  afterTitle: "mt-6 sm:mt-8",
  afterTitleLg: "mt-6 sm:mt-8",
  body: "mt-8 sm:mt-10",
  section: "mt-10 sm:mt-12",
  stack: "gap-10 sm:gap-12",
  motionPad: "py-10 md:py-14 lg:py-16",
} as const;

const titleLg = `font-display font-light tracking-[-0.03em] ${theme.label}`;
const bodyProse = `w-full font-sans text-[15px] font-normal leading-[1.65] text-[#6E6E73] md:text-[16px] md:leading-[1.7]`;

function DotPattern({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 opacity-[0.14] ${theme.dotPattern} ${className}`}
      aria-hidden
    />
  );
}

function DeckRichLine({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-black">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function DeckSmallRich({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-black">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return (
          <span key={i} className="text-[#86868B]">
            {part}
          </span>
        );
      })}
    </>
  );
}

function EyebrowText({ text }: { text: string }) {
  return (
    <p className="font-sans text-[10px] font-normal uppercase tracking-[0.18em] leading-relaxed [&_strong]:normal-case">
      <DeckSmallRich>{text}</DeckSmallRich>
    </p>
  );
}

function slideHeading(s: Slide): string {
  switch (s.kind) {
    case "title":
      return s.title;
    case "meta":
      return s.title;
    case "statement":
      return s.title;
    case "quote":
      return "引言";
    case "threeCards":
      return s.title;
    case "gridMedia":
      return s.title;
    case "innovations":
      return s.title;
    case "media":
      return s.title ?? s.eyebrow ?? "图示";
    case "prototype":
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
      className={`mx-auto max-h-[min(40svh,340px)] w-full object-contain object-left sm:max-h-[min(48svh,460px)] md:max-h-[min(56svh,540px)] lg:max-h-[min(64vh,680px)] xl:max-h-[min(68vh,720px)] ${mediaRound} ${className}`}
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

/** 交互项：列左对齐；展开流程图全宽 */
function InnovationsDeckSlide({ slide }: { slide: InnovationsSlide }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className={`flex min-h-0 w-full flex-col ${slideShell}`}>
      <EyebrowText text={slide.eyebrow} />
      <h2
        className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.35rem,4vw,2.25rem)] leading-[1.15] md:text-[clamp(1.5rem,3.2vw,2.5rem)]`}
      >
        {slide.title}
      </h2>
      <p className={`mt-3 max-w-xl font-sans text-[12px] font-normal leading-relaxed sm:hidden ${theme.tertiary}`}>
        点击标题区域展开流程图；再次点击收起。
      </p>
      <div className={`${space.section} w-full overflow-y-auto pb-4 md:max-h-[min(calc(100svh-12rem),880px)]`}>
        {slide.items.map((item, i) => {
          const isOpen = openId === item.id;
          return (
            <article
              key={item.id}
              className={`w-full ${i > 0 ? `border-t ${theme.separator} pt-10 sm:pt-12` : ""}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`deck-workflow-${item.id}`}
                id={`deck-innovation-${item.id}`}
                onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                className={`group w-full rounded-xl bg-transparent text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFBFD]`}
              >
                <h3
                  className={`font-display text-[1.25rem] font-light leading-snug tracking-[-0.02em] sm:text-[1.4rem] md:text-[1.55rem] ${theme.label}`}
                >
                  {item.name}
                  <span className={`ml-2 font-sans text-[11px] font-normal tracking-normal ${theme.tertiary}`}>
                    {isOpen ? " · 收起" : " · 展开流程"}
                  </span>
                </h3>
                <p className="mt-2 font-sans text-[12px] font-normal tracking-wide">
                  <DeckSmallRich>{item.capability}</DeckSmallRich>
                </p>
                <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] md:text-base">
                  <DeckSmallRich>{item.line}</DeckSmallRich>
                </p>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key={`wf-${item.id}`}
                      id={`deck-workflow-${item.id}`}
                      role="region"
                      aria-labelledby={`deck-innovation-${item.id}`}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: 4 }}
                      transition={{ duration: reduce ? 0.01 : 0.45, ease: easeApple }}
                      className="mt-10 w-full"
                    >
                      <p className={`mb-4 font-sans text-[10px] font-normal uppercase tracking-[0.16em] ${theme.tertiary}`}>流程图</p>
                      <div
                        className={`max-h-[min(52svh,480px)] w-full overflow-auto sm:max-h-[min(58svh,560px)] md:max-h-[min(64svh,640px)] lg:max-h-[min(72vh,720px)] ${mediaRound}`}
                      >
                        <img
                          src={item.workflowSrc}
                          alt={item.workflowAlt}
                          className="mx-auto min-w-0 w-full object-contain p-1"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
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
        <div className="relative flex min-h-[min(58svh,520px)] flex-col items-center justify-center px-5 sm:min-h-[min(62svh,580px)] md:min-h-[min(68svh,640px)]">
          <DotPattern />
          <div className={`relative flex w-full flex-col justify-center py-10 md:py-12 ${slideShell}`}>
            <EyebrowText text={slide.eyebrow} />
            <h1
              className={`${titleLg} ${space.afterTitleLg} w-full text-[clamp(1.85rem,6vw,3.25rem)] leading-[1.06] md:text-[clamp(2rem,5vw,3.5rem)]`}
            >
              {slide.title}
            </h1>
            <p
              className={`${space.afterTitle} w-full font-sans text-[clamp(1rem,2.2vw,1.25rem)] font-normal leading-[1.45] ${theme.secondary}`}
            >
              {slide.kicker}
            </p>
            <p className={`${bodyProse} ${space.body}`}>{slide.subtitle}</p>
          </div>
        </div>
      );
    case "meta":
      return (
        <div className={`flex flex-col justify-center ${slideShell}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.35rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.5rem,3vw,2.25rem)]`}
          >
            {slide.title}
          </h2>
          <dl className={`${space.section} grid w-full grid-cols-1 gap-x-10 gap-y-8 text-left sm:grid-cols-2`}>
            {slide.fields.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="font-sans text-[10px] font-normal uppercase tracking-[0.2em] leading-snug [&_strong]:normal-case">
                  <DeckSmallRich>{label}</DeckSmallRich>
                </dt>
                <dd className={`mt-2.5 font-sans text-[15px] font-normal leading-relaxed md:text-[16px] ${theme.label}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "statement":
      return (
        <div className={`flex flex-col justify-center ${slideShell}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.25rem,3.8vw,2.1rem)] leading-snug md:text-[clamp(1.35rem,3.2vw,2.5rem)]`}
          >
            {slide.title}
          </h2>
          <p className={`${bodyProse} ${space.body} whitespace-pre-line`}>
            <DeckRichLine>{slide.body}</DeckRichLine>
          </p>
        </div>
      );
    case "quote":
      return (
        <div className="flex min-h-[min(50svh,420px)] flex-col justify-center px-5 py-10 sm:min-h-[min(56svh,500px)]">
          <blockquote
            className={`mx-auto w-full ${SLIDE_MAX} text-left font-display text-[clamp(1.2rem,3.4vw,1.95rem)] font-light not-italic leading-[1.5] tracking-[-0.025em] text-[#1D1D1F] sm:text-[clamp(1.25rem,2.8vw,2.05rem)] md:leading-[1.48]`}
          >
            {slide.quote}
          </blockquote>
        </div>
      );
    case "threeCards":
      return (
        <div className={`flex flex-col justify-center ${slideShell}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.25rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.35rem,2.8vw,2.35rem)]`}
          >
            {slide.title}
          </h2>
          <div className={`${space.section} flex w-full flex-col ${space.stack}`}>
            {slide.cards.map((c) => (
              <div key={c.n} className="text-left">
                <p className={`font-sans text-[11px] font-normal tabular-nums tracking-[0.14em] ${theme.tertiary}`}>{c.n}</p>
                <p className={`mt-3 font-display text-[1.15rem] font-light leading-snug tracking-[-0.02em] sm:text-[1.25rem] md:text-[1.4rem] ${theme.label}`}>
                  {c.title}
                </p>
                <p className={`mt-4 font-sans text-[14px] font-normal leading-[1.7] md:text-[15px]`}>
                  <DeckSmallRich>{c.body}</DeckSmallRich>
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    case "gridMedia":
      return (
        <div className={`flex flex-col justify-center ${slideShellMedia}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.25rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.35rem,2.8vw,2.35rem)]`}
          >
            {slide.title}
          </h2>
          <div className={`${space.section} flex w-full flex-col items-stretch ${space.stack}`}>
            {slide.items.map((item) => (
              <div
                key={item.src}
                className={`relative w-full max-h-[min(64vh,720px)] overflow-hidden self-start ${mediaRound}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`h-auto w-full object-contain object-left ${mediaRound}`}
                  loading="lazy"
                  decoding="async"
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
        <div className={`flex flex-col justify-center ${slideShellMedia}`}>
          {slide.eyebrow ? <EyebrowText text={slide.eyebrow} /> : null}
          {slide.title ? (
            <h2
              className={`${titleLg} ${slide.eyebrow ? space.afterEyebrow : "mt-0"} w-full text-[clamp(1.25rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.35rem,2.8vw,2.35rem)]`}
            >
              {slide.title}
            </h2>
          ) : null}
          <div className={`${slide.title ? space.section : "mt-0"} flex w-full justify-start`}>
            {slide.media === "video" ? (
              <DeckVideo src={slide.src} poster={slide.poster} label={slide.alt} className="w-full" />
            ) : (
              <div
                className={`relative max-h-[min(48svh,420px)] w-full overflow-hidden sm:max-h-[min(54svh,520px)] md:max-h-[min(62vh,600px)] lg:max-h-[min(68vh,700px)] ${mediaRound}`}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className={`h-full w-full object-contain object-left ${mediaRound}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </div>
          {slide.caption ? (
            <p className="mt-5 w-full text-left font-sans text-[12px] font-normal leading-relaxed sm:mt-6 sm:text-[13px]">
              <DeckSmallRich>{slide.caption}</DeckSmallRich>
            </p>
          ) : null}
        </div>
      );
    case "prototype":
      return (
        <div className={`flex flex-col justify-center ${slideShellPrototype}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.25rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.35rem,2.8vw,2.35rem)]`}
          >
            {slide.title}
          </h2>
          <p className={`${bodyProse} ${space.body}`}>{slide.body}</p>
          <div className={`${space.section} w-full self-start overflow-hidden ${mediaRound}`}>
            <div className="flex flex-wrap items-center justify-start gap-3 py-2 md:gap-6">
              <p className={`font-mono text-[10px] font-normal uppercase tracking-[0.16em] ${theme.tertiary}`}>交互原型</p>
              <Link
                href={slide.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-mono text-[10px] uppercase tracking-[0.18em] underline underline-offset-4 transition-colors ${theme.accent} ${theme.accentHover}`}
              >
                {slide.linkLabel}
              </Link>
            </div>
            <iframe
              title={slide.title}
              src={slide.embedPath}
              className={`h-[min(68vh,680px)] w-full min-h-[min(52vh,420px)] ${theme.mediaRing} bg-[#F5F5F7]`}
              loading="lazy"
              allow="fullscreen"
            />
          </div>
        </div>
      );
    case "outcomes":
      return (
        <div className={`flex flex-col justify-center ${slideShell}`}>
          <EyebrowText text={slide.eyebrow} />
          <h2
            className={`${titleLg} ${space.afterEyebrow} w-full text-[clamp(1.25rem,3.5vw,2rem)] leading-snug md:text-[clamp(1.35rem,2.8vw,2.35rem)]`}
          >
            {slide.title}
          </h2>
          <ul className={`${space.section} flex w-full flex-col gap-9 text-left sm:gap-10`}>
            {slide.items.map((item) => (
              <li key={item.label} className="w-full">
                <p className={`font-sans text-[10px] font-normal uppercase tracking-[0.2em] ${theme.tertiary}`}>{item.label}</p>
                <p className="mt-2.5 font-sans text-[15px] font-normal leading-relaxed md:text-[16px]">
                  <DeckSmallRich>{item.text}</DeckSmallRich>
                </p>
              </li>
            ))}
          </ul>
        </div>
      );
    case "cta":
      return (
        <div className="relative flex w-full flex-col justify-center px-5 py-12 md:px-8 md:py-14">
          <DotPattern />
          <div className={`relative flex w-full flex-col items-start text-left ${slideShell}`}>
            <h2
              className={`${titleLg} w-full text-[clamp(1.25rem,3.4vw,1.95rem)] leading-[1.2] md:text-[clamp(1.35rem,2.8vw,2.1rem)]`}
            >
              {slide.title}
            </h2>
            <p className={`${bodyProse} ${space.body}`}>
              <DeckRichLine>{slide.body}</DeckRichLine>
            </p>
            {slide.href.startsWith("/") ? (
              <Link
                href={slide.href}
                className={`${space.section} inline-flex items-center gap-1.5 font-sans text-[15px] font-normal ${theme.accent} ${theme.accentHover}`}
              >
                {slide.linkLabel}
                <span aria-hidden className="text-xs opacity-70">
                  →
                </span>
              </Link>
            ) : (
              <a
                href={slide.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${space.section} inline-flex items-center gap-1.5 font-sans text-[15px] font-normal ${theme.accent} ${theme.accentHover}`}
              >
                {slide.linkLabel}
                <span aria-hidden className="text-xs opacity-70">
                  ↗
                </span>
              </a>
            )}
            <div className="mt-6 sm:mt-7">
              <Link
                href="/work/studio-engine"
                className={`font-sans text-[14px] font-normal underline underline-offset-[6px] decoration-black/[0.12] transition-colors ${theme.tertiary} hover:text-violet-800`}
              >
                ← 返回案例长文
              </Link>
            </div>
            <p className={`mt-10 font-sans text-[13px] font-normal sm:mt-12 sm:text-[14px] ${theme.tertiary}`}>
              YuanFang · UX Designer ·{" "}
              <a
                href="https://nltstudio7.space"
                className={`${theme.accent} underline-offset-4 hover:underline ${theme.accentHover}`}
              >
                nltstudio7.space
              </a>
            </p>
            {slide.imageSrc ? (
              <div
                className={`relative ${space.section} aspect-[4/3] w-full overflow-hidden ${mediaRound}`}
              >
                <Image
                  src={slide.imageSrc}
                  alt={slide.imageAlt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 48rem, 90vw"
                  priority={false}
                />
              </div>
            ) : null}
          </div>
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
  const isSimple = searchParams.get("simple") === "1";
  const slides = isSimple ? DECK_SLIDES_SIMPLE : DECK_SLIDES;
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(0);
  }, [isSimple]);

  const total = slides.length;
  const slide = slides[index];
  const nextSlide = index < total - 1 ? slides[index + 1] : null;

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
    const q = new URLSearchParams();
    q.set("speaker", "1");
    if (isSimple) q.set("simple", "1");
    const url = `${window.location.origin}${pathname}?${q.toString()}`;
    window.open(url, "studio-engine-deck-speaker", "width=560,height=780,noopener,noreferrer");
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

  const dur = reduce ? 0.01 : 0.62;
  const ease = easeApple;

  return (
    <div
      ref={shellRef}
      lang="zh-Hans"
      className={`relative flex min-h-screen flex-col ${theme.bg} ${theme.label} antialiased`}
    >
      <div className="pointer-events-none fixed left-0 top-0 z-[60] h-[2px] w-full bg-black/[0.06]" aria-hidden>
        <motion.div
          className="h-full bg-violet-600"
          initial={false}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: reduce ? 0 : 0.55, ease }}
        />
      </div>

      <header className="relative z-40 flex shrink-0 items-center justify-between gap-6 border-b border-black/[0.06] bg-white/80 px-5 py-4 backdrop-blur-2xl md:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href="/work/studio-engine"
            className="shrink-0 font-sans text-[13px] font-normal text-violet-600 transition-colors hover:text-violet-800"
          >
            ← 案例长文
          </Link>
          <span className="hidden font-sans text-[12px] font-normal tracking-[-0.01em] text-[#86868B] sm:inline">
            {isSpeaker ? "讲者提示" : isSimple ? "演示 · 精简版" : "演示"}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!isSpeaker ? (
            <button
              type="button"
              onClick={openSpeaker}
              className="inline-flex rounded-full px-3 py-2 font-sans text-[13px] font-normal text-violet-600 transition-colors hover:bg-violet-500/[0.08] hover:text-violet-800"
            >
              讲者
            </button>
          ) : null}
          {!isSpeaker ? (
            <button
              type="button"
              onClick={enterFullscreen}
              className="rounded-full px-3 py-2 font-sans text-[13px] font-normal text-violet-600 transition-colors hover:bg-violet-500/[0.08] hover:text-violet-800"
            >
              全屏
            </button>
          ) : null}
          <span className="font-sans text-[12px] font-light tabular-nums tracking-[-0.02em] text-[#86868B]">
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
          <div
            className={`mx-auto flex w-full ${SLIDE_MAX} flex-1 flex-col items-stretch px-5 py-7 text-left md:px-6 md:py-9 ${theme.label}`}
          >
            <p className={`font-sans text-[11px] font-normal tracking-[0.08em] ${theme.tertiary}`}>
              第 {index + 1} 页 · 讲者提示
            </p>
            <h1 className="mt-5 font-display text-2xl font-light leading-snug tracking-[-0.03em] md:text-3xl">
              {slideHeading(slide)}
            </h1>
            {slide.kind === "quote" ? (
              <p className={`mt-2 font-sans text-sm leading-relaxed ${theme.secondary}`}>
                「{(slide as Extract<Slide, { kind: "quote" }>).quote}」
              </p>
            ) : null}
            <div className="mt-10 w-full flex-1 overflow-y-auto px-0" role="region" aria-label="讲者提示全文">
              <p className={`font-sans text-[16px] font-normal leading-[1.75] text-[#6E6E73] md:text-[17px] md:leading-[1.8]`}>{slide.speakerNotes}</p>
            </div>
            {nextSlide ? (
              <p className={`mt-6 border-t ${theme.separator} pt-4 font-sans text-[11px] tracking-wide ${theme.tertiary}`}>
                下一页 · {slideHeading(nextSlide)}
              </p>
            ) : (
              <p className={`mt-6 font-sans text-[11px] tracking-wide ${theme.tertiary}`}>演示结束</p>
            )}
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-32 pt-8 md:px-12 md:pb-36 md:pt-10">
            <p
              className={`pointer-events-none absolute right-6 top-7 font-display text-[12px] font-extralight tabular-nums tracking-[0.12em] text-[#86868B] md:right-12 md:top-9`}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <div
              className={`relative mx-auto flex min-h-0 w-full ${slide.kind === "prototype" ? SLIDE_MAX_PROTOTYPE : SLIDE_MAX} flex-1 flex-col overflow-y-auto overflow-x-hidden`}
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: dur, ease }}
                  className={`flex w-full min-h-[min(100%,calc(100dvh-11rem))] flex-col items-center justify-center ${space.motionPad}`}
                >
                  <SlideBody slide={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/85 px-5 py-4 backdrop-blur-2xl md:px-10">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="shrink-0 rounded-full px-4 py-2.5 font-sans text-[13px] font-normal text-[#1D1D1F] transition-colors hover:bg-violet-500/[0.07] hover:text-violet-950 disabled:opacity-30 sm:px-5"
          >
            ← 上一张
          </button>
          <p className="hidden min-w-0 flex-1 truncate px-3 text-center text-[13px] font-normal leading-snug text-[#86868B] sm:block">
            {slideHeading(slide)}
          </p>
          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="shrink-0 rounded-full px-4 py-2.5 font-sans text-[13px] font-normal text-[#1D1D1F] transition-colors hover:bg-violet-500/[0.07] hover:text-violet-950 disabled:opacity-30 sm:px-5"
          >
            下一张 →
          </button>
        </div>
        <p className="mx-auto mt-3 max-w-[90rem] text-center font-sans text-[10px] font-normal leading-relaxed tracking-[0.04em] text-[#AEAEB2]">
          键盘：← → 空格 · Home / End
          {!isSpeaker ? " · 讲者窗口与主窗口同步" : " · 已与主演示窗口同步"}
          {!isSpeaker && !isSimple ? " · 网址加参数 simple=1 为精简版" : null}
        </p>
      </footer>
    </div>
  );
}
