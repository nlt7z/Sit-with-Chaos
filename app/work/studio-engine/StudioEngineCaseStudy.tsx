"use client";

import { CaseStudyMeta } from "@/components/CaseStudyMeta";
import { MacBookFrame } from "@/components/MacBookFrame";
import { Nav } from "@/components/Nav";
import { CASE_STUDY_META } from "@/lib/caseStudyMeta";
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
  { id: "starting-point", label: "Starting point" },
  { id: "context", label: "Context" },
  { id: "research", label: "Research" },
  { id: "insights", label: "Insights" },
  { id: "design", label: "Design" },
  { id: "flow", label: "Flow" },
  { id: "solutions", label: "Solutions" },
  { id: "system", label: "System" },
  { id: "outcomes", label: "Outcomes" },
  { id: "reflection", label: "Reflection" },
] as const;

const RESEARCH_PARTICIPANTS = [
  { id: "P1", role: "Cinematographer", detail: "1 year industry experience" },
  { id: "P2", role: "Cinematographer · Student", detail: "Film school" },
  { id: "P3", role: "Master's Student", detail: "Media & Communication" },
  { id: "P4", role: "Documentarian & Editor", detail: "2 years industry experience" },
  { id: "P5", role: "Animation Director · Student", detail: "Independent animation" },
  { id: "P6", role: "Content Creator · Hobbyist", detail: "1 year experience" },
] as const;

const RESEARCH_QUESTIONS = [
  "What challenges do users encounter when generating a script and visual assets?",
  "How well do users understand the editing and regeneration of visual elements?",
  "What emotions do users experience throughout the generation and review process?",
] as const;

const METHODOLOGY = [
  "Pre-task interview and survey to capture baseline knowledge and mental models",
  "Moderated, within-subjects usability test across three representative tasks",
  "Live observation with error logging on a 1–5 severity scale per task",
  "Post-task interview and System Usability Scale (SUS) for quantitative benchmarking",
] as const;

const USABILITY_TASK_BLOCKS: {
  id: string;
  variant: "neutral" | "warn";
  eyebrow: string;
  body: string;
  steps: readonly { src: string; alt: string; label: string }[];
}[] = [
  {
    id: "task-01-script",
    variant: "neutral",
    eyebrow: "Task 01 · Script",
    body: "From a written prompt, generate a full script with scenes, characters, locations, and props.",
    steps: [
      {
        src: "/assets/studio-engine/task-1-1.jpg",
        alt: "Usability session — participant enters a written prompt for script generation",
        label: "Prompt input",
      },
      {
        src: "/assets/studio-engine/task-1-2.jpg",
        alt: "Usability session — AI-generated script content appearing on screen",
        label: "Draft screenplay",
      },
      {
        src: "/assets/studio-engine/task-1-3.jpg",
        alt: "Usability session — structured script with scenes, characters, and locations",
        label: "Scenes & breakdown",
      },
    ],
  },
  {
    id: "task-02-visuals",
    variant: "warn",
    eyebrow: "Task 02 · Edit visuals",
    body: "Edit character and location images to match a creative vision — the highest-friction task in the workflow.",
    steps: [
      {
        src: "/assets/studio-engine/task-2-1.jpg",
        alt: "Usability session — reviewing generated script and visual assets",
        label: "Review outputs",
      },
      {
        src: "/assets/studio-engine/task-2-2.jpg",
        alt: "Usability session — character image editing interface",
        label: "Character edit",
      },
      {
        src: "/assets/studio-engine/task-2-3.jpg",
        alt: "Usability session — controls for regeneration and inpainting",
        label: "Regenerate / refine",
      },
      {
        src: "/assets/studio-engine/task-2-4.jpg",
        alt: "Usability session — mismatch between edited visual and intent",
        label: "Friction & recovery",
      },
    ],
  },
  {
    id: "task-03-storyboard",
    variant: "neutral",
    eyebrow: "Task 03 · Storyboard",
    body: "Refine the storyboard by adjusting scenes and shots to finalize the visual narrative.",
    steps: [
      {
        src: "/assets/studio-engine/task-3-1.jpg",
        alt: "Usability session — storyboard overview and scene list",
        label: "Board overview",
      },
      {
        src: "/assets/studio-engine/task-3-2.jpg",
        alt: "Usability session — arranging shots within a scene",
        label: "Shot sequencing",
      },
      {
        src: "/assets/studio-engine/task-3-3.jpg",
        alt: "Usability session — adjusting a shot before sign-off",
        label: "Shot detail",
      },
    ],
  },
];

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
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-full w-[11rem] lg:block"
    >
      <div className="pointer-events-auto sticky top-[calc(50vh-10rem)] px-6 pt-40">
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
                    ? "border-violet-600/70 font-medium text-textPrimary"
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

function TaskWorkflowGallery({
  steps,
  columns,
}: {
  steps: readonly { src: string; alt: string; label: string }[];
  columns: 3 | 4;
}) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      : "grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4";

  return (
    <div className={`mt-6 ${gridClass}`}>
      {steps.map((step, i) => (
        <MediaReveal key={step.src} delay={0.05 * i} className="min-h-0">
          <Figure
            layout="grid"
            gridColumns={columns === 4 ? 2 : 3}
            src={step.src}
            alt={step.alt}
            width={800}
            height={560}
            caption={`Step ${i + 1} · ${step.label}`}
          />
        </MediaReveal>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-textSecondary/55">
      {children}
    </p>
  );
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`mt-8 max-w-[40rem] font-display text-[clamp(1.875rem,4.2vw,2.75rem)] font-light leading-[1.1] tracking-[-0.038em] text-textPrimary first:mt-0 md:mt-10 ${className}`}
    >
      {children}
    </h2>
  );
}

function Subtitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mt-24 max-w-2xl font-display text-[1.3125rem] font-light leading-snug tracking-[-0.022em] text-textPrimary first:mt-0 md:mt-28 md:text-[1.5rem] ${className}`}
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
    ? "overflow-hidden rounded-2xl bg-transparent shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-[560ms] ease-out group-hover:shadow-[0_22px_56px_-28px_rgba(109,40,217,0.1)] group-hover:ring-violet-400/25"
    : "overflow-hidden rounded-2xl bg-white shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05] transition-[box-shadow,ring-color] duration-[560ms] ease-out group-hover:shadow-[0_26px_64px_-30px_rgba(109,40,217,0.1)] group-hover:ring-violet-400/22";

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
      className={`rounded-r-2xl border-l-2 border-textPrimary/15 bg-white py-6 pl-8 pr-6 transition-[border-color,box-shadow] duration-500 ease-out hover:border-violet-500/45 hover:shadow-[0_12px_40px_-20px_rgba(124,58,237,0.12)] md:pl-10 ${className}`}
      initial={false}
      whileHover={reduce ? undefined : { x: 3 }}
      transition={{ duration: 0.45, ease: easePremium }}
    >
      <p className="font-display text-[1.2rem] font-light italic leading-relaxed text-textPrimary md:text-[1.35rem] md:leading-snug">
        {children}
      </p>
    </motion.aside>
  );
}

function ParticipantQuote({ quote, attr }: { quote: string; attr: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.figure
      className="relative mt-8 overflow-hidden rounded-xl border border-black/[0.06] bg-white py-5 pl-9 pr-6 transition-[border-color,box-shadow] duration-500 ease-out hover:border-violet-400/35 hover:shadow-[0_16px_48px_-24px_rgba(124,58,237,0.14)]"
      initial={false}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.45, ease: easePremium }}
    >
      <span
        className="pointer-events-none absolute left-3 top-2 font-display text-5xl leading-none text-textPrimary/[0.12]"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="relative text-[15px] leading-relaxed text-textSecondary md:text-base">
        <p className="italic">{quote}</p>
        <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/80 not-italic">
          {attr}
        </figcaption>
      </blockquote>
    </motion.figure>
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
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <button
          type="button"
          id="task-success-chart-trigger"
          aria-expanded={open}
          aria-controls="task-success-chart-panel"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-violet-500/[0.04] active:bg-violet-500/[0.07] md:px-5 md:py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-textPrimary">
              Task success &amp; errors
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-textSecondary/90">
              N = 6 · up to 30 errors per task ·{" "}
              <span className="text-violet-600/75">{open ? "Hide detail" : "Show detail"}</span>
            </p>
          </div>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-violet-500/70 shadow-sm ring-1 ring-violet-200/40 transition-transform duration-300 ease-out ${
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
                          className={`max-w-[min(100%,20rem)] shrink-0 text-[13px] leading-snug text-textSecondary md:max-w-[16rem] md:text-[13px] ${
                            row.highlight ? "font-medium text-violet-950/90" : ""
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
                              className="h-full rounded-full bg-gradient-to-r from-indigo-400/45 to-violet-600/38"
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
                          <span className="text-indigo-700/40">err {row.error}%</span>
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
                      className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-400/80 to-violet-600/55"
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
      <div className="mt-10 overflow-x-auto rounded-xl border border-black/[0.06]">
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
                    className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${row.badgeClass}`}
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
    "mt-4 text-center text-sm font-medium text-textSecondary md:text-[15px]";

  const frameInnerClass =
    "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-[0.9rem] bg-[#0a0a0b]";

  const plainInnerClass = (src: string) =>
    src.toLowerCase().endsWith(".png")
      ? "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl bg-transparent shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06]"
      : "min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl bg-white shadow-[0_2px_28px_-16px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.05]";

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
        <div className="overflow-hidden rounded-[0.9rem] bg-[#0a0a0b]">
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
        <CaseStudyAmbientGlow />
        <CaseStudySectionNav />
        <article className="relative z-10 mx-auto max-w-content px-6 pb-40 pt-32 md:px-12 md:pb-52 md:pt-40 lg:pl-36 lg:pr-14 lg:pt-44">
        <header id="overview" ref={heroRef} className="scroll-mt-32 max-w-4xl">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: easeLux }}
          >
            <Eyebrow>UX research and design</Eyebrow>
          </motion.div>
          <CaseStudyMeta className="mt-4" {...CASE_STUDY_META["studio-engine"]} />
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.18, delay: reduce ? 0 : 0.08, ease: easeLux }}
            className="mt-10 font-display text-[clamp(2.5rem,6.5vw,4rem)] font-light leading-[1.04] tracking-[-0.038em] text-textPrimary"
          >
            Shaping an <em>efficient</em> and <em>intuitive</em> text-to-video creation experience
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.12, delay: reduce ? 0 : 0.14, ease: easeLux }}
            className="mt-12 max-w-[40rem] text-[1.1875rem] font-light leading-snug tracking-[-0.021em] text-textSecondary/95 md:text-[1.3125rem] md:leading-snug"
          >
            How Studio Engine.ai could welcome a new generation of filmmakers without losing the professionals
            already inside.
          </motion.p>

          <motion.dl
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.08, delay: reduce ? 0 : 0.22, ease: easeLux }}
            className="mt-24 grid gap-y-10 border-t border-black/[0.05] pt-20 sm:grid-cols-2 sm:gap-x-20"
          >
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Company</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-textPrimary">StudioEngine.AI</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Product</dt>
              <dd className="mt-2 text-[15px] text-textPrimary">VP Genie</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Role</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-textPrimary">UX Design · UX Research</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Timeline</dt>
              <dd className="mt-2 text-[15px] text-textPrimary">January – April 2025</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Team</dt>
              <dd className="mt-2 max-w-xl text-[15px] leading-relaxed text-textPrimary">
                1 supervisor · 1 lead designer · 4 UX researchers and designers
              </dd>
            </div>
          </motion.dl>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: reduce ? 0 : 0.28, ease: easeLux }}
            className="mt-10"
          >
            <Link
              href="/work/studio-engine/deck"
              className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-textSecondary underline decoration-black/[0.12] underline-offset-[5px] transition-colors hover:text-textPrimary hover:decoration-textPrimary/30"
            >
              中文演示稿
              <span aria-hidden className="text-[9px] opacity-70">
                →
              </span>
            </Link>
          </motion.div>
        </header>

        <motion.div
          style={{ y: heroMediaY, scale: heroMediaScale }}
          className="relative mt-16 origin-top will-change-transform md:mt-24 lg:mt-28"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.38, delay: reduce ? 0 : 0.26, ease: easeLux }}
            className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_36px_-18px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-[580ms] ease-out hover:shadow-[0_28px_64px_-26px_rgba(109,40,217,0.1)] hover:ring-violet-400/22"
          >
            <Image
              src="/assets/studio-engine/hero-1.jpg"
              alt="Studio Engine.ai product and workflow overview"
              width={2400}
              height={1350}
              sizes="(max-width: 1024px) 100vw, min(1152px, 92vw)"
              className="h-auto w-full"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Starting point */}
        <section id="starting-point" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Starting point</Eyebrow>
            <SectionTitle>A powerful tool with a narrow door</SectionTitle>
            <Prose className="mt-14">
              <p>
                Studio Engine.ai turns a single text prompt into a full pre-production package — script,
                character visuals, props, locations, and a synthesized storyboard. It was built for professional
                film studios, and it showed.
              </p>
              <p>
                The interaction model assumed everyone already thought like a professional filmmaker: dense
                terminology, a non-linear workflow, and an unstated bar for who &ldquo;belonged&rdquo; in the tool.
                Film students, independent animators, and content creators often felt they were using an industry
                product they had not yet earned.
              </p>
              <p className="text-textPrimary">
                That gap was both usability and growth. The company wanted a Gen-2 product that kept professional
                depth while expanding to new audiences — grounded in real behavior, not assumption. Our team shaped
                what that expansion should look like.
              </p>
            </Prose>
            <div className="mt-14 md:mt-16">
              <PullQuote>
                The product&apos;s capabilities were undeniable — but its interaction model was built around
                professionals. The gap wasn&apos;t in the AI. It was in the assumptions baked into every screen.
              </PullQuote>
            </div>
          </Reveal>
        </section>

        {/* Background */}
        <section id="context" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal delay={0.04}>
            <Eyebrow>Context</Eyebrow>
            <SectionTitle>What the product actually does</SectionTitle>
            <div className="mt-14 flex flex-col gap-8 lg:gap-10">
              <Prose>
                <p>
                  A creative prompt becomes script, character and prop imagery, locations, and a composed
                  storyboard — a production-ready visual script kit, through to final video output. The challenge
                  is collapsing a multi-stage craft into one interaction model without assuming fluency in
                  pre-production language.
                </p>
              </Prose>
              <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-6">
                <MediaReveal className="h-full min-h-0" delay={0}>
                  <Figure
                    layout="grid"
                    gridColumns={3}
                    src="/assets/studio-engine/workflow-1.jpg"
                    alt="input"
                    width={800}
                    height={560}
                    caption="input - a creative prompt"
                  />
                </MediaReveal>
                <MediaReveal className="h-full min-h-0" delay={0.08}>
                  <Figure
                    layout="grid"
                    gridColumns={3}
                    src="/assets/studio-engine/workflow-2-output.jpg"
                    alt="Usability study — editing visual elements"
                    width={800}
                    height={560}
                    caption="output - script generation from a written prompt."
                  />
                </MediaReveal>
              </div>


              <div>
                <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-textSecondary/70">
                  Workflow
                </p>
                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-textSecondary md:text-[15px]">
                  Same prompt — before it triggers everything at once; after it stages script work, then visuals.
                </p>
                <motion.div
                  className="mt-6 overflow-hidden rounded-2xl ring-1 ring-black/[0.06] transition-[box-shadow,ring-color] duration-500 ease-out hover:shadow-[0_22px_56px_-22px_rgba(124,58,237,0.12)] hover:ring-violet-400/35 md:grid md:grid-cols-2 md:divide-x md:divide-black/[0.06]"
                  initial={false}
                  whileHover={reduce ? undefined : { y: -3 }}
                  transition={{ duration: 0.45, ease: easePremium }}
                >
                  <aside className="flex flex-col bg-white px-5 py-5 md:min-h-0 md:px-6 md:py-5">
                    <p className="text-[11px] font-medium text-textPrimary">Before</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/75">
                      Current product
                    </p>
                    <p className="mt-3 rounded-lg bg-white/80 px-3 py-2.5 text-[13px] leading-snug tracking-[-0.01em] text-textPrimary ring-1 ring-black/[0.04]">
                      &ldquo;Create a video about Little Red Riding Hood&rdquo;
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-textSecondary/50" aria-hidden>
                      <span className="h-px flex-1 bg-black/[0.08]" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em]">One pass</span>
                      <span className="h-px flex-1 bg-black/[0.08]" />
                    </div>
                    <p className="mt-3 text-[12px] leading-snug text-textSecondary md:text-[13px]">
                      {WORKFLOW_BEFORE_AT_ONCE}
                    </p>
                  </aside>
                  <aside className="flex flex-col border-t border-black/[0.06] bg-white px-5 py-5 md:border-t-0 md:px-6 md:py-5">
                    <p className="text-[11px] font-medium text-textPrimary">After</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-textSecondary/75">
                      Gen-2
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-md border border-black/[0.06] bg-white px-2.5 py-1 text-[12px] leading-tight text-textPrimary">
                        Brief
                      </span>
                      <span className="rounded-md border border-black/[0.06] bg-white px-2.5 py-1 text-[12px] leading-tight text-textPrimary">
                        File upload
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 border-t border-black/[0.05] pt-3">
                      <p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-textSecondary/80">
                          1 Script
                        </span>
                        <span className="mt-1 block text-[12px] leading-snug text-textSecondary md:text-[13px]">
                          {WORKFLOW_AFTER_SCRIPT_LINE}
                        </span>
                      </p>
                      <p className="rounded-md border border-black/[0.06] bg-white px-2.5 py-1.5 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-textSecondary">
                        Script verified
                      </p>
                      <p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-textSecondary/80">
                          2 Visuals
                        </span>
                        <span className="mt-1 block text-[12px] leading-snug text-textSecondary md:text-[13px]">
                          {WORKFLOW_AFTER_VISUALS_LINE}
                        </span>
                      </p>
                    </div>
                  </aside>
                </motion.div>
              </div>
            </div>
          </Reveal>
          
          <Reveal className="mt-24 md:mt-32" delay={0.04}>
            <Subtitle>Who we needed to serve next</Subtitle>
            <Prose className="mt-10">
              <p>
                Film and media students, animation and indie creators, beginners learning craft, and
                budget-conscious directors who need fast pre-production. They were not failing for lack of
                creativity — the product&apos;s mental model did not match theirs.
              </p>
            </Prose>
            <Subtitle className="!mt-20 md:!mt-24">Project goals</Subtitle>
            <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
              {[
                {
                  n: "01",
                  title: "Drive paid conversions",
                  body: "Lower the barrier to a first successful experience so more people try a paid subscription.",
                },
                {
                  n: "02",
                  title: "Universal usability",
                  body: "Work for people still learning the craft — not only five-year industry veterans.",
                },
                {
                  n: "03",
                  title: "Identify UX gaps",
                  body: "Surface friction in the pre-production workflow and prioritize by user impact.",
                },
              ].map((g) => (
                <HoverPanel
                  key={g.n}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.06)] md:p-7"
                >
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-textSecondary/90">
                    Goal {g.n}
                  </p>
                  <h4 className="mt-3 font-display text-lg font-light tracking-[-0.02em] text-textPrimary">
                    {g.title}
                  </h4>
                  <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">{g.body}</p>
                </HoverPanel>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Research */}
        <section id="research" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Research</Eyebrow>
            <SectionTitle>Designing research around the right questions</SectionTitle>
            <Prose className="mt-14">
              <p>
                Before recruiting, we aligned on three questions that anchored every observation. Each mapped to
                a core phase of the workflow: script and assets from a prompt, understanding of edit and
                regeneration, and emotional response across generation and review.
              </p>
            </Prose>
            <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
              {RESEARCH_QUESTIONS.map((q, i) => (
                <HoverPanel
                  key={q}
                  className="rounded-2xl border border-black/[0.06] bg-white px-6 py-7 md:px-7 md:py-8"
                >
                  <p className="font-mono text-[28px] font-medium leading-none text-textPrimary/[0.15]">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-textSecondary md:text-base">{q}</p>
                </HoverPanel>
              ))}
            </div>
            <Subtitle>Who we recruited — and why</Subtitle>
            <Prose className="mt-10">
              <p>
                We recruited six participants from professional users through the new target audience. The mix was
                deliberate: learn where novices struggled, and whether the tool also created friction for
                experienced users with established creative habits.
              </p>
            </Prose>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RESEARCH_PARTICIPANTS.map((p) => (
                <HoverPanel
                  key={p.id}
                  className="rounded-xl border border-black/[0.06] bg-white px-5 py-5 md:px-6 md:py-5"
                >
                  <p className="font-mono text-[11px] font-medium text-textPrimary/80">{p.id}</p>
                  <p className="mt-1.5 text-[15px] font-medium text-textPrimary">{p.role}</p>
                  <p className="mt-1 text-[13px] text-textSecondary/90">{p.detail}</p>
                </HoverPanel>
              ))}
            </div>
            <Subtitle>Methodology</Subtitle>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {METHODOLOGY.map((m, i) => (
                <HoverPanel
                  key={m}
                  className="rounded-xl border border-black/[0.06] bg-white px-5 py-5 md:px-6 md:py-5"
                >
                  <p className="font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-textSecondary/80">
                    Method {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-[15px] leading-relaxed text-textSecondary">{m}</p>
                </HoverPanel>
              ))}
            </div>
            <Subtitle>The three tasks</Subtitle>
            <Prose className="mt-10">
              <p>
                Tasks mapped to three workflow phases. Task 2 — visual editing — was where everything broke in
                session after session.
              </p>
            </Prose>
            <div className="mt-10 space-y-12 md:space-y-14 lg:space-y-16">
              {USABILITY_TASK_BLOCKS.map((task) => (
                <div key={task.id}>
                  {task.variant === "warn" ? (
                    <motion.div
                      className="rounded-2xl border border-violet-300/35 bg-violet-500/[0.045] px-6 py-7 transition-[box-shadow,border-color] duration-[520ms] ease-out hover:border-violet-400/45 hover:shadow-[0_24px_52px_-28px_rgba(109,40,217,0.1)]"
                      initial={false}
                      whileHover={reduce ? undefined : { y: -2 }}
                      transition={{ duration: 0.52, ease: easePremium }}
                    >
                      <p className="font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-violet-900/75">
                        {task.eyebrow}
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">{task.body}</p>
                    </motion.div>
                  ) : (
                    <HoverPanel className="rounded-2xl border border-black/[0.06] bg-white px-6 py-7">
                      <p className="font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-textSecondary/90">
                        {task.eyebrow}
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">{task.body}</p>
                    </HoverPanel>
                  )}
                  <TaskWorkflowGallery
                    steps={task.steps}
                    columns={task.steps.length >= 4 ? 4 : 3}
                  />
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-16 md:mt-24" delay={0.06}>
            <p className="max-w-2xl text-xl font-light leading-snug tracking-[-0.02em] text-textPrimary md:text-2xl">
              Task 2 is where the experience broke for everyone.
            </p>
          </Reveal>
        </section>

        {/* Insights — synthesis, task metrics, severity */}
        <section id="insights" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Insights</Eyebrow>
            <SectionTitle>Where the product was fighting its users</SectionTitle>
            <Prose className="mt-14">
              <p>
                The data concentrated on one zone: <strong className="font-medium text-textPrimary">visual editing </strong> was the
                highest-friction area across every participant. Six of six hit the same walls: unpredictable AI
                output, no version recovery, fragmented multi-page editing, unexplained terms like
                &ldquo;InPainting,&rdquo; weak CTA hierarchy, and exports missing structure.
              </p>
              <p className="text-textPrimary">
                These were not isolated bugs. They pointed to one root issue: the product treated AI generation as
                a one-shot oracle. Users needed a controllable, collaborative creative partner.
              </p>
            </Prose>
          </Reveal>
          <Reveal className="mt-16 md:mt-20" delay={0.04}>
            <TaskSuccessEvaluation />
          </Reveal>
          <Reveal delay={0.04}>
            <SeverityIssuesTable />
          </Reveal>
          <Reveal className="mt-14 md:mt-16" delay={0.06}>
            <PullQuote>
              Six out of six participants hit the same walls. Each issue was a symptom of a shared root problem:
              the product was treating AI generation as a one-shot oracle.
            </PullQuote>
          </Reveal>
          
        </section>

        {/* Design framing */}
        <section id="design" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Design</Eyebrow>
            <SectionTitle>Progressive scaffolding</SectionTitle>
            <Prose className="mt-14">
              <p>
                The central design question was not only &ldquo;how do we simplify?&rdquo; It was harder: how do
                we make professional power feel accessible without removing it?
              </p>
              <p>
                The original flow collapsed everything after one prompt. Efficient, but cognitively overwhelming —
                when something failed, there was no sense of where in the process it broke.
              </p>
            </Prose>
          </Reveal>

          <Reveal className="mt-16 md:mt-20" delay={0.04}>
            <iframe
              title="Workflow comparison — before vs after"
              src="/assets/studio-engine/before_after_horizontal_workflow_v2.html"
              className="block h-[min(92vh,1000px)] w-full min-h-[52vh] border-0 sm:min-h-[60vh]"
              loading="lazy"
            />
          </Reveal>

          <Reveal className="mt-24 md:mt-32" delay={0.05}>
            <blockquote className="max-w-3xl border-l border-black/[0.1] pl-10 md:pl-12">
              <p className="font-display text-[1.35rem] font-light leading-snug text-textPrimary md:text-2xl md:leading-snug">
                How might we design Studio Engine.ai Gen-2 to be equally usable and valuable for professional
                filmmakers and emerging creators — while supporting growth and conversion from free to paid?
              </p>
            </blockquote>
          </Reveal>
        </section>

        {/* Progressive UI */}
        <section id="flow" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Flow</Eyebrow>
            <SectionTitle>Clarity at each checkpoint</SectionTitle>
            <Prose className="mt-14">
              <p>
                Stages for input, basics, and editing give users room to review before the next layer of AI
                work. Comparisons below are intentionally quiet — the interface carries the story.
              </p>
            </Prose>
          </Reveal>
          <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
            <FlowMacBookPair
              leftSrc="/assets/studio-engine/input-before.jpg"
              leftAlt="Input experience before redesign"
              rightSrc="/assets/studio-engine/input-after.jpg"
              rightAlt="Input experience after redesign"
              caption="Input — before and after."
            />
            <FlowMacBookPair
              leftSrc="/assets/studio-engine/basic-before.jpg"
              leftAlt="Basics stage before redesign"
              rightSrc="/assets/studio-engine/basic-after.jpg"
              rightAlt="Basics stage after redesign"
              caption="Basics — progressive disclosure."
              mediaRevealDelay={0.06}
            />
            <FlowMacBookPair
              leftSrc="/assets/studio-engine/edit-before.jpg"
              leftAlt="Editing surface before redesign"
              rightSrc="/assets/studio-engine/edit-after.jpg"
              rightAlt="Unified editing surface after redesign"
              caption="Edit — unified surface, in-context changes."
              mediaRevealDelay={0.06}
            />
          </div>
        </section>

        {/* Problem / solution pairs — one column narrative */}
        <section id="solutions" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Solutions</Eyebrow>
            <SectionTitle>From friction to partnership</SectionTitle>
          </Reveal>

          <div className="mt-24 space-y-32 md:mt-32 md:space-y-40">
            <Reveal delay={0.04}>
              <Subtitle>Options, not verdicts</Subtitle>
              <Prose className="mt-10">
                <p>
                  When users tried to modify characters or locations, the AI sometimes returned an entirely
                  different image instead of a refinement — and the previous version disappeared with no undo.
                  Regeneration is now framed as <strong className="font-medium text-textPrimary">multi-option selection, not replacement</strong>:
                  several variations at once, pick the closest match to intent.
                </p>
                <p>
                  The AI shifts from decision-maker to collaborator — closer to what the technology should feel
                  like. <span className="text-textPrimary/90 italic">&ldquo;Option instead of edit.&rdquo;</span>
                </p>
              </Prose>
              <div className="mt-14">
                <FlowMacBookPair
                  leftSrc="/assets/studio-engine/solution-1-1.jpg"
                  leftAlt="Multi-option visual selection"
                  rightSrc="/assets/studio-engine/solution-1-2.jpg"
                  rightAlt="Variation grid in context"
                  imageWidth={1000}
                  imageHeight={720}
                />
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <Subtitle>Version history as a safety net</Subtitle>
              <Prose className="mt-10">
                <p>
                  Regeneration overwrote prior work. One participant cycled versions trying to recover a lost
                  image; another lost a character mid-edit when the page did not auto-save. A visible{" "}
                  <strong className="font-medium text-textPrimary">generate history panel</strong> saves every
                  generation so people can return to any past version, mark favorites, or delete iterations —
                  the same safety net they trust in Figma or Google Docs.
                </p>
                <p>Iterative AI only feels safe when you know you can go back.</p>
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
                  leftCaption="Before"
                  rightCaption="After"
                  imageWidth={1000}
                  imageHeight={700}
                  deviceFrame={false}
                />
              </div>
            </Reveal>

            <Reveal delay={0.04}>
              <Subtitle>One surface for editing</Subtitle>
              <Prose className="mt-10">
                <p>
                  Editing a character meant script overview → characters list → character page → edit modal →
                  back through multiple screens — a disorienting loop just to change one visual. A{" "}
                  <strong className="font-medium text-textPrimary">consolidated editing panel</strong> keeps
                  description, generation controls (generate, inpainting, draw, references), and history on one
                  surface: generate here, edit here, see results immediately.
                </p>
                <p className="text-textPrimary/90 italic">
                  Don&apos;t make users leave the page to do the thing they came to the page to do.
                </p>
              </Prose>
              <div className="mt-14">
                <FlowMacBookPair
                  leftSrc="/assets/studio-engine/problem-3.png"
                  leftAlt="Problem — fragmented editing across pages"
                  rightSrc="/assets/studio-engine/edit-after.jpg"
                  rightAlt="Solution — consolidated editing panel"
                  leftCaption="Before"
                  rightCaption="After"
                  imageWidth={1000}
                  imageHeight={700}
                  deviceFrame={false}
                />
              </div>
            </Reveal>

        

            <Reveal delay={0.04}>
              <Subtitle>CTAs and wait states</Subtitle>
              <Prose className="mt-10">
                <p>
                  CTAs varied in color, weight, and placement; under stress, people could not find the primary
                  action. A <strong className="font-medium text-textPrimary">standardized button system</strong>{" "}
                  (primary, secondary, hover, active, disabled) restores hierarchy. Labels update with context —
                  for example before and after editing states.
                </p>
                <p>
                  A static loading screen made generation feel stuck or crashed. A real-time progress panel for
                  characters, locations, and props — with the option to edit completed assets while others
                  generate — reduces perceived wait and rebuilds trust.
                </p>
              </Prose>
              <div className="mt-14 space-y-16 md:space-y-20">
                <FlowMacBookPair
                  leftSrc="/assets/studio-engine/problem-5.jpg"
                  leftAlt="Problem — inconsistent primary actions"
                  rightSrc="/assets/studio-engine/solution-5.jpg"
                  rightAlt="Solution — clear hierarchy and progress"
                  leftCaption="Before"
                  rightCaption="After"
                  imageWidth={1000}
                  imageHeight={700}
                  deviceFrame={false}
                />
                <FlowMacBookPair
                  leftSrc="/assets/studio-engine/problem-7.jpg"
                  leftAlt="Problem — static loading felt like a crash"
                  rightSrc="/assets/studio-engine/solution-7.jpg"
                  rightAlt="Solution — active progress and continuity"
                  leftCaption="Before"
                  rightCaption="After"
                  imageWidth={1000}
                  imageHeight={700}
                  deviceFrame={false}
                  mediaRevealDelay={0.05}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Agent + IA */}
        <section id="system" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>System</Eyebrow>
            <SectionTitle>Agent layer and information architecture</SectionTitle>
            <Prose className="mt-14">
              <p>
                Gen-2 structures the journey as Input → Basics → Visuals → Edit → Manage, with an AI agent
                surfaced in context instead of buried in menus.
              </p>
            </Prose>
          </Reveal>
          <div className="mt-20 grid items-stretch gap-10 md:mt-28 md:grid-cols-2 md:gap-12">
          <MediaReveal className="h-full min-h-0" delay={0.1}>
              <Figure
                layout="grid"
                gridColumns={2}
                src="/assets/studio-engine/information architecture.jpg"
                alt="Agent experience after"
                width={1100}
                height={780}
              />
            </MediaReveal>
            
          </div>
          
        </section>

        {/* Outcomes */}
        <section id="outcomes" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Outcomes</Eyebrow>
            <SectionTitle>Measuring what changed</SectionTitle>
            <Prose className="mt-14">
              <p>
                Baseline SUS and interviews converged: when friction dropped, Studio Engine.ai felt empowering
                rather than forbidding. People described a low barrier to start, AI as assistant rather than
                replacement, visuals they could share, and room to grow into the craft.
              </p>
              <p>
                The goal is not to make filmmaking trivial — it is to make it accessible by removing arbitrary
                barriers that come from interface opacity, not from the art itself.
              </p>
            </Prose>
          </Reveal>
         
          <Reveal className="mt-16 md:mt-20" delay={0.06}>
            <Subtitle>What the redesigned experience delivered</Subtitle>
            <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
              {[
                {
                  title: "Restructured workflow",
                  body: "A progressive four-stage pipeline (basics → outline → script → visual generations) replaced one overwhelming generation step, with review and commit before the next layer.",
                },
                {
                  title: "Generation history",
                  body: "A persistent revision trail across AI-generated assets — return to any version, mark favorites, and recover from unexpected outputs without losing work.",
                },
                {
                  title: "Unified edit surface",
                  body: "Character and asset editing consolidated into one panel: generate, inpaint, draw, and review history without leaving the page or losing context.",
                },
                {
                  title: "AI agent layer",
                  body: "A contextual assistant surfaced throughout the workflow — not buried in menus — to guide the next creative decision at each stage.",
                },
              ].map((o) => (
                <HoverPanel
                  key={o.title}
                  className="rounded-2xl border border-black/[0.06] bg-white px-6 py-7 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.05)] md:px-7"
                >
                  <h4 className="font-display text-lg font-light tracking-[-0.02em] text-textPrimary">{o.title}</h4>
                  <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">{o.body}</p>
                </HoverPanel>
              ))}
            </div>
          </Reveal>
          <MediaReveal className="mt-20 md:mt-28" delay={0.08}>
            <SingleTabletFrame
              src="/assets/studio-engine/design-projects.jpg"
              alt="Updated visual design language"
              width={2000}
              height={1120}
              caption="Refined visual language supporting collaboration and clarity."
            />
          </MediaReveal>
        </section>

        {/* Reflection */}
        <section id="reflection" className="scroll-mt-32 mt-44 md:mt-56 lg:mt-72">
          <Reveal>
            <Eyebrow>Reflection</Eyebrow>
            <SectionTitle>Designing for competence, not just capability</SectionTitle>
            <Prose className="mt-14">
              <p className="text-textPrimary">
                Designing AI-powered products is not primarily about making the AI smarter. It is about making
                the human feel competent. The pipeline was already capable; the gap was that people could not see
                their own agency inside it.
              </p>
              <p>
                Every time the model returned something unexpected with no recovery path, users did not think
                &ldquo;this model needs work.&rdquo; They thought: &ldquo;I don&apos;t know what I&apos;m
                doing.&rdquo; That is a design failure, not a model failure.
              </p>
              <p>
                Using AI to prototype flows, synthesize research patterns, and stress-test information architecture
                reinforced a simple rule: AI does not replace design judgment. It accelerates the distance between a
                question and an answer — which frees designers to ask better questions.
              </p>
              <MediaReveal className="mt-20 md:mt-28" delay={0.08}>
                <SingleTabletFrame
                  src="/assets/studio-engine/visual.jpg"
                  alt="Updated visual design language"
                  width={2000}
                  height={1120}
                  caption="Refined visual language supporting collaboration and clarity."
                />
              </MediaReveal>
            </Prose>
            <Subtitle>What I would push further</Subtitle>
            <Prose className="mt-10">
              <p>
                With more time, I would run a longitudinal study with Gen-2 prototypes — especially with student
                users over four to six weeks. Moving from &ldquo;can I complete this task?&rdquo; to &ldquo;does
                this tool grow with me?&rdquo; is a different research question, and it matters for converting free
                users to paid subscribers.
              </p>
              <p>
                I would also invest a dedicated sprint in the AI agent layer: when it speaks, what it knows, and
                how trust builds over time — rich enough to be its own project.
              </p>
            </Prose>
            <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
              {[
                {
                  t: "AI as design material",
                  d: "Treat AI outputs as constraints, not magic. Designing around failure and uncertainty is where the real UX work lives.",
                },
                {
                  t: "Research as storytelling",
                  d: "The most important output of research is not a deck — it is a narrative that makes product decisions feel inevitable to people who were not in the room.",
                },
                {
                  t: "Iteration as proof",
                  d: "Each prototype step should be explainable evidence of design thinking, not just process noise.",
                },
              ].map((x) => (
                <HoverPanel
                  key={x.t}
                  className="rounded-xl border border-black/[0.06] bg-white px-5 py-6 md:px-6"
                >
                  <p className="text-[14px] font-medium text-textPrimary">{x.t}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-textSecondary">{x.d}</p>
                </HoverPanel>
              ))}
            </div>
          </Reveal>
          
        </section>

        <footer className="mt-44 border-t border-black/[0.05] pt-20 md:mt-56 md:pt-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-textSecondary">
            Studio Engine.ai · January–April 2025
          </p>
          <Link
            href="/#work"
            className="mt-10 inline-flex text-[15px] text-textSecondary underline decoration-black/[0.1] underline-offset-[6px] transition-[color,transform,text-decoration-color] duration-[420ms] ease-out hover:-translate-y-0.5 hover:text-violet-800 hover:decoration-violet-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/40 focus-visible:ring-offset-4"
          >
            ← Back to work
          </Link>
        </footer>
      </article>
    </main>
    </>
  );
}
