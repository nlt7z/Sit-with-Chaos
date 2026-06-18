"use client";

/**
 * LimeMark — the brand's highlighter signature (idea ③-B).
 *
 * Wraps a phrase so a lime marker swipes across it once, the moment it scrolls
 * into view — the highlighter motif borrowed from the research work, promoted to
 * a site-wide brand behaviour. Use it sparingly, on the one phrase per section
 * worth remembering; overuse turns a signature into decoration.
 *
 * The marker sits *behind* the glyphs (lower band only, like a real highlighter)
 * so text stays fully legible. Respects prefers-reduced-motion.
 */

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const ease = [0.25, 0.1, 0.25, 1] as const;

export function LimeMark({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduced = useReducedMotion();
  const lit = inView || !!reduced;

  return (
    <span ref={ref} className={`relative inline ${className ?? ""}`}>
      {/* Reveal is a left→right clip wipe (not a scaleX grow) so the marker is
          always a full-height bar being uncovered — never a tiny rounded sliver
          at the origin, which read as a stray green dot before the swipe. */}
      <motion.span
        aria-hidden
        className="absolute inset-x-[-0.1em] bottom-[0.04em] -z-0 h-[0.6em] rounded-[3px]"
        style={{ background: "#d2ff00", opacity: 0.5, rotate: "-0.6deg" }}
        initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={lit ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
