"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaseStudyMobileToc } from "@/components/CaseStudyMobileToc";

const mediaRound = "rounded-xl";
const EMSK = [0.76, 0, 0.24, 1] as const;

/** Room tabs only — compact control, not repeated as "chips" across the page */
const roomTab = {
  base: "inline-flex items-center justify-center rounded-full border px-4 py-2 font-sans text-[12px] font-medium tracking-[0.02em] transition-all duration-300 ease-out",
  on: "border-transparent bg-textPrimary text-white shadow-sm",
  off: "border-black/[0.1] bg-white text-textSecondary hover:border-black/20 hover:text-textPrimary",
} as const;

function SitePreviewFrame({
  eyebrow,
  title,
  src,
  href,
}: {
  eyebrow: string;
  title: string;
  src: string;
  href: string;
}) {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-black/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-surfaceAlt/45 px-4 py-3 md:px-5">
        <div>
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-textSecondary">{eyebrow}</p>
          <p className="mt-2 font-sans text-[13px] font-medium text-textPrimary">{title}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-sans text-[12px] font-medium tracking-wide text-textSecondary underline decoration-black/[0.12] underline-offset-[5px] transition-colors hover:text-textPrimary hover:decoration-textPrimary/35"
        >
          Open in browser
        </a>
      </div>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[min(72vh,780px)] min-h-[420px] w-full border-0 bg-white md:h-[min(68vh,860px)] md:min-h-[560px]"
      />
      <p className="border-t border-black/[0.05] bg-surfaceAlt/30 px-4 py-2.5 font-sans text-[11px] leading-relaxed text-textSecondary md:px-5">
        If the frame is empty, the host blocks embedding — use Open in browser.
      </p>
    </div>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return <span className="font-normal text-textPrimary">{children}</span>;
}


function RevealLine({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`h-px origin-left bg-black/[0.07] ${className}`}
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={reduced ? undefined : { scaleX: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

const caseNavItems = [
  { id: "problem", label: "The Problem" },
  { id: "d1-showroom", label: "Decision 01" },
  { id: "d2-capability", label: "Decision 02" },
  { id: "d3-acceleration", label: "Decision 03" },
  { id: "how-i-worked", label: "How I Worked" },
  { id: "product-showcase", label: "Product Showcase" },
  { id: "backend", label: "Contribution" },
  { id: "outcome", label: "Impact" },
  { id: "takeaway", label: "Takeaway" },
] as const;

function CaseStudyNav() {
  const [active, setActive] = useState<string>("problem");
  const SECTION_SCROLL_OFFSET = 112;
  const navItems = caseNavItems;

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && navItems.some((i) => i.id === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const ids = navItems.map((i) => i.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) setActive(top.target.id);
      },
      { root: null, rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: string, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    setActive(id);
  }

  return (
    <nav
      aria-label="Case study sections"
      // Center vertically with flex instead of `pt-40 + top-[calc(50vh-10rem)]`,
      // which on shorter viewports pushed the bottom items past the fold and
      // clipped them. Flex centering keeps the rail in view regardless of height.
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-screen w-[11rem] select-none flex-col justify-center lg:flex"
    >
      <div className="pointer-events-auto px-6">
        <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-textSecondary/60">On this page</p>
        <ul className="mt-5 max-h-[calc(100vh-12rem)] space-y-0 overflow-y-auto overscroll-contain pr-1">
          {navItems.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => scrollToSection(id, e)}
                  className={`block border-l-[1.5px] border-transparent py-1.5 pl-4 text-left text-[12px] leading-snug transition-[color,border-color,opacity,transform] duration-500 ease-out ${
                    isActive
                      ? "border-nltLime font-medium text-textPrimary"
                      : "text-textSecondary/90 hover:translate-x-0.5 hover:border-nltLime/40 hover:text-textPrimary"
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

type PlaceholderProps = { label: string; src: string; className?: string };

function ImagePlaceholder({ label, src, className = "" }: PlaceholderProps) {
  return (
    <div
      className={`group relative overflow-hidden bg-black/[0.02] shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] ${mediaRound} ${className}`}
      role="img"
      aria-label={label}
    >
      <img src={src} alt={label} className={`h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] ${mediaRound}`} loading="lazy" />
    </div>
  );
}

type ShowcaseVideoProps = {
  label: string;
  src: string;
  poster?: string;
  caption?: string;
  className?: string;
  autoPlay?: boolean;
  /** Play while in viewport; pause when scrolled away (muted until user unmutes — required for autoplay). Ignored when autoPlay is true. */
  playWhenInView?: boolean;
  /** Default metadata — use auto for long MP4s or odd paths so the first frame buffers reliably. */
  preload?: "none" | "metadata" | "auto";
};

function ShowcaseVideo({
  label,
  src,
  poster,
  caption,
  className = "",
  autoPlay = false,
  playWhenInView = true,
  preload = "metadata",
}: ShowcaseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (autoPlay || !playWhenInView) return;
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries[0];
        if (!hit) return;
        if (hit.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { root: null, rootMargin: "-10% 0px -12% 0px", threshold: [0, 0.15, 0.35] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [autoPlay, playWhenInView, src]);

  const startMuted = autoPlay || playWhenInView;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = startMuted;
  }, [src, startMuted]);

  return (
    <figure className={`overflow-hidden bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] transition-shadow duration-700 ease-out hover:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.13)] ${mediaRound} ${className}`}>
      <div className={`bg-black ${mediaRound}`}>
        <video
          ref={videoRef}
          className={`h-auto w-full object-contain ${mediaRound}`}
          controls
          playsInline
          muted={startMuted}
          preload={preload}
          poster={poster}
          autoPlay={autoPlay}
          loop={autoPlay}
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {caption ? (
        <figcaption className="border-t border-black/[0.05] px-5 py-3.5 font-sans text-[12px] leading-relaxed tracking-wide text-textSecondary/95">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Deep-links into the live showroom prototypes — each URL mounts the prototype
 *  straight into the moment its feature is opened, so the case-study feature
 *  cards show the real interactive prototype instead of a screen recording. */
const FEATURE_PROTOTYPES = {
  heartbeat: "/work/ai-character/prototype?embed=1&muted=1&focus=heartbeat",
  story: "/work/ai-character/prototype?embed=1&muted=1&focus=story",
  moments: "/work/ai-character/prototype?embed=1&muted=1&focus=moments",
  altUniverse: "/work/ai-character/prototype?embed=1&muted=1&focus=alt-universe",
  inspire: "/work/ai-character/prototype?embed=1&muted=1&focus=inspire",
  code: "/work/ai-character/prototype?embed=1&muted=1&focus=code",
  astroProfile: "/work/ai-character/prototype-astro?embed=1&focus=profile",
  therapyAnalysis: "/work/ai-character/prototype-psych?embed=1&focus=analysis",
  therapyCode: "/work/ai-character/prototype-psych?embed=1&focus=code",
} as const;

// Render the prototype at full desktop size and scale it down to fit, so the
// embed reads like the full-screen app (just smaller) instead of reflowing into
// a cramped narrow layout. The frame stays 16:9 at every width — including
// mobile, where the whole desktop view simply scales down further (never goes
// portrait).
const FEATURE_FRAME_W = 1440;
const FEATURE_FRAME_H = 810; // 16:9

function FeaturePrototypeEmbed({
  label,
  src,
  caption,
  className = "",
}: {
  label: string;
  src: string;
  caption?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [load, setLoad] = useState(false);

  // Track the rendered width so the fixed-size desktop iframe can be scaled to fit.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Don't boot every prototype app at once — mount each iframe only as it nears
  // the viewport, then leave it running.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLoad(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoad(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scale = width > 0 ? width / FEATURE_FRAME_W : 0;
  const displayH = Math.round(FEATURE_FRAME_H * scale);

  return (
    <figure className={`overflow-hidden bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] ${mediaRound} ${className}`}>
      <div
        ref={frameRef}
        className={`relative w-full overflow-hidden bg-[#0b0b10] ${mediaRound}`}
        style={{ height: displayH || undefined, aspectRatio: displayH ? undefined : `${FEATURE_FRAME_W} / ${FEATURE_FRAME_H}` }}
      >
        {load && scale > 0 ? (
          <iframe
            title={label}
            src={src}
            loading="lazy"
            className="absolute left-0 top-0 border-0"
            style={{
              width: FEATURE_FRAME_W,
              height: FEATURE_FRAME_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Loading prototype…</span>
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="border-t border-black/[0.05] px-5 py-3.5 font-sans text-[12px] leading-relaxed tracking-wide text-textSecondary/95">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const SHOWCASE_GALLERY_SLIDE_MS = 9000;

const showcaseGallerySlides = [
  {
    tab: "Romance",
    label: "Romance showroom",
    src: "/assets/ai-character/new-cover.mp4",
    poster: "/assets/ai-character/showcase.jpg",
    caption: "Memory makes every return feel earned.",
  },
  {
    tab: "Astrology",
    label: "Astrology showroom",
    src: "/assets/ai-character/taobaibai-1.mp4",
    caption: "Every word updates what it knows about you.",
  },
  {
    tab: "Therapy",
    label: "Therapy showroom",
    src: "/assets/ai-character/therapy-1.mp4",
    caption: "You see what it understood, not just what it said.",
  },
] as const;

function ShowcaseSlideGallery({ reduced }: { reduced: boolean | null }) {
  const [index, setIndex] = useState(0);
  // Once the visitor picks a tab, stop auto-advancing so they can study it.
  const [userPicked, setUserPicked] = useState(false);
  const len = showcaseGallerySlides.length;
  const slide = showcaseGallerySlides[index];
  const galleryFigureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced || userPicked) return;
    const id = window.setInterval(() => {
      setIndex((v) => (v + 1) % len);
    }, SHOWCASE_GALLERY_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduced, len, userPicked]);

  useEffect(() => {
    if (reduced) return;
    const root = galleryFigureRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const sync = () => {
      const vid = root.querySelector("video");
      if (!vid) return;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const inView = r.top < vh * 0.88 && r.bottom > vh * 0.12;
      if (inView) void vid.play().catch(() => {});
      else vid.pause();
    };

    const obs = new IntersectionObserver(
      (entries) => {
        const vid = root.querySelector("video");
        if (!vid) return;
        if (entries[0]?.isIntersecting) void vid.play().catch(() => {});
        else vid.pause();
      },
      { root: null, rootMargin: "-10% 0px -12% 0px", threshold: [0, 0.15, 0.35] }
    );
    obs.observe(root);
    const id = requestAnimationFrame(() => sync());
    return () => {
      cancelAnimationFrame(id);
      obs.disconnect();
    };
  }, [reduced, index, slide.src]);

  return (
    <div className="mt-10 md:mt-12">
      <div
        className="flex flex-wrap gap-2.5 border-b border-black/[0.06] pb-4"
        role="tablist"
        aria-label="Showroom video slides"
      >
        {showcaseGallerySlides.map((s, i) => {
          const on = i === index;
          return (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => {
                setUserPicked(true);
                setIndex(i);
              }}
              className={`${roomTab.base} ${on ? roomTab.on : roomTab.off}`}
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      <figure
        ref={galleryFigureRef}
        className={`mt-8 overflow-hidden bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] ${mediaRound}`}
      >
        <div className={`relative aspect-video bg-black md:min-h-[min(52vw,28rem)] ${mediaRound}`}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={slide.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <video
                className={`h-full w-full object-contain ${mediaRound}`}
                controls
                playsInline
                muted
                loop
                preload="metadata"
                poster={"poster" in slide ? slide.poster : undefined}
                aria-label={slide.label}
              >
                <source src={slide.src} type="video/mp4" />
              </video>
            </motion.div>
          </AnimatePresence>
        </div>
        <figcaption className="border-t border-black/[0.05] px-5 py-3.5 font-sans text-[12px] leading-relaxed tracking-wide text-textSecondary/95">
          {slide.caption}
        </figcaption>
      </figure>
    </div>
  );
}

const additionalShowroomGalleryItems: {
  id: "astrology" | "therapy";
  room: string;
  capability: string;
  body: string;
  prototypeSrc: string;
  videoCaption: string;
}[] = [
  {
    id: "astrology",
    room: "Astrology Room",
    capability: "Real-time memory updates",
    body: "A personal constellation file updates during conversation — memory becomes transparent and inspectable.",
    prototypeSrc: FEATURE_PROTOTYPES.astroProfile,
    videoCaption: "Your profile rewrites in real time.",
  },
  {
    id: "therapy",
    room: "Therapy Room",
    capability: "Real-time analysis",
    body: "A live panel surfaces conversation themes — users see what the system understood, not just what it said.",
    prototypeSrc: FEATURE_PROTOTYPES.therapyAnalysis,
    videoCaption: "The model's read, visible beside your words.",
  },
];

function AdditionalShowroomsGallery() {
  return (
    <motion.div
      className="mt-14 space-y-14 md:mt-16 md:space-y-20"
      variants={innovationContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {additionalShowroomGalleryItems.map((item) => (
        <motion.article key={item.id} variants={innovationItem} className="block">
          <h3 className="font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:text-[1.28rem]">{item.room}</h3>
          <p className="mt-3 font-sans text-[13px] font-medium leading-snug tracking-wide text-textSecondary/95">{item.capability}</p>
          <p className="mt-3 max-w-prose font-sans text-[16px] leading-[1.65] text-textSecondary">{item.body}</p>
          <FeaturePrototypeEmbed
            label={`${item.room} — live prototype`}
            src={item.prototypeSrc}
            caption={item.videoCaption}
            className="mt-6"
          />
        </motion.article>
      ))}
    </motion.div>
  );
}

const d1CycleOrder: Array<(typeof vibeCodingShowrooms)[number]["id"]> = [
  "therapy",
  "romance",
  "astrology",
];

const PROTO_W = 1440;
const PROTO_H = 900;

function D1BeforeAfter() {
  const [idx, setIdx] = useState(0);
  const afterRef = useRef<HTMLDivElement>(null);
  const [afterWidth, setAfterWidth] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % d1CycleOrder.length), 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = afterRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setAfterWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeId = d1CycleOrder[idx];
  const activeRoom = vibeCodingShowrooms.find((s) => s.id === activeId) ?? vibeCodingShowrooms[2];
  const scale = afterWidth > 0 ? afterWidth / PROTO_W : 0;
  const displayH = Math.round(PROTO_H * scale);

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {/* Before */}
      <div>
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-textSecondary/70">
          Before — Generic chat
        </p>
        <div className="overflow-hidden rounded-xl bg-black ring-1 ring-black/[0.08]">
          <video
            className="w-full h-auto"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Before — static documentation and generic chat"
          >
            <source src="/assets/ai-character/before.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* After — auto-cycling prototype */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-textSecondary/70">
            After —{" "}
            <span className="text-textSecondary/70">{activeRoom.tab} room</span>
          </p>
          <div className="flex items-center gap-1.5">
            {d1CycleOrder.map((id, i) => (
              <button
                key={id}
                type="button"
                aria-label={`Show ${id} room`}
                onClick={() => setIdx(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === idx ? "w-5 bg-textPrimary" : "w-1 bg-black/[0.15] hover:bg-black/30"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          ref={afterRef}
          className={`relative overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-500 ${vibeGalleryChrome[activeId]}`}
          style={{ height: displayH || undefined, aspectRatio: displayH ? undefined : `${PROTO_W}/${PROTO_H}` }}
        >
          {d1CycleOrder.map((id, i) => {
            const room = vibeCodingShowrooms.find((s) => s.id === id)!;
            return (
              <div
                key={id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  i === idx ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {scale > 0 && (
                  <iframe
                    title={room.title}
                    src={room.src}
                    loading="lazy"
                    className={`absolute top-0 left-0 border-0 ${vibeIframeBg[id]}`}
                    style={{
                      width: PROTO_W,
                      height: PROTO_H,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Calmer, Apple-adjacent motion (ease-out, minimal travel) */
const easePremium = [0.22, 1, 0.36, 1] as const;

/** Hero headline stack — slightly slower, softer deceleration */
const easeHero = [0.19, 1, 0.22, 1] as const;

const heroStack = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.98, ease: easeHero } },
};

const heroLinks = [
  { href: "/work/ai-character/deck-present", label: "View Presentation Deck" },
] as const;

const introBlockContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.085, delayChildren: 0.06 } },
};

const introBlockItem = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.88, ease: easePremium } },
};

const introMetaBlock = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.02 } },
};

const introMetaRow = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easePremium } },
};

const sectionRoot = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const sectionPiece = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.0, ease: easePremium } },
};

const sectionHeadInner = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: 0.88, ease: EMSK } },
};

const metaFields = [
  { label: "Role", value: "Sole UX designer — research to production code" },
  { label: "Timeline", value: "4 weeks · July–August 2025" },
  { label: "Team", value: "Me · 2 supervisors · 2 PM · 1 engineer" },
  {
    label: "Owned",
    value: "UX strategy · 4 showrooms (UX + visual) · design system templates",
  },
];

const vibeCodingShowrooms = [
  {
    id: "romance",
    tab: "Romance",
    label: "Romance showroom",
    href: "/work/ai-character/prototype",
    src: "/work/ai-character/prototype?muted=1",
    title: "Romance showroom prototype",
    caption: "Long-term memory and emotional pacing in one flow.",
  },
  {
    id: "astrology",
    tab: "Astrology",
    label: "Astrology showroom",
    href: "/work/ai-character/prototype-astro",
    src: "/work/ai-character/prototype-astro?embed=1",
    title: "Astrology showroom prototype",
    caption: "Live constellation-file updates while chatting.",
  },
  {
    id: "therapy",
    tab: "Therapy",
    label: "Therapy showroom",
    href: "/work/ai-character/prototype-psych",
    src: "/work/ai-character/prototype-psych?embed=1",
    title: "Therapy showroom prototype",
    caption: "Visible analysis layer beside the conversation.",
  },
] as const;

/** Multi-stop shells aligned with playground showroom gradients (no flat white chrome). */
const vibeGalleryChrome: Record<(typeof vibeCodingShowrooms)[number]["id"], string> = {
  astrology:
    "border-purple-950/18 bg-[linear-gradient(152deg,#ede4ff_0%,#fcf8f5_34%,#f8eef3_61%,#e2d7f9_100%)] shadow-[0_22px_56px_-30px_rgba(88,60,132,0.28)] ring-1 ring-purple-950/[0.07]",
  therapy:
    "border-sky-900/16 bg-[linear-gradient(162deg,#c9e9ff_0%,#f2fbff_36%,#def3fc_64%,#bfe0f7_100%)] shadow-[0_22px_56px_-30px_rgba(40,110,165,0.22)] ring-1 ring-sky-800/[0.08]",
  romance:
    "border-amber-950/35 bg-[linear-gradient(168deg,#362f2a_0%,#17141a_40%,#1c1510_75%,#0a090c_100%)] shadow-[0_26px_60px_-26px_rgba(0,0,0,0.55)] ring-1 ring-amber-950/25",
};

const vibeIframeBg: Record<(typeof vibeCodingShowrooms)[number]["id"], string> = {
  astrology: "bg-[#fdfaf5]",
  therapy: "bg-[#f8fcff]",
  romance: "bg-[#060608]",
};

function VibeCodingPrototypeGallery() {
  const [activeId, setActiveId] = useState<(typeof vibeCodingShowrooms)[number]["id"]>("romance");
  const item = vibeCodingShowrooms.find((s) => s.id === activeId) ?? vibeCodingShowrooms[0];

  return (
    <div className="w-full pt-6 md:pt-8">
      {/* Capsule switch */}
      <div
        className="flex flex-wrap gap-2.5 border-b border-black/[0.06] pb-4"
        role="tablist"
        aria-label="Live prototype showrooms"
      >
        {vibeCodingShowrooms.map((s) => {
          const on = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActiveId(s.id)}
              className={`${roomTab.base} ${on ? roomTab.on : roomTab.off}`}
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      {/* Active prototype */}
      <div
        className={`mt-8 border shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-500 ease-out ${vibeGalleryChrome[item.id]} ${mediaRound}`}
      >
        <div
          className={`sticky top-20 z-30 flex flex-wrap items-start justify-between gap-3 rounded-tl-xl rounded-tr-xl border-b px-4 py-3 backdrop-blur-sm md:top-16 md:px-6 ${
            item.id === "romance"
              ? "border-white/[0.1] bg-[#0d0b10]/90"
              : "border-black/[0.07] bg-white/90"
          }`}
        >
          <div className="min-w-0">
            <p
              className={`font-sans text-[11px] font-medium uppercase tracking-[0.16em] ${
                item.id === "romance" ? "text-stone-500" : "text-textSecondary"
              }`}
            >
              {item.label}
            </p>
            <p
              className={`mt-1.5 font-sans text-[13px] font-medium ${
                item.id === "romance" ? "text-stone-100" : "text-textPrimary"
              }`}
            >
              {item.caption}
            </p>
          </div>
          <Link
            href={item.href}
            className={`shrink-0 font-sans text-[12px] font-medium tracking-wide underline underline-offset-[5px] transition-colors duration-300 ${
              item.id === "romance"
                ? "text-amber-200/90 decoration-amber-200/35 hover:text-amber-100 hover:decoration-amber-100/55"
                : "text-textSecondary decoration-black/[0.12] hover:text-textPrimary hover:decoration-textPrimary/35"
            }`}
          >
            Open full page
          </Link>
        </div>
        <div className="overflow-hidden rounded-b-xl">
          <iframe
            key={item.id}
            title={item.title}
            src={item.src}
            className={`h-[min(56vh,820px)] min-h-[320px] w-full md:h-[min(72vh,820px)] md:min-h-[560px] ${vibeIframeBg[item.id]}`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function CountUpStat({ value }: { value: string }) {
  // All hooks run unconditionally; the non-numeric early-out happens only at
  // render time below, after the hooks (Rules of Hooks).
  const match = value.match(/^([+]?)(\d+)(.*)$/);
  const to = match ? parseInt(match[2], 10) : 0;
  const from = Math.round(to * 0.82);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [n, setN] = useState(from);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const dur = 700;
    const start = performance.now();
    const tick = (ts: number) => {
      const t = Math.min((ts - start) / dur, 1);
      setN(Math.round(from + (1 - Math.pow(1 - t, 3)) * (to - from)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, from]);

  if (!match) return <>{value}</>;
  const [, prefix, , suffix] = match;
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

function Section({
  id,
  eyebrow,
  title,
  bordered = true,
  children,
}: {
  id: string;
  eyebrow: string;
  title?: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-14 md:scroll-mt-28 md:py-28 ${bordered ? "border-t border-black/[0.05]" : ""}`}
    >
      <motion.div
        className="w-full"
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={{ once: true, margin: "-12% 0px" }}
        variants={reduced ? undefined : sectionRoot}
      >
        <motion.p
          className="max-w-reading font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-textSecondary"
          variants={reduced ? undefined : sectionPiece}
        >
          {eyebrow}
        </motion.p>
        {title?.trim() ? (
          <div className="mt-5 overflow-hidden md:mt-6">
            <motion.h2
              className="max-w-reading font-display text-[1.55rem] font-light leading-[1.14] tracking-[-0.02em] text-textPrimary md:text-[2rem] md:leading-[1.1]"
              variants={reduced ? undefined : sectionHeadInner}
            >
              {title}
            </motion.h2>
          </div>
        ) : null}
        <motion.div
          className={`space-y-9 font-sans text-[17px] leading-[1.72] tracking-[-0.011em] text-textSecondary/95 md:space-y-10 md:text-[1.0625rem] md:leading-[1.76] [&>blockquote]:mx-auto [&>blockquote]:max-w-reading [&>blockquote]:font-display [&>blockquote]:text-textPrimary [&>h3]:max-w-reading [&>h4]:max-w-reading [&>ol]:max-w-reading [&>p]:max-w-reading [&>ul]:max-w-reading ${title?.trim() ? "mt-12 md:mt-14" : "mt-8 md:mt-10"}`}
          variants={reduced ? undefined : sectionPiece}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

function DecisionFrame({
  line1,
  line2,
  line3,
}: {
  line1: string;
  line2: string;
  line3: string;
}) {
  return (
    <div className="mt-8 space-y-5 border-t border-black/[0.1] pt-7">
      <p className="font-sans text-[16px] leading-relaxed text-textSecondary">{line1}</p>
      <p className="font-sans text-[16px] leading-relaxed text-textSecondary">{line2}</p>
      <p className="font-sans text-[16px] leading-relaxed text-textSecondary">{line3}</p>
    </div>
  );
}

const innovations: {
  id: string;
  name: string;
  capability: string;
  detail: ReactNode;
  workflowSrc: string;
  prototypeSrc: string;
  videoCaption: string;
  notShipped?: true;
  /** Collapsed to a header by default; the visitor expands to reveal the prototype. */
  collapsible?: true;
}[] = [
  {
    id: "heartbeat-power",
    name: "Heartbeat Power",
    capability: "Real-time generation + character depth modeling",
    workflowSrc: "/assets/ai-character/interaction/heartbeat_power_workflow.svg",
    prototypeSrc: FEATURE_PROTOTYPES.heartbeat,
    videoCaption: "One tap. What it was actually thinking.",
    detail: (
      <>
        A tap-to-reveal <Em>inner-monologue card</Em> creates <Em>emotional privilege</Em> — users glimpse the
        character&apos;s subtext without breaking the surface illusion.
      </>
    ),
  },
  {
    id: "story-unlock",
    collapsible: true,
    name: "Story Unlock",
    capability: "Progressive memory building",
    workflowSrc: "/assets/ai-character/interaction/story_unlock_workflow.svg",
    prototypeSrc: FEATURE_PROTOTYPES.story,
    videoCaption: "Go deeper. The character opens up.",
    detail: (
      <>
        <Em>Backstory milestones</Em> unlock through conversation depth — one knowledge base revealing progressively
        across two interaction layers.
      </>
    ),
  },
  {
    id: "moments-feed",
    name: "Moments Feed",
    capability: "Generation from memory history",
    workflowSrc: "/assets/ai-character/interaction/moments_feed_workflow.svg",
    prototypeSrc: FEATURE_PROTOTYPES.moments,
    videoCaption: "It keeps living between sessions.",
    detail: (
      <>
        <Em>Instagram-style posts</Em> generated from interaction history sustain <Em>off-session presence</Em> — the
        character keeps existing between conversations.
      </>
    ),
  },
  {
    id: "alternate-universe",
    collapsible: true,
    name: "Alternate Universe Events",
    capability: "Long-term memory + generative storytelling",
    workflowSrc: "/assets/ai-character/interaction/alternate_universe_events_workflow.svg",
    prototypeSrc: FEATURE_PROTOTYPES.altUniverse,
    videoCaption: "A scene only your history could trigger.",
    notShipped: true,
    detail: (
      <>
        Scenes triggered by <Em>personal history</Em> recontextualize the relationship — variable rewards from real shared context.
      </>
    ),
  },
];

const innovationContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
};

const innovationItem = {
  hidden: { opacity: 0, y: 12, filter: "blur(3px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: easePremium } },
};

function InteractionInnovationList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  return (
    <motion.div
      className="space-y-14 pt-3 md:space-y-20"
      variants={innovationContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {innovations.map((item) => {
        const isOpen = openId === item.id;

        const workflowToggle = !item.notShipped ? (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={`workflow-panel-${item.id}`}
            id={`innovation-trigger-${item.id}`}
            onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
            className="shrink-0 rounded-full border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 font-sans text-[12px] font-medium tracking-wide text-textSecondary transition-colors duration-300 hover:bg-black/[0.04] hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary"
          >
            {isOpen ? "Hide workflow" : "LLM workflow"}
          </button>
        ) : null;

        const workflowPanel =
          isOpen && !item.notShipped ? (
            <div
              id={`workflow-panel-${item.id}`}
              role="region"
              aria-labelledby={`innovation-trigger-${item.id}`}
              className={`mt-6 overflow-hidden ring-1 ring-black/[0.06] ${mediaRound}`}
            >
              <p className="border-b border-black/[0.06] bg-surfaceAlt/30 px-5 py-3 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-textSecondary md:px-6">LLM workflow</p>
              <div className="relative overflow-hidden bg-black/[0.02]">
                <img
                  src={item.workflowSrc}
                  alt={`${item.name} — LLM workflow`}
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          ) : null;

        // Story Unlock and the unshipped Alternate Universe concept stay collapsed
        // until the visitor opts in — they shouldn't compete with the shipped
        // headline features, and collapsing also defers booting their iframes.
        if (item.collapsible) {
          const isExpanded = expandedIds.includes(item.id);
          return (
            <motion.article key={item.id} variants={innovationItem} className="block">
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`innovation-panel-${item.id}`}
                onClick={() =>
                  setExpandedIds((prev) =>
                    prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                  )
                }
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-black/[0.16] bg-black/[0.015] px-5 py-4 text-left transition-colors duration-300 hover:bg-black/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary md:px-6 md:py-5"
              >
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:text-[1.28rem]">
                    {item.name}
                  </span>
                  {item.notShipped && (
                    <span className="rounded-full border border-black/[0.08] bg-black/[0.03] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-textSecondary/60">
                      Not shipped
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-sans text-[12px] font-medium tracking-wide text-textSecondary">
                  {isExpanded ? "Hide" : "Preview"}
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: easePremium }}
                    aria-hidden
                  >
                    <path d="M2 4l4 4 4-4" />
                  </motion.svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    id={`innovation-panel-${item.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: easePremium }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6">
                      <p className="font-sans text-[13px] font-medium leading-snug tracking-wide text-textSecondary/95">{item.capability}</p>
                      <p className="mt-3 max-w-prose text-[16px] leading-[1.65] text-textSecondary">{item.detail}</p>
                      {item.notShipped && (
                        <p className="mt-3 font-sans text-[12px] leading-relaxed text-textSecondary/70">
                          Real-time generation requirements were too high for the timeline — designed and prototyped, not shipped.
                        </p>
                      )}
                      <FeaturePrototypeEmbed
                        label={`${item.name} — live prototype`}
                        src={item.prototypeSrc}
                        caption={item.videoCaption}
                        className="mt-6"
                      />
                      {workflowToggle && <div className="mt-6">{workflowToggle}</div>}
                      {workflowPanel}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        }

        return (
          <motion.article key={item.id} variants={innovationItem} className="block">
            {/* Description above; the live prototype that proves it sits directly below. */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="mt-0.5 font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:text-[1.28rem]">
                {item.name}
              </h3>
              {workflowToggle}
            </div>
            <p className="mt-3 font-sans text-[13px] font-medium leading-snug tracking-wide text-textSecondary/95">{item.capability}</p>
            <p className="mt-3 max-w-prose text-[16px] leading-[1.65] text-textSecondary">{item.detail}</p>

            <FeaturePrototypeEmbed
              label={`${item.name} — live prototype`}
              src={item.prototypeSrc}
              caption={item.videoCaption}
              className="mt-6"
            />

            {workflowPanel}
          </motion.article>
        );
      })}
    </motion.div>
  );
}

const uxStrategyShowrooms = [
  {
    id: "romance",
    tab: "Romance",
    capability: "Long-term memory",
    feel: "Character recalls conversation specifics across sessions",
    proofSrc: "/assets/ai-character/ux-strategy-romance-proof.png",
    proofAlt: "Romance showroom — character moment feed referencing shared history",
  },
  {
    id: "astrology",
    tab: "Astrology",
    capability: "Real-time memory updates",
    feel: "Live constellation profile updates mid-conversation",
    proofSrc: "/assets/ai-character/ux-strategy-astrology-proof.png",
    proofAlt: "Astrology showroom — zodiac profile field updating as memory writes in chat",
  },
  {
    id: "therapy",
    tab: "Therapy",
    capability: "Real-time analysis",
    feel: "Expert panel surfaces conversation themes as you chat",
    proofSrc: "/assets/ai-character/ux-strategy-therapy-proof.png",
    proofAlt: "Therapy showroom — expert analysis panel beside the conversation",
  },
] as const;

function ShowroomStrategyCard({
  tab,
  capability,
  feel,
  proofSrc,
  proofAlt,
}: {
  tab: string;
  capability: string;
  feel: string;
  proofSrc: string;
  proofAlt: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.07]">
      <div className="relative aspect-[10/13] w-full shrink-0 overflow-hidden bg-black/[0.05]">
        <img
          src={proofSrc}
          alt={proofAlt}
          className="h-full w-full object-cover object-left-top"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-1 flex-col px-4 py-5 md:px-4 md:py-5">
        <p className="font-sans text-[11px] font-medium leading-snug tracking-[0.06em] text-textSecondary/65">
          {tab} Room
        </p>
        <p className="mt-2 font-display text-[0.98rem] font-light leading-snug tracking-tight text-textPrimary md:text-[1.05rem]">
          {capability}
        </p>
        <div className="mt-4 border-t border-black/[0.07] pt-4">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-textSecondary/70">In experience</p>
          <p className="mt-2 font-sans text-[13px] leading-relaxed text-textSecondary/90 md:text-[13.5px] md:leading-[1.5]">{feel}</p>
        </div>
      </div>
    </article>
  );
}

function UxStrategyShowroomTable() {
  return (
    <div className="w-full pt-3">
      <p className="mt-8 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-textSecondary/70">
        Showroom → One proof → In-product behavior
      </p>

      <div className="mt-6 space-y-8 md:space-y-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 lg:gap-5">
          {uxStrategyShowrooms.map((s) => (
            <ShowroomStrategyCard key={s.id} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}

const aiWorkflowStages = [
  {
    n: "01",
    phase: "Research",
    accentBg: "#EEEDFE",
    accentNum: "#534AB7",
    accentName: "#3C3489",
    toolLines: ["Notion", "Memo", "ChatGPT, Claude"],
    body: "Synthesized scattered research findings — 6 apps, 40+ user comments — into strategy patterns in one session.",
  },
  {
    n: "02",
    phase: "UX Strategy",
    accentBg: "#E1F5EE",
    accentNum: "#0F6E56",
    accentName: "#085041",
    toolLines: ["Qwen", "ChatGPT", "Figma"],
    body: "Stress-tested competing design decisions as structured arguments. Resolved debates before stakeholder meetings.",
  },
  {
    n: "03",
    phase: "Visual Identity & UI",
    accentBg: "#FAECE7",
    accentNum: "#993C1D",
    accentName: "#712B13",
    toolLines: ["Figma, MasterGo", "Dreamnia, Wan", "Kling"],
    body: "Generated character art, scene backgrounds, and motion loops. Would have required a 3D production team without AI video tools.",
  },
  {
    n: "04",
    phase: "Motion & Production Code",
    accentBg: "#FAEEDA",
    accentNum: "#854F0B",
    accentName: "#633806",
    toolLines: ["CodePen", "Cursor", "Claude Code"],
    body: "Shipped motion, state logic, and live interaction designs without a dedicated frontend engineer.",
  },
] as const;

function HowIWorkedDiagram() {
  return (
    <>
      {/* Mobile (< md): the matrix doesn't fit in a phone width, so each phase
       *  becomes a self-contained vertical card stacking its tools + output. */}
      <div className="mt-10 flex flex-col gap-4 md:hidden">
        {aiWorkflowStages.map((s) => (
          <div
            key={s.n}
            className="overflow-hidden rounded-xl border border-black/[0.07] bg-white"
          >
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: s.accentBg }}>
              <span className="font-mono text-[12px]" style={{ color: s.accentNum }}>{s.n}</span>
              <span className="text-[15px] font-medium leading-snug" style={{ color: s.accentName }}>{s.phase}</span>
            </div>
            <div className="px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/70">Tools</p>
              <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-textPrimary">
                {(s.toolLines as readonly string[]).join(" · ")}
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/70">Output</p>
              <p className="mt-1.5 font-sans text-[13px] leading-[1.6] text-textSecondary">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* md+: the full phase × {tools, output} matrix, scrollable only as a fallback. */}
      <div className="mt-10 hidden overflow-x-auto md:block">
        <div
          className="min-w-[600px]"
          style={{ display: "grid", gridTemplateColumns: "88px repeat(4, minmax(0, 1fr))", gap: "12px", alignItems: "stretch" }}
        >
        {/* Phase label */}
        <div className="flex items-center font-mono text-[12px] tracking-[0.04em] text-textSecondary/40">Phase</div>

        {/* Phase cards */}
        {aiWorkflowStages.map((s, i) => (
          <div
            key={s.n}
            className="relative flex min-h-[84px] flex-col justify-between rounded-xl px-4 py-3.5"
            style={{ background: s.accentBg }}
          >
            <div className="font-mono text-[12px]" style={{ color: s.accentNum }}>{s.n}</div>
            <div className="text-[15px] font-medium leading-snug" style={{ color: s.accentName }}>{s.phase}</div>
            {i < aiWorkflowStages.length - 1 && (
              <span
                className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-0.5 font-sans text-[18px] leading-none text-textSecondary/30"
                aria-hidden
              >
                ›
              </span>
            )}
          </div>
        ))}

        {/* Tools label */}
        <div className="flex items-center font-mono text-[12px] tracking-[0.04em] text-textSecondary/40">Tools</div>

        {/* Tools cells */}
        {aiWorkflowStages.map((s) => (
          <div
            key={s.n}
            className="rounded-lg bg-surfaceAlt/50 px-3.5 py-3 font-sans text-[13px] leading-[1.7] text-textPrimary"
          >
            {(s.toolLines as readonly string[]).map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        ))}

        {/* Output label */}
        <div className="flex items-start pt-3 font-mono text-[12px] tracking-[0.04em] text-textSecondary/40">Output</div>

        {/* Output cells */}
        {aiWorkflowStages.map((s) => (
          <div
            key={s.n}
            className="border border-black/[0.07] bg-white px-3.5 py-3.5 font-sans text-[13px] leading-[1.6] text-textSecondary"
            style={{ borderTop: `2px solid ${s.accentNum}` }}
          >
            {s.body}
          </div>
        ))}
        </div>
      </div>
    </>
  );
}

const HERO_PROTO_W = 1440;
const HERO_PROTO_H = 900;

/** Hero centerpiece — the three live showroom prototypes the visitor can switch
 *  between and actually touch. Sits *below* the intro copy so the page reads
 *  headline → promise → real product. Only the active prototype is visible; each
 *  room mounts once on first open, then stays warm so switching is instant.
 *  A full-desktop iframe is scaled to fit, so it reads like the real app. */
function HeroPrototypeGallery() {
  const [activeId, setActiveId] = useState<(typeof vibeCodingShowrooms)[number]["id"]>("romance");
  const [activated, setActivated] = useState<string[]>(["romance"]);
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const active = vibeCodingShowrooms.find((s) => s.id === activeId) ?? vibeCodingShowrooms[0];
  const scale = width > 0 ? width / HERO_PROTO_W : 0;
  const displayH = Math.round(HERO_PROTO_H * scale);

  function pick(id: (typeof vibeCodingShowrooms)[number]["id"]) {
    setActiveId(id);
    setActivated((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  const idx = vibeCodingShowrooms.findIndex((s) => s.id === activeId);
  function go(dir: number) {
    const total = vibeCodingShowrooms.length;
    pick(vibeCodingShowrooms[(idx + dir + total) % total].id);
  }

  return (
    <motion.div
      className="mt-12 md:mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: easePremium }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous showroom"
            onClick={() => go(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-textSecondary transition-colors duration-200 hover:border-black/25 hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <p className="min-w-[8.75rem] text-center font-sans text-[13px] font-medium tracking-wide text-textPrimary">
            {active.tab} showroom
            <span className="ml-2 font-mono text-[11px] font-normal text-textSecondary/55">{idx + 1} / {vibeCodingShowrooms.length}</span>
          </p>
          <button
            type="button"
            aria-label="Next showroom"
            onClick={() => go(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] bg-white text-textSecondary transition-colors duration-200 hover:border-black/25 hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <Link
          href={active.href}
          className="font-sans text-[12px] font-medium tracking-wide text-textSecondary underline decoration-black/[0.12] underline-offset-[5px] transition-colors hover:text-textPrimary hover:decoration-textPrimary/35"
        >
          Open full page
        </Link>
      </div>

      <div
        ref={frameRef}
        className={`relative mt-5 w-full overflow-hidden border transition-[border-color,box-shadow] duration-500 ${vibeGalleryChrome[active.id]} ${mediaRound}`}
        style={{ height: displayH || undefined, aspectRatio: displayH ? undefined : `${HERO_PROTO_W}/${HERO_PROTO_H}` }}
      >
        {mounted && scale > 0 ? (
          vibeCodingShowrooms.map((s) => {
            if (!activated.includes(s.id)) return null;
            const on = s.id === activeId;
            return (
              <iframe
                key={s.id}
                title={s.title}
                src={s.src}
                loading="lazy"
                className={`absolute left-0 top-0 border-0 transition-opacity duration-500 ${vibeIframeBg[s.id]} ${on ? "opacity-100" : "pointer-events-none opacity-0"}`}
                style={{
                  width: HERO_PROTO_W,
                  height: HERO_PROTO_H,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              />
            );
          })
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b10]" aria-hidden>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Loading prototype…</span>
          </div>
        )}
      </div>

      <p className="mt-3 font-sans text-[12px] leading-relaxed text-textSecondary/90">{active.caption}</p>
    </motion.div>
  );
}

function HeroSection({ reduced }: { reduced: boolean | null }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });


  const parallaxLead = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 28]);

  return (
    <section
      id="intro"
      ref={heroRef}
      className="relative scroll-mt-24 overflow-x-hidden pb-32 pt-16 md:scroll-mt-28 md:pb-40 md:pt-24"
    >
      <div className="relative w-full">
        <motion.div style={{ y: parallaxLead }}>
          <motion.div
            className="relative"
            initial={reduced ? false : "hidden"}
            animate={reduced ? undefined : "visible"}
            variants={reduced ? undefined : heroStack}
          >
            <div className="max-w-4xl">
              <motion.div className="flex items-center gap-4 sm:gap-5" variants={reduced ? undefined : heroItem}>
                <img
                  src="/assets/ai-character/alibaba-cloud-logo.png"
                  alt="Alibaba Cloud"
                  width={200}
                  height={48}
                  className="h-7 w-auto max-w-[11rem] object-contain object-left opacity-[0.92] md:h-8"
                  decoding="async"
                />
              </motion.div>

              <div className="mt-7 overflow-hidden py-[0.18em] md:mt-8">
                <motion.h1
                  className="text-pretty font-display text-[2.2rem] font-light leading-[1.12] tracking-[-0.038em] text-textPrimary md:text-[clamp(2.35rem,4.5vw,2.85rem)] md:leading-[1.1]"
                  variants={reduced ? undefined : { hidden: { y: "106%" }, visible: { y: "0%", transition: { duration: 0.92, ease: EMSK } } }}
                >
                  Designing the AI That Feels Alive
                </motion.h1>
              </div>

              <motion.p
                className="mt-6 max-w-[40rem] font-sans text-[1.0625rem] font-normal leading-[1.66] tracking-[-0.012em] text-textSecondary md:mt-7 md:text-[1.15rem]"
                variants={reduced ? undefined : heroItem}
              >
                Led and shipped the <Em>end-to-end design</Em> of Interactive Showrooms, the MVP feature for the Qwen Character LLM serving <Em>millions of enterprise customers</Em>, driving a <Em>200% lift</Em> in model API call volume through <Em>4 hands-on demos</Em>.
              </motion.p>

              <motion.p
                className="mt-4 max-w-[40rem] font-sans text-[15px] font-normal leading-[1.7] tracking-[-0.011em] text-textSecondary/90 md:text-[1rem]"
                variants={reduced ? undefined : heroItem}
              >
                Cut time-to-first-value from <Em>60+ minutes</Em> of documentation to <Em>under 2 minutes</Em> with an immersive showroom design, where each showroom surfaces one strength of the Qwen LLM alongside a <Em>prompt guide</Em> and a <Em>live code editor</Em>.
              </motion.p>

              <motion.p
                className="mt-4 max-w-[40rem] font-sans text-[15px] font-normal leading-[1.7] tracking-[-0.011em] text-textSecondary/90 md:text-[1rem]"
                variants={reduced ? undefined : heroItem}
              >
                Set the prototyping standard by building in <Em>React</Em> with Cursor and Claude Code, handing engineering working components to improve the Design QA process. Art-directed the visual system across all 4 showrooms, owning motion, state transitions, and a <Em>custom illustration set</Em> that gave each AI character a distinct presence on the page.
              </motion.p>

              <motion.div
                className="mt-6 flex items-start gap-3 border-l-2 border-nltLime pl-4 md:mt-7"
                variants={reduced ? undefined : heroItem}
              >
                <p className="font-sans text-[13.5px] leading-relaxed text-textSecondary/65">
                  <span className="font-medium uppercase tracking-[0.12em] text-nltLime-ink text-[11px]">Design principle</span>
                  <span className="block mt-1.5">AI systems need <Em>visible cognition</Em>, not just outputs — I design to make model state inspectable.</span>
                </p>
              </motion.div>

              <motion.nav
                aria-label="Case study links"
                variants={reduced ? undefined : heroItem}
                className="mt-9 flex flex-wrap items-center gap-4 md:mt-11"
              >
                <motion.div
                  whileHover={reduced ? undefined : { y: -2 }}
                  whileTap={reduced ? undefined : { y: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 28 }}
                  className="inline-block"
                >
                  <Link
                    href={heroLinks[0].href}
                    className="inline-flex rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                  >
                    {heroLinks[0].label}
                  </Link>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        </motion.div>

       

        <HeroPrototypeGallery />

        <motion.div
          className="mt-14 md:mt-20"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduced ? 0 : 0.85, ease: easePremium }}
        >
          <dl className="grid grid-cols-2 gap-x-8 gap-y-7 pt-8 sm:grid-cols-4 sm:gap-y-0 md:gap-x-10 md:pt-9">
            {metaFields.map(({ label, value }) => (
              <div key={label} className="min-w-0 border-l border-black/[0.1] pl-3">
                <dt className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-textSecondary/70">{label}</dt>
                <dd className="mt-2 font-sans text-[13px] leading-snug text-textSecondary/80">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

const metricRows = [
  {
    stat: "~2×",
    label: "Model tokens & calls",
    before: "Four-week rolling average before showroom launch — generic chat and documentation-led trials (internal product analytics).",
    after: "Four-week rolling average after go-live — showroom-led sessions, same metrics and org scope on the dashboard.",
    note: "Pre vs post launch on one pipeline, not a third-party benchmark: compares the same internal reporting window immediately before and after the showroom release.",
  },
  {
    stat: "87%",
    label: "Clone-to-try setup",
    before: "~7 enumerated steps for B2B evaluators to take the published character template from reading the repo/spec through local install, keys, model endpoint, prompt wiring, and a first runnable session — before opening the showroom chat thread.",
    after: "Collapsed path: template entry with pre-seeded scenario context plus copy-ready YAML/prompt — external setup becomes a short checklist. The in-room proof moment still requires normal conversation after entry.",
    note: "Internal clone-to-try checklist only — counts setup actions from code review to local configure/run, not taps inside the live demo or a single-click “instant wow.”",
  },
  {
    stat: "60%",
    label: "Faster delivery",
    before: "Spec-only handoff",
    after: "Code + spec together",
    note: "Verbal engineering estimate — spec + code delivered together across 3 showroom releases. Not from ticket or cycle-time dashboards.",
  },
];

function CollapsibleMetricTable() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-14 overflow-hidden rounded-xl ring-1 ring-black/[0.07] md:mt-16">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between bg-surfaceAlt/40 px-5 py-4 text-left transition-colors duration-200 hover:bg-surfaceAlt/60"
      >
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-textSecondary">How the numbers are defined</p>
        <motion.svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 text-textSecondary/40"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="hidden grid-cols-[6rem_1fr_1fr_1fr] gap-x-6 border-t border-black/[0.06] bg-surfaceAlt/20 px-5 py-3 md:grid">
              {["Metric", "Baseline", "Result", "Note"].map((h) => (
                <p key={h} className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textSecondary/70">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-black/[0.06] border-t border-black/[0.06]">
              {metricRows.map((row) => (
                <div key={row.stat} className="grid grid-cols-1 gap-1 px-5 py-4 md:grid-cols-[6rem_1fr_1fr_1fr] md:items-center md:gap-x-6">
                  <div className="flex items-baseline gap-2 md:block">
                    <p className="font-display text-[1.4rem] font-light tracking-tight text-textPrimary">{row.stat}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/60 md:mt-0.5">{row.label}</p>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-textSecondary/70 md:hidden">Before</p>
                    <p className="font-sans text-[13px] leading-snug text-textSecondary">{row.before}</p>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-textSecondary/70 md:hidden">After</p>
                    <p className="font-sans text-[13px] font-normal leading-snug text-textPrimary/80">{row.after}</p>
                  </div>
                  <p className="font-sans text-[12px] italic leading-snug text-textSecondary/60">{row.note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CaseStudyContent() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-white pt-24 md:pt-28">
      <CaseStudyNav />
      <CaseStudyMobileToc items={caseNavItems} />
      <main className="relative min-h-screen overflow-x-hidden pb-0">
        <article className="relative z-10 mx-auto max-w-content px-6 pb-20 pt-0 md:px-12 md:pb-24 lg:pl-36 lg:pr-14">
          <HeroSection reduced={reduced} />

        {/* PROBLEM */}
        <Section
          id="problem"
          eyebrow="The Problem"
          title="The first hour was killing trial conversion"
        >
          
          <p>
            The docs explained everything. But <Em>feeling</Em> the model meant configuring, running samples, and interpreting output alone — a loop that <Em>routinely stretched past an hour</Em>. Most trial users left before reaching the moment of value. 
            Enterprise decks faced the same wall: descriptive, not convincing. So I shifted the product from documentation to <Em>proof</Em>.
          </p>

          <blockquote className="my-16 w-full !max-w-none border-l-2 border-nltLime pl-7 not-italic md:my-20 md:pl-8">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-nltLime-ink">How might we</p>
            <p className="mt-4 font-display text-[1.35rem] font-light leading-[1.45] tracking-[-0.02em] text-textPrimary md:text-[1.55rem] md:leading-[1.42]">
              Make model capabilities <Em>visible</Em>, <Em>testable</Em>, and <Em>trustworthy</Em> — within minutes?
            </p>
          </blockquote>
        </Section>

        {/* D1: SHOWROOM OVER DOCS */}
        <Section
          id="d1-showroom"
          eyebrow="Decision 01"
          title="I replaced documentation with market-specific showrooms."
        >
          <p>
            Instead of improving the documentation, I designed 4 market-specific showrooms that let users experience a working version of their own future product. Companionship, psychotherapy, character cloning, IP licensing.
          </p>

          <D1BeforeAfter />

          <p>
            6 apps, 40 + comments — every competitor felt like <Em>another ChatGPT</Em>. The answer was market-specific showrooms: one vertical per room, built for the evaluator who already works there.
          </p>
          <p>
            Users don&apos;t believe descriptions. So the first message had to <Em>prove the capability</Em>.
          </p>
          
        </Section>

        {/* D2: CAPABILITY MAPPING */}
        <Section
          id="d2-capability"
          eyebrow="Decision 02"
          title="I designed each room to prove one capability in 60 seconds."
        >
          <p>
            Three model strengths crammed into one chat window. None of them landed. So I split them across rooms — one proof moment per room, legible in 60 seconds, no explainer text.
          </p>
          <p>
            Users don&apos;t only judge the output — they judge whether they can see what the system knows, why it responds, and how much control they keep. So I turned invisible model behavior into <Em>visible surfaces</Em>: each room makes one form of cognition legible — <Em>memory</Em>, <Em>analysis</Em>, or <Em>implementation</Em>.
          </p>

          <UxStrategyShowroomTable />

          <InteractionInnovationList />

          <AdditionalShowroomsGallery />
        </Section>

        {/* D3: GAMIFICATION + CODE TOOLS */}
        <Section
          id="d3-acceleration"
          eyebrow="Decision 03"
          title="I made demos emotional for users and inspectable for builders."
        >
          <p>
            <Em>Inspiration and Continue Response</Em> guide users to the <Em>wow moment</Em>. A slide-out drawer keeps <Em>YAML</Em> and <Em>prompts</Em> next to the <Em>live demo</Em>.
          </p>

          {/* Pair 1 — the two reply nudges described, then the prototype that demonstrates both. */}
          <div className="mt-10 md:mt-12">
            <h3 className="font-display text-[1.2rem] font-light tracking-tight text-textPrimary md:text-[1.32rem]">
              Two nudges toward the wow moment
            </h3>
            <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
              <p className="font-sans text-[15px] leading-relaxed text-textSecondary">
                <Em>Inspiration Response</Em> — three reply options (action, emotion, expression) guide without breaking flow. Feels like gameplay, not messaging.
              </p>
              <p className="font-sans text-[15px] leading-relaxed text-textSecondary">
                <Em>Continue Response</Em> — one tap extends the story from context. Long-context reasoning, no effort required.
              </p>
            </div>
            <FeaturePrototypeEmbed
              label="Experience loop — inspiration and continue response in flow"
              src={FEATURE_PROTOTYPES.inspire}
              caption="↑ Both live in the romance room — tap a reply option, or continue the story."
              className="mt-6"
            />
          </div>

          {/* Pair 2 — the code drawer described, then the prototype that shows it open beside the demo. */}
          <div className="mt-14 md:mt-16">
            <h3 className="font-display text-[1.2rem] font-light tracking-tight text-textPrimary md:text-[1.32rem]">
              Code drawer, not console
            </h3>
            <p className="mt-4 max-w-prose font-sans text-[15px] leading-relaxed text-textSecondary">
              YAML specs, prompts, and constraints slide open beside the live demo — no context switch. Evaluators inspect the implementation in place, then clone the template as a <Em>reusable starting point</Em> for their own product.
            </p>
            <FeaturePrototypeEmbed
              label="Developer tools — romance room code side panel"
              src={FEATURE_PROTOTYPES.code}
              caption="↑ Romance room — the YAML and prompt behind the demo, open right there."
              className="mt-6"
            />
            <FeaturePrototypeEmbed
              label="Developer tools — therapy room code side panel"
              src={FEATURE_PROTOTYPES.therapyCode}
              caption="↑ Therapy room — the same code drawer: pipeline spec, prompt, and model config."
              className="mt-6"
            />
          </div>
        </Section>

        {/* HOW I WORKED */}
        <Section
          id="how-i-worked"
          eyebrow="How I Worked"
          title="AI changed how I shipped the work, not just how I made assets."
        >
          <p>
            AI compressed the distance between{" "}
            <Em>strategy, visual direction, motion, and implementation</Em>. I used it to stress-test decisions, generate
            visual directions, prototype motion, and deliver <Em>production-adjacent interfaces</Em> that engineers could merge
            with <Em>minimal revision</Em>.
          </p>
          <HowIWorkedDiagram />

          <RevealLine className="mt-10" />

          <p className="mt-10 font-sans text-[16px] leading-relaxed text-textSecondary">
            Inspired by <Em>Love and Deepspace</Em>, I used Wan, Kling, Dreamnia, and SeeDance for visual identity. Interactions built with <Em>Cursor</Em> and <Em>Claude Code</Em> — all in four weeks.
          </p>
          <div className="grid gap-6 pt-4 md:grid-cols-2 md:gap-8">
            <ImagePlaceholder label="Character design exploration" src="/assets/ai-character/design.jpg" />
            <ImagePlaceholder label="UI visual system" src="/assets/ai-character/uivisual.jpg" />
          </div>
          <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-8">
            <ImagePlaceholder label="Character direction explorations" src="/assets/ai-character/characterdirection.jpg" />
            <ImagePlaceholder label="Scene music and motion concept" src="/assets/ai-character/innovation.jpg" />
          </div>
        </Section>

        {/* PRODUCT SHOWCASE */}
        <Section
          id="product-showcase"
          eyebrow="Product Showcase"
        >
          <ShowcaseSlideGallery reduced={reduced} />

          <RevealLine className="mt-14" />

          <h3 className="mt-12 font-display text-[1.25rem] font-light tracking-tight text-textPrimary md:text-[1.35rem]">
            Live interactive prototypes
          </h3>
          <p className="mt-4 font-sans text-[16px] leading-relaxed text-textSecondary">
            Open full page for best fidelity.
          </p>
          <VibeCodingPrototypeGallery />
        </Section>

        {/* ADDITIONAL CONTRIBUTION */}
        <Section
          id="backend"
          eyebrow="Additional Contribution"
          title="Full refresh of the Qwen Character SaaS console."
        >
          <p>
            I delivered an end-to-end update to the Qwen Character admin — spanning <Em>API</Em> surfaces,{" "}
            <Em>Studio</Em> (Applications, Workflows, Knowledge Base, Characters), and the nested flows underneath.
            That included secondary screens teams rely on in production: empty and error states, and{" "}
            <Em>analytics</Em> views for operational data such as invocation metrics and call volume.
          </p>
          <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2 md:gap-10">
            <ShowcaseVideo
              label="SaaS console — overview screen recording"
              src="/assets/ai-character/homepage.mov"
              caption="Updated console overview — API entry and Studio navigation"
            />
            <ImagePlaceholder label="Studio surfaces — capability and workflow modules" src="/assets/ai-character/updateddesign1.jpg" />
            <ImagePlaceholder label="Nested flows — detail views and extended configuration" src="/assets/ai-character/updateddesign2.jpg" />
            <ImagePlaceholder label="Knowledge Base and downstream screens" src="/assets/ai-character/updatedesign3.jpg" />
          </div>

          <h3 className="mt-14 font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:mt-16 md:text-[1.25rem]">
            Design framework
          </h3>
          <SitePreviewFrame
            eyebrow="Adoption"
            title="Spark Design templates — adopted B2B design system page"
            src="https://sparkdesign.agentscope.io/#/templates"
            href="https://sparkdesign.agentscope.io/#/templates"
          />
        </Section>

        {/* OUTCOME */}
        <Section
          id="outcome"
          eyebrow="Impact"
          title="Shipped. Converted. Adopted."
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-b border-black/[0.06] pb-12 pt-4 md:grid-cols-4 md:gap-x-6 md:gap-y-8 lg:gap-x-10">
            {[
              { n: "4", label: "Showrooms shipped", detail: "romance · astrology · therapy · character" },
              {
                n: "~2×",
                label: "Model traffic",
                detail: "token & call volume vs 4-wk pre-launch avg",
              },
              {
                n: "60+ min → <2 min",
                label: "Onboarding",
                detail: "static docs to first proof moment",
              },
              { n: "4 weeks", label: "Research to production", detail: "intern project, shipped" },
            ].map((stat, i) => (
              <motion.div
                key={stat.n}
                className="flex flex-col"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex min-h-[7.25rem] flex-col justify-end md:min-h-[7.5rem]">
                  <p className="font-display text-[2.5rem] font-light leading-[1.08] tracking-[-0.02em] text-textPrimary md:text-[2.75rem] md:leading-[1.06]">
                    <CountUpStat value={stat.n} />
                  </p>
                </div>
                <div className="mt-4 flex min-h-[2.75rem] items-start gap-2 md:min-h-[3rem]">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-nltLime" aria-hidden="true" />
                  <p className="font-sans text-[12px] font-medium uppercase leading-snug tracking-[0.12em] text-textPrimary/70">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-2 font-sans text-[14px] leading-snug text-textSecondary">{stat.detail}</p>
              </motion.div>
            ))}
          </div>

          <CollapsibleMetricTable />

          <p className="mt-10 border-l-2 border-nltLime pl-6 font-sans text-[15px] leading-relaxed text-textSecondary md:mt-12 md:pl-7">
            <a
              href="https://tongyi.aliyun.com/character"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-textPrimary underline decoration-nltLime decoration-2 underline-offset-[6px] transition-colors duration-300 hover:decoration-nltLime-ink"
            >
              View the live showrooms →
            </a>
          </p>
        </Section>

        <Section id="takeaway" eyebrow="Takeaway" title="What I learned" bordered={false}>
          <p className="max-w-reading">
            AI products do not sell themselves through capability lists. They need <Em>proof moments</Em>,{" "}
            <Em>visible cognition</Em>, and <Em>inspectable systems</Em>. The designer&apos;s job is to translate model
            behavior into experiences people can feel, trust, and build from.
          </p>

          <h3 className="mt-14 font-display text-[1.2rem] font-light tracking-tight text-textPrimary md:mt-16 md:text-[1.28rem]">
            Design principles
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <div className="flex flex-col rounded-2xl bg-white px-6 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] md:px-7 md:py-9">
              <p className="font-display text-[1.18rem] font-light leading-[1.22] tracking-[-0.02em] text-textPrimary md:text-[1.28rem] md:leading-[1.18]">
                Design is the translation layer.
              </p>
              <p className="mt-4 font-sans text-[15px] leading-relaxed text-textSecondary">
                In AI products, the hardest problem isn&apos;t the model — it&apos;s helping people <Em>imagine what to build</Em>.
              </p>
            </div>
            <div className="flex flex-col rounded-2xl bg-white px-6 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] md:px-7 md:py-9">
              <p className="font-display text-[1.18rem] font-light leading-[1.22] tracking-[-0.02em] text-textPrimary md:text-[1.28rem] md:leading-[1.18]">
                The best demo is future-self proof.
              </p>
              <p className="mt-4 font-sans text-[15px] leading-relaxed text-textSecondary">
                Show a <Em>working version of their product</Em>, then let them <Em>clone it</Em>.
              </p>
            </div>
          </div>
        </Section>
        </article>
      </main>
    </div>
  );
}
