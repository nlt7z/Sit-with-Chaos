"use client";

import { useEffect, useRef } from "react";
import type { ParticleKind } from "./fortunes";

const ACTIVE_FRAMES = 300;
const FADE_FRAMES = 50;

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  life: number;
  phase: number;
  /** gold: 0 coin, 1 spark */
  kind?: number;
  /** leaf: quad corners offset */
  q?: [number, number, number, number, number, number, number, number];
};

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createParticles(
  type: ParticleKind,
  w: number,
  h: number,
  mobile: boolean,
  dense: boolean,
): P[] {
  const half = mobile ? 0.5 : 1;
  const out: P[] = [];

  const pushBase = (partial: Partial<P> & Pick<P, "x" | "y" | "vx" | "vy" | "r" | "rot" | "vr" | "phase">) => {
    out.push({
      kind: 0,
      life: 1,
      ...partial,
    });
  };

  if (type === "sakura") {
    const count = Math.round(70 * half);
    for (let i = 0; i < count; i++) {
      pushBase({
        x: rnd(0, w),
        y: rnd(-100, 0),
        vx: rnd(-0.35, 0.35),
        vy: rnd(0.6, 1.8),
        r: rnd(6, 14),
        rot: rnd(0, Math.PI * 2),
        vr: rnd(-0.008, 0.008) * (Math.random() > 0.5 ? 1 : -1),
        phase: rnd(0, Math.PI * 2),
        life: rnd(0.72, 0.95),
        kind: Math.random() > 0.5 ? 1 : 0,
      });
    }
  } else if (type === "gold") {
    const sparks = Math.round(70 * half);
    const coins = Math.round(30 * half);
    for (let i = 0; i < sparks; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rnd(4, 9);
      pushBase({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rnd(2, 4),
        rot: rnd(0, Math.PI),
        vr: rnd(-0.2, 0.2),
        phase: rnd(0, 10),
        kind: 1,
      });
    }
    for (let i = 0; i < coins; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rnd(2, 6);
      pushBase({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rnd(6, 10),
        rot: 0,
        vr: 0,
        phase: rnd(0, 10),
        kind: 0,
      });
    }
  } else if (type === "water") {
    const count = Math.round(55 * half);
    for (let i = 0; i < count; i++) {
      pushBase({
        x: rnd(-60, 0),
        y: rnd(0, h),
        vx: rnd(3, 7),
        vy: rnd(-0.25, 0.25),
        r: rnd(5, 9),
        rot: 0.26,
        vr: 0,
        phase: rnd(0, Math.PI * 2),
        life: rnd(0.5, 0.82),
      });
    }
  } else if (type === "firefly") {
    const count = Math.round(28 * half);
    for (let i = 0; i < count; i++) {
      pushBase({
        x: rnd(0, w),
        y: rnd(0, h),
        vx: rnd(-0.6, 0.6),
        vy: rnd(-0.6, 0.6),
        r: rnd(2, 4),
        rot: 0,
        vr: 0,
        phase: rnd(0, Math.PI * 2),
      });
    }
  } else {
    const base = dense ? 60 : 45;
    const count = Math.round(base * half) + (dense ? Math.round(15 * half) : 0);
    for (let i = 0; i < count; i++) {
      const qw = rnd(4, 10);
      const qh = rnd(3, 8);
      pushBase({
        x: rnd(0, w),
        y: rnd(-80, 0),
        vx: rnd(-1.8, 1.8),
        vy: rnd(1.5, 3.5),
        r: qw,
        rot: rnd(0, Math.PI),
        vr: rnd(0.05, 0.18),
        phase: rnd(0, 10),
        q: [
          -qw / 2 + rnd(-2, 2),
          -qh / 2 + rnd(-2, 2),
          qw / 2 + rnd(-2, 2),
          -qh / 2 + rnd(-2, 2),
          qw / 2 + rnd(-2, 2),
          qh / 2 + rnd(-2, 2),
          -qw / 2 + rnd(-2, 2),
          qh / 2 + rnd(-2, 2),
        ],
      });
    }
  }

  return out;
}

function update(p: P, type: ParticleKind, frame: number, w: number, h: number) {
  if (type === "sakura") {
    p.x += p.vx + Math.sin(frame * 0.018 + p.phase) * 0.5;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > h + 50) {
      p.y = rnd(-80, -10);
      p.x = rnd(0, w);
    }
  } else if (type === "gold") {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.vy += p.kind === 1 ? 0.02 : 0.06;
    p.rot += p.vr;
  } else if (type === "water") {
    p.x += p.vx;
    p.y += Math.sin(frame * 0.045 + p.phase) * 0.45;
    if (p.x > w + 40) {
      p.x = rnd(-50, -10);
      p.y = rnd(0, h);
    }
  } else if (type === "firefly") {
    p.vx += rnd(-0.08, 0.08);
    p.vy += rnd(-0.08, 0.08);
    p.vx = Math.max(-2.2, Math.min(2.2, p.vx)) * 0.92;
    p.vy = Math.max(-2.2, Math.min(2.2, p.vy)) * 0.92;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    p.life = 0.5 + 0.4 * Math.sin(frame * 0.04 + p.phase);
  } else {
    p.x += p.vx + Math.sin(frame * 0.04 + p.phase) * 0.7;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > h + 40) {
      p.y = rnd(-60, -10);
      p.x = rnd(0, w);
    }
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: P,
  type: ParticleKind,
  frame: number,
  fadeOpacity: number,
) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);

  const pulse = type === "gold" ? Math.sin(frame * 0.3 + p.phase) * 0.4 + 0.6 : 1;
  const baseA = type === "firefly" ? p.life : type === "sakura" || type === "water" ? p.life : Math.min(1, pulse);
  ctx.globalAlpha = baseA * fadeOpacity;

  if (type === "sakura") {
    const pink = p.kind === 1 ? [251, 208, 222] : [244, 167, 192];
    ctx.fillStyle = `rgba(${pink[0]},${pink[1]},${pink[2]},0.92)`;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * p.r * 0.45, Math.sin(a) * p.r * 0.45, p.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "gold") {
    if (p.kind === 1) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + 0.4 * pulse})`;
      ctx.fillRect(-1, -3, 2, 6);
    } else {
      ctx.fillStyle = `rgba(240, 208, 96, ${0.55 + 0.25 * Math.sin(frame * 0.2 + p.phase)})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "water") {
    ctx.fillStyle = "rgba(184, 238, 248, 0.72)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, p.r * 0.55, 0.26, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "firefly") {
    ctx.shadowColor = "#c0f080";
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(192, 240, 128, ${0.3 + 0.6 * p.life})`;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (p.q) {
    const c = frame % 3;
    const cols = [
      [200, 120, 48],
      [160, 88, 32],
      [212, 160, 80],
    ];
    const [r0, g0, b0] = cols[c] ?? cols[0];
    ctx.fillStyle = `rgba(${r0},${g0},${b0},0.85)`;
    ctx.beginPath();
    ctx.moveTo(p.q[0], p.q[1]);
    ctx.lineTo(p.q[2], p.q[3]);
    ctx.lineTo(p.q[4], p.q[5]);
    ctx.lineTo(p.q[6], p.q[7]);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

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
    let completed = false;
    const mobile = typeof window !== "undefined" && window.innerWidth < 768;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const particles = createParticles(type, canvas.width, canvas.height, mobile, !!dense);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (type === "leaf") {
        const mist = dense ? 0.018 : 0.012;
        ctx.fillStyle = `rgba(30, 20, 10, ${mist})`;
        ctx.fillRect(0, 0, w, h);
      }

      const fadeOpacity =
        frame < ACTIVE_FRAMES ? 1 : Math.max(0, 1 - (frame - ACTIVE_FRAMES) / FADE_FRAMES);

      particles.forEach((p) => {
        update(p, type, frame, w, h);
        drawParticle(ctx, p, type, frame, fadeOpacity);
      });

      frame += 1;
      if (frame >= ACTIVE_FRAMES + FADE_FRAMES) {
        if (!completed) {
          completed = true;
          onComplete();
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [type, dense, onComplete]);

  if (!type) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[50]" aria-hidden />;
}
