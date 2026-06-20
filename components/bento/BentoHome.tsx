"use client";

/**
 * /lab/bento — homepage redesign in the xiangyidesign.com bento-desktop style.
 *
 * Single-screen, NO-SCROLL puzzle of draggable widget windows, dark with a lime
 * accent (toggleable to a shadow-free light theme). Four columns; the flex-[N]
 * on each card is the user's height ratio (each column sums to 10).
 */

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BentoCard } from "@/components/bento/BentoCard";
import { BentoClock } from "@/components/bento/BentoClock";
import { SideRail } from "@/components/bento/SideRail";
import { CraftModel } from "@/components/hero/CraftModel";
import { RoseLoader } from "@/components/RoseLoader";
import { SplitTextChars } from "@/components/SplitBtn";

const EMAIL = "fangyuanzero7@gmail.com";
const BRAND_TAGS = ["UI/UX", "Design Engineer", "AI-Native", "Visual Craft"];

// only the near-square artwork (the others in /about/gallery are panoramas)
const ARTWORK = [
  "/assets/about/gallery/echo.jpg",
  "/assets/about/gallery/hang.jpg",
  "/assets/about/gallery/ice.jpg",
  "/assets/about/gallery/read.jpg",
];

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
  { label: "Research", items: ["User Interviews", "Usability Testing", "A/B Testing"] },
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

function SplitBtn({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="group inline-flex items-center rounded-full bg-nltLime px-4 py-2 text-[12px] font-medium text-[#1d1d1f]">
      <SplitTextChars text={label} />
    </a>
  );
}

/* auto-switching artwork — a small centered square thumbnail + tagline */
function ArtGallery({ reduced, light }: { reduced: boolean; light: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % ARTWORK.length), 4800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 place-items-center px-2 pt-2">
        <button
          type="button"
          onClick={() => setI((v) => (v + 1) % ARTWORK.length)}
          aria-label="Next artwork"
          className="group/art relative aspect-square h-[82%]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-lg ring-1 ring-white/5 transition-transform duration-300 group-hover/art:scale-[1.03]">
            {ARTWORK.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="200px"
                className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
          {/* oversized quote — its own top layer, never clipped by the image */}
          <span aria-hidden className="pointer-events-none absolute -left-1 -top-5 z-20 select-none font-display text-[clamp(4rem,13vh,7rem)] italic leading-[0.55] text-nltLime/40">
            &ldquo;
          </span>
        </button>
      </div>
      <p className={`shrink-0 px-3.5 pb-2.5 font-display text-[12.5px] font-light italic leading-snug ${light ? "text-[#1d1d1f]" : "text-white"}`}>
        Love crafting,{" "}
        <span className="relative inline-block">
          <span aria-hidden className="absolute inset-x-[-0.14em] bottom-[0.02em] -z-0 h-[0.72em] -rotate-[2.5deg] rounded-[2px] bg-nltLime" />
          <span className="relative z-10 not-italic text-[#1d1d1f]">but crave creating even more.</span>
        </span>
      </p>
    </div>
  );
}

/* my skills — Code & Visual emphasised */
function SkillsList() {
  return (
    <div className="grid h-full grid-cols-2 content-center gap-x-4 gap-y-3 px-4 py-2">
      {SKILL_GROUPS.map((g) => (
        <div key={g.label} className="group/sk min-w-0 cursor-default">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nltLime">{g.label}</p>
          <p className="mt-1.5 text-[12px] leading-[1.5] text-white/70 transition-colors duration-300 group-hover/sk:text-white">
            {g.items.join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}

/* liner — plays a video at rest; reveals the live prototype on hover */
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
      className="absolute inset-2 top-12 overflow-hidden rounded-xl border border-white/10 bg-[#141416]"
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

/* vinyl player — autoplay-attempt + click to play / pause */
function VinylAudio() {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.55;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label={playing ? "Pause audio" : "Play audio"} className="relative block h-full w-full overflow-hidden text-left">
      <audio ref={ref} src="/assets/vinyl.mp3" loop preload="auto" />
      <Image src="/assets/record.png" alt="Vinyl record player" fill sizes="280px" className="object-cover object-center" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
      <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-[9px] text-white backdrop-blur-sm">
        {playing ? "❚❚" : "▶"}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-nltLime">{playing ? "Now playing" : "Tap to play"}</p>
          <p className="truncate text-[11px] text-white">On the turntable</p>
        </div>
        <div className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-nltLime"
              style={{ height: 4, animation: playing ? `soundbar ${0.52 + i * 0.14}s ease-in-out infinite alternate` : "none", animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                 */
/* ------------------------------------------------------------------ */

export function BentoHome() {
  const reduced = !!useReducedMotion();
  const light = false; // light theme locked for now (toggle shows "coming soon")

  const ink = light ? "text-[#1d1d1f]" : "text-white";
  const inkDim = light ? "text-black/55" : "text-white/55";
  const inkFaint = light ? "text-black/40" : "text-white/40";
  const surface = light ? "light" : "dark";
  const hero = light ? "light" : "glass";
  const canvas = light ? "#edece6" : "#0a0b0c";

  return (
    <div className="relative h-[100svh] overflow-hidden transition-colors duration-500" style={{ background: canvas, color: light ? "#1d1d1f" : "#fff" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(210,255,0,${light ? 0.16 : 0.13}) 1px, transparent 1.5px)`,
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />

      <SideRail active="home" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1740px] gap-2.5 py-3 pl-10 pr-3 md:pl-14 md:pr-4">
        <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden">
          {/* ===== col 1 — intro(3) · gallery(4) · clock(3) ===== */}
          <div className="flex min-h-0 flex-[0.9] flex-col gap-2.5">
            <BentoCard label="Yuan Fang" surface={hero} light={light} index={0} className="min-h-0 flex-[3]">
              <div className="flex h-full flex-col justify-between gap-1.5 px-4 py-3">
                <div className="leading-none">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime">Hi, I&apos;m 👋</p>
                  <p className="font-display text-[clamp(2rem,3.6vw,3rem)] font-light italic leading-[0.85] text-nltLime">yuan</p>
                  <p className={`mt-0.5 font-sans text-[clamp(1.1rem,2.2vw,1.8rem)] font-light uppercase tracking-[0.12em] ${light ? "text-black/35" : "text-white/35"}`}>
                    Fang
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {BRAND_TAGS.map((r) => (
                    <span key={r} className={`rounded-full border border-current/20 px-2 py-0.5 text-[10px] ${inkDim}`}>
                      {r}
                    </span>
                  ))}
                </div>
                <div>
                  <SplitBtn href={`mailto:${EMAIL}`} label="Say hello ↗" />
                </div>
              </div>
            </BentoCard>

            {/* moodboard — small centered auto-switching artwork */}
            <BentoCard label="Moodboard" surface={surface} light={light} index={1} className="min-h-0 flex-[4]">
              <ArtGallery reduced={reduced} light={light} />
            </BentoCard>

            {/* clock — bigger */}
            <BentoCard label="PDT" surface={surface} light={light} index={2} className="min-h-0 flex-[3]">
              <BentoClock light={light} />
            </BentoCard>
          </div>

          {/* ===== col 2 — qbix(4) · meituan(6) ===== */}
          <div className="flex min-h-0 flex-[1.05] flex-col gap-2.5">
            {/* qbix — full-block live site, lime arrow CTA */}
            <BentoCard label="Studio" surface={surface} light={light} accent="#c8e06c" index={3} className="min-h-0 flex-[3.6]">
              <a href="https://qbix.space" target="_blank" rel="noopener noreferrer" aria-label="Open qbix.space" className="absolute inset-0 z-30 block" />
              <div className="absolute inset-0">
                <ScaledPrototype src="https://qbix.space" naturalW={1600} naturalH={900} fit="contain" reduced={reduced} />
              </div>
            </BentoCard>

            {/* meituan — complete dark prototype shown small + centered, lime CTA */}
            <BentoCard label="Meituan" surface="dark" light={light} accent="#FFC300" index={4} className="min-h-0 flex-[6.4]">
              <span className="absolute left-3 top-2.5 z-30 font-mono text-[10px] uppercase tracking-[0.14em] text-nltLime">Design + Build</span>
              <Link href="/work/meituan-im" aria-label="Meituan case study" className="absolute right-2.5 top-2.5 z-30 grid h-7 w-7 place-items-center rounded-full bg-nltLime text-[14px] text-[#1d1d1f] transition-transform hover:scale-110">
                ↗
              </Link>
              {/* lime gradient behind the phone */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(58% 52% at 50% 46%, rgba(210,255,0,0.2), transparent 70%)" }}
              />
              <div className="absolute inset-0 grid place-items-center px-2 pb-2 pt-9">
                <div className="relative h-full w-[44%] overflow-hidden rounded-[1.2rem] shadow-[0_18px_50px_-18px_rgba(210,255,0,0.35)]">
                  <ScaledPrototype src="/assets/meituan-im/Repair%20Flow%20Dark.html?solo" naturalW={430} naturalH={1000} fit="contain" reduced={reduced} bg="#141416" />
                </div>
              </div>
            </BentoCard>
          </div>

          {/* ===== col 3 — craft(3) · liner(5) · [motion|skills](2) ===== */}
          <div className="flex min-h-0 flex-[1.2] flex-col gap-2.5">
            <BentoCard label="02 · Craft" surface="dark" light={light} index={5} className="min-h-0 flex-[3]">
              <div className="absolute inset-0">
                <CraftModel reduced={reduced} active onInteract={() => {}} zoom={1.2} />
              </div>
            </BentoCard>

            {/* liner — "right now" feel, blinking dot, no "Now · Liner" label */}
            <BentoCard surface="dark" light={light} index={6} className="min-h-0 flex-[5]">
              <Link href="/work/liner" aria-label="Liner case study" className="absolute right-2.5 top-1.5 z-30 grid h-7 w-7 place-items-center rounded-full bg-nltLime text-[14px] text-[#1d1d1f] transition-transform hover:scale-110">
                ↗
              </Link>
              <div className="absolute left-2.5 top-2.5 z-30 flex items-center gap-1.5 pr-12">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nltLime opacity-80" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nltLime" />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-nltLime">
                  Now · shaping Liner&apos;s new AI collaboration feature
                </span>
              </div>
              <LinerMedia reduced={reduced} />
            </BentoCard>

            {/* skills (motion block removed) */}
            <BentoCard label="Skills" surface={surface} light={light} index={7} className="min-h-0 flex-[2]">
              <SkillsList />
            </BentoCard>
          </div>

          {/* ===== col 4 — journey(5) · audio(5) ===== */}
          <div className="flex min-h-0 flex-[0.85] flex-col gap-2.5">
            <BentoCard label="Journey" surface={surface} light={light} index={9} className="min-h-0 flex-[5]">
              <motion.div
                className="flex h-full flex-col justify-center px-3.5 py-3"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.22, delayChildren: 0.1 } } }}
              >
                {JOURNEY.map((j, idx) => (
                  <motion.div
                    key={j.org}
                    className="group/j flex cursor-default gap-3"
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 130, damping: 18 } } }}
                  >
                    {/* dot + connecting line — one continuous element */}
                    <div className="relative flex flex-col items-center">
                      <span className="z-10 mt-0.5 h-2 w-2 shrink-0 rounded-full bg-nltLime ring-2 ring-current/10 transition-transform duration-300 group-hover/j:scale-150" />
                      {idx < JOURNEY.length - 1 ? (
                        <motion.span
                          className="w-px flex-1 bg-nltLime/45"
                          style={{ originY: 0 }}
                          variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.3, ease: "easeOut" } } }}
                        />
                      ) : null}
                    </div>
                    <div className="pb-7 transition-transform duration-300 group-hover/j:translate-x-1">
                      <p className={`text-[12px] leading-tight transition-colors duration-300 group-hover/j:text-nltLime ${ink}`}>{j.org}</p>
                      <p className={`font-mono text-[8px] uppercase tracking-wider ${inkFaint}`}>{j.note}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </BentoCard>

            {/* audio — vinyl record, plays vinyl.mp3 (click to play/pause) */}
            <BentoCard label="Audio" surface="dark" light={light} index={11} className="min-h-0 flex-[5]">
              <VinylAudio />
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
