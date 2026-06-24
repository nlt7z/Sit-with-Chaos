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

// ─── Linear-flavored dark tokens ──────────────────────────────────────────────
// Near-black canvas, one hairline weight, a single chromatic accent (lime).
// Surfaces are reduced to whitespace + hairlines; raised panels carry a glassy
// 1px inner highlight so they read as machined rather than drawn.
const CANVAS    = "bg-[#08090A]";
const HEAD      = "text-[#F7F8F8]";                 // off-white headlines, never pure white
const HAIR      = "border-white/[0.08]";            // the one hairline weight
const INSET     = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";
// The lone chromatic accent is lime (#FF6A00), applied via literal classes so
// Tailwind can see it; everything else is whitespace + hairlines.

/** Left copy + right media: wide media-heavy split used by the feature slides. */
const SPLIT =
  "relative z-10 flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 md:flex-row md:items-stretch md:gap-12";

// ─── Live prototype deep-links — each URL mounts the real showroom straight into
//     the moment its feature is open, so the deck shows the interactive prototype
//     instead of a screen recording (mirrors the case study's FEATURE_PROTOTYPES).
const PROTO = {
  romanceFull:     "/work/ai-character/prototype?embed=1&muted=1",
  heartbeat:       "/work/ai-character/prototype?embed=1&muted=1&focus=heartbeat",
  story:           "/work/ai-character/prototype?embed=1&muted=1&focus=story",
  moments:         "/work/ai-character/prototype?embed=1&muted=1&focus=moments",
  altUniverse:     "/work/ai-character/prototype?embed=1&muted=1&focus=alt-universe",
  inspire:         "/work/ai-character/prototype?embed=1&muted=1&focus=inspire",
  code:            "/work/ai-character/prototype?embed=1&muted=1&focus=code",
  astroProfile:    "/work/ai-character/prototype-astro?embed=1&focus=profile",
  therapyAnalysis: "/work/ai-character/prototype-psych?embed=1&focus=analysis",
} as const;

// ─── Slide registry — re-sequenced to the live case study narrative ───────────
//   Opening → Problem → Decision 01 → 02 → 03 → Method → Showcase →
//   Contribution → Impact → Takeaway → Closing. Every slide is dark.
const SLIDES = [
  { id: "cover",            chapter: "Opening"      },
  { id: "overview",         chapter: "Opening"      },
  { id: "problem",          chapter: "Problem"      },
  { id: "hmw",              chapter: "Problem"      },
  { id: "howmightwe",       chapter: "Problem"      },
  { id: "d1-title",         chapter: "Decision 01"  },
  { id: "d1-showrooms",     chapter: "Decision 01"  },
  { id: "d2-title",         chapter: "Decision 02"  },
  { id: "d2-map",           chapter: "Decision 02"  },
  { id: "heartbeat",        chapter: "Decision 02"  },
  { id: "heartbeat-logic",  chapter: "Decision 02"  },
  { id: "story",            chapter: "Decision 02"  },
  { id: "story-logic",      chapter: "Decision 02"  },
  { id: "moments",          chapter: "Decision 02"  },
  { id: "moments-logic",    chapter: "Decision 02"  },
  { id: "altuniv",          chapter: "Decision 02"  },
  { id: "altuniv-logic",    chapter: "Decision 02"  },
  { id: "astro-profile",    chapter: "Decision 02"  },
  { id: "therapy-analysis", chapter: "Decision 02"  },
  { id: "d3-title",         chapter: "Decision 03"  },
  { id: "inspire-continue", chapter: "Decision 03"  },
  { id: "code-drawer",      chapter: "Decision 03"  },
  { id: "exploration",      chapter: "Method"       },
  { id: "how-i-worked",     chapter: "Method"       },
  { id: "process",          chapter: "Method"       },
  { id: "showrooms",        chapter: "Showcase"     },
  { id: "showcase-live",    chapter: "Showcase"     },
  { id: "backend",          chapter: "Contribution" },
  { id: "spark-design",     chapter: "Contribution" },
  { id: "metrics",          chapter: "Impact"       },
  { id: "metrics-method",   chapter: "Impact"       },
  { id: "principles",       chapter: "Takeaway"     },
  { id: "takeaways",        chapter: "Takeaway"     },
  { id: "closing",          chapter: "Closing"      },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Living glow — a single soft lime radial (the "indigo glow", done in lime) ─
// Static glow — a pre-rasterized lime ambience baked into a CSS gradient. It used
// to animate scale/opacity on blurred blobs, but animating a blurred element forces
// the browser to re-rasterize the blur every frame, which made slide switches janky.
// Static = the GPU caches it once, so transitions stay smooth.
function LivingAura({ reduced: _reduced }: { reduced: boolean | null }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        background:
          "radial-gradient(46rem 30rem at 50% -8%, rgba(255,106,0,0.07), transparent 60%)," +
          "radial-gradient(24rem 24rem at 94% 108%, rgba(255,106,0,0.045), transparent 66%)",
      }}
    />
  );
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
      style={{ background: `radial-gradient(820px circle at ${pos.x} ${pos.y}, rgba(255,106,0,0.06), transparent 72%)` }} />
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
const EYE  = "font-mono text-[10px] uppercase tracking-[0.24em]";
const BODY = "font-sans leading-[1.72]";

function Eye({ children }: { children: ReactNode }) {
  return <p className={`${EYE} text-white/[0.42]`}>{children}</p>;
}

/** Tiny mono key chip — Linear treats keyboard hints as first-class chrome. */
function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-white/[0.12] bg-white/[0.04] px-1 font-mono text-[10px] leading-none text-white/55 ${INSET}`}>
      {children}
    </span>
  );
}

// ─── Live prototype, scaled to fit ────────────────────────────────────────────
// Renders the full-desktop showroom (1440×810) and scales it to fit the box it's
// given, letterboxed and centered, so the embed reads like the real app — just
// smaller. The deck only mounts the active slide, so each iframe boots when its
// slide opens and unmounts when it leaves (no stack of live apps piling up).
const PROTO_W = 1440;
const PROTO_H = 810;

function DeckPrototype({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = box.w > 0 && box.h > 0 ? Math.min(box.w / PROTO_W, box.h / PROTO_H) : 0;
  return (
    <div ref={ref} className="relative flex min-h-0 w-full flex-1 basis-0 items-center justify-center">
      {scale > 0 ? (
        <div
          className="relative overflow-hidden rounded-lg bg-[#0b0b10] shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]"
          style={{ width: PROTO_W * scale, height: PROTO_H * scale }}
        >
          <iframe
            src={src}
            title={label}
            loading="lazy"
            className="absolute left-0 top-0 border-0"
            style={{ width: PROTO_W, height: PROTO_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
            onLoad={(e) => {
              // The prototype is same-origin, so forward deck nav keys (arrows /
              // space / page) out of the iframe — otherwise once it grabs focus
              // the deck's keyboard navigation goes dead. Skip while typing.
              try {
                const doc = (e.currentTarget as HTMLIFrameElement).contentDocument;
                if (!doc) return;
                doc.addEventListener("keydown", (ev) => {
                  const t = ev.target as HTMLElement | null;
                  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
                  if (["ArrowRight", " ", "PageDown"].includes(ev.key)) { ev.preventDefault(); window.dispatchEvent(new CustomEvent("deck-nav", { detail: 1 })); }
                  else if (["ArrowLeft", "PageUp"].includes(ev.key)) { ev.preventDefault(); window.dispatchEvent(new CustomEvent("deck-nav", { detail: -1 })); }
                });
              } catch { /* cross-origin / unavailable — ignore */ }
            }}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center" aria-hidden>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Loading prototype…</span>
        </div>
      )}
    </div>
  );
}

// ─── Workflow SVG viewer — diagrams stay on white "paper" so dark ink reads ───
function WorkflowImg({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 basis-0 flex-col">
      <div className="relative box-border min-h-0 w-full max-w-[min(80rem,100%)] flex-1 self-center">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 box-border block h-full w-full object-contain object-center p-1"
          loading="lazy"
          decoding="async"
        />
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
    { k: "Role",     v: "Sole UX designer — research to production code" },
    { k: "Timeline", v: "4 weeks · July–August 2025" },
    { k: "Team",     v: "Me · 2 supervisors · 2 PM · 1 engineer" },
    { k: "Owned",    v: "UX strategy · 4 showrooms · design-system templates" },
  ];
  return (
    <section ref={ref} className={`relative flex h-full min-h-0 items-stretch overflow-hidden ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <Spotlight containerRef={ref} />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] select-none lg:block">
        <motion.img
          src="/assets/ai-character/eternal-vow-character.png" alt="" aria-hidden
          className="h-full w-full object-cover object-top"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.75) 55%)", opacity: 0.55 }}
          initial={reduced ? false : { scale: 1.06, opacity: 0 }}
          animate={reduced ? undefined : { scale: 1, opacity: 0.55 }}
          transition={{ duration: 2.2, ease: E }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #08090A 0%, #08090Abb 20%, transparent 55%)" }} />
      </div>
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-6xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE} className="flex items-center gap-4">
              <img src="/assets/ai-character/alibaba-cloud-logo-new.png" alt="Alibaba Cloud"
                className="h-6 w-auto max-w-[10rem] object-contain object-left opacity-95" decoding="async" />
              <span className="h-3.5 w-px bg-white/15" />
              <Eye>Qwen Character · 2025</Eye>
            </motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["Interactive Showrooms", "End-to-End Design"].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className={`text-balance font-display font-light leading-[1.08] tracking-[-0.03em] ${HEAD}`}
                    style={{ fontSize: "clamp(1.95rem, 3.8vw + 0.4rem, 3.5rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className={`mt-5 max-w-xl ${BODY} text-[14px] leading-[1.62] text-white/[0.62] md:mt-6 md:text-[15px]`}>
              Led and shipped the end-to-end design of Interactive Showrooms — the MVP feature for the Qwen Character LLM, serving millions of enterprise customers — driving a 200% lift in model API call volume through 4 hands-on demos.
            </motion.p>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
            <motion.dl variants={UP}
              className={`mt-6 grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t ${HAIR} pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0`}>
              {meta.map(({ k, v }) => (
                <div key={k} className="min-w-0">
                  <dt className={`${EYE} text-white/[0.42]`}>{k}</dt>
                  <dd className="mt-1 font-sans text-[12px] leading-snug text-white/[0.8] sm:text-[13px]">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// §01 Overview — the promise + design principle (three columns, hairline-divided)
function SlideOverview({ reduced }: { reduced: boolean | null }) {
  const pillars = [
    { stat: "Hours → minutes", label: "Time to first value", detail: "Docs you couldn't feel → a felt first moment · observed" },
    { stat: "~2×",              label: "Model API call volume", detail: "vs the 4-week pre-launch baseline" },
    { stat: "4 demos",          label: "Hands-on showrooms",   detail: "One model strength proven per room" },
  ];
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Overview · Interactive Showrooms</Eye></motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className={`text-balance font-display font-light leading-[1.08] tracking-[-0.032em] ${HEAD}`}
            style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.8rem)" }}>
            Finally, you can see what people build on the model.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[15px] text-white/[0.68]`}>
          Qwen Character is an LLM API — enterprises, developers, and game studios build their own character products on it, the way you&apos;d build on Claude. I redesigned its official site and showrooms: the storefront where those products, once invisible, became visible and playable. Each room surfaces one model strength alongside a prompt guide and a live code editor.
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} sm:grid-cols-3`}>
          {pillars.map((p, i) => (
            <motion.div key={p.label}
              className={`py-6 sm:px-6 ${i > 0 ? `border-t ${HAIR} sm:border-l sm:border-t-0` : "sm:pl-0"}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-display font-light tracking-[-0.02em] text-[#FF6A00]"
                style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)" }}>{p.stat}</p>
              <p className="mt-3 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-white/[0.72]">{p.label}</p>
              <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-white/[0.5]">{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §02 Problem
function SlideProblem({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10 grid w-full max-w-6xl gap-10 md:grid-cols-2 md:gap-x-16" variants={STG} initial="hidden" animate="show">
        <div>
          <motion.div variants={FADE}><Eye>The Problem</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-6 font-display font-light leading-[1.08] tracking-[-0.03em] ${HEAD}`}
              style={{ fontSize: "clamp(1.8rem, 3.6vw, 3rem)" }}>
              The first hour was killing trial conversion.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-7 ${BODY} text-[15px] text-white/[0.72]`}>
            The docs explained everything. But feeling the model meant configuring, running samples, and interpreting output alone — a loop that routinely stretched past an hour. Most trial users left before reaching the moment of value.
          </motion.p>
          <motion.p variants={UP} className="mt-6 font-display text-[15px] font-light leading-relaxed text-[#FF6A00]/85">
            So I shifted the product from documentation to proof.
          </motion.p>
        </div>
        <motion.div variants={UP} className="flex flex-col gap-4 self-center">
          <figure className="overflow-hidden rounded-lg bg-black shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]">
            <video className="block w-full" autoPlay muted loop playsInline preload="metadata">
              <source src="/assets/ai-character/before.mp4" type="video/mp4" />
            </video>
            <figcaption className={`border-t ${HAIR} px-4 py-2.5 ${EYE} text-white/45 tracking-[0.08em]`}>Before — generic chat &amp; static docs</figcaption>
          </figure>
          <div className="border-l-2 border-[#FF6A00]/40 pl-5">
            <p className={`${EYE} text-white/[0.42]`}>Enterprise wall</p>
            <p className="mt-2 font-sans text-[13px] leading-[1.7] text-white/[0.78]">Prospects received decks that described capability — descriptive, not convincing. Nothing compressed time-to-trust or replaced that slow first hour with proof.</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §03 How Might We
function SlideHmw({ reduced }: { reduced: boolean | null }) {
  const rows = [
    { finding: "Every competitor felt like another ChatGPT", evidence: "6 apps · 40+ comments" },
    { finding: "Memory & pacing were invisible",             evidence: "Users churned before the difference landed" },
    { finding: "Trust = fast time-to-value",                 evidence: "Trial users dropped in the first hour" },
    { finding: "Enterprise: tell-vs-try wall",               evidence: "Decks describe, they don't convince" },
  ];
  return (
    <section className={`relative flex h-full items-center justify-center overflow-hidden px-10 md:px-16 lg:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] md:gap-x-16 lg:gap-x-24"
        variants={STG} initial="hidden" animate="show">
        <div className="min-w-0 max-w-xl md:max-w-none">
          <motion.div variants={FADE}><Eye>Research · 6 Apps · 40+ Comments</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-6 font-display font-light leading-[1.1] tracking-[-0.032em] ${HEAD}`}
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)" }}>
              Users want to feel AI, not read about it.
            </h2>
          </Mask>
        </div>
        <motion.div variants={UP} className="min-w-0 self-center">
          <p className={`${EYE} text-white/[0.42]`}>What the research surfaced</p>
          <div className={`mt-4 divide-y divide-white/[0.08] border-t ${HAIR}`}>
            {rows.map((row, i) => (
              <motion.div key={i} className="flex items-baseline justify-between gap-4 py-3.5"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: E, delay: 0.3 + i * 0.08 }}>
                <p className="font-sans text-[13.5px] font-medium text-white/[0.86]">{row.finding}</p>
                <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-white/[0.4]">{row.evidence}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §03.5 How Might We — standalone statement (after the research slide)
function SlideHmwStatement({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-10 md:px-16 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show"
        className="relative z-10 mx-auto w-full max-w-6xl border-l-2 border-[#FF6A00] pl-6 md:pl-8">
        <motion.div variants={FADE}><Eye>How might we</Eye></motion.div>
        <Mask delay={0.12} className="mt-5">
          <h2 className={`text-balance font-display font-light leading-[1.18] tracking-[-0.02em] ${HEAD}`}
            style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.4rem)" }}>
            Make model capabilities <em className="not-italic text-[#FF6A00]">visible</em>, <em className="not-italic text-[#FF6A00]">testable</em>, and <em className="not-italic text-[#FF6A00]">trustworthy</em> — within minutes?
          </h2>
        </Mask>
      </motion.div>
    </section>
  );
}

// ─── Decision title template ──────────────────────────────────────────────────
function TitleSlide({
  reduced, chapter, title, body, kicker,
}: { reduced: boolean | null; chapter: string; title: string; body: string; kicker: string }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-6xl">
        <motion.div variants={FADE}><Eye>{chapter}</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-6 font-display font-light leading-[1.08] tracking-[-0.032em] ${HEAD}`}
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            {title}
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-8 max-w-2xl ${BODY} text-[15.5px] text-white/[0.72]`}>
          {body}
        </motion.p>
        <motion.p variants={UP} className="mt-5 font-display text-[15px] font-light leading-relaxed text-[#FF6A00]/85">
          {kicker}
        </motion.p>
      </motion.div>
    </section>
  );
}

// §05 Decision 01 — showrooms (live romance prototype as the "after")
function SlideD1Showrooms({ reduced }: { reduced: boolean | null }) {
  const verticals = ["Companionship", "Psychotherapy", "Character cloning", "IP licensing"];
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>Before → After · Documentation to Proof</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.1] tracking-[-0.028em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              One vertical per room — built for the evaluator who already works there.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            6 apps, 40+ comments — every competitor felt like another ChatGPT. The answer was market-specific showrooms, each one a working version of a real buyer&apos;s product.
          </motion.p>
          <motion.div variants={UP} className="mt-5 flex flex-wrap gap-2">
            {verticals.map((v) => (
              <span key={v} className="rounded-full bg-white/[0.06] px-3 py-1.5 font-sans text-[11.5px] font-medium text-white/[0.78]">
                {v}
              </span>
            ))}
          </motion.div>
          <motion.p variants={UP} className="mt-5 font-display text-[13px] font-light leading-relaxed text-[#FF6A00]/85">
            Before: 60+ minutes of generic chat &amp; docs. After: the real room, right here →
          </motion.p>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={PROTO.romanceFull} label="Romance showroom — live prototype" />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>Live romance showroom — long-term memory &amp; emotional pacing</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §06 Decision 02 Title — three visibility columns, hairline-divided
function SlideD2Title({ reduced }: { reduced: boolean | null }) {
  const visibilities = [
    { type: "Memory",         detail: "What the system recalls and updates about you, in the flow." },
    { type: "Analysis",       detail: "What the system understood, shown while you keep talking." },
    { type: "Implementation", detail: "The prompts, YAML, and constraints, exposed beside the demo." },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Decision 02</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-5 font-display font-light leading-[1.1] tracking-[-0.03em] ${HEAD}`}
            style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.7rem)" }}>
            I designed each room to prove one capability in 60 seconds.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[14.5px] text-white/[0.68]`}>
          Three model strengths crammed into one chat window — none landed. So I split them across rooms, each built around an engagement lever a companion product lives on (intimacy, progression, off-session presence, variable reward): one proof moment per room, legible in 60 seconds, while turning invisible model behavior into visible surfaces.
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-3`}>
          {visibilities.map((it, i) => (
            <motion.div key={it.type}
              className={`py-6 md:px-6 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: E, delay: 0.26 + i * 0.1 }}>
              <p className={`${EYE} text-[#FF6A00]`}>{String(i + 1).padStart(2, "0")}</p>
              <p className={`mt-3 font-display text-[1.05rem] font-light ${HEAD}`}>{it.type} visibility</p>
              <p className="mt-2.5 font-sans text-[13px] leading-[1.7] text-white/[0.6]">{it.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §07 Decision 02 — capability map (Showroom → proof → in-product)
function SlideD2Map({ reduced }: { reduced: boolean | null }) {
  const rooms = [
    { tab: "Romance",   cap: "Long-term memory",        feel: "Character recalls conversation specifics across sessions", src: "/assets/ai-character/ux-strategy-romance-proof.png" },
    { tab: "Astrology", cap: "Real-time memory updates", feel: "Live constellation profile updates mid-conversation",      src: "/assets/ai-character/ux-strategy-astrology-proof.png" },
    { tab: "Therapy",   cap: "Real-time analysis",       feel: "Expert panel surfaces conversation themes as you chat",    src: "/assets/ai-character/ux-strategy-therapy-proof.png" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 pb-6 pt-7 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Showroom → One Proof → In-Product Behavior</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.026em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            Each room makes one form of cognition legible.
          </h2>
        </Mask>
      </motion.div>
      <div className="relative z-10 mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-4" style={{ maxHeight: "62vh" }}>
        {rooms.map((r, i) => (
          <motion.article key={r.tab}
            className={`flex min-h-0 flex-col overflow-hidden rounded-lg bg-white/[0.02]`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-black/40">
              <img src={r.src} alt={`${r.tab} proof`} className="h-full w-full object-cover object-left-top" loading="lazy" decoding="async" />
            </div>
            <div className={`shrink-0 border-t ${HAIR} px-4 py-4`}>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/[0.4]">{r.tab} Room</p>
              <p className={`mt-2 font-display text-[0.98rem] font-light leading-snug ${HEAD}`}>{r.cap}</p>
              <p className="mt-2 font-sans text-[11.5px] leading-relaxed text-white/[0.58]">{r.feel}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── Feature template: copy left, live prototype right ─────────────────────────
function ProtoFeatureSlide({
  reduced, eye, title, lead, src, caption, notShipped = false,
}: {
  reduced: boolean | null;
  eye: string; title: string; lead: string;
  src: string; caption: string; notShipped?: boolean;
}) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE} className="flex items-center gap-2.5">
            <Eye>{eye}</Eye>
            {notShipped && (
              <span className="rounded-[4px] border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/50">
                Not shipped
              </span>
            )}
          </motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.028em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              {title}
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-5 ${BODY} text-[14px] text-white/[0.72]`}>{lead}</motion.p>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={src} label={title} />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>{caption}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Feature template: model-workflow diagram full-bleed ───────────────────────
function LogicSlide({ reduced, eye, title, src, alt }: { reduced: boolean | null; eye: string; title: string; src: string; alt: string }) {
  return (
    <section className={`relative flex h-full min-h-0 flex-col overflow-hidden px-10 py-4 md:px-14 md:py-5 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.026em] ${HEAD}`}
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

// §08–17 Decision 02 feature slides
function SlideHeartbeat({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Romance · 1 of 4 · Heartbeat Power"
      title="The inner-monologue reveal."
      lead="Curiosity gap + emotional privilege — glimpsing hidden thoughts feels like being let in. The intimacy hook that turns a chat into attachment."
      src={PROTO.heartbeat}
      caption="Live romance room — tap the heart to reveal the inner monologue"
    />
  );
}
function SlideHeartbeatLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Heartbeat Power · Model Workflow" title="Real-time generation + character depth modeling"
    src="/assets/ai-character/interaction/heartbeat_power_workflow.svg" alt="Heartbeat Power — LLM workflow diagram" />;
}

function SlideStoryUnlock({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Romance · 2 of 4 · Story Unlock"
      title="Backstory revealed through depth."
      lead="Open loops + progression — an unfinished backstory pulls you forward, so depth itself becomes the reward that lengthens every session."
      src={PROTO.story}
      caption="Live romance room — go deeper, the character opens up"
    />
  );
}
function SlideStoryUnlockLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Story Unlock · Model Workflow" title="Progressive context building"
    src="/assets/ai-character/interaction/story_unlock_workflow.svg" alt="Story Unlock — LLM workflow diagram" />;
}

function SlideMoments({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Romance · 3 of 4 · Moments Feed"
      title="The character lives between conversations."
      lead="Object permanence + FOMO — the character keeps living while you're gone, which manufactures a reason to come back."
      src={PROTO.moments}
      caption="Live romance room — a feed generated from your shared history"
    />
  );
}
function SlideMomentsLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Moments Feed · Model Workflow" title="Memory to generated content"
    src="/assets/ai-character/interaction/moments_feed_workflow.svg" alt="Moments Feed — LLM workflow diagram" />;
}

function SlideAltUniv({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Romance · 4 of 4 · Alternate Universe"
      title="A scene only your history could trigger."
      notShipped
      lead="Variable reward — unpredictable, personal payoffs are the single strongest driver of a habit loop. (Prototyped, not shipped — real-time generation was too heavy for the timeline.)"
      src={PROTO.altUniverse}
      caption="Live prototype — a memory-driven scene shift"
    />
  );
}
function SlideAltUnivLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Alternate Universe · Model Workflow" title="From shared history to branching narrative"
    src="/assets/ai-character/interaction/alternate_universe_events_workflow.svg" alt="Alternate Universe Events — LLM workflow diagram" />;
}

function SlideAstroProfile({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Astrology · Real-Time Memory Updates"
      title="Every word updates what it knows about you."
      lead="Self-relevance — watching the model assemble you is intrinsically compelling, and visible memory quietly converts into trust."
      src={PROTO.astroProfile}
      caption="Live astrology room — your profile rewrites in real time"
    />
  );
}

function SlideTherapyAnalysis({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="Therapy · Real-Time Analysis"
      title="You see what it understood, not just what it said."
      lead="Feeling seen — visible reasoning makes users feel understood, and that is what builds trust and brings them back. (An analysis demo — no clinical claims implied.)"
      src={PROTO.therapyAnalysis}
      caption="Live therapy room — the model's read, beside your words"
    />
  );
}

// §18 Decision 03 Title
function SlideD3Title({ reduced }: { reduced: boolean | null }) {
  return (
    <TitleSlide
      reduced={reduced}
      chapter="Decision 03"
      title="I made demos emotional for users and inspectable for builders."
      body="Inspiration and Continue Response guide users to the wow moment. A slide-out drawer keeps YAML and prompts right next to the live demo."
      kicker="The question shifts from “can your model do this” to “how fast can we ship.”"
    />
  );
}

// §19 Inspire / Continue
function SlideInspireContinue({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>Two nudges toward the wow moment</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.1] tracking-[-0.028em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Making the model legible before users know to look.
            </h2>
          </Mask>
          <motion.dl variants={UP} className={`mt-6 divide-y divide-white/[0.08] border-t ${HAIR}`}>
            {[
              { t: "Inspiration Response", b: "Three reply options — action, emotion, expression — guide without breaking flow. Feels like gameplay, not messaging." },
              { t: "Continue Response",    b: "One tap extends the story from context — long-context reasoning, no effort required." },
            ].map((f) => (
              <div key={f.t} className="py-3.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.42]">{f.t}</dt>
                <dd className="mt-1.5 font-sans text-[13px] leading-relaxed text-white/[0.74]">{f.b}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={PROTO.inspire} label="Romance showroom — inspiration & continue" />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>Live romance room — tap a reply option, or continue the story</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §20 Code drawer
function SlideCodeDrawer({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>Code Drawer, Not Console</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.026em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              YAML, prompts, and constraints slide open beside the live demo.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            Evaluators inspect the implementation in place — no context switch — then clone the template as a reusable starting point for their own product. The room ships as code.
          </motion.p>
          <motion.div variants={UP} className="mt-6 space-y-2">
            <div className={`flex items-baseline gap-3 border-t ${HAIR} pt-3`}>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.38]">Rejected</span>
              <p className="font-sans text-[12.5px] leading-snug text-white/[0.55]">Separate developer console — breaks demo flow, requires a tab switch.</p>
            </div>
            <div className="flex items-baseline gap-3 border-t border-[#FF6A00]/30 pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF6A00]">Chosen</span>
              <p className="font-sans text-[12.5px] leading-snug text-white/[0.84]">Slide-out drawer beside the live demo — one coherent demo-to-review flow.</p>
            </div>
          </motion.div>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={PROTO.code} label="Romance showroom — code drawer" />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>Live romance room — the YAML &amp; prompt behind the demo, open right there</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §20.5 Early process — placeholder for early exploration artifacts (to be added)
function SlideExploration({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>Early Process · Exploration</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.2] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Before the four rooms — the scrappy early work.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            Research, sketches, and the directions I rejected on the way to the showrooms.
            <span className="mt-2 block text-white/[0.4]">Placeholder — early artifacts to be added.</span>
          </motion.p>
        </div>
        <motion.div variants={UP} className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex min-h-0 items-center justify-center rounded-lg border border-dashed border-white/[0.16] bg-white/[0.015]">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Early artifact 0{n}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §21 How I Worked — 4-stage AI matrix (monochrome, lime phase numbers)
const WORK_STAGES = [
  { n: "01", phase: "Research",                 tools: "Notion · Memo · ChatGPT · Claude",         body: "Synthesized scattered research — 6 apps, 40+ comments — into strategy patterns in one session." },
  { n: "02", phase: "UX Strategy",              tools: "Qwen · ChatGPT · Figma",                   body: "Stress-tested competing design decisions as structured arguments. Resolved debates before stakeholder meetings." },
  { n: "03", phase: "Visual Identity & UI",     tools: "Figma · MasterGo · Dreamnia · Wan · Kling", body: "Generated character art, scene backgrounds, and motion loops — work that would have needed a 3D production team." },
  { n: "04", phase: "Motion & Production Code", tools: "CodePen · Cursor · Claude Code",           body: "Shipped motion, state logic, and live interaction designs — without a dedicated frontend engineer." },
] as const;

function SlideHowIWorked({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>How I Worked</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.028em] ${HEAD}`}
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            AI changed how I shipped — not just how I made assets.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-4 max-w-3xl ${BODY} text-[14px] text-white/[0.68]`}>
          AI compressed the distance between strategy, visual direction, motion, and implementation — letting one designer deliver production-adjacent interfaces engineers could merge with minimal revision.
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-4`}>
          {WORK_STAGES.map((s, i) => (
            <motion.div key={s.n}
              className={`flex flex-col py-6 md:px-5 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.22 + i * 0.1 }}>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[12px] text-[#FF6A00]">{s.n}</span>
                <span className={`text-[13.5px] font-medium leading-tight ${HEAD}`}>{s.phase}</span>
              </div>
              <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">Tools</p>
              <p className="mt-1.5 font-sans text-[12px] leading-snug text-white/[0.82]">{s.tools}</p>
              <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">Output</p>
              <p className="mt-1.5 font-sans text-[12px] leading-[1.6] text-white/[0.6]">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §22 Process — visual identity glimpse
function SlideProcess({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>A Glimpse Into the Process</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.026em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Four weeks.<br />Research to production.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            Inspired by Love and Deepspace. Visual identity built with Wan, Kling, Dreamnia, and SeeDance. Interactions built with Cursor and Claude Code.
          </motion.p>
          <motion.div variants={UP} className="mt-5 border-l-2 border-[#FF6A00]/40 pl-4">
            <p className="font-sans text-[12px] leading-relaxed text-white/[0.58]">
              The 3D avatar crashed mid-interaction → replaced with an AI-looping video. Small motions — a blink, a nod — felt more alive than complex rigged animation.
            </p>
          </motion.div>
        </div>
        <motion.div variants={UP} className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3">
          {[
            { src: "/assets/ai-character/design.jpg",             label: "Character direction exploration" },
            { src: "/assets/ai-character/uivisual.jpg",           label: "UI visual system" },
            { src: "/assets/ai-character/characterdirection.jpg", label: "Character directions" },
            { src: "/assets/ai-character/innovation.jpg",         label: "Scene, music & motion concept" },
          ].map(({ src, label }, i) => (
            <motion.div key={src} className={`group min-h-0 overflow-hidden rounded-lg`}
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

// §23 Showrooms 2×2 — product showcase montage
function SlideShowrooms({ reduced }: { reduced: boolean | null }) {
  const rooms = [
    { label: "Romance",   cap: "Long-term memory",         src: "/assets/ai-character/new-cover.mp4"   },
    { label: "Astrology", cap: "Real-time memory updates", src: "/assets/ai-character/taobaibai-1.mp4" },
    { label: "Therapy",   cap: "Real-time analysis",       src: "/assets/ai-character/therapy-1.mp4"   },
    { label: "Character", cap: "Multi-agent coordination", src: "/assets/ai-character/pre-1.mp4"       },
  ];
  return (
    <section className={`relative flex h-full flex-col overflow-hidden px-8 pb-6 pt-8 md:px-12 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye>Product Showcase · 4 Showrooms · 1 Template</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.026em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.8vw, 2.1rem)" }}>
            Each room turns one model capability into a guided workflow.
          </h2>
        </Mask>
      </motion.div>
      <div className="relative z-10 mt-5 grid min-h-0 flex-1 grid-cols-2 gap-3" style={{ maxHeight: "72vh" }}>
        {rooms.map((r, i) => (
          <motion.div key={r.label} className={`relative overflow-hidden rounded-lg bg-[#0A0A0A]`}
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.18 + i * 0.1 }}>
            <video className="h-full w-full object-contain" playsInline muted autoPlay loop preload="none">
              <source src={r.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#FF6A00]">{r.label}</p>
              <p className="mt-1 font-sans text-[11px] text-white/[0.88]">{r.cap}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// §24 Showcase — full live romance prototype
function SlideShowcaseLive({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 flex-col overflow-hidden px-8 py-5 md:px-12 md:py-6 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <div className="relative z-10 shrink-0">
        <Eye>Product Showcase · Live Prototype · Romance</Eye>
        <h2 className={`text-balance mt-2 font-display font-light tracking-[-0.026em] ${HEAD}`}
          style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)" }}>
          The real, built-in-React showroom — running right here.
        </h2>
      </div>
      <div className="relative z-10 mt-4 flex min-h-0 flex-1 flex-col">
        <DeckPrototype src={PROTO.romanceFull} label="Romance showroom — full live prototype" />
      </div>
    </section>
  );
}

// §25 Additional Contribution — SaaS console refresh
function SlideBackend({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>Additional Contribution · B2B Console</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.028em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              Full refresh of the Qwen Character SaaS console.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-3 max-w-3xl ${BODY} text-[13.5px] text-white/[0.66]`}>
            An end-to-end update spanning API surfaces, Studio — Applications, Workflows, Knowledge Base, Characters — and the nested flows beneath: empty and error states, plus analytics views for invocation metrics and call volume.
          </motion.p>
        </div>
        <motion.div variants={UP} className="mt-6 grid grid-cols-3 gap-3">
          {[
            { src: "/assets/ai-character/updateddesign1.jpg", label: "Studio surfaces", tag: "Studio" },
            { src: "/assets/ai-character/updateddesign2.jpg", label: "Nested flows",    tag: "Flows" },
            { src: "/assets/ai-character/updatedesign3.jpg",  label: "Knowledge Base",  tag: "KB" },
          ].map(({ src, label, tag }, i) => (
            <motion.div key={src} className={`group overflow-hidden rounded-lg`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.3 + i * 0.09 }}>
              <div className="relative overflow-hidden bg-black/40">
                <img src={src} alt={label} loading="lazy"
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <div className={`flex items-center gap-2 border-t ${HAIR} px-3 py-2`}>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#FF6A00]">{tag}</span>
                <span className="font-sans text-[11px] text-white/[0.66]">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §26 Spark Design — adoption
function SlideSparkDesign({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Adoption · Spark Design</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.028em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            The showroom system became the published B2B design framework.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-4 max-w-2xl ${BODY} text-[14px] text-white/[0.66]`}>
          Components, interactions, and motion patterns built for the showrooms became the Spark Design templates used by external Agentscope partners — these decisions outlived the showroom releases.
        </motion.p>
        <motion.div variants={UP} className={`mt-6 overflow-hidden rounded-lg`}>
          <div className={`flex items-center justify-between gap-3 border-b ${HAIR} bg-white/[0.02] px-4 py-3 md:px-5`}>
            <div>
              <p className={`${EYE} text-white/[0.42]`}>Adoption</p>
              <p className={`mt-1.5 font-sans text-[12.5px] font-medium ${HEAD}`}>Spark Design templates — Agentscope</p>
            </div>
            <a href="https://sparkdesign.agentscope.io/#/templates" target="_blank" rel="noopener noreferrer"
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.55] underline decoration-white/[0.18] underline-offset-[5px] transition-colors hover:text-white">
              Open ↗
            </a>
          </div>
          <iframe title="Spark Design templates" src="https://sparkdesign.agentscope.io/#/templates" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[min(56vh,540px)] min-h-[320px] w-full border-0 bg-white" />
          <p className={`border-t ${HAIR} bg-white/[0.02] px-4 py-2 font-sans text-[10.5px] leading-relaxed text-white/40 md:px-5`}>
            If the frame is empty, the host blocks embedding — open in browser.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §27 Metrics — staged AI-style reveal
function DataStreamBg() {
  const lines = [
    { top: "8%",  width: "32%", dur: 5.4, delay: 0.0, opacity: 0.16 },
    { top: "19%", width: "26%", dur: 6.2, delay: 1.1, opacity: 0.12 },
    { top: "33%", width: "38%", dur: 4.8, delay: 0.4, opacity: 0.2  },
    { top: "47%", width: "22%", dur: 7.0, delay: 2.0, opacity: 0.09 },
    { top: "61%", width: "30%", dur: 5.6, delay: 0.8, opacity: 0.16 },
    { top: "74%", width: "28%", dur: 6.4, delay: 1.6, opacity: 0.1  },
    { top: "88%", width: "34%", dur: 5.0, delay: 0.2, opacity: 0.14 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {lines.map((l, i) => (
        <motion.div key={i} className="absolute h-px"
          style={{ top: l.top, width: l.width, left: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,106,0,${l.opacity}) 50%, transparent 100%)` }}
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
        <p className={`${EYE} ${highlight ? "text-[#FF6A00]" : "text-white/55"}`}>{label}</p>
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: E, delay: delay + 0.7 }}
          className="font-display font-light tabular-nums tracking-tight"
          style={{ fontSize: "clamp(1.2rem, 2.1vw, 1.7rem)",
            color: highlight ? "#FF6A00" : "rgba(255,255,255,0.55)",
            textShadow: highlight ? "0 0 18px rgba(255,106,0,0.22)" : "none" }}>
          {value}
        </motion.span>
      </div>
      <div className="relative mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: "0%" }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1.05, ease: E, delay: delay + 0.15 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: highlight
              ? "linear-gradient(90deg, #FF6A00 0%, #FF9A4D 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.34) 100%)",
            boxShadow: highlight ? "0 0 14px rgba(255,106,0,0.35)" : "none" }} />
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
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <DataStreamBg />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye>Impact · Shipped · Converted · Adopted</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.03em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)" }}>
            What shipped. What changed.
          </h2>
        </Mask>
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: E, delay: T_CHART }}
          className={`mt-7 rounded-lg bg-white/[0.02] px-5 py-5 md:px-7 md:py-6`}>
          <div className="flex items-baseline justify-between gap-6">
            <p className={`${EYE} text-white/55`}>Time to first value</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF6A00]/85">Observed in testing</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-x-10">
            <TimeBar label="Before · Documentation onboarding" value="60+ min"   pct={100} delay={T_CHART + 0.2} />
            <TimeBar label="After · Interactive showroom"      value="a few min" pct={10}  delay={T_CHART + 0.45} highlight />
          </div>
        </motion.div>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/[0.06] md:grid-cols-4">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.12;
            const isKey = s.label === "Model API call volume";
            return (
              <motion.div key={s.label} className="relative bg-[#08090A] px-6 py-6"
                initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <motion.div className="mb-3 h-[1.5px] bg-[#FF6A00]/65"
                  initial={{ width: 0 }} animate={{ width: "1.5rem" }}
                  transition={{ duration: 0.55, ease: E, delay: cardDelay + 0.15 }} />
                <p className="relative font-display font-light leading-none text-[#FF6A00]"
                  style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.9rem)" }}>
                  <motion.span
                    animate={isKey
                      ? { textShadow: ["0 0 0px rgba(255,106,0,0)", "0 0 26px rgba(255,106,0,0.55)", "0 0 10px rgba(255,106,0,0.22)"] }
                      : { textShadow: ["0 0 0px rgba(255,106,0,0)", "0 0 14px rgba(255,106,0,0.3)",  "0 0 0px rgba(255,106,0,0)"] }}
                    transition={{ duration: 2.2, ease: "easeOut", delay: cardDelay + 0.55, times: [0, 0.55, 1],
                      repeat: isKey ? Infinity : 0, repeatDelay: isKey ? 2.4 : 0 }}>
                    <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} startDelay={cardDelay * 1000 + 350} duration={1100} />
                  </motion.span>
                </p>
                <p className="mt-3 font-sans text-[12px] font-medium text-white/[0.9]">{s.label}</p>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-white/[0.55]">{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// §28 Metrics Method
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
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>How the numbers are defined</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.028em] ${HEAD}`}
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            Honest about the baselines.
          </h2>
        </Mask>
        <motion.div variants={UP} className={`mt-7 border-t ${HAIR}`}>
          <div className={`hidden border-b ${HAIR} px-1 py-2.5 md:grid md:grid-cols-[10rem_1fr_1fr_1fr] md:gap-x-6`}>
            {["Metric", "Baseline", "Result", "Note"].map(h => (
              <p key={h} className={`${EYE} text-white/[0.42]`}>{h}</p>
            ))}
          </div>
          <div className="divide-y divide-white/[0.08]">
            {rows.map((row, i) => (
              <motion.div key={row.metric}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: E, delay: 0.24 + i * 0.08 }}
                className="grid grid-cols-1 gap-2 px-1 py-4 md:grid-cols-[10rem_1fr_1fr_1fr] md:items-start md:gap-x-6">
                <div>
                  <p className="font-display text-[1.5rem] font-light tracking-tight text-[#FF6A00]">{row.metric}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/[0.5]">{row.label}</p>
                </div>
                <p className="font-sans text-[12.5px] leading-snug text-white/[0.72]">{row.baseline}</p>
                <p className="font-sans text-[12.5px] leading-snug text-white/[0.88]">{row.result}</p>
                <p className="font-sans text-[12px] leading-snug text-white/[0.55]">{row.note}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §29 Principles — two columns, hairline-divided
function SlidePrinciples({ reduced }: { reduced: boolean | null }) {
  const principles = [
    { n: "01", t: "Design is the translation layer.",
      body: "In AI products, the hardest problem isn’t the model — it’s helping people imagine what to build." },
    { n: "02", t: "The best demo is future-self proof.",
      body: "Show a working version of their product, then let them clone it." },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Takeaway · Principles</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.028em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            AI products don&apos;t sell themselves through capability lists.
          </h2>
        </Mask>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-2`}>
          {principles.map((p, i) => (
            <motion.div key={p.n}
              className={`py-8 md:px-8 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: E, delay: 0.24 + i * 0.12 }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF6A00]">Principle {p.n}</p>
              <p className={`mt-4 font-display text-[1.2rem] font-light leading-[1.25] tracking-[-0.02em] ${HEAD} md:text-[1.34rem]`}>{p.t}</p>
              <p className="mt-4 font-sans text-[14.5px] leading-[1.7] text-white/[0.64]">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §30 Takeaways — what I learned (2×2 hairline grid)
function SlideTakeaways({ reduced }: { reduced: boolean | null }) {
  const items = [
    { label: "Memory transparency",      note: "The constellation file makes memory readable — not a silent black box." },
    { label: "Analysis visibility",      note: "The therapy rail shows what the model understood — not just what it said." },
    { label: "Developer inspectability", note: "YAML + prompt exposed in the code drawer — inspect before you build." },
    { label: "Emotional boundary",       note: "The therapy room is an analysis demo — no clinical claims implied." },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>What I learned</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.028em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            Visible cognition over capability lists.
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-5 max-w-2xl ${BODY} text-[14px] text-white/[0.68]`}>
          AI products need proof moments, visible cognition, and inspectable systems. The designer&apos;s job is to translate model behavior into experiences people can feel, trust, and build from.
        </motion.p>
        <motion.div variants={UP} className={`mt-8 grid border-t ${HAIR} sm:grid-cols-2`}>
          {items.map((it, i) => (
            <motion.div key={it.label}
              className={`border-white/[0.08] py-5 sm:px-6 ${i > 0 ? "border-t" : ""} ${i === 1 ? "sm:border-l sm:border-t-0" : ""} ${i === 3 ? "sm:border-l" : ""}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}>
              <p className={`font-mono text-[10px] font-medium uppercase tracking-[0.15em] ${HEAD}`}>{it.label}</p>
              <p className="mt-2 font-sans text-[13.5px] leading-[1.62] text-white/[0.62]">{it.note}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §31 Closing
function SlideClosing({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col items-start justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-2xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12 bg-[#FF6A00]" />
        <Mask delay={0.08}>
          <h2 className={`font-display font-light tracking-[-0.04em] ${HEAD}`}
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
            Yuan Fang
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-3 ${EYE} text-white/45`}>
          Product Designer · Pratt Institute
        </motion.p>
        <motion.p variants={UP} className={`mt-8 max-w-md ${BODY} text-[15px] text-white/[0.7]`}>
          Design is the translation layer. The hardest problem in AI products isn&apos;t model quality — it&apos;s helping customers imagine what they can build. The strongest demo is future-self proof.
        </motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-wrap items-center gap-5">
          <a href="https://tongyi.aliyun.com/character" target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-[6px] bg-[#FF6A00] px-7 py-3.5 font-sans text-[13px] font-medium text-[#0A0A0A] transition-all duration-150 hover:bg-white">
            View live showrooms
            <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/ai-character"
            className={`${EYE} text-white/45 underline underline-offset-4 decoration-white/[0.18] transition-colors hover:text-white`}>
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
    case "cover":            return <SlideCover reduced={reduced} />;
    case "overview":         return <SlideOverview reduced={reduced} />;
    case "problem":          return <SlideProblem reduced={reduced} />;
    case "hmw":              return <SlideHmw reduced={reduced} />;
    case "howmightwe":       return <SlideHmwStatement reduced={reduced} />;
    case "d1-title":         return <TitleSlide reduced={reduced} chapter="Decision 01"
                                      title="Bet on experience over documentation — taken to its limit."
                                      body="The showroom strategy came from our PM — a familiar consumer-product play. My leverage was pushing it all the way: a doc you can only read proves nothing; the felt experience is the product. On a 10-person team I owned every feature decision across all 4 rooms — companionship, psychotherapy, character cloning, IP licensing."
                                      kicker="Users don&apos;t believe descriptions — the first message had to prove the capability." />;
    case "d1-showrooms":     return <SlideD1Showrooms reduced={reduced} />;
    case "d2-title":         return <SlideD2Title reduced={reduced} />;
    case "d2-map":           return <SlideD2Map reduced={reduced} />;
    case "heartbeat":        return <SlideHeartbeat reduced={reduced} />;
    case "heartbeat-logic":  return <SlideHeartbeatLogic reduced={reduced} />;
    case "story":            return <SlideStoryUnlock reduced={reduced} />;
    case "story-logic":      return <SlideStoryUnlockLogic reduced={reduced} />;
    case "moments":          return <SlideMoments reduced={reduced} />;
    case "moments-logic":    return <SlideMomentsLogic reduced={reduced} />;
    case "altuniv":          return <SlideAltUniv reduced={reduced} />;
    case "altuniv-logic":    return <SlideAltUnivLogic reduced={reduced} />;
    case "astro-profile":    return <SlideAstroProfile reduced={reduced} />;
    case "therapy-analysis": return <SlideTherapyAnalysis reduced={reduced} />;
    case "d3-title":         return <SlideD3Title reduced={reduced} />;
    case "inspire-continue": return <SlideInspireContinue reduced={reduced} />;
    case "code-drawer":      return <SlideCodeDrawer reduced={reduced} />;
    case "exploration":      return <SlideExploration reduced={reduced} />;
    case "how-i-worked":     return <SlideHowIWorked reduced={reduced} />;
    case "process":          return <SlideProcess reduced={reduced} />;
    case "showrooms":        return <SlideShowrooms reduced={reduced} />;
    case "showcase-live":    return <SlideShowcaseLive reduced={reduced} />;
    case "backend":          return <SlideBackend reduced={reduced} />;
    case "spark-design":     return <SlideSparkDesign reduced={reduced} />;
    case "metrics":          return <SlideMetrics />;
    case "metrics-method":   return <SlideMetricsMethod />;
    case "principles":       return <SlidePrinciples reduced={reduced} />;
    case "takeaways":        return <SlideTakeaways reduced={reduced} />;
    case "closing":          return <SlideClosing reduced={reduced} />;
    default:                 return null;
  }
}

// ─── Chapter pill nav ─────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function DeckSlideScrubber({
  idx, total, onChange,
}: { idx: number; total: number; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.1]" aria-hidden>
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#FF6A00]" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" min={0} max={max} step={1} value={idx}
        aria-label="Slide position" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ChapterPills({ current, onJump }: { current: string; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-300 ease-out ${
              on
                ? "bg-[#FF6A00] px-3 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-[#0A0A0A]"
                : "h-1.5 w-1.5 bg-white/[0.32] hover:bg-white/60"
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
  enter:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  // Exit fades only (no transform) — sliding a slide that holds a loaded prototype
  // iframe is what stutters; a plain fade composites far cheaper.
  exit:   { opacity: 0, x: 0 },
};

// ─── Rotate-to-landscape gate (mobile portrait) ──────────────────────────────
function RotateOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex h-screen flex-col items-center justify-center gap-7 bg-[#08090A] px-10 text-center">
      <svg width="78" height="78" viewBox="0 0 78 78" fill="none" aria-hidden>
        <g transform="rotate(-20 39 39)">
          <rect x="28" y="17" width="22" height="44" rx="5" stroke="#FF6A00" strokeWidth="2.5" />
          <line x1="35" y1="55" x2="43" y2="55" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d="M58 21 A 28 28 0 0 1 64 46" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 46 L59 44.5 M64 46 L65.7 41" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <p className="font-display text-[1.5rem] font-light tracking-[-0.02em] text-[#F7F8F8]">Rotate to landscape</p>
        <p className="mx-auto mt-2.5 max-w-xs font-sans text-[13.5px] leading-relaxed text-white/55">
          This presentation is built for a wide screen — turn your phone sideways for the best view.
        </p>
      </div>
      <button type="button" onClick={onDismiss}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80">
        View anyway →
      </button>
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClient() {
  const reduced = useReducedMotion();
  // Track index + travel direction together so AnimatePresence can push slides.
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const total    = SLIDES.length;
  const slide    = SLIDES[idx];
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
    // Nav keys forwarded out of focused prototype iframes arrive as this event.
    const nav = (e: Event) => paginate((e as CustomEvent<number>).detail);
    window.addEventListener("keydown", h);
    window.addEventListener("deck-nav", nav as EventListener);
    return () => {
      window.removeEventListener("keydown", h);
      window.removeEventListener("deck-nav", nav as EventListener);
    };
  }, [next, prev, paginate]);

  // Mobile portrait → show a rotate-to-landscape gate (the deck is wide-format).
  const [portrait, setPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 820px) and (pointer: coarse)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const navChrome = "text-white/[0.82] hover:text-white";
  const navMeta   = "text-white/[0.5]";

  if (portrait && !dismissed) return <RotateOverlay onDismiss={() => setDismissed(true)} />;

  return (
    <div className="font-alibaba relative h-screen select-none overflow-hidden bg-[#08090A]">

      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full bg-[#FF6A00]"
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090A]/95 px-6 md:px-10">
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character"
            className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-150 ${navChrome}`}>
            ← Case Study
          </Link>
          <span className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] md:inline ${navMeta}`}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character/deck-present-zh"
            className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-150 md:inline ${navChrome}`}>
            中文
          </Link>
          <span className={`hidden font-mono text-[10px] md:inline ${navMeta}`}>~{minsLeft} min left</span>
          <span className={`font-mono text-[10px] tabular-nums ${navMeta}`}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide area — overlapping directional transition. Each slide is
          absolutely positioned to fill the gap between the 14-high header and
          footer, so successive slides can cross-fade/push without layout shift. */}
      <main className="relative h-full min-h-0 select-text overflow-hidden">
        <AnimatePresence custom={dir} initial={false} mode="wait">
          <motion.div key={slide.id} custom={dir}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : "enter"}
            animate={reduced ? undefined : "center"}
            exit={reduced ? undefined : "exit"}
            transition={{ duration: 0.3, ease: E }}
            className="absolute inset-x-0 bottom-14 top-14 will-change-[opacity,transform]">
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
      <footer className="absolute inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#08090A]/95">
        <div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            className={`flex shrink-0 items-center gap-1.5 rounded-[6px] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-150 disabled:opacity-20 md:px-3 ${navChrome}`}>
            <Kbd>←</Kbd> Prev
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-2.5">
            <DeckSlideScrubber idx={idx} total={total} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} onJump={jump} />
            </div>
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1}
            className={`flex shrink-0 items-center gap-1.5 rounded-[6px] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-150 disabled:opacity-20 md:px-3 ${navChrome}`}>
            Next <Kbd>→</Kbd>
          </button>
        </div>
      </footer>
    </div>
  );
}
