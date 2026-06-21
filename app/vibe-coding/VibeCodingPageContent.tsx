"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { LimeMark } from "@/components/LimeMark";
import { RoseLoader } from "@/components/RoseLoader";
import { SiteWindow } from "@/components/SiteWindow";
import { TurntableWidget } from "@/components/TurntableWidget";

type Tag = "app" | "web" | "interaction" | "ai";

type Media =
  | { kind: "video"; src: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "live"; href: string; url: string; label: string }
  | { kind: "iframe"; src: string; href: string; bg: string; title: string }
  | { kind: "custom"; node: "turntable" };

type Entry = {
  date: string;
  title: string;
  description: string;
  tags: Tag[];
  href?: string;
  hrefLabel?: string;
  media: Media;
};

const entries: Entry[] = [
  {
    date: "2026.05",
    title: "design agency website",
    description: "Studio website for a creative agency — brand expression, work showcase, and inquiry flow.",
    tags: ["web"],
    href: "https://qbix.space",
    hrefLabel: "open site ↗",
    media: {
      kind: "live",
      href: "https://qbix.space",
      url: "qbix.space",
      label: "Design agency — live site preview",
    },
  },
  {
    date: "2025.12",
    title: "ai romance character chat",
    description: "Conversational prototype for a romance AI character — chat interface, persona pacing, and scene atmosphere.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character",
    hrefLabel: "case study →",
    media: {
      kind: "iframe",
      src: "/work/ai-character/prototype?muted=1",
      href: "/work/ai-character/prototype",
      bg: "bg-[#060608]",
      title: "Romance companion interactive prototype",
    },
  },
  {
    date: "2025.09",
    title: "ai therapy companion",
    description: "Conversational prototype for an emotional-support AI character — ambient room interface as a listening space.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character/prototype-psych",
    hrefLabel: "open →",
    media: {
      kind: "iframe",
      src: "/work/ai-character/prototype-psych?embed=1",
      href: "/work/ai-character/prototype-psych",
      bg: "bg-[#f8fcff]",
      title: "Therapy companion interactive prototype",
    },
  },
  {
    date: "2025.08",
    title: "ai astrology character",
    description: "Conversational prototype for an astrology AI character — zodiac persona system and fortune-dialogue flow.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character/prototype-astro",
    hrefLabel: "open →",
    media: {
      kind: "iframe",
      src: "/work/ai-character/prototype-astro?embed=1",
      href: "/work/ai-character/prototype-astro",
      bg: "bg-[#fdfaf5]",
      title: "Astrology character interactive prototype",
    },
  },
  {
    date: "2026.05",
    title: "portfolio rebrand",
    description: "End-to-end brand refresh and site redesign — identity system, information architecture, and interactions.",
    tags: ["web"],
    href: "https://hancao.space",
    hrefLabel: "open site ↗",
    media: {
      kind: "live",
      href: "https://hancao.space",
      url: "hancao.space",
      label: "Personal portfolio — live site preview",
    },
  },
  {
    date: "2026.06",
    title: "lamdre restaurant homepage",
    description: "Restaurant website homepage design — brand atmosphere, menu showcase, and reservation entry flow.",
    tags: ["web"],
    media: { kind: "video", src: "/assets/lab/lamdre.mp4" },
  },
  {
    date: "2026.05",
    title: "auction × gacha mobile game",
    description: "Mobile game prototype combining a real-time bidding mechanic with a blind-box reward system.",
    tags: ["app"],
    media: { kind: "video", src: "/assets/app-design/bidking.mp4" },
  },
  {
    date: "2026.04",
    title: "digital fortune cabinet",
    description: "Interactive cabinet for digital fortune-drawing — slip-pull interaction with reveal sequence.",
    tags: ["interaction"],
    href: "/code/playground/omikuji",
    hrefLabel: "open →",
    media: {
      kind: "iframe",
      src: "/code/playground/omikuji?embed=1",
      href: "/code/playground/omikuji",
      bg: "bg-[#060608]",
      title: "Fortune cabinet interactive prototype",
    },
  },
  {
    date: "2026.01",
    title: "lo-fi vinyl player",
    description: "Ambient audio player — vinyl visual surface with generative lo-fi background music.",
    tags: ["interaction"],
    media: { kind: "custom", node: "turntable" },
  },
  {
    date: "2025.10",
    title: "gacha portfolio navigation",
    description: "Portfolio navigation built as a gacha experience — randomized reveal as a project-discovery interface.",
    tags: ["interaction"],
    href: "/code/playground/gacha",
    hrefLabel: "open →",
    media: {
      kind: "iframe",
      src: "/code/playground/gacha?embed=1",
      href: "/code/playground/gacha",
      bg: "bg-[#070605]",
      title: "Gacha portfolio interactive prototype",
    },
  },
  {
    date: "2025.08",
    title: "saas homepage rebuild",
    description: "Homepage redesign for a SaaS product — narrative flow, motion language, and section rhythm.",
    tags: ["web"],
    media: { kind: "video", src: "/assets/work/apsara.mp4" },
  },
  {
    date: "2025.05",
    title: "tts reading workflow",
    description: "Workflow redesign for a Chinese long-form text-to-speech reader — voice playback, sentence highlighting, and an immersive dark reading surface.",
    tags: ["ai", "interaction"],
    media: { kind: "image", src: "/assets/lab/tts-workflow.jpg", alt: "TTS reading workflow redesign — moody hero composition" },
  },
];

// ─── Media components ──────────────────────────────────────────────────────

function LazyVideo({
  src,
  shouldLoad,
  onReady,
}: {
  src: string;
  shouldLoad: boolean;
  onReady?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const firedRef = useRef(false);

  const handleCanPlay = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLoaded(true);
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-white/[0.03]">
      {/* shimmer — fades out once video can play */}
      <div
        className={`absolute inset-0 animate-pulse bg-white/[0.05] transition-opacity duration-500 ${
          loaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
      {shouldLoad && (
        <video
          className={`block h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={handleCanPlay}
        />
      )}
    </div>
  );
}

function LazyImage({
  src,
  alt,
  shouldLoad,
  onReady,
}: {
  src: string;
  alt: string;
  shouldLoad: boolean;
  onReady?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const firedRef = useRef(false);

  const handleLoad = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLoaded(true);
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-white/[0.03]">
      <div
        className={`absolute inset-0 animate-pulse bg-white/[0.05] transition-opacity duration-500 ${
          loaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
      {shouldLoad && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`block h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}

function ScaledIframe({
  src,
  title,
  bg,
  shouldLoad,
  natural = { w: 1280, h: 860 },
  onReady,
}: {
  src: string;
  title: string;
  bg: string;
  shouldLoad: boolean;
  natural?: { w: number; h: number };
  onReady?: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [loaded, setLoaded] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / natural.w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [natural.w]);

  const handleLoad = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLoaded(true);
    onReady?.();
  }, [onReady]);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden rounded-md ${bg}`}
      style={{ height: natural.h * scale }}
    >
      {/* shimmer overlay */}
      <div
        className={`absolute inset-0 z-10 animate-pulse bg-white/[0.05] transition-opacity duration-500 ${
          loaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      />
      {shouldLoad && (
        <iframe
          title={title}
          src={src}
          className={`block border-0 ${bg}`}
          style={{
            width: natural.w,
            height: natural.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
          loading="lazy"
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}

// ─── MediaSlot ─────────────────────────────────────────────────────────────

function MediaSlot({
  media,
  shouldLoad,
  onReady,
}: {
  media: Media;
  shouldLoad: boolean;
  onReady?: () => void;
}) {
  // onReady is wired for every type with a real load event (video, image,
  // iframe, live site). Only TurntableWidget (a self-managed canvas) is left
  // unwired — it never gates the entry, which only waits on the first card.
  if (media.kind === "video") {
    return <LazyVideo src={media.src} shouldLoad={shouldLoad} onReady={onReady} />;
  }
  if (media.kind === "image") {
    return <LazyImage src={media.src} alt={media.alt} shouldLoad={shouldLoad} onReady={onReady} />;
  }
  if (media.kind === "live") {
    return (
      <SiteWindow
        href={media.href}
        url={media.url}
        label={media.label}
        active={shouldLoad}
        chrome={false}
        bare
        onReady={onReady}
      />
    );
  }
  if (media.kind === "iframe") {
    return (
      <Link
        href={media.href}
        className="group block transition-opacity hover:opacity-95"
        aria-label={`Open ${media.title}`}
      >
        <ScaledIframe
          src={media.src}
          title={media.title}
          bg={media.bg}
          shouldLoad={shouldLoad}
          onReady={onReady}
        />
      </Link>
    );
  }
  if (media.kind === "custom" && media.node === "turntable") {
    return shouldLoad ? (
      <TurntableWidget />
    ) : (
      <div className="aspect-square w-full rounded-md bg-white/[0.05]" />
    );
  }
  return null;
}

// ─── Active card FX (desktop) ──────────────────────────────────────────────
// Pointer-tracked 3D tilt — rotation ONLY, never scale — plus a lime radial
// glare and a cursor-following lime arrow button (the same affordance as the
// /work ProjectCard). The arrow only shows when the card has a destination.
// Honours prefers-reduced-motion (renders flat, no spring).

const TILT_SPRING = { stiffness: 150, damping: 18, mass: 0.4 } as const;
const ARROW_SPRING = { stiffness: 400, damping: 30, mass: 0.5 } as const;

function ActiveCardFX({
  hasLink,
  children,
}: {
  hasLink: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // 0..1 pointer position within the card → tilt + glare.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [6.5, -6.5]), TILT_SPRING);
  const rotY = useSpring(useTransform(mx, [0, 1], [-8.5, 8.5]), TILT_SPRING);
  const gx = useTransform(mx, (v) => v * 100);
  const gy = useTransform(my, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(380px circle at ${gx}% ${gy}%, rgba(210,255,0,0.22), transparent 60%)`;

  // Pixel pointer position → cursor-following arrow (offset to centre the 56px button).
  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const axs = useSpring(ax, ARROW_SPRING);
  const ays = useSpring(ay, ARROW_SPRING);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
    ax.set(e.clientX - r.left - 28);
    ay.set(e.clientY - r.top - 28);
  };
  const enter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMove(e);
    setHovered(true);
  };
  const leave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHovered(false);
  };

  return (
    <div className="relative" onMouseEnter={enter} onMouseMove={onMove} onMouseLeave={leave}>
      <motion.div
        style={
          reduced
            ? undefined
            : {
                rotateX: rotX,
                rotateY: rotY,
                transformPerspective: 1100,
                transformStyle: "preserve-3d",
              }
        }
        className="relative will-change-transform"
      >
        {children}
        {!reduced && (
          <>
            {/* cursor-tracked lime glare */}
            <motion.div
              aria-hidden
              style={{ background: glare }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-none absolute inset-0 z-[3] rounded-md mix-blend-screen"
            />
            {/* lime hairline edge on hover */}
            <motion.div
              aria-hidden
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute inset-0 z-[2] rounded-md ring-1 ring-inset ring-nltLime/40"
            />
          </>
        )}
      </motion.div>

      {/* Cursor-following lime arrow — visual affordance only (the media itself
          is the link). Shown on hover when the card has a destination. */}
      {hasLink && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-nltLime text-[#0a0b0c] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]"
          style={{ x: reduced ? ax : axs, y: reduced ? ay : ays }}
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ArrowUpRight className="h-6 w-6" strokeWidth={2.25} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Cards ─────────────────────────────────────────────────────────────────

function PrototypeCard({
  entry,
  shouldLoad,
  isActive,
  fluid = false,
  onReady,
}: {
  entry: Entry;
  shouldLoad: boolean;
  isActive: boolean;
  fluid?: boolean;
  onReady?: () => void;
}) {
  const media = (
    <MediaSlot media={entry.media} shouldLoad={shouldLoad} onReady={onReady} />
  );
  // Live sites + embedded prototypes have a destination → show the hover arrow.
  const hasLink = entry.media.kind === "live" || entry.media.kind === "iframe";

  return (
    <article
      className={fluid ? "w-full" : ""}
      // Active card scales with the viewport but is height-capped (16:9) so it
      // always fits the 56vh deck — no fixed px width that strands big screens.
      style={{
        pointerEvents: isActive ? "auto" : "none",
        width: fluid ? undefined : "min(62vw, calc(48vh * 16 / 9))",
      }}
    >
      {/* Desktop active card gets the tilt + cursor arrow; neighbours + mobile
          render flat. The editorial caption below carries the title on desktop. */}
      {!fluid && isActive ? (
        <ActiveCardFX hasLink={hasLink}>{media}</ActiveCardFX>
      ) : (
        <div>{media}</div>
      )}

      {/* In-card header — mobile list only. */}
      {fluid && (
        <header className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-display text-base lowercase tracking-[-0.01em] text-white md:text-lg">
            {entry.title}
          </h3>
          {entry.href && entry.hrefLabel && (
            <Link
              href={entry.href}
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 transition-opacity hover:opacity-60"
              target={entry.href.startsWith("http") ? "_blank" : undefined}
              rel={entry.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {entry.hrefLabel}
            </Link>
          )}
        </header>
      )}
    </article>
  );
}

// ─── Editorial pieces (desktop) ────────────────────────────────────────────

/** Giant ghost index numeral floating behind the active card. */
function GhostIndex({ index }: { index: number }) {
  const label = String(index + 1).padStart(2, "0");
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-end justify-end overflow-hidden pb-[2vh] pr-[1vw]"
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={label}
          className="select-none font-display leading-none tracking-[-0.06em]"
          style={{
            fontSize: "min(74vh, 40vw)",
            color: "transparent",
            WebkitTextStroke: "1.6px rgba(210,255,0,0.22)",
            willChange: "transform, opacity",
          }}
          // No blur tween — animating filter:blur on a min(74vh,40vw) text layer
          // every frame was a major source of the switch jank. Slide + fade only.
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Bold editorial caption for the active entry — re-mounts on navigation so the
 *  LimeMark highlighter re-swipes and the block slides in each time. */
function EditorialCaption({
  entry,
  index,
  total,
}: {
  entry: Entry;
  index: number;
  total: number;
}) {
  const words = entry.title.split(" ");
  const last = words.pop() ?? entry.title;
  const head = words.join(" ");

  return (
    <motion.div
      key={`${index}-${entry.title}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto text-left"
      style={{ width: "min(62vw, calc(48vh * 16 / 9))" }}
    >
      <div className="flex items-baseline gap-3 font-mono text-[10px] uppercase tracking-[0.3em]">
        <span className="tabular-nums text-nltLime">{String(index + 1).padStart(2, "0")}</span>
        <span className="text-white/25">/</span>
        <span className="tabular-nums text-white/35">{String(total).padStart(2, "0")}</span>
      </div>

      <h2 className="mt-3 font-display lowercase leading-[1.05] tracking-[-0.02em] text-white text-[clamp(20px,2.4vw,32px)]">
        {head ? `${head} ` : ""}
        <LimeMark>{last}</LimeMark>
      </h2>
    </motion.div>
  );
}

/** Game-style segmented loading bar — doubles as the carousel index.
 *  Segments fill up to the active item (lime), the current segment glows, and
 *  each segment is clickable to jump. */
function LoadBar({
  active,
  total,
  onPrev,
  onNext,
  onJump,
}: {
  active: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}) {
  const pct = Math.round(((active + 1) / total) * 100);

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 md:gap-4">
      <button
        onClick={onPrev}
        className="px-1.5 py-2 text-white/45 transition-colors hover:text-nltLime"
        aria-label="Previous"
      >
        ‹
      </button>

      <span className="text-white/25">[</span>

      {/* segmented bar */}
      <div className="relative flex items-center gap-[3px]">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i <= active;
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              className="group relative py-2"
              aria-label={`Go to item ${i + 1}`}
            >
              <span
                className={`block h-[12px] w-[13px] -skew-x-[20deg] transition-all duration-300 ease-portfolio ${
                  isActive
                    ? "bg-nltLime shadow-[0_0_12px_rgba(210,255,0,0.85)]"
                    : filled
                      ? "bg-nltLime/65"
                      : "bg-white/[0.12] group-hover:bg-white/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-white/25">]</span>

      <span className="tabular-nums text-nltLime">{String(pct).padStart(3, "0")}%</span>

      <button
        onClick={onNext}
        className="px-1.5 py-2 text-white/45 transition-colors hover:text-nltLime"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}

/** Mobile list item — mounts media only after the row scrolls into view. */
function MobilePrototypeListItem({ entry }: { entry: Entry }) {
  const ref = useRef<HTMLLIElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad]);

  return (
    <li ref={ref} className="min-w-0">
      {/* onReady not wired on mobile — the entry gate is desktop-only */}
      <PrototypeCard entry={entry} shouldLoad={shouldLoad} isActive fluid />
    </li>
  );
}

// ─── Entry loading gate (desktop-only) ─────────────────────────────────────
// Matches the homepage IntroAnimation visual: RoseLoader + lime halo + progress bar.
// Only shown on md+ (the carousel). Mobile uses a plain scroll list — no gate needed.

const GATE_TARGET = 2; // wait for 2 actual media loads (the first cards near the active slide)

function EntryGate({ ready, readyCount }: { ready: boolean; readyCount: number }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(true);
  const [phase, setPhase] = useState<"playing" | "exit">("playing");
  const [percent, setPercent] = useState(0);
  const countRef = useRef(readyCount);
  const readyRef = useRef(ready);
  const startRef = useRef(0);

  // Keep refs in sync so the rAF loop reads live progress without resubscribing.
  useEffect(() => {
    countRef.current = readyCount;
  }, [readyCount]);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  // Trigger the fade-out once assets are ready.
  useEffect(() => {
    if (!ready) return;
    setPhase("exit");
    const t = setTimeout(() => setMounted(false), 750);
    return () => clearTimeout(t);
  }, [ready]);

  // rAF-driven percent — eases toward the larger of real load progress and a
  // gentle time floor so the bar never looks stuck while a video streams in.
  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;
    let shown = 0;
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const assetFrac = countRef.current / GATE_TARGET;
      const timeFloor = Math.min(0.9, Math.max(0, (elapsed - 120) / 2000));
      const target =
        readyRef.current || countRef.current >= GATE_TARGET
          ? 1
          : Math.max(assetFrac, timeFloor);
      shown += (target - shown) * 0.14;
      if (target - shown < 0.004) shown = target;
      setPercent(Math.round(shown * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] hidden items-center justify-center bg-[#07080A] md:flex"
      initial={{ opacity: 1 }}
      animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="pointer-events-none relative flex flex-col items-center">
        {/* Rose curve + lime halo */}
        <div className="relative flex h-[180px] w-[180px] items-center justify-center md:h-[200px] md:w-[200px]">
          <motion.div
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,229,50,0.35) 0%, rgba(184,229,50,0.08) 38%, transparent 68%)",
              filter: "blur(18px)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={phase === "exit" ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="relative z-10 h-[150px] w-[150px] md:h-[170px] md:w-[170px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={phase === "exit" ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <RoseLoader reduced={!!reduced} />
          </motion.div>
        </div>

        {/* Progress bar + status */}
        <motion.div
          className="relative z-10 mt-10 flex w-[220px] flex-col items-stretch md:mt-12 md:w-[280px]"
          initial={{ opacity: 0, y: 8 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
        >
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-nltLime/60 via-nltLime to-nltLime"
              style={{
                width: `${percent}%`,
                boxShadow: "0 0 14px rgba(184,229,50,0.6)",
                transition: "width 90ms linear",
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span>{ready ? "Ready" : "Loading"}</span>
            <span className="tabular-nums text-nltLime/90">
              {String(Math.min(percent, 100)).padStart(3, "0")}
            </span>
          </div>
        </motion.div>

        {/* Brand mark */}
        <motion.p
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.36em] text-white/25 md:-bottom-28"
          initial={{ opacity: 0 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.5, ease: "linear" }}
        >
          Yuan Fang &nbsp;·&nbsp; Portfolio &nbsp;·&nbsp; 2026
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── Stable entry key ───────────────────────────────────────────────────────

const entryKey = (e: Entry) => `${e.date}::${e.title}`;

// The card shown first (active on mount) — the gate waits for its media to load
// so the page never reveals on a still-loading placeholder.
const FIRST_KEY = entryKey(entries[0]);

// ─── Page content ───────────────────────────────────────────────────────────

export function VibeCodingPageContent() {
  const [active, setActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const wheelCooldown = useRef(false);

  // ── Entry gate ─────────────────────────────────────────────────────────
  // Hold the loading animation until the first (active) card's media has
  // actually loaded; the bar's progress reflects how many nearby cards are ready.
  const [entryReady, setEntryReady] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const readyKeysRef = useRef<Set<string>>(new Set());

  const onMediaReady = useCallback((key: string) => {
    if (readyKeysRef.current.has(key)) return;
    readyKeysRef.current.add(key);
    setReadyCount(readyKeysRef.current.size);
    if (key === FIRST_KEY) setEntryReady(true);
  }, []);

  // Hard fallback: reveal after 9 s even if a (cross-origin) asset never loads.
  useEffect(() => {
    const t = setTimeout(() => setEntryReady(true), 9000);
    return () => clearTimeout(t);
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────
  const visible = entries;
  const n = visible.length;

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + n) % n);
  }, [n]);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % n);
  }, [n]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Scroll-to-navigate on the carousel area
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;
      const dominant = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (dominant > 0) next();
      else if (dominant < 0) prev();
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 550);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [prev, next]);

  return (
    <section className="relative flex flex-col md:h-full md:justify-center">
      <EntryGate ready={entryReady} readyCount={readyCount} />

      {/* Mobile: stacked list */}
      <div className="mx-auto w-full max-w-content px-6 md:hidden">
        <ul className="flex flex-col gap-10 pb-16">
          {visible.map((entry) => (
            <MobilePrototypeListItem key={entryKey(entry)} entry={entry} />
          ))}
        </ul>
      </div>

      {/* Tablet / desktop: kinetic editorial carousel */}
      <div ref={carouselRef} className="relative hidden min-h-0 overflow-hidden md:block md:h-[56vh]">
        {/* giant ghost index numeral behind the deck */}
        <GhostIndex index={active} />

        <div className="absolute inset-0 z-10 flex items-end justify-center pb-[3vh]">
          {visible.map((entry, i) => {
            const raw = i - active;
            const halfN = n / 2;
            let offset = raw;
            if (offset > halfN) offset -= n;
            if (offset < -halfN) offset += n;
            const dist = Math.abs(offset);
            const isActive = dist === 0;
            // Mount media only for the active card + its 2-deep neighbours. Far
            // cards unmount their iframe/video so we never accumulate a dozen
            // live embeds all decoding at once (the real cause of switch lag).
            const shouldLoad = dist <= 2;
            return (
              <div
                key={entryKey(entry)}
                onClick={() => !isActive && setActive(i)}
                className="absolute transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                  transformOrigin: "bottom center",
                  transform: `translateX(calc(${offset} * 44vw)) scale(${isActive ? 1 : 0.66})`,
                  opacity: isActive ? 1 : dist === 1 ? 0.32 : 0,
                  // grayscale only — animating blur on a card-sized layer was the
                  // main switch-jank cost; the static desaturation is free.
                  filter: isActive ? "none" : "grayscale(1) brightness(0.7)",
                  cursor: isActive ? "default" : "pointer",
                  zIndex: isActive ? 10 : 5 - dist,
                  // Promote only the cards that actually move on a switch, and skip
                  // painting/compositing the off-stage ones entirely.
                  willChange: dist <= 1 ? "transform, opacity" : undefined,
                  visibility: dist > 1 ? "hidden" : "visible",
                  pointerEvents: dist > 1 ? "none" : undefined,
                }}
              >
                <PrototypeCard
                  entry={entry}
                  shouldLoad={shouldLoad}
                  isActive={isActive}
                  onReady={() => onMediaReady(entryKey(entry))}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Editorial footer — caption + game-style load bar (desktop only). The
          carousel is bottom-aligned so the caption sits right under the media. */}
      <div className="hidden shrink-0 flex-col gap-5 pb-7 pt-4 md:flex">
        <EditorialCaption entry={visible[active]} index={active} total={n} />
        <div className="flex justify-center">
          <LoadBar
            active={active}
            total={n}
            onPrev={prev}
            onNext={next}
            onJump={setActive}
          />
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
