"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { SplitTextChars } from "@/components/SplitBtn";

/**
 * SideRail — the section switch shown on the three top-level surfaces: Home
 * (the bento), Work and Lab.
 *
 * Desktop: a Linear-style nav panel pinned to the far-left edge. One graphite
 * surface with a hairline border and a glassy top edge; one text label per
 * row. Corners match the bento cards (22px panel, 4px side inset, 18px rows).
 * The current section is a lime row with dark text; a quiet
 * highlight slides after the pointer between rows (the Vercel nav hover), and
 * labels roll on hover like the "Say hello" button.
 * Mobile: a floating pill nav along the bottom edge.
 */

const ITEMS: { key: "home" | "work" | "lab"; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "lab", label: "Lab", href: "/vibe-coding" },
];

export function SideRail({ active }: { active: "home" | "work" | "lab" }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <nav aria-label="Sections" className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <div
          className="flex w-[80px] flex-col gap-2 rounded-[22px] border border-white/[0.08] bg-[#0f1011]/85 px-1 py-1.5 backdrop-blur-md"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)" }}
          onMouseLeave={() => setHovered(null)}
        >
          {ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                onMouseEnter={() => setHovered(key)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                className={`group relative flex h-10 items-center justify-center whitespace-nowrap rounded-[18px] px-3 text-[13px] font-medium tracking-[-0.01em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none active:scale-[0.97] ${
                  on ? "text-[#0a0b0c]" : "text-[#8a8f98] hover:text-[#f7f8f8] focus-visible:text-[#f7f8f8]"
                }`}
              >
                {/* current section — a lifted row */}
                {on ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-[18px] bg-nltLime"
                    style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.35)" }}
                  />
                ) : null}
                {/* hover — one highlight that glides between rows */}
                <AnimatePresence>
                  {hovered === key && !on ? (
                    <motion.span
                      aria-hidden
                      layoutId="rail-hover"
                      className="absolute inset-0 rounded-[18px] bg-white/[0.045]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={reduced ? { duration: 0 } : { duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    />
                  ) : null}
                </AnimatePresence>
                <span className="sr-only">{label}</span>
                {/* line box sized to the glyph boxes so the rolling letters sit
                    on the row's true centre */}
                <span aria-hidden className="relative flex items-center leading-[1.1]">
                  <SplitTextChars text={label} stagger={14} />
                </span>
                {/* focus ring drawn inside the row */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[18px] opacity-0 ring-1 ring-inset ring-nltLime/60 group-focus-visible:opacity-100" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile — a floating pill nav centered along the bottom edge. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:hidden"
      >
        <div
          className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#0f1011]/90 p-1.5 backdrop-blur-md"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.5)" }}
        >
          {ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 ${
                  on ? "bg-nltLime text-[#0a0b0c]" : "text-[#8a8f98] active:text-[#f7f8f8]"
                }`}
                
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
