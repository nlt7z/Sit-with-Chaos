"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "yf-intro-played-v1";

const BAR_DELAY = 120;
const BAR_DURATION = 720;
const EXIT_AT = 1050;
const TOTAL_DURATION = 1300;

type Phase = "idle" | "playing" | "exit";

export function IntroAnimation() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);

  // Decide whether to play (data-intro is set pre-paint by the inline
  // script in app/layout.tsx — only present on first session visit to the
  // homepage). The pathname check is a belt-and-braces guard: even if the
  // dataset flag survives a client-side nav, we still won't play anywhere
  // except `/`.
  useEffect(() => {
    if (pathname !== "/") return;
    const root = document.documentElement;
    if (root.dataset.intro !== "pending") return;

    if (reduced) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      delete root.dataset.intro;
      return;
    }

    setPhase("playing");
  }, [reduced, pathname]);

  // Timeline driver
  useEffect(() => {
    if (phase !== "playing") return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const exitTimer = setTimeout(() => {
      // Drop the veil at the same moment the overlay starts fading, so the
      // hero reveal feels like one continuous beat.
      delete document.documentElement.dataset.intro;
      setPhase("exit");
    }, EXIT_AT);

    const doneTimer = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      document.body.style.overflow = prevOverflow;
      setPhase("idle");
    }, TOTAL_DURATION);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [phase]);

  // Tween the percentage counter in sync with the bar fill
  useEffect(() => {
    if (phase !== "playing") return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start - BAR_DELAY) / BAR_DURATION;
      if (t <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const c = Math.min(t, 1);
      const eased = 1 - Math.pow(1 - c, 3);
      setPercent(Math.round(eased * 100));
      if (c < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <motion.div
      aria-hidden
      // pointer-events-none: the overlay is pure decoration and the page
      // underneath has its own scroll-lock while playing — leaving it
      // pointer-active means a stale mount (HMR, fade interrupted) silently
      // eats every click on the page.
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#07080A]"
      initial={{ opacity: 1 }}
      animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Subtle grid texture for "system" feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="pointer-events-none relative flex flex-col items-center">
        {/* Keycap + lime halo */}
        <div className="relative flex h-[180px] w-[180px] items-center justify-center md:h-[200px] md:w-[200px]">
          {/* Outer halo */}
          <motion.div
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,229,50,0.35) 0%, rgba(184,229,50,0.08) 38%, transparent 68%)",
              filter: "blur(18px)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phase === "exit"
                ? { opacity: 0, scale: 0.9 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Breath ring */}
          <motion.div
            className="absolute h-[160px] w-[160px] rounded-full border border-nltLime/20 md:h-[180px] md:w-[180px]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              phase === "exit"
                ? { opacity: 0, scale: 1.1 }
                : { opacity: 1, scale: [0.95, 1.04, 0.98] }
            }
            transition={{
              duration: phase === "exit" ? 0.3 : 1.6,
              ease: "easeInOut",
              times: phase === "exit" ? undefined : [0, 0.55, 1],
            }}
          />

          {/* Keycap */}
          <motion.img
            src="/assets/logo.png"
            alt=""
            draggable={false}
            fetchPriority="high"
            decoding="async"
            className="relative z-10 select-none drop-shadow-[0_8px_24px_rgba(184,229,50,0.25)]"
            style={{ width: 132 }}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={
              phase === "exit"
                ? { opacity: 0, y: -8, scale: 1.06 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Progress bar + caption */}
        <motion.div
          className="relative z-10 mt-10 flex w-[220px] flex-col items-stretch md:mt-12 md:w-[280px]"
          initial={{ opacity: 0, y: 8 }}
          animate={
            phase === "exit"
              ? { opacity: 0 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
        >
          {/* Track */}
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/[0.08]">
            {/* Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 right-0 origin-left rounded-full bg-gradient-to-r from-nltLime/60 via-nltLime to-nltLime"
              style={{ boxShadow: "0 0 14px rgba(184,229,50,0.6)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: BAR_DURATION / 1000,
                delay: BAR_DELAY / 1000,
                ease: [0.33, 1, 0.68, 1],
              }}
            />
          </div>

          {/* Status row */}
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span>{percent >= 100 ? "Ready" : "Loading"}</span>
            <span className="tabular-nums text-nltLime/90">
              {String(Math.min(percent, 100)).padStart(3, "0")}
            </span>
          </div>
        </motion.div>

        {/* Brand mark */}
        <motion.p
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.36em] text-white/25 md:-bottom-28"
          initial={{ opacity: 0 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.5, ease: "linear" }}
        >
          Yuan Fang &nbsp;·&nbsp; Portfolio &nbsp;·&nbsp; 2026
        </motion.p>
      </div>
    </motion.div>
  );
}
