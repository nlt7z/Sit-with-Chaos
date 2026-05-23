"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  /** Show the card without a clickable case-study link (no /work/<slug> destination yet).
   *  Hover invert + bottom arrow are both suppressed; bottom CTA reads "Case study coming soon". */
  comingSoon?: boolean;
};

function VideoCardMedia({
  src,
  poster,
  alt,
  parentHovered,
}: {
  src: string;
  poster?: string;
  alt: string;
  /** Card-level hover signal from ProjectCard. On hover-capable devices the
   *  video only plays while this is true; otherwise it sits paused on its
   *  first frame so the card reads as a static thumbnail. Ignored on touch
   *  devices, which always auto-play when the card is in view. */
  parentHovered: boolean;
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

  // Playback control.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const shouldPlay = inView && (canHover ? parentHovered : true);
    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
      // On hover-out, reset to the first frame so the card reverts to a clean
      // static thumbnail instead of stopping mid-shot.
      if (canHover && video.readyState >= 1 && video.currentTime !== 0) {
        try {
          video.currentTime = 0;
        } catch {
          /* readyState lied — ignore */
        }
      }
    }
  }, [inView, parentHovered, canHover]);

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

export function ProjectCard({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const featured = project.layout === "featured";
  const comingSoon = project.comingSoon === true;
  const [cardHovered, setCardHovered] = useState(false);
  const hover =
    prefersReducedMotion || comingSoon
      ? {}
      : { y: -4, scale: 1.012, transition: { duration: 0.45, ease: easePortfolio } };

  const mediaAspect =
    project.mediaAspect ??
    (featured ? "aspect-video md:aspect-[21/9]" : "aspect-video");

  const titleClass = featured
    ? "font-display text-2xl font-light leading-snug text-textPrimary transition-colors duration-500 group-hover:text-white md:text-3xl"
    : "font-display text-lg font-light leading-snug text-textPrimary transition-colors duration-500 group-hover:text-white md:text-xl";

  const titleSeparatorMatch = project.title.match(/\s+[-–—]\s+/);
  const titleSplitIndex = titleSeparatorMatch?.index ?? -1;
  const titleSeparatorLength = titleSeparatorMatch?.[0].length ?? 0;
  const companyName = titleSplitIndex >= 0 ? project.title.slice(0, titleSplitIndex).trim() : null;
  const mainTitle =
    titleSplitIndex >= 0
      ? project.title.slice(titleSplitIndex + titleSeparatorLength).trim()
      : project.title;

  // Static card wrapper (no Link, no hover invert) when there's no case study to link to.
  const wrapperBaseClass =
    "flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:rounded-[1.35rem] md:p-6";
  const wrapperLinkClass = `${wrapperBaseClass} transition-[background-color,border-color,box-shadow] duration-500 ease-portfolio hover:border-textPrimary hover:bg-textPrimary hover:shadow-[0_28px_60px_-22px_rgba(0,0,0,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2`;
  const wrapperStaticClass = `${wrapperBaseClass} cursor-default`;

  const wrapperContent = (
    <>
        {project.meta ? (
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary transition-colors duration-500 group-hover:text-white/55 md:text-[11px]">
            <span>{project.meta.year}</span>
            <span aria-hidden className="text-textSecondary/35 transition-colors duration-500 group-hover:text-white/30">·</span>
            <span>{project.meta.role}</span>
            <span aria-hidden className="text-textSecondary/35 transition-colors duration-500 group-hover:text-white/30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-textSecondary/45 transition-colors duration-500 group-hover:bg-white/55" />
              {project.meta.status}
            </span>
          </div>
        ) : null}

        <div className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.04] transition-[box-shadow] duration-500 group-hover:ring-white/10">
          <motion.div
            className={`${mediaAspect} w-full overflow-hidden bg-neutral-100`}
            whileHover={
              prefersReducedMotion
                ? {}
                : { scale: 1.02, transition: { duration: 0.42, ease: easePortfolio } }
            }
          >
            {project.media.type === "video" ? (
              <VideoCardMedia
                src={project.media.src}
                poster={project.media.poster}
                alt={project.media.alt}
                parentHovered={cardHovered}
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
                sizes={project.imageSizes ?? "(min-width: 1024px) 72rem, 100vw"}
                className="object-cover"
                loading="lazy"
              />
            )}
          </motion.div>

          {project.impact ? (
            <div className="pointer-events-none absolute left-3 top-3 z-10 md:left-4 md:top-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textPrimary shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] backdrop-blur-md md:text-[11px]">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-nltLime" />
                {project.impact}
              </span>
            </div>
          ) : null}

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
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col md:mt-6">
          <h3 className={titleClass}>
            {companyName ? (
              <>
                <span className="mb-2 block font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-textSecondary transition-colors duration-500 group-hover:text-white/55 md:text-xs">
                  {companyName}
                </span>
                <span>{mainTitle}</span>
              </>
            ) : (
              mainTitle
            )}
          </h3>

          <p
            className={`mt-3 text-[13px] leading-relaxed text-textSecondary transition-colors duration-500 group-hover:text-white/70 md:text-sm ${
              featured ? "max-w-3xl" : "line-clamp-3 flex-1 text-pretty"
            }`}
          >
            {project.description}
          </p>

          {comingSoon ? (
            <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-60">
              Case study coming soon
            </span>
          ) : (
            <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-60 transition-[opacity,color] duration-500 group-hover:text-white group-hover:opacity-100 group-focus-within:opacity-100">
              Case study
              <span aria-hidden className="translate-x-0 transition-transform duration-400 group-hover:translate-x-1 group-focus-within:translate-x-1">
                →
              </span>
            </span>
          )}
        </div>
      </>
    );

  return (
    <motion.article
      whileHover={hover}
      onHoverStart={() => setCardHovered(true)}
      onHoverEnd={() => setCardHovered(false)}
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
