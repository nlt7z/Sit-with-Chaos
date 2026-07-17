"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Region = { id: string; label: string };

// Height of the fixed site Nav — clicks land the section just below it.
const NAV_OFFSET = 68;

/**
 * The "Shared with You" case study lives as a self-contained static page under
 * public/assets/TikTok. We mount it in a same-origin iframe and auto-size that
 * iframe to its content height, so the OUTER page owns the scroll — that lets the
 * site-standard <Nav> stick to the top and <Footer> sit at the true bottom.
 *
 * The left section rail is rendered HERE (in the parent), not inside the iframe:
 * because the parent owns the scroll, a `position:fixed` element inside the iframe
 * would no longer pin to the real viewport. We read the section anchors out of the
 * same-origin iframe, then drive scroll + active-state from the parent window.
 */
export function TikTokCaseStudyFrame() {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(3200);
  const [regions, setRegions] = useState<Region[]>([]);
  const [active, setActive] = useState<string>("");

  // Absolute top (in the parent document) of a section inside the iframe. The
  // iframe never scrolls internally, so a region's in-iframe rect top equals its
  // offset from the content top; add the iframe's own absolute offset.
  const regionTopAbs = useCallback((id: string) => {
    const iframe = ref.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return 0;
    const el = doc.getElementById(id);
    if (!el) return 0;
    const iframeTop = iframe.getBoundingClientRect().top + window.scrollY;
    return iframeTop + el.getBoundingClientRect().top;
  }, []);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let ro: ResizeObserver | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const measure = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const h = Math.max(
          doc.documentElement?.scrollHeight ?? 0,
          doc.body?.scrollHeight ?? 0,
        );
        if (h > 0) setHeight(h);
      } catch {
        /* cross-origin guard — same-origin in practice, ignore if blocked */
      }
    };

    const collectRegions = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const list = Array.from(doc.querySelectorAll<HTMLElement>(".region"))
          .map((el) => ({ id: el.id, label: el.getAttribute("data-nav") || "" }))
          .filter((r) => r.id && r.label);
        setRegions(list);
      } catch {
        /* ignore */
      }
    };

    const onLoad = () => {
      measure();
      collectRegions();
      try {
        const doc = iframe.contentDocument;
        if (doc && "ResizeObserver" in window) {
          ro = new ResizeObserver(measure);
          if (doc.documentElement) ro.observe(doc.documentElement);
          if (doc.body) ro.observe(doc.body);
        }
      } catch {
        /* ignore */
      }
      // Late layout shifts (fonts, lazy iframes, videos reaching metadata) can
      // grow the document after load — re-measure a few times to catch them.
      [200, 700, 1600, 3000].forEach((t) => timers.push(setTimeout(measure, t)));
    };

    iframe.addEventListener("load", onLoad);
    if (iframe.contentDocument?.readyState === "complete") onLoad();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  // Active section tracking — mirror the original rail's mid-viewport band.
  useEffect(() => {
    if (!regions.length) return;
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.4;
      let current = regions[0].id;
      for (const r of regions) {
        if (regionTopAbs(r.id) <= probe) current = r.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [regions, regionTopAbs]);

  const go = (id: string) => {
    window.scrollTo({ top: Math.max(0, regionTopAbs(id) - NAV_OFFSET), behavior: "smooth" });
  };

  return (
    <>
      <iframe
        ref={ref}
        src="/assets/TikTok/case-study-en.html"
        title="TikTok · Shared with You — Feed Design case study"
        scrolling="no"
        style={{ width: "100%", height, border: 0, display: "block" }}
      />

      {regions.length > 0 && (
        <nav
          aria-label="Case study sections"
          className="pointer-events-none fixed left-0 top-0 z-40 hidden h-screen w-[11rem] select-none flex-col justify-center lg:flex"
        >
          <div className="pointer-events-auto px-6">
            <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-nltLime">
              On this page
            </p>
            <ul className="mt-5 space-y-0">
              {regions.map((r) => {
                const on = r.id === active;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => go(r.id)}
                      className={`block border-l border-transparent py-2 pl-4 text-left text-[13px] leading-snug transition-[color,border-color] duration-500 ease-out ${
                        on
                          ? "border-nltLime font-medium text-nltLime"
                          : "text-white/65 hover:border-nltLime/40 hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
