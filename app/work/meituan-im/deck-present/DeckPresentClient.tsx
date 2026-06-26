"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Uber Base · light tokens (mirror the live prototype's MT palette) ─────────
//   Black primary, mono neutral ramp, Base blue as the single restrained accent.
//   No lime, no warm surfaces — the deck and the embedded prototype share a system.
const U = {
  ink:        "#000000", // contentPrimary
  inkSoft:    "#141414",
  inkLight:   "#545454", // contentSecondary
  muted:      "#757575", // contentTertiary (mono700)
  mutedSoft:  "#AFAFAF", // mono600
  hairline:   "#E2E2E2", // borderOpaque (mono400)
  divider:    "#EBEBEB",
  bg:         "#F6F6F6", // mono200 — light canvas
  surface:    "#FFFFFF", // mono100
  surfaceDeep:"#EEEEEE", // mono300
  dark:       "#000000", // Uber black — dark slides
  accent:     "#FFD100", // Meituan yellow — the single accent
  accentInk:  "#3D2E00", // text/icon sitting ON the yellow accent
};

const FONT =
  "var(--font-manrope), -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

// ─── Easings & variants ───────────────────────────────────────────────────────
const E    = [0.22, 1, 0.36, 1] as const;
const EMSK = [0.76, 0, 0.24, 1] as const;

const STG  = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
const UP   = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.82, ease: E } } };
const FADE = { hidden: { opacity: 0 },        show: { opacity: 1,       transition: { duration: 0.55, ease: E } } };

// ─── Slide registry — follows the case study narrative ────────────────────────
//   Opening → Context → System → The Flow (one workflow per slide, deep-linked
//   into the live prototype) → Extensions → Impact → Reflection → Closing
const SLIDES = [
  { id: "cover",               chapter: "Opening",     dark: true  },
  { id: "context",             chapter: "Opening",     dark: false },
  { id: "overview",            chapter: "Opening",     dark: false },
  { id: "signal",              chapter: "Context",     dark: true  },
  { id: "first-try",           chapter: "Context",     dark: false },
  { id: "before-after",        chapter: "Context",     dark: false },
  { id: "system-flow",         chapter: "System",      dark: false },
  { id: "txn-flow",            chapter: "System",      dark: false },
  { id: "entry-states",        chapter: "System",      dark: false },
  { id: "flow-standard",       chapter: "The Flow",    dark: false },
  { id: "flow-selfserve",      chapter: "The Flow",    dark: false },
  { id: "flow-offhours",       chapter: "The Flow",    dark: false },
  { id: "flow-expired-before", chapter: "The Flow",    dark: false },
  { id: "flow-expired-after",  chapter: "The Flow",    dark: false },
  { id: "flow-return",         chapter: "The Flow",    dark: false },
  { id: "merchant",            chapter: "The Flow",    dark: false },
  { id: "prototype-full",      chapter: "The Flow",    dark: false },
  { id: "extensions",          chapter: "Extensions",  dark: false },
  { id: "impact",              chapter: "Impact",      dark: true  },
  { id: "reflection",          chapter: "Reflection",  dark: false },
  { id: "closing",             chapter: "Closing",     dark: false },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

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
  to, suffix = "", prefix = "", startDelay = 220, duration = 1100, format,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number; format?: (n: number) => string }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    // Reduced motion (and SSR/headless edge cases): show the final value outright
    // so the metric never reads as a stuck "0".
    if (reduced) { setN(to); return; }
    let frame = 0;
    let start = 0;
    let done = false;
    const finish = () => { if (!done) { done = true; setN(to); } };
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setN((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    const tid = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, startDelay);
    // Safety net: some browsers throttle requestAnimationFrame (reduced-motion
    // settings, background throttling, iframes) so the rAF tick may never fire and
    // the number would sit at 0. This timeout guarantees it lands on the final value.
    const guard = window.setTimeout(finish, startDelay + duration + 400);
    return () => { clearTimeout(tid); clearTimeout(guard); cancelAnimationFrame(frame); };
  }, [to, startDelay, duration, reduced]);
  return <>{prefix}{format ? format(n) : Math.round(n)}{suffix}</>;
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.24em]"
      style={{ color: dark ? "rgba(255,255,255,0.6)" : U.muted }}>
      {children}
    </p>
  );
}

// ─── Yellow highlighter mark — reads on light or dark slides alike ────────────
function Mark({ children }: { children: ReactNode }) {
  return (
    <span style={{
      background: U.accent, color: U.accentInk,
      padding: "0.02em 0.2em", borderRadius: 3,
      boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
    }}>
      {children}
    </span>
  );
}

// ─── System flow — SERVICE BLUEPRINT (lanes by visibility, stages left→right) ──
//   Redrawn as a proper service blueprint: customer actions sit above the line
//   of interaction, the frontstage contact between the two canonical lines, and
//   the backstage platform systems below the line of visibility. Mono Uber Base,
//   clean cells (no decorative left strips); the one customer decision is yellow.
const SYS_STAGES = [
  { n: "01", name: "Discovery" },
  { n: "02", name: "Chat & Intake" },
  { n: "03", name: "Matching" },
  { n: "04", name: "Fulfilment" },
  { n: "05", name: "Feedback" },
] as const;

type BPCell = { t: string; decision?: boolean } | null;

const BP_LANES: { name: string; band?: boolean; cells: BPCell[] }[] = [
  {
    name: "Customer", band: true,
    cells: [
      { t: "Search repair intent" },
      { t: "Describe the issue" },
      { t: "Compare & pick a merchant", decision: true },
      { t: "Pay after the service" },
      { t: "Rate & tag quality" },
    ],
  },
  {
    name: "Frontstage",
    cells: [
      null,
      { t: "Expert diagnoses in thread" },
      { t: "Merchants bid live" },
      { t: "On-site service done" },
      null,
    ],
  },
  {
    name: "Backstage",
    cells: [
      { t: "Surface diagnosis card" },
      { t: "Generate service order" },
      { t: "Rank & stream bids" },
      { t: "Bind deposit & balance" },
      { t: "Update ranking model" },
    ],
  },
];

const BP_COLS = "minmax(92px,108px) repeat(5, minmax(0,1fr))";

function BPLane({ lane }: { lane: (typeof BP_LANES)[number] }) {
  return (
    <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: BP_COLS, background: lane.band ? U.bg : U.surface }}>
      <div className="flex items-center px-4" style={{ borderRight: `1px solid ${U.hairline}` }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: U.inkLight }}>{lane.name}</span>
      </div>
      {lane.cells.map((c, i) => {
        const linkNext = !!c && !!lane.cells[i + 1]; // both this and the next step exist
        return (
          <div key={i} className="relative flex items-center px-4">
            {c && (c.decision ? (
              <span className="inline-flex items-center gap-2 text-[14px] font-medium leading-snug" style={{ color: U.ink }}>
                <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: U.accent }} />
                {c.t}
              </span>
            ) : (
              <span className="text-[14px] font-normal leading-snug" style={{ color: U.inkSoft }}>{c.t}</span>
            ))}
            {linkNext && (
              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" aria-hidden style={{ color: U.mutedSoft }}>
                <svg width="15" height="10" viewBox="0 0 15 10" fill="none">
                  <path d="M1 5h12M9.5 1.5 13 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BPLine({ label }: { label: string }) {
  return (
    <div className="shrink-0 px-4 py-1" style={{ borderTop: `1px dashed ${U.hairline}` }}>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: U.mutedSoft }}>{label}</span>
    </div>
  );
}

function SystemDiagram() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl"
      style={{ border: `1px solid ${U.hairline}`, background: U.surface }}>
      {/* Stage header — the timeline (light, no chips) */}
      <div className="grid shrink-0" style={{ gridTemplateColumns: BP_COLS, borderBottom: `1px solid ${U.hairline}` }}>
        <div className="px-4 py-2.5" style={{ borderRight: `1px solid ${U.hairline}` }} />
        {SYS_STAGES.map((s) => (
          <div key={s.n} className="flex items-baseline gap-1.5 px-4 py-2.5">
            <span className="text-[10px] font-medium tabular-nums" style={{ color: U.mutedSoft }}>{s.n}</span>
            <span className="truncate text-[13px] font-semibold tracking-tight" style={{ color: U.ink }}>{s.name}</span>
          </div>
        ))}
      </div>
      {/* Three lanes, separated only by the two canonical lines + whitespace */}
      <BPLane lane={BP_LANES[0]} />
      <BPLine label="Line of interaction" />
      <BPLane lane={BP_LANES[1]} />
      <BPLine label="Line of visibility" />
      <BPLane lane={BP_LANES[2]} />
    </div>
  );
}

// Defer heavy iframe (1.27MB bundle that boots a React app) mounting until the
// slide-enter transition has settled, so the animation runs on a light
// placeholder instead of janking while the bundle compiles. Returns false during
// the transition window, then true.
function useAfterEnter(delay = 480) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

// ─── Live phone — deep-links the LATEST bundled prototype into ONE flow ────────
//   `Repair Flow.html#flow=<scenario>&rail=0` boots the Uber Base build straight
//   into a single scenario with its switcher rail hidden, so each slide shows
//   exactly the workflow it's narrating. The bundle hints a 480×1000 canvas.
//   Only the active slide is mounted, so one heavy iframe is alive at a time.
function DeckPhone({ flow, caption }: { flow: string; caption?: string }) {
  const PW = 480, PH = 1000;
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
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
        {scale > 0 && ready ? (
          <iframe
            src={`/assets/meituan-im/Repair%20Flow.html#flow=${flow}&rail=0&seek=1`}
            title={`${flow} flow — live prototype`}
            loading="lazy"
            style={{
              position: "absolute", left: "50%", top: "50%", width: PW, height: PH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>Loading prototype…</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 flex shrink-0 items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em]"
          style={{ color: U.muted }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: U.accent }} />
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
function SlideCover() {
  const meta = [
    { k: "Company",  v: "Meituan · Local Services" },
    { k: "Role",     v: "Sole designer · with 2 PMs + 2 engineers" },
    { k: "Duration", v: "4 weeks · 2025" },
    { k: "Outcome",  v: "+30% channel conversion · +0.5pp overall (measured)" },
  ];
  return (
    <section className="relative flex h-full min-h-0 items-stretch overflow-hidden" style={{ background: U.dark }}>
      {/* subtle, flat top wash — no colored glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)" }} aria-hidden />
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE}><Eye dark>Meituan · Local Services · IM Consultation · 2025</Eye></motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["Designing Trust", "Before the Bill."].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className="font-extralight leading-[1.02] tracking-[-0.04em] text-white"
                    style={{ fontSize: "clamp(2.35rem, 5.2vw + 0.5rem, 4.75rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className="mt-5 max-w-xl text-[14px] font-light leading-[1.65] md:mt-6 md:text-[15px]"
              style={{ color: "rgba(255,255,255,0.72)" }}>
              A 0-to-1 in-message quotation system across Meituan&apos;s 770M+ annual users and 14.5M merchants — turning uncertain local-service pricing into a guided, comparable, bookable decision.
            </motion.p>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
            <motion.dl variants={UP}
              className="mt-6 grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
              style={{ borderColor: "rgba(255,255,255,0.14)" }}>
              {meta.map(({ k, v }) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>{k}</dt>
                  <dd className="mt-1 text-[12px] font-light leading-snug text-white sm:text-[13px]">{v}</dd>
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
    { stat: "+30%",  label: "Channel conversion",  detail: "Intent→order on the diagnostic channel — ~1.3× the old path; +0.5pp overall" },
    { stat: "~2k",   label: "Extra daily orders",  detail: "Incremental volume projected at rollout coverage" },
    { stat: "−50%",  label: "Pricing disputes",    detail: "Projected drop in post-service complaints in this flow" },
  ];
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE} className="flex items-center gap-4">
          <img src="/assets/meituan-im/meituan-logo.png" alt="Meituan"
            className="h-6 w-auto max-w-[9rem] object-contain object-left opacity-90" decoding="async" />
          <span className="h-3.5 w-px" style={{ background: U.hairline }} />
          <Eye>Overview · IM Consultation</Eye>
        </motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className="font-light leading-[1.08] tracking-[-0.032em]" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.8rem)", color: U.ink }}>
            Turn an uncertain price into a guided, bookable decision.
          </h2>
        </Mask>
        {/* Three results, de-tabled: simple stat blocks split by hairlines */}
        <motion.div variants={UP} className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div key={p.label} className={`sm:pl-8 ${i > 0 ? "sm:border-l" : ""}`}
              style={{ borderColor: U.divider }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-light tracking-[-0.02em]" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", color: U.ink }}>{p.stat}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.inkLight }}>{p.label}</p>
              <p className="mt-1.5 text-[12.5px] font-light leading-relaxed" style={{ color: U.muted }}>{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={UP} className="mt-9 border-l-2 pl-4" style={{ borderColor: U.ink }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.muted }}>Design principle</p>
          <p className="mt-1.5 text-[14px] font-light leading-relaxed" style={{ color: U.inkSoft }}>
            Transparent <em className="font-medium not-italic" style={{ color: U.ink }}>process</em> beats transparent pricing — I designed trust to compound at every step.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §01b What is this surface — context for a cold reader
function SlideContext() {
  const analogy = [
    { icon: "/assets/meituan-im/logos/uber-icon.png",       name: "Uber",       v: "on-demand, on-site" },
    { icon: "/assets/meituan-im/logos/yelp-icon.png",       name: "Yelp",       v: "discover & compare merchants" },
    { icon: "/assets/meituan-im/logos/taskrabbit-icon.png", name: "TaskRabbit", v: "real people do the work" },
  ];
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Context · The Product</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 max-w-3xl font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)", color: U.ink }}>
            Meituan local services is a super-app marketplace — and deals close inside the chat.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {analogy.map((a, i) => (
            <div key={a.name} className={`sm:pl-7 ${i > 0 ? "sm:border-l" : ""}`} style={{ borderColor: U.divider }}>
              <div className="flex items-center gap-2.5">
                <img src={a.icon} alt={`${a.name} logo`} className="h-[22px] w-[22px] shrink-0 rounded-[5px] object-contain"
                  loading="lazy" decoding="async" />
                <p className="text-[15px] font-medium tracking-tight" style={{ color: U.ink }}>{a.name}</p>
              </div>
              <p className="mt-2 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>{a.v}</p>
            </div>
          ))}
        </motion.div>
        <motion.p variants={UP} className="mt-8 max-w-2xl text-[15px] font-light leading-[1.76]" style={{ color: U.inkLight }}>
          Its core interaction is <span style={{ color: U.ink }}>IM — in-message</span>. My project runs the whole journey — diagnose, compare, book, pay, review — in a single conversation.
        </motion.p>
      </motion.div>
    </section>
  );
}

// §02 Context · the signal — told as a story, not a table
function SlideSignal() {
  return (
    <section className="relative flex h-full items-center overflow-hidden px-12 md:px-20" style={{ background: U.dark }}>
      <motion.div className="relative z-10 w-full max-w-4xl" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye dark>Context · The Signal</Eye></motion.div>
        <Mask delay={0.12} className="mt-7">
          <p className="font-extralight leading-[1.32] tracking-[-0.02em] text-white" style={{ fontSize: "clamp(1.45rem, 3vw, 2.35rem)" }}>
            &ldquo;I messaged 10 shops, talked to 6, spent 30 minutes comparing — and still had no idea what it would cost. Every number felt like they&apos;d change it once they showed up.&rdquo;
          </p>
        </Mask>
        <motion.p variants={UP} className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>
          A pattern from user research — and my own experience
        </motion.p>
        <motion.p variants={UP} className="mt-8 font-light leading-[1.4] tracking-[-0.018em] text-white" style={{ fontSize: "clamp(1.1rem,2vw,1.5rem)" }}>
          Price was not a number problem. It was a <Mark>process-trust</Mark> problem.
        </motion.p>
      </motion.div>
    </section>
  );
}

// §02b The first attempt that failed — the turn
function SlideFirstTry() {
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-4xl">
        <motion.div variants={FADE}><Eye>Context · The First Attempt</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            We shipped the obvious fix first — and it moved nothing.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.muted }}>v1 · standalone quote page</p>
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>— no measurable lift</span>
          </div>
          <p className="mt-3 text-[15px] font-light leading-[1.75]" style={{ color: U.inkLight }}>
            Show the price up front on its own page. Conversion didn&apos;t budge — the quote was rarely final, so users didn&apos;t believe it and merchants didn&apos;t maintain it. Decoration, not trust.
          </p>
        </motion.div>
        <motion.p variants={UP} className="mt-7 font-light leading-[1.4] tracking-[-0.02em]" style={{ fontSize: "clamp(1.15rem, 2.1vw, 1.6rem)", color: U.ink }}>
          That failure was the insight: trust can&apos;t be <span style={{ color: U.muted }}>declared</span> on a page — it has to be <Mark>built</Mark> in the conversation.
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
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Reframe · Linear Journey → Trust Loop</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            From a 4-step journey that breaks trust to a 3-step loop that builds it.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* BEFORE — muted */}
          <div className="flex flex-col rounded-2xl px-6 py-6 md:px-7 md:py-7"
            style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.muted }}>Before · linear</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>breaks trust</p>
            </div>
            <ol className="flex-1">
              {before.map((t, i) => (
                <li key={i} className={`flex items-baseline gap-3 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: U.divider }}>
                  <span className="text-[10px] tabular-nums" style={{ color: U.mutedSoft }}>0{i + 1}</span>
                  <p className="text-[14.5px] font-light tracking-tight" style={{ color: U.inkLight }}>{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t pt-4" style={{ borderColor: U.divider }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: U.muted }}>→ Trust break</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>Quoted price ≠ actual bill.</p>
            </div>
          </div>
          {/* AFTER — black-accented */}
          <div className="flex flex-col rounded-2xl px-6 py-6 md:px-7 md:py-7"
            style={{ background: U.surface, border: `1.5px solid ${U.ink}` }}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.ink }}>After · trust loop</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>builds trust</p>
            </div>
            <ol className="flex-1">
              {after.map((t, i) => (
                <li key={i} className={`flex items-baseline gap-3 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: U.divider }}>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: U.ink }}>0{i + 1}</span>
                  <p className="text-[14.5px] tracking-tight" style={{ color: U.ink }}>{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t pt-4" style={{ borderColor: U.divider }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: U.ink }}>→ Trust restored</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>Each step earns the next.</p>
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
    <section className="flex h-full min-h-0 flex-col px-10 py-4 md:px-14 md:py-5" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>System Design</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className="mt-3 font-light tracking-[-0.026em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
              One end-to-end flow. Trust compounds at every stage.
            </h2>
          </Mask>
        </div>
        <motion.div variants={FADE} className="mt-3 flex min-h-0 flex-1 basis-0 flex-col">
          <SystemDiagram />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §04b Transaction blueprint — the full quote-to-service deal across 3 parties.
//   Self-contained Uber Base diagram (its own title + legend); shown full-bleed on
//   the matching gray field so the wide swimlane letterboxes seamlessly.
function SlideTxnFlow() {
  return (
    <section className="relative h-full min-h-0 overflow-hidden" style={{ background: U.bg }}>
      <iframe
        src="/assets/meituan-im/quote-to-service-flow-en.html"
        title="Quote-to-service transaction flow"
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
      />
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
    <section className="flex h-full flex-col justify-center px-10 pb-6 pt-7 md:px-14" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>IM Experience</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 font-light tracking-[-0.026em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
            Three entry states, one interaction model.
          </h2>
        </Mask>
      </motion.div>
      <div className="mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-3 md:gap-4" style={{ maxHeight: "62vh" }}>
        {shots.map((s, i) => (
          <motion.article key={s.label} className="flex min-h-0 flex-col overflow-hidden rounded-2xl"
            style={{ background: U.surface, border: `1px solid ${U.hairline}` }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: U.surfaceDeep }}>
              <img src={s.src} alt={s.label} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
            </div>
            <div className="shrink-0 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: U.ink }}>{s.label}</p>
              <p className="mt-2 text-[12px] font-light leading-relaxed" style={{ color: U.muted }}>{s.note}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── Flow slide template: copy left, live deep-linked phone right ──────────────
function FlowSlide({
  eye, title, points, flow, caption,
}: {
  eye: string; title: string;
  points?: { k: string; v: string }[];
  flow: string; caption: string;
}) {
  return (
    <section className="flex h-full items-center px-10 md:px-14" style={{ background: U.surface }}>
      <div className="mx-auto grid w-full max-w-[80rem] items-center gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
              {title}
            </h2>
          </Mask>
          {points && (
            <motion.div variants={UP} className="mt-6 space-y-3.5">
              {points.map((p, i) => (
                <div key={p.k} className="border-l-2 pl-3" style={{ borderColor: i === 0 ? U.ink : U.hairline }}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: U.ink }}>{p.k}</p>
                  <p className="mt-1 text-[13px] font-light" style={{ color: U.inkLight }}>{p.v}</p>
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
      points={[
        { k: "Same thread", v: "Follow-up isn't a new cold start." },
        { k: "One-tap re-book", v: "Repeat work flows back to a trusted pro." },
      ]}
      flow="return-visit"
      caption="Live · return-visit flow"
    />
  );
}

// Full prototype, embedded DIRECTLY (not via the /prototype Next route). Loading
// that route in an iframe re-booted the entire site shell and then nested the
// 1.27MB bundle inside it — a triple load that could crash / reload on mobile,
// which remounts the deck back to slide 0. Here we scale the bundle's native
// 1200×1080 canvas (phone + scenario rail) to fit the card, centered — same
// interactive prototype, a fraction of the weight.
function FullPrototypeEmbed() {
  const NW = 1200, NH = 1080;
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / NW, h / NH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden" style={{ background: U.surface }}>
      {scale > 0 && ready ? (
        <iframe
          src="/assets/meituan-im/Repair%20Flow.html"
          title="Repair flow — full interactive prototype"
          loading="lazy"
          style={{
            position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
            transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>Loading prototype…</span>
        </div>
      )}
    </div>
  );
}

// §11b Merchant side — the landscape "Quote Desk" console, scaled to fit
function MerchantConsoleEmbed() {
  const NW = 1110, NH = 820; // the 1062×758 console + the bundle's centering padding
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / NW, h / NH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative min-h-0 w-full flex-1 basis-0 overflow-hidden" style={{ background: U.surface }}>
      {scale > 0 && ready ? (
        <iframe
          src="/assets/meituan-im/Repair%20Flow.html#flow=merchant&rail=0"
          title="Merchant quote desk — live prototype"
          loading="lazy"
          style={{
            position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
            transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>Loading merchant view…</span>
        </div>
      )}
    </div>
  );
}

function SlideMerchant() {
  return (
    <section className="flex h-full min-h-0 flex-col px-10 pb-4 pt-7 md:px-14" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="shrink-0">
        <motion.div variants={FADE}><Eye>The Other Side · Merchant</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 max-w-4xl font-light tracking-[-0.026em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
            Merchants quote against the same order — on equal footing.
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-3 max-w-3xl text-[13.5px] font-light leading-[1.7]" style={{ color: U.inkLight }}>
          Every merchant gets the same structured order and submits one quote — a fixed price or a strictly-bounded range. They never see each other&apos;s numbers, so they compete on the brief, not by undercutting.
        </motion.p>
      </motion.div>
      <motion.div variants={FADE} initial="hidden" animate="show" className="mt-4 flex min-h-0 flex-1 basis-0 flex-col">
        <MerchantConsoleEmbed />
      </motion.div>
    </section>
  );
}

// §12 Full interactive prototype
function SlidePrototypeFull() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: U.surface }}>
      <div className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-2.5 md:px-10 md:py-3" style={{ borderColor: U.divider }}>
        <Eye>Interactive Prototype · Switch any scenario</Eye>
        <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
          className="text-[10px] font-medium uppercase tracking-[0.18em] transition-colors"
          style={{ color: U.muted }}>
          Open full page ↗
        </a>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2 md:p-3" style={{ background: U.bg }}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg" style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
          <FullPrototypeEmbed />
        </div>
      </div>
      <div className="shrink-0 border-t px-6 py-2 md:px-10" style={{ borderColor: U.divider }}>
        <p className="text-[10px] font-light leading-relaxed md:text-[11px]" style={{ color: U.inkLight }}>
          Switch scenarios from the rail under the phone, or tap suggested replies to play a flow through.
          <span style={{ color: U.muted }}> Re-skinned in English / USD for a non-Chinese audience — the shipped product is Chinese with RMB.</span>
        </p>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>Click inside to interact · click outside the deck to resume keyboard navigation</p>
      </div>
    </section>
  );
}

// §13 Framework extensions — cards, not a matrix
function SlideExtensions() {
  const rows = [
    { domain: "Education",      tag: "Parents · advisors · plans",      d: "Goals, grade, budget.",          s: "Constraints → learning brief.",     c: "Plan comparison." },
    { domain: "Banquet",        tag: "Event · venue · lock-in",         d: "Size, date, menu, must-haves.",  s: "Non-negotiables → requirement card.", c: "Venues quote on equal terms." },
    { domain: "Maternity care", tag: "Family · caregiver · continuity", d: "Need and risk; credentials first.", s: "Care scope → service brief.",     c: "Package in trust context." },
  ];
  const steps = ["01 · Diagnose", "02 · Structure", "03 · Commit"] as const;
  return (
    <section className="flex h-full flex-col justify-center px-10 md:px-14" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Framework Extensions</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)", color: U.ink }}>
            The same loop scales: education, banquet, maternity care.
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-4 max-w-2xl text-[13.5px] font-light leading-[1.7]" style={{ color: U.inkLight }}>
          Diagnose → structure → commit is domain-agnostic — the same three moves carry into any high-consideration local service.
        </motion.p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {rows.map((row, i) => (
            <motion.div key={row.domain} className="flex flex-col rounded-2xl px-5 py-5"
              style={{ background: U.bg, border: `1px solid ${U.hairline}` }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="text-[15px] font-medium tracking-tight" style={{ color: U.ink }}>{row.domain}</p>
              <p className="mt-0.5 text-[11px] font-light leading-snug" style={{ color: U.muted }}>{row.tag}</p>
              <div className="mt-4 space-y-3">
                {[row.d, row.s, row.c].map((v, j) => (
                  <div key={j} className="border-l-2 pl-3" style={{ borderColor: j === 0 ? U.ink : U.hairline }}>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.muted }}>{steps[j]}</p>
                    <p className="mt-0.5 text-[12.5px] font-light leading-relaxed" style={{ color: U.inkLight }}>{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// §14 Impact
function SlideImpact() {
  const stats = [
    { to: 30,   suffix: "%", prefix: "+", label: "Channel conversion",  tag: "Measured",  detail: "Intent→order on the diagnostic channel — ~1.3× the old path; +0.5pp overall", key: true },
    { to: 2000, suffix: "",  prefix: "~", label: "Extra daily orders",  tag: "Projected", detail: "Incremental volume modeled for wider rollout", fmt: (n: number) => Math.round(n / 1000) + "k" },
    { to: 50,   suffix: "%", prefix: "−", label: "Pricing disputes",    tag: "Projected", detail: "Modeled drop in post-service complaints in this flow" },
  ];
  const T_TITLE = 0.0, T_SUB = 0.3, T_STATS = 0.7, T_OUTRO = 1.3;
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20" style={{ background: U.dark }}>
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye dark>Impact &amp; Validation · User-level randomized A/B</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className="mt-4 font-light tracking-[-0.03em] text-white" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.7rem)" }}>
            Trust-first won the A/B.
          </h2>
        </Mask>
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.14;
            return (
              <motion.div key={s.label} className={`px-2 py-4 md:px-7 ${i > 0 ? "md:border-l" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.14)" }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <p className="font-light leading-none" style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", color: s.key ? U.accent : "#FFFFFF" }}>
                  <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} format={s.fmt} startDelay={260 + i * 140} duration={1200} />
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-[12px] font-medium text-white">{s.label}</p>
                  <span className="rounded-full px-1.5 py-[1px] text-[8.5px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.22)" }}>{s.tag}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: E, delay: T_OUTRO }}
          className="mt-7 max-w-2xl text-[13px] font-light leading-[1.76]" style={{ color: "rgba(255,255,255,0.7)" }}>
          A floating window on search, piloted on two repair categories — toilet repair and pipe clearing — in Hangzhou + select Zhejiang. The conversion figures are real June–August A/B numbers; the order and dispute figures are modeled forward for a wider rollout.
        </motion.p>
      </div>
    </section>
  );
}

// §15 Reflection
function SlideReflection() {
  const fronts = [
    { n: "01", t: "The merchant side is thin — beyond quoting, what actions and incentives keep quotes fast and honest?" },
    { n: "02", t: "Replace the human-expert bottleneck with AI — expert supply is what gates new cities today." },
    { n: "03", t: "On a wrong diagnosis, make cost ownership explicit — so trust holds on the unhappy path too." },
  ];
  return (
    <section className="flex h-full flex-col justify-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>Reflection</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-5 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            Next time, I&apos;d push on three fronts.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {fronts.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex gap-4 rounded-xl px-5 py-5"
              style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: U.ink }}>{f.n}</span>
              <p className="text-[14px] font-light leading-[1.6] tracking-tight" style={{ color: U.inkSoft }}>{f.t}</p>
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
    <section className="flex h-full flex-col items-start justify-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-3xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12" style={{ background: U.ink }} />
        <Mask delay={0.08}>
          <h2 className="font-light leading-[1.18] tracking-[-0.03em]" style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)", color: U.ink }}>
            Transparent <Mark>process</Mark> is a stronger trust advantage than transparent <span className="line-through" style={{ textDecorationColor: U.mutedSoft, color: U.muted }}>pricing</span> alone.
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: U.muted }}>
          Yuan Fang · Product Designer · Pratt Institute
        </motion.p>
        <motion.div variants={UP} className="mt-9 flex flex-wrap items-center gap-5">
          <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[13px] font-medium text-white transition-colors duration-300"
            style={{ background: U.ink }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1F1F1F")}
            onMouseLeave={(e) => (e.currentTarget.style.background = U.ink)}>
            Try the prototype
            <span className="transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/meituan-im"
            className="text-[10px] font-semibold uppercase tracking-[0.24em] underline underline-offset-4 transition-colors"
            style={{ color: U.muted, textDecorationColor: U.hairline }}>
            Case study
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Slide renderer ───────────────────────────────────────────────────────────
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":               return <SlideCover />;
    case "context":             return <SlideContext />;
    case "overview":            return <SlideOverview />;
    case "signal":              return <SlideSignal />;
    case "first-try":           return <SlideFirstTry />;
    case "before-after":        return <SlideBeforeAfter />;
    case "system-flow":         return <SlideSystemFlow />;
    case "txn-flow":            return <SlideTxnFlow />;
    case "entry-states":        return <SlideEntryStates />;
    case "flow-standard":       return <SlideFlowStandard />;
    case "flow-selfserve":      return <SlideFlowSelfserve />;
    case "flow-offhours":       return <SlideFlowOffhours />;
    case "flow-expired-before": return <SlideFlowExpiredBefore />;
    case "flow-expired-after":  return <SlideFlowExpiredAfter />;
    case "flow-return":         return <SlideFlowReturn />;
    case "merchant":            return <SlideMerchant />;
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
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full" aria-hidden
        style={{ background: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: U.accent }} />
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
                ? "px-3 py-[3px] text-[9px] font-semibold uppercase tracking-[0.18em]"
                : "h-1.5 w-1.5"
            }`}
            style={on
              ? { background: U.accent, color: U.accentInk }
              : { background: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.18)" }}
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

  const chromeBg     = dark ? "rgba(0,0,0,0.96)" : "rgba(255,255,255,0.78)";
  const chromeBorder = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.07)";
  const navStrong    = dark ? "rgba(255,255,255,0.92)" : U.inkLight;
  const navMeta      = dark ? "rgba(255,255,255,0.6)"  : U.mutedSoft;

  return (
    <div className="relative h-screen overflow-hidden" style={{ fontFamily: FONT, background: dark ? U.dark : U.surface }}>
      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full" style={{ background: U.accent }}
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10"
        style={{ background: chromeBg, borderColor: chromeBorder }}>
        <div className="flex items-center gap-5">
          <Link href="/work/meituan-im"
            className="text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors"
            style={{ color: navStrong }}>
            ← Case Study
          </Link>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] md:inline" style={{ color: navMeta }}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden text-[10px] font-medium md:inline" style={{ color: navMeta }}>~{minsLeft} min left</span>
          <span className="text-[10px] font-medium tabular-nums" style={{ color: navMeta }}>
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
            <SlideRenderer id={slide.id} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Edge click-zones removed so they never sit over (and block selecting)
          slide text. Navigation: arrow keys, footer Prev/Next, scrubber, pills. */}

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-40 border-t backdrop-blur-md transition-colors duration-500"
        style={{ background: chromeBg, borderColor: chromeBorder }}>
        <div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3"
            style={{ color: navStrong }}>
            Prev
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-2.5">
            <DeckSlideScrubber idx={idx} total={total} dark={dark} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} dark={dark} onJump={jump} />
            </div>
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1}
            className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3"
            style={{ color: navStrong }}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
