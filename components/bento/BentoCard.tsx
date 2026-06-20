"use client";

/**
 * BentoCard — the draggable "widget" primitive behind the bento homepage.
 *
 * Motion (Framer Motion, already in the bundle):
 *   • drag — grab the window header and pull. The card is tethered to its home
 *     cell (dragConstraints pinned to a zero box) and resists with elastic give,
 *     so it feels like stretching a rubber band; release and it springs back.
 *     No rotation — the pull is straight, never a diagonal tilt. dragListener is
 *     off so the card BODY stays interactive (links, the 3D model's own orbit).
 *   • lift — whileHover scale; whileDrag scale + shadow + raised z.
 *   • entrance — a spring scale-in as the board mounts (staggered by index).
 */

import { motion, useDragControls, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent, type ReactNode } from "react";

// Pin the drag to the card's home position; dragElastic supplies the stretch.
const TETHER = { left: 0, right: 0, top: 0, bottom: 0 } as const;

type Surface = "dark" | "glass" | "light" | "lime";

const SURFACE: Record<Surface, string> = {
  dark: "bg-white/[0.035] border border-white/10 text-white",
  glass: "bg-white/[0.07] border border-white/15 text-white backdrop-blur-xl",
  light: "bg-[#f3f2ea] border border-black/[0.06] text-[#1d1d1f]",
  lime: "bg-nltLime border border-[#bfe21f] text-[#1d1d1f]",
};

export function BentoCard({
  children,
  className = "",
  bodyClassName = "",
  label,
  surface = "dark",
  index = 0,
  drag = true,
  accent = "#d2ff00",
  style,
}: {
  children: ReactNode;
  /** Grid placement + sizing (e.g. "lg:col-span-2 lg:row-span-2"). */
  className?: string;
  /** Extra classes on the inner body wrapper (below the drag header). */
  bodyClassName?: string;
  /** Tiny mono label shown at the right of the window header. */
  label?: string;
  surface?: Surface;
  /** Entrance stagger order. */
  index?: number;
  drag?: boolean;
  /** Header status-dot color. */
  accent?: string;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const controls = useDragControls();

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag && !reduced) controls.start(e);
  };

  return (
    <motion.div
      className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.6)] ${SURFACE[surface]} ${className}`}
      drag={drag && !reduced}
      dragListener={false}
      dragControls={controls}
      dragConstraints={TETHER}
      dragElastic={0.32}
      dragTransition={{ bounceStiffness: 240, bounceDamping: 18 }}
      whileDrag={{
        scale: 1.045,
        zIndex: 60,
        boxShadow: "0 55px 95px -40px rgba(0,0,0,0.8)",
        cursor: "grabbing",
      }}
      whileHover={reduced ? undefined : { scale: 1.015 }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 130, damping: 18, delay: reduced ? 0 : index * 0.035 }}
      style={style}
    >
      {/* window header — the drag handle (no dots). Body stays interactive. */}
      <div
        onPointerDown={startDrag}
        className={`flex shrink-0 select-none items-center justify-between px-3.5 pb-1 pt-2.5 ${
          drag ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ touchAction: "none" }}
      >
        {label ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] opacity-45">{label}</span>
        ) : (
          <span aria-hidden className="h-2 w-8 rounded-full bg-current opacity-[0.12]" />
        )}
      </div>

      <div className={`relative flex min-h-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </motion.div>
  );
}
