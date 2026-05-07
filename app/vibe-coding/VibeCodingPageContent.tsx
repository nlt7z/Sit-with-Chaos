"use client";

import { TurntableWidget } from "@/components/TurntableWidget";
import { VibeCodingShowrooms } from "@/components/VibeCodingShowrooms";
import Link from "next/link";

export function VibeCodingPageContent() {
  return (
    <section className="mx-auto max-w-content">
      <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Experiments</p>
      <h1
        className="mt-3 max-w-xl font-display text-2xl font-light lowercase leading-snug tracking-[-0.02em] text-textPrimary md:text-3xl"
      >
        Coding
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
        Shipped code and interactive prototypes — the things I build to think.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-light lowercase tracking-[-0.01em] text-textPrimary md:text-2xl">
          vibe coding
        </h2>
        <div className="mt-6">
          <VibeCodingShowrooms lead={<TurntableWidget />} />
        </div>
      </section>

      <section className="mt-12 md:mt-14">
        <h2 className="font-display text-xl font-light lowercase tracking-[-0.01em] text-textPrimary md:text-2xl">
          website design
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
          Help engineer rebrand real work.
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-sm" style={{ aspectRatio: "1728/1117" }}>
          <iframe
            title="Han Cao personal website"
            src="https://hancao.space/"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="mt-3 flex justify-end px-0.5">
          <Link
            href="https://hancao.space/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-textPrimary underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Open →
          </Link>
        </div>
      </section>

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
