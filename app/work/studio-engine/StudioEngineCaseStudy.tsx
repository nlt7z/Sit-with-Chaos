"use client";

import { MacBookFrame } from "@/components/MacBookFrame";
import { Nav } from "@/components/Nav";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Hover / micro-interaction ease */
const easePremium = [0.16, 1, 0.3, 1] as const;
/** Section reveals — slower deceleration, more premium */
const easeLux = [0.22, 1, 0.36, 1] as const;

const caseNavItems = [
  { id: "overview", label: "Overview" },
  { id: "product", label: "The problem" },
  { id: "research", label: "Research" },
  { id: "design-principle", label: "AI principle" },
  { id: "workflow-ia", label: "Design framework" },
  { id: "solutions", label: "Decisions" },
  { id: "agent", label: "Agent layer" },
  { id: "outcome", label: "Impact" },
  { id: "reflection", label: "Reflection" },
] as const;

const RESEARCH_QUESTIONS = [
  "What challenges do users encounter when generating a script and visual assets?",
  "How well do users understand the editing and regeneration of visual elements?",
  "What emotions do users experience throughout the generation and review process?",
] as const;


const TASK_EVAL_ROWS = [
  { label: "T1 · Create script from prompt", success: 83, error: 63, meta: "5/6 · 19 err", highlight: false },
  { label: "T2 · Review generated script & assets", success: 100, error: 30, meta: "6/6 · 9 err", highlight: false },
  { label: "T3 · Edit character (change hair)", success: 33, error: 83, meta: "2/6 · 25 err", highlight: true },
  { label: "T4 · Edit location (beach house)", success: 50, error: 70, meta: "3/6 · 21 err", highlight: true },
  { label: "T5 · Review all images & return to overview", success: 100, error: 30, meta: "6/6 · 9 err", highlight: false },
  { label: "T6 · Open storyboard, navigate to edit", success: 83, error: 40, meta: "5/6 · 12 err", highlight: false },
  { label: "T7 · Assign character to shot", success: 100, error: 33, meta: "6/6 · 10 err", highlight: false },
  { label: "T8 · Modify shot (beach at sunrise)", success: 67, error: 53, meta: "4/6 · 16 err", highlight: false },
  { label: "T9 · Export script as PDF", success: 100, error: 30, meta: "6/6 · 9 err", highlight: false },
] as const;

const SEVERITY_ISSUES = [
  {
    badge: "Catastrophic",
    badgeClass: "border-violet-400/35 bg-violet-600/[0.1] text-violet-950",
    area: "Unexpected AI-generated content — users could not predict or control output",
    freq: 6,
  },
  {
    badge: "Catastrophic",
    badgeClass: "border-violet-400/35 bg-violet-600/[0.1] text-violet-950",
    area: "No error recovery or version control — regenerated images replaced previous work with no undo",
    freq: 3,
  },
  {
    badge: "Moderate",
    badgeClass: "border-violet-200/70 bg-violet-50/90 text-violet-900/85",
    area: "Unintuitive content editing workflow — multi-page navigation broke context",
    freq: 6,
  },
  {
    badge: "Moderate",
    badgeClass: "border-violet-200/70 bg-violet-50/90 text-violet-900/85",
    area: "Unfamiliar terminology — terms like “InPainting” had no explanation",
    freq: 6,
  },
  {
    badge: "Moderate",
    badgeClass: "border-violet-200/70 bg-violet-50/90 text-violet-900/85",
    area: "Inconsistent CTAs and button hierarchy — primary actions were hard to find",
    freq: 6,
  },
  {
    badge: "Moderate",
    badgeClass: "border-violet-200/70 bg-violet-50/90 text-violet-900/85",
    area: "Incomplete and unstructured script export — missing visual assets and formatting",
    freq: 6,
  },
] as const;

/** Soft cursor-following wash — disabled when reduced motion is on */
function CaseStudyAmbientGlow() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 280, damping: 38, mass: 0.45 });
  const sy = useSpring(y, { stiffness: 280, damping: 38, mass: 0.45 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, x, y]);

  if (reduce) return null;

  const background = useMotionTemplate`radial-gradient(760px circle at ${sx}px ${sy}px, rgba(139, 92, 246, 0.07), rgba(250, 250, 252, 0) 50%)`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ background }}
    />
  );
}

function CaseStudySectionNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && caseNavItems.some((i) => i.id === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const els = caseNavItems.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Case study sections"
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-full w-[12rem] lg:block"
    >
      <div className="pointer-events-auto sticky top-[calc(50vh-10rem)] px-5 pt-40">
        <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-textSecondary/60">
          On this page
        </p>
        <ul className="mt-5 max-h-[min(60vh,28rem)] space-y-0 overflow-y-auto overscroll-contain pr-1">
          {caseNavItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(id);
                }}
                className={`block border-l border-transparent py-1.5 pl-4 text-left text-[12px] leading-snug transition-[color,border-color,opacity,transform] duration-500 ease-out ${
                  active === id
                    ? "border-violet-600/70 text-textPrimary"
                    : "text-textSecondary/90 hover:translate-x-0.5 hover:border-violet-500/35 hover:text-violet-950"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

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
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
      transition={{
        duration: reduce ? 0.01 : 1.28,
        delay,
        ease: easeLux,
      }}
    >
      {children}
    </motion.div>
  );
}

function MediaReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.992 }}
      animate={
        inView || reduce
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 20, scale: 0.992 }
      }
      transition={{
        duration: reduce ? 0.01 : 1.42,
        delay,
        ease: easeLux,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Subtle lift + violet glow on hover (case study cards) */
function HoverPanel({ children, className }: { children: ReactNode; className: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`transition-[box-shadow,border-color] duration-[520ms] ease-out hover:border-violet-300/40 hover:shadow-[0_28px_56px_-32px_rgba(109,40,217,0.09)] ${className}`}
      initial={false}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.52, ease: easePremium }}
    >
      {children}
    </motion.div>
  );
}


function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-textSecondary/55">
      {children}
    </p>
  );
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`mt-8 max-w-[40rem] font-display text-[clamp(1.5rem,3.6vw,2.125rem)] font-light leading-[1.1] tracking-[-0.03em] text-textPrimary first:mt-0 md:mt-10 ${className}`}
    >
      {children}
    </h2>
  );
}

function Subtitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mt-24 max-w-2xl font-display text-[1.125rem] font-light leading-snug tracking-[-0.018em] text-textPrimary first:mt-0 md:mt-28 md:text-[1.25rem] ${className}`}
    >
      {children}
    </h3>
  );
}

function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-[42rem] space-y-7 text-[17px] font-normal leading-[1.72] tracking-[-0.011em] text-textSecondary/95 md:text-[1.0625rem] md:leading-[1.76] ${className}`}
    >
      {children}
    </div>
  );
}

function Figure({
  src,
  alt,
  width,
  height,
  caption,
  priority,
  layout = "default",
  gridColumns = 2,
  transparent,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  /** Use in grids: full image visible (object-contain), no forced crop. */
  layout?: "default" | "grid";
  gridColumns?: 2 | 3;
  /** Force no frame tint (e.g. PNGs with alpha). Defaults true when src ends in .png */
  transparent?: boolean;
}) {
  const reduce = useReducedMotion();
  const gridSizes =
    gridColumns === 3
      ? "(max-width: 768px) 100vw, 33vw"
      : "(max-width: 768px) 100vw, (max-width: 1200px) 46vw, 560px";

  const isPng = src.toLowerCase().endsWith(".png");
  const noFrameTint = transparent ?? isPng;

  const frame = noFrameTint
    ? "overflow-hidden bg-transparent shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-[560ms] ease-out group-hover:shadow-[0_22px_56px_-28px_rgba(109,40,217,0.1)] group-hover:ring-violet-400/25"
    : "overflow-hidden bg-white shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05] transition-[box-shadow,ring-color] duration-[560ms] ease-out group-hover:shadow-[0_26px_64px_-30px_rgba(109,40,217,0.1)] group-hover:ring-violet-400/22";

  const figureHover = reduce ? undefined : { y: -3 };

  if (layout === "grid") {
    return (
      <motion.figure
        className="group flex h-full min-h-0 flex-col"
        initial={false}
        whileHover={figureHover}
        transition={{ duration: 0.55, ease: easePremium }}
      >
        <div className={`relative w-full shrink-0 ${frame}`}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={gridSizes}
            className="h-auto w-full object-contain transition-transform duration-[560ms] ease-out group-hover:scale-[1.012]"
            priority={priority}
          />
        </div>
        {caption ? (
          <figcaption className="mt-6 max-w-xl shrink-0 text-sm leading-relaxed text-textSecondary md:text-[15px]">
            {caption}
          </figcaption>
        ) : null}
      </motion.figure>
    );
  }

  return (
    <motion.figure
      className="group"
      initial={false}
      whileHover={figureHover}
      transition={{ duration: 0.55, ease: easePremium }}
    >
      <div className={frame}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 1024px) 100vw, min(1152px, 90vw)"
          className="h-auto w-full object-contain transition-transform duration-[560ms] ease-out group-hover:scale-[1.006]"
          priority={priority}
        />
      </div>
      {caption ? (
        <figcaption className="mt-6 max-w-xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

function PullQuote({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.aside
      className={`bg-zinc-50/55 px-6 py-6 transition-[background-color,box-shadow] duration-500 ease-out hover:bg-violet-50/45 hover:shadow-[0_12px_40px_-24px_rgba(124,58,237,0.1)] md:px-8 ${className}`}
      initial={false}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.45, ease: easePremium }}
    >
      <p className="font-display text-[1.125rem] font-light italic leading-snug text-textPrimary md:text-[1.25rem]">
        {children}
      </p>
    </motion.aside>
  );
}

function ParticipantQuote({ quote, attr }: { quote: string; attr: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.aside
      className="mt-8 bg-violet-50/35 px-5 py-4 transition-[background-color] duration-500 ease-out hover:bg-violet-50/55 md:px-6 md:py-5"
      initial={false}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.4, ease: easePremium }}
      aria-label="Participant feedback"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-800/65">Participant signal</p>
      <p className="mt-2 text-[15px] leading-relaxed text-textPrimary">
        {quote}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/75">
        {attr}
      </p>
    </motion.aside>
  );
}

function FreqDots({ filled, total = 6 }: { filled: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < filled ? "bg-violet-500/45" : "bg-violet-200/35"}`}
          />
        ))}
      </div>
      <span className="font-mono text-[12px] text-textPrimary">
        {filled}/{total}
      </span>
    </div>
  );
}

function TaskSuccessEvaluation() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const barsActive = open;

  return (
    <div className="mt-20 md:mt-28">
      <div className="overflow-hidden bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <button
          type="button"
          id="task-success-chart-trigger"
          aria-expanded={open}
          aria-controls="task-success-chart-panel"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-violet-500/[0.04] active:bg-violet-500/[0.07] md:px-5 md:py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-snug tracking-[-0.01em] text-textPrimary">
              Task success &amp; errors
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-textSecondary/90">
              N = 6 · up to 30 errors per task ·{" "}
              <span className="text-violet-600/75">{open ? "Hide detail" : "Show detail"}</span>
            </p>
          </div>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-50/80 text-violet-500/70 shadow-sm ring-1 ring-violet-200/40 transition-transform duration-300 ease-out ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              id="task-success-chart-panel"
              role="region"
              aria-labelledby="task-success-chart-trigger"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.48, ease: easeLux }}
              className="overflow-hidden border-t border-black/[0.05]"
            >
              <div className="bg-white px-4 pb-4 pt-1 md:px-5 md:pb-5">
                <p className="py-2 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-violet-600/55">
                  By task · success vs error share
                </p>
                <div className="divide-y divide-violet-200/[0.35]">
                  {TASK_EVAL_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className={`py-3.5 first:pt-2 ${row.highlight ? "bg-violet-500/[0.035]" : ""}`}
                    >
                      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
                        <p
                          className={`max-w-[min(100%,24rem)] shrink-0 text-[13px] leading-snug text-textSecondary md:max-w-[20rem] md:text-[13px] ${
                            row.highlight ? "text-violet-950" : ""
                          }`}
                        >
                          {row.label}
                          {row.highlight ? (
                            <span className="mt-0.5 block text-[11px] font-normal text-violet-700/65">
                              Highest friction
                            </span>
                          ) : null}
                        </p>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-2 overflow-hidden rounded-full bg-violet-100/90 shadow-[inset_0_1px_2px_rgba(124,58,237,0.08)]">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-violet-300/85 to-violet-500/55"
                              initial={false}
                              animate={{ width: barsActive ? `${row.success}%` : 0 }}
                              transition={{ duration: reduce ? 0.01 : 1, ease: easeLux }}
                            />
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-violet-100/50">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-violet-300/35 to-violet-500/30"
                              initial={false}
                              animate={{ width: barsActive ? `${row.error}%` : 0 }}
                              transition={{
                                duration: reduce ? 0.01 : 1,
                                delay: reduce ? 0 : 0.06,
                                ease: easeLux,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-[10px] tabular-nums text-violet-900/35 sm:min-w-[5.75rem]">
                          <span>{row.success}%</span>
                          <span className="text-violet-500/35">err {row.error}%</span>
                          <span className="pt-0.5 text-[9px] uppercase tracking-[0.08em] text-textSecondary/55">
                            {row.meta}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-violet-100/60 pt-3 text-[11px] text-textSecondary/80">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-300 to-violet-500/70"
                      aria-hidden
                    />
                    Success rate
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full bg-gradient-to-br from-violet-300/70 to-violet-500/50"
                      aria-hidden
                    />
                    Error rate (of max 30)
                  </span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SeverityIssuesTable() {
  return (
    <div className="mt-16 md:mt-20">
      <Subtitle>Severity and frequency</Subtitle>
      <Prose className="mt-8">
        <p>
          Six issues emerged. Two were catastrophic for core tasks for several users. Four were moderate but
          universal — all six participants ran into them.
        </p>
      </Prose>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-black/[0.06]">
              <th className="px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-textSecondary/80">
                Severity
              </th>
              <th className="px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-textSecondary/80">
                Area
              </th>
              <th className="px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-textSecondary/80">
                Frequency
              </th>
            </tr>
          </thead>
          <tbody>
            {SEVERITY_ISSUES.map((row) => (
              <tr key={row.area} className="border-b border-black/[0.04] transition-colors duration-300 hover:bg-violet-500/[0.025]">
                <td className="px-4 py-3.5 align-top">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${row.badgeClass}`}
                  >
                    {row.badge}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-top text-textSecondary leading-relaxed">{row.area}</td>
                <td className="px-4 py-3.5 align-top">
                  <FreqDots filled={row.freq} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const IA_IMAGE = "/assets/studio-engine/information%20architecture.jpg";

/** One-line summaries for compact workflow comparison */
const WORKFLOW_BEFORE_AT_ONCE =
  "Script · character looks · props & locations · storyboard — all generated together.";

const WORKFLOW_AFTER_SCRIPT_LINE =
  "Draft script → user picks plots & details → edits in place → verifies before anything else runs.";

const WORKFLOW_AFTER_VISUALS_LINE =
  "Characters, environments, storyboard frames, then final video — only after the script is locked.";

/** 2-column figure grid in this case study — Design, Flow, etc. */
const STUDIO_ENGINE_GRID_2COL_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 46vw, 560px";

/** From md up, pair height to the shorter screen; the taller scrolls inside the MacBook. */
function usePairedScreenCap() {
  const innerA = useRef<HTMLDivElement | null>(null);
  const innerB = useRef<HTMLDivElement | null>(null);
  const [pairCapPx, setPairCapPx] = useState<number | null>(null);

  const measure = useCallback(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
      setPairCapPx(null);
      return;
    }
    const a = innerA.current;
    const b = innerB.current;
    if (!a || !b) return;
    const h1 = a.getBoundingClientRect().height;
    const h2 = b.getBoundingClientRect().height;
    if (h1 <= 0 || h2 <= 0) return;
    const next = Math.round(Math.min(h1, h2));
    setPairCapPx((prev) => (prev === next ? prev : next));
  }, []);

  const scheduleMeasure = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });
  }, [measure]);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const ro = new ResizeObserver(scheduleMeasure);
    if (innerA.current) ro.observe(innerA.current);
    if (innerB.current) ro.observe(innerB.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    scheduleMeasure();

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, scheduleMeasure]);

  return { innerA, innerB, pairCapPx, remeasure: scheduleMeasure };
}

/** Paired images with synced heights (md+). Optional MacBook-style frame or plain card. */
function FlowMacBookPair({
  leftSrc,
  leftAlt,
  rightSrc,
  rightAlt,
  caption,
  leftCaption,
  rightCaption,
  callout,
  mediaRevealDelay = 0,
  imageWidth = 1100,
  imageHeight = 780,
  deviceFrame = true,
}: {
  leftSrc: string;
  leftAlt: string;
  rightSrc: string;
  rightAlt: string;
  /** Centered below the full row (e.g. Flow section). */
  caption?: string;
  /** Label under the left image (e.g. Before). */
  leftCaption?: string;
  /** Label under the right image (e.g. After). */
  rightCaption?: string;
  /** Short delta stat shown above the pair, e.g. "4 screens → 1 panel". */
  callout?: string;
  mediaRevealDelay?: number;
  imageWidth?: number;
  imageHeight?: number;
  /** When false, no tablet frame — simple rounded card (e.g. Solutions comparisons). */
  deviceFrame?: boolean;
}) {
  const reduce = useReducedMotion();
  const { innerA, innerB, pairCapPx, remeasure } = usePairedScreenCap();
  const figureHover = reduce ? undefined : { y: -3 };

  const columnLabelClass =
    "mt-4 text-left text-sm text-textSecondary md:text-[15px]";

  const frameInnerClass =
    "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#0a0a0b]";

  const plainInnerClass = (src: string) =>
    src.toLowerCase().endsWith(".png")
      ? "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-transparent shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06]"
      : "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-white shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]";

  function pairColumn(
    innerRef: React.RefObject<HTMLDivElement | null>,
    src: string,
    alt: string,
  ) {
    const scroll = (
      <div
        className={deviceFrame ? frameInnerClass : plainInnerClass(src)}
        style={
          pairCapPx != null
            ? { height: pairCapPx, maxHeight: pairCapPx, minHeight: 0 }
            : undefined
        }
      >
        <div ref={innerRef as React.RefObject<HTMLDivElement>} className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={imageWidth}
            height={imageHeight}
            sizes={STUDIO_ENGINE_GRID_2COL_SIZES}
            className="h-auto w-full object-contain transition-transform duration-[560ms] ease-out group-hover:scale-[1.012]"
            onLoadingComplete={remeasure}
          />
        </div>
      </div>
    );
    return deviceFrame ? <MacBookFrame>{scroll}</MacBookFrame> : scroll;
  }

  return (
    <MediaReveal delay={mediaRevealDelay}>
      {callout ? (
        <div className="mb-7 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-mono text-[12px] tracking-[0.06em] text-textPrimary/70">
            {callout}
          </span>
        </div>
      ) : null}
      <div className="grid items-stretch gap-8 md:grid-cols-2 md:gap-10">
        <motion.div
          className="group flex h-full min-h-0 flex-col"
          initial={false}
          whileHover={figureHover}
          transition={{ duration: 0.55, ease: easePremium }}
        >
          <div className="min-h-0 flex-1">{pairColumn(innerA, leftSrc, leftAlt)}</div>
          {leftCaption ? <p className={columnLabelClass}>{leftCaption}</p> : null}
        </motion.div>
        <motion.div
          className="group flex h-full min-h-0 flex-col"
          initial={false}
          whileHover={figureHover}
          transition={{ duration: 0.55, ease: easePremium }}
        >
          <div className="min-h-0 flex-1">{pairColumn(innerB, rightSrc, rightAlt)}</div>
          {rightCaption ? <p className={columnLabelClass}>{rightCaption}</p> : null}
        </motion.div>
      </div>
      {caption ? (
        <p className="mt-6 text-sm text-textSecondary md:text-[15px]">{caption}</p>
      ) : null}
    </MediaReveal>
  );
}

const SINGLE_TABLET_IMAGE_SIZES = "(max-width: 1024px) 100vw, min(1152px, 90vw)";

/** One full-width image in a tablet-style frame (matches Design / Flow treatment). */
function SingleTabletFrame({
  src,
  alt,
  width,
  height,
  caption,
  sizes = SINGLE_TABLET_IMAGE_SIZES,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  sizes?: string;
}) {
  const reduce = useReducedMotion();
  const figureHover = reduce ? undefined : { y: -3 };

  return (
    <motion.figure
      className="group"
      initial={false}
      whileHover={figureHover}
      transition={{ duration: 0.55, ease: easePremium }}
    >
      <MacBookFrame>
        <div className="overflow-hidden bg-[#0a0a0b]">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="h-auto w-full object-contain transition-transform duration-[560ms] ease-out group-hover:scale-[1.006]"
          />
        </div>
      </MacBookFrame>
      {caption ? (
        <figcaption className="mt-6 max-w-xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

function WorkflowComparisonV2() {
  const afterStages = [
    { num: "01", label: "Basics", tags: ["tone", "goal", "audience"] },
    { num: "02", label: "Outline", tags: ["structure", "beats"] },
    { num: "03", label: "Script", tags: ["dialogue", "narration"] },
    { num: "04", label: "Visuals", tags: ["shots", "scenes"] },
  ] as const;

  return (
    <div className="bg-white px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12">
      <div className="grid gap-5 md:grid-cols-[5fr_7fr] md:gap-8 lg:gap-10">

        {/* LEFT — Before */}
        <div className="flex flex-col">
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/45">Before</span>
          <p className="mb-1.5 font-display text-[1.125rem] font-light leading-snug tracking-[-0.018em] text-textPrimary">
            One pass, no checkpoints
          </p>
          <p className="mb-5 text-[12px] leading-relaxed text-textSecondary/60">
            Script, visuals, and shots all generate from a single prompt
          </p>
          <div className="flex min-h-[340px] flex-1 flex-col gap-0">
            {/* Prompt node */}
            <div className="shrink-0 border border-black/[0.08] px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-textSecondary/55">Prompt</span>
            </div>
            {/* Arrow */}
            <div className="flex shrink-0 items-center justify-center py-2">
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M5 0v15" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1 11l4 5 4-5" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* One big undifferentiated block */}
            <div className="relative flex flex-1 flex-col items-stretch justify-center border border-black/[0.08]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-black/[0.08] bg-white px-3 py-[3px] font-mono text-[9px] uppercase tracking-[0.08em] text-textSecondary/55">
                no checkpoints
              </div>
              <div className="divide-y divide-black/[0.05] px-5 py-4">
                {(["Script", "Visuals", "Shots"] as const).map((label) => (
                  <div key={label} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/[0.12]" />
                    <span className="text-[13px] tracking-[-0.01em] text-textSecondary/75">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Arrow */}
            <div className="flex shrink-0 items-center justify-center py-2">
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M5 0v15" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1 11l4 5 4-5" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Output node */}
            <div className="shrink-0 border border-black/[0.08] px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-textSecondary/55">Output</span>
            </div>
          </div>
        </div>

        {/* RIGHT — After */}
        <div className="flex flex-col">
          <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/45">After</span>
          <p className="mb-1.5 font-display text-[1.125rem] font-light leading-snug tracking-[-0.018em] text-textPrimary">
            Staged, with checkpoints
          </p>
          <p className="mb-5 text-[12px] leading-relaxed text-textSecondary/60">
            Each stage is reviewed and approved before the next begins
          </p>
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            {afterStages.map((stage, i) => {
              const shades = [
                "bg-violet-50/40",
                "bg-violet-50/70",
                "bg-violet-100/50",
                "bg-violet-100/70",
              ];
              const isLast = i === afterStages.length - 1;
              return (
                <div key={stage.label} className="flex flex-1 flex-col">
                  <div className={`flex flex-1 items-center justify-between px-5 py-3 ${shades[i]}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-[10px] tabular-nums text-violet-400/40">{stage.num}</span>
                      <span className="text-[13px] tracking-[-0.01em] text-violet-950">{stage.label}</span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {stage.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] text-violet-600/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex shrink-0 items-center px-5 py-[5px]">
                      <div className="h-px flex-1 bg-violet-200/50" />
                      <div className="mx-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(124,58,237,0.05)]">
                        <svg width="7" height="7" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 5.5L4.2 7.5L8 3" stroke="#7c3aed" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="h-px flex-1 bg-violet-200/50" />
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}

export default function StudioEngineCaseStudy() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroMediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 56]);
  const heroMediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.03]);

  return (
    <>
      <Nav />
      <main className="relative min-h-screen overflow-x-hidden bg-white text-textPrimary">
        <CaseStudySectionNav />
        <article className="relative z-10 mx-auto max-w-content px-6 pb-40 pt-32 md:px-12 md:pb-52 md:pt-40 lg:pl-[13.5rem] lg:pr-14 lg:pt-44 xl:pl-44">
        <header id="overview" ref={heroRef} className="scroll-mt-32 max-w-4xl">
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/80">
            StudioEngine.AI
          </p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.18, delay: reduce ? 0 : 0.08, ease: easeLux }}
            className="mt-10 font-display text-[clamp(2rem,5vw,3rem)] font-light leading-[1.06] tracking-[-0.03em] text-textPrimary"
          >
            Designing Control Into AI Video Creation
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.12, delay: reduce ? 0 : 0.14, ease: easeLux }}
            className="mt-12 max-w-[40rem] text-[1.125rem] font-light leading-snug tracking-[-0.02em] text-textSecondary/95 md:text-[1.25rem]"
          >
            I redesigned the Gen-2 workflow around checkpoints, version history, unified editing, and
            contextual AI guidance, so creators could shape output instead of just accepting it.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.08, delay: reduce ? 0 : 0.19, ease: easeLux }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
          >
            {[
              "6 moderated usability tests",
              "6/6 users struggled with visual editing",
              "One-shot generation → staged creative control",
            ].map((s) => (
              <span key={s} className="inline-flex items-center gap-2 text-[13px] leading-snug text-textSecondary/80">
                <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400/60" aria-hidden />
                {s}
              </span>
            ))}
          </motion.div>

          <motion.dl
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.08, delay: reduce ? 0 : 0.22, ease: easeLux }}
            className="mt-16 grid grid-cols-1 gap-6 border-t border-black/[0.07] pt-6 sm:flex sm:flex-wrap sm:items-start sm:gap-0 sm:divide-x sm:divide-black/[0.07] sm:border-0 sm:pt-0"
          >
            <div className="sm:pr-8 sm:pt-8">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Product</dt>
              <dd className="mt-2 text-[15px] text-textPrimary">VP Genie</dd>
            </div>
            <div className="sm:px-8 sm:pt-8">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Role</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-textPrimary">Design · Information Architecture · Usability Test</dd>
            </div>
            <div className="sm:pl-8 sm:pt-8">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Timeline</dt>
              <dd className="mt-2 text-[15px] text-textPrimary">January – April 2025</dd>
            </div>
          </motion.dl>

        </header>

        <motion.div
          style={{ y: heroMediaY, scale: heroMediaScale }}
          className="relative mt-20 origin-top will-change-transform md:mt-28 lg:mt-32"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.38, delay: reduce ? 0 : 0.26, ease: easeLux }}
            className="overflow-hidden"
          >
            <WorkflowComparisonV2 />
          </motion.div>
        </motion.div>

        {/* Problem */}
        <section id="product" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <SectionTitle>&ldquo;I don&apos;t think I&apos;m smart enough for this tool.&rdquo;</SectionTitle>
            <Prose className="mt-14">
              <p>
                P3 clicked 12 times. Each time the AI returned something different — never closer.
                After the twelfth attempt, she stopped.
              </p>
          
              <p>
                She is. Studio Engine.ai collapses professional pre-production — script, characters, props,
                storyboard — into one prompt. The power was real. The mental model assumed expertise most
                users didn&apos;t have.
              </p>
            </Prose>
            <div className="mt-16 md:mt-20">
              <div className="max-w-[42rem]">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/65">HMW</p>
                <p className="mt-4 font-display text-[clamp(1.5rem,3.6vw,2.125rem)] font-light leading-[1.1] tracking-[-0.03em] text-textPrimary">
                  How might Studio Engine.ai Gen-2 serve both professionals and emerging creators — and
                  convert free users to paid?
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="research" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal delay={0.04}>
            <Eyebrow>Research</Eyebrow>
            <SectionTitle>AI was treated as a one-shot oracle.</SectionTitle>
            <Prose className="mt-10">
              <p className="text-textPrimary">
                We tested three workflow phases.{" "}
                <span className="text-textSecondary/75">Task 2 is where the experience broke.</span>
              </p>
            </Prose>

            <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-[1fr_1.85fr_1fr] md:items-start md:gap-4">

              {/* Task 01 — compact */}
              <div className="flex flex-col overflow-hidden bg-white">
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  <Image
                    src="/assets/studio-engine/task-1-2.jpg"
                    alt="Task 01 — script generation from prompt"
                    width={600}
                    height={450}
                    sizes="(max-width: 768px) 100vw, 22vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-4 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary/55">
                    Task 01 · Script
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-textSecondary">
                    Script generation — manageable
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-textSecondary/50">5 / 6 completed</p>
                </div>
              </div>

              {/* Task 02 — featured */}
              <div className="flex flex-col overflow-hidden bg-white">
                <div className="relative">
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-violet-600/80">
                    Where it broke
                  </span>
                  <div className="aspect-video overflow-hidden bg-white">
                    <Image
                      src="/assets/studio-engine/task-2-4.jpg"
                      alt="Task 02 — visual editing, where every session broke down"
                      width={900}
                      height={506}
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="px-5 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-violet-600/70">
                    Task 02 · Visual editing
                  </p>
                  <p className="mt-2 text-[15px] font-light leading-snug tracking-[-0.01em] text-textPrimary">
                    Visual editing broke for everyone
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/[0.05] pt-4">
                    <div>
                      <p className="font-mono text-[20px] leading-none text-textPrimary">2 / 6</p>
                      <p className="mt-1 text-[11px] text-textSecondary/65">completed character edit</p>
                    </div>
                    <div>
                      <p className="font-mono text-[20px] leading-none text-textPrimary">3 / 6</p>
                      <p className="mt-1 text-[11px] text-textSecondary/65">completed location edit</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-black/[0.05] pt-4">
                    <li className="text-[12px] leading-snug text-textSecondary">
                      <span className="text-textPrimary">AI output unpredictable</span>
                      {" "}— 6/6 clicked regenerate repeatedly with no convergence; had no way to communicate what was wrong
                    </li>
                    <li className="text-[12px] leading-snug text-textSecondary">
                      <span className="text-textPrimary">No recovery path</span>
                      {" "}— 3/6 lost work permanently when regenerating; there was no undo
                    </li>
                    <li className="text-[12px] leading-snug text-textSecondary">
                      <span className="text-textPrimary">Inpainting invisible</span>
                      {" "}— users found the button but had no mental model for what it would affect or how to use it
                    </li>
                    <li className="text-[12px] leading-snug text-textSecondary">
                      <span className="text-textPrimary">4-screen editing path</span>
                      {" "}— changing a character&apos;s hair required: project overview → character list → character editor → inpainting tool. 6/6 lost context mid-flow
                    </li>
                  </ul>
                </div>
              </div>

              {/* Task 03 — compact */}
              <div className="flex flex-col overflow-hidden bg-white">
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  <Image
                    src="/assets/studio-engine/task-3-1.jpg"
                    alt="Task 03 — storyboard overview and scene refinement"
                    width={600}
                    height={450}
                    sizes="(max-width: 768px) 100vw, 22vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-4 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary/55">
                    Task 03 · Storyboard
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-textSecondary">
                    Storyboard — friction but functional
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-textSecondary/50">4 – 5 / 6 completed</p>
                </div>
              </div>

            </div>
          </Reveal>
          <Reveal className="mt-16 md:mt-20" delay={0.06}>
            <TaskSuccessEvaluation />
          </Reveal>
        </section>

        {/* Design principle */}
        <section id="design-principle" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-textSecondary/55">
            AI-native principle
          </p>
          <p className="mt-6 max-w-lg font-display text-[clamp(1.5rem,3.6vw,2.125rem)] font-light leading-[1.1] tracking-[-0.03em] text-textPrimary">
            Designing control around AI uncertainty.
          </p>

          <div className="mt-12 border-t border-black/[0.06] pt-10">
            <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/55">
                  What makes text-to-video UX different
                </p>
                <div className="space-y-3 text-[15px] leading-[1.68] tracking-[-0.011em] text-textSecondary/90">
                  <p><span className="text-textPrimary">Traditional tools:</span> cursor touches output. Intent equals result.</p>
                  <p><span className="text-textPrimary">AI tools:</span> system interprets, generates, surprises. The gap between intent and output is where trust breaks.</p>
                </div>
              </div>
              <div>
                <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/55">
                  New control patterns needed
                </p>
                <ul className="space-y-0 divide-y divide-black/[0.05]">
                  {([
                    ["Compare options", "Variations, not verdicts", "M3 3h7a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm0 7h7a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1z"],
                    ["Recover history", "Every generation reversible", "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"],
                    ["Stage generation", "Review before next phase", "M4 6h16M4 10h16M4 14h16"],
                    ["Show progress", "Pipeline legible in real time", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"],
                    ["Explain AI actions", "Surface what the model did", "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"],
                  ] as const).map(([pattern, sub, iconPath]) => (
                    <li key={pattern} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/[0.04]" aria-hidden>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-textSecondary/60">
                          <path d={iconPath} />
                        </svg>
                      </span>
                      <span>
                        <span className="block text-[13px] leading-snug text-textPrimary">{pattern}</span>
                        <span className="block text-[11px] leading-snug text-textSecondary/75">{sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
        </section>

        {/* Design framework (merged with reframe) */}
        <section id="workflow-ia" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Design framework</Eyebrow>
            <SectionTitle>From One-Shot Generation to Staged Creative Control</SectionTitle>
            <Prose className="mt-14">
              <p>
                I reorganized the experience from a flat generation tool into a staged creative workflow,
                so users could move from idea to editable video assets with clearer checkpoints and
                recovery paths.
              </p>
              <p>
                Instead of asking users to commit everything upfront, the new IA breaks the process into
                clearer checkpoints: Input, Basics, Visuals, Edit, and Manage.
              </p>
            </Prose>
          </Reveal>

          <MediaReveal className="mt-16 md:mt-20" delay={0.08}>
            <div className="overflow-hidden">
              <iframe
                title="Workflow comparison — before vs after"
                src="/assets/studio-engine/before_after_horizontal_workflow_v2.html"
                className="block w-full border-0"
                style={{ height: "min(72vh, 820px)", minHeight: "clamp(360px, 50vh, 560px)" }}
                loading="lazy"
              />
            </div>
          </MediaReveal>

          <Reveal className="mt-16 md:mt-20">
            {/* Stage pipeline */}
            <div className="mt-14 flex flex-col divide-y divide-black/[0.06] xl:flex-row xl:divide-x xl:divide-y-0">
              {(
                [
                  { num: "01", name: "Input",   question: "What am I trying to make?",              desc: "Capture creative intent before asking for detailed production choices." },
                  { num: "02", name: "Basics",  question: "Is the story direction right?",           desc: "Let users review the story foundation before visual generation begins." },
                  { num: "03", name: "Visuals", question: "Which assets match my intent?",           desc: "Turn AI output into selectable options, not a single verdict." },
                  { num: "04", name: "Edit",    question: "How do I refine without losing context?", desc: "Keep preview, controls, references, inpainting, and version history in one workspace." },
                  { num: "05", name: "Manage",  question: "Where does this project live next?",      desc: "Give users a clear place to organize, export, and continue projects." },
                ] as const
              ).map((stage) => (
                <div
                  key={stage.name}
                  className="flex flex-1 flex-col py-5 first:pt-0 last:pb-0 xl:py-0 xl:first:pl-0 xl:last:pr-0 xl:[&:not(:first-child)]:pl-5 xl:[&:not(:last-child)]:pr-5"
                >
                  <div className="mb-3 h-px w-6 bg-violet-400/45" />
                  <span className="font-mono text-[10px] tabular-nums text-violet-400/50">{stage.num}</span>
                  <p className="mt-2 text-[14px] tracking-[-0.012em] text-textPrimary">{stage.name}</p>
                  <p className="mt-1 text-[11px] italic leading-snug text-textSecondary/55">&ldquo;{stage.question}&rdquo;</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-textSecondary/80">{stage.desc}</p>
                </div>
              ))}
            </div>

          </Reveal>
        </section>

        {/* Decision 01 */}
        <section id="solutions" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Decision 01</Eyebrow>
            <SectionTitle>Reframe AI: from oracle to collaborator</SectionTitle>
            <Prose className="mt-14">
              <p>
                6/6 participants encountered AI outputs they couldn&apos;t steer — the study&apos;s
                highest-severity finding. The product gave one output and waited for acceptance. If
                it was wrong, the only option was to regenerate and hope.
              </p>
              <p>
                Gen-2 makes two structural changes. Visual generation is gated behind a{" "}
                <span className="text-textPrimary">script checkpoint</span> — users
                review and commit the script before any images run, so a bad prompt doesn&apos;t
                cascade into dozens of wrong assets. When visuals do generate, the interface returns{" "}
                <span className="text-textPrimary">three variations at once</span>:
                pick the closest match, regenerate that specific option, or save it to history. The
                AI shifts from decision-maker to collaborator.
              </p>
            </Prose>
          </Reveal>

          <Reveal className="mt-24 md:mt-32" delay={0.05}>
            <div className="mt-14">
              <FlowMacBookPair
                leftSrc="/assets/studio-engine/problem1.jpg"
                leftAlt="Before state — one output per generation"
                rightSrc="/assets/studio-engine/solution-1-1.jpg"
                rightAlt="After state — multi-option visual selection"
                leftCaption="Before: one output per generation — accept or restart."
                rightCaption="After: 3 variations at once — pick, iterate, or save to history."
                imageWidth={1000}
                imageHeight={720}
              />
            </div>
          </Reveal>
        </section>

        {/* Decision 02 */}
        <section className="mt-32 md:mt-44 lg:mt-56">
          <Reveal>
            <Eyebrow>Decision 02</Eyebrow>
            <SectionTitle>Make generation reversible</SectionTitle>
            <Prose className="mt-14">
              <p>
                3/6 participants lost work to regeneration with no undo. A <span className="text-textPrimary">generation history panel</span> saves every output — return, compare, or recover at any point.
              </p>
            </Prose>
            <ParticipantQuote
              quote="How can you return to an old version of an image?"
              attr="P4 — after losing a preferred generation"
            />
            <div className="mt-14">
              <FlowMacBookPair
                leftSrc="/assets/studio-engine/problem-2-1.png"
                leftAlt="Problem — lost previous version after regenerate"
                rightSrc="/assets/studio-engine/solution-2.jpg"
                rightAlt="Solution — revision trail and recovery"
                leftCaption="Before: regeneration overwrote previous work with no way back."
                rightCaption="After: every generation is saved — return, compare, or recover at any point."
                imageWidth={1000}
                imageHeight={700}
                deviceFrame={false}
              />
            </div>
          </Reveal>
        </section>

        {/* Decision 03 */}
        <section className="mt-32 md:mt-44 lg:mt-56">
          <Reveal>
            <Eyebrow>Decision 03</Eyebrow>
            <SectionTitle>Bring editing onto one surface</SectionTitle>
            <Prose className="mt-14">
              <p>
                Character editing required 4+ screen transitions. Only <span className="text-textPrimary">2/6 completed it</span> — the study&apos;s lowest success rate. A consolidated panel puts generation, inpainting, and history on one surface.
              </p>
            </Prose>
            <div className="mt-14">
              <FlowMacBookPair
                leftSrc="/assets/studio-engine/problem-3.png"
                leftAlt="Problem — fragmented editing across pages"
                rightSrc="/assets/studio-engine/edit-after.jpg"
                rightAlt="Solution — consolidated editing panel"
                leftCaption="Before: visual editing was split across multiple pages."
                rightCaption="After: generation, inpainting, references, and history live in one workspace."
                imageWidth={1000}
                imageHeight={700}
                deviceFrame={false}
              />
            </div>
          </Reveal>

        </section>

        {/* Decision 04 — AI-native */}
        <section className="mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Decision 04 · AI-native</Eyebrow>
            <SectionTitle>How AI shaped this work</SectionTitle>
            <Prose className="mt-14">
              <p>Designing for AI, with AI. Two areas where it accelerated the work without replacing judgment.</p>
            </Prose>
            <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 md:gap-6">
              {[
                {
                  label: "Research synthesis",
                  body: "6 transcripts clustered by AI, reviewed for nuance by human.",
                },
                {
                  label: "IA stress-testing",
                  body: "AI asked to predict novice failure points — surfacing edge cases missed in manual walkthroughs.",
                },
              ].map((x) => (
                <HoverPanel
                  key={x.label}
                  className="bg-white px-6 py-7 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.05)] md:px-7"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/80">
                    {x.label}
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">{x.body}</p>
                </HoverPanel>
              ))}
            </div>
          </Reveal>
        </section>

        <MediaReveal className="mt-20 md:mt-28">
          <SingleTabletFrame
            src="/assets/studio-engine/design-projects.jpg"
            alt="Updated visual design language"
            width={2000}
            height={1120}
          />
        </MediaReveal>
        <MediaReveal className="mt-10 md:mt-14" delay={0.06}>
          <SingleTabletFrame
            src="/assets/studio-engine/visual.jpg"
            alt="Updated visual design language"
            width={2000}
            height={1120}
          />
        </MediaReveal>

        <section id="agent" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal delay={0.07}>
            <Eyebrow>Agent layer</Eyebrow>
            <SectionTitle>Ask Genie</SectionTitle>
            <Prose className="mt-10">
              <p>
                We first introduced hover states to explain interaction logic while the new workflow was still unfamiliar. They worked as a lightweight bridge, but they were a temporary scaffold rather than a true teaching system. To make guidance persistent and contextual, we evolved this pattern into Genie: an agent layer that helps users navigate pages, surfaces what&apos;s possible, explains unfamiliar tools like Inpainting in the moment, and suggests what to do next as confidence grows.
              </p>
            </Prose>
          </Reveal>

        </section>

        {/* Impact */}
        <section id="outcome" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Impact</Eyebrow>
            <SectionTitle>Designing for competence, not just capability</SectionTitle>
            <Prose className="mt-14">
              <p>
                The pipeline was capable. The gap was that users couldn&apos;t see their own agency inside it. Visual editing succeeded for only <span className="text-textPrimary">33–50%</span> of participants. Not a generation quality problem — a design control problem.
              </p>
            </Prose>
          </Reveal>

          <Reveal className="mt-16 md:mt-20" delay={0.06}>
            <div className="mt-10 grid grid-cols-2 grid-rows-2">
              {(
                [
                  { title: "Options, not verdicts", body: "AI should return choices, not one final answer.", pad: "pb-8 pr-8 md:pb-10 md:pr-10" },
                  { title: "History, not overwrite", body: "Every generation should be recoverable.", pad: "pb-8 pl-8 md:pb-10 md:pl-10" },
                  { title: "One workspace", body: "Editing should stay in context.", pad: "pt-8 pr-8 md:pt-10 md:pr-10" },
                  { title: "Progress, not waiting", body: "Generation should feel active, not frozen.", pad: "pt-8 pl-8 md:pt-10 md:pl-10" },
                ] as const
              ).map((o) => (
                <div key={o.title} className={o.pad}>
                  <h4 className="font-display text-[1rem] font-light leading-snug tracking-[-0.02em] text-textPrimary md:text-[1.125rem]">
                    {o.title}
                  </h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-textSecondary/80">{o.body}</p>
                </div>
              ))}
            </div>
          </Reveal>

        </section>

        <section id="reflection" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal className="mt-24 md:mt-32" delay={0.04}>
            <Eyebrow>Reflection</Eyebrow>
            <SectionTitle>What I would push further</SectionTitle>
            <Prose className="mt-10">
              <p>
                Next: a second-round test with Gen-2 prototypes and a 4–6 week longitudinal study — moving from &ldquo;can I complete this?&rdquo; to &ldquo;does this tool grow with me?&rdquo;
              </p>
            </Prose>
            <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
              {[
                {
                  t: "AI as design material",
                  d: "Design around failure, not magic. Uncertainty is where the UX work lives.",
                },
                {
                  t: "Research as storytelling",
                  d: "The output is not a deck — it is a narrative that makes decisions feel inevitable.",
                },
                {
                  t: "Iteration as proof",
                  d: "Each prototype step should be explainable evidence, not process noise.",
                },
              ].map((x) => (
                <HoverPanel
                  key={x.t}
                  className="bg-white px-5 py-6 md:px-6"
                >
                  <p className="font-display text-[1.125rem] font-light leading-snug tracking-[-0.018em] text-textPrimary md:text-[1.25rem]">
                    {x.t}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-textSecondary/90">{x.d}</p>
                </HoverPanel>
              ))}
            </div>
          </Reveal>
        </section>


        </article>
      </main>
    </>
  );
}
