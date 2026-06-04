"use client";

/**
 * LimeSignature — prototype for idea ③ (turn nltLime into an unmissable
 * signature). Three candidate treatments coexist here so they can be felt and
 * compared:
 *   A. a lime scroll-progress line pinned to the top of the viewport
 *   B. a highlighter that swipes key phrases as they scroll into view
 *   C. a lime cursor companion (desktop) that grows over interactive elements
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LIME = "#B8E532";
const ease = [0.25, 0.1, 0.25, 1] as const;

/* A — scroll progress line */
function ScrollLine() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX, background: LIME, boxShadow: "0 0 12px rgba(184,229,50,0.7)" }}
    />
  );
}

/* B — highlighter on reveal */
function Mark({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  return (
    <span ref={ref} className="relative inline">
      <motion.span
        aria-hidden
        className="absolute inset-x-[-0.1em] bottom-[0.03em] -z-0 h-[0.6em] rounded-[3px]"
        style={{ background: LIME, originX: 0, rotate: "-0.6deg" }}
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 0.5 } : reduced ? { scaleX: 1, opacity: 0.5 } : {}}
        transition={{ duration: 0.55, ease }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

/* C — cursor companion */
function CursorDot({ reduced }: { reduced: boolean }) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 38, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 38, mass: 0.4 });
  const [big, setBig] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setBig(!!t?.closest("a,button"));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[55] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ x: sx, y: sy, background: LIME, mixBlendMode: "multiply" }}
      animate={{ width: big ? 44 : 14, height: big ? 44 : 14, opacity: big ? 0.4 : 0.85 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    />
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-reading px-6 py-24 md:py-32">{children}</section>;
}

export function LimeSignature() {
  const reduced = !!useReducedMotion();
  return (
    <>
      <ScrollLine />
      <CursorDot reduced={reduced} />

      <Block>
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">A · scroll line</p>
        <h2 className="mt-3 font-display text-3xl font-light leading-snug text-textPrimary md:text-4xl">
          The lime should be the thing you remember.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-textSecondary md:text-lg">
          Scroll — the line at the very top fills with lime as you go. It&apos;s the one element
          present on every screen, so the brand colour is felt continuously instead of just winking
          in a status dot.
        </p>
      </Block>

      <Block>
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">B · highlighter</p>
        <p className="mt-6 font-display text-2xl font-light leading-relaxed text-textPrimary md:text-3xl">
          As you read, the sentences that matter get <Mark reduced={reduced}>marked in lime</Mark> —
          the highlighter motif borrowed from research, now a brand behaviour. It turns reading into{" "}
          <Mark reduced={reduced}>an active, remembered moment</Mark>, and ties straight back to the
          Liner work.
        </p>
        <p className="mt-8 text-base leading-relaxed text-textSecondary md:text-lg">
          The swipe fires once, on scroll-in, so it feels deliberate — a hand drawing the marker —
          not decorative. Used sparingly it becomes <Mark reduced={reduced}>a signature</Mark>.
        </p>
      </Block>

      <Block>
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">C · cursor</p>
        <h2 className="mt-3 font-display text-3xl font-light leading-snug text-textPrimary md:text-4xl">
          A lime companion that follows you.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-textSecondary md:text-lg">
          On desktop, a soft lime dot trails the cursor and swells over anything clickable. Hover
          this{" "}
          <a href="#" className="font-medium text-textPrimary underline decoration-nltLime decoration-2 underline-offset-4">
            link
          </a>{" "}
          or the button below to feel it grow. Multiply blend keeps it tasteful over text.
        </p>
        <button
          type="button"
          className="mt-8 rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_16px_36px_-14px_rgba(184,229,50,0.4)]"
        >
          Hover me
        </button>
        <p className="mt-16 font-mono text-xs uppercase tracking-[0.16em] text-textSecondary/60">
          Pick one to ship — stacking all three would be noise.
        </p>
      </Block>
    </>
  );
}
