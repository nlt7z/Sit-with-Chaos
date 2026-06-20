"use client";

/**
 * BentoCard — the draggable "widget" primitive behind the bento homepage.
 *
 *   • drag — grab the window header and pull; the card is tethered to its home
 *     cell and springs back (dragListener off so the body stays interactive).
 *   • hover glow — a cursor-tracked lime bloom blooms OUTSIDE the border + a
 *     lime border ring (the homepage work-card effect); the interior stays calm.
 *   • entrance — a spring scale-in as the board mounts (staggered by index).
 *
 * Structure: a non-clipping outer (drag + glow that bleeds past the edge) wraps
 * a clipped inner (surface, rounding, header + body).
 */

import { motion, useDragControls, useReducedMotion } from "framer-motion";
import { type CSSProperties, type PointerEvent, type ReactNode, useState } from "react";

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
  light = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  label?: string;
  surface?: Surface;
  index?: number;
  drag?: boolean;
  accent?: string;
  /** Light theme — drops the heavy drop shadow. */
  light?: boolean;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState(false);

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag && !reduced) controls.start(e);
  };

  return (
    <motion.div
      className={`group relative ${className}`}
      drag={drag && !reduced}
      dragListener={false}
      dragControls={controls}
      dragConstraints={TETHER}
      dragElastic={0.32}
      dragTransition={{ bounceStiffness: 240, bounceDamping: 18 }}
      whileDrag={{ scale: 1.045, zIndex: 60, cursor: "grabbing" }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 130, damping: 18, delay: reduced ? 0 : index * 0.035 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setGlow(true)}
      onMouseLeave={() => setGlow(false)}
      style={style}
    >
      {/* clipped inner card — surface + content */}
      <div
        className={`relative z-10 flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] ${light ? "" : "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.6)]"} ${SURFACE[surface]}`}
      >
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
      </div>

      {/* hover glow — a lime gradient that lights only the rim NEAR the cursor
          (mask punches out the interior, so the block itself never fills). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[1.4rem] transition-opacity duration-300"
        style={{
          opacity: glow && !reduced ? 1 : 0,
          padding: "1.5px",
          background: `radial-gradient(150px circle at ${pos.x}px ${pos.y}px, rgba(210,255,0,0.75) 0%, rgba(210,255,0,0.18) 38%, transparent 68%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </motion.div>
  );
}
