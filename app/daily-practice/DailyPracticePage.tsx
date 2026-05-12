"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GlassPortfolioCard } from "./widgets/GlassPortfolioCard";

/* ── items catalogue ─────────────────────────────────────────── */
const ITEMS = [
  {
    id: "2025-05-11",
    day: 1,
    date: "May 11",
    tag: "Glassmorphism · Framer Motion",
    title: "Glass Portfolio Card",
    renderContent: (isActive: boolean) => (
      <div className="relative" style={{ padding: 20 }}>
        {/* Mesh image and color fields for vivid glass refraction */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 bottom-1/2 w-1/2 aspect-square -translate-x-1/2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/daily/glass-card-bg-muted.png"
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "50% 50%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(56% 62% at 20% 72%, rgba(15, 23, 42, 0.58) 0%, rgba(15,23,42,0.14) 52%, rgba(15,23,42,0) 100%), radial-gradient(42% 48% at 78% 22%, rgba(30, 27, 75, 0.52) 0%, rgba(30,27,75,0.10) 60%, rgba(30,27,75,0) 100%), radial-gradient(28% 34% at 60% 58%, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0) 100%), linear-gradient(160deg, rgba(30,58,138,0.28) 0%, rgba(67,56,202,0.22) 46%, rgba(56,189,248,0.18) 100%)",
              }}
            />
          </div>
        </div>
        <div className="relative z-10">
          <div
            style={{
              display: "inline-flex",
              padding: 14,
              borderRadius: 30,
              background:
                "linear-gradient(165deg, rgba(196, 223, 255, 0.72) 0%, rgba(175, 208, 255, 0.60) 46%, rgba(162, 200, 255, 0.54) 100%)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <GlassPortfolioCard isActive={isActive} />
          </div>
        </div>
      </div>
    ),
  },
];


/* ── iPod-style click wheel ──────────────────────────────────── */
function ClickWheel({
  onLeft,
  onRight,
  canLeft,
  canRight,
}: {
  onLeft: () => void;
  onRight: () => void;
  canLeft: boolean;
  canRight: boolean;
}) {
  return (
    <div className="relative select-none" style={{ width: 168, height: 168 }}>
      {/* Outer disc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(150deg, #38383a 0%, #1c1c1e 100%)",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.09)",
        }}
      />

      {/* Left ◄◄ */}
      <button
        onClick={onLeft}
        disabled={!canLeft}
        className="absolute left-[13px] top-1/2 -translate-y-1/2 z-10 p-2 transition-opacity"
        style={{ opacity: canLeft ? 0.65 : 0.22 }}
        aria-label="Previous"
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
          <polygon points="7,0 0,5 7,10" />
          <polygon points="14,0 7,5 14,10" />
        </svg>
      </button>

      {/* Right ▶▶ */}
      <button
        onClick={onRight}
        disabled={!canRight}
        className="absolute right-[13px] top-1/2 -translate-y-1/2 z-10 p-2 transition-opacity"
        style={{ opacity: canRight ? 0.65 : 0.22 }}
        aria-label="Next"
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
          <polygon points="0,0 7,5 0,10" />
          <polygon points="7,0 14,5 7,10" />
        </svg>
      </button>

      {/* Center button */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-10"
        style={{
          width: 68,
          height: 68,
          background: "linear-gradient(150deg, #3c3c3e 0%, #2a2a2c 100%)",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      />
    </div>
  );
}

/* ── dot indicator ───────────────────────────────────────────── */
function DotNav({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center gap-[6px] justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 16 : 5,
            height: 5,
            background: i === active ? "#1d1d1f" : "rgba(0,0,0,0.14)",
          }}
        />
      ))}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────── */
export default function DailyPracticePage() {
  const [active, setActive] = useState(0);

  const prev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setActive((i) => Math.min(ITEMS.length - 1, i + 1)),
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* ── top bar ── */}
      <header className="shrink-0 flex items-center justify-between px-7 pt-6">
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.08em] uppercase font-medium text-black hover:opacity-50 transition-opacity"
        >
          Yuan Fang
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/#work"
            className="font-mono text-[11px] tracking-[0.07em] uppercase text-black/40 hover:text-black transition-colors"
          >
            Work
          </Link>
          <Link
            href="/about"
            className="font-mono text-[11px] tracking-[0.07em] uppercase text-black/40 hover:text-black transition-colors"
          >
            About
          </Link>
          <span
            className="font-mono text-[10px] tracking-[0.07em] uppercase px-[9px] py-[4px]"
            style={{ border: "1px solid #1d1d1f" }}
          >
            Daily Practice
          </span>
        </nav>
      </header>

      {/* ── gallery ── */}
      <div className="flex-1 relative min-h-0 overflow-hidden">

        <div className="absolute inset-0 flex items-center justify-center">
          {ITEMS.map((item, i) => {
            const offset = i - active;
            const dist = Math.abs(offset);
            return (
              <div
                key={item.id}
                onClick={() => dist !== 0 && setActive(i)}
                className="absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                  transform: `translateX(calc(${offset} * 36vw)) scale(${dist === 0 ? 1 : 0.78})`,
                  opacity: dist === 0 ? 1 : dist === 1 ? 0.28 : 0,
                  cursor: dist === 0 ? "default" : "pointer",
                  zIndex: dist === 0 ? 10 : 5 - dist,
                }}
              >
                {item.renderContent(i === active)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── dot nav ── */}
      <div className="shrink-0 flex justify-center pb-5">
        <DotNav count={ITEMS.length} active={active} />
      </div>

      {/* ── click wheel ── */}
      <div className="shrink-0 flex justify-center pb-10">
        <ClickWheel
          onLeft={prev}
          onRight={next}
          canLeft={active > 0}
          canRight={active < ITEMS.length - 1}
        />
      </div>
    </div>
  );
}
