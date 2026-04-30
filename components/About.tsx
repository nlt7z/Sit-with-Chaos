"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const keywords = ["Curious", "Empathetic", "Driven"];

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      ref={ref}
      className="bg-white py-24 md:py-32"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">About</p>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <motion.div
            className="lg:col-span-7"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              id="about-heading"
              className="font-display text-3xl font-light leading-snug md:text-4xl"
            >
              Designing end-to-end experiences with systems thinking.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-textSecondary">
              Yuan Fang is a UX designer focused on AI-native workflows, rapid iteration, and turning
              ambiguous problems into coherent product direction. 
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-[rgba(0,0,0,0.08)] px-3 py-1 text-sm text-textSecondary"
                >
                  {kw}
                </span>
              ))}
            </div>

            <div className="mt-10 space-y-2 text-textSecondary">
              <p className="font-medium text-textPrimary">MS Human Centered Design &amp; Engineering</p>
              <p>University of Washington, Seattle</p>
            </div>
            <div className="mt-10 space-y-2 text-textSecondary">
              <p className="font-medium text-textPrimary">BFA Interactive Arts</p>
              <p>Pratt Institute, New York City</p>
            </div>

            
          </motion.div>

          <motion.div
            className="lg:col-span-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: prefersReducedMotion ? 0 : 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.08)] bg-neutral-100 shadow-sm lg:ml-auto">
              <Image
                src="/assets/about/profile.jpg"
                alt="Portrait of Yuan Fang"
                fill
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
