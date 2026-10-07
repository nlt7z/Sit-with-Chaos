"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

/**
 * SideRail — the section switch shown on the three top-level surfaces: Home
 * (the bento), Work and Lab.
 *
 * Desktop: a slim capsule pinned to the far-left edge, its labels set
 * vertically like book spines (reading bottom to top). The current section is
 * a lime segment with dark text; a quiet highlight glides after the pointer
 * between segments (the segmented-control slide).
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
          className="flex w-10 flex-col gap-1 rounded-full border border-white/[0.08] bg-[#0f1011]/85 p-1 backdrop-blur-md"
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
                className={`group relative flex items-center justify-center rounded-full py-4 text-[12.5px] font-medium tracking-[0.02em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none active:scale-[0.97] ${
                  on ? "text-[#0a0b0c]" : "text-[#8a8f98] hover:text-[#f7f8f8] focus-visible:text-[#f7f8f8]"
                }`}
              >
                {on ? <span aria-hidden className="absolute inset-0 rounded-full bg-nltLime" /> : null}
                {/* hover — one highlight that glides between segments */}
                <AnimatePresence>
                  {hovered === key && !on ? (
                    <motion.span
                      aria-hidden
                      layoutId="rail-hover"
                      className="absolute inset-0 rounded-full bg-white/[0.06]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                    />
                  ) : null}
                </AnimatePresence>
                <span className="relative rotate-180 whitespace-nowrap leading-none [writing-mode:vertical-rl]">{label}</span>
                {/* focus ring drawn inside the segment */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-inset ring-nltLime/60 group-focus-visible:opacity-100" />
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
