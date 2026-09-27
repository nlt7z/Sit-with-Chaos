"use client";

/**
 * BentoHome — the homepage: a single-screen, NO-SCROLL puzzle of draggable
 * widget windows on a dark canvas with a lime accent. Four columns; each
 * card's flex-[N] is its share of the column height. Every block names itself
 * top-left (company, project, or widget) except the identity card.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { HalftoneGlobe } from "@/components/bento/HalftoneGlobe";
import { QuoteStamp } from "@/components/bento/QuoteStamp";
import { RAIL_CLEARANCE } from "@/components/bento/railClearance";
import { SideRail } from "@/components/bento/SideRail";
import { RoseLoader } from "@/components/RoseLoader";
import { SplitTextChars } from "@/components/SplitBtn";

const EMAIL = "fangyuanzero7@gmail.com";
// the role reads brighter than the rest of the line
const POSITIONING = { role: "Product Designer", rest: " who makes AI work people can see, check, and steer" };
const BRAND_TAGS = ["Product Thinking", "Visual Craft", "Curiosity"];

// the "now" block: O2 Tech AI's BOM feature film (muted, loops while on screen)
const NOW_FILM = { src: "/assets/o2/o2-bom-film.mp4", poster: "/assets/o2/o2-bom-film-poster.webp" };
const O2_CASE_STUDY = "/o2-case-study.html";

const MEITUAN_PROTOTYPE = "/assets/meituan-im/Revised%20Repair%20Flow.html#flow=default&rail=0";

// qbix.space's homepage, live; the hero still covers the block until it paints
const QBIX = { href: "https://qbix.space", poster: "/assets/work/qbix-scroll-poster.webp" };


/* True below the `md` breakpoint. Layout is handled in CSS; this only gates
 * runtime behaviour (drag, embed interactivity) that CSS can't express. Starts
 * `false` so SSR and the first client paint agree, then corrects on mount. */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

// square crops of the artwork; the photo cross-fades through them on hover
const ARTWORK = [
  "/assets/about/gallery/thumbs/echo.webp",
  "/assets/about/gallery/thumbs/hang.webp",
  "/assets/about/gallery/thumbs/ice.webp",
  "/assets/about/gallery/thumbs/read.webp",
];

// One stop per slide: logo, name, role. Logos render as quiet white marks (a
// logo bar, Vercel / Linear style) via a CSS filter; Meituan ships a
// pre-knocked-out file so 美团 stays readable inside its square.
const JOURNEY = [
  { org: "Liner", role: "Product Designer · 2026", logo: "/assets/logos/liner.png" },
  { org: "Alibaba Cloud", role: "Product Design Intern · 2025", logo: "/assets/logos/alibaba.svg" },
  { org: "Meituan", role: "Product Design Intern · 2025", logo: "/assets/logos/meituan-mono.png", knockout: true },
  { org: "University of Washington", role: "MS · 2024–26", logo: "/assets/logos/uw.svg" },
  { org: "Pratt Institute", role: "BFA · Interactive Arts", logo: "/assets/logos/pratt.svg" },
];
const JOURNEY_DWELL = 4000; // ms per stop

/* Mount a heavy embed only once its box is on screen and the page has had a
   beat to paint. Client-only on purpose: a server-rendered iframe can finish
   loading before hydration, and its onLoad would then never reach React. */
function useDeferredMount<T extends HTMLElement>(delay = 700) {
  const ref = useRef<T>(null);
  const [mount, setMount] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        t = window.setTimeout(() => setMount(true), delay);
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [delay]);
  return { ref, mount };
}

/* A live website rendered at a desktop width and scaled into the block; its
   viewport height follows the block's aspect, so the page fills edge to edge.
   Presentational (no pointer events); a poster covers it until it loads. */
function LiveSite({ src, poster, title, width = 1440 }: { src: string; poster: string; title: string; width?: number }) {
  const { ref, mount } = useDeferredMount<HTMLDivElement>(600);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const scale = box.w ? box.w / width : 0;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {mount && scale ? (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          onLoad={() => window.setTimeout(() => setLoaded(true), 1200)}
          className="pointer-events-none absolute left-0 top-0 border-0"
          style={{ width, height: Math.round(box.h / scale), transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}

/* The Meituan prototype, live. Its 480×1000 canvas is white around the phone,
   so the iframe is clipped to the device itself (measured bezel: 432×924 at
   24,70, 56px corners) and scaled to fit the block. Deferred-mounted so the
   homepage paints first. */
const PHONE = { canvasW: 480, canvasH: 1000, x: 24, y: 70, w: 432, h: 924, r: 56 };

function PhonePrototype({ src, title, reduced, interactive }: { src: string; title: string; reduced: boolean; interactive: boolean }) {
  const { ref: boxRef, mount } = useDeferredMount<HTMLDivElement>(900);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [boxRef]);

  const s = box.w && box.h ? Math.min(box.w / PHONE.w, box.h / PHONE.h) : 0;
  const clip = `inset(${PHONE.y}px ${PHONE.canvasW - PHONE.x - PHONE.w}px ${PHONE.canvasH - PHONE.y - PHONE.h}px ${PHONE.x}px round ${PHONE.r}px)`;

  return (
    <div ref={boxRef} className="absolute inset-0">
      {s > 0 ? (
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: PHONE.w * s, height: PHONE.h * s, transform: "translate(-50%, -50%)" }}
        >
          {!loaded ? (
            <div
              className="absolute inset-0 grid place-items-center bg-white/[0.04]"
              style={{ borderRadius: PHONE.r * s }}
            >
              <RoseLoader reduced={reduced} className="h-12 w-12" />
            </div>
          ) : null}
          {mount ? (
            <iframe
              src={src}
              title={title}
              onLoad={() => window.setTimeout(() => setLoaded(true), 350)}
              tabIndex={interactive ? 0 : -1}
              className="border-0"
              style={{
                position: "absolute",
                left: -PHONE.x * s,
                top: -PHONE.y * s,
                width: PHONE.canvasW,
                height: PHONE.canvasH,
                transform: `scale(${s})`,
                transformOrigin: "top left",
                clipPath: clip,
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.5s ease",
                pointerEvents: interactive ? "auto" : "none",
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* in-view autoplay video for a bento media slot (muted, looping). Loads its
   source only once the card scrolls near the viewport. */
function InViewVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = src;
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={vref} muted loop playsInline preload="none" poster={poster} aria-hidden className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}

/* corner ↗ link in the card header — neutral grey at rest, warms to lime when
   the card is hovered (the whole BentoCard is the `group`). Stops pointerdown
   so a click navigates instead of starting a header drag. */
function CornerArrow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      onPointerDown={(e) => e.stopPropagation()}
      className="relative z-40 -mr-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/[0.06] text-[13px] text-[#8a8f98] transition-colors duration-150 hover:bg-nltLime hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70 group-hover:bg-white/[0.1] group-hover:text-[#f7f8f8]"
    >
      <span aria-hidden>↗</span>
    </a>
  );
}

/* identity — name, slogan, the photo (hover: artwork), the positioning line +
   focus tags and the CTA, on frosted glass. */
function IdentityCard({ reduced }: { reduced: boolean }) {
  const [hover, setHover] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || !hover) return;
    const id = setInterval(() => setI((v) => (v + 1) % ARTWORK.length), 2600);
    return () => clearInterval(id);
  }, [reduced, hover]);

  return (
    <div
      className="relative flex h-full flex-col gap-4 px-4 pb-4"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* the glass: a cool sheen from the top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 inset-x-0 bottom-0"
        style={{ background: "linear-gradient(158deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.015) 36%, rgba(255,255,255,0) 60%)" }}
      />

      {/* top — name + slogan */}
      <div className="relative shrink-0 leading-none">
        <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.16em] text-nltLime">Hi, I&apos;m 👋</p>
        <p className="font-display text-[clamp(2.1rem,3.6vw,3rem)] font-light italic leading-[0.85] text-nltLime">yuan</p>
        <p className="mt-1 font-sans text-[clamp(1.35rem,2.2vw,1.8rem)] font-light uppercase tracking-[0.12em] text-nltLime/60">Fang</p>
        <p className="mt-4 font-display text-[15px] font-light leading-[1.45] text-[#d0d6e0]">
          Love crafting, but crave creating even more.
        </p>
      </div>

      {/* middle — the photo; the quote is a sticker pressed onto its corner */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-[#1a1c17]">
          <Image
            src="/assets/about/yuan-portrait.jpg"
            alt="Yuan Fang"
            fill
            sizes="300px"
            className={`object-cover transition-opacity duration-700 ${hover ? "opacity-0" : "opacity-100"}`}
          />
          {ARTWORK.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="300px"
              className={`object-cover transition-opacity duration-700 ${hover && idx === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <QuoteStamp reduced={reduced} className="absolute -left-2.5 -top-4 z-10 w-[58px]" />
      </div>

      {/* bottom — positioning + focus tags + CTA */}
      <div className="relative flex shrink-0 flex-col gap-3">
        <p className="text-[13.5px] leading-[1.5] text-white/75">
          <span className="text-white">{POSITIONING.role}</span>
          {POSITIONING.rest}
        </p>
        <ul className="-mt-0.5 flex flex-wrap gap-1.5" aria-label="Focus">
          {BRAND_TAGS.map((r) => (
            <li key={r} className="rounded-full bg-white/[0.06] px-2.5 py-[5px] text-[12px] font-medium leading-none tracking-[-0.005em] text-[#d0d6e0]">
              {r}
            </li>
          ))}
        </ul>
        <div className="pt-1">
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-nltLime px-5 text-[14px] font-medium text-[#0a0b0c] shadow-[0_0_0_rgba(210,255,0,0)] transition-[box-shadow,transform] duration-300 ease-portfolio hover:shadow-[0_8px_28px_-6px_rgba(210,255,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1b1d] active:scale-[0.98]"
          >
            <span className="sr-only">Say hello</span>
            {/* flex + a line box the size of the glyph boxes, so the rolling
                letters centre on the arrow instead of riding 3px high */}
            <span aria-hidden className="flex items-center leading-[1.1]">
              <SplitTextChars text="Say hello" />
            </span>
            <span aria-hidden className="leading-none transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* journey — one stop per slide (logo, name, role), advancing every
   JOURNEY_DWELL ms; hover / focus holds it. Reduced motion: stays on the first
   stop. The timer only runs on the client, so hydration can't drop a tick. */
function JourneyCarousel({ reduced }: { reduced: boolean }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = JOURNEY.length;
  const j = JOURNEY[i];
  const auto = !reduced && !paused;

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setI((v) => (v + 1) % n), JOURNEY_DWELL);
    return () => clearTimeout(id);
  }, [auto, i, n]);

  return (
    <div
      className="relative h-full px-4 pb-4"
      role="region"
      aria-roledescription="carousel"
      aria-label="Journey"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-full overflow-hidden" aria-live={auto ? "off" : "polite"}>
        {/* out, then in: the two stops never share the frame */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={j.org}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            className="absolute inset-0 flex flex-col justify-center"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={j.logo}
              alt=""
              className={`h-8 w-auto max-w-[160px] self-start object-contain object-left opacity-90 ${"knockout" in j ? "" : "brightness-0 invert"}`}
            />
            <p className="mt-6 font-display text-[clamp(1.3rem,1.8vw,1.7rem)] font-light leading-[1.15] text-white">{j.org}</p>
            {/* the " · year" stays glued to the last word, so a narrow column wraps
                the title, never the date */}
            <p className="mt-2 font-mono text-[11px] uppercase leading-[1.5] tracking-[0.06em] text-nltLime">{j.role.replace(/ · /g, "\u00a0·\u00a0")}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* vinyl player — click to play / pause (no autoplay). The playing state is
   loud on purpose: a pulsing ring, a lime sheen, a tall equalizer. */
function VinylAudio() {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.55;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label={playing ? "Pause audio" : "Play audio"} aria-pressed={playing} className="relative block h-full w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nltLime/60">
      <audio ref={ref} src="/assets/vinyl.mp3" loop preload="none" />
      <Image
        src="/assets/record.png"
        alt=""
        fill
        sizes="280px"
        className={`object-cover object-center transition-transform duration-700 ${playing ? "scale-105" : "scale-100"}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 transition-opacity duration-500"
        style={{ opacity: playing ? 1 : 0, background: "radial-gradient(120% 80% at 50% 120%, rgba(210,255,0,0.30), transparent 70%)" }}
      />
      <span className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-[12px] text-white backdrop-blur-sm">
        {playing ? <span className="absolute inset-0 animate-ping rounded-full border border-nltLime/70" /> : null}
        <span className="relative">{playing ? "❚❚" : "▶"}</span>
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-nltLime">
            {playing ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nltLime" /> : null}
            {playing ? "Now playing" : "Tap to play"}
          </p>
          <p className="truncate text-[13px] text-white">On the turntable</p>
        </div>
        <div className="flex h-7 items-end gap-[3px]">
          {[0, 1, 2, 3, 4].map((k) => (
            <span
              key={k}
              className="w-[4px] rounded-full bg-nltLime"
              style={{
                height: 5,
                opacity: playing ? 1 : 0.35,
                animationName: playing ? "soundbar" : "none",
                animationDuration: `${0.5 + k * 0.12}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
                animationDelay: `${k * 0.09}s`,
              }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                 */
/* ------------------------------------------------------------------ */

export function BentoHome() {
  const reduced = !!useReducedMotion();
  const isMobile = useIsMobile();
  const drag = !isMobile; // dragging fights vertical scroll on touch devices

  return (
    <div className="relative min-h-[100svh] bg-[#0a0b0c] text-white md:h-[100svh] md:overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />
      {/* mirrored corner — faint lime wash + dot-matrix anchored bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(58% 48% at 6% 100%, rgba(210,255,0,0.06), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
          maskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
        }}
      />

      <SideRail active="home" />

      <div className={`relative z-10 mx-auto w-full px-3 pb-24 pt-3 md:flex md:h-full md:gap-2.5 md:py-3 md:pb-3 md:pr-4 ${RAIL_CLEARANCE}`}>
        {/* On mobile each column wrapper becomes `display:contents`, so every card
            flows directly into the grid below; CSS `order-*` then sequences them
            into a single intentional feed. On md+ the wrappers reassert as the
            four flex columns of the no-scroll desktop puzzle. */}
        <div className="grid grid-cols-2 content-start gap-2.5 md:flex md:min-h-0 md:flex-1 md:gap-2.5 md:overflow-hidden">
          {/* ===== col 1 — identity, full height ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[1.03] md:flex-col md:gap-2.5">
            <BentoCard surface="glass" drag={drag} index={0} className="order-1 col-span-2 h-[560px] min-h-0 flex-1 md:order-none md:h-auto">
              <IdentityCard reduced={reduced} />
            </BentoCard>
          </div>

          {/* ===== col 2 — the two films share the column height (a light
              side crop on desktop keeps every column's bottom edge aligned;
              mobile shows them at their own 16:9) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[2.05] md:flex-col md:gap-2.5">
            {/* qbix — the live homepage; the block opens the site */}
            <BentoCard label="Qbix Studio" headerRight={<CornerArrow href="https://qbix.space" label="Open qbix.space" />} surface="dark" drag={drag} accent="#c8e06c" index={3} className="order-4 col-span-2 min-h-0 md:order-none md:flex-1">
              <a href="https://qbix.space" target="_blank" rel="noopener noreferrer" aria-label="Open qbix.space in a new tab" className="absolute inset-0 z-30 block" />
              <div className="pointer-events-none relative mx-2 mb-2 aspect-video overflow-hidden rounded-[14px] bg-[#0b0b0b] md:aspect-auto md:min-h-0 md:flex-1">
                <LiveSite src={QBIX.href} poster={QBIX.poster} title="qbix.space homepage" />
              </div>
            </BentoCard>


            {/* O2 Tech AI — "right now"; the whole block opens the case study */}
            <BentoCard label="O2 Tech AI" headerRight={<CornerArrow href={O2_CASE_STUDY} label="O2 Tech AI case study" />} surface="dark" drag={drag} index={4} className="order-3 col-span-2 min-h-0 md:order-none md:flex-1">
              <a href={O2_CASE_STUDY} target="_blank" rel="noopener noreferrer" aria-label="O2 Tech AI case study (opens in a new tab)" className="absolute inset-0 z-30" />
              <div className="pointer-events-none relative z-20 flex shrink-0 items-baseline gap-2 px-4 pb-2">
                <span className="relative flex h-1.5 w-1.5 shrink-0 -translate-y-px">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
                </span>
                <span className="text-[13px] leading-snug text-white/80">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-nltLime">Now</span> · shaping O2 Tech AI&apos;s human-in-the-loop sourcing product
                </span>
              </div>
              <div className="pointer-events-none relative mx-2 mb-2 aspect-video overflow-hidden rounded-[14px] bg-[#141416] md:aspect-auto md:min-h-0 md:flex-1">
                <InViewVideo src={NOW_FILM.src} poster={NOW_FILM.poster} />
              </div>
            </BentoCard>
          </div>

          {/* ===== col 3 — meituan, the live prototype ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[1.02] md:flex-col md:gap-2.5">
            <BentoCard label="Meituan" headerRight={<CornerArrow href="/work/meituan-im" label="Meituan case study" />} surface="dark" drag={drag} accent="#FFC300" index={6} className="order-2 col-span-2 h-[600px] min-h-0 flex-1 md:order-none md:h-auto">
              <Link
                href="/work/meituan-im"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-20 flex shrink-0 items-end gap-3 px-4 pb-1 pt-1"
              >
                <span className="font-display text-[clamp(2rem,2.8vw,2.6rem)] font-light leading-[0.9] tracking-[-0.02em] text-nltLime">+30%</span>
                <span className="pb-0.5 text-[12.5px] leading-[1.35] text-white/75">
                  channel conversion
                  <br />
                  +0.5pp overall
                </span>
              </Link>
              <div className="relative min-h-0 flex-1">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "radial-gradient(55% 50% at 50% 55%, rgba(210,255,0,0.14), transparent 72%)" }}
                />
                <div className="absolute inset-x-3 bottom-3 top-3">
                  <PhonePrototype src={MEITUAN_PROTOTYPE} title="Meituan repair flow, live prototype" reduced={reduced} interactive={!isMobile} />
                </div>
                {isMobile ? (
                  <Link href="/work/meituan-im" aria-label="Meituan case study" className="absolute inset-0 z-30" />
                ) : null}
              </div>
            </BentoCard>
          </div>

          {/* ===== col 4 — location globe(4) · journey(3) · audio(3) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[0.9] md:flex-col md:gap-2.5">
            <BentoCard label="Location" surface="dark" drag={drag} index={2} className="order-7 col-span-2 h-[280px] min-h-0 flex-[4] md:order-none md:h-auto">
              <div className="relative min-h-0 flex-1">
                <HalftoneGlobe reduced={reduced} />
              </div>
            </BentoCard>

            <BentoCard label="Journey" surface="dark" drag={drag} index={9} className="order-8 col-span-2 h-[260px] min-h-0 flex-[3] md:order-none md:h-auto">
              <JourneyCarousel reduced={reduced} />
            </BentoCard>

            <BentoCard label="Audio" surface="dark" drag={drag} index={11} className="order-10 col-span-1 h-[200px] min-h-0 flex-[3] md:order-none md:h-auto">
              <div className="relative mx-2 mb-2 min-h-0 flex-1 overflow-hidden rounded-[14px]">
                <VinylAudio />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
