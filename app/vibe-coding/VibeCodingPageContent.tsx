"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

// ─── Tag / filter chips ────────────────────────────────────────────────────

function TagChip({ tag }: { tag: Tag }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
      {tag}
    </span>
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
  // onReady is only wired for types that have a real load event (video, image,
  // iframe). SiteWindow and TurntableWidget manage their own skeletons; counting
  // them as immediately ready would open the gate before any actual media loads.
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
  return (
    <article
      className={fluid ? "w-full" : "w-[min(62vw,680px)]"}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      <div>
        <MediaSlot media={entry.media} shouldLoad={shouldLoad} onReady={onReady} />
      </div>
      <header className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-display text-base lowercase tracking-[-0.01em] text-white md:text-lg">
          {entry.title}
        </h3>
        <span className="flex flex-wrap items-center gap-2">
          {entry.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </span>
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
    </article>
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

// ─── Click wheel ────────────────────────────────────────────────────────────

function ClickWheel({
  onLeft,
  onRight,
}: {
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div className="relative select-none" style={{ width: 126, height: 126 }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(150deg, #38383a 0%, #1c1c1e 100%)",
          boxShadow:
            "0 10px 32px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />
      <button
        onClick={onLeft}
        className="absolute left-[10px] top-1/2 z-10 -translate-y-1/2 p-2 opacity-65 transition-opacity hover:opacity-100"
        aria-label="Previous"
      >
        <svg width="13" height="9" viewBox="0 0 14 10" fill="white">
          <polygon points="7,0 0,5 7,10" />
          <polygon points="14,0 7,5 14,10" />
        </svg>
      </button>
      <button
        onClick={onRight}
        className="absolute right-[10px] top-1/2 z-10 -translate-y-1/2 p-2 opacity-65 transition-opacity hover:opacity-100"
        aria-label="Next"
      >
        <svg width="13" height="9" viewBox="0 0 14 10" fill="white">
          <polygon points="0,0 7,5 0,10" />
          <polygon points="7,0 14,5 7,10" />
        </svg>
      </button>
      <div
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 50,
          height: 50,
          background: "linear-gradient(150deg, #3c3c3e 0%, #2a2a2c 100%)",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      />
    </div>
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
  const startRef = useRef(0);

  // Keep ref in sync so the rAF loop reads live progress without resubscribing.
  useEffect(() => {
    countRef.current = readyCount;
  }, [readyCount]);

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
      const target = countRef.current >= GATE_TARGET ? 1 : Math.max(assetFrac, timeFloor);
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

// ─── Page content ───────────────────────────────────────────────────────────

export function VibeCodingPageContent() {
  const [active, setActive] = useState(0);
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);
  const wheelCooldown = useRef(false);

  // ── Entry gate ─────────────────────────────────────────────────────────
  const [entryReady, setEntryReady] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const readyCountRef = useRef(0);

  const onMediaReady = useCallback(() => {
    const next = readyCountRef.current + 1;
    readyCountRef.current = next;
    setReadyCount(next);
    if (next >= GATE_TARGET) setEntryReady(true);
  }, []);

  // Hard fallback: open the gate after 5 s no matter what.
  useEffect(() => {
    const t = setTimeout(() => setEntryReady(true), 5000);
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

  // Expand the loaded set whenever the active slide moves. Window is dist ≤ 2
  // so neighbors + neighbors-of-neighbors warm up early.
  useEffect(() => {
    if (n === 0) return;
    setLoadedKeys((prev) => {
      const next = new Set(prev);
      const halfN = n / 2;
      visible.forEach((entry, i) => {
        let offset = i - active;
        if (offset > halfN) offset -= n;
        if (offset < -halfN) offset += n;
        if (Math.abs(offset) <= 2) next.add(entryKey(entry));
      });
      return next;
    });
  }, [active, visible, n]);

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
    <section className="relative flex flex-col md:h-full">
      <EntryGate ready={entryReady} readyCount={readyCount} />

      {/* Mobile: stacked list */}
      <div className="mx-auto w-full max-w-content px-6 md:hidden">
        <ul className="flex flex-col gap-10 pb-16">
          {visible.map((entry) => (
            <MobilePrototypeListItem key={entryKey(entry)} entry={entry} />
          ))}
        </ul>
      </div>

      {/* Tablet / desktop: carousel */}
      <div ref={carouselRef} className="relative hidden min-h-0 flex-1 overflow-hidden md:block">
        <div className="absolute inset-0 flex items-center justify-center">
          {visible.map((entry, i) => {
            const raw = i - active;
            const halfN = n / 2;
            let offset = raw;
            if (offset > halfN) offset -= n;
            if (offset < -halfN) offset += n;
            const dist = Math.abs(offset);
            const isActive = dist === 0;
            const shouldLoad = dist <= 2 || loadedKeys.has(entryKey(entry));
            return (
              <div
                key={entryKey(entry)}
                onClick={() => !isActive && setActive(i)}
                className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                  transform: `translateX(calc(${offset} * 42vw)) scale(${isActive ? 1 : 0.62})`,
                  opacity: isActive ? 1 : dist === 1 ? 0.1 : 0,
                  cursor: isActive ? "default" : "pointer",
                  zIndex: isActive ? 10 : 5 - dist,
                }}
              >
                <PrototypeCard
                  entry={entry}
                  shouldLoad={shouldLoad}
                  isActive={isActive}
                  onReady={onMediaReady}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Click wheel — desktop only */}
      <div className="hidden shrink-0 justify-center pb-8 md:flex">
        <ClickWheel onLeft={prev} onRight={next} />
      </div>
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
