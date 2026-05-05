"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

// ── Types & data ───────────────────────────────────────────────────────────────

type Rarity = "SSR" | "SR" | "R";

type GachaProject = {
  title: string;
  company: string;
  domain: string;
  rarity: Rarity;
  href: string;
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
    title: "Vibe coding",
    company: "Experiments",
    domain: "Interactive demos · visual experiments",
    rarity: "R",
    href: "/vibe-coding",
    linkLabel: "Open vibe coding →",
  },
};

function pickOmikujiSlug(stepInCycle: number): string {
  const i = ((stepInCycle % 4) + 4) % 4;
  if (i === 0) return "ai-character";
  if (i === 1) return Math.random() < 0.5 ? "studio-engine" : "meituan-im";
  if (i === 2) return "apsara-conference";
  return Math.random() < 0.5 ? "resume" : "playground";
}

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

// ── Scene geometry ─────────────────────────────────────────────────────────────

const SCENE_BG_URL = "/assets/magic/gacha-scene-bg.png";
const SCENE_IMG_W = 1024;
const SCENE_IMG_H = 723;
const SCENE_ASPECT = SCENE_IMG_W / SCENE_IMG_H;

/** Card front frame art. */
const CARD_FRAME_BG_URL = "/assets/3d/cardnew.png";
const CARD_FRAME_IMG_W = 2718;
const CARD_FRAME_IMG_H = 4317;
const CARD_FRAME_ASPECT = CARD_FRAME_IMG_W / CARD_FRAME_IMG_H;

/** Card back art. */
const CARD_BACK_URL = "/assets/3d/card-back.png";
const CARD_BACK_IMG_W = 991;
const CARD_BACK_IMG_H = 1587;

/** Scales the slip to max 78vw × 60vh while preserving photo aspect — no cropping. */
function fitOmikujiCardToViewport(): { w: number; h: number } {
  if (typeof window === "undefined") {
    const w = 220;
    return { w, h: w / CARD_FRAME_ASPECT };
  }
  const maxW = window.innerWidth * 0.78;
  const maxH = window.innerHeight * 0.60;
  let w = maxW;
  let h = w / CARD_FRAME_ASPECT;
  if (h > maxH) {
    h = maxH;
    w = h * CARD_FRAME_ASPECT;
  }
  return { w, h };
}

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

// ── Background ─────────────────────────────────────────────────────────────────

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

// ── Rarity flash ───────────────────────────────────────────────────────────────

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

// ── Lamp smoke — golden 3-D volumetric plume ──────────────────────────────────

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
  // Spout area — upper portion of the lamp model
  const baseY = lampRect.top + lampRect.height * 0.22;
  const rand = mulberry32(burstSeed >>> 0);

  // Three depth layers: back (large, blurry, dim) → mid → front (sharp, bright)
  type WispDef = {
    id: string;
    xOff: number;
    scale: number;
    delay: number;
    dur: number;
    w: number;
    h: number;
    blur: number;
    rise: number;
    rotate: number;
    goldness: number; // 0 = pale white, 1 = rich amber
    peakOpacity: number;
  };

  const layerDefs = [
    { count: 7, blurBase: 26, opBase: 0.30, sizeMin: 55, sizeMax: 110, riseMin: 180, riseMax: 260, gold: 0.18 },
    { count: 9, blurBase: 14, opBase: 0.52, sizeMin: 28, sizeMax: 68,  riseMin: 130, riseMax: 210, gold: 0.55 },
    { count: 7, blurBase: 6,  opBase: 0.72, sizeMin: 14, sizeMax: 36,  riseMin: 90,  riseMax: 160, gold: 0.90 },
  ];

  const wisps: WispDef[] = [];
  layerDefs.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const w = layer.sizeMin + rand() * (layer.sizeMax - layer.sizeMin);
      wisps.push({
        id: `${li}-${i}`,
        xOff: (rand() - 0.5) * 72,
        scale: 0.5 + rand() * 1.0,
        delay: i * 0.042 + li * 0.018,
        dur: 0.88 + rand() * 0.48,
        w,
        h: w * (1.4 + rand() * 0.8),
        blur: layer.blurBase * (0.7 + rand() * 0.65),
        rise: layer.riseMin + rand() * (layer.riseMax - layer.riseMin),
        rotate: (rand() - 0.5) * 55,
        goldness: layer.gold,
        peakOpacity: layer.opBase * (0.75 + rand() * 0.5),
      });
    }
  });

  // Golden sparkle particles
  const sparks = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (rand() - 0.5) * 110,
    y: -(rand() * 150 + 30),
    size: 1.5 + rand() * 3.5,
    delay: rand() * 0.55,
    dur: 0.45 + rand() * 0.42,
    color: rand() > 0.45 ? "#fbbf24" : rand() > 0.5 ? "#fde68a" : "#f59e0b",
  }));

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 27 }}>
      {/* Volumetric wisps */}
      {wisps.map((w) => {
        // Gradient shifts from ivory-white at low goldness to warm amber at high goldness
        const r1 = Math.round(255);
        const g1 = Math.round(245 - w.goldness * 55);
        const b1 = Math.round(235 - w.goldness * 200);
        const r2 = Math.round(240 - w.goldness * 10);
        const g2 = Math.round(200 - w.goldness * 30);
        const b2 = Math.round(180 - w.goldness * 155);
        return (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, w.peakOpacity, w.peakOpacity * 0.65, 0],
              y: [-4, -w.rise],
              x: [w.xOff * 0.12, w.xOff * 1.25],
              scale: [0.3 * w.scale, 1.45 * w.scale],
              rotate: [0, w.rotate],
            }}
            transition={{ duration: w.dur, delay: w.delay, ease: [0.22, 0.82, 0.22, 1] }}
            style={{
              position: "fixed",
              left: cx - w.w / 2,
              top: baseY - w.h / 2,
              width: w.w,
              height: w.h,
              borderRadius: "50%",
              filter: `blur(${w.blur}px)`,
              background: `radial-gradient(ellipse at 42% 62%, rgba(${r1},${g1},${b1},0.92) 0%, rgba(${r2},${g2},${b2},0.38) 38%, rgba(160,120,55,0.10) 65%, transparent 82%)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {/* Golden sparkle particles */}
      {sparks.map((sp) => (
        <motion.div
          key={sp.id}
          initial={{ x: sp.x * 0.15, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: sp.x,
            y: sp.y,
            scale: [0, 1.6, 0],
            opacity: [0, 1, 0.7, 0],
          }}
          transition={{ duration: sp.dur, delay: sp.delay, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: cx - sp.size / 2,
            top: baseY - sp.size / 2,
            width: sp.size,
            height: sp.size,
            borderRadius: "50%",
            background: sp.color,
            boxShadow: `0 0 ${sp.size * 3}px ${sp.color}, 0 0 ${sp.size * 7}px rgba(251,191,36,0.35)`,
          }}
        />
      ))}

      {/* Central amber burst */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.55, 0.28, 0], scale: [0.4, 2.0, 2.8] }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{
          position: "fixed",
          left: cx - 90,
          top: baseY - 90,
          width: 180,
          height: 180,
          borderRadius: "50%",
          filter: "blur(24px)",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.65) 0%, rgba(245,158,11,0.28) 42%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Secondary diffuse halo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.22, 0] }}
        transition={{ duration: 1.05, ease: "easeOut", delay: 0.08 }}
        style={{
          position: "fixed",
          left: cx - 110,
          top: baseY - 130,
          width: 220,
          height: 220,
          borderRadius: "50%",
          filter: "blur(38px)",
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(255,230,160,0.38) 0%, rgba(220,170,70,0.08) 55%, transparent 75%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

// ── Card back face ─────────────────────────────────────────────────────────────

function CardBackFace() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        boxShadow: `0 0 36px ${OM_GOLD.glow}, 0 0 72px rgba(0,0,0,0.75)`,
      }}
    >
      <Image
        src={CARD_BACK_URL}
        width={CARD_BACK_IMG_W}
        height={CARD_BACK_IMG_H}
        alt=""
        draggable={false}
        className="pointer-events-none block h-full w-full select-none"
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />
    </div>
  );
}

// ── Project card front face ────────────────────────────────────────────────────

function ProjectCardFace({
  project,
  onBeforeNavigate,
  cardW = 320,
}: {
  project: GachaProject;
  onBeforeNavigate?: () => void;
  cardW?: number;
}) {
  const cfg = RC[project.rarity];

  // All sizes scale with card width; 320 is the reference baseline.
  const fs = cardW / 320;
  const sz = {
    badge:  Math.max(5.5, Math.min(10,   6.5  * fs)),
    title:  Math.max(12,  Math.min(22,   17   * fs)),
    co:     Math.max(7,   Math.min(12,   9    * fs)),
    domain: Math.max(8.5, Math.min(14,   10.5 * fs)),
    gap:    Math.max(4,   Math.min(14,   8    * fs)),
    pad:    Math.max(2,   Math.min(6,    3    * fs)),
    track:  `${Math.max(0.12, 0.18 * fs)}em`,
  };

  return (
    <Link
      href={project.href}
      scroll
      onClick={() => onBeforeNavigate?.()}
      aria-label={`Open ${project.title}`}
      className="block"
      style={{
        position: "absolute",
        inset: 0,
        border: `1px solid ${OM_GOLD.border}`,
        boxShadow: `0 0 36px ${OM_GOLD.glow}, 0 0 72px rgba(0,0,0,0.75)`,
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <Image
        src={CARD_FRAME_BG_URL}
        width={CARD_FRAME_IMG_W}
        height={CARD_FRAME_IMG_H}
        alt=""
        draggable={false}
        className="pointer-events-none block h-full w-full select-none"
        style={{ objectFit: "cover", objectPosition: "center" }}
        sizes="(max-width: 1024px) 80vw, 440px"
        priority
      />
      {project.rarity === "SSR" && <ParticleBurst rarity={project.rarity} />}

      <div
        className="absolute inset-x-0 z-[11] flex flex-col items-center justify-center"
        style={{ top: "17%", height: "41%", padding: "0 18%" }}
      >
        <div
          className="flex min-h-0 w-full flex-col items-center justify-center overflow-hidden text-center"
          style={{ gap: sz.gap }}
        >
          <span
            className="shrink-0 rounded font-mono font-semibold uppercase"
            style={{
              fontSize: sz.badge,
              letterSpacing: sz.track,
              paddingInline: sz.pad * 2.5,
              paddingBlock: sz.pad,
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

          <h2
            className="line-clamp-3 w-full max-w-full text-balance font-display font-semibold leading-snug tracking-tight text-[#14110d]"
            style={{
              fontSize: sz.title,
              textShadow:
                "0 1px 14px rgba(251,191,36,0.22), 0 0 1px rgba(255,250,235,0.35)",
            }}
          >
            {project.title}
          </h2>

          <p
            className="line-clamp-2 w-full max-w-full font-mono uppercase leading-tight"
            style={{ fontSize: sz.co, letterSpacing: sz.track, color: OM_GOLD.muted }}
          >
            {project.company}
          </p>

          <p
            className="line-clamp-4 w-full max-w-full leading-snug"
            style={{ fontSize: sz.domain, color: OM_GOLD.body }}
          >
            {project.domain}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Center card overlay — opacity-based flip (reliable cross-browser) ─────────

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
  const [cardBox, setCardBox] = useState(() => fitOmikujiCardToViewport());
  const CARD_W = cardBox.w;
  const CARD_H = cardBox.h;

  useLayoutEffect(() => {
    setCardBox(fitOmikujiCardToViewport());
    const onResize = () => setCardBox(fitOmikujiCardToViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // rotY drives both the 3-D perspective rotation and the face-swap opacity.
  // CSS backfaceVisibility is unreliable with Framer Motion's transform system,
  // so we use useTransform to swap opacity at the 90-degree midpoint instead.
  const rotY = useMotionValue(reducedMotion ? 0 : -180);

  // Back face: fully visible until the card passes the 90° edge; then gone.
  const backOpacity  = useTransform(rotY, [-180, -90.1, -90, 0], [1, 1, 0, 0]);
  // Front face: hidden while the back is showing; reveals past the 90° edge.
  const frontOpacity = useTransform(rotY, [-180, -90.1, -90, 0], [0, 0, 1, 1]);

  useEffect(() => {
    if (reducedMotion) return;
    const ctrl = animate(rotY, 0, {
      type: "spring",
      stiffness: 130,
      damping: 18,
      mass: 1.0,
    });
    return ctrl.stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fromX      = fromRect.left + fromRect.width  / 2 - window.innerWidth  / 2;
  const fromY_     = fromRect.top  + fromRect.height / 2 - window.innerHeight / 2;
  const fromScaleX = fromRect.width  / CARD_W;
  const fromScaleY = fromRect.height / CARD_H;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
    >
      {/* Outer div handles position fly-in; inner div carries the 3-D rotation. */}
      <motion.div
        style={{ position: "relative" }}
        initial={
          reducedMotion
            ? { opacity: 0, scale: 0.92 }
            : { x: fromX, y: fromY_, scaleX: fromScaleX, scaleY: fromScaleY, opacity: 1 }
        }
        animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 220, damping: 26, mass: 0.7 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Perspective wrapper — required for realistic depth on the rotateY. */}
        <div style={{ perspective: 1400 }}>
          <motion.div
            style={{
              width: CARD_W,
              height: CARD_H,
              position: "relative",
              rotateY: rotY,
            }}
          >
            {/* Back face */}
            <motion.div
              style={{ position: "absolute", inset: 0, opacity: backOpacity }}
            >
              <CardBackFace />
            </motion.div>

            {/* Front face */}
            <motion.div
              style={{ position: "absolute", inset: 0, opacity: frontOpacity }}
            >
              <ProjectCardFace
                project={project}
                onBeforeNavigate={onBeforeNavigate}
                cardW={CARD_W}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        className="fixed bottom-8 font-mono text-[10px] uppercase tracking-[0.28em]"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        Tap outside to close
      </motion.p>
    </motion.div>
  );
}

// ── Genie lamp — sits on cabinet surface ──────────────────────────────────────

const GENIE_LAMP_SRC =
  "/assets/3d/genie_lamp__magic_aladdin-style_golden_lamp.glb";

/** ElevenLabs voice line — plays once when the lamp is hovered (gacha view). */
const LAMP_HOVER_AUDIO_SRC = "/assets/audio/gacha-lamp-hover.mp3";

const LAMP_BOTTOM_CSS = "calc(clamp(80px, 10vh, 160px) + 5vh)";

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
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Hover line plays at most twice per gacha session (refund on failed `play()`). */
  const lampHoverPlaysRef = useRef(0);

  useEffect(() => {
    const el = new Audio(LAMP_HOVER_AUDIO_SRC);
    el.preload = "auto";
    hoverAudioRef.current = el;
    return () => {
      el.pause();
      hoverAudioRef.current = null;
    };
  }, []);

  return (
    <motion.div
      ref={lampRef}
      className="pointer-events-auto fixed left-1/2 z-[25] -translate-x-1/2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
      style={{
        bottom: LAMP_BOTTOM_CSS,
        width:  "clamp(220px, min(48vw, calc(40vh * 1.15)), 520px)",
        height: "clamp(185px, min(40vw, 36vh), 460px)",
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
        filter:  { duration: 2.55, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      onPointerEnter={() => {
        setHovered(true);
        if (lampHoverPlaysRef.current >= 2) return;
        const a = hoverAudioRef.current;
        if (!a) return;
        lampHoverPlaysRef.current += 1;
        a.currentTime = 0;
        void a.play().catch(() => {
          lampHoverPlaysRef.current -= 1;
        });
      }}
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
  embed = false,
}: {
  onExit: () => void;
  onNavigateMain?: () => void;
  embed?: boolean;
}) {
  const reduced = !!useReducedMotion();
  const [flash, setFlash] = useState<Rarity | null>(null);
  const [mainSwitchOn, setMainSwitchOn] = useState(false);
  const [centerCard, setCenterCard] = useState<CenterCard | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const lampRef = useRef<HTMLDivElement>(null);
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
        typeof window !== "undefined" ? window.innerWidth / 2 - 90 : 0,
        typeof window !== "undefined" ? window.innerHeight * 0.38 : 0,
        180,
        160,
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
    const smokeMs = 800;

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

      {/* Flashlight — follows cursor */}
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
              maxWidth: `min(96vw, calc(88vh * ${SCENE_ASPECT}))`,
              maxHeight: `min(88vh, calc(96vw / ${SCENE_ASPECT}))`,
              objectFit: "contain",
              objectPosition: "center",
            }}
          />
        </div>

        <GenieLamp reducedMotion={reduced} onDraw={drawOmikuji} lampRef={lampRef} />

        {!embed && <div className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2">
          <button
            type="button"
            role="switch"
            aria-checked={mainSwitchOn}
            aria-busy={mainSwitchOn}
            aria-label="Switch to Main Page"
            onClick={handleMainSwitch}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(212,175,55,0.52)] px-2.5 py-2 backdrop-blur-md shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_8px_28px_rgba(0,0,0,0.55),0_0_24px_rgba(212,175,55,0.22)] transition-[border-color,box-shadow] hover:border-[rgba(245,200,90,0.45)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_10px_32px_rgba(0,0,0,0.5),0_0_32px_rgba(212,175,55,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(245,200,90,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050403] disabled:cursor-wait"
            style={{
              background: "linear-gradient(160deg, rgba(12,10,8,0.92) 0%, rgba(5,4,3,0.96) 100%)",
            }}
            disabled={mainSwitchOn}
          >
            <span
              className={`relative h-[1.375rem] w-[2.625rem] shrink-0 rounded-full border transition-[border-color,background-color,box-shadow] duration-300 ease-out group-hover:shadow-[inset_0_0_0_1px_rgba(245,200,90,0.12)] ${
                mainSwitchOn ? "" : "group-hover:border-[rgba(245,200,90,0.38)]"
              }`}
              style={
                mainSwitchOn
                  ? {
                      borderColor: OM_GOLD.ring,
                      background:
                        "linear-gradient(180deg, rgba(212,175,55,0.28) 0%, rgba(30,24,14,0.85) 100%)",
                      boxShadow: `inset 0 0 12px ${OM_GOLD.glow}, 0 0 14px ${OM_GOLD.glow}`,
                    }
                  : {
                      borderColor: OM_GOLD.border,
                      background: "linear-gradient(180deg, rgba(18,15,10,0.95) 0%, rgba(8,7,5,0.98) 100%)",
                    }
              }
              aria-hidden
            >
              <span
                className={`pointer-events-none absolute left-[3px] top-1/2 size-[1.125rem] -translate-y-1/2 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  mainSwitchOn ? "translate-x-[1.125rem]" : "translate-x-0"
                }`}
                style={{
                  background: `linear-gradient(165deg, ${OM_GOLD.bright} 0%, ${OM_GOLD.title} 42%, ${OM_GOLD.body} 100%)`,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,250,220,0.35)",
                  border: "1px solid rgba(60,48,20,0.35)",
                }}
              />
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                mainSwitchOn ? "" : "text-[#c9a54a] group-hover:text-[#f2dc9a]"
              }`}
              style={mainSwitchOn ? { color: OM_GOLD.muted } : undefined}
            >
              Main Page
            </span>
          </button>
        </div>}
      </div>
    </>
  );
}
