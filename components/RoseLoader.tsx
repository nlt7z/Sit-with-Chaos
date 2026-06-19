"use client";

import { useEffect, useRef } from "react";

/**
 * RoseLoader — the homepage preloader's animated centerpiece.
 *
 * A rose curve (r = a·cos(3θ)) traced by a comet of fading particles, slowly
 * rotating and "breathing" (a detailScale pulse swells the petals) so the
 * loader reads as alive rather than a static mark. Ported from the
 * math-curve-loaders "Rose Three" demo and recoloured to the nltLime brand.
 *
 * Rendered imperatively against refs: the rAF loop mutates 76 particle nodes +
 * one guide path every frame, which would be wasteful as React state. The svg
 * uses `currentColor`, so the lime tint comes from the `color` style below.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const CONFIG = {
  particleCount: 76,
  trailSpan: 0.31,
  durationMs: 5300,
  rotationDurationMs: 28000,
  pulseDurationMs: 4400,
  strokeWidth: 4.6,
  roseA: 9.2,
  roseABoost: 0.6,
  roseBreathBase: 0.72,
  roseBreathBoost: 0.28,
  roseScale: 3.25,
  pathSteps: 480,
} as const;

function point(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2;
  const a = CONFIG.roseA + detailScale * CONFIG.roseABoost;
  const r =
    a * (CONFIG.roseBreathBase + detailScale * CONFIG.roseBreathBoost) * Math.cos(3 * t);
  return {
    x: 50 + Math.cos(t) * r * CONFIG.roseScale,
    y: 50 + Math.sin(t) * r * CONFIG.roseScale,
  };
}

const normalizeProgress = (p: number) => ((p % 1) + 1) % 1;

function buildPath(detailScale: number) {
  let d = "";
  for (let i = 0; i <= CONFIG.pathSteps; i += 1) {
    const pt = point(i / CONFIG.pathSteps, detailScale);
    d += `${i === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)} `;
  }
  return d.trim();
}

export function RoseLoader({
  color = "#d2ff00",
  reduced = false,
  className = "h-full w-full",
}: {
  color?: string;
  reduced?: boolean;
  className?: string;
}) {
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    const path = pathRef.current;
    if (!group || !path) return;

    // Reduced motion — draw the rose once, brighter, and hold it still.
    if (reduced) {
      path.setAttribute("d", buildPath(0.85));
      path.setAttribute("opacity", "0.9");
      return;
    }

    // Comet particles, created imperatively so the loop can mutate them without
    // re-rendering. They trail behind the head along the curve and fade out.
    const particles: SVGCircleElement[] = [];
    for (let i = 0; i < CONFIG.particleCount; i += 1) {
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("fill", "currentColor");
      group.appendChild(c);
      particles.push(c);
    }

    const getDetailScale = (time: number) => {
      const pulse = (time % CONFIG.pulseDurationMs) / CONFIG.pulseDurationMs;
      return 0.52 + ((Math.sin(pulse * Math.PI * 2 + 0.55) + 1) / 2) * 0.48;
    };
    const getRotation = (time: number) =>
      -((time % CONFIG.rotationDurationMs) / CONFIG.rotationDurationMs) * 360;

    const start = performance.now();
    let raf = 0;
    const render = (now: number) => {
      const time = now - start;
      const progress = (time % CONFIG.durationMs) / CONFIG.durationMs;
      const detailScale = getDetailScale(time);

      group.setAttribute("transform", `rotate(${getRotation(time)} 50 50)`);
      path.setAttribute("d", buildPath(detailScale));

      for (let i = 0; i < particles.length; i += 1) {
        const tailOffset = i / (CONFIG.particleCount - 1);
        const pt = point(
          normalizeProgress(progress - tailOffset * CONFIG.trailSpan),
          detailScale,
        );
        const fade = Math.pow(1 - tailOffset, 0.56);
        const node = particles[i];
        node.setAttribute("cx", pt.x.toFixed(2));
        node.setAttribute("cy", pt.y.toFixed(2));
        node.setAttribute("r", (0.9 + fade * 2.7).toFixed(2));
        node.setAttribute("opacity", (0.04 + fade * 0.96).toFixed(3));
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      particles.forEach((c) => c.remove());
    };
  }, [reduced]);

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
      style={{
        color,
        overflow: "visible",
        filter: "drop-shadow(0 0 8px rgba(210,255,0,0.45))",
      }}
    >
      <g ref={groupRef}>
        <path
          ref={pathRef}
          stroke="currentColor"
          strokeWidth={CONFIG.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.1}
        />
      </g>
    </svg>
  );
}
