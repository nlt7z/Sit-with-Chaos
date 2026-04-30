"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ── Project data ──────────────────────────────────────────────────────────────

type Rarity = "SSR" | "SR" | "R";

type GachaProject = {
  slug: string;
  title: string;
  company: string;
  tag: string;
  rarity: Rarity;
};

const PROJECTS: Record<string, GachaProject> = {
  "ai-character": {
    slug: "ai-character",
    title: "New Experience for Alibaba AI Character",
    company: "Alibaba Cloud",
    tag: "B2B · LLM Playground",
    rarity: "SSR",
  },
  "studio-engine": {
    slug: "studio-engine",
    title: "Studio Engine.ai — GenAI Filmmaking",
    company: "Studio Engine",
    tag: "GenAI · Film Production",
    rarity: "SR",
  },
  "meituan-im": {
    slug: "meituan-im",
    title: "Expert Analysis for Meituan IM",
    company: "Meituan",
    tag: "IM System · B2C",
    rarity: "SR",
  },
  "apsara-conference": {
    slug: "apsara-conference",
    title: "Apsara Conference — Alibaba AI on Cloud",
    company: "Alibaba Cloud",
    tag: "Visual Design · Brand",
    rarity: "R",
  },
  ridesharing: {
    slug: "ridesharing",
    title: "AI Ride — Autonomous Ridesharing",
    company: "UX Research",
    tag: "UX · Autonomous Vehicle",
    rarity: "R",
  },
};

// SSR ×3 = 33%, SR ×2 each = 22%, R ×1 each = 11%
const BASE_POOL = [
  "ai-character",
  "ai-character",
  "ai-character",
  "studio-engine",
  "studio-engine",
  "meituan-im",
  "meituan-im",
  "apsara-conference",
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

// ── Single drawer ──────────────────────────────────────────────────────────────

type BoxPhase = "closed" | "open";
type BoxSlot = { id: number; projectSlug: string; phase: BoxPhase };

function DrawerBox({
  projectSlug,
  index,
  phase,
  onOpen,
}: {
  projectSlug: string;
  index: number;
  phase: BoxPhase;
  onOpen: () => void;
}) {
  const project = PROJECTS[projectSlug];
  if (!project) return null;

  return (
    // Cabinet recess — dark interior, clips the drawer slide-out
    <div
      className="relative aspect-square overflow-hidden"
      style={{
        background: "#080808",
        borderRadius: "3px",
        boxShadow:
          "inset 0 3px 16px rgba(0,0,0,0.98), inset 1px 1px 5px rgba(0,0,0,0.85), inset -1px -1px 4px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Card — mounted in recess, revealed after drawer exits ── */}
      <AnimatePresence>
        {phase === "open" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.42, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col p-3 md:p-4"
            style={{
              background: "linear-gradient(168deg, #f7f7f7 0%, #eeeeee 100%)",
              borderRadius: "3px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {/* Rarity + tag row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-[3px] px-1.5 py-[2px] font-mono text-[7px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: "rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.11)",
                  color: "rgba(0,0,0,0.35)",
                }}
              >
                {project.rarity}
              </span>
              <span
                className="font-mono text-[7px] uppercase tracking-[0.14em]"
                style={{ color: "rgba(0,0,0,0.22)" }}
              >
                {project.tag}
              </span>
            </div>

            {/* Title */}
            <p
              className="mt-auto font-display font-light leading-snug"
              style={{
                fontSize: "clamp(0.66rem, 1.5vw, 0.82rem)",
                color: "rgba(0,0,0,0.8)",
              }}
            >
              {project.title}
            </p>

            {/* Company + View link */}
            <div className="mt-2 flex items-end justify-between gap-1">
              <span
                className="font-mono text-[7px] uppercase tracking-[0.13em]"
                style={{ color: "rgba(0,0,0,0.27)" }}
              >
                {project.company}
              </span>
              <Link
                href={`/work/${project.slug}`}
                className="shrink-0 font-mono text-[7px] uppercase tracking-[0.18em] text-black/40 transition-colors hover:text-black/80"
              >
                View →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drawer face — slides out through the bottom on open ── */}
      <AnimatePresence>
        {phase === "closed" && (
          <motion.button
            key="drawer"
            onClick={onOpen}
            aria-label={`Open drawer ${index + 1}`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            initial={{ y: 0 }}
            exit={{
              y: "114%",
              transition: { duration: 0.5, ease: [0.6, 0, 0.85, 0.52] },
            }}
            style={{
              background:
                "linear-gradient(170deg, #d4d4d4 0%, #bcbcbc 38%, #ababab 100%)",
              borderRadius: "3px",
              boxShadow:
                "0 4px 14px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.64), inset 0 -1px 0 rgba(0,0,0,0.13)",
            }}
            whileHover={{
              background:
                "linear-gradient(170deg, #dcdcdc 0%, #c4c4c4 38%, #b4b4b4 100%)",
              boxShadow:
                "0 10px 26px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.72), inset 0 -1px 0 rgba(0,0,0,0.1)",
              transition: { duration: 0.18 },
            }}
            whileTap={{
              background:
                "linear-gradient(170deg, #c8c8c8 0%, #b2b2b2 38%, #a2a2a2 100%)",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.44)",
              transition: { duration: 0.08 },
            }}
          >
            {/* Label-card slot */}
            <div
              style={{
                width: "55%",
                height: "15px",
                background: "rgba(0,0,0,0.07)",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "2px",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                className="font-mono tracking-[0.28em]"
                style={{ fontSize: "6px", color: "rgba(0,0,0,0.2)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Hardware: backplate + ring pull */}
            <div className="flex flex-col items-center" style={{ gap: "2px" }}>
              {/* Backplate */}
              <div
                style={{
                  width: "28px",
                  height: "7px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(180deg, #9a9a9a 0%, #787878 55%, #686868 100%)",
                  boxShadow:
                    "0 2px 5px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              />
              {/* Ring pull */}
              <div
                style={{
                  width: "17px",
                  height: "9px",
                  borderRadius: "9px 9px 0 0",
                  border: "2px solid #848484",
                  borderBottom: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
                }}
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cabinet ───────────────────────────────────────────────────────────────────

export function GachaCabinet({ onExit }: { onExit: () => void }) {
  const [slots, setSlots] = useState<BoxSlot[]>([]);

  const initSlots = useCallback(() => {
    setSlots(
      shuffle(BASE_POOL).map((slug, i) => ({
        id: i,
        projectSlug: slug,
        phase: "closed" as BoxPhase,
      })),
    );
  }, []);

  useEffect(() => {
    initSlots();
  }, [initSlots]);

  const openSlot = useCallback((id: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, phase: "open" } : s)),
    );
  }, []);

  const allOpen = slots.length === 9 && slots.every((s) => s.phase === "open");

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center"
      style={{ background: "#050505" }}
    >
      {/* Back button — minimal, top-left */}
      <button
        onClick={onExit}
        className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/20 transition-colors hover:text-white/50"
      >
        ← back
      </button>

      {/* Cabinet frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(162deg, #252525 0%, #181818 50%, #1f1f1f 100%)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: "8px",
          padding: "13px",
          width: "min(92vw, 560px)",
          boxShadow: [
            "0 80px 160px rgba(0,0,0,0.9)",
            "0 30px 60px rgba(0,0,0,0.7)",
            "0 10px 20px rgba(0,0,0,0.5)",
            "0 2px 4px rgba(0,0,0,0.35)",
            "inset 0 1px 0 rgba(255,255,255,0.07)",
            "inset 0 -3px 0 rgba(0,0,0,0.6)",
          ].join(", "),
        }}
      >
        {/* Top highlight — simulates a beveled top edge */}
        <div
          style={{
            height: "1px",
            marginBottom: "11px",
            borderRadius: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* 3 × 3 drawer grid */}
        {slots.length === 9 && (
          <div className="grid grid-cols-3 gap-[7px]">
            {slots.map((slot) => (
              <DrawerBox
                key={slot.id}
                projectSlug={slot.projectSlug}
                index={slot.id}
                phase={slot.phase}
                onOpen={() => openSlot(slot.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom shadow strip */}
        <div
          style={{
            height: "1px",
            marginTop: "11px",
            borderRadius: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 50%, transparent 100%)",
          }}
          aria-hidden
        />
      </motion.div>

      {/* Reshuffle — appears only when all 9 drawers are open */}
      <AnimatePresence>
        {allOpen && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={initSlots}
            className="mt-10 font-mono text-[10px] uppercase tracking-[0.26em] text-white/22 transition-colors hover:text-white/55"
          >
            Reshuffle →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
