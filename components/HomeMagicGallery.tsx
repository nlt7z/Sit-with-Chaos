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
    panelBg: "bg-[#061a22]",
    kind: "image" as const,
    mediaSrc: "/assets/Playground/omikuji-shrine-bg.png",
    mediaAlt: "Shrine torii and omikuji cabinet — teal and gold illustration",
    mediaClassName: "object-cover object-center",
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
    kind: "gradient" as const,
    category: "Therapy",
    summary: "Therapy Room",
    panelBg:
      "bg-gradient-to-br from-sky-50 via-[#e8f3fc] to-[#d4ebf5]",
  },
] as const;

export function HomeMagicGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const cardHover = prefersReducedMotion
    ? {}
    : { y: -4, scale: 1.012, transition: { duration: 0.45, ease: easePortfolio } };

  const renderCardMedia = (item: (typeof magicPreviews)[number], eager = false) => {
    if (!inView) return null;
    if (item.kind === "gradient") return null;
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
            className="mt-3 max-w-xl font-display text-2xl font-light lowercase leading-snug tracking-[-0.02em] text-textPrimary md:text-3xl"
          >
            Vibe coding stuff
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-textSecondary md:text-[15px]">
            Cursor-led prototyping, AI-native flows, and production-aware polish — I iterate fast without sanding away the
            story. 
          </p>
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: prefersReducedMotion ? 0 : 0.06, ease: easePortfolio }}
          role="list"
          aria-label="Vibe coding preview gallery"
        >
          {magicPreviews.map((item, index) => (
            <motion.div
              key={`${item.category}-${item.summary}`}
              role="listitem"
              whileHover={cardHover}
              className="group relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.07] transition-[box-shadow,ring-color] duration-500 ease-portfolio hover:shadow-[0_20px_56px_-22px_rgba(0,0,0,0.18)] hover:ring-black/[0.11] focus-within:shadow-[0_20px_56px_-22px_rgba(0,0,0,0.18)] focus-within:ring-black/[0.11]"
            >
              <div className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden sm:aspect-[5/6] ${item.panelBg}`}>
                <div
                  className={`absolute inset-0 origin-center will-change-transform ${
                    prefersReducedMotion
                      ? ""
                      : "transition-transform duration-[420ms] ease-portfolio group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                  }`}
                >
                  {renderCardMedia(item, index === 0)}
                </div>
              </div>
              <div className="relative border-t border-black/[0.06] px-3 py-3 md:px-3.5 md:py-3.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary transition-colors duration-300 group-hover:text-textPrimary/80 group-focus-within:text-textPrimary/80">
                  {item.category}
                </p>
                <p className="mt-1.5 text-pretty font-display text-[16px] font-light leading-snug text-textPrimary md:text-[17px]">
                  {item.summary}
                </p>
              </div>

              <Link
                href={item.href}
                className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2 focus-visible:ring-offset-surfaceAlt"
                aria-label={`Open — ${item.summary}`}
              />
            </motion.div>
          ))}

          {/* placeholder — reserved slot */}
          <div
            role="listitem"
            aria-hidden
            className="hidden lg:flex flex-col overflow-hidden rounded-2xl ring-1 ring-black/[0.05]"
          >
            <div className="relative aspect-[4/5] w-full shrink-0 sm:aspect-[5/6] bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.025)_6px,rgba(0,0,0,0.025)_7px)] bg-surfaceAlt" />
            <div className="border-t border-black/[0.05] px-3 py-3 md:px-3.5 md:py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/30">Coming soon</p>
              <p className="mt-1.5 font-display text-[16px] font-light text-textPrimary/20 md:text-[17px]">—</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
