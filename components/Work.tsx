"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

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
    src: "/assets/meituan-im/Repair%20Flow.html?solo",
    alt: "Meituan repair flow — interactive prototype preview",
    type: "prototype",
    naturalW: 540,
    naturalH: 1060,
  },
  flowSteps: ["diagnose", "quote compare", "confirm"],
  meta: { year: "2025", role: "Product Design Intern", status: "Shipped" },
  impact: "+5% conversion · −50% pricing disputes (A/B validated)",
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

const workRows: WorkRow[] = [
  { kind: "single", project: liner },
  { kind: "single", project: aiCharacter },
  { kind: "single", project: meituanIm },
  { kind: "single", project: studioEngine },
  { kind: "single", project: qbix },
];

// Flat order for the stacked /work view — each project becomes one sticky layer.
const stackProjects: Project[] = [liner, aiCharacter, meituanIm, studioEngine, qbix];

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

/** Stacked "file deck" scroll: each project is a sticky layer that pins near the
 *  top with a small incrementing offset, so the next project slides up and stacks
 *  over it (the prior cards peek as edges behind). Pure CSS sticky — the page
 *  doesn't translate, the cards pile up. */
function WorkStack({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <section id="work" className="relative pt-6 md:pt-10" aria-label="Selected projects">
      {/* Trailing space lets the last layer reach its pinned position so the
          full deck is visible at the bottom of the scroll. */}
      <div className="relative z-10 mx-auto max-w-content px-6 pb-[42vh]">
        {stackProjects.map((project, i) => (
          <div
            key={project.slug}
            className="sticky mb-[7vh] last:mb-0 md:mb-[9vh]"
            style={{
              top: `calc(4.5rem + ${i * 1.25}rem)`,
              zIndex: i + 1,
            }}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-18% 0px" }}
              transition={{ duration: 0.6, ease: easePortfolio }}
              className="rounded-2xl shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.5),0_18px_48px_-24px_rgba(0,0,0,0.6)] md:rounded-[1.5rem]"
            >
              <ProjectCard project={project} tall />
            </motion.div>
          </div>
        ))}
      </div>
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
