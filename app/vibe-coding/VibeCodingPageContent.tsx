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

      <Link href="/#work" className="group mt-20 block">
        <div className="relative overflow-hidden rounded-2xl bg-[#0c0c10] px-8 py-12 md:px-14 md:py-16 transition-colors duration-700 group-hover:bg-[#13131a]">
          {/* Subtle radial glow that follows hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{ background: "radial-gradient(ellipse 60% 55% at 30% 50%, rgba(255,255,255,0.04), transparent)" }} />

          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/25">Portfolio</p>

          <div className="mt-5 flex items-end justify-between gap-6">
            <h2 className="font-display text-5xl font-light leading-[1.08] text-white md:text-7xl">
              Selected<br />Work
            </h2>
            <div className="mb-1 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 group-hover:-translate-y-1">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="opacity-40 transition-opacity duration-500 group-hover:opacity-90 md:h-14 md:w-14">
                <path d="M10 30L30 10M30 10H14M30 10V26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

/** @deprecated Use `VibeCodingPageContent` */
export const PlaygroundPageContent = VibeCodingPageContent;
