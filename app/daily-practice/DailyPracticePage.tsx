"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PortfolioCard } from "./widgets/PortfolioCard";

/* ── items catalogue ─────────────────────────────────────────── */
const ITEMS = [
  {
    id: "2025-05-10",
    day: 1,
    date: "May 10",
    tag: "Fintech · Widget",
    title: "Portfolio Card",
    renderContent: () => (
      <div className="relative">
        {/* Sky image — same shape as card, slightly larger so it peeks out */}
        <div
          className="absolute overflow-hidden rounded-[32px]"
          style={{ inset: "-10px", zIndex: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/daily/sky-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Blue-purple overall tint + bottom boost */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, rgba(55,80,175,0.50) 0%, rgba(70,95,195,0.45) 50%, rgba(45,65,170,0.55) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(30,55,170,0.65) 0%, transparent 60%)",
            }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <PortfolioCard />
        </div>
      </div>
    ),
  },
  {
    id: "2025-05-11",
    day: 2,
    date: "May 11",
    tag: "—",
    title: "Coming tomorrow",
    renderContent: null,
  },
  {
    id: "2025-05-12",
    day: 3,
    date: "May 12",
    tag: "—",
    title: "Coming soon",
    renderContent: null,
  },
] as const;

/* ── placeholder item ────────────────────────────────────────── */
function PlaceholderItem({ day, date }: { day: number; date: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: 110,
        height: 148,
        border: "1.5px dashed rgba(0,0,0,0.1)",
        borderRadius: 18,
        background: "#fafafa",
      }}
    >
      <span className="font-mono text-[9px] text-black/20 tracking-[0.2em] uppercase mb-1">
        DAY {String(day).padStart(2, "0")}
      </span>
      <span className="font-mono text-[11px] text-black/30">{date}</span>
    </div>
  );
}

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
                {item.renderContent ? (
                  item.renderContent()
                ) : (
                  <PlaceholderItem day={item.day} date={item.date} />
                )}
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
