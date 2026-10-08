"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { revealVariants, STAGGER } from "@/lib/motion";

/**
 * CaseHero — the dark opening band every case study shares.
 *
 * Case studies open dark and read light: this band continues the /work card
 * the visitor clicked (same canvas, white brand mark, mono company line,
 * display title, muted intro), then the article below runs on white. The band
 * is `data-surface="dark"`, so the rails (tone "auto") switch to their dark
 * tone while it is under them.
 *
 * `children` is the page's own hero body: metrics, the hero media, meta rows.
 * `aside` (a phone prototype) sits to the right of the text from lg up.
 */
export function CaseHero({
  id = "overview",
  logo,
  company,
  kicker,
  title,
  lead,
  intro,
  actions,
  aside,
  children,
}: {
  id?: string;
  /** Square brand mark, knocked to white (the same file /work uses). */
  logo: string;
  company: string;
  /** Continues the company line: "Meituan · Local Services". */
  kicker?: string;
  title: ReactNode;
  /** One larger line under the title. */
  lead?: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const reduced = !!useReducedMotion();
  const item = reduced ? undefined : revealVariants;

  return (
    <header id={id} data-surface="dark" className="relative scroll-mt-0 overflow-hidden bg-[#0a0b0c] text-white">
      {/* the /work canvas: lime wash + dot matrix from the top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 45% at 85% 0%, rgba(210,255,0,0.08), rgba(10,11,12,0) 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(110% 80% at 88% 0%, black 0%, transparent 60%)",
          maskImage: "radial-gradient(110% 80% at 88% 0%, black 0%, transparent 60%)",
        }}
      />

      <motion.div
        className="relative mx-auto max-w-content px-6 pb-16 pt-16 md:px-[84px] md:pb-24 md:pt-24"
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={reduced ? undefined : { hidden: {}, visible: { transition: { staggerChildren: STAGGER, delayChildren: 0.06 } } }}
        >
          <div className={aside ? "lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16" : ""}>
            <div>
            <motion.p variants={item} className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" aria-hidden className="h-4 w-4 object-contain brightness-0 invert" />
              <span>
                {company}
                {kicker ? <span className="text-white/45"> · {kicker}</span> : null}
              </span>
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-5 max-w-[22ch] text-balance font-display text-[clamp(2.3rem,5vw,3.75rem)] font-light leading-[1.04] tracking-[-0.03em] text-white"
            >
              {title}
            </motion.h1>

            {lead ? (
              <motion.p variants={item} className="mt-6 max-w-[44rem] text-[18px] leading-[1.5] tracking-[-0.01em] text-white">
                {lead}
              </motion.p>
            ) : null}
            {intro ? (
              <motion.div variants={item} className={`${lead ? "mt-4" : "mt-6"} max-w-[44rem] space-y-4 text-[16px] leading-[1.65] text-white/65`}>
                {intro}
              </motion.div>
            ) : null}

            {actions ? (
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
                {actions}
              </motion.div>
            ) : null}

            {children ? (
              <motion.div variants={item} className="mt-12 md:mt-16">
              {children}
            </motion.div>
          ) : null}
          </div>
          {aside ? (
            <motion.div variants={item} className="mt-12 lg:mt-0">
              {aside}
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </header>
  );
}
