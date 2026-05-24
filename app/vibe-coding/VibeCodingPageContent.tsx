"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SiteWindow } from "@/components/SiteWindow";
import { TurntableWidget } from "@/components/TurntableWidget";

type Tag = "app" | "web" | "interaction" | "ai";

type Media =
  | { kind: "video"; src: string }
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
    title: "auction × gacha mobile game",
    description: "Mobile game prototype combining a real-time bidding mechanic with a blind-box reward system.",
    tags: ["app"],
    media: { kind: "video", src: "/assets/app-design/bidking.mp4" },
  },
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
    title: "saas homepage rebuild",
    description: "Homepage redesign for a SaaS product — narrative flow, motion language, and section rhythm.",
    tags: ["web"],
    media: { kind: "video", src: "/assets/work/apsara.mp4" },
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
];

const allTags: Tag[] = ["app", "web", "interaction"];

function LazyVideo({ src, shouldLoad }: { src: string; shouldLoad: boolean }) {
  return (
    <div className="overflow-hidden rounded-md border border-black/10 bg-black/[0.03]">
      {shouldLoad && (
        <video
          className="block h-full w-full object-cover"
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
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
}: {
  src: string;
  title: string;
  bg: string;
  shouldLoad: boolean;
  natural?: { w: number; h: number };
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / natural.w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [natural.w]);

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden rounded-md border border-black/10 ${bg}`}
      style={{ height: natural.h * scale }}
    >
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
        />
      )}
    </div>
  );
}

function TagChip({ tag }: { tag: Tag }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/85">
      [{tag}]
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity ${
        active
          ? "text-textPrimary"
          : "text-textSecondary/55 hover:text-textSecondary"
      }`}
    >
      [{label}]
    </button>
  );
}

function MediaSlot({ media, shouldLoad }: { media: Media; shouldLoad: boolean }) {
  if (media.kind === "video") {
    return <LazyVideo src={media.src} shouldLoad={shouldLoad} />;
  }
  if (media.kind === "live") {
    return (
      <SiteWindow
        href={media.href}
        url={media.url}
        label={media.label}
        active={shouldLoad}
        chrome={false}
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
        />
      </Link>
    );
  }
  if (media.kind === "custom" && media.node === "turntable") {
    return shouldLoad ? <TurntableWidget /> : <div className="aspect-square w-full rounded-md bg-black/[0.03]" />;
  }
  return null;
}

function PrototypeCard({
  entry,
  shouldLoad,
  isActive,
  fluid = false,
}: {
  entry: Entry;
  shouldLoad: boolean;
  isActive: boolean;
  /** When true the card stretches to fill its container (used in the mobile list). */
  fluid?: boolean;
}) {
  return (
    <article
      className={fluid ? "w-full" : "w-[min(56vw,520px)]"}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      <div>
        <MediaSlot media={entry.media} shouldLoad={shouldLoad} />
      </div>
      <header className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-base lowercase tracking-[-0.01em] text-textPrimary md:text-lg">
          {entry.title}
        </h3>
        <span className="flex flex-wrap items-baseline gap-2">
          {entry.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </span>
        {entry.href && entry.hrefLabel && (
          <Link
            href={entry.href}
            className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/70 transition-opacity hover:opacity-60"
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

/** Mobile list item that only mounts its media after the row scrolls into
 *  view. Because IntersectionObserver treats `display: none` ancestors as
 *  non-intersecting, the mobile list never fires on desktop where it sits
 *  hidden under `md:hidden` — so iframes aren't double-mounted alongside the
 *  carousel. Once loaded, an item stays loaded. */
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
      <PrototypeCard entry={entry} shouldLoad={shouldLoad} isActive fluid />
    </li>
  );
}

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
        className="absolute left-[10px] top-1/2 -translate-y-1/2 z-10 p-2 transition-opacity opacity-65 hover:opacity-100"
        aria-label="Previous"
      >
        <svg width="13" height="9" viewBox="0 0 14 10" fill="white">
          <polygon points="7,0 0,5 7,10" />
          <polygon points="14,0 7,5 14,10" />
        </svg>
      </button>
      <button
        onClick={onRight}
        className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10 p-2 transition-opacity opacity-65 hover:opacity-100"
        aria-label="Next"
      >
        <svg width="13" height="9" viewBox="0 0 14 10" fill="white">
          <polygon points="0,0 7,5 0,10" />
          <polygon points="7,0 14,5 7,10" />
        </svg>
      </button>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
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

/** Stable identity for an entry — used as the sticky-load key so we don't
 *  unmount/remount media when the user scrolls away from a card. */
const entryKey = (e: Entry) => `${e.date}::${e.title}`;

export function VibeCodingPageContent() {
  const [filter, setFilter] = useState<Tag | "all">("all");
  // Default to index 1 (qbix) so bidking, qbix, and hancao are all visible on first paint.
  const [active, setActive] = useState(1);
  // Once a card has been within the load window, it stays loaded — prevents
  // expensive iframes (qbix, hancao, the prototype routes) from reloading
  // every time the user navigates back to them, and lets a card pre-warm
  // even before it becomes the active slide.
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.tags.includes(filter));
  }, [filter]);

  const n = visible.length;

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + n) % n);
  }, [n]);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % n);
  }, [n]);

  const changeFilter = useCallback((f: Tag | "all") => {
    setFilter(f);
    setActive(0);
  }, []);

  // Expand the loaded set whenever the active slide moves. Window is dist ≤ 2
  // so neighbors + neighbors-of-neighbors warm up early; combined with the
  // sticky set above, the carousel becomes fully loaded after a few clicks.
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <section className="flex flex-col md:h-full">
      {/* Filter */}
      <header className="mx-auto w-full max-w-content shrink-0 px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <FilterChip
            label="all"
            active={filter === "all"}
            onClick={() => changeFilter("all")}
          />
          {allTags.map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={filter === t}
              onClick={() => changeFilter(t)}
            />
          ))}
        </div>
      </header>

      {/* Mobile: stacked list — no carousel, no click wheel. Each list item
          gates its own media on viewport intersection so a desktop visitor
          (where this list is `md:hidden`) never pays to load any of these
          iframes; only the carousel below mounts. */}
      <div className="mx-auto mt-6 w-full max-w-content px-6 md:hidden">
        {n === 0 ? (
          <p className="py-12 text-center text-sm text-textSecondary">
            Nothing here yet under <TagChip tag={filter as Tag} />.
          </p>
        ) : (
          <ul className="flex flex-col gap-10 pb-16">
            {visible.map((entry) => (
              <MobilePrototypeListItem key={entryKey(entry)} entry={entry} />
            ))}
          </ul>
        )}
      </div>

      {/* Tablet / desktop: carousel */}
      <div className="relative hidden min-h-0 flex-1 overflow-hidden md:block">
        <div className="absolute inset-0 flex items-center justify-center">
          {visible.map((entry, i) => {
            // Shortest-path offset for wrap-around carousel.
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
                  transform: `translateX(calc(${offset} * 38vw)) scale(${isActive ? 1 : 0.78})`,
                  opacity: isActive ? 1 : dist === 1 ? 0.28 : 0,
                  cursor: isActive ? "default" : "pointer",
                  zIndex: isActive ? 10 : 5 - dist,
                }}
              >
                <PrototypeCard
                  entry={entry}
                  shouldLoad={shouldLoad}
                  isActive={isActive}
                />
              </div>
            );
          })}
          {n === 0 && (
            <p className="text-sm text-textSecondary">
              Nothing here yet under <TagChip tag={filter as Tag} />.
            </p>
          )}
        </div>
      </div>

      {/* Click wheel — desktop only; mobile uses native scroll */}
      <div className="hidden shrink-0 justify-center pb-8 md:flex">
        <ClickWheel onLeft={prev} onRight={next} />
      </div>
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
