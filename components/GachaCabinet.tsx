"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

// ── Types & data ───────────────────────────────────────────────────────────────

type Rarity = "SSR" | "SR" | "R";

type GachaProject = {
  /** Card headline when revealed */
  title: string;
  company: string;
  /** Theme / practice area */
  domain: string;
  rarity: Rarity;
  href: string;
  /** Primary button label on the revealed card (defaults to case study CTA) */
  linkLabel?: string;
};

const PROJECTS: Record<string, GachaProject> = {
  "ai-character": {
    title: "Qwen AI Character",
    company: "Alibaba Cloud",
    domain: "AI product · character & conversational UX",
    rarity: "SSR",
    href: "/work/ai-character",
  },
  "studio-engine": {
    title: "Studio Engine",
    company: "Studio Engine",
    domain: "Design engineering · tools & workflow",
    rarity: "SR",
    href: "/work/studio-engine",
  },
  "meituan-im": {
    title: "Meituan IM",
    company: "Meituan",
    domain: "Enterprise IM · collaboration",
    rarity: "SR",
    href: "/work/meituan-im",
  },
  "apsara-conference": {
    title: "Apsara Conference",
    company: "Alibaba Cloud",
    domain: "Conference keynote · live digital experience",
    rarity: "R",
    href: "/work/apsara-conference",
  },
  ridesharing: {
    title: "Ridesharing Study",
    company: "UX Research",
    domain: "Mobility · user research",
    rarity: "R",
    href: "/work/ridesharing",
  },
  about: {
    title: "About",
    company: "Profile",
    domain: "Personal introduction",
    rarity: "R",
    href: "/about",
    linkLabel: "Visit profile →",
  },
  resume: {
    title: "Résumé",
    company: "CV",
    domain: "Résumé & experience",
    rarity: "R",
    href: "/resume",
    linkLabel: "Open résumé →",
  },
  playground: {
    title: "Playground",
    company: "Experiments",
    domain: "Interactive demos · visual experiments",
    rarity: "R",
    href: "/playground",
    linkLabel: "Open playground →",
  },
};

/**
 * Fixed draw order (repeats every 4 pulls): ① Qwen AI Character → ② Studio Engine or Meituan →
 * ③ Apsara → ④ Résumé or Playground. Branches use a 50/50 pick.
 */
function pickOmikujiSlug(stepInCycle: number): string {
  const i = ((stepInCycle % 4) + 4) % 4;
  if (i === 0) return "ai-character";
  if (i === 1) return Math.random() < 0.5 ? "studio-engine" : "meituan-im";
  if (i === 2) return "apsara-conference";
  return Math.random() < 0.5 ? "resume" : "playground";
}

/** Deterministic PRNG for FX layout so motion paths don’t reshuffle every React render. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Rarity config ──────────────────────────────────────────────────────────────

const RC: Record<
  Rarity,
  {
    pill: string;
    glow: string;
    particles: string[];
    flashBg: string;
    border: string;
    innerGlow: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    pCount: number;
    pRadius: number;
    streak: string;
  }
> = {
  SSR: {
    pill: "Gold",
    glow: "#fbbf24",
    particles: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef9c3", "#fde68a"],
    flashBg:
      "radial-gradient(ellipse 90% 65% at 50% 40%, rgba(238,211,155,0.28) 0%, rgba(238,211,155,0.1) 45%, transparent 78%)",
    border: "rgba(251,191,36,0.6)",
    innerGlow: "rgba(251,191,36,0.2)",
    badgeBorder: "rgba(251,191,36,0.55)",
    badgeBg: "rgba(251,191,36,0.09)",
    badgeText: "#fcd34d",
    pCount: 26,
    pRadius: 88,
    streak: "rgba(251,191,36,0.6)",
  },
  SR: {
    pill: "Silver",
    glow: "#38bdf8",
    particles: ["#38bdf8", "#7dd3fc", "#bae6fd"],
    flashBg:
      "radial-gradient(ellipse 90% 65% at 50% 40%, rgba(214,188,132,0.24) 0%, rgba(214,188,132,0.09) 45%, transparent 78%)",
    border: "rgba(56,189,248,0.55)",
    innerGlow: "rgba(56,189,248,0.16)",
    badgeBorder: "rgba(56,189,248,0.5)",
    badgeBg: "rgba(56,189,248,0.09)",
    badgeText: "#7dd3fc",
    pCount: 16,
    pRadius: 68,
    streak: "rgba(56,189,248,0.55)",
  },
  R: {
    pill: "Bronze",
    glow: "#a8a29e",
    particles: ["#d6d3d1", "#a8a29e", "#78716c"],
    flashBg:
      "radial-gradient(ellipse 90% 65% at 50% 40%, rgba(180,168,145,0.14) 0%, transparent 68%)",
    border: "rgba(168,162,158,0.32)",
    innerGlow: "rgba(168,162,158,0.09)",
    badgeBorder: "rgba(168,162,158,0.38)",
    badgeBg: "rgba(168,162,158,0.07)",
    badgeText: "#d6d3d1",
    pCount: 10,
    pRadius: 52,
    streak: "rgba(200,200,200,0.32)",
  },
};

// ── Background: full-scene plate + light vignette (reads detail in the artwork) ─

const SCENE_BG_URL = "/assets/magic/gacha-scene-bg.png";

/** Intrinsic pixels of gacha-scene-bg.png — keep in sync with file; display caps so we don’t upscale past native resolution. */
const SCENE_IMG_W = 1024;
const SCENE_IMG_H = 723;

/** Omikuji frame art — background for the revealed card only, not the gacha scene. */
const CARD_FRAME_BG_URL = "/assets/magic/gacha-omikuji-frame.png";

/** Fortune slip chrome: black field + gold type (no white). */
const OM_GOLD = {
  bright: "#f2dc9a",
  title: "#ebd489",
  body: "#c9a54a",
  muted: "#9e8438",
  border: "rgba(212, 175, 55, 0.52)",
  ring: "rgba(245, 200, 90, 0.45)",
  badgeBg: "rgba(212, 175, 55, 0.1)",
  glow: "rgba(212, 175, 55, 0.22)",
};

function BackgroundEffect() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none bg-black"
      style={{ zIndex: 0 }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,1,1,0.06)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 84% 78% at 50% 48%, transparent 24%, rgba(0,0,0,0.14) 58%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, transparent 24%, transparent 76%, rgba(0,0,0,0.22) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 14%, transparent 86%, rgba(0,0,0,0.28) 100%)",
        }}
      />
    </div>
  );
}

// ── Rarity flash (full-screen overlay) ────────────────────────────────────────

function RarityFlash({ rarity }: { rarity: Rarity }) {
  const cfg = RC[rarity];
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 500 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.45, 0.2, 0] }}
      transition={{
        duration: rarity === "SSR" ? 0.78 : 0.48,
        times: [0, 0.18, 0.55, 1],
        ease: "easeOut",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: cfg.flashBg }} />
      {rarity === "SSR" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(238,211,155,0.08) 0%, transparent 50%, rgba(238,211,155,0.05) 100%)",
          }}
        />
      )}
    </motion.div>
  );
}

// ── Particle burst ─────────────────────────────────────────────────────────────

function ParticleBurst({ rarity }: { rarity: Rarity }) {
  const cfg = RC[rarity];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 10, overflow: "visible" }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: `1.5px solid ${cfg.glow}`,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ scale: 0, opacity: 0.85 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
      />
      {rarity !== "R" && (
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            border: `1px solid ${cfg.glow}`,
            translateX: "-50%",
            translateY: "-50%",
            opacity: 0.5,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 0.95, ease: "easeOut", delay: 0.22 }}
        />
      )}
      {Array.from({ length: cfg.pCount }, (_, i) => {
        const spread = 360 / cfg.pCount;
        const deg = i * spread + (Math.random() - 0.5) * spread * 0.7;
        const r = cfg.pRadius * (0.55 + Math.random() * 0.9);
        const size = 2 + Math.random() * 5;
        const color = cfg.particles[i % cfg.particles.length];
        const delay = 0.12 + Math.random() * 0.14;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              left: "50%",
              top: "50%",
              marginLeft: -size / 2,
              marginTop: -size / 2,
              background: color,
              boxShadow: `0 0 ${size * 2.5}px ${color}`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos((deg * Math.PI) / 180) * r,
              y: Math.sin((deg * Math.PI) / 180) * r,
              scale: [0, 1.7, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// ── Lamp smoke (draw sequence: smoke → reveal) ───────────────────────────────

function LampSmokePlume({
  lampRect,
  reducedMotion,
  burstSeed,
}: {
  lampRect: DOMRect;
  reducedMotion: boolean;
  burstSeed: number;
}) {
  if (reducedMotion) return null;

  const cx = lampRect.left + lampRect.width / 2;
  const baseY = lampRect.top + lampRect.height * 0.62;
  const rand = mulberry32(burstSeed >>> 0);

  const wisps = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    xOff: (rand() - 0.5) * 46,
    scale: 0.55 + rand() * 0.95,
    delay: i * 0.045,
    dur: 0.85 + rand() * 0.35,
    w: 28 + rand() * 52,
    h: 40 + rand() * 70,
    blur: 10 + rand() * 14,
    rise: 140 + rand() * 90,
  }));

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 27 }}
    >
      {wisps.map((w) => (
        <motion.div
          key={w.id}
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 0.55, 0.42, 0],
            y: [-8 - w.id * 3, -w.rise],
            x: [w.xOff * 0.2, w.xOff * 1.4],
            scale: [0.35 * w.scale, 1.25 * w.scale],
          }}
          transition={{
            duration: w.dur,
            delay: w.delay,
            ease: [0.22, 0.82, 0.22, 1],
          }}
          style={{
            position: "fixed",
            left: cx - w.w / 2,
            top: baseY - w.h / 2,
            width: w.w,
            height: w.h,
            borderRadius: "50%",
            filter: `blur(${w.blur}px)`,
            background:
              "radial-gradient(ellipse at 50% 75%, rgba(245,245,240,0.95) 0%, rgba(210,205,195,0.35) 42%, rgba(160,155,148,0.08) 68%, transparent 82%)",
            mixBlendMode: "screen",
          }}
        />
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.95, ease: "easeOut" }}
        style={{
          position: "fixed",
          left: cx - 70,
          top: baseY - 100,
          width: 140,
          height: 160,
          borderRadius: "50%",
          filter: "blur(28px)",
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(255,252,240,0.5) 0%, rgba(220,215,200,0.12) 55%, transparent 72%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

// ── Project card (shown in center overlay) ─────────────────────────────────────

function ProjectCardFace({
  project,
  onBeforeNavigate,
}: {
  project: GachaProject;
  onBeforeNavigate?: () => void;
}) {
  const cfg = RC[project.rarity];
  const ctaLabel = project.linkLabel ?? "Open case study →";

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        borderRadius: "10px",
        backgroundImage: `url('${CARD_FRAME_BG_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `1px solid ${OM_GOLD.border}`,
        boxShadow: `0 0 36px ${OM_GOLD.glow}, 0 0 72px rgba(0,0,0,0.75)`,
      }}
    >
      {project.rarity === "SSR" && <ParticleBurst rarity={project.rarity} />}

      {/* Type sits directly on the frame art (no scrim). */}
      <div
        className="absolute inset-0 z-[11] flex flex-col items-center justify-center"
        style={{ paddingTop: "20%", paddingBottom: "20%" }}
      >
        <div className="flex h-full min-h-0 w-1/2 max-w-[50%] flex-col items-center justify-center gap-2 overflow-hidden text-center sm:gap-2.5">
          <span
            className="shrink-0 rounded px-2 py-0.5 font-mono text-[7px] font-semibold uppercase tracking-[0.18em] sm:text-[8px] sm:tracking-[0.2em]"
            style={{
              border: `1px solid ${OM_GOLD.border}`,
              background: OM_GOLD.badgeBg,
              color: project.rarity === "SSR" ? OM_GOLD.muted : OM_GOLD.bright,
              boxShadow:
                project.rarity === "SSR"
                  ? `0 0 8px rgba(0,0,0,0.35)`
                  : `0 0 10px ${OM_GOLD.glow}`,
            }}
          >
            {project.rarity}&nbsp;{cfg.pill}
          </span>

          <h2 className="line-clamp-3 w-full max-w-full text-balance font-serif text-[1.02rem] font-semibold leading-snug tracking-tight text-textPrimary sm:text-[1.14rem] md:text-[1.22rem]">
            {project.title}
          </h2>
          <p
            className="line-clamp-2 w-full max-w-full font-mono text-[9px] uppercase leading-tight tracking-[0.22em] sm:text-[10px] sm:tracking-[0.26em]"
            style={{ color: OM_GOLD.muted }}
          >
            {project.company}
          </p>
          <p
            className="line-clamp-4 w-full max-w-full text-[10px] leading-snug sm:text-[11px] sm:leading-relaxed"
            style={{ color: OM_GOLD.body }}
          >
            {project.domain}
          </p>

          <Link
            href={project.href}
            scroll
            onClick={() => onBeforeNavigate?.()}
            className="mt-2 inline-flex w-full max-w-full shrink-0 items-center justify-center px-1 py-1.5 font-sans text-[11px] font-medium leading-snug tracking-[0.02em] text-textPrimary underline decoration-black/[0.22] underline-offset-[6px] transition-colors hover:text-textPrimary hover:decoration-black/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:text-[12px]"
          >
            <span className="line-clamp-2 w-full text-center">{ctaLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Center card overlay ────────────────────────────────────────────────────────

type CenterCard = { project: GachaProject; fromRect: DOMRect };

function CenterCardOverlay({
  card,
  onClose,
  reducedMotion,
  onBeforeNavigate,
}: {
  card: CenterCard;
  onClose: () => void;
  reducedMotion: boolean;
  onBeforeNavigate?: () => void;
}) {
  const { project, fromRect } = card;
  const CARD_W = 300;
  const CARD_H = 420;

  const fromX = fromRect.left + fromRect.width / 2 - window.innerWidth / 2;
  const fromY = fromRect.top + fromRect.height / 2 - window.innerHeight / 2;
  const fromScaleX = fromRect.width / CARD_W;
  const fromScaleY = fromRect.height / CARD_H;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        style={{ width: CARD_W, height: CARD_H }}
        initial={
          reducedMotion
            ? { opacity: 0, scale: 0.92 }
            : {
                x: fromX,
                y: fromY,
                scaleX: fromScaleX,
                scaleY: fromScaleY,
                rotateY: -80,
                opacity: 0,
              }
        }
        animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, rotateY: 0, opacity: 1 }}
        exit={
          reducedMotion
            ? { opacity: 0 }
            : { rotateY: 80, opacity: 0, scale: 0.88 }
        }
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 200, damping: 24, mass: 0.75 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <ProjectCardFace project={project} onBeforeNavigate={onBeforeNavigate} />
      </motion.div>

      {/* Dismiss hint */}
      <motion.p
        className="fixed bottom-8 font-mono text-[10px] uppercase tracking-[0.28em]"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Tap outside to close
      </motion.p>
    </motion.div>
  );
}

const GENIE_LAMP_SRC =
  "/assets/3d/genie_lamp__magic_aladdin-style_golden_lamp.glb";

function GenieLamp({
  reducedMotion,
  onDraw,
  lampRef,
}: {
  reducedMotion: boolean;
  onDraw: () => void;
  lampRef: React.Ref<HTMLDivElement>;
}) {
  const ModelViewer: any = "model-viewer";
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={lampRef}
      className="pointer-events-auto fixed left-1/2 z-[25] -translate-x-1/2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
      style={{
        bottom: "clamp(46px, 10vh, 110px)",
        width: "min(300px, 52vw)",
        height: "min(260px, 40vw)",
      }}
      role="button"
      tabIndex={0}
      aria-label="Draw a fortune slip"
      initial={
        reducedMotion
          ? false
          : { opacity: 0, filter: "brightness(0) contrast(1.05)" }
      }
      animate={{ opacity: 1, filter: "brightness(1) contrast(1)" }}
      transition={{
        opacity: { duration: 2.35, delay: 0.4, ease: [0.16, 1, 0.3, 1] },
        filter: { duration: 2.55, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onDraw}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDraw();
        }
      }}
    >
      <div className="h-full w-full" style={{ transformStyle: "preserve-3d", perspective: 900 }}>
        <ModelViewer
          src={GENIE_LAMP_SRC}
          {...(!reducedMotion && !hovered
            ? { "auto-rotate": "", "rotation-per-second": "8deg" }
            : {})}
          interaction-prompt="none"
          camera-controls={false}
          disable-pan
          disable-tap
          shadow-intensity="0.55"
          exposure="1.05"
          orientation="0deg 0deg 0deg"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "transparent",
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Main gacha view ────────────────────────────────────────────────────────────

export function GachaCabinet({
  onExit,
  onNavigateMain,
}: {
  onExit: () => void;
  onNavigateMain?: () => void;
}) {
  const reduced = !!useReducedMotion();
  const [flash, setFlash] = useState<Rarity | null>(null);
  const [mainSwitchOn, setMainSwitchOn] = useState(false);
  const [centerCard, setCenterCard] = useState<CenterCard | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const lampRef = useRef<HTMLDivElement>(null);
  /** Increments each draw; `pickOmikujiSlug(step)` uses `step % 4` for the rotating sequence. */
  const omikujiStepRef = useRef(0);
  const fxBurstSeedRef = useRef(0);
  const [drawFx, setDrawFx] = useState<null | { rect: DOMRect; burstSeed: number }>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpotlight({ x: window.innerWidth / 2, y: window.innerHeight * 0.5 });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || customElements.get("model-viewer")) return;
    const existing = document.getElementById("model-viewer-loader");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "model-viewer-loader";
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  const drawOmikuji = useCallback(() => {
    const slug = pickOmikujiSlug(omikujiStepRef.current);
    omikujiStepRef.current += 1;
    const project = PROJECTS[slug];
    if (!project) return;

    const rect =
      lampRef.current?.getBoundingClientRect() ??
      new DOMRect(
        typeof window !== "undefined" ? window.innerWidth / 2 - 140 : 0,
        typeof window !== "undefined" ? window.innerHeight * 0.62 : 0,
        280,
        320,
      );

    setDrawCount((n) => n + 1);

    if (reduced) {
      setFlash(project.rarity);
      window.setTimeout(() => setFlash(null), 950);
      window.setTimeout(() => {
        setCardKey((k) => k + 1);
        setCenterCard({ project, fromRect: rect });
      }, 220);
      return;
    }

    fxBurstSeedRef.current += 1;
    const burstSeed = fxBurstSeedRef.current;
    const smokeMs = 780;

    setDrawFx({ rect, burstSeed });

    window.setTimeout(() => {
      setDrawFx(null);
      setFlash(project.rarity);
      window.setTimeout(() => setFlash(null), 950);
      window.setTimeout(() => {
        setCardKey((k) => k + 1);
        setCenterCard({ project, fromRect: rect });
      }, 220);
    }, smokeMs);
  }, [reduced]);

  const handleMainSwitch = useCallback(() => {
    if (mainSwitchOn) return;
    if (reduced) {
      onExit();
      return;
    }
    setMainSwitchOn(true);
    window.setTimeout(() => onExit(), 240);
  }, [mainSwitchOn, onExit, reduced]);

  const handlePointerMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    setSpotlight({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (typeof window === "undefined") return;
    setSpotlight({ x: window.innerWidth / 2, y: window.innerHeight * 0.5 });
  }, []);

  return (
    <>
      <BackgroundEffect />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[15]"
        style={{
          background:
            "radial-gradient(ellipse 85% 50% at 50% 90%, rgba(255,230,180,0.1) 0%, transparent 52%)",
        }}
      />

      {/* Flashlight — follows cursor (warm pool on dark mask) */}
      {!reduced && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 220px at ${spotlight.x}px ${spotlight.y}px, rgba(255,250,230,0.42) 0%, rgba(255,240,205,0.18) 18%, rgba(20,16,12,0.22) 46%, rgba(6,5,4,0.42) 72%, rgba(1,1,1,0.52) 100%)`,
              mixBlendMode: "multiply",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle 170px at ${spotlight.x}px ${spotlight.y}px, rgba(252,238,200,0.32) 0%, rgba(245,220,170,0.12) 32%, rgba(245,220,170,0.03) 55%, transparent 82%)`,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-20"
            style={{
              background: `radial-gradient(circle 75px at ${spotlight.x}px ${spotlight.y}px, rgba(255,253,240,0.34) 0%, rgba(255,253,240,0.06) 55%, transparent 100%)`,
            }}
          />
        </>
      )}

      <AnimatePresence>
        {flash && <RarityFlash key={`flash-${drawCount}`} rarity={flash} />}
      </AnimatePresence>

      {drawFx && (
        <LampSmokePlume
          key={`smoke-${drawFx.burstSeed}`}
          lampRect={drawFx.rect}
          reducedMotion={reduced}
          burstSeed={drawFx.burstSeed}
        />
      )}

      <AnimatePresence>
        {centerCard && (
          <CenterCardOverlay
            key={`card-${cardKey}`}
            card={centerCard}
            onClose={() => setCenterCard(null)}
            reducedMotion={reduced}
            onBeforeNavigate={onNavigateMain}
          />
        )}
      </AnimatePresence>

      <div
        className="relative h-screen w-full overflow-hidden"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <div className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center p-0">
          {/* Native PNG via <img> (no Next image pipeline). Capped at source pixel size so the bitmap is never upscaled and stays sharp. */}
          <img
            src={SCENE_BG_URL}
            width={SCENE_IMG_W}
            height={SCENE_IMG_H}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="h-auto w-auto select-none"
            style={{
              maxWidth: `min(80vw, ${SCENE_IMG_W}px)`,
              maxHeight: "90vh",
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>

        <GenieLamp reducedMotion={reduced} onDraw={drawOmikuji} lampRef={lampRef} />

        <div className="fixed bottom-4 right-5 z-30">
          <button
            type="button"
            role="switch"
            aria-checked={mainSwitchOn}
            aria-busy={mainSwitchOn}
            aria-label="Switch to Main Page"
            onClick={handleMainSwitch}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-transparent bg-black/25 px-2 py-2 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-black/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-wait"
            disabled={mainSwitchOn}
          >
            <span
              className={`relative h-[1.375rem] w-[2.625rem] shrink-0 rounded-full border transition-[border-color,background-color] duration-300 ease-out ${
                mainSwitchOn
                  ? "border-[#c9a030]/55 bg-[#c9a030]/22"
                  : "border-white/30 bg-white/10 group-hover:border-white/45 group-hover:bg-white/15"
              }`}
              aria-hidden
            >
              <span
                className={`pointer-events-none absolute left-[3px] top-1/2 size-[1.125rem] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  mainSwitchOn ? "translate-x-[1.125rem]" : "translate-x-0"
                }`}
              />
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                mainSwitchOn ? "text-white/75" : "text-white/65 group-hover:text-white/85"
              }`}
            >
              Main Page
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
