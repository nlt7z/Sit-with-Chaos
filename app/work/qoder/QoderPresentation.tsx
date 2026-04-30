"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function QoderPresentation() {
  const reduce = useReducedMotion();

  return (
    <main className="bg-white pb-24 pt-28 text-left md:pb-32 md:pt-32">
      <div className="mx-auto max-w-content px-6 md:px-10 lg:px-12">
        <header className="max-w-4xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-textSecondary"
          >
            Alibaba · Qoder
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: reduce ? 0 : 0.06, ease }}
            className="mt-5 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-light leading-[1.05] tracking-tight text-textPrimary"
          >
            Agentic coding platform for real software
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.12, ease }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-textSecondary md:text-xl"
          >
            Product design for an AI-native IDE where autonomous agents ship production code — with context
            engineering, traceable decisions, and flows that stay legible when the machine moves fast.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: reduce ? 0 : 0.18, ease }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {["AI Agent", "Vibe Coding", "Product Design", "2025"].map((t) => (
              <span
                key={t}
                className="border border-black/[0.08] bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary"
              >
                {t}
              </span>
            ))}
          </motion.div>
        </header>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.22, ease }}
          className="relative mt-16 border border-black/[0.08] bg-neutral-50 md:mt-20"
        >
          <div className="aspect-video w-full overflow-hidden bg-black">
            <video
              className="h-full w-full object-cover"
              src="/assets/work/qoder.mp4"
              aria-label="Qoder product preview"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          </div>
        </motion.div>

        <section className="mt-24 border-t border-black/[0.06] pt-20 md:mt-28 md:pt-24">
          <Reveal>
            <h2 className="font-display text-2xl font-light text-textPrimary md:text-3xl">Why this product matters</h2>
            <p className="mt-6 max-w-3xl text-base leading-[1.75] text-textSecondary md:text-lg">
              Developers are asked to trust agents with repo-wide changes. The interface has to make{" "}
              <strong className="font-medium text-textPrimary">intent, scope, and rollback</strong> obvious — not
              only model output. Qoder sits at that intersection: agentic power with product-grade clarity.
            </p>
          </Reveal>
        </section>

        <section className="mt-20 md:mt-24">
          <Reveal delay={0.04}>
            <h2 className="font-display text-2xl font-light text-textPrimary md:text-3xl">Design focus</h2>
            <ul className="mt-8 max-w-3xl space-y-5 text-base leading-[1.75] text-textSecondary md:text-lg">
              {[
                "Context surfaces — what the agent sees, edits, and proposes, without burying the user in tokens.",
                "Progressive disclosure for multi-file refactors: summaries first, diffs on demand, actions reversible.",
                "Trust cues for autonomous runs — run boundaries, affected paths, and stop / refine affordances.",
                "Coherence with engineering mental models — terminals, branches, and reviews stay one gesture away.",
              ].map((line) => (
                <li key={line} className="flex gap-4">
                  <span className="mt-2.5 h-px w-8 shrink-0 bg-textPrimary/20" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="mt-20 md:mt-24">
          <Reveal delay={0.06}>
            <h2 className="font-display text-2xl font-light text-textPrimary md:text-3xl">What we shipped (at a glance)</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Scope", value: "IDE + agent orchestration UX" },
                { label: "Role", value: "Product design" },
                { label: "Stack", value: "Web · LLM tooling" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="border border-black/[0.06] bg-white px-5 py-6"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary">{c.label}</p>
                  <p className="mt-2 font-display text-lg font-light text-textPrimary">{c.value}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <Reveal className="mt-20 md:mt-24" delay={0.08}>
          <p className="max-w-3xl text-base leading-[1.75] text-textSecondary md:text-lg">
            Full write-up, research artifacts, and detailed flows can extend this page later — this deck is a
            concise walkthrough after access.
          </p>
          <Link
            href="/#work"
            className="group mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-textSecondary transition-colors hover:text-textPrimary"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Back to selected work
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
