"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Fonts ──────────────────────────────────────────────────────────────────────
const displayFont = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const uiFont = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const monoFont = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// ── Animation presets (Apple-like springs) ─────────────────────────────────────
const spring = {
  gentle:  { type: "spring", stiffness: 260, damping: 26, mass: 0.9 } as Transition,
  snappy:  { type: "spring", stiffness: 400, damping: 30, mass: 0.8 } as Transition,
  smooth:  { type: "spring", stiffness: 180, damping: 22, mass: 1.0 } as Transition,
  bounce:  { type: "spring", stiffness: 320, damping: 18, mass: 0.6 } as Transition,
  fade:    { duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] } as Transition,
  fadeIn:  { duration: 0.32, ease: [0.0, 0.0, 0.2, 1.0] } as Transition,
  fadeOut: { duration: 0.2,  ease: [0.4, 0.0, 1.0, 1.0] } as Transition,
};

// ── Palette (warm light blue tones) ────────────────────────────────────────────
const C = {
  bg:       "linear-gradient(156deg, #fafbfc 0%, #f4f6f8 36%, #eef1f4 72%, #eaecef 100%)",
  accent:   "#3b6fa5",
  accentLt: "#7aaed0",
  accentSoft: "rgba(59,111,165,0.07)",
  teal:     "#1d9b85",
  card:     "rgba(255,255,255,0.9)",
  cardBdr:  "rgba(120,160,200,0.26)",
  shadow:   "0 8px 24px -18px rgba(20,50,90,0.18)",
  shadowMd: "0 14px 34px -22px rgba(20,50,90,0.22)",
  shadowLg: "0 26px 54px -28px rgba(14,44,100,0.28)",
  userBub:  "linear-gradient(160deg, rgba(248,250,253,0.76) 0%, rgba(242,247,253,0.66) 52%, rgba(239,245,252,0.64) 100%)",
  userTxt:  "#1a3450",
  txt:      "#1e2e3e",
  txt2:     "#52697e",
  txt3:     "rgba(82,105,126,0.62)",
  nav:      "rgba(250,251,252,0.96)",
  navBdr:   "rgba(120,160,200,0.24)",
  // Analysis card
  anBg:     "linear-gradient(180deg, #fffefb 0%, #fffdf4 100%)",
  anBdr:    "rgba(216,196,122,0.5)",
  anHd:     "#5e4600",
  anLbl:    "#7a5f00",
  anVal:    "#2a1e00",
  // Status
  green:    "#1a7550",
  greenBg:  "rgba(26,117,80,0.07)",
  greenBdr: "rgba(26,117,80,0.20)",
  amber:    "#a66200",
  amberBg:  "rgba(166,98,0,0.07)",
  amberBdr: "rgba(166,98,0,0.20)",
};

// ── Types ──────────────────────────────────────────────────────────────────────
type AnalysisData = {
  emotionalState:      string;
  coreConcern:         string;
  knownContext:        string;
  conversationStage:   string;
  unexploredContext:   string;
  therapeuticApproach: string;
};

type Msg = {
  id:                string;
  role:              "user" | "assistant";
  text:              string;
  analysis?:         AnalysisData;
  analysisCollapsed: boolean;
};

type BuildState = { phase: number; analysis: AnalysisData } | null;
type SidebarTab  = "analysis" | "expert" | "code" | "guide";
type StepStatus  = "pending" | "running" | "done";
type PipeStep    = { label: string; detail: string; status: StepStatus };
type GuideStep = {
  step: number;
  time: string;
  label: string;
  hint: string;
  cta?: string;
  action?: "focusInput" | "openExpert" | "openCode" | "copyLink" | "restart";
};

// ── Static data ────────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "I can't stop overthinking at night",
  "My partner and I keep arguing",
  "Work stress is overwhelming me",
  "I feel disconnected lately",
];

const PIPE_INIT: PipeStep[] = [
  { label: "Context Analysis",         detail: "Identifying emotional tone and key themes", status: "pending" },
  { label: "Signal Mapping",           detail: "Evaluating patterns and coping indicators", status: "pending" },
  { label: "Response Planning",        detail: "Crafting empathetic, actionable guidance", status: "pending" },
];

const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    time: "0:00",
    label: "Start",
    hint: "Choose a prompt or share what's on your mind.",
    cta: "Begin",
    action: "focusInput",
  },
  {
    step: 2,
    time: "0:20",
    label: "Observe",
    hint: "Watch the analysis unfold in real-time.",
  },
  {
    step: 3,
    time: "0:45",
    label: "Review",
    hint: "Read the response and suggested next steps.",
  },
  {
    step: 4,
    time: "1:05",
    label: "Explore",
    hint: "Learn about the advisory panel and methodology.",
    cta: "View profile",
    action: "openExpert",
  },
  {
    step: 5,
    time: "1:25",
    label: "Code",
    hint: "Explore the pipeline configuration and model parameters.",
    cta: "View code",
    action: "openCode",
  },
  {
    step: 6,
    time: "1:45",
    label: "Complete",
    hint: "Share this experience or start fresh.",
    cta: "Share",
    action: "copyLink",
  },
];

const PSYCH_CLONE_SNIPPET = `git clone https://github.com/example/therapy-showroom
cd therapy-showroom && pnpm i && pnpm dev`;

const ANALYSIS_FIELDS: { key: keyof AnalysisData; label: string }[] = [
  { key: "emotionalState",      label: "Emotional State" },
  { key: "coreConcern",         label: "Core Concern" },
  { key: "knownContext",        label: "Context" },
  { key: "conversationStage",   label: "Stage" },
  { key: "unexploredContext",   label: "To Explore" },
  { key: "therapeuticApproach", label: "Approach" },
];

const NUM_FIELDS = ANALYSIS_FIELDS.length;

const WELCOME: Msg = {
  id:                "welcome",
  role:              "assistant",
  text:              "Hello. I'm here to listen.\n\nShare what's on your mind — a situation, a feeling, or something you've been carrying. Before I respond, you'll see a brief analysis of what I'm understanding.\n\nTransparency, not a black box.",
  analysisCollapsed: false,
};

// ── Data generators ────────────────────────────────────────────────────────────
function generateAnalysis(input: string): AnalysisData {
  const l = input.toLowerCase();
  const isSleep    = /sleep|insomnia|night|awake|overthink|dream/.test(l);
  const isStress   = /stress|pressure|anx|burnout|overwhelm|exhaust|nonstop|motions/.test(l);
  const isRelation = /partner|relationship|argument|fight|communicat|couple/.test(l);

  if (isRelation) return {
    emotionalState:      "Relational distress — frustration, emotional depletion, possible helplessness",
    coreConcern:         "Escalating conflict cycles that prevent genuine emotional connection",
    knownContext:        "Recurring arguments with partner; pattern appears systematic, not isolated",
    conversationStage:   "Active listening · Goal: map escalation triggers · Strategy: reflective questioning",
    unexploredContext:   "Specific triggers, communication styles, recent relationship shifts, shared goals",
    therapeuticApproach: "Identify Gottman escalation patterns first; introduce Nonviolent Communication second",
  };

  if (isSleep) return {
    emotionalState:      "Elevated cognitive arousal with anxiety signal — sleep disruption as downstream effect",
    coreConcern:         "Involuntary rumination preventing sleep onset; pressure-cognition feedback loop active",
    knownContext:        "User experiences persistent night-time overthinking affecting sleep quality",
    conversationStage:   "Assessment phase · Goal: identify rumination type and triggers · Strategy: psychoeducation",
    unexploredContext:   "Sleep onset vs. maintenance issue, recurring thought themes, daytime stress load",
    therapeuticApproach: "Cognitive defusion for night-time loops + structured worry-postponement + sleep hygiene",
  };

  if (isStress) return {
    emotionalState:      "Chronic high-pressure state approaching depletion threshold — burnout markers elevated",
    coreConcern:         "Sustained demands without adequate recovery creating systemic exhaustion",
    knownContext:        "User reports continuous work pressure with near-burnout severity",
    conversationStage:   "Validation phase · Goal: assess burnout severity · Strategy: normalize and explore",
    unexploredContext:   "Work domain, support systems, previous coping patterns, boundary-setting capability",
    therapeuticApproach: "Maslach burnout informal assessment first; boundary-setting and energy audit second",
  };

  return {
    emotionalState:      "Generalized emotional flatness — low affect, possible existential drift or dissociation",
    coreConcern:         "Disconnection from meaning; 'going through the motions' indicates deeper depletion",
    knownContext:        "User feels emotionally disconnected from daily activities without a clear cause",
    conversationStage:   "Discovery phase · Goal: identify core stressor · Strategy: open, curious exploration",
    unexploredContext:   "Duration, specific triggers, impact on relationships, values and purpose alignment",
    therapeuticApproach: "Acceptance-based values exploration first; behavioral activation to restore agency second",
  };
}

function buildReply(input: string): string {
  const l = input.toLowerCase();
  const isSleep    = /sleep|insomnia|night|awake|overthink|dream/.test(l);
  const isStress   = /stress|pressure|anx|burnout|overwhelm|exhaust|nonstop/.test(l);
  const isRelation = /partner|relationship|argument|fight|communicat|couple/.test(l);

  if (isRelation) return `The frustration you're describing has a particular shape — not just the argument itself, but the cycle of trying to connect and ending up further apart.

Most couples in this pattern aren't actually fighting about the surface topic. Each person is signaling an unmet need, but it comes out as criticism or defensiveness instead of vulnerability.

Three things to try:
1. Before the next difficult conversation, each of you write one sentence: "I feel ___ when ___, because I need ___." Share both before engaging.
2. Agree on a pause phrase — something neutral like "I need a moment" — that either person can use for a 20-minute break without it reading as abandonment.
3. Start every hard conversation by stating one shared goal you both want for the relationship.

Would it help to walk through what a recent argument looked like, step by step?`;

  if (isSleep || isStress) return `That combination of daytime pressure and nighttime overthinking is one of the most draining patterns — your nervous system cannot find the off-switch.

The core dynamic: unresolved daytime stress gets processed at night when no competing demands exist. The harder you try to force sleep, the more your brain interprets the effort as another problem to solve.

Three practical steps starting tonight:
1. 90 minutes before bed — do a "worry dump." Write every active concern and add one concrete next action. This signals to your brain that the items are handled.
2. Keep a notepad by the bed. When a thought intrudes, write it down and say: "Scheduled for tomorrow at 9am." Return to slow breathing.
3. Tomorrow, protect 90 uninterrupted minutes for your single highest-priority task. Reducing decision load during the day reduces mental noise at night.

Which of these feels most accessible to start with?`;

  return `What you're describing sounds like a kind of low-level disconnection — still functioning, but not quite fully present. That particular exhaustion can be harder to name than acute stress, but it is just as real.

Before I offer anything, I want to make sure I understand correctly.

When you say "going through the motions" — is that mostly in one area of your life, or does it feel more general? And when did you last feel genuinely engaged or energized by something?

Sometimes one specific answer to that question unlocks the whole picture more quickly than talking about it in general terms.`;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IcoSend() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14V4M4 9l5-5 5 5"/>
    </svg>
  );
}
function IcoCopy() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="9" height="9" rx="1.6"/><path d="M12 6V4.4c0-.9-.7-1.6-1.6-1.6H4.6C3.7 2.8 3 3.5 3 4.4v5.8c0 .9.7 1.6 1.6 1.6H6"/>
    </svg>
  );
}
function IcoRegenerate() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-[17px] w-[17px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.2 6A5.8 5.8 0 1 0 15 9"/><path d="M14 3.7v3.2h-3.2"/>
    </svg>
  );
}
function IcoRestart() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 6A7.5 7.5 0 1 0 17.2 10"/><path d="M17 3.5v3.8h-3.8"/>
    </svg>
  );
}
function IcoShare() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4.5" r="2"/><circle cx="5" cy="10" r="2"/><circle cx="15" cy="15.5" r="2"/>
      <path d="m7 9 6-3M7 11l6 3"/>
    </svg>
  );
}
function IcoExpert() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="2.8"/><path d="M4 17c.9-3 3.3-4.5 6-4.5s5.1 1.5 6 4.5"/>
    </svg>
  );
}
function IcoCode() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5L3 10l4 5M13 5l4 5-4 5"/>
    </svg>
  );
}
function IcoGuide() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7.5"/><path d="M10 6v5l3 2"/>
    </svg>
  );
}
function IcoClose() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/>
    </svg>
  );
}
function IcoCheck({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5l3.8 3.5 6.2-7"/>
    </svg>
  );
}
function IcoSpinner() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-[13px] w-[13px] animate-spin" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="6.5" strokeOpacity="0.18"/><path d="M9 2.5a6.5 6.5 0 0 1 6.5 6.5" strokeLinecap="round"/>
    </svg>
  );
}
function IcoBrain() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4C7 4 5 4 4 6C3 8 4 10 5 11C6 12 6 13 6 14M7 4C8 3.5 9 3.5 10 4M7 4C7 5 7 6 8 7M13 4C13 4 15 4 16 6C17 8 16 10 15 11C14 12 14 13 14 14M13 4C12 3.5 11 3.5 10 4M13 4C13 5 13 6 12 7M10 4V6M8 7C9 7 10 7.5 10 9M12 7C11 7 10 7.5 10 9M10 9V14M6 14H14"/>
    </svg>
  );
}

function OpeningCosmicHug() {
  return (
    <div className="relative mx-auto h-[112px] w-[172px] shrink-0">
      <motion.span
        className="absolute left-[10px] top-[10px] text-[13px]"
        style={{ color: "rgba(120,166,214,0.75)" }}
        animate={{ opacity: [0.25, 0.9, 0.35], scale: [0.9, 1.18, 0.95] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
      >
        *
      </motion.span>
      <motion.span
        className="absolute left-[140px] top-[20px] text-[14px]"
        style={{ color: "rgba(153,194,236,0.8)" }}
        animate={{ opacity: [0.3, 0.95, 0.45], scale: [0.88, 1.22, 0.9] }}
        transition={{ duration: 2.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        *
      </motion.span>
      <motion.span
        className="absolute left-[28px] top-[82px] text-[11px]"
        style={{ color: "rgba(255,198,124,0.75)" }}
        animate={{ opacity: [0.2, 0.75, 0.32], scale: [0.92, 1.1, 0.95] }}
        transition={{ duration: 2.1, delay: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        *
      </motion.span>

      <motion.div
        className="absolute left-[24px] top-[30px] h-[62px] w-[62px] rounded-[22px]"
        style={{
          background: "linear-gradient(145deg, rgba(255,214,178,0.9) 0%, rgba(255,188,160,0.82) 100%)",
          boxShadow: "0 10px 24px -14px rgba(195,120,88,0.66)",
        }}
        animate={{ y: [0, -2, 0], rotate: [0, -1.3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute left-[17px] top-[20px] h-[6px] w-[6px] rounded-full bg-[rgba(103,72,64,0.82)]" />
        <span className="absolute left-[37px] top-[20px] h-[6px] w-[6px] rounded-full bg-[rgba(103,72,64,0.82)]" />
        <span className="absolute left-[21px] top-[37px] h-[4px] w-[18px] rounded-full bg-[rgba(131,81,74,0.72)]" />
      </motion.div>

      <motion.div
        className="absolute left-[78px] top-[32px] h-[62px] w-[62px] rounded-[22px]"
        style={{
          background: "linear-gradient(145deg, rgba(196,223,255,0.9) 0%, rgba(165,205,244,0.82) 100%)",
          boxShadow: "0 10px 24px -14px rgba(90,124,186,0.62)",
        }}
        animate={{ y: [0, -3, 0], rotate: [0, 1.4, 0] }}
        transition={{ duration: 3.3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute left-[17px] top-[20px] h-[6px] w-[6px] rounded-full bg-[rgba(67,91,126,0.82)]" />
        <span className="absolute left-[37px] top-[20px] h-[6px] w-[6px] rounded-full bg-[rgba(67,91,126,0.82)]" />
        <span className="absolute left-[20px] top-[37px] h-[4px] w-[19px] rounded-full bg-[rgba(70,104,148,0.72)]" />
      </motion.div>

      <div
        className="absolute left-[61px] top-[64px] h-[16px] w-[34px] rounded-full"
        style={{ background: "linear-gradient(180deg, rgba(255,249,234,0.86) 0%, rgba(255,234,196,0.66) 100%)" }}
      />
    </div>
  );
}

function RoomBadge({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "linear-gradient(135deg, rgba(42,106,191,0.95) 0%, rgba(29,155,133,0.9) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        boxShadow: "0 4px 12px -6px rgba(20,90,180,0.45)",
      }}
    >
      <IcoBrain/>
    </div>
  );
}

// ── Custom cursor ──────────────────────────────────────────────────────────────
const CursorLayer = memo(function CursorLayer() {
  const rm = useReducedMotion();
  const mX = useMotionValue(-120);
  const mY = useMotionValue(-120);
  const rX = useSpring(mX, { stiffness: 400, damping: 32, mass: 0.5 });
  const rY = useSpring(mY, { stiffness: 400, damping: 32, mass: 0.5 });
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (rm) return;
    let pending = false;
    let ex = -120, ey = -120;
    const flush = () => { pending = false; mX.set(ex); mY.set(ey); };
    const onMove = (e: MouseEvent) => {
      ex = e.clientX; ey = e.clientY;
      if (!pending) { pending = true; requestAnimationFrame(flush); }
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHov(!!el.closest("button,a,textarea"));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver,  { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [mX, mY, rm]);

  if (rm) return null;
  return (
    <>
      <motion.div className="pointer-events-none fixed z-[999]" style={{ x: mX, y: mY, translateX: "-50%", translateY: "-50%" }}>
        <motion.div
          animate={{ width: hov ? 8 : 6, height: hov ? 8 : 6, opacity: hov ? 1 : 0.7 }}
          transition={spring.snappy}
          style={{ borderRadius: "50%", background: C.accent }}
        />
      </motion.div>
      <motion.div className="pointer-events-none fixed z-[998]" style={{ x: rX, y: rY, translateX: "-50%", translateY: "-50%" }}>
        <motion.div
          animate={{
            width: hov ? 36 : 24,
            height: hov ? 36 : 24,
            borderColor: hov ? C.accent : C.accentLt,
            opacity: hov ? 0.4 : 0.2,
          }}
          transition={spring.gentle}
          style={{ borderRadius: "50%", borderWidth: 1.5, borderStyle: "solid" }}
        />
      </motion.div>
    </>
  );
});

// ── Tooltip ────────────────────────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={spring.snappy}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10.5px]"
            style={{ background: "rgba(14,30,52,0.88)", color: "#deeeff", backdropFilter: "blur(4px)", boxShadow: C.shadow }}>
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Share modal (single step: copy link) ───────────────────────────────────────
function PsychShareModal({ onClose }: { onClose: () => void }) {
  const [vis, setVis] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  useEffect(() => { const id = setTimeout(() => setVis(true), 30); return () => clearTimeout(id); }, []);
  const close = () => { setVis(false); setTimeout(onClose, 320); };
  const copyUrl = () => {
    void navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => { setCopied(false); close(); }, 1400);
  };

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 600,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    background: vis ? "rgba(8,26,52,0.32)" : "transparent",
    backdropFilter: vis ? "blur(12px)" : "none",
    transition: "background 0.32s ease, backdrop-filter 0.32s ease",
  };
  const card: React.CSSProperties = {
    width: "min(420px,100%)", borderRadius: 16,
    background: "linear-gradient(180deg, rgba(250,254,255,0.99) 0%, rgba(241,249,255,0.97) 100%)",
    border: "1px solid rgba(132,180,222,0.38)",
    boxShadow: "0 28px 72px -32px rgba(14,50,110,0.44)",
    overflow: "hidden",
    opacity: vis ? 1 : 0,
    transform: vis ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
    transition: "opacity 0.32s ease, transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
  };
  return (
    <div role="dialog" aria-modal aria-labelledby="psych-share-title" style={overlay} onClick={close}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid rgba(132,180,222,0.2)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="psych-share-title" style={{ margin: 0, fontFamily: displayFont.style.fontFamily, fontSize: 17, fontWeight: 600, color: C.txt, lineHeight: 1.3 }}>Share this session</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.txt2, lineHeight: 1.5 }}>Copy the link and send it to open this therapy showroom.</p>
          </div>
          <button type="button" aria-label="Close" onClick={close} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(132,180,222,0.24)", background: "transparent", color: C.txt2, cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>&times;</button>
        </div>
        <div style={{ padding: "18px 20px 20px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, letterSpacing: 0.08, textTransform: "uppercase", color: C.txt3 }}>Page URL</p>
          <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(132,180,222,0.28)", background: "rgba(242,248,255,0.85)", fontFamily: "ui-monospace,monospace", fontSize: 12, color: C.txt, wordBreak: "break-all", lineHeight: 1.55 }}>{url || "—"}</div>
          <button
            type="button"
            onClick={copyUrl}
            style={{
              marginTop: 14, width: "100%", padding: "12px 0", borderRadius: 10,
              border: `1px solid ${copied ? C.teal : C.accentLt}`,
              background: copied ? "rgba(29,155,133,0.1)" : "rgba(42,106,191,0.08)",
              color: copied ? C.teal : C.accent, fontFamily: uiFont.style.fontFamily, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KB editor modal ────────────────────────────────────────────────────────────
const KB_INITIAL = [
  { id: "fw1",  category: "Intervention Frameworks", content: "CBT-based thought reframing: identify automatic negative thoughts, challenge distortions, replace with balanced alternatives." },
  { id: "fw2",  category: "Intervention Frameworks", content: "Behavioral activation: schedule small, achievable positive activities to counter withdrawal in low-mood states." },
  { id: "cp1",  category: "Coping Strategies",       content: "Box breathing (4-4-4-4): inhale 4s, hold 4s, exhale 4s, hold 4s — activates parasympathetic response." },
  { id: "cp2",  category: "Coping Strategies",       content: "Grounding 5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste." },
  { id: "sc1",  category: "Safety Constraints",      content: "Never diagnose. Use 'may suggest' or 'some people experience' framing. Always recommend professional support for clinical concerns." },
  { id: "rt1",  category: "Response Templates",      content: "Opening empathy: 'That sounds really difficult. Thank you for sharing that with me. Let's take a moment to understand what you're feeling.'" },
];

function KbEditorModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState(KB_INITIAL);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft,   setDraft]   = useState("");
  const [saved,   setSaved]   = useState(false);
  const categories = Array.from(new Set(entries.map(e => e.category)));

  const startEdit = (id: string) => {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    setEditing(id);
    setDraft(e.content);
  };
  const saveEdit = () => {
    setEntries(prev => prev.map(e => e.id === editing ? { ...e, content: draft } : e));
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: "rgba(8,24,52,0.22)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-50 w-[min(94vw,560px)] max-h-[82vh] flex flex-col overflow-hidden rounded-3xl"
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.9 }}
        style={{
          left: "50%", top: "50%", x: "-50%", y: "-50%",
          background: "linear-gradient(160deg, rgba(252,254,255,0.99) 0%, rgba(244,249,254,0.98) 100%)",
          border: "1px solid rgba(120,160,200,0.28)",
          boxShadow: "0 32px 72px -32px rgba(14,44,100,0.38)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(120,160,200,0.18)" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: C.accentSoft, border: `1px solid rgba(59,111,165,0.22)` }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <span className="text-[12px] font-medium" style={{ color: C.txt }}>Edit Knowledge Base</span>
            {saved && (
              <motion.span initial={{ opacity:0, x:4 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="text-[10.5px] font-medium" style={{ color: C.teal }}>
                ✓ Saved
              </motion.span>
            )}
          </div>
          <button type="button" onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: C.txt2 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(120,160,200,0.2) transparent" }}>
          {categories.map(cat => (
            <div key={cat}>
              <p className="mb-2 text-[9px] uppercase tracking-[.18em] font-semibold" style={{ color: C.accent }}>{cat}</p>
              <div className="space-y-2">
                {entries.filter(e => e.category === cat).map(entry => (
                  <div key={entry.id} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${editing === entry.id ? `rgba(59,111,165,0.32)` : C.cardBdr}`, background: C.card }}>
                    {editing === entry.id ? (
                      <div>
                        <textarea
                          className="w-full resize-none bg-transparent px-3.5 pt-3 pb-2 text-[12px] leading-[1.72] outline-none"
                          style={{ color: C.txt, minHeight: 80 }}
                          value={draft}
                          onChange={e => setDraft(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 px-3.5 pb-3">
                          <button type="button" onClick={() => setEditing(null)}
                            className="rounded-full px-3 py-1 text-[10.5px] font-medium"
                            style={{ color: C.txt3, background: "rgba(255,255,255,0.9)", border: `1px solid ${C.cardBdr}` }}>
                            Cancel
                          </button>
                          <motion.button type="button" onClick={saveEdit}
                            className="rounded-full px-3 py-1 text-[10.5px] font-medium text-white"
                            style={{ background: `linear-gradient(90deg, ${C.accent} 0%, #4a88c8 100%)` }}
                            whileHover={{ filter: "brightness(1.06)" }} whileTap={{ scale: 0.97 }}>
                            Save
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 px-3.5 py-3">
                        <p className="flex-1 text-[11.5px] leading-[1.7]" style={{ color: C.txt2 }}>{entry.content}</p>
                        <button type="button" onClick={() => startEdit(entry.id)}
                          className="shrink-0 rounded-full p-1.5 opacity-40 hover:opacity-80 transition-opacity"
                          style={{ color: C.accent, background: C.accentSoft }}>
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid rgba(120,160,200,0.14)", background: "rgba(248,251,254,0.9)" }}>
          <p className="text-[10px]" style={{ color: C.txt3 }}>{entries.length} entries across {categories.length} categories</p>
          <motion.button type="button" onClick={onClose}
            className="rounded-full px-4 py-1.5 text-[11px] font-medium text-white"
            style={{ background: `linear-gradient(90deg, ${C.accent} 0%, #4a88c8 100%)` }}
            whileHover={{ filter: "brightness(1.06)" }} whileTap={{ scale: 0.97 }}>
            Done
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ── Psych splash screen ────────────────────────────────────────────────────────
function PsychSplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-stretch overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f5faff 0%, #eaf3f9 50%, #e3eef8 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Left: text content */}
      <div className="relative z-10 flex w-full flex-col justify-center px-10 py-14 md:w-[52%] md:px-16 lg:px-20">
        {/* Badge */}
        <motion.div
          className="mb-8 flex items-center gap-2"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, rgba(42,106,191,0.95) 0%, rgba(29,155,133,0.9) 100%)" }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <span className="font-mono text-[10.5px] tracking-[.14em] uppercase" style={{ color: C.accent }}>
            Little Cosmic Cuddle Corner
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className={`mb-5 font-light leading-[1.12] tracking-[-0.02em] ${displayFont.className}`}
          style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", color: C.txt }}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          I&apos;m here<br/>
          <span style={{ color: C.accent }}>to listen.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-8 max-w-sm text-[14px] leading-[1.72]"
          style={{ color: C.txt2 }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
        >
          Share what&apos;s on your mind — a situation, a feeling, or something you&apos;ve been carrying. Before I respond, you&apos;ll see a brief analysis of what I&apos;m understanding.
        </motion.p>

        {/* Feature list */}
        <motion.ul
          className="mb-10 space-y-2.5"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.38 }}
        >
          {[
            "Emotional state analysis in real time",
            "Transparent reasoning, not a black box",
            "Safe space for open conversation",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-[12.5px]" style={{ color: C.txt2 }}>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(42,106,191,0.1)", color: C.accent }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </span>
              {f}
            </li>
          ))}
        </motion.ul>

        {/* Enter button */}
        <motion.button
          type="button"
          onClick={onEnter}
          className="group flex w-fit items-center gap-2.5 rounded-full px-6 py-3 text-[13px] font-medium text-white"
          style={{
            background: `linear-gradient(135deg, ${C.accent} 0%, #3a86d4 100%)`,
            boxShadow: "0 8px 24px -10px rgba(42,106,191,0.46)",
          }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.38 }}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 28px -10px rgba(42,106,191,0.56)" }}
          whileTap={{ scale: 0.97 }}
        >
          Start a session
          <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </motion.button>
      </div>

      {/* Right: animation */}
      <div className="hidden md:flex md:w-[48%] items-center justify-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            background: [
              "radial-gradient(circle at 50% 46%, rgba(42,106,191,0.09) 0%, transparent 60%)",
              "radial-gradient(circle at 72% 28%, rgba(29,155,133,0.07) 0%, transparent 48%)",
            ].join(","),
          }}
        />
        {/* Decorative rings */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 320, height: 320, border: "1px solid rgba(132,180,222,0.14)" }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{ width: 220, height: 220, border: "1px solid rgba(132,180,222,0.22)" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 4, delay: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Central animation — scaled up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.84 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.0, 0.0, 0.2, 1.0] }}
          style={{ transform: "scale(2.2)", transformOrigin: "center" }}
        >
          <OpeningCosmicHug/>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Nav button ─────────────────────────────────────────────────────────────────
function NavBtn({ onClick, active, children, wide }: {
  onClick: () => void; active?: boolean; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 justify-center rounded-xl ${wide ? "h-8 px-3" : "h-8 w-8"}`}
      style={{
        background: active ? "rgba(42,106,191,0.1)" : "rgba(140,188,228,0.08)",
        border: `1px solid ${active ? "rgba(42,106,191,0.28)" : "rgba(140,188,228,0.18)"}`,
        color: active ? C.accent : C.txt2,
        boxShadow: active ? "0 2px 12px -4px rgba(42,106,191,0.22)" : "none",
      }}
      whileHover={{ backgroundColor: active ? "rgba(42,106,191,0.15)" : "rgba(140,188,228,0.14)" }}
      whileTap={{ scale: 0.96 }}
      transition={spring.snappy}
    >
      {children}
    </motion.button>
  );
}

// ── Side panel shell ───────────────────────────────────────────────────────────
function SidePanel({ title, onClose, children, variant = "overlay" }: {
  title: string; onClose: () => void; children: React.ReactNode;
  /** dock = in-flow right rail; overlay = fixed sheet (use with dim backdrop) */
  variant?: "overlay" | "dock";
}) {
  const isDock = variant === "dock";
  return (
    <motion.aside
      initial={isDock ? { x: 20, opacity: 0.97 } : { x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={isDock ? { x: 16, opacity: 0.92 } : { x: 40, opacity: 0 }}
      transition={spring.gentle}
      className={
        isDock
          ? "relative z-20 flex h-full w-[min(100vw,372px)] shrink-0 flex-col overflow-hidden"
          : "fixed right-0 top-0 z-40 flex h-full w-[372px] flex-col overflow-hidden"
      }
      style={{
        background: "linear-gradient(180deg, rgba(247,252,255,0.985) 0%, rgba(241,249,255,0.975) 100%)",
        backdropFilter: "blur(8px)",
        borderLeft: `1px solid ${C.navBdr}`,
        boxShadow: "-14px 0 40px -12px rgba(14,50,110,0.12)",
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.navBdr}` }}>
        <p className={`text-[10.5px] font-semibold tracking-[.12em] uppercase ${uiFont.className}`}
          style={{ color: C.txt2 }}>{title}</p>
        <motion.button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: "rgba(140,188,228,0.1)", color: C.txt2, border: "1px solid rgba(140,188,228,0.2)" }}
          whileHover={{ backgroundColor: "rgba(140,188,228,0.2)" }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
        >
          <IcoClose/>
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(42,106,191,0.12) transparent` }}>
        {children}
      </div>
    </motion.aside>
  );
}

function PsychQuickGuideContent({
  guideStep,
  setGuideStep,
  runGuideAction,
}: {
  guideStep: number;
  setGuideStep: React.Dispatch<React.SetStateAction<number>>;
  runGuideAction: (action?: GuideStep["action"]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBdr}`, boxShadow: C.shadow }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.14em]" style={{ color: C.accent }}>Walkthrough</p>
            <p className="text-[10.5px] mt-1" style={{ color: C.txt3 }}>Finish all key interactions in about 2 minutes</p>
          </div>
          <p className="text-[10.5px]" style={{ color: C.txt2 }}>
            {guideStep + 1} / {GUIDE_STEPS.length}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {GUIDE_STEPS.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setGuideStep(i)}
              className="h-[3px] flex-1 rounded-full cursor-pointer"
              animate={{
                background: i < guideStep
                  ? "linear-gradient(90deg, rgba(42,106,191,0.72), rgba(29,155,133,0.72))"
                  : i === guideStep
                    ? "rgba(42,106,191,0.6)"
                    : "rgba(140,188,228,0.18)",
              }}
              transition={spring.snappy}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={guideStep}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={spring.gentle}
        className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.72)", border: `1px solid ${C.cardBdr}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(42,106,191,0.10)", color: C.accent }}>
            <span className="text-[10px] font-semibold">{GUIDE_STEPS[guideStep].step}</span>
          </div>
          <div>
            <p className="text-[12.5px] font-medium" style={{ color: C.txt }}>{GUIDE_STEPS[guideStep].label}</p>
            <p className="text-[10px]" style={{ color: C.txt3 }}>{GUIDE_STEPS[guideStep].time}</p>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.txt2 }}>
          {GUIDE_STEPS[guideStep].hint}
        </p>

        {GUIDE_STEPS[guideStep].cta && (
          <motion.button
            type="button"
            onClick={() => runGuideAction(GUIDE_STEPS[guideStep].action)}
            className="mt-3 rounded-lg px-3 py-1.5 text-[11px] font-medium"
            style={{ color: C.accent, background: "rgba(42,106,191,0.08)", border: "1px solid rgba(42,106,191,0.18)" }}
            whileHover={{ backgroundColor: "rgba(42,106,191,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
          >
            {GUIDE_STEPS[guideStep].cta}
          </motion.button>
        )}
      </motion.div>

      <div className="rounded-xl px-3.5 py-3" style={{ background: "rgba(42,106,191,0.04)", border: "1px solid rgba(42,106,191,0.12)" }}>
        <p className="mb-2 text-[8.5px] uppercase tracking-[.2em]" style={{ color: C.txt3 }}>All steps</p>
        <div className="space-y-1.5">
          {GUIDE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              onClick={() => setGuideStep(i)}
              className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1"
              style={{ background: i === guideStep ? "rgba(42,106,191,0.08)" : "transparent" }}
              whileHover={{ backgroundColor: i === guideStep ? "rgba(42,106,191,0.08)" : "rgba(140,188,228,0.08)" }}
              transition={spring.snappy}
            >
              <span className="text-[10px] w-[28px]" style={{ color: C.txt3 }}>{s.time}</span>
              <p className="text-[11.5px]" style={{ color: i <= guideStep ? C.txt2 : C.txt3 }}>{s.label}</p>
              {i < guideStep && <span className="ml-auto text-[10px]" style={{ color: C.green }}>Done</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => setGuideStep((s) => Math.max(0, s - 1))}
          disabled={guideStep === 0}
          className="flex-1 rounded-lg px-3 py-2 text-[11px] disabled:opacity-50"
          style={{
            color: guideStep === 0 ? C.txt3 : C.txt2,
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${guideStep === 0 ? "rgba(140,188,228,0.14)" : "rgba(140,188,228,0.24)"}`,
          }}
          whileHover={guideStep > 0 ? { backgroundColor: "rgba(255,255,255,0.9)" } : {}}
          whileTap={guideStep > 0 ? { scale: 0.98 } : {}}
          transition={spring.snappy}
        >
          ← Prev
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setGuideStep((s) => Math.min(GUIDE_STEPS.length - 1, s + 1))}
          disabled={guideStep === GUIDE_STEPS.length - 1}
          className="flex-1 rounded-lg px-3 py-2 text-[11px] disabled:opacity-50"
          style={{
            color: guideStep === GUIDE_STEPS.length - 1 ? C.txt3 : C.accent,
            background: guideStep === GUIDE_STEPS.length - 1 ? "rgba(255,255,255,0.7)" : "rgba(42,106,191,0.08)",
            border: `1px solid ${guideStep === GUIDE_STEPS.length - 1 ? "rgba(140,188,228,0.16)" : "rgba(42,106,191,0.22)"}`,
          }}
          whileHover={guideStep < GUIDE_STEPS.length - 1 ? { backgroundColor: "rgba(42,106,191,0.12)" } : {}}
          whileTap={guideStep < GUIDE_STEPS.length - 1 ? { scale: 0.98 } : {}}
          transition={spring.snappy}
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
}

// ── Analysis card ──────────────────────────────────────────────────────────────
function AnalysisCard({
  data, phase, collapsed, onToggle,
}: {
  data: AnalysisData; phase: number; collapsed: boolean; onToggle: () => void;
}) {
  const done = phase >= NUM_FIELDS;
  const analysisLines = useMemo(
    () => ANALYSIS_FIELDS.map((f) => `${f.label}: ${data[f.key]}`),
    [data],
  );
  const targetLines = useMemo(
    () => (done ? analysisLines : analysisLines.slice(0, phase)),
    [done, analysisLines, phase],
  );
  const [typedLines, setTypedLines] = useState<string[]>([]);

  useEffect(() => {
    if (collapsed) {
      setTypedLines([]);
      return;
    }
    if (done) {
      // When analysis is complete, show final lines immediately (no typing effect).
      setTypedLines(targetLines);
      return;
    }
    setTypedLines((prev) =>
      targetLines.map((line, idx) => {
        const existing = prev[idx] ?? "";
        return line.startsWith(existing) ? existing : "";
      }),
    );
    if (targetLines.length === 0) return;

    const timer = setInterval(() => {
      let stop = false;
      setTypedLines((prev) => {
        const next = targetLines.map((_, idx) => prev[idx] ?? "");
        let advanced = false;
        for (let i = 0; i < targetLines.length; i += 1) {
          if (next[i].length < targetLines[i].length) {
            next[i] = targetLines[i].slice(0, next[i].length + 1);
            advanced = true;
            break;
          }
        }
        if (!advanced) stop = true;
        return next;
      });
      if (stop) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [collapsed, done, targetLines]);

  return (
    <div className="mb-4" style={{ background: "transparent" }}>
      {/* ── Header ── */}
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left transition-colors duration-150"
        style={{
          background: "rgba(255,255,255,0.48)",
          border: "1px solid rgba(132,180,222,0.32)",
          boxShadow: "0 6px 18px -14px rgba(20,58,102,0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.62)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.48)";
        }}
      >
        <span style={{ color: done ? C.green : C.amber, flexShrink: 0, display: "flex" }}>
          {done ? <IcoCheck size={14}/> : <IcoSpinner/>}
        </span>
        <span className={`font-medium ${uiFont.className} text-[12px]`}
          style={{ color: done ? C.green : C.amber }}>
          {done ? "Analysis complete" : "Analyzing..."}
        </span>
        {!done && (
          <span className="text-[11px]" style={{ color: C.txt3 }}>
            {Math.min(phase + 1, NUM_FIELDS)}/{NUM_FIELDS}
          </span>
        )}
        <span
          style={{
            color: C.anLbl,
            opacity: done ? 0.7 : 0.35,
            display: "flex",
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 150ms ease",
          }}
        >
          <svg viewBox="0 0 14 14" fill="none" width={12} height={12} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </span>
      </button>

      {/* ── Body ── */}
      {!collapsed && (
        <div className="pt-2.5 pl-1">
          <div
            className="space-y-2 pl-3"
            style={{ borderLeft: `1.5px solid rgba(120,160,200,0.24)` }}
          >
            {typedLines.map((line, idx) => {
              const colonIdx = line.indexOf(": ");
              const label = colonIdx !== -1 ? line.slice(0, colonIdx) : null;
              const value = colonIdx !== -1 ? line.slice(colonIdx + 2) : line;
              return (
                <div key={`${analysisLines[idx]}-${idx}`}>
                  {label && (
                    <p className="text-[9.5px] font-semibold uppercase tracking-[.12em] mb-0.5"
                      style={{ color: done ? C.accent : "rgba(100,150,200,0.7)" }}>
                      {label}
                    </p>
                  )}
                  <p className="text-[11.5px] leading-[1.65]"
                    style={{ color: done ? C.txt2 : "rgba(82,105,126,0.72)" }}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          {phase < NUM_FIELDS && !done && (
            <p className="mt-1 pl-3 text-[11px] leading-[1.7]" style={{ color: "rgba(33,49,68,0.32)" }}>
              ...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Message components ─────────────────────────────────────────────────────────
function UserMessage({ text }: { text: string }) {
  return (
    <div className="mb-8 flex justify-end">
      <div className="max-w-[72%] rounded-[20px] px-5 py-3.5"
        style={{ background: C.userBub, border: "1px solid rgba(132,180,222,0.22)", boxShadow: "0 6px 20px -14px rgba(20,58,102,0.18)", backdropFilter: "blur(4px)" }}>
        <p className="text-[13.5px] leading-[1.7]" style={{ color: C.userTxt }}>{text}</p>
      </div>
    </div>
  );
}

function formatMessageParagraphs(text: string) {
  const paras = text.split(/\n\n+/).filter(Boolean);
  if (paras.length <= 1) {
    const lines = text.split(/\n/).filter(Boolean);
    if (lines.length <= 1) return [{ type: "lead" as const, text }];
    return lines.map((l, i) => ({ type: i === 0 ? "lead" as const : "body" as const, text: l }));
  }
  return paras.map((p, i) => ({
    type: i === 0 ? "lead" as const : "body" as const,
    text: p.replace(/^\d+\.\s+/, (m) => m),
  }));
}

function AssistantMessage({
  msg,
  onToggleAnalysis,
  onRegenerate,
  onCopy,
}: {
  msg: Msg;
  onToggleAnalysis: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
}) {
  const paragraphs = useMemo(() => formatMessageParagraphs(msg.text), [msg.text]);
  return (
    <div className="mb-8 flex flex-col items-start">
      {/* Analysis card */}
      {msg.analysis && (
        <AnalysisCard
          data={msg.analysis}
          phase={NUM_FIELDS}
          collapsed={msg.analysisCollapsed}
          onToggle={onToggleAnalysis}
        />
      )}
      {/* Response bubble — same max width as user messages, no side avatar */}
      <div
        className="w-full max-w-[72%] rounded-[20px] px-5 py-4"
        style={{
          background: "linear-gradient(160deg, rgba(250,253,255,0.84) 0%, rgba(243,250,255,0.74) 58%, rgba(238,248,255,0.7) 100%)",
          border: "1px solid rgba(120,160,200,0.22)",
          boxShadow: "0 8px 24px -20px rgba(20,50,90,0.18)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className={`space-y-2.5 ${uiFont.className}`}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[13px] leading-[1.78]"
              style={{
                color: p.type === "lead" ? C.txt : C.txt2,
                fontWeight: p.type === "lead" ? 450 : 400,
              }}
            >
              {p.type === "body" && i > 0 && (
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: C.accentLt, opacity: 0.7 }}/>
              )}
              {p.text}
            </p>
          ))}
        </div>
      </div>
      {/* Detached action icons */}
      <div className="mt-2.5 flex items-center gap-2">
        <Tip label="Regenerate">
          <motion.button
            type="button"
            onClick={onRegenerate}
            className="p-1"
            style={{ color: C.txt3 }}
            whileHover={{ color: C.accent, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={spring.snappy}
          >
            <IcoRegenerate/>
          </motion.button>
        </Tip>
        <Tip label="Copy">
          <motion.button
            type="button"
            onClick={onCopy}
            className="p-1"
            style={{ color: C.txt3 }}
            whileHover={{ color: C.accent, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={spring.snappy}
          >
            <IcoCopy/>
          </motion.button>
        </Tip>
      </div>
    </div>
  );
}

function BuildingCard({ phase, analysis }: { phase: number; analysis: AnalysisData }) {
  return (
    <div className="mb-8">
      <AnalysisCard data={analysis} phase={phase} collapsed={false} onToggle={() => {}}/>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mb-8 flex w-full max-w-[720px] justify-start">
      <div
        className="inline-flex w-full max-w-[72%] items-center gap-2.5 rounded-[18px] px-5 py-3.5"
        style={{
          background: "linear-gradient(160deg, rgba(248,252,255,0.72) 0%, rgba(239,248,255,0.62) 58%, rgba(233,246,255,0.58) 100%)",
          border: "1px solid rgba(132,180,222,0.24)",
          boxShadow: "0 8px 20px -18px rgba(20,58,102,0.2)",
        }}
      >
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.6 }}/>
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.6 }}/>
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.6 }}/>
      </div>
    </div>
  );
}

// ── Input dock ─────────────────────────────────────────────────────────────────
const InputDock = memo(function InputDock({ analyzing, onSend, onRegisterFocus }: {
  analyzing: boolean; onSend: (t: string) => void; onRegisterFocus?: (fn: () => void) => void;
}) {
  const [input,   setInput]   = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const t = input.trim();
    if (!t || analyzing) return;
    onSend(t);
    setInput("");
    if (ref.current) ref.current.style.height = "auto";
  }, [input, analyzing, onSend]);

  const onInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const canSend = input.trim().length > 0 && !analyzing;

  useEffect(() => {
    if (!onRegisterFocus) return;
    onRegisterFocus(() => {
      ref.current?.focus();
    });
  }, [onRegisterFocus]);

  return (
    <div className="relative z-20 shrink-0 px-6 pb-6 pt-4"
      style={{
        background: "linear-gradient(180deg, rgba(245,251,255,0.98) 0%, rgba(239,248,255,0.97) 100%)",
        backdropFilter: "blur(4px)",
        borderTop: "1px solid rgba(140,188,228,0.18)",
      }}>
      <div className="mx-auto max-w-[760px]">
        {/* Quick prompts */}
        <div className="mb-3 flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_PROMPTS.map(q => (
            <motion.button
              key={q}
              type="button"
              disabled={analyzing}
              onClick={() => { if (!analyzing) onSend(q); }}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[10px] whitespace-nowrap disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(140,188,228,0.24)",
                color: C.txt2,
                boxShadow: "0 1px 8px -3px rgba(15,55,110,0.08)",
              }}
              whileHover={{ backgroundColor: "rgba(42,106,191,0.06)", borderColor: "rgba(42,106,191,0.22)", color: C.accent }}
              whileTap={{ scale: 0.98 }}
              transition={spring.snappy}
            >
              {q}
            </motion.button>
          ))}
        </div>

        {/* Composer box */}
        <motion.div
          className="overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.995)",
            border: `1px solid ${focused ? "rgba(42,106,191,0.30)" : C.cardBdr}`,
            boxShadow: focused ? `0 0 0 3px rgba(42,106,191,0.07), ${C.shadowMd}` : C.shadow,
          }}
          animate={{ scale: focused ? 1.003 : 1 }}
          transition={spring.gentle}
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <textarea
              ref={ref}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onInput={onInput}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }}}
              rows={1}
              disabled={analyzing}
              placeholder={analyzing ? "Analysis in progress…" : "Share what's on your mind…"}
              className="flex-1 resize-none bg-transparent text-[13px] outline-none disabled:opacity-50"
              style={{
                color: C.txt,
                caretColor: C.accent,
                minHeight: 24,
                maxHeight: 104,
                lineHeight: "1.65",
                fontFamily: uiFont.style.fontFamily,
              }}
            />
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[9px]" style={{ color: C.txt3 }}>{input.length}</span>
              <motion.button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className="flex h-7 w-7 items-center justify-center rounded-xl disabled:opacity-30"
                style={{
                  background: canSend ? `linear-gradient(135deg, ${C.accent}, ${C.teal})` : "rgba(140,188,228,0.18)",
                  color: "white",
                  boxShadow: canSend ? "0 2px 12px -3px rgba(42,106,191,0.42)" : "none",
                }}
                whileHover={canSend ? { scale: 1.08 } : {}}
                whileTap={canSend ? { scale: 0.92 } : {}}
                transition={spring.snappy}
              >
                <IcoSend/>
              </motion.button>
            </div>
          </div>
          {/* Keyboard hint */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring.gentle}
                className="overflow-hidden border-t px-4"
                style={{ borderColor: "rgba(140,188,228,0.14)" }}
              >
                <p className="py-1.5 text-[9.5px]" style={{ color: C.txt3 }}>
                  Press <kbd className="rounded px-1 py-0.5 text-[8.5px]" style={{ background: "rgba(42,106,191,0.08)", color: C.txt2 }}>Enter</kbd> to send
                  &nbsp;·&nbsp;
                  <kbd className="rounded px-1 py-0.5 text-[8.5px]" style={{ background: "rgba(42,106,191,0.08)", color: C.txt2 }}>Shift+Enter</kbd> for newline
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function PsychShowroomPrototypeClient({ embed = false }: { embed?: boolean }) {
  const rm = useReducedMotion();

  const [messages,  setMessages]  = useState<Msg[]>([WELCOME]);
  const [build,     setBuild]     = useState<BuildState>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipeline,  setPipeline]  = useState<PipeStep[]>(PIPE_INIT);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab,  setPanelTab]  = useState<SidebarTab>("expert");
  const [guideStep, setGuideStep] = useState(0);
  const [showSplash,        setShowSplash]        = useState(true);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showShareModal,    setShowShareModal]    = useState(false);
  const [showKbEditor,      setShowKbEditor]      = useState(false);
  const [codeToolTab, setCodeToolTab] = useState<"source" | "clone" | "config">("source");
  const [psychSourcePage, setPsychSourcePage] = useState<"pipeline" | "prompt" | "safety">("pipeline");
  const [cfgModel,  setCfgModel]  = useState("qwen-qwq");
  const [cfgTemp,   setCfgTemp]   = useState(0.7);
  const [cfgTokens, setCfgTokens] = useState(2048);
  const [cfgTopP,   setCfgTopP]   = useState(0.95);
  const [cloneCopied, setCloneCopied] = useState(false);

  const chatEnd    = useRef<HTMLDivElement>(null);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const guideInputFocusRef = useRef<(() => void) | null>(null);

  // Cleanup timers
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Auto-scroll
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      chatEnd.current?.scrollIntoView({ behavior: rm ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, build, rm]);

  useEffect(() => {
    if (!embed) return;
    window.scrollTo(0, 0);
  }, [embed]);

  const handleSend = useCallback((text: string) => {
    if (analyzing) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Append user message
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", text, analysisCollapsed: false }]);

    const analysis = generateAnalysis(text);
    setAnalyzing(true);
    setBuild({ phase: 0, analysis });

    // Reset pipeline
    setPipeline(PIPE_INIT.map(s => ({ ...s, status: "pending" as StepStatus })));

    const PHASE_MS  = 480;
    const TYPING_MS = 0;

    // Reveal analysis fields
    for (let i = 1; i <= NUM_FIELDS; i++) {
      const t = setTimeout(() => {
        setBuild(prev => prev ? { ...prev, phase: i } : null);
        if (i === 2) setPipeline(prev => prev.map((s, k) =>
          k === 0 ? { ...s, status: "running" } : s) as PipeStep[]);
        if (i === 3) setPipeline(prev => prev.map((s, k) =>
          k === 0 ? { ...s, status: "done" } : k === 1 ? { ...s, status: "running" } : s) as PipeStep[]);
        if (i === 5) setPipeline(prev => prev.map((s, k) =>
          k <= 1 ? { ...s, status: "done" } : k === 2 ? { ...s, status: "running" } : s) as PipeStep[]);
      }, i * PHASE_MS);
      timersRef.current.push(t);
    }

    // Typing indicator pause, then commit response
    const tReply = setTimeout(() => {
      const replyText = buildReply(text);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: replyText,
        analysis,
        analysisCollapsed: true,
      }]);
      setPipeline(PIPE_INIT.map(s => ({ ...s, status: "done" as StepStatus })));
      setBuild(null);
      setAnalyzing(false);
    }, NUM_FIELDS * PHASE_MS + TYPING_MS);
    timersRef.current.push(tReply);
  }, [analyzing]);

  const toggleAnalysis = useCallback((id: string) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, analysisCollapsed: !m.analysisCollapsed } : m
    ));
  }, []);

  const onRestart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    setMessages([WELCOME]);
    setBuild(null);
    setAnalyzing(false);
    setPipeline(PIPE_INIT);
    setShowRestartConfirm(false);
  }, []);

  const requestRestart = useCallback(() => {
    setShowRestartConfirm(true);
  }, []);

  const openPanel = useCallback((tab: SidebarTab) => {
    if (tab === "code" && panelTab !== "code") {
      setCodeToolTab("source");
      setPsychSourcePage("pipeline");
    }
    setPanelTab(tab);
    setPanelOpen(v => panelTab === tab ? !v : true);
  }, [panelTab]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setCloneCopied(false);
  }, []);

  const showTyping = build !== null && build.phase >= NUM_FIELDS;

  const copyMessage = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, []);

  const copyCurrentLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  }, []);

  const regenerateMessage = useCallback((assistantId: string) => {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === assistantId && m.role === "assistant");
      if (idx <= 0) return prev;
      const previousUser = [...prev.slice(0, idx)].reverse().find(m => m.role === "user");
      if (!previousUser) return prev;
      const refreshed = buildReply(previousUser.text);
      return prev.map((m, i) => (i === idx ? { ...m, text: refreshed } : m));
    });
  }, []);

  const runGuideAction = useCallback((action?: GuideStep["action"]) => {
    if (!action) return;
    if (action === "focusInput") {
      guideInputFocusRef.current?.();
      return;
    }
    if (action === "openExpert") {
      setPanelTab("expert");
      setPanelOpen(true);
      return;
    }
    if (action === "openCode") {
      setCodeToolTab("source");
      setPsychSourcePage("pipeline");
      setPanelTab("code");
      setPanelOpen(true);
      return;
    }
    if (action === "copyLink") {
      void copyCurrentLink();
      return;
    }
    if (action === "restart") {
      requestRestart();
    }
  }, [copyCurrentLink, requestRestart]);

  return (
    <>
    <AnimatePresence>
      {showSplash && <PsychSplashScreen onEnter={() => setShowSplash(false)} />}
    </AnimatePresence>
    <motion.div
      className={`relative flex h-screen flex-col overflow-hidden ${uiFont.className}`}
      style={{ background: C.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={spring.fadeIn}
    >
      <style>{`
        @keyframes typing-dot {
          0%,80%,100%{opacity:.3;transform:scale(1)}
          40%{opacity:1;transform:scale(1.15)}
        }
        .typing-dot{animation:typing-dot 1.2s ease-in-out infinite}
        .typing-dot:nth-child(1){animation-delay:0s}
        .typing-dot:nth-child(2){animation-delay:.15s}
        .typing-dot:nth-child(3){animation-delay:.3s}
        @keyframes sk-pulse{0%,100%{opacity:.2}50%{opacity:.4}}
        .skeleton-pulse{animation:sk-pulse 2s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){
          .typing-dot,.skeleton-pulse{animation:none!important}
        }
      `}</style>

      {/* Soft background radials */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: [
            "radial-gradient(circle at 18% 18%, rgba(200,220,240,0.22) 0%, transparent 44%)",
            "radial-gradient(circle at 82% 22%, rgba(180,220,215,0.16) 0%, transparent 40%)",
            "radial-gradient(circle at 55% 82%, rgba(200,220,240,0.18) 0%, transparent 44%)",
          ].join(","),
        }}/>
      </div>

      {/* ── Navigation ── */}
      <motion.header
        className="relative z-20 shrink-0 flex items-center gap-3 px-6 py-3"
        style={{
          background: C.nav,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.navBdr}`,
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring.gentle, delay: 0.1 }}
      >
        {/* Brand: title + tag pill, pill height matches text block */}
        <div className="mr-1 flex min-w-0 items-stretch gap-x-2.5">
          <div className="leading-none flex flex-col justify-between py-px">
            <p className="text-[9px] tracking-[.16em] uppercase" style={{ color: C.txt3 }}>Welcome to</p>
            <p className={`text-[13.5px] font-semibold tracking-[.01em] ${displayFont.className}`}
              style={{ color: C.accent }}>Therapy Space</p>
          </div>
          <span
            className={`shrink-0 flex items-center self-stretch rounded-md px-2.5 text-[10px] font-medium tracking-[.04em] ${uiFont.className}`}
            style={{ background: "rgba(59,111,165,0.07)", color: C.accent, border: `1px solid rgba(59,111,165,0.18)` }}
          >
            Trusted Care
          </span>
        </div>

        <div className="flex-1"/>

        {/* Actions */}
        <nav className="flex items-center gap-1.5">
          <Tip label="Expert profile — advisory partners for this showroom">
            <NavBtn onClick={() => openPanel("expert")} active={panelOpen && panelTab === "expert"} wide>
              <IcoExpert/>
              <span className="text-[11px] font-medium">Experts</span>
            </NavBtn>
          </Tip>

          <Tip label="Code Tool">
            <NavBtn onClick={() => openPanel("code")} active={panelOpen && panelTab === "code"} wide>
              <IcoCode/>
              <span className="text-[11px] font-medium">Code</span>
            </NavBtn>
          </Tip>

          <div className="mx-1 h-5 w-px" style={{ background: "rgba(140,188,228,0.24)" }}/>

          <Tip label="Copy link">
            <NavBtn onClick={() => setShowShareModal(true)}>
              <IcoShare/>
            </NavBtn>
          </Tip>

          <Tip label="Restart conversation">
            <NavBtn onClick={requestRestart}>
              <IcoRestart/>
            </NavBtn>
          </Tip>

          <Tip label="2-minute guide">
            <NavBtn onClick={() => openPanel("guide")} active={panelOpen && panelTab === "guide"} wide>
              <IcoGuide/>
              <span className="text-[11px] font-medium">Guide</span>
            </NavBtn>
          </Tip>
        </nav>
      </motion.header>

      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* ── Chat feed ── */}
      <div className="relative z-10 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(0,0,0,0.06) transparent` }}>
        <div className="mx-auto w-full max-w-[720px] px-8 pt-10 pb-6">

          {/* Intro strip */}
          <motion.div
            className="mb-8 w-full max-w-[720px] rounded-2xl px-4 py-3.5"
            style={{
              background: "linear-gradient(130deg, rgba(248,252,255,0.68) 0%, rgba(240,248,255,0.58) 54%, rgba(235,245,255,0.54) 100%)",
              border: "1px solid rgba(120,160,200,0.2)",
              boxShadow: "0 8px 22px -18px rgba(20,50,90,0.14)",
              backdropFilter: "blur(4px)",
            }}
            initial={rm ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.gentle, delay: 0.2 }}
          >
            <p className={`mb-1 text-[11px] font-semibold tracking-[.02em] ${uiFont.className}`} style={{ color: C.accent }}>
              Little Cosmic Cuddle Corner
            </p>
            <p className="text-[11.5px] leading-[1.6]" style={{ color: C.txt2 }}>
              Hello. I&apos;m here to listen.
            </p>
            <p className="mt-1 text-[11px] leading-[1.58]" style={{ color: C.txt3 }}>
              Share what&apos;s on your mind. Before I respond, you&apos;ll see a brief analysis — transparency, not a black box.
            </p>
          </motion.div>

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={rm ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.gentle, delay: idx === 0 ? 0.3 : 0 }}
              >
                {m.role === "user"
                  ? <UserMessage text={m.text}/>
                  : (
                    <AssistantMessage
                      msg={m}
                      onToggleAnalysis={() => toggleAnalysis(m.id)}
                      onCopy={() => { void copyMessage(m.text); }}
                      onRegenerate={() => regenerateMessage(m.id)}
                    />
                  )
                }
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Building analysis */}
          <AnimatePresence>
            {build && !showTyping && (
              <motion.div
                key="build"
                initial={rm ? false : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={spring.gentle}
              >
                <BuildingCard phase={build.phase} analysis={build.analysis}/>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {showTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={spring.gentle}
              >
                <TypingIndicator/>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEnd} className="h-4"/>
        </div>
      </div>

      {/* ── Input ── */}
      <InputDock analyzing={analyzing} onSend={handleSend} onRegisterFocus={(fn) => { guideInputFocusRef.current = fn; }}/>
      </div>

      <AnimatePresence>
        {panelOpen && panelTab === "guide" && (
          <SidePanel variant="dock" title="Quick Guide" onClose={closePanel}>
            <PsychQuickGuideContent
              guideStep={guideStep}
              setGuideStep={setGuideStep}
              runGuideAction={runGuideAction}
            />
          </SidePanel>
        )}
      </AnimatePresence>
      </div>

      {/* ── Panel backdrop (docked guide does not dim the chat) ── */}
      <AnimatePresence>
        {panelOpen && panelTab !== "guide" && (
          <motion.div
            className="fixed inset-0 z-30"
            onClick={closePanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring.fade}
            style={{ background: "rgba(8,26,52,0.1)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Side panel (analysis / expert / code) ── */}
      <AnimatePresence>
        {panelOpen && panelTab !== "guide" && (
          <SidePanel
            title={
              panelTab === "analysis" ? "Analysis"
              : panelTab === "expert"   ? "Expert Profile"
              :                           "Developer Tools"
            }
            onClose={closePanel}>

            {/* Analysis tab */}
            {panelTab === "analysis" && (
              <div className="space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[8.5px] uppercase tracking-[.22em]" style={{ color: C.txt3 }}>Pipeline progress</p>
                    <p className="text-[9.5px] font-medium" style={{ color: C.txt2 }}>
                      {pipeline.filter(s => s.status === "done").length} / {pipeline.length}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42,106,191,0.09)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${(pipeline.filter(s => s.status === "done").length / pipeline.length) * 100}%` }}
                      transition={spring.gentle}
                      style={{ background: `linear-gradient(90deg, ${C.accent}, ${C.teal})` }}
                    />
                  </div>
                </div>

                {/* Pipeline steps */}
                {pipeline.map((step, i) => (
                  <motion.div
                    key={step.label}
                    layout
                    className="rounded-xl px-3.5 py-3"
                    style={{
                      background: step.status === "running" ? "rgba(42,106,191,0.05)"
                        : step.status === "done" ? C.greenBg : "rgba(255,255,255,0.68)",
                      border: `1px solid ${
                        step.status === "running" ? "rgba(42,106,191,0.20)"
                        : step.status === "done" ? C.greenBdr : C.cardBdr}`,
                    }}
                    transition={spring.gentle}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5"
                        style={{
                          background: step.status === "done" ? C.greenBg : "rgba(42,106,191,0.07)",
                          border: `1px solid ${step.status === "done" ? C.greenBdr : "rgba(42,106,191,0.16)"}`,
                          color: step.status === "done" ? C.green : C.txt3,
                        }}>
                        {step.status === "done" ? <IcoCheck size={10}/>
                          : step.status === "running" ? <IcoSpinner/>
                          : <span className="text-[9px]" style={{ color: C.txt3 }}>{i + 1}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium" style={{ color: C.txt }}>{step.label}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: C.txt2 }}>{step.detail}</p>
                        <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-medium"
                          style={{
                            background: step.status === "done" ? C.greenBg : step.status === "running" ? "rgba(42,106,191,0.07)" : "rgba(140,188,228,0.09)",
                            color: step.status === "done" ? C.green : step.status === "running" ? C.accent : C.txt3,
                            border: `1px solid ${step.status === "done" ? C.greenBdr : step.status === "running" ? "rgba(42,106,191,0.18)" : "rgba(140,188,228,0.2)"}`,
                          }}>
                          {step.status === "done" ? "Complete" : step.status === "running" ? "Running" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Analysis fields legend */}
                <div className="rounded-xl px-3.5 py-3" style={{ background: "rgba(42,106,191,0.04)", border: "1px solid rgba(42,106,191,0.12)" }}>
                  <p className="mb-2 text-[8.5px] uppercase tracking-[.2em]" style={{ color: C.txt3 }}>Analysis fields</p>
                  <div className="space-y-1.5">
                    {ANALYSIS_FIELDS.map(f => (
                      <div key={f.key} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full shrink-0" style={{ background: C.accentLt }}/>
                        <p className="text-[11px]" style={{ color: C.txt2 }}>{f.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expert tab */}
            {panelTab === "expert" && (
              <div className="space-y-4">
                <p className="text-[11px] leading-[1.65]" style={{ color: C.txt2 }}>
                  Co-designed with professional partners whose expertise shapes our knowledge base, review process, and safety boundaries.
                </p>

                {/* Expert profiles */}
                <div>
                  <p className="mb-2 text-[8.5px] uppercase tracking-[.2em]" style={{ color: C.txt3 }}>Clinical Advisory Panel</p>
                  <div className="space-y-2.5">
                    {[
                      {
                        initials: "EL",
                        name: "Dr. Elena Liu",
                        title: "Clinical Psychologist",
                        affiliation: "Columbia University",
                        specialty: "CBT · Stress Recovery",
                        cred: "PhD, Licensed Psychologist",
                      },
                      {
                        initials: "MR",
                        name: "Dr. Marcus Reid",
                        title: "Counseling Research Lead",
                        affiliation: "NYU Langone Health",
                        specialty: "Relationship Communication",
                        cred: "PsyD, ABPP Certified",
                      },
                      {
                        initials: "SP",
                        name: "Dr. Sara Park",
                        title: "Crisis Intervention Specialist",
                        affiliation: "Weill Cornell Medicine",
                        specialty: "Safety Protocols · Risk Assessment",
                        cred: "PhD, APA Fellow",
                      },
                    ].map((e) => (
                      <div key={e.name} className="flex gap-3 rounded-2xl p-3.5"
                        style={{ background: C.card, border: `1px solid ${C.cardBdr}`, boxShadow: C.shadow }}>
                        {/* Avatar */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.teal} 100%)` }}>
                          {e.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12.5px] font-semibold leading-tight" style={{ color: C.txt }}>{e.name}</p>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium tracking-[.06em]"
                              style={{ background: C.accentSoft, color: C.accent, border: `1px solid rgba(59,111,165,0.18)` }}>
                              Verified
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px]" style={{ color: C.txt2 }}>{e.title}</p>
                          <p className="mt-0.5 text-[10px]" style={{ color: C.txt3 }}>{e.affiliation}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full px-2 py-0.5 text-[9.5px]"
                              style={{ background: "rgba(29,155,133,0.07)", color: C.teal, border: "1px solid rgba(29,155,133,0.18)" }}>
                              {e.specialty}
                            </span>
                            <span className="rounded-full px-2 py-0.5 text-[9.5px]"
                              style={{ background: "rgba(255,255,255,0.8)", color: C.txt3, border: `1px solid ${C.cardBdr}` }}>
                              {e.cred}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge base */}
                <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.82)", border: `1px solid ${C.cardBdr}` }}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[.14em]" style={{ color: C.accent }}>Knowledge Base</p>
                    <motion.button
                      type="button"
                      onClick={() => setShowKbEditor(true)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium"
                      style={{ background: C.accentSoft, color: C.accent, border: `1px solid rgba(59,111,165,0.2)` }}
                      whileHover={{ background: `rgba(59,111,165,0.12)` }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </motion.button>
                  </div>
                  <p className="mb-3 text-[11.5px] leading-[1.72]" style={{ color: C.txt2 }}>
                    Expert-co-built with reviewed frameworks, evidence-informed strategies, and safety constraints.
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Intervention Frameworks", count: "14 entries", icon: "📋" },
                      { label: "Coping Strategies", count: "28 entries", icon: "🌿" },
                      { label: "Safety Constraints", count: "7 rules", icon: "🔒" },
                      { label: "Response Templates", count: "11 entries", icon: "💬" },
                    ].map((kb) => (
                      <div key={kb.label} className="flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ background: "rgba(59,111,165,0.04)", border: "1px solid rgba(59,111,165,0.1)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px]">{kb.icon}</span>
                          <p className="text-[11px]" style={{ color: C.txt2 }}>{kb.label}</p>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: C.txt3 }}>{kb.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[8.5px] uppercase tracking-[.2em]" style={{ color: C.txt3 }}>Core principles</p>
                  <div className="space-y-2">
                    {[
                      "Safety-aware language in every reply",
                      "Non-diagnostic framing throughout",
                      "Practical first steps, no clinical claims",
                      "Transparent reasoning before each response",
                    ].map(p => (
                      <div key={p} className="flex items-start gap-2">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.teal }}/>
                        <p className="text-[11px] leading-relaxed" style={{ color: C.txt2 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Code tab — underline tabs, one dropdown for source files, no nested pill stacks */}
            {panelTab === "code" && (
              <div className="space-y-4">
                <p className={`text-[12px] leading-[1.55] ${uiFont.className}`} style={{ color: C.txt2 }}>
                  Browse the spec, copy the install command, or adjust demo model settings.
                </p>

                <div className="flex flex-wrap gap-5 border-b" style={{ borderColor: "rgba(132,180,222,0.4)" }}>
                  {(["source", "clone", "config"] as const).map(t => {
                    const on = codeToolTab === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCodeToolTab(t)}
                        className={`-mb-px border-b-2 px-0.5 pb-2.5 text-[13px] font-semibold transition-colors ${uiFont.className}`}
                        style={{
                          color: on ? C.accent : C.txt2,
                          borderColor: on ? C.accent : "transparent",
                        }}
                      >
                        {t === "source" ? "Source" : t === "clone" ? "Clone" : "Config"}
                      </button>
                    );
                  })}
                </div>

                {codeToolTab === "source" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="psych-code-src" className={`block text-[12px] font-semibold ${uiFont.className}`} style={{ color: C.txt }}>
                        File
                      </label>
                      <select
                        id="psych-code-src"
                        value={psychSourcePage}
                        onChange={e => setPsychSourcePage(e.target.value as "pipeline" | "prompt" | "safety")}
                        className="mt-1.5 w-full rounded-lg border py-2.5 px-3 text-[13px] outline-none"
                        style={{ borderColor: C.cardBdr, background: "rgba(255,255,255,0.95)", color: C.txt, fontFamily: uiFont.style.fontFamily }}
                      >
                        <option value="pipeline">psych_pipeline.yaml</option>
                        <option value="prompt">system_prompt.md</option>
                        <option value="safety">Safety · local runtime</option>
                      </select>
                    </div>

                    <motion.div
                      key={psychSourcePage}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={spring.gentle}
                      className="rounded-xl p-4"
                      style={{ background: C.card, border: `1px solid ${C.cardBdr}`, boxShadow: C.shadow }}
                    >
                      {psychSourcePage === "pipeline" && (
                        <>
                          <p
                            className="mb-3 text-[11px] font-mono font-medium"
                            style={{ color: C.txt3 }}
                          >
                            psych_pipeline.yaml
                          </p>
                          <pre
                            className="m-0 text-[12px] leading-[1.8] whitespace-pre-wrap"
                            style={{ color: C.txt2, fontFamily: monoFont.style.fontFamily }}
                          >
{`mode: psych_expert_visible

pipeline:
  context_decomposition
  signal_mapping
  intervention_planning

response_style:
  empathy:       high
  structure:     visible
  actionability: concise
  safety:        enforced`}
                          </pre>
                        </>
                      )}
                      {psychSourcePage === "prompt" && (
                        <>
                          <p className="mb-3 text-[11px] font-mono font-medium" style={{ color: C.txt3 }}>system_prompt.md</p>
                          <pre
                            className="m-0 text-[12px] leading-[1.75] whitespace-pre-wrap"
                            style={{ color: C.txt2, fontFamily: monoFont.style.fontFamily }}
                          >
{`You are a supportive psychology 
assistant. Before each response:
1. Show transparent analysis
2. Identify emotional state
3. Map psychological signals
4. Plan evidence-based response

Always: Safety-first, non-diagnostic,
practical, empathetic.`}
                          </pre>
                        </>
                      )}
                      {psychSourcePage === "safety" && (
                        <div>
                          <ul className="m-0 list-none space-y-3 border-l-2 pl-4" style={{ borderColor: "rgba(59,111,165,0.25)" }}>
                            {[
                              "Non-diagnostic phrasing; crisis resources when needed",
                              "No storage of session text in this demo build",
                              "Transparent analysis fields before the conversational reply",
                            ].map(line => (
                              <li key={line} className="text-[13px] leading-relaxed" style={{ color: C.txt2 }}>{line}</li>
                            ))}
                          </ul>
                          <p
                            className="mt-4 border-t pt-3 text-[12px] leading-relaxed"
                            style={{ color: C.green, borderColor: "rgba(132,180,222,0.2)" }}
                          >
                            All processing runs locally. No data is stored or transmitted.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}

                {codeToolTab === "clone" && (
                  <div className="space-y-3">
                    <p className="text-[13px] leading-[1.65]" style={{ color: C.txt2 }}>
                      Clone the therapy showroom template — pipeline, analysis UI, and default prompts in one repo.
                    </p>
                    <div className="overflow-hidden rounded-lg" style={{ border: "1px solid rgba(42,106,191,0.25)", background: "rgba(14,32,52,0.96)" }}>
                      <div
                        className="flex items-center gap-2 border-b px-3 py-2.5"
                        style={{ borderColor: "rgba(100,150,200,0.25)", fontFamily: monoFont.style.fontFamily }}
                      >
                        <span className="text-[12px] text-white/55">Terminal</span>
                      </div>
                      <pre className="m-0 px-3 py-3.5 text-[12px] leading-[1.9] whitespace-pre-wrap" style={{ color: "rgba(130,210,160,0.95)", fontFamily: monoFont.style.fontFamily }}>{PSYCH_CLONE_SNIPPET}</pre>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(PSYCH_CLONE_SNIPPET).catch(() => {});
                        setCloneCopied(true);
                        window.setTimeout(() => setCloneCopied(false), 2000);
                      }}
                      className="w-full rounded-lg py-3 text-[14px] font-semibold"
                      style={{
                        border: `1px solid ${cloneCopied ? C.accent : "rgba(42,106,191,0.3)"}`,
                        background: cloneCopied ? "rgba(42,106,191,0.1)" : "rgba(255,255,255,0.95)",
                        color: cloneCopied ? C.accent : C.txt,
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={spring.snappy}
                    >
                      {cloneCopied ? "Copied" : "Copy command"}
                    </motion.button>
                  </div>
                )}

                {codeToolTab === "config" && (
                  <div className="space-y-4">
                    <div>
                      <p className={`mb-1.5 text-[12px] font-semibold ${uiFont.className}`} style={{ color: C.txt }}>Model</p>
                      <select
                        value={cfgModel}
                        onChange={e => setCfgModel(e.target.value)}
                        className="w-full rounded-lg border py-2.5 px-3 text-[13px] outline-none"
                        style={{ borderColor: C.cardBdr, background: "rgba(255,255,255,0.95)", color: C.txt, fontFamily: uiFont.style.fontFamily }}
                      >
                        <option value="qwen-qwq">qwen-qwq — Deep Reasoning</option>
                        <option value="qwen-plus">qwen-plus — Balanced</option>
                        <option value="qwen-turbo">qwen-turbo — Fastest</option>
                      </select>
                    </div>
                    <div className="space-y-3 rounded-lg p-3" style={{ background: "rgba(42,106,191,0.05)", border: `1px solid rgba(42,106,191,0.12)` }}>
                      <div>
                        <p className={`text-[12px] font-medium ${uiFont.className}`} style={{ color: C.txt2 }}>{`Temperature — ${cfgTemp.toFixed(2)}`}</p>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={cfgTemp}
                          onChange={e => setCfgTemp(parseFloat(e.target.value))}
                          className="mt-1.5 w-full"
                          style={{ accentColor: C.accent }}
                        />
                      </div>
                      <div>
                        <p className={`text-[12px] font-medium ${uiFont.className}`} style={{ color: C.txt2 }}>{`Max tokens — ${cfgTokens}`}</p>
                        <input
                          type="range"
                          min={256}
                          max={4096}
                          step={128}
                          value={cfgTokens}
                          onChange={e => setCfgTokens(parseInt(e.target.value, 10))}
                          className="mt-1.5 w-full"
                          style={{ accentColor: C.accent }}
                        />
                      </div>
                      <div>
                        <p className={`text-[12px] font-medium ${uiFont.className}`} style={{ color: C.txt2 }}>{`Top P — ${cfgTopP.toFixed(2)}`}</p>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={cfgTopP}
                          onChange={e => setCfgTopP(parseFloat(e.target.value))}
                          className="mt-1.5 w-full"
                          style={{ accentColor: C.accent }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className={`mb-2 text-[12px] font-semibold ${uiFont.className}`} style={{ color: C.txt }}>Demo feature switches</p>
                      <ul className="m-0 list-none space-y-2 p-0">
                        {["Analysis strip visible", "Expert KB references", "Safety guardrails", "Session local-only"].map(label => (
                          <li
                            key={label}
                            className="flex items-center justify-between border-b border-[rgba(132,180,222,0.12)] py-1.5 text-[12px] last:border-0"
                            style={{ color: C.txt2 }}
                          >
                            <span>{label}</span>
                            <span className="font-mono text-[11px] font-medium" style={{ color: C.teal }}>on</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SidePanel>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Portaled to document root so `position:fixed` centers on viewport (parent motion.div uses transform). */}
    <AnimatePresence>
      {showShareModal && <PsychShareModal onClose={() => setShowShareModal(false)} />}
    </AnimatePresence>
    <AnimatePresence>
      {showKbEditor && <KbEditorModal onClose={() => setShowKbEditor(false)} />}
    </AnimatePresence>
    <AnimatePresence>
      {showRestartConfirm && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring.fade}
            style={{ background: "rgba(8,26,52,0.16)" }}
            onClick={() => setShowRestartConfirm(false)}
          />
          <motion.div
            className="fixed z-50 w-[min(92vw,440px)] overflow-hidden rounded-3xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.9 }}
            style={{
              left: "50%", top: "50%", x: "-50%", y: "-50%",
              background: "linear-gradient(180deg, rgba(250,254,255,0.99) 0%, rgba(241,249,255,0.97) 100%)",
              border: "1px solid rgba(132,180,222,0.4)",
              boxShadow: "0 28px 62px -32px rgba(14,50,110,0.5)",
            }}
          >
            <div className="relative px-6 py-5" style={{ borderBottom: "1px solid rgba(132,180,222,0.24)" }}>
              <motion.span
                className="absolute left-4 top-3 text-[12px]"
                style={{ color: "rgba(120,166,214,0.8)" }}
                animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                ✦
              </motion.span>
              <motion.span
                className="absolute right-5 top-4 text-[11px]"
                style={{ color: "rgba(153,194,236,0.78)" }}
                animate={{ y: [0, -2.5, 0], opacity: [0.45, 0.95, 0.45] }}
                transition={{ duration: 2.6, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
              >
                ✦
              </motion.span>

              <div className="mb-3 flex justify-center">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(42,106,191,0.16) 0%, rgba(29,155,133,0.14) 100%)",
                    border: "1px solid rgba(132,180,222,0.34)",
                    color: C.accent,
                  }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                >
                  <IcoRestart/>
                </motion.div>
              </div>

              <p className={`text-center text-[12px] font-semibold uppercase tracking-[.14em] ${uiFont.className}`} style={{ color: C.accent }}>
                Restart Session?
              </p>
              <p className="mt-2 text-center text-[13.5px] leading-relaxed" style={{ color: C.txt2 }}>
                Restarting will clear the current showroom conversation and analysis progress. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 px-6 py-4">
              <motion.button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="rounded-full px-4 py-2 text-[11.5px] font-medium"
                style={{ color: C.txt2, background: "rgba(255,255,255,0.88)", border: "1px solid rgba(140,188,228,0.24)" }}
                whileHover={{ backgroundColor: "rgba(255,255,255,1)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={onRestart}
                className="rounded-full px-4 py-2 text-[11.5px] font-medium text-white"
                style={{ background: "linear-gradient(90deg, #2a6abf 0%, #2f78d2 100%)", border: "1px solid rgba(42,106,191,0.35)" }}
                whileHover={{ filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                Restart Now
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
