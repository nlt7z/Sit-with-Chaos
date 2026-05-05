"use client";

import { BlurReveal } from "@/registry/spell-ui/blur-reveal";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const heading = "Hello, I'm Yuan Fang.";
const subheading =
  "Designing AI-native products with AI — from research to shipped code.";
const credentialLinkClass =
  "underline decoration-black/[0.18] underline-offset-[3px] transition-[color,text-decoration-color] hover:text-textPrimary hover:decoration-black/[0.35] focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2";
const heroHalftoneSrc = "/assets/Playground/nlt_halftone_dense_v3.html";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const ref = useRef<HTMLElement | null>(null);
  const [halftoneMounted, setHalftoneMounted] = useState(false);
  const [halftoneHovered, setHalftoneHovered] = useState(false);
  const [vendingSwitchOn, setVendingSwitchOn] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const vendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (vendingTimerRef.current) clearTimeout(vendingTimerRef.current);
    };
  }, []);

  // Mount the iframe on first paint; unmount when section leaves viewport to reclaim memory.
  useEffect(() => {
    if (reduced) return;
    const section = ref.current;
    if (!section) return;

    let io: IntersectionObserver | null = null;

    const attach = () => {
      io = new IntersectionObserver(
        ([e]) => setHalftoneMounted(e.isIntersecting),
        { threshold: 0, rootMargin: "24px 0px" },
      );
      io.observe(section);
    };

    // Defer slightly so the page paints first, then load the iframe.
    let idleCb: number | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    if (typeof requestIdleCallback !== "undefined") {
      idleCb = requestIdleCallback(attach, { timeout: 600 });
    } else {
      fallback = setTimeout(attach, 120);
    }

    return () => {
      if (idleCb !== undefined && typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleCb);
      if (fallback !== undefined) clearTimeout(fallback);
      io?.disconnect();
    };
  }, [reduced]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const halftoneY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -48]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 22]);

  const handleVendingSwitch = () => {
    if (vendingSwitchOn) return;
    if (reduced) {
      router.push("/vending");
      return;
    }
    setVendingSwitchOn(true);
    vendingTimerRef.current = setTimeout(() => {
      vendingTimerRef.current = null;
      router.push("/vending");
    }, 300);
  };

  return (
    <section
      id="hero"
      ref={ref}
      className="relative overflow-hidden bg-white pt-14 md:pt-16"
      aria-labelledby="hero-heading"
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setMousePos({ x: -9999, y: -9999 })}
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
            width: "clamp(480px, 72vw, 920px)",
            opacity: 0.18,
            mixBlendMode: "multiply",
            transform: "translateY(-4%)",
          }}
        />
      </motion.div>

      {/* Orbital orb — spotlight layer, follows cursor */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{
            WebkitMaskImage: `radial-gradient(circle 260px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 78%)`,
            maskImage: `radial-gradient(circle 260px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 78%)`,
          }}
        >
          <img
            src="/assets/hero-orb.png"
            alt=""
            draggable={false}
            className="select-none"
            style={{
              width: "clamp(480px, 72vw, 920px)",
              opacity: 0.62,
              mixBlendMode: "multiply",
              transform: "translateY(-4%)",
            }}
          />
        </div>
      )}

      {/* ── NLT Halftone — hover to reveal ────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="relative w-full overflow-hidden"
        style={{ y: halftoneY }}
      >
        <div className="flex justify-center px-5 pt-3 md:px-10 md:pt-4">
          <div className="w-full max-w-[min(32rem,72vw)]">
            {/* Canvas logical ratio 620×260 — clip edges so only the letterform band shows */}
            <div
              className="relative mx-auto aspect-[620/260] w-full overflow-hidden bg-transparent"
              onMouseEnter={() => setHalftoneHovered(true)}
              onMouseLeave={() => setHalftoneHovered(false)}
            >
              <motion.div
                className="absolute inset-0"
                animate={
                  reduced
                    ? { opacity: 1, filter: "blur(0px)" }
                    : {
                        opacity: halftoneHovered ? 1 : 0,
                        filter: halftoneHovered ? "blur(0px)" : "blur(12px)",
                      }
                }
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {!reduced && halftoneMounted ? (
                  <iframe
                    src={heroHalftoneSrc}
                    title="NLT Halftone — interactive"
                    loading="eager"
                    scrolling="no"
                    className="pointer-events-auto absolute left-1/2 top-[52%] h-[145%] w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0 md:h-[138%] md:w-[112%]"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-[#f0f0f3]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Introduction — tight to halftone ───────────────────────────────────── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 px-6 pb-20 pt-3 text-center md:pb-28 md:pt-4"
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
          className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-7"
        >
          <motion.a
            href="#work"
            whileHover={reduced ? undefined : { y: -2 }}
            whileTap={reduced ? undefined : { y: 1 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            Explore Work
          </motion.a>
          <motion.div
            whileHover={reduced ? undefined : { y: -2 }}
            whileTap={reduced ? undefined : { y: 1 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="inline-block"
          >
            <Link
              href="/resume"
              className="inline-flex rounded-full border border-[rgba(0,0,0,0.1)] bg-white/95 px-8 py-3 text-sm font-medium text-textPrimary shadow-[0_10px_26px_-18px_rgba(0,0,0,0.22)] backdrop-blur-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
            >
              Resume
            </Link>
          </motion.div>
        </motion.div>

        {!reduced && (
          <motion.a
            href="#work"
            aria-label="Scroll to work"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-10 flex flex-col items-center gap-2 text-textSecondary/30 transition-colors hover:text-textSecondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            <motion.svg
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 5.5L8 11l6-5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.a>
        )}

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: reduced ? 0 : 1.48 }}
          className="mt-4 flex justify-center"
        >
          <button
            type="button"
            role="switch"
            aria-checked={vendingSwitchOn}
            aria-busy={vendingSwitchOn}
            aria-label="Switch to vending machine view"
            onClick={handleVendingSwitch}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-transparent px-2 py-2 transition-colors hover:border-black/[0.07] hover:bg-neutral-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2 disabled:cursor-wait"
            disabled={vendingSwitchOn}
          >
            <span
              className={`relative h-[1.375rem] w-[2.625rem] shrink-0 rounded-full border transition-[border-color,background-color] duration-300 ease-out ${
                vendingSwitchOn
                  ? "border-[#c9a030]/55 bg-[#c9a030]/22"
                  : "border-black/[0.12] bg-neutral-200/80 group-hover:border-black/[0.18] group-hover:bg-neutral-200"
              }`}
              aria-hidden
            >
              <span
                className={`pointer-events-none absolute left-[3px] top-1/2 size-[1.125rem] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  vendingSwitchOn ? "translate-x-[1.125rem]" : "translate-x-0"
                }`}
              />
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                vendingSwitchOn ? "text-textSecondary/75" : "text-textSecondary/50 group-hover:text-textSecondary"
              }`}
            >
              Vending Machine
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
