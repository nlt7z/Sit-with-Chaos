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
const displayFont = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const uiFont = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const monoFont = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

// ── Spring presets ─────────────────────────────────────────────────────────────
const spring = {
  gentle:  { type: "spring", stiffness: 240, damping: 28, mass: 0.9 } as Transition,
  snappy:  { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } as Transition,
  smooth:  { type: "spring", stiffness: 160, damping: 24, mass: 1.0 } as Transition,
  bounce:  { type: "spring", stiffness: 340, damping: 20, mass: 0.6 } as Transition,
  fade:    { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] } as Transition,
  fadeIn:  { duration: 0.36, ease: [0.0, 0.0, 0.2, 1.0] } as Transition,
  fadeOut: { duration: 0.18, ease: [0.4, 0.0, 1.0, 1.0] } as Transition,
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  // Backgrounds
  bg:        "#f5f7fa",
  bgChat:    "rgba(249,251,253,0.98)",
  card:      "#ffffff",
  cardGlass: "rgba(255,255,255,0.86)",
  nav:       "rgba(252,253,255,0.97)",
  panel:     "rgba(250,252,255,0.98)",
  input:     "#ffffff",

  // Borders
  bdr:       "rgba(210,220,232,0.9)",
  bdrLight:  "rgba(210,220,232,0.5)",
  bdrFocus:  "rgba(59,111,180,0.5)",

  // Brand blue
  accent:    "#3b6fb4",
  accentLt:  "#6aa0d4",
  accentXlt: "rgba(59,111,180,0.08)",
  accentRing:"rgba(59,111,180,0.15)",

  // Teal
  teal:      "#169b82",
  tealLt:    "rgba(22,155,130,0.1)",
  tealBdr:   "rgba(22,155,130,0.22)",

  // Text
  txt:       "#18232e",
  txt2:      "#4f6477",
  txt3:      "#90a3b4",
  txtUser:   "#1a3045",

  // Status
  green:     "#12875a",
  greenBg:   "rgba(18,135,90,0.07)",
  greenBdr:  "rgba(18,135,90,0.22)",
  amber:     "#a05c00",
  amberBg:   "rgba(160,92,0,0.07)",
  amberBdr:  "rgba(160,92,0,0.22)",

  // Shadows — layered, directional
  shadow:    "0 1px 3px rgba(15,35,70,0.06), 0 6px 18px -8px rgba(15,35,70,0.1)",
  shadowMd:  "0 2px 6px rgba(15,35,70,0.06), 0 12px 32px -12px rgba(15,35,70,0.14)",
  shadowLg:  "0 4px 12px rgba(15,35,70,0.07), 0 24px 52px -20px rgba(15,35,70,0.18)",
  shadowXl:  "0 8px 24px rgba(15,35,70,0.08), 0 40px 80px -28px rgba(15,35,70,0.22)",
};

// ── Types ──────────────────────────────────────────────────────────────────────
type AnalysisData = {
  emotionalState:      string;
  coreConcern:         string;
  context:             string;
  stage:               string;
  toExplore:           string;
  approach:            string;
};

type Msg = {
  id:                string;
  role:              "user" | "assistant";
  text:              string;
  analysis?:         AnalysisData;
  analysisCollapsed: boolean;
};

type BuildState = { phase: number; analysis: AnalysisData } | null;
type SidebarTab  = "expert" | "code" | "guide";
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
  { label: "Context Analysis",    detail: "Identifying emotional tone and key themes",       status: "pending" },
  { label: "Signal Mapping",      detail: "Evaluating patterns and coping indicators",       status: "pending" },
  { label: "Response Planning",   detail: "Crafting empathetic, actionable guidance",        status: "pending" },
];

const GUIDE_STEPS: GuideStep[] = [
  { step: 1, time: "0:00", label: "Start",    hint: "Choose a prompt or share what's on your mind.",          cta: "Begin",        action: "focusInput"  },
  { step: 2, time: "0:20", label: "Observe",  hint: "Watch the analysis unfold in real-time."                                                               },
  { step: 3, time: "0:45", label: "Review",   hint: "Read the response and suggested next steps."                                                           },
  { step: 4, time: "1:05", label: "Explore",  hint: "Learn about the advisory panel and methodology.",        cta: "View profile", action: "openExpert"  },
  { step: 5, time: "1:25", label: "Code",     hint: "Explore the pipeline configuration and model settings.", cta: "View code",    action: "openCode"    },
  { step: 6, time: "1:45", label: "Complete", hint: "Share this experience or start fresh.",                  cta: "Share",        action: "copyLink"    },
];

const ANALYSIS_FIELDS: { key: keyof AnalysisData; label: string; color: string }[] = [
  { key: "emotionalState", label: "Emotional State", color: "#5b3ea8" },
  { key: "coreConcern",    label: "Core Concern",    color: "#1e6fa0" },
  { key: "context",        label: "Context",         color: "#127a60" },
  { key: "stage",          label: "Stage",           color: "#3b6fb4" },
  { key: "toExplore",      label: "To Explore",      color: "#a05c00" },
  { key: "approach",       label: "Approach",        color: "#3b6fb4" },
];

const NUM_FIELDS = ANALYSIS_FIELDS.length;

const WELCOME: Msg = {
  id:                "welcome",
  role:              "assistant",
  text:              "Hello. I'm here to listen.\n\nShare what's on your mind — a situation, a feeling, or something you've been carrying. Before I respond, you'll see a brief analysis of what I'm understanding.\n\nTransparency, not a black box.",
  analysisCollapsed: false,
};

const PSYCH_CLONE_SNIPPET = `git clone https://github.com/example/therapy-showroom
cd therapy-showroom && pnpm i && pnpm dev`;

// ── Data generators ────────────────────────────────────────────────────────────
function generateAnalysis(input: string): AnalysisData {
  const l = input.toLowerCase();
  const isSleep    = /sleep|insomnia|night|awake|overthink|dream/.test(l);
  const isStress   = /stress|pressure|anx|burnout|overwhelm|exhaust|nonstop|motions/.test(l);
  const isRelation = /partner|relationship|argument|fight|communicat|couple/.test(l);

  if (isRelation) return {
    emotionalState: "Relational distress — frustration, emotional depletion, possible helplessness",
    coreConcern:    "Escalating conflict cycles that prevent genuine emotional connection",
    context:        "Recurring arguments with partner; pattern appears systematic, not isolated",
    stage:          "Active listening · Goal: map escalation triggers · Strategy: reflective questioning",
    toExplore:      "Specific triggers, communication styles, recent relationship shifts, shared goals",
    approach:       "Identify Gottman escalation patterns first; introduce Nonviolent Communication second",
  };
  if (isSleep) return {
    emotionalState: "Elevated cognitive arousal with anxiety signal — sleep disruption as downstream effect",
    coreConcern:    "Involuntary rumination preventing sleep onset; pressure-cognition feedback loop active",
    context:        "User experiences persistent night-time overthinking affecting sleep quality",
    stage:          "Assessment phase · Goal: identify rumination type and triggers · Strategy: psychoeducation",
    toExplore:      "Sleep onset vs. maintenance issue, recurring thought themes, daytime stress load",
    approach:       "Cognitive defusion for night-time loops + structured worry-postponement + sleep hygiene",
  };
  if (isStress) return {
    emotionalState: "Chronic high-pressure state approaching depletion threshold — burnout markers elevated",
    coreConcern:    "Sustained demands without adequate recovery creating systemic exhaustion",
    context:        "User reports continuous work pressure with near-burnout severity",
    stage:          "Validation phase · Goal: assess burnout severity · Strategy: normalize and explore",
    toExplore:      "Work domain, support systems, previous coping patterns, boundary-setting capability",
    approach:       "Maslach burnout informal assessment first; boundary-setting and energy audit second",
  };
  return {
    emotionalState: "Generalized emotional flatness — low affect, possible existential drift or dissociation",
    coreConcern:    "Disconnection from meaning; 'going through the motions' indicates deeper depletion",
    context:        "User feels emotionally disconnected from daily activities without a clear cause",
    stage:          "Discovery phase · Goal: identify core stressor · Strategy: open, curious exploration",
    toExplore:      "Duration, specific triggers, impact on relationships, values and purpose alignment",
    approach:       "Acceptance-based values exploration first; behavioral activation to restore agency second",
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
    <svg viewBox="0 0 16 16" fill="none" className="h-[14px] w-[14px]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12V4M4 8l4-4 4 4"/>
    </svg>
  );
}
function IcoCopy() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="9" height="9" rx="2"/><path d="M12 6V4.6A1.6 1.6 0 0 0 10.4 3H4.6A1.6 1.6 0 0 0 3 4.6v5.8A1.6 1.6 0 0 0 4.6 12H6"/>
    </svg>
  );
}
function IcoRegenerate() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.8 6A5.6 5.6 0 1 0 14.5 9"/><path d="M14 4v3h-3"/>
    </svg>
  );
}
function IcoRestart() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 6A7.5 7.5 0 1 0 17.2 10"/><path d="M17 3.5v3.8h-3.8"/>
    </svg>
  );
}
function IcoShare() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="4.5" r="2"/><circle cx="5" cy="10" r="2"/><circle cx="15" cy="15.5" r="2"/>
      <path d="m7 9 6-3M7 11l6 3"/>
    </svg>
  );
}
function IcoExpert() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6.5" r="2.8"/><path d="M4 17.5c.9-3 3.3-4.5 6-4.5s5.1 1.5 6 4.5"/>
    </svg>
  );
}
function IcoCode() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5.5L3 10l4 5M13 5.5l4 4.5-4 5"/>
    </svg>
  );
}
function IcoGuide() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7.5"/><path d="M10 6.5v4.5l2.5 2"/>
    </svg>
  );
}
function IcoClose() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-[11px] w-[11px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/>
    </svg>
  );
}
function IcoCheck({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5l3 3 5-6"/>
    </svg>
  );
}
function Spinner({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2" className="animate-spin">
      <circle cx="9" cy="9" r="6.5" strokeOpacity="0.15"/>
      <path d="M9 2.5a6.5 6.5 0 0 1 6.5 6.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── KB entries ─────────────────────────────────────────────────────────────────
const KB_INITIAL = [
  { id: "fw1", category: "Intervention Frameworks", content: "CBT-based thought reframing: identify automatic negative thoughts, challenge distortions, replace with balanced alternatives." },
  { id: "fw2", category: "Intervention Frameworks", content: "Behavioral activation: schedule small, achievable positive activities to counter withdrawal in low-mood states." },
  { id: "cp1", category: "Coping Strategies",       content: "Box breathing (4-4-4-4): inhale 4s, hold 4s, exhale 4s, hold 4s — activates parasympathetic response." },
  { id: "cp2", category: "Coping Strategies",       content: "Grounding 5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste." },
  { id: "sc1", category: "Safety Constraints",      content: "Never diagnose. Use 'may suggest' or 'some people experience' framing. Always recommend professional support for clinical concerns." },
  { id: "rt1", category: "Response Templates",      content: "Opening empathy: 'That sounds really difficult. Thank you for sharing that with me.'" },
];

// ── Floating pair (splash animation) ──────────────────────────────────────────
function FloatingPair({ scale = 1 }: { scale?: number }) {
  return (
    <div className="relative" style={{ width: 148 * scale, height: 100 * scale }}>
      <motion.div className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(59,111,180,0.12)", borderRadius: "50%", width: "100%", height: "100%" }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}/>
      <motion.div className="absolute rounded-[20px]"
        style={{ left: 8 * scale, top: 18 * scale, width: 54 * scale, height: 54 * scale,
          background: "linear-gradient(148deg, #fde8d8 0%, #f9cdb8 100%)",
          boxShadow: `0 ${8 * scale}px ${20 * scale}px -${8 * scale}px rgba(180,100,70,0.36)`,
          borderRadius: 18 * scale }}
        animate={{ y: [0, -4 * scale, 0], rotate: [0, -1.2, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
        <span className="absolute rounded-full bg-[rgba(100,66,56,0.72)]" style={{ left: 16 * scale, top: 20 * scale, width: 6 * scale, height: 6 * scale }}/>
        <span className="absolute rounded-full bg-[rgba(100,66,56,0.72)]" style={{ left: 32 * scale, top: 20 * scale, width: 6 * scale, height: 6 * scale }}/>
        <span className="absolute rounded-full bg-[rgba(120,76,66,0.6)]" style={{ left: 18 * scale, top: 34 * scale, width: 16 * scale, height: 4 * scale }}/>
      </motion.div>
      <motion.div className="absolute rounded-[20px]"
        style={{ left: 68 * scale, top: 20 * scale, width: 54 * scale, height: 54 * scale,
          background: "linear-gradient(148deg, #dbeafe 0%, #bfdbfe 100%)",
          boxShadow: `0 ${8 * scale}px ${20 * scale}px -${8 * scale}px rgba(60,100,180,0.36)`,
          borderRadius: 18 * scale }}
        animate={{ y: [0, -6 * scale, 0], rotate: [0, 1.4, 0] }}
        transition={{ duration: 4.0, repeat: Infinity, ease: "easeInOut" }}>
        <span className="absolute rounded-full bg-[rgba(55,80,130,0.72)]" style={{ left: 16 * scale, top: 20 * scale, width: 6 * scale, height: 6 * scale }}/>
        <span className="absolute rounded-full bg-[rgba(55,80,130,0.72)]" style={{ left: 32 * scale, top: 20 * scale, width: 6 * scale, height: 6 * scale }}/>
        <span className="absolute rounded-full bg-[rgba(60,96,150,0.6)]" style={{ left: 17 * scale, top: 34 * scale, width: 18 * scale, height: 4 * scale }}/>
      </motion.div>
      <div className="absolute rounded-full"
        style={{ left: 52 * scale, top: 58 * scale, width: 26 * scale, height: 12 * scale,
          background: "linear-gradient(180deg, rgba(255,247,228,0.85) 0%, rgba(255,234,190,0.6) 100%)" }}/>
    </div>
  );
}

// ── Custom cursor ──────────────────────────────────────────────────────────────
const CursorLayer = memo(function CursorLayer() {
  const rm = useReducedMotion();
  const mX = useMotionValue(-200);
  const mY = useMotionValue(-200);
  const rX = useSpring(mX, { stiffness: 380, damping: 30, mass: 0.45 });
  const rY = useSpring(mY, { stiffness: 380, damping: 30, mass: 0.45 });
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (rm) return;
    let pending = false;
    let ex = -200, ey = -200;
    const flush = () => { pending = false; mX.set(ex); mY.set(ey); };
    const onMove = (e: MouseEvent) => { ex = e.clientX; ey = e.clientY; if (!pending) { pending = true; requestAnimationFrame(flush); } };
    const onOver  = (e: MouseEvent) => { setHov(!!(e.target as HTMLElement).closest("button,a,textarea,[role=button]")); };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver,  { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseover", onOver); };
  }, [mX, mY, rm]);

  if (rm) return null;
  return (
    <>
      <motion.div className="pointer-events-none fixed z-[999]" style={{ x: mX, y: mY, translateX: "-50%", translateY: "-50%" }}>
        <motion.div
          animate={{ width: hov ? 7 : 5, height: hov ? 7 : 5, opacity: hov ? 1 : 0.8 }}
          transition={spring.snappy}
          style={{ borderRadius: "50%", background: T.accent }}
        />
      </motion.div>
      <motion.div className="pointer-events-none fixed z-[998]" style={{ x: rX, y: rY, translateX: "-50%", translateY: "-50%" }}>
        <motion.div
          animate={{ width: hov ? 38 : 26, height: hov ? 38 : 26, opacity: hov ? 0.38 : 0.16 }}
          transition={spring.gentle}
          style={{ borderRadius: "50%", border: `1.5px solid ${T.accent}` }}
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
            initial={{ opacity: 0, y: 4, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-[5px] text-[10.5px] font-medium"
            style={{ background: "rgba(15,26,46,0.9)", color: "#e8f0f8", letterSpacing: "0.01em" }}>
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Splash screen ──────────────────────────────────────────────────────────────
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex overflow-hidden"
      style={{ background: "linear-gradient(150deg, #f8fafd 0%, #f0f6fb 45%, #e8f2f8 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Left panel */}
      <div className="relative z-10 flex w-full flex-col justify-center px-10 py-16 md:w-[55%] md:px-16 lg:px-24">

        {/* Floating animation — left side accent */}
        <motion.div
          className="mb-10 flex items-center gap-5"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.48, ease: [0, 0, 0.2, 1] }}
        >
          <FloatingPair scale={0.82}/>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(59,111,180,0.18) 0%, transparent 100%)" }}/>
        </motion.div>

        {/* Label */}
        <motion.p
          className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${uiFont.className}`}
          style={{ color: T.txt3 }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4, ease: [0, 0, 0.2, 1] }}
        >
          Little Cosmic Cuddle Corner
        </motion.p>

        {/* Headline */}
        <motion.h1
          className={`mb-6 leading-[1.08] ${displayFont.className}`}
          style={{ fontSize: "clamp(2.8rem, 5.4vw, 3.8rem)", fontWeight: 300, color: T.txt, letterSpacing: "-0.028em" }}
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.48, ease: [0, 0, 0.2, 1] }}
        >
          I&apos;m here<br/>
          <span style={{ color: T.accent, fontWeight: 500 }}>to listen.</span>
        </motion.h1>

        {/* Body */}
        <motion.p
          className="mb-10 max-w-[360px] leading-[1.78]"
          style={{ fontSize: "14.5px", color: T.txt2 }}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.44, ease: [0, 0, 0.2, 1] }}
        >
          Share what&apos;s on your mind. Before I respond, you&apos;ll see a brief analysis of what I&apos;m reasoning through — transparency, not a black box.
        </motion.p>

        {/* Feature list */}
        <motion.ul
          className="mb-12 space-y-3"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          {[
            "Emotional state analysis in real time",
            "Transparent reasoning, not a black box",
            "Safe space for open conversation",
          ].map(f => (
            <li key={f} className="flex items-center gap-3" style={{ color: T.txt2, fontSize: "13.5px" }}>
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                style={{ background: T.accentXlt, border: `1px solid ${T.accentRing}`, color: T.accent }}>
                <svg width={8} height={8} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6.5l3 3 5-6"/>
                </svg>
              </span>
              {f}
            </li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={onEnter}
          className={`group flex w-fit items-center gap-3 rounded-[14px] px-7 py-3.5 text-[14px] font-semibold text-white ${uiFont.className}`}
          style={{
            background: `linear-gradient(135deg, ${T.accent} 0%, #4c8cd4 100%)`,
            boxShadow: "0 3px 12px rgba(59,111,180,0.32), 0 1px 3px rgba(59,111,180,0.18)",
          }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: "0 5px 18px rgba(59,111,180,0.4), 0 1px 4px rgba(59,111,180,0.2)" }}
          whileTap={{ scale: 0.98 }}
        >
          Start a session
          <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 12 4-4-4-4"/>
          </svg>
        </motion.button>
      </div>

      {/* Right panel — ambient rings */}
      <div className="hidden md:flex md:w-[45%] items-center justify-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0"
          style={{ background: [
            "radial-gradient(circle at 48% 44%, rgba(59,111,180,0.07) 0%, transparent 58%)",
            "radial-gradient(circle at 68% 26%, rgba(22,155,130,0.05) 0%, transparent 46%)",
          ].join(",") }}/>
        {[340, 240, 148].map((sz, i) => (
          <motion.div key={sz} className="absolute rounded-full"
            style={{ width: sz, height: sz, border: `1px solid rgba(100,160,220,${0.07 + i * 0.05})` }}
            animate={{ scale: [1, 1 + 0.025 * (i + 1), 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4 + i * 0.8, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }}/>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.56, ease: [0, 0, 0.2, 1] }}>
          <FloatingPair scale={1.6}/>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Share modal ────────────────────────────────────────────────────────────────
function ShareModal({ onClose }: { onClose: () => void }) {
  const [vis, setVis] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  useEffect(() => { const id = setTimeout(() => setVis(true), 22); return () => clearTimeout(id); }, []);
  const close = () => { setVis(false); setTimeout(onClose, 280); };
  const copyUrl = () => {
    void navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    window.setTimeout(() => { setCopied(false); close(); }, 1400);
  };
  return (
    <div role="dialog" aria-modal aria-labelledby="share-title"
      style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: vis ? "rgba(8,20,44,0.24)" : "transparent", backdropFilter: vis ? "blur(14px)" : "none", transition: "background 0.28s ease, backdrop-filter 0.28s ease" }}
      onClick={close}>
      <div style={{ width: "min(420px,100%)", borderRadius: 20, background: "#fff", border: `1px solid ${T.bdr}`, boxShadow: T.shadowXl, overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "scale(1)" : "scale(0.95) translateY(12px)", transition: "opacity 0.28s ease, transform 0.34s cubic-bezier(0.25,0.46,0.45,0.94)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${T.bdrLight}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="share-title" style={{ margin: 0, fontFamily: displayFont.style.fontFamily, fontSize: 16.5, fontWeight: 600, color: T.txt, letterSpacing: "-0.015em" }}>Share this session</h2>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: T.txt2, lineHeight: 1.6 }}>Copy the link and send it to open this therapy showroom.</p>
          </div>
          <button type="button" aria-label="Close" onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-[rgba(0,0,0,0.04)]"
            style={{ color: T.txt3, border: `1px solid ${T.bdr}`, background: "transparent" }}>
            <IcoClose/>
          </button>
        </div>
        <div style={{ padding: "16px 22px 22px" }}>
          <p style={{ margin: "0 0 7px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.txt3 }}>Page URL</p>
          <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.bdrLight}`, background: "#f8fafd", fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: T.txt2, wordBreak: "break-all", lineHeight: 1.6 }}>{url || "—"}</div>
          <button type="button" onClick={copyUrl}
            style={{ marginTop: 12, width: "100%", padding: "12px 0", borderRadius: 10, border: `1px solid ${copied ? T.teal : T.accentLt}`, background: copied ? T.tealLt : T.accentXlt, color: copied ? T.teal : T.accent, fontFamily: uiFont.style.fontFamily, fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all 0.16s ease" }}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── KB editor modal ────────────────────────────────────────────────────────────
function KbEditorModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState(KB_INITIAL);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const categories = Array.from(new Set(entries.map(e => e.category)));
  const startEdit = (id: string) => { const e = entries.find(x => x.id === id); if (!e) return; setEditing(id); setDraft(e.content); };
  const saveEdit  = () => { setEntries(prev => prev.map(e => e.id === editing ? { ...e, content: draft } : e)); setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return (
    <>
      <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}
        style={{ background: "rgba(8,20,44,0.18)", backdropFilter: "blur(8px)" }} onClick={onClose}/>
      <motion.div className="fixed z-50 flex max-h-[82vh] w-[min(94vw,540px)] flex-col overflow-hidden rounded-[22px]"
        initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.85 }}
        style={{ left: "50%", top: "50%", x: "-50%", y: "-50%", background: "#fff", border: `1px solid ${T.bdr}`, boxShadow: T.shadowXl }}>
        <div className="flex shrink-0 items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.bdrLight}` }}>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-semibold" style={{ color: T.txt }}>Edit Knowledge Base</span>
            {saved && <motion.span initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] font-medium" style={{ color: T.teal }}>✓ Saved</motion.span>}
          </div>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[rgba(0,0,0,0.05)]" style={{ color: T.txt3 }}>
            <IcoClose/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.08) transparent" }}>
          {categories.map(cat => (
            <div key={cat}>
              <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.accent }}>{cat}</p>
              <div className="space-y-2">
                {entries.filter(e => e.category === cat).map(entry => (
                  <div key={entry.id} className="overflow-hidden rounded-xl" style={{ border: `1px solid ${editing === entry.id ? T.bdrFocus : T.bdr}` }}>
                    {editing === entry.id ? (
                      <div>
                        <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[12.5px] leading-[1.7] outline-none"
                          style={{ color: T.txt, minHeight: 80 }}/>
                        <div className="flex justify-end gap-2 px-4 pb-3.5">
                          <button type="button" onClick={() => setEditing(null)} className="rounded-full px-3.5 py-1.5 text-[11.5px] font-medium" style={{ color: T.txt2, background: "#f5f7fb", border: `1px solid ${T.bdr}` }}>Cancel</button>
                          <button type="button" onClick={saveEdit} className="rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold text-white" style={{ background: T.accent }}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 px-4 py-3.5">
                        <p className="flex-1 text-[12px] leading-[1.72]" style={{ color: T.txt2 }}>{entry.content}</p>
                        <button type="button" onClick={() => startEdit(entry.id)} className="shrink-0 rounded-lg p-1.5 transition-opacity opacity-30 hover:opacity-60" style={{ color: T.accent, background: T.accentXlt }}>
                          <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5l3 3L5 14l-4 1 1-4 8-8z"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${T.bdrLight}`, background: "#f9fbfd" }}>
          <p className="text-[10.5px]" style={{ color: T.txt3 }}>{entries.length} entries · {categories.length} categories</p>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2 text-[12px] font-semibold text-white" style={{ background: T.accent }}>Done</button>
        </div>
      </motion.div>
    </>
  );
}

// ── Nav button ─────────────────────────────────────────────────────────────────
function NavBtn({ onClick, active, children, wide }: { onClick: () => void; active?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl ${wide ? "h-8 px-3.5" : "h-8 w-8"}`}
      style={{
        background: active ? T.accentXlt : "rgba(148,170,196,0.07)",
        border: `1px solid ${active ? T.accentRing : "rgba(148,170,196,0.16)"}`,
        color: active ? T.accent : T.txt2,
        boxShadow: active ? `0 0 0 3px ${T.accentXlt}` : "none",
        transition: "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
      }}
      whileHover={{ backgroundColor: active ? "rgba(59,111,180,0.12)" : "rgba(148,170,196,0.12)" }}
      whileTap={{ scale: 0.95 }}
      transition={spring.snappy}>
      {children}
    </motion.button>
  );
}

// ── Side panel ─────────────────────────────────────────────────────────────────
function SidePanel({ title, onClose, children, variant = "overlay" }: { title: string; onClose: () => void; children: React.ReactNode; variant?: "overlay" | "dock" }) {
  const isDock = variant === "dock";
  return (
    <motion.aside
      initial={isDock ? { x: 24, opacity: 0.95 } : { x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={isDock ? { x: 20, opacity: 0.9 } : { x: 48, opacity: 0 }}
      transition={spring.gentle}
      className={isDock
        ? "relative z-20 flex h-full w-[min(100vw,376px)] shrink-0 flex-col overflow-hidden"
        : "fixed right-0 top-0 z-40 flex h-full w-[376px] flex-col overflow-hidden"}
      style={{ background: T.panel, backdropFilter: "blur(12px)", borderLeft: `1px solid ${T.bdr}`, boxShadow: "-16px 0 48px -16px rgba(15,35,80,0.1)" }}>
      <div className="flex shrink-0 items-center justify-between px-5 py-[14px]" style={{ borderBottom: `1px solid ${T.bdrLight}` }}>
        <p className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${uiFont.className}`} style={{ color: T.txt3 }}>{title}</p>
        <motion.button type="button" onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[rgba(148,170,196,0.12)]"
          style={{ color: T.txt3 }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}>
          <IcoClose/>
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.08) transparent" }}>
        {children}
      </div>
    </motion.aside>
  );
}

// ── Analysis card — staggered field reveal ─────────────────────────────────────
function AnalysisCard({ data, phase, collapsed, onToggle }: { data: AnalysisData; phase: number; collapsed: boolean; onToggle: () => void }) {
  const done = phase >= NUM_FIELDS;
  const visibleFields = useMemo(() => {
    if (collapsed) return [];
    const all = ANALYSIS_FIELDS.map((f, i) => ({ ...f, value: data[f.key], index: i }));
    return done ? all : all.slice(0, phase);
  }, [data, phase, done, collapsed]);

  return (
    <div className="mb-5">
      {/* Pill trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full px-4 py-[7px]"
        style={{
          background: done ? "rgba(18,135,90,0.07)" : T.accentXlt,
          border: `1px solid ${done ? T.greenBdr : T.accentRing}`,
          boxShadow: done ? "none" : `0 0 0 3px rgba(59,111,180,0.05)`,
          transition: "all 0.18s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.95)"; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
      >
        <span style={{ color: done ? T.green : T.accentLt, display: "flex" }}>
          {done ? <IcoCheck size={13}/> : <Spinner size={12}/>}
        </span>
        <span className={`text-[12px] font-semibold ${uiFont.className}`} style={{ color: done ? T.green : T.accent }}>
          {done ? "Analysis complete" : "Analyzing…"}
        </span>
        {!done && (
          <span className="text-[11px]" style={{ color: T.txt3 }}>
            {Math.min(phase, NUM_FIELDS)}/{NUM_FIELDS}
          </span>
        )}
        <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3" stroke={T.txt3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: collapsed ? "none" : "rotate(180deg)", transition: "transform 200ms ease" }}>
          <path d="M3 5l4 4 4-4"/>
        </svg>
      </button>

      {/* Body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ...spring.gentle, duration: 0.28 }}
            className="overflow-hidden">
            <div className="mt-3 overflow-hidden rounded-2xl" style={{ border: `1px solid ${T.bdrLight}`, background: "#ffffff", boxShadow: T.shadow }}>
              {/* Progress strip */}
              <div className="h-[3px] w-full" style={{ background: T.bdrLight }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${(Math.min(phase, NUM_FIELDS) / NUM_FIELDS) * 100}%` }}
                  transition={spring.gentle}
                  style={{ background: done ? `linear-gradient(90deg, ${T.teal}, ${T.green})` : `linear-gradient(90deg, ${T.accent}, ${T.accentLt})` }}/>
              </div>
              {/* Fields */}
              <div className="divide-y divide-[rgba(210,220,232,0.5)]">
                <AnimatePresence initial={false}>
                  {visibleFields.map((f, i) => (
                    <motion.div key={f.key}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring.gentle, delay: done ? 0 : i * 0.04 }}
                      className="grid gap-x-5 px-4 py-3"
                      style={{ gridTemplateColumns: "100px 1fr", borderTop: i > 0 ? `1px solid ${T.bdrLight}` : "none" }}>
                      <span className="pt-[1px] text-[10.5px] font-semibold uppercase tracking-[0.1em] leading-snug" style={{ color: done ? f.color : T.txt3 }}>
                        {f.label}
                      </span>
                      <span className="text-[12.5px] leading-[1.65]" style={{ color: done ? T.txt2 : "rgba(79,100,119,0.65)", fontFamily: uiFont.style.fontFamily }}>
                        {f.value}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Skeleton placeholder */}
              {!done && phase < NUM_FIELDS && (
                <div className="px-4 py-3 grid gap-x-5" style={{ gridTemplateColumns: "100px 1fr", borderTop: visibleFields.length > 0 ? `1px solid ${T.bdrLight}` : "none" }}>
                  <div className="h-3 w-16 rounded-full skeleton-pulse" style={{ background: "rgba(148,170,196,0.18)" }}/>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-full rounded-full skeleton-pulse" style={{ background: "rgba(148,170,196,0.12)" }}/>
                    <div className="h-3 w-3/4 rounded-full skeleton-pulse" style={{ background: "rgba(148,170,196,0.09)" }}/>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Messages ───────────────────────────────────────────────────────────────────
function UserMessage({ text }: { text: string }) {
  return (
    <div className="mb-7 flex justify-end">
      <div className="max-w-[70%] rounded-[22px] px-5 py-[14px]"
        style={{ background: "linear-gradient(160deg, rgba(248,251,255,0.82) 0%, rgba(240,248,255,0.72) 100%)", border: `1px solid rgba(120,168,220,0.22)`, boxShadow: "0 4px 20px -12px rgba(15,50,100,0.16)", backdropFilter: "blur(6px)" }}>
        <p className="text-[14px] leading-[1.72]" style={{ color: T.txtUser, fontFamily: uiFont.style.fontFamily }}>{text}</p>
      </div>
    </div>
  );
}

function formatParas(text: string) {
  const paras = text.split(/\n\n+/).filter(Boolean);
  if (paras.length <= 1) {
    const lines = text.split(/\n/).filter(Boolean);
    if (lines.length <= 1) return [{ type: "lead" as const, text }];
    return lines.map((l, i) => ({ type: (i === 0 ? "lead" : "body") as "lead" | "body", text: l }));
  }
  return paras.map((p, i) => ({ type: (i === 0 ? "lead" : "body") as "lead" | "body", text: p }));
}

function AssistantMessage({ msg, onToggleAnalysis, onRegenerate, onCopy }: { msg: Msg; onToggleAnalysis: () => void; onRegenerate: () => void; onCopy: () => void }) {
  const paragraphs = useMemo(() => formatParas(msg.text), [msg.text]);
  return (
    <div className="mb-7 flex flex-col items-start">
      {msg.analysis && (
        <AnalysisCard data={msg.analysis} phase={NUM_FIELDS} collapsed={msg.analysisCollapsed} onToggle={onToggleAnalysis}/>
      )}
      <div className="w-full max-w-[70%] rounded-[22px] px-5 py-[15px]"
        style={{ background: "linear-gradient(160deg, rgba(252,255,255,0.9) 0%, rgba(244,252,255,0.8) 100%)", border: `1px solid rgba(120,168,220,0.2)`, boxShadow: T.shadow, backdropFilter: "blur(6px)" }}>
        <div className={`space-y-3 ${uiFont.className}`}>
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-[1.78]" style={{ fontSize: "13.5px", color: p.type === "lead" ? T.txt : T.txt2, fontWeight: p.type === "lead" ? 450 : 400 }}>
              {p.type === "body" && i > 0 && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: T.accentLt, opacity: 0.55 }}/>}
              {p.text}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {[
          { label: "Regenerate", icon: <IcoRegenerate/>, onClick: onRegenerate },
          { label: "Copy",       icon: <IcoCopy/>,       onClick: onCopy },
        ].map(btn => (
          <Tip key={btn.label} label={btn.label}>
            <motion.button type="button" onClick={btn.onClick}
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ color: T.txt3, background: "transparent" }}
              whileHover={{ color: T.accent, backgroundColor: T.accentXlt, scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={spring.snappy}>
              {btn.icon}
            </motion.button>
          </Tip>
        ))}
      </div>
    </div>
  );
}

function BuildingCard({ phase, analysis }: { phase: number; analysis: AnalysisData }) {
  return <div className="mb-7"><AnalysisCard data={analysis} phase={phase} collapsed={false} onToggle={() => {}}/></div>;
}

function TypingIndicator() {
  return (
    <div className="mb-7 flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-[18px] px-5 py-[13px]"
        style={{ background: "linear-gradient(160deg, rgba(248,252,255,0.8) 0%, rgba(239,248,255,0.7) 100%)", border: `1px solid rgba(120,168,220,0.2)`, boxShadow: T.shadow }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot h-[7px] w-[7px] rounded-full" style={{ background: T.accentLt }}/>
        ))}
      </div>
    </div>
  );
}

// ── Input dock ─────────────────────────────────────────────────────────────────
const InputDock = memo(function InputDock({ analyzing, onSend, onRegisterFocus }: { analyzing: boolean; onSend: (t: string) => void; onRegisterFocus?: (fn: () => void) => void }) {
  const [input, setInput] = useState("");
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
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => {
    if (!onRegisterFocus) return;
    onRegisterFocus(() => ref.current?.focus());
  }, [onRegisterFocus]);

  const canSend = input.trim().length > 0 && !analyzing;

  return (
    <div className="relative z-20 shrink-0 px-6 pb-7 pt-4"
      style={{ background: "linear-gradient(180deg, rgba(245,249,253,0.99) 0%, rgba(238,246,252,0.99) 100%)", backdropFilter: "blur(8px)", borderTop: `1px solid ${T.bdrLight}` }}>
      <div className="mx-auto max-w-[720px]">
        {/* Quick prompts */}
        <div className="mb-3.5 flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_PROMPTS.map(q => (
            <motion.button key={q} type="button" disabled={analyzing}
              onClick={() => { if (!analyzing) onSend(q); }}
              className={`shrink-0 rounded-full px-4 py-[7px] text-[11px] font-medium whitespace-nowrap disabled:opacity-40 ${uiFont.className}`}
              style={{ background: "#ffffff", border: `1px solid ${T.bdr}`, color: T.txt2, boxShadow: "0 1px 4px rgba(15,35,70,0.06)", letterSpacing: "0.005em" }}
              whileHover={{ backgroundColor: T.accentXlt, borderColor: T.accentRing, color: T.accent }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}>
              {q}
            </motion.button>
          ))}
        </div>
        {/* Composer */}
        <motion.div
          className="overflow-hidden rounded-[20px]"
          style={{ background: T.input, border: `1.5px solid ${focused ? T.bdrFocus : T.bdr}`, boxShadow: focused ? `0 0 0 4px ${T.accentXlt}, ${T.shadowMd}` : T.shadow }}
          animate={{ scale: focused ? 1.002 : 1 }}
          transition={spring.gentle}>
          <div className="flex items-end gap-3 px-4 py-3.5">
            <textarea
              ref={ref}
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onInput={onInput}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
              rows={1}
              disabled={analyzing}
              placeholder={analyzing ? "Analysis in progress…" : "Share what's on your mind…"}
              className="flex-1 resize-none bg-transparent outline-none disabled:opacity-40"
              style={{ fontSize: "14px", color: T.txt, caretColor: T.accent, minHeight: 24, maxHeight: 128, lineHeight: "1.65", fontFamily: uiFont.style.fontFamily }}
            />
            <div className="flex shrink-0 items-center gap-2 pb-0.5">
              {input.length > 0 && <span className="text-[10px]" style={{ color: T.txt3 }}>{input.length}</span>}
              <motion.button type="button" onClick={submit} disabled={!canSend}
                className="flex h-8 w-8 items-center justify-center rounded-xl disabled:opacity-30"
                style={{ background: canSend ? `linear-gradient(135deg, ${T.accent}, ${T.teal})` : "rgba(148,170,196,0.14)", color: "white", boxShadow: canSend ? "0 3px 14px -4px rgba(59,111,180,0.44)" : "none", transition: "background 0.15s ease, box-shadow 0.15s ease" }}
                whileHover={canSend ? { scale: 1.07 } : {}}
                whileTap={canSend ? { scale: 0.93 } : {}}
                transition={spring.snappy}>
                <IcoSend/>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

// ── Guide panel ────────────────────────────────────────────────────────────────
function QuickGuideContent({ guideStep, setGuideStep, runGuideAction }: { guideStep: number; setGuideStep: React.Dispatch<React.SetStateAction<number>>; runGuideAction: (action?: GuideStep["action"]) => void }) {
  return (
    <div className="space-y-3.5">
      <div className="rounded-2xl p-4" style={{ background: T.card, border: `1px solid ${T.bdr}`, boxShadow: T.shadow }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.accent }}>Walkthrough</p>
            <p className="text-[10.5px] mt-0.5" style={{ color: T.txt3 }}>About 2 minutes total</p>
          </div>
          <span className="text-[11px] font-medium tabular-nums" style={{ color: T.txt2 }}>{guideStep + 1} / {GUIDE_STEPS.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {GUIDE_STEPS.map((_, i) => (
            <motion.div key={i} onClick={() => setGuideStep(i)}
              className="h-[3px] flex-1 rounded-full cursor-pointer"
              animate={{ background: i < guideStep ? `linear-gradient(90deg, ${T.accent}, ${T.teal})` : i === guideStep ? T.accent : "rgba(148,170,196,0.2)" }}
              transition={spring.snappy}/>
          ))}
        </div>
      </div>

      <motion.div key={guideStep} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={spring.gentle}
        className="rounded-2xl p-4" style={{ background: "#ffffff", border: `1px solid ${T.bdr}`, boxShadow: T.shadow }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: T.accentXlt, border: `1px solid ${T.accentRing}`, color: T.accent }}>
            <span className="text-[11px] font-semibold">{GUIDE_STEPS[guideStep].step}</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: T.txt }}>{GUIDE_STEPS[guideStep].label}</p>
            <p className="text-[10px]" style={{ color: T.txt3 }}>{GUIDE_STEPS[guideStep].time}</p>
          </div>
        </div>
        <p className="text-[12.5px] leading-[1.68]" style={{ color: T.txt2 }}>{GUIDE_STEPS[guideStep].hint}</p>
        {GUIDE_STEPS[guideStep].cta && (
          <motion.button type="button" onClick={() => runGuideAction(GUIDE_STEPS[guideStep].action)}
            className="mt-3 rounded-xl px-3.5 py-2 text-[11.5px] font-medium"
            style={{ color: T.accent, background: T.accentXlt, border: `1px solid ${T.accentRing}` }}
            whileHover={{ filter: "brightness(0.95)" }} whileTap={{ scale: 0.97 }}>
            {GUIDE_STEPS[guideStep].cta}
          </motion.button>
        )}
      </motion.div>

      <div className="rounded-2xl px-4 py-3.5" style={{ background: T.accentXlt, border: `1px solid ${T.accentRing}` }}>
        <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.txt3 }}>All steps</p>
        <div className="space-y-1">
          {GUIDE_STEPS.map((s, i) => (
            <motion.div key={s.step} onClick={() => setGuideStep(i)}
              className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2"
              style={{ background: i === guideStep ? "rgba(59,111,180,0.1)" : "transparent" }}
              whileHover={{ backgroundColor: i === guideStep ? "rgba(59,111,180,0.1)" : "rgba(148,170,196,0.08)" }}
              transition={spring.snappy}>
              <span className="text-[10px] w-8 tabular-nums" style={{ color: T.txt3 }}>{s.time}</span>
              <p className="text-[12px] flex-1" style={{ color: i <= guideStep ? T.txt2 : T.txt3 }}>{s.label}</p>
              {i < guideStep && <span className="text-[10px] font-medium" style={{ color: T.green }}>✓</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[
          { label: "← Prev", fn: () => setGuideStep(s => Math.max(0, s - 1)), disabled: guideStep === 0, primary: false },
          { label: "Next →", fn: () => setGuideStep(s => Math.min(GUIDE_STEPS.length - 1, s + 1)), disabled: guideStep === GUIDE_STEPS.length - 1, primary: true },
        ].map(btn => (
          <motion.button key={btn.label} type="button" onClick={btn.fn} disabled={btn.disabled}
            className="flex-1 rounded-xl py-2.5 text-[12px] font-medium disabled:opacity-40"
            style={{ color: btn.primary && !btn.disabled ? T.accent : T.txt2, background: btn.primary && !btn.disabled ? T.accentXlt : "#fff", border: `1px solid ${btn.primary && !btn.disabled ? T.accentRing : T.bdr}` }}
            whileHover={!btn.disabled ? { filter: "brightness(0.96)" } : {}}
            whileTap={!btn.disabled ? { scale: 0.98 } : {}}
            transition={spring.snappy}>
            {btn.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PsychV2Client({ embed = false }: { embed?: boolean }) {
  const rm = useReducedMotion();

  const [messages,           setMessages]           = useState<Msg[]>([WELCOME]);
  const [build,              setBuild]              = useState<BuildState>(null);
  const [analyzing,          setAnalyzing]          = useState(false);
  const [pipeline,           setPipeline]           = useState<PipeStep[]>(PIPE_INIT);
  const [panelOpen,          setPanelOpen]          = useState(false);
  const [panelTab,           setPanelTab]           = useState<SidebarTab>("expert");
  const [guideStep,          setGuideStep]          = useState(0);
  const [showSplash,         setShowSplash]         = useState(true);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showShareModal,     setShowShareModal]     = useState(false);
  const [showKbEditor,       setShowKbEditor]       = useState(false);
  const [codeToolTab,        setCodeToolTab]        = useState<"source" | "clone" | "config">("source");
  const [sourceFile,         setSourceFile]         = useState<"pipeline" | "prompt" | "safety">("pipeline");
  const [cfgModel,           setCfgModel]           = useState("qwen-qwq");
  const [cfgTemp,            setCfgTemp]            = useState(0.7);
  const [cfgTokens,          setCfgTokens]          = useState(2048);
  const [cfgTopP,            setCfgTopP]            = useState(0.95);
  const [cloneCopied,        setCloneCopied]        = useState(false);

  const chatEnd            = useRef<HTMLDivElement>(null);
  const timersRef          = useRef<ReturnType<typeof setTimeout>[]>([]);
  const guideInputFocusRef = useRef<(() => void) | null>(null);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  useEffect(() => {
    const id = requestAnimationFrame(() => { chatEnd.current?.scrollIntoView({ behavior: rm ? "auto" : "smooth" }); });
    return () => cancelAnimationFrame(id);
  }, [messages, build, rm]);
  useEffect(() => { if (!embed) return; window.scrollTo(0, 0); }, [embed]);

  const handleSend = useCallback((text: string) => {
    if (analyzing) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", text, analysisCollapsed: false }]);
    const analysis = generateAnalysis(text);
    setAnalyzing(true);
    setBuild({ phase: 0, analysis });
    setPipeline(PIPE_INIT.map(s => ({ ...s, status: "pending" as StepStatus })));

    const PHASE_MS = 520;
    for (let i = 1; i <= NUM_FIELDS; i++) {
      const t = setTimeout(() => {
        setBuild(prev => prev ? { ...prev, phase: i } : null);
        if (i === 2) setPipeline(prev => prev.map((s, k) => k === 0 ? { ...s, status: "running" } : s) as PipeStep[]);
        if (i === 3) setPipeline(prev => prev.map((s, k) => k === 0 ? { ...s, status: "done" } : k === 1 ? { ...s, status: "running" } : s) as PipeStep[]);
        if (i === 5) setPipeline(prev => prev.map((s, k) => k <= 1 ? { ...s, status: "done" } : k === 2 ? { ...s, status: "running" } : s) as PipeStep[]);
      }, i * PHASE_MS);
      timersRef.current.push(t);
    }
    const tReply = setTimeout(() => {
      const replyText = buildReply(text);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: replyText, analysis, analysisCollapsed: true }]);
      setPipeline(PIPE_INIT.map(s => ({ ...s, status: "done" as StepStatus })));
      setBuild(null);
      setAnalyzing(false);
    }, NUM_FIELDS * PHASE_MS + 200);
    timersRef.current.push(tReply);
  }, [analyzing]);

  const toggleAnalysis = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, analysisCollapsed: !m.analysisCollapsed } : m));
  }, []);

  const onRestart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    setMessages([WELCOME]);
    setBuild(null);
    setAnalyzing(false);
    setPipeline(PIPE_INIT);
    setShowRestartConfirm(false);
  }, []);

  const openPanel = useCallback((tab: SidebarTab) => {
    if (tab === "code" && panelTab !== "code") { setCodeToolTab("source"); setSourceFile("pipeline"); }
    setPanelTab(tab);
    setPanelOpen(v => panelTab === tab ? !v : true);
  }, [panelTab]);

  const closePanel = useCallback(() => { setPanelOpen(false); setCloneCopied(false); }, []);
  const showTyping = build !== null && build.phase >= NUM_FIELDS;

  const runGuideAction = useCallback((action?: GuideStep["action"]) => {
    if (!action) return;
    if (action === "focusInput")  { guideInputFocusRef.current?.(); return; }
    if (action === "openExpert")  { setPanelTab("expert"); setPanelOpen(true); return; }
    if (action === "openCode")    { setCodeToolTab("source"); setSourceFile("pipeline"); setPanelTab("code"); setPanelOpen(true); return; }
    if (action === "copyLink")    { void navigator.clipboard.writeText(window.location.href).catch(() => {}); return; }
    if (action === "restart")     { setShowRestartConfirm(true); }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={() => setShowSplash(false)}/>}
      </AnimatePresence>

      <motion.div
        className={`relative flex h-screen flex-col overflow-hidden ${uiFont.className}`}
        style={{ background: T.bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={spring.fadeIn}
      >
        <style>{`
          @keyframes typing-dot{0%,80%,100%{opacity:.28;transform:scale(0.88)}40%{opacity:1;transform:scale(1.18)}}
          .typing-dot{animation:typing-dot 1.3s ease-in-out infinite}
          .typing-dot:nth-child(1){animation-delay:0s}
          .typing-dot:nth-child(2){animation-delay:.16s}
          .typing-dot:nth-child(3){animation-delay:.32s}
          @keyframes sk-pulse{0%,100%{opacity:.18}50%{opacity:.38}}
          .skeleton-pulse{animation:sk-pulse 1.8s ease-in-out infinite}
          @media(prefers-reduced-motion:reduce){.typing-dot,.skeleton-pulse{animation:none!important}}
        `}</style>

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: [
            "radial-gradient(circle at 16% 14%, rgba(190,214,240,0.18) 0%, transparent 42%)",
            "radial-gradient(circle at 84% 18%, rgba(170,218,210,0.14) 0%, transparent 38%)",
            "radial-gradient(circle at 52% 86%, rgba(190,214,240,0.14) 0%, transparent 42%)",
          ].join(",") }}/>
        </div>

        <CursorLayer/>

        {/* Navigation */}
        <motion.header
          className="relative z-20 shrink-0 flex items-center gap-4 px-6"
          style={{ height: 52, background: T.nav, backdropFilter: "blur(14px)", borderBottom: `1px solid ${T.bdrLight}` }}
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring.gentle, delay: 0.08 }}>
          <div className="mr-1 flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[8.5px] font-medium tracking-[0.18em] uppercase leading-none" style={{ color: T.txt3 }}>Welcome to</p>
              <p className={`text-[14px] font-semibold leading-none tracking-[-0.01em] ${displayFont.className}`} style={{ color: T.accent }}>Therapy Space</p>
            </div>
            <span className={`flex items-center rounded-lg px-2.5 py-1 text-[10.5px] font-medium tracking-[0.02em] ${uiFont.className}`}
              style={{ background: T.accentXlt, color: T.accent, border: `1px solid ${T.accentRing}` }}>
              Trusted Care
            </span>
          </div>
          <div className="flex-1"/>
          <nav className="flex items-center gap-1">
            <Tip label="Advisory panel"><NavBtn onClick={() => openPanel("expert")} active={panelOpen && panelTab === "expert"} wide><IcoExpert/><span className="text-[11.5px] font-medium">Experts</span></NavBtn></Tip>
            <Tip label="Code & config"><NavBtn onClick={() => openPanel("code")} active={panelOpen && panelTab === "code"} wide><IcoCode/><span className="text-[11.5px] font-medium">Code</span></NavBtn></Tip>
            <div className="mx-1.5 h-5 w-px" style={{ background: T.bdrLight }}/>
            <Tip label="Share link"><NavBtn onClick={() => setShowShareModal(true)}><IcoShare/></NavBtn></Tip>
            <Tip label="Restart session"><NavBtn onClick={() => setShowRestartConfirm(true)}><IcoRestart/></NavBtn></Tip>
            <Tip label="2-minute guide"><NavBtn onClick={() => openPanel("guide")} active={panelOpen && panelTab === "guide"} wide><IcoGuide/><span className="text-[11.5px] font-medium">Guide</span></NavBtn></Tip>
          </nav>
        </motion.header>

        <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="relative z-10 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.06) transparent" }}>
              <div className="mx-auto w-full max-w-[740px] px-8 pt-10 pb-6">
                <motion.div
                  className="mb-8 rounded-2xl px-5 py-4"
                  style={{ background: "linear-gradient(130deg, rgba(248,252,255,0.7) 0%, rgba(240,248,255,0.6) 100%)", border: `1px solid rgba(120,168,220,0.18)`, boxShadow: T.shadow, backdropFilter: "blur(6px)" }}
                  initial={rm ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.gentle, delay: 0.2 }}>
                  <p className={`mb-1 text-[11px] font-semibold tracking-[0.04em] uppercase ${uiFont.className}`} style={{ color: T.accent }}>Little Cosmic Cuddle Corner</p>
                  <p className="text-[12.5px] font-medium leading-snug mb-1" style={{ color: T.txt }}>Hello. I&apos;m here to listen.</p>
                  <p className="text-[12px] leading-[1.65]" style={{ color: T.txt3 }}>Share what&apos;s on your mind. Before I respond, you&apos;ll see a brief analysis — transparency, not a black box.</p>
                </motion.div>

                <AnimatePresence initial={false}>
                  {messages.map((m, idx) => (
                    <motion.div key={m.id}
                      initial={rm ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring.gentle, delay: idx === 0 ? 0.28 : 0 }}>
                      {m.role === "user"
                        ? <UserMessage text={m.text}/>
                        : <AssistantMessage msg={m} onToggleAnalysis={() => toggleAnalysis(m.id)}
                            onCopy={() => { void navigator.clipboard.writeText(m.text).catch(() => {}); }}
                            onRegenerate={() => {
                              setMessages(prev => {
                                const i2 = prev.findIndex(x => x.id === m.id && x.role === "assistant");
                                if (i2 <= 0) return prev;
                                const u = [...prev.slice(0, i2)].reverse().find(x => x.role === "user");
                                if (!u) return prev;
                                return prev.map((x, j) => j === i2 ? { ...x, text: buildReply(u.text) } : x);
                              });
                            }}/>
                      }
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {build && !showTyping && (
                    <motion.div key="build" initial={rm ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring.gentle}>
                      <BuildingCard phase={build.phase} analysis={build.analysis}/>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showTyping && (
                    <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={spring.gentle}>
                      <TypingIndicator/>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={chatEnd} className="h-4"/>
              </div>
            </div>

            <InputDock analyzing={analyzing} onSend={handleSend} onRegisterFocus={fn => { guideInputFocusRef.current = fn; }}/>
          </div>

          <AnimatePresence>
            {panelOpen && panelTab === "guide" && (
              <SidePanel variant="dock" title="Quick Guide" onClose={closePanel}>
                <QuickGuideContent guideStep={guideStep} setGuideStep={setGuideStep} runGuideAction={runGuideAction}/>
              </SidePanel>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {panelOpen && panelTab !== "guide" && (
            <motion.div className="fixed inset-0 z-30" onClick={closePanel}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={spring.fade}
              style={{ background: "rgba(8,20,44,0.08)", backdropFilter: "blur(2px)" }}/>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {panelOpen && panelTab !== "guide" && (
            <SidePanel title={panelTab === "expert" ? "Expert Profile" : "Developer Tools"} onClose={closePanel}>
              {panelTab === "expert" && (
                <div className="space-y-5">
                  <p className="text-[12.5px] leading-[1.7]" style={{ color: T.txt2 }}>Co-designed with professional partners whose expertise shapes our knowledge base, review process, and safety boundaries.</p>
                  <div>
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.txt3 }}>Clinical Advisory Panel</p>
                    <div className="space-y-2.5">
                      {[
                        { initials: "EL", name: "Dr. Elena Liu",   title: "Clinical Psychologist",          affiliation: "Columbia University",   specialty: "CBT · Stress Recovery",       cred: "PhD, Licensed Psychologist" },
                        { initials: "MR", name: "Dr. Marcus Reid", title: "Counseling Research Lead",       affiliation: "NYU Langone Health",    specialty: "Relationship Communication",  cred: "PsyD, ABPP Certified" },
                        { initials: "SP", name: "Dr. Sara Park",   title: "Crisis Intervention Specialist", affiliation: "Weill Cornell Medicine", specialty: "Safety · Risk Assessment",    cred: "PhD, APA Fellow" },
                      ].map(e => (
                        <div key={e.name} className="flex gap-3.5 rounded-2xl p-4" style={{ background: T.card, border: `1px solid ${T.bdr}`, boxShadow: T.shadow }}>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                            style={{ background: `linear-gradient(135deg, ${T.accent} 0%, ${T.teal} 100%)`, boxShadow: "0 4px 12px -4px rgba(59,111,180,0.36)" }}>
                            {e.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[13px] font-semibold" style={{ color: T.txt }}>{e.name}</p>
                              <span className="shrink-0 rounded-full px-2 py-[3px] text-[9px] font-semibold tracking-[0.06em]"
                                style={{ background: T.tealLt, color: T.teal, border: `1px solid ${T.tealBdr}` }}>Verified</span>
                            </div>
                            <p className="mt-0.5 text-[11.5px]" style={{ color: T.txt2 }}>{e.title}</p>
                            <p className="text-[10.5px]" style={{ color: T.txt3 }}>{e.affiliation}</p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className="rounded-full px-2.5 py-[3px] text-[10px] font-medium" style={{ background: T.tealLt, color: T.teal, border: `1px solid ${T.tealBdr}` }}>{e.specialty}</span>
                              <span className="rounded-full px-2.5 py-[3px] text-[10px]" style={{ background: "#f6f8fb", color: T.txt3, border: `1px solid ${T.bdr}` }}>{e.cred}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: "#fafbfd", border: `1px solid ${T.bdr}` }}>
                    <div className="mb-3.5 flex items-center justify-between">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.accent }}>Knowledge Base</p>
                      <motion.button type="button" onClick={() => setShowKbEditor(true)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-medium"
                        style={{ background: T.accentXlt, color: T.accent, border: `1px solid ${T.accentRing}` }}
                        whileHover={{ filter: "brightness(0.95)" }} whileTap={{ scale: 0.96 }}>
                        <svg width={9} height={9} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5l3 3L5 14l-4 1 1-4 8-8z"/></svg>
                        Edit
                      </motion.button>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Intervention Frameworks", count: "14 entries" },
                        { label: "Coping Strategies",       count: "28 entries" },
                        { label: "Safety Constraints",      count: "7 rules" },
                        { label: "Response Templates",      count: "11 entries" },
                      ].map(kb => (
                        <div key={kb.label} className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: "#f2f5f9", border: `1px solid ${T.bdrLight}` }}>
                          <p className="text-[11.5px]" style={{ color: T.txt2 }}>{kb.label}</p>
                          <span className="text-[10.5px] font-mono" style={{ color: T.txt3 }}>{kb.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: T.txt3 }}>Core principles</p>
                    <div className="space-y-2">
                      {["Safety-aware language in every reply","Non-diagnostic framing throughout","Practical first steps, no clinical claims","Transparent reasoning before each response"].map(p => (
                        <div key={p} className="flex items-start gap-2.5">
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: T.teal }}/>
                          <p className="text-[12px] leading-[1.65]" style={{ color: T.txt2 }}>{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {panelTab === "code" && (
                <div className="space-y-4">
                  <p className="text-[12.5px] leading-[1.65]" style={{ color: T.txt2 }}>Browse the spec, copy the install command, or adjust demo model settings.</p>
                  <div className="flex gap-5 border-b" style={{ borderColor: T.bdrLight }}>
                    {(["source", "clone", "config"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setCodeToolTab(t)}
                        className={`-mb-px border-b-2 px-0.5 pb-2.5 text-[13px] font-semibold transition-colors ${uiFont.className}`}
                        style={{ color: codeToolTab === t ? T.accent : T.txt2, borderColor: codeToolTab === t ? T.accent : "transparent" }}>
                        {t === "source" ? "Source" : t === "clone" ? "Clone" : "Config"}
                      </button>
                    ))}
                  </div>

                  {codeToolTab === "source" && (
                    <div className="space-y-3">
                      <select value={sourceFile} onChange={e => setSourceFile(e.target.value as typeof sourceFile)}
                        className="w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
                        style={{ borderColor: T.bdr, background: "#fff", color: T.txt, fontFamily: uiFont.style.fontFamily }}>
                        <option value="pipeline">psych_pipeline.yaml</option>
                        <option value="prompt">system_prompt.md</option>
                        <option value="safety">Safety · local runtime</option>
                      </select>
                      <motion.div key={sourceFile} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle}
                        className="rounded-2xl p-4" style={{ background: T.card, border: `1px solid ${T.bdr}`, boxShadow: T.shadow }}>
                        {sourceFile === "pipeline" && (
                          <><p className="mb-3 text-[10.5px] font-mono font-medium" style={{ color: T.txt3 }}>psych_pipeline.yaml</p>
                          <pre className="m-0 text-[12px] leading-[1.85] whitespace-pre-wrap" style={{ color: T.txt2, fontFamily: monoFont.style.fontFamily }}>{`mode: psych_expert_visible\n\npipeline:\n  context_decomposition\n  signal_mapping\n  intervention_planning\n\nresponse_style:\n  empathy:       high\n  structure:     visible\n  actionability: concise\n  safety:        enforced`}</pre></>
                        )}
                        {sourceFile === "prompt" && (
                          <><p className="mb-3 text-[10.5px] font-mono font-medium" style={{ color: T.txt3 }}>system_prompt.md</p>
                          <pre className="m-0 text-[12px] leading-[1.8] whitespace-pre-wrap" style={{ color: T.txt2, fontFamily: monoFont.style.fontFamily }}>{`You are a supportive psychology\nassistant. Before each response:\n1. Show transparent analysis\n2. Identify emotional state\n3. Map psychological signals\n4. Plan evidence-based response\n\nAlways: Safety-first, non-diagnostic,\npractical, empathetic.`}</pre></>
                        )}
                        {sourceFile === "safety" && (
                          <div>
                            <ul className="m-0 list-none space-y-3 border-l-2 pl-4" style={{ borderColor: `rgba(59,111,180,0.22)` }}>
                              {["Non-diagnostic phrasing; crisis resources when needed","No storage of session text in this demo build","Transparent analysis fields before the conversational reply"].map(line => <li key={line} className="text-[13px] leading-relaxed" style={{ color: T.txt2 }}>{line}</li>)}
                            </ul>
                            <p className="mt-4 border-t pt-3 text-[12px] leading-relaxed" style={{ color: T.green, borderColor: T.bdrLight }}>All processing runs locally. No data is stored or transmitted.</p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {codeToolTab === "clone" && (
                    <div className="space-y-3">
                      <p className="text-[13px] leading-[1.68]" style={{ color: T.txt2 }}>Clone the therapy showroom template — pipeline, analysis UI, and default prompts in one repo.</p>
                      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(40,55,80,0.5)", background: "rgba(14,22,40,0.97)" }}>
                        <div className="flex items-center gap-2 border-b px-3.5 py-2.5" style={{ borderColor: "rgba(80,110,160,0.22)" }}>
                          <span className="text-[11px] font-medium" style={{ color: "rgba(160,180,210,0.7)", fontFamily: monoFont.style.fontFamily }}>Terminal</span>
                        </div>
                        <pre className="m-0 px-3.5 py-3.5 text-[12px] leading-[1.9] whitespace-pre-wrap" style={{ color: "rgba(120,210,150,0.95)", fontFamily: monoFont.style.fontFamily }}>{PSYCH_CLONE_SNIPPET}</pre>
                      </div>
                      <motion.button type="button"
                        onClick={() => { void navigator.clipboard.writeText(PSYCH_CLONE_SNIPPET).catch(() => {}); setCloneCopied(true); window.setTimeout(() => setCloneCopied(false), 2000); }}
                        className="w-full rounded-xl py-3 text-[13.5px] font-semibold"
                        style={{ border: `1px solid ${cloneCopied ? T.accent : T.bdr}`, background: cloneCopied ? T.accentXlt : "#fff", color: cloneCopied ? T.accent : T.txt, transition: "all 0.18s ease" }}
                        whileTap={{ scale: 0.98 }}>
                        {cloneCopied ? "Copied ✓" : "Copy command"}
                      </motion.button>
                    </div>
                  )}

                  {codeToolTab === "config" && (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1.5 text-[11.5px] font-semibold" style={{ color: T.txt }}>Model</p>
                        <select value={cfgModel} onChange={e => setCfgModel(e.target.value)}
                          className="w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
                          style={{ borderColor: T.bdr, background: "#fff", color: T.txt, fontFamily: uiFont.style.fontFamily }}>
                          <option value="qwen-qwq">qwen-qwq — Deep Reasoning</option>
                          <option value="qwen-plus">qwen-plus — Balanced</option>
                          <option value="qwen-turbo">qwen-turbo — Fastest</option>
                        </select>
                      </div>
                      <div className="space-y-4 rounded-xl p-4" style={{ background: T.accentXlt, border: `1px solid ${T.accentRing}` }}>
                        {[
                          { label: "Temperature", value: cfgTemp,   setter: setCfgTemp,   min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2) },
                          { label: "Max tokens",  value: cfgTokens, setter: setCfgTokens, min: 256, max: 4096, step: 128, fmt: (v: number) => String(v) },
                          { label: "Top P",       value: cfgTopP,   setter: setCfgTopP,   min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2) },
                        ].map(sl => (
                          <div key={sl.label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[12px] font-medium" style={{ color: T.txt2 }}>{sl.label}</p>
                              <span className="text-[11.5px] font-mono font-medium" style={{ color: T.accent }}>{sl.fmt(sl.value as number)}</span>
                            </div>
                            <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value as number}
                              onChange={e => (sl.setter as (v: number) => void)(parseFloat(e.target.value))}
                              className="w-full" style={{ accentColor: T.accent }}/>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="mb-2.5 text-[11.5px] font-semibold" style={{ color: T.txt }}>Feature switches</p>
                        <div className="divide-y divide-[rgba(210,220,232,0.5)] rounded-xl overflow-hidden" style={{ border: `1px solid ${T.bdr}` }}>
                          {["Analysis strip visible","Expert KB references","Safety guardrails","Session local-only"].map((label, i) => (
                            <div key={label} className="flex items-center justify-between px-4 py-3 bg-white" style={{ borderTop: i > 0 ? `1px solid ${T.bdrLight}` : "none" }}>
                              <span className="text-[12.5px]" style={{ color: T.txt2 }}>{label}</span>
                              <span className="text-[11px] font-semibold font-mono" style={{ color: T.teal }}>on</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SidePanel>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showShareModal && <ShareModal onClose={() => setShowShareModal(false)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {showKbEditor && <KbEditorModal onClose={() => setShowKbEditor(false)}/>}
      </AnimatePresence>
      <AnimatePresence>
        {showRestartConfirm && (
          <>
            <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring.fade}
              style={{ background: "rgba(8,20,44,0.14)", backdropFilter: "blur(10px)" }}
              onClick={() => setShowRestartConfirm(false)}/>
            <motion.div className="fixed z-50 w-[min(92vw,420px)] overflow-hidden rounded-[24px]"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.8 }}
              style={{ left: "50%", top: "50%", x: "-50%", y: "-50%", background: "#fff", border: `1px solid ${T.bdr}`, boxShadow: T.shadowXl }}>
              <div className="px-7 py-7" style={{ borderBottom: `1px solid ${T.bdrLight}` }}>
                <div className="mb-5 flex justify-center">
                  <motion.div className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ background: T.accentXlt, border: `1px solid ${T.accentRing}`, color: T.accent }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                    <IcoRestart/>
                  </motion.div>
                </div>
                <p className={`mb-2 text-center text-[13px] font-semibold uppercase tracking-[0.12em] ${uiFont.className}`} style={{ color: T.accent }}>Restart session?</p>
                <p className="text-center text-[14px] leading-[1.68]" style={{ color: T.txt2 }}>This will clear the current conversation and analysis progress. This action cannot be undone.</p>
              </div>
              <div className="flex items-center justify-center gap-3 px-7 py-5">
                <motion.button type="button" onClick={() => setShowRestartConfirm(false)}
                  className="rounded-2xl px-5 py-2.5 text-[13px] font-medium"
                  style={{ color: T.txt2, background: "#f5f7fb", border: `1px solid ${T.bdr}` }}
                  whileHover={{ backgroundColor: "#eef1f7" }} whileTap={{ scale: 0.97 }}>
                  Cancel
                </motion.button>
                <motion.button type="button" onClick={onRestart}
                  className="rounded-2xl px-5 py-2.5 text-[13px] font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${T.accent}, #4c8cd4)`, boxShadow: "0 3px 12px -4px rgba(59,111,180,0.4)" }}
                  whileHover={{ filter: "brightness(1.08)" }} whileTap={{ scale: 0.97 }}>
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
