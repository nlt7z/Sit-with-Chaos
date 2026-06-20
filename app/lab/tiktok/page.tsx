"use client";

/**
 * /lab/tiktok — "If I were TikTok's design lead" prototype of the Work section.
 *
 * The 5-card white list (components/Work.tsx) reimagined as a full-screen,
 * scroll-snap FYP feed: a near-black canvas, each project bleeding edge-to-edge,
 * video auto-playing the moment its slide enters view, a giant ghost index
 * numeral, a count-up headline metric in signature lime, and a right-rail of
 * pagination dots. Isolated from the live homepage — nothing here ships yet.
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const LIME = "#d2ff00";

/* ------------------------------------------------------------------ */
/* data — trimmed + self-contained copy of components/Work.tsx          */
/* ------------------------------------------------------------------ */

type Metric =
  | { prefix?: string; value: number; suffix: string; label: string }
  | { static: string };

type Slide = {
  company: string;
  title: string;
  media:
    | { type: "video"; src: string; poster?: string }
    | { type: "image"; src: string }
    | { type: "prototype"; src: string; naturalW: number; naturalH: number };
  meta: { year: string; role: string; status: string };
  metric: Metric;
  tags: string[];
  logo: { src: string; alt: string; h: string };
  accent: string; // "r, g, b"
  href: string;
  external?: boolean;
};

const SLIDES: Slide[] = [
  {
    company: "Liner",
    title: "AI-native co-research for 10M+ academic users",
    media: { type: "video", src: "/assets/liner/liner-product-video.mp4" },
    meta: { year: "2026", role: "Product Designer", status: "In progress" },
    metric: { value: 10, suffix: "M+", label: "active research users · a16z top-20 web AI" },
    tags: ["AI Collaboration", "Product Strategy"],
    logo: { src: "/assets/liner/linerlogo.png", alt: "Liner", h: "h-5" },
    accent: "120, 165, 95",
    href: "/work/liner",
  },
  {
    company: "Alibaba Cloud",
    title: "Shipped Qwen Character's interactive showrooms MVP",
    media: { type: "video", src: "/assets/ai-character/figma-h264.mp4" },
    meta: { year: "2025", role: "Product Design Intern", status: "Shipped" },
    metric: { prefix: "+", value: 200, suffix: "%", label: "model API call volume · 4 demos shipped" },
    tags: ["0→1 MVP", "AI-Native UX"],
    logo: { src: "/assets/ai-character/alibaba-cloud-logo.png", alt: "Alibaba Cloud", h: "h-4" },
    accent: "64, 132, 240",
    href: "/work/ai-character",
  },
  {
    company: "Meituan",
    title: "0→1 in-message quotation system, 770M-user platform",
    media: {
      type: "prototype",
      src: "/assets/meituan-im/Repair%20Flow.html?solo",
      naturalW: 540,
      naturalH: 1060,
    },
    meta: { year: "2025", role: "Product Design Intern", status: "Shipped" },
    metric: { prefix: "+", value: 5, suffix: "%", label: "conversion · −50% pricing disputes (A/B)" },
    tags: ["Conversational Commerce", "A/B Validated"],
    logo: { src: "/assets/meituan-im/meituan-logo.png", alt: "Meituan", h: "h-5" },
    accent: "255, 200, 0",
    href: "/work/meituan-im",
  },
  {
    company: "StudioEngine",
    title: "Rebuilt a GenAI video app into a 4-stage workspace",
    media: { type: "image", src: "/assets/work/vp-genie.jpg" },
    meta: { year: "2025", role: "Product Designer", status: "Shipped" },
    metric: { value: 4, suffix: "-stage", label: "creative workspace · usability study n=6" },
    tags: ["GenAI Workflow", "Product Strategy"],
    logo: { src: "/assets/studio-engine/studioengine-logo.png", alt: "StudioEngine", h: "h-5" },
    accent: "143, 110, 220",
    href: "/work/studio-engine",
  },
  {
    company: "Qbix Studio",
    title: "Design agency — 0→1 brand, design, code, build",
    media: { type: "video", src: "/assets/work/Area.mp4" },
    meta: { year: "2026", role: "Solo Build", status: "Shipped" },
    metric: { static: "Solo build · brand → design → code → ship" },
    tags: ["Solo Build", "Design + Code"],
    logo: { src: "/assets/work/logo.png", alt: "Qbix Studio", h: "h-7" },
    accent: "210, 255, 0",
    href: "https://qbix.space",
    external: true,
  },
];

/* ------------------------------------------------------------------ */
/* CountUp — animates 0 → value when the slide becomes active           */
/* ------------------------------------------------------------------ */

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function CountUp({ value, active }: { value: number; active: boolean }) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    let start: number | null = null;
    const DURATION = 1100;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / DURATION, 1);
      setN(Math.round(easeOutCubic(p) * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, value]);

  return <>{n}</>;
}

/* ------------------------------------------------------------------ */
/* media renderers                                                      */
/* ------------------------------------------------------------------ */

function VideoBg({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      if (!v.src) {
        v.src = src;
        v.load();
      }
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, src]);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

function PrototypeBg({
  src,
  naturalW,
  naturalH,
}: {
  src: string;
  naturalW: number;
  naturalH: number;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // fit to ~82% of slide height, never wider than the column
      setScale(Math.min((height * 0.82) / naturalH, (width * 0.9) / naturalW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalW, naturalH]);

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden">
      {/* lime-tinted spotlight behind the floating phone */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 42%, rgba(210,255,0,0.14), rgba(8,9,10,0) 70%)",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-[2.2rem] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
        style={{
          width: naturalW,
          height: naturalH,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <iframe
          src={src}
          title="Meituan repair flow prototype"
          className="pointer-events-none block h-full w-full border-0 bg-white"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slide                                                                */
/* ------------------------------------------------------------------ */

function SlideView({
  slide,
  index,
  active,
}: {
  slide: Slide;
  index: number;
  active: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");
  const metric = slide.metric;
  const isProto = slide.media.type === "prototype";

  const ctaClass =
    "group ml-1 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors";
  const ctaStyle = { background: LIME, color: "#1d1d1f" };
  const ctaInner = (
    <>
      {slide.external ? "Open site" : "Case study"}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
        ↗
      </span>
    </>
  );

  return (
    <section
      data-slide={index}
      className="relative h-[100svh] w-full shrink-0 snap-start snap-always overflow-hidden"
    >
      {/* ---- full-bleed media ---- */}
      <div className="absolute inset-0">
        {slide.media.type === "video" ? (
          <VideoBg src={slide.media.src} active={active} />
        ) : slide.media.type === "image" ? (
          <Image
            src={slide.media.src}
            alt={slide.company}
            fill
            sizes="100vw"
            className="object-cover"
            priority={index === 0}
          />
        ) : (
          <PrototypeBg
            src={slide.media.src}
            naturalW={slide.media.naturalW}
            naturalH={slide.media.naturalH}
          />
        )}
      </div>

      {/* ---- legibility scrims (lighter over the floating-phone proto) ---- */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isProto
            ? "linear-gradient(to top, rgba(8,9,10,0.92) 0%, rgba(8,9,10,0.25) 42%, rgba(8,9,10,0.55) 100%)"
            : "linear-gradient(to top, rgba(8,9,10,0.95) 2%, rgba(8,9,10,0.35) 38%, rgba(8,9,10,0.15) 62%, rgba(8,9,10,0.45) 100%)",
        }}
      />

      {/* ---- giant ghost index numeral ---- */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[2vw] top-[4vh] select-none font-display font-light leading-[0.8]"
        style={{
          fontSize: "30vh",
          color: "rgba(255,255,255,0.05)",
        }}
      >
        {num}
      </span>

      {/* ---- content (TikTok caption zone: bottom-left) ---- */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-content px-6 pb-[10vh] md:px-12 md:pb-[12vh]">
          <div
            className="max-w-2xl transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              opacity: active ? 1 : 0,
              transform: active ? "translateY(0)" : "translateY(28px)",
            }}
          >
            {/* index + meta strip */}
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
              <span style={{ color: LIME }}>{num}</span>
              <span className="text-white/25">/</span>
              <span>{String(SLIDES.length).padStart(2, "0")}</span>
              <span className="text-white/25">·</span>
              <span>{slide.meta.year}</span>
              <span className="text-white/25">·</span>
              <span>{slide.meta.role}</span>
            </div>

            {/* logo chip — keeps dark brand logos legible on the black field */}
            <span className="mt-5 inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 shadow-lg">
              <Image
                src={slide.logo.src}
                alt={slide.logo.alt}
                width={120}
                height={32}
                className={`${slide.logo.h} w-auto`}
              />
            </span>

            {/* headline */}
            <h2 className="mt-5 font-display font-light leading-[0.98] tracking-[-0.015em] text-white">
              <span className="block text-[clamp(2.6rem,7vw,5.5rem)]">{slide.company}</span>
              <span className="mt-2 block max-w-xl text-[clamp(1.05rem,2.1vw,1.6rem)] font-light leading-snug text-white/65">
                {slide.title}
              </span>
            </h2>

            {/* count-up headline metric */}
            <div className="mt-7 flex items-end gap-4">
              {"static" in metric ? (
                <p className="font-display text-[clamp(1.3rem,2.6vw,2rem)] font-light text-white">
                  {metric.static}
                </p>
              ) : (
                <>
                  <p
                    className="font-display font-light leading-none tracking-tight"
                    style={{ fontSize: "clamp(3rem, 8vw, 6rem)", color: LIME }}
                  >
                    {metric.prefix ?? ""}
                    <CountUp value={metric.value} active={active} />
                    {metric.suffix}
                  </p>
                  <p className="mb-2 max-w-[18ch] text-sm leading-snug text-white/55">
                    {metric.label}
                  </p>
                </>
              )}
            </div>

            {/* tags + CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {slide.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/20 px-3 py-1 text-[12px] text-white/70"
                >
                  {t}
                </span>
              ))}
              {slide.external ? (
                <a
                  href={slide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClass}
                  style={ctaStyle}
                >
                  {ctaInner}
                </a>
              ) : (
                <Link href={slide.href} className={ctaClass} style={ctaStyle}>
                  {ctaInner}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function TikTokFeedPrototype() {
  const scroller = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which slide owns the viewport via IntersectionObserver.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll("section[data-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveIndex(Number((e.target as HTMLElement).dataset.slide));
          }
        }
      },
      { root, threshold: 0.6 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    const root = scroller.current;
    if (!root) return;
    const target = root.querySelector(`section[data-slide="${i}"]`) as HTMLElement | null;
    target?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-[#08090a] text-white">
      {/* top chrome — back + prototype label */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-12">
        <Link
          href="/lab"
          className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white"
        >
          ← Lab
        </Link>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
          Work · FYP feed
        </span>
      </div>

      {/* right-rail pagination dots */}
      <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        {SLIDES.map((s, i) => (
          <button
            key={s.company}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to ${s.company}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: 7,
              height: i === activeIndex ? 22 : 7,
              background: i === activeIndex ? LIME : "rgba(255,255,255,0.28)",
            }}
          />
        ))}
      </div>

      {/* scroll hint on the first slide */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex justify-center transition-opacity duration-500"
        style={{ opacity: activeIndex === 0 ? 0.6 : 0 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
          scroll ↓
        </span>
      </div>

      {/* snap feed */}
      <div
        ref={scroller}
        className="h-[100svh] w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, i) => (
          <SlideView key={slide.company} slide={slide} index={i} active={i === activeIndex} />
        ))}
      </div>
    </div>
  );
}
