"use client";

import { experienceEntries } from "@/lib/experience";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="experience"
      ref={ref}
      className="bg-surfaceAlt py-24 md:py-32"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
            Experience
          </p>
          <h2 id="experience-heading" className="mt-3 font-display text-3xl font-light md:text-4xl">
            Path and craft.
          </h2>
        </motion.div>

        <div className="relative mt-16 pl-6 md:pl-10">
          <div
            className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(0,0,0,0.08)] md:left-[11px]"
            aria-hidden
          />

          <ul className="space-y-10">
            {experienceEntries.map((item, i) => (
              <motion.li
                key={`${item.company}-${item.period}`}
                className="relative grid grid-cols-1 gap-2 pl-6 sm:grid-cols-[1fr_auto] sm:items-baseline md:pl-8"
                initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
                animate={
                  inView ? { opacity: 1, x: 0 } : prefersReducedMotion ? { opacity: 1, x: 0 } : {}
                }
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : 0.08 * i,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <span
                  className={`absolute left-0 top-2 size-3.5 rounded-full border-2 md:top-2.5 ${
                    item.current
                      ? "border-textPrimary bg-textPrimary"
                      : "border-textPrimary bg-white"
                  }`}
                  aria-hidden
                />
                <div>
                  <p className="font-medium text-textPrimary">{item.company}</p>
                  <p className="text-sm text-textSecondary">{item.role}</p>
                </div>
                <p className="font-mono text-sm text-textSecondary sm:text-right">{item.period}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
