"use client";

/**
 * /lab/bento — homepage redesign in the xiangyidesign.com bento-desktop style.
 *
 * Single-screen, NO-SCROLL puzzle of draggable widget windows, dark with a lime
 * accent (toggleable to a shadow-free light theme). Four columns; the flex-[N]
 * on each card is the user's height ratio (each column sums to 10).
 */

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { BentoClock } from "@/components/bento/BentoClock";
import { SideRail } from "@/components/bento/SideRail";
import { CraftModel } from "@/components/hero/CraftModel";
import { RoseLoader } from "@/components/RoseLoader";
import { SplitTextChars } from "@/components/SplitBtn";

const EMAIL = "fangyuanzero7@gmail.com";
const BRAND_TAGS = ["Design Engineer", "AI-Native", "Visual Craft"];

/* True below the `md` breakpoint. Layout is handled in CSS; this only gates
 * runtime behaviour (drag) that CSS can't express. Starts `false` so SSR and
 * the first client paint agree, then corrects on mount. */
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

// only the near-square artwork (the others in /about/gallery are panoramas)
const ARTWORK = [
  "/assets/about/gallery/echo.jpg",
  "/assets/about/gallery/hang.jpg",
  "/assets/about/gallery/ice.jpg",
  "/assets/about/gallery/read.jpg",
];

const JOURNEY = [
  { org: "Liner", note: "Product Designer · 2026" },
  { org: "Alibaba Cloud", note: "Product Design Intern · 2025" },
  { org: "Meituan", note: "Product Design Intern · 2025" },
  { org: "UW · HCDE", note: "MS · 2024–26" },
  { org: "Pratt Institute", note: "BFA" },
];

/* scaled iframe with a lime RoseLoader fallback */
function ScaledPrototype({
  src,
  naturalW,
  naturalH,
  interactive = false,
  reduced,
  fit = "width",
  bg = "#0c0d0f",
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  interactive?: boolean;
  reduced: boolean;
  fit?: "width" | "contain";
  bg?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(fit === "contain" ? Math.min(width / naturalW, height / naturalH) : width / naturalW);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalW, naturalH, fit]);

  const placement =
    fit === "contain"
      ? { top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" as const }
      : { top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left" as const };

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ background: bg }}>
      {!loaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center" style={{ background: bg }}>
          <RoseLoader reduced={reduced} className="h-12 w-12" />
        </div>
      ) : null}
      <iframe
        src={src}
        title="Prototype"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${interactive ? "" : "pointer-events-none"} border-0`}
        style={{ position: "absolute", width: naturalW, height: naturalH, ...placement }}
      />
    </div>
  );
}

/* in-view autoplay video for a bento media slot (muted, looping). Loads its
   source only once the card scrolls near the viewport — mirrors LinerMedia. */
function BentoVideo({ src }: { src: string }) {
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

  return (
    <video
      ref={vref}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/* the one filled-lime button — the primary call to action */
function SplitBtn({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center rounded-full bg-nltLime px-5 py-2.5 text-[13.5px] font-medium text-[#1d1d1f] transition-transform duration-300 hover:scale-[1.04]"
    >
      <SplitTextChars text={label} />
    </a>
  );
}

/* corner ↗ affordance — neutral grey at rest, warms to lime when the card is
   hovered (the whole BentoCard is the `group`). Purely decorative: clicks fall
   through to the full-block link beneath it. */
function CornerArrow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-40 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[14px] text-white/80 backdrop-blur-sm transition-colors duration-300 group-hover:bg-nltLime group-hover:text-[#1d1d1f] ${className}`}
    >
      ↗
    </span>
  );
}

/* identity — name + tags + CTA + tagline, with a profile photo fixed in the
   middle of the card; on hover it cross-fades to the rotating moodboard artwork
   (on touch, where there is no hover, the photo simply stays). */
function IdentityCard({
  reduced,
  light,
  inkDim,
}: {
  reduced: boolean;
  light: boolean;
  inkDim: string;
}) {
  const [hover, setHover] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % ARTWORK.length), 4800);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div
      className="relative flex h-full flex-col justify-between gap-2 px-4 py-3"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* center moodboard — profile photo fixed at rest, cross-fades to the
          rotating artwork gallery on hover; sits behind the text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-1/2 z-0 grid -translate-y-1/2 place-items-center"
      >
        <div className="relative aspect-square w-[56%] max-w-[190px]">
          <div className="absolute inset-0 overflow-hidden rounded-xl ring-1 ring-white/10">
            {/* profile photo — base layer, always visible; hidden while hovering */}
            <Image
              src="/assets/about/yuan-portrait.jpg"
              alt="Yuan Fang"
              fill
              sizes="220px"
              className={`object-cover transition-opacity duration-700 ${hover ? "opacity-0" : "opacity-100"}`}
            />
            {/* artwork gallery — revealed (and rotates) on hover */}
            {ARTWORK.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="220px"
                className={`object-cover transition-opacity duration-700 ${hover && idx === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
          {/* oversized lime quote — its own top layer, never clipped by the image */}
          <span className="absolute -left-2 -top-6 z-20 select-none font-display text-[clamp(3rem,9vh,5rem)] italic leading-[0.55] text-nltLime/55">
            &ldquo;
          </span>
        </div>
      </div>

      {/* top — name + tagline */}
      <div className="relative z-10 leading-none">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime">Hi, I&apos;m 👋</p>
        <p className="font-display text-[clamp(2rem,3.6vw,3rem)] font-light italic leading-[0.85] text-nltLime">yuan</p>
        <p className="mt-0.5 font-sans text-[clamp(1.1rem,2.2vw,1.8rem)] font-light uppercase tracking-[0.12em] text-nltLime/40">
          Fang
        </p>
        <p className="mt-3 font-display text-[12.5px] font-light leading-[1.8]">
          <span className="relative inline-block px-[0.35em]">
            {/* only the bar is slanted; the text stays upright, square corners */}
            <span aria-hidden className="absolute inset-0 -z-0 -rotate-[2deg] bg-nltLime" />
            <span className="relative z-10 text-[#1d1d1f]">Love crafting, but crave creating even more.</span>
          </span>
        </p>
      </div>

      {/* bottom — tags + CTA */}
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {BRAND_TAGS.map((r) => (
            <span key={r} className={`rounded-full border border-current/20 px-2 py-0.5 text-[10px] ${inkDim}`}>
              {r}
            </span>
          ))}
        </div>
        <div>
          <SplitBtn href={`mailto:${EMAIL}`} label="Say hello ↗" />
        </div>
      </div>
    </div>
  );
}

/* liner — presentational media: plays a video at rest, cross-fades to a (static)
   prototype preview while the card is hovered. Hover + click are owned by the
   full-block link in the parent, so this layer is pointer-events-none. */
function LinerMedia({ reduced, hover }: { reduced: boolean; hover: boolean }) {
  const vref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (hover) setArmed(true);
  }, [hover]);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = "/assets/liner/liner-product-video.mp4";
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
  }, []);

  return (
    <div className="pointer-events-none absolute inset-2 top-12 overflow-hidden rounded-xl border border-white/10 bg-[#141416]">
      <video
        ref={vref}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hover ? "opacity-0" : "opacity-100"}`}
      />
      {armed ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${hover ? "opacity-100" : "opacity-0"}`}>
          <ScaledPrototype src="/assets/liner/liner-ai-yuan.html" naturalW={1280} naturalH={760} fit="contain" reduced={reduced} />
        </div>
      ) : null}
      <span
        className="absolute bottom-2 left-2.5 z-10 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/85 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: hover ? 0 : 1 }}
      >
        Hover to preview ↗
      </span>
    </div>
  );
}

/* vinyl player — autoplay-attempt + click to play / pause. The playing state is
   loud on purpose: spinning art, a pulsing ring, a tall lime equalizer. */
function VinylAudio() {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.55;
    let removeGesture = () => {};
    a.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Browsers block sound autoplay until the first user gesture, so the
        // initial play() rejects. Arm a one-shot listener and start the record
        // the moment the visitor interacts (click / key / scroll / touch).
        setPlaying(false);
        const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
        const start = () => {
          a.play().then(() => setPlaying(true)).catch(() => {});
          removeGesture();
        };
        events.forEach((ev) =>
          window.addEventListener(ev, start, { once: true, passive: true }),
        );
        removeGesture = () => events.forEach((ev) => window.removeEventListener(ev, start));
      });
    return () => removeGesture();
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label={playing ? "Pause audio" : "Play audio"} className="relative block h-full w-full overflow-hidden text-left">
      <audio ref={ref} src="/assets/vinyl.mp3" loop preload="auto" />
      <Image
        src="/assets/record.png"
        alt="Vinyl record player"
        fill
        sizes="280px"
        className={`object-cover object-center transition-transform duration-700 ${playing ? "scale-105" : "scale-100"}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      {/* lime sheen rising from the base while playing */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 transition-opacity duration-500"
        style={{ opacity: playing ? 1 : 0, background: "radial-gradient(120% 80% at 50% 120%, rgba(210,255,0,0.30), transparent 70%)" }}
      />
      {/* play / pause with a pulsing lime ring */}
      <span className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-[12px] text-white backdrop-blur-sm">
        {playing ? <span className="absolute inset-0 animate-ping rounded-full border border-nltLime/70" /> : null}
        <span className="relative">{playing ? "❚❚" : "▶"}</span>
      </span>
      {/* bottom — label + tall equalizer */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-nltLime">
            {playing ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-nltLime" /> : null}
            {playing ? "Now playing" : "Tap to play"}
          </p>
          <p className="truncate text-[12px] text-white">On the turntable</p>
        </div>
        <div className="flex h-7 items-end gap-[3px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-[4px] rounded-full bg-nltLime"
              style={{
                height: 5,
                opacity: playing ? 1 : 0.35,
                animation: playing ? `soundbar ${0.5 + i * 0.12}s ease-in-out infinite alternate` : "none",
                animationDelay: `${i * 0.09}s`,
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
  const light = false; // light theme locked for now (toggle shows "coming soon")
  const [linerHover, setLinerHover] = useState(false);

  const ink = light ? "text-[#1d1d1f]" : "text-white";
  const inkDim = light ? "text-black/55" : "text-white/55";
  const inkFaint = light ? "text-black/40" : "text-white/40";
  const surface = light ? "light" : "dark";
  const hero = light ? "light" : "glass";
  const canvas = light ? "#edece6" : "#0a0b0c";

  return (
    <div className="relative min-h-[100svh] transition-colors duration-500 md:h-[100svh] md:overflow-hidden" style={{ background: canvas, color: light ? "#1d1d1f" : "#fff" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(210,255,0,${light ? 0.16 : 0.13}) 1px, transparent 1.5px)`,
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />
      {/* mirrored corner — faint lime wash + dot-matrix anchored bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: `radial-gradient(58% 48% at 6% 100%, rgba(210,255,0,${light ? 0.08 : 0.06}), transparent 70%)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(210,255,0,${light ? 0.16 : 0.13}) 1px, transparent 1.5px)`,
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
          maskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
        }}
      />

      <SideRail active="home" />

      <div className="relative z-10 mx-auto w-full px-3 pb-24 pt-3 md:flex md:h-full md:gap-2.5 md:py-3 md:pb-3 md:pl-14 md:pr-4">
        {/* On mobile each column wrapper becomes `display:contents`, so every card
            flows directly into the grid below; CSS `order-*` then sequences them
            into a single intentional feed. On md+ the wrappers reassert as the
            four flex columns of the no-scroll desktop puzzle. */}
        <div className="grid grid-cols-2 content-start gap-2.5 md:flex md:min-h-0 md:flex-1 md:gap-2.5 md:overflow-hidden">
          {/* ===== col 1 — identity(7) · clock(3) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[0.9] md:flex-col md:gap-2.5">
            {/* identity — name + moodboard (hover) + CTA, merged into one tall card */}
            <BentoCard label="Yuan Fang" surface={hero} light={light} drag={drag} index={0} className="order-1 col-span-2 h-[400px] min-h-0 flex-[7] md:order-none md:h-auto">
              <IdentityCard reduced={reduced} light={light} inkDim={inkDim} />
            </BentoCard>

            {/* clock — bigger */}
            <BentoCard label="PDT" surface={surface} light={light} drag={drag} index={2} className="order-9 col-span-1 h-[180px] min-h-0 flex-[3] md:order-none md:h-auto">
              <BentoClock light={light} />
            </BentoCard>
          </div>

          {/* ===== col 2 — qbix(4) · meituan(6) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[1.05] md:flex-col md:gap-2.5">
            {/* qbix — whole block is the live site (no label); opens in a new tab */}
            <BentoCard surface={surface} light={light} drag={drag} accent="#c8e06c" index={3} className="order-4 col-span-2 h-[220px] min-h-0 flex-[3.6] md:order-none md:h-auto">
              <a href="https://qbix.space" target="_blank" rel="noopener noreferrer" aria-label="Open qbix.space" className="absolute inset-0 z-30 block" />
              <CornerArrow className="right-2.5 top-2.5" />
              <div className="pointer-events-none absolute inset-0">
                <ScaledPrototype src="https://qbix.space" naturalW={1600} naturalH={900} fit="width" reduced={reduced} />
              </div>
            </BentoCard>

            {/* meituan — complete dark prototype; whole block opens the case study */}
            <BentoCard label="Meituan" surface="dark" light={light} drag={drag} accent="#FFC300" index={4} className="order-2 col-span-2 h-[480px] min-h-0 flex-[6.4] md:order-none md:h-auto">
              <Link href="/work/meituan-im" target="_blank" rel="noopener noreferrer" aria-label="Meituan case study" className="absolute inset-0 z-30" />
              <span className="pointer-events-none absolute left-3 top-2.5 z-40 font-mono text-[10px] uppercase tracking-[0.14em] text-nltLime">Design + Build</span>
              <CornerArrow className="right-2.5 top-2.5" />
              {/* lime gradient bleeds at the framed edges */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(70% 60% at 50% 45%, rgba(210,255,0,0.18), transparent 72%)" }}
              />
              {/* product walkthrough fills the card — same treatment as the Liner card */}
              <div className="pointer-events-none absolute inset-2 top-12 overflow-hidden rounded-xl border border-white/10 bg-[#141416] shadow-[0_18px_50px_-18px_rgba(210,255,0,0.3)]">
                <BentoVideo src="/assets/meituan-im/meituan-present/meituan-present-1.mp4" />
              </div>
            </BentoCard>
          </div>

          {/* ===== col 3 — craft(3.5) · liner(6.5) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[1.2] md:flex-col md:gap-2.5">
            <BentoCard label="02 · Craft" surface="dark" light={light} drag={drag} index={5} className="order-5 col-span-2 h-[200px] min-h-0 flex-[4] md:order-none md:h-auto">
              <div className="absolute inset-0">
                <CraftModel reduced={reduced} active onInteract={() => {}} zoom={1.2} />
              </div>
            </BentoCard>

            {/* liner — "right now" feel; whole block opens the case study */}
            <BentoCard surface="dark" light={light} drag={drag} index={6} className="order-3 col-span-2 h-[240px] min-h-0 flex-[6] md:order-none md:h-auto">
              <Link
                href="/work/liner"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Liner case study"
                className="absolute inset-0 z-30"
                onMouseEnter={() => setLinerHover(true)}
                onMouseLeave={() => setLinerHover(false)}
              />
              <div className="pointer-events-none absolute left-2.5 top-2.5 z-40 flex items-center gap-1.5 pr-12">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-nltLime">
                  Now · shaping Liner&apos;s new AI collaboration feature
                </span>
              </div>
              <CornerArrow className="right-2.5 top-1.5" />
              <LinerMedia reduced={reduced} hover={linerHover} />
            </BentoCard>
          </div>

          {/* ===== col 4 — journey(5) · audio(5) ===== */}
          <div className="contents md:flex md:min-h-0 md:flex-[0.8] md:flex-col md:gap-2.5">
            <BentoCard label="Journey" surface={surface} light={light} drag={drag} index={9} className="order-8 col-span-2 h-[330px] min-h-0 flex-[5] md:order-none md:h-auto">
              <motion.div
                className="flex h-full flex-col justify-center px-3.5 py-3"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.22, delayChildren: 0.1 } } }}
              >
                {JOURNEY.map((j, idx) => (
                  <motion.div
                    key={j.org}
                    className="group/j flex cursor-default gap-3"
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 18 } } }}
                  >
                    {/* dot + connecting line — one continuous element */}
                    <div className="relative flex flex-col items-center">
                      <span className="z-10 mt-0.5 h-2 w-2 shrink-0 rounded-full bg-nltLime ring-2 ring-current/10 transition-transform duration-300 group-hover/j:scale-150" />
                      {idx < JOURNEY.length - 1 ? (
                        <motion.span
                          className="w-px flex-1 bg-nltLime/45"
                          style={{ originY: 0 }}
                          variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.3, ease: "easeOut" } } }}
                        />
                      ) : null}
                    </div>
                    <div className="pb-7 transition-transform duration-300 group-hover/j:translate-x-1">
                      <p className={`text-[12px] leading-tight transition-colors duration-300 group-hover/j:text-nltLime ${ink}`}>{j.org}</p>
                      <p className={`font-mono text-[8px] uppercase tracking-wider ${inkFaint}`}>{j.note}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </BentoCard>

            {/* audio — vinyl record, plays vinyl.mp3 (click to play/pause) */}
            <BentoCard label="Audio" surface="dark" light={light} drag={drag} index={11} className="order-10 col-span-1 h-[180px] min-h-0 flex-[5] md:order-none md:h-auto">
              <VinylAudio />
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
