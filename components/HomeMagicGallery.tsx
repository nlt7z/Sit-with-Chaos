"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

/** Live homepage previews — 2 rows × 2 cards, 3:7 ratio per row, color and aspect tuned to each card's content. */
const magicPreviews = [
  // Row 1 · left (wide hero) — portrait phone, contained on brand-color panel
  {
    href: "/work",
    kind: "video" as const,
    mediaSrc: "/assets/app-design/app-design.mov",
    mediaAlt: "App design screen recording",
    category: "App Design",
    summary: "Studio interactions",
    panelBg: "bg-[#0c1422]",
    accentText: "text-[#7BA4E8]",
    size: "wide" as const,
    colSpan: "lg:col-span-7" as const,
    fit: "contain" as const,
  },
  // Row 1 · right (narrow side) — romance preview
  {
    href: "/work/ai-character/prototype",
    kind: "video" as const,
    mediaSrc: "/assets/ai-character/newmove.mp4",
    mediaAlt: "Romance showroom hero motion",
    category: "Romance",
    summary: "Meet with Lucien",
    panelBg: "bg-[#1a0a13]",
    accentText: "text-[#E58698]",
    size: "narrow" as const,
    colSpan: "lg:col-span-3" as const,
    fit: "cover" as const,
  },
  // Row 2 · left (narrow side) — illustration thumbnail
  {
    href: "/code/playground/omikuji",
    kind: "image" as const,
    mediaSrc: "/assets/Playground/omikuji-bg.png",
    mediaAlt: "Shrine torii and omikuji cabinet — teal and gold illustration",
    mediaClassName: "object-cover object-center",
    category: "御神籤",
    summary: "おみくじ",
    panelBg: "bg-[#061a22]",
    accentText: "text-[#D4A85F]",
    size: "narrow" as const,
    colSpan: "lg:col-span-3" as const,
    fit: "cover" as const,
  },
  // Row 2 · right (wide hero) — wide landscape video, near-native fit
  {
    href: "/work/apsara-conference",
    kind: "video" as const,
    mediaSrc: "/assets/work/apsara.mp4",
    mediaAlt: "Apsara Conference visual design preview",
    category: "Apsara",
    summary: "Visual Design",
    panelBg: "bg-[#0c0a18]",
    accentText: "text-[#9588D8]",
    size: "wide" as const,
    colSpan: "lg:col-span-7" as const,
    fit: "contain" as const,
  },
] as const;

function PreviewVideo({
  src,
  alt,
  fit = "cover",
}: {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          try {
            video.currentTime = 0;
          } catch {
            /* unloaded video — currentTime defaults to 0 anyway */
          }
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35, rootMargin: "0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      aria-label={alt}
      className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

export function HomeMagicGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const cardHover = prefersReducedMotion
    ? {}
    : { y: -4, scale: 1.012, transition: { duration: 0.45, ease: easePortfolio } };

  const renderCardMedia = (item: (typeof magicPreviews)[number]) => {
    if (!inView) return null;
    if (item.kind === "video") {
      return (
        <PreviewVideo
          src={item.mediaSrc}
          alt={item.mediaAlt}
          fit={item.fit}
        />
      );
    }
    return (
      <Image
        src={item.mediaSrc}
        alt={item.mediaAlt}
        fill
        sizes="(min-width: 1024px) 26vw, (min-width: 640px) 50vw, 100vw"
        className={item.mediaClassName ?? "object-cover"}
      />
    );
  };

  return (
    <section
      id="magic"
      ref={ref}
      className="border-t border-[rgba(0,0,0,0.06)] bg-white py-20 md:py-28"
      aria-labelledby="magic-heading"
    >
      <div className="mx-auto max-w-content px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: easePortfolio }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Magic</p>
          <h2
            id="magic-heading"
            className="mt-3 max-w-xl font-display text-2xl font-light lowercase leading-snug tracking-[-0.02em] text-textPrimary md:text-3xl"
          >
            coding stuff
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
            Concept, logic, visuals, code, ship — one person, one throughline. End-to-end ownership with the creative
            instinct behind every decision.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-10 lg:gap-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.06, ease: easePortfolio }}
          role="list"
          aria-label="Vibe coding preview gallery"
        >
          {magicPreviews.map((item) => (
            <motion.div
              key={`${item.category}-${item.summary}`}
              role="listitem"
              whileHover={cardHover}
              className={`group relative overflow-hidden rounded-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-white/[0.06] transition-[box-shadow,ring-color] duration-500 ease-portfolio hover:shadow-[0_24px_60px_-22px_rgba(0,0,0,0.5)] hover:ring-white/[0.12] focus-within:shadow-[0_24px_60px_-22px_rgba(0,0,0,0.5)] focus-within:ring-white/[0.12] aspect-[4/5] sm:aspect-[5/6] lg:aspect-auto lg:h-[26rem] ${item.colSpan} ${item.panelBg}`}
            >
              {/* Media layer — fills entire card */}
              <div
                className={`absolute inset-0 origin-center will-change-transform ${
                  prefersReducedMotion
                    ? ""
                    : "transition-transform duration-[420ms] ease-portfolio group-hover:scale-[1.025] group-focus-within:scale-[1.025]"
                }`}
              >
                {renderCardMedia(item)}
              </div>

              {/* Glass label strip at bottom — slim frosted bar */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 top-[-1rem] backdrop-blur-md"
                  style={{
                    maskImage: "linear-gradient(to top, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 70%, transparent 100%)",
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 top-[-1rem] bg-gradient-to-t from-black/80 to-transparent"
                />
                <div className="relative flex items-center gap-3 px-4 py-2.5 md:px-5 md:py-3">
                  <p className={`font-mono text-[10px] uppercase tracking-[0.22em] ${item.accentText} transition-opacity duration-300 group-hover:opacity-95 group-focus-within:opacity-95`}>
                    {item.category}
                  </p>
                  <span aria-hidden className="h-px flex-1 bg-white/15" />
                  <p className="text-pretty font-display text-[13.5px] font-light leading-snug text-white/95 md:text-[14px]">
                    {item.summary}
                  </p>
                </div>
              </div>

              <Link
                href={item.href}
                className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label={`Open — ${item.summary}`}
              />
            </motion.div>
          ))}

        </motion.div>
      </div>
    </section>
  );
}
