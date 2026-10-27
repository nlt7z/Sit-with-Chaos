"use client";

import { useEffect, useRef } from "react";

type P = { x: number; o: number; f: number; ph: number; v: number; len: number; w: number };

// a streak is drawn as this many pieces, faintest and thinnest at the tail
const SEGS = 20;
// line weights in css px (hairline, thread, cord), how strong each is drawn, and how often each comes up
const WEIGHTS = [
  { width: 0.7, alpha: 0.7, share: 0.6 },
  { width: 1.4, alpha: 0.85, share: 0.3 },
  { width: 2.6, alpha: 0.95, share: 0.1 },
] as const;

/**
 * One lime strand drifting across the middle of the screen, lower on the left
 * and rising to the right: particles ride a slow, swaying ribbon that swells
 * and narrows, each a long streak with a fading, tapering tail (after Qbix's
 * Flow trails), mostly fine lines with a few heavier ones, crossing over each
 * other so the strand reads as one braid. Every frame is drawn fresh, so
 * nothing builds up behind it. Drawn at up to `maxDensity` pixels per css
 * pixel; it moves only while the tab is open, and for reduced motion it's a
 * still. Colours are 'r, g, b'.
 */
export function FlowStrand({
  className = "",
  count = 150,
  seed = 7,
  ground = "10, 11, 12",
  ink = "210, 255, 0",
  speed = 1,
  maxDensity = 1.5,
}: {
  className?: string;
  count?: number;
  seed?: number;
  ground?: string;
  ink?: string;
  speed?: number;
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
    // S: the strand's own scale, the height but kept flatter and thinner on a narrow screen
    let W = 0, H = 0, S = 0, k = 1, t = 0;
    // a narrow screen gets fewer, shorter streaks: `live` of them, `reach` times as long
    let live = count, reach = 1;
    const ps: P[] = Array.from({ length: count }, () => ({ x: 0, o: 0, f: 0, ph: 0, v: 0, len: 0, w: 0 }));
    // the strand at a point along it (u: 0 at the left edge, 1 at the right): its middle and its half-width
    const mid = (u: number) => H * 0.59 + S * (0.15 - 0.3 * u + 0.04 * Math.sin(u * 4 + t * 0.5) + 0.015 * Math.sin(u * 9 - t * 0.8));
    const half = (u: number) => S * (0.03 + 0.018 * Math.sin(u * 3 - t * 0.4 + 1));
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
      p.len = (180 + rnd() * 240) * k * reach;
      const r = rnd();
      p.w = r < WEIGHTS[0].share ? 0 : r < WEIGHTS[0].share + WEIGHTS[1].share ? 1 : 2;
    };
    const tones = WEIGHTS.map((wt) =>
      Array.from({ length: SEGS }, (_, j) => `rgba(${ink}, ${(wt.alpha * Math.pow((j + 1) / SEGS, 1.6)).toFixed(3)})`),
    );

    const draw = () => {
      g.fillStyle = `rgb(${ground})`;
      g.fillRect(0, 0, W, H);
      g.lineCap = "butt";
      // one stroke per weight and piece of the tail, across all streaks of that weight
      for (let c = 0; c < WEIGHTS.length; c++) {
        for (let j = 0; j < SEGS; j++) {
          g.strokeStyle = tones[c][j];
          g.lineWidth = Math.max(0.6, WEIGHTS[c].width * k * (0.35 + (0.65 * (j + 1)) / SEGS));
          g.beginPath();
          for (let i = 0; i < live; i++) {
            const p = ps[i];
            if (p.w !== c) continue;
            const a = p.x - p.len * (1 - j / SEGS), b = p.x - p.len * (1 - (j + 1) / SEGS);
            if (b < 0 || a > W) continue;
            g.moveTo(a, yAt(p, a));
            g.lineTo(b, yAt(p, b));
          }
          g.stroke();
        }
      }
    };
    const step = () => {
      t += 0.004 * speed;
      for (let i = 0; i < live; i++) {
        const p = ps[i];
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
      S = Math.min(H, W * 1.1);
      k = W / Math.max(1, cv.clientWidth);
      reach = Math.max(0.4, Math.min(1, cv.clientWidth / 1100));
      live = Math.max(30, Math.round(count * reach));
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
  }, [count, seed, ground, ink, speed, maxDensity]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
