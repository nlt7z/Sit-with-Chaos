"use client";

/**
 * BlueGradientBackground
 * ----------------------------------------------------------------------------
 * A flowing blue mesh gradient inspired by a soft "sky / film" backdrop:
 *  - a slowly drifting diagonal base ramp
 *  - several large light blobs that travel along their own looping paths at
 *    different speeds & directions → organic, aurora-like flow
 *  - fine film grain: crisp static SVG noise + a subtle "boiling" shimmer
 *
 * Two palettes:
 *  - "vivid" — deep navy → sky → near-white, bold (dark pages / heroes)
 *  - "soft"  — pale sky-blue wash, low-contrast (light, airy UIs)
 *
 *   <div className="relative min-h-screen">
 *     <BlueGradientBackground palette="soft" />
 *     <main className="relative z-10"> … </main>
 *   </div>
 */

import { useId, type CSSProperties } from "react";

type Palette = "vivid" | "soft";

type Props = {
  /** Extra classes for the root layer (e.g. positioning / radius). */
  className?: string;
  /** Pin to the viewport instead of the parent. Default: absolute. */
  fixed?: boolean;
  /** Colour preset. Default "vivid". */
  palette?: Palette;
  /** Grain strength 0–1. Default 0.1 — delicate. */
  grain?: number;
  /** Animate the flow + grain boil. Default true. */
  animate?: boolean;
  /** Overall motion speed multiplier. >1 = faster. Default 1. */
  speed?: number;
  /**
   * Deepen the bottom edge with a colour wash (CSS colour string).
   * Adds contrast behind floating glass cards so they read as translucent.
   */
  bottomShade?: string;
};

// Fine fractal-noise tile, crisp and resolution-independent.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// Palette presets → exposed to CSS as custom properties.
const PALETTES: Record<Palette, Record<string, string>> = {
  vivid: {
    "--bgg-canvas": "#163a6b",
    "--bgg-base":
      "linear-gradient(148deg, #112f60 0%, #1c4a8c 24%, #2f74c8 46%, #5aa3e2 64%, #8fc8ef 80%, #d8edfb 94%, #eef7fd 100%)",
    "--bgg-b1a": "rgba(220,240,252,0.95)",
    "--bgg-b1b": "rgba(170,215,245,0.40)",
    "--bgg-b2a": "rgba(86,163,230,0.85)",
    "--bgg-b2b": "rgba(86,163,230,0.30)",
    "--bgg-b3a": "rgba(10,28,64,0.80)",
    "--bgg-b3b": "rgba(13,38,82,0.28)",
    "--bgg-b4a": "rgba(240,248,253,0.90)",
    "--bgg-b4b": "rgba(198,230,249,0.34)",
    "--bgg-b5a": "rgba(120,200,240,0.70)",
    "--bgg-b5b": "rgba(120,200,240,0.26)",
  },
  // Pale, airy milk-blue — fresh, creamy, sits gently behind light UIs.
  soft: {
    "--bgg-canvas": "#eef8fa",
    "--bgg-base":
      "linear-gradient(150deg, #f1fafb 0%, #e6f5f9 28%, #daeff5 52%, #d1ebf3 68%, #e4f5f9 84%, #f2fafd 96%, #fafdfe 100%)",
    "--bgg-b1a": "rgba(255,255,255,0.85)",
    "--bgg-b1b": "rgba(221,243,248,0.44)",
    "--bgg-b2a": "rgba(160,214,232,0.42)",
    "--bgg-b2b": "rgba(160,214,232,0.14)",
    "--bgg-b3a": "rgba(158,200,224,0.26)",
    "--bgg-b3b": "rgba(184,216,230,0.10)",
    "--bgg-b4a": "rgba(255,255,255,0.82)",
    "--bgg-b4b": "rgba(226,245,250,0.32)",
    "--bgg-b5a": "rgba(186,226,240,0.40)",
    "--bgg-b5b": "rgba(186,226,240,0.14)",
  },
};

export default function BlueGradientBackground({
  className = "",
  fixed = false,
  palette = "vivid",
  grain = 0.1,
  animate = true,
  speed = 1,
  bottomShade,
}: Props) {
  const uid = useId().replace(/[:]/g, "");
  const a = animate ? "" : "bgg-static";
  const s = (sec: number) => `${(sec / speed).toFixed(2)}s`;
  const vars = {
    ...PALETTES[palette],
    ...(bottomShade ? { "--bgg-shade": bottomShade } : {}),
  } as CSSProperties;

  return (
    <div
      aria-hidden
      className={`bgg-root ${fixed ? "bgg-fixed" : "bgg-abs"} ${a} ${className}`}
      data-uid={uid}
      style={vars}
    >
      {/* drifting diagonal base ramp */}
      <div className="bgg-base" />
      {/* flowing light blobs */}
      <div className="bgg-blob bgg-blob1" />
      <div className="bgg-blob bgg-blob2" />
      <div className="bgg-blob bgg-blob3" />
      <div className="bgg-blob bgg-blob4" />
      <div className="bgg-blob bgg-blob5" />
      {/* bottom deepening wash */}
      {bottomShade && <div className="bgg-shade" />}
      {/* fine static grain — texture */}
      <div className="bgg-grain bgg-grain-static" />
      {/* boiling grain — life */}
      <div className="bgg-grain bgg-grain-boil" />

      <style jsx>{`
        .bgg-root {
          inset: 0;
          overflow: hidden;
          isolation: isolate;
          background: var(--bgg-canvas);
          pointer-events: none;
        }
        .bgg-abs {
          position: absolute;
        }
        .bgg-fixed {
          position: fixed;
          z-index: -1;
        }

        /* ── base diagonal ramp — oversized & slowly panning ───────────── */
        .bgg-base {
          position: absolute;
          inset: -60%;
          background: var(--bgg-base);
          background-size: 200% 200%;
          animation: bgg-pan ${s(34)} ease-in-out infinite;
        }

        /* ── flowing light blobs ───────────────────────────────────────── */
        .bgg-blob {
          position: absolute;
          width: 95%;
          height: 95%;
          border-radius: 50%;
          filter: blur(8px);
          will-change: transform, opacity;
        }
        .bgg-blob1 {
          left: 30%;
          top: -10%;
          background: radial-gradient(circle at center, var(--bgg-b1a), var(--bgg-b1b) 42%, transparent 68%);
          mix-blend-mode: screen;
          animation: bgg-flow1 ${s(22)} ease-in-out infinite;
        }
        .bgg-blob2 {
          left: -20%;
          top: 20%;
          background: radial-gradient(circle at center, var(--bgg-b2a), var(--bgg-b2b) 45%, transparent 70%);
          mix-blend-mode: screen;
          animation: bgg-flow2 ${s(28)} ease-in-out infinite;
        }
        .bgg-blob3 {
          left: 5%;
          top: -25%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle at center, var(--bgg-b3a), var(--bgg-b3b) 46%, transparent 70%);
          mix-blend-mode: multiply;
          animation: bgg-flow3 ${s(31)} ease-in-out infinite;
        }
        .bgg-blob4 {
          left: 20%;
          top: 55%;
          background: radial-gradient(circle at center, var(--bgg-b4a), var(--bgg-b4b) 44%, transparent 70%);
          mix-blend-mode: screen;
          animation: bgg-flow4 ${s(19)} ease-in-out infinite;
        }
        .bgg-blob5 {
          left: 55%;
          top: 35%;
          width: 70%;
          height: 70%;
          background: radial-gradient(circle at center, var(--bgg-b5a), var(--bgg-b5b) 46%, transparent 72%);
          mix-blend-mode: screen;
          animation: bgg-flow5 ${s(25)} ease-in-out infinite;
        }

        /* ── bottom deepening wash ──────────────────────────────────────── */
        .bgg-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 46%, var(--bgg-shade) 100%);
        }

        /* ── grain ──────────────────────────────────────────────────────── */
        .bgg-grain {
          position: absolute;
          inset: 0;
          background-image: ${NOISE};
          background-size: 180px 180px;
        }
        .bgg-grain-static {
          opacity: ${0.5 * grain};
          mix-blend-mode: overlay;
        }
        .bgg-grain-boil {
          opacity: ${grain};
          mix-blend-mode: soft-light;
          animation: bgg-boil ${s(0.9)} steps(4) infinite;
        }

        /* ── keyframes ──────────────────────────────────────────────────── */
        @keyframes bgg-pan {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        @keyframes bgg-flow1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-34%, 28%) scale(1.25);
          }
          66% {
            transform: translate(22%, 52%) scale(0.95);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes bgg-flow2 {
          0% {
            transform: translate(0, 0) scale(1.05);
          }
          33% {
            transform: translate(46%, 18%) scale(1.3);
          }
          66% {
            transform: translate(30%, -22%) scale(1);
          }
          100% {
            transform: translate(0, 0) scale(1.05);
          }
        }
        @keyframes bgg-flow3 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40%, 36%) scale(1.18);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes bgg-flow4 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(26%, -30%) scale(1.22);
          }
          66% {
            transform: translate(-30%, -14%) scale(0.95);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes bgg-flow5 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-44%, -28%) scale(1.28);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes bgg-boil {
          0% {
            transform: translate3d(0, 0, 0);
          }
          25% {
            transform: translate3d(-6%, 4%, 0);
          }
          50% {
            transform: translate3d(5%, -5%, 0);
          }
          75% {
            transform: translate3d(-4%, -3%, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        /* pause everything when requested or for reduced-motion users */
        .bgg-static .bgg-base,
        .bgg-static .bgg-blob,
        .bgg-static .bgg-grain-boil {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .bgg-base,
          .bgg-blob,
          .bgg-grain-boil {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
