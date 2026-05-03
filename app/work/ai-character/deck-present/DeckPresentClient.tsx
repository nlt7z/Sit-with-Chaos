"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// ─── Easings & variants ───────────────────────────────────────────────────────
const E     = [0.22, 1, 0.36, 1]  as const;
const EHERO = [0.12, 1, 0.28, 1]  as const;
const EMSK  = [0.76, 0, 0.24, 1]  as const;

const STG   = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
const UP    = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0,   transition: { duration: 0.82, ease: E     } } };
const UPHERO= { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0,   transition: { duration: 1.0,  ease: EHERO } } };
const FADE  = { hidden: { opacity: 0 },        show: { opacity: 1,         transition: { duration: 0.55, ease: E     } } };
const WVAR  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0,   transition: { duration: 0.48, ease: E     } } };

// ─── Slide registry ───────────────────────────────────────────────────────────
const SLIDES = [
  { id: "cover",     chapter: "Opening",      dark: true  },
  { id: "hook",      chapter: "Opening",      dark: false },
  { id: "problem",   chapter: "Problem",      dark: true  },
  { id: "quote",     chapter: "Problem",      dark: true  },
  { id: "hmw",       chapter: "Strategy",     dark: false },
  { id: "strategy",  chapter: "Strategy",     dark: false },
  { id: "ai",        chapter: "Process",      dark: false },
  { id: "heartbeat", chapter: "Interactions", dark: false },
  { id: "story",     chapter: "Interactions", dark: false },
  { id: "exploop",   chapter: "Interactions", dark: true  },
  { id: "showrooms", chapter: "Showrooms",    dark: true  },
  { id: "craft",     chapter: "Craft",        dark: false },
  { id: "reflect",   chapter: "Reflection",   dark: false },
  { id: "metrics",   chapter: "Impact",       dark: true  },
  { id: "closing",   chapter: "Closing",      dark: false },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];


// ─── Spotlight (hero bg) ──────────────────────────────────────────────────────
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
    <div
      className="pointer-events-none absolute inset-0 transition-[background] duration-200"
      style={{ background: `radial-gradient(900px circle at ${pos.x} ${pos.y}, rgba(200,255,71,0.06), transparent 72%)` }}
    />
  );
}

// ─── Mask text reveal ─────────────────────────────────────────────────────────
// Wraps text in overflow-hidden and slides it up. Use delay to stagger manually.
function Mask({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "106%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.88, ease: EMSK, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Word reveal (for quote slides) ───────────────────────────────────────────
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.span
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.042, delayChildren: 0.1 } } }}
      initial="hidden" animate="show"
    >
      {text.split(/(\s+)/).map((chunk, i) =>
        /^\s+$/.test(chunk)
          ? <span key={i}>&nbsp;</span>
          : <motion.span key={i} variants={WVAR} className="inline-block">{chunk}</motion.span>
      )}
    </motion.span>
  );
}

// ─── Count-up (triggers on mount, with delay) ────────────────────────────────
function CountUp({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame: number;
    const dur   = 900;
    const start = performance.now();
    const tick  = (ts: number) => {
      const t = Math.min((ts - start) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const tid = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, 320);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame); };
  }, [to]);
  return <>{prefix}{n}{suffix}</>;
}

// ─── Shared layout helpers ────────────────────────────────────────────────────
const EYE = "font-mono text-[10px] uppercase tracking-[0.26em]";
const BODY = "font-sans leading-[1.76]";

function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <p className={`${EYE} ${dark ? "text-white/70" : "text-[#9A9A9A]"}`}>{children}</p>;
}

// ─── Auto-playing video ───────────────────────────────────────────────────────
function Vid({ src, caption, className = "", maxH = "max-h-[44vh]" }: { src: string; caption?: string; className?: string; maxH?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    void el.play().catch(() => {});
    return () => { el.pause(); };
  }, [src]);
  return (
    <figure className={`group overflow-hidden rounded-xl ring-1 ring-black/[0.07] ${className}`}>
      <div className="overflow-hidden rounded-xl bg-black">
        <video
          ref={ref} muted playsInline loop preload="metadata" controls
          className={`w-full object-contain transition-transform duration-700 group-hover:scale-[1.02] ${maxH}`}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      {caption && <figcaption className={`border-t border-black/[0.05] px-4 py-2.5 ${EYE} text-[#888] tracking-[0.08em]`}>{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE BODIES
// ─────────────────────────────────────────────────────────────────────────────

// §1 Cover
function SlideCover() {
  const ref = useRef<HTMLElement>(null);
  const meta = [
    { k: "Company",  v: "Alibaba Cloud · TONGYI Xingchen" },
    { k: "Role",     v: "UX Designer Intern — E2E, research to code" },
    { k: "Duration", v: "4 weeks · July–August 2025" },
    { k: "Outcome",  v: "Shipped · +200% model calls · B2B adopted" },
  ];
  return (
    <section ref={ref} className="relative flex h-full items-center overflow-hidden bg-[#050507]">
      <Spotlight containerRef={ref} />
      {/* ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-[#C8FF47]/[0.025] to-transparent" />
      {/* character image right bleed */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] select-none lg:block">
        <img src="/assets/ai-character/eternal-vow-character.png" alt="" aria-hidden
          className="h-full w-full object-cover object-top"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.75) 55%)", opacity: 0.6 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #050507 0%, #050507bb 20%, transparent 55%)" }} />
      </div>

      <motion.div className="relative z-10 max-w-3xl px-12 py-20 md:px-20" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}>
          <Eye dark>Alibaba Cloud · Tongyi Xingchen · 2025</Eye>
        </motion.div>

        <div className="mt-8 space-y-1">
          {["Designing the AI", "That Feels Alive."].map((line, i) => (
            <Mask key={i} delay={0.1 + i * 0.12}>
              <h1 className="font-display font-extralight leading-[1.02] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(3rem, 6.5vw, 5.8rem)" }}>
                {line}
              </h1>
            </Mask>
          ))}
        </div>

        <motion.p variants={UP} className={`mt-8 max-w-md ${BODY} text-[15px] text-white/75`}>
          How I turned a model capability into an emotionally immersive product experience
          in 4 weeks. After the showrooms went live, model call volume rose 200%.
        </motion.p>

        <motion.dl variants={UP} className="mt-10 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-white/[0.06] pt-8">
          {meta.map(({ k, v }) => (
            <div key={k}>
              <dt className={`${EYE} text-white/68`}>{k}</dt>
              <dd className="mt-1.5 font-sans text-[13px] text-white/82">{v}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}

// §2 Opening hook
function SlideHook() {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <div className="max-w-3xl">
        <motion.div variants={STG} initial="hidden" animate="show">
          <motion.div variants={FADE}><Eye>The starting point</Eye></motion.div>
        </motion.div>
        <Mask delay={0.12} className="mt-7">
          <h2 className="font-display font-light leading-[1.06] tracking-[-0.036em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)" }}>
            The model was good.
            <br />Nobody knew it.
          </h2>
        </Mask>
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: E, delay: 0.38 }}
          className="mt-10 max-w-xl space-y-4"
        >
          <p className={`${BODY} text-[16px] text-[#6A6A6A]`}>
            Alibaba Cloud&apos;s AI character product had long-term memory, emotional depth,
            and genuine personalization. The interface showed none of it.
          </p>
          <p className={`${BODY} text-[16px] text-[#6A6A6A]`}>
            Trial users churned before they felt the difference. Enterprise prospects
            depended on imagination to see the value.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// §3 Problem
function SlideProblem() {
  return (
    <section className="flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <motion.div className="grid w-full max-w-5xl gap-10 md:grid-cols-2" variants={STG} initial="hidden" animate="show">
        <div>
          <motion.div variants={FADE}><Eye dark>The Problem</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-6 font-display font-light leading-[1.08] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.8rem, 3.6vw, 3rem)" }}>
              High capability.<br />Low conversion.<br />The product was invisible.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-7 ${BODY} text-[15px] text-white/75`}>
            The model could remember users across sessions, evolve relationships, and personalize
            at depth — but none of this was visible. Trial users churned before they felt the difference.
          </motion.p>
        </div>

        <motion.div variants={UP} className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-6">
            <p className={`${EYE} text-[#C8FF47] mb-3`}>The scenario</p>
            <p className="font-sans text-[14px] leading-[1.74] text-white/75">
              A user opens the romance app for the third time this week.
              The character greets them like a stranger. The model remembered
              the user perfectly — their name, last conversation, the mood they were in.
              It just had no way to surface any of it.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-6">
            <p className={`${EYE} text-[#C8FF47] mb-3`}>Research · 6 products · 40+ reviews</p>
            <p className="font-sans text-[14px] leading-[1.74] text-white/75">
              Users hit a scripted ceiling — not because responses were bad, but because
              the interface felt like texting a chatbot. The unmet need wasn&apos;t output quality.
              It was <em className="not-italic text-white/80">immersion</em>.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §4 Insight quote
function SlideQuote() {
  return (
    <section className="flex h-full flex-col items-start justify-center bg-[#050507] px-12 md:px-20">
      <motion.div initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: E, delay: 0.06 }}
        className="mb-10 h-[2px] w-14 bg-[#C8FF47]" />
      <blockquote className="max-w-3xl font-display font-light leading-[1.38] tracking-[-0.022em] text-white"
        style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)" }}>
        <WordReveal text="Users don't churn because the model is weak. They churn because they never feel exclusively known." />
      </blockquote>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }}
        className={`mt-10 ${EYE} text-white/68`}>
        Synthesized from 40+ public reviews across 6 products · 2025
      </motion.p>
    </section>
  );
}

// §5 HMW
function SlideHMW() {
  return (
    <section className="flex h-full flex-col items-start justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-3xl">
        <motion.div variants={FADE}><Eye>How Might We</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-7 font-display font-light leading-[1.1] tracking-[-0.03em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.4rem)" }}>
            Make model capabilities visible, testable, and trustworthy
            — within the first three minutes?
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 max-w-xl">
          <p className={`${BODY} text-[15px] text-[#6A6A6A]`}>
            Instead of explaining capabilities, I let customers see a working version of their
            own future product. Each showroom was a market-specific prototype — built to prove,
            not to present.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §6 Strategy
function SlideStrategy() {
  const cards = [
    { n: "01", title: "Market-back character definition", body: "Companionship, therapy, persona replication, licensed IP — each a distinct B2B entry point with different proof requirements." },
    { n: "02", title: "Capability-to-scenario mapping",   body: "Each showroom surfaces one model strength through direct experience. Memory callbacks in romance. Live updates in astrology. Visible reasoning in therapy." },
    { n: "03", title: "Reusable template for customers",  body: "Showrooms designed to be cloned, configured, and shipped — not one-time pitch artifacts. Every decision was made with reusability as a hard constraint." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye>Product Strategy</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)" }}>
            From explaining the model to showing their future product.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div key={c.n}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: E, delay: 0.22 + i * 0.11 }}
              className="rounded-2xl bg-white px-6 py-7 ring-1 ring-black/[0.06] transition-shadow duration-500 hover:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.1)]"
            >
              <span className={`${EYE} text-[#C8FF47]`}>{c.n}</span>
              <p className="mt-4 font-display text-[1.0rem] font-light leading-snug tracking-tight text-[#0A0A0A]">{c.title}</p>
              <p className="mt-3 font-sans text-[13px] leading-[1.72] text-[#6A6A6A]">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §7 AI in process
function SlideAI() {
  const steps = [
    { n: "01", label: "Problem space",      body: "What does 'immersion' look like technically? I wrote a one-page constraint doc before touching Figma." },
    { n: "02", label: "AI generation prompt", body: "\"Generate character visuals inspired by Love and Deepspace — warm ambient lighting, subtle motion, emotional presence.\" Tools: Wan, Kling, Dreamnia, SeeDance." },
    { n: "03", label: "Output review",      body: "40+ generated concepts → 3 character directions. Evaluated on: does this feel like a person exists here, or just an asset?" },
    { n: "04", label: "My judgment",        body: "Selected AI looping video over 3D avatar. Lighter, crash-free, emotionally present. Small motions (blink, nod) felt more alive than complex rigged animation." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-white px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye>AI in my process</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            How AI tools shaped decisions — not just outputs.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 grid gap-0 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}
              className="border-l border-black/[0.07] px-5 py-1 first:border-l-0 first:pl-0"
            >
              <p className={`${EYE} text-[#C8FF47]`}>{s.n}</p>
              <p className="mt-3 font-sans text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#0A0A0A]">{s.label}</p>
              <p className="mt-2 font-sans text-[13px] leading-[1.72] text-[#6A6A6A]">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §8 Heartbeat Power + decision frame
function SlideHeartbeat() {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div className="grid w-full max-w-5xl gap-10 md:grid-cols-2" variants={STG} initial="hidden" animate="show">
        <div className="flex flex-col">
          <motion.div variants={FADE}><Eye>Interaction 01 · Romance Room</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
              Heartbeat Power:<br />The inner-monologue reveal.
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-5 ${BODY} text-[14px] text-[#6A6A6A]`}>
            A tap-to-reveal flip card surfaces the character&apos;s inner monologue —
            creating emotional privilege without breaking the surface illusion.
          </motion.p>
          {/* A/B */}
          <motion.div variants={UP} className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#EBEBEB] px-4 py-4 opacity-55">
              <span className={`${EYE} text-[#999]`}>Option A</span>
              <p className="mt-2 font-sans text-[12px] leading-snug text-[#6A6A6A]">Tooltip on hover — passive, user receives</p>
            </div>
            <div className="rounded-xl bg-white px-4 py-4 ring-1 ring-[#C8FF47]/60">
              <span className={`${EYE} text-[#C8FF47]`}>Option B ✓</span>
              <p className="mt-2 font-sans text-[12px] leading-snug text-[#0A0A0A]">Flip card — user discovers. Emotional privilege.</p>
            </div>
          </motion.div>
          <motion.p variants={UP} className="mt-4 border-l-2 border-[#C8FF47] pl-4 font-sans text-[12px] italic leading-relaxed text-[#8A8A8A]">
            Too much exposure breaks mystery. Too little loses depth.
            The flip card was the only format that held both simultaneously.
          </motion.p>
        </div>
        <motion.div variants={FADE}>
          <Vid src="/assets/ai-character/interactions/heartbeat/heartbeat-1.mp4" caption="Heartbeat — inner-monologue reveal on tap" maxH="max-h-[52vh]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §9 Story Unlock + Moments
function SlideStory() {
  const items = [
    {
      label: "Interaction 02 · Story Unlock",
      title: "Backstory through conversation depth.",
      body: "Milestones unlock as depth accumulates — one knowledge base revealing progressively. Novelty without new content production per user.",
      src: "/assets/ai-character/interactions/story%20unlocked/story%20unlocked-1.mp4",
      cap: "Story unlock — milestone progression in conversation",
    },
    {
      label: "Interaction 03 · Moments Feed",
      title: "The character lives between conversations.",
      body: "Instagram-style posts generated from relationship history. Reduces the dead interval from a break to a continuation. The biggest churn happened off-session.",
      src: "/assets/ai-character/interactions/moments/moments-1.mp4",
      cap: "Moments — posts generated from memory history",
    },
  ];
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div className="grid w-full max-w-5xl gap-8 md:grid-cols-2" variants={STG} initial="hidden" animate="show">
        {items.map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: E, delay: 0.1 + i * 0.14 }}
            className="flex flex-col gap-4"
          >
            <Eye>{item.label}</Eye>
            <h3 className="font-display text-[1.1rem] font-light leading-snug tracking-tight text-[#0A0A0A]">{item.title}</h3>
            <p className="font-sans text-[13px] leading-[1.72] text-[#6A6A6A]">{item.body}</p>
            <Vid src={item.src} caption={item.cap} maxH="max-h-[30vh]" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// §10 Experience loop
function SlideExpLoop() {
  return (
    <section className="flex h-full items-center overflow-hidden bg-[#050507] px-12 md:px-20">
      <motion.div className="grid w-full max-w-5xl gap-10 md:grid-cols-[40%_1fr]" variants={STG} initial="hidden" animate="show">
        <div className="flex flex-col justify-center">
          <motion.div variants={FADE}><Eye dark>Experience Loop · First 3 Minutes</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light leading-[1.1] tracking-[-0.028em] text-white"
              style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
              Making the model legible before users know to look.
            </h2>
          </Mask>
          <motion.div variants={UP} className="mt-7 space-y-4">
            {[
              { n: "01", t: "Inspiration Response", b: "Three context-grounded reply options — action, emotion, expression. Feels like gameplay, not messaging." },
              { n: "02", t: "Continue Response",    b: "One tap extends the active storyline from context — revealing long-context reasoning without any prompting." },
            ].map((f) => (
              <div key={f.n} className="border-l-2 border-[#C8FF47] pl-4">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-white">{f.t}</p>
                <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-white/72">{f.b}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <motion.div variants={FADE}>
          <Vid src="/assets/ai-character/conversation engine.mp4" caption="Option generation and narrative continuation" maxH="max-h-[55vh]" className="ring-white/[0.07]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §11 Showrooms overview (2×2 grid)
function SlideShowrooms() {
  const rooms = [
    { label: "Romance",    cap: "Long-term memory",         src: "/assets/ai-character/new-cover.mp4",   color: "#C8FF47", fg: "#0A0A0A" },
    { label: "Astrology",  cap: "Real-time memory updates", src: "/assets/ai-character/taobaibai-1.mp4", color: "#7B6CF4", fg: "#fff"    },
    { label: "Therapy",    cap: "Real-time analysis",       src: "/assets/ai-character/therapy-1.mp4",   color: "#4ABFBF", fg: "#0A0A0A" },
    { label: "Multi-char", cap: "Multi-agent coordination", src: "/assets/ai-character/pre-1.mp4",       color: "#FF9B6A", fg: "#0A0A0A" },
  ];
  return (
    <section className="flex h-full flex-col bg-[#050507] px-8 pb-8 pt-10 md:px-14">
      <motion.div variants={STG} initial="hidden" animate="show">
        <div className="flex items-end justify-between">
          <div>
            <motion.div variants={FADE}><Eye dark>UX Strategy · One Capability = One Proof Moment</Eye></motion.div>
            <Mask delay={0.08}>
              <h2 className="mt-3 font-display font-light tracking-[-0.026em] text-white"
                style={{ fontSize: "clamp(1.3rem, 2.8vw, 2.1rem)" }}>
                Four showrooms. Each proving a distinct model capability.
              </h2>
            </Mask>
          </div>
        </div>
      </motion.div>
      <div className="mt-5 grid flex-1 grid-cols-2 gap-3" style={{ maxHeight: "72vh" }}>
        {rooms.map((r, i) => (
          <motion.div key={r.label}
            className="relative overflow-hidden rounded-2xl bg-[#0A0A0A]"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.18 + i * 0.1 }}
          >
            <video className="h-full w-full object-contain" playsInline muted autoPlay loop preload="none">
              <source src={r.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="rounded-md px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{ background: r.color, color: r.fg }}>{r.label}</span>
              <p className="mt-1.5 font-sans text-[11px] text-white/70">{r.cap}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// §12 Craft + Developer tools
function SlideCraft() {
  return (
    <section className="flex h-full items-center bg-[#F7F5F0] px-12 md:px-20">
      <motion.div className="grid w-full max-w-5xl gap-10 md:grid-cols-2" variants={STG} initial="hidden" animate="show">
        <div>
          <motion.div variants={FADE}><Eye>Design Craft · B2B Tools</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-display font-light tracking-[-0.026em] text-[#0A0A0A]"
              style={{ fontSize: "clamp(1.4rem, 2.6vw, 2rem)" }}>
              Turned demos into templates.<br />Shifted &ldquo;Can it?&rdquo; to &ldquo;How fast?&rdquo;
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-5 ${BODY} text-[14px] text-[#6A6A6A]`}>
            View Source, One-Click Clone, and live config panels let enterprise clients
            inspect prompts and adapt them immediately — no sales engineering required.
            60% faster design-to-deploy via production Framer Motion code handoff.
          </motion.p>
          <motion.div variants={UP} className="mt-7">
            <Eye>Visual Identity · AI Generation</Eye>
            <p className={`mt-3 ${BODY} text-[14px] text-[#6A6A6A]`}>
              72 hours, 40+ generated concepts, tools Wan · Kling · Dreamnia · SeeDance.
              The 3D avatar crashed mid-interaction — replaced it with an AI-looping video.
              Small motions felt more alive than complex rigged animation.
            </p>
          </motion.div>
        </div>
        <motion.div variants={UP} className="grid grid-cols-2 gap-3">
          {[
            { src: "/assets/ai-character/developer-tool-source.png", label: "View Source" },
            { src: "/assets/ai-character/developer-tool-clone.png",  label: "One-Click Clone" },
            { src: "/assets/ai-character/developer-tool-config.png", label: "Live Config" },
            { src: "/assets/ai-character/innovation.jpg",            label: "AI-Generated Visual" },
          ].map(({ src, label }) => (
            <div key={src} className="group overflow-hidden rounded-xl ring-1 ring-black/[0.07]">
              <img src={src} alt={label} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §13 Reflection
function SlideReflect() {
  const items = [
    { label: "What I'd question earlier",    body: "I'd have validated the 3D avatar assumption in week 1, not discovered its flaw in week 3. The crash that forced the pivot to AI video was luck — not foresight. I got a better answer by accident." },
    { label: "What surprised me",             body: "The romance showroom's visual identity ended up driving the entire project's tone. Character direction wasn't just aesthetic — it was product strategy. I underestimated that connection going in." },
    { label: "What I'd push harder on",      body: "The memory-callback mechanic was the emotional core of the whole system. I'd have stress-tested it with real users in week 1, not week 3. Assumption-validation before craft." },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-white px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-4xl">
        <motion.div variants={FADE}><Eye>Reflection · If I had more time</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 font-display font-light tracking-[-0.028em] text-[#0A0A0A]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            Not humility. Genuine metacognition.
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-0 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: E, delay: 0.22 + i * 0.12 }}
              className="border-l border-black/[0.07] px-5 py-1 first:border-l-0 first:pl-0"
            >
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9A9A9A]">{item.label}</p>
              <p className="mt-3 font-sans text-[13.5px] leading-[1.76] text-[#0A0A0A]">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §14 Metrics
function SlideMetrics() {
  const stats = [
    { to: 4,   suffix: "",   prefix: "",  label: "Showrooms shipped",      detail: "Each proving a distinct capability" },
    { to: 200, suffix: "%",  prefix: "+", label: "Model call volume",       detail: "After showrooms went live" },
    { to: 87,  suffix: "%",  prefix: "",  label: "Shorter trial path",      detail: "One-click clone & live config" },
    { to: 60,  suffix: "%",  prefix: "",  label: "Faster design-to-deploy", detail: "Production code handoff" },
  ];
  return (
    <section className="flex h-full flex-col justify-center bg-[#050507] px-12 md:px-20">
      <motion.div variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye dark>Outcome · Shipped in 4 weeks</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 font-display font-light tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.8rem)" }}>
            What shipped. What changed.
          </h2>
        </Mask>
      </motion.div>
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.04] md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="bg-[#050507] px-7 py-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.55, ease: E, delay: 0.18 + i * 0.11 }}>
            <div className="mb-3 h-[1.5px] w-6 bg-[#C8FF47]/55" />
            <p className="font-display font-light leading-none text-[#C8FF47]"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)" }}>
              <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} />
            </p>
            <p className="mt-4 font-sans text-[12px] font-medium text-white">{s.label}</p>
            <p className="mt-1 font-sans text-[11px] leading-relaxed text-white/68">{s.detail}</p>
          </motion.div>
        ))}
      </div>
      <motion.p variants={UP} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: E, delay: 0.75 }}
        className={`mt-8 max-w-xl ${BODY} text-[14px] text-white/78`}>
        The B2B framework was adopted into Spark Design templates, turning the showroom pattern
        into a reusable foundation across enterprise verticals. The intern project became the standard.
      </motion.p>
    </section>
  );
}

// §15 Closing
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
          Product Designer · UW HCDE · Pratt Institute
        </motion.p>
        <motion.p variants={UP} className={`mt-8 max-w-md ${BODY} text-[15px] text-[#6A6A6A]`}>
          Design is the translation layer. The hardest problem in AI products isn&apos;t model quality
          — it&apos;s helping customers imagine what they can build. The strongest demo is
          future-self proof.
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
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":     return <SlideCover />;
    case "hook":      return <SlideHook />;
    case "problem":   return <SlideProblem />;
    case "quote":     return <SlideQuote />;
    case "hmw":       return <SlideHMW />;
    case "strategy":  return <SlideStrategy />;
    case "ai":        return <SlideAI />;
    case "heartbeat": return <SlideHeartbeat />;
    case "story":     return <SlideStory />;
    case "exploop":   return <SlideExpLoop />;
    case "showrooms": return <SlideShowrooms />;
    case "craft":     return <SlideCraft />;
    case "reflect":   return <SlideReflect />;
    case "metrics":   return <SlideMetrics />;
    case "closing":   return <SlideClosing />;
    default:          return null;
  }
}

// ─── Chapter pill nav ────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

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
                : `h-1.5 w-1.5 ${dark ? "bg-white/16 hover:bg-white/45" : "bg-black/14 hover:bg-black/40"}`
            }`}
            aria-label={`Go to chapter: ${ch}`}>
            {on ? ch : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClient() {
  const [idx,  setIdx]  = useState(0);
  const total  = SLIDES.length;
  const slide  = SLIDES[idx];
  const dark   = slide.dark;
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;
  const minsLeft = Math.max(1, Math.ceil(((total - 1 - idx) * 54) / 60));

  const [zone, setZone] = useState<"default" | "prev" | "next" | "big">("default");

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total]);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft",  "PageUp"].includes(e.key))        { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  // Cursor spring
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const cx = useSpring(mx, { stiffness: 300, damping: 28, mass: 0.4 });
  const cy = useSpring(my, { stiffness: 300, damping: 28, mass: 0.4 });
  const [cursorVis, setCursorVis] = useState(false);

  useEffect(() => {
    const move  = (e: MouseEvent) => { setCursorVis(true); mx.set(e.clientX); my.set(e.clientY); };
    const leave = () => setCursorVis(false);
    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [mx, my]);

  const borderC = dark ? "border-white/22" : "border-black/22";
  const arrowC  = dark ? "text-white/75"   : "text-black/55";
  const big = zone !== "default";

  return (
    <div className="relative h-screen cursor-none select-none overflow-hidden">

      {/* Custom cursor */}
      {cursorVis && (
        <motion.div className="pointer-events-none fixed z-[9999] hidden md:block" style={{ x: cx, y: cy }} aria-hidden>
          <motion.div
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border ${borderC}`}
            animate={{ width: big ? 52 : 28, height: big ? 52 : 28 }}
            transition={{ duration: 0.18, ease: E }}
          />
          <div className="absolute left-0 top-0 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8FF47]" />
          {(zone === "prev" || zone === "next") && (
            <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] ${arrowC}`}>
              {zone === "prev" ? "←" : "→"}
            </span>
          )}
        </motion.div>
      )}

      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full bg-[#C8FF47]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }}
        />
      </div>

      {/* Header */}
      <header className={`absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10 ${
        dark ? "border-white/[0.05] bg-black/20" : "border-black/[0.05] bg-white/40"
      }`}>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character"
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${dark ? "text-white/35 hover:text-white/75" : "text-[#6B6B6B] hover:text-[#0A0A0A]"}`}>
            ← Case Study
          </Link>
          <span className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] md:inline ${dark ? "text-white/16" : "text-[#AEAEB2]"}`}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className={`hidden font-mono text-[10px] md:inline ${dark ? "text-white/16" : "text-[#AEAEB2]"}`}>
            ~{minsLeft} min left
          </span>
          <span className={`font-mono text-[10px] tabular-nums ${dark ? "text-white/28" : "text-[#AEAEB2]"}`}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide area */}
      <main className="h-full overflow-hidden pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: E }}
            className="h-full"
          >
            <SlideRenderer id={slide.id} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Click zones */}
      <button type="button" aria-label="Previous slide" onClick={prev} disabled={idx === 0}
        className="fixed bottom-14 left-0 top-14 z-30 hidden w-[12%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setZone("prev")} onMouseLeave={() => setZone("default")} />
      <button type="button" aria-label="Next slide" onClick={next} disabled={idx === total - 1}
        className="fixed bottom-14 right-0 top-14 z-30 hidden w-[12%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setZone("next")} onMouseLeave={() => setZone("default")} />

      {/* Footer */}
      <footer className={`absolute bottom-0 inset-x-0 z-40 border-t transition-colors duration-500 ${
        dark ? "border-white/[0.05] bg-black/25 backdrop-blur-md" : "border-black/[0.04] bg-white/65 backdrop-blur-md"
      }`}>
        <div className="flex items-center justify-between px-5 py-3 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 ${
              dark ? "text-white/62 hover:text-white" : "text-[#6B6B6B] hover:text-[#0A0A0A]"
            }`}>
            Prev
          </button>
          <ChapterPills current={slide.chapter} dark={dark} onJump={setIdx} />
          <button type="button" onClick={next} disabled={idx === total - 1}
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 ${
              dark ? "text-white/62 hover:text-white" : "text-[#6B6B6B] hover:text-[#0A0A0A]"
            }`}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
