"use client";

import { useEffect, useRef } from "react";

function drawDisc(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  rx: number, ry: number,
  angle: number,
  lightColor: string,
  darkColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowBlur = 14;
  ctx.shadowColor = "rgba(80,80,80,0.12)";
  const g = ctx.createLinearGradient(-rx * 0.78, -ry * 0.78, rx * 0.78, ry * 0.78);
  g.addColorStop(0, lightColor);
  g.addColorStop(1, darkColor);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}

function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  lightColor: string,
  darkColor: string
) {
  const hx = x - r * 0.32;
  const hy = y - r * 0.32;
  const g = ctx.createRadialGradient(hx, hy, r * 0.02, x, y, r);
  g.addColorStop(0, lightColor);
  g.addColorStop(1, darkColor);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

export default function FloatingGeometryPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let animId: number;
    let startTime: number | null = null;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function render(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const t = (timestamp - startTime) / 1000;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      // Use the smaller dimension to keep proportions on any viewport
      const s = Math.min(w, h) * 0.82;

      // Multi-frequency oscillators for organic motion
      const A = Math.sin(t * 0.38);
      const B = Math.sin(t * 0.27 + 1.1);
      const C = Math.sin(t * 0.44 + 2.3);
      const D = Math.cos(t * 0.31 + 0.7);
      const E = Math.cos(t * 0.41 + 1.5);

      // Background
      ctx.fillStyle = "#eeeeee";
      ctx.fillRect(0, 0, w, h);

      // Group anchor point (floats very slightly)
      const cx = w * 0.5 + B * 3;
      const cy = h * 0.44 + A * 3;

      // --- Element parameters ---
      const ldx  = cx - s * 0.12  + A * s * 0.012;
      const ldy  = cy + s * 0.008 + B * s * 0.010;
      const ldRx = s * 0.225      + C * s * 0.004;
      const ldRy = s * 0.122      + D * s * 0.010; // tilt breathing
      const ldAng = -0.30         + A * 0.052;

      const rdx  = cx + s * 0.088 + B * s * 0.010;
      const rdy  = cy - s * 0.068 + A * s * 0.012;
      const rdRx = s * 0.182      + D * s * 0.004;
      const rdRy = s * 0.097      + E * s * 0.008;
      const rdAng = 0.37          - B * 0.048;

      const csx  = cx - s * 0.006 + C * s * 0.006;
      const csy  = cy - s * 0.038 + A * s * 0.010;
      const csr  = s * 0.072      + D * s * 0.003;

      const lsx  = cx - s * 0.092 + A * s * 0.006;
      const lsy  = cy + s * 0.052 + B * s * 0.007;
      const lsr  = s * 0.055      + C * s * 0.002;

      const gsx  = cx + s * 0.052 + B * s * 0.005;
      const gsy  = cy + s * 0.048 + C * s * 0.005;
      const gsr  = s * 0.036      + A * s * 0.002;

      // 1. Ground shadow
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.translate(cx, cy + s * 0.155 + A * 3);
      ctx.scale(2.4, 0.36);
      const shadowG = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.18);
      shadowG.addColorStop(0,   "rgba(0,0,0,0.13)");
      shadowG.addColorStop(0.45,"rgba(0,0,0,0.06)");
      shadowG.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = shadowG;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Lower-left sphere (behind left disc)
      drawSphere(ctx, lsx, lsy, lsr, "#5e5e5e", "#161616");

      // 3. Left disc (large, light gray)
      drawDisc(ctx, ldx, ldy, ldRx, ldRy, ldAng, "#e8e8e8", "#aaaaaa");

      // 4. Right disc (medium, slightly darker)
      drawDisc(ctx, rdx, rdy, rdRx, rdRy, rdAng, "#dbdbdb", "#9c9c9c");

      // 5. Center sphere (darkest — the anchor)
      drawSphere(ctx, csx, csy, csr, "#525252", "#0d0d0d");

      // 6. Ghost sphere (semi-transparent, barely visible)
      drawSphere(ctx, gsx, gsy, gsr, "rgba(248,248,248,0.42)", "rgba(200,200,200,0.04)");

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#eeeeee" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
