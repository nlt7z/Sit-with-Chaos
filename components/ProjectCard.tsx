"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icons/Icon";

type Media = {
  src: string;
  alt: string;
  type: "image" | "video" | "embed";
  /** Optional poster image (e.g. for cover art before the first frame). */
  poster?: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  media: Media;
  /** For `next/image` when the card sits in a multi-column row (e.g. half width). */
  imageSizes?: string;
  /** Tailwind aspect-ratio classes for the media wrapper (overrides layout default). */
  mediaAspect?: string;
  /** Featured = full-width hero row; default = grid pairs with matched heights. */
  layout?: "featured" | "default";
  /** Optional hover micro-demo: pipeline steps over the media. */
  flowSteps?: readonly string[];
  /** Top metadata strip: year · role · status. */
  meta?: {
    year: string;
    role: string;
    status: string;
  };
  /** Headline impact metric shown as a chip on the media (e.g. "−97% time"). */
  impact?: string;
  /** Category tags shown as a divided list in the left panel (e.g. "Capstone Project"). */
  tags?: readonly string[];
  /** Optional brand logo shown as a badge on the media (top-right corner). */
  logo?: {
    src: string;
    alt: string;
    /** Override the badge size (height + width-auto). Defaults to "h-6 w-auto md:h-7".
     *  Use to balance logos whose intrinsic proportions read larger than the rest. */
    className?: string;
  };
  /** Light hover wash, set per-card to harmonize with the media (CSS color —
   *  any valid `background-color` value). Keep alpha low (~0.08–0.12) so the
   *  tint reads as a whisper, not a fill. Falls back to a neutral if absent. */
  hoverTint?: string;
  /** Show the card without a clickable case-study link (no /work/<slug> destination yet).
   *  Hover lift is suppressed; bottom CTA reads "Case study coming soon". */
  comingSoon?: boolean;
};

function VideoCardMedia({
  src,
  poster,
  alt,
}: {
  src: string;
  poster?: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setCanHover(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "64px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Source management:
  //  - Touch (no hover): only load while in view, unload when scrolled away.
  //    Saves bandwidth and stops background playback.
  //  - Hover-capable: load whenever in view so the first-frame poster is
  //    visible at rest; never unload while the card is on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!inView && !canHover) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      return;
    }
    if (inView && !video.src) {
      video.src = src;
      video.load();
    }
  }, [inView, canHover, src]);

  // Playback control. The video runs continuously as the panel background
  // while in view (muted, looping) so the right side always reads as live
  // video; hover does not affect it (hover only tints the left copy panel).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      // metadata is enough to render the first-frame poster substitute on
      // hover-capable devices; on touch the next effect will set src + play.
      preload="metadata"
    />
  );
}

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

/** Re-alpha an rgb/rgba() color to a fixed opacity. The per-project hover tints
 *  ship at ~0.10 alpha (a whisper over the media); for the left copy panel we
 *  want a clearly-visible-but-soft wash, so we keep the hue and lift the alpha. */
function boostTintAlpha(color: string, alpha: number): string {
  const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})` : color;
}

export function ProjectCard({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const comingSoon = project.comingSoon === true;
  const hover =
    prefersReducedMotion || comingSoon
      ? {}
      : { y: -2, scale: 1.005, transition: { duration: 0.4, ease: easePortfolio } };

  const mediaAspect = project.mediaAspect ?? "aspect-[16/10]";

  const titleSeparatorMatch = project.title.match(/\s+[-–—]\s+/);
  const titleSplitIndex = titleSeparatorMatch?.index ?? -1;
  const titleSeparatorLength = titleSeparatorMatch?.[0].length ?? 0;
  const companyName = titleSplitIndex >= 0 ? project.title.slice(0, titleSplitIndex).trim() : null;
  const mainTitle =
    titleSplitIndex >= 0
      ? project.title.slice(titleSplitIndex + titleSeparatorLength).trim()
      : project.title;

  // Soft per-project wash sitting behind the video on the right panel (a
  // fallback before the video paints; the video covers it once playing).
  const mediaPanelBackground = `linear-gradient(145deg, #ffffff 0%, ${project.hoverTint ?? "rgba(0,0,0,0.035)"} 100%)`;
  // Faint per-project gradient the LEFT copy panel washes to on hover — light,
  // and a gradient (not a flat fill): the tint peaks softly then fades to
  // transparent across the panel.
  const tintBase = project.hoverTint ?? "rgba(0,0,0,0.05)";
  const cardTintGradient = `linear-gradient(150deg, ${boostTintAlpha(
    tintBase,
    0.18,
  )} 0%, ${boostTintAlpha(tintBase, 0.06)} 50%, rgba(255,255,255,0) 100%)`;

  const wrapperBaseClass =
    "flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] md:rounded-[1.5rem]";
  // No hover frame: the card border stays static. Interactivity is signaled by
  // the product shot deepening its own shadow + the CTA arrow on hover.
  const wrapperLinkClass = `${wrapperBaseClass} transition-[box-shadow] duration-500 ease-portfolio focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary/45 focus-visible:ring-offset-2`;
  const wrapperStaticClass = `${wrapperBaseClass} cursor-default`;

  const mediaBlock = (
    <>
      {/* Cropped product media as the full-bleed panel background — no feather.
          object-cover crops it to fill. It stays as live video at all times;
          hover tints the left copy panel, not this. */}
      <div className="absolute inset-0">
        {project.media.type === "video" ? (
          <VideoCardMedia
            src={project.media.src}
            poster={project.media.poster}
            alt={project.media.alt}
          />
        ) : project.media.type === "embed" ? (
          <iframe
            title={project.media.alt}
            src={project.media.src}
            className="pointer-events-none h-full w-full border-0 bg-black"
            loading="lazy"
          />
        ) : (
          <Image
            src={project.media.src}
            alt={project.media.alt}
            fill
            sizes={project.imageSizes ?? "(min-width: 768px) 58vw, 100vw"}
            className="object-cover object-left-top"
            loading="lazy"
          />
        )}
      </div>

      {project.flowSteps && project.flowSteps.length > 0 ? (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-3 pb-3 pt-10 md:px-4 md:pb-3.5 md:pt-12 ${
            prefersReducedMotion
              ? "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              : "translate-y-1 opacity-0 transition-[opacity,transform] duration-500 ease-portfolio group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
          }`}
          aria-hidden
        >
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white/95 md:text-[10px] md:tracking-[0.14em]">
            {project.flowSteps.map((step, i) => (
              <span key={`${step}-${i}`} className="flex items-center gap-x-1">
                {i > 0 ? (
                  <span className="select-none text-white/45" aria-hidden>
                    →
                  </span>
                ) : null}
                <span className="rounded-md bg-white/12 px-1.5 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[2px] md:px-2 md:py-1">
                  {step}
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );

  const wrapperContent = (
    <div className="flex flex-col-reverse md:grid md:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
      {/* LEFT — copy panel. On hover a faint per-project gradient washes in
          (the right keeps playing video). */}
      <div className="relative flex flex-col px-6 py-7 md:px-9 md:py-9 lg:px-10">
        {/* hover wash — light, gradient, fades in */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-portfolio group-hover:opacity-100 group-focus-within:opacity-100"
          style={{ background: cardTintGradient }}
        />

        <div className="relative z-10 flex flex-1 flex-col">
          {project.logo ? (
            <Image
              src={project.logo.src}
              alt={project.logo.alt}
              width={90}
              height={36}
              className={`mb-6 self-start ${project.logo.className ?? "h-6 w-auto md:h-7"}`}
            />
          ) : null}

          <p className="font-mono text-[12px] tracking-[0.02em] text-textSecondary/55">
            ({project.meta?.year ?? "—"})
          </p>

          <h3 className="mt-7 font-display font-light tracking-tight text-textPrimary md:mt-9">
            {companyName ? (
              <>
                <span className="block text-[1.5rem] leading-[1.06] md:text-[2rem]">{companyName}</span>
                <span className="mt-1.5 block text-[1.05rem] leading-snug text-textPrimary/70 md:text-[1.28rem] md:leading-[1.2]">
                  {mainTitle}
                </span>
              </>
            ) : (
              <span className="block text-[1.5rem] leading-[1.06] md:text-[2rem]">{mainTitle}</span>
            )}
          </h3>

          <div className="mt-8 md:mt-auto md:pt-10">
          {project.impact ? (
            <ul className="border-t border-black/[0.08]">
              <li className="border-b border-black/[0.08] py-2.5 text-[13px] leading-snug text-textSecondary last:border-b-0 md:py-3">
                {project.impact}
              </li>
            </ul>
          ) : null}

          {comingSoon ? (
            <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-60">
              Case study coming soon
            </span>
          ) : (
            <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-60 transition-[opacity,color] duration-500 group-hover:text-textPrimary group-hover:opacity-100 group-focus-within:opacity-100">
              Case study
              <span aria-hidden className="inline-flex translate-x-0 transition-transform duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5">
                <Icon as={ArrowUpRight} size="sm" />
              </span>
            </span>
          )}
          </div>
        </div>
      </div>

      {/* RIGHT — cropped product video as a full-bleed background. No feather:
          it fills the panel and crops with object-cover, clipped to the card's
          rounded corners. On hover the media fades out and the panel settles to
          its per-project background wash. Mobile gets the aspect ratio for
          height; on desktop the cell stretches to match the copy panel. */}
      <div
        className={`relative overflow-hidden ${mediaAspect} md:aspect-auto`}
        style={{ background: mediaPanelBackground }}
      >
        {mediaBlock}
      </div>
    </div>
  );

  return (
    <motion.article
      whileHover={hover}
      className={`relative flex h-full flex-col ${comingSoon ? "" : "group"}`}
    >
      {comingSoon ? (
        <div className={wrapperStaticClass}>{wrapperContent}</div>
      ) : (
        <Link href={`/work/${project.slug}`} className={wrapperLinkClass}>
          {wrapperContent}
        </Link>
      )}
    </motion.article>
  );
}
