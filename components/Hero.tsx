"use client";

import { BlurReveal } from "@/registry/spell-ui/blur-reveal";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const heading = "Research, motion, and code — in one head.";
const subheading =
  "AI-native full-stack designer — from research to shipped code.";
const credentialLinkClass =
  "font-medium text-textPrimary transition-colors hover:text-nltLime focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 22]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative pt-20 text-textPrimary md:pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-content flex-col justify-center px-6 pb-24 pt-24 md:min-h-[640px] md:pb-28 md:pt-32 lg:min-h-[720px]">
        <motion.div
          style={{ y: textY }}
          className="max-w-xl text-left md:max-w-[34rem] lg:max-w-[40rem]"
        >
          <motion.h1
            id="hero-heading"
            className="cursor-default touch-manipulation font-display text-[2.25rem] font-light leading-[1.05] tracking-[-0.012em] text-textPrimary sm:text-5xl md:text-6xl lg:text-[4.25rem] lg:leading-[1.02] xl:text-[4.75rem]"
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

          <BlurReveal className="flex flex-col items-start text-left" delay={0.2} duration={0.72}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-textSecondary md:mt-6 md:text-xl">
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

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-black/[0.08] bg-white/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary backdrop-blur-md sm:text-[11px] sm:tracking-[0.16em] md:mt-6"
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

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: reduced ? 0 : 1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="mt-8 flex flex-wrap items-center gap-4 md:mt-10"
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
      </div>
    </section>
  );
}
