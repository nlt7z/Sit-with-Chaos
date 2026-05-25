"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/**
 * An ambient decor image that:
 *  - fades in on scroll (so the page fills in progressively, not all at once),
 *  - drifts with a subtle scroll-parallax,
 *  - floats continuously on a slow infinite loop, and
 *  - sits over a soft lime radial-gradient glow.
 *
 * Positioned via `className` (absolute) — alternate left/right between sections
 * to thread the content together. Hidden on small screens + reduced motion-safe.
 */
export function FloatingDecor({
  src,
  className = "",
  width = 1254,
  height = 1254,
  sizes = "240px",
  parallax = 48,
  rotate = [-6, 6],
  floatDuration = 9,
  floatDistance = 14,
  glowClassName = "-inset-[26%]",
  glowOpacity = 1,
  maxOpacity = 0.95,
}: {
  src: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  /** scroll-parallax travel in px */
  parallax?: number;
  rotate?: [number, number];
  floatDuration?: number;
  floatDistance?: number;
  /** override glow size/position (defaults to a halo slightly larger than the art) */
  glowClassName?: string;
  glowOpacity?: number;
  maxOpacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.24, 0.85, 1],
    [0, maxOpacity, maxOpacity, maxOpacity * 0.92],
  );
  const py = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  const rot = useTransform(scrollYProgress, [0, 1], rotate);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute z-0 hidden lg:block ${className}`}
      style={rm ? { opacity: maxOpacity } : { opacity }}
    >
      {/* Lime gradient glow — stays put while the art floats over it. */}
      <div
        className={`absolute rounded-full bg-[radial-gradient(circle,rgba(184,229,50,0.42)_0%,rgba(184,229,50,0.16)_42%,transparent_72%)] blur-2xl ${glowClassName}`}
        style={{ opacity: glowOpacity }}
      />
      {/* Scroll-parallax wrapper. */}
      <motion.div className="relative" style={rm ? undefined : { y: py, rotate: rot }}>
        {/* Continuous float loop. */}
        <motion.div
          animate={rm ? undefined : { y: [0, -floatDistance, 0] }}
          transition={rm ? undefined : { duration: floatDuration, ease: "easeInOut", repeat: Infinity }}
        >
          <Image src={src} alt="" width={width} height={height} sizes={sizes} className="h-auto w-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
