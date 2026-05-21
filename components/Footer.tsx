"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FooterProps = {
  variant?: "light" | "dark";
  showTopBorder?: boolean;
  /** No solid footer fill — page background continues behind (e.g. resume art). */
  blendBackground?: boolean;
};

const footerHalftoneSrc = "/assets/Playground/nlt_halftone_dense_v3.html";

export function Footer({ variant = "light", showTopBorder = true, blendBackground = false }: FooterProps) {
  const isDark = variant === "dark";
  const footerRef = useRef<HTMLElement>(null);
  const [halftoneMounted, setHalftoneMounted] = useState(false);
  const [vendingSwitchOn, setVendingSwitchOn] = useState(false);
  const vendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    let io: IntersectionObserver | null = null;

    const attach = () => {
      io = new IntersectionObserver(
        ([e]) => setHalftoneMounted(e.isIntersecting),
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

  useEffect(() => {
    return () => {
      if (vendingTimerRef.current) clearTimeout(vendingTimerRef.current);
    };
  }, []);

  const handleVendingSwitch = () => {
    if (vendingSwitchOn) return;
    if (prefersReducedMotion) {
      router.push("/vending");
      return;
    }
    setVendingSwitchOn(true);
    vendingTimerRef.current = setTimeout(() => {
      vendingTimerRef.current = null;
      router.push("/vending");
    }, 300);
  };

  const lightShell = blendBackground
    ? `${showTopBorder ? "border-t border-[rgba(0,0,0,0.06)]" : ""} relative z-10 bg-transparent`
    : `${showTopBorder ? "border-t border-[rgba(0,0,0,0.08)]" : ""} bg-white`;

  const darkShell = blendBackground
    ? `${showTopBorder ? "border-t border-white/[0.08]" : ""} relative z-10 bg-transparent`
    : `${showTopBorder ? "border-t border-white/[0.08]" : ""} bg-[#060608]`;

  return (
    <footer ref={footerRef} className={isDark ? darkShell : lightShell}>
      <div className="mx-auto max-w-content px-6 py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-12">
          {/* Left — halftone decoration, then copyright */}
          <div className="flex min-w-0 flex-col gap-6 md:gap-7">
            <div
              aria-hidden
              className="relative aspect-[620/260] w-full max-w-[min(100%,11rem)] overflow-hidden"
            >
              {halftoneMounted ? (
                <iframe
                  src={footerHalftoneSrc}
                  title=""
                  loading="lazy"
                  scrolling="no"
                  className="pointer-events-auto absolute left-1/2 top-1/2 h-[140%] w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0 opacity-60 transition-opacity duration-500 hover:opacity-100"
                />
              ) : null}
            </div>
            <p className={`text-sm ${isDark ? "text-zinc-300" : "text-textPrimary"}`}>© 2026 Yuan Fang · NLT Studio</p>
          </div>

          {/* Right — email, credit line, and the vending easter egg (demoted from hero) */}
          <div className={`flex shrink-0 flex-col gap-2 md:items-end`}>
            <a
              href="mailto:fangyuanzero7@gmail.com"
              className={`font-mono text-xs transition-opacity hover:opacity-60 ${
                isDark ? "text-zinc-400" : "text-textSecondary"
              }`}
            >
              fangyuanzero7@gmail.com
            </a>
            <p
              className={`font-mono text-xs leading-relaxed md:text-right md:whitespace-nowrap ${
                isDark ? "text-zinc-500" : "text-textSecondary/80"
              }`}
            >
              Built with Next.js · Designed with intent
            </p>

            <button
              type="button"
              role="switch"
              aria-checked={vendingSwitchOn}
              aria-busy={vendingSwitchOn}
              aria-label="Switch to vending machine view"
              onClick={handleVendingSwitch}
              disabled={vendingSwitchOn}
              className="group mt-3 inline-flex shrink-0 cursor-pointer items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2 disabled:cursor-wait"
            >
              <span
                className={`relative h-[0.875rem] w-[1.75rem] shrink-0 rounded-full border transition-[border-color,background-color] duration-300 ease-out ${
                  vendingSwitchOn
                    ? isDark
                      ? "border-white/45 bg-white/15"
                      : "border-black/30 bg-black/10"
                    : isDark
                      ? "border-white/15 bg-white/[0.06] group-hover:border-white/25"
                      : "border-black/[0.12] bg-neutral-200/80 group-hover:border-black/[0.18]"
                }`}
                aria-hidden
              >
                <span
                  className={`pointer-events-none absolute left-[2px] top-1/2 size-[0.75rem] -translate-y-1/2 rounded-full ${
                    isDark ? "bg-zinc-200" : "bg-white"
                  } shadow-[0_1px_2px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    vendingSwitchOn ? "translate-x-[0.875rem]" : "translate-x-0"
                  }`}
                />
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.18em] transition-colors md:text-[10px] ${
                  isDark
                    ? "text-zinc-500 group-hover:text-zinc-300"
                    : "text-textSecondary/55 group-hover:text-textSecondary"
                }`}
              >
                Vending
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
