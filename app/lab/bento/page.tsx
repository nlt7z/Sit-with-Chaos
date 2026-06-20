"use client";

/**
 * /lab/bento — homepage redesign in the xiangyidesign.com bento-desktop style.
 *
 * An all-dark, content-hugging masonry PUZZLE of draggable widget windows, in
 * three staggered columns:
 *   • left   — intro · Qbix (live site) · code · craft (3D)
 *   • middle — a lime motion widget · Liner (its interactive prototype, the
 *              frame shrink-wrapped to the prototype's own measured size)
 *   • right  — clock · a spinning-vinyl music widget · a small Meituan phone
 * Signature lime motifs: a halftone dot field on the canvas + the RoseLoader.
 *
 * Drag a window by its header — it stretches on an elastic tether and springs
 * back (no tilt, no header dots). Below lg the columns stack + scroll.
 *
 * Destined to replace app/page.tsx once it feels right — isolated here first.
 */

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { BentoClock } from "@/components/bento/BentoClock";
import { CraftModel } from "@/components/hero/CraftModel";
import { RoseLoader } from "@/components/RoseLoader";

const EMAIL = "fangyuanzero7@gmail.com";

/* ------------------------------------------------------------------ */
/* ContentFitFrame — same-origin iframe whose frame shrink-wraps to the */
/* prototype's own laid-out height (measured live), so the outer window  */
/* hugs the content instead of letterboxing it. RoseLoader placeholder.  */
/* ------------------------------------------------------------------ */

function ContentFitFrame({ src, reduced, maxH = 560 }: { src: string; reduced: boolean; maxH?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const measure = useCallback(() => {
    try {
      const doc = frameRef.current?.contentDocument;
      if (doc) {
        const ch = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
        if (ch) setH(Math.min(ch, maxH));
      }
    } catch {
      /* cross-origin — keep the default aspect */
    }
  }, [maxH]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="px-2 pb-2">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#141416] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
        <div className="flex h-4 items-center bg-[#1b1c1f] px-2">
          <span className="h-2 w-1/2 max-w-[55%] rounded-full bg-white/[0.08]" />
        </div>
        <div
          ref={wrapRef}
          className="relative w-full overflow-hidden bg-[#0c0d0f]"
          style={h ? { height: h } : { aspectRatio: "16 / 10" }}
        >
          {!loaded ? (
            <div className="absolute inset-0 z-10 grid place-items-center bg-[#0c0d0f]">
              <RoseLoader reduced={reduced} className="h-12 w-12" />
            </div>
          ) : null}
          <iframe
            ref={frameRef}
            src={src}
            title="Liner prototype"
            loading="lazy"
            onLoad={() => {
              setLoaded(true);
              measure();
            }}
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ScaledPrototype — iframe scaled to fit (Qbix contain, Meituan width). */
/* ------------------------------------------------------------------ */

function ScaledPrototype({
  src,
  naturalW,
  naturalH,
  interactive = false,
  reduced,
  fit = "width",
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  interactive?: boolean;
  reduced: boolean;
  fit?: "width" | "contain";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setScale(fit === "contain" ? Math.min(width / naturalW, height / naturalH) : width / naturalW);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalW, naturalH, fit]);

  const placement =
    fit === "contain"
      ? { top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" as const }
      : { top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left" as const };

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#0c0d0f]">
      {!loaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#0c0d0f]">
          <RoseLoader reduced={reduced} className="h-12 w-12" />
        </div>
      ) : null}
      <iframe
        src={src}
        title="Prototype"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${interactive ? "" : "pointer-events-none"} border-0`}
        style={{ position: "absolute", width: naturalW, height: naturalH, ...placement }}
      />
    </div>
  );
}

/* a clean browser screen frame (no traffic-light dots) */
function MacScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-2 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141416] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]">
      <div className="flex h-5 shrink-0 items-center bg-[#1b1c1f] px-2">
        <span className="h-2.5 w-1/2 max-w-[55%] rounded-full bg-white/[0.08]" />
      </div>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(EMAIL).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          },
          () => {},
        );
      }}
      className="inline-flex items-center gap-1.5 self-start rounded-full bg-nltLime px-3 py-1 font-mono text-[10px] text-[#1d1d1f] transition-transform hover:scale-[1.04] active:scale-95"
    >
      {copied ? "Copied ✓" : "Copy email ↗"}
    </button>
  );
}

function CodeCard() {
  return (
    <div className="flex h-full gap-2 px-3.5 pb-2.5">
      <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/45 p-2 font-mono text-[9px] leading-relaxed">
        <div>
          <span className="text-[#c678dd]">function</span> <span className="text-[#61afef]">Card</span>
          <span className="text-white/40">() {"{"}</span>
        </div>
        <div className="pl-2.5 text-white/50">
          <span className="text-[#c678dd]">return</span> <span className="text-white/40">&lt;</span>
          <span className="text-[#e06c75]">button</span>
          <span className="text-white/40">&gt;</span>
        </div>
        <div className="pl-4 text-nltLime">Hire me</div>
        <div className="pl-2.5 text-white/40">&lt;/&gt;</div>
        <div className="text-white/40">{"}"}</div>
      </div>
      <div className="flex w-[44%] shrink-0 flex-col justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
        <div className="h-1 w-8 rounded-full bg-white/20" />
        <div className="h-1 w-12 rounded-full bg-white/10" />
        <div className="grid h-6 place-items-center rounded-md bg-nltLime font-mono text-[9px] text-[#1d1d1f]">Hire me</div>
        <span className="font-mono text-[8px] text-white/35">↑ rendered</span>
      </div>
    </div>
  );
}

/* music — a spinning vinyl record */
function MusicVinyl({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex h-full items-center gap-2.5 px-3 pb-1.5">
      <Image
        src="/assets/Playground/vinyl.png"
        alt="Spinning vinyl record"
        width={50}
        height={50}
        className="h-12 w-12 shrink-0 select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        style={reduced ? undefined : { animation: "vinyl-spin 3.6s linear infinite" }}
      />
      <div className="min-w-0">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-nltLime">Now playing</p>
        <p className="truncate text-[12px] text-white">Resonance</p>
        <p className="truncate font-mono text-[9px] text-white/45">HOME</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                 */
/* ------------------------------------------------------------------ */

export default function BentoHome() {
  const reduced = !!useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0c] text-white">
      {/* lime halftone dot field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />
      {/* ambient lime glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 42% at 84% 4%, rgba(210,255,0,0.10), rgba(10,11,12,0) 60%), radial-gradient(45% 40% at 6% 96%, rgba(210,255,0,0.06), rgba(10,11,12,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 py-4 md:px-7 md:py-5">
        <header className="flex items-center justify-between pb-3">
          <Link
            href="/lab"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-white"
          >
            ← Lab
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            Drag a window — it stretches &amp; snaps back
          </span>
        </header>

        {/* ---------- masonry puzzle (3 staggered columns) ---------- */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          {/* ===== left — intro · qbix · code · craft ===== */}
          <div className="flex flex-col gap-3 lg:flex-[1.1]">
            <BentoCard label="Yuan Fang" surface="glass" index={0}>
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <h1 className="font-display text-[clamp(1.15rem,1.5vw,1.7rem)] font-light leading-[1.1] text-white">
                    Curiosity, visual craft, code.
                  </h1>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      {!reduced && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-70" />
                      )}
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
                    </span>
                    <span className="font-mono text-[10px] text-white/55">Open to 2026 roles</span>
                  </div>
                </div>
                <CopyEmail />
              </div>
            </BentoCard>

            {/* qbix — live site */}
            <BentoCard label="Studio" surface="dark" accent="#c8e06c" index={1} className="aspect-[16/10]">
              <a
                href="https://qbix.space"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-2 z-30 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Open site ↗
              </a>
              <span className="absolute left-3 top-2 z-30 font-mono text-[9px] uppercase tracking-[0.16em] text-[#c8e06c]">
                Solo build — my studio
              </span>
              <MacScreen>
                <ScaledPrototype src="https://qbix.space" naturalW={1600} naturalH={900} fit="contain" reduced={reduced} />
              </MacScreen>
            </BentoCard>

            {/* code */}
            <BentoCard label="03 · Code" surface="dark" index={2} className="h-[8rem]">
              <CodeCard />
            </BentoCard>

            {/* craft — slow oblique 3D specimen */}
            <BentoCard label="02 · Craft" surface="dark" index={3} className="h-[10rem]">
              <div className="absolute inset-0">
                <CraftModel reduced={reduced} active onInteract={() => {}} />
              </div>
            </BentoCard>
          </div>

          {/* ===== middle — motion · liner ===== */}
          <div className="flex flex-col gap-3 lg:flex-[1.4]">
            {/* motion — the lime loading animation as a showpiece */}
            <BentoCard label="Motion" surface="dark" index={4} className="h-[8.5rem]">
              <div className="relative grid h-full place-items-center">
                <RoseLoader reduced={reduced} className="h-16 w-16" />
                <span className="absolute bottom-2 left-3.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
                  Lime · motion
                </span>
              </div>
            </BentoCard>

            {/* liner — interactive prototype, frame hugs its measured size */}
            <BentoCard label="Now · Liner" surface="dark" index={5}>
              <Link
                href="/work/liner"
                className="absolute right-3 top-2 z-30 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Case study ↗
              </Link>
              <span className="absolute left-3 top-2 z-30 font-mono text-[9px] uppercase tracking-[0.16em] text-nltLime">
                ● Now — in progress
              </span>
              <div className="pt-9">
                <ContentFitFrame src="/assets/liner/liner-ai-yuan.html" reduced={reduced} maxH={560} />
              </div>
            </BentoCard>
          </div>

          {/* ===== right — clock · music · meituan (smaller) ===== */}
          <div className="flex flex-col gap-3 lg:flex-[0.74]">
            <div className="flex gap-3">
              <BentoCard label="PDT" surface="dark" index={6} className="h-[6.5rem] flex-1">
                <BentoClock />
              </BentoCard>
              <BentoCard label="Audio" surface="dark" index={7} className="h-[6.5rem] flex-1">
                <MusicVinyl reduced={reduced} />
              </BentoCard>
            </div>

            {/* meituan — small 9:16 phone → case study */}
            <BentoCard label="Research · Meituan" surface="dark" accent="#FFC300" index={8} className="aspect-[9/16]">
              <Link href="/work/meituan-im" className="group absolute inset-0 block">
                <span className="absolute left-1/2 top-1.5 z-20 h-2.5 w-12 -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />
                <ScaledPrototype src="/assets/meituan-im/Repair%20Flow.html?solo" naturalW={390} naturalH={900} reduced={reduced} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent px-3.5 pb-3 pt-8">
                  <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#FFC300]">Research → process</span>
                  <p className="font-display text-sm font-light text-white">
                    Meituan IM <span className="text-white/45 transition-transform group-hover:translate-x-0.5">↗</span>
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/50">+5% conversion · A/B</p>
                </div>
              </Link>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
