"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const PlaygroundPageContent = dynamic(
  () => import("@/app/vibe-coding/VibeCodingPageContent").then((mod) => ({ default: mod.VibeCodingPageContent })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Code-splits vibe coding page chunk when the section approaches the viewport.
 */
export function AboutPlaygroundSection() {
  const sentinelRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setShouldLoad(true);
      },
      { threshold: 0, rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sentinelRef}
      className="border-t border-[rgba(0,0,0,0.08)] bg-white px-6 pb-20 pt-24 md:pt-32"
    >
      {shouldLoad ? <PlaygroundPageContent /> : (
        <div
          className="mx-auto max-w-content animate-pulse rounded-2xl bg-neutral-100/90 px-6 py-24 md:py-32"
          aria-hidden
        >
          <div className="h-4 w-24 rounded bg-neutral-200/90" />
          <div className="mt-6 h-12 max-w-md rounded bg-neutral-200/80" />
          <div className="mt-6 h-24 max-w-2xl rounded bg-neutral-200/70" />
        </div>
      )}
    </section>
  );
}
