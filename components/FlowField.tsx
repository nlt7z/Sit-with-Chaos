"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; life: number };

/**
 * Lime particles carried by a slow field of currents, each drawing a fine line
 * where it goes while the old lines fade, so the picture is the paths they
 * take. Ported from Qbix's components/scene/Flow.tsx (qbix.space) and
 * recoloured to the portfolio's lime on #0a0b0c. Made for a full-screen
 * backdrop: the particle count follows the area, the canvas is capped at
 * `maxDensity` pixels per css pixel, it moves only while the tab is open, and
 * for reduced motion it's a still. Colours are 'r, g, b'.
 */
export function FlowField({
  className = "",
  perArea = 4,
  seed = 7,
  ground = "10, 11, 12",
  ink = "210, 255, 0",
  speed = 1,
  scale = 1,
  alpha = 0.78,
  maxDensity = 1.5,
}: {
  className?: string;
  /** particles per 10,000 css px² */
  perArea?: number;
  seed?: number;
  ground?: string;
  ink?: string;
  speed?: number;
  /** the size of the currents: above 1, wider */
  scale?: number;
  /** how strong each line is drawn */
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
    let ps: P[] = [];
    const spawn = (p: P) => {
      p.x = rnd() * W;
      p.y = rnd() * H;
      p.life = 50 + rnd() * 160;
    };
    // the currents: an angle at each point (in css px), turning slowly with time
    const angle = (x: number, y: number) => {
      const u = x / k / scale, v = y / k / scale;
      return Math.sin(u * 0.011 + t * 0.35) * 1.5 + Math.cos(v * 0.013 - t * 0.25) * 1.3 + Math.sin((u + v) * 0.0045 + 1.3) * 2.4;
    };
    const fade = (n: number) => `rgba(${ground}, ${(1 - Math.pow(0.94, n)).toFixed(3)})`;
    const line = `rgba(${ink}, ${alpha})`;
    // a step of the currents; the old lines fade every `every` steps (by as much as they would have)
    let since = 0;
    const step = (every = 1) => {
      t += 0.004 * speed;
      if (++since >= every) {
        g.fillStyle = fade(since);
        g.fillRect(0, 0, W, H);
        since = 0;
      }
      g.strokeStyle = line;
      g.lineWidth = Math.max(1, k * 0.9);
      g.beginPath();
      const v = 1.15 * k * speed;
      for (const p of ps) {
        const a = angle(p.x, p.y);
        const nx = p.x + Math.cos(a) * v, ny = p.y + Math.sin(a) * v;
        g.moveTo(p.x, p.y);
        g.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        if (--p.life <= 0 || nx < 0 || ny < 0 || nx > W || ny > H) spawn(p);
      }
      g.stroke();
    };
    const fresh = () => {
      const n = Math.max(60, Math.round(((W / k) * (H / k) * perArea) / 1e4));
      ps = Array.from({ length: n }, () => ({ x: 0, y: 0, life: 0 }));
      g.fillStyle = `rgb(${ground})`;
      g.fillRect(0, 0, W, H);
      ps.forEach(spawn);
      // drawn out ahead so it opens mid-flow: fewer steps, faded less often, the bigger the canvas
      const ahead = Math.max(40, Math.min(180, Math.round((180 * 4e5) / (W * H))));
      for (let i = 0; i < ahead; i++) step(ahead < 180 ? 4 : 1);
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
  }, [perArea, seed, ground, ink, speed, scale, alpha, maxDensity]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
