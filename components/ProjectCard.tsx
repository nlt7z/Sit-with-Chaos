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
};

function VideoCardMedia({ src, poster, alt }: { src: string; poster?: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSrc(src);
        } else {
          video.pause();
          setActiveSrc(null);
        }
      },
      { threshold: 0.15, rootMargin: "64px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!activeSrc) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      return;
    }
    video.src = activeSrc;
    video.load();
    video.play().catch(() => {});
  }, [activeSrc]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

export function ProjectCard({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const featured = project.layout === "featured";
  const hover = prefersReducedMotion
    ? {}
    : { y: -4, scale: 1.008, transition: { duration: 0.5, ease: easePortfolio } };

  const mediaAspect =
    project.mediaAspect ??
    (featured ? "aspect-video md:aspect-[21/9]" : "aspect-video");

  const titleClass = featured
    ? "font-display text-2xl font-light leading-snug text-textPrimary md:text-3xl"
    : "font-display text-lg font-light leading-snug text-textPrimary md:text-xl";

  return (
    <motion.article
      whileHover={hover}
      className="group relative flex h-full flex-col"
    >
      <Link
        href={`/work/${project.slug}`}
        className="flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-500 ease-portfolio hover:border-black/[0.1] hover:shadow-[0_16px_48px_-28px_rgba(0,0,0,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2 md:rounded-[1.35rem] md:p-6"
      >
        <div className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.04]">
          <motion.div
            className={`${mediaAspect} w-full overflow-hidden bg-neutral-100`}
            whileHover={
              prefersReducedMotion
                ? {}
                : { scale: 1.02, transition: { duration: 0.55, ease: easePortfolio } }
            }
          >
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
                sizes={project.imageSizes ?? "(min-width: 1024px) 72rem, 100vw"}
                className="object-cover"
                loading="lazy"
              />
            )}
          </motion.div>

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
          <h3 className={titleClass}>{project.title}</h3>

          <p
            className={`mt-3 text-[13px] leading-relaxed text-textSecondary md:text-sm ${
              featured ? "max-w-3xl" : "line-clamp-3 flex-1 text-pretty"
            }`}
          >
            {project.description}
          </p>

          <span className="mt-auto inline-flex items-center gap-1 pt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Case study
            <span aria-hidden className="translate-x-0 transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
