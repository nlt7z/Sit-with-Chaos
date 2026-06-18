"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const aiCharacter: Project = {
  slug: "ai-character",
  title: "Alibaba Cloud — From 60-min docs to a 2-min product",
  description: "Interactive Showrooms — the MVP for Qwen Character.",
  media: {
    src: "/assets/ai-character/figma-h264.mp4",
    alt: "Alibaba Qwen AI Character product experience preview",
    type: "video",
  },
  flowSteps: ["prompt", "response", "deploy"],
  meta: { year: "2025", role: "Product Designer", status: "Shipped" },
  impact: "−97% onboarding time",
  tags: ["AI-Native UX", "0→1 MVP"],
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
  title: "StudioEngine — From 1-shot AI to a 4-stage co-creation pipeline",
  description: "GenAI text-to-video, rebuilt so creators iterate — not re-generate.",
  media: {
    src: "/assets/work/vp-genie.jpg",
    alt: "Preview image for Studio Engine.ai project",
    type: "image",
  },
  flowSteps: ["basics", "outline", "script", "visuals"],
  meta: { year: "2025", role: "Product Designer", status: "Shipped" },
  impact: "AI: output → process",
  tags: ["GenAI Workflow", "Product Strategy"],
  logo: {
    src: "/assets/studio-engine/studioengine-logo.png",
    alt: "StudioEngine AI",
  },
  hoverTint: "rgba(143, 110, 220, 0.10)",
};

const meituanIm: Project = {
  slug: "meituan-im",
  title: "Meituan — Led an in-chat quote redesign",
  description: "A 0-to-1 in-message quotation system for local services.",
  media: {
    src: "/assets/work/meituan.mp4",
    alt: "Preview video for IM System project",
    type: "video",
  },
  flowSteps: ["chat quote", "compare", "confirm"],
  meta: { year: "2025", role: "UX Designer", status: "Shipped" },
  impact: "+5% conversion (A/B)",
  tags: ["Conversational Commerce", "A/B Validated"],
  logo: {
    src: "/assets/meituan-im/meituan-logo.png",
    alt: "Meituan",
  },
  hoverTint: "rgba(255, 210, 0, 0.12)",
};

const liner: Project = {
  slug: "liner",
  title: "Liner — Research-driven AI collaboration workflow",
  description: "AI-native collaboration for academic research teams.",
  media: {
    src: "/assets/liner/liner-product-video.mp4",
    alt: "Liner AI collaboration feature — research and design preview",
    type: "video",
  },
  flowSteps: ["chat-switch", "library", "shared canvas"],
  meta: { year: "2026", role: "Product Designer", status: "In progress" },
  impact: "10M+ users · a16z top 20",
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
