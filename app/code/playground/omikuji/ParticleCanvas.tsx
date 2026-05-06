"use client";

import { useEffect, useRef } from "react";
import type { ParticleKind } from "./fortunes";

type Shape = "petal" | "star4" | "star5" | "dot" | "diamond";

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  life: number;       // 0–1, decreases to 0
  r: number;
  rot: number; vr: number;
  shape: Shape;
  h: number; s: number; l: number; // hue / saturation / lightness
  phase: number; phaseSpeed: number;
};

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// ─── Shape drawers ────────────────────────────────────────────────────────────

function petalPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.1);
  ctx.bezierCurveTo( r * 0.52, -r * 0.06,  r * 0.65, -r * 0.80,  0, -r);
  ctx.bezierCurveTo(-r * 0.65, -r * 0.80, -r * 0.52, -r * 0.06,  0,  r * 0.1);
  ctx.closePath();
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  r: number, h: number, s: number, l: number, frame: number
) {
  const breath = 0.70 + 0.18 * Math.sin(frame * 0.034);
  for (let k = 0; k < 5; k++) {
    ctx.save();
    ctx.rotate((k / 5) * Math.PI * 2);
    const shade = l - (k % 2 === 0 ? 0 : 5);
    ctx.fillStyle = `hsla(${h},${s}%,${shade}%,${breath})`;
    petalPath(ctx, r);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${h + 18},${s - 10}%,${l + 10}%,0.95)`;
  ctx.fill();
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  r: number, h: number, s: number, l: number
) {
  const t = 0.11;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.bezierCurveTo( r*t, -r*t,  r*t, -r*t,  r, 0);
  ctx.bezierCurveTo( r*t,  r*t,  r*t,  r*t,  0, r);
  ctx.bezierCurveTo(-r*t,  r*t, -r*t,  r*t, -r, 0);
  ctx.bezierCurveTo(-r*t, -r*t, -r*t, -r*t,  0, -r);
  ctx.closePath();
  ctx.fillStyle = `hsla(${h},${s}%,${l}%,0.90)`;
  ctx.fill();
}

function drawStar5(
  ctx: CanvasRenderingContext2D,
  r: number, h: number, s: number, l: number
) {
  const inner = r * 0.42;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else         ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = `hsla(${h},${s}%,${l}%,0.92)`;
  ctx.fill();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  r: number, h: number, s: number, l: number
) {
  const w = r * 0.58;
  // Main body
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-w, 0);
  ctx.closePath();
  ctx.fillStyle = `hsla(${h},${s}%,${l}%,0.93)`;
  ctx.fill();
  // Top-right highlight facet
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = `hsla(${h},${s}%,${Math.min(l + 22, 96)}%,0.35)`;
  ctx.fill();
  // Left shadow facet
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(-w, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = `hsla(${h},${s}%,${Math.max(l - 15, 28)}%,0.20)`;
  ctx.fill();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  r: number, h: number, s: number, l: number, alpha: number
) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${h},${s}%,${l}%,${alpha})`;
  ctx.fill();
}

// ─── Particle init (all types burst from screen center) ───────────────────────

function pickSakuraShape(): Shape {
  const n = Math.random();
  if (n < 0.55) return "petal";
  if (n < 0.78) return "dot";
  if (n < 0.90) return "star4";
  return "star5";
}

function makeParticle(type: ParticleKind, w: number, h: number): Particle {
  // All particles spawn from the center (where the card is)
  const cx = w / 2 + rnd(-30, 30);
  const cy = h / 2 + rnd(-30, 30);
  const a = Math.random() * Math.PI * 2;

  if (type === "sakura") {
    const shape = pickSakuraShape();
    const sp = rnd(0.6, 3.2);
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - rnd(0.6, 2.0), // upward burst bias
      life: rnd(0.75, 1),
      r: shape === "petal" ? rnd(8, 15) : shape === "dot" ? rnd(3, 5.5) : rnd(4, 8),
      rot: rnd(0, Math.PI * 2), vr: rnd(-0.020, 0.020),
      shape, h: rnd(326, 352), s: rnd(70, 88), l: rnd(74, 85),
      phase: rnd(0, Math.PI * 2), phaseSpeed: rnd(0.018, 0.032),
    };
  }

  if (type === "gold") {
    const sp = rnd(1.8, 5.0);
    const shape: Shape = Math.random() < 0.72 ? "diamond" : Math.random() < 0.6 ? "star4" : "dot";
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - rnd(0.5, 1.8),
      life: rnd(0.7, 1),
      r: shape === "diamond" ? rnd(3.5, 8) : shape === "star4" ? rnd(2.5, 5.5) : rnd(2, 3.5),
      rot: rnd(0, Math.PI * 2), vr: rnd(-0.10, 0.10),
      shape, h: rnd(38, 52), s: rnd(85, 96), l: rnd(60, 72),
      phase: rnd(0, Math.PI * 2), phaseSpeed: 0,
    };
  }

  if (type === "water") {
    const sp = rnd(0.8, 2.8);
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rnd(0.65, 1),
      r: rnd(3, 7),
      rot: 0, vr: 0,
      shape: "dot", h: rnd(188, 202), s: rnd(65, 80), l: rnd(68, 78),
      phase: rnd(0, Math.PI * 2), phaseSpeed: rnd(0.04, 0.07),
    };
  }

  if (type === "firefly") {
    const sp = rnd(0.3, 1.8);
    return {
      x: cx, y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rnd(0.5, 1),
      r: rnd(2, 4),
      rot: 0, vr: 0,
      shape: "dot", h: rnd(95, 115), s: rnd(75, 90), l: rnd(72, 82),
      phase: rnd(0, Math.PI * 2), phaseSpeed: rnd(0.05, 0.10),
    };
  }

  // leaf / fallback
  const sp = rnd(0.8, 3.5);
  const fbShape: Shape = Math.random() < 0.4 ? "petal" : Math.random() < 0.55 ? "star4" : "dot";
  return {
    x: cx, y: cy,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp - rnd(0.3, 1.2),
    life: rnd(0.7, 1),
    r: fbShape === "petal" ? rnd(7, 13) : rnd(4, 8),
    rot: rnd(0, Math.PI), vr: rnd(-0.025, 0.025),
    shape: fbShape, h: rnd(25, 55), s: rnd(75, 90), l: rnd(65, 78),
    phase: rnd(0, Math.PI * 2), phaseSpeed: rnd(0.020, 0.040),
  };
}

function initParticles(type: ParticleKind, count: number): Particle[] {
  const w = typeof window !== "undefined" ? window.innerWidth  : 800;
  const h = typeof window !== "undefined" ? window.innerHeight : 600;
  return Array.from({ length: count }, () => makeParticle(type, w, h));
}

// ─── Physics ──────────────────────────────────────────────────────────────────

function update(p: Particle, type: ParticleKind) {
  p.phase += p.phaseSpeed;

  if (type === "sakura") {
    p.x  += p.vx + Math.sin(p.phase) * 0.42;
    p.y  += p.vy;
    p.vy += 0.038;   // gravity
    p.vx *= 0.994;   // air drag
    p.rot += p.vr;
    p.life -= 0.0030;
  } else if (type === "gold") {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.055;
    p.vx *= 0.990;
    p.rot += p.vr;
    p.life -= 0.0028;
  } else if (type === "water") {
    p.x  += p.vx + Math.sin(p.phase) * 0.35;
    p.y  += p.vy;
    p.vy += 0.03;
    p.vx *= 0.992;
    p.life -= 0.0032;
  } else if (type === "firefly") {
    p.vx += rnd(-0.07, 0.07);
    p.vy += rnd(-0.07, 0.07);
    p.vx *= 0.93;
    p.vy *= 0.93;
    p.x  += p.vx;
    p.y  += p.vy;
    p.life = 0.45 + Math.sin(p.phase) * 0.45;
  } else {
    p.x  += p.vx + Math.sin(p.phase) * 0.45;
    p.y  += p.vy;
    p.vy += 0.04;
    p.vx *= 0.993;
    p.rot += p.vr;
    p.life -= 0.0030;
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function drawParticle(
  ctx: CanvasRenderingContext2D, p: Particle, type: ParticleKind, frame: number
) {
  if (p.life <= 0) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = Math.min(1, p.life);

  switch (p.shape) {
    case "petal":
      ctx.rotate(p.rot);
      drawFlower(ctx, p.r, p.h, p.s, p.l, frame);
      break;
    case "star4":
      ctx.rotate(p.rot);
      drawSparkle(ctx, p.r, p.h, p.s, p.l);
      break;
    case "diamond":
      ctx.rotate(p.rot);
      drawDiamond(ctx, p.r, p.h, p.s, p.l);
      break;
    case "star5":
      if (type === "gold") {
        ctx.shadowColor = `hsl(${p.h},95%,78%)`;
        ctx.shadowBlur  = p.r * 1.6;
      }
      ctx.rotate(p.rot);
      drawStar5(ctx, p.r, p.h, p.s, p.l);
      if (type === "gold") ctx.shadowBlur = 0;
      break;
    default: {
      if (type === "firefly") {
        ctx.shadowColor = `hsl(${p.h},80%,75%)`;
        ctx.shadowBlur  = 10;
      }
      const alpha = Math.min(1, p.life) * (0.58 + 0.30 * Math.sin(frame * 0.05 + p.phase));
      drawDot(ctx, p.r, p.h, p.s, p.l, alpha);
      if (type === "firefly") ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ParticleCanvas({
  type,
  dense,
  onComplete,
}: {
  type: ParticleKind | null;
  dense?: boolean;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!type) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const mobile = typeof window !== "undefined" && window.innerWidth < 768;
    const base =
      type === "sakura"    ? 46
      : type === "gold"    ? 130
      : type === "water"   ? 70
      : type === "firefly" ? 35
      : 45;
    const count = Math.max(14, Math.round(base * (mobile ? 0.55 : 1) * (dense ? 1.35 : 1)));
    const particles = initParticles(type, count);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DURATION = 260;
    let frame = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fadeAlpha = frame < DURATION ? 1 : Math.max(0, 1 - (frame - DURATION + 1) / 30);
      ctx.globalAlpha = fadeAlpha;

      for (const p of particles) {
        update(p, type);
        drawParticle(ctx, p, type, frame);
      }

      ctx.globalAlpha = 1;
      frame += 1;
      if (frame > DURATION + 29) { onComplete(); return; }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [type, dense, onComplete]);

  if (!type) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden />;
}
