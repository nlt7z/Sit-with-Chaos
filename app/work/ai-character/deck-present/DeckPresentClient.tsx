"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// ─── Easings & variants ───────────────────────────────────────────────────────
const E    = [0.22, 1, 0.36, 1] as const;
const EMSK = [0.76, 0, 0.24, 1] as const;

const STG  = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
const UP   = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.82, ease: E } } };
const FADE = { hidden: { opacity: 0 },        show: { opacity: 1,       transition: { duration: 0.55, ease: E } } };

const LIME = "#C8FF47";

/** Left copy + right video/images: wider row, media-heavy split. */
const LR_DECK =
  "mx-auto grid w-full max-w-[min(88rem,100%)] gap-8 md:gap-x-10 md:gap-y-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.58fr)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.72fr)]";

// ─── Slide registry — re-sequenced to the live case study narrative ───────────
//   Opening → Problem → Decision 01 → 02 → 03 → Method → Showcase →
//   Contribution → Impact → Takeaway → Closing
const SLIDES = [
  { id: "cover",             chapter: "Opening",      dark: true  },
  { id: "overview",          chapter: "Opening",      dark: false },
  { id: "problem",           chapter: "Problem",      dark: true  },
  { id: "hmw",               chapter: "Problem",      dark: false },
  { id: "d1-title",          chapter: "Decision 01",  dark: true  },
  { id: "d1-before-after",   chapter: "Decision 01",  dark: false },
  { id: "d2-title",          chapter: "Decision 02",  dark: false },
  { id: "d2-map",            chapter: "Decision 02",  dark: false },
  { id: "heartbeat",         chapter: "Decision 02",  dark: false },
  { id: "heartbeat-logic",   chapter: "Decision 02",  dark: false },
  { id: "storyunlock",       chapter: "Decision 02",  dark: false },
  { id: "storyunlock-logic", chapter: "Decision 02",  dark: false },
  { id: "moments",           chapter: "Decision 02",  dark: false },
  { id: "moments-logic",     chapter: "Decision 02",  dark: false },
  { id: "altuniv",           chapter: "Decision 02",  dark: false },
  { id: "altuniv-logic",     chapter: "Decision 02",  dark: false },
  { id: "astro-profile",     chapter: "Decision 02",  dark: false },
  { id: "therapy-analysis",  chapter: "Decision 02",  dark: false },
  { id: "d3-title",          chapter: "Decision 03",  dark: true  },
  { id: "inspire-continue",  chapter: "Decision 03",  dark: true  },
  { id: "code-drawer",       chapter: "Decision 03",  dark: false },
  { id: "how-i-worked",      chapter: "Method",       dark: false },
  { id: "ai-tools",          chapter: "Method",       dark: false },
  { id: "showrooms",         chapter: "Showcase",     dark: true  },
  { id: "prototype-romance", chapter: "Showcase",     dark: false },
  { id: "prototype-astro",   chapter: "Showcase",     dark: false },
  { id: "prototype-therapy", chapter: "Showcase",     dark: false },
  { id: "backend",           chapter: "Contribution", dark: false },
  { id: "spark-design",      chapter: "Contribution", dark: false },
  { id: "metrics",           chapter: "Impact",       dark: true  },
  { id: "metrics-method",    chapter: "Impact",       dark: true  },
  { id: "principles",        chapter: "Takeaway",     dark: false },
  { id: "takeaways",         chapter: "Takeaway",     dark: false },
  { id: "closing",           chapter: "Closing",      dark: false },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Living aura — slow breathing accent blobs (the "feels alive" motif) ──────
function LivingAura({ reduced, tint = LIME }: { reduced: boolean | null; tint?: string }) {
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 540, height: 540, left: "6%", top: "10%",
          background: `radial-gradient(circle, ${hexA(tint, 0.1)}, transparent 68%)`,
          filter: "blur(44px)",
        }}
        animate={{ x: [0, 46, -12, 0], y: [0, -34, 22, 0], scale: [1, 1.14, 0.95, 1], opacity: [0.5, 0.9, 0.6, 0.5] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 440, height: 440, right: "8%", bottom: "6%",
          background: "radial-gradient(circle, rgba(123,108,244,0.1), transparent 70%)",
          filter: "blur(52px)",
        }}
        animate={{ x: [0, -38, 14, 0], y: [0, 26, -18, 0], scale: [1, 1.1, 0.93, 1], opacity: [0.4, 0.72, 0.5, 0.4] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
      />
    </div>
  );
}

/** rgba() from a 3- or 6-digit hex. */
function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// ─── Spotlight (cover bg) ─────────────────────────────────────────────────────
function Spotlight({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState({ x: "50%", y: "40%" });
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      setPos({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px` });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [containerRef]);
  return (
    <div className="pointer-events-none absolute inset-0"
      style={{ background: `radial-gradient(900px circle at ${pos.x} ${pos.y}, rgba(200,255,71,0.07), transparent 72%)` }} />
  );
}

// ─── Mask reveal ──────────────────────────────────────────────────────────────
function Mask({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div initial={{ y: "106%" }} animate={{ y: "0%" }} transition={{ duration: 0.88, ease: EMSK, delay }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({
  to, suffix = "", prefix = "", startDelay = 320, duration = 1100,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame: number;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setN(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const tid = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, startDelay);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame); };
  }, [to, startDelay, duration]);
  return <>{prefix}{n}{suffix}</>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const EYE  = "font-mono text-[10px] uppercase tracking-[0.26em]";
const BODY = "font-sans leading-[1.76]";

function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`${EYE} ${dark ? "text-white/[0.98]" : "text-[#9A9A9A]"}`}>{children}</p>;
}

// ─── Auto-play video ──────────────────────────────────────────────────────────
function Vid({
  src, caption, className = "", maxH = "max-h-[min(72vh,64rem)]",
}: { src: string; caption?: string; className?: string; maxH?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    void el.play().catch(() => {});
    return () => { el.pause(); };
  }, [src]);
  return (
    <figure className={`group overflow-hidden rounded-xl ring-1 ring-black/[0.08] ${className}`}>
      <div className="overflow-hidden rounded-xl bg-black">
        <video ref={ref} muted playsInline loop preload="metadata" controls
          className={`w-full object-contain transition-transform duration-700 group-hover:scale-[1.015] ${maxH}`}>
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {caption && (
        <figcaption className={`border-t border-black/[0.06] px-4 py-2.5 ${EYE} text-[#999] tracking-[0.08em]`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Dark video (on dark bg) ──────────────────────────────────────────────────
function DarkVid({
  src, caption, className = "", maxH = "max-h-[min(70vh,60rem)]",
}: { src: string; caption?: string; className?: string; maxH?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    void el.play().catch(() => {});
    return () => { el.pause(); };
  }, [src]);
  return (
    <figure className={`group overflow-hidden rounded-xl ring-1 ring-white/[0.1] ${className}`}>
      <div className="overflow-hidden rounded-xl bg-[#0A0A0A]">
        <video ref={ref} muted playsInline loop preload="metadata" controls
          className={`w-full object-contain ${maxH}`}>
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {caption && (
        <figcaption className={`border-t border-white/[0.08] px-4 py-2.5 ${EYE} text-white/93 tracking-[0.08em]`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Workflow SVG viewer ──────────────────────────────────────────────────────
function WorkflowImg({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`flex min-h-0 w-full min-w-0 flex-1 basis-0 flex-col ${className}`}>
      <div className="flex min-h-0 w-full flex-1 basis-0 flex-col items-stretch">
        <div className="relative box-border min-h-0 w-full max-w-[min(76rem,100%)] flex-1 self-center rounded-xl bg-black/[0.02] px-2 py-1 ring-1 ring-black/[0.07] md:px-3 md:py-2">
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 box-border block h-full w-full object-contain object-center p-0.5"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 Cover
function SlideCover({ reduced }: { reduced: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const meta = [
    { k: "Company",  v: "Alibaba Cloud · Qwen Character" },
    { k: "Role",     v: "Sole UX Designer — research to production code" },
    { k: "Duration", v: "4 weeks · July–August 2025" },
    { k: "Outcome",  v: "Shipped · ~2× model traffic · B2B adopted" },
  ];
  return (
    <section ref={ref} className="relative flex h-full min-h-0 items-stretch overflow-hidden bg-[#050507]">
      <LivingAura reduced={reduced} />
      <Spotlight containerRef={ref} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-[#C8FF47]/[0.025] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] select-none lg:block">
        <motion.img
          src="/assets/ai-character/eternal-vow-character.png" alt="" aria-hidden
          className="h-full w-full object-cover object-top"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.75) 55%)", opacity: 0.6 }}
          initial={reduced ? false : { scale: 1.06, opacity: 0 }}
          animate={reduced ? undefined : { scale: 1, opacity: 0.6 }}
          transition={{ duration: 2.2, ease: E }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #050507 0%, #050507bb 20%, transparent 55%)" }} />
      </div>
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE}><Eye dark>Alibaba Cloud · Qwen Character · 2025</Eye></motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["Designing the AI", "That Feels Alive."].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className="font-display font-extralight leading-[1.02] tracking-[-0.04em] text-white"
                    style={{ fontSize: "clamp(2.35rem, 5.2vw + 0.5rem, 4.75rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className={`mt-5 max-w-xl ${BODY} text-[14px] leading-[1.65] text-white/[0.96] md:mt-6 md:text-[15px]`}>
              Led and shipped Interactive Showrooms — the MVP for the Qwen Character LLM. Four hands-on demos that turned static cloud docs into proof an enterprise buyer could feel in minutes.
            </motion.p>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
            <motion.dl variants={UP}
              className="mt-6 grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.12] pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {meta.map(({ k, v }) => (
                <div key={k} className="min-w-0">
                  <dt className={`${EYE} text-white/93`}>{k}</dt>
                  <dd className="mt-1 font-sans text-[12px] leading-snug text-white/[0.96] sm:text-[13px]">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// §01 Overview — the promise + design principle
function SlideOverview() {
  const pillars = [
    { stat: "60+ min → <2 min", label: "Time to first value", detail: "Static docs → first proof moment" },
    { stat: "~2×",              label: "Model API call volume", detail: "vs the 4-week pre-launch baseline" },
    { stat: "4 demos",          label: "Hands-on showrooms",   detail: "One model strength proven per room" },
  ];
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE} className="flex items-center gap-4">
          <img src="/assets/ai-character/alibaba-cloud-logo.png" alt="Alibaba Cloud"
            className="h-6 w-auto max-w-[10rem] object-contain object-left opacity-90" decoding="async" />
          <span className="h-3.5 w-px bg-black/15" />
          <Eye>Overview · Interactive Showrooms</Eye>
        </motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className="font-display font-light leading-[1.08] tracking-[-0.032em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.8rem)" }}>
            A working version of their product — in under two minutes.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[15px] text-[#5A5A5A]`}>
          Interactive Showrooms is the MVP feature for the Qwen Character LLM, serving millions of enterprise customers. Each showroom surfaces one strength of the model alongside a prompt guide and a live code editor — proof, not documentation.
        </motion.p>
        <motion.div variants={UP} className="mt-9 grid gap-px overflow-hidden rounded-2xl bg-black/[0.06] ring-1 ring-black/[0.06] md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div key={p.label} className="bg-white px-6 py-6"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-display font-light tracking-[-0.02em] text-[#0A0A0A]"
                style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)" }}>{p.stat}</p>
              <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]/75">{p.label}</p>
              <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-[#6A6A6A]">{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={UP} className="mt-7 flex items-start gap-3 border-l-2 border-[#C8FF47] pl-4">
          <p className="font-sans text-[13.5px] leading-relaxed text-[#6A6A6A]">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7e9a1f]">Design principle</span>
            <span className="mt-1.5 block text-[#3A3A3A]">AI systems need <em className="not-italic font-medium text-[#0A0A0A]">visible cognition</em>, not just outputs — I design to make model state inspectable.</span>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §02 Problem
function SlideProblem({ reduced }: { reduced: boolean | null }) {
  return (
    <section className="relative flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10 grid w-full max-w-5xl gap-10 md:grid-cols-2" variants={STG} initial="hidden" animate="show">
        <div>
          <motion.div variants={FADE}><Eye dark>The Problem</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-6 font-display font-light leading-[1.08] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.8rem, 3.6vw, 3rem)" }}>
              The first hour was killing trial conversion.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-7 ${BODY} text-[15px] text-white/[0.96]`}>
            The docs explained everything. But feeling the model meant configuring, running samples, and interpreting output alone — a loop that routinely stretched past an hour. Most trial users left before reaching the moment of value.
          </motion.p>
          <motion.p variants={UP} className="mt-6 font-display text-[15px] font-light italic leading-relaxed text-[#C8FF47]/85">
            So I shifted the product from documentation to proof.
          </motion.p>
        </div>
        <motion.div variants={UP} className="space-y-4">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-6 py-6">
            <p className={`${EYE} text-[#C8FF47] mb-3`}>The scenario</p>
            <p className="font-sans text-[14px] leading-[1.74] text-white/[0.94]">
              A user opens the romance app for the third time. The character greets them like a stranger. The model remembered everything — name, last conversation, mood. It had no way to surface any of it.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-6 py-6">
            <p className={`${EYE} text-[#C8FF47] mb-3`}>Enterprise wall</p>
            <p className="font-sans text-[14px] leading-[1.74] text-white/[0.94]">
              Prospects received decks that described capability — descriptive, not convincing. Nothing on the surface compressed time-to-trust or replaced that slow first hour with tangible proof.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §03 How Might We
function SlideHmw() {
  const rows = [
    { finding: "Every competitor felt like another ChatGPT", evidence: "6 apps · 40+ comments" },
    { finding: "Memory & pacing were invisible",             evidence: "Users churned before the difference landed" },
    { finding: "Trust = fast time-to-value",                 evidence: "Trial users dropped in the first hour" },
    { finding: "Enterprise: tell-vs-try wall",               evidence: "Decks describe, they don't convince" },
  ];
  return (
    <section className="flex h-full items-center justify-center bg-[#F7F5F0] px-10 md:px-16 lg:px-20">
      <motion.div
        className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] md:gap-x-16 lg:gap-x-24"
        variants={STG} initial="hidden" animate="show">
        <div className="min-w-0 max-w-xl md:max-w-none">
          <motion.div variants={FADE}><Eye>Research · 6 Apps · 40+ Comments</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-6 font-display font-light leading-[1.1] tracking-[-0.032em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)" }}>
              Users want to feel AI, not read about it.
            </h2>
          </Mask>
          <motion.div variants={UP} className="mt-8 rounded-2xl border-l-2 border-[#C8FF47] bg-white px-6 py-7 ring-1 ring-black/[0.05]">
            <p className={`${EYE} text-[#9A9A9A]`}>How might we</p>
            <p className="mt-4 font-display text-[1.25rem] font-light leading-[1.4] tracking-[-0.018em] text-[#0A0A0A] md:text-[1.4rem]">
              Make model capabilities <em className="not-italic text-[#7e9a1f]">visible</em>, <em className="not-italic text-[#7e9a1f]">testable</em>, and <em className="not-italic text-[#7e9a1f]">trustworthy</em> — within minutes?
            </p>
          </motion.div>
        </div>
        <motion.div variants={UP} className="min-w-0">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.07]">
            <div className="border-b border-black/[0.06] bg-black/[0.02] px-5 py-2.5">
              <p className={`${EYE} text-[#BDBDBD]`}>What the research surfaced</p>
            </div>
            <div className="divide-y divide-black/[0.05]">
              {rows.map((row, i) => (
                <motion.div key={i} className="px-5 py-3.5"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, ease: E, delay: 0.3 + i * 0.08 }}>
                  <p className="font-sans text-[13px] font-medium text-[#222]">{row.finding}</p>
                  <p className="mt-0.5 font-sans text-[11px] text-[#A0A0A0]">{row.evidence}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §04 Decision 01 Title
function SlideD1Title({ reduced }: { reduced: boolean | null }) {
  return (
    <section className="relative flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-4xl">
        <motion.div variants={FADE}><Eye dark>Decision 01</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-6 font-display font-light leading-[1.08] tracking-[-0.032em] text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            I replaced documentation with market-specific showrooms.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-8 max-w-2xl ${BODY} text-[15.5px] text-white/[0.92]`}>
          Instead of improving the docs, I designed 4 market-specific showrooms — companionship, psychotherapy, character cloning, IP licensing — that let evaluators experience a working version of their own future product.
        </motion.p>
        <motion.p variants={UP} className="mt-5 font-display text-[15px] font-light italic leading-relaxed text-[#C8FF47]/85">
          Users don&apos;t believe descriptions — so the first message had to prove the capability.
        </motion.p>
      </motion.div>
    </section>
  );
}

// §05 Decision 01 — Before → After
function SlideD1BeforeAfter() {
  const verticals = ["Companionship", "Psychotherapy", "Character cloning", "IP licensing"];
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-10 md:px-14">
      <motion.div className={LR_DECK} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>Before → After · Documentation to Proof</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light leading-[1.1] tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              One vertical per room — built for the evaluator who already works there.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>
            6 apps, 40+ comments — every competitor felt like another ChatGPT. The answer was market-specific showrooms, each one a working version of a real buyer&apos;s product.
          </motion.p>
          <motion.div variants={UP} className="mt-5 flex flex-wrap gap-2">
            {verticals.map((v) => (
              <span key={v} className="rounded-full bg-white px-3 py-1.5 font-sans text-[11.5px] font-medium text-[#3A3A3A] ring-1 ring-black/[0.07]">
                {v}
              </span>
            ))}
          </motion.div>
        </div>
        <motion.div variants={FADE} className="min-w-0">
          <Vid src="/assets/ai-character/before.mp4"
            caption="Before — static documentation + generic chat" maxH="max-h-[min(64vh,52rem)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §06 Decision 02 Title
function SlideD2Title() {
  const visibilities = [
    { type: "Memory",         detail: "What the system recalls and updates about you, in the flow." },
    { type: "Analysis",       detail: "What the system understood, shown while you keep talking." },
    { type: "Implementation", detail: "The prompts, YAML, and constraints, exposed beside the demo." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Decision 02</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 font-display font-light leading-[1.1] tracking-[-0.03em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.7rem)" }}>
            I designed each room to prove one capability in 60 seconds.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[14.5px] text-[#5A5A5A]`}>
          Three model strengths crammed into one chat window — none landed. So I split them across rooms: one proof moment per room, legible in 60 seconds, no explainer text. My job was to turn invisible model behavior into visible surfaces.
        </motion.p>
        <motion.div variants={UP} className="mt-8 grid gap-4 md:grid-cols-3">
          {visibilities.map((it, i) => (
            <motion.div key={it.type}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: E, delay: 0.26 + i * 0.1 }}
              className="rounded-2xl bg-white px-6 py-6 ring-1 ring-black/[0.06]">
              <p className={`${EYE} text-[#7e9a1f]`}>{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-3 font-display text-[1.05rem] font-light text-[#0A0A0A]">{it.type} visibility</p>
              <p className="mt-2.5 font-sans text-[13px] leading-[1.72] text-[#5A5A5A]">{it.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §07 Decision 02 — capability map (Showroom → proof → in-product)
function SlideD2Map() {
  const rooms = [
    { tab: "Romance",   cap: "Long-term memory",        feel: "Character recalls conversation specifics across sessions", src: "/assets/ai-character/ux-strategy-romance-proof.png",   accent: "#C8FF47" },
    { tab: "Astrology", cap: "Real-time memory updates", feel: "Live constellation profile updates mid-conversation",      src: "/assets/ai-character/ux-strategy-astrology-proof.png", accent: "#7B6CF4" },
    { tab: "Therapy",   cap: "Real-time analysis",       feel: "Expert panel surfaces conversation themes as you chat",    src: "/assets/ai-character/ux-strategy-therapy-proof.png",   accent: "#4ABFBF" },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-white px-10 pb-6 pt-7 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Showroom → One Proof → In-Product Behavior</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            Each room makes one form of cognition legible.
          </h2>
        </Mask>
      </motion.div>
      <div className="mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-3 md:gap-4" style={{ maxHeight: "62vh" }}>
        {rooms.map((r, i) => (
          <motion.article key={r.tab}
            className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.07]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-black/[0.05]">
              <img src={r.src} alt={`${r.tab} proof`} className="h-full w-full object-cover object-left-top" loading="lazy" decoding="async" />
            </div>
            <div className="shrink-0 px-4 py-4">
              <span className="rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{ background: r.accent, color: r.accent === "#7B6CF4" ? "#fff" : "#0A0A0A" }}>{r.tab}</span>
              <p className="mt-2.5 font-display text-[0.98rem] font-light leading-snug text-[#0A0A0A]">{r.cap}</p>
              <p className="mt-2 font-sans text-[11.5px] leading-relaxed text-[#6A6A6A]">{r.feel}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── Feature template: copy left, video right ──────────────────────────────────
function FeatureSlide({
  eye, title, body, badges, videoSrc, caption, dark = false, notShipped = false,
}: {
  eye: string; title: string; body: string;
  badges: { k: string; v: string }[];
  videoSrc: string; caption: string; dark?: boolean; notShipped?: boolean;
}) {
  const bg = dark ? "bg-white" : "bg-[#F7F5F0]";
  return (
    <section className={`flex h-full items-center px-10 md:px-14 ${bg}`}>
      <motion.div className={LR_DECK} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE} className="flex items-center gap-2.5">
            <Eye>{eye}</Eye>
            {notShipped && (
              <span className="rounded-full border border-black/[0.1] bg-black/[0.03] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#9A9A9A]">
                Not shipped
              </span>
            )}
          </motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              {title}
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>{body}</motion.p>
          <motion.div variants={UP} className="mt-5 space-y-3">
            {badges.map((b, i) => (
              <div key={b.k} className={`border-l-2 pl-3 ${i === 0 ? "border-[#C8FF47]" : "border-black/[0.1]"}`}>
                <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">{b.k}</p>
                <p className="mt-1 font-sans text-[13px] text-[#5A5A5A]">{b.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={FADE} className="min-w-0">
          <Vid src={videoSrc} caption={caption} maxH="max-h-[min(72vh,64rem)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Feature template: model-workflow diagram full-bleed ───────────────────────
function LogicSlide({ eye, title, src, alt }: { eye: string; title: string; src: string; alt: string }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-white px-10 py-3 md:px-14 md:py-4">
      <motion.div variants={STG} initial="hidden" animate="show" className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.75rem)" }}>
              {title}
            </h2>
          </Mask>
        </div>
        <motion.div variants={FADE} className="mt-2 flex min-h-0 flex-1 basis-0 flex-col md:mt-3">
          <WorkflowImg src={src} alt={alt} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §08 Heartbeat
function SlideHeartbeat() {
  return (
    <FeatureSlide
      eye="Romance · 1 of 4 · Heartbeat Power"
      title="The inner-monologue reveal."
      body="A tap-to-reveal flip card surfaces the character's inner monologue — emotional privilege, without breaking the surface illusion."
      badges={[
        { k: "Model capability", v: "Real-time generation + character depth modeling" },
        { k: "Design tension",   v: "Too much exposure breaks the mystery; too little loses depth. The flip card holds both." },
      ]}
      videoSrc="/assets/ai-character/interactions/heartbeat/heartbeat-1.mp4"
      caption="Heartbeat — inner-monologue reveal on tap"
    />
  );
}
function SlideHeartbeatLogic() {
  return <LogicSlide eye="Heartbeat Power · Model Workflow" title="Real-time generation + character depth modeling"
    src="/assets/ai-character/interaction/heartbeat_power_workflow.svg" alt="Heartbeat Power — LLM workflow diagram" />;
}

// §10 Story Unlock
function SlideStoryUnlock() {
  return (
    <FeatureSlide
      eye="Romance · 2 of 4 · Story Unlock"
      title="Backstory revealed through depth."
      body="Backstory milestones unlock through conversation depth — one knowledge base revealing progressively across two interaction layers."
      badges={[
        { k: "Model capability", v: "Progressive memory building" },
        { k: "Effect",           v: "Conversation depth becomes intrinsically rewarding — users stay longer to unlock more." },
      ]}
      videoSrc="/assets/ai-character/interactions/story%20unlocked/story%20unlocked-1.mp4"
      caption="Story unlock — milestone progression in conversation"
    />
  );
}
function SlideStoryUnlockLogic() {
  return <LogicSlide eye="Story Unlock · Model Workflow" title="Progressive context building"
    src="/assets/ai-character/interaction/story_unlock_workflow.svg" alt="Story Unlock — LLM workflow diagram" />;
}

// §12 Moments Feed
function SlideMoments() {
  return (
    <FeatureSlide
      eye="Romance · 3 of 4 · Moments Feed"
      title="The character lives between conversations."
      body="Instagram-style posts generated from interaction history sustain off-session presence — the character keeps existing between conversations."
      badges={[
        { k: "Model capability", v: "Generation from memory history" },
        { k: "Business impact",  v: "Reduces cold-start on re-entry — presence is maintained outside of sessions." },
      ]}
      videoSrc="/assets/ai-character/interactions/moments/moments-1.mp4"
      caption="Moments — posts generated from memory history"
    />
  );
}
function SlideMomentsLogic() {
  return <LogicSlide eye="Moments Feed · Model Workflow" title="Memory to generated content"
    src="/assets/ai-character/interaction/moments_feed_workflow.svg" alt="Moments Feed — LLM workflow diagram" />;
}

// §14 Alternate Universe (not shipped)
function SlideAltUniv() {
  return (
    <FeatureSlide
      eye="Romance · 4 of 4 · Alternate Universe"
      title="A scene only your history could trigger."
      body="Scenes triggered by personal history recontextualize the relationship — variable rewards drawn from real shared context."
      notShipped
      badges={[
        { k: "Model capability", v: "Long-term memory + generative storytelling" },
        { k: "Why not shipped",  v: "Real-time generation requirements were too high for the timeline — designed and prototyped, not shipped." },
      ]}
      videoSrc="/assets/ai-character/interactions/alternative%20universe/alternative%20universe-1.mp4"
      caption="Alternate universe — memory-driven scene shift"
    />
  );
}
function SlideAltUnivLogic() {
  return <LogicSlide eye="Alternate Universe · Model Workflow" title="From shared history to branching narrative"
    src="/assets/ai-character/interaction/alternate_universe_events_workflow.svg" alt="Alternate Universe Events — LLM workflow diagram" />;
}

// §16 Astro Profile
function SlideAstroProfile() {
  return (
    <FeatureSlide
      eye="Astrology · Real-Time Memory Updates"
      title="Every word updates what it knows about you."
      body="A personal constellation file updates during conversation — memory becomes transparent and inspectable. Users watch the model assembling them in real time."
      badges={[
        { k: "Model capability", v: "Real-time memory updates" },
        { k: "Design focus",     v: "One persistent surface that mirrors live memory writes — readable at a glance, no secondary panels." },
      ]}
      videoSrc="/assets/ai-character/interactions/other%20showrooms/astro%20profile/astro%20profile-1.mp4"
      caption="Astrology — constellation profile and live memory file"
    />
  );
}

// §17 Therapy Analysis
function SlideTherapyAnalysis() {
  return (
    <section className="flex h-full items-center bg-white px-10 md:px-14">
      <motion.div className={LR_DECK} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>Therapy · Real-Time Analysis</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              You see what it understood, not just what it said.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>
            A live analysis rail surfaces the conversation themes the model parsed — visible reasoning alongside the conversation, not just a visible reply.
          </motion.p>
          <motion.div variants={UP} className="mt-5 border-l-2 border-[#4ABFBF] pl-3">
            <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">Design focus</p>
            <p className="mt-1 font-sans text-[13px] text-[#5A5A5A]">Parallel transcript + analysis rail so legibility stays high — no static screenshots required.</p>
          </motion.div>
          <motion.div variants={UP} className="mt-4 rounded-lg border border-black/[0.08] bg-[#F7F5F0] px-3.5 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9A9A9A]">Emotional boundary</p>
            <p className="mt-1.5 font-sans text-[11.5px] leading-snug text-[#6A6A6A]">The therapy room is an analysis-visibility demo. The rail surfaces themes the model parsed — no clinical claims are implied.</p>
          </motion.div>
        </div>
        <motion.div variants={FADE} className="min-w-0">
          <Vid src="/assets/ai-character/interactions/other%20showrooms/therapy%20analysis/therapy%20analysis-1.mp4"
            caption="Therapy — analysis rail alongside the conversation" maxH="max-h-[min(72vh,64rem)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §18 Decision 03 Title
function SlideD3Title({ reduced }: { reduced: boolean | null }) {
  return (
    <section className="relative flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-4xl">
        <motion.div variants={FADE}><Eye dark>Decision 03</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-6 font-display font-light leading-[1.08] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.9rem)" }}>
            I made demos emotional for users and inspectable for builders.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-7 max-w-2xl ${BODY} text-[15px] text-white/[0.92]`}>
          Inspiration and Continue Response guide users to the wow moment. A slide-out drawer keeps YAML and prompts right next to the live demo.
        </motion.p>
        <motion.p variants={UP} className="mt-5 font-display text-[16px] font-light italic leading-relaxed text-[#C8FF47]/85">
          The question shifts from &ldquo;can your model do this&rdquo; to &ldquo;how fast can we ship.&rdquo;
        </motion.p>
      </motion.div>
    </section>
  );
}

// §19 Inspire / Continue
function SlideInspireContinue({ reduced }: { reduced: boolean | null }) {
  return (
    <section className="relative flex h-full items-center overflow-hidden bg-[#050507] px-10 md:px-14">
      <LivingAura reduced={reduced} />
      <motion.div className={`relative z-10 ${LR_DECK}`} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye dark>Two nudges toward the wow moment</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light leading-[1.1] tracking-[-0.028em] text-white"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Making the model legible before users know to look.
            </h2>
          </Mask>
          <motion.div variants={UP} className="mt-7 space-y-4">
            {[
              { t: "Inspiration Response", b: "Three reply options — action, emotion, expression — guide without breaking flow. Feels like gameplay, not messaging." },
              { t: "Continue Response",    b: "One tap extends the story from context — long-context reasoning, no effort required." },
            ].map((f) => (
              <div key={f.t} className="border-l-2 border-[#C8FF47] pl-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white/[0.94]">{f.t}</p>
                <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-white/[0.94]">{f.b}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={FADE} className="min-w-0">
          <DarkVid src="/assets/ai-character/conversation engine.mp4"
            caption="Tap a reply option, or continue the story" maxH="max-h-[min(72vh,64rem)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §20 Code drawer
function SlideCodeDrawer() {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-10 md:px-14">
      <motion.div className={LR_DECK} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>Code Drawer, Not Console</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              YAML, prompts, and constraints slide open beside the live demo.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>
            Evaluators inspect the implementation in place — no context switch — then clone the template as a reusable starting point for their own product. The room ships as code.
          </motion.p>
          <motion.div variants={UP} className="mt-5 space-y-2.5">
            <div className="rounded-xl bg-[#E8E8E8] px-4 py-3.5">
              <span className={`${EYE} text-[#999]`}>Rejected</span>
              <p className="mt-1.5 font-sans text-[12px] text-[#6A6A6A]">× Separate developer console — breaks demo flow, requires a tab switch.</p>
            </div>
            <div className="rounded-xl bg-white px-4 py-3.5 ring-1 ring-[#C8FF47]/60">
              <span className={`${EYE} text-[#7e9a1f]`}>Chosen ✓</span>
              <p className="mt-1.5 font-sans text-[12px] text-[#0A0A0A]">Slide-out drawer beside the live demo — one coherent demo-to-review flow.</p>
            </div>
          </motion.div>
        </div>
        <motion.div variants={FADE} className="min-w-0">
          <Vid src="/assets/ai-character/code/code%20tool.mp4"
            caption="Code drawer — spec and prompt context alongside the demo" maxH="max-h-[min(72vh,64rem)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §21 How I Worked — 4-stage AI matrix
const WORK_STAGES = [
  { n: "01", phase: "Research",                bg: "#EEEDFE", num: "#534AB7", name: "#3C3489", tools: "Notion · Memo · ChatGPT · Claude", body: "Synthesized scattered research — 6 apps, 40+ comments — into strategy patterns in one session." },
  { n: "02", phase: "UX Strategy",             bg: "#E1F5EE", num: "#0F6E56", name: "#085041", tools: "Qwen · ChatGPT · Figma",           body: "Stress-tested competing design decisions as structured arguments. Resolved debates before stakeholder meetings." },
  { n: "03", phase: "Visual Identity & UI",    bg: "#FAECE7", num: "#993C1D", name: "#712B13", tools: "Figma · MasterGo · Dreamnia · Wan · Kling", body: "Generated character art, scene backgrounds, and motion loops — work that would have needed a 3D production team." },
  { n: "04", phase: "Motion & Production Code", bg: "#FAEEDA", num: "#854F0B", name: "#633806", tools: "CodePen · Cursor · Claude Code",   body: "Shipped motion, state logic, and live interaction designs — without a dedicated frontend engineer." },
] as const;

function SlideHowIWorked() {
  return (
    <section className="flex h-full flex-col justify-center bg-white px-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>How I Worked</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-4 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            AI changed how I shipped — not just how I made assets.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-4 max-w-3xl ${BODY} text-[14px] text-[#5A5A5A]`}>
          AI compressed the distance between strategy, visual direction, motion, and implementation — letting one designer deliver production-adjacent interfaces engineers could merge with minimal revision.
        </motion.p>
        <motion.div variants={UP} className="mt-8 grid gap-3 md:grid-cols-4">
          {WORK_STAGES.map((s, i) => (
            <motion.div key={s.n} className="flex flex-col overflow-hidden rounded-xl ring-1 ring-black/[0.06]"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.22 + i * 0.1 }}>
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: s.bg }}>
                <span className="font-mono text-[11px]" style={{ color: s.num }}>{s.n}</span>
                <span className="text-[13px] font-medium leading-tight" style={{ color: s.name }}>{s.phase}</span>
              </div>
              <div className="flex flex-1 flex-col bg-white px-4 py-4">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#A0A0A0]">Tools</p>
                <p className="mt-1.5 font-sans text-[12px] leading-snug text-[#0A0A0A]">{s.tools}</p>
                <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#A0A0A0]">Output</p>
                <p className="mt-1.5 font-sans text-[12px] leading-[1.6] text-[#5A5A5A]">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §22 AI Tools — process glimpse
function SlideAITools() {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-10 md:px-14">
      <motion.div className={LR_DECK} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>A Glimpse Into the Process</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Four weeks.<br />Research to production.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>
            Inspired by <em>Love and Deepspace</em>. Visual identity built with Wan, Kling, Dreamnia, and SeeDance. Interactions built with Cursor and Claude Code.
          </motion.p>
          <motion.div variants={UP} className="mt-5 border-l-2 border-[#C8FF47] pl-3">
            <p className="font-sans text-[12px] italic leading-relaxed text-[#7A7A7A]">
              The 3D avatar crashed mid-interaction → replaced with an AI-looping video. Small motions — a blink, a nod — felt more alive than complex rigged animation.
            </p>
          </motion.div>
        </div>
        <motion.div variants={UP} className="grid min-w-0 grid-cols-2 gap-3">
          {[
            { src: "/assets/ai-character/design.jpg",             label: "Character direction exploration" },
            { src: "/assets/ai-character/uivisual.jpg",           label: "UI visual system" },
            { src: "/assets/ai-character/characterdirection.jpg", label: "Character directions" },
            { src: "/assets/ai-character/innovation.jpg",         label: "Scene, music & motion concept" },
          ].map(({ src, label }, i) => (
            <motion.div key={src} className="group aspect-video overflow-hidden rounded-xl ring-1 ring-black/[0.07]"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: E, delay: 0.3 + i * 0.08 }}>
              <img src={src} alt={label} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §23 Showrooms 2×2
function SlideShowrooms({ reduced }: { reduced: boolean | null }) {
  const rooms = [
    { label: "Romance",   cap: "Long-term memory",         src: "/assets/ai-character/new-cover.mp4",   color: "#C8FF47", fg: "#0A0A0A" },
    { label: "Astrology", cap: "Real-time memory updates", src: "/assets/ai-character/taobaibai-1.mp4", color: "#7B6CF4", fg: "#fff"    },
    { label: "Therapy",   cap: "Real-time analysis",       src: "/assets/ai-character/therapy-1.mp4",   color: "#4ABFBF", fg: "#0A0A0A" },
    { label: "Character", cap: "Multi-agent coordination", src: "/assets/ai-character/pre-1.mp4",       color: "#FF9B6A", fg: "#0A0A0A" },
  ];
  return (
    <section className="relative flex h-full flex-col overflow-hidden bg-[#050507] px-8 pb-6 pt-8 md:px-12">
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye dark>Product Showcase · 4 Showrooms · 1 Template</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-white"
            style={{ fontSize: "clamp(1.3rem, 2.8vw, 2.1rem)" }}>
            Each room turns one model capability into a guided workflow.
          </h2>
        </Mask>
      </motion.div>
      <div className="relative z-10 mt-5 grid min-h-0 flex-1 grid-cols-2 gap-3" style={{ maxHeight: "72vh" }}>
        {rooms.map((r, i) => (
          <motion.div key={r.label} className="relative overflow-hidden rounded-2xl bg-[#0A0A0A]"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.18 + i * 0.1 }}>
            <video className="h-full w-full object-contain" playsInline muted autoPlay loop preload="none">
              <source src={r.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="rounded-md px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{ background: r.color, color: r.fg }}>{r.label}</span>
              <p className="mt-1.5 font-sans text-[11px] text-white/[0.96]">{r.cap}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// §24–26 Live Prototypes
const LIVE_PROTOTYPE_PAGES = {
  "prototype-romance": { i: 1, title: "Romance",   src: "/work/ai-character/prototype?muted=1",        caption: "Long-term memory and emotional pacing in one flow" },
  "prototype-astro":   { i: 2, title: "Astrology", src: "/work/ai-character/prototype-astro?embed=1",  caption: "Live constellation-file updates while chatting" },
  "prototype-therapy": { i: 3, title: "Therapy",   src: "/work/ai-character/prototype-psych?embed=1",  caption: "Visible analysis layer beside the conversation" },
} as const;
type LivePrototypeSlideId = keyof typeof LIVE_PROTOTYPE_PAGES;

function SlideLivePrototype({ id }: { id: LivePrototypeSlideId }) {
  const p = LIVE_PROTOTYPE_PAGES[id];
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-black/[0.06] px-6 py-2.5 md:px-10 md:py-3">
        <Eye>Live Prototype · {p.i} of 3 · {p.title}</Eye>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-[#F7F5F0] p-2 md:p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-black/[0.07]">
          <iframe src={p.src} title={`${p.title} prototype`} className="min-h-0 w-full flex-1 border-0" loading="lazy" />
        </div>
      </div>
      <div className="shrink-0 border-t border-black/[0.05] px-6 py-2 md:px-10">
        <p className="font-sans text-[10px] leading-relaxed text-[#6A6A6A] md:text-[11px]">
          <span className="font-medium text-[#0A0A0A]/80">{p.title}</span>{" — "}{p.caption}
        </p>
        <p className={`mt-1.5 ${EYE} text-[#B0B0B0]`}>
          Click inside to interact · click outside the deck to resume keyboard navigation
        </p>
      </div>
    </section>
  );
}

// §27 Additional Contribution — SaaS console refresh
function SlideBackend() {
  return (
    <section className="flex h-full flex-col justify-center bg-white px-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>Additional Contribution · B2B Console</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className="mt-4 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Full refresh of the Qwen Character SaaS console.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-3 max-w-3xl ${BODY} text-[13.5px] text-[#5A5A5A]`}>
            An end-to-end update spanning API surfaces, Studio — Applications, Workflows, Knowledge Base, Characters — and the nested flows beneath: empty and error states, plus analytics views for invocation metrics and call volume.
          </motion.p>
        </div>
        <motion.div variants={UP} className="mt-6 grid grid-cols-3 gap-3">
          {[
            { src: "/assets/ai-character/updateddesign1.jpg", label: "Studio surfaces",     tag: "Studio" },
            { src: "/assets/ai-character/updateddesign2.jpg", label: "Nested flows",        tag: "Flows" },
            { src: "/assets/ai-character/updatedesign3.jpg",  label: "Knowledge Base",      tag: "KB" },
          ].map(({ src, label, tag }, i) => (
            <motion.div key={src} className="group overflow-hidden rounded-xl ring-1 ring-black/[0.07]"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.3 + i * 0.09 }}>
              <div className="relative overflow-hidden bg-black/[0.02]">
                <img src={src} alt={label} loading="lazy"
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <div className="flex items-center gap-2 border-t border-black/[0.06] bg-[#F7F5F0] px-3 py-2">
                <span className="rounded bg-[#0A0A0A] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#C8FF47]">{tag}</span>
                <span className="font-sans text-[11px] text-[#5A5A5A]">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §28 Spark Design — adoption
function SlideSparkDesign() {
  return (
    <section className="flex h-full flex-col justify-center bg-white px-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Adoption · Spark Design</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            The showroom system became the published B2B design framework.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-4 max-w-2xl ${BODY} text-[14px] text-[#5A5A5A]`}>
          Components, interactions, and motion patterns built for the showrooms became the Spark Design templates used by external Agentscope partners — these decisions outlived the showroom releases.
        </motion.p>
        <motion.div variants={UP} className="mt-6 overflow-hidden rounded-2xl bg-[#F7F5F0] ring-1 ring-black/[0.06]">
          <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-white px-4 py-3 md:px-5">
            <div>
              <p className={`${EYE} text-[#9A9A9A]`}>Adoption</p>
              <p className="mt-1.5 font-sans text-[12.5px] font-medium text-[#0A0A0A]">Spark Design templates — Agentscope</p>
            </div>
            <a href="https://sparkdesign.agentscope.io/#/templates" target="_blank" rel="noopener noreferrer"
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6A6A6A] underline decoration-black/[0.12] underline-offset-[5px] transition-colors hover:text-[#0A0A0A]">
              Open ↗
            </a>
          </div>
          <iframe title="Spark Design templates" src="https://sparkdesign.agentscope.io/#/templates" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[min(56vh,540px)] min-h-[320px] w-full border-0 bg-white" />
          <p className="border-t border-black/[0.05] bg-white px-4 py-2 font-sans text-[10.5px] leading-relaxed text-[#9A9A9A] md:px-5">
            If the frame is empty, the host blocks embedding — open in browser.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §29 Metrics — staged AI-style reveal
function DataStreamBg() {
  const lines = [
    { top: "8%",  width: "32%", dur: 5.4, delay: 0.0, opacity: 0.18 },
    { top: "19%", width: "26%", dur: 6.2, delay: 1.1, opacity: 0.14 },
    { top: "33%", width: "38%", dur: 4.8, delay: 0.4, opacity: 0.22 },
    { top: "47%", width: "22%", dur: 7.0, delay: 2.0, opacity: 0.10 },
    { top: "61%", width: "30%", dur: 5.6, delay: 0.8, opacity: 0.18 },
    { top: "74%", width: "28%", dur: 6.4, delay: 1.6, opacity: 0.12 },
    { top: "88%", width: "34%", dur: 5.0, delay: 0.2, opacity: 0.16 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {lines.map((l, i) => (
        <motion.div key={i} className="absolute h-px"
          style={{ top: l.top, width: l.width, left: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(200,255,71,${l.opacity}) 50%, transparent 100%)` }}
          initial={{ x: "-30%" }} animate={{ x: "360%" }}
          transition={{ duration: l.dur, repeat: Infinity, delay: l.delay, ease: "linear" }} />
      ))}
    </div>
  );
}

function TimeBar({
  label, value, pct, delay, highlight,
}: { label: string; value: string; pct: number; delay: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.75, ease: E, delay }} className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`${EYE} ${highlight ? "text-[#C8FF47]" : "text-white/60"}`}>{label}</p>
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: E, delay: delay + 0.7 }}
          className="font-display font-light tabular-nums tracking-tight"
          style={{ fontSize: "clamp(1.2rem, 2.1vw, 1.7rem)",
            color: highlight ? "#C8FF47" : "rgba(255,255,255,0.55)",
            textShadow: highlight ? "0 0 18px rgba(200,255,71,0.22)" : "none" }}>
          {value}
        </motion.span>
      </div>
      <div className="relative mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: "0%" }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1.05, ease: E, delay: delay + 0.15 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: highlight
              ? "linear-gradient(90deg, #C8FF47 0%, #d8ff6a 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.34) 100%)",
            boxShadow: highlight ? "0 0 14px rgba(200,255,71,0.35)" : "none" }} />
        <motion.div className="pointer-events-none absolute inset-y-0 w-12 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)" }}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: ["-100%", `${pct * 4}%`], opacity: [0, 1, 0] }}
          transition={{ duration: 1.05, ease: E, delay: delay + 0.15, times: [0, 0.6, 1] }} />
      </div>
    </motion.div>
  );
}

function SlideMetrics() {
  const stats = [
    { to: 4,   suffix: "",  prefix: "",  label: "Showrooms shipped",       detail: "Romance · astrology · therapy · character" },
    { to: 100, suffix: "%", prefix: "+", label: "Model API call volume",    detail: "~2× the 4-week pre-launch baseline" },
    { to: 87,  suffix: "%", prefix: "",  label: "Fewer clone-to-try steps", detail: "Spec + configure chain → template entry" },
    { to: 60,  suffix: "%", prefix: "",  label: "Faster delivery",          detail: "Engineering estimate · spec + code handoff" },
  ];
  const T_TITLE = 0.0, T_SUB = 0.3, T_CHART = 0.6, T_STATS = 0.9, T_OUTRO = 1.4;
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <DataStreamBg />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye dark>Impact · Shipped · Converted · Adopted</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className="mt-4 font-display font-light tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)" }}>
            What shipped. What changed.
          </h2>
        </Mask>
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: E, delay: T_CHART }}
          className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-baseline justify-between gap-6">
            <p className={`${EYE} text-white/55`}>Time to first value</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C8FF47]/85">~30× faster</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-x-10">
            <TimeBar label="Before · Documentation onboarding" value="60+ min" pct={100} delay={T_CHART + 0.2} />
            <TimeBar label="After · Interactive showroom"      value="<2 min"  pct={6}   delay={T_CHART + 0.45} highlight />
          </div>
        </motion.div>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-4">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.12;
            const isKey = s.label === "Model API call volume";
            return (
              <motion.div key={s.label} className="relative bg-[#050507] px-6 py-6"
                initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <motion.div className="mb-3 h-[1.5px] bg-[#C8FF47]/65"
                  initial={{ width: 0 }} animate={{ width: "1.5rem" }}
                  transition={{ duration: 0.55, ease: E, delay: cardDelay + 0.15 }} />
                <p className="relative font-display font-light leading-none text-[#C8FF47]"
                  style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.9rem)" }}>
                  <motion.span
                    animate={isKey
                      ? { textShadow: ["0 0 0px rgba(200,255,71,0)", "0 0 26px rgba(200,255,71,0.55)", "0 0 10px rgba(200,255,71,0.22)"] }
                      : { textShadow: ["0 0 0px rgba(200,255,71,0)", "0 0 14px rgba(200,255,71,0.3)",  "0 0 0px rgba(200,255,71,0)"] }}
                    transition={{ duration: 2.2, ease: "easeOut", delay: cardDelay + 0.55, times: [0, 0.55, 1],
                      repeat: isKey ? Infinity : 0, repeatDelay: isKey ? 2.4 : 0 }}>
                    <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} startDelay={cardDelay * 1000 + 350} duration={1100} />
                  </motion.span>
                </p>
                <p className="mt-3 font-sans text-[12px] font-medium text-white/[0.94]">{s.label}</p>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-white/[0.7]">{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: E, delay: T_OUTRO }}
          className={`mt-6 max-w-xl ${BODY} text-[13.5px] text-white/[0.78]`}>
          The showroom pattern was adopted into Spark Design templates — a reusable foundation across enterprise verticals.
        </motion.p>
      </div>
    </section>
  );
}

// §30 Metrics Method
function SlideMetricsMethod() {
  const rows = [
    { metric: "+100% / ~2×", label: "Model API call volume",
      baseline: "Four-week rolling avg of internal product analytics before showroom launch.",
      result: "Four-week rolling avg after go-live, same pipeline and org scope.",
      note: "Shorthand for +100% lift / ~2× total. Pre vs post on one pipeline, not a third-party benchmark." },
    { metric: "87%", label: "Setup reduction",
      baseline: "~7 enumerated steps in the internal clone-to-try checklist — repo review through endpoint wiring.",
      result: "Pre-seeded template + copy-ready YAML — setup collapses to a short checklist.",
      note: "Counts setup actions, not taps inside the live demo." },
    { metric: "60%", label: "Faster delivery",
      baseline: "Spec-only handoff to engineers.",
      result: "Spec + code delivered together.",
      note: "Verbal engineering estimate across 3 showroom releases. Not from a cycle-time dashboard." },
  ];
  return (
    <section className="flex h-full flex-col justify-center overflow-hidden bg-[#050507] px-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye dark>How the numbers are defined</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-display font-light tracking-[-0.028em] text-white"
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            Honest about the baselines.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-7 overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03]">
          <div className="hidden border-b border-white/[0.08] bg-white/[0.04] px-6 py-2.5 md:grid md:grid-cols-[10rem_1fr_1fr_1fr] md:gap-x-6">
            {["Metric", "Baseline", "Result", "Note"].map(h => (
              <p key={h} className={`${EYE} text-white/[0.55]`}>{h}</p>
            ))}
          </div>
          <div className="divide-y divide-white/[0.06]">
            {rows.map((row, i) => (
              <motion.div key={row.metric}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: E, delay: 0.24 + i * 0.08 }}
                className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-[10rem_1fr_1fr_1fr] md:items-start md:gap-x-6">
                <div>
                  <p className="font-display text-[1.5rem] font-light tracking-tight text-[#C8FF47]">{row.metric}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.55]">{row.label}</p>
                </div>
                <p className="font-sans text-[12.5px] leading-snug text-white/[0.78]">{row.baseline}</p>
                <p className="font-sans text-[12.5px] leading-snug text-white/[0.92]">{row.result}</p>
                <p className="font-sans text-[12px] italic leading-snug text-white/[0.6]">{row.note}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §31 Principles
function SlidePrinciples() {
  const principles = [
    { n: "01", t: "Design is the translation layer.",
      body: "In AI products, the hardest problem isn’t the model — it’s helping people imagine what to build." },
    { n: "02", t: "The best demo is future-self proof.",
      body: "Show a working version of their product, then let them clone it." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-white px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Takeaway · Principles</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            AI products don&apos;t sell themselves through capability lists.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
          {principles.map((p, i) => (
            <motion.div key={p.n}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: E, delay: 0.24 + i * 0.12 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-[#F7F5F0] px-7 py-8 ring-1 ring-black/[0.06] md:px-8 md:py-9">
              <p className={`${EYE} text-[#9A9A9A]`}>Principle {p.n}</p>
              <p className="mt-4 font-display text-[1.2rem] font-light leading-[1.25] tracking-[-0.02em] text-[#0A0A0A] md:text-[1.32rem]">{p.t}</p>
              <p className="mt-4 font-sans text-[14.5px] leading-[1.72] text-[#5A5A5A]">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §32 Takeaways — what I learned
function SlideTakeaways() {
  const items = [
    { label: "Memory transparency",      note: "The constellation file makes memory readable — not a silent black box." },
    { label: "Analysis visibility",      note: "The therapy rail shows what the model understood — not just what it said." },
    { label: "Developer inspectability", note: "YAML + prompt exposed in the code drawer — inspect before you build." },
    { label: "Emotional boundary",       note: "The therapy room is an analysis demo — no clinical claims implied." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>What I learned</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            Visible cognition over capability lists.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
          {items.map((it, i) => (
            <motion.div key={it.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="rounded-xl bg-white px-5 py-5 ring-1 ring-black/[0.06]">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#9A9A9A]">{it.label}</p>
              <p className="mt-2 font-sans text-[13.5px] leading-[1.65] text-[#5A5A5A]">{it.note}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §33 Closing
function SlideClosing() {
  return (
    <section className="flex h-full flex-col items-start justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-2xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12 bg-[#0A0A0A]" />
        <Mask delay={0.08}>
          <h2 className="font-display font-light tracking-[-0.04em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Yuan Fang
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-3 ${EYE} text-[#9A9A9A]`}>
          Product Designer · Pratt Institute
        </motion.p>
        <motion.p variants={UP} className={`mt-8 max-w-md ${BODY} text-[15px] text-[#5A5A5A]`}>
          Design is the translation layer. The hardest problem in AI products isn&apos;t model quality — it&apos;s helping customers imagine what they can build. The strongest demo is future-self proof.
        </motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-wrap items-center gap-5">
          <a href="https://tongyi.aliyun.com/character" target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#0A0A0A] px-7 py-3.5 font-sans text-[13px] font-medium text-white transition-all duration-500 hover:bg-[#C8FF47] hover:text-[#0A0A0A]">
            View live showrooms
            <span className="transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/ai-character"
            className={`${EYE} text-[#9A9A9A] underline underline-offset-4 decoration-black/[0.1] transition-colors hover:text-[#0A0A0A]`}>
            Case study
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Slide renderer ───────────────────────────────────────────────────────────
function SlideRenderer({ id, reduced }: { id: SlideId; reduced: boolean | null }) {
  switch (id) {
    case "cover":             return <SlideCover reduced={reduced} />;
    case "overview":          return <SlideOverview />;
    case "problem":           return <SlideProblem reduced={reduced} />;
    case "hmw":               return <SlideHmw />;
    case "d1-title":          return <SlideD1Title reduced={reduced} />;
    case "d1-before-after":   return <SlideD1BeforeAfter />;
    case "d2-title":          return <SlideD2Title />;
    case "d2-map":            return <SlideD2Map />;
    case "heartbeat":         return <SlideHeartbeat />;
    case "heartbeat-logic":   return <SlideHeartbeatLogic />;
    case "storyunlock":       return <SlideStoryUnlock />;
    case "storyunlock-logic": return <SlideStoryUnlockLogic />;
    case "moments":           return <SlideMoments />;
    case "moments-logic":     return <SlideMomentsLogic />;
    case "altuniv":           return <SlideAltUniv />;
    case "altuniv-logic":     return <SlideAltUnivLogic />;
    case "astro-profile":     return <SlideAstroProfile />;
    case "therapy-analysis":  return <SlideTherapyAnalysis />;
    case "d3-title":          return <SlideD3Title reduced={reduced} />;
    case "inspire-continue":  return <SlideInspireContinue reduced={reduced} />;
    case "code-drawer":       return <SlideCodeDrawer />;
    case "how-i-worked":      return <SlideHowIWorked />;
    case "ai-tools":          return <SlideAITools />;
    case "showrooms":         return <SlideShowrooms reduced={reduced} />;
    case "prototype-romance": return <SlideLivePrototype id="prototype-romance" />;
    case "prototype-astro":   return <SlideLivePrototype id="prototype-astro" />;
    case "prototype-therapy": return <SlideLivePrototype id="prototype-therapy" />;
    case "backend":           return <SlideBackend />;
    case "spark-design":      return <SlideSparkDesign />;
    case "metrics":           return <SlideMetrics />;
    case "metrics-method":    return <SlideMetricsMethod />;
    case "principles":        return <SlidePrinciples />;
    case "takeaways":         return <SlideTakeaways />;
    case "closing":           return <SlideClosing />;
    default:                  return null;
  }
}

// ─── Chapter pill nav ─────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function DeckSlideScrubber({
  idx, total, dark, onChange,
}: { idx: number; total: number; dark: boolean; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  const track = dark ? "bg-white/20" : "bg-black/[0.1]";
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className={`pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full ${track}`} aria-hidden>
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#C8FF47]" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" min={0} max={max} step={1} value={idx}
        aria-label="Slide position" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ChapterPills({ current, dark, onJump }: { current: string; dark: boolean; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-500 ease-out ${
              on
                ? "bg-[#C8FF47] px-3 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-[#0A0A0A]"
                : `h-1.5 w-1.5 ${dark ? "bg-white/48 hover:bg-white/78" : "bg-black/18 hover:bg-black/40"}`
            }`}
            aria-label={`Go to chapter: ${ch}`}>
            {on ? ch : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Directional slide transition ─────────────────────────────────────────────
const slideVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56 }),
};

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClient() {
  const reduced = useReducedMotion();
  // Track index + travel direction together so AnimatePresence can push slides.
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const total    = SLIDES.length;
  const slide    = SLIDES[idx];
  const dark     = slide.dark;
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;
  const minsLeft = Math.max(1, Math.ceil(((total - 1 - idx) * 50) / 60));

  const paginate = useCallback((step: number) => {
    setState(([i]) => {
      const n = Math.min(total - 1, Math.max(0, i + step));
      return [n, n === i ? 0 : n > i ? 1 : -1];
    });
  }, [total]);

  const jump = useCallback((target: number) => {
    setState(([i]) => {
      const n = Math.min(total - 1, Math.max(0, target));
      return [n, n === i ? 0 : n > i ? 1 : -1];
    });
  }, [total]);

  const prev = useCallback(() => paginate(-1), [paginate]);
  const next = useCallback(() => paginate(1),  [paginate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft",  "PageUp"].includes(e.key))        { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  // ── Dark-aware chrome tokens ──
  const headerBg  = dark ? "bg-[#050507]/96 border-white/[0.14]"  : "bg-white/75 border-black/[0.06]";
  const footerBg  = dark ? "bg-[#050507]/96 border-white/[0.14]"  : "bg-white/75 border-black/[0.05]";
  const navChromeDark = "text-white/92";
  const navLink   = dark ? `${navChromeDark} hover:text-white` : "text-[#6B6B6B] hover:text-[#0A0A0A]";
  const navMeta   = dark ? navChromeDark                       : "text-[#BDBDBD]";
  const navBtn    = dark ? `${navChromeDark} hover:text-white` : "text-[#6B6B6B] hover:text-[#0A0A0A]";

  return (
    <div className="relative h-screen select-none overflow-hidden">

      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full bg-[#C8FF47]"
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className={`absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-all duration-500 md:px-10 ${headerBg}`}>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character"
            className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${navLink}`}>
            ← Case Study
          </Link>
          <span className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] md:inline ${navMeta}`}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className={`hidden font-mono text-[10px] md:inline ${navMeta}`}>~{minsLeft} min left</span>
          <span className={`font-mono text-[10px] tabular-nums ${navMeta}`}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide area — overlapping directional transition. Each slide is
          absolutely positioned to fill the gap between the 14-high header and
          footer, so successive slides can cross-fade/push without layout shift. */}
      <main className="relative h-full min-h-0 overflow-hidden">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div key={slide.id} custom={dir}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : "enter"}
            animate={reduced ? undefined : "center"}
            exit={reduced ? undefined : "exit"}
            transition={{ duration: 0.5, ease: E }}
            className="absolute inset-x-0 bottom-14 top-14">
            <SlideRenderer id={slide.id} reduced={reduced} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Click zones */}
      <button type="button" aria-label="Previous slide" onClick={prev} disabled={idx === 0}
        className="fixed bottom-14 left-0 top-14 z-30 hidden w-[10%] cursor-w-resize disabled:pointer-events-none md:block" />
      <button type="button" aria-label="Next slide" onClick={next} disabled={idx === total - 1}
        className="fixed bottom-14 right-0 top-14 z-30 hidden w-[10%] cursor-e-resize disabled:pointer-events-none md:block" />

      {/* Footer */}
      <footer className={`absolute inset-x-0 bottom-0 z-40 border-t backdrop-blur-md transition-all duration-500 ${footerBg}`}>
        <div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            className={`shrink-0 rounded px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3 ${navBtn}`}>
            Prev
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-2.5">
            <DeckSlideScrubber idx={idx} total={total} dark={dark} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} dark={dark} onJump={jump} />
            </div>
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1}
            className={`shrink-0 rounded px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3 ${navBtn}`}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
