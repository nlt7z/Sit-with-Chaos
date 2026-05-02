"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

/** Live homepage previews — full interactive runs live on About. */
const magicPreviews = [
  {
    href: "/code/playground/omikuji",
    category: "御神籤",
    summary: "おみくじ",
    panelBg: "bg-[#100e10]",
    kind: "image-jp" as const,
    mediaSrc: "/assets/Playground/omikuji-temple-hero.png",
    mediaAlt: "Omikuji temple backdrop",
  },
  {
    href: "/work/ai-character/prototype",
    kind: "video" as const,
    mediaSrc: "/assets/ai-character/newmove.mp4",
    mediaAlt: "Romance showroom hero motion",
    category: "Romance",
    summary: "Meet with Lucien",
    panelBg: "bg-[#060608]",
  },
  {
    href: "/work/ai-character/prototype-psych",
    kind: "image" as const,
    mediaSrc: "/assets/magic/therapy-card.png",
    mediaAlt: "Therapy showroom universe-embrace visual",
    category: "Therapy",
    summary: "Therapy Room",
    panelBg: "bg-[#dce8f6]",
    mediaClassName: "object-cover object-center",
  },
  {
    href: "/work/ai-character/prototype-astro",
    kind: "image" as const,
    mediaSrc: "/assets/magic/astro-card.png",
    mediaAlt: "Astro showroom stars and planetary animation",
    category: "Astrology",
    summary: "Astrology Reading",
    panelBg: "bg-[#f2ebf5]",
    mediaClassName: "object-cover object-center",
  },
] as const;

export function HomeMagicGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const renderCardMedia = (item: (typeof magicPreviews)[number], eager = false) => {
    if (!inView) return null;
    if (item.kind === "video") {
      return (
        <video
          src={item.mediaSrc}
          aria-label={item.mediaAlt}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload={eager ? "auto" : "metadata"}
        />
      );
    }
    if (item.kind === "image-jp") {
      return (
        <>
          <Image
            src={item.mediaSrc}
            alt={item.mediaAlt}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/48 via-black/12 to-transparent" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-[1.55rem] tracking-[0.14em] text-[#f0ddb8] [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] md:text-[1.75rem]">
              御神籤
            </p>
          </div>
        </>
      );
    }
    return (
      <Image
        src={item.mediaSrc}
        alt={item.mediaAlt}
        fill
        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
        className={item.mediaClassName ?? "object-cover"}
      />
    );
  };

  return (
    <section
      id="magic"
      ref={ref}
      className="border-t border-[rgba(0,0,0,0.06)] bg-surfaceAlt py-20 md:py-28"
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
            className="mt-3 max-w-xl font-display text-2xl font-light leading-snug text-textPrimary md:text-3xl"
          >
            Engineering-heavy vibe coding.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
            Cursor-led prototyping, AI-native flows, and production-aware polish — I iterate fast without sanding away the
            story. These clips run live here; the full shelf sits on About.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.06, ease: easePortfolio }}
          role="list"
          aria-label="Magic preview gallery"
        >
          {magicPreviews.map((item, index) => (
            <div
              key={`${item.category}-${item.summary}`}
              role="listitem"
              className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.07]"
            >
              <div className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden sm:aspect-[5/6] ${item.panelBg}`}>
                {renderCardMedia(item, index === 0)}
              </div>
              <div className="relative border-t border-black/[0.06] px-3 py-3 md:px-3.5 md:py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary">{item.category}</p>
                <p className="mt-1.5 text-pretty font-display text-[16px] font-light leading-snug text-textPrimary md:text-[17px]">
                  {item.summary}
                </p>
              </div>

              <Link
                href={item.href}
                className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2 focus-visible:ring-offset-surfaceAlt"
                aria-label={`Open — ${item.summary}`}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
