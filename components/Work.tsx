"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const aiCharacter: Project = {
  slug: "ai-character",
  title: "Alibaba Cloud — From 60-min docs to a 2-min product",
  description:
    "Shipped Interactive Showrooms, the MVP for Qwen Character — cut time-to-first-value from 60+ minutes of docs to under 2 minutes and drove a 200% lift in model API call volume across enterprise users.",
  media: {
    src: "/assets/ai-character/figma-h264.mp4",
    alt: "Alibaba Qwen AI Character product experience preview",
    type: "video",
  },
  flowSteps: ["prompt", "response", "deploy"],
  meta: { year: "2025", role: "Product Designer", status: "Shipped" },
  impact: "−97% onboarding time",
  logo: {
    src: "/assets/ai-character/alibaba-cloud-logo.png",
    alt: "Alibaba Cloud",
    // ~60% of the default badge size — the Alibaba mark reads larger than the rest.
    className: "h-[0.9rem] w-auto md:h-[1.05rem]",
  },
  hoverTint: "rgba(255, 138, 80, 0.10)",
};

const studioEngine: Project = {
  slug: "studio-engine",
  title: "StudioEngine — From 1-shot AI to a 4-stage co-creation pipeline",
  description:
    "Restructured a one-shot GenAI text-to-video tool into a 4-stage workspace — basics → outline → script → visuals — with checkpoints and version history so creators iterate instead of re-generating.",
  media: {
    src: "/assets/work/vp-genie.jpg",
    alt: "Preview image for Studio Engine.ai project",
    type: "image",
  },
  flowSteps: ["basics", "outline", "script", "visuals"],
  meta: { year: "2025", role: "Product Designer", status: "Shipped" },
  impact: "AI: output → process",
  logo: {
    src: "/assets/studio-engine/studioengine-logo.png",
    alt: "StudioEngine AI",
  },
  hoverTint: "rgba(143, 110, 220, 0.10)",
};

const meituanIm: Project = {
  slug: "meituan-im",
  title: "Meituan — Led an in-chat quote redesign",
  description:
    "Shipped a 0-to-1 in-message quotation system across Meituan's 770M+ annual users and 14.5M merchants — A/B-validated +5% conversion and −50% pricing disputes by reframing from price transparency to process trust.",
  media: {
    src: "/assets/work/meituan.mp4",
    alt: "Preview video for IM System project",
    type: "video",
  },
  flowSteps: ["chat quote", "compare", "confirm"],
  meta: { year: "2025", role: "UX Designer", status: "Shipped" },
  impact: "+5% conversion (A/B)",
  logo: {
    src: "/assets/meituan-im/meituan-logo.png",
    alt: "Meituan",
  },
  hoverTint: "rgba(255, 210, 0, 0.12)",
};

const liner: Project = {
  slug: "liner",
  title: "Liner — Research-driven AI collaboration workflow",
  description:
    "Led research and design for an AI-native research workflow on Liner — 10M+ academic users, a16z top-20 web AI — three core patterns that turn AI from a feature add into a collaborative-trust layer.",
  media: {
    src: "/assets/liner/liner-cover.mp4",
    alt: "Liner AI collaboration feature — research and design preview",
    type: "video",
  },
  flowSteps: ["chat-switch", "library", "shared canvas"],
  meta: { year: "2026", role: "Product Designer", status: "In progress" },
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
  {
    kind: "pair",
    left: { ...aiCharacter, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
    right: { ...liner, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
  },
  {
    kind: "pair",
    left: { ...studioEngine, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
    right: { ...meituanIm, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
  },
];

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

export function Work() {
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

  return (
    <section
      id="work"
      ref={ref}
      className="relative pt-14 pb-20 md:pt-20 md:pb-28"
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
