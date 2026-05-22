"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { SiteWindow } from "./SiteWindow";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

/** Two shipped sites surfaced as live browser-chrome previews. */
const sitePreviews = [
  {
    href: "https://qbix.space",
    url: "qbix.space",
    label: "Qbix — live site preview",
    meta: "Solo · designed + shipped",
  },
  {
    href: "https://hancao.space",
    url: "hancao.space",
    label: "Hancao — live site preview",
    meta: "Solo · designed + shipped",
  },
] as const;

export function HomeMagicGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const prefersReducedMotion = useReducedMotion();
  const reduced = !!prefersReducedMotion;

  return (
    <section
      id="magic"
      ref={ref}
      className="border-t border-[rgba(0,0,0,0.06)] bg-white py-20 md:py-28"
      aria-labelledby="magic-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : reduced ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: easePortfolio }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">End-to-end Builds</p>
          <h2
            id="magic-heading"
            className="mt-3 max-w-2xl font-display text-2xl font-light leading-snug tracking-[-0.01em] text-textPrimary md:text-3xl"
          >
            One person, one throughline.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
            Concept, logic, visuals, code, ship — end-to-end ownership with the creative instinct behind every decision.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : reduced ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: reduced ? 0 : 0.06, ease: easePortfolio }}
          role="list"
          aria-label="Live site previews"
        >
          {sitePreviews.map((item) => (
            <div key={item.url} role="listitem" className="min-w-0">
              <SiteWindow
                href={item.href}
                url={item.url}
                label={item.label}
                meta={item.meta}
                active={inView}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
