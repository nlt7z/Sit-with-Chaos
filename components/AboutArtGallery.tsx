"use client";

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

type Slide = {
  src: string;
  title: string;
  caption?: string;
  /** Small mono label above the title (e.g. Interior · New York) */
  eyebrow?: string;
  /** Longer prose below the title; caption stays optional secondary line */
  body?: string;
  type?: "image" | "video";
};

const ALESSA_BODY =
  "Alessa is an Italian restaurant in Midtown Manhattan. A 4,000 sq. ft. ground floor with a 45-foot bar. The 2,500 sq. ft. mezzanine is built for large parties and events. My role spanned concept, spatial planning, and construction documentation.";

const slides: Slide[] = [
  {
    src: "/assets/about/gallery/nyfw.jpg",
    title: "New York Fashion Week Build",
    caption: "Installation design for Fey Official Showroom",
    type: "image",
  },

  {
    src: "/assets/about/gallery/print.jpg",
    title: "Mixed Media",
    caption: "Acrylic painting, Transfer print",
    type: "image",
  },
  {
    src: "/assets/about/gallery/sketch1.jpg",
    title: "Mixed Media",
    caption: "Pencil, Charcoal, Acrylic, Watercolor",
    type: "image",
  },
  {
    src: "/assets/about/gallery/ice.jpg",
    title: "Substance",
    caption: "Transfer print with ice",
    type: "image",
  },
  {
    src: "/assets/about/gallery/echo.jpg",
    title: "Echo of Ruins",
    caption: "VR experience with hands; Mixed media installation ",
    type: "image",
  },
  {
    src: "/assets/about/gallery/hang.jpg",
    title: "Print on Texture",
    caption: "Transfer print with mixed media",
    type: "image",
  },
  {
    src: "/assets/about/gallery/suo.mp4",
    title: "SUO Memory",
    caption: "Gear Design, Acrylic, Physical Computing",
    type: "video",
  },
  {
    src: "/assets/about/gallery/am.mp4",
    title: "Amnesia",
    caption: "VR experience about the Forbidden Island; Game Design",
    type: "video",
  },
  {
    src: "/assets/about/gallery/read.jpg",
    title: "Projection Mapping",
    caption: "Mirror projection mapping",
    type: "image",
  },
  {
    src: "/assets/about/gallery/foodutopia.mp4",
    title: "Food Utopia",
    caption:
      "Food Utopia is a city that contains a lot of food factories and the secret of taste is hidden behind those food factories.",
    type: "video",
  },
  {
    src: "/assets/Playground/alessadesign1.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 1",
    type: "image",
  },
  {
    src: "/assets/Playground/alessadesign2.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 2",
    type: "image",
  },
  {
    src: "/assets/Playground/alessadesign3.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 3",
    type: "image",
  },
  {
    src: "/assets/Playground/alessadesign4.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 4",
    type: "image",
  },
  {
    src: "/assets/Playground/alessadesign5.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 5",
    type: "image",
  },
  {
    src: "/assets/Playground/alessadesign6.jpg",
    eyebrow: "Interior · New York",
    title: "Alessa Design",
    body: ALESSA_BODY,
    caption: "Study 6",
    type: "image",
  },
];

function isVideo(slide: Slide) {
  return slide.type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(slide.src);
}

type AboutArtGalleryProps = {
  noTopBorder?: boolean;
  noHeading?: boolean;
};

export function AboutArtGallery({ noTopBorder = false, noHeading = false }: AboutArtGalleryProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.35, margin: "-8% 0px" });
  const videoRef = useRef<HTMLVideoElement>(null);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (i === index) return;
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  const current = slides[index];
  const isCurrentVideo = isVideo(current);

  useEffect(() => {
    if (!isCurrentVideo) return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {});
    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [index, isCurrentVideo]);

  useEffect(() => {
    if (prefersReducedMotion || !inView) return;
    const t = setInterval(() => paginate(1), 11000);
    return () => clearInterval(t);
  }, [inView, prefersReducedMotion, paginate]);

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -48) paginate(1);
    else if (info.offset.x > 48) paginate(-1);
  };

  const slideDuration = prefersReducedMotion ? 0.25 : 1.15;
  const slideEase = easePortfolio;

  const variants = {
    enter: (dir: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : {
            x: dir > 0 ? 36 : -36,
            opacity: 0,
            scale: 0.98,
            rotateY: dir > 0 ? 3 : -3,
            filter: "blur(6px)",
          },
    center: prefersReducedMotion
      ? { opacity: 1 }
      : { x: 0, opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" },
    exit: (dir: number) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : {
            x: dir < 0 ? 36 : -36,
            opacity: 0,
            scale: 0.98,
            rotateY: dir < 0 ? 3 : -3,
            filter: "blur(6px)",
          },
  };

  return (
    <section
      ref={containerRef}
      className={`${noTopBorder ? "" : "border-t border-[rgba(0,0,0,0.08)] "}bg-white px-6 py-16 md:py-20`}
      aria-labelledby="about-gallery-heading"
    >
      <div className="mx-auto max-w-content">
        {!noHeading && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: easePortfolio }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Gallery</p>
            <h2
              id="about-gallery-heading"
              className="mt-3 max-w-2xl font-display text-3xl font-light text-textPrimary md:text-4xl"
            >
              Previous Artwork
            </h2>
            <p className="mt-4 max-w-2xl text-textSecondary">
              Creating art always make me calm and focused. Drawing, installation, and spatial experiments that shaped
              how I think about people and media.
            </p>
          </motion.div>
        )}

        <div className="relative mt-14">
          <div
            className="relative overflow-hidden bg-white"
            style={{ perspective: prefersReducedMotion ? undefined : 1400 }}
          >
            <div className="relative flex min-h-[min(76vh,880px)] w-full items-center justify-center md:min-h-[min(82vh,960px)]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: slideDuration, ease: slideEase }}
                  drag={prefersReducedMotion ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.08}
                  onDragEnd={onDragEnd}
                  className="absolute inset-0 flex cursor-grab items-center justify-center bg-white p-2 active:cursor-grabbing md:p-4"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {isCurrentVideo ? (
                    <video
                      key={current.src}
                      ref={videoRef}
                      src={current.src}
                      className="max-h-[min(76vh,880px)] w-auto max-w-full object-contain md:max-h-[min(82vh,960px)]"
                      controls
                      playsInline
                      muted
                      loop
                      preload="metadata"
                      aria-label={current.title}
                    />
                  ) : (
                    <Image
                      src={current.src}
                      alt={current.title}
                      width={1920}
                      height={1080}
                      className="max-h-[min(76vh,880px)] w-auto max-w-full object-contain md:max-h-[min(82vh,960px)]"
                      sizes="(min-width: 1152px) 72rem, 100vw"
                      priority={index === 0}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 md:px-6">
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="px-3 py-2 text-sm text-textPrimary transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary"
                aria-label="Previous artwork"
              >
                ←
              </button>
              <div className="flex flex-1 flex-wrap justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  >
                    <motion.span
                      className="block h-1.5 bg-textPrimary/25"
                      animate={{
                        width: i === index ? 28 : 8,
                        opacity: i === index ? 1 : 0.45,
                      }}
                      transition={{ duration: 0.5, ease: easePortfolio }}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => paginate(1)}
                className="px-3 py-2 text-sm text-textPrimary transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary"
                aria-label="Next artwork"
              >
                →
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: easePortfolio }}
              className="mt-6 text-center"
            >
              {slides[index].eyebrow ? (
                <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
                  {slides[index].eyebrow}
                </p>
              ) : null}
              <p
                className={`font-display text-lg font-light text-textPrimary md:text-xl ${
                  slides[index].eyebrow ? "mt-3" : ""
                }`}
              >
                {slides[index].title}
              </p>
              {slides[index].body ? (
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-textSecondary md:text-[15px]">
                  {slides[index].body}
                </p>
              ) : null}
              {slides[index].caption ? (
                <p
                  className={`font-mono text-xs text-textSecondary md:text-sm ${
                    slides[index].body ? "mt-3" : "mt-1"
                  }`}
                >
                  {slides[index].caption}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
