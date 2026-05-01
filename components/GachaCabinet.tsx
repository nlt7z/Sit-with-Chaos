"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

// ── Types & data ───────────────────────────────────────────────────────────────

type Rarity = "SSR" | "SR" | "R";

type GachaProject = {
  company: string;
  rarity: Rarity;
  href: string;
  media: { src: string; type: "image" | "video" };
  linkLabel?: string;
};

const PROJECTS: Record<string, GachaProject> = {
  "ai-character": {
    company: "Alibaba Cloud",
    rarity: "SSR",
    href: "/work/ai-character",
    media: { src: "/assets/ai-character/figma.mp4", type: "video" },
  },
  "studio-engine": {
    company: "Studio Engine",
    rarity: "SR",
    href: "/work/studio-engine",
    media: { src: "/assets/work/vp-genie.jpg", type: "image" },
  },
  "meituan-im": {
    company: "Meituan",
    rarity: "SR",
    href: "/work/meituan-im",
    media: { src: "/assets/work/meituan.mp4", type: "video" },
  },
  "apsara-conference": {
    company: "Alibaba Cloud",
    rarity: "R",
    href: "/work/apsara-conference",
    media: { src: "/assets/work/apsara.mp4", type: "video" },
  },
  ridesharing: {
    company: "UX Research",
    rarity: "R",
    href: "/work/ridesharing",
    media: { src: "/assets/work/av-ridesharing.jpg", type: "image" },
  },
  about: {
    company: "About Me",
    rarity: "R",
    href: "/about",
    media: { src: "/assets/about/profile.jpg", type: "image" },
    linkLabel: "Visit →",
  },
  resume: {
    company: "Résumé",
    rarity: "R",
    href: "/resume",
    media: { src: "/assets/about/profile.jpg", type: "image" },
    linkLabel: "Open →",
  },
};

const RANDOM_POOL: string[] = [
  "studio-engine",
  "meituan-im",
  "apsara-conference",
  "ridesharing",
  "about",
  "resume",
  "studio-engine",
  "meituan-im",
  "ridesharing",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DRAWER_HOVER_CURSOR = "none";

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
    pill: "金",
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
    pill: "銀",
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
    pill: "銅",
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

// ── Background ─────────────────────────────────────────────────────────────────

function BackgroundEffect() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(145deg, #070605 0%, #0d0b09 45%, #050403 100%)",
        }}
      />
      {/* Cinematic base falloff */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 120% 78% at 50% 44%, rgba(255,236,196,0.07) 0%, rgba(30,23,16,0.44) 52%, rgba(8,6,5,0.86) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(191,156,99,0.08) 0%, rgba(22,18,13,0.36) 56%, rgba(6,5,4,0.76) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.36) 20%, transparent 34%, transparent 66%, rgba(0,0,0,0.36) 80%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.52) 74%, rgba(0,0,0,0.82) 100%)",
        }}
      />
      {/* Warm amber haze */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -35, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(224,196,138,0.1) 0%, transparent 68%)",
          top: -250,
          left: -200,
          filter: "blur(48px)",
        }}
      />
      {/* Gold haze */}
      <motion.div
        animate={{ x: [0, -45, 0], y: [0, 45, 0] }}
        transition={{
          duration: 27,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(205,175,114,0.08) 0%, transparent 68%)",
          bottom: -180,
          right: -180,
          filter: "blur(60px)",
        }}
      />
      {/* Brass accent */}
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(170,142,91,0.08) 0%, transparent 68%)",
          top: -60,
          right: -60,
          filter: "blur(50px)",
        }}
      />
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(230,212,174,0.032) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          mixBlendMode: "soft-light",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: "-8%",
          background:
            "radial-gradient(ellipse at 30% 72%, rgba(235,214,170,0.08) 0%, transparent 42%), radial-gradient(ellipse at 74% 26%, rgba(218,187,132,0.06) 0%, transparent 38%)",
          filter: "blur(18px)",
        }}
        animate={{ x: [0, 12, -8, 0], y: [0, -10, 6, 0], opacity: [0.75, 1, 0.8, 0.75] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft side rim lights for depth */}
      <div
        style={{
          position: "absolute",
          left: "-16%",
          top: "8%",
          width: "36%",
          height: "84%",
          background: "radial-gradient(ellipse at left center, rgba(248,225,180,0.12) 0%, transparent 72%)",
          filter: "blur(22px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-16%",
          top: "8%",
          width: "36%",
          height: "84%",
          background: "radial-gradient(ellipse at right center, rgba(214,187,137,0.1) 0%, transparent 72%)",
          filter: "blur(22px)",
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
      {/* Expanding ring */}
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
      {/* Second ring for SSR/SR */}
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
      {/* Dots */}
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

function EyeSigil({ irisX, irisY }: { irisX: number; irisY: number }) {
  return (
    <motion.div
      className="mb-8 flex items-center justify-center"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="h-[138px] w-[138px] md:h-[152px] md:w-[152px]"
        aria-hidden
        animate={{ rotate: [0, 1.6, 0, -1.4, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 16px 24px rgba(0,0,0,0.55))" }}
      >
        <defs>
          <radialGradient id="gachaIrisCore" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(255,214,140,0)" />
            <stop offset="72%" stopColor="rgba(205,142,62,0.45)" />
            <stop offset="100%" stopColor="rgba(6,4,3,0.92)" />
          </radialGradient>
          <radialGradient id="gachaOuterGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255,225,168,0.18)" />
            <stop offset="72%" stopColor="rgba(255,225,168,0.04)" />
            <stop offset="100%" stopColor="rgba(255,225,168,0)" />
          </radialGradient>
          <radialGradient id="gachaSclera" cx="46%" cy="40%" r="62%">
            <stop offset="0%" stopColor="rgba(255,244,222,0.9)" />
            <stop offset="55%" stopColor="rgba(224,193,143,0.4)" />
            <stop offset="100%" stopColor="rgba(34,21,12,0.5)" />
          </radialGradient>
          <radialGradient id="gachaIrisRing" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(255,209,126,0.12)" />
            <stop offset="68%" stopColor="rgba(173,100,35,0.38)" />
            <stop offset="100%" stopColor="rgba(24,14,8,0.92)" />
          </radialGradient>
          <linearGradient id="gachaLidTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <linearGradient id="gachaLidBottom" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="25%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(203,157,88,0.58)" strokeWidth="0.55" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="81" fill="none" stroke="rgba(203,157,88,0.28)" strokeWidth="0.7" />
        <circle cx="100" cy="100" r="70" fill="url(#gachaOuterGlow)" />

        <path
          d="M 20 100 Q 100 30 180 100 Q 100 170 20 100 Z"
          fill="rgba(7,5,4,0.94)"
          stroke="rgba(238,215,172,0.76)"
          strokeWidth="1"
        />
        <path
          d="M 26 100 Q 100 38 174 100 Q 100 162 26 100 Z"
          fill="url(#gachaSclera)"
          opacity="0.9"
        />
        <ellipse cx="100" cy="84" rx="64" ry="18" fill="url(#gachaLidTop)" />
        <ellipse cx="100" cy="116" rx="64" ry="16" fill="url(#gachaLidBottom)" />

        <g transform={`translate(${irisX} ${irisY})`}>
          <circle cx="100" cy="100" r="33" fill="url(#gachaIrisRing)" />
          <circle cx="100" cy="100" r="28" fill="rgba(203,132,51,0.65)" />
          <circle cx="100" cy="100" r="28" fill="url(#gachaIrisCore)" />
          <circle cx="100" cy="100" r="18" fill="rgba(0,0,0,0.26)" />
          <circle cx="100" cy="100" r="14" fill="rgba(9,6,4,0.96)" />
          <circle cx="104.5" cy="95.5" r="3.6" fill="rgba(255,236,198,0.95)" />
          <ellipse cx="93.5" cy="91.5" rx="10" ry="5" fill="rgba(255,240,214,0.16)" />
          <circle cx="98" cy="108" r="1.6" fill="rgba(255,215,143,0.8)" />
        </g>

        <g stroke="rgba(203,157,88,0.65)" strokeWidth="0.7">
          <line x1="100" y1="0" x2="100" y2="16" />
          <line x1="100" y1="184" x2="100" y2="200" />
          <line x1="0" y1="100" x2="16" y2="100" />
          <line x1="184" y1="100" x2="200" y2="100" />
          <line x1="30" y1="30" x2="40" y2="40" />
          <line x1="170" y1="30" x2="160" y2="40" />
          <line x1="30" y1="170" x2="40" y2="160" />
          <line x1="170" y1="170" x2="160" y2="160" />
        </g>
      </motion.svg>
    </motion.div>
  );
}

function CenterDrawerSigil() {
  const orbitDots = Array.from({ length: 12 }, (_, i) => i);
  const innerStars = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
    >
      <motion.div
        className="relative h-[70%] w-[70%] opacity-85"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 300 300" className="h-full w-full">
          <defs>
            <radialGradient id="zodiacRingGlow" cx="50%" cy="50%" r="58%">
              <stop offset="0%" stopColor="rgba(212,171,100,0.16)" />
              <stop offset="55%" stopColor="rgba(212,171,100,0.06)" />
              <stop offset="100%" stopColor="rgba(212,171,100,0)" />
            </radialGradient>
          </defs>

          <circle cx="150" cy="150" r="126" fill="url(#zodiacRingGlow)" />
          <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(214,176,109,0.36)" strokeWidth="1" strokeDasharray="2 5" />
          <circle cx="150" cy="150" r="96" fill="none" stroke="rgba(214,176,109,0.3)" strokeWidth="0.9" />
          <circle cx="150" cy="150" r="62" fill="none" stroke="rgba(214,176,109,0.24)" strokeWidth="0.75" />

          {orbitDots.map((i) => {
            const angle = ((Math.PI * 2) / orbitDots.length) * i - Math.PI / 2;
            const x = 150 + Math.cos(angle) * 108;
            const y = 150 + Math.sin(angle) * 108;
            return (
              <circle
                key={`orbit-dot-${i}`}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 4 : 2.2}
                fill={i % 3 === 0 ? "rgba(241,225,196,0.72)" : "rgba(239,214,167,0.45)"}
              />
            );
          })}

          {Array.from({ length: 24 }).map((_, i) => {
            const angle = ((Math.PI * 2) / 24) * i - Math.PI / 2;
            const outerX = 150 + Math.cos(angle) * 126;
            const outerY = 150 + Math.sin(angle) * 126;
            const innerX = 150 + Math.cos(angle) * 116;
            const innerY = 150 + Math.sin(angle) * 116;
            return (
              <line
                key={`tick-${i}`}
                x1={outerX}
                y1={outerY}
                x2={innerX}
                y2={innerY}
                stroke="rgba(239,214,167,0.42)"
                strokeWidth={i % 2 === 0 ? 0.9 : 0.55}
              />
            );
          })}

          {innerStars.map((i) => {
            const angle = ((Math.PI * 2) / innerStars.length) * i - Math.PI / 2;
            const radius = i % 2 === 0 ? 79 : 69;
            const x = 150 + Math.cos(angle) * radius;
            const y = 150 + Math.sin(angle) * radius;
            return (
              <circle
                key={`inner-star-${i}`}
                cx={x}
                cy={y}
                r={i % 4 === 0 ? 1.7 : 1}
                fill="rgba(245,230,198,0.52)"
              />
            );
          })}

          <circle cx="150" cy="88" r="5.8" fill="rgba(236,218,181,0.75)" />
          <circle cx="150" cy="88" r="9.4" fill="none" stroke="rgba(236,218,181,0.32)" strokeWidth="0.8" />
          <circle cx="197" cy="150" r="4.6" fill="rgba(227,201,151,0.68)" />
          <circle cx="197" cy="150" r="8.2" fill="none" stroke="rgba(227,201,151,0.3)" strokeWidth="0.7" />
          <circle cx="112" cy="186" r="3.8" fill="rgba(220,191,137,0.58)" />

          <circle cx="150" cy="150" r="8" fill="rgba(239,214,167,0.48)" />
        </svg>
      </motion.div>
    </div>
  );
}

function MysticFrameDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[12]">
      <div className="absolute inset-5 rounded-[2px] border border-[#b6aa90]/20" />
      <div className="absolute inset-8 rounded-[2px] border border-[#8f8570]/14" />

      <div className="absolute left-7 top-7 h-9 w-9 border-l border-t border-[#b6aa90]/28" />
      <div className="absolute right-7 top-7 h-9 w-9 border-r border-t border-[#b6aa90]/28" />
      <div className="absolute bottom-7 left-7 h-9 w-9 border-b border-l border-[#b6aa90]/28" />
      <div className="absolute bottom-7 right-7 h-9 w-9 border-b border-r border-[#b6aa90]/28" />

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#bba98a]/34">
          —   ·   —   ·   —   ·   —
        </p>
      </div>
    </div>
  );
}

function RelicModel({
  src,
  size,
  delay,
  yOffset = 0,
  idx,
  hoveredModelIndex,
  setHoveredModelIndex,
}: {
  src: string;
  size: number;
  delay: number;
  yOffset?: number;
  idx: number;
  hoveredModelIndex: number | null;
  setHoveredModelIndex: (value: number | null) => void;
}) {
  const ModelViewer: any = "model-viewer";
  return (
    <motion.div
      className="relative shrink-0"
      onMouseEnter={() => setHoveredModelIndex(idx)}
      onMouseLeave={() => setHoveredModelIndex(null)}
      style={{
        width: size,
        height: size,
        transform: `translateY(${yOffset}px)`,
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <ModelViewer
        src={src}
        camera-controls
        auto-rotate={hoveredModelIndex === idx}
        auto-rotate-delay={0}
        rotation-per-second="4deg"
        interaction-prompt="none"
        exposure="0.95"
        shadow-intensity="1.4"
        shadow-softness="0.9"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
          borderRadius: 0,
          opacity: 0.97,
        }}
      />
    </motion.div>
  );
}

function CandleCursor({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  const ModelViewer: any = "model-viewer";
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[70] transition-opacity duration-150"
      style={{
        left: x + 14,
        top: y + 10,
        width: 90,
        height: 90,
        opacity: visible ? 1 : 0,
        transform: "translate(-50%, -50%) rotate(16deg)",
        filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.55))",
      }}
    >
      <ModelViewer
        src="/assets/3d/copper_candlestick.glb"
        auto-rotate
        rotation-per-second="12deg"
        interaction-prompt="none"
        camera-controls={false}
        disable-pan
        disable-tap
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "transparent",
        }}
      />
    </div>
  );
}

// ── Project card (back face after reveal) ─────────────────────────────────────

function ProjectCardFace({
  project,
  onBeforeNavigate,
}: {
  project: GachaProject;
  onBeforeNavigate?: () => void;
}) {
  const cfg = RC[project.rarity];
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{
        borderRadius: "7px",
        background:
          "linear-gradient(155deg, #111428 0%, #0d1126 55%, #09101f 100%)",
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 28px ${cfg.innerGlow}, inset 0 0 30px rgba(0,0,0,0.55)`,
        position: "relative",
      }}
    >
      <ParticleBurst rarity={project.rarity} />

      {/* Shine streak */}
      {project.rarity !== "R" && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            zIndex: 5,
            background: `linear-gradient(108deg, transparent 28%, ${cfg.streak} 50%, transparent 72%)`,
          }}
          initial={{ x: "-160%" }}
          animate={{ x: "160%" }}
          transition={{ duration: 0.7, delay: 0.08, ease: "easeInOut" }}
        />
      )}

      {/* Media */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {project.media.type === "video" ? (
          <video
            src={project.media.src}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={project.media.src}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 520px) 160px, 30vw"
          />
        )}
        {/* Bottom vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 55%, rgba(9,13,31,0.65) 100%)",
          }}
        />
        {/* Initial reveal glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0.75 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.28 }}
          style={{
            background: `linear-gradient(135deg, ${cfg.innerGlow} 0%, transparent 65%)`,
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-none flex-col gap-1 px-2 py-1.5 md:px-2.5 md:py-2">
        <span
          className="self-start rounded px-1.5 py-px font-mono text-[7px] font-semibold uppercase tracking-[0.18em]"
          style={{
            border: `1px solid ${cfg.badgeBorder}`,
            background: cfg.badgeBg,
            color: cfg.badgeText,
            boxShadow: `0 0 10px ${cfg.innerGlow}`,
          }}
        >
          {project.rarity}&nbsp;{cfg.pill}
        </span>
        <div className="flex items-baseline justify-between gap-1">
          <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-white/40">
            {project.company}
          </span>
          <Link
            href={project.href}
            onClick={onBeforeNavigate}
            className="shrink-0 font-mono text-[7px] uppercase tracking-[0.18em] transition-opacity hover:opacity-100"
            style={{ color: cfg.badgeText, opacity: 0.65 }}
          >
            {project.linkLabel ?? "View →"}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Single drawer box ──────────────────────────────────────────────────────────

type BoxPhase = "closed" | "open";
type BoxSlot = { id: number; projectSlug: string; phase: BoxPhase };

function DrawerBox({
  projectSlug,
  index,
  phase,
  onOpen,
  onBeforeNavigate,
  reducedMotion,
}: {
  projectSlug: string;
  index: number;
  phase: BoxPhase;
  onOpen: () => void;
  onBeforeNavigate?: () => void;
  reducedMotion: boolean;
}) {
  const project = PROJECTS[projectSlug];
  const isCenterDrawer = index === 4;
  if (!project) return null;

  return (
    <div className="relative" style={{ aspectRatio: "1" }}>
      {/* Revealed card */}
      <AnimatePresence>
        {phase === "open" && (
          <motion.div
            key="card"
            className="absolute inset-0"
            initial={
              reducedMotion ? { opacity: 1 } : { scale: 0.84, opacity: 0, y: 10 }
            }
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={
              reducedMotion
                ? { duration: 0.1 }
                : {
                    type: "spring",
                    stiffness: 310,
                    damping: 22,
                    mass: 0.6,
                    delay: 0.2,
                  }
            }
          >
            <ProjectCardFace project={project} onBeforeNavigate={onBeforeNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystery box (closed) */}
      <AnimatePresence>
        {phase === "closed" && (
          <motion.button
            key="closed"
            type="button"
            onClick={onOpen}
            aria-label={`Open drawer ${index + 1}`}
            className="absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-amber-300/40"
            style={{
              borderRadius: "7px",
              background:
                "linear-gradient(155deg, #7a5d2f 0%, #5f4723 55%, #3f2f17 100%)",
              border: "1px solid rgba(247,225,176,0.38)",
              boxShadow:
                "0 12px 36px rgba(0,0,0,0.74), 0 2px 10px rgba(0,0,0,0.52), 0 0 18px rgba(234,206,144,0.16), inset 0 1px 0 rgba(255,246,221,0.2), inset 0 -1px 0 rgba(52,35,14,0.58)",
              cursor: DRAWER_HOVER_CURSOR,
              overflow: "hidden",
            }}
            initial={{ y: 0, opacity: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    y: [0, -6, "118%"],
                    opacity: [1, 1, 0.6],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.1, 1],
                      ease: ["easeOut", [0.55, 0, 0.78, 0.45]] as never,
                    },
                  }
            }
            whileHover={{
              boxShadow:
                "0 18px 52px rgba(0,0,0,0.82), 0 0 36px rgba(245,220,170,0.34), inset 0 1px 0 rgba(255,250,234,0.24)",
              scale: 1.03,
              transition: { duration: 0.18 },
            }}
            whileTap={{ scale: 0.965, transition: { duration: 0.08 } }}
          >
            {isCenterDrawer && <CenterDrawerSigil />}
            {/* Glow pulse */}
            <motion.div
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.18, 0.42, 0.18],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.18,
              }}
              style={{
                position: "absolute",
                width: "55%",
                height: "55%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(224,196,138,0.38) 0%, transparent 70%)",
              }}
            />

            {/* Question mark */}
            <motion.span
              animate={{ opacity: [0.14, 0.26, 0.14] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.14,
              }}
              style={{
                fontSize: "26px",
                color: "rgba(255,255,255,0.18)",
                userSelect: "none",
                fontFamily: "serif",
                position: "relative",
                zIndex: 2,
              }}
            >
              ？
            </motion.span>

            {/* Box number */}
            <span
              className="absolute bottom-2 right-2.5 font-mono tracking-[0.22em]"
              style={{ fontSize: "6px", color: "rgba(255,255,255,0.14)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cabinet ────────────────────────────────────────────────────────────────────

export function GachaCabinet({
  onExit,
  onNavigateMain,
}: {
  onExit: () => void;
  onNavigateMain?: () => void;
}) {
  const reduced = !!useReducedMotion();
  const [slots, setSlots] = useState<BoxSlot[]>([]);
  const [shuffleEpoch, setShuffleEpoch] = useState(0);
  const [flash, setFlash] = useState<Rarity | null>(null);
  const [mainSwitchOn, setMainSwitchOn] = useState(false);
  const [hoveredModelIndex, setHoveredModelIndex] = useState<number | null>(null);
  const [spotlight, setSpotlight] = useState({ active: true, x: 272, y: 272 });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [tableauScale, setTableauScale] = useState(1);
  const eyeRef = useRef<HTMLDivElement>(null);
  const [irisOffset, setIrisOffset] = useState({ x: 0, y: 0 });

  const initSlots = useCallback(() => {
    setShuffleEpoch((n) => n + 1);
    setSlots(
      shuffle(RANDOM_POOL).map((slug, i) => ({
        id: i,
        projectSlug: slug,
        phase: "closed" as BoxPhase,
      })),
    );
  }, []);

  useEffect(() => {
    initSlots();
  }, [initSlots]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpotlight({
      active: true,
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.5,
    });
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const baseWidth = 2200;
    const updateScale = () => {
      const next = Math.min(1, (window.innerWidth * 0.96) / baseWidth);
      setTableauScale(next);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleMainSwitch = useCallback(() => {
    if (mainSwitchOn) return;
    if (reduced) {
      onExit();
      return;
    }
    setMainSwitchOn(true);
    window.setTimeout(() => {
      onExit();
    }, 240);
  }, [mainSwitchOn, onExit, reduced]);

  const handleCabinetPointerMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    setCursorVisible(true);
    setSpotlight({
      active: true,
      x,
      y,
    });
    const eyeRect = eyeRef.current?.getBoundingClientRect();
    if (!eyeRect) return;
    const eyeCx = eyeRect.left + eyeRect.width / 2;
    const eyeCy = eyeRect.top + eyeRect.height / 2;
    const dx = x - eyeCx;
    const dy = y - eyeCy;
    const dist = Math.min(Math.hypot(dx, dy), 240);
    const angle = Math.atan2(dy, dx);
    setIrisOffset({
      x: Math.cos(angle) * (dist / 240) * 11,
      y: Math.sin(angle) * (dist / 240) * 7.2,
    });
  }, []);

  const handleCabinetPointerLeave = useCallback(() => {
    setCursorVisible(false);
    setSpotlight((prev) => ({
      ...prev,
      active: true,
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.5,
    }));
    setIrisOffset({ x: 0, y: 0 });
  }, []);

  const openSlot = useCallback(
    (id: number) => {
      setSlots((prev) => {
        const isFirstDraw = prev.every((s) => s.phase === "closed");
        const targetSlug = isFirstDraw
          ? "ai-character"
          : (prev.find((s) => s.id === id)?.projectSlug ?? "");
        const rarity = PROJECTS[targetSlug]?.rarity ?? "R";
        setFlash(rarity);
        setTimeout(() => setFlash(null), 950);
        return prev.map((s) =>
          s.id === id
            ? { ...s, phase: "open", projectSlug: targetSlug }
            : s,
        );
      });
    },
    [],
  );

  const openedCount = slots.filter((s) => s.phase === "open").length;
  const allOpen = slots.length === 9 && openedCount === 9;

  return (
    <>
      <BackgroundEffect />
      <CandleCursor x={spotlight.x} y={spotlight.y} visible={cursorVisible} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: spotlight.active ? 1 : 0.95,
          background: `radial-gradient(circle 210px at ${spotlight.x}px ${spotlight.y}px, rgba(255,247,226,0.44) 0%, rgba(255,238,199,0.24) 16%, rgba(24,20,15,0.5) 44%, rgba(7,6,5,0.76) 74%, rgba(1,1,1,0.88) 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: spotlight.active ? 1 : 0.45,
          background: `radial-gradient(circle 165px at ${spotlight.x}px ${spotlight.y}px, rgba(245,226,188,0.34) 0%, rgba(231,202,150,0.16) 30%, rgba(231,202,150,0.05) 50%, transparent 76%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: spotlight.active ? 0.9 : 0.35,
          background: `radial-gradient(circle 72px at ${spotlight.x}px ${spotlight.y}px, rgba(255,252,238,0.34) 0%, rgba(255,252,238,0.08) 55%, transparent 100%)`,
        }}
      />

      <div
        className="relative flex h-screen w-full cursor-none flex-col items-center overflow-hidden py-5"
        onMouseMove={handleCabinetPointerMove}
        onMouseLeave={handleCabinetPointerLeave}
      >
        <MysticFrameDecor />

        {/* Flash — rendered outside the 3D-transformed cabinet so position:fixed works */}
        <AnimatePresence>
          {flash && <RarityFlash key={`flash-${shuffleEpoch}-${openedCount}`} rarity={flash} />}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          ref={eyeRef}
          className="relative z-30 mb-2 flex flex-col items-center gap-2"
          initial={reduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <EyeSigil irisX={irisOffset.x} irisY={irisOffset.y} />
        </motion.div>

        <div className="relative z-10 flex w-full flex-1 items-center justify-center">
          <div
            className="mx-auto flex w-[2200px] items-end justify-center gap-3"
            style={{ transform: `scale(${tableauScale})`, transformOrigin: "center top" }}
          >
            <RelicModel
              src="/assets/3d/deer.glb"
              size={300}
              delay={0}
              idx={0}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
            <RelicModel
              src="/assets/3d/assamese_traditional_bowl.glb"
              size={170}
              delay={0.15}
              yOffset={42}
              idx={1}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
            <RelicModel
              src="/assets/3d/explorers_globe.glb"
              size={160}
              delay={0.2}
              idx={2}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
            {/* Cabinet */}
            <div className="relative shrink-0">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 z-0 rounded-[24px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,238,206,0.42) 0%, rgba(240,216,164,0.16) 38%, transparent 74%)",
                filter: "blur(16px)",
              }}
            />
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 36, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: "min(56vw, 700px)",
                minWidth: "520px",
                position: "relative",
                borderRadius: "14px",
                background:
                  "linear-gradient(155deg, rgba(132,100,54,0.97) 0%, rgba(102,76,40,0.98) 56%, rgba(66,49,25,0.99) 100%)",
                border: "1px solid rgba(251,233,190,0.42)",
                padding: "16px",
                boxShadow: [
                  "0 95px 140px rgba(0,0,0,0.78)",
                  "0 44px 72px rgba(0,0,0,0.62)",
                  "0 0 0 1px rgba(238,207,147,0.32)",
                  "0 0 34px rgba(248,220,163,0.24)",
                  "inset 0 1px 0 rgba(255,248,226,0.42)",
                  "inset 0 -3px 0 rgba(54,38,17,0.62)",
                ].join(", "),
                backdropFilter: "blur(24px)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[2px] rounded-[12px]"
                style={{
                  background:
                    "linear-gradient(165deg, rgba(255,244,214,0.12) 0%, transparent 18%, transparent 72%, rgba(0,0,0,0.28) 100%)",
                }}
              />
              {/* Top bevel */}
              <div
                aria-hidden
                style={{
                  height: "1px",
                  marginBottom: "12px",
                  borderRadius: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,224,182,0.28) 28%, rgba(255,242,214,0.48) 50%, rgba(244,224,182,0.28) 72%, transparent)",
                }}
              />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-full rounded-[14px] ring-1 ring-[#f5e5be]/8" />

              {/* 3 × 3 grid */}
              {slots.length === 9 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  {slots.map((slot) => (
                    <DrawerBox
                      key={`${slot.id}-${shuffleEpoch}`}
                      projectSlug={slot.projectSlug}
                      index={slot.id}
                      phase={slot.phase}
                      onOpen={() => openSlot(slot.id)}
                      onBeforeNavigate={onNavigateMain}
                      reducedMotion={reduced}
                    />
                  ))}
                </div>
              )}

              {/* Bottom shadow strip */}
              <div
                aria-hidden
                style={{
                  height: "1px",
                  marginTop: "12px",
                  borderRadius: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,0,0,0.6) 50%, transparent)",
                }}
              />
            </motion.div>
            </div>
            <RelicModel
              src="/assets/3d/antique_safe.glb"
              size={235}
              delay={0.24}
              idx={3}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
            <RelicModel
              src="/assets/3d/genie_lamp__magic_aladdin-style_golden_lamp.glb"
              size={280}
              delay={0.25}
              idx={4}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
            <RelicModel
              src="/assets/3d/unseen_small_props.glb"
              size={140}
              delay={0.3}
              idx={5}
              hoveredModelIndex={hoveredModelIndex}
              setHoveredModelIndex={setHoveredModelIndex}
            />
          </div>
        </div>

        <div className="relative z-10 mb-2 h-px w-[min(95vw,1220px)] bg-gradient-to-r from-transparent via-[#dcc79b]/55 to-transparent" />

        {/* Actions */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <AnimatePresence>
            {allOpen && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={initSlots}
                className="font-mono text-[10px] uppercase tracking-[0.38em] transition-all hover:opacity-100"
                style={{
                  color: "rgba(235,214,171,0.78)",
                  textShadow: "0 0 14px rgba(224,196,138,0.35)",
                  padding: "7px 18px",
                  border: "1px solid rgba(224,196,138,0.3)",
                  borderRadius: "5px",
                  background: "rgba(224,196,138,0.1)",
                }}
              >
                Reshuffle →
              </motion.button>
            )}
          </AnimatePresence>
        </div>

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
