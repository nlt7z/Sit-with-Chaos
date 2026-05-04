"use client";

import {
  AnimatePresence, motion,
  useMotionValue, useSpring, useReducedMotion,
} from "framer-motion";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { memo, useCallback, useEffect, useRef, useState, useMemo } from "react";

const displayFont = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"] });
const serifFont   = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"] });
const uiFont      = Inter({ subsets: ["latin"], weight: ["300", "400", "500"] });

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  txt:      "#2a2030",
  txt2:     "#7c6e8c",
  txt3:     "rgba(124,110,140,0.52)",
  accent:   "#a07ab8",
  accentLt: "#ccb0e0",
  rose:     "#c8939e",
  card:     "rgba(255,255,255,0.88)",
  cardBdr:  "rgba(178,152,205,0.2)",
  shadow:   "0 8px 32px -14px rgba(90,65,128,0.16)",
  userBub:  "#ede3f6",
  userTxt:  "#36185a",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ChatMode = "Astrology Consult" | "Casual Chat";
type SourceDb = "zodiac_memory_db" | "smalltalk_memory_db";
type CardData = { name: string; symbol: string; suit: string; meaning: string };
type Msg = {
  id: number; role: "assistant" | "user";
  text: string; mode?: ChatMode; sourceDb?: SourceDb; cue?: string;
  isOpening?: boolean; isDrawing?: boolean; cardDraw?: CardData;
};
type MemoryItem = { id: number; label: string; value: string };
type ZodiacSign = { code: string; en: string; trait: string };
/** Self + optional other person (synastry / relationship). N people: repeat “other” slots with new id ranges, or move to a subject-keyed list in a real product. */
type UserProfile = {
  name: string;
  sign: ZodiacSign;
  partnerName?: string;
  partnerSign?: ZodiacSign | null;
};

/** Pinned zodiac archive slots: self 0–2, other 10–12, consult 99. Live chat memory uses other ids. */
const ARCHIVE_SLOT_IDS = new Set([0, 1, 2, 10, 11, 12, 99]);

// ─── Background stars (fixed, no runtime random) ──────────────────────────────
const BG_STARS: [number, number, number, number][] = [
  [8,6,1.5,0],[22,2,1,1.4],[38,9,2,0.6],[55,4,1.5,2],[72,7,1,0.3],
  [87,3,2,1.8],[4,22,1,2.3],[17,35,1.5,0.4],[50,18,1,0.1],[81,20,1,0.8],
  [11,55,1.5,2.5],[28,70,1,0.5],[46,60,2,1.9],[63,78,1.5,0.2],[79,65,1,2.1],
  [3,80,1.5,1.3],[42,93,2,0.3],[60,85,1.5,1.1],[76,92,1,1.7],[92,76,2,0.9],
];
/** Fewer twinkling nodes = less compositing work */
const BG_STARS_RENDER = BG_STARS.slice(0, 10);

// ─── Astro cards (symbol is SVG icon key, not emoji) ──────────────────────────
const ASTRO_CARDS: CardData[] = [
  { name: "The Star",      symbol: "star",     suit: "Major Arcana", meaning: "Hope returns. You are being guided — trust the light ahead, even if it flickers." },
  { name: "The Moon",      symbol: "moon",     suit: "Major Arcana", meaning: "Your intuition is sharper than you know. Let it lead tonight." },
  { name: "Venus Rising",  symbol: "venus",    suit: "Planetary",    meaning: "Love is not running from you. You are simply catching up to it." },
  { name: "Saturn's Ring", symbol: "saturn",   suit: "Planetary",    meaning: "The structure you resist is the one that will finally hold you." },
  { name: "The Twins",     symbol: "gemini",   suit: "Zodiac Signs", meaning: "Two truths coexist here. You don't have to choose right now." },
  { name: "The Deep",      symbol: "pisces",   suit: "Zodiac Signs", meaning: "You feel more than you say. That depth is your greatest gift." },
  { name: "The Archer",    symbol: "archer",   suit: "Zodiac Signs", meaning: "The goal is already in sight. Release the arrow." },
];

const ASTRO_CLONE_SNIPPET = `git clone https://github.com/example/tao-baibai-astro
cd tao-baibai-astro && pnpm i && pnpm dev`;

const ASTRO_PERSONA_SPEC = `role: tao_baibai_astro
voice: warm · precise · story-first
safety: entertainment + guidance (no medical/legal claims)
intents: [love, career, self-worth, chart, casual]
tools: [chart_lookup, transit_check, card_draw, memory_read]`;

// SVG icons for cards (gold strokes)
function CardSymbolIcon({ symbol, size = 42, className }: { symbol: string; size?: number; className?: string }) {
  const gold = "#c9a962";
  const goldLt = "rgba(201,169,98,0.6)";
  const common = className
    ? { viewBox: "0 0 42 42", fill: "none" as const, width: "100%" as const, height: "100%" as const, className }
    : { width: size, height: size, viewBox: "0 0 42 42", fill: "none" as const };
  switch (symbol) {
    case "star":
      return (
        <svg {...common}>
          <path d="M21 4L24.5 15.5H36L26.5 23L30 35L21 27L12 35L15.5 23L6 15.5H17.5L21 4Z"
            stroke={gold} strokeWidth="1.5" fill="none"/>
          <circle cx="21" cy="21" r="3" fill={goldLt}/>
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M28 10C22 10 17 15 17 21.5C17 28 22 33 28 33C22 31 18 26 18 21.5C18 17 22 12 28 10Z"
            stroke={gold} strokeWidth="1.5" fill="none"/>
        </svg>
      );
    case "venus":
      return (
        <svg {...common}>
          <circle cx="21" cy="16" r="9" stroke={gold} strokeWidth="1.5" fill="none"/>
          <line x1="21" y1="25" x2="21" y2="36" stroke={gold} strokeWidth="1.5"/>
          <line x1="16" y1="31" x2="26" y2="31" stroke={gold} strokeWidth="1.5"/>
        </svg>
      );
    case "saturn":
      return (
        <svg {...common}>
          <circle cx="21" cy="22" r="8" stroke={gold} strokeWidth="1.5" fill="none"/>
          <ellipse cx="21" cy="22" rx="14" ry="5" stroke={goldLt} strokeWidth="1" fill="none"/>
          <line x1="21" y1="6" x2="21" y2="14" stroke={gold} strokeWidth="1.5"/>
          <line x1="17" y1="8" x2="25" y2="8" stroke={gold} strokeWidth="1.5"/>
        </svg>
      );
    case "gemini":
      return (
        <svg {...common}>
          <line x1="14" y1="10" x2="14" y2="32" stroke={gold} strokeWidth="1.5"/>
          <line x1="28" y1="10" x2="28" y2="32" stroke={gold} strokeWidth="1.5"/>
          <path d="M10 10H32M10 32H32" stroke={gold} strokeWidth="1.5"/>
        </svg>
      );
    case "pisces":
      return (
        <svg {...common}>
          <path d="M14 8C14 8 10 14 10 21C10 28 14 34 14 34" stroke={gold} strokeWidth="1.5" fill="none"/>
          <path d="M28 8C28 8 32 14 32 21C32 28 28 34 28 34" stroke={gold} strokeWidth="1.5" fill="none"/>
          <line x1="8" y1="21" x2="34" y2="21" stroke={gold} strokeWidth="1.5"/>
        </svg>
      );
    case "archer":
      return (
        <svg {...common}>
          <line x1="10" y1="32" x2="32" y2="10" stroke={gold} strokeWidth="1.5"/>
          <path d="M32 10L32 18M32 10L24 10" stroke={gold} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18" y1="24" x2="24" y2="18" stroke={goldLt} strokeWidth="1"/>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="21" cy="21" r="12" stroke={gold} strokeWidth="1.5" fill="none"/>
        </svg>
      );
  }
}

// Gold poker-style decorative corners for card (320x180 landscape)
function GoldCardFrame() {
  const gold = "rgba(201,169,98,0.55)";
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 180" fill="none" preserveAspectRatio="none">
      {/* corners */}
      <path d="M0 14L0 0L14 0" stroke={gold} strokeWidth="1.2"/>
      <path d="M306 0L320 0L320 14" stroke={gold} strokeWidth="1.2"/>
      <path d="M0 166L0 180L14 180" stroke={gold} strokeWidth="1.2"/>
      <path d="M306 180L320 180L320 166" stroke={gold} strokeWidth="1.2"/>
      {/* corner dots */}
      <circle cx="4" cy="4" r="1.5" fill={gold}/>
      <circle cx="316" cy="4" r="1.5" fill={gold}/>
      <circle cx="4" cy="176" r="1.5" fill={gold}/>
      <circle cx="316" cy="176" r="1.5" fill={gold}/>
      {/* subtle inner border */}
      <rect x="10" y="10" width="300" height="160" rx="6" stroke="rgba(201,169,98,0.18)" strokeWidth="0.8"/>
    </svg>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────
const ZODIAC_SIGNS: ZodiacSign[] = [
  { code: "aries",       en: "Aries",       trait: "direct fire · fast action" },
  { code: "taurus",      en: "Taurus",      trait: "steady earth · sensory comfort" },
  { code: "gemini",      en: "Gemini",      trait: "quick air · restless curiosity" },
  { code: "cancer",      en: "Cancer",      trait: "soft water · protective memory" },
  { code: "leo",         en: "Leo",         trait: "warm fire · visible heart" },
  { code: "virgo",       en: "Virgo",       trait: "precise earth · quiet standards" },
  { code: "libra",       en: "Libra",       trait: "social air · harmony radar" },
  { code: "scorpio",     en: "Scorpio",     trait: "deep water · emotional x-ray" },
  { code: "sagittarius", en: "Sagittarius", trait: "wide fire · future seeking" },
  { code: "capricorn",   en: "Capricorn",   trait: "structured earth · long game" },
  { code: "aquarius",    en: "Aquarius",    trait: "fixed air · independent signal" },
  { code: "pisces",      en: "Pisces",      trait: "open water · porous intuition" },
];

const MY_CHART = [
  { symbol: "☉", label: "Sun",    value: "Pisces",  trait: "Empathic · Intuitive"   },
  { symbol: "☾", label: "Moon",   value: "Scorpio", trait: "Intense · Perceptive"    },
  { symbol: "↑", label: "Rising", value: "Virgo",   trait: "Precise · Detail-driven" },
];
const PLANET_TRANSITS = [
  { name: "Venus",   pos: "Aries",  note: "Pursue actively"  },
  { name: "Mercury", pos: "Rx alert",  note: "Watch your words" },
  { name: "Mars",    pos: "Gemini", note: "Social energy up" },
];
const ICON_SIZE = 14;
const QUICK_REPLIES = [
  "My love life is a mess — what does my chart say?",
  "Work pressure is crushing me lately.",
  "My ex reached out again. Cosmic take?",
  "No heavy readings tonight — just talk.",
];

const ASTRO_RESPONSES: Record<string, {
  reply: string; cue: string; memory: MemoryItem[]; mode: ChatMode; sourceDb: SourceDb;
}> = {
  [QUICK_REPLIES[0]]: {
    reply: "You're not really asking whether this relationship can work. You're asking whether your heart can trust again. Let's stabilize your emotional baseline before any decision.",
    cue: "Chart · Moon-triggered sensitivity elevated. Stabilize first, choose later.",
    memory: [
      { id: 20, label: "Core Theme",      value: "Attachment security in intimacy" },
      { id: 21, label: "Emotional State", value: "High fluctuation · rumination" },
    ],
    mode: "Astrology Consult", sourceDb: "zodiac_memory_db",
  },
  [QUICK_REPLIES[1]]: {
    reply: "You're not lacking discipline — you're carrying too much internal pressure. Perfectionism became your safety strategy, so every task feels like an exam. Let's break the task, not break you.",
    cue: "Chart · Saturn pressure amplified. Standards exceed current energy cycle.",
    memory: [
      { id: 22, label: "Core Theme",    value: "Career stress regulation" },
      { id: 23, label: "Pattern Alert", value: "High standards + delayed start" },
    ],
    mode: "Astrology Consult", sourceDb: "zodiac_memory_db",
  },
  [QUICK_REPLIES[2]]: {
    reply: "Reconnection does not equal repair. Old patterns are most likely reactivating. The real question is not whether they still care — it is whether a new relational structure exists now.",
    cue: "Chart · 7th house reactivated. Fast return, low structural stability.",
    memory: [
      { id: 24, label: "Core Theme",   value: "Old relationship re-entry" },
      { id: 25, label: "Risk Pattern", value: "Repeating prior conflict scripts" },
    ],
    mode: "Astrology Consult", sourceDb: "zodiac_memory_db",
  },
  [QUICK_REPLIES[3]]: {
    reply: "I like this pace — slow and easy. No heavy diagnosis, no intense decoding. Just warm and present. Tell me one small thing that made you smile today.",
    cue: "Smalltalk mode · Light emotional companionship, low pressure.",
    memory: [
      { id: 26, label: "Channel",        value: "Casual emotional company" },
      { id: 27, label: "Preferred Tone", value: "Light · warm · low-pressure" },
    ],
    mode: "Casual Chat", sourceDb: "smalltalk_memory_db",
  },
};

const FALLBACK = {
  reply: "I hear you. Before chasing an answer — are you stuck on the facts themselves, or on the fear of losing control over what comes next?",
  cue: "Chart · Emotional system overloaded. Start with structured clarification.",
  memory: [{ id: -1, label: "Dynamic Entry", value: "Unnamed anxiety source detected" }],
  mode: "Astrology Consult" as ChatMode, sourceDb: "zodiac_memory_db" as SourceDb,
};

const STEP_LABELS = [
  "Build user persona", "Personalized greeting", "Clarify intent",
  "Pull chart references", "Deliver consultation", "Close the loop",
];

// No cue on opening message
function buildOpeningMessage(profile: UserProfile): Msg {
  const partner =
    profile.partnerName?.trim() && profile.partnerSign
      ? { name: profile.partnerName.trim(), sign: profile.partnerSign }
      : null;
  const otherBit = partner
    ? ` I also have ${partner.name} on the chart as ${partner.sign.en} — we can read you two together or one at a time.`
    : "";
  return {
    id: 1, role: "assistant", isOpening: true,
    text: `Hi ${profile.name}! A ${profile.sign.en} friend walks in — your energy carries ${profile.sign.trait}.${otherBit} Before we chase an answer, let Tao Baibai read which star is really pulling on you today.`,
    mode: "Astrology Consult", sourceDb: "zodiac_memory_db",
  };
}

function buildInitialMemory(profile: UserProfile): MemoryItem[] {
  const out: MemoryItem[] = [
    { id:0,  label:"Handle",        value:profile.name },
    { id:1,  label:"Zodiac Sign",   value:profile.sign.en },
    { id:2,  label:"Zodiac Pattern", value:profile.sign.trait },
  ];
  if (profile.partnerName?.trim() && profile.partnerSign) {
    out.push(
      { id:10, label:"Them · name",    value: profile.partnerName.trim() },
      { id:11, label:"Them · sign",    value: profile.partnerSign.en },
      { id:12, label:"Them · pattern", value: profile.partnerSign.trait },
    );
  }
  out.push({ id:99, label:"Consult Style", value:"Empathy first, guidance second" });
  return out;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "77",
  sign: ZODIAC_SIGNS.find(sign => sign.code === "taurus") ?? ZODIAC_SIGNS[0],
};

// ─── CSS-only star orbit positions ───────────────────────────────────────────
const ORBIT_ANGLES = [0, 60, 120, 180, 240, 300];

// ─── SVG ornaments ────────────────────────────────────────────────────────────
function SvgTinyStar({
  cx, cy, r = 1.1, fill = "rgba(160,122,184,0.34)",
}: { cx: number; cy: number; r?: number; fill?: string }) {
  const s = (r * 2) / 14;
  return (
    <path
      fill={fill}
      transform={`translate(${cx} ${cy}) scale(${s}) translate(-7 -7)`}
      d="M7 0L8.1 5.9L14 7L8.1 8.1L7 14L5.9 8.1L0 7L5.9 5.9Z"
    />
  );
}

function OrnamentalDivider({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 320 22" fill="none" className="w-full"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <line x1="0" y1="11" x2="128" y2="11" stroke="rgba(160,122,184,0.12)" strokeWidth="0.35"/>
      <g transform="translate(160,11)">
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <SvgTinyStar key={a}
              cx={Math.cos(rad) * 10}
              cy={Math.sin(rad) * 10}
              r={1.0}
              fill="rgba(160,122,184,0.45)"/>
          );
        })}
        <SvgTinyStar cx={0} cy={0} r={1.5} fill="rgba(160,122,184,0.5)"/>
      </g>
      <line x1="192" y1="11" x2="320" y2="11" stroke="rgba(160,122,184,0.12)" strokeWidth="0.35"/>
      <SvgTinyStar cx={68} cy={14} r={0.95} fill="rgba(160,122,184,0.42)"/>
      <SvgTinyStar cx={252} cy={14} r={0.88} fill="rgba(160,122,184,0.38)"/>
    </svg>
  );
}

function CelestialTopBand() {
  const ring = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 540 42" fill="none" className="w-full">
      <line x1="0"   y1="21" x2="195" y2="21" stroke="rgba(160,122,184,0.1)" strokeWidth="0.3"/>
      <line x1="345" y1="21" x2="540" y2="21" stroke="rgba(160,122,184,0.1)" strokeWidth="0.3"/>
      <g transform="translate(270,21)">
        {ring.map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <SvgTinyStar key={a}
              cx={Math.cos(rad) * 17}
              cy={Math.sin(rad) * 17}
              r={1.15}
              fill="rgba(160,122,184,0.48)"/>
          );
        })}
        <SvgTinyStar cx={0} cy={0} r={1.7} fill="rgba(160,122,184,0.55)"/>
        <SvgTinyStar cx={-6} cy={2} r={0.82} fill="rgba(160,122,184,0.4)"/>
        <SvgTinyStar cx={7} cy={-2} r={0.78} fill="rgba(160,122,184,0.38)"/>
        <SvgTinyStar cx={4} cy={5} r={0.72} fill="rgba(160,122,184,0.35)"/>
      </g>
      {[[214, 8], [226, 16], [218, 22], [232, 12], [322, 6], [310, 15], [328, 21], [316, 11]].map(([x, y], i) => (
        <SvgTinyStar key={i} cx={x} cy={y} r={i % 2 === 0 ? 1.0 : 0.72} fill="rgba(160,122,184,0.42)"/>
      ))}
      <line x1="214" y1="8"  x2="226" y2="16" stroke="rgba(160,122,184,0.08)" strokeWidth="0.25"/>
      <line x1="226" y1="16" x2="218" y2="22" stroke="rgba(160,122,184,0.08)" strokeWidth="0.25"/>
      <line x1="322" y1="6"  x2="310" y2="15" stroke="rgba(160,122,184,0.08)" strokeWidth="0.25"/>
      <line x1="310" y1="15" x2="328" y2="21" stroke="rgba(160,122,184,0.08)" strokeWidth="0.25"/>
      <SvgTinyStar cx={98} cy={21} r={1.2} fill="rgba(160,122,184,0.48)"/>
      <SvgTinyStar cx={442} cy={21} r={1.2} fill="rgba(160,122,184,0.48)"/>
    </svg>
  );
}

function FourPointStar({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 0L8.1 5.9L14 7L8.1 8.1L7 14L5.9 8.1L0 7L5.9 5.9Z" fill={color}/>
    </svg>
  );
}

function archiveRowBadge(item: MemoryItem): { tone: string; text: string } {
  if (item.id === 1 || item.id === 11) return { tone: C.accent, text: "Active" };
  return { tone: C.rose, text: "Saved" };
}

function UnifiedProfileCard({
  label, accentColor, borderColor, bgColor, items, consult,
}: {
  label: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  items: MemoryItem[];
  consult?: MemoryItem;
}) {
  if (items.length === 0) return null;
  const name = items[0];
  const sign = items[1];
  const pattern = items[2];
  return (
    <div className="rounded-2xl p-3.5" style={{ border: `1px solid ${borderColor}`, background: bgColor }}>
      <p className="mb-2 text-[8px] uppercase tracking-[.18em]" style={{ color: C.txt3 }}>{label}</p>
      {name && (
        <p className={`text-[16px] font-medium leading-tight ${displayFont.className}`} style={{ color: accentColor }}>
          {name.value}
        </p>
      )}
      {sign && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ border: `1px solid ${borderColor}`, color: accentColor }}>
            <FourPointStar size={8} color="currentColor" />
          </div>
          <p className="text-[11.5px]" style={{ color: C.txt }}>{sign.value}</p>
        </div>
      )}
      {pattern && (
        <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: C.txt2 }}>{pattern.value}</p>
      )}
      {consult && (
        <div className="mt-2 border-t pt-2" style={{ borderColor: `${borderColor}` }}>
          <p className="text-[8px] uppercase tracking-[.14em]" style={{ color: C.txt3 }}>{consult.label}</p>
          <p className="text-[10.5px] leading-snug" style={{ color: C.txt2 }}>{consult.value}</p>
        </div>
      )}
    </div>
  );
}

function ProfileHoverCard({ memory }: { memory: MemoryItem[] }) {
  const selfItems = memory.filter(item => item.id === 0 || item.id === 1 || item.id === 2);
  const otherItems = memory.filter(item => item.id === 10 || item.id === 11 || item.id === 12);
  const consult = memory.find(item => item.id === 99);
  const liveItems = memory.filter(item => !ARCHIVE_SLOT_IDS.has(item.id));
  return (
    <div className="absolute right-0 top-full z-50 mt-2 max-h-[min(70vh,520px)] w-[min(100vw-24px,300px)] overflow-y-auto rounded-2xl p-3"
      style={{
        background:"#fffcf9",
        border:"1px solid rgba(178,152,205,0.22)",
        boxShadow:"0 12px 36px -10px rgba(90,65,128,0.2)",
      }}>
      <div className="mb-2.5">
        <p className="text-[10px] tracking-[.18em] uppercase" style={{ color:C.txt3 }}>Astro Profile</p>
        <p className={`mt-0.5 text-[12px] tracking-[.06em] ${displayFont.className}`} style={{ color:C.accent }}>
          Zodiac Archive
        </p>
      </div>

      <div className="space-y-2">
        <UnifiedProfileCard
          label="You"
          accentColor={C.accent}
          borderColor="rgba(178,152,205,0.24)"
          bgColor="#ffffff"
          items={selfItems}
          consult={consult}
        />
        {otherItems.length > 0 && (
          <UnifiedProfileCard
            label="Them"
            accentColor={C.rose}
            borderColor="rgba(200,147,158,0.28)"
            bgColor="rgba(255,250,252,0.95)"
            items={otherItems}
          />
        )}
      </div>

      <div className="mt-2 rounded-lg px-2.5 py-1.5" style={{ border:"1px dashed rgba(178,152,205,0.24)" }}>
        <p className="text-[9px]" style={{ color:C.txt3 }}>Session memory: {liveItems.length} entries</p>
      </div>
    </div>
  );
}

function AvatarTagCard() {
  return (
    <div
      className="shrink-0 self-start"
      style={{ ["--avw" as string]: "min(6.75rem, min(32vw, 104px))" }}
    >
      <div className="relative flex aspect-square w-[var(--avw)] items-center justify-center">
        <span className="opening-orbit-star opening-orbit-a" style={{ color: "rgba(200,147,158,0.82)" }}>
          <span style={{ transform: "translateX(calc(var(--avw) * 56 / 104))" }}>
            <FourPointStar size={8} color="currentColor"/>
          </span>
        </span>
        <span className="opening-orbit-star opening-orbit-b" style={{ color: "rgba(160,122,184,0.82)" }}>
          <span style={{ transform: "translateX(calc(var(--avw) * 52 / 104))" }}>
            <FourPointStar size={7} color="currentColor"/>
          </span>
        </span>
        <span
          className="opening-orbit-star"
          style={{
            color: "rgba(204,176,224,0.75)",
            transform: "translate(-50%, -50%) translateX(calc(var(--avw) * -50 / 104)) translateY(calc(var(--avw) * 20 / 104))",
          }}
        >
          <FourPointStar size={6} color="currentColor"/>
        </span>

        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 h-full w-full overflow-hidden rounded-full"
          style={{
            boxShadow: "0 4px 22px -10px rgba(80,50,130,0.14)",
          }}
        >
          <img src="/assets/ai-character/taobaibai-avatar.png" alt="Tao Baibai" className="h-full w-full object-cover"/>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Share modal (single step: copy link) ─────────────────────────────────────
function AstroShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? window.location.href : "";

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1400);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: "rgba(30,20,50,0.18)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        className="fixed z-50 w-[min(92vw,400px)] overflow-hidden rounded-3xl"
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.85 }}
        style={{
          left: "50%", top: "50%", x: "-50%", y: "-50%",
          background: "linear-gradient(158deg, rgba(255,253,252,0.99) 0%, rgba(253,248,251,0.98) 100%)",
          border: "1px solid rgba(210,195,220,0.28)",
          boxShadow: "0 24px 60px -20px rgba(80,50,110,0.16), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(215,200,225,0.28)" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(160,122,184,0.1)", border: "1px solid rgba(160,122,184,0.2)" }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <span className="text-[12px] font-medium" style={{ color: C.txt }}>Share this experience</span>
          </div>
          <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-full opacity-40 hover:opacity-70 transition-opacity" style={{ color: C.txt2 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-3 text-[11px]" style={{ color: C.txt3 }}>Copy this link and share with anyone</p>
          <div className="mb-4 rounded-xl px-3.5 py-3 font-mono text-[10.5px] break-all leading-[1.55]"
            style={{ background: "rgba(245,241,248,0.7)", border: "1px solid rgba(210,195,225,0.3)", color: C.txt2 }}>
            {link}
          </div>
          <motion.button
            type="button"
            onClick={() => void copy()}
            className="w-full rounded-xl py-2.5 text-[12.5px] font-semibold text-white"
            style={{ background: copied ? "linear-gradient(135deg,#6b9e5e,#4a8a42)" : `linear-gradient(135deg,${C.accent},#c390dc)`, boxShadow: "0 6px 20px -8px rgba(160,122,184,0.38)", transition: "background 0.3s ease" }}
            whileHover={{ filter: "brightness(1.06)" }}
            whileTap={{ scale: 0.97 }}
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Tooltip (lightweight) ────────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px]"
          style={{
            background:"rgba(255,255,255,0.9)", color:C.txt2,
            backdropFilter:"blur(8px)", border:"1px solid rgba(178,152,205,0.22)",
            boxShadow:C.shadow,
          }}>
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Isolated cursor: rAF-throttled move + lighter paint (no drop-shadow / spin) ─
const CursorLayer = memo(function CursorLayer() {
  const reduceMotion = useReducedMotion();
  const mX = useMotionValue(-100);
  const mY = useMotionValue(-100);
  const ringX = useSpring(mX, { stiffness: 280, damping: 28, mass: 0.35 });
  const ringY = useSpring(mY, { stiffness: 280, damping: 28, mass: 0.35 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    let pending = false;
    let ex = -100;
    let ey = -100;
    const flush = () => {
      pending = false;
      mX.set(ex);
      mY.set(ey);
    };
    const onMove = (e: MouseEvent) => {
      ex = e.clientX;
      ey = e.clientY;
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(flush);
      }
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(!!el.closest("button") || el.tagName === "TEXTAREA");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [mX, mY, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <>
      <motion.div className="pointer-events-none fixed z-[999]"
        style={{ x: mX, y: mY, translateX: "-50%", translateY: "-50%" }}>
        <svg
          width={hovered ? 14 : 10}
          height={hovered ? 14 : 10}
          viewBox="0 0 14 14"
          fill="none"
          style={{ transition: "width .12s ease,height .12s ease", opacity: hovered ? 0.95 : 0.75 }}
        >
          <path d="M7 0L8.1 5.9L14 7L8.1 8.1L7 14L5.9 8.1L0 7L5.9 5.9Z" fill={C.accent}/>
        </svg>
      </motion.div>
      <motion.div className="pointer-events-none fixed z-[998]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}>
        <div style={{
          width: hovered ? 32 : 24,
          height: hovered ? 32 : 24,
          borderRadius: "50%",
          border: `1.5px solid ${hovered ? C.accent : C.accentLt}`,
          opacity: hovered ? 0.55 : 0.38,
          transition: "width .16s ease, height .16s ease, border-color .14s ease, opacity .14s ease",
        }}/>
      </motion.div>
    </>
  );
});

// ─── Icon button ──────────────────────────────────────────────────────────────
function NavIcon({ onClick, active, children, wide }: {
  onClick: ()=>void; active?: boolean; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-1.5 justify-center rounded-xl transition-all duration-150 ${wide ? "px-3.5 h-8" : "h-8 w-8"}`}
      style={{
        background: active ? "rgba(160,122,184,0.18)" : "rgba(178,152,205,0.09)",
        border: `1px solid ${active ? "rgba(160,122,184,0.34)" : "rgba(178,152,205,0.14)"}`,
        color: active ? C.accent : C.txt2,
        boxShadow: active ? "0 6px 16px -10px rgba(90,55,130,0.35)" : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = active ? "rgba(160,122,184,0.22)" : "rgba(178,152,205,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(160,122,184,0.18)" : "rgba(178,152,205,0.09)"; }}>
      {children}
    </button>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────
/** "pinkMist" = restrained pink gradient for zodiac code tools; "default" = soft neutral. */
function SidePanel({ title, onClose, children, tone = "default", variant = "overlay" }: {
  title: string; onClose: ()=>void; children: React.ReactNode;
  tone?: "default" | "pinkMist";
  /** dock = in-flow right rail, does not cover chat; overlay = fixed sheet + dim (when backdrop used) */
  variant?: "overlay" | "dock";
}) {
  const isPink = tone === "pinkMist";
  const isDock = variant === "dock";
  return (
    <motion.aside
      initial={isDock ? { x: 20, opacity: 0.96 } : { x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={isDock ? { x: 16, opacity: 0.9 } : { x: 24, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={
        isDock
          ? "relative z-20 flex h-full w-[min(100vw,380px)] shrink-0 flex-col overflow-y-auto"
          : "fixed right-0 top-0 z-40 flex h-full w-[380px] flex-col overflow-y-auto"
      }
      style={{
        background: isPink
          ? "linear-gradient(175deg, rgba(255,254,253,0.99) 0%, rgba(252,248,250,0.98) 40%, rgba(248,242,248,0.96) 72%, rgba(245,238,244,0.95) 100%)"
          : "rgba(252,249,247,0.97)",
        backdropFilter: "blur(8px)",
        borderLeft: isPink ? "1px solid rgba(210, 184, 200, 0.32)" : `1px solid ${C.cardBdr}`,
        boxShadow: isPink
          ? "-14px 0 40px -18px rgba(130, 90, 110, 0.08), inset 1px 0 0 rgba(255,255,255,0.5)"
          : "-10px 0 30px -10px rgba(90,55,120,0.12)",
        scrollbarWidth: "thin",
        scrollbarColor: isPink ? "rgba(200, 160, 180, 0.22) transparent" : "rgba(160,122,184,0.16) transparent",
      }}>
      <div className="flex shrink-0 items-center justify-between px-5 py-4"
        style={{
          borderBottom: isPink
            ? "1px solid rgba(220, 195, 210, 0.35)"
            : "1px solid rgba(178,152,205,0.2)",
        }}>
        <p className={`text-[12px] font-semibold tracking-[.1em] ${displayFont.className}`}
          style={{ color: C.txt }}>{title}</p>
        <button type="button" onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all"
          style={{
            background: isPink ? "rgba(200, 160, 188, 0.14)" : "rgba(178,152,205,0.12)",
            color: C.txt2,
            border: isPink ? "1px solid rgba(210, 180, 200, 0.35)" : "1px solid rgba(178,152,205,0.22)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isPink ? "rgba(200, 160, 188, 0.22)" : "rgba(178,152,205,0.18)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isPink ? "rgba(200, 160, 188, 0.14)" : "rgba(178,152,205,0.12)";
          }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="flex-1 p-5 space-y-4">{children}</div>
    </motion.aside>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[8.5px] uppercase tracking-[.22em]" style={{ color: C.txt3 }}>{children}</p>
  );
}

/** Composer isolated from page state so typing does not re-render chat / background */
const InputDock = memo(function InputDock({
  typing,
  onSend,
  onDrawCard,
}: {
  typing: boolean;
  onSend: (text: string) => void;
  onDrawCard: () => void;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 88)}px`;
  }, []);

  const submit = useCallback(() => {
    const t = input.trim();
    if (!t || typing) return;
    onSend(t);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, typing, onSend]);

  return (
    <div className="relative z-20 shrink-0 px-8 pb-7 pt-5"
      style={{
        background: "linear-gradient(180deg, rgba(255,251,252,0.94) 0%, rgba(253,243,249,0.92) 62%, rgba(249,241,253,0.92) 100%)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(200,147,158,0.14)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.55)",
      }}>
      <div className="mx-auto max-w-[760px]">
        <div
          className="mb-5 flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}>
          {QUICK_REPLIES.map(q => (
            <button key={q} type="button"
              onClick={() => { if (!typing) onSend(q); }} disabled={typing}
              className="group flex shrink-0 items-center gap-1.5 rounded-full px-4 py-[7px] text-left text-[11px] leading-snug whitespace-nowrap transition-all duration-200 disabled:opacity-35"
              style={{
                background: "rgba(255,252,253,0.88)",
                border: "1px solid rgba(200,147,158,0.18)",
                color: C.txt2,
                boxShadow: "0 2px 8px -4px rgba(180,100,140,0.14)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(160,122,184,0.07)";
                e.currentTarget.style.borderColor = "rgba(160,122,184,0.28)";
                e.currentTarget.style.color = C.accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.75)";
                e.currentTarget.style.borderColor = "rgba(178,152,205,0.2)";
                e.currentTarget.style.color = C.txt2;
              }}>
              <span className="shrink-0"><FourPointStar size={8} color="currentColor"/></span>
              <span className="whitespace-nowrap">{q}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden mt-4"
          style={{
            background: "linear-gradient(160deg, rgba(255,254,254,0.94) 0%, rgba(255,248,251,0.88) 62%, rgba(252,246,255,0.88) 100%)",
            border: "1px solid rgba(200,147,158,0.17)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 28px -14px rgba(180,100,140,0.22), 0 1px 0 rgba(255,255,255,0.65) inset",
          }}>
          <div className="flex items-end gap-2 px-4 py-3.5">
            <textarea ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onInput={handleTextareaInput}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }}}
              rows={1}
              placeholder="Chat with Tao Baibai…"
              className="flex-1 resize-none bg-transparent text-[13.5px] outline-none"
              style={{ color: C.txt, caretColor: C.accent, minHeight: 26, maxHeight: 88, lineHeight: "1.65" }}
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px]" style={{ color: C.txt3 }}>{input.length}</span>
              <Tip label="Draw an astro card">
                <button type="button" onClick={onDrawCard} disabled={typing}
                  className="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-30"
                  style={{ border: `1px solid rgba(160,122,184,0.2)`, background: "transparent", color: C.accentLt }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,122,184,0.1)"; e.currentTarget.style.color = C.accent; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.accentLt; }}>
                  <svg width={10} height={10} viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 0L6.4 4.1L11 5.5L6.4 6.4L5.5 11L4.6 6.4L0 5.5L4.6 4.1Z" fill="currentColor"/>
                  </svg>
                </button>
              </Tip>
              <button type="button" onClick={submit}
                disabled={!input.trim() || typing}
                className="flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-28"
                style={{
                  background: input.trim() && !typing ? `linear-gradient(135deg,${C.accent},${C.accentLt})` : "rgba(178,152,205,0.18)",
                  color: "white",
                  boxShadow: input.trim() && !typing ? "0 2px 8px -2px rgba(160,122,184,0.4)" : "none",
                }}
                onMouseEnter={e => { if (input.trim() && !typing) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                <svg width={10} height={10} viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 9.5V1.5M1.5 5.5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const PARTNER_SIGN_NONE = "__none__";

function IntroGate({ onEnter }: { onEnter: (profile: UserProfile) => void }) {
  const [name, setName] = useState("");
  const [selectedCode, setSelectedCode] = useState(ZODIAC_SIGNS[0]?.code ?? "");
  const [partnerName, setPartnerName] = useState("");
  const [partnerCode, setPartnerCode] = useState(PARTNER_SIGN_NONE);

  const selectedSign = ZODIAC_SIGNS.find(sign => sign.code === selectedCode);
  const partnerSign = partnerCode && partnerCode !== PARTNER_SIGN_NONE
    ? ZODIAC_SIGNS.find(s => s.code === partnerCode)
    : undefined;
  const partnerPartial =
    partnerName.trim().length > 0
    || (partnerCode && partnerCode !== PARTNER_SIGN_NONE);
  const partnerValid =
    !partnerPartial
    || (partnerName.trim().length > 0 && !!partnerSign);
  const canEnter = name.trim().length > 0 && !!selectedSign && partnerValid;

  const submit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEnter || !selectedSign) return;
    const base: UserProfile = { name: name.trim(), sign: selectedSign };
    if (partnerName.trim() && partnerSign) {
      base.partnerName = partnerName.trim();
      base.partnerSign = partnerSign;
    }
    onEnter(base);
  }, [canEnter, name, onEnter, partnerName, partnerSign, selectedSign]);

  return (
    <form onSubmit={submit} className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-7 py-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[760px] overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255,248,250,0.42)",
          backdropFilter: "blur(18px)",
          border: `1px solid rgba(255,255,255,0.48)`,
          boxShadow: "0 28px 80px -30px rgba(180,100,140,0.24), 0 2px 0 rgba(255,255,255,0.55) inset",
          ["--ob" as string]: "min(40vmin, 8.75rem)",
        }}
      >
        <div className="px-6 py-4">
          <div className="leading-none">
            <p className="text-[9px] tracking-[.14em] uppercase" style={{ color:C.txt3 }}>Talk with</p>
            <p className={`flex items-center gap-1.5 text-[14px] font-semibold tracking-[.06em] ${displayFont.className}`} style={{ color:C.accent }}>
              <FourPointStar size={10} color={C.accent}/>
              Tao Baibai
            </p>
          </div>
        </div>
        <style>{`
          @keyframes orbit1 { from { transform: rotate(0deg) translateX(calc(var(--ob, 140px) * 52 / 140)) rotate(0deg); } to { transform: rotate(360deg) translateX(calc(var(--ob, 140px) * 52 / 140)) rotate(-360deg); } }
          @keyframes orbit2 { from { transform: rotate(120deg) translateX(calc(var(--ob, 140px) * 62 / 140)) rotate(-120deg); } to { transform: rotate(480deg) translateX(calc(var(--ob, 140px) * 62 / 140)) rotate(-480deg); } }
          @keyframes orbit3 { from { transform: rotate(240deg) translateX(calc(var(--ob, 140px) * 46 / 140)) rotate(-240deg); } to { transform: rotate(600deg) translateX(calc(var(--ob, 140px) * 46 / 140)) rotate(-600deg); } }
        `}</style>
        <div className="grid items-center gap-8 px-7 py-8 md:grid-cols-[minmax(0,min(28vw,10rem))_1fr]">
          <div className="flex justify-center md:justify-start">
            <div className="relative flex aspect-square w-[var(--ob)] max-w-full items-center justify-center">
              <svg className="absolute inset-0 h-full w-full max-w-full" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="70" cy="70" rx="52" ry="52" stroke="rgba(160,122,184,0.1)" strokeWidth="0.4"/>
                <ellipse cx="70" cy="70" rx="62" ry="38" stroke="rgba(160,122,184,0.08)" strokeWidth="0.4" transform="rotate(-20 70 70)"/>
                <ellipse cx="70" cy="70" rx="46" ry="28" stroke="rgba(160,122,184,0.08)" strokeWidth="0.4" transform="rotate(35 70 70)"/>
                {[[70,18],[70,122],[18,70],[122,70]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r={1} fill="rgba(160,122,184,0.2)"/>
                ))}
              </svg>
              <div className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{ animation: "orbit1 12s linear infinite" }}>
                <div className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ color: C.accent, filter: "drop-shadow(0 2px 6px rgba(160,122,184,0.4))" }}>
                  <FourPointStar size={14} color="currentColor"/>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{ animation: "orbit2 18s linear infinite" }}>
                <div className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ color: C.rose, filter: "drop-shadow(0 2px 6px rgba(200,147,158,0.4))" }}>
                  <FourPointStar size={11} color="currentColor"/>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{ animation: "orbit3 8s linear infinite" }}>
                <div className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ color: C.accentLt, filter: "drop-shadow(0 2px 6px rgba(204,176,224,0.4))" }}>
                  <FourPointStar size={9} color="currentColor"/>
                </div>
              </div>
              <motion.div
                className="absolute"
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                style={{
                  width: "calc(var(--ob) * 104 / 140)",
                  height: "calc(var(--ob) * 104 / 140)",
                  borderRadius: "50%",
                  border: "0.5px solid rgba(160,122,184,0.15)",
                }}
              />
              <div
                className="relative z-10 overflow-hidden rounded-full"
                style={{
                  width: "calc(var(--ob) * 82 / 140)",
                  height: "calc(var(--ob) * 82 / 140)",
                  border: "1.5px solid rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.94)",
                  boxShadow: "0 16px 38px -20px rgba(160,122,184,0.4)",
                }}
              >
                <img src="/assets/ai-character/taobaibai-avatar.png" alt="Tao Baibai" className="h-full w-full object-cover"/>
              </div>
            </div>
          </div>

          <div className="text-left">
            <p className={`mb-2 text-[9px] tracking-[.22em] uppercase ${displayFont.className}`} style={{ color:C.accent }}>
              Opening
            </p>
            <p className={`text-[28px] leading-[1.28] tracking-[-0.01em] ${serifFont.className}`} style={{ color:C.txt }}>
              Tell me your name and zodiac sign. Let me get to know your stars.
            </p>
            <p className="mt-4 text-[11.5px] leading-[1.72]" style={{ color:C.txt3 }}>
              Tao Baibai builds a first read from your profile, then carries it into the chat memory. Optionally add one other person (synastry / relationship) to pin a second zodiac block in the archive.
            </p>

            <div className="mt-5 rounded-2xl overflow-hidden"
              style={{ background:"rgba(255,252,250,0.52)", backdropFilter:"blur(10px)", border:"0.5px solid rgba(255,255,255,0.56)", boxShadow:"0 4px 20px -10px rgba(180,100,140,0.1), 0 1px 0 rgba(255,255,255,0.5) inset" }}>
              <div className="grid gap-3 px-4 py-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em]" style={{ color:C.txt3 }}>Your name</span>
                  <div className="flex h-12 items-center gap-2.5 rounded-xl px-3.5"
                    style={{ background:"rgba(255,252,254,0.68)", border:`0.5px solid ${name.trim() ? "rgba(200,147,158,0.4)" : "rgba(255,255,255,0.5)"}` }}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background:"rgba(255,255,255,0.6)", color:C.rose }}>
                      <FourPointStar size={12} color="currentColor"/>
                    </span>
                    <input
                      id="astro-name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                      style={{ color:C.txt, caretColor:C.rose }}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em]" style={{ color:C.txt3 }}>Zodiac sign</span>
                  <div className="flex h-12 items-center gap-2.5 rounded-xl px-3.5"
                    style={{ background:"rgba(255,252,254,0.68)", border:"0.5px solid rgba(255,255,255,0.5)" }}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background:"rgba(255,255,255,0.6)", color:C.accent }}>
                      <FourPointStar size={12} color="currentColor"/>
                    </span>
                    <select
                      id="astro-sign"
                      value={selectedCode}
                      onChange={e => setSelectedCode(e.target.value)}
                      className="min-w-0 flex-1 appearance-none bg-transparent text-[13px] outline-none"
                      style={{ color:C.txt }}>
                      {ZODIAC_SIGNS.map(sign => (
                        <option key={sign.code} value={sign.code}>{sign.en}</option>
                      ))}
                    </select>
                    <span className="text-[10px]" style={{ color:C.txt3 }}>⌄</span>
                  </div>
                </label>
              </div>

              <div className="border-t border-[rgba(160,122,184,0.1)] px-4 pt-4 pb-3">
                <p className="mb-2 text-[8px] uppercase tracking-[.16em]" style={{ color:C.txt3 }}>Them (optional)</p>
                <div className="grid gap-3 py-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[9px] uppercase tracking-[.18em]" style={{ color:C.txt3 }}>Their name</span>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl px-3"
                      style={{ background:"rgba(255,252,254,0.62)", border:`0.5px solid ${partnerName.trim() ? "rgba(200,147,158,0.4)" : "rgba(255,255,255,0.5)"}` }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background:"rgba(255,255,255,0.6)", color:C.rose }}>
                        <FourPointStar size={12} color="currentColor"/>
                      </span>
                      <input
                        value={partnerName}
                        onChange={e => setPartnerName(e.target.value)}
                        placeholder="Optional"
                        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
                        style={{ color:C.txt, caretColor:C.rose }}
                        aria-label="Their name"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[9px] uppercase tracking-[.18em]" style={{ color:C.txt3 }}>Their zodiac</span>
                    <div className="flex h-11 items-center gap-2.5 rounded-xl px-3"
                      style={{ background:"rgba(255,252,254,0.62)", border:"0.5px solid rgba(255,255,255,0.5)" }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background:"rgba(255,255,255,0.6)", color:C.accent }}>
                        <FourPointStar size={12} color="currentColor"/>
                      </span>
                      <select
                        value={partnerCode}
                        onChange={e => setPartnerCode(e.target.value)}
                        className="min-w-0 flex-1 appearance-none bg-transparent text-[13px] outline-none"
                        style={{ color:C.txt }}
                        aria-label="Their zodiac sign"
                      >
                        <option value={PARTNER_SIGN_NONE}>—</option>
                        {ZODIAC_SIGNS.map(sign => (
                          <option key={sign.code} value={sign.code}>{sign.en}</option>
                        ))}
                      </select>
                      <span className="text-[10px]" style={{ color:C.txt3 }}>⌄</span>
                    </div>
                  </label>
                </div>
                {partnerPartial && !partnerValid && (
                  <p className="pb-1 text-[10px]" style={{ color:"rgba(200,100,120,0.95)" }}>Please fill in both their name and zodiac sign.</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 px-4 pb-5 pt-4">
                <p className="text-[10.5px] leading-[1.55]" style={{ color:C.txt3 }}>
                  Not fortune telling. A soft emotional chat shaped by zodiac language.
                </p>
                <button
                  type="submit"
                  disabled={!canEnter}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-[11.5px] font-medium tracking-[0.03em] transition-all duration-200 disabled:opacity-35"
                  style={{
                    background:canEnter ? `linear-gradient(135deg,${C.accent},${C.rose})` : "rgba(200,147,158,0.22)",
                    color:"white",
                    boxShadow:canEnter ? "0 10px 24px -10px rgba(160,100,150,0.48)" : "none",
                  }}>
                  Begin
                  <FourPointStar size={8} color="currentColor"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AstroShowroomPrototypeClient({ embed = false }: { embed?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [composerKey, setComposerKey] = useState(0);
  const [typing,     setTyping]     = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [memory,     setMemory]     = useState<MemoryItem[]>(buildInitialMemory(DEFAULT_PROFILE));
  const [profileHover, setProfileHover] = useState(false);
  const [codeOpen,    setCodeOpen]    = useState(false);
  const [demoOpen,    setDemoOpen]    = useState(false);
  const [codeToolTab, setCodeToolTab] = useState<"source" | "clone" | "config">("source");
  const [astroSourcePage, setAstroSourcePage] = useState<"dbs" | "router" | "spec">("dbs");
  const [cfgModel,   setCfgModel]   = useState("qwen-qwq");
  const [cfgTemp,    setCfgTemp]    = useState(0.78);
  const [cfgTokens,  setCfgTokens]  = useState(2048);
  const [cloneCopied, setCloneCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  /** Scroll the chat column only — avoid scrollIntoView (it can scroll the parent page when embedded in an iframe). */
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const latestCue = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role==="assistant" && m.cue);
    return last?.cue ?? "Awaiting analysis…";
  }, [messages]);

  const latestMode = useMemo(() => {
    const last = [...messages].reverse().find(m => m.role==="assistant" && m.mode);
    return last?.mode ?? "Astrology Consult";
  }, [messages]);

  useEffect(() => {
    if (!embed) return;
    window.scrollTo(0, 0);
  }, [embed]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = chatScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [messages, typing, reduceMotion]);

  const runTurn = useCallback((userText: string) => {
    const p = ASTRO_RESPONSES[userText] ?? FALLBACK;
    setTyping(true);
    window.setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(), role: "assistant",
        text: p.reply, cue: p.cue, mode: p.mode, sourceDb: p.sourceDb,
      }]);
      setMemory(prev => {
        const archiveItems = prev.filter(item => ARCHIVE_SLOT_IDS.has(item.id));
        const liveItems = prev.filter(item => !ARCHIVE_SLOT_IDS.has(item.id));
        return [...archiveItems, ...p.memory, ...liveItems].slice(0, 16);
      });
      setActiveStep(s => Math.min(6, s + 1));
      setTyping(false);
    }, 1100);
  }, []);

  const handleOutgoingSend = useCallback((text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: t }]);
    runTurn(t);
  }, [typing, runTurn]);

  const drawCard = useCallback(() => {
    if (typing) return;
    const card = ASTRO_CARDS[Math.floor(Math.random() * ASTRO_CARDS.length)];
    const msgId = Date.now();
    setMessages(prev => [...prev, { id:msgId, role:"assistant", isDrawing:true, text:"" }]);
    window.setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id===msgId ? { ...m, isDrawing:false, cardDraw:card } : m
      ));
    }, 2600);
  }, [typing]);

  const reset = () => {
    setProfile(null);
    setMessages([]);
    setComposerKey(k => k + 1);
    setTyping(false); setActiveStep(1);
    setProfileHover(false); setCodeOpen(false); setDemoOpen(false);
    setCodeToolTab("source"); setAstroSourcePage("dbs"); setCloneCopied(false);
    setShowShareModal(false);
  };

  const closeAll = () => { setProfileHover(false); setCodeOpen(false); setDemoOpen(false); setCloneCopied(false); };
  const toggle = (p: "code"|"demo") => {
    if (p === "code") {
      setCodeOpen(v => {
        const next = !v;
        if (next) {
          setCodeToolTab("source");
          setAstroSourcePage("dbs");
        }
        return next;
      });
      setDemoOpen(false);
    } else {
      setDemoOpen(v => !v);
      setCodeOpen(false);
    }
  };

  const enterChat = useCallback((nextProfile: UserProfile) => {
    setProfile(nextProfile);
    setMessages([buildOpeningMessage(nextProfile)]);
    setMemory(buildInitialMemory(nextProfile));
    setComposerKey(k => k + 1);
    setTyping(false);
    setActiveStep(1);
    closeAll();
  }, []);

  if (!profile) {
    return (
      <motion.div
        key="intro"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 1.01 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className={`relative h-screen flex flex-col overflow-hidden ${uiFont.className}`}
        style={{ background:"linear-gradient(166deg,#fdfaf5 0%,#f8f2ef 44%,#f2ecf8 100%)" }}
      >
        <style>{`
          @keyframes twinkle{0%,100%{opacity:.14;transform:scale(.92)}50%{opacity:.38;transform:scale(1.06)}}
          @keyframes orb{0%,100%{opacity:.1;transform:translateY(0)}50%{opacity:.16;transform:translateY(-6px)}}
          @media (prefers-reduced-motion:reduce){
            .bg-star,.bg-orb{animation:none!important}
          }
        `}</style>

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            background: "linear-gradient(162deg, rgba(255,250,246,0.94) 0%, rgba(249,239,246,0.92) 42%, rgba(241,236,250,0.9) 100%)",
          }}/>
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
            background: "radial-gradient(circle, rgba(235,192,217,0.26) 0%, rgba(203,169,222,0.14) 46%, rgba(255,255,255,0) 76%)",
          }}/>
          {BG_STARS_RENDER.map(([l,t,s,d])=>(
            <span key={`${l}-${t}`} className="bg-star absolute rounded-full"
              style={{ left:`${l}%`, top:`${t}%`, width:s, height:s,
                background: d>1.5 ? "rgba(180,152,214,0.5)" : "rgba(255,241,228,0.65)",
                animation: `twinkle ${5.2+d}s ease-in-out ${d*.6}s infinite` }}/>
          ))}
          <div className="bg-orb absolute -top-12 left-1/3 h-[360px] w-[360px] rounded-full"
            style={{ background:"radial-gradient(circle,rgba(172,138,214,0.1) 0%,transparent 72%)", animation:"orb 18s ease-in-out infinite" }}/>
          <div className="bg-orb absolute bottom-0 right-1/4 h-[260px] w-[260px] rounded-full"
            style={{ background:"radial-gradient(circle,rgba(208,165,195,0.08) 0%,transparent 72%)", animation:"orb 20s ease-in-out 5s infinite" }}/>
        </div>

        <IntroGate onEnter={enterChat}/>
      </motion.div>
    );
  }

  return (
    <>
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 22, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex h-screen w-full min-h-0 flex-row overflow-hidden ${uiFont.className}`}
      style={{ background:"linear-gradient(166deg,#fdfaf5 0%,#f8f2ef 44%,#f2ecf8 100%)" }}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.14;transform:scale(.92)}50%{opacity:.38;transform:scale(1.06)}}
        @keyframes orb{0%,100%{opacity:.1;transform:translateY(0)}50%{opacity:.16;transform:translateY(-6px)}}
        @keyframes orbit-ring{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes nav-orbit-a{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes nav-orbit-b{from{transform:rotate(135deg)}to{transform:rotate(495deg)}}
        @keyframes opening-orbit-a{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes opening-orbit-b{from{transform:translate(-50%,-50%) rotate(180deg)}to{transform:translate(-50%,-50%) rotate(540deg)}}
        @keyframes cue-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes typing-dot{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
        .typing-dot{animation:typing-dot 0.95s ease-in-out infinite}
        .typing-dot:nth-child(1){animation-delay:0s}
        .typing-dot:nth-child(2){animation-delay:.14s}
        .typing-dot:nth-child(3){animation-delay:.28s}
        .nav-orbit-shell{position:relative;display:flex;align-items:center;justify-content:center;width:30px;height:30px}
        .nav-orbit-star{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;opacity:.85}
        .nav-orbit-a{animation:nav-orbit-a 8.5s linear infinite}
        .nav-orbit-b{animation:nav-orbit-b 12s linear infinite}
        .opening-orbit-star{position:absolute;left:50%;top:50%;display:flex;align-items:center;justify-content:center;opacity:.82;pointer-events:none}
        .opening-orbit-a{animation:opening-orbit-a 9.8s linear infinite}
        .opening-orbit-b{animation:opening-orbit-b 13.5s linear infinite}
        @media (prefers-reduced-motion:reduce){
          .bg-star,.bg-orb{animation:none!important}
          .typing-dot{animation:none!important;opacity:.55}
          .nav-orbit-a,.nav-orbit-b,.opening-orbit-a,.opening-orbit-b{animation:none!important}
        }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(162deg, rgba(255,250,246,0.94) 0%, rgba(249,239,246,0.92) 42%, rgba(241,236,250,0.9) 100%)",
        }}/>
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{
          background: "radial-gradient(circle, rgba(235,192,217,0.26) 0%, rgba(203,169,222,0.14) 46%, rgba(255,255,255,0) 76%)",
        }}/>
        {BG_STARS_RENDER.map(([l,t,s,d])=>(
          <span key={`${l}-${t}`} className="bg-star absolute rounded-full"
            style={{ left:`${l}%`, top:`${t}%`, width:s, height:s,
              background: d>1.5 ? "rgba(180,152,214,0.5)" : "rgba(255,241,228,0.65)",
              animation: `twinkle ${5.2+d}s ease-in-out ${d*.6}s infinite` }}/>
        ))}
        <div className="bg-orb absolute -top-12 left-1/3 h-[360px] w-[360px] rounded-full"
          style={{ background:"radial-gradient(circle,rgba(172,138,214,0.1) 0%,transparent 72%)", animation:"orb 18s ease-in-out infinite" }}/>
        <div className="bg-orb absolute bottom-0 right-1/4 h-[260px] w-[260px] rounded-full"
          style={{ background:"radial-gradient(circle,rgba(208,165,195,0.08) 0%,transparent 72%)", animation:"orb 20s ease-in-out 5s infinite" }}/>
        {/* Tarot / zodiac line-art decor */}
        <svg className="absolute bottom-8 left-8 opacity-[0.055]" width={180} height={180} viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="80" stroke="rgba(160,122,184,1)" strokeWidth="0.5"/>
          <circle cx="90" cy="90" r="56" stroke="rgba(160,122,184,1)" strokeWidth="0.4"/>
          <circle cx="90" cy="90" r="32" stroke="rgba(160,122,184,1)" strokeWidth="0.35"/>
          {Array.from({length:12}).map((_,i)=>{
            const a=(i*30)*Math.PI/180;
            const x1=90+80*Math.sin(a), y1=90-80*Math.cos(a);
            const x2=90+56*Math.sin(a), y2=90-56*Math.cos(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(160,122,184,1)" strokeWidth="0.35"/>;
          })}
          {Array.from({length:6}).map((_,i)=>{
            const a=(i*60)*Math.PI/180;
            const x1=90+32*Math.sin(a), y1=90-32*Math.cos(a);
            const x2=90+56*Math.sin(a+Math.PI/3), y2=90-56*Math.cos(a+Math.PI/3);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(160,122,184,1)" strokeWidth="0.3"/>;
          })}
          <polygon points="90,18 103,60 148,60 112,84 125,126 90,102 55,126 68,84 32,60 77,60" stroke="rgba(200,147,158,1)" strokeWidth="0.35" fill="none"/>
        </svg>
        <svg className="absolute top-16 right-10 opacity-[0.05]" width={120} height={120} viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="52" stroke="rgba(160,122,184,1)" strokeWidth="0.5"/>
          <path d="M60 8 L60 112 M8 60 L112 60 M24.7 24.7 L95.3 95.3 M95.3 24.7 L24.7 95.3" stroke="rgba(160,122,184,1)" strokeWidth="0.3"/>
          <circle cx="60" cy="60" r="8" stroke="rgba(200,147,158,1)" strokeWidth="0.6" fill="none"/>
          {Array.from({length:8}).map((_,i)=>{
            const a=(i*45)*Math.PI/180;
            return <circle key={i} cx={60+52*Math.sin(a)} cy={60-52*Math.cos(a)} r={1.5} fill="rgba(160,122,184,0.6)"/>;
          })}
        </svg>
      </div>

      {/* ══ Nav ══ */}
      <header className="relative z-20 shrink-0 flex items-center px-8 py-3.5"
        style={{
          background:"linear-gradient(120deg, rgba(255,250,251,0.94) 0%, rgba(253,243,249,0.92) 54%, rgba(248,240,252,0.9) 100%)",
          backdropFilter:"blur(10px)",
          borderBottom:"1px solid rgba(200,147,158,0.16)",
          boxShadow:"0 1px 0 rgba(255,255,255,0.5)",
        }}>
        <div className="flex items-center gap-2.5">
          <div className="nav-orbit-shell shrink-0">
            <span className="nav-orbit-star nav-orbit-a" style={{ color:"rgba(200,147,158,0.86)" }}>
              <span style={{ transform:"translateX(13px) translateY(-1px)" }}>
                <FourPointStar size={7} color="currentColor"/>
              </span>
            </span>
            <span className="nav-orbit-star nav-orbit-b" style={{ color:"rgba(160,122,184,0.86)" }}>
              <span style={{ transform:"translateX(13px) translateY(1px)" }}>
                <FourPointStar size={6} color="currentColor"/>
              </span>
            </span>
            <span className="nav-orbit-star" style={{ color:"rgba(204,176,224,0.8)", transform:"translate(-50%,-50%) translateX(-13px) translateY(3px)" }}>
              <FourPointStar size={5} color="currentColor"/>
            </span>
            <div className="h-7 w-7 overflow-hidden rounded-full"
              style={{ border:"1px solid rgba(160,122,184,0.26)", boxShadow:"0 6px 16px -12px rgba(90,55,120,0.28)" }}>
              <img src="/assets/ai-character/taobaibai-avatar.png" alt="Tao Baibai" className="h-full w-full object-cover"/>
            </div>
          </div>
          <div className="leading-none">
            <p className="text-[9.5px] tracking-[.14em] uppercase" style={{ color:C.txt3 }}>Talk with</p>
            <p className={`flex items-center gap-1.5 text-[13px] font-semibold tracking-[.06em] ${displayFont.className}`} style={{ color:C.accent }}>
              <FourPointStar size={ICON_SIZE - 4} color={C.accent}/>
              Tao Baibai
            </p>
          </div>
        </div>

        <div className="flex-1"/>

        <div className="flex items-center gap-1.5">
          <div className="relative"
            onMouseEnter={() => setProfileHover(true)}
            onMouseLeave={() => setProfileHover(false)}>
            <Tip label="Zodiac archive">
              <NavIcon onClick={() => setProfileHover(v => !v)} active={profileHover} wide>
                <FourPointStar size={ICON_SIZE} color="currentColor"/>
                <span className="text-[11px] font-medium">Profile</span>
                <span className="text-[10px]" style={{ color:C.txt3 }}>Archive</span>
              </NavIcon>
            </Tip>
            {profileHover && <ProfileHoverCard memory={memory}/>}
          </div>

          <Tip label="Source Routing">
            <NavIcon onClick={() => toggle("code")} active={codeOpen} wide>
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 20 20" fill="none" aria-hidden style={{ color: "currentColor" }}>
                <path d="M7 5L3 10l4 5M13 5l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[11px] font-medium">Code</span>
            </NavIcon>
          </Tip>

          <Tip label="Share">
            <NavIcon onClick={() => setShowShareModal(true)}>
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </NavIcon>
          </Tip>

          <Tip label="Refresh conversation">
            <NavIcon onClick={reset}>
              <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4" />
                <path d="M21 4v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20" />
                <path d="M3 20v-5h5" />
              </svg>
            </NavIcon>
          </Tip>

          <Tip label="Onboarding Guide">
            <NavIcon onClick={() => toggle("demo")} active={demoOpen} wide>
              <span className={`text-[10px] font-semibold tracking-[0.08em] uppercase ${uiFont.className}`}>GUIDE</span>
            </NavIcon>
          </Tip>
        </div>
      </header>

      {/* ══ Chat ══ */}
      <div
        ref={chatScrollRef}
        className="relative z-10 flex-1 overflow-y-auto"
        style={{
          scrollbarWidth:"thin",
          scrollbarColor:"rgba(160,122,184,0.15) transparent",
          background:"linear-gradient(180deg, rgba(255,251,252,0.38) 0%, rgba(252,243,248,0.28) 46%, rgba(248,241,251,0.3) 100%)",
        }}>
        <div className="mx-auto w-full max-w-[760px] px-8 pt-10 pb-6" style={{ contain: "layout" }}>
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div key={m.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="mb-9">

                {/* Opening */}
                {m.isOpening && (
                  <div className="rounded-3xl overflow-hidden"
                    style={{
                      background:"linear-gradient(152deg, rgba(255,253,253,0.95) 0%, rgba(255,245,249,0.9) 58%, rgba(251,244,254,0.9) 100%)",
                      border:"1px solid rgba(200,147,158,0.2)",
                      boxShadow:"0 16px 48px -20px rgba(180,100,140,0.28), 0 1px 0 rgba(255,255,255,0.65) inset",
                    }}>
                    <div className="flex items-center gap-6 px-7 py-6">
                      <AvatarTagCard/>
                      <div className="flex-1 pt-1">
                        <p className={`text-[9px] tracking-[.22em] uppercase mb-2 ${displayFont.className}`}
                          style={{ color:C.accent }}>
                          Opening
                        </p>
                        <p className={`text-[18px] leading-[1.82] ${serifFont.className}`} style={{ color:C.txt }}>
                          {m.text}
                        </p>
                        <p className="mt-3 text-[10.5px] leading-[1.65]" style={{ color:C.txt3 }}>
                          Tao Baibai is a constellation blogger known for his expertise in emotional analysis, adept at dissecting the behaviors of the 12 zodiac signs in relationships through storytelling.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drawing animation */}
                {m.isDrawing && (
                  <div className="flex justify-center">
                    <div
                      className="relative flex aspect-[170/93] w-[clamp(260px,60vw,480px)] max-w-full items-center justify-center overflow-hidden"
                      style={{
                        ["--draw-orbit" as string]: "min(3.375rem, min(15.88vw, 54px))",
                        background: "linear-gradient(168deg, rgba(255,253,253,0.95) 0%, rgba(255,246,250,0.88) 58%, rgba(251,244,254,0.88) 100%)",
                        borderRadius: 18,
                        border: "1px solid rgba(200,147,158,0.22)",
                        boxShadow: "0 12px 28px -18px rgba(180,100,140,0.28)",
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ animation:"orbit-ring 6.2s linear infinite", transformOrigin:"center" }}>
                        {ORBIT_ANGLES.map(angle => (
                          <div key={angle} className="absolute" style={{
                            top:"50%", left:"50%",
                            transform:`rotate(${angle}deg) translateX(var(--draw-orbit)) translateY(-50%)`,
                            opacity:.65,
                          }}>
                            <FourPointStar size={8} color={C.accentLt}/>
                          </div>
                        ))}
                      </div>
                      <p className={`relative z-10 px-3 text-center text-[clamp(12px,3.2vw,14px)] ${serifFont.className}`} style={{ color:C.txt3 }}>
                        Consulting the stars…
                      </p>
                    </div>
                  </div>
                )}

                {/* Card reveal — gold poker-style landscape */}
                {m.cardDraw && !m.isDrawing && (
                  <div className="flex justify-center">
                    <motion.div
                      initial={reduceMotion ? { opacity: 0 } : { rotateY: 90, scale: 0.96, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { rotateY: 0, scale: 1, opacity: 1 }}
                      transition={{ duration: reduceMotion ? 0.12 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="relative aspect-[170/93] w-[clamp(260px,60vw,480px)] max-w-full"
                      style={{
                        background: "linear-gradient(168deg, rgba(255,253,253,0.97) 0%, rgba(255,246,250,0.9) 58%, rgba(251,244,254,0.9) 100%)",
                        borderRadius: 18,
                        boxShadow: "0 24px 56px -14px rgba(180,100,140,0.24), 0 1px 0 rgba(255,255,255,0.72) inset",
                      }}
                    >
                      <GoldCardFrame/>
                      <div className="relative z-10 flex min-h-0 flex-col items-stretch gap-4 px-[clamp(0.875rem,3vw,1.25rem)] py-[clamp(0.875rem,2.5vw,1rem)] sm:flex-row sm:items-center sm:gap-[clamp(0.75rem,2.5vw,1.25rem)]">
                        {/* Left: Icon */}
                        <div className="flex flex-row items-center gap-3 sm:flex-col sm:gap-0">
                          <motion.div
                            className="flex h-[clamp(2.5rem,10vmin,3rem)] w-[clamp(2.5rem,10vmin,3rem)] shrink-0 items-center justify-center"
                            initial={reduceMotion ? { opacity: 0 } : { scale: 0.88, opacity: 0 }}
                            animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                            transition={{ delay: reduceMotion ? 0 : 0.1, duration: reduceMotion ? 0.12 : 0.36, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <CardSymbolIcon symbol={m.cardDraw.symbol} className="max-h-full max-w-full" />
                          </motion.div>
                          <p className="mt-0 text-[clamp(7px,1.8vw,8px)] uppercase tracking-[.2em] sm:mt-2 sm:text-center" style={{ color: "rgba(160,140,100,0.6)" }}>
                            {m.cardDraw.suit}
                          </p>
                        </div>
                        {/* Vertical divider */}
                        <div className="hidden self-stretch sm:block" style={{ width: 1, background: "linear-gradient(180deg, transparent 0%, rgba(201,169,98,0.3) 20%, rgba(201,169,98,0.3) 80%, transparent 100%)" }}/>
                        <div className="h-px w-full shrink-0 sm:hidden" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,169,98,0.3) 20%, rgba(201,169,98,0.3) 80%, transparent 100%)" }}/>
                        {/* Right: Text */}
                        <div className="min-w-0 flex-1 text-left">
                          <p className={`text-[clamp(0.95rem,3.6vw,1.0625rem)] font-semibold leading-tight ${serifFont.className}`} style={{ color: "#36283e" }}>
                            {m.cardDraw.name}
                          </p>
                          <p className={`mt-2.5 text-[clamp(0.75rem,2.8vw,0.84rem)] leading-[1.75] ${serifFont.className}`} style={{ color: "#4a4050" }}>
                            {m.cardDraw.meaning}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Regular assistant */}
                {!m.isOpening && !m.isDrawing && !m.cardDraw && m.role==="assistant" && (
                  <div className="flex flex-col gap-2 max-w-[90%]">
                    {m.mode && (
                      <div className="flex items-center gap-1.5 pl-[2.375rem]">
                        <span className="rounded-full px-2.5 py-0.5 text-[8.5px] tracking-[.12em] uppercase"
                          style={m.mode==="Astrology Consult"
                            ? { background:"rgba(160,122,184,0.09)", border:"1px solid rgba(160,122,184,0.18)", color:C.accent }
                            : { background:"rgba(200,147,158,0.09)", border:"1px solid rgba(200,147,158,0.18)", color:C.rose }}>
                          {m.mode==="Astrology Consult" ? "Chart" : "Casual"}
                        </span>
                        {m.sourceDb && (
                          <span className="text-[9px]" style={{ color:C.txt3 }}>
                            {m.sourceDb==="zodiac_memory_db" ? "zodiac db" : "chat db"}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-3.5">
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full"
                        style={{ border:"1.5px solid rgba(178,152,205,0.28)", boxShadow:"0 2px 10px -3px rgba(80,50,120,0.18)" }}>
                        <img src="/assets/ai-character/taobaibai-avatar.png" alt="Tao Baibai" className="h-full w-full object-cover"/>
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-5 py-4"
                        style={{
                          background:"linear-gradient(158deg, rgba(255,253,253,0.92) 0%, rgba(255,246,250,0.85) 58%, rgba(251,243,254,0.85) 100%)",
                          border:"1px solid rgba(200,147,158,0.18)",
                          boxShadow:"0 12px 32px -16px rgba(180,100,140,0.26), 0 1px 0 rgba(255,255,255,0.6) inset",
                        }}>
                        <p className={`text-[16px] leading-[1.88] ${serifFont.className}`} style={{ color:C.txt }}>
                          {m.text}
                        </p>
                      </div>
                    </div>
                    {/* Action icons row */}
                    <div className="flex items-center gap-1 pl-[2.375rem]">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150"
                          style={{ color: C.txt3 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,122,184,0.1)"; e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.txt3; }}>
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7.5A5.5 5.5 0 0 1 7.5 2c1.5 0 2.9.6 3.9 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M12 6.5A5.5 5.5 0 0 1 6.5 12c-1.5 0-2.9-.6-3.9-1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <path d="M10.5 1.5v2.5h-2.5M3.5 12.5V10H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150"
                          style={{ color: C.txt3 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,122,184,0.1)"; e.currentTarget.style.color = C.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.txt3; }}>
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <rect x="4" y="4" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                            <path d="M4 6H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.1"/>
                          </svg>
                        </button>
                      </div>
                      {m.cue && (
                        <p className="px-1 text-[10px] leading-[1.55]" style={{ color:C.txt3, animation:"cue-fade .4s ease" }}>
                          {m.cue}
                        </p>
                      )}
                    </div>
                )}

                {/* User */}
                {m.role==="user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-5 py-3.5"
                      style={{
                        background: "linear-gradient(158deg, rgba(247,231,238,0.88) 0%, rgba(244,222,237,0.8) 100%)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(200,147,158,0.18)",
                        boxShadow: "0 8px 24px -14px rgba(180,100,140,0.28)",
                      }}>
                      <p className="text-[15px] leading-[1.78]" style={{ color:C.userTxt }}>{m.text}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing (CSS dots — avoids 3× Framer infinite loops) */}
          <AnimatePresence>
            {typing && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.16 }}
                className="mb-8 flex items-center gap-3.5">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full"
                  style={{ border:"1.5px solid rgba(178,152,205,0.28)" }}>
                  <img src="/assets/ai-character/taobaibai-avatar.png" alt="Tao Baibai" className="h-full w-full object-cover"/>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm px-5 py-3.5"
                  style={{
                    background:"linear-gradient(158deg, rgba(255,253,253,0.92) 0%, rgba(255,246,250,0.86) 58%, rgba(251,243,254,0.86) 100%)",
                    border:"1px solid rgba(200,147,158,0.18)",
                    boxShadow:"0 10px 28px -16px rgba(180,100,140,0.24)",
                  }}>
                  <span className="typing-dot block h-[5px] w-[5px] shrink-0 rounded-full" style={{ background:C.accentLt }}/>
                  <span className="typing-dot block h-[5px] w-[5px] shrink-0 rounded-full" style={{ background:C.accentLt }}/>
                  <span className="typing-dot block h-[5px] w-[5px] shrink-0 rounded-full" style={{ background:C.accentLt }}/>
                  <span className="ml-1.5 text-[11.5px]" style={{ color:C.txt3 }}>Reading your chart…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ Input dock (state isolated in InputDock) ══ */}
      <InputDock key={composerKey} typing={typing} onSend={handleOutgoingSend} onDrawCard={drawCard}/>

      {/* Panel backdrop (developer tools only — onboarding uses docked rail) */}
      <AnimatePresence>
        {codeOpen && (
          <motion.div className="fixed inset-0 z-30" onClick={closeAll}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:.18 }}
            style={{ background:"rgba(24,15,42,0.07)", backdropFilter:"none" }}/>
        )}
      </AnimatePresence>

      {/* Code panel — Source / Clone / Config (romance-style), Source has bubble sub-pages */}
      <AnimatePresence>
        {codeOpen && (
          <SidePanel
            title="Developer Tools"
            tone="pinkMist"
            onClose={() => { setCodeOpen(false); setCloneCopied(false); }}
          >
            <p
              className={`text-[9px] tracking-[.18em] uppercase -mt-1 ${uiFont.className}`}
              style={{ color: "rgba(120, 96, 118, 0.48)" }}
            >
              Inspect · Clone · Configure
            </p>

            {/* Primary tabs — pill segmented control */}
            <div className="flex rounded-full p-[3px]" style={{ background: "rgba(160,122,184,0.09)", border: "1px solid rgba(178,152,205,0.2)" }}>
              {(["source", "clone", "config"] as const).map(t => {
                const on = codeToolTab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCodeToolTab(t)}
                    className={`flex-1 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all duration-200 ${uiFont.className}`}
                    style={{
                      background: on ? "linear-gradient(145deg,rgba(255,250,254,0.98) 0%,rgba(248,238,250,0.92) 100%)" : "transparent",
                      color: on ? C.accent : C.txt3,
                      boxShadow: on ? "0 2px 8px -3px rgba(140,100,160,0.2), 0 0 0 1px rgba(178,152,205,0.24)" : "none",
                      letterSpacing: ".01em",
                    }}
                  >
                    {t === "source" ? "Source" : t === "clone" ? "Clone" : "Config"}
                  </button>
                );
              })}
            </div>

            {codeToolTab === "source" && (
              <div className="space-y-3">
                <SLabel>Layer</SLabel>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ["dbs", "DBs & tools"] as const,
                      ["router", "Router"] as const,
                      ["spec", "Persona spec"] as const,
                  ]).map(([k, label]) => {
                    const act = astroSourcePage === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setAstroSourcePage(k)}
                        className="rounded-full px-2.5 py-1 text-[9px] font-medium transition-all"
                        style={{
                          background: act
                            ? "linear-gradient(145deg, rgba(255,248,250,0.95) 0%, rgba(244,232,242,0.82) 100%)"
                            : "rgba(255,255,255,0.4)",
                          border: act
                            ? "1px solid rgba(196, 170, 192, 0.4)"
                            : "1px solid rgba(210, 195, 205, 0.3)",
                          color: act ? C.accent : C.txt2,
                          boxShadow: act ? "0 2px 10px -5px rgba(130, 95, 120, 0.12)" : "none",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <motion.div
                  key={astroSourcePage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden rounded-xl"
                  style={{
                    background: "linear-gradient(165deg, rgba(255,252,252,0.92) 0%, rgba(252,245,248,0.82) 55%, rgba(248,240,246,0.78) 100%)",
                    border: "1px solid rgba(205, 182, 198, 0.32)",
                    boxShadow: "0 8px 28px -20px rgba(130, 90, 110, 0.12)",
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3.5 py-2"
                    style={{ borderBottom: "1px solid rgba(210, 188, 202, 0.28)", fontFamily: "ui-monospace, monospace" }}
                  >
                    {["#c8939e", "#dba67a", "#7ab8a0"].map((c, i) => (
                      <div key={i} className="h-2 w-2 rounded-full opacity-60" style={{ background: c }} />
                    ))}
                    <span className="ml-1.5 text-[9.5px]" style={{ color: C.txt3 }}>
                      {astroSourcePage === "dbs" && "zodiac_routing.yaml"}
                      {astroSourcePage === "router" && "intent_router.ts"}
                      {astroSourcePage === "spec" && "tao_baibai.config.yaml"}
                    </span>
                  </div>
                  {astroSourcePage === "dbs" && (
                    <pre className="m-0 px-3.5 py-3 text-[10.5px] leading-[1.8] whitespace-pre-wrap font-mono" style={{ color: C.txt2 }}>{`zodiac_memory_db
  intent  : consult
  topics  : love · career · self-worth · chart
  tools   : chart_lookup, transit_check

smalltalk_memory_db
  intent  : casual
  topics  : vent · chat · daily life
  tools   : sentiment_mirror`}</pre>
                  )}
                  {astroSourcePage === "router" && (
                    <pre className="m-0 px-3.5 py-3 text-[10.5px] leading-[1.8] whitespace-pre-wrap font-mono" style={{ color: C.txt2 }}>{`intent = classify(msg)

if intent.type == "consult":
  → zodiac_memory_db
else:
  → smalltalk_memory_db`}</pre>
                  )}
                  {astroSourcePage === "spec" && (
                    <pre className="m-0 px-3.5 py-3 text-[10.5px] leading-[1.8] whitespace-pre-wrap font-mono" style={{ color: C.txt2 }}>{ASTRO_PERSONA_SPEC}</pre>
                  )}
                </motion.div>
                <p className="text-[10.5px] leading-relaxed" style={{ color: C.txt3 }}>
                  Switch bubble tabs to hop between data sources, routing, and the Tao Baibai voice stub.
                </p>
              </div>
            )}

            {codeToolTab === "clone" && (
              <div className="space-y-3">
                <p className="text-[12px] leading-[1.65]" style={{ color: C.txt2 }}>
                  Fork the showroom template: spec, UI shell, and prompt runtime packaged together.
                </p>
                <div
                  className="overflow-hidden rounded-xl"
                  style={{
                    border: "1px solid rgba(190, 165, 185, 0.35)",
                    background: "linear-gradient(180deg, rgba(38, 28, 44, 0.92) 0%, rgba(30, 22, 36, 0.94) 100%)",
                    boxShadow: "0 10px 32px -18px rgba(100, 70, 90, 0.2)",
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3.5 py-2"
                    style={{ borderBottom: "1px solid rgba(130, 100, 120, 0.28)", fontFamily: "ui-monospace, monospace" }}
                  >
                    {["#c8939e", "#dba67a", "#7ab8a0"].map((c, i) => (
                      <div key={i} className="h-2 w-2 rounded-full opacity-60" style={{ background: c }} />
                    ))}
                    <span className="ml-1.5 text-[9.5px] text-white/50">Terminal</span>
                  </div>
                  <pre className="m-0 px-3.5 py-3.5 text-[10.5px] leading-[1.9] whitespace-pre-wrap" style={{ color: "rgba(130,200,150,0.92)", fontFamily: "ui-monospace,monospace" }}>{ASTRO_CLONE_SNIPPET}</pre>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(ASTRO_CLONE_SNIPPET).catch(() => {});
                    setCloneCopied(true);
                    window.setTimeout(() => setCloneCopied(false), 2000);
                  }}
                  className="w-full rounded-full py-2.5 text-[12px] font-medium transition-all"
                  style={{
                    border: `1px solid ${cloneCopied ? "rgba(188, 155, 180, 0.55)" : "rgba(205, 185, 200, 0.4)"}`,
                    background: cloneCopied
                      ? "linear-gradient(145deg, rgba(255,248,252,0.95) 0%, rgba(245,232,242,0.9) 100%)"
                      : "linear-gradient(145deg, rgba(255,252,252,0.85) 0%, rgba(250,244,248,0.75) 100%)",
                    color: cloneCopied ? C.accent : C.txt,
                    boxShadow: "0 2px 12px -6px rgba(120, 90, 110, 0.1)",
                  }}
                >
                  {cloneCopied ? "Copied" : "Copy command"}
                </button>
              </div>
            )}

            {codeToolTab === "config" && (
              <div className="space-y-3">
                <div>
                  <div className="text-[9px] uppercase tracking-[.14em] mb-1.5" style={{ color: "rgba(120, 96, 118, 0.5)" }}>Model</div>
                  <div className="relative">
                    <select
                      value={cfgModel}
                      onChange={e => setCfgModel(e.target.value)}
                      className="w-full appearance-none rounded-full py-2.5 pl-4 pr-9 text-[12px] outline-none"
                      style={{
                        border: "1px solid rgba(200, 180, 198, 0.45)",
                        background: "linear-gradient(180deg, rgba(255,252,253,0.95) 0%, rgba(250,244,248,0.9) 100%)",
                        color: C.txt,
                        fontFamily: uiFont.style.fontFamily,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                    >
                      <option value="qwen-qwq">qwen-qwq — Deep Reasoning</option>
                      <option value="qwen-plus">qwen-plus — Balanced</option>
                      <option value="qwen-turbo">qwen-turbo — Fastest</option>
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: C.txt3 }}>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(150deg, rgba(255,250,252,0.7) 0%, rgba(246,236,244,0.5) 100%)",
                    border: "1px solid rgba(205, 185, 200, 0.32)",
                  }}
                >
                  <div className="text-[9px] uppercase tracking-[.12em] mb-2" style={{ color: "rgba(120, 96, 118, 0.5)" }}>{`Temperature — ${cfgTemp.toFixed(2)}`}</div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={cfgTemp}
                    onChange={e => setCfgTemp(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: "#b892b0" }}
                  />
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(150deg, rgba(255,250,252,0.7) 0%, rgba(246,236,244,0.5) 100%)",
                    border: "1px solid rgba(205, 185, 200, 0.32)",
                  }}
                >
                  <div className="text-[9px] uppercase tracking-[.12em] mb-2" style={{ color: "rgba(120, 96, 118, 0.5)" }}>{`Max tokens — ${cfgTokens}`}</div>
                  <input
                    type="range"
                    min={256}
                    max={4096}
                    step={128}
                    value={cfgTokens}
                    onChange={e => setCfgTokens(parseInt(e.target.value, 10))}
                    className="w-full"
                    style={{ accentColor: "#b892b0" }}
                  />
                </div>
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "linear-gradient(165deg, rgba(255,252,252,0.85) 0%, rgba(248,242,246,0.7) 100%)",
                    border: "1px solid rgba(205, 188, 202, 0.3)",
                  }}
                >
                  <div className="text-[9px] uppercase tracking-[.1em] mb-2" style={{ color: "rgba(120, 96, 118, 0.5)" }}>Feature flags</div>
                  {["Zodiac memory routing", "Chart & transit tools", "Card draw ritual", "Smalltalk sentiment mirror"].map((label, i) => {
                    const on = i < 3;
                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b last:border-0 py-1.5"
                        style={{ borderColor: "rgba(210, 190, 205, 0.22)" }}
                      >
                        <span className="text-[11.5px]" style={{ color: C.txt2 }}>{label}</span>
                        <span
                          className="relative h-3.5 w-7 rounded-full"
                          style={{ background: on ? "rgba(190, 155, 175, 0.42)" : "rgba(180, 165, 178, 0.25)" }}
                        >
                          <span
                            className="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-all"
                            style={{ left: on ? 16 : 3 }}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="rounded-2xl p-3.5"
                  style={{
                    background: "linear-gradient(155deg, rgba(255,250,252,0.75) 0%, rgba(244,234,242,0.55) 100%)",
                    border: "1px solid rgba(200, 182, 198, 0.32)",
                  }}
                >
                  <SLabel>Live mode</SLabel>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={latestMode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: latestMode === "Astrology Consult" ? C.accent : C.rose }}
                      />
                      <span className="text-[11px]" style={{ color: C.txt2 }}>
                        {latestMode === "Astrology Consult" ? "→ zodiac_memory_db" : "→ smalltalk_memory_db"}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </SidePanel>
        )}
      </AnimatePresence>
      </div>

      {/* Onboarding — right dock (pushes main column, no full-screen dim) */}
      <AnimatePresence>
        {demoOpen && (
          <SidePanel variant="dock" title="Onboarding Guide" onClose={() => setDemoOpen(false)}>
            <div>
              <SLabel>Demo Steps</SLabel>
              <div className="mt-2 space-y-1.5">
                {STEP_LABELS.map((label, idx) => {
                  const n=idx+1, done=n<activeStep, active=n===activeStep;
                  return (
                    <motion.div key={label} layout
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12px]"
                      style={{
                        background: active?"rgba(160,122,184,0.09)":"rgba(255,255,255,0.6)",
                        border:`1px solid ${active?"rgba(160,122,184,0.24)":C.cardBdr}`,
                        color: active?C.accent:done?C.txt3:"rgba(140,118,158,0.36)",
                      }}>
                      <span className="w-4 shrink-0 text-center text-[10px] font-medium">
                        {done?"✓":active?"▶":String(n)}
                      </span>
                      <span className={done?"line-through opacity-45":""}>{label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl p-4"
              style={{ background:"rgba(160,122,184,0.05)", border:"1px solid rgba(160,122,184,0.16)" }}>
              <SLabel>Live Analysis Cue</SLabel>
              <AnimatePresence mode="wait">
                <motion.p key={latestCue}
                  initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-3 }} transition={{ duration:.22 }}
                  className="mt-2 text-[12.5px] leading-[1.7]" style={{ color:C.txt2 }}>
                  {latestCue}
                </motion.p>
              </AnimatePresence>
            </div>
          </SidePanel>
        )}
      </AnimatePresence>
    </motion.div>
    {/* Outside root motion.div so fixed + translate centering is relative to the viewport, not a transformed ancestor */}
    <AnimatePresence>
      {showShareModal && <AstroShareModal onClose={() => setShowShareModal(false)} />}
    </AnimatePresence>
    </>
  );
}
