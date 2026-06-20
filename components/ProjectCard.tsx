"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";


type Media = {
  src: string;
  alt: string;
  type: "image" | "video" | "embed" | "prototype" | "showroom";
  /** Optional poster image (e.g. for cover art before the first frame). */
  poster?: string;
  /** Natural content dimensions for prototype iframes (used to compute scale). */
  naturalW?: number;
  naturalH?: number;
  /** For type "showroom": embed URLs that auto-cycle through the panel. */
  showrooms?: readonly string[];
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
  /** Impact metrics shown as a row of tag chips in the left copy panel.
   *  A single "·"-separated string — each segment becomes one chip
   *  (e.g. "+200% API volume · 4 interactive demos"). */
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
  /** If set, the card links to this external URL instead of /work/<slug>.
   *  CTA reads "Open site ↗". Opens in a new tab. */
  externalHref?: string;
  /** Fill the left copy panel with the brand lime (#d2ff00).
   *  Hover wash is suppressed — the panel already has its own identity. */
  limeLeft?: boolean;
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

function PrototypeMedia({
  src,
  alt,
  naturalW = 480,
  naturalH = 930,
}: {
  src: string;
  alt: string;
  naturalW?: number;
  naturalH?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(height / naturalH, width / naturalW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalW, naturalH]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title={alt}
        className="pointer-events-none border-0 block"
        style={{
          width: naturalW,
          height: naturalH,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
        loading="lazy"
      />
    </div>
  );
}

/** ShowroomCycle — auto-rotates a set of embeddable prototype URLs, each scaled
 *  to a desktop frame so it reads as a live screenshot. One iframe mounted at a
 *  time (remounts on switch) to keep the card light. */
function ShowroomCycle({ srcs }: { srcs: readonly string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [i, setI] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const W = 1280;
  const H = 800;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (srcs.length <= 1) return;
    const id = setInterval(() => {
      setLoaded(false);
      setI((v) => (v + 1) % srcs.length);
    }, 6000);
    return () => clearInterval(id);
  }, [srcs.length]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#0c0d0f]">
      {!loaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#0c0d0f]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-nltLime border-t-transparent" />
        </div>
      ) : null}
      <iframe
        key={i}
        src={srcs[i]}
        title="Showroom prototype"
        onLoad={() => setLoaded(true)}
        loading="lazy"
        className="pointer-events-none border-0"
        style={{ position: "absolute", top: 0, left: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
      <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {srcs.map((_, idx) => (
          <span
            key={idx}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: idx === i ? 14 : 6, background: idx === i ? "#d2ff00" : "rgba(255,255,255,0.4)" }}
          />
        ))}
      </div>
    </div>
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

/** Extract the R, G, B triple from an rgba() string, or fall back to nltLime. */
function extractRgb(color: string): string {
  const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  return m ? `${m[1]}, ${m[2]}, ${m[3]}` : "210, 255, 0";
}

export function ProjectCard({
  project,
  tall = false,
}: {
  project: Project;
  /** Give the card a taller desktop min-height (used in the stacked /work view
   *  so each layer reads as a generous panel rather than a thin banner). */
  tall?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const comingSoon = project.comingSoon === true;

  const glowRgb = project.hoverTint ? extractRgb(project.hoverTint) : "210, 255, 0";

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glowVisible, setGlowVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

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

  // Impact metrics render as a row of tag chips in the left copy panel. The
  // data ships as a single string with "·"-separated metrics; split it back out.
  const impactTags = project.impact
    ? project.impact.split("·").map((s) => s.trim()).filter(Boolean)
    : [];

  // Soft per-project wash sitting behind the video on the right panel (a
  // fallback before the video paints; the video covers it once playing).
  const mediaPanelBackground = `linear-gradient(145deg, #ffffff 0%, ${project.hoverTint ?? "rgba(0,0,0,0.035)"} 100%)`;
  // Faint per-project gradient the LEFT copy panel washes to on hover — light,
  // and a gradient (not a flat fill): the tint peaks softly then fades to
  // transparent across the panel.
  const tintBase = project.hoverTint ?? "rgba(0,0,0,0.05)";
  const cardTintGradient = `linear-gradient(150deg, ${boostTintAlpha(
    tintBase,
    0.10,
  )} 0%, ${boostTintAlpha(tintBase, 0.03)} 50%, rgba(255,255,255,0) 100%)`;

  const wrapperBaseClass =
    "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_22px_-10px_rgba(0,0,0,0.12)] md:rounded-[1.5rem]";
  // Borderless: the card edge reads from its own soft shadow (and, in the
  // stacked /work view, the depth shadow on each layer). Interactivity is
  // signaled by the CTA arrow + the product shot's hover bloom.
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
        ) : project.media.type === "showroom" ? (
          <ShowroomCycle srcs={project.media.showrooms ?? []} />
        ) : project.media.type === "prototype" ? (
          <PrototypeMedia
            src={project.media.src}
            alt={project.media.alt}
            naturalW={project.media.naturalW}
            naturalH={project.media.naturalH}
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
    <div
      className={`flex flex-col-reverse md:grid md:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]${
        tall ? " md:min-h-[24rem]" : ""
      }`}
    >
      {/* LEFT — copy panel. On hover a faint per-project gradient washes in
          (the right keeps playing video). Cards with leftPanelBg use a solid
          color instead — hover wash is suppressed. */}
      <div
        className={`relative flex flex-col px-6 py-7 md:px-9 md:py-9 lg:px-10${project.limeLeft ? " bg-nltLime" : ""}`}
      >
        {!project.limeLeft && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-portfolio group-hover:opacity-100 group-focus-within:opacity-100"
            style={{ background: cardTintGradient }}
          />
        )}

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
          {impactTags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5 md:gap-2">
              {impactTags.map((tag, i) => (
                <li
                  key={`${tag}-${i}`}
                  className="rounded-full border border-black/[0.10] bg-white px-2.5 py-1 text-[11.5px] leading-none text-textPrimary shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors duration-500 group-hover:border-black/[0.18]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          {comingSoon ? (
            <span className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-textSecondary opacity-60">
              Case study coming soon
            </span>
          ) : (
            // The visible CTA is the circular arrow button that follows the
            // cursor across the card (rendered as an overlay in the article
            // below). This stays as the link's accessible label.
            <span className="sr-only">
              {project.externalHref ? "Open site" : "View case study"}
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
        style={{ background: project.media.type === "prototype" ? "#ffffff" : mediaPanelBackground }}
      >
        {mediaBlock}
      </div>
    </div>
  );

  return (
    <motion.article
      whileHover={hover}
      onMouseMove={comingSoon ? undefined : handleMouseMove}
      onMouseEnter={
        comingSoon
          ? undefined
          : (e) => {
              handleMouseMove(e);
              setGlowVisible(true);
            }
      }
      onMouseLeave={comingSoon ? undefined : () => setGlowVisible(false)}
      className={`relative flex h-full flex-col rounded-2xl md:rounded-[1.5rem] ${comingSoon ? "" : "group"}`}
    >
      {/* Spotlight border glow — two layers:
          1. Soft bloom behind the card (blurred, extends outward)
          2. Border ring (CSS mask punches out the interior, only the ~1.5px
             perimeter shows the gradient color) */}
      {!comingSoon && (
        <>
          {/* Layer 1: outer bloom — blurred radial that bleeds past the card edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-10px] rounded-[1.75rem] md:rounded-[2rem] transition-opacity duration-300"
            style={{
              opacity: glowVisible ? 1 : 0,
              background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb}, 0.18), transparent 100%)`,
              filter: "blur(10px)",
            }}
          />
          {/* Layer 2: border ring — mask-composite punches out the card interior
              leaving only the padding ring (= the border) visible */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[-1px] rounded-2xl md:rounded-[1.5rem] transition-opacity duration-300"
            style={{
              opacity: glowVisible ? 1 : 0,
              padding: "1.5px",
              background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowRgb}, 0.55) 0%, rgba(${glowRgb}, 0.22) 50%, transparent 100%)`,
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        </>
      )}
      {comingSoon ? (
        <div className={wrapperStaticClass}>{wrapperContent}</div>
      ) : project.externalHref ? (
        <a href={project.externalHref} target="_blank" rel="noopener noreferrer" className={wrapperLinkClass}>
          {wrapperContent}
        </a>
      ) : (
        <Link href={`/work/${project.slug}`} className={wrapperLinkClass}>
          {wrapperContent}
        </Link>
      )}

      {/* Cursor-following CTA — a plain circular arrow button that tracks the
          pointer anywhere over the card and only shows on hover. It's purely
          a visual affordance (pointer-events-none); the whole card is the
          actual link. */}
      {!comingSoon && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-nltLime text-[#0a0b0c] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]"
          initial={false}
          animate={{
            x: mousePos.x - 28,
            y: mousePos.y - 28,
            opacity: glowVisible ? 1 : 0,
            scale: glowVisible ? 1 : 0.4,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  x: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 },
                  y: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 },
                  opacity: { duration: 0.2, ease: easePortfolio },
                  scale: { duration: 0.2, ease: easePortfolio },
                }
          }
        >
          <ArrowUpRight className="h-6 w-6" strokeWidth={2.25} />
        </motion.div>
      )}
    </motion.article>
  );
}
