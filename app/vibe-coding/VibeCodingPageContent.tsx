"use client";

import { VibeCodingShowrooms } from "@/components/VibeCodingShowrooms";
import Link from "next/link";

export function VibeCodingPageContent() {
  return (
    <section className="mx-auto max-w-content">
      <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Experiments</p>
      <h1
        className="mt-3 max-w-xl font-display text-2xl font-light lowercase leading-snug tracking-[-0.02em] text-textPrimary md:text-3xl"
      >
        Vibe coding
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
        Interactive prototypes and coded experiments — the things I build to think.
      </p>

      <div className="mt-8 md:mt-10">
        <VibeCodingShowrooms />
      </div>

      <Link
        href="/#work"
        className="mt-12 inline-block text-sm text-textPrimary underline decoration-[rgba(0,0,0,0.2)] underline-offset-4"
      >
        ← Back to selected work
      </Link>
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
