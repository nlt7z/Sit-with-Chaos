"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    id: "01",
    title: "AI Character",
    sub: "System",
    cat: "Interaction Design",
    year: "2024",
    href: "/work/ai-character",
    gx: "35%", gy: "55%",
    glow: "rgba(210,255,0,0.15)",
  },
  {
    id: "02",
    title: "Liner",
    sub: "Scholar",
    cat: "Product Design",
    year: "2024",
    href: "/work/liner-scholar",
    gx: "65%", gy: "42%",
    glow: "rgba(255,215,90,0.12)",
  },
  {
    id: "03",
    title: "Apsara",
    sub: "Conference",
    cat: "Motion · Brand",
    year: "2023",
    href: "/work/apsara-conference",
    gx: "50%", gy: "68%",
    glow: "rgba(90,160,255,0.12)",
  },
  {
    id: "04",
    title: "Ridesharing",
    sub: "Safety",
    cat: "UX Research",
    year: "2023",
    href: "/work/ridesharing",
    gx: "25%", gy: "35%",
    glow: "rgba(255,90,70,0.12)",
  },
  {
    id: "05",
    title: "Studio",
    sub: "Engine",
    cat: "System Design",
    year: "2022",
    href: "/work/studio-engine",
    gx: "75%", gy: "60%",
    glow: "rgba(170,90,255,0.12)",
  },
];

function Shape({ id, active }: { id: string; active: boolean }) {
  const a = active ? "#d2ff00" : "rgba(255,255,255,0.22)";
  const t = active ? 1 : 0.6;

  if (id === "01") return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" aria-hidden>
      <circle cx="140" cy="140" r="100" stroke={a} strokeWidth="0.8" strokeOpacity={t * 0.35} />
      <circle cx="140" cy="140" r="66" stroke={a} strokeWidth="1" strokeOpacity={t * 0.5} />
      <circle cx="140" cy="140" r="32" fill={a} fillOpacity={t * 0.08} />
      <circle cx="120" cy="130" r="6" fill={a} fillOpacity={t * 0.75} />
      <circle cx="160" cy="130" r="6" fill={a} fillOpacity={t * 0.75} />
      <path d="M 116 158 Q 140 174 164 158" stroke={a} strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity={t * 0.7} />
    </svg>
  );

  if (id === "02") return (
    <svg width="340" height="220" viewBox="0 0 340 220" fill="none" aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="30" y1={30 + i * 32}
          x2={310 - (i === 2 ? 80 : i === 4 ? 40 : 0)} y2={30 + i * 32}
          stroke="white" strokeWidth="1.2" strokeOpacity={0.11 - i * 0.01}
        />
      ))}
      <line x1="30" y1="62" x2="200" y2="62" stroke={a} strokeWidth="2" strokeOpacity={t * 0.8} />
      <circle cx="204" cy="62" r="4" fill={a} fillOpacity={t * 0.8} />
    </svg>
  );

  if (id === "03") return (
    <svg width="420" height="260" viewBox="0 0 420 260" fill="none" aria-hidden>
      <path d="M 0 130 C 70 50, 140 210, 210 130 S 350 50, 420 130" stroke={a} strokeWidth="1.8" strokeOpacity={t * 0.65} fill="none" />
      <path d="M 0 130 C 70 50, 140 210, 210 130 S 350 50, 420 130" stroke="white" strokeWidth="1" strokeOpacity={0.1} fill="none" transform="translate(0 28)" />
      <path d="M 0 130 C 70 50, 140 210, 210 130 S 350 50, 420 130" stroke="white" strokeWidth="0.8" strokeOpacity={0.06} fill="none" transform="translate(0 -28)" />
    </svg>
  );

  if (id === "04") return (
    <svg width="260" height="340" viewBox="0 0 260 340" fill="none" aria-hidden>
      <line x1="130" y1="10" x2="20" y2="340" stroke="white" strokeWidth="0.8" strokeOpacity={0.1} />
      <line x1="130" y1="10" x2="240" y2="340" stroke="white" strokeWidth="0.8" strokeOpacity={0.1} />
      <line x1="85" y1="10" x2="0" y2="340" stroke="white" strokeWidth="0.5" strokeOpacity={0.06} />
      <line x1="175" y1="10" x2="260" y2="340" stroke="white" strokeWidth="0.5" strokeOpacity={0.06} />
      <line x1="130" y1="10" x2="130" y2="340" stroke={a} strokeWidth="1.5" strokeDasharray="10 7" strokeOpacity={t * 0.65} />
      <polygon points="130,10 122,36 138,36" fill={a} fillOpacity={t * 0.7} />
    </svg>
  );

  if (id === "05") return (
    <svg width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden>
      <circle cx="150" cy="150" r="125" stroke="white" strokeWidth="0.7" strokeOpacity={0.07} />
      <circle cx="150" cy="150" r="90" stroke="white" strokeWidth="1" strokeOpacity={0.1} />
      <circle cx="150" cy="150" r="54" stroke={a} strokeWidth="1.2" strokeOpacity={t * 0.45} />
      <circle cx="150" cy="150" r="20" stroke={a} strokeWidth="2" strokeOpacity={t * 0.75} />
      <circle cx="150" cy="150" r="5" fill={a} fillOpacity={t * 0.85} />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={150 + 90 * Math.cos(rad)} y1={150 + 90 * Math.sin(rad)}
            x2={150 + 107 * Math.cos(rad)} y2={150 + 107 * Math.sin(rad)}
            stroke={a} strokeWidth="3" strokeOpacity={t * 0.55}
          />
        );
      })}
    </svg>
  );

  return null;
}

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const resize = () => {
      const maxShift = Math.max(0, track.scrollWidth - window.innerWidth);
      container.style.height = `${window.innerHeight + maxShift}px`;
    };

    const onScroll = () => {
      const containerTop = container.getBoundingClientRect().top + window.scrollY;
      const maxShift = Math.max(1, track.scrollWidth - window.innerWidth);
      const scrolled = Math.max(0, window.scrollY - containerTop);
      const p = Math.min(1, scrolled / maxShift);
      track.style.transform = `translateX(${-maxShift * p}px)`;
      setProgress(p);
      setActiveIdx(Math.round(p * (SLIDES.length - 1)));
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="bg-[#0D0D0D] text-white">
      {/* Fixed nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <Link
          href="/lab"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50 hover:text-white transition-colors duration-300"
        >
          ← Lab
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          YF · Gallery
        </span>
      </nav>

      {/* Hero section */}
      <section className="relative flex h-dvh flex-col justify-end overflow-hidden px-12 pb-16">
        {/* Ghost "G" backdrop */}
        <div
          aria-hidden
          className="pointer-events-none select-none absolute bottom-[-4vw] right-[-2vw] font-display font-bold leading-none text-white"
          style={{ fontSize: "42vw", opacity: 0.025, lineHeight: 1 }}
        >
          G
        </div>
        {/* Lime glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 8% 88%, rgba(210,255,0,0.07) 0%, transparent 44%)" }}
        />

        <div className="relative z-10">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
            Selected work · 2022–2024
          </p>
          <h1
            className="font-display font-light leading-[0.88] tracking-tight text-white"
            style={{ fontSize: "clamp(3.5rem, 10vw, 9rem)" }}
          >
            Gallery
          </h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px w-10 bg-white/20" />
            <p className="font-mono text-xs text-white/30">Scroll to explore</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div aria-hidden className="absolute bottom-8 right-10 flex flex-col items-center gap-2">
          <div
            className="h-14 w-px animate-pulse"
            style={{ background: "linear-gradient(to bottom, transparent, #d2ff00)", opacity: 0.65 }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
            scroll
          </span>
        </div>
      </section>

      {/* Horizontal scroll section */}
      <div ref={containerRef} className="relative">
        <div className="sticky top-0 h-dvh overflow-hidden">
          {/* Slide counter */}
          <div
            className="absolute top-8 left-1/2 z-20 -translate-x-1/2 font-mono tracking-[0.25em]"
            style={{ fontSize: "11px" }}
          >
            <span className="text-white/75">{String(activeIdx + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white/35">{String(SLIDES.length).padStart(2, "0")}</span>
          </div>

          {/* Progress line */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-white/[0.08]">
            <div className="h-full bg-[#d2ff00]" style={{ width: `${progress * 100}%` }} />
          </div>

          {/* Card track */}
          <div
            ref={trackRef}
            className="absolute inset-y-0 left-0 flex items-center"
            style={{ paddingLeft: "5vw", paddingRight: "8vw", gap: "2.5vw", willChange: "transform" }}
          >
            {SLIDES.map((slide, i) => {
              const isActive = i === activeIdx;
              return (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className="group relative flex-shrink-0 overflow-hidden rounded-xl"
                  style={{
                    width: "65vw",
                    height: "82vh",
                    background: `radial-gradient(ellipse at ${slide.gx} ${slide.gy}, ${slide.glow} 0%, transparent 58%), #141414`,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: isActive ? "rgba(210,255,0,0.22)" : "rgba(255,255,255,0.06)",
                    transition: "border-color 0.6s ease",
                  }}
                >
                  {/* Ghost index number */}
                  <span
                    aria-hidden
                    className="pointer-events-none select-none absolute top-4 left-6 font-display font-bold leading-none text-white"
                    style={{ fontSize: "16vw", opacity: 0.04, lineHeight: 1 }}
                  >
                    {slide.id}
                  </span>

                  {/* Abstract SVG shape */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shape id={slide.id} active={isActive} />
                  </div>

                  {/* Bottom fade overlay + info */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-24"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(13,13,13,0.93) 0%, rgba(13,13,13,0.4) 45%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                          {slide.cat}
                        </p>
                        <h2 className="font-display text-4xl font-light leading-tight text-white">
                          {slide.title}
                          <br />
                          {slide.sub}
                        </h2>
                      </div>
                      <div className="self-end text-right">
                        <p className="font-mono text-sm text-white/25">{slide.year}</p>
                        <span
                          className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-[#d2ff00]"
                          style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.5s" }}
                        >
                          Open →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover inset glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(210,255,0,0.12)" }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* End section */}
      <section className="flex h-dvh flex-col items-center justify-center gap-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/25">
          End of gallery
        </p>
        <Link
          href="/"
          className="font-display font-light text-white hover:text-[#d2ff00] transition-colors duration-500"
          style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
        >
          Back to home →
        </Link>
        <Link
          href="/work"
          className="mt-2 font-mono text-xs text-white/30 hover:text-white/60 transition-colors duration-300"
        >
          Or view all work
        </Link>
      </section>
    </main>
  );
}
