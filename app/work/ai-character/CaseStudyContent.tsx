"use client";

import { CaseStudyMeta } from "@/components/CaseStudyMeta";
import { CASE_STUDY_META } from "@/lib/caseStudyMeta";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const mediaRound = "rounded-xl";

/** Room tabs only — compact control, not repeated as “chips” across the page */
const roomTab = {
  base: "inline-flex items-center justify-center rounded-full border px-4 py-2 font-sans text-[12px] font-semibold tracking-[0.02em] transition-all duration-300 ease-out",
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
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{eyebrow}</p>
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
  return <span className="font-medium text-textPrimary">{children}</span>;
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
  { id: "intro", label: "Introduction" },
  { id: "vibe-prototype", label: "Live Prototypes" },
  { id: "problem", label: "Problem" },
  { id: "strategy", label: "Product strategy" },
  { id: "research", label: "Research" },
  { id: "ux-strategy", label: "UX Strategy" },
  { id: "innovations", label: "Interactions" },
  { id: "experience-loop", label: "Experience Loop" },
  { id: "process", label: "Visual Process" },
  { id: "backend", label: "Backend" },
  { id: "outcome", label: "Outcome" },
  { id: "takeaway", label: "Takeaway" },
] as const;

function CaseStudyNav() {
  const [active, setActive] = useState<string>("intro");
  const SECTION_SCROLL_OFFSET = 112;

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && caseNavItems.some((i) => i.id === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const ids = caseNavItems.map((i) => i.id);
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
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-full w-[11rem] select-none lg:block"
    >
      <div className="pointer-events-auto sticky top-[calc(50vh-10rem)] px-6 pt-40">
        <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-textSecondary/60">On this page</p>
        <ul className="mt-5 max-h-[min(60vh,28rem)] space-y-0 overflow-y-auto overscroll-contain pr-1">
          {caseNavItems.map(({ id, label }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => scrollToSection(id, e)}
                  className={`block border-l border-transparent py-1.5 pl-4 text-left text-[12px] leading-snug transition-[color,border-color,opacity,transform] duration-500 ease-out ${
                    isActive
                      ? "border-textPrimary font-medium text-textPrimary"
                      : "text-textSecondary/90 hover:translate-x-0.5 hover:border-black/20 hover:text-textPrimary"
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
      className={`relative overflow-hidden bg-black/[0.02] shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] ${mediaRound} ${className}`}
      role="img"
      aria-label={label}
    >
      <img src={src} alt={label} className={`h-auto w-full object-contain ${mediaRound}`} loading="lazy" />
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
    <figure className={`overflow-hidden bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] ${mediaRound} ${className}`}>
      <div className={`bg-black ${mediaRound}`}>
        <video
          ref={videoRef}
          className={`h-auto w-full object-contain ${mediaRound}`}
          controls
          playsInline
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

const SHOWCASE_GALLERY_SLIDE_MS = 9000;

const showcaseGallerySlides = [
  {
    tab: "Romance",
    label: "Romance showroom",
    src: "/assets/ai-character/new-cover.mp4",
    poster: "/assets/ai-character/showcase.jpg",
    caption: "Romance Room — memory callbacks and emotional escalation",
  },
  {
    tab: "Astrology",
    label: "Astrology showroom",
    src: "/assets/ai-character/taobaibai-1.mp4",
    caption: "Astrology Room — constellation profile updates live",
  },
  {
    tab: "Therapy",
    label: "Therapy showroom",
    src: "/assets/ai-character/therapy-1.mp4",
    caption: "Therapy Room — visible analysis alongside chat",
  },
] as const;

function ShowcaseSlideGallery({ reduced }: { reduced: boolean | null }) {
  const [index, setIndex] = useState(0);
  const len = showcaseGallerySlides.length;
  const slide = showcaseGallerySlides[index];
  const galleryFigureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((v) => (v + 1) % len);
    }, SHOWCASE_GALLERY_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduced, len]);

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
              onClick={() => setIndex(i)}
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

type AdditionalShowroomShowcase =
  | { kind: "video"; src: string; caption: string }
  | { kind: "image"; src: string; caption: string };

const additionalShowroomGalleryItems: {
  id: "astrology" | "therapy" | "multi";
  listLabel: string;
  room: string;
  capability: string;
  body: string;
  detail: string;
  showcase: AdditionalShowroomShowcase;
}[] = [
  {
    id: "astrology",
    listLabel: "Astrology Room",
    room: "Astrology Room",
    capability: "Real-time memory updates",
    body: "A personal constellation file updates during conversation — memory becomes transparent and inspectable.",
    detail:
      "Design focus: one persistent surface that mirrors live memory writes — readable at a glance without opening secondary panels.",
    showcase: {
      kind: "video",
      src: "/assets/ai-character/interactions/other%20showrooms/astro%20profile/astro%20profile-1.mp4",
      caption: "Screen recording — constellation profile and live memory file in the astrology showroom",
    },
  },
  {
    id: "therapy",
    listLabel: "Therapy Room",
    room: "Therapy Room",
    capability: "Real-time analysis",
    body: "A live panel surfaces conversation themes — users see what the system understood, not just what it said.",
    detail:
      "Design focus: parallel transcript + analysis rail so legibility stays high without relying on static screenshots.",
    showcase: {
      kind: "video",
      src: "/assets/ai-character/interactions/other%20showrooms/therapy%20analysis/therapy%20analysis-1.mp4",
      caption: "Screen recording — therapy analysis rail alongside the conversation",
    },
  },
  {
    id: "multi",
    listLabel: "Multi-character Room",
    room: "Multi-Character Room",
    capability: "Multi-agent coordination",
    body: "Multiple characters respond to the user and each other in real time.",
    detail:
      "Design focus: portrait rail + single thread keeps who-is-speaking obvious while preserving the full-room layout in a compact preview.",
    showcase: {
      kind: "image",
      src: "/assets/ai-character/interaction-multi-room.png",
      caption: "Multi-character room — coordinated agents in one thread",
    },
  },
];

function AdditionalShowroomsGallery() {
  const [activeId, setActiveId] = useState<(typeof additionalShowroomGalleryItems)[number]["id"]>("astrology");
  const active =
    additionalShowroomGalleryItems.find((item) => item.id === activeId) ?? additionalShowroomGalleryItems[0];

  return (
    <div className="mt-10 overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
      <div className="border-b border-black/[0.06] bg-surfaceAlt/40 px-5 py-5 md:px-8 md:py-6">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary">Additional showrooms</p>
        <p className="mt-2 max-w-reading font-sans text-[15px] leading-relaxed text-textSecondary">
          Astrology, therapy, and multi-character rooms sit together as one family of proofs: transparent memory, visible analysis,
          and coordinated agents — each readable in a single glance.
        </p>
      </div>

      <div className="flex flex-col bg-white md:min-h-[min(32rem,60vh)] md:flex-row">
        <nav
          className="shrink-0 border-b border-black/[0.06] md:w-[13.5rem] md:border-b-0 md:border-r md:border-black/[0.06] md:bg-surfaceAlt/20"
          aria-label="Choose an additional showroom"
        >
          <p className="hidden px-4 pt-5 font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-textSecondary/60 md:block">
            Showrooms
          </p>
          <ul
            className="flex gap-1 overflow-x-auto p-3 md:flex-col md:gap-0.5 md:overflow-x-visible md:p-3 md:pb-6 md:pl-3 md:pr-2 md:pt-2"
            role="tablist"
          >
            {additionalShowroomGalleryItems.map((item) => {
              const on = item.id === activeId;
              return (
                <li key={item.id} className="shrink-0 md:w-full" role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    id={`add-showroom-tab-${item.id}`}
                    tabIndex={on ? 0 : -1}
                    aria-controls="add-showroom-panel"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left font-sans text-[13px] font-medium leading-snug transition-[background-color,color,border-color,box-shadow] duration-300 md:rounded-l-md md:rounded-r-none md:py-3 md:pl-3.5 md:pr-2 md:text-[13.5px] ${
                      on
                        ? "bg-white text-textPrimary shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.07] md:border-l-[3px] md:border-textPrimary md:shadow-none md:ring-0"
                        : "text-textSecondary hover:bg-black/[0.04] hover:text-textPrimary"
                    }`}
                  >
                    {item.listLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="min-w-0 flex-1 bg-white"
          role="tabpanel"
          id="add-showroom-panel"
          aria-labelledby={`add-showroom-tab-${active.id}`}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              <div className="border-b border-black/[0.06] px-5 pb-5 pt-5 md:px-8 md:pb-6 md:pl-9 md:pt-8 lg:pl-10">
                <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-textSecondary/70">
                  {active.showcase.kind === "video" ? "Showroom video" : "Showroom preview"}
                </p>
                <p className="mt-3 font-display text-[1.12rem] font-light leading-snug text-textPrimary md:text-[1.18rem]">{active.room}</p>
                <p className="mt-2 border-l-[3px] border-textPrimary pl-3 font-sans text-[13px] font-semibold leading-snug text-textPrimary md:mt-2.5 md:pl-3.5 md:text-[13.5px]">
                  {active.capability}
                </p>
              </div>

              <div className="bg-black/[0.03] px-5 py-6 md:px-8 md:py-8 md:pl-9 lg:pl-10">
                {active.id === "multi" ? (
                  <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-black/[0.14] bg-white/70 px-6 py-10 text-center">
                    <p className="font-sans text-[13px] tracking-wide text-textSecondary">Preview image is temporarily hidden.</p>
                  </div>
                ) : active.showcase.kind === "video" ? (
                  <ShowcaseVideo
                    label={`${active.room} — screen recording`}
                    src={active.showcase.src}
                    caption={active.showcase.caption}
                    className="mx-auto max-w-4xl shadow-[0_20px_60px_-28px_rgba(0,0,0,0.22)] ring-black/[0.1] [&>div]:!min-h-0 [&>div]:!bg-neutral-100 [&_video]:max-h-[min(76vh,48rem)] [&_video]:w-full"
                  />
                ) : (
                  <figure className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-[0_24px_80px_-32px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.08]">
                    <div className="bg-surfaceAlt/50">
                      <img
                        src={active.showcase.src}
                        alt={active.showcase.caption}
                        className="mx-auto w-full max-h-[min(72vh,40rem)] object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <figcaption className="border-t border-black/[0.06] px-5 py-3.5 font-sans text-[12px] leading-relaxed tracking-wide text-textSecondary/95">
                      {active.showcase.caption}
                    </figcaption>
                  </figure>
                )}
              </div>

              <div className="px-5 py-6 md:px-8 md:py-8 md:pl-9 lg:pl-10">
                <p className="max-w-reading font-sans text-[15px] leading-relaxed text-textSecondary">{active.body}</p>
                <p className="mt-4 max-w-reading border-t border-black/[0.06] pt-4 font-sans text-[14px] leading-relaxed text-textSecondary/95 md:mt-5 md:pt-5 md:text-[15px]">
                  {active.detail}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
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
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.98, ease: easeHero } },
};

const heroLinks = [
  { href: "/work/ai-character/deck-present", label: "Presentation Deck" },
  { href: "/work/ai-character/deck-en", label: "Claude Deck" },
  { href: "/work/ai-character/prototype", label: "Interactive prototype" },
] as const;

const introBlockContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.085, delayChildren: 0.06 } },
};

const introBlockItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.88, ease: easePremium } },
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.92, ease: easePremium } },
};

const metaFields = [
  { label: "Company", value: "Alibaba Cloud" },
  { label: "Role", value: "UX Designer — End-to-End, research to production code" },
  { label: "Timeline", value: "4 weeks · July–August 2025" },
  { label: "Team", value: "1 supervisor · 2 UX · 2 PM · 4 Engineers" },
  { label: "Outcome", value: "Shipped · Model calls +200% after showrooms · B2B framework adopted" },
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
  return (
    <div className="w-full space-y-12 pt-6 md:space-y-14 md:pt-8">
      {vibeCodingShowrooms.map((item) => (
        <section
          key={item.id}
          aria-labelledby={`vibe-showroom-${item.id}-title`}
          className="scroll-mt-28"
        >
          <div
            className={`overflow-hidden border shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-500 ease-out ${vibeGalleryChrome[item.id]} ${mediaRound}`}
          >
            <div
              className={`flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 md:px-6 ${
                item.id === "romance" ? "border-white/[0.1]" : "border-black/[0.07]"
              }`}
            >
              <div className="min-w-0">
                <p
                  id={`vibe-showroom-${item.id}-title`}
                  className={`font-sans text-[11px] font-semibold uppercase tracking-[0.16em] ${
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
            <iframe
              title={item.title}
              src={item.src}
              className={`h-[min(72vh,820px)] min-h-[480px] w-full md:min-h-[560px] ${vibeIframeBg[item.id]}`}
              loading="lazy"
            />
          </div>
        </section>
      ))}
    </div>
  );
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
  title: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-28 md:scroll-mt-28 md:py-36 ${bordered ? "border-t border-black/[0.05]" : ""}`}
    >
      <motion.div
        className="w-full"
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "visible"}
        viewport={{ once: true, margin: "-12% 0px" }}
        variants={reduced ? undefined : sectionRoot}
      >
        <motion.p
          className="max-w-reading font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary"
          variants={reduced ? undefined : sectionPiece}
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          className="mt-5 max-w-reading font-display text-[1.55rem] font-light leading-[1.14] tracking-[-0.02em] text-textPrimary md:mt-6 md:text-[1.85rem] md:leading-[1.12]"
          variants={reduced ? undefined : sectionPiece}
        >
          {title}
        </motion.h2>
        <motion.div
          className="mt-12 space-y-9 font-sans text-[17px] leading-[1.72] tracking-[-0.011em] text-textSecondary/95 md:mt-14 md:space-y-10 md:text-[1.0625rem] md:leading-[1.76] [&>blockquote]:mx-auto [&>blockquote]:max-w-reading [&>blockquote]:font-display [&>blockquote]:text-textPrimary [&>h3]:max-w-reading [&>h4]:max-w-reading [&>ol]:max-w-reading [&>p]:max-w-reading [&>ul]:max-w-reading"
          variants={reduced ? undefined : sectionPiece}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}

const innovations: {
  id: string;
  name: string;
  capability: string;
  detail: ReactNode;
  workflowSrc: string;
  videoSrc: string;
  videoCaption: string;
}[] = [
  {
    id: "alternate-universe",
    name: "Alternate Universe Events",
    capability: "Long-term memory + generative storytelling",
    workflowSrc: "/assets/ai-character/interaction/alternate_universe_events_workflow.svg",
    videoSrc: "/assets/ai-character/interactions/alternative%20universe/alternative%20universe-1.mp4",
    videoCaption: "Alternate universe event — memory-driven scene shift",
    detail: (
      <>
        Scenes triggered by <Em>personal history</Em> recontextualize the relationship — variable rewards from real shared context.
      </>
    ),
  },
  {
    id: "heartbeat-power",
    name: "Heartbeat Power",
    capability: "Real-time generation + character depth modeling",
    workflowSrc: "/assets/ai-character/interaction/heartbeat_power_workflow.svg",
    videoSrc: "/assets/ai-character/interactions/heartbeat/heartbeat-1.mp4",
    videoCaption: "Heartbeat — inner-monologue reveal",
    detail: (
      <>
        A tap-to-reveal <Em>inner-monologue card</Em> creates <Em>emotional privilege</Em> — users glimpse the
        character&apos;s subtext without breaking the surface illusion.
      </>
    ),
  },
  {
    id: "story-unlock",
    name: "Story Unlock",
    capability: "Progressive memory building",
    workflowSrc: "/assets/ai-character/interaction/story_unlock_workflow.svg",
    videoSrc: "/assets/ai-character/interactions/story%20unlocked/story%20unlocked-1.mp4",
    videoCaption: "Story unlock — milestone progression in chat",
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
    videoSrc: "/assets/ai-character/interactions/moments/moments-1.mp4",
    videoCaption: "Moments feed — posts from memory history",
    detail: (
      <>
        <Em>Instagram-style posts</Em> generated from interaction history sustain <Em>off-session presence</Em> — the
        character keeps existing between conversations.
      </>
    ),
  },
];

const innovationContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
};

const innovationItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: easePremium } },
};

function InteractionInnovationList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const videoInCardClass =
    "rounded-none shadow-none ring-0 [&>div]:rounded-none [&_video]:rounded-none [&>figcaption]:border-black/[0.06]";

  return (
    <motion.div
      className="space-y-5 pt-3"
      variants={innovationContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {innovations.map((item) => {
        const isOpen = openId === item.id;
        return (
          <motion.article
            key={item.id}
            variants={innovationItem}
            className="block overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] transition-[box-shadow] duration-700 ease-out hover:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.09)]"
          >
            <ShowcaseVideo
              label={`${item.name} — interaction preview`}
              src={item.videoSrc}
              caption={item.videoCaption}
              className={videoInCardClass}
            />
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`workflow-panel-${item.id}`}
              id={`innovation-trigger-${item.id}`}
              onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              className="w-full border-t border-black/[0.06] bg-white px-7 py-8 text-left transition-colors duration-300 hover:bg-black/[0.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-textPrimary md:px-9 md:py-9"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:text-[1.28rem]">
                  {item.name}
                </h3>
                <span className="mt-0.5 shrink-0 rounded-full border border-black/[0.08] bg-black/[0.02] px-3 py-1.5 font-sans text-[12px] font-medium tracking-wide text-textSecondary">
                  {isOpen ? "Hide" : "Workflow"}
                </span>
              </div>
              <p className="mt-3 font-sans text-[13px] font-medium leading-snug tracking-wide text-textSecondary/95">{item.capability}</p>
              <p className="mt-4 max-w-prose text-[16px] leading-[1.65] text-textSecondary">{item.detail}</p>
              {!isOpen && (
                <p className="mt-4 font-sans text-[12px] tracking-wide text-textSecondary/70">Tap to view LLM workflow</p>
              )}
            </button>
            {isOpen && (
              <div
                id={`workflow-panel-${item.id}`}
                role="region"
                aria-labelledby={`innovation-trigger-${item.id}`}
                className="border-t border-black/[0.06] px-7 pb-8 pt-8 md:px-9"
              >
                <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">LLM workflow</p>
                <div className={`relative overflow-hidden bg-black/[0.02] ring-1 ring-black/[0.06] ${mediaRound}`}>
                  <img
                    src={item.workflowSrc}
                    alt={`${item.name} — LLM workflow`}
                    className={`h-auto w-full ${mediaRound}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            )}
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
    videoSrc: "/assets/ai-character/new-cover.mp4",
    videoCaption: "Romance showroom — long-term memory in session",
  },
  {
    id: "astrology",
    tab: "Astrology",
    capability: "Real-time memory updates",
    feel: "Live constellation profile updates mid-conversation",
    videoSrc: "/assets/ai-character/taobaibai-1.mp4",
    videoCaption: "Astrology showroom — constellation file updates live",
  },
  {
    id: "therapy",
    tab: "Therapy",
    capability: "Real-time analysis",
    feel: "Expert panel surfaces conversation themes as you chat",
    videoSrc: "/assets/ai-character/therapy-1.mp4",
    videoCaption: "Therapy showroom — visible analysis alongside chat",
  },
] as const;

function UxStrategyShowroomTabs() {
  const [activeId, setActiveId] = useState<string>(uxStrategyShowrooms[0].id);
  const active = uxStrategyShowrooms.find((s) => s.id === activeId) ?? uxStrategyShowrooms[0];

  return (
    <div className="w-full pt-3">
      <p className="max-w-reading font-sans text-[15px] leading-relaxed text-textSecondary">
        Choose a room to see the proof pattern and play the full showroom walkthrough.
      </p>

      <div
        className="mt-7 flex flex-wrap gap-2.5 border-b border-black/[0.06] pb-4"
        role="tablist"
        aria-label="Showroom videos by room"
      >
        {uxStrategyShowrooms.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`ux-tab-${s.id}`}
              aria-selected={isActive}
              aria-controls={`ux-panel-${s.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(s.id)}
              className={`${roomTab.base} ${isActive ? roomTab.on : roomTab.off}`}
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      {uxStrategyShowrooms.map((s) => {
        const isActive = s.id === activeId;
        if (!isActive) return null;
        return (
          <div
            key={s.id}
            id={`ux-panel-${s.id}`}
            role="tabpanel"
            aria-labelledby={`ux-tab-${s.id}`}
            className="pt-10"
          >
            <div className="border-b border-black/[0.06] py-6">
              <p className="font-display text-[1.1rem] font-light text-textPrimary md:text-[1.15rem]">{s.tab}</p>
              <p className="mt-2.5 border-l-[3px] border-textPrimary pl-3.5 font-sans text-[14px] font-semibold leading-snug tracking-[-0.01em] text-textPrimary md:mt-3 md:pl-4 md:text-[14.5px]">
                {s.capability}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-textSecondary md:mt-5">{s.feel}</p>
            </div>
            <div className="pt-10">
              <ShowcaseVideo
                key={s.videoSrc}
                label={`${s.tab} showroom full video`}
                src={s.videoSrc}
                caption={s.videoCaption}
              />
            </div>
          </div>
        );
      })}
    </div>
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
      className="relative scroll-mt-24 overflow-hidden pb-32 pt-16 md:scroll-mt-28 md:pb-40 md:pt-24"
    >
      <div className="relative w-full">
        <motion.div
          className="mb-10 overflow-hidden rounded-2xl bg-black shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.08] md:mb-12"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easePremium }}
        >
          <div className="relative aspect-video w-full">
            {reduced ? (
              <img
                src="/assets/ai-character/showcase.jpg"
                alt="Qwen AI Character product showcase preview"
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Qwen AI Character experience overview"
              >
                <source src="/assets/ai-character/figma.mp4" type="video/mp4" />
              </video>
            )}
          </div>
        </motion.div>

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

              <motion.h1
                className="mt-7 font-display text-[2.2rem] font-light leading-[1.05] tracking-[-0.038em] text-textPrimary md:mt-8 md:text-[clamp(2.35rem,4.5vw,2.85rem)] md:leading-[1.04]"
                variants={reduced ? undefined : heroItem}
              >
                Designing the AI That Feels Alive
              </motion.h1>

              <motion.p
                className="mt-6 max-w-[36rem] font-sans text-[1.0625rem] font-normal leading-[1.68] tracking-[-0.012em] text-textSecondary md:mt-7 md:text-[1.125rem] md:leading-[1.66]"
                variants={reduced ? undefined : heroItem}
              >
                How I turned a <Em>model capability</Em> into an <Em>emotionally immersive</Em> product experience in{" "}
                <Em>4 weeks</Em>. After the showrooms went live, <Em>model call volume rose 200%</Em>.
              </motion.p>

              <motion.nav
                aria-label="Case study links"
                variants={reduced ? undefined : heroItem}
                className="mt-9 flex flex-wrap items-baseline gap-y-2 md:mt-11"
              >
                {heroLinks.map((item, i) => (
                  <span key={item.href} className="inline-flex items-center">
                    {i > 0 ? (
                      <span className="mx-3 select-none font-sans text-[13px] text-black/[0.12] md:mx-4" aria-hidden>
                        ·
                      </span>
                    ) : null}
                    <Link
                      href={item.href}
                      className="group inline-flex items-center font-sans text-[13px] font-medium tracking-[-0.01em] text-textSecondary/95 transition-colors duration-500 ease-out hover:text-textPrimary"
                    >
                      {item.label}
                      <span
                        className="ml-1 inline-block text-textSecondary/35 transition-[transform,color] duration-500 ease-out group-hover:translate-x-0.5 group-hover:text-textSecondary/55"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </span>
                ))}
              </motion.nav>
            </div>
          </motion.div>
        </motion.div>

       

        <motion.div
          className="mt-14 md:mt-20"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduced ? 0 : 0.85, ease: easePremium }}
        >
          <motion.div
            className="relative border-t border-black/[0.08] pt-10 md:pt-12"
            initial={reduced ? false : "hidden"}
            animate={reduced ? undefined : "visible"}
            variants={reduced ? undefined : introBlockContainer}
          >
            <motion.p
              className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-textSecondary/60"
              variants={reduced ? undefined : introBlockItem}
            >
              Project snapshot
            </motion.p>
            <motion.dl
              className="mt-8 divide-y divide-black/[0.06] border-b border-black/[0.06]"
              variants={reduced ? undefined : introMetaBlock}
            >
              {metaFields.map(({ label, value }) => (
                <motion.div
                  key={label}
                  variants={reduced ? undefined : introMetaRow}
                  className="grid grid-cols-1 gap-1.5 py-5 sm:grid-cols-[minmax(5.5rem,7.5rem)_minmax(0,1fr)] sm:items-baseline sm:gap-x-10 sm:gap-y-0 md:gap-x-14"
                >
                  <dt className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary/90">{label}</dt>
                  <dd className="font-sans text-[15px] font-normal leading-snug text-textPrimary md:text-[16px] md:leading-snug">{value}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function CaseStudyContent() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-white pt-24 md:pt-28">
      <CaseStudyNav />
      <main className="relative min-h-screen overflow-x-hidden pb-0">
        <article className="relative z-10 mx-auto max-w-content px-6 pb-20 pt-0 md:px-12 md:pb-24 lg:pl-36 lg:pr-14">
          <HeroSection reduced={reduced} />

          {/* LIVE PROTOTYPES */}
          <Section
            id="vibe-prototype"
            eyebrow="Live Interactive Prototypes"
            title="Three showrooms, designed and built end-to-end."
          >
            <p>
              Each showroom was designed, prototyped, and shipped by me — from user research through production code.
            </p>
            <p>
              Three vibe-coded showrooms rebuilt in English with Claude Code + Cursor. All three live previews are embedded
              below — compact ratio on this page; open any room&apos;s full-page version for the best fidelity.
            </p>
            <VibeCodingPrototypeGallery />
          </Section>

        {/* PROBLEM */}
        <Section
          id="problem"
          eyebrow="The Problem"
          title="High capability. Low conversion. The product was invisible."
        >
          <p>
            The model could remember users across sessions, evolve relationships, and personalize at depth — but none of this
            was <Em>visible</Em>. Trial users churned before they felt the difference.
          </p>
          <p>
            Enterprise prospects had the same gap: sales decks explained the model but couldn&apos;t show what building on it
            feels like. The funnel depended on customer imagination.
          </p>

          <SitePreviewFrame
            eyebrow="Before"
            title="Original chat window — generic template (AgentScope preview)"
            src="https://sparkdesign.agentscope.io/#/templates/ai-chat/preview"
            href="https://sparkdesign.agentscope.io/#/templates/ai-chat/preview"
          />

          <blockquote className="my-16 w-full !max-w-none rounded-2xl bg-surfaceAlt/50 px-8 py-12 text-center not-italic md:my-20 md:px-12 md:py-16">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">How might we</p>
            <p className="mt-8 font-display text-[1.35rem] font-light leading-[1.45] tracking-[-0.02em] text-textPrimary md:text-[1.55rem] md:leading-[1.42]">
              Make model capabilities <Em>visible</Em>, <Em>testable</Em>, and <Em>trustworthy</Em> — within minutes?
            </p>
          </blockquote>
        </Section>

        {/* STRATEGY */}
        <Section
          id="strategy"
          eyebrow="Product Strategy"
          title="From explaining the model to showing their future product."
        >
          <p>
            Instead of explaining capabilities, I let customers see a working version of their own future product.
            Each showroom was a <Em>market-specific prototype</Em>.
          </p>
          <div className="grid grid-cols-1 pt-6 md:grid-cols-3 md:gap-0">
            {[
              {
                n: "01",
                title: "Market-back character definition",
                body: "Companionship, therapy, persona replication, licensed IP — each a distinct B2B entry point.",
              },
              {
                n: "02",
                title: "Capability-to-scenario mapping",
                body: "Each interaction surfaces one model strength: memory callbacks, emotional depth, or personalization.",
              },
              {
                n: "03",
                title: "Reusable template for customers",
                body: "Showrooms customers could clone, configure, and launch — not one-time pitch artifacts.",
              },
            ].map((card, i) => (
              <div
                key={card.n}
                className={`min-w-0 md:px-3 lg:px-5 ${
                  i > 0
                    ? "mt-8 border-t border-black/[0.08] pt-8 md:mt-0 md:border-t-0 md:border-l md:border-black/[0.08] md:pt-0"
                    : ""
                }`}
              >
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-textSecondary/70">{card.n}</p>
                <p className="mt-3 font-display text-[1.02rem] font-light leading-snug tracking-tight text-textPrimary md:mt-3.5 md:text-[1.06rem]">
                  {card.title}
                </p>
                <p className="mt-3 font-sans text-[14px] leading-relaxed text-textSecondary md:text-[15px] md:leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* RESEARCH */}
        <Section
          id="research"
          eyebrow="Research"
          title="The real gap isn't quality — it's immersion."
        >
          <p>
            I used six competitor products and synthesized <Em>40+ public reviews</Em>. The pattern was clear: users hit a scripted
            ceiling — not because responses were bad, but because the interface felt like texting a chatbot.
          </p>
          <p>The unmet need wasn&apos;t output quality. It was <Em>immersion</Em>.</p>
          <ImagePlaceholder
            label="Character.AI — reference UI from competitor research (April 2026)"
            src="/assets/ai-character/research-character-ai-screenshot.png"
            className="mx-auto max-w-5xl"
          />
        </Section>

        {/* UX STRATEGY */}
        <Section
          id="ux-strategy"
          eyebrow="UX Strategy"
          title="One capability → one proof moment."
        >
          <p>Each showroom isolates one model strength and demonstrates it through direct experience.</p>

          <UxStrategyShowroomTabs />
        </Section>

        {/* INNOVATIONS */}
        <Section
          id="innovations"
          eyebrow="Core Interactions"
          title="Interaction innovations that make model capability visible."
        >
          <div className="border-y border-black/[0.06] py-8 md:py-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary">Focus room</p>
                <p className="mt-3 font-display text-[1.25rem] font-light text-textPrimary">Romance Room</p>
              </div>
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary">Design goal</p>
                <p className="mt-3 font-sans text-[16px] font-normal leading-snug text-textPrimary">
                  Sustain engagement through long-term memory and parallel narrative threads.
                </p>
              </div>
            </div>
          </div>

          <InteractionInnovationList />

          <AdditionalShowroomsGallery />
        </Section>

        {/* EXPERIENCE LOOP */}
        <Section
          id="experience-loop"
          eyebrow="Experience Loop"
          title="Accelerated loop: faster comprehension, lower drop-off."
        >
          <p>
            Engagement depth competes with time-to-value. I resolved this by{" "}
            <Em>accelerating the interaction loop</Em> — making capability legible within minutes.
          </p>

          <ShowcaseVideo
            label="Experience loop — inspiration and continuation"
            src="/assets/ai-character/conversation engine.mp4"
            caption="Option generation, narrative continuation, and multimodal response cues"
          />

          <div className="grid gap-6 pt-4 md:grid-cols-2 md:gap-8">
            <div className="rounded-2xl bg-white px-6 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] md:px-7">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary">Feature 01</p>
              <p className="mt-4 font-display text-[1.15rem] font-light tracking-tight text-textPrimary">Inspiration Response</p>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-textSecondary">
                Three <Em>context-grounded reply options</Em> with action, emotion, and expression cues. Guides the next move without breaking flow — feels like gameplay, not messaging.
              </p>
            </div>
            <div className="rounded-2xl bg-white px-6 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] md:px-7">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-textSecondary">Feature 02</p>
              <p className="mt-4 font-display text-[1.15rem] font-light tracking-tight text-textPrimary">Continue Response</p>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-textSecondary">
                One tap <Em>extends the active storyline</Em> from context — revealing long-context reasoning without user effort.
              </p>
            </div>
          </div>

          <ShowcaseVideo
            label="Experience loop — inspiration and continue response in flow"
            src="/assets/ai-character/inspire-continue-response/inspire-continue-response-1.mp4"
            caption="Screen recording: inspiration reply options and continue response in the romance showroom"
            className="mt-10"
            preload="auto"
          />

          <RevealLine className="mt-12" />

          <h3 className="mt-12 font-display text-[1.25rem] font-light tracking-tight text-textPrimary md:text-[1.35rem]">
            Developer tools — code drawer
          </h3>
          <p className="mt-4">
            A <Em>slide-out code tool </Em>  keeps YAML specs, prompts, and constraints beside the live experience — inspect and
            iterate without leaving the showroom. Shifted conversations from &ldquo;Can your model do this?&rdquo; to &ldquo;How
            fast can we ship?&rdquo;
          </p>
          <ShowcaseVideo
            label="Developer tools — in-product code side panel"
            src="/assets/ai-character/code/code%20tool.mp4"
            caption="Screen recording: code drawer with spec and prompt context alongside the demo"
            className="mt-8"
          />
        </Section>

        {/* PROCESS */}
        <Section
          id="process"
          eyebrow="Design Craft"
          title="Visual identity crafted with AI tools."
        >
          <p>
            Drawing from <Em>Love and Deepspace</Em>, I used AI generation tools (Wan, Kling, Dreamnia, SeeDance) to explore and
            finalize character visual identity under a 4-week constraint.
          </p>
          <div className="grid gap-6 pt-2 md:grid-cols-2 md:gap-8">
            <ImagePlaceholder label="Character design exploration" src="/assets/ai-character/design.jpg" />
            <ImagePlaceholder label="UI visual system" src="/assets/ai-character/uivisual.jpg" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <ImagePlaceholder label="Character direction explorations" src="/assets/ai-character/characterdirection.jpg" />
            <ImagePlaceholder label="Scene music and motion concept" src="/assets/ai-character/innovation.jpg" />
          </div>

          <RevealLine className="mt-2" />

          <h3 className="mt-12 font-display text-[1.25rem] font-light tracking-tight text-textPrimary md:text-[1.35rem]">
            Craft moment: 3D → AI video loops
          </h3>
          <p className="mt-4">
            The 3D avatar crashed mid-interaction. I replaced it with an <Em>AI-generated looping video</Em> — lighter,
            more stable, and subtly present. Small motion (blink, smile, nod) felt more alive than complex animation.
          </p>
        </Section>

        {/* BACKEND */}
        <Section
          id="backend"
          eyebrow="Backend Redesign"
          title="Four B2B console pages redesigned for scanability."
        >
          <p>
            Mapped missing scope to <Em>P0–P3</Em> and aligned timelines in <Em>24 hours</Em>. Redesigned Knowledge Base,
            Extended Capability, API Center, and the homepage around one principle: <Em>easy to try, find, edit, and track</Em>.
          </p>
          <div className="grid grid-cols-1 gap-8 pt-4 md:grid-cols-2 md:gap-10">
            <ShowcaseVideo label="Homepage redesign" src="/assets/ai-character/homepage.mov" caption="Homepage Redesign" />
            <ImagePlaceholder label="Knowledge Base console redesign" src="/assets/ai-character/updateddesign1.jpg" />
            <ImagePlaceholder label="Extended Capability console redesign" src="/assets/ai-character/updateddesign2.jpg" />
            <ImagePlaceholder label="Knowledge base detail redesign" src="/assets/ai-character/updatedesign3.jpg" />
          </div>
        </Section>

        {/* OUTCOME */}
        <Section
          id="outcome"
          eyebrow="Outcome"
          title="Shipped. Converted. Adopted."
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-b border-black/[0.06] pb-12 pt-4 md:grid-cols-3 md:gap-y-8 lg:grid-cols-5">
            {[
              { n: "4", label: "Showrooms shipped", detail: "each proving a distinct capability" },
              { n: "+200%", label: "model call volume", detail: "after showrooms went live" },
              { n: "87%", label: "fewer trial steps", detail: "via one-click clone and live config" },
              { n: "4 wks", label: "design to deploy", detail: "intern project to live product" },
              { n: "60%", label: "faster delivery", detail: "via production code handoff" },
            ].map((stat, i) => (
              <motion.div
                key={stat.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-display text-[2.5rem] font-light leading-none tracking-tight text-textPrimary md:text-[2.75rem]">{stat.n}</p>
                <p className="mt-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-textPrimary/65">{stat.label}</p>
                <p className="mt-2 font-sans text-[14px] leading-snug text-textSecondary">{stat.detail}</p>
              </motion.div>
            ))}
          </div>

          <h3 className="mt-14 font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:mt-16 md:text-[1.25rem]">
            Adopted Design Preview
          </h3>
          <p className="mt-3 max-w-reading font-sans text-[15px] leading-relaxed text-textSecondary">
            The B2B framework was adopted into Spark Design templates, turning the showroom pattern into a reusable foundation.
          </p>
          <SitePreviewFrame
            eyebrow="Adoption"
            title="Spark Design templates — adopted B2B design system page"
            src="https://sparkdesign.agentscope.io/#/templates"
            href="https://sparkdesign.agentscope.io/#/templates"
          />

          <p className="mt-10 border-l border-black/12 pl-6 font-sans text-[15px] leading-relaxed text-textSecondary md:mt-12 md:pl-7">
            <a
              href="https://tongyi.aliyun.com/character"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-textPrimary underline decoration-black/15 underline-offset-[6px] transition-colors duration-300 hover:decoration-textPrimary/40"
            >
              View the live showrooms →
            </a>
          </p>

          <h3 className="mt-20 font-display text-[1.15rem] font-light tracking-tight text-textPrimary md:mt-24 md:text-[1.25rem]">
            Product Preview
          </h3>
          <p className="mt-3 max-w-reading font-sans text-[15px] leading-relaxed text-textSecondary">
            Motion-driven, scenario-specific experiences replacing static documentation. Four rooms, each proving a distinct model capability.
          </p>
          <ShowcaseSlideGallery reduced={reduced} />
        </Section>

        <Section id="takeaway" eyebrow="Takeaway" title="What I Learned for AI Products" bordered={false}>
          <ul className="max-w-reading space-y-3 font-sans text-[16px] leading-relaxed text-textSecondary">
            <li>AI systems need <Em>visible cognition</Em>, not just outputs.</li>
            <li>Trust comes from <Em>inspectability</Em> and feedback loops.</li>
            <li>The fastest way to sell AI is to let users <Em>experience their own use case</Em>.</li>
          </ul>

          <h3 className="mt-14 font-display text-[1.2rem] font-light tracking-tight text-textPrimary md:mt-16 md:text-[1.28rem]">
            Design principles
          </h3>
          <div className="mt-6 space-y-7 font-sans text-[16px] leading-relaxed text-textSecondary md:text-[17px] md:leading-[1.65]">
            <p>
              <Em>Design is the translation layer.</Em> The hardest problem in AI products isn&apos;t model quality —
              it&apos;s helping customers imagine what they can build.
            </p>
            <p>
              <Em>The strongest demo is future-self proof.</Em> Show a working version of their own future product — then let them clone it.
            </p>
          </div>
        </Section>
        </article>
      </main>
    </div>
  );
}
