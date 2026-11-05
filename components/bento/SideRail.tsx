"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { SplitTextChars } from "@/components/SplitBtn";
import { RESUME_HREF } from "@/lib/site";
import { type ToneSetting, useSurfaceTone } from "@/lib/useSurfaceTone";

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
 * Tone: the capsule is dark by default; `light` frosts it white; `auto` (case
 * studies) is light and turns dark while a `data-surface="dark"` band (the
 * hero) passes under it. Same shape, place and behaviour in every tone.
 * On the homepage the switch is a block in the bento instead (SwitchTile,
 * with `desktop={false}` here); following a link hands the next page's switch
 * this one's place, and it glides from there to its own.
 */

type Key = "home" | "work" | "lab";

const ITEMS: { key: Key; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "lab", label: "Lab", href: "/vibe-coding" },
];

/* A spine label: set horizontally and turned -90°, so it reads bottom to top.
   The letter roll then runs in the label's own frame and rolls "up" for a
   reader tilting their head, like on the buttons; the ↗ on Resume turns with
   the text. An invisible vertical copy gives the segment its height. */
function RotatedLabel({ text }: { text: string }) {
  return (
    <span className="relative flex items-center justify-center">
      <span aria-hidden className="invisible whitespace-nowrap leading-none [writing-mode:vertical-rl]">
        {text}
      </span>
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center whitespace-nowrap leading-none">
        <SplitTextChars text={text} />
      </span>
    </span>
  );
}

// where the switch was when one of its links was followed (its centre, in the viewport)
const HANDOFF = "yf-switch-from";

function rememberSwitch(el: HTMLElement | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  try {
    sessionStorage.setItem(HANDOFF, JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2, t: Date.now() }));
  } catch {}
}

/* Arriving from another page's switch: start where it was and glide into
   place. Only a handoff from the last few seconds counts. */
function useArrival(ref: RefObject<HTMLElement | null>, on: boolean) {
  useLayoutEffect(() => {
    // only a switch that is on screen takes the handoff (the homepage also
    // mounts the rail, for its phone pill)
    const el = ref.current;
    const r = el?.getBoundingClientRect();
    if (!on || !el || !r?.width) return;
    let from: { x: number; y: number; t: number } | null = null;
    try {
      from = JSON.parse(sessionStorage.getItem(HANDOFF) || "null");
      sessionStorage.removeItem(HANDOFF);
    } catch {}
    if (!from || Date.now() - from.t > 4000) return;
    const dx = from.x - (r.left + r.width / 2);
    const dy = from.y - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 4) return;
    animate(el, { x: [dx, 0], y: [dy, 0] }, { type: "spring", stiffness: 220, damping: 28 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

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

export function SideRail({ active, tone = "dark", desktop = true }: { active: Key; tone?: ToneSetting; desktop?: boolean }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const t = TONE[useSurfaceTone(tone, 0.5)];
  const tm = TONE[useSurfaceTone(tone, 0.95)];
  const capsule = useRef<HTMLDivElement>(null);
  useArrival(capsule, desktop && !reduced);

  return (
    <>
      {desktop ? (
      <nav aria-label="Sections" className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 md:block">
        <div
          ref={capsule}
          className={`flex w-10 flex-col gap-1 rounded-full border p-1 transition-[background-color,border-color,box-shadow] duration-300 ${t.shell}`}
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
                onClick={() => rememberSwitch(capsule.current)}
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
                <RotatedLabel text={label} />
                {/* focus ring drawn inside the segment */}
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-inset ring-white/60 group-focus-visible:opacity-100" />
              </Link>
            );
          })}
          {/* résumé, the PDF: ↗. The arrow turns with the spine, so it reads ↗ when the label is read bottom to top. */}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            onMouseEnter={() => setHovered("resume")}
            onFocus={() => setHovered("resume")}
            onBlur={() => setHovered(null)}
            className={`group relative flex flex-col items-center justify-center rounded-full py-4 text-[12.5px] font-medium tracking-[0.02em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none active:scale-[0.97] ${t.idle}`}
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
            <RotatedLabel text="Resume ↗" />
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-inset ring-white/60 group-focus-visible:opacity-100" />
          </a>
        </div>
      </nav>
      ) : null}

      {/* Mobile — a floating pill nav centered along the bottom edge. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:hidden"
      >
        <div
          className={`flex items-center gap-1 rounded-full border p-1.5 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${tm.shell}`}
          style={{ boxShadow: tm.shadow }}
        >
          {ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`group relative flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 ${
                  on ? "bg-nltLime text-[#0a0b0c]" : tm.mobileIdle
                }`}
              >
                <SplitTextChars text={label} />
              </Link>
            );
          })}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            className={`group relative flex h-9 items-center rounded-full px-4 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150 ${tm.mobileIdle}`}
          >
            <SplitTextChars text="Resume ↗" />
          </a>
        </div>
      </nav>
    </>
  );
}

/* The switch as a block in the homepage bento: the same four links side by
   side, the current page lime, the same highlight gliding after the pointer.
   It holds the board still while pointed at (live="hold"), so the links never
   move under the cursor; its column never narrows below what the four labels
   need (data-floor in BentoHome). Under 1024px the résumé link drops out. */
export function SwitchTile({ active, className = "" }: { active: Key; className?: string }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const tile = useRef<HTMLDivElement>(null);
  useArrival(tile, !reduced);
  const t = TONE.dark;
  const segment =
    "group relative flex h-11 flex-auto items-center justify-center rounded-[16px] px-[clamp(6px,0.7vw,10px)] text-[13px] font-medium tracking-[-0.005em] transition-[color,transform] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none active:scale-[0.97]";
  const glide = (key: string) => (
    <AnimatePresence>
      {hovered === key ? (
        <motion.span
          aria-hidden
          layoutId="switch-hover"
          className={`absolute inset-0 rounded-[16px] ${t.glide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
        />
      ) : null}
    </AnimatePresence>
  );
  const ring = <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] opacity-0 ring-1 ring-inset ring-white/60 group-focus-visible:opacity-100" />;

  return (
    <div ref={tile} className={className}>
      <BentoCard header={false} live="hold" surface="dark" index={0}>
        <nav aria-label="Sections" className="flex gap-1 p-1.5" onMouseLeave={() => setHovered(null)}>
          {ITEMS.map(({ key, label, href }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                onClick={() => {
                  if (!on) rememberSwitch(tile.current);
                }}
                onMouseEnter={() => setHovered(on ? null : key)}
                onFocus={() => setHovered(on ? null : key)}
                onBlur={() => setHovered(null)}
                className={`${segment} ${on ? "text-[#0a0b0c]" : t.idle}`}
              >
                {on ? <span aria-hidden className="absolute inset-0 rounded-[16px] bg-nltLime" /> : null}
                {glide(key)}
                <span className="relative flex items-center whitespace-nowrap leading-none">
                  <SplitTextChars text={label} />
                </span>
                {ring}
              </Link>
            );
          })}
          <a
            href={RESUME_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            onMouseEnter={() => setHovered("resume")}
            onFocus={() => setHovered("resume")}
            onBlur={() => setHovered(null)}
            className={`${segment} ${t.idle} hidden lg:flex`}
          >
            {glide("resume")}
            <span className="relative flex items-center whitespace-nowrap leading-none">
              <SplitTextChars text="Resume ↗" />
            </span>
            {ring}
          </a>
        </nav>
      </BentoCard>
    </div>
  );
}
