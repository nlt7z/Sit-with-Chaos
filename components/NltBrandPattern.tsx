"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState, type PointerEvent } from "react";

export type NltBrandPatternProps = {
  columns?: number;
  rows?: number;
  /** Approximate horizontal pitch between cell centers (matches hover distance math). */
  cellPitchX?: number;
  /** Approximate vertical pitch between cell centers. */
  cellPitchY?: number;
  /** Pointer falloff distance for lifting tokens. */
  influenceRadius?: number;
  /** Max vertical lift in px when pointer is over a cell. */
  liftPx?: number;
  gapClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
  /** Light footer vs dark footer text. */
  variant?: "light" | "dark";
};

/**
 * Playground “NLT Brand Pattern” — grid of NLT glyphs that lift toward the cursor (not halftone).
 */
export function NltBrandPattern({
  columns = 8,
  rows = 5,
  cellPitchX = 36,
  cellPitchY = 34,
  influenceRadius = 128,
  liftPx = 5,
  gapClassName = "gap-x-4 gap-y-3.5",
  labelClassName,
  wrapperClassName = "",
  variant = "light",
}: NltBrandPatternProps) {
  const prefersReducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<{ x: number; y: number } | null>(null);

  const cells = useMemo(
    () =>
      Array.from({ length: columns * rows }, (_, i) => ({
        row: Math.floor(i / columns),
        col: i % columns,
      })),
    [columns, rows],
  );

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHot({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    [prefersReducedMotion],
  );

  const onLeave = useCallback(() => setHot(null), []);

  const defaultLabel =
    variant === "dark"
      ? "select-none font-mono text-[16px] font-medium tracking-[0.08em] text-zinc-400/75"
      : "select-none font-mono text-[16px] font-medium tracking-[0.08em] text-black/65";

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`w-fit ${wrapperClassName}`.trim()}
    >
      <div
        className={`grid ${gapClassName}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {cells.map(({ row, col }, i) => {
          const cx = col * cellPitchX + cellPitchX / 2;
          const cy = row * cellPitchY + cellPitchY / 2;
          const d = hot ? Math.hypot(hot.x - cx, hot.y - cy) : 999;
          const t = Math.max(0, 1 - d / influenceRadius);
          const y = prefersReducedMotion ? 0 : -t * liftPx;
          const o = variant === "dark" ? 0.35 + t * 0.45 : 0.38 + t * 0.38;
          const s = 1.02 + t * 0.12;

          return (
            <span
              key={i}
              className={labelClassName ?? defaultLabel}
              style={{
                opacity: o,
                transform: `translate3d(0, ${y}px, 0) scale(${s})`,
                transition:
                  "transform 180ms cubic-bezier(0.22,1,0.36,1), opacity 180ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              NLT
            </span>
          );
        })}
      </div>
    </div>
  );
}
