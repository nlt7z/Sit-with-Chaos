"use client";

import { BlurReveal } from "@/registry/spell-ui/blur-reveal";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const heading = "I turn 60-minute docs into 2-minute products.";
const subheading =
  "AI-native full-stack designer — from research to shipped code.";
const credentialLinkClass =
  "underline decoration-black/[0.18] underline-offset-[3px] transition-[color,text-decoration-color] hover:text-textPrimary hover:decoration-black/40 focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const ref = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const pointerRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pointerRafRef.current !== null) cancelAnimationFrame(pointerRafRef.current);
    };
  }, []);

  const flushPointerToCssVars = () => {
    pointerRafRef.current = null;
    const spotlight = spotlightRef.current;
    if (!spotlight) return;
    spotlight.style.setProperty("--spot-x", `${pointerRef.current.x}px`);
    spotlight.style.setProperty("--spot-y", `${pointerRef.current.y}px`);
  };

  const queuePointerFlush = () => {
    if (pointerRafRef.current !== null) return;
    pointerRafRef.current = requestAnimationFrame(flushPointerToCssVars);
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 22]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative overflow-hidden bg-white pt-20 md:pt-16"
      aria-labelledby="hero-heading"
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        queuePointerFlush();
      }}
      onMouseLeave={() => {
        pointerRef.current = { x: -9999, y: -9999 };
        queuePointerFlush();
      }}
    >
      {/* Soft vignette — keeps the hero from feeling flat */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(15,23,42,0.04),transparent_58%),radial-gradient(ellipse_70%_45%_at_50%_92%,rgba(15,23,42,0.03),transparent_55%)]"
        aria-hidden
      />

      {/* Orbital orb — dim base always visible */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        initial={reduced ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <img
          src="/assets/hero-orb.png"
          alt=""
          draggable={false}
          className="select-none"
          style={{
            width: "clamp(280px, 90vw, 920px)",
            opacity: 0.18,
            mixBlendMode: "multiply",
            transform: "translateY(-4%)",
          }}
        />
      </motion.div>

      {/* Orbital orb — spotlight layer, follows cursor */}
      {!reduced && (
        <div
          ref={spotlightRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle 260px at var(--spot-x, -9999px) var(--spot-y, -9999px), black 0%, transparent 78%)",
            maskImage:
              "radial-gradient(circle 260px at var(--spot-x, -9999px) var(--spot-y, -9999px), black 0%, transparent 78%)",
          }}
        >
          <img
            src="/assets/hero-orb.png"
            alt=""
            draggable={false}
            className="select-none"
            style={{
              width: "clamp(280px, 90vw, 920px)",
              opacity: 0.62,
              mixBlendMode: "multiply",
              transform: "translateY(-4%)",
            }}
          />
        </div>
      )}

      {/* ── Introduction ───────────────────────────────────── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 px-6 pb-12 pt-24 text-center md:pb-16 md:pt-32 lg:pt-36"
      >
        <div className="flex flex-col items-center text-center">
          <motion.h1
            id="hero-heading"
            className="mx-auto max-w-4xl cursor-default touch-manipulation font-display text-4xl font-light leading-tight text-textPrimary md:text-6xl lg:text-7xl"
            initial={reduced ? false : { opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 220,
                    damping: 26,
                    mass: 0.75,
                    delay: 0.06,
                  }
            }
          >
            {heading}
          </motion.h1>

          <BlurReveal className="flex flex-col items-center text-center" delay={0.2} duration={0.72}>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-textSecondary md:mt-5 md:text-xl">
              {subheading}
            </p>

            <p className="mt-3 font-mono text-sm text-textSecondary md:mt-4">
              MS @{" "}
              <a
                href="https://www.hcde.washington.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className={credentialLinkClass}
              >
                UW HCDE
              </a>
              {"  ·  "}UX Designer @{" "}
              <a
                href="https://www.alibabacloud.com/en?_p_lc=5&utm_content=se_1016865603&gclid=Cj0KCQjwh-HPBhCIARIsAC0p3cdFPZetcbRsE45aW3HtGIhQErVmw69gjQ65dhIasOASijh7Pp-WmckaAjc6EALw_wcB"
                target="_blank"
                rel="noopener noreferrer"
                className={credentialLinkClass}
              >
                Alibaba
              </a>
            </p>

            {/* Status strip — open to work, timezone, base */}
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary backdrop-blur-sm md:mt-5"
            >
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                {!reduced && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-70" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
              </span>
              Open to work
              <span aria-hidden className="text-textSecondary/40">·</span>
              PST
              <span aria-hidden className="text-textSecondary/40">·</span>
              Seattle / San Francisco
            </motion.p>
          </BlurReveal>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: reduced ? 0 : 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mt-7 flex flex-wrap items-center justify-center gap-4 md:mt-8"
        >
          <motion.a
            href="#work"
            whileHover={reduced ? undefined : { y: -2 }}
            whileTap={reduced ? undefined : { y: 1 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="group/cta relative overflow-hidden rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-400 hover:ring-nltLime/40 hover:shadow-[0_16px_36px_-14px_rgba(184,229,50,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2"
          >
            <span className="relative z-10 inline-flex items-center gap-1.5">
              Explore Work
              <span
                aria-hidden
                className="inline-block translate-x-0 transition-transform duration-300 ease-portfolio group-hover/cta:translate-x-1"
              >
                →
              </span>
            </span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
