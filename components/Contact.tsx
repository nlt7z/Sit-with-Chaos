"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="contact"
      ref={ref}
      className="bg-white py-32 md:py-44"
      aria-labelledby="contact-heading"
      aria-describedby="contact-subheading"
    >
      <motion.div
        className="mx-auto max-w-content px-6 text-center"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Contact</p>
        <h2
          id="contact-heading"
          className="mt-8 font-display text-3xl font-light md:mt-10 md:text-5xl"
        >
          Let&apos;s build something amazing together.
        </h2>
        <p
          id="contact-subheading"
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-textSecondary md:mt-8 md:text-base"
        >
          I&apos;m looking for teams designing the next generation of AI-native products — where
          interaction, trust, and system thinking matter.
        </p>

        <div className="mt-16 flex flex-col items-center gap-8 font-mono text-sm md:mt-20 md:gap-10">
          <a
            href="mailto:fangyuanzero7@gmail.com"
            className="text-textPrimary underline decoration-[rgba(0,0,0,0.08)] underline-offset-4 transition-colors hover:text-textSecondary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            fangyuanzero7@gmail.com
          </a>
          <a
            href="https://linkedin.com/in/yuan-fang-66395725b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-textPrimary underline decoration-[rgba(0,0,0,0.08)] underline-offset-4 transition-colors hover:text-textSecondary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            LINKEDIN
          </a>
          <a
            href="https://github.com/nlt7z"
            className="text-textPrimary underline decoration-[rgba(0,0,0,0.08)] underline-offset-4 transition-colors hover:text-textSecondary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            GITHUB
          </a>
        </div>
      </motion.div>
    </section>
  );
}
