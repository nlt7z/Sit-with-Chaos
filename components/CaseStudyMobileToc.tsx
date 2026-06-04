"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

/**
 * Mobile / tablet section navigation for case-study pages.
 *
 * The desktop reading experience uses a `hidden lg:block` fixed sidebar, which
 * leaves phones and tablets with no way to jump between sections. This is the
 * `lg:hidden` counterpart: a floating "Sections" button that opens a sheet of
 * anchors. It is `fixed`-positioned and self-contained, so it never affects the
 * page's document flow — drop `<CaseStudyMobileToc items={navItems} />` anywhere
 * in a case study and it just works, regardless of that page's hero padding.
 *
 * Active-section tracking mirrors the sidebar's IntersectionObserver so the open
 * sheet highlights wherever the reader currently is.
 */
export function CaseStudyMobileToc({
  items,
  variant = "light",
}: {
  items: readonly TocItem[];
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const reduce = useReducedMotion();

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const activeLabel = items.find((i) => i.id === active)?.label;

  const go = (id: string) => {
    setActive(id);
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lg:hidden">
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors ${
          isDark
            ? "bg-white/12 text-zinc-100 ring-1 ring-white/15"
            : "bg-textPrimary/92 text-white ring-1 ring-black/10"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="truncate">{activeLabel ?? "Sections"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close section menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/35"
            />
            <motion.div
              role="dialog"
              aria-label="Case study sections"
              initial={{ y: reduce ? 0 : "100%", opacity: reduce ? 0 : 1 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduce ? 0 : "100%", opacity: reduce ? 0 : 1 }}
              transition={{ duration: reduce ? 0.01 : 0.34, ease: [0.25, 0.1, 0.25, 1] }}
              className={`fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 ${
                isDark
                  ? "bg-[#0c0c0e] ring-1 ring-white/10"
                  : "bg-white ring-1 ring-black/[0.06]"
              }`}
            >
              <div className={`mx-auto mb-3 h-1 w-9 rounded-full ${isDark ? "bg-white/20" : "bg-black/15"}`} />
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.2em] ${
                  isDark ? "text-zinc-400" : "text-textSecondary/70"
                }`}
              >
                On this page
              </p>
              <ul className="mt-3 space-y-0.5">
                {items.map(({ id, label }) => {
                  const on = active === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => go(id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors ${
                          on
                            ? isDark
                              ? "bg-white/10 font-medium text-white"
                              : "bg-nltLime-soft font-medium text-textPrimary"
                            : isDark
                              ? "text-zinc-300 active:bg-white/5"
                              : "text-textSecondary active:bg-black/[0.04]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            on ? "bg-nltLime" : isDark ? "bg-white/20" : "bg-black/15"
                          }`}
                        />
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
