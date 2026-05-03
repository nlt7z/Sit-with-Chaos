"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const ease = [0.25, 0.1, 0.25, 1] as const;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const CONTACT_HEADLINE = "Let's build something amazing together.";

const letterRestTransition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

function ContactWaveHeading({
  id,
  className,
  variants,
  reduced,
}: {
  id: string;
  className: string;
  variants: typeof itemVariants | undefined;
  reduced: boolean | null;
}) {
  if (reduced) {
    return (
      <motion.h2 id={id} variants={variants} className={className}>
        Let&apos;s build something amazing together.
      </motion.h2>
    );
  }

  return (
    <motion.h2 id={id} variants={variants} className={`${className} cursor-default`}>
      {Array.from(CONTACT_HEADLINE).map((char, i) => {
        if (char === " ") {
          return (
            <span key={`space-${i}`} className="inline-block w-[0.3em] shrink-0">
              {"\u00A0"}
            </span>
          );
        }
        return (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block origin-bottom will-change-transform"
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: 0, rotate: 0 }}
            transition={letterRestTransition}
            whileHover={{
              y: [0, -13, 2, -5, 0],
              rotate: [0, -2.5, 2, -1, 0],
              transition: {
                duration: 0.55,
                times: [0, 0.22, 0.42, 0.68, 1],
                ease: [0.22, 1, 0.36, 1],
              },
            }}
          >
            {char === "'" ? "\u2019" : char}
          </motion.span>
        );
      })}
    </motion.h2>
  );
}

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
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial={prefersReducedMotion ? { opacity: 0, y: 24 } : "hidden"}
        animate={
          inView
            ? prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : "show"
            : prefersReducedMotion
              ? {}
              : "hidden"
        }
        transition={prefersReducedMotion ? { duration: 0.55, ease } : undefined}
      >
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="font-mono text-xs uppercase tracking-widest text-textSecondary"
        >
          Contact
        </motion.p>
        <ContactWaveHeading
          id="contact-heading"
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-8 font-display text-3xl font-light md:mt-10 md:text-5xl"
          reduced={prefersReducedMotion}
        />
        <motion.p
          id="contact-subheading"
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-textSecondary md:mt-8 md:text-base"
        >
          I&apos;m looking for teams designing the next generation of AI-native products — where
          interaction, trust, and system thinking matter.
        </motion.p>

        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-10 flex justify-center"
        >
          <motion.a
            href="mailto:fangyuanzero7@gmail.com"
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { y: 1 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="rounded-full bg-textPrimary px-10 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] transition-[opacity,box-shadow] duration-300 hover:opacity-90 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            Say hello
          </motion.a>
        </motion.div>

        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-12 flex items-center justify-center gap-8 font-mono text-sm"
        >
          <a
            href="https://linkedin.com/in/yuan-fang-66395725b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-textSecondary underline decoration-[rgba(0,0,0,0.08)] underline-offset-4 transition-colors hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/nlt7z"
            className="text-textSecondary underline decoration-[rgba(0,0,0,0.08)] underline-offset-4 transition-colors hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            GitHub
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
