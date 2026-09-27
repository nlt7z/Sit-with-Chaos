"use client";

/**
 * WorkShowcase — the /work page. Every project is on the page at once, in
 * the Linear pattern: the three lead projects each get a full-width feature
 * (product media large, dissolving into the canvas at the bottom, with the
 * company, project name and one intro line set over the fade); the last two
 * sit side by side as smaller features. No tags, no dates.
 *
 * Videos carry a poster frame, load only near the viewport, and play only
 * while on screen. Hover: a cursor-following lime arrow and a slow media push.
 * Reduced motion: no reveal, no push, no follower; videos stay on the poster.
 */

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";

type Media = { kind: "video"; src: string; poster: string } | { kind: "image"; src: string };

type Project = {
  slug: string;
  company: string;
  name: string;
  intro: string;
  media: Media;
  /** object-position for the media crop */
  focus?: string;
};

const FEATURES: Project[] = [
  {
    slug: "liner",
    company: "Liner",
    name: "Research + designed AI-native co-research for 10M+ academic users",
    intro: "Led end-to-end research and design for an AI-native collaborative research experience where people collect sources, discuss, and co-write together.",
    media: { kind: "video", src: "/assets/liner/liner-cover.mp4", poster: "/assets/work/posters/liner.webp" },
    focus: "50% 0%",
  },
  {
    slug: "meituan-im",
    company: "Meituan",
    name: "0→1 in-message quotation system on a 770M-user platform",
    intro: "Led the 0-to-1 design of an in-message quotation system on a platform with 770M+ annual transacting users and 14.5M active merchants.",
    media: { kind: "video", src: "/assets/meituan-im/meituan-present/meituan-present-1.mp4", poster: "/assets/work/posters/meituan.webp" },
    focus: "50% 20%",
  },
  {
    slug: "ai-character",
    company: "Alibaba Cloud",
    name: "Shipped Qwen Character's Interactive Showrooms MVP",
    intro: "0→1 MVP feature for Qwen Character LLM, serving millions of enterprise customers.",
    media: { kind: "video", src: "/assets/ai-character/figma-h264.mp4", poster: "/assets/work/posters/alibaba.webp" },
    focus: "50% 30%",
  },
];

const PAIR: Project[] = [
  {
    slug: "tiktok",
    company: "TikTok",
    name: "Redesigned how friends' shared videos surface in a Shared with You feed",
    intro: "Self-initiated product case study: turning the DM inbox of friend-shared videos into a scrollable Shared Feed with one-tap Smart Reactions and reply-value ranking.",
    media: { kind: "video", src: "/assets/TikTok/showcase.mp4", poster: "/assets/work/posters/tiktok.webp" },
    focus: "50% 45%",
  },
  {
    slug: "studio-engine",
    company: "StudioEngine",
    name: "Rebuilt a GenAI video app into a 4-stage creative workspace",
    intro: "Restructured a Gen-2 web app from a single-step generator into a four-stage creative workspace creators actually iterate in.",
    media: { kind: "image", src: "/assets/work/vp-genie.jpg" },
    focus: "50% 55%",
  },
];

// The media dissolves into the canvas: solid through the top half, then an
// eased ramp (several stops, so a light screenshot doesn't band) to nothing.
const FADE =
  "linear-gradient(to bottom, #000 0%, #000 46%, rgba(0,0,0,0.82) 60%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0.2) 84%, rgba(0,0,0,0.05) 93%, transparent 100%)";

function ProjectMedia({ media, focus, reduced }: { media: Media; focus?: string; reduced: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || media.kind !== "video" || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = media.src;
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [media, reduced]);

  const cls =
    "absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-portfolio motion-safe:group-hover:scale-[1.025]";
  if (media.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.src} alt="" loading="lazy" decoding="async" className={cls} style={{ objectPosition: focus }} />;
  }
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={media.poster}
      aria-hidden
      className={cls}
      style={{ objectPosition: focus }}
    />
  );
}

/* the signature lime ↗ that springs after the cursor while a project is hovered */
function useCursorArrow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 400, damping: 30, mass: 0.5 });
  const [on, setOn] = useState(false);
  const move = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - 28);
    y.set(e.clientY - r.top - 28);
  };
  return {
    handlers: {
      onMouseEnter: (e: MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.jump(e.clientX - r.left - 28);
        y.jump(e.clientY - r.top - 28);
        setOn(true);
      },
      onMouseMove: move,
      onMouseLeave: () => setOn(false),
    },
    arrow: (
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 hidden h-14 w-14 items-center justify-center rounded-full bg-nltLime text-[#0a0b0c] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)] md:flex"
        style={{ x: sx, y: sy }}
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <ArrowUpRight className="h-6 w-6" strokeWidth={2.25} />
      </motion.span>
    ),
  };
}

const reveal = (reduced: boolean, delay = 0) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-12% 0px" },
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const, delay },
      };

function Feature({ project, reduced }: { project: Project; reduced: boolean }) {
  const { handlers, arrow } = useCursorArrow();
  return (
    <motion.article {...reveal(reduced)} className="relative">
      <Link
        href={`/work/${project.slug}`}
        className="group relative block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/60 focus-visible:ring-offset-8 focus-visible:ring-offset-[#0a0b0c]"
        {...(reduced ? {} : handlers)}
      >
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[20px] md:aspect-[2.3/1]"
          style={{ WebkitMaskImage: FADE, maskImage: FADE }}
        >
          <ProjectMedia media={project.media} focus={project.focus} reduced={reduced} />
        </div>

        {/* copy, set over the faded bottom of the media */}
        <div className="relative z-10 -mt-[22%] px-1 md:-mt-[8%] md:px-[4%]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-6 -top-8 -z-10"
            style={{ background: "radial-gradient(55% 75% at 20% 70%, rgba(10,11,12,0.6), transparent 75%)" }}
          />
          <p className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white/70">
            <span aria-hidden className="h-2 w-2 bg-nltLime" />
            {project.company}
          </p>
          <h2 className="mt-3 max-w-[36ch] text-balance font-display text-[clamp(1.45rem,2.1vw,2rem)] font-light leading-[1.15] tracking-[-0.015em] text-white">
            {project.name}
          </h2>
          <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.6] text-white/70">{project.intro}</p>
        </div>
        {arrow}
      </Link>
    </motion.article>
  );
}

function Tile({ project, reduced, delay }: { project: Project; reduced: boolean; delay: number }) {
  const { handlers, arrow } = useCursorArrow();
  return (
    <motion.article {...reveal(reduced, delay)} className="relative">
      <Link
        href={`/work/${project.slug}`}
        className="group relative block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/60 focus-visible:ring-offset-8 focus-visible:ring-offset-[#0a0b0c]"
        {...(reduced ? {} : handlers)}
      >
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[18px]"
          style={{ WebkitMaskImage: FADE, maskImage: FADE }}
        >
          <ProjectMedia media={project.media} focus={project.focus} reduced={reduced} />
        </div>
        <div className="relative z-10 -mt-[16%] px-1 md:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-6 -top-8 -z-10"
            style={{ background: "radial-gradient(70% 70% at 25% 70%, rgba(10,11,12,0.75), transparent 72%)" }}
          />
          <p className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white/70">
            <span aria-hidden className="h-2 w-2 bg-nltLime" />
            {project.company}
          </p>
          <h3 className="mt-2.5 max-w-[34ch] text-balance font-display text-[clamp(1.15rem,1.45vw,1.4rem)] font-light leading-[1.2] tracking-[-0.01em] text-white">
            {project.name}
          </h3>
          <p className="mt-2.5 max-w-[54ch] text-[14px] leading-[1.6] text-white/70">{project.intro}</p>
        </div>
        {arrow}
      </Link>
    </motion.article>
  );
}

export function WorkShowcase() {
  const reduced = !!useReducedMotion();
  return (
    <section aria-label="Selected projects" className="relative mx-auto w-full max-w-[1160px] px-6 pb-28 pt-16 md:px-10 md:pt-16">
      <motion.p {...reveal(reduced)} className="font-mono text-[12px] uppercase tracking-[0.18em] text-nltLime">
        Selected work
      </motion.p>

      <div className="mt-8 flex flex-col gap-20 md:mt-8 md:gap-20">
        {FEATURES.map((p) => (
          <Feature key={p.slug} project={p} reduced={reduced} />
        ))}
      </div>

      <div className="mt-20 grid gap-16 md:mt-24 md:grid-cols-2 md:gap-8">
        {PAIR.map((p, i) => (
          <Tile key={p.slug} project={p} reduced={reduced} delay={i * 0.12} />
        ))}
      </div>
    </section>
  );
}
