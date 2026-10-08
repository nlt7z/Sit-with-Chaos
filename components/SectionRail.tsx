"use client";

import { useEffect, useState } from "react";

import { CaseStudyMobileToc, type TocItem } from "@/components/CaseStudyMobileToc";

/**
 * SectionRail — "where am I on this page", always on the right edge.
 *
 * Site rule: the left edge is the global section switch (SideRail); the right
 * edge is in-page progress. Case studies and the Lab carousel both use this,
 * so the two read as one system.
 *
 * Each item is a short tick; the current one is longer and lit. Labels sit to
 * the left of the ticks: always shown when the viewport has room (≥1440px),
 * otherwise revealed on hover / focus over a frosted backing so they stay
 * legible on top of content. Hidden below md, where CaseStudyMobileToc (or the
 * page's own mobile layout) takes over.
 */

type Tone = "dark" | "light";

const TONE: Record<Tone, { backing: string; label: string; labelOn: string; tick: string; tickOn: string; counter: string; counterOn: string }> = {
  dark: {
    backing: "bg-[#0f1011]/85 border border-white/[0.08]",
    label: "text-white/45 group-hover/item:text-white/85",
    labelOn: "text-white",
    tick: "bg-white/25 group-hover/item:bg-white/60",
    tickOn: "bg-nltLime",
    counter: "text-white/35",
    counterOn: "text-nltLime",
  },
  light: {
    backing: "bg-white/90 border border-black/[0.06] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]",
    label: "text-textSecondary/75 group-hover/item:text-textPrimary",
    labelOn: "text-textPrimary",
    tick: "bg-black/20 group-hover/item:bg-black/45",
    tickOn: "bg-textPrimary",
    counter: "text-textSecondary/60",
    counterOn: "text-textPrimary",
  },
};

export function SectionRail({
  items,
  active,
  onJump,
  tone = "dark",
  counter = false,
  labels = "auto",
  ariaLabel = "On this page",
}: {
  items: readonly TocItem[];
  active: string;
  onJump: (id: string) => void;
  tone?: Tone;
  /** Show "03 / 12" under the ticks (for carousels with no scrollbar). */
  counter?: boolean;
  /** "auto": labels always shown from 1440px, on hover below. "hover": only on
   *  hover / focus at every width (for pages whose canvas fills the margins). */
  labels?: "auto" | "hover";
  ariaLabel?: string;
}) {
  const t = TONE[tone];
  // Tailwind needs the literal class names, so the wide-screen variants are
  // switched off wholesale for "hover".
  const wide = labels === "auto";
  const index = Math.max(0, items.findIndex((i) => i.id === active));
  const longest = Math.max(...items.map((i) => i.label.length));

  return (
    <nav aria-label={ariaLabel} className="group/rail fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      {/* frosted backing, only while labels are revealed over content */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-y-3 -right-3 rounded-[14px] text-[12px] opacity-0 backdrop-blur-md transition-opacity duration-150 group-focus-within/rail:opacity-100 group-hover/rail:opacity-100 ${wide ? "min-[1440px]:!opacity-0" : ""} ${t.backing}`}
        style={{ width: `calc(${longest}ch + 4.5rem)` }}
      />
      <ul className="relative flex flex-col">
        {items.map(({ id, label }) => {
          const on = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onJump(id)}
                aria-current={on ? "location" : undefined}
                className="group/item relative flex min-h-[22px] w-full items-center justify-end gap-3 pl-2 focus-visible:outline-none"
              >
                {/* below 1440 the label hangs off the tick (absolute), so while
                    hidden it neither takes space nor catches clicks meant for
                    the content underneath */}
                <span
                  className={`pointer-events-none absolute right-full top-1/2 mr-1 -translate-y-1/2 whitespace-nowrap text-[12px] leading-none opacity-0 transition-[opacity,color] duration-150 group-focus-within/rail:pointer-events-auto group-focus-within/rail:opacity-100 group-hover/rail:pointer-events-auto group-hover/rail:opacity-100 group-focus-visible/item:underline ${
                    wide ? "min-[1440px]:pointer-events-auto min-[1440px]:static min-[1440px]:mr-0 min-[1440px]:translate-y-0 min-[1440px]:opacity-100" : ""
                  } ${
                    on ? `font-medium ${t.labelOn}` : t.label
                  }`}
                >
                  {label}
                </span>
                <span
                  aria-hidden
                  className={`block h-[2px] shrink-0 rounded-full transition-[width,background-color] duration-300 ease-portfolio ${
                    on ? `w-6 ${t.tickOn}` : `w-3 ${t.tick}`
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {counter ? (
        <p className="relative mt-4 text-right font-mono text-[11px] tabular-nums leading-none tracking-[0.08em]">
          <span className={t.counterOn}>{String(index + 1).padStart(2, "0")}</span>
          <span className={t.counter}> / {String(items.length).padStart(2, "0")}</span>
        </p>
      ) : null}
    </nav>
  );
}

/** The last section whose top has passed 40% of the viewport height. Read on
 *  scroll (one rAF per frame), so a fast fling can't skip a section. */
export function useActiveSection(items: readonly TocItem[]) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = items[0]?.id ?? "";
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // a short last section never reaches the line; the page end selects it
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const last = items[items.length - 1]?.id;
      if (atEnd && last && document.getElementById(last)) current = last;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return [active, setActive] as const;
}

/** Case-study table of contents: the right-edge rail on md+, the floating
 *  "sections" sheet below md. Sections scroll to their own scroll-margin. */
export function CaseStudyToc({ items, tone = "light" }: { items: readonly TocItem[]; tone?: Tone }) {
  const [active, setActive] = useActiveSection(items);
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
  };
  return (
    <>
      <SectionRail items={items} active={active} onJump={jump} tone={tone} />
      <CaseStudyMobileToc items={items} variant={tone} />
    </>
  );
}
