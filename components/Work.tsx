"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const aiCharacter: Project = {
  slug: "ai-character",
  title: "Alibaba Qwen Character Platform - Interactive Character Showrooms Design",
  description:
    "Turned static cloud documentation into interactive LLM-powered product experiences, reducing onboarding from 60+ minutes to under 2 minutes.",
  media: {
    src: "/assets/ai-character/figma.mp4",
    alt: "Alibaba Qwen AI Character product experience preview",
    type: "video",
  },
  flowSteps: ["prompt", "response", "deploy"],
};

const studioEngine: Project = {
  slug: "studio-engine",
  title: "StudioEngine.ai - GenAI Text-to-Video Platform Redesign",
  description:
    "Reorganized a one-step generation flow into a 4-stage creative pipeline: basics, outline, script, and visuals — helping users co-create with AI instead of waiting for output.",
  media: {
    src: "/assets/work/vp-genie.jpg",
    alt: "Preview image for Studio Engine.ai project",
    type: "image",
  },
  flowSteps: ["basics", "outline", "script", "visuals"],
};

const meituanIm: Project = {
  slug: "meituan-im",
  title: "Meituan In Message Quotation System - Three-Step Consultation Design",
  description:
    "Designed a multi-round quotation experience inside chat, improving pricing clarity and supporting a 5%+ conversion lift through iteration and testing.",
  media: {
    src: "/assets/work/meituan.mp4",
    alt: "Preview video for IM System project",
    type: "video",
  },
  flowSteps: ["chat quote", "compare", "confirm"],
};

const apsaraConference: Project = {
  slug: "apsara-conference",
  title: "Apsara Conference — Alibaba AI on Cloud",
  description:
    "Crafted a cohesive visual system for Alibaba Cloud’s flagship AI summit across keynote storytelling, event touchpoints, and digital assets.",
  media: {
    src: "/assets/work/apsara.mp4",
    
    alt: "Preview video for Apsara Conference — Alibaba AI on Cloud",
    type: "video",
  },
};

const aiRide: Project = {
  slug: "ridesharing",
  title: "AI Ride — Autonomous Ridesharing Experience",
  description:
    "Designed an AI companion layer for driverless rides that adapts to rider intent, balancing reassurance, utility, and optional conversation.",
  media: {
    src: "/assets/work/av-ridesharing.jpg",
    alt: "Preview image for autonomous ridesharing project",
    type: "image",
  },
};

type WorkRow =
  | { kind: "single"; project: Project }
  | { kind: "pair"; left: Project; right: Project };

const workRows: WorkRow[] = [
  { kind: "single", project: { ...aiCharacter, layout: "featured" } },
  {
    kind: "pair",
    left: { ...studioEngine, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
    right: { ...meituanIm, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
  },
  {
    kind: "pair",
    left: { ...apsaraConference, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
    right: { ...aiRide, layout: "default", imageSizes: "(min-width: 768px) 42vw, 100vw" },
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
      className="bg-surfaceAlt py-20 md:py-28"
      aria-labelledby="work-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: easePortfolio }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
            Selected Work
          </p>
          <h2 id="work-heading" className="mt-3 font-display text-3xl font-light md:text-4xl">
            Products shaped by research and craft.
          </h2>
        </motion.div>

        <motion.div
          className="mt-14 flex flex-col gap-9 md:gap-10 lg:gap-11"
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
