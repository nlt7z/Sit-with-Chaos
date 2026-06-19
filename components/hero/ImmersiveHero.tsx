"use client";

/**
 * ImmersiveHero — the homepage hero: headline on the left, an interactive
 * window on the right. The three headline keywords — Curiosity / craft / code —
 * are channel switches: hovering / focusing / tapping one draws the lime
 * highlighter under it and swaps the right window to a demo that *proves* that
 * trait (the demos are shared with the /hero-lab LivingHero prototype). Left
 * alone, the channels auto-cycle. A fine film grain sits over the whole scene.
 *
 * (A static image / the interactive 3D glass field can return as an alternate
 * right-hand visual later; for now the window is the living demo.)
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionDemo, ResearchDemo } from "@/components/hero/LivingHero";
import { CraftModel } from "@/components/hero/CraftModel";
import { SplitTextChars } from "@/components/SplitBtn";

type Channel = "research" | "motion" | "code";
const CYCLE: Channel[] = ["research", "motion", "code"];
const LIME = "#d2ff00";
const ease = [0.25, 0.1, 0.25, 1] as const;
const spring = { type: "spring" as const, stiffness: 220, damping: 26, mass: 0.7 };

// Channel → headline word + window label. Keys stay research/motion/code (the
// shared demos), the display words are the new Curiosity / craft / code.
const CHANNEL_INFO: Record<Channel, { index: string; name: string }> = {
  research: { index: "01", name: "curiosity" },
  motion: { index: "02", name: "craft" },
  code: { index: "03", name: "code" },
};

// Tiled SVG film grain — fractal-noise rect, blended over the scene at low
// opacity for a fine photographic grain.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

const credentialLinkClass =
  "font-medium text-textPrimary transition-colors hover:text-nltLime-ink focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2";

/* ------------------------------------------------------------------ */
/* SplitBtn — pill button with per-char stagger slide (Norris pattern) */
/* Each character clips inside its own overflow-hidden wrapper, slides  */
/* up out of frame on hover while a duplicate slides up into frame.     */
/* ------------------------------------------------------------------ */
function SplitBtn({
  href,
  label,
  pill,
}: {
  href: string;
  label: string;
  pill: "dark" | "light";
}) {
  const isDark = pill === "dark";

  return (
    <a
      href={href}
      className={[
        "group inline-flex items-center rounded-full px-8 py-3 text-sm font-medium shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? "bg-textPrimary text-white focus-visible:ring-nltLime"
          : "border border-[rgba(0,0,0,0.08)] bg-white text-textPrimary focus-visible:ring-textPrimary",
      ].join(" ")}
    >
      <SplitTextChars text={label} />
    </a>
  );
}

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
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 0.62 : 0 }}
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
/* ImmersiveHero                                                        */
/* ------------------------------------------------------------------ */

export function ImmersiveHero() {
  const reduced = !!useReducedMotion();
  // Open on the craft channel (the 3D specimen) by default.
  const [active, setActive] = useState<Channel>("motion");
  const [auto, setAuto] = useState(true);

  // Stage entrance — gated on the first frame so SSR/hydration looks calm.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const play = reduced || ready;

  // Auto-cycle the channels at rest.
  useEffect(() => {
    if (!auto || reduced) return;
    const id = setInterval(() => {
      setActive((c) => CYCLE[(CYCLE.indexOf(c) + 1) % CYCLE.length]);
    }, 4600);
    return () => clearInterval(id);
  }, [auto, reduced]);

  const pick = useCallback((c: Channel) => {
    setActive(c);
    setAuto(false);
  }, []);

  const containerV = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduced ? 0 : 0.09,
          delayChildren: reduced ? 0 : 0.05,
        },
      },
    }),
    [reduced],
  );
  const itemV = useMemo(
    () =>
      reduced
        ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
        : { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: spring } },
    [reduced],
  );

  return (
    <div onMouseLeave={() => setAuto(true)} className="relative w-full">
      {/* Calm cream field behind the two columns. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 95% at 78% 35%, #F7FBE6 0%, #FCFEF6 46%, #FFFFFF 80%)",
        }}
      />

      {/* Film grain over the whole scene. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat", mixBlendMode: "overlay" }}
      />

      {/* Bottom fade so the hero dissolves into the page / Work below. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white" />

      <div className="relative z-10 mx-auto flex min-h-[82svh] w-full max-w-content items-center px-6 py-12 md:py-16">
        <div className="grid w-full items-center gap-8 md:gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
          {/* ---------- left: headline + real info ---------- */}
          <motion.div
            className="max-w-xl"
            variants={containerV}
            initial="hidden"
            animate={play ? "show" : "hidden"}
          >
            <motion.h1
              id="hero-heading"
              variants={itemV}
              className="font-display text-[2.25rem] font-light leading-[1.08] tracking-[-0.012em] text-textPrimary sm:text-5xl md:text-6xl lg:text-[3.9rem] lg:leading-[1.04]"
            >
              <Keyword label="Curiosity" active={active === "research"} reduced={reduced} onActivate={() => pick("research")} />
              ,{" "}
              <Keyword label="craft" active={active === "motion"} reduced={reduced} onActivate={() => pick("motion")} />
              , and{" "}
              <Keyword label="code" active={active === "code"} reduced={reduced} onActivate={() => pick("code")} />.
            </motion.h1>

            <motion.p
              variants={itemV}
              className="mt-5 flex max-w-xl flex-wrap items-center gap-x-3 gap-y-1 text-lg leading-relaxed text-textSecondary md:mt-6 md:text-xl"
            >
              {["AI-Native Workflow", "Visual Craft", "Relentless Builder"].map(
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

            <motion.div variants={itemV} className="mt-8 flex flex-wrap items-center gap-3">
              <SplitBtn href="#work" label="Explore Work ↗" pill="dark" />
              <SplitBtn href="#contact" label="Say hello ↗" pill="light" />
            </motion.div>

          </motion.div>

          {/* ---------- right: interactive window (glass-frosted) ---------- */}
          <motion.div
            className="relative"
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.985 }}
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

            {/* frosted-glass window — the demo behind it racks to the active word */}
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/55 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 rounded-[1.4rem]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 44%)",
                }}
              />

              {/* craft → interactive 3D specimen. Kept mounted across channel
                  switches so the heavy model loads once; only shown + draggable
                  while "craft" is the active word. */}
              <div
                className="absolute inset-0 transition-opacity duration-500 ease-portfolio"
                style={{
                  opacity: active === "motion" ? 1 : 0,
                  pointerEvents: active === "motion" ? "auto" : "none",
                }}
                aria-hidden={active !== "motion"}
              >
                <CraftModel
                  reduced={reduced}
                  active={active === "motion"}
                  onInteract={() => pick("motion")}
                />
              </div>

              {/* curiosity + code crossfade behind the glass */}
              <AnimatePresence mode="wait">
                {active !== "motion" ? (
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.38, ease }}
                  >
                    {active === "code" ? (
                      <MotionDemo reduced={reduced} />
                    ) : (
                      <ResearchDemo reduced={reduced} />
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
