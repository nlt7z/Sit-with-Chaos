"use client";

import { useCallback, useEffect, useRef } from "react";

const CHARS = "  .:-=+*#";
const LIME = { r: 200, g: 255, b: 71 };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function charFromLevel(level: number): string {
  if (level <= 0) return CHARS[0] ?? " ";
  const idx = Math.min(CHARS.length - 1, Math.floor(level * CHARS.length));
  return CHARS[idx] ?? " ";
}

type Props = {
  className?: string;
  cols?: number;
  width?: number;
  text?: string;
};

export function YuanFangMobiusAscii({ className = "", cols = 82, width = 700, text = "NLT" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const hoverRef = useRef(false);
  const letterEnergyRef = useRef<number[]>([]);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const reduceRef = useRef(false);

  const buildTextMask = useCallback(
    (
      cw: number,
      ch: number,
      gridCols: number,
      gridRows: number,
    ): { mask: Float32Array; letterIndex: Int16Array; centers: { x: number; y: number }[] } => {
      const mask = new Float32Array(gridCols * gridRows);
      const letterIndex = new Int16Array(gridCols * gridRows);
      letterIndex.fill(-1);
      const centers = Array.from({ length: text.length }, (_, i) => ({
        x: ((i + 0.5) / text.length) * gridCols,
        y: gridRows * 0.5,
      }));

      const off = document.createElement("canvas");
      const w = gridCols * cw;
      const h = gridRows * ch;
      off.width = w;
      off.height = h;
      const ctx = off.getContext("2d");
      if (!ctx) return { mask, letterIndex, centers };

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      const fontSize = Math.min(h * 0.6, (w / Math.max(3, text.length + 0.8)) * 1.5);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `650 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.fillText(text, w / 2, h / 2);

      const img = ctx.getImageData(0, 0, w, h).data;
      let i = 0;
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const px = Math.floor(col * cw + cw / 2);
          const py = Math.floor(row * ch + ch / 2);
          const p = (py * w + px) * 4;
          const lum = (img[p]! + img[p + 1]! + img[p + 2]!) / (3 * 255);
          mask[i] = lum;
          if (lum > 0.08 && text.length > 0) {
            letterIndex[i] = Math.min(text.length - 1, Math.floor((col / gridCols) * text.length));
          }
          i++;
        }
      }

      const acc = Array.from({ length: text.length }, () => ({ x: 0, y: 0, c: 0 }));
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const idx = row * gridCols + col;
          const li = letterIndex[idx]!;
          if (li >= 0) {
            acc[li]!.x += col;
            acc[li]!.y += row;
            acc[li]!.c += 1;
          }
        }
      }
      for (let li = 0; li < text.length; li++) {
        const a = acc[li]!;
        if (a.c > 0) centers[li] = { x: a.x / a.c, y: a.y / a.c };
      }

      return { mask, letterIndex, centers };
    },
    [text],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      reduceRef.current = mq.matches;
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const aspect = 0.38;
    const height = Math.round(width * aspect);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gridRows = Math.max(16, Math.round(cols * aspect));
    const cw = width / cols;
    const ch = height / gridRows;
    const { mask, letterIndex, centers } = buildTextMask(cw, ch, cols, gridRows);
    letterEnergyRef.current = Array.from({ length: text.length }, () => 0);

    const render = () => {
      const dt = reduceRef.current ? 0 : 1 / 60;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, width, height);

      let active = 0;
      if (hoverRef.current && pointerRef.current && text.length > 0) {
        const nx = clamp(pointerRef.current.x / width, 0, 0.9999);
        active = Math.floor(nx * text.length);
      } else if (text.length > 0) {
        active = Math.floor((t * 0.75) % text.length);
      }

      for (let i = 0; i < letterEnergyRef.current.length; i++) {
        const target = i === active ? 1 : 0;
        const speed = reduceRef.current ? 1 : i === active ? 0.14 : 0.08;
        letterEnergyRef.current[i]! += (target - letterEnergyRef.current[i]!) * speed;
      }

      const avg = letterEnergyRef.current.length
        ? letterEnergyRef.current.reduce((a, b) => a + b, 0) / letterEnergyRef.current.length
        : 0;

      const glow = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.62);
      glow.addColorStop(0, `rgba(${LIME.r},${LIME.g},${LIME.b},${0.03 + avg * 0.14})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - avg * 0.65)})`;
      ctx.lineWidth = 1;
      const lineGap = Math.max(9, Math.round(cw));
      for (let x = 0; x <= width; x += lineGap) {
        const wave = reduceRef.current ? 0 : Math.sin(t * 1.25 + x * 0.018) * 1.8;
        ctx.beginPath();
        ctx.moveTo(x + 0.5 + wave, 0);
        ctx.lineTo(x + 0.5 + wave, height);
        ctx.stroke();
      }

      ctx.font = `${Math.max(8, Math.min(cw, ch) * 0.92)}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
      ctx.textBaseline = "top";

      let idx = 0;
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < cols; col++) {
          const m = mask[idx]!;
          if (m < 0.06) {
            idx++;
            continue;
          }

          const li = letterIndex[idx]!;
          const energy = li >= 0 ? letterEnergyRef.current[li]! : 0;
          const center = li >= 0 ? centers[li]! : { x: cols * 0.5, y: gridRows * 0.5 };
          const dx = col - center.x;
          const dy = row - center.y;
          const dist = Math.hypot(dx, dy);
          const radial = 1 - smoothstep(2, Math.max(cols, gridRows) * 0.45, dist);

          // Horizontal dispersion dominates (word turns into many horizontal lines).
          const spread = energy * radial;
          const wave = reduceRef.current ? 0 : Math.sin(t * 2.5 + col * 0.19 + row * 0.43) * 0.34;
          const level = clamp(m * (0.85 + wave * 0.14), 0, 1);
          const glyph = charFromLevel(level);
          if (glyph === " ") {
            idx++;
            continue;
          }

          const pushX = reduceRef.current ? 0 : dx * spread * 0.95;
          const pushY = reduceRef.current ? 0 : dy * spread * 0.08;
          const flowX = reduceRef.current ? 0 : Math.sin(t * 2.45 + row * 0.36) * spread * 2.2;
          const flowY = reduceRef.current ? 0 : Math.cos(t * 1.9 + col * 0.14) * spread * 0.35;
          const x = col * cw + pushX + flowX;
          const y = row * ch + pushY + flowY;

          // Default white; hover energy blends into lime.
          const limeMix = clamp(energy * (0.35 + radial * 0.9), 0, 1);
          const base = 242;
          const rr = Math.round(base + (LIME.r - base) * limeMix);
          const gg = Math.round(base + (LIME.g - base) * limeMix);
          const bb = Math.round(base + (LIME.b - base) * limeMix);
          const alpha = clamp(0.36 + m * 0.64 - spread * 0.34, 0.12, 1);
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
          ctx.fillText(glyph, x, y);
          idx++;
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildTextMask, cols, text.length, width]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="NLT ASCII animation: white idle, lime hover with horizontal dispersion"
      className={`relative cursor-crosshair select-none ${className}`}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseMove={(e) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
        pointerRef.current = null;
      }}
      onFocus={() => {
        hoverRef.current = true;
      }}
      onBlur={() => {
        hoverRef.current = false;
        pointerRef.current = null;
      }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        className="block rounded-2xl bg-[#080808] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_-16px_rgba(0,0,0,0.9)]"
      />
    </div>
  );
}
