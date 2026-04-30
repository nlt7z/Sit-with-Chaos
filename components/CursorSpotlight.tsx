"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Point = { x: number; y: number };

function usePointerFine() {
  const [fine, setFine] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(pointer: fine)");
    const onChange = () => setFine(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return fine;
}

export function CursorSpotlight() {
  const prefersReducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion || !pointerFine) return;

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setActive(true);
    };

    const onLeave = () => setActive(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion, pointerFine]);

  const style = useMemo(() => {
    if (!active) return undefined;
    return {
      background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(0,0,0,0.06), transparent 55%)`,
    } as React.CSSProperties;
  }, [active, pos.x, pos.y]);

  if (prefersReducedMotion || !pointerFine) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-100 transition-opacity duration-500 ease-portfolio"
      style={style}
    />
  );
}

