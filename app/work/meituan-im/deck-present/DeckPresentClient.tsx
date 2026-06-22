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

// ─── Slide registry — follows the case study narrative ────────────────────────
//   Opening → Context → System → The Flow (one workflow per slide, deep-linked
//   into the live prototype) → Extensions → Impact → Reflection → Closing
const SLIDES = [
  { id: "cover",               chapter: "Opening",     dark: true  },
  { id: "overview",            chapter: "Opening",     dark: false },
  { id: "signal",              chapter: "Context",     dark: true  },
  { id: "before-after",        chapter: "Context",     dark: false },
  { id: "system-flow",         chapter: "System",      dark: false },
  { id: "entry-states",        chapter: "System",      dark: false },
  { id: "flow-standard",       chapter: "The Flow",    dark: false },
  { id: "flow-selfserve",      chapter: "The Flow",    dark: false },
  { id: "flow-offhours",       chapter: "The Flow",    dark: false },
  { id: "flow-expired-before", chapter: "The Flow",    dark: false },
  { id: "flow-expired-after",  chapter: "The Flow",    dark: false },
  { id: "flow-return",         chapter: "The Flow",    dark: false },
  { id: "prototype-full",      chapter: "The Flow",    dark: false },
  { id: "extensions",          chapter: "Extensions",  dark: false },
  { id: "impact",              chapter: "Impact",      dark: true  },
  { id: "reflection",          chapter: "Reflection",  dark: false },
  { id: "closing",             chapter: "Closing",     dark: false },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Living aura — slow breathing accent blobs ────────────────────────────────
function LivingAura({ reduced, tint = LIME }: { reduced: boolean | null; tint?: string }) {
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div className="absolute rounded-full"
        style={{ width: 540, height: 540, left: "6%", top: "10%",
          background: `radial-gradient(circle, ${hexA(tint, 0.1)}, transparent 68%)`, filter: "blur(44px)" }}
        animate={{ x: [0, 46, -12, 0], y: [0, -34, 22, 0], scale: [1, 1.14, 0.95, 1], opacity: [0.5, 0.9, 0.6, 0.5] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute rounded-full"
        style={{ width: 440, height: 440, right: "8%", bottom: "6%",
          background: "radial-gradient(circle, rgba(255,200,71,0.09), transparent 70%)", filter: "blur(52px)" }}
        animate={{ x: [0, -38, 14, 0], y: [0, 26, -18, 0], scale: [1, 1.1, 0.93, 1], opacity: [0.4, 0.7, 0.5, 0.4] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut", delay: 2.4 }} />
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
      style={{ background: `radial-gradient(900px circle at ${pos.x} ${pos.y}, rgba(200,255,71,0.06), transparent 72%)` }} />
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
  to, suffix = "", prefix = "", startDelay = 320, duration = 1100, format,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number; format?: (n: number) => string }) {
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
  return <>{prefix}{format ? format(n) : n}{suffix}</>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const EYE  = "font-mono text-[10px] uppercase tracking-[0.26em]";
const BODY = "font-sans leading-[1.76]";

function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`${EYE} ${dark ? "text-white/[0.98]" : "text-[#9A9A9A]"}`}>{children}</p>;
}

// ─── Workflow / map SVG viewer (full-bleed, fit to slot) ──────────────────────
function WorkflowImg({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`flex min-h-0 w-full min-w-0 flex-1 basis-0 flex-col ${className}`}>
      <div className="flex min-h-0 w-full flex-1 basis-0 flex-col items-stretch">
        <div className="relative box-border min-h-0 w-full max-w-[min(64rem,100%)] flex-1 self-center rounded-xl bg-black/[0.02] px-2 py-1 ring-1 ring-black/[0.07] md:px-3 md:py-2">
          <img src={src} alt={alt}
            className="absolute inset-0 box-border block h-full w-full object-contain object-center p-0.5"
            loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  );
}

// ─── Live phone — deep-links the bundled prototype into ONE flow ──────────────
//   `interaction-flow-phone.html#flow=<scenario>&rail=0` boots the phone-only
//   build straight into a single scenario with its switcher rail hidden, so each
//   slide shows exactly the workflow it's narrating. Only the active slide is
//   mounted, so just one heavy iframe is alive at a time.
function DeckPhone({ flow, caption }: { flow: string; caption?: string }) {
  const PW = 480, PH = 1010;
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / PW, h / PH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <figure className="flex h-full min-h-0 flex-col">
      <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden">
        {scale > 0 ? (
          <iframe
            src={`/assets/meituan-im/interaction-flow-phone.html#flow=${flow}&rail=0`}
            title={`${flow} flow — live prototype`}
            loading="lazy"
            style={{
              position: "absolute", left: "50%", top: "50%", width: PW, height: PH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#B0B0B0]">Loading prototype…</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 shrink-0 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-[#9A9A9A]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 Cover
function SlideCover({ reduced }: { reduced: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const meta = [
    { k: "Company",  v: "Meituan · Local Services" },
    { k: "Role",     v: "Sole designer — end-to-end" },
    { k: "Duration", v: "4 weeks · 2025" },
    { k: "Outcome",  v: "+5% conversion · −50% disputes · A/B validated" },
  ];
  return (
    <section ref={ref} className="relative flex h-full min-h-0 items-stretch overflow-hidden bg-[#050507]">
      <LivingAura reduced={reduced} />
      <Spotlight containerRef={ref} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-[#C8FF47]/[0.025] to-transparent" />
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE}><Eye dark>Meituan · Local Services · IM Consultation · 2025</Eye></motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["Designing Trust", "Before the Bill."].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className="font-display font-extralight leading-[1.02] tracking-[-0.04em] text-white"
                    style={{ fontSize: "clamp(2.35rem, 5.2vw + 0.5rem, 4.75rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className={`mt-5 max-w-xl ${BODY} text-[14px] leading-[1.65] text-white/[0.96] md:mt-6 md:text-[15px]`}>
              A 0-to-1 in-message quotation system across Meituan&apos;s 770M+ annual users and 14.5M merchants — turning uncertain local-service pricing into a guided, comparable, bookable decision.
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

// §01 Overview
function SlideOverview() {
  const pillars = [
    { stat: "+5%",  label: "Conversion lift",   detail: "Users-level randomized A/B vs the traditional path" },
    { stat: "~2k",  label: "Extra daily orders", detail: "Incremental volume at projected coverage" },
    { stat: "−50%", label: "Pricing disputes",   detail: "Post-service complaints in this flow" },
  ];
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE} className="flex items-center gap-4">
          <img src="/assets/meituan-im/meituan-logo.png" alt="Meituan"
            className="h-6 w-auto max-w-[9rem] object-contain object-left opacity-90" decoding="async" />
          <span className="h-3.5 w-px bg-black/15" />
          <Eye>Overview · IM Consultation</Eye>
        </motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className="font-display font-light leading-[1.08] tracking-[-0.032em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.8rem)" }}>
            Turn an uncertain price into a guided, bookable decision.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[15px] text-[#5A5A5A]`}>
          Local-service buyers couldn&apos;t trust a price until the work began. I built the in-message consultation flow end-to-end — diagnosis, a structured service order, and live competitive quoting — so trust is earned step by step, before the bill.
        </motion.p>
        <motion.div variants={UP} className="mt-9 grid gap-px overflow-hidden rounded-2xl bg-black/[0.06] ring-1 ring-black/[0.06] md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div key={p.label} className="bg-white px-6 py-6"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-display font-light tracking-[-0.02em] text-[#0A0A0A]"
                style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}>{p.stat}</p>
              <p className="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]/75">{p.label}</p>
              <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-[#6A6A6A]">{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={UP} className="mt-7 flex items-start gap-3 border-l-2 border-[#C8FF47] pl-4">
          <p className="font-sans text-[13.5px] leading-relaxed text-[#6A6A6A]">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#7e9a1f]">Design principle</span>
            <span className="mt-1.5 block text-[#3A3A3A]">Transparent <em className="not-italic font-medium text-[#0A0A0A]">process</em> beats transparent pricing — I designed trust to compound at every step.</span>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §02 Context · the signal
function SlideSignal({ reduced }: { reduced: boolean | null }) {
  const stats = [
    { n: "10", label: "merchants visited" },
    { n: "6",  label: "actually consulted" },
    { n: "30", label: "minutes comparing" },
    { n: "0",  label: "trust in the price" },
  ];
  return (
    <section className="relative flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10 w-full max-w-5xl" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye dark>Context · The Signal</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-6 max-w-3xl font-display font-light leading-[1.08] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.7rem)" }}>
            The brief asked for price visibility. The evidence pointed deeper.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="bg-[#050507] px-6 py-6"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.3 + i * 0.1 }}>
              <p className="font-display font-light leading-none text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>{s.n}</p>
              <p className="mt-3 font-sans text-[12px] leading-snug text-white/[0.7]">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.p variants={UP} className="mt-8 font-display text-[clamp(1.1rem,2vw,1.5rem)] font-light leading-[1.4] tracking-[-0.018em] text-white">
          Price was not a number problem. It was a <span className="text-[#C8FF47]">process-trust</span> problem.
        </motion.p>
      </motion.div>
    </section>
  );
}

// §03 Before → After
function SlideBeforeAfter() {
  const before = ["Problem occurs", "Many merchants appear", "One-by-one outreach", "Pick one for visit"];
  const after  = ["Diagnose the problem", "Structure the intent", "Compare and commit"];
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Reframe · Linear Journey → Trust Loop</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-display font-light leading-[1.1] tracking-[-0.03em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            From a 4-step journey that breaks trust to a 3-step loop that builds it.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col rounded-2xl bg-white px-6 py-6 ring-1 ring-black/[0.06] md:px-7 md:py-7">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9A9A9A]">Before · linear</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BDBDBD]">grayscale</p>
            </div>
            <ol className="flex-1 divide-y divide-black/[0.06]">
              {before.map((t, i) => (
                <li key={i} className="flex items-baseline gap-3 py-3">
                  <span className="font-mono text-[10px] tabular-nums text-[#B0B0B0]">0{i + 1}</span>
                  <p className="text-[14.5px] tracking-tight text-[#5A5A5A]">{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t border-black/[0.07] pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9A9A]">→ Trust break</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6A6A6A]">Quoted price ≠ actual bill.</p>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-white px-6 py-6 ring-1 ring-[#C8FF47]/55 md:px-7 md:py-7">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7e9a1f]">After · trust loop</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BDBDBD]">redesigned</p>
            </div>
            <ol className="flex-1 divide-y divide-black/[0.06]">
              {after.map((t, i) => (
                <li key={i} className="flex items-baseline gap-3 py-3">
                  <span className="font-mono text-[10px] tabular-nums text-[#7e9a1f]">0{i + 1}</span>
                  <p className="text-[14.5px] tracking-tight text-[#0A0A0A]">{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t border-black/[0.07] pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7e9a1f]">→ Trust restored</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#6A6A6A]">Each step earns the next.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §04 System flow map
function SlideSystemFlow() {
  return (
    <section className="flex h-full min-h-0 flex-col bg-white px-10 py-4 md:px-14 md:py-5">
      <motion.div variants={STG} initial="hidden" animate="show" className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>System Design</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              One end-to-end flow. Trust compounds at every stage.
            </h2>
          </Mask>
        </div>
        <motion.div variants={FADE} className="mt-3 flex min-h-0 flex-1 basis-0 flex-col">
          <WorkflowImg src="/assets/meituan-im/im_consultation_user_flow_full.svg" alt="IM consultation user flow — end to end" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §05 Entry states
function SlideEntryStates() {
  const shots = [
    { src: "/assets/meituan-im/screen-04-entry-generic.jpg",  label: "Generic entry",  note: "Open-ended “what's wrong?” — the model starts the diagnosis." },
    { src: "/assets/meituan-im/screen-05-entry-specific.jpg", label: "Specific entry", note: "Deep-linked from a service — context pre-fills, fewer questions." },
    { src: "/assets/meituan-im/screen-03-offhours-state.jpg", label: "After-hours entry", note: "Off-hours state sets expectations and keeps the thread warm." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-10 pb-6 pt-7 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>IM Experience</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            Three entry states, one interaction model.
          </h2>
        </Mask>
      </motion.div>
      <div className="mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-3 md:gap-4" style={{ maxHeight: "62vh" }}>
        {shots.map((s, i) => (
          <motion.article key={s.label} className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.07]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-black/[0.05]">
              <img src={s.src} alt={s.label} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
            </div>
            <div className="shrink-0 px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7e9a1f]">{s.label}</p>
              <p className="mt-2 font-sans text-[12px] leading-relaxed text-[#6A6A6A]">{s.note}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── Flow slide template: copy left, live deep-linked phone right ──────────────
function FlowSlide({
  eye, title, body, points, flow, caption,
}: {
  eye: string; title: string; body: string;
  points?: { k: string; v: string }[];
  flow: string; caption: string;
}) {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-10 md:px-14">
      <div className="mx-auto grid w-full max-w-[80rem] items-center gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              {title}
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-[#5A5A5A]`}>{body}</motion.p>
          {points && (
            <motion.div variants={UP} className="mt-5 space-y-3">
              {points.map((p, i) => (
                <div key={p.k} className={`border-l-2 pl-3 ${i === 0 ? "border-[#C8FF47]" : "border-black/[0.1]"}`}>
                  <p className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0A0A0A]">{p.k}</p>
                  <p className="mt-1 font-sans text-[13px] text-[#5A5A5A]">{p.v}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
        <motion.div className="h-[min(74vh,42rem)] min-w-0"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E, delay: 0.22 }}>
          <DeckPhone flow={flow} caption={caption} />
        </motion.div>
      </div>
    </section>
  );
}

function SlideFlowStandard() {
  return (
    <FlowSlide
      eye="Repair Flow · Standard · Book a pro"
      title="Conversation becomes a contract."
      body="A vague problem turns into a structured service order: the expert diagnoses, the chat builds a card, and every merchant quotes against the same order — never against each other."
      points={[
        { k: "Diagnose", v: "Vague problem → structured intent, before any price." },
        { k: "Show progress before price", v: "Live competitive quoting makes waiting legible." },
      ]}
      flow="default"
      caption="Live · default flow"
    />
  );
}
function SlideFlowSelfserve() {
  return (
    <FlowSlide
      eye="Repair Flow · Self-serve fix"
      title="Not every problem needs a pro."
      body="When the fix is simple, the flow guides a self-serve solution instead of dispatching a paid visit — protecting long-term trust over a short-term order."
      points={[
        { k: "Judgment", v: "Diagnosis can also conclude “you don't need us.”" },
        { k: "Trust dividend", v: "Honest off-ramps are why users come back." },
      ]}
      flow="cat-litter"
      caption="Live · self-serve flow"
    />
  );
}
function SlideFlowOffhours() {
  return (
    <FlowSlide
      eye="Repair Flow · After hours"
      title="After hours, still answered."
      body="When no merchant is online, the off-hours state sets expectations and keeps the thread warm — the user is parked, not dropped."
      points={[
        { k: "Set expectations", v: "Tell the user when a real quote will arrive." },
        { k: "Continuity", v: "The conversation resumes in place when pros return." },
      ]}
      flow="off-hours"
      caption="Live · after-hours flow"
    />
  );
}
function SlideFlowExpiredBefore() {
  return (
    <FlowSlide
      eye="Repair Flow · Quote expired · before action"
      title="Hard expiry, before you act."
      body="A stale quote can't be silently used. Before checkout, a modal blocks the unsafe assumption and walks the user back to a fresh, honest number."
      points={[
        { k: "Safety first", v: "Never let an expired price reach the bill." },
        { k: "Recover, don't restart", v: "Re-quote keeps the diagnosis intact." },
      ]}
      flow="expired-modal"
      caption="Live · expired (before action)"
    />
  );
}
function SlideFlowExpiredAfter() {
  return (
    <FlowSlide
      eye="Repair Flow · Quote expired · after action"
      title="Soft continuity. Only the time slot resets."
      body="Expired quotes stay visible but disabled. The conversation and diagnosis persist — reset only what's unsafe to assume, keep everything that's still true."
      points={[
        { k: "Hard expiry, soft continuity", v: "The thread survives; only the slot re-confirms." },
        { k: "Legibility", v: "Disabled-but-visible beats vanished." },
      ]}
      flow="expired-chat"
      caption="Live · expired (after action)"
    />
  );
}
function SlideFlowReturn() {
  return (
    <FlowSlide
      eye="Repair Flow · Post-service follow-up"
      title="The trust loop closes where it began."
      body="The return visit and rating live in the same thread the booking started in — re-engagement is one tap, and the relationship compounds across jobs."
      points={[
        { k: "Same thread", v: "Follow-up isn't a new cold start." },
        { k: "One-tap re-book", v: "Repeat work flows back to a trusted pro." },
      ]}
      flow="return-visit"
      caption="Live · return-visit flow"
    />
  );
}

// §12 Full interactive prototype
function SlidePrototypeFull() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/[0.06] px-6 py-2.5 md:px-10 md:py-3">
        <Eye>Interactive Prototype · Switch any scenario</Eye>
        <Link href="/work/meituan-im/prototype"
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9A9A9A] transition-colors hover:text-[#0A0A0A]">
          Open full page ↗
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-[#F7F5F0] p-2 md:p-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-black/[0.07]">
          <iframe src="/work/meituan-im/prototype" title="Repair flow — full interactive prototype"
            className="min-h-0 w-full flex-1 border-0" loading="lazy" />
        </div>
      </div>
      <div className="shrink-0 border-t border-black/[0.05] px-6 py-2 md:px-10">
        <p className="font-sans text-[10px] leading-relaxed text-[#6A6A6A] md:text-[11px]">
          Switch scenarios from the rail under the phone, or tap suggested replies to play a flow through.
          <span className="text-[#9A9A9A]"> Re-skinned in English / USD for a non-Chinese audience — the shipped product is Chinese with RMB.</span>
        </p>
        <p className={`mt-1.5 ${EYE} text-[#B0B0B0]`}>Click inside to interact · click outside the deck to resume keyboard navigation</p>
      </div>
    </section>
  );
}

// §13 Framework extensions
function SlideExtensions() {
  const rows = [
    { domain: "Home repair", tag: "Reference case", ref: true, d: "Certified expert defines the issue.", s: "Chat → structured service-order card.", c: "Live competitive quote → checkout." },
    { domain: "Education", tag: "Parents · advisors · plans", d: "Goals, grade, budget.", s: "Constraints → learning brief.", c: "Plan comparison." },
    { domain: "Banquet", tag: "Event · venue · lock-in", d: "Size, date, menu, must-haves.", s: "Non-negotiables → requirement card.", c: "Venues quote on equal terms." },
    { domain: "Maternity care", tag: "Family · caregiver · continuity", d: "Need and risk; credentials first.", s: "Care scope → service brief.", c: "Package in trust context." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Framework Extensions</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)" }}>
            The same loop scales: education, banquet, maternity care.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-7 overflow-hidden rounded-2xl border border-black/[0.08]">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1.05fr] bg-black/[0.025]">
            {["Domain", "01 · Diagnose", "02 · Structure", "03 · Commit"].map((h, i) => (
              <div key={h} className={`px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] ${i === 0 ? "text-[#9A9A9A]" : "text-[#7e9a1f]"} ${i < 3 ? "border-r border-black/[0.06]" : ""}`}>{h}</div>
            ))}
          </div>
          {rows.map((row, i) => (
            <motion.div key={row.domain} className={`grid grid-cols-[1.1fr_1fr_1fr_1.05fr] border-t border-black/[0.06] ${row.ref ? "bg-[#F5FBE0]/70" : "bg-white"}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: E, delay: 0.3 + i * 0.08 }}>
              <div className="border-r border-black/[0.06] px-5 py-4">
                <p className={`text-[14px] tracking-tight ${row.ref ? "text-[#7e9a1f]" : "text-[#0A0A0A]"}`}>{row.domain}</p>
                <p className={`mt-0.5 text-[11px] leading-snug ${row.ref ? "text-[#7e9a1f]/80" : "text-[#9A9A9A]"}`}>{row.tag}</p>
              </div>
              <div className="border-r border-black/[0.06] px-5 py-4 text-[13px] leading-relaxed text-[#5A5A5A]">{row.d}</div>
              <div className="border-r border-black/[0.06] px-5 py-4 text-[13px] leading-relaxed text-[#5A5A5A]">{row.s}</div>
              <div className="px-5 py-4 text-[13px] leading-relaxed text-[#5A5A5A]">{row.c}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §14 Impact — data-stream reveal
function DataStreamBg() {
  const lines = [
    { top: "10%", width: "32%", dur: 5.4, delay: 0.0, opacity: 0.18 },
    { top: "24%", width: "26%", dur: 6.2, delay: 1.1, opacity: 0.14 },
    { top: "40%", width: "38%", dur: 4.8, delay: 0.4, opacity: 0.22 },
    { top: "58%", width: "22%", dur: 7.0, delay: 2.0, opacity: 0.10 },
    { top: "72%", width: "30%", dur: 5.6, delay: 0.8, opacity: 0.18 },
    { top: "86%", width: "28%", dur: 6.4, delay: 1.6, opacity: 0.12 },
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

function SlideImpact() {
  const stats = [
    { to: 5,    suffix: "%", prefix: "+", label: "Conversion lift",      detail: "Users who completed this flow vs the traditional path", key: true },
    { to: 2000, suffix: "",  prefix: "~", label: "Extra daily orders",   detail: "Incremental volume at projected coverage", fmt: (n: number) => Math.round(n / 1000) + "k" },
    { to: 50,   suffix: "%", prefix: "−", label: "Pricing disputes",     detail: "Post-service complaints in this flow" },
  ];
  const T_TITLE = 0.0, T_SUB = 0.3, T_STATS = 0.7, T_OUTRO = 1.3;
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <DataStreamBg />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye dark>Impact &amp; Validation · User-level randomized A/B</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className="mt-4 font-display font-light tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.7rem)" }}>
            Trust-first won the A/B.
          </h2>
        </Mask>
        <div className="mt-9 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-3">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.14;
            return (
              <motion.div key={s.label} className="relative bg-[#050507] px-6 py-7"
                initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <motion.div className="mb-3 h-[1.5px] bg-[#C8FF47]/65"
                  initial={{ width: 0 }} animate={{ width: "1.5rem" }}
                  transition={{ duration: 0.55, ease: E, delay: cardDelay + 0.15 }} />
                <p className="relative font-display font-light leading-none text-[#C8FF47]"
                  style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)" }}>
                  <motion.span
                    animate={s.key
                      ? { textShadow: ["0 0 0px rgba(200,255,71,0)", "0 0 26px rgba(200,255,71,0.55)", "0 0 10px rgba(200,255,71,0.22)"] }
                      : { textShadow: ["0 0 0px rgba(200,255,71,0)", "0 0 14px rgba(200,255,71,0.3)", "0 0 0px rgba(200,255,71,0)"] }}
                    transition={{ duration: 2.2, ease: "easeOut", delay: cardDelay + 0.55, times: [0, 0.55, 1],
                      repeat: s.key ? Infinity : 0, repeatDelay: s.key ? 2.4 : 0 }}>
                    <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} format={s.fmt} startDelay={cardDelay * 1000 + 350} duration={1200} />
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
          Measured on a new in-message entry point, user-level randomized A/B across Meituan + Dianping.
        </motion.p>
      </div>
    </section>
  );
}

// §15 Reflection
function SlideReflection() {
  const fronts = [
    { n: "01", t: "Merchant experience deserves its own product pass." },
    { n: "02", t: "Guide pricing should explain variability, not imply a promise." },
    { n: "03", t: "Scale with AI triage, escalate to human experts." },
    { n: "04", t: "On a wrong diagnosis, make cost ownership explicit — so trust holds on the unhappy path too." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Reflection</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            Next time, I&apos;d push on four fronts.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
          {fronts.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex gap-4 rounded-xl bg-white px-5 py-5 ring-1 ring-black/[0.06]">
              <span className="font-mono text-[11px] text-[#7e9a1f]">{f.n}</span>
              <p className="font-sans text-[14px] leading-[1.6] tracking-tight text-[#3A3A3A]">{f.t}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §16 Closing
function SlideClosing() {
  return (
    <section className="flex h-full flex-col items-start justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-3xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12 bg-[#0A0A0A]" />
        <Mask delay={0.08}>
          <h2 className="font-display font-light leading-[1.18] tracking-[-0.03em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)" }}>
            Transparent <span className="text-[#7e9a1f]">process</span> is a stronger trust advantage than transparent <span className="line-through decoration-black/30">pricing</span> alone.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-8 ${EYE} text-[#9A9A9A]`}>
          Yuan Fang · Product Designer · Pratt Institute
        </motion.p>
        <motion.div variants={UP} className="mt-9 flex flex-wrap items-center gap-5">
          <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#0A0A0A] px-7 py-3.5 font-sans text-[13px] font-medium text-white transition-all duration-500 hover:bg-[#C8FF47] hover:text-[#0A0A0A]">
            Try the prototype
            <span className="transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/meituan-im"
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
    case "cover":               return <SlideCover reduced={reduced} />;
    case "overview":            return <SlideOverview />;
    case "signal":              return <SlideSignal reduced={reduced} />;
    case "before-after":        return <SlideBeforeAfter />;
    case "system-flow":         return <SlideSystemFlow />;
    case "entry-states":        return <SlideEntryStates />;
    case "flow-standard":       return <SlideFlowStandard />;
    case "flow-selfserve":      return <SlideFlowSelfserve />;
    case "flow-offhours":       return <SlideFlowOffhours />;
    case "flow-expired-before": return <SlideFlowExpiredBefore />;
    case "flow-expired-after":  return <SlideFlowExpiredAfter />;
    case "flow-return":         return <SlideFlowReturn />;
    case "prototype-full":      return <SlidePrototypeFull />;
    case "extensions":          return <SlideExtensions />;
    case "impact":              return <SlideImpact />;
    case "reflection":          return <SlideReflection />;
    case "closing":             return <SlideClosing />;
    default:                    return null;
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
          <Link href="/work/meituan-im"
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

      {/* Slide area — overlapping directional transition */}
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
