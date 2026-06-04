"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

export type BlurRevealProps = {
  className?: string;
  /** Seconds before blur lift begins */
  delay?: number;
  /** Blur dissolve duration (excluding delay) */
  duration?: number;
  /**
   * When false, hold at the initial (hidden) state instead of revealing.
   * Lets a parent defer the entrance until after the first paint so the
   * animation's timeline starts when it's actually visible. Defaults to true
   * to preserve play-on-mount behavior for existing usages.
   */
  start?: boolean;
  children: ReactNode;
};

/**
 * Entrance: heavy blur → sharp copy with a soft upward settle.
 * Respect reduced motion → no animation.
 */
export function BlurReveal({ className, delay = 0, duration = 0.85, start = true, children }: BlurRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const revealed = prefersReducedMotion || start;

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, filter: "blur(14px)", y: 24 }}
      animate={
        revealed
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(14px)", y: 24 }
      }
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: easePortfolio,
      }}
    >
      {children}
    </motion.div>
  );
}
