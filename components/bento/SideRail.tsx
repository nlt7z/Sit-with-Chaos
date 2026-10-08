"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { RESUME_HREF } from "@/lib/site";

/**
 * SideRail — the one global nav, on every page: Home, Work, Lab, plus the
 * résumé (a PDF, so ↗ and a new tab). Case studies count as Work. The left
 * edge only ever holds this; in-page progress lives on the right (SectionRail).
 *
 * Desktop: a slim capsule pinned to the far-left edge, its labels set
 * vertically like book spines (reading bottom to top). The current section is
 * a lime segment with dark text; a quiet highlight glides after the pointer
 * between segments (the segmented-control slide).
 * Mobile: a floating pill nav along the bottom edge.
 * Tone: the capsule is dark by default; `light` frosts it white for the
 * white-canvas case studies (same shape, place and behaviour).
 */

const ITEMS: { key: "home" | "work" | "lab"; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "lab", label: "Lab", href: "/vibe-coding" },
];

const TONE = {
  dark: {
    shell: "border-white/[0.08] bg-[#0f1011]/85",
    shadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
    idle: "text-[#8a8f98] hover:text-[#f7f8f8] focus-visible:text-[#f7f8f8]",
    mobileIdle: "text-[#8a8f98] active:text-[#f7f8f8]",
    glide: "bg-white/[0.06]",
  },
  light: {
    shell: "border-black/[0.06] bg-white/85",
    shadow: "inset 0 1px 0 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
    idle: "text-textSecondary hover:text-textPrimary focus-visible:text-textPrimary",
    mobileIdle: "text-textSecondary active:text-textPrimary",
    glide: "bg-black/[0.05]",
  },
} as const;

export function SideRail({ active, tone = "dark" }: { active: "home" | "work" | "lab"; tone?: "dark" | "light" }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const t = TONE[tone];

  return (
    <>
      <nav aria-label="Sections" className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <div
          className={`flex w-10 flex-col gap-1 rounded-full border p-1 backdrop-blur-md ${t.shell}`}
          style={{ boxShadow: t.shadow }}
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
                  on ? "text-[#0a0b0c]" : t.idle
                }`}
              >
                {on ? <span aria-hidden className="absolute inset-0 rounded-full bg-nltLime" /> : null}
                {/* hover — one highlight that glides between segments */}
                <AnimatePresence>
                  {hovered === key && !on ? (
                    <motion.span
                      aria-hidden
                      layoutId="rail-hover"
                      className={`absolute inset-0 rounded-full ${t.glide}`}
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
          {/* résumé — the PDF, so ↗ (the arrow stays upright above the spine) */}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            onMouseEnter={() => setHovered("resume")}
            onFocus={() => setHovered("resume")}
            onBlur={() => setHovered(null)}
            className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-full py-4 text-[12.5px] font-medium tracking-[0.02em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none active:scale-[0.97] ${t.idle}`}
          >
            <AnimatePresence>
              {hovered === "resume" ? (
                <motion.span
                  aria-hidden
                  layoutId="rail-hover"
                  className={`absolute inset-0 rounded-full ${t.glide}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
            </AnimatePresence>
            <span aria-hidden className="relative leading-none">↗</span>
            <span className="relative rotate-180 whitespace-nowrap leading-none [writing-mode:vertical-rl]">Resume</span>
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-inset ring-nltLime/60 group-focus-visible:opacity-100" />
          </a>
        </div>
      </nav>

      {/* Mobile — a floating pill nav centered along the bottom edge. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:hidden"
      >
        <div
          className={`flex items-center gap-1 rounded-full border p-1.5 backdrop-blur-md ${t.shell}`}
          style={{ boxShadow: t.shadow }}
        >
          {ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 ${
                  on ? "bg-nltLime text-[#0a0b0c]" : t.mobileIdle
                }`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            className={`relative flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 ${t.mobileIdle}`}
          >
            Resume ↗
          </a>
        </div>
      </nav>
    </>
  );
}
