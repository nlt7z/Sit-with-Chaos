"use client";

/**
 * SmoothScroll — Lenis inertia scrolling for the bento page, the same library
 * the reference site uses (lenis fingerprints in its bundle). Mounts a single
 * rAF loop and tears it down on unmount. Skipped when the visitor prefers
 * reduced motion. Renders nothing.
 */

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
