"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Action } from "@/components/Action";
import { RoseLoader } from "@/components/RoseLoader";
import { SectionRail } from "@/components/SectionRail";
import { EASE } from "@/lib/motion";
import { SiteWindow } from "@/components/SiteWindow";
import { TurntableWidget } from "@/components/TurntableWidget";

type Tag = "app" | "web" | "interaction" | "ai";

type Media =
  | { kind: "video"; src: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "live"; href: string; url: string; label: string; poster?: string }
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
    date: "2026.09",
    title: "bom feature film",
    description: "Short feature film for O2 Tech AI's BOM sourcing product.",
    tags: ["ai"],
    media: { kind: "video", src: "/assets/lab/o2-bom-short.mp4" },
  },
  {
    date: "2026.05",
    title: "design agency website",
    description: "Studio website for a creative agency: brand expression, work showcase, and inquiry flow.",
    tags: ["web"],
    href: "https://qbix.space",
    hrefLabel: "open site",
    media: {
      kind: "live",
      href: "https://qbix.space",
      url: "qbix.space",
      label: "Design agency: live site preview",
      poster: "/assets/work/qbix-fullpage.webp",
    },
  },
  {
    date: "2026.06",
    title: "tiktok shared feed",
    description: "Self-initiated concept redesigning how friends' shared videos surface on TikTok: a Shared Feed tab, Smart Reactions, and reply-value ranking.",
    tags: ["app", "interaction"],
    href: "/work/tiktok",
    hrefLabel: "case study",
    media: { kind: "video", src: "/assets/TikTok/showcase.mp4" },
  },
  {
    date: "2025.12",
    title: "ai romance character chat",
    description: "Conversational prototype for a romance AI character: chat interface, persona pacing, and scene atmosphere.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character",
    hrefLabel: "case study",
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
    description: "Conversational prototype for an emotional-support AI character: ambient room interface as a listening space.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character/prototype-psych",
    hrefLabel: "open",
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
    description: "Conversational prototype for an astrology AI character: zodiac persona system and fortune-dialogue flow.",
    tags: ["ai", "interaction"],
    href: "/work/ai-character/prototype-astro",
    hrefLabel: "open",
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
    description: "End-to-end brand refresh and site redesign: identity system, information architecture, and interactions.",
    tags: ["web"],
    href: "https://hancao.space",
    hrefLabel: "open site",
    media: {
      kind: "live",
      href: "https://hancao.space",
      url: "hancao.space",
      label: "Personal portfolio: live site preview",
    },
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
    description: "Interactive cabinet for digital fortune-drawing: slip-pull interaction with reveal sequence.",
    tags: ["interaction"],
    href: "/code/playground/omikuji",
    hrefLabel: "open",
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
    description: "Ambient audio player: vinyl visual surface with generative lo-fi background music.",
    tags: ["interaction"],
    media: { kind: "custom", node: "turntable" },
  },
  {
    date: "2025.10",
    title: "gacha portfolio navigation",
    description: "Portfolio navigation built as a gacha experience: randomized reveal as a project-discovery interface.",
    tags: ["interaction"],
    href: "/code/playground/gacha",
    hrefLabel: "open",
    media: {
      kind: "iframe",
      src: "/code/playground/gacha?embed=1",
      href: "/code/playground/gacha",
      bg: "bg-[#070605]",
      title: "Gacha portfolio interactive prototype",
    },
  },
  // Hidden for now (not deleted) — restore by uncommenting.
  // {
  //   date: "2025.08",
  //   title: "saas homepage rebuild",
  //   description: "Homepage redesign for a SaaS product — narrative flow, motion language, and section rhythm.",
  //   tags: ["web"],
  //   media: { kind: "video", src: "/assets/work/apsara.mp4" },
  // },
  {
    date: "2025.05",
    title: "tts reading workflow",
    description: "Workflow redesign for a Chinese long-form text-to-speech reader: voice playback, sentence highlighting, and an immersive dark reading surface.",
    tags: ["ai", "interaction"],
    media: { kind: "image", src: "/assets/lab/tts-workflow.jpg", alt: "TTS reading workflow redesign: moody hero composition" },
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
    <div className="relative aspect-video overflow-hidden rounded-[22px]">
      {/* shimmer — fades out once video can play */}
      <div
        className={`absolute inset-0 animate-pulse bg-white/[0.035] transition-opacity duration-500 ${
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
    <div className="relative aspect-video overflow-hidden rounded-[22px]">
      <div
        className={`absolute inset-0 animate-pulse bg-white/[0.035] transition-opacity duration-500 ${
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
      className={`relative overflow-hidden rounded-[22px] ${bg}`}
      style={{ height: natural.h * scale }}
    >
      {/* shimmer overlay */}
      <div
        className={`absolute inset-0 z-10 animate-pulse bg-white/[0.035] transition-opacity duration-500 ${
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
        poster={media.poster}
        onReady={onReady}
      />
    );
  }
  if (media.kind === "iframe") {
    return (
      <Link
        href={media.href}
        className="group block"
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
      <div className="aspect-square w-full rounded-[22px] bg-white/[0.035]" />
    );
  }
  return null;
}

// ─── Active card FX (desktop) ──────────────────────────────────────────────
// The cursor-following lime arrow, the same affordance as the /work cards: →
// for a page on this site, ↗ for another site. Only when the card has a
// destination. Reduced motion: the arrow tracks without the spring.

const ARROW_SPRING = { stiffness: 400, damping: 30, mass: 0.5 } as const;

function ActiveCardFX({
  hasLink,
  external,
  children,
}: {
  hasLink: boolean;
  external: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Pixel pointer position → arrow (offset to centre the 56px button).
  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const axs = useSpring(ax, ARROW_SPRING);
  const ays = useSpring(ay, ARROW_SPRING);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ax.set(e.clientX - r.left - 28);
    ay.set(e.clientY - r.top - 28);
  };
  const enter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMove(e);
    setHovered(true);
  };

  return (
    <div className="relative" onMouseEnter={enter} onMouseMove={onMove} onMouseLeave={() => setHovered(false)}>
      {children}
      {hasLink && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-nltLime text-[#0a0b0c] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)]"
          style={{ x: reduced ? ax : axs, y: reduced ? ay : ays }}
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {external ? <ArrowUpRight className="h-6 w-6" strokeWidth={2.25} /> : <ArrowRight className="h-6 w-6" strokeWidth={2.25} />}
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
  caption,
  onReady,
}: {
  entry: Entry;
  shouldLoad: boolean;
  isActive: boolean;
  fluid?: boolean;
  caption?: { index: number; total: number };
  onReady?: () => void;
}) {
  const inner = (
    <MediaSlot media={entry.media} shouldLoad={shouldLoad} onReady={onReady} />
  );
  // iframe/live media carry their own destination; video/image/custom don't, so
  // when such an entry has an href (e.g. the TikTok case study) we make the media
  // itself the link so clicking the video opens the case study.
  const selfLinked = entry.media.kind === "live" || entry.media.kind === "iframe";
  const external = !!entry.href?.startsWith("http");
  const media =
    !selfLinked && entry.href ? (
      <Link
        href={entry.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={`Open ${entry.title}`}
        className="group block"
      >
        {inner}
      </Link>
    ) : (
      inner
    );
  // Live sites, embedded prototypes, and now media-linked entries show the hover arrow.
  const hasLink = selfLinked || !!entry.href;

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
          render flat. The caption block under it carries the title. */}
      {!fluid && isActive ? (
        <ActiveCardFX hasLink={hasLink} external={external}>{media}</ActiveCardFX>
      ) : (
        <div>{media}</div>
      )}
      {!fluid && caption ? <CardCaption {...caption} active={isActive} entry={entry} /> : null}

      {/* In-card header — mobile list only. */}
      {fluid && (
        <header className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-display text-base lowercase tracking-[-0.01em] text-white md:text-lg">
            {entry.title}
          </h3>
          {entry.href && entry.hrefLabel && (
            <Action href={entry.href} variant="label" tone="dark" className="ml-auto">
              {entry.hrefLabel}
            </Action>
          )}
        </header>
      )}
    </article>
  );
}

// ─── Editorial pieces (desktop) ────────────────────────────────────────────

/** Giant ghost index numeral floating behind the active card — cross-fades on
 *  switch (slide + fade, no blur tween). */
function GhostIndex({ index }: { index: number }) {
  const label = String(index + 1).padStart(2, "0");
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-end overflow-hidden pr-[2vw]"
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Caption centred under the active card: a lime block carrying the index and title,
 *  wiped in left → right (the LimeMark gesture) each time the card becomes
 *  active, plus the entry's link on the right. It rides inside the card's
 *  transformed wrapper, so it switches with the card. */
function CardCaption({
  entry,
  index,
  total,
  active,
}: {
  entry: Entry;
  index: number;
  total: number;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="mt-3 flex items-center justify-center gap-4"
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="inline-flex min-w-0 items-baseline gap-3 bg-nltLime px-3 py-1.5 text-[#0a0b0c]"
        initial={false}
        animate={{ clipPath: active || reduced ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1], delay: active ? 0.15 : 0 }}
      >
        <span className="shrink-0 font-mono text-[11px] tabular-nums tracking-[0.12em]">
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <h2 className="truncate font-display text-[clamp(16px,1.35vw,20px)] lowercase leading-[1.2] tracking-[-0.01em]">
          {entry.title}
        </h2>
      </motion.div>
      {entry.href && entry.hrefLabel ? (
        <Action href={entry.href} variant="label" tone="dark" tabIndex={active ? 0 : -1} className="shrink-0">
          {entry.hrefLabel}
        </Action>
      ) : null}
    </motion.div>
  );
}

/** Mobile feed — a single most-visible row owns the live heavy embed.
 *  Three prototype cards sit adjacent, so mounting heavy iframes by a scroll
 *  margin could pin three live apps at once and OOM the phone. Heavy embeds
 *  (full-app iframes + live sites) mount ONLY for the active (most-visible) row
 *  and unmount the instant another row takes over; lightweight video/image
 *  preload for the active row and its immediate neighbours. */
function MobileFeed({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("li[data-idx]"));
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (obsEntries) => {
        for (const e of obsEntries) {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          ratios.set(idx, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best = 0;
        let bestRatio = -1;
        ratios.forEach((r, idx) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = idx;
          }
        });
        setActiveIdx(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);

  return (
    <ul ref={ref} className="flex flex-col gap-10 pb-16">
      {entries.map((entry, i) => {
        const heavy = entry.media.kind === "iframe" || entry.media.kind === "live";
        const dist = Math.abs(i - activeIdx);
        const shouldLoad = enabled && (heavy ? dist === 0 : dist <= 1);
        return (
          <li key={entryKey(entry)} data-idx={i} className="min-w-0">
            {/* onReady not wired on mobile — the entry gate is desktop-only */}
            <PrototypeCard entry={entry} shouldLoad={shouldLoad} isActive fluid />
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop gallery — native vertical scroll with CSS scroll-snap: one card per
 *  snap stop (scroll-snap-stop: always, so a flick still lands one card on),
 *  the active card centred at full scale, its neighbours peeking above and
 *  below, dimmed and scaled down. Wheel, trackpad and the scrollbar-less
 *  gesture are the browser's own; arrows, the right rail and clicking a
 *  neighbour scroll a card to centre. Heavy embeds (full-app iframes + live
 *  sites) mount ONLY while active; lightweight video/image preload one card
 *  either side, the same memory guard as the mobile feed. */
const SLIDE_VH = 58;

function DesktopFeed({
  enabled,
  onReady,
}: {
  enabled: boolean;
  onReady: (key: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // mirrors `active` for the wheel listener; written where it is measured
  const activeRef = useRef(0);
  const n = entries.length;

  const scrollTo = useCallback((i: number) => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-slide="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // The active card is the slide nearest the scroller's centre.
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const slide = (window.innerHeight * SLIDE_VH) / 100;
      const idx = Math.max(0, Math.min(n - 1, Math.round(sc.scrollTop / slide)));
      activeRef.current = idx;
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      sc.removeEventListener("scroll", onScroll);
    };
  }, [n]);

  // A single mouse-wheel notch (~100px) is less than half a card, so mandatory
  // snapping would pull it straight back. When a wheel gesture with clear
  // intent settles on the card it started from, finish the step. Trackpad
  // flicks already land on the next card and pass through untouched.
  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc || !enabled) return;
    let accum = 0;
    let from = -1;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (from < 0) from = activeRef.current;
      accum += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        if (activeRef.current === from && Math.abs(accum) >= 60) {
          scrollTo(Math.max(0, Math.min(n - 1, from + Math.sign(accum))));
        }
        accum = 0;
        from = -1;
      }, 220);
    };
    sc.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      sc.removeEventListener("wheel", onWheel);
      if (idle) clearTimeout(idle);
    };
  }, [enabled, n, scrollTo]);

  // Arrow keys step one card (the scroller isn't focused by default).
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        scrollTo(Math.min(n - 1, active + 1));
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        scrollTo(Math.max(0, active - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, active, n, scrollTo]);

  return (
    <div className="relative hidden h-full md:block">
      <GhostIndex index={active} />

      <div
        ref={scrollerRef}
        className="absolute inset-0 z-10 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* half a screen of runway above and below, so the first and last
            cards can snap to centre too */}
        <div aria-hidden style={{ height: `calc(50% - ${SLIDE_VH / 2}vh)` }} />
        {entries.map((entry, i) => {
          const dist = Math.abs(i - active);
          const isActive = dist === 0;
          const heavy = entry.media.kind === "iframe" || entry.media.kind === "live";
          const shouldLoad = enabled && (heavy ? isActive : dist <= 1);
          return (
            <div
              key={entryKey(entry)}
              data-slide={i}
              className="flex snap-center snap-always items-center justify-center"
              style={{ height: `${SLIDE_VH}vh` }}
            >
              <div
                onClick={() => !isActive && scrollTo(i)}
                className="transition-[transform,opacity,filter] duration-500 ease-portfolio"
                style={{
                  transform: `scale(${isActive ? 1 : 0.66})`,
                  opacity: isActive ? 1 : dist === 1 ? 0.4 : 0,
                  // grayscale only: static desaturation is free, blur was jank
                  filter: isActive ? "none" : "grayscale(1) brightness(0.7)",
                  cursor: isActive ? "default" : "pointer",
                }}
              >
                <PrototypeCard
                  entry={entry}
                  shouldLoad={shouldLoad}
                  isActive={isActive}
                  caption={{ index: i, total: n }}
                  onReady={() => onReady(entryKey(entry))}
                />
              </div>
            </div>
          );
        })}
        <div aria-hidden style={{ height: `calc(50% - ${SLIDE_VH / 2}vh)` }} />
      </div>

      <SectionRail
        items={entries.map((e) => ({ id: entryKey(e), label: e.title }))}
        active={entryKey(entries[active])}
        onJump={(id) => scrollTo(entries.findIndex((e) => entryKey(e) === id))}
        counter
        labels="hover"
        ariaLabel="Prototypes"
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
                "radial-gradient(circle, rgba(210,255,0,0.35) 0%, rgba(210,255,0,0.08) 38%, transparent 68%)",
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
                boxShadow: "0 0 14px rgba(210,255,0,0.6)",
                transition: "width 90ms linear",
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
            <span>{ready ? "Ready" : "Loading"}</span>
            <span className="tabular-nums text-nltLime/90">
              {String(Math.min(percent, 100)).padStart(3, "0")}
            </span>
          </div>
        </motion.div>
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
  // Which layout is live. Both the desktop feed and the mobile list always render in
  // the React tree (only CSS hides one), so without this gate the hidden tree
  // still mounts its heavy prototype iframes — on a phone the invisible desktop
  // carousel was loading embeds on top of the mobile list and OOM-ing the tab.
  // Starts null so neither tree loads media until we know the viewport (no SSR
  // mismatch, no wasted first-paint load).
  const [view, setView] = useState<"mobile" | "desktop" | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setView("desktop");
      return;
    }
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setView(mq.matches ? "desktop" : "mobile");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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

  return (
    <section className="relative md:h-full">
      <EntryGate ready={entryReady} readyCount={readyCount} />

      {/* Mobile: stacked list */}
      <div className="mx-auto w-full max-w-content px-6 md:hidden">
        <MobileFeed enabled={view === "mobile"} />
      </div>

      {/* Tablet / desktop: vertical scroll-snap gallery */}
      <DesktopFeed enabled={view === "desktop"} onReady={onMediaReady} />
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
