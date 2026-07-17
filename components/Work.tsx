"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMemo, useRef } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const tiktok: Project = {
  slug: "tiktok",
  title: "TikTok — Redesigned how friends' shared videos surface in a Shared with You feed",
  description:
    "Self-initiated product case study: turning the DM inbox of friend-shared videos into a scrollable Shared Feed with one-tap Smart Reactions and reply-value ranking.",
  media: {
    src: "/assets/TikTok/showcase.mp4",
    alt: "TikTok Shared with You — feed design walkthrough",
    type: "video",
  },
  flowSteps: ["smart reactions", "shared feed", "reply-value ranking"],
  meta: { year: "2026", role: "Self-initiated", status: "Concept" },
  tags: ["Social · UX", "Interaction Design"],
  logo: {
    src: "/assets/TikTok/tiktok-logo.svg",
    alt: "TikTok",
    className: "h-5 w-auto md:h-6",
  },
  hoverTint: "rgba(254, 44, 85, 0.12)",
};

const aiCharacter: Project = {
  slug: "ai-character",
  title: "Alibaba Cloud — Shipped Qwen Character's Interactive Showrooms MVP",
  description: "0→1 MVP feature for Qwen Character LLM, serving millions of enterprise customers.",
  media: {
    src: "/assets/ai-character/figma-h264.mp4",
    alt: "Alibaba Qwen AI Character — interactive showrooms",
    type: "showroom",
    showrooms: [
      "/work/ai-character/prototype-astro?embed=1&muted=1",
      "/work/ai-character/prototype-psych?embed=1&muted=1",
      "/work/ai-character/prototype?embed=1&muted=1",
    ],
  },
  flowSteps: ["showroom", "prompt guide", "live code editor"],
  meta: { year: "2025", role: "Product Design Intern", status: "Shipped" },
  impact: "+200% model API call volume · 4 interactive demos",
  tags: ["0→1 MVP", "AI-Native UX"],
  logo: {
    src: "/assets/ai-character/alibaba-cloud-logo.png",
    alt: "Alibaba Cloud",
    // ~60% of the default badge size — the Alibaba mark reads larger than the rest.
    className: "h-[0.9rem] w-auto md:h-[1.05rem]",
  },
  hoverTint: "rgba(64, 132, 240, 0.12)",
};

const studioEngine: Project = {
  slug: "studio-engine",
  title: "StudioEngine — Rebuilt a GenAI video app into a 4-stage creative workspace",
  description: "Restructured a Gen-2 web app from a single-step generator into a four-stage creative workspace creators actually iterate in.",
  media: {
    src: "/assets/work/vp-genie.jpg",
    alt: "Preview image for Studio Engine.ai project",
    type: "image",
  },
  flowSteps: ["basics", "outline", "script", "visuals"],
  meta: { year: "2025", role: "Product Designer", status: "Shipped" },
  impact: "Usability study (n=6) · Version history · Checkpoints · Unified editor",
  tags: ["GenAI Workflow", "Product Strategy"],
  logo: {
    src: "/assets/studio-engine/studioengine-logo.png",
    alt: "StudioEngine AI",
  },
  hoverTint: "rgba(143, 110, 220, 0.10)",
};

const meituanIm: Project = {
  slug: "meituan-im",
  title: "Meituan — 0→1 in-message quotation system on a 770M-user platform",
  description: "Led the 0-to-1 design of an in-message quotation system on a platform with 770M+ annual transacting users and 14.5M active merchants.",
  media: {
    src: "/assets/meituan-im/meituan-present/meituan-present-1.mp4",
    alt: "Meituan repair flow — product walkthrough",
    type: "video",
  },
  flowSteps: ["diagnose", "quote compare", "confirm"],
  meta: { year: "2025", role: "Product Design Intern", status: "Shipped" },
  impact: "+30% channel conversion · +0.5pp overall · ~2k orders / −50% disputes (projected)",
  tags: ["Conversational Commerce", "A/B Validated"],
  logo: {
    src: "/assets/meituan-im/meituan-logo.png",
    alt: "Meituan",
  },
  hoverTint: "rgba(255, 210, 0, 0.12)",
};

const qbix: Project = {
  slug: "qbix",
  title: "Qbix Studio — Design agency, 0→1 brand · design, code, build",
  description: "Full-stack solo build for a creative agency — 0→1 brand identity, work showcase, and inquiry flow, from concept to production.",
  media: {
    src: "/assets/work/Area.mp4",
    alt: "Qbix Studio design agency website — full-page walkthrough",
    type: "video",
  },
  flowSteps: ["concept", "design", "code", "ship"],
  meta: { year: "2026", role: "Solo Build", status: "Shipped" },
  tags: ["Solo Build", "Design + Code"],
  logo: {
    src: "/assets/work/logo.png",
    alt: "Qbix Studio",
    className: "h-12 w-auto md:h-14",
  },
  externalHref: "https://qbix.space",
  hoverTint: "rgba(210, 255, 0, 0.10)",
};

const liner: Project = {
  slug: "liner",
  title: "Liner — Research + designed AI-native co-research for 10M+ academic users",
  description: "Led end-to-end research and design for an AI-native collaborative research experience — where people collect sources, discuss, and co-write together.",
  media: {
    src: "/assets/liner/liner-product-video.mp4",
    alt: "Liner AI collaboration feature — research and design preview",
    type: "video",
  },
  flowSteps: ["ai/group chat", "shared library", "co-write editor"],
  meta: { year: "2026", role: "Product Designer", status: "In progress" },
  impact: "10M+ users · a16z top 20 web AI",
  tags: ["AI Collaboration", "Product Strategy"],
  logo: {
    src: "/assets/liner/linerlogo.png",
    alt: "Liner",
  },
  hoverTint: "rgba(120, 165, 95, 0.10)",
};

type WorkRow =
  | { kind: "single"; project: Project }
  | { kind: "pair"; left: Project; right: Project };

// NOTE: `qbix` is intentionally hidden for now — its definition, route, and assets
// all still exist; add `qbix` back into the two arrays below to re-surface the card.
const workRows: WorkRow[] = [
  { kind: "single", project: liner },
  { kind: "single", project: tiktok },
  { kind: "single", project: aiCharacter },
  { kind: "single", project: meituanIm },
  { kind: "single", project: studioEngine },
];

// Flat order for the stacked /work view — each project becomes one sticky layer.
const stackProjects: Project[] = [liner, tiktok, aiCharacter, meituanIm, studioEngine];

void qbix; // referenced to keep the hidden project defined without an unused-var warning

const itemSpring = {
  hidden: { opacity: 0, y: 42 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 68,
      damping: 19,
      mass: 0.52,
    },
  },
};

const itemReduced = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easePortfolio },
  },
};

const stackCardShadow =
  "rounded-2xl shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.5),0_24px_60px_-24px_rgba(0,0,0,0.7)] md:rounded-[1.5rem]";

/** One layer of the deck. Each card lives in a full-viewport sticky section and
 *  is vertically centered, so the *active* card always rises to the middle of
 *  the screen. The shared container `progress` drives a small scale-down + lift
 *  during ONLY this card's hand-off window — the slice of scroll where the next
 *  card rises to cover it — then holds. Because the recede doesn't keep
 *  deepening, at most one subtle layer peeks behind the centered card
 *  (one-covers-one), not a deep five-card fan. */
function StackCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const isLast = index === total - 1;
  // Each section pins at progress index/(total-1); the next card covers it over
  // the following 1/(total-1) slice. Recede across exactly that slice, then hold.
  const denom = Math.max(total - 1, 1);
  const start = index / denom;
  const end = (index + 1) / denom;
  const scale = useTransform(progress, [start, end], [1, 0.95]);
  const y = useTransform(progress, [start, end], [0, -36]);

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center" style={{ zIndex: index + 1 }}>
      <motion.div
        // The last card never recedes (nothing covers it) — keep it static.
        style={isLast ? undefined : { scale, y }}
        className={`w-full bg-white ${stackCardShadow}`}
      >
        <ProjectCard project={project} tall />
      </motion.div>
    </div>
  );
}

/** A scroll affordance pinned to the bottom of the viewport on the stacked deck.
 *  At rest the first card fills the screen with no visible cue that four more
 *  sit below it (each card centers in its own full-height sticky section), so
 *  this nudges the user to scroll — and fades out the moment the deck moves. */
function DeckScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.025], [1, 0]);
  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 bottom-7 z-30 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">Scroll</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm"
      >
        <ChevronDown className="h-4 w-4 text-nltLime" strokeWidth={2} />
      </motion.span>
    </motion.div>
  );
}

/** Stacked deck: full-screen sticky sections center each project, and a single
 *  container scroll progress drives a shallow one-covers-one hand-off.
 *  Reduced-motion users get a plain vertical list (no sticky, no transforms). */
function WorkStack({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (prefersReducedMotion) {
    return (
      <section id="work" className="relative pt-6 md:pt-10" aria-label="Selected projects">
        <div className="relative z-10 mx-auto flex max-w-content flex-col gap-10 px-6 pb-24">
          {stackProjects.map((project) => (
            <div key={project.slug} className={`bg-white ${stackCardShadow}`}>
              <ProjectCard project={project} tall />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="relative" aria-label="Selected projects">
      <div ref={containerRef} className="relative z-10 mx-auto max-w-content px-6">
        {stackProjects.map((project, i) => (
          <StackCard
            key={project.slug}
            project={project}
            index={i}
            total={stackProjects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
      <DeckScrollHint progress={scrollYProgress} />
    </section>
  );
}

export function Work({ stack = false }: { stack?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: prefersReducedMotion ? 0 : 0.14,
          delayChildren: prefersReducedMotion ? 0 : 0.08,
        },
      },
    }),
    [prefersReducedMotion],
  );

  const itemVariants = prefersReducedMotion ? itemReduced : itemSpring;

  if (stack) {
    return <WorkStack prefersReducedMotion={Boolean(prefersReducedMotion)} />;
  }

  return (
    <section
      id="work"
      ref={ref}
      className="relative pt-6 pb-20 md:pt-10 md:pb-28"
      aria-label="Selected projects"
    >
      <div className="relative z-10 mx-auto max-w-content px-6">
        <motion.div
          className="flex flex-col gap-9 md:gap-10 lg:gap-11"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          {workRows.map((row) =>
            row.kind === "single" ? (
              <motion.div key={row.project.slug} variants={itemVariants} className="w-full">
                <ProjectCard project={row.project} />
              </motion.div>
            ) : (
              <motion.div
                key={`${row.left.slug}-${row.right.slug}`}
                variants={itemVariants}
                className="grid grid-cols-1 items-stretch gap-9 md:grid-cols-2 md:gap-7 lg:gap-9"
              >
                <ProjectCard project={row.left} />
                <ProjectCard project={row.right} />
              </motion.div>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}
