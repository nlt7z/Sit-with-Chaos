"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

/** Iframe is rendered at this fixed pixel size and CSS-scaled down to fit the
 *  card, so the embedded site renders its desktop layout — not a mobile
 *  fallback that responds to the small card width. */
const IFRAME_WIDTH = 1280;
const IFRAME_HEIGHT = 800;

type SiteWindowProps = {
  /** Where the card opens in a new tab. */
  href: string;
  /** Label shown in the chrome URL pill (omit protocol). */
  url: string;
  /** Accessible iframe title — also used as the card's aria-label. */
  label: string;
  /** Gates iframe mounting. Pass an `inView` flag from a parent IntersectionObserver
   *  if you don't want the iframe to load before it's scrolled near. Defaults to true. */
  active?: boolean;
  /** Optional caption (e.g. "Solo · designed + shipped") shown over the iframe. */
  meta?: string;
  /** Extra classes on the outer anchor (use for grid sizing). */
  className?: string;
};

export function SiteWindow({
  href,
  url,
  label,
  active = true,
  meta,
  className = "",
}: SiteWindowProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const reduced = !!useReducedMotion();

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / IFRAME_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={
        reduced
          ? undefined
          : { y: -4, transition: { duration: 0.4, ease: easePortfolio } }
      }
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-500 ease-portfolio hover:border-black/[0.22] hover:shadow-[0_28px_60px_-22px_rgba(0,0,0,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2 ${className}`}
      aria-label={`Open ${url} in a new tab`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#F5F5F7] px-3.5 py-2.5">
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          <span className="block h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-md bg-white/85 px-3 py-1 font-mono text-[11px] text-textSecondary ring-1 ring-black/[0.04]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
            className="h-3 w-3 shrink-0 text-textSecondary/70"
          >
            <path
              fillRule="evenodd"
              d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z"
              clipRule="evenodd"
            />
          </svg>
          {url}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
          className={`h-3.5 w-3.5 shrink-0 text-textSecondary transition-[transform,color] duration-300 ease-portfolio ${
            reduced ? "" : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-textPrimary"
          }`}
        >
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </div>

      {/* Iframe area */}
      <div
        ref={frameRef}
        className="relative w-full overflow-hidden bg-neutral-50"
        style={{ aspectRatio: `${IFRAME_WIDTH} / ${IFRAME_HEIGHT}` }}
      >
        {active ? (
          <iframe
            src={href}
            title={label}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin"
            tabIndex={-1}
            style={{
              width: `${IFRAME_WIDTH}px`,
              height: `${IFRAME_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
            className="absolute left-0 top-0 border-0"
          />
        ) : null}

        {meta ? (
          <div className="pointer-events-none absolute right-3 top-3 z-[2]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm md:text-[10px]">
              <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-white/60" />
              {meta}
            </span>
          </div>
        ) : null}
      </div>
    </motion.a>
  );
}
