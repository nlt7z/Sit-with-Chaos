"use client";

/**
 * BentoHomeFocus — a hierarchy-first rework of the bento homepage.
 *
 * Same draggable-widget desktop aesthetic, but restructured so the page has a
 * focal point instead of 11 equal-weight cells:
 *   • TWO tiers only — an identity entry (boldest type) + the Liner work as the
 *     single largest media surface (the visual anchor); everything else is quiet.
 *   • ONE thing moves at rest (the featured Liner). Craft spins on hover only;
 *     the clock, the auto-rotating moodboard and the autoplay vinyl are removed.
 *   • Lime is rationed to 3 moments: the name, the one CTA, the live "Now" dot.
 *     Every other ↗ / label is neutral and only warms to lime on hover.
 *
 * Lives at /lab/bento-focus as an A/B against the live homepage at /.
 */

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { CraftModel } from "@/components/hero/CraftModel";
import { RoseLoader } from "@/components/RoseLoader";
import { SideRail } from "@/components/bento/SideRail";
import { SplitTextChars } from "@/components/SplitBtn";

const EMAIL = "fangyuanzero7@gmail.com";
const BRAND_TAGS = ["Design Engineer", "AI-Native", "Visual Craft"];

const JOURNEY = [
  { org: "Liner", note: "Product Designer · 2025" },
  { org: "Alibaba Cloud", note: "Product Design Intern · 2025" },
  { org: "Meituan", note: "Product Design Intern · 2025" },
  { org: "UW · HCDE", note: "MS · 2024–26" },
  { org: "Pratt Institute", note: "BFA" },
];

const SKILL_GROUPS = [
  { label: "Code & AI", items: ["React", "TypeScript", "Next.js", "Claude Code"] },
  { label: "Design", items: ["UX/UI", "Interaction", "Design Systems", "Motion"] },
  { label: "Research", items: ["Interviews", "Usability", "A/B Testing"] },
  { label: "Tools", items: ["Figma", "Framer", "After Effects", "Rive"] },
];

/* scaled iframe with a lime RoseLoader fallback */
function ScaledPrototype({
  src,
  naturalW,
  naturalH,
  interactive = false,
  reduced,
  fit = "width",
  bg = "#0c0d0f",
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  interactive?: boolean;
  reduced: boolean;
  fit?: "width" | "contain";
  bg?: string;
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
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ background: bg }}>
      {!loaded ? (
        <div className="absolute inset-0 z-10 grid place-items-center" style={{ background: bg }}>
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

/* the one filled-lime button on the page */
function SplitBtn({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="group inline-flex items-center rounded-full bg-nltLime px-4 py-2 text-[12px] font-medium text-[#1d1d1f]">
      <SplitTextChars text={label} />
    </a>
  );
}

/* neutral ↗ that warms to lime on hover — replaces the always-on lime dots */
function CornerLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="absolute right-2.5 top-2.5 z-30 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[14px] text-white/80 backdrop-blur-sm transition-colors duration-300 hover:bg-nltLime hover:text-[#1d1d1f]"
    >
      ↗
    </Link>
  );
}

/* Liner — the page's single moving surface: video at rest, live proto on hover */
function LinerMedia({ reduced }: { reduced: boolean }) {
  const vref = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = "/assets/liner/liner-product-video.mp4";
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="absolute inset-2 top-11 overflow-hidden rounded-xl border border-white/10 bg-[#141416]"
      onMouseEnter={() => {
        setHover(true);
        setArmed(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      <video
        ref={vref}
        muted
        loop
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hover ? "opacity-0" : "opacity-100"}`}
      />
      {armed ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${hover ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <ScaledPrototype src="/assets/liner/liner-ai-yuan.html" naturalW={1280} naturalH={760} fit="contain" interactive reduced={reduced} />
        </div>
      ) : null}
      <span
        className="pointer-events-none absolute bottom-2 left-2.5 z-10 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/85 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: hover ? 0 : 1 }}
      >
        Hover to try ↗
      </span>
    </div>
  );
}

/* skills — labels neutral (was lime on every group) */
function SkillsList() {
  return (
    <div className="grid h-full grid-cols-2 content-center gap-x-4 gap-y-3 px-4 py-2">
      {SKILL_GROUPS.map((g) => (
        <div key={g.label} className="group/sk min-w-0 cursor-default">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/45 transition-colors duration-300 group-hover/sk:text-nltLime">
            {g.label}
          </p>
          <p className="mt-1.5 text-[12px] leading-[1.5] text-white/65 transition-colors duration-300 group-hover/sk:text-white">
            {g.items.join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}

/* craft — 3D specimen kept calm: loaded + lit but NOT auto-spinning
   (reduced suppresses the turntable); drag-to-orbit stays interactive. */
function CraftHover() {
  const [hover, setHover] = useState(false);
  return (
    <div className="absolute inset-0" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <CraftModel reduced active onInteract={() => {}} zoom={1.2} />
      <span
        className="pointer-events-none absolute bottom-2.5 left-3 z-10 font-mono text-[8px] uppercase tracking-wider text-white/45 transition-opacity duration-300"
        style={{ opacity: hover ? 0 : 1 }}
      >
        Drag to orbit
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                 */
/* ------------------------------------------------------------------ */

export function BentoHomeFocus() {
  const reduced = !!useReducedMotion();
  const canvas = "#0a0b0c";

  return (
    <div className="relative h-[100svh] overflow-hidden" style={{ background: canvas, color: "#fff" }}>
      {/* dot-grid wash — confined to the top-right, gives the eye a quiet field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.11) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />

      <SideRail active="home" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1740px] gap-2.5 py-3 pl-10 pr-3 md:pl-14 md:pr-4">
        <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
          {/* ===== col 1 — IDENTITY (reading entry: boldest type) ===== */}
          <div className="flex min-h-0 flex-[1.15] flex-col gap-2.5">
            <BentoCard label="Yuan Fang" surface="glass" index={0} className="min-h-0 flex-[6]">
              <div className="flex h-full flex-col justify-between gap-2 px-5 py-4">
                <div className="leading-none">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime">Hi, I&apos;m 👋</p>
                  <p className="font-display text-[clamp(2.6rem,4.4vw,3.8rem)] font-light italic leading-[0.82] text-nltLime">yuan</p>
                  <p className="mt-1 font-sans text-[clamp(1.3rem,2.6vw,2.1rem)] font-light uppercase tracking-[0.12em] text-white/30">Fang</p>
                </div>

                {/* the statement — orients the visitor in one line */}
                <p className="font-display text-[clamp(0.95rem,1.15vw,1.15rem)] font-light leading-[1.4] text-white/75">
                  Designer who codes. I shape{" "}
                  <span className="relative inline-block">
                    <span aria-hidden className="absolute inset-x-[-0.12em] bottom-[0.04em] -z-0 h-[0.66em] -rotate-[2deg] rounded-[2px] bg-nltLime" />
                    <span className="relative z-10 text-[#1d1d1f]">AI-native products</span>
                  </span>{" "}
                  end-to-end — from research to a crafted, shipped interface.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {BRAND_TAGS.map((r) => (
                      <span key={r} className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/55">
                        {r}
                      </span>
                    ))}
                  </div>
                  <SplitBtn href={`mailto:${EMAIL}`} label="Say hello ↗" />
                </div>
              </div>
            </BentoCard>

            {/* journey — neutral dots; only the current role glows lime */}
            <BentoCard label="Journey" surface="dark" index={1} className="min-h-0 flex-[4]">
              <motion.div
                className="flex h-full flex-col justify-center px-4 py-3"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.16, delayChildren: 0.1 } } }}
              >
                {JOURNEY.map((j, idx) => (
                  <motion.div
                    key={j.org}
                    className="group/j flex cursor-default gap-3"
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 18 } } }}
                  >
                    <div className="relative flex flex-col items-center">
                      <span className={`z-10 mt-0.5 h-2 w-2 shrink-0 rounded-full ring-2 ring-white/10 transition-transform duration-300 group-hover/j:scale-150 ${idx === 0 ? "bg-nltLime" : "bg-white/30"}`} />
                      {idx < JOURNEY.length - 1 ? <span className="w-px flex-1 bg-white/15" /> : null}
                    </div>
                    <div className="pb-6 transition-transform duration-300 group-hover/j:translate-x-1">
                      <p className="text-[12px] leading-tight text-white transition-colors duration-300 group-hover/j:text-nltLime">{j.org}</p>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">{j.note}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </BentoCard>
          </div>

          {/* ===== col 2 — THE ANCHOR: featured Liner, largest surface ===== */}
          <div className="flex min-h-0 flex-[1.5] flex-col gap-2.5">
            <BentoCard surface="dark" index={2} className="min-h-0 flex-[10]">
              <CornerLink href="/work/liner" label="Liner case study" />
              <div className="absolute left-3 top-2.5 z-30 flex items-center gap-1.5 pr-12">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-nltLime">
                  Now · shaping Liner&apos;s new AI collaboration feature
                </span>
              </div>
              <LinerMedia reduced={reduced} />
            </BentoCard>
          </div>

          {/* ===== col 3 — supporting work (calm, static at rest) ===== */}
          <div className="flex min-h-0 flex-[1.05] flex-col gap-2.5">
            {/* meituan — static phone; no pulsing gradient */}
            <BentoCard label="Meituan · Design + Build" surface="dark" index={3} className="min-h-0 flex-[5.5]">
              <CornerLink href="/work/meituan-im" label="Meituan case study" />
              <div className="absolute inset-0 grid place-items-center px-2 pb-2 pt-9">
                <div className="relative h-full w-[42%] overflow-hidden rounded-[1.2rem] shadow-[0_18px_50px_-22px_rgba(0,0,0,0.7)]">
                  <ScaledPrototype src="/assets/meituan-im/Repair%20Flow%20Dark.html?solo" naturalW={430} naturalH={1000} fit="contain" reduced={reduced} bg="#141416" />
                </div>
              </div>
            </BentoCard>

            {/* qbix studio — live site, opens in new tab */}
            <BentoCard label="Studio · qbix" surface="dark" index={4} className="min-h-0 flex-[4.5]">
              <a href="https://qbix.space" target="_blank" rel="noopener noreferrer" aria-label="Open qbix.space" className="absolute inset-0 z-30 block" />
              <span className="absolute right-2.5 top-2.5 z-40 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[14px] text-white/80 backdrop-blur-sm transition-colors duration-300 group-hover:bg-nltLime group-hover:text-[#1d1d1f]">
                ↗
              </span>
              <div className="absolute inset-x-0 bottom-0 top-9">
                <ScaledPrototype src="https://qbix.space" naturalW={1600} naturalH={900} fit="contain" reduced={reduced} />
              </div>
            </BentoCard>
          </div>

          {/* ===== col 4 — quiet personality + credentials ===== */}
          <div className="flex min-h-0 flex-[0.72] flex-col gap-2.5">
            <BentoCard label="Craft" surface="dark" index={5} className="min-h-0 flex-[5]">
              <CraftHover />
            </BentoCard>

            <BentoCard label="Skills" surface="dark" index={6} className="min-h-0 flex-[5]">
              <SkillsList />
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
