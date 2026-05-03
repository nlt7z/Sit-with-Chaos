"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const keywords = ["Curious", "Empathetic", "Driven"];

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
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">About</p>

        {/* Top row: copy + portrait — shorter than stacking everything in one column */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:items-start lg:gap-10">
          <motion.div
            className="lg:col-span-6"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              id="about-heading"
              className="font-display text-2xl font-light leading-snug text-textPrimary md:text-3xl lg:max-w-[22ch]"
            >
              Designing AI-native products that feel clear, alive, and trustworthy.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-textSecondary md:mt-5 md:text-[17px] md:leading-relaxed">
              
            </p>
            <p className="mt-4 text-base leading-relaxed text-textSecondary md:mt-5 md:text-[17px] md:leading-relaxed">
              Yuan Fang is a UX designer shaped by over 10 years of fine arts training, bringing strong visual
              judgment and taste to AI-native workflows, rapid iteration, and the translation of ambiguity into clear
              product direction.
            </p>
            <p className="mt-4 text-base leading-relaxed text-textSecondary md:mt-5 md:text-[17px] md:leading-relaxed">
            I’m interested in the space between systems and humans — where complex technology needs to become understandable, trustworthy, and emotionally usable. My work blends research, product thinking, motion, and code to make AI experiences feel less like tools and more like guided workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 md:mt-6">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-[rgba(0,0,0,0.08)] px-2.5 py-0.5 text-xs text-textSecondary md:px-3 md:py-1 md:text-sm"
                >
                  {kw}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.55,
              delay: prefersReducedMotion ? 0 : 0.06,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-neutral-100 shadow-sm sm:max-w-lg lg:ml-auto lg:aspect-[5/6] lg:max-w-md">
              <Image
                src="/assets/about/profile.jpg"
                alt="Portrait of Yuan Fang"
                fill
                sizes="(min-width: 1024px) 36rem, (min-width: 640px) 28rem, 90vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>

        {/* Capabilities: one row on md+ to cut vertical scroll */}
        <motion.ul
          className="mt-10 grid gap-8 border-t border-[rgba(0,0,0,0.06)] pt-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 md:mt-12 md:grid-cols-3 md:gap-6 md:pt-10 lg:mt-11 lg:gap-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: prefersReducedMotion ? 0 : 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {capabilities.map((item, index) => (
            <li key={item.title} className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary md:text-xs">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-lg font-light leading-snug text-textPrimary md:text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-textSecondary md:text-[15px] md:leading-relaxed">
                {item.description}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
