"use client";

/**
 * LivingHero — the homepage hero as a living artifact (idea ①).
 *
 * The three keywords in the headline — Research / motion / code — are channel
 * switches. Hovering / focusing / tapping one draws a lime highlighter under it
 * and morphs the stage into a live demo that *proves* that capability on the
 * spot. With no interaction the hero auto-cycles the three channels.
 *
 * Presentation is deliberately un-boxy: a single warm "paper" sheet, no chrome
 * header, no nested card grids — each demo is one focal specimen on the sheet,
 * with its label and caption set as open type outside the frame.
 *
 * This component renders only the centered grid (headline + stage). The section
 * shell — min-height, vertical rhythm, the lime backdrop — is supplied by the
 * caller (the real homepage `Hero`, or the `/hero-lab` prototype page).
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Channel = "research" | "motion" | "code";
// Channels that auto-cycle at rest.
const CYCLE: Channel[] = ["research", "motion", "code"];
const LIME = "#d2ff00";
const ease = [0.25, 0.1, 0.25, 1] as const;
const spring = { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.7 };

const credentialLinkClass =
  "font-medium text-textPrimary transition-colors hover:text-nltLime focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2";

const CHANNEL_INFO: Record<Channel, { index: string; name: string }> = {
  research: { index: "01", name: "research" },
  motion: { index: "02", name: "motion" },
  code: { index: "03", name: "code" },
};

/* ------------------------------------------------------------------ */
/* Keyword — an interactive word with a lime highlighter swipe          */
/* ------------------------------------------------------------------ */

function Keyword({
  label,
  active,
  reduced,
  onActivate,
}: {
  label: string;
  active: boolean;
  reduced: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-pressed={active}
      className="group relative inline-block cursor-pointer rounded-sm align-baseline focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-0.06em] bottom-[0.07em] -z-0 h-[0.46em] rounded-[3px]"
        style={{ background: LIME, originX: 0, rotate: "-1.1deg" }}
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 0.6 : 0 }}
        transition={reduced ? { duration: 0 } : { ...spring, damping: 24 }}
      />
      <span
        className={`relative z-10 transition-colors duration-300 ${
          active ? "text-textPrimary" : "text-textPrimary/85 group-hover:text-textPrimary"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* MotionDemo — ONE element transforms (no sibling cards)               */
/* ------------------------------------------------------------------ */

export function MotionDemo({ reduced }: { reduced: boolean }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (reduced) {
      setExpanded(true);
      return;
    }
    const first = setTimeout(() => setExpanded(true), 700);
    const id = setInterval(() => setExpanded((e) => !e), 2600);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [reduced]);

  return (
    <div className="grid h-full place-items-center px-7 py-7">
      <motion.div
        className="overflow-hidden rounded-2xl shadow-[0_26px_60px_-30px_rgba(0,0,0,0.4)]"
        animate={{ width: expanded ? "100%" : "62%" }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 22 }}
        style={{ aspectRatio: "16 / 10" }}
      >
        {/* media — the brand cover art (same lime composition as the hero
            backdrop) is the figure against the warm sheet. The gradient sits
            underneath as a graceful fallback. */}
        <div className="relative h-[58%] overflow-hidden bg-gradient-to-br from-[#cfe588] via-[#e4f0b4] to-[#f5fbe0]">
          <img
            src="/assets/hero-decor.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <AnimatePresence>
            {expanded ? (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="absolute bottom-3 left-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-nltLime-ink shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-nltLime" />
                crafted to the pixel
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        {/* text band — content crossfades between thumb + case */}
        <div className="flex h-[42%] flex-col justify-center bg-white px-4">
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.div
                key="detail"
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : 0.1 }}
              >
                <div className="font-display text-base font-light leading-snug text-textPrimary md:text-lg">
                  The last 5% — where craft lives.
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="h-1.5 w-[86%] rounded-full bg-black/[0.06]" />
                  <div className="h-1.5 w-[64%] rounded-full bg-black/[0.06]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="thumb"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between"
              >
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary">
                  Case study
                </span>
                <span className="shrink-0 font-mono text-[10px] text-textSecondary/55">open ↗</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ResearchDemo — highlight → cite → footnote source (no boxed card)    */
/* ------------------------------------------------------------------ */

export function ResearchDemo({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 py-7 md:px-10">
      <p className="max-w-[32ch] font-display text-[18px] font-light leading-relaxed text-textPrimary md:text-xl">
        The price looked like the problem. Curiosity said dig deeper —{" "}
        <span className="relative inline">
          <motion.span
            aria-hidden
            className="absolute inset-x-[-0.1em] bottom-[0.04em] -z-0 h-[0.62em] rounded-[3px]"
            style={{ background: LIME, originX: 0, rotate: "-0.6deg" }}
            initial={reduced ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.55 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.45, ease }}
          />
          <span className="relative z-10">buyers distrusted the process, not the number</span>
        </span>
        <motion.sup
          initial={reduced ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: reduced ? 0 : 1.0 }}
          className="ml-0.5 cursor-help font-mono text-[10px] text-nltLime-ink underline decoration-dotted decoration-from-font underline-offset-2"
        >
          [1]
        </motion.sup>
        .
      </p>

      {/* footnote-style source — just a dotted lime rule, no boxed card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 1.35, ease }}
        className="flex max-w-md items-start gap-3 pl-4"
        style={{ borderLeft: "2px dotted #d2ff00" }}
      >
        <span className="mt-0.5 shrink-0 font-mono text-[10px] text-nltLime-ink">[1]</span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-snug text-textPrimary">
            Reframing in-chat quotation from price transparency to process trust
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-textSecondary">
            Meituan IM · A/B-validated · +5% conversion · −50% disputes
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CodeDemo — code types itself, then renders a playful live component  */
/* ------------------------------------------------------------------ */

const CODE = `function Sparkle() {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={burst}
    >
      Tap me ✦
    </motion.button>
  );
}`;

/** Featherweight syntax tint — keywords carry the brand olive. */
function colorize(line: string) {
  const tokens = line.split(/(\bfunction\b|\breturn\b|<\/?[A-Za-z.]+|\{|\}|"[^"]*"|=>)/g);
  return tokens.map((t, i) => {
    let cls = "text-textPrimary/90";
    if (/^(function|return)$/.test(t)) cls = "font-medium text-nltLime-ink";
    else if (/^<\/?[A-Za-z.]+/.test(t)) cls = "text-[#5b6b8a]";
    else if (/^"/.test(t)) cls = "text-[#9a6b3f]";
    else if (/^(=>|\{|\})$/.test(t)) cls = "text-textSecondary/45";
    return (
      <span key={i} className={cls}>
        {t}
      </span>
    );
  });
}

/** A burst of lime particles fired from the button's centre on each tap. */
function Burst({ n }: { n: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: n }).map((_, i) => {
        const angle = (i / n) * Math.PI * 2;
        const dist = 24 + (i % 3) * 9;
        return (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: i % 2 ? "#d2ff00" : "#5A7A12" }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </span>
  );
}

function SparkleButton({ reduced }: { reduced: boolean }) {
  const [count, setCount] = useState(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const idRef = useRef(0);

  const fire = () => {
    setCount((c) => c + 1);
    if (reduced) return;
    const id = idRef.current++;
    setBursts((b) => [...b, id]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 650);
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={fire}
        whileTap={reduced ? undefined : { scale: 0.9 }}
        whileHover={reduced ? undefined : { y: -2 }}
        transition={spring}
        className="relative inline-flex items-center gap-1.5 rounded-full bg-textPrimary px-6 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_-14px_rgba(184,229,50,0.55)]"
      >
        Tap me
        <span aria-hidden>✦</span>
        {bursts.map((id) => (
          <Burst key={id} n={9} />
        ))}
      </motion.button>
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={reduced ? false : { scale: 0.5, opacity: 0, y: 2 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="font-mono text-xs tabular-nums text-nltLime-ink"
          >
            ×{count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function CodeDemo({ reduced }: { reduced: boolean }) {
  const [n, setN] = useState(reduced ? CODE.length : 0);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= CODE.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [reduced]);

  const typed = CODE.slice(0, n);
  const done = n >= CODE.length;
  const showPreview = n > CODE.indexOf("Tap me");
  const lines = typed.split("\n");

  return (
    <div className="flex h-full flex-col justify-center gap-7 px-7 py-7 md:px-9">
      <pre className="font-mono text-[12.5px] leading-[1.65] md:text-[13px]">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-4 w-3 shrink-0 select-none text-right text-textSecondary/25">
              {i + 1}
            </span>
            <code className="min-w-0 text-textPrimary/90">
              {colorize(line)}
              {i === lines.length - 1 && !done ? (
                <motion.span
                  className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-nltLime-ink"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                />
              ) : null}
            </code>
          </div>
        ))}
      </pre>

      <div className="flex items-center gap-4">
        <AnimatePresence>
          {showPreview ? (
            <motion.div
              key="preview"
              initial={reduced ? false : { opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={spring}
            >
              <SparkleButton reduced={reduced} />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {done ? (
          <motion.span
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60"
          >
            live — keep tapping
          </motion.span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LivingHero — headline + stage (no section shell)                    */
/* ------------------------------------------------------------------ */

export function LivingHero() {
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState<Channel>("research");
  const [auto, setAuto] = useState(true);
  const [touched, setTouched] = useState(false);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const play = reduced || ready;

  useEffect(() => {
    if (!auto || reduced) return;
    const id = setInterval(() => {
      setActive((c) => CYCLE[(CYCLE.indexOf(c) + 1) % CYCLE.length]);
    }, 4600);
    return () => clearInterval(id);
  }, [auto, reduced]);

  const pick = (c: Channel) => {
    setActive(c);
    setAuto(false);
    setTouched(true);
  };

  const containerV = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.09,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };
  const itemV = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: spring } };

  return (
    <div className="mx-auto w-full max-w-content px-6" onMouseLeave={() => setAuto(true)}>
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* headline + real hero info stack */}
        <motion.div
          className="max-w-xl"
          variants={containerV}
          initial="hidden"
          animate={play ? "show" : "hidden"}
        >
          <motion.h1
            id="hero-heading"
            variants={itemV}
            className="font-display text-[2.25rem] font-light leading-[1.08] tracking-[-0.012em] text-textPrimary sm:text-5xl md:text-6xl lg:text-[4rem] lg:leading-[1.04]"
          >
            <Keyword label="Research" active={active === "research"} reduced={reduced} onActivate={() => pick("research")} />
            ,{" "}
            <Keyword label="motion" active={active === "motion"} reduced={reduced} onActivate={() => pick("motion")} />
            , and{" "}
            <Keyword label="code" active={active === "code"} reduced={reduced} onActivate={() => pick("code")} />
            <br className="hidden sm:block" /> — in one head.
          </motion.h1>

          <motion.p
            variants={itemV}
            className="mt-5 flex max-w-xl flex-wrap items-center gap-x-3 gap-y-1 text-lg leading-relaxed text-textSecondary md:mt-6 md:text-xl"
          >
            {["AI-Native Workflow", "Visual Craft", "Prototype with Code and Curiosity"].map(
              (item, i) => (
                <span key={item} className="inline-flex items-center gap-x-3">
                  {i > 0 ? (
                    <span aria-hidden className="text-textSecondary/35">
                      ·
                    </span>
                  ) : null}
                  {item}
                </span>
              ),
            )}
          </motion.p>

          <motion.p variants={itemV} className="mt-3 font-mono text-sm text-textSecondary md:mt-4">
            MS @{" "}
            <a
              href="https://www.hcde.washington.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className={credentialLinkClass}
            >
              UW HCDE
            </a>
            {"  ·  "}UX Designer @{" "}
            <a
              href="https://www.alibabacloud.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className={credentialLinkClass}
            >
              Alibaba
            </a>
          </motion.p>

          <motion.p
            variants={itemV}
            className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary backdrop-blur-md sm:text-[11px] sm:tracking-[0.16em] md:mt-6"
          >
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-70" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
            </span>
            Open to work
          </motion.p>

          <motion.div variants={itemV} className="mt-8 flex flex-wrap items-center gap-4">
            <motion.a
              href="#work"
              whileHover={reduced ? undefined : { y: -2 }}
              whileTap={reduced ? undefined : { y: 1 }}
              transition={{ type: "spring", stiffness: 480, damping: 28 }}
              className="group/cta relative inline-flex overflow-hidden rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] transition-[box-shadow] duration-300 hover:shadow-[0_16px_36px_-14px_rgba(184,229,50,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2"
            >
              <span className="relative z-10 inline-flex items-center gap-1.5">
                Explore Work
                <span
                  aria-hidden
                  className="inline-block translate-x-0 transition-transform duration-300 ease-portfolio group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                >
                  ↗
                </span>
              </span>
            </motion.a>

            <AnimatePresence>
              {!touched && !reduced ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/55"
                >
                  ↑ hover the words — each proves itself →
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* stage — one open paper sheet, label + caption set as open type */}
        <motion.div
          className="relative"
          initial={reduced ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={play ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ ...spring, delay: reduced ? 0 : 0.28 }}
        >
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-70" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease }}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary"
              >
                {CHANNEL_INFO[active].index} · {CHANNEL_INFO[active].name}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.4rem] bg-[#fcfcf9] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.4)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.38, ease }}
              >
                {active === "code" ? (
                  <CodeDemo reduced={reduced} />
                ) : active === "motion" ? (
                  <MotionDemo reduced={reduced} />
                ) : (
                  <ResearchDemo reduced={reduced} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
