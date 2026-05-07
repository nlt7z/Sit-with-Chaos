"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const capabilities = [
  {
    title: "AI-native Product Thinking",
    description:
      "Designing workflows where AI acts as a collaborator, not just a response generator.",
  },
  {
    title: "Motion as Interaction Logic",
    description:
      "Using motion to clarify state, hierarchy, feedback, and user confidence.",
  },
  {
    title: "Prototyping with Code",
    description:
      "Building interactive prototypes with HTML, CSS, React, and AI coding tools to move from idea to shipped experience faster.",
  },
] as const;

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      ref={ref}
      className="bg-white py-16 md:py-20 lg:py-24"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <p className="font-mono text-xs font-normal uppercase tracking-widest text-textSecondary">About</p>
        <h2
          id="about-heading"
          className="mt-4 max-w-[22ch] font-display text-2xl font-light leading-snug text-textPrimary md:mt-5 md:text-3xl lg:max-w-[28ch]"
        >
          Fine arts roots. AI-native practice.
        </h2>

        {/* Top row: copy + portrait — narrower measure + shorter portrait, vertically balanced */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:gap-y-10 xl:gap-x-12">
          <motion.div
            className="min-w-0 lg:col-span-7 lg:max-w-[min(100%,36rem)] lg:justify-self-start"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-base font-normal leading-relaxed text-textPrimary md:text-[17px] md:leading-relaxed">
              Yuan Fang is a product designer with roots in fine arts. Ten years across painting, spatial design, and
              digital products gave her something formal training rarely does: the ability to look at a messy system
              and see what it wants to become.
            </p>
            <p className="mt-4 text-base font-normal leading-relaxed text-textSecondary md:mt-5 md:text-[17px] md:leading-relaxed">
              She works where complex technology meets human behavior — making the powerful feel understandable,
              trustworthy, and worth returning to. Her process combines research, product thinking, and code, with AI
              at the core of how she thinks, not just how she builds.
            </p>
            <p className="mt-4 text-base font-normal leading-relaxed text-textPrimary md:mt-5 md:text-[17px] md:leading-relaxed">
              The goal is always the same: less like operating a tool, more like being guided through something.
            </p>
          </motion.div>

          <motion.div
            className="flex min-w-0 justify-center lg:col-span-5 lg:justify-end"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: prefersReducedMotion ? 0 : 0.06,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <motion.div
              className="w-full max-w-[min(100%,20rem)] sm:max-w-[22rem] lg:mx-0 lg:max-w-[min(100%,19rem)] xl:max-w-[min(100%,20.5rem)]"
              style={{ transformOrigin: "50% 55%" }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: [0, -2.2, 2.2, -1.3, 1.3, 0],
                      transition: { duration: 0.58, ease: [0.33, 1, 0.68, 1] },
                    }
              }
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-neutral-100 shadow-sm">
                <Image
                  src="/assets/about/profile.jpg"
                  alt="Portrait of Yuan Fang"
                  fill
                  sizes="(min-width: 1280px) 21rem, (min-width: 1024px) 19rem, (min-width: 640px) 22rem, 90vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Capabilities: stagger each item into view */}
        <motion.ul
          className="mt-10 grid gap-8 border-t border-[rgba(0,0,0,0.06)] pt-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 md:mt-12 md:grid-cols-3 md:gap-6 md:pt-10 lg:mt-11 lg:gap-8"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.1,
                delayChildren: prefersReducedMotion ? 0 : 0.05,
              },
            },
          }}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={inView ? "show" : prefersReducedMotion ? "show" : "hidden"}
        >
          {capabilities.map((item, index) => (
            <motion.li
              key={item.title}
              className="min-w-0"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.48, ease: [0.25, 0.1, 0.25, 1] },
                },
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary md:text-xs">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-lg font-light leading-snug text-textPrimary md:text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-textSecondary md:text-[15px] md:leading-relaxed">
                {item.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
