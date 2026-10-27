"use client";

import { useEffect, useRef } from "react";

type P = { x: number; o: number; f: number; ph: number; v: number; len: number };

// a streak is drawn as this many pieces, faintest at the tail
const SEGS = 14;

/**
 * One lime strand drifting across the bottom of the screen, low on the left
 * and rising a little to the right: particles ride a slow, swaying ribbon,
 * each a fine streak with a fading tail (after Qbix's Flow trails), and the
 * threads cross over each other so the strand reads as one braid. Every frame
 * is drawn fresh, so nothing builds up behind it. Drawn at up to `maxDensity`
 * pixels per css pixel; it moves only while the tab is open, and for reduced
 * motion it's a still. Colours are 'r, g, b'.
 */
export function FlowStrand({
  className = "",
  count = 90,
  seed = 7,
  ground = "10, 11, 12",
  ink = "210, 255, 0",
  speed = 1,
  alpha = 0.85,
  maxDensity = 1.5,
}: {
  className?: string;
  count?: number;
  seed?: number;
  ground?: string;
  ink?: string;
  speed?: number;
  /** how strong a streak's head is drawn */
  alpha?: number;
  /** canvas pixels per css pixel, at most (a retina screen is drawn at this) */
  maxDensity?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d", { alpha: false });
    if (!cv || !g) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let W = 0, H = 0, k = 1, t = 0;
    const ps: P[] = Array.from({ length: count }, () => ({ x: 0, o: 0, f: 0, ph: 0, v: 0, len: 0 }));
    // the strand at a point along it (u: 0 at the left edge, 1 at the right): its middle and its half-width
    const mid = (u: number) => H * (0.9 - 0.2 * u + 0.035 * Math.sin(u * 4 + t * 0.5) + 0.015 * Math.sin(u * 9 - t * 0.8));
    const half = (u: number) => H * (0.024 + 0.012 * Math.sin(u * 3 - t * 0.4 + 1));
    // a thread's height at x: its place across the strand, swaying so the threads braid
    const yAt = (p: P, x: number) => {
      const u = x / W;
      return mid(u) + (p.o + 0.4 * Math.sin(u * p.f + p.ph + t)) * half(u);
    };
    const spawn = (p: P, x: number) => {
      p.x = x;
      p.o = (rnd() * 2 - 1) * 0.8;
      p.f = 5 + rnd() * 7;
      p.ph = rnd() * Math.PI * 2;
      p.v = (1 + rnd() * 0.8) * k;
      p.len = (90 + rnd() * 90) * k;
    };
    const tones = Array.from({ length: SEGS }, (_, j) => `rgba(${ink}, ${(alpha * Math.pow((j + 1) / SEGS, 1.6)).toFixed(3)})`);

    const draw = () => {
      g.fillStyle = `rgb(${ground})`;
      g.fillRect(0, 0, W, H);
      g.lineWidth = Math.max(1, k * 0.9);
      g.lineCap = "round";
      // one stroke per piece of the tail, across all streaks
      for (let j = 0; j < SEGS; j++) {
        g.strokeStyle = tones[j];
        g.beginPath();
        for (const p of ps) {
          const a = p.x - p.len * (1 - j / SEGS), b = p.x - p.len * (1 - (j + 1) / SEGS);
          if (b < 0 || a > W) continue;
          g.moveTo(a, yAt(p, a));
          g.lineTo(b, yAt(p, b));
        }
        g.stroke();
      }
    };
    const step = () => {
      t += 0.004 * speed;
      for (const p of ps) {
        p.x += p.v * speed;
        if (p.x - p.len > W) spawn(p, -rnd() * W * 0.25);
      }
      draw();
    };
    const fresh = () => {
      for (const p of ps) {
        spawn(p, 0);
        p.x = rnd() * (W + p.len);
      }
      draw();
    };

    let raf = 0;
    const loop = () => {
      raf = 0;
      if (document.hidden || calm || !W) return;
      step();
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const ro = new ResizeObserver(([e]) => {
      const d = Math.min(window.devicePixelRatio || 1, maxDensity);
      const w = Math.round(e.contentRect.width * d), h = Math.round(e.contentRect.height * d);
      if (w < 2 || h < 2 || (w === W && h === H)) return;
      W = cv.width = w;
      H = cv.height = h;
      k = W / Math.max(1, cv.clientWidth);
      fresh();
      wake();
    });
    ro.observe(cv);
    document.addEventListener("visibilitychange", wake);
    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count, seed, ground, ink, speed, alpha, maxDensity]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
