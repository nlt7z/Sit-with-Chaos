"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { EASE, EMPHASIS, REVEAL, REVEAL_VIEWPORT } from "@/lib/motion";

/**
 * Reveal — the site's one scroll fade-in (see lib/motion). `emphasis` is for
 * the single hero media moment on a page. Reduced motion renders it static.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  emphasis = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  emphasis?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  const from = emphasis ? { opacity: 0, y: EMPHASIS.y, scale: EMPHASIS.scale } : { opacity: 0, y: REVEAL.y };
  return (
    <motion.div
      className={className}
      initial={from}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: emphasis ? EMPHASIS.duration : REVEAL.duration, ease: EASE, delay }}
      style={emphasis ? { transformOrigin: "50% 100%" } : undefined}
    >
      {children}
    </motion.div>
  );
}
