"use client";

import { NltBrandPattern } from "@/components/NltBrandPattern";
import { useEffect, useRef, useState } from "react";

type FooterProps = {
  variant?: "light" | "dark";
  showTopBorder?: boolean;
};

export function Footer({ variant = "light", showTopBorder = true }: FooterProps) {
  const isDark = variant === "dark";
  const footerRef = useRef<HTMLElement>(null);
  const [patternMounted, setPatternMounted] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    let io: IntersectionObserver | null = null;

    const attach = () => {
      io = new IntersectionObserver(
        ([e]) => setPatternMounted(e.isIntersecting),
        { threshold: 0, rootMargin: "120px 0px 160px 0px" },
      );
      io.observe(el);
    };

    let idleCb: number | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;

    if (typeof requestIdleCallback !== "undefined") {
      idleCb = requestIdleCallback(attach, { timeout: 2500 });
    } else {
      fallback = setTimeout(attach, 400);
    }

    return () => {
      if (idleCb !== undefined && typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleCb);
      if (fallback !== undefined) clearTimeout(fallback);
      io?.disconnect();
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={
        isDark
          ? `${showTopBorder ? "border-t border-white/[0.08]" : ""} bg-[#060608]`
          : `${showTopBorder ? "border-t border-[rgba(0,0,0,0.08)]" : ""} bg-white`
      }
    >
      <div className="mx-auto max-w-content px-6 py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-12">
          {/* Left — interactive NLT grid, then copyright */}
          <div className="flex min-w-0 flex-col gap-6 md:gap-7">
            <div aria-hidden>
              {patternMounted ? (
                <NltBrandPattern
                  variant={isDark ? "dark" : "light"}
                  columns={6}
                  rows={3}
                  cellPitchX={46}
                  cellPitchY={28}
                  influenceRadius={96}
                  liftPx={5}
                  gapClassName="gap-x-3.5 gap-y-2"
                  labelClassName={
                    isDark
                      ? "select-none font-mono text-[12px] font-medium tracking-[0.07em] text-zinc-400/65"
                      : "select-none font-mono text-[12px] font-medium tracking-[0.07em] text-black/50"
                  }
                  wrapperClassName="max-w-[min(100%,19rem)]"
                />
              ) : (
                <div className="h-12 max-w-[19rem]" aria-hidden />
              )}
            </div>
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-textPrimary"}`}>© 2026 Yuan Fang · NLT Studio</p>
          </div>

          {/* Right — credit line only */}
          <p
            className={`shrink-0 font-mono text-xs leading-relaxed md:text-right md:whitespace-nowrap ${
              isDark ? "text-zinc-500" : "text-textSecondary/80"
            }`}
          >
            Built with Next.js · Designed with intent and boba tea
          </p>
        </div>
      </div>
    </footer>
  );
}
