"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

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
    summary: "Meet with Lucien — long-term memory & emotional pacing",
    panelBg: "bg-[#060608]",
  },
  {
    href: "/work/ai-character/prototype-psych",
    kind: "image" as const,
    mediaSrc: "/assets/magic/therapy-card.png",
    mediaAlt: "Therapy showroom universe-embrace visual",
    category: "Therapy",
    summary: "Therapy Room — universe-embrace animation",
    panelBg: "bg-[#dce8f6]",
    mediaClassName: "object-cover object-center",
  },
  {
    href: "/work/ai-character/prototype-astro",
    kind: "image" as const,
    mediaSrc: "/assets/magic/astro-card.png",
    mediaAlt: "Astro showroom stars and planetary animation",
    category: "Astrology",
    summary: "Astro Showroom — stars and planetary motion",
    panelBg: "bg-[#f2ebf5]",
    mediaClassName: "object-cover object-center",
  },
] as const;

export function HomeMagicGallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(2);

  const desktopCardPoses = useMemo(
    () => ({
      "-2": { x: "-68%", y: "7%", rotate: -18, scale: 0.82, z: 8, opacity: 0.5 },
      "-1": { x: "-36%", y: "3%", rotate: -10, scale: 0.92, z: 18, opacity: 0.82 },
      "0": { x: "0%", y: "0%", rotate: 0, scale: 1.02, z: 36, opacity: 1 },
      "1": { x: "36%", y: "3%", rotate: 10, scale: 0.92, z: 18, opacity: 0.82 },
      "2": { x: "68%", y: "7%", rotate: 18, scale: 0.82, z: 8, opacity: 0.5 },
    }),
    [],
  );

  const getRelativeOffset = (index: number, center: number, total: number) => {
    let offset = index - center;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return Math.max(-2, Math.min(2, offset)) as -2 | -1 | 0 | 1 | 2;
  };

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
          <Image src={item.mediaSrc} alt={item.mediaAlt} fill sizes="(min-width: 1024px) 360px, 50vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/48 via-black/12 to-transparent" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-[1.55rem] tracking-[0.14em] text-[#f0ddb8] [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] md:text-[1.75rem]">
              御神籤
            </p>
          </div>
        </>
      );
    }
    return <Image src={item.mediaSrc} alt={item.mediaAlt} fill sizes="(min-width: 1024px) 360px, 50vw" className={item.mediaClassName ?? "object-cover"} />;
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
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: prefersReducedMotion ? 0 : 0.06, ease: easePortfolio }}
        >
          {magicPreviews.map((item, index) => (
            <div
              key={`${item.category}-${item.summary}`}
              className="group relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-black/[0.07] transition-[box-shadow,transform] duration-500 ease-portfolio hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.22)] hover:ring-black/[0.12]"
            >
              <div
                className={`relative aspect-[4/5] w-full shrink-0 overflow-hidden md:aspect-[5/6] ${item.panelBg}`}
              >
                {inView && (
                  renderCardMedia(item, index === 0)
                )}
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
                aria-label={`Open on About — ${item.summary}`}
              />
            </div>
          ))}
        </motion.div>

        {/* Desktop: transparent 3D coverflow, full panorama previews. */}
        <motion.div
          className="relative mt-2 hidden lg:block"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.72, delay: prefersReducedMotion ? 0 : 0.08, ease: easePortfolio }}
        >
          <div
            className="relative mr-auto h-[470px] w-full max-w-[1060px] overflow-visible"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const progress = (e.clientX - rect.left) / rect.width;
              const next = Math.max(0, Math.min(magicPreviews.length - 1, Math.round(progress * (magicPreviews.length - 1))));
              setActiveIndex(next);
            }}
          >

            <div className="absolute inset-0" style={{ perspective: 1800 }}>
              {magicPreviews.map((item, index) => {
                const relative = getRelativeOffset(index, activeIndex, magicPreviews.length);
                const pose = desktopCardPoses[String(relative) as "-2" | "-1" | "0" | "1" | "2"];
                const isActive = relative === 0;
                return (
                  <motion.div
                    key={`coverflow-${item.category}`}
                    className="absolute left-1/2 top-[42%] h-[66%] w-[31%] min-w-[236px] max-w-[340px] -translate-x-1/2 -translate-y-1/2"
                    style={{ zIndex: pose.z }}
                    animate={
                      prefersReducedMotion
                        ? { x: pose.x, y: pose.y, opacity: 1, scale: 1, rotateY: 0 }
                        : {
                            x: pose.x,
                            y: pose.y,
                            rotateY: pose.rotate,
                            scale: pose.scale,
                            opacity: pose.opacity,
                          }
                    }
                    transition={{ duration: 0.55, ease: easePortfolio }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocusCapture={() => setActiveIndex(index)}
                  >
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.12] bg-white shadow-[0_24px_54px_-34px_rgba(0,0,0,0.35)]">
                      <div className={`relative min-h-0 flex-1 overflow-hidden ${item.panelBg}`}>
                        {inView && (
                          renderCardMedia(item, index === 0)
                        )}
                      </div>
                      <div className="relative border-t border-black/[0.08] bg-white/96 px-4 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/75">{item.category}</p>
                        <p className="mt-1 text-pretty font-display text-[16px] font-light leading-snug text-textPrimary">
                          {item.summary}
                        </p>
                      </div>
                      <Link
                        href={item.href}
                        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                        aria-label={`Open on About — ${item.summary}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
