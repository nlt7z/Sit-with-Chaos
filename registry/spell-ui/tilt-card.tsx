"use client";

import { useReducedMotion } from "framer-motion";
import {
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

export type TiltCardProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Max tilt in degrees (rotateX / rotateY). */
  tiltLimit?: number;
  /** Scale while pointer is over the card. */
  scale?: number;
  /** CSS perspective in px on the card’s own transform chain. */
  perspective?: number;
};

/** Pointer‑driven 3D tilt; respects prefers-reduced-motion. */
export function TiltCard({
  children,
  className,
  tiltLimit = 10,
  scale: hoverScale = 1.05,
  perspective = 1200,
  style,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sc: 1 });

  const move = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      setTilt({
        ry: nx * tiltLimit,
        rx: -ny * tiltLimit,
        sc: hoverScale,
      });
    },
    [hoverScale, reduced, tiltLimit, onPointerMove],
  );

  const leave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      setHovered(false);
      setTilt({ rx: 0, ry: 0, sc: 1 });
    },
    [onPointerLeave],
  );

  const transform = reduced
    ? undefined
    : `perspective(${perspective}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale3d(${tilt.sc},${tilt.sc},${tilt.sc})`;

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className ?? ""}`.trim()}
      style={{
        transform,
        transformStyle: reduced ? undefined : "preserve-3d",
        transition: reduced
          ? undefined
          : hovered
            ? "transform 75ms linear"
            : "transform 480ms cubic-bezier(0.22,1,0.36,1)",
        ...style,
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        setHovered(true);
        if (!reduced) setTilt((prev) => ({ ...prev, sc: hoverScale }));
      }}
      onPointerMove={move}
      onPointerLeave={leave}
      {...props}
    >
      {children}
    </div>
  );
}

export default TiltCard;
