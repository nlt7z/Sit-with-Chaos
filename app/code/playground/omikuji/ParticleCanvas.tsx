"use client";

import { useEffect, useRef } from "react";
import type { ParticleKind } from "./fortunes";

type Base = { x: number; y: number; vx: number; vy: number; life: number; r: number; rot: number; vr: number };

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function initParticles(type: ParticleKind, count: number): Base[] {
  const w = typeof window !== "undefined" ? window.innerWidth : 800;
  const h = typeof window !== "undefined" ? window.innerHeight : 600;
  const out: Base[] = [];
  for (let i = 0; i < count; i++) {
    if (type === "sakura") {
      out.push({
        x: rnd(0, w),
        y: rnd(-80, 0),
        vx: rnd(-0.35, 0.35),
        vy: rnd(0.8, 2),
        life: rnd(0.4, 1),
        r: rnd(6, 14),
        rot: rnd(0, Math.PI * 2),
        vr: rnd(-0.04, 0.04),
      });
    } else if (type === "gold") {
      const a = Math.random() * Math.PI * 2;
      const sp = rnd(2, 5);
      out.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp + 0.35,
        life: rnd(0.5, 1),
        r: rnd(2, 5),
        rot: rnd(0, Math.PI * 2),
        vr: rnd(-0.15, 0.15),
      });
    } else if (type === "water") {
      out.push({
        x: rnd(-40, 0),
        y: rnd(0, h),
        vx: rnd(3, 6),
        vy: rnd(-0.25, 0.25),
        life: rnd(0.45, 0.95),
        r: rnd(4, 9),
        rot: rnd(-0.2, 0.2),
        vr: 0,
      });
    } else if (type === "firefly") {
      out.push({
        x: rnd(0, w),
        y: rnd(0, h),
        vx: rnd(-0.6, 0.6),
        vy: rnd(-0.6, 0.6),
        life: rnd(0.4, 1),
        r: rnd(2, 4),
        rot: 0,
        vr: 0,
      });
    } else {
      out.push({
        x: rnd(0, w),
        y: rnd(-60, 0),
        vx: rnd(-1.2, 1.2),
        vy: rnd(1.5, 3.2),
        life: rnd(0.5, 1),
        r: rnd(5, 11),
        rot: rnd(0, Math.PI),
        vr: rnd(0.02, 0.08),
      });
    }
  }
  return out;
}

function update(p: Base, type: ParticleKind, frame: number, w: number, h: number) {
  if (type === "sakura") {
    p.x += p.vx + Math.sin(frame * 0.02 + p.life * 10) * 0.35;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > h + 40) {
      p.y = rnd(-60, -10);
      p.x = rnd(0, w);
    }
  } else if (type === "gold") {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.rot += p.vr;
    p.life *= 0.997;
  } else if (type === "water") {
    p.x += p.vx;
    p.y += Math.sin(frame * 0.05 + p.r) * 0.4;
    if (p.x > w + 30) {
      p.x = -20;
      p.y = rnd(0, h);
    }
  } else if (type === "firefly") {
    p.vx += rnd(-0.08, 0.08);
    p.vy += rnd(-0.08, 0.08);
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    p.life = 0.45 + Math.sin(frame * 0.08 + p.r * 3) * 0.45;
  } else {
    p.x += p.vx + Math.sin(frame * 0.03) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > h + 30) {
      p.y = -20;
      p.x = rnd(0, w);
    }
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Base, type: ParticleKind, frame: number) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = Math.min(1, p.life);

  if (type === "sakura") {
    ctx.fillStyle = `rgba(244, 167, 185, ${0.55 + 0.25 * Math.sin(frame * 0.04)})`;
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * p.r * 0.45, Math.sin(a) * p.r * 0.45, p.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "gold") {
    const tw = 0.5 + 0.5 * Math.sin(frame * 0.12 + p.r);
    ctx.fillStyle = `rgba(240, 192, 64, ${0.35 + 0.55 * tw})`;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "water") {
    ctx.fillStyle = "rgba(126, 207, 218, 0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2, p.r, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "firefly") {
    ctx.shadowColor = "#b8f080";
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(184, 240, 128, ${0.45 + 0.45 * p.life})`;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = `rgba(212, 136, 42, ${0.55 + 0.2 * Math.sin(frame * 0.05)})`;
    ctx.fillRect(-p.r * 0.6, -p.r * 0.25, p.r * 1.2, p.r * 0.5);
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
    const mobile = typeof window !== "undefined" && window.innerWidth < 768;
    const base =
      type === "sakura"
        ? 80
        : type === "gold"
          ? 120
          : type === "water"
            ? 60
            : type === "firefly"
              ? 30
              : 40;
    const count = Math.max(12, Math.round(base * (mobile ? 0.5 : 1) * (dense ? 1.35 : 1)));
    const particles = initParticles(type, count);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DURATION = 240;
    let frame = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (type === "leaf") {
        ctx.fillStyle = "rgba(40,40,40,0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const alpha = frame < DURATION ? 1 : Math.max(0, 1 - (frame - DURATION + 1) / 30);
      ctx.globalAlpha = alpha;

      particles.forEach((p) => {
        update(p, type, frame, canvas.width, canvas.height);
        drawParticle(ctx, p, type, frame);
      });
      ctx.globalAlpha = 1;

      frame += 1;
      if (frame > DURATION + 29) {
        onComplete();
        return;
      }
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
