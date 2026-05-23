"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DesktopExperienceGateProps = {
  /** The full desktop experience — rendered on md+ screens and inside the scaled preview iframe. */
  children: React.ReactNode;
  /** Pathname Claude can iframe-scale on mobile. If omitted, the gate only renders the
   *  marketing notice and a CTA back to the lab. */
  embedPath?: string;
  /** Title shown above the mobile preview. */
  title: string;
  /** One-liner positioned under the title. */
  description?: string;
  /** Where the "View other work" CTA points. Defaults to /vibe-coding. */
  backHref?: string;
  /** When true the gate is disabled (e.g. embed mode), and children are always rendered. */
  disabled?: boolean;
  /** Designed device width — the preview iframe scales the experience to fit the
   *  mobile viewport while preserving the desktop layout. */
  naturalWidth?: number;
  /** Designed device height — used to size the scaled preview area. */
  naturalHeight?: number;
};

const MOBILE_BREAKPOINT_PX = 768;

/** Wraps a desktop-first interactive prototype so that mobile visitors get a
 *  scaled preview + a clear "open on a wider screen" affordance, while desktop
 *  users see the experience natively. The full experience is still reachable on
 *  mobile via the same route with `?embed=1`, which mounts it inside the
 *  preview iframe (the URL bypass also lets bots and link previews resolve). */
export function DesktopExperienceGate({
  children,
  embedPath,
  title,
  description,
  backHref = "/vibe-coding",
  disabled = false,
  naturalWidth = 1280,
  naturalHeight = 800,
}: DesktopExperienceGateProps) {
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (disabled) {
      setReady(true);
      return;
    }
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    setReady(true);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [disabled]);

  if (disabled) return <>{children}</>;

  if (!ready) {
    // Render desktop content during the first paint to avoid CLS, then swap on the client.
    return (
      <div className="hidden md:contents">{children}</div>
    );
  }

  if (!isMobile) return <>{children}</>;

  return (
    <MobilePreview
      embedPath={embedPath}
      title={title}
      description={description}
      backHref={backHref}
      naturalWidth={naturalWidth}
      naturalHeight={naturalHeight}
    />
  );
}

function MobilePreview({
  embedPath,
  title,
  description,
  backHref,
  naturalWidth,
  naturalHeight,
}: Required<Pick<DesktopExperienceGateProps, "title" | "naturalWidth" | "naturalHeight">> &
  Pick<DesktopExperienceGateProps, "embedPath" | "description" | "backHref">) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(w / naturalWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth]);

  return (
    <main className="min-h-screen bg-white px-5 pb-16 pt-24 text-textPrimary">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">
            Desktop-first prototype
          </span>
          <h1 className="font-display text-[1.6rem] font-light leading-[1.15] tracking-[-0.02em] text-textPrimary">
            {title}
          </h1>
          {description ? (
            <p className="text-[14px] leading-relaxed text-textSecondary">{description}</p>
          ) : null}
          <p className="text-[13px] leading-relaxed text-textSecondary/80">
            This interactive piece was designed for a desktop canvas — open the page on a wider screen for the full
            experience. A scaled preview is below.
          </p>
        </header>

        {embedPath ? (
          <div
            ref={frameRef}
            className="relative w-full overflow-hidden rounded-xl border border-black/[0.08] bg-neutral-50"
            style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
          >
            <iframe
              src={embedPath.includes("?") ? `${embedPath}&embed=1` : `${embedPath}?embed=1`}
              title={`${title} — scaled preview`}
              loading="lazy"
              referrerPolicy="no-referrer"
              tabIndex={-1}
              style={{
                width: `${naturalWidth}px`,
                height: `${naturalHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
              className="absolute left-0 top-0 border-0"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href={backHref ?? "/vibe-coding"}
            className="inline-flex items-center gap-1.5 rounded-full bg-textPrimary px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white"
          >
            ← Back to lab
          </Link>
        </div>
      </div>
    </main>
  );
}
