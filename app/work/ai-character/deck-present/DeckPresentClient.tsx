"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Motion ───────────────────────────────────────────────────────────────────
const E     = [0.22, 1, 0.36, 1]  as const;
const EHERO = [0.12, 1, 0.28, 1]  as const;
const UP    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.7,  ease: E    } } };
const UPHERO= { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 1.0,  ease: EHERO } } };
const FADE  = { hidden: { opacity: 0 },         show: { opacity: 1,     transition: { duration: 0.55, ease: E    } } };
const STG   = { hidden: {},                      show: { transition: { staggerChildren: 0.09, delayChildren: 0.1  } } };
const WVAR  = { hidden: { opacity: 0, y: 16 },  show: { opacity: 1, y: 0, transition: { duration: 0.5,  ease: E    } } };
const PCOLORS = ["#C8FF47", "#7B6CF4", "#4ABFBF", "#FF9B6A"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type Base     = { id: string; chapter: string; section: string };
type Pal      = "dark" | "navy" | "warm" | "lime";
type MetaFld  = { k: string; v: string };
type Room4    = { label: string; cap: string; mediaSrc: string; color: string };
type Card3    = { n: string; title: string; body: string; color: string };
type DNode    = { label: string; sub?: string; highlight?: boolean };
type Feature  = { n: string; title: string; body: string; bg: string; fg: string };
type Metric   = { n: string; label: string; detail: string };
type QAItem   = { q: string; a: string };

type CinematicOpen   = Base & { kind: "cinematic-open";    eyebrow: string; headline: string; supporting: string; meta: MetaFld[]; mediaSrc?: string };
type WorldContext     = Base & { kind: "world-context";    eyebrow: string; title: string; body: string; traits: string[]; mediaSrc: string };
type ShowroomsReveal  = Base & { kind: "showrooms-reveal"; eyebrow: string; title: string; rooms: Room4[] };
type ChapterBreak     = Base & { kind: "chapter-break";    num: string; name: string; tagline: string };
type SplitSlide       = Base & { kind: "split";            eyebrow: string; title: string; body: string; dark: boolean; note?: string; mediaSrc?: string; mediaAlt?: string; mediaPalette?: Pal; plugins?: string[]; ratio?: "3:7"|"4:6"|"5:5" };
type BulletsSlide     = Base & { kind: "bullets";          headline: string; dark?: boolean; items: { bold: string; italic: string }[] };
type QuoteSlide       = Base & { kind: "quote";            text: string; source?: string; dark: boolean; wordReveal?: boolean };
type CardsSlide       = Base & { kind: "cards";            eyebrow: string; title?: string; cards: Card3[] };
type DiagramSlide     = Base & { kind: "diagram";          eyebrow: string; title: string; nodes: DNode[]; annotation: string; caption: string };
type WorkflowSlide    = Base & { kind: "workflow";         eyebrow: string; title: string; note?: string; body: string; workflowSrc: string };
type FeaturesSlide    = Base & { kind: "features";         eyebrow: string; headline?: string; mediaSrc?: string; left: Feature; right: Feature };
type OutcomesSlide    = Base & { kind: "outcomes";         eyebrow: string; title: string; metrics: Metric[] };
type PrinciplesSlide  = Base & { kind: "principles";       items: string[]; closingQuote?: string };
type ClosingSlide     = Base & { kind: "closing";          title: string; body: string; href: string; cta: string };
type ProtoSlide       = Base & { kind: "proto";            eyebrow: string; title: string; body: string; protoSrc: string };

type Slide = CinematicOpen | WorldContext | ShowroomsReveal | ChapterBreak | SplitSlide | BulletsSlide | QuoteSlide | CardsSlide | DiagramSlide | WorkflowSlide | FeaturesSlide | OutcomesSlide | PrinciplesSlide | ClosingSlide | ProtoSlide;

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES: Slide[] = [

  // ── Ch 1 · Opening ────────────────────────────────────────────────────────
  {
    id: "title", kind: "cinematic-open",
    chapter: "Opening", section: "Title",
    eyebrow: "ALIBABA CLOUD · TONGYI XINGCHEN · 2025",
    headline: "Designing the AI\nThat Feels Alive.",
    supporting: "How I turned a model capability into an emotionally immersive product experience in 4 weeks. After the showrooms went live, model call volume rose 200%.",
    meta: [
      { k: "Role",     v: "UX Designer Intern · End-to-end C2C" },
      { k: "Duration", v: "4 weeks · July–August 2025" },
      { k: "Team",     v: "1 supervisor · 2 UX · 2 PM · 4 Eng" },
      { k: "Outcome",  v: "Shipped · +200% model calls post-showroom · B2B framework adopted" },
    ],
    mediaSrc: "/assets/ai-character/eternal-vow-character.png",
  },
  {
    id: "world", kind: "world-context",
    chapter: "Opening", section: "Context",
    eyebrow: "What is an AI character product?",
    title: "AI companions that remember you, grow with you, and exist between conversations.",
    body: "Unlike standard chatbots, AI character products maintain persistent memory across sessions, develop relationships over time, and create immersive emotional environments — for companionship, therapy support, entertainment, and licensed IP experiences.",
    traits: [
      "Persistent memory across sessions — the character knows your history",
      "Evolving relationship depth — personality grows from knowing you",
      "Scenario-specific emotional environments — not a chat window",
    ],
    mediaSrc: "/assets/ai-character/new-cover.mp4",
  },

  // ── Ch 2 · The Work ───────────────────────────────────────────────────────
  {
    id: "ch-work", kind: "chapter-break",
    chapter: "The Work", section: "Chapter",
    num: "02", name: "The Work",
    tagline: "Four showrooms. One proof per model capability.",
  },
  {
    id: "showrooms-reveal", kind: "showrooms-reveal",
    chapter: "The Work", section: "Showrooms",
    eyebrow: "UX Strategy · One Capability = One Proof Moment",
    title: "Four showrooms. Each proving a different model capability.",
    rooms: [
      { label: "Romance",    cap: "Long-term memory",         mediaSrc: "/assets/ai-character/new-cover.mp4",   color: "#C8FF47" },
      { label: "Astrology",  cap: "Real-time memory updates", mediaSrc: "/assets/ai-character/taobaibai-1.mp4", color: "#7B6CF4" },
      { label: "Therapy",    cap: "Real-time analysis",       mediaSrc: "/assets/ai-character/therapy-1.mp4",   color: "#4ABFBF" },
      { label: "Multi-Char", cap: "Multi-agent coordination", mediaSrc: "/assets/ai-character/pre-1.mp4",      color: "#FF9B6A" },
    ],
  },
  {
    id: "proto-romance", kind: "proto",
    chapter: "The Work", section: "Live Demo",
    eyebrow: "Live Interactive Prototype · Romance Room",
    title: "Try it.",
    body: "This is a working rebuild of the Romance showroom. Tap the heartbeat icon, send messages, and see long-term memory in action.",
    protoSrc: "/work/ai-character/prototype?muted=1",
  },

  // ── Ch 3 · The Problem ────────────────────────────────────────────────────
  {
    id: "ch-problem", kind: "chapter-break",
    chapter: "The Problem", section: "Chapter",
    num: "03", name: "The Problem",
    tagline: "High capability. Low visibility. The product was invisible.",
  },
  {
    id: "problem-statement", kind: "split", dark: true,
    chapter: "The Problem", section: "Context",
    eyebrow: "Alibaba Cloud · TONGYI Xingchen · July–August 2025",
    title: "High capability.\nLow conversion.\nThe product was invisible.",
    body: "The model could remember users across sessions, evolve relationships, and personalize at depth — but none of this was visible.\n\nTrial users churned before they felt the difference. Enterprise prospects had to imagine the value instead of experiencing it.",
    mediaPalette: "dark",
  },
  {
    id: "research", kind: "split", dark: true,
    chapter: "The Problem", section: "Research",
    eyebrow: "Research · 6 Products · 40+ Public Reviews",
    title: "The real gap isn't quality.\nIt's immersion.",
    body: "Across six competitor products, users repeatedly hit a scripted ceiling.\n\nResponses weren't weak — the interface was wrong. It felt like texting a chatbot. Memory and relationship depth never became emotionally legible.",
    mediaSrc: "/assets/ai-character/characterai.png",
    mediaAlt: "Competitive analysis synthesis",
    mediaPalette: "dark",
    ratio: "4:6",
  },
  {
    id: "failure-patterns", kind: "bullets", dark: true,
    chapter: "The Problem", section: "Patterns",
    headline: "Three failure patterns. One root cause.",
    items: [
      { bold: "Memory resets every session.",         italic: "You are a stranger again each time you open the app." },
      { bold: "Personality is fixed.",                italic: "Characters never grow from knowing you over time." },
      { bold: "The interface is just a chat window.", italic: "Identical to texting Claude or GPT with a persona photo." },
    ],
  },
  {
    id: "insight", kind: "quote", dark: true, wordReveal: true,
    chapter: "The Problem", section: "Insight",
    text: "Users don't churn because the model is weak.\nThey churn because they never feel exclusively known.",
    source: "Synthesized from 40+ public reviews across 6 products · 2025",
  },

  // ── Ch 4 · Strategy ───────────────────────────────────────────────────────
  {
    id: "ch-strategy", kind: "chapter-break",
    chapter: "Strategy", section: "Chapter",
    num: "04", name: "Strategy",
    tagline: "From explaining the model to showing their future product.",
  },
  {
    id: "hmw", kind: "quote", dark: false,
    chapter: "Strategy", section: "Question",
    text: "How might we make model capabilities visible, testable, and trustworthy — within the first three minutes?",
  },
  {
    id: "diagram", kind: "diagram",
    chapter: "Strategy", section: "Architecture",
    eyebrow: "Under the hood · Where the character actually lives",
    title: "The design challenge is at the memory layer.",
    nodes: [
      { label: "User input",               sub: "Message, tap, or action" },
      { label: "Short-term context",       sub: "Resets each session" },
      { label: "Long-term memory",         sub: "Persists and grows",          highlight: true },
      { label: "Character behavior layer", sub: "Callbacks · tone · unlocks",  highlight: true },
      { label: "Response + UI surface",    sub: "What the user sees" },
    ],
    annotation: "Making persistence visible and emotionally meaningful — not buried in infrastructure.",
    caption: "What persists vs. resets and where design intervenes.",
  },
  {
    id: "strategic-reframe", kind: "split", dark: false,
    chapter: "Strategy", section: "Reframe",
    eyebrow: "Strategic Reframe",
    title: "From explaining the model to showing their future product.",
    body: "Instead of capability decks, I built market-specific showrooms as live prototypes.\n\nCustomers could test each model strength directly in context — then clone, configure, and deploy it themselves.",
    mediaSrc: "/assets/ai-character/newmove.mp4",
    mediaAlt: "Live showroom reel",
    plugins: ["Live Showroom", "One-click Trial", "Clone & Deploy"],
    ratio: "4:6",
  },
  {
    id: "framework", kind: "cards",
    chapter: "Strategy", section: "Framework",
    eyebrow: "Strategy Framework · Capability → Experience → Deployment",
    cards: [
      { n: "01", title: "Market-back character definition", body: "Companionship, therapy, persona replication, and licensed IP as distinct B2B entry points.", color: "#C8FF47" },
      { n: "02", title: "Capability-to-scenario mapping",   body: "Each interaction surfaces one model strength through a direct proof moment the customer can feel.", color: "#7B6CF4" },
      { n: "03", title: "Reusable template for customers",  body: "Showrooms were designed to be cloned, configured, and shipped — not one-time pitch artifacts.", color: "#4ABFBF" },
    ],
  },

  // ── Ch 5 · Romance Room ───────────────────────────────────────────────────
  {
    id: "ch-romance", kind: "chapter-break",
    chapter: "Romance Room", section: "Chapter",
    num: "05", name: "Romance Room",
    tagline: "Showroom 01 · Making users feel exclusively known",
  },
  {
    id: "romance-intro", kind: "split", dark: true,
    chapter: "Romance Room", section: "Overview",
    eyebrow: "Showroom 01 · Long-term memory",
    title: "Sustain engagement past the 2-week churn wall.",
    body: "Romance is the highest-stakes scenario: highest expectations, shortest patience for generic responses.\n\nThe design goal: make users feel uniquely known by a character that actually remembers them.\n\nVisual language draws from Love and Deepspace — dark gold tones, ambient motion, looping character portrait, background music.",
    mediaSrc: "/assets/ai-character/heroshowcase.mp4",
    mediaAlt: "Romance room",
    ratio: "4:6",
  },
  {
    id: "heartbeat", kind: "workflow",
    chapter: "Romance Room", section: "Interaction 01",
    eyebrow: "Interaction 01 · Solves: emotional distance",
    title: "Heartbeat Power: the inner monologue reveal.",
    note: "Balance: too much exposure breaks mystery. Too little loses emotional depth.",
    body: "A tap-to-reveal flip card surfaces the character's inner monologue without collapsing the surface illusion.\n\nUsers get emotional privilege — a glimpse behind the mask — while the scene stays intact. I tested tooltip, modal, and inline variants. The flip card was the only one that preserved intimacy and restraint simultaneously.",
    workflowSrc: "/assets/ai-character/interaction/heartbeat_power_workflow.svg",
  },
  {
    id: "story-unlock", kind: "workflow",
    chapter: "Romance Room", section: "Interaction 02",
    eyebrow: "Interaction 02 · Solves: scripted ceiling",
    title: "Story Unlock: backstory through conversation depth.",
    note: "One knowledge base revealing progressively across two interaction layers.",
    body: "Backstory milestones unlock as conversation depth accumulates — a single knowledge base revealing progressively.\n\nThis extends novelty and emotional investment without requiring new content production per user. The more they engage, the more they discover.",
    workflowSrc: "/assets/ai-character/interaction/story_unlock_workflow.svg",
  },
  {
    id: "moments-feed", kind: "workflow",
    chapter: "Romance Room", section: "Interaction 03",
    eyebrow: "Interaction 03 · Solves: off-session absence",
    title: "Moments Feed: the character lives between conversations.",
    note: "The biggest churn moment happened between sessions, not inside them.",
    body: "An Instagram-style feed generates posts from relationship history — memories, reactions, moments — keeping emotional presence alive off-session.\n\nThis reduced the dead interval between conversations from a break to a continuation. Retention mechanic: not a notification, but a relationship continuing.",
    workflowSrc: "/assets/ai-character/interaction/moments_feed_workflow.svg",
  },
  {
    id: "alternate-universe", kind: "split", dark: true,
    chapter: "Romance Room", section: "Interaction 04",
    eyebrow: "Interaction 04 · Solves: long-term novelty decay",
    title: "Alternate Universe Events: variable rewards from real shared context.",
    note: "Memory makes the reward feel personal — not randomized.",
    body: "Scenes triggered by personal history recontextualize the relationship from an alternate timeline.\n\nThe surprise is grounded in real shared context — memory callbacks dressed as fiction. This is how long-term memory becomes emotionally compelling rather than just functionally useful.",
    mediaSrc: "/assets/ai-character/newworld.mp4",
    mediaAlt: "Alternate Universe showcase",
    mediaPalette: "navy",
    ratio: "4:6",
  },
  {
    id: "conv-engine", kind: "features",
    chapter: "Romance Room", section: "Experience Loop",
    eyebrow: "Accelerating Time-to-Experience · First 3 Minutes",
    headline: "Making the model legible before users know to look for it.",
    mediaSrc: "/assets/ai-character/conversation engine.mp4",
    left:  { n: "Feature 01", title: "Inspiration Response", body: "Three context-grounded reply options with action, emotion, and expression cues — reducing decision friction while keeping narrative momentum.", bg: "#C8FF47", fg: "#0A0A0A" },
    right: { n: "Feature 02", title: "Continue Response",    body: "One tap extends the active storyline from context — revealing long-context reasoning without requiring the user to prompt for it.", bg: "#1A2744", fg: "#FFFFFF" },
  },

  // ── Ch 6 · Other Rooms ────────────────────────────────────────────────────
  {
    id: "ch-rooms", kind: "chapter-break",
    chapter: "Other Rooms", section: "Chapter",
    num: "06", name: "Other Rooms",
    tagline: "Three more proofs of model capability",
  },
  {
    id: "astro", kind: "split", dark: false,
    chapter: "Other Rooms", section: "Astrology",
    eyebrow: "Showroom 02 · Real-time memory updates",
    title: "Trust through transparency, not through magic.",
    body: "As users share details, a live constellation profile updates in real time.\n\nMemory becomes inspectable — users see exactly what the system captured, and trust it because they watched it happen. Visible cognition builds trust that invisible memory never could.",
    mediaSrc: "/assets/ai-character/taobaibai-1.mp4",
    mediaAlt: "Astrology room demo",
    plugins: ["Memory Rail", "Live Update", "Trust Signal"],
    ratio: "4:6",
  },
  {
    id: "therapy", kind: "split", dark: false,
    chapter: "Other Rooms", section: "Therapy",
    eyebrow: "Showroom 03 · Real-time analysis",
    title: "Trust through visible reasoning, not just visible responses.",
    body: "Three specialist panels react in parallel to the same conversation.\n\nUsers can inspect what the model understood — emotional, cognitive, somatic lenses — not just what it chose to say. Reasoning on-screen builds trust from transparency rather than blind faith in outputs.",
    mediaSrc: "/assets/ai-character/therapy-1.mp4",
    mediaAlt: "Therapy room demo",
    plugins: ["Parallel Experts", "Live Analysis", "Reasoning View"],
    ratio: "4:6",
  },
  {
    id: "multichar", kind: "split", dark: true,
    chapter: "Other Rooms", section: "Multi-Character",
    eyebrow: "Showroom 04 · Multi-agent coordination",
    title: "Making agent coordination feel like a scene, not a group chat.",
    body: "Multiple characters respond to the user and to each other in real time.\n\nThe core challenge: making multi-agent coordination readable at a glance. A portrait rail + single thread makes who-is-speaking trivially legible while preserving the scene's spatial context.",
    mediaSrc: "/assets/ai-character/pre-1.mp4",
    mediaAlt: "Multi-character room demo",
    plugins: ["Agent Roles", "Scene Control"],
    ratio: "4:6",
  },

  // ── Ch 7 · Craft ──────────────────────────────────────────────────────────
  {
    id: "ch-craft", kind: "chapter-break",
    chapter: "Craft", section: "Chapter",
    num: "07", name: "Craft",
    tagline: "Visual identity and production under a 4-week constraint",
  },
  {
    id: "visual-process", kind: "split", dark: false,
    chapter: "Craft", section: "Visual Identity",
    eyebrow: "Design Craft · AI-Generated Visual Identity",
    title: "Visual identity crafted with AI generation tools in 72 hours.",
    body: "Drawing from Love and Deepspace: I used Wan, Kling, Dreamnia, and SeeDance to finalize character visual identity under constraint.\n\nThe 3D avatar crashed mid-interaction — a fatal flaw in a romance flow. I replaced it with an AI-generated looping video: lighter, crash-free, subtly expressive. Small motions — blink, nod, smile — felt more alive than complex rigged animation.",
    mediaSrc: "/assets/ai-character/innovation.jpg",
    mediaAlt: "Character visual identity process",
    ratio: "4:6",
  },
  {
    id: "developer-tools", kind: "split", dark: false,
    chapter: "Craft", section: "B2B Tools",
    eyebrow: "Production · Developer Replication Tools",
    title: "Turned demos into templates. Shifted 'Can it?' to 'How fast?'",
    body: "View Source, One-Click Clone, and live config panels let enterprise clients inspect prompts and adapt them immediately in product.\n\n60% faster design-to-deploy via production Framer Motion code handoff — no re-implementation needed by engineers.",
    mediaSrc: "/assets/ai-character/developer-tool-source.png",
    mediaAlt: "Developer replication tools",
    plugins: ["View Source", "Clone Template", "Live Config"],
    ratio: "4:6",
  },

  // ── Ch 8 · Impact ─────────────────────────────────────────────────────────
  {
    id: "ch-impact", kind: "chapter-break",
    chapter: "Impact", section: "Chapter",
    num: "08", name: "Impact",
    tagline: "Shipped. Converted. Adopted.",
  },
  {
    id: "outcomes", kind: "outcomes",
    chapter: "Impact", section: "Metrics",
    eyebrow: "Outcomes · Shipped in 4 weeks",
    title: "What shipped. What changed.",
    metrics: [
      { n: "4",   label: "Showrooms live",         detail: "Each demonstrating a distinct model capability, clearly and experientially" },
      { n: "200%", label: "Model call volume",     detail: "Increase after showrooms launched" },
      { n: "87%", label: "Shorter trial path",      detail: "Trial-to-subscribe compressed via one-click clone and live config panels" },
      { n: "60%", label: "Faster design-to-deploy", detail: "Via production Framer Motion code handoff — no re-implementation needed" },
      { n: "B2B", label: "Framework adopted",       detail: "Reusable showroom system scaled across enterprise verticals" },
    ],
  },
  {
    id: "principles", kind: "principles",
    chapter: "Impact", section: "Principles",
    items: [
      "AI systems need visible cognition, not just outputs",
      "Trust comes from inspectability and feedback loops",
      "Show customers their own use case in motion",
      "Ship experience, not explanation",
    ],
    closingQuote: "Design is the translation layer. The hardest problem in AI products is helping customers imagine what they can build.",
  },

  // ── Ch 9 · Close ──────────────────────────────────────────────────────────
  {
    id: "closing", kind: "closing",
    chapter: "Closing", section: "End",
    title: "Yuan Fang",
    body: "AI products need visible cognition — not just strong outputs. Trust comes from inspectability. The fastest path to enterprise adoption is letting clients experience their own future product, already running.",
    href: "https://tongyi.aliyun.com/character",
    cta: "View the live showrooms",
  },
];

// ─── Derived ─────────────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function isDark(s: Slide): boolean {
  if (s.kind === "cinematic-open")   return true;
  if (s.kind === "chapter-break")    return true;
  if (s.kind === "outcomes")         return true;
  if (s.kind === "principles")       return true;
  if (s.kind === "features")         return true;
  if (s.kind === "showrooms-reveal") return true;
  if (s.kind === "bullets")          return !!(s as BulletsSlide).dark;
  if (s.kind === "split" || s.kind === "quote") return (s as SplitSlide).dark;
  return false;
}

// ─── Style constants ──────────────────────────────────────────────────────────
const EYE   = "font-mono text-[10px] uppercase tracking-[0.26em]";
const BODY  = "font-sans text-[15px] leading-[1.76]";
const TITLE = "font-display font-light leading-[1.07] tracking-[-0.028em]";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Pills({ items, dark }: { items: string[]; dark: boolean }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item}
          className={`inline-flex rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
            dark ? "border-white/[0.12] bg-white/[0.04] text-white/50" : "border-black/[0.1] bg-black/[0.02] text-[#6B6B6B]"
          }`}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Parallax media zone (cursor-responsive depth) ────────────────────────────
function ParallaxMedia({ src, alt, pal = "dark", className = "" }: { src?: string; alt?: string; pal?: Pal; className?: string }) {
  const ref   = useRef<HTMLDivElement>(null);
  const rawX  = useMotionValue(0);
  const rawY  = useMotionValue(0);
  const px    = useSpring(rawX, { stiffness: 35, damping: 22 });
  const py    = useSpring(rawY, { stiffness: 35, damping: 22 });

  const bgs: Record<Pal, string> = { dark: "#0A0A0A", navy: "#1A2744", warm: "#EDE9E0", lime: "#0A0A0A" };
  const bg = bgs[pal];

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set(((e.clientX - r.left) / r.width  - 0.5) * 14);
    rawY.set(((e.clientY - r.top)  / r.height - 0.5) * 10);
  }

  const isVid = !!src && (src.endsWith(".mp4") || src.endsWith(".mov"));

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}
      onMouseMove={onMove} onMouseLeave={() => { rawX.set(0); rawY.set(0); }}>
      <motion.div style={{ x: px, y: py }}
        className="absolute inset-[-4%] h-[108%] w-[108%]"
        transition={{ type: "spring", stiffness: 35, damping: 22 }}>
        <div className="absolute inset-0" style={{ background: bg }}>
          {isVid ? (
            <video key={src} className="h-full w-full object-contain" playsInline preload="metadata" muted autoPlay loop>
              <source src={src} type={src!.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
            </video>
          ) : src ? (
            <img src={src} alt={alt ?? ""} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── 3D tilt card ─────────────────────────────────────────────────────────────
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [t,  setT]  = useState({ x: 0, y: 0 });
  const [on, setOn] = useState(false);
  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setT({ x: ((e.clientY - r.top)  / r.height - 0.5) * -8,
           y: ((e.clientX - r.left) / r.width  - 0.5) *  8 });
  }
  return (
    <div ref={ref} className={className}
      style={{
        transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg) translateZ(${on ? 5 : 0}px)`,
        transition: on ? "transform 0.1s ease-out" : "transform 0.65s cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => { setOn(false); setT({ x: 0, y: 0 }); }}>
      {children}
    </div>
  );
}

// ─── Animated count-up ────────────────────────────────────────────────────────
function CountUp({ value, delay = 0 }: { value: string; delay?: number }) {
  const m = value.match(/^(\d+\.?\d*)(%?)$/);
  const [disp, setDisp] = useState(m ? "0" + (m[2] || "") : value);

  useEffect(() => {
    if (!m) { setDisp(value); return; }
    const target = parseFloat(m[1]);
    const suf    = m[2] || "";
    let frame: number;
    const tid = setTimeout(() => {
      let start: number | null = null;
      frame = requestAnimationFrame(function tick(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / 1400, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setDisp(Math.floor(e * target) + suf);
        if (t < 1) frame = requestAnimationFrame(tick);
        else setDisp(target + suf);
      });
    }, delay);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{disp}</>;
}

// ─── Word-by-word reveal ──────────────────────────────────────────────────────
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.span className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.12 } } }}
      initial="hidden" animate="show">
      {text.split(/(\s+)/).map((chunk, i) =>
        /^\s+$/.test(chunk)
          ? <span key={i}>&nbsp;</span>
          : <motion.span key={i} variants={WVAR} className="inline-block">{chunk}</motion.span>
      )}
    </motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE BODIES
// ─────────────────────────────────────────────────────────────────────────────

function CinematicOpenBody({ slide }: { slide: CinematicOpen }) {
  const lines = slide.headline.split("\n");
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center overflow-hidden bg-[#050507]">
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-[#C8FF47]/[0.02] to-transparent" />

      {/* Character image — right bleed */}
      {slide.mediaSrc && (
        <div className="absolute inset-y-0 right-0 w-[52%]">
          <img src={slide.mediaSrc} alt="" aria-hidden
            className="h-full w-full object-cover object-center"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.85) 55%)" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #050507 0%, #050507cc 22%, #05050755 55%, transparent 100%)" }} />
        </div>
      )}

      {/* Text content */}
      <motion.div className="relative z-10 max-w-3xl px-12 py-20 md:px-20" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-white/22`}>{slide.eyebrow}</motion.p>
        <motion.h1 variants={UPHERO}
          className="mt-7 font-display font-extralight leading-[1.02] tracking-[-0.04em] text-white"
          style={{ fontSize: "clamp(3.4rem, 7vw, 6.5rem)" }}>
          {lines.map((line, i) => (
            <span key={i} className={`block ${i === lines.length - 1 ? "text-[#C8FF47]" : ""}`}>{line}</span>
          ))}
        </motion.h1>
        <motion.p variants={UP} className={`mt-8 max-w-lg ${BODY} text-white/45`}>{slide.supporting}</motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/[0.07] pt-8">
          {slide.meta.map(({ k, v }) => (
            <div key={k}>
              <p className={`${EYE} text-white/20`}>{k}</p>
              <p className="mt-1.5 font-sans text-[13px] text-white/65">{v}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function WorldContextBody({ slide }: { slide: WorldContext }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center bg-[#F5F3EE]">
      <div className="mx-auto w-full max-w-5xl px-12 py-16 md:px-20">
        <motion.div className="grid gap-14 md:grid-cols-[1fr_42%]" variants={STG} initial="hidden" animate="show">
          <div>
            <motion.p variants={FADE} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
            <motion.h2 variants={UP}
              className={`mt-6 ${TITLE} text-[#0A0A0A]`}
              style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}>
              {slide.title}
            </motion.h2>
            <motion.p variants={UP} className={`mt-6 ${BODY} text-[#5A5A5A]`}>{slide.body}</motion.p>
            <motion.ul variants={UP} className="mt-8 space-y-4">
              {slide.traits.map(t => (
                <li key={t} className="flex items-start gap-3.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8FF47]" aria-hidden />
                  <span className="font-sans text-[14.5px] leading-snug text-[#4A4A4A]">{t}</span>
                </li>
              ))}
            </motion.ul>
          </div>
          <motion.div variants={FADE}
            className="overflow-hidden rounded-2xl bg-[#0A0A0A] shadow-[0_12px_48px_-12px_rgba(0,0,0,0.18)]">
            <video key={slide.mediaSrc} className="h-full w-full object-contain" playsInline preload="metadata" muted autoPlay loop>
              <source src={slide.mediaSrc} type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ShowroomsRevealBody({ slide }: { slide: ShowroomsReveal }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#050507] px-8 pb-14 pt-12 md:px-16">
      <motion.div variants={STG} initial="hidden" animate="show" className="flex h-full flex-col">
        <div>
          <motion.p variants={FADE} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
          <motion.h2 variants={UP}
            className={`mt-3 ${TITLE} text-white`}
            style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)" }}>
            {slide.title}
          </motion.h2>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-3" style={{ maxHeight: "68vh" }}>
          {slide.rooms.map((room, i) => (
            <motion.div key={room.label}
              className="relative overflow-hidden rounded-2xl bg-[#0A0A0A]"
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.18 + i * 0.1 }}>
              <video key={room.mediaSrc} className="h-full w-full object-contain"
                playsInline preload="none" muted autoPlay loop>
                <source src={room.mediaSrc} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ background: room.color, color: room.color === "#C8FF47" ? "#0A0A0A" : "#fff" }}>
                  {room.label}
                </span>
                <p className="mt-1.5 font-sans text-[12px] text-white/55">{room.cap}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ChapterBreakBody({ slide }: { slide: ChapterBreak }) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center overflow-hidden bg-[#050507]">
      {/* Huge decorative number */}
      <div className="pointer-events-none absolute right-[-2vw] top-1/2 -translate-y-1/2 select-none" aria-hidden>
        <span className="font-display font-black leading-none tracking-[-0.06em] text-white"
          style={{ fontSize: "clamp(16rem, 32vw, 28rem)", opacity: 0.022 }}>
          {slide.num}
        </span>
      </div>
      {/* Content */}
      <motion.div className="relative z-10 max-w-2xl px-12 py-20 md:px-20" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-white/18`}>
          Chapter {slide.num} of 9
        </motion.p>
        <motion.h2 variants={UPHERO}
          className="mt-8 font-display font-extralight leading-[1.04] tracking-[-0.038em] text-white"
          style={{ fontSize: "clamp(3rem, 6.5vw, 5.5rem)" }}>
          {slide.name}
        </motion.h2>
        <motion.div variants={UP} className="mt-7 flex items-center gap-4">
          <div className="h-px w-10 bg-[#C8FF47]" />
          <p className={`${EYE} text-white/25`}>{slide.tagline}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

function SplitBody({ slide }: { slide: SplitSlide }) {
  const dark  = slide.dark;
  const bg    = dark ? "bg-[#050507]"  : "bg-[#F5F3EE]";
  const tP    = dark ? "text-white"    : "text-[#0A0A0A]";
  const tS    = dark ? "text-white/48" : "text-[#6B6B6B]";
  const eyeC  = dark ? "text-[#C8FF47]" : "text-[#9A9A9A]";
  const noteC = dark ? "text-white/28"  : "text-[#8A8A8A]";
  const lines = slide.title.split("\n");
  const pal   = slide.mediaPalette ?? (dark ? "dark" : "warm");
  const tw    = slide.ratio === "4:6" ? "md:w-[42%]" : slide.ratio === "3:7" ? "md:w-[30%]" : "md:w-1/2";
  const mw    = slide.ratio === "4:6" ? "md:w-[58%]" : slide.ratio === "3:7" ? "md:w-[70%]" : "md:w-1/2";

  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] overflow-hidden ${bg}`}>
      {/* Text column */}
      <motion.div className={`flex flex-col justify-center px-10 py-20 ${tw} md:px-14 lg:px-18`}
        variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} ${eyeC}`}>{slide.eyebrow}</motion.p>
        {slide.note && (
          <motion.p variants={UP}
            className={`mt-4 border-l-2 border-current/[0.14] pl-4 font-sans text-[12px] italic leading-relaxed ${noteC}`}>
            {slide.note}
          </motion.p>
        )}
        <motion.h2 variants={UP} className={`mt-5 ${TITLE} ${tP}`}
          style={{ fontSize: "clamp(1.45rem, 3vw, 2.45rem)" }}>
          {lines.map((ln, i) => <span key={i} className="block">{ln}</span>)}
        </motion.h2>
        <motion.div variants={UP} className="mt-7 space-y-4">
          {slide.body.split("\n\n").map((para, i) => (
            <p key={i} className={`${BODY} ${tS}`}>{para}</p>
          ))}
        </motion.div>
        {slide.plugins?.length ? <Pills items={slide.plugins} dark={dark} /> : null}
      </motion.div>

      {/* Media column — parallax depth */}
      <div className={`relative hidden ${mw} overflow-hidden md:block`}>
        <ParallaxMedia src={slide.mediaSrc} alt={slide.mediaAlt} pal={pal} className="absolute inset-0" />
      </div>
    </div>
  );
}

function BulletsBody({ slide }: { slide: BulletsSlide }) {
  const dark = !!slide.dark;
  const bg   = dark ? "bg-[#050507]" : "bg-[#F5F3EE]";
  const tP   = dark ? "text-white"   : "text-[#0A0A0A]";
  const divC = dark ? "divide-white/[0.06]" : "divide-black/[0.06]";
  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] flex-col justify-center ${bg} px-8 py-20 md:px-16`}>
      <motion.div className="mx-auto w-full max-w-3xl" variants={STG} initial="hidden" animate="show">
        <motion.h2 variants={UPHERO}
          className={`font-display font-semibold leading-[1.06] tracking-[-0.022em] ${tP}`}
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}>
          {slide.headline}
        </motion.h2>
        <div className={`mt-10 divide-y ${divC}`}>
          {slide.items.map((item, i) => (
            <motion.div key={i} className="py-8" variants={UP}>
              <p className={`font-sans text-[17px] leading-relaxed ${tP}`}>
                <span className="font-semibold">{item.bold}</span>{" "}
                <span className={dark ? "italic text-white/42" : "italic text-[#6B6B6B]"}>{item.italic}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function QuoteBody({ slide }: { slide: QuoteSlide }) {
  const bg   = slide.dark ? "bg-[#050507]" : "bg-[#F5F3EE]";
  const tP   = slide.dark ? "text-white"   : "text-[#0A0A0A]";
  const line = slide.dark ? "bg-[#C8FF47]" : "bg-[#0A0A0A]";
  const src  = slide.dark ? "text-white/22" : "text-[#AEAEB2]";
  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] flex-col items-start justify-center ${bg} px-8 py-20 md:px-16`}>
      <motion.div className="mx-auto w-full max-w-3xl" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE} className={`mb-10 h-px w-14 ${line}`} />
        <blockquote className={`font-display font-light leading-[1.4] tracking-[-0.022em] ${tP}`}
          style={{ fontSize: "clamp(1.6rem, 3.8vw, 2.8rem)" }}>
          {slide.wordReveal
            ? slide.text.split("\n").map((line, i) => (
                <span key={i} className="block mb-2"><WordReveal text={line} /></span>
              ))
            : <motion.span variants={UP}>
                {slide.text.split("\n").map((line, i) => <span key={i} className="block mb-1">{line}</span>)}
              </motion.span>
          }
        </blockquote>
        {slide.source && (
          <motion.p variants={UP} className={`mt-10 font-mono text-[10px] leading-relaxed ${src}`}>{slide.source}</motion.p>
        )}
      </motion.div>
    </div>
  );
}

function DiagramBody({ slide }: { slide: DiagramSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#F5F3EE] px-8 pb-20 pt-14 md:px-16">
      <motion.div className="mx-auto w-full max-w-4xl" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={UP} className={`mt-4 ${TITLE} text-[#0A0A0A]`}
          style={{ fontSize: "clamp(1.5rem,3.4vw,2.5rem)" }}>
          {slide.title}
        </motion.h2>
        <motion.div variants={UP} className="mt-10 flex flex-col gap-10 md:flex-row md:items-start">
          <div className="flex min-w-0 flex-1 flex-col">
            {slide.nodes.map((node, i) => (
              <div key={node.label}>
                <div className={`rounded-xl border px-5 py-4 ${node.highlight ? "border-[#C8FF47]/50 bg-[#C8FF47]/[0.08]" : "border-black/[0.07] bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 font-mono text-[9px] tabular-nums ${node.highlight ? "text-[#6A8000]" : "text-[#AEAEB2]"}`}>{String(i+1).padStart(2,"0")}</span>
                    <p className={`font-sans text-[13px] font-medium ${node.highlight ? "text-[#2E4200]" : "text-[#0A0A0A]"}`}>{node.label}</p>
                    {node.sub && <p className="ml-auto font-sans text-[11px] text-[#9A9A9A]">{node.sub}</p>}
                  </div>
                </div>
                {i < slide.nodes.length - 1 && (
                  <div className={`my-1 ml-[22px] h-4 w-px ${(i===1||i===2) ? "bg-[#C8FF47]/40" : "bg-black/[0.08]"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-black/[0.07] bg-white px-6 py-7 md:w-60">
            <p className="font-sans text-[13px] italic leading-relaxed text-[#6B6B6B]">{slide.annotation}</p>
            <p className={`mt-5 ${EYE} text-[#AEAEB2]`}>{slide.caption}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CardsBody({ slide }: { slide: CardsSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#F5F3EE] px-8 pb-20 pt-14 md:px-16">
      <motion.div className="mx-auto w-full max-w-5xl" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        {slide.title && (
          <motion.h2 variants={UP} className={`mt-4 ${TITLE} text-[#0A0A0A]`}
            style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>
            {slide.title}
          </motion.h2>
        )}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {slide.cards.map((card, i) => (
            <motion.div key={card.n}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.14 + i * 0.11 }}>
              <TiltCard className="h-full cursor-default rounded-2xl bg-white px-7 py-8 shadow-[0_2px_0_rgba(0,0,0,0.03)] ring-1 ring-black/[0.06]">
                <div className="mb-5 h-[2px] w-7" style={{ background: card.color }} />
                <p className={`${EYE}`} style={{ color: card.color }}>{card.n}</p>
                <p className="mt-4 font-display text-[1.1rem] font-light leading-snug tracking-tight text-[#0A0A0A]">{card.title}</p>
                <p className="mt-3.5 font-sans text-[13.5px] leading-[1.72] text-[#6B6B6B]">{card.body}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function WorkflowBody({ slide }: { slide: WorkflowSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F5F3EE]">
      <motion.div className="flex w-full flex-col md:flex-row" variants={STG} initial="hidden" animate="show">
        <div className="flex flex-col justify-center px-10 py-16 md:w-[38%] md:px-14 lg:px-16 lg:py-20">
          <motion.p variants={FADE} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
          {slide.note && (
            <motion.p variants={UP}
              className="mt-4 border-l-2 border-black/[0.1] pl-4 font-sans text-[12px] italic leading-relaxed text-[#8A8A8A]">
              {slide.note}
            </motion.p>
          )}
          <motion.h2 variants={UP} className={`mt-5 ${TITLE} text-[#0A0A0A]`}
            style={{ fontSize: "clamp(1.35rem,2.8vw,2.2rem)" }}>
            {slide.title}
          </motion.h2>
          <motion.div variants={UP} className="mt-6 space-y-4">
            {slide.body.split("\n\n").map((para, i) => (
              <p key={i} className={`font-sans text-[14px] leading-[1.72] text-[#6B6B6B]`}>{para}</p>
            ))}
          </motion.div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-white/50 p-6 md:p-10">
          <motion.div variants={UP}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_4px_32px_-8px_rgba(0,0,0,0.1)]">
            <img src={slide.workflowSrc} alt={`${slide.title} — LLM workflow`}
              className="h-auto w-full" loading="lazy" decoding="async" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function FeaturesBody({ slide }: { slide: FeaturesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#050507]">
      {slide.mediaSrc && (
        <div className="relative w-full bg-[#0A0A0A]" style={{ maxHeight: "50vh" }}>
          <video key={slide.mediaSrc} className="h-full w-full object-contain" style={{ maxHeight: "50vh" }}
            controls playsInline preload="metadata" muted autoPlay loop>
            <source src={slide.mediaSrc} type="video/mp4" />
          </video>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#050507] to-transparent" />
        </div>
      )}
      <div className="px-8 pb-10 pt-6 md:px-14">
        <motion.div className="mx-auto w-full max-w-5xl" variants={STG} initial="hidden" animate="show">
          <motion.p variants={FADE} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
          {slide.headline && (
            <motion.h2 variants={UP} className="mt-3 font-display font-light tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(1.25rem,2.8vw,2rem)" }}>
              {slide.headline}
            </motion.h2>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[slide.left, slide.right].map((f, i) => (
              <motion.div key={f.n} className="rounded-2xl p-7 md:p-8" style={{ backgroundColor: f.bg, color: f.fg }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: E, delay: 0.14 + i * 0.1 }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-55">{f.n}</p>
                <p className="mt-3 font-display text-[1.25rem] font-light leading-snug tracking-tight md:text-[1.4rem]">{f.title}</p>
                <p className="mt-3 font-sans text-[13px] leading-[1.74] opacity-70">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function OutcomesBody({ slide }: { slide: OutcomesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#050507] px-8 pb-20 pt-14 text-white md:px-16">
      <motion.div className="mx-auto w-full max-w-5xl" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={UP} className={`mt-4 ${TITLE} text-white`}
          style={{ fontSize: "clamp(1.9rem,4vw,3.2rem)" }}>
          {slide.title}
        </motion.h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.05] md:grid-cols-2">
          {slide.metrics.map((m, i) => (
            <motion.div key={m.label} className="bg-[#050507] px-8 py-9"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.55, ease: E, delay: 0.14 + i * 0.1 }}>
              <div className="mb-3 h-[2px] w-8 bg-[#C8FF47]/50" />
              <p className="font-display font-light leading-none text-[#C8FF47]"
                style={{ fontSize: "clamp(2.8rem,5.5vw,4.5rem)" }}>
                <CountUp value={m.n} delay={(0.18 + i * 0.13) * 1000} />
              </p>
              <p className="mt-4 font-sans text-[13px] font-medium text-white">{m.label}</p>
              <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-white/35">{m.detail}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function PrinciplesBody({ slide }: { slide: PrinciplesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center bg-[#050507] px-8 py-20 md:px-16">
      <motion.div className="mx-auto w-full max-w-3xl" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} mb-12 text-white/18`}>Design Principles</motion.p>
        <ol className="space-y-8">
          {slide.items.map((p, i) => (
            <motion.li key={p} className="flex items-start gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: E, delay: 0.1 + i * 0.1 }}>
              <span className="mt-1.5 shrink-0 font-mono text-[10px] tabular-nums text-white/18">{String(i+1).padStart(2,"0")}</span>
              <p className="cursor-default font-display font-light leading-[1.15] tracking-[-0.022em] text-white transition-colors duration-500"
                style={{ fontSize: "clamp(1.4rem,3.2vw,2.3rem)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = PCOLORS[i]; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}>
                {p}
              </p>
            </motion.li>
          ))}
        </ol>
        {slide.closingQuote && (
          <motion.div variants={UP} className="mt-14 border-t border-white/[0.07] pt-10">
            <p className="font-sans text-[14px] italic leading-relaxed text-white/35">&ldquo;{slide.closingQuote}&rdquo;</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ClosingBody({ slide }: { slide: ClosingSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-start justify-center bg-[#F5F3EE] px-8 py-20 md:px-16">
      <motion.div className="mx-auto w-full max-w-2xl" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE} className="mb-8 h-px w-12 bg-[#0A0A0A]" />
        <motion.h2 variants={UPHERO} className={`${TITLE} text-[#0A0A0A]`}
          style={{ fontSize: "clamp(2.4rem,5.5vw,4.2rem)" }}>
          {slide.title}
        </motion.h2>
        <motion.p variants={UP} className={`mt-5 ${EYE} text-[#9A9A9A]`}>Product Designer · UW HCDE · Alibaba Cloud</motion.p>
        <motion.p variants={UP} className={`mt-7 max-w-md ${BODY} text-[#6B6B6B]`}>{slide.body}</motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-col gap-4">
          <a href={slide.href} target="_blank" rel="noopener noreferrer"
            className="group inline-flex w-fit items-center gap-2.5 rounded-full bg-[#0A0A0A] px-6 py-3.5 font-sans text-[13px] font-medium text-white transition-all duration-400 hover:bg-[#C8FF47] hover:text-[#0A0A0A]">
            {slide.cta}
            <span className="inline-block transition-transform duration-400 group-hover:translate-x-0.5">→</span>
          </a>
          <Link href="/work/ai-character"
            className={`${EYE} text-[#9A9A9A] underline underline-offset-4 decoration-black/[0.1] transition-colors hover:text-[#0A0A0A]`}>
            Back to case study
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProtoBody({ slide }: { slide: ProtoSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#F5F3EE]">
      <motion.div className="px-8 pb-4 pt-10 md:px-16" variants={STG} initial="hidden" animate="show">
        <motion.p variants={FADE} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={UP} className={`mt-3 ${TITLE} text-[#0A0A0A]`}
          style={{ fontSize: "clamp(1.5rem,3.2vw,2.5rem)" }}>
          {slide.title}
        </motion.h2>
        <motion.p variants={UP} className={`mt-3 max-w-xl ${BODY} text-[#6B6B6B]`}>{slide.body}</motion.p>
      </motion.div>
      <motion.div className="mx-8 mb-8 flex-1 overflow-hidden rounded-2xl border border-black/[0.07] bg-[#060608] shadow-[0_12px_48px_-12px_rgba(0,0,0,0.14)] md:mx-16"
        style={{ minHeight: "54vh" }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: E, delay: 0.22 }}>
        <iframe title={slide.title} src={slide.protoSrc}
          className="h-full w-full border-0" style={{ minHeight: "54vh" }} loading="lazy" />
      </motion.div>
    </div>
  );
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "cinematic-open":   return <CinematicOpenBody   slide={slide} />;
    case "world-context":    return <WorldContextBody     slide={slide} />;
    case "showrooms-reveal": return <ShowroomsRevealBody  slide={slide} />;
    case "chapter-break":    return <ChapterBreakBody     slide={slide} />;
    case "split":            return <SplitBody            slide={slide} />;
    case "bullets":          return <BulletsBody          slide={slide} />;
    case "quote":            return <QuoteBody            slide={slide} />;
    case "diagram":          return <DiagramBody          slide={slide} />;
    case "cards":            return <CardsBody            slide={slide} />;
    case "workflow":         return <WorkflowBody         slide={slide} />;
    case "features":         return <FeaturesBody         slide={slide} />;
    case "outcomes":         return <OutcomesBody         slide={slide} />;
    case "principles":       return <PrinciplesBody       slide={slide} />;
    case "closing":          return <ClosingBody          slide={slide} />;
    case "proto":            return <ProtoBody            slide={slide} />;
    default:                 return null;
  }
}

// ─── Chapter pill nav ────────────────────────────────────────────────────────
function ChapterPills({ current, dark, onJump }: { current: string; dark: boolean; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-500 ease-out ${
              on
                ? "bg-[#C8FF47] px-3 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-[#0A0A0A]"
                : `h-1.5 w-1.5 ${dark ? "bg-white/16 hover:bg-white/45" : "bg-black/14 hover:bg-black/40"}`
            }`}
            aria-label={`Go to chapter: ${ch}`}>
            {on ? ch : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClient() {
  const [idx,  setIdx]  = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[idx];
  const dark  = isDark(slide);

  // Spring cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const cx = useSpring(mx, { stiffness: 310, damping: 32, mass: 0.4 });
  const cy = useSpring(my, { stiffness: 310, damping: 32, mass: 0.4 });
  const [vis,  setVis]  = useState(false);
  const [zone, setZone] = useState<"default"|"prev"|"next"|"big">("default");

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft",  "PageUp"].includes(e.key))        { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  useEffect(() => {
    const onMove  = (e: MouseEvent) => { setVis(true); mx.set(e.clientX); my.set(e.clientY); };
    const onLeave = () => setVis(false);
    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  const progress  = total > 1 ? (idx / (total - 1)) * 100 : 0;
  const minsLeft  = Math.max(1, Math.ceil(((total - 1 - idx) * 54) / 60));

  const cursorD   = zone !== "default" ? "h-14 w-14" : "h-8 w-8";
  const cursorB   = dark ? "border-white/28" : "border-black/22";

  return (
    <div className="relative min-h-screen cursor-none select-none overflow-x-hidden">

      {/* Custom cursor */}
      {vis && (
        <motion.div aria-hidden className="pointer-events-none fixed z-[9999] hidden md:block"
          style={{ x: cx, y: cy }}>
          <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ${cursorD} ${cursorB}`} />
          <div className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8FF47] transition-all duration-200 ${zone !== "default" ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
          {(zone === "prev" || zone === "next") && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-white/65">
              {zone === "prev" ? "←" : "→"}
            </span>
          )}
        </motion.div>
      )}

      {/* Header */}
      <header className={`fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10 ${
        dark ? "border-white/[0.05] bg-black/22" : "border-black/[0.05] bg-white/50"
      }`}>
        {/* Progress line */}
        <div className="absolute inset-x-0 top-0 h-[1.5px]">
          <motion.div className="h-full bg-[#C8FF47]"
            initial={false} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: E }} />
        </div>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character"
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`${EYE} transition-colors ${dark ? "text-white/38 hover:text-white/75" : "text-[#6B6B6B] hover:text-[#0A0A0A]"}`}>
            ← Case Study
          </Link>
          <span className={`hidden ${EYE} md:inline ${dark ? "text-white/18" : "text-[#AEAEB2]"}`}>
            {slide.chapter} · {slide.section}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className={`hidden font-mono text-[10px] md:inline ${dark ? "text-white/16" : "text-[#AEAEB2]"}`}>
            ~{minsLeft} min left
          </span>
          <span className={`font-mono text-[10px] tabular-nums ${dark ? "text-white/28" : "text-[#AEAEB2]"}`}>
            {String(idx+1).padStart(2,"0")} / {String(total).padStart(2,"0")}
          </span>
        </div>
      </header>

      {/* Slide area */}
      <main className="relative min-h-screen overflow-hidden pt-14">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: E }}>
            <SlideRenderer slide={slide} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Click zones */}
      <button type="button" aria-label="Previous slide" onClick={prev} disabled={idx === 0}
        className="fixed bottom-14 left-0 top-14 z-30 hidden w-[14%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setZone("prev")} onMouseLeave={() => setZone("default")} />
      <button type="button" aria-label="Next slide" onClick={next} disabled={idx === total - 1}
        className="fixed bottom-14 right-0 top-14 z-30 hidden w-[14%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setZone("next")} onMouseLeave={() => setZone("default")} />

      {/* Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-500 ${
        dark ? "border-white/[0.05] bg-black/28 backdrop-blur-md" : "border-black/[0.04] bg-white/70 backdrop-blur-md"
      }`}>
        <div className="flex items-center justify-between px-5 py-3 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 ${
              dark ? "text-white/40 hover:text-white" : "text-[#6B6B6B] hover:text-[#0A0A0A]"
            }`}>
            Prev
          </button>
          <ChapterPills current={slide.chapter} dark={dark} onJump={setIdx} />
          <button type="button" onClick={next} disabled={idx === total - 1}
            onMouseEnter={() => setZone("big")} onMouseLeave={() => setZone("default")}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-20 ${
              dark ? "text-white/40 hover:text-white" : "text-[#6B6B6B] hover:text-[#0A0A0A]"
            }`}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
