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

// ── Animation presets — ease-first, spring only for spatial moves ──────────────
const spring = {
  // Structural spatial movements (panels, drawers)
  gentle:  { type: "spring", stiffness: 200, damping: 30, mass: 1.0 } as Transition,
  // Tight responses (tap, quick state changes)
  snappy:  { type: "spring", stiffness: 360, damping: 38, mass: 0.9 } as Transition,
  smooth:  { type: "spring", stiffness: 160, damping: 26, mass: 1.1 } as Transition,
  // Opacity / color transitions — duration-based, Apple-style ease-out
  fade:    { duration: 0.20, ease: [0.16, 1, 0.3, 1] } as Transition,
  fadeIn:  { duration: 0.24, ease: [0.16, 1, 0.3, 1] } as Transition,
  fadeOut: { duration: 0.16, ease: [0.4, 0.0, 1.0, 1.0] } as Transition,
};

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg:         "linear-gradient(156deg, #f4f8fc 0%, #ecf2f9 40%, #e4ecf6 72%, #dce6f2 100%)",
  accent:     "#4F6EA0",
  accentLt:   "#8AACD0",
  accentSoft: "rgba(79,110,160,0.07)",
  teal:       "#2A7A6B",
  // Surfaces — shadow-based depth, borders nearly invisible
  card:       "rgba(255,255,255,0.90)",
  cardBdr:    "rgba(0,0,0,0.05)",
  shadow:     "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px -8px rgba(0,0,0,0.07)",
  shadowMd:   "0 1px 4px rgba(0,0,0,0.05), 0 12px 28px -10px rgba(0,0,0,0.09)",
  shadowLg:   "0 2px 8px rgba(0,0,0,0.06), 0 24px 48px -16px rgba(0,0,0,0.12)",
  // User bubble — soft blue-slate
  userBub:    "rgba(214,226,244,0.94)",
  userTxt:    "#1A2435",
  // Typography
  txt:        "#1C1C1E",
  txt2:       "#52637A",
  txt3:       "rgba(82,99,122,0.60)",
  // Nav
  nav:        "rgba(244,248,252,0.97)",
  navBdr:     "rgba(0,0,0,0.07)",
  // Reasoning card — warm amber ink pops nicely against cool bg
  anBg:       "linear-gradient(180deg, #fefcf5 0%, #fdf8e8 100%)",
  anBdr:      "rgba(160,135,60,0.20)",
  anHd:       "#7a6020",
  anLbl:      "#9a7c38",
  anVal:      "#6b5535",
  // Status
  green:      "#1a7550",
  greenBg:    "rgba(26,117,80,0.07)",
  greenBdr:   "rgba(26,117,80,0.18)",
  amber:      "#a66200",
  amberBg:    "rgba(166,98,0,0.06)",
  amberBdr:   "rgba(166,98,0,0.18)",
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
  step:   number;
  time:   string;
  label:  string;
  hint:   string;
  cta?:   string;
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
  { label: "Context Analysis",  detail: "Identifying emotional tone and key themes",  status: "pending" },
  { label: "Signal Mapping",    detail: "Evaluating patterns and coping indicators",  status: "pending" },
  { label: "Response Planning", detail: "Crafting empathetic, actionable guidance",   status: "pending" },
];

const GUIDE_STEPS: GuideStep[] = [
  { step: 1, time: "0:00", label: "Start",    hint: "Choose a prompt or share what's on your mind.", cta: "Begin", action: "focusInput" },
  { step: 2, time: "0:20", label: "Observe",  hint: "Watch the clinical reasoning unfold before the reply." },
  { step: 3, time: "0:45", label: "Review",   hint: "Read the response and its suggested next steps." },
  { step: 4, time: "1:05", label: "Explore",  hint: "Meet the advisory panel that backs the knowledge base.", cta: "View panel", action: "openExpert" },
  { step: 5, time: "1:25", label: "Code",     hint: "See the pipeline spec and model configuration.", cta: "View code", action: "openCode" },
  { step: 6, time: "1:45", label: "Complete", hint: "Share this session or start a new one.", cta: "Share", action: "copyLink" },
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
  text:              "Hello. I'm glad you're here.\n\nTell me what's on your mind — a situation, a feeling, or something you've been carrying. Before I reply, you'll see my reasoning: the emotional pattern I'm tracking, the context I'm building, and the approach I'm considering.\n\nYou'll see the thinking before the answer.",
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
            style={{ background: "rgba(44,35,24,0.88)", color: "#f5f0e4", backdropFilter: "blur(4px)", boxShadow: C.shadow }}>
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Share modal ────────────────────────────────────────────────────────────────
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
    background: vis ? "rgba(44,35,24,0.28)" : "transparent",
    backdropFilter: vis ? "blur(12px)" : "none",
    transition: "background 0.32s ease, backdrop-filter 0.32s ease",
  };
  const card: React.CSSProperties = {
    width: "min(420px,100%)", borderRadius: 16,
    background: "linear-gradient(180deg, rgba(255,254,250,0.99) 0%, rgba(251,248,240,0.97) 100%)",
    border: `1px solid ${C.cardBdr}`,
    boxShadow: "0 28px 72px -32px rgba(80,50,20,0.36)",
    overflow: "hidden",
    opacity: vis ? 1 : 0,
    transform: vis ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
    transition: "opacity 0.32s ease, transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
  };
  return (
    <div role="dialog" aria-modal aria-labelledby="psych-share-title" style={overlay} onClick={close}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${C.cardBdr}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="psych-share-title" style={{ margin: 0, fontFamily: displayFont.style.fontFamily, fontSize: 17, fontWeight: 600, color: C.txt, lineHeight: 1.3 }}>Share this session</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.txt2, lineHeight: 1.5 }}>Copy the link and send it to open this therapy showroom.</p>
          </div>
          <button type="button" aria-label="Close" onClick={close} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: C.txt2, cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>&times;</button>
        </div>
        <div style={{ padding: "18px 20px 20px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, letterSpacing: 0.08, textTransform: "uppercase", color: C.txt3 }}>Page URL</p>
          <div style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.cardBdr}`, background: "rgba(255,252,244,0.85)", fontFamily: "ui-monospace,monospace", fontSize: 12, color: C.txt, wordBreak: "break-all", lineHeight: 1.55 }}>{url || "—"}</div>
          <button
            type="button"
            onClick={copyUrl}
            style={{
              marginTop: 14, width: "100%", padding: "12px 0", borderRadius: 10,
              border: `1px solid ${copied ? C.teal : C.accentLt}`,
              background: copied ? "rgba(42,122,107,0.1)" : C.accentSoft,
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
        style={{ background: "rgba(44,35,24,0.20)", backdropFilter: "blur(4px)" }}
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
          background: "linear-gradient(160deg, rgba(255,254,250,0.99) 0%, rgba(251,248,240,0.98) 100%)",
          border: `1px solid ${C.cardBdr}`,
          boxShadow: "0 32px 72px -32px rgba(80,50,20,0.32)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.cardBdr}` }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: C.accentSoft, border: `1px solid rgba(79,110,160,0.22)` }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <span className="text-[12px] font-medium" style={{ color: C.txt }}>Edit Knowledge Base</span>
            {saved && (
              <motion.span initial={{ opacity:0, x:4 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                className="text-[12px] font-medium" style={{ color: C.teal }}>
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

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(160,140,110,0.2) transparent` }}>
          {categories.map(cat => (
            <div key={cat}>
              <p className="mb-2 text-[11px] uppercase tracking-[.12em] font-semibold" style={{ color: C.accent }}>{cat}</p>
              <div className="space-y-2">
                {entries.filter(e => e.category === cat).map(entry => (
                  <div key={entry.id} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${editing === entry.id ? `rgba(79,110,160,0.32)` : C.cardBdr}`, background: C.card }}>
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
                            className="rounded-full px-3 py-1 text-[12px] font-medium"
                            style={{ color: C.txt3, background: "rgba(255,254,250,0.9)", border: `1px solid ${C.cardBdr}` }}>
                            Cancel
                          </button>
                          <motion.button type="button" onClick={saveEdit}
                            className="rounded-full px-3 py-1 text-[12px] font-medium text-white"
                            style={{ background: `linear-gradient(90deg, ${C.accent} 0%, #6888C0 100%)` }}
                            whileHover={{ filter: "brightness(1.06)" }} whileTap={{ scale: 0.97 }}>
                            Save
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 px-3.5 py-3">
                        <p className="flex-1 text-[13px] leading-[1.7]" style={{ color: C.txt2 }}>{entry.content}</p>
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

        <div className="shrink-0 flex items-center justify-between px-6 py-4"
          style={{ borderTop: `1px solid ${C.cardBdr}`, background: "rgba(251,248,243,0.9)" }}>
          <p className="text-[12px]" style={{ color: C.txt3 }}>{entries.length} entries across {categories.length} categories</p>
          <motion.button type="button" onClick={onClose}
            className="rounded-full px-4 py-1.5 text-[13px] font-medium text-white"
            style={{ background: `linear-gradient(90deg, ${C.accent} 0%, #6888C0 100%)` }}
            whileHover={{ filter: "brightness(1.06)" }} whileTap={{ scale: 0.97 }}>
            Done
          </motion.button>
        </div>
      </motion.div>
    </>
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
        background: active ? "rgba(79,110,160,0.1)" : "rgba(160,140,110,0.06)",
        border: `1px solid ${active ? "rgba(79,110,160,0.28)" : "rgba(160,140,110,0.16)"}`,
        color: active ? C.accent : C.txt2,
        boxShadow: active ? "0 2px 12px -4px rgba(79,110,160,0.22)" : "none",
      }}
      whileHover={{ opacity: 0.75 }}
      whileTap={{ opacity: 0.5 }}
      transition={spring.fade}
    >
      {children}
    </motion.button>
  );
}

// ── Side panel ─────────────────────────────────────────────────────────────────
function SidePanel({ title, onClose, children, variant = "overlay" }: {
  title: string; onClose: () => void; children: React.ReactNode;
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
          ? "relative z-20 flex h-full w-[416px] shrink-0 flex-col overflow-hidden"
          : "fixed right-0 top-0 z-40 flex h-full w-[416px] flex-col overflow-hidden"
      }
      style={{
        background: "linear-gradient(180deg, rgba(244,248,253,0.985) 0%, rgba(236,244,252,0.975) 100%)",
        backdropFilter: "blur(8px)",
        borderLeft: `1px solid ${C.navBdr}`,
        boxShadow: "-14px 0 40px -12px rgba(80,50,20,0.10)",
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${C.navBdr}` }}>
        <p className={`text-[13px] font-semibold tracking-[.04em] ${uiFont.className}`}
          style={{ color: C.txt2 }}>{title}</p>
        <motion.button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ background: "transparent", color: C.txt2, border: "none" }}
          whileHover={{ opacity: 0.8 }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
        >
          <IcoClose/>
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(160,140,110,0.14) transparent` }}>
        {children}
      </div>
    </motion.aside>
  );
}

// ── Quick guide panel content ──────────────────────────────────────────────────
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
            <p className="text-[12px] font-semibold uppercase tracking-[.1em]" style={{ color: C.accent }}>Walkthrough</p>
            <p className="text-[12px] mt-1" style={{ color: C.txt3 }}>All key interactions in about 2 minutes</p>
          </div>
          <p className="text-[12px]" style={{ color: C.txt2 }}>
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
                  ? `linear-gradient(90deg, rgba(79,110,160,0.72), rgba(42,122,107,0.72))`
                  : i === guideStep
                    ? "rgba(79,110,160,0.6)"
                    : "rgba(160,140,110,0.16)",
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
        style={{ background: "rgba(255,254,250,0.72)", border: `1px solid ${C.cardBdr}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: C.accentSoft, color: C.accent }}>
            <span className="text-[12px] font-semibold">{GUIDE_STEPS[guideStep].step}</span>
          </div>
          <div>
            <p className="text-[14px] font-medium" style={{ color: C.txt }}>{GUIDE_STEPS[guideStep].label}</p>
            <p className="text-[12px]" style={{ color: C.txt3 }}>{GUIDE_STEPS[guideStep].time}</p>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: C.txt2 }}>
          {GUIDE_STEPS[guideStep].hint}
        </p>

        {GUIDE_STEPS[guideStep].cta && (
          <motion.button
            type="button"
            onClick={() => runGuideAction(GUIDE_STEPS[guideStep].action)}
            className="mt-3 rounded-lg px-3 py-1.5 text-[13px] font-medium"
            style={{ color: C.accent, background: C.accentSoft, border: `1px solid rgba(79,110,160,0.18)` }}
            whileHover={{ backgroundColor: "rgba(79,110,160,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
          >
            {GUIDE_STEPS[guideStep].cta}
          </motion.button>
        )}
      </motion.div>

      <div className="rounded-xl px-3.5 py-3" style={{ background: "rgba(79,110,160,0.04)", border: "1px solid rgba(79,110,160,0.12)" }}>
        <p className="mb-2 text-[11px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>All steps</p>
        <div className="space-y-1.5">
          {GUIDE_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              onClick={() => setGuideStep(i)}
              className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1"
              style={{ background: i === guideStep ? C.accentSoft : "transparent" }}
              whileHover={{ backgroundColor: i === guideStep ? C.accentSoft : "rgba(160,140,110,0.06)" }}
              transition={spring.snappy}
            >
              <span className="text-[11px] w-[32px]" style={{ color: C.txt3 }}>{s.time}</span>
              <p className="text-[13px]" style={{ color: i <= guideStep ? C.txt2 : C.txt3 }}>{s.label}</p>
              {i < guideStep && <span className="ml-auto text-[12px]" style={{ color: C.green }}>Done</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => setGuideStep((s) => Math.max(0, s - 1))}
          disabled={guideStep === 0}
          className="flex-1 rounded-lg px-3 py-2 text-[13px] disabled:opacity-50"
          style={{
            color: guideStep === 0 ? C.txt3 : C.txt2,
            background: "rgba(255,254,250,0.7)",
            border: `1px solid ${guideStep === 0 ? "rgba(160,140,110,0.12)" : "rgba(160,140,110,0.22)"}`,
          }}
          whileHover={guideStep > 0 ? { backgroundColor: "rgba(255,254,250,0.9)" } : {}}
          whileTap={guideStep > 0 ? { scale: 0.98 } : {}}
          transition={spring.snappy}
        >
          ← Prev
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setGuideStep((s) => Math.min(GUIDE_STEPS.length - 1, s + 1))}
          disabled={guideStep === GUIDE_STEPS.length - 1}
          className="flex-1 rounded-lg px-3 py-2 text-[13px] disabled:opacity-50"
          style={{
            color: guideStep === GUIDE_STEPS.length - 1 ? C.txt3 : C.accent,
            background: guideStep === GUIDE_STEPS.length - 1 ? "rgba(255,254,250,0.7)" : C.accentSoft,
            border: `1px solid ${guideStep === GUIDE_STEPS.length - 1 ? "rgba(160,140,110,0.14)" : "rgba(79,110,160,0.22)"}`,
          }}
          whileHover={guideStep < GUIDE_STEPS.length - 1 ? { backgroundColor: "rgba(79,110,160,0.12)" } : {}}
          whileTap={guideStep < GUIDE_STEPS.length - 1 ? { scale: 0.98 } : {}}
          transition={spring.snappy}
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
}

// ── Reasoning card ─────────────────────────────────────────────────────────────
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
      {/* Toggle button — explicit "show/hide reasoning" affordance */}
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2.5 rounded-full px-3.5 py-2 text-left"
        style={{
          background: done
            ? "rgba(255,253,247,0.80)"
            : "rgba(255,248,230,0.60)",
          border: `1px solid ${done ? "rgba(210,185,100,0.36)" : "rgba(210,185,100,0.24)"}`,
          boxShadow: "0 4px 14px -10px rgba(120,80,0,0.18)",
          transition: "background 150ms ease, border-color 150ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = done ? "rgba(255,253,247,0.96)" : "rgba(255,248,230,0.80)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = done ? "rgba(255,253,247,0.80)" : "rgba(255,248,230,0.60)"; }}
      >
        <span style={{ color: done ? C.green : C.amber, flexShrink: 0, display: "flex" }}>
          {done ? <IcoCheck size={14}/> : <IcoSpinner/>}
        </span>
        <span className={`font-medium ${uiFont.className} text-[14px]`}
          style={{ color: done ? C.anHd : C.amber }}>
          {done ? "Reasoning" : "Reasoning…"}
        </span>
        {!done && (
          <span className="text-[12px]" style={{ color: "rgba(166,98,0,0.55)" }}>
            {Math.min(phase + 1, NUM_FIELDS)}/{NUM_FIELDS}
          </span>
        )}
        {done && (
          <span className="text-[12px]" style={{ color: C.anLbl }}>
            {collapsed ? "· show" : "· hide"}
          </span>
        )}
        <span
          style={{
            color: C.anLbl,
            opacity: done ? 0.8 : 0.4,
            display: "flex",
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 150ms ease",
          }}
        >
          <svg viewBox="0 0 14 14" fill="none" width={14} height={14} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </span>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="pt-3 pl-1">
          <div
            className="space-y-2.5 pl-3.5"
            style={{ borderLeft: `2px solid rgba(210,185,100,0.30)` }}
          >
            {typedLines.map((line, idx) => {
              const colonIdx = line.indexOf(": ");
              const label = colonIdx !== -1 ? line.slice(0, colonIdx) : null;
              const value = colonIdx !== -1 ? line.slice(colonIdx + 2) : line;
              return (
                <div key={`${analysisLines[idx]}-${idx}`}>
                  {label && (
                    <p className="text-[11px] font-semibold uppercase tracking-[.1em] mb-0.5"
                      style={{ color: done ? C.anLbl : "rgba(120,95,0,0.55)" }}>
                      {label}
                    </p>
                  )}
                  <p className="text-[14px] leading-[1.68]"
                    style={{ color: done ? C.anVal : "rgba(42,30,0,0.55)" }}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          {phase < NUM_FIELDS && !done && (
            <p className="mt-1 pl-3.5 text-[12px] leading-[1.7]" style={{ color: "rgba(120,95,0,0.28)" }}>
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
      <div className="max-w-[72%] rounded-[18px] px-5 py-3.5"
        style={{
          background: C.userBub,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 14px -4px rgba(79,110,160,0.14)",
        }}>
        <p className="text-[14px] leading-[1.7]" style={{ color: C.userTxt }}>{text}</p>
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
      {msg.analysis && (
        <AnalysisCard
          data={msg.analysis}
          phase={NUM_FIELDS}
          collapsed={msg.analysisCollapsed}
          onToggle={onToggleAnalysis}
        />
      )}
      <div
        className="w-full max-w-[72%] rounded-[18px] px-5 py-4"
        style={{
          background: "#ffffff",
          boxShadow: C.shadowMd,
        }}
      >
        <div className={`space-y-3 ${uiFont.className}`}>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[14px] leading-[1.80]"
              style={{
                color: p.type === "lead" ? C.txt : C.txt2,
                fontWeight: p.type === "lead" ? 450 : 400,
              }}
            >
              {p.type === "body" && i > 0 && (
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: "rgba(160,140,110,0.50)" }}/>
              )}
              {p.text}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Tip label="Regenerate">
          <motion.button
            type="button"
            onClick={onRegenerate}
            className="p-1"
            style={{ color: C.txt3 }}
            whileHover={{ color: C.accent, opacity: 1 }}
            whileTap={{ opacity: 0.6 }}
            transition={spring.fade}
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
            whileHover={{ color: C.accent, opacity: 1 }}
            whileTap={{ opacity: 0.6 }}
            transition={spring.fade}
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
        className="inline-flex w-fit items-center gap-2.5 rounded-[18px] px-5 py-3.5"
        style={{
          background: "rgba(255,254,250,0.80)",
          border: `1px solid ${C.cardBdr}`,
          boxShadow: C.shadow,
        }}
      >
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.5 }}/>
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.5 }}/>
        <span className="typing-dot h-2 w-2 rounded-full" style={{ background: C.accent, opacity: 0.5 }}/>
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
    onRegisterFocus(() => { ref.current?.focus(); });
  }, [onRegisterFocus]);

  return (
    <div className="relative z-20 shrink-0 px-6 pb-6 pt-4"
      style={{
        background: "linear-gradient(180deg, rgba(244,248,252,0.98) 0%, rgba(236,242,250,0.97) 100%)",
        backdropFilter: "blur(4px)",
        borderTop: `1px solid ${C.navBdr}`,
      }}>
      <div className="mx-auto max-w-[760px]">
        {/* Quick prompts */}
        <div className="mb-3.5 flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_PROMPTS.map(q => (
            <motion.button
              key={q}
              type="button"
              disabled={analyzing}
              onClick={() => { if (!analyzing) onSend(q); }}
              className="shrink-0 rounded-full px-4 py-2 text-[12px] whitespace-nowrap font-medium disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.88)",
                border: `1px solid rgba(0,0,0,0.07)`,
                color: C.txt2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              whileHover={{ color: C.accent, borderColor: "rgba(79,110,160,0.24)", background: "rgba(255,255,255,1)" }}
              whileTap={{ opacity: 0.7 }}
              transition={spring.fade}
            >
              {q}
            </motion.button>
          ))}
        </div>

        {/* Composer */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: "#ffffff",
            border: `1px solid ${focused ? "rgba(79,110,160,0.28)" : "rgba(0,0,0,0.07)"}`,
            boxShadow: focused ? `0 0 0 3px rgba(79,110,160,0.07), ${C.shadowMd}` : C.shadow,
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
          }}
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
              placeholder={analyzing ? "Thinking…" : "Share what's on your mind…"}
              className="flex-1 resize-none bg-transparent text-[14px] outline-none disabled:opacity-50"
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
              <motion.button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className="flex h-8 w-8 items-center justify-center rounded-xl disabled:opacity-30"
                style={{
                  background: canSend ? `linear-gradient(135deg, ${C.accent}, ${C.teal})` : "rgba(0,0,0,0.08)",
                  color: "white",
                  boxShadow: canSend ? "0 2px 8px -2px rgba(79,110,160,0.36)" : "none",
                  transition: "background 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
                }}
                whileTap={canSend ? { scale: 0.93 } : {}}
                transition={spring.snappy}
              >
                <IcoSend/>
              </motion.button>
            </div>
          </div>
        </div>
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
  // No splash — enter directly
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

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const guideInputFocusRef = useRef<(() => void) | null>(null);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = chatScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
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

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", text, analysisCollapsed: false }]);

    const analysis = generateAnalysis(text);
    setAnalyzing(true);
    setBuild({ phase: 0, analysis });

    setPipeline(PIPE_INIT.map(s => ({ ...s, status: "pending" as StepStatus })));

    const PHASE_MS = 480;

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

    const tReply = setTimeout(() => {
      const replyText = buildReply(text);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: replyText,
        analysis,
        analysisCollapsed: false,
      }]);
      setPipeline(PIPE_INIT.map(s => ({ ...s, status: "done" as StepStatus })));
      setBuild(null);
      setAnalyzing(false);
    }, NUM_FIELDS * PHASE_MS);
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

  const requestRestart = useCallback(() => { setShowRestartConfirm(true); }, []);

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
    try { await navigator.clipboard.writeText(text); } catch {}
  }, []);

  const copyCurrentLink = useCallback(async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
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
    if (action === "focusInput") { guideInputFocusRef.current?.(); return; }
    if (action === "openExpert") { setPanelTab("expert"); setPanelOpen(true); return; }
    if (action === "openCode") { setCodeToolTab("source"); setPsychSourcePage("pipeline"); setPanelTab("code"); setPanelOpen(true); return; }
    if (action === "copyLink") { void copyCurrentLink(); return; }
    if (action === "restart") { requestRestart(); }
  }, [copyCurrentLink, requestRestart]);

  // Expert colors — warm, each unique
  const EXPERT_COLORS = [
    "linear-gradient(135deg, #4A8A72 0%, #2E6A54 100%)",  // sage  — CBT / stress
    "linear-gradient(135deg, #8A6040 0%, #6A4820 100%)",  // amber — relationships
    "linear-gradient(135deg, #5C6EA8 0%, #3D5090 100%)",  // indigo — safety / crisis
  ];

  return (
    <>
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
        @media(prefers-reduced-motion:reduce){
          .typing-dot{animation:none!important}
        }
      `}</style>

      {/* Soft blue ambient radials */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: [
            "radial-gradient(circle at 16% 16%, rgba(180,210,240,0.20) 0%, transparent 44%)",
            "radial-gradient(circle at 84% 20%, rgba(155,195,235,0.16) 0%, transparent 40%)",
            "radial-gradient(circle at 52% 84%, rgba(175,210,245,0.18) 0%, transparent 44%)",
          ].join(","),
        }}/>
      </div>

      {/* ── Navigation ── */}
      <motion.header
        className="relative z-30 shrink-0 flex items-center gap-3 px-6 py-3"
        style={{
          background: C.nav,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.navBdr}`,
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring.gentle, delay: 0.1 }}
      >
        {/* Brand */}
        <div className="mr-1 flex min-w-0 flex-col justify-center gap-0.5 py-px">
          <p className={`text-[14px] font-semibold tracking-[-0.01em] ${displayFont.className}`}
            style={{ color: C.txt }}>Therapy Space</p>
          <p className="text-[9.5px] tracking-[.06em]" style={{ color: C.txt3 }}>
            Backed by clinical reasoning
          </p>
        </div>

        <div className="flex-1"/>

        {/* Actions — simplified: Experts, divider, Share, Restart, Guide */}
        <nav className="flex items-center gap-1.5">
          <Tip label="Clinical advisory panel">
            <NavBtn onClick={() => openPanel("expert")} active={panelOpen && panelTab === "expert"} wide>
              <IcoExpert/>
              <span className="text-[11px] font-medium">Experts</span>
            </NavBtn>
          </Tip>

          <div className="mx-1 h-5 w-px" style={{ background: "rgba(160,140,110,0.22)" }}/>

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
      <div
        ref={chatScrollRef}
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: `rgba(160,140,110,0.12) transparent` }}
      >
        <div className="mx-auto w-full max-w-[720px] px-8 pt-10 pb-6">

          <AnimatePresence initial={false}>
            {messages.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={rm ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.fadeIn, delay: idx === 0 ? 0.18 : 0 }}
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

          {/* Building reasoning */}
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

          <div className="h-4" aria-hidden />
        </div>
      </div>

      {/* ── Input ── */}
      <InputDock analyzing={analyzing} onSend={handleSend} onRegisterFocus={(fn) => { guideInputFocusRef.current = fn; }}/>
      </div>

      {/* Side panel — in-flow dock, slides open and pushes chat column */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            key="psych-panel"
            initial={{ width: 0 }}
            animate={{ width: 416 }}
            exit={{ width: 0 }}
            transition={spring.gentle}
            style={{ overflow: "hidden", flexShrink: 0 }}
          >
          <SidePanel
            title={
              panelTab === "guide"    ? "Quick Guide"
              : panelTab === "analysis" ? "Reasoning"
              : panelTab === "expert"   ? "Expert Panel"
              :                           "Developer Tools"
            }
            onClose={closePanel}
            variant="dock">

            {/* Guide tab */}
            {panelTab === "guide" && (
              <PsychQuickGuideContent
                guideStep={guideStep}
                setGuideStep={setGuideStep}
                runGuideAction={runGuideAction}
              />
            )}

            {panelTab === "analysis" && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>Pipeline progress</p>
                    <p className="text-[12px] font-medium" style={{ color: C.txt2 }}>
                      {pipeline.filter(s => s.status === "done").length} / {pipeline.length}
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(79,110,160,0.09)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${(pipeline.filter(s => s.status === "done").length / pipeline.length) * 100}%` }}
                      transition={spring.gentle}
                      style={{ background: `linear-gradient(90deg, ${C.accent}, ${C.teal})` }}
                    />
                  </div>
                </div>

                {pipeline.map((step, i) => (
                  <motion.div
                    key={step.label}
                    layout
                    className="rounded-xl px-3.5 py-3"
                    style={{
                      background: step.status === "running" ? C.accentSoft
                        : step.status === "done" ? C.greenBg : "rgba(255,254,250,0.68)",
                      border: `1px solid ${
                        step.status === "running" ? "rgba(79,110,160,0.20)"
                        : step.status === "done" ? C.greenBdr : C.cardBdr}`,
                    }}
                    transition={spring.gentle}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5"
                        style={{
                          background: step.status === "done" ? C.greenBg : C.accentSoft,
                          border: `1px solid ${step.status === "done" ? C.greenBdr : "rgba(79,110,160,0.16)"}`,
                          color: step.status === "done" ? C.green : C.txt3,
                        }}>
                        {step.status === "done" ? <IcoCheck size={10}/>
                          : step.status === "running" ? <IcoSpinner/>
                          : <span className="text-[11px]" style={{ color: C.txt3 }}>{i + 1}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium" style={{ color: C.txt }}>{step.label}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: C.txt2 }}>{step.detail}</p>
                        <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: step.status === "done" ? C.greenBg : step.status === "running" ? C.accentSoft : "rgba(160,140,110,0.09)",
                            color: step.status === "done" ? C.green : step.status === "running" ? C.accent : C.txt3,
                            border: `1px solid ${step.status === "done" ? C.greenBdr : step.status === "running" ? "rgba(79,110,160,0.18)" : "rgba(160,140,110,0.18)"}`,
                          }}>
                          {step.status === "done" ? "Complete" : step.status === "running" ? "Running" : "Waiting"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="rounded-xl px-3.5 py-3" style={{ background: C.accentSoft, border: "1px solid rgba(79,110,160,0.12)" }}>
                  <p className="mb-2 text-[11px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>Reasoning fields</p>
                  <div className="space-y-1.5">
                    {ANALYSIS_FIELDS.map(f => (
                      <div key={f.key} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full shrink-0" style={{ background: C.accentLt }}/>
                        <p className="text-[13px]" style={{ color: C.txt2 }}>{f.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expert tab */}
            {panelTab === "expert" && (
              <div className="space-y-4">
                <p className="text-[14px] leading-[1.68]" style={{ color: C.txt2 }}>
                  Co-designed with clinical professionals whose expertise shapes our knowledge base, review process, and safety constraints.
                </p>

                <div>
                  <p className="mb-2.5 text-[11px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>Clinical Advisory Panel</p>
                  <div className="space-y-2.5">
                    {[
                      {
                        photo: "/assets/psych/expert-1.png",
                        photoPos: "center 20%",
                        initials: "AH",
                        name: "Dr. Amara Hayes",
                        title: "Clinical Psychologist",
                        affiliation: "Columbia University",
                        specialty: "CBT · Stress Recovery",
                        cred: "PhD, Licensed Psychologist",
                      },
                      {
                        photo: "/assets/psych/expert-2.png",
                        photoPos: "center top",
                        initials: "SR",
                        name: "Dr. Sofia Reyes",
                        title: "Counseling Research Lead",
                        affiliation: "NYU Langone Health",
                        specialty: "Relationship Communication",
                        cred: "PsyD, ABPP Certified",
                      },
                      {
                        photo: "/assets/psych/expert-3.png",
                        photoPos: "30% 15%",
                        initials: "KB",
                        name: "Dr. Kate Brennan",
                        title: "Crisis Intervention Specialist",
                        affiliation: "Weill Cornell Medicine",
                        specialty: "Safety Protocols · Risk Assessment",
                        cred: "PhD, APA Fellow",
                      },
                    ].map((e, ei) => (
                      <div key={e.name} className="flex gap-3 rounded-2xl p-3.5"
                        style={{ background: C.card, border: `1px solid ${C.cardBdr}`, boxShadow: C.shadow }}>
                        {e.photo ? (
                          <img
                            src={e.photo}
                            alt={e.name}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                            style={{ objectPosition: e.photoPos, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                            style={{ background: EXPERT_COLORS[ei] }}>
                            {e.initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-semibold leading-tight" style={{ color: C.txt }}>{e.name}</p>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[.04em]"
                              style={{ background: C.accentSoft, color: C.accent, border: `1px solid rgba(79,110,160,0.18)` }}>
                              Verified
                            </span>
                          </div>
                          <p className="mt-0.5 text-[13px]" style={{ color: C.txt2 }}>{e.title}</p>
                          <p className="mt-0.5 text-[12px]" style={{ color: C.txt3 }}>{e.affiliation}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {e.specialty.split(" · ").map((s) => (
                              <span key={s} className="rounded-full px-2 py-0.5 text-[12px]"
                                style={{ background: "rgba(42,122,107,0.07)", color: C.teal, border: "1px solid rgba(42,122,107,0.18)" }}>
                                {s}
                              </span>
                            ))}
                            <span className="rounded-full px-2 py-0.5 text-[12px]"
                              style={{ background: "rgba(255,254,250,0.8)", color: C.txt3, border: `1px solid ${C.cardBdr}` }}>
                              {e.cred}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge base */}
                <div className="rounded-2xl p-4" style={{ background: "rgba(255,254,250,0.82)", border: `1px solid ${C.cardBdr}` }}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[12px] font-semibold uppercase tracking-[.1em]" style={{ color: C.accent }}>Knowledge Base</p>
                    <motion.button
                      type="button"
                      onClick={() => setShowKbEditor(true)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                      style={{ background: C.accentSoft, color: C.accent, border: `1px solid rgba(79,110,160,0.2)` }}
                      whileHover={{ background: `rgba(79,110,160,0.12)` }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </motion.button>
                  </div>
                  <p className="mb-3 text-[13px] leading-[1.72]" style={{ color: C.txt2 }}>
                    Built with clinical professionals — reviewed frameworks, evidence-informed strategies, and safety constraints.
                  </p>
                </div>

                <div>
                  <p className="mb-2.5 text-[11px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>Core principles</p>
                  <div className="space-y-2.5">
                    {[
                      "Safety-aware language in every reply",
                      "Non-diagnostic framing throughout",
                      "Practical first steps, no clinical claims",
                      "Transparent reasoning before each response",
                    ].map(p => (
                      <div key={p} className="flex items-start gap-2">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.teal }}/>
                        <p className="text-[12px] leading-relaxed" style={{ color: C.txt2 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Code tab */}
            {panelTab === "code" && (
              <div className="space-y-4">
                <p className={`text-[12px] leading-[1.55] ${uiFont.className}`} style={{ color: C.txt2 }}>
                  Browse the spec, copy the install command, or adjust demo model settings.
                </p>

                <div className="flex flex-wrap gap-5 border-b" style={{ borderColor: "rgba(160,140,110,0.30)" }}>
                  {(["source", "clone", "config"] as const).map(t => {
                    const on = codeToolTab === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCodeToolTab(t)}
                        className={`-mb-px border-b-2 px-0.5 pb-2.5 text-[13px] font-semibold transition-colors ${uiFont.className}`}
                        style={{ color: on ? C.accent : C.txt2, borderColor: on ? C.accent : "transparent" }}
                      >
                        {t === "source" ? "Source" : t === "clone" ? "Clone" : "Config"}
                      </button>
                    );
                  })}
                </div>

                {codeToolTab === "source" && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="psych-code-src" className={`block text-[12px] font-semibold ${uiFont.className}`} style={{ color: C.txt }}>File</label>
                      <select
                        id="psych-code-src"
                        value={psychSourcePage}
                        onChange={e => setPsychSourcePage(e.target.value as "pipeline" | "prompt" | "safety")}
                        className="mt-1.5 w-full rounded-lg border py-2.5 px-3 text-[13px] outline-none"
                        style={{ borderColor: C.cardBdr, background: "rgba(255,254,250,0.95)", color: C.txt, fontFamily: uiFont.style.fontFamily }}
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
                          <p className="mb-3 text-[12px] font-mono font-medium" style={{ color: C.txt3 }}>psych_pipeline.yaml</p>
                          <pre className="m-0 text-[12px] leading-[1.8] whitespace-pre-wrap" style={{ color: C.txt2, fontFamily: monoFont.style.fontFamily }}>
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
                          <p className="mb-3 text-[12px] font-mono font-medium" style={{ color: C.txt3 }}>system_prompt.md</p>
                          <pre className="m-0 text-[12px] leading-[1.75] whitespace-pre-wrap" style={{ color: C.txt2, fontFamily: monoFont.style.fontFamily }}>
{`You are a supportive psychology
assistant. Before each response:
1. Show transparent reasoning
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
                          <ul className="m-0 list-none space-y-3 border-l-2 pl-4" style={{ borderColor: "rgba(79,110,160,0.25)" }}>
                            {[
                              "Non-diagnostic phrasing; crisis resources when needed",
                              "No storage of session text in this demo build",
                              "Transparent reasoning fields before the conversational reply",
                            ].map(line => (
                              <li key={line} className="text-[13px] leading-relaxed" style={{ color: C.txt2 }}>{line}</li>
                            ))}
                          </ul>
                          <p className="mt-4 border-t pt-3 text-[12px] leading-relaxed"
                            style={{ color: C.green, borderColor: C.cardBdr }}>
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
                      Clone the therapy showroom template — pipeline, reasoning UI, and default prompts in one repo.
                    </p>
                    <div className="overflow-hidden rounded-lg" style={{ border: "1px solid rgba(79,110,160,0.25)", background: "rgba(22,18,14,0.96)" }}>
                      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "rgba(100,90,70,0.25)" }}>
                        <span className="text-[12px] text-white/55" style={{ fontFamily: monoFont.style.fontFamily }}>Terminal</span>
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
                        border: `1px solid ${cloneCopied ? C.accent : C.cardBdr}`,
                        background: cloneCopied ? C.accentSoft : "rgba(255,254,250,0.95)",
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
                        style={{ borderColor: C.cardBdr, background: "rgba(255,254,250,0.95)", color: C.txt, fontFamily: uiFont.style.fontFamily }}
                      >
                        <option value="qwen-qwq">qwen-qwq — Deep Reasoning</option>
                        <option value="qwen-plus">qwen-plus — Balanced</option>
                        <option value="qwen-turbo">qwen-turbo — Fastest</option>
                      </select>
                    </div>
                    <div className="space-y-3 rounded-lg p-3" style={{ background: C.accentSoft, border: `1px solid rgba(79,110,160,0.12)` }}>
                      {[
                        { label: "Temperature", value: cfgTemp, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2), set: setCfgTemp },
                        { label: "Max tokens",  value: cfgTokens, min: 256, max: 4096, step: 128, fmt: (v: number) => String(v), set: setCfgTokens },
                        { label: "Top P",       value: cfgTopP,  min: 0, max: 1,    step: 0.01, fmt: (v: number) => v.toFixed(2), set: setCfgTopP },
                      ].map(cfg => (
                        <div key={cfg.label}>
                          <p className={`text-[13px] font-medium ${uiFont.className}`} style={{ color: C.txt2 }}>{`${cfg.label} — ${cfg.fmt(cfg.value)}`}</p>
                          <input
                            type="range"
                            min={cfg.min}
                            max={cfg.max}
                            step={cfg.step}
                            value={cfg.value}
                            onChange={e => cfg.set(parseFloat(e.target.value) as never)}
                            className="mt-1.5 w-full"
                            style={{ accentColor: C.accent }}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className={`mb-2 text-[12px] font-semibold ${uiFont.className}`} style={{ color: C.txt }}>Feature switches</p>
                      <ul className="m-0 list-none space-y-0 p-0">
                        {["Reasoning strip visible", "Expert KB references", "Safety guardrails", "Session local-only"].map(label => (
                          <li
                            key={label}
                            className="flex items-center justify-between border-b py-2 text-[12px] last:border-0"
                            style={{ color: C.txt2, borderColor: C.cardBdr }}
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
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>

    {/* Modals */}
    <AnimatePresence>
      {showShareModal && <PsychShareModal onClose={() => setShowShareModal(false)} />}
    </AnimatePresence>
    <AnimatePresence>
      {showKbEditor && <KbEditorModal onClose={() => setShowKbEditor(false)} />}
    </AnimatePresence>

    {/* Restart confirm — clean, no sparkles */}
    <AnimatePresence>
      {showRestartConfirm && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring.fade}
            style={{ background: "rgba(44,35,24,0.18)" }}
            onClick={() => setShowRestartConfirm(false)}
          />
          <motion.div
            className="fixed z-50 w-[min(92vw,400px)] overflow-hidden rounded-2xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.9 }}
            style={{
              left: "50%", top: "50%", x: "-50%", y: "-50%",
              background: "linear-gradient(180deg, rgba(255,254,250,0.99) 0%, rgba(251,248,240,0.97) 100%)",
              border: `1px solid ${C.cardBdr}`,
              boxShadow: "0 24px 56px -24px rgba(80,50,20,0.40)",
            }}
          >
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.cardBdr}` }}>
              <p className={`text-[15px] font-semibold ${displayFont.className}`} style={{ color: C.txt }}>
                Restart session?
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: C.txt2 }}>
                This will clear the current conversation and reasoning history. You can&apos;t undo this.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 px-6 py-4">
              <motion.button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="rounded-xl px-4 py-2 text-[12px] font-medium"
                style={{ color: C.txt2, background: "rgba(255,254,250,0.88)", border: `1px solid ${C.cardBdr}` }}
                whileHover={{ backgroundColor: "rgba(255,254,250,1)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={onRestart}
                className="rounded-xl px-4 py-2 text-[12px] font-medium text-white"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #3A5E90 100%)` }}
                whileHover={{ filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                Restart
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <CursorLayer/>
    </>
  );
}
