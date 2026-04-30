"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const ease    = [0.22, 1, 0.36, 1] as const;
const fadeUp  = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };

type Base = { id: string; chapter: string; section: string };
type OpeningSlide    = Base & { kind: "opening";    title: string; subtitle: string; body: string; mediaSrc?: string; mediaSrcs?: string[] };
type OverviewSlide   = Base & { kind: "overview";   eyebrow: string; title: string; stats: { n: string; label: string; detail: string }[] };
type BulletsSlide    = Base & { kind: "bullets";    headline: string; dark?: boolean; items: { bold: string; italic: string }[] };
type QuoteSlide      = Base & { kind: "quote";      text: string; source?: string; dark: boolean };
type ThesisSlide     = Base & { kind: "thesis";     headline: string; supporting: string; mediaSrc?: string };
type SplitSlide      = Base & { kind: "split";      eyebrow: string; title: string; body: string; dark: boolean; note?: string; mediaSrc?: string; mediaAlt?: string; mediaPalette?: "dark"|"navy"|"forest"|"lime"|"warm"; plugins?: string[]; ratio?: "3:7"|"4:6"|"5:5" };
type CardsSlide      = Base & { kind: "cards";      eyebrow: string; title?: string; cards: { n: string; title: string; body: string; color: string }[] };
type DiagramSlide    = Base & { kind: "diagram";    eyebrow: string; title: string; nodes: { label: string; sub?: string; highlight?: boolean }[]; annotation: string; caption: string };
type TradeoffsSlide  = Base & { kind: "tradeoffs";  eyebrow: string; title: string; items: { constraint: string; rationale: string }[] };
type RoomsSlide      = Base & { kind: "rooms";      eyebrow: string; title: string; dark?: boolean; rooms: { label: string; cap: string; body: string; mediaSrc?: string; color: string }[] };
type FeaturesSlide   = Base & { kind: "features";   eyebrow: string; headline?: string; mediaSrc?: string; left: { n: string; title: string; body: string; bg: string; fg: string }; right: { n: string; title: string; body: string; bg: string; fg: string } };
type ImpactSlide     = Base & { kind: "impact";     eyebrow: string; title: string; qa: { q: string; a: string }[] };
type OutcomesSlide   = Base & { kind: "outcomes";   eyebrow: string; title: string; metrics: { n: string; label: string; detail: string }[] };
type PrinciplesSlide = Base & { kind: "principles"; items: string[]; closingQuote?: string; closingLine?: string };
type ClosingSlide    = Base & { kind: "closing";    title: string; body: string; href: string; cta: string };
type CodesnipSlide   = Base & { kind: "codesnip";   eyebrow: string; title: string; body: string; code: string };
type VideoFullSlide  = Base & { kind: "video-full"; eyebrow?: string; title?: string; caption?: string; mediaSrc: string; dark?: boolean; posterSrc?: string };
type ProtoSlide      = Base & { kind: "proto";      eyebrow: string; title: string; body: string; protoSrc: string };
type WorkflowSlide   = Base & { kind: "workflow";   eyebrow: string; title: string; note?: string; body: string; workflowSrc: string; dark?: boolean };

type Slide =
  | OpeningSlide | OverviewSlide | BulletsSlide | QuoteSlide | ThesisSlide
  | SplitSlide | CardsSlide | DiagramSlide | TradeoffsSlide | RoomsSlide
  | FeaturesSlide | ImpactSlide | OutcomesSlide
  | PrinciplesSlide | ClosingSlide | CodesnipSlide
  | VideoFullSlide | ProtoSlide | WorkflowSlide;

const SLIDES: Slide[] = [
  // ── Ch1: Context ─────────────────────────────────────────────────────────
  {
    id: "opening", chapter: "Context", section: "Hook", kind: "opening",
    title: "The real gap isn't quality — it's immersion.",
    subtitle: "Users churned at the scripted ceiling before they felt what the model could actually do.",
    body: "I tested six competitor products and synthesized 40+ public reviews. The pattern was clear: users did not leave because responses were weak; they left because the interface felt like texting a chatbot. No visible memory, no relationship growth, and no emotional continuity.",
    
    mediaSrcs: [
      
      "/assets/ai-character/competitor-loveydovey-1.png",
      "/assets/ai-character/competitor-loveydovey-2.png",
      "/assets/ai-character/competitor-nyx-chat.png",
    ],
  },
  {
    id: "thesis", chapter: "Context", section: "Thesis", kind: "thesis",
    headline: "Designing the AI that feels alive.\nFrom *model capability* to *emotionally immersive experience.*",
    supporting: "In 4 weeks, I led end-to-end UX for the C2C showroom and turned hidden model capabilities into proof moments users could feel in minutes. After launch, model call volume rose 200%.",
    mediaSrc: "/assets/ai-character/eternal-vow-character.png",
  },

  // ── Ch2: Problem ─────────────────────────────────────────────────────────
  {
    id: "problem", chapter: "Problem", section: "Context", kind: "split", dark: true,
    eyebrow: "Alibaba Cloud · TONGYI Xingchen · July–August 2025",
    title: "High capability.\nLow conversion.\nThe product was invisible.",
    body: "Long-term memory, real-time analysis, and multi-agent interaction were real — but none of it was visible.\n\nTrial users churned before they ever felt the difference. Enterprise prospects had to imagine the value instead of experiencing it.",
    mediaPalette: "dark",
  },
  {
    id: "overview", chapter: "Problem", section: "Scope", kind: "overview",
    eyebrow: "Alibaba Cloud · TONGYI Xingchen · 4 weeks · UX Designer Intern",
    title: "End-to-end UX for the C2C showroom — shipped, converted, and adopted as a reusable B2B framework.",
    stats: [
      { n: "4",   label: "Showrooms Shipped",    detail: "Each mapped 1:1 to a distinct model capability" },
      { n: "200%", label: "Model Call Volume",   detail: "Higher after showrooms went live" },
      { n: "87%", label: "Shorter Trial Path",    detail: "Trial-to-subscribe steps compressed via inline tools" },
      { n: "60%", label: "Faster Design Handoff", detail: "Production motion code delivered directly" },
    ],
  },
  {
    id: "research", chapter: "Problem", section: "Research", kind: "split", dark: true,
    eyebrow: "Research · 6 products · 40+ public reviews",
    title: "The real gap isn't quality.\nIt's immersion.",
    body: "Across six competitor products, users repeatedly hit a scripted ceiling.\n\nThe unmet need was not output quality. It was immersion: the interface still felt like generic chat, so memory and relationship depth never became emotionally legible.",
    mediaSrc: "/assets/ai-character/characterai.png",
    mediaAlt: "Competitor analysis",
    mediaPalette: "dark",
    ratio: "4:6",
  },
  {
    id: "scripted-ceiling", chapter: "Problem", section: "Patterns", kind: "bullets", dark: true,
    headline: "Three failure patterns. One root cause.",
    items: [
      { bold: "Memory resets every session.",         italic: "You are a stranger again each time you open the app." },
      { bold: "Personality is fixed.",                italic: "Characters never grow from knowing you over time." },
      { bold: "The interface is just a chat window.", italic: "Identical to texting Claude or GPT with a persona photo." },
    ],
  },
  {
    id: "insight-quote", chapter: "Problem", section: "Insight", kind: "quote", dark: true,
    text: "Users don't churn because the model is weak.\nThey churn because they never feel exclusively known.",
    source: "Synthesized from 40+ public reviews across 6 products · 2025",
  },

  // ── Ch3: Strategy ────────────────────────────────────────────────────────
  {
    id: "hmw", chapter: "Strategy", section: "Opportunity", kind: "quote", dark: false,
    text: "How might we make model capabilities visible, testable, and trustworthy — within the first three minutes?",
  },
  {
    id: "diagram", chapter: "Strategy", section: "Architecture", kind: "diagram",
    eyebrow: "Under the hood",
    title: "Where the character actually lives",
    nodes: [
      { label: "User input",               sub: "Message, tap, or action" },
      { label: "Short-term context",       sub: "Resets each session" },
      { label: "Long-term memory",         sub: "Persists and grows",        highlight: true },
      { label: "Character behavior layer", sub: "Callbacks · tone · unlocks", highlight: true },
      { label: "Response + UI surface",    sub: "What the user sees" },
    ],
    annotation: "The design challenge lives at the memory layer — making persistence visible and emotionally meaningful, not buried in infrastructure.",
    caption: "What persists vs. resets — and where the AI actually operates.",
  },
  {
    id: "strategy", chapter: "Strategy", section: "Reframe", kind: "split", dark: false,
    eyebrow: "Strategic Reframe",
    title: "From explaining the model to showing their future product.",
    body: "Instead of capability decks, I built market-specific showrooms as live prototypes.\n\nCustomers could test each model strength directly in context, then clone and configure it for deployment.",
    mediaSrc: "/assets/ai-character/newmove.mp4",
    mediaAlt: "Live showroom reel",
    plugins: ["Live Showroom", "One-click Trial", "Clone & Deploy"],
    ratio: "4:6",
  },
  {
    id: "framework", chapter: "Strategy", section: "Framework", kind: "cards",
    eyebrow: "Strategy Framework · Capability → Experience → Deployment",
    cards: [
      { n: "01", title: "Market-back character definition", body: "Companionship, therapy, persona replication, and licensed IP as distinct B2B entry points.", color: "#C8FF47" },
      { n: "02", title: "Capability-to-scenario mapping", body: "Each interaction surfaces one model strength through a direct proof moment.", color: "#7B6CF4" },
      { n: "03", title: "Reusable template for customers", body: "Showrooms were designed to be cloned, configured, and shipped — not one-time pitch artifacts.", color: "#4ABFBF" },
    ],
  },
  {
    id: "ux-strategy", chapter: "Strategy", section: "Showrooms", kind: "rooms",
    eyebrow: "UX Strategy · One Capability = One Proof Moment",
    title: "Four showrooms. Each proving a different model capability.",
    rooms: [
      { label: "Romance", cap: "Long-term memory", body: "Character recalls conversation specifics across sessions", mediaSrc: "/assets/ai-character/new-cover.mp4", color: "#C8FF47" },
      { label: "Astrology", cap: "Real-time memory updates", body: "Live constellation profile updates while chatting", mediaSrc: "/assets/ai-character/taobaibai-1.mp4", color: "#7B6CF4" },
      { label: "Therapy", cap: "Real-time analysis", body: "Visible analysis panel surfaces conversation themes", mediaSrc: "/assets/ai-character/therapy-1.mp4", color: "#4ABFBF" },
      { label: "Multi-Char", cap: "Multi-agent coordination", body: "Multiple characters respond to user and each other in real time", mediaSrc: "/assets/ai-character/pre-1.mp4", color: "#A8C5A0" },
    ],
  },
  {
    id: "tradeoffs", chapter: "Strategy", section: "Decisions", kind: "tradeoffs",
    eyebrow: "Design Decisions · What I chose not to do",
    title: "Intentional constraints — and why they made the product stronger.",
    items: [
      { constraint: "No full autonomy",      rationale: "Unpredictable behavior breaks emotional trust. Constrained personality creates a consistent, reliable presence." },
      { constraint: "No infinite memory",    rationale: "More context ≠ more presence. Selective callbacks at the right moment feel more intimate than exhaustive recall." },
      { constraint: "No purely reactive AI", rationale: "Moments Feed and Alternate Universe Events create off-session presence — the character exists even when you're not chatting." },
    ],
  },

  // ── Ch4: Romance Room ────────────────────────────────────────────────────
  {
    id: "romance-intro", chapter: "Romance Room", section: "Overview", kind: "split", dark: true,
    eyebrow: "Showroom 01 · Romance · Long-term memory",
    title: "Sustain engagement past the 2-week churn wall.",
    body: "Romance is the highest-stakes scenario: the highest user expectations and the shortest patience for generic responses.\n\nThe goal: make users feel uniquely known by a character that actually remembers them.",
    mediaSrc: "/assets/ai-character/new-cover.mp4",
    mediaAlt: "Romance room hero",
    ratio: "4:6",
  },
  {
    id: "romance-hero-video", chapter: "Romance Room", section: "Showcase", kind: "video-full",
    eyebrow: "Romance Room · Full Walkthrough",
    title: "The complete romance experience",
    caption: "Memory callbacks, ambient motion, character presence — the full emotional arc in one session",
    mediaSrc: "/assets/ai-character/heroshowcase.mp4",
    posterSrc: "/assets/ai-character/showcase.jpg",
    dark: true,
  },
  {
    id: "romance-visual", chapter: "Romance Room", section: "Visual Design", kind: "split", dark: false,
    eyebrow: "Design Decision · Visual Language",
    title: "A premium romance-game aesthetic — not a chatbot skin.",
    body: "The visual system draws from Love and Deepspace: dark gold tones, ambient scene motion, background music, and a looping character portrait.\n\nEmotional presence is established before any memory feature appears — because immersion is the prerequisite for trust.",
    mediaSrc: "/assets/ai-character/uivisual.jpg",
    mediaAlt: "Visual language system",
    ratio: "4:6",
  },
  {
    id: "romance-craft", chapter: "Romance Room", section: "Craft", kind: "split", dark: true,
    eyebrow: "Design Decision · Avatar Technology",
    title: "Designing for presence, not performance.",
    note: "The original 3D avatar looked impressive but crashed mid-interaction — a fatal flaw in a romance flow where immersion is everything.",
    body: "I replaced it with an AI-generated looping video: lighter, crash-free, and subtly expressive.\n\nSmall motions — a blink, a nod, a slight smile — felt more alive than complex rigged animation because they read as natural, not mechanical.",
    mediaSrc: "/assets/ai-character/innovation.jpg",
    mediaAlt: "3D to AI video loops",
    ratio: "4:6",
  },
  {
    id: "heartbeat", chapter: "Romance Room", section: "Heartbeat Power", kind: "workflow", dark: false,
    eyebrow: "Interaction 01 · Solves: emotional distance",
    title: "Heartbeat Power: the inner monologue reveal.",
    note: "Balance: too much exposure breaks mystery. Too little loses emotional depth.",
    body: "A tap-to-reveal flip card surfaces the character's inner monologue without collapsing the surface illusion. Users get emotional privilege — a glimpse behind the mask — while the scene stays intact.\n\nI tested tooltip, modal, and inline variants. The flip card was the only one that preserved intimacy and restraint simultaneously.",
    workflowSrc: "/assets/ai-character/interaction/heartbeat_power_workflow.svg",
  },
  {
    id: "heartbeat-proto", chapter: "Romance Room", section: "Prototype", kind: "proto",
    eyebrow: "Live Interactive Prototype · Tap to experience",
    title: "Experience Heartbeat Power directly.",
    body: "Tap the heartbeat icon to reveal Lucien's inner monologue. Interact with the conversation engine to see how memory callbacks surface across turns.",
    protoSrc: "/work/ai-character/prototype?muted=1",
  },
  {
    id: "story-unlock", chapter: "Romance Room", section: "Story Unlock", kind: "workflow", dark: false,
    eyebrow: "Interaction 02 · Solves: scripted ceiling",
    title: "Story Unlock: backstory through conversation depth.",
    note: "Reuse one knowledge base for both progressive backstory and milestone rewards.",
    body: "Backstory milestones unlock as conversation depth accumulates — a single knowledge base revealing progressively across two interaction layers.\n\nThis extends novelty and emotional investment without requiring new content production per user.",
    workflowSrc: "/assets/ai-character/interaction/story_unlock_workflow.svg",
  },
  {
    id: "moments-feed", chapter: "Romance Room", section: "Moments Feed", kind: "workflow", dark: false,
    eyebrow: "Interaction 03 · Solves: off-session absence",
    title: "Moments Feed: the character lives between conversations.",
    note: "The biggest churn moment happened between sessions, not inside them.",
    body: "An Instagram-style feed generates posts from relationship history — the character sharing a memory, a reaction, a moment — keeping emotional presence alive off-session.\n\nThis became a key retention mechanic: it reduced the dead interval between conversations from a break to a continuation.",
    workflowSrc: "/assets/ai-character/interaction/moments_feed_workflow.svg",
  },
  {
    id: "alternate-universe", chapter: "Romance Room", section: "Alternate Universe", kind: "split", dark: true,
    eyebrow: "Interaction 04 · Solves: long-term novelty decay",
    title: "Alternate Universe Events: variable rewards from real shared context.",
    note: "Memory makes the reward feel personal — not randomized.",
    body: "Scenes triggered by personal history recontextualize the relationship from an alternate timeline.\n\nThe surprise is grounded in real shared context — memory callbacks dressed as fiction — which makes each unlock feel earned rather than generated. This is how long-term memory becomes emotionally compelling.",
    mediaSrc: "/assets/ai-character/newworld.mp4",
    mediaAlt: "Alternate Universe Events showcase",
    mediaPalette: "navy",
    ratio: "4:6",
  },
  {
    id: "conv-engine", chapter: "Romance Room", section: "Conversation Engine", kind: "features",
    eyebrow: "Reducing Time-to-Experience · First 3 Minutes",
    headline: "Making the model legible before users know to look for it.",
    mediaSrc: "/assets/ai-character/conversation engine.mp4",
    left:  { n: "Feature 01", title: "Inspiration Response", body: "Three context-grounded reply options with action, emotion, and expression cues — reducing decision friction and keeping narrative momentum without breaking the scene.", bg: "#C8FF47", fg: "#0A0A0A" },
    right: { n: "Feature 02", title: "Continue Response",    body: "One tap extends the active storyline from context — revealing long-context reasoning without requiring the user to prompt for it.", bg: "#1A2744", fg: "#FFFFFF" },
  },

  // ── Ch5: Other Rooms ─────────────────────────────────────────────────────
  {
    id: "astro-intro", chapter: "Astrology Room", section: "Overview", kind: "split", dark: false,
    eyebrow: "Showroom 02 · Astrology · Real-time memory",
    title: "Making memory transparent instead of magical.",
    body: "As users share personal details, a live constellation profile updates in real time.\n\nMemory becomes inspectable — users can see exactly what the system captured and trust it because they watched it happen.",
    mediaSrc: "/assets/ai-character/taobaibai-1.mp4",
    mediaAlt: "Astrology room demo",
    ratio: "4:6",
  },
  {
    id: "astro-decision", chapter: "Astrology Room", section: "Design Decision", kind: "split", dark: false,
    eyebrow: "Design Decision · Live Memory Rail",
    title: "Trust through real-time visibility, not post-session summary.",
    note: "I rejected a post-chat summary approach. Trust requires seeing capture happen in the moment.",
    body: "Each captured insight appears as a live update while the user is still chatting — not after.\n\nThis turns hidden memory logic into visible evidence of attention. The interface says: 'I noticed that. Right now.'",
    mediaSrc: "/assets/ai-character/interaction-astrology-room.png",
    mediaAlt: "Astrology room memory panel",
    plugins: ["Memory Rail", "Live Update", "Trust Signal"],
    ratio: "4:6",
  },
  {
    id: "therapy-intro", chapter: "Therapy Room", section: "Overview", kind: "split", dark: false,
    eyebrow: "Showroom 03 · Therapy · Real-time analysis",
    title: "Trust through visible reasoning, not just visible responses.",
    body: "A live panel of three specialists reacts in parallel to the same conversation.\n\nUsers can inspect what the model understood — emotional lens, cognitive lens, somatic lens — not just what it chose to say.",
    mediaSrc: "/assets/ai-character/therapy-1.mp4",
    mediaAlt: "Therapy room demo",
    ratio: "4:6",
  },
  {
    id: "therapy-decision", chapter: "Therapy Room", section: "Design Decision", kind: "split", dark: false,
    eyebrow: "Design Decision · Three Expert Voices",
    title: "One model. Multiple analytical lenses. Full reasoning on-screen.",
    note: "Risk: multi-response chaos. Solution: clearly differentiated expert roles with spatial separation.",
    body: "Three specialists expose different analytical dimensions side by side.\n\nReasoning stays legible, so trust grows from transparency rather than from blind faith in outputs. The design challenge was making parallel analysis readable at a glance, not overwhelming.",
    mediaSrc: "/assets/ai-character/interaction-therapy-room.png",
    mediaAlt: "Therapy room analysis panel",
    mediaPalette: "warm",
    plugins: ["Parallel Experts", "Live Analysis", "Reasoning View"],
    ratio: "4:6",
  },
  {
    id: "multichar-intro", chapter: "Multi-Character Room", section: "Overview", kind: "split", dark: true,
    eyebrow: "Showroom 04 · Multi-Character · Multi-agent coordination",
    title: "Making agent coordination immediately legible.",
    body: "Multiple agents respond to the user and to each other in real time.\n\nThe core challenge: making multi-agent coordination feel like a scene — not like a group chat gone wrong.",
    mediaSrc: "/assets/ai-character/pre-1.mp4",
    mediaAlt: "Multi-character room demo",
    ratio: "4:6",
  },
  {
    id: "multichar-decision", chapter: "Multi-Character Room", section: "Design Decision", kind: "split", dark: true,
    eyebrow: "Design Decision · Spatial Interface for Agent Logic",
    title: "Who is speaking, and why, readable at a single glance.",
    note: "Turn-based chat looked like group messaging. Spatial layout made agent roles and relationships legible instantly.",
    body: "A portrait rail + single conversation thread makes the 'who-is-speaking' problem trivially readable while preserving the scene layout in a compact display.\n\nUsers direct the scene; agents self-coordinate in real time. The interface communicates orchestration without requiring users to understand it.",
    mediaSrc: "/assets/ai-character/interaction-multi-room.png",
    mediaAlt: "Multi-character coordination layout",
    mediaPalette: "navy",
    plugins: ["Agent Roles", "Scene Control", "Coordination Graph"],
    ratio: "4:6",
  },

  // ── Ch6: Production ──────────────────────────────────────────────────────
  {
    id: "b2b-tools", chapter: "Production", section: "B2B Framework", kind: "split", dark: false,
    eyebrow: "From Experience to Implementation",
    title: "Developer replication tools turned demos into templates.",
    body: "View Source, One-Click Clone, and live config panels let teams inspect prompts and adapt immediately in product.\n\nConversations shifted from 'Can your model do this?' to 'How fast can we ship?'",
    mediaSrc: "/assets/ai-character/developer-tool-source.png",
    mediaAlt: "Developer replication tools",
    plugins: ["View Source", "Clone Template", "Live Config"],
    ratio: "4:6",
  },
  {
    id: "production-handoff", chapter: "Production", section: "Code Handoff", kind: "split", dark: true,
    eyebrow: "Production · Motion Code Handoff",
    title: "60% faster design-to-deploy: I shipped the motion code myself.",
    note: "Standard handoff: annotated Figma → engineer interprets intent → re-implements from scratch. This project: working components delivered directly.",
    body: "For motion-heavy work — flip cards, staggered reveals, ambient loops — I wrote production Framer Motion implementations and handed off working components with exact easing curves and timing.\n\nNo translation layer. No interpretation loss. Engineers received spec files that ran as-is.",
    mediaSrc: "/assets/ai-character/newcursor.mp4",
    mediaAlt: "Motion code handoff demo",
    ratio: "4:6",
  },
  {
    id: "motion-code", chapter: "Production", section: "Motion Spec", kind: "codesnip",
    eyebrow: "Motion Spec · Framer Motion · Shipped to Production",
    title: "Heartbeat flip card — the exact motion specification",
    body: "Handed to engineers verbatim. No interpretation needed.",
    code: `// Shared easing — all interactions use this curve
const ease = [0.22, 1, 0.36, 1];

// Heartbeat flip card
const cardVariants = {
  idle: { rotateY: 0,   scale: 1    },
  tap:  { rotateY: 180, scale: 0.97,
          transition: { duration: 0.48, ease } },
};

// Story Unlock milestone — staggered entrance
const stagger = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// Moments Feed post item
const postItem = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.52, ease } },
};`,
  },

  // ── Ch7: Impact ──────────────────────────────────────────────────────────
  {
    id: "impact", chapter: "Impact", section: "User Behavior", kind: "impact",
    eyebrow: "What changed after it shipped",
    title: "Users stopped treating it like a chat tool and started treating it like a relationship.",
    qa: [
      { q: "What happened to model usage after launch?", a: "Once the showrooms went live, model call volume increased 200% — the experiential demos translated into sustained API and product usage." },
      { q: "Who came back weekly?",          a: "Companionship users returning to an evolving relationship — not a static chatbot with a different skin." },
      { q: "What changed in behavior?",      a: "Users proactively unlocked Story milestones and checked Moments Feed between sessions — signs of investment, not passive consumption." },
      { q: "What drove retention?",          a: "Selective, meaningful memory recall at the right moment — not raw memory volume. Curated callbacks felt more intimate than exhaustive recall." },
      { q: "What changed for B2B clients?",  a: "Conversations shifted from 'Can your model do this?' to 'How fast can we clone and launch our version?'" },
    ],
  },
  {
    id: "outcomes", chapter: "Impact", section: "Outcomes", kind: "outcomes",
    eyebrow: "Outcomes · Shipped in 4 weeks",
    title: "What shipped. What changed.",
    metrics: [
      { n: "4",    label: "Showrooms live",         detail: "Each demonstrating a distinct model capability, clearly and experientially" },
      { n: "200%", label: "Model call volume",      detail: "Increase after showrooms launched" },
      { n: "87%",  label: "Shorter trial path",      detail: "Trial-to-subscribe compressed via one-click clone and live config panels" },
      { n: "60%",  label: "Faster design-to-deploy", detail: "Via production Framer Motion code handoff — no re-implementation needed" },
      { n: "B2B",  label: "Framework adopted",       detail: "Reusable showroom system scaled across enterprise scenarios" },
    ],
  },
  {
    id: "principles", chapter: "Impact", section: "Principles", kind: "principles",
    items: [
      "AI systems need visible cognition, not just outputs",
      "Trust comes from inspectability and feedback loops",
      "Show customers their own use case in motion",
      "Ship experience, not explanation",
    ],
    closingQuote: "Design is the translation layer. The hardest problem in AI products is helping customers imagine what they can build.",
    closingLine: "The strongest demo is future-self proof.",
  },
  {
    id: "closing", chapter: "Impact", section: "End", kind: "closing",
    title: "Yuan Fang",
    body: "AI products need visible cognition — not just strong outputs. Trust comes from inspectability. The fastest path to enterprise adoption is letting clients experience their own future product, already running.",
    href: "https://tongyi.aliyun.com/character",
    cta: "View the live showrooms",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isDark(slide: Slide): boolean {
  if (["opening","thesis","features","outcomes","principles","codesnip"].includes(slide.kind)) return true;
  if (slide.kind === "bullets")    return !!(slide as BulletsSlide).dark;
  if (slide.kind === "split" || slide.kind === "quote") return (slide as SplitSlide | QuoteSlide).dark;
  if (slide.kind === "rooms")      return !!(slide as RoomsSlide).dark;
  if (slide.kind === "video-full") return (slide as VideoFullSlide).dark !== false;
  if (slide.kind === "proto")      return false;
  if (slide.kind === "workflow")   return !!(slide as WorkflowSlide).dark;
  return false;
}

function MediaZone({ src, alt, palette = "dark", className = "", contain = false }: {
  src?: string; alt?: string; palette?: "dark"|"navy"|"forest"|"lime"|"warm"; className?: string; contain?: boolean;
}) {
  const bg: Record<string, string> = {
    dark: "bg-[#0A0A0A]", navy: "bg-[#1A2744]", forest: "bg-[#1B2B1B]", lime: "bg-[#0A0A0A]", warm: "bg-[#EDE9E0]",
  };
  if (!src) return (
    <div className={`relative overflow-hidden ${bg[palette] ?? bg.dark} ${className}`}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      {alt && <p className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.22em] opacity-25">{alt}</p>}
    </div>
  );
  const isVideo = src.endsWith(".mp4") || src.endsWith(".mov");
  if (isVideo) return (
    <div className={`relative overflow-hidden ${bg[palette] ?? bg.dark} ${className}`}>
      <video
        key={src}
        className={`h-full w-full ${contain ? "object-contain" : "object-contain"}`}
        controls
        playsInline
        preload="metadata"
        muted
        autoPlay
        loop
      >
        <source src={src} type={src.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
      </video>
    </div>
  );
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt ?? ""} className="h-full w-full object-contain" loading="lazy" />
    </div>
  );
}

const SHELL     = "flex min-h-[calc(100vh-3.5rem)] flex-col px-8 pb-28 pt-14 md:px-16 md:pt-16";
const SHELL_CTR = "mx-auto w-full max-w-5xl";
const EYE       = "font-mono text-[10px] uppercase tracking-[0.22em]";
const TITLE_LG  = "font-display font-light leading-[1.08] tracking-[-0.025em]";
const BODY_P    = "font-sans text-[15px] leading-[1.72]";

function PluginPills({ items, dark }: { items: string[]; dark: boolean }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span key={item}
          className={`inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
            dark ? "border-white/20 bg-white/[0.04] text-white/75" : "border-black/[0.12] bg-black/[0.02] text-[#6B6B6B]"
          }`}>
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Slide Components ─────────────────────────────────────────────────────────

function OpeningBody({ slide }: { slide: OpeningSlide }) {
  const competitorShots = slide.mediaSrcs?.length ? slide.mediaSrcs : slide.mediaSrc ? [slide.mediaSrc] : [];
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0A0A0A] text-white">
      <motion.div className="relative z-10 flex flex-col justify-center px-8 py-20 md:w-[44%] md:px-16" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#C8FF47]`}>Context · Hook</motion.p>
        <motion.h1 variants={fadeUp} className="mt-5 font-display font-semibold leading-[1.06] tracking-[-0.02em] text-white" style={{ fontSize: "clamp(2rem,5.5vw,4rem)" }}>
          {slide.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 font-sans text-[16px] italic leading-relaxed text-white/55">{slide.subtitle}</motion.p>
        <motion.p variants={fadeUp} className={`mt-6 max-w-lg ${BODY_P} text-white/45`}>{slide.body}</motion.p>
      </motion.div>
      <div className="absolute right-0 top-0 hidden h-full w-[58%] md:block">
        <div className="absolute inset-0 bg-[#0A0A0A]">
          {competitorShots.length > 0 ? (
            <div className="grid h-full w-full grid-cols-4 gap-3 p-4">
              {competitorShots.slice(0, 4).map((src, idx) => (
                <div key={src} className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#121212]">
                  <img
                    src={src}
                    alt={`Competitor screenshot ${idx + 1}`}
                    className="h-full w-full object-contain opacity-90"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
      </div>
    </div>
  );
}

function OverviewBody({ slide }: { slide: OverviewSlide }) {
  const accents = ["#C8FF47", "#7B6CF4", "#4ABFBF"];
  return (
    <div className={`${SHELL} bg-[#F5F3EF]`}>
      <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>{slide.title}</motion.h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {slide.stats.map((s, i) => (
            <motion.div key={s.label} className="bg-white px-8 py-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}>
              <div className="mb-4 h-[2px] w-8" style={{ background: accents[i % accents.length] }} />
              <p className="font-display font-light leading-none text-[#0F0F0F]" style={{ fontSize: "clamp(2.4rem,6vw,4rem)" }}>{s.n}</p>
              <p className="mt-3 font-sans text-[13px] font-medium text-[#0F0F0F]">{s.label}</p>
              <p className="mt-1 font-sans text-[12px] leading-relaxed text-[#8A8A8A]">{s.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.dl variants={fadeUp} className="mt-10 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-black/[0.06] pt-8 md:grid-cols-3">
          {[
            { label: "Company",  value: "Alibaba Cloud" },
            { label: "Role",     value: "UX Designer (Intern)" },
            { label: "Team",     value: "1 supervisor · 2 UX · 2 PM · 4 Engineers" },
          ].map(f => (
            <div key={f.label}>
              <dt className={`${EYE} text-[#AEAEB2]`}>{f.label}</dt>
              <dd className="mt-1.5 font-sans text-[13px] text-[#0F0F0F]">{f.value}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </div>
  );
}

function BulletsBody({ slide }: { slide: BulletsSlide }) {
  const bg      = slide.dark ? "bg-[#0A0A0A]"  : "bg-[#F5F3EF]";
  const headCol = slide.dark ? "text-white"     : "text-[#0F0F0F]";
  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] flex-col justify-center ${bg} px-8 py-20 md:px-16`}>
      <motion.div className="mx-auto w-full max-w-3xl" variants={stagger} initial="hidden" animate="show">
        <motion.h2 variants={fadeUp} className={`font-display font-semibold leading-[1.08] tracking-[-0.02em] ${headCol}`} style={{ fontSize: "clamp(1.8rem,4.5vw,3.2rem)" }}>
          {slide.headline}
        </motion.h2>
        <div className={`mt-10 divide-y ${slide.dark ? "divide-white/[0.07]" : "divide-black/[0.06]"}`}>
          {slide.items.map((item, i) => (
            <motion.div key={i} className="py-7" variants={fadeUp}>
              <p className={`font-sans text-[17px] leading-relaxed ${headCol}`}>
                <span className="font-semibold">{item.bold}</span>{" "}
                <span className={slide.dark ? "italic text-white/50" : "italic text-[#6B6B6B]"}>{item.italic}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function QuoteBody({ slide }: { slide: QuoteSlide }) {
  const bg        = slide.dark ? "bg-[#0A0A0A]" : "bg-[#F5F3EF]";
  const textColor = slide.dark ? "text-white"    : "text-[#0F0F0F]";
  const lineColor = slide.dark ? "bg-[#C8FF47]"  : "bg-[#0F0F0F]";
  const srcColor  = slide.dark ? "text-white/30" : "text-[#AEAEB2]";
  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] flex-col items-start justify-center ${bg} px-8 py-20 md:px-16`}>
      <motion.div className="mx-auto w-full max-w-3xl" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className={`mb-10 h-px w-10 ${lineColor}`} />
        <motion.blockquote variants={fadeUp} className={`font-display font-light leading-[1.38] tracking-[-0.02em] ${textColor}`} style={{ fontSize: "clamp(1.5rem,3.8vw,2.6rem)" }}>
          {slide.text.split("\n").map((line, i) => <span key={i} className="block">{line}</span>)}
        </motion.blockquote>
        {slide.source && (
          <motion.p variants={fadeUp} className={`mt-8 font-mono text-[10px] leading-relaxed ${srcColor}`}>{slide.source}</motion.p>
        )}
      </motion.div>
    </div>
  );
}

function ThesisBody({ slide }: { slide: ThesisSlide }) {
  const lines = slide.headline.split("\n");
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden bg-[#060606] px-8 py-20 md:px-16">
      {slide.mediaSrc && (
        <img src={slide.mediaSrc} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-[0.1] grayscale" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/90 via-[#060606]/50 to-[#060606]/80" />
      <motion.div className="relative z-10 mx-auto w-full max-w-3xl" variants={stagger} initial="hidden" animate="show">
        <motion.h2 variants={fadeUp} className="font-display font-medium leading-[1.1] tracking-[-0.025em] text-white" style={{ fontSize: "clamp(1.9rem,4.5vw,3.5rem)" }}>
          {lines.map((ln, i) => {
            const parts = ln.split(/\*(.*?)\*/g);
            return (
              <span key={i} className="block">
                {parts.map((p, j) =>
                  j % 2 === 1 ? <em key={j} className="not-italic text-[#C8FF47]">{p}</em> : <span key={j}>{p}</span>
                )}
              </span>
            );
          })}
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-8 max-w-lg font-sans text-[14px] leading-relaxed text-white/45">{slide.supporting}</motion.p>
      </motion.div>
    </div>
  );
}

function SplitBody({ slide }: { slide: SplitSlide }) {
  const bg      = slide.dark ? "bg-[#0A0A0A]"  : "bg-[#F5F3EF]";
  const textP   = slide.dark ? "text-white"     : "text-[#0F0F0F]";
  const textS   = slide.dark ? "text-white/50"  : "text-[#6B6B6B]";
  const eyeCol  = slide.dark ? "text-[#C8FF47]" : "text-[#9A9A9A]";
  const noteCol = slide.dark ? "text-white/35"  : "text-[#8A8A8A]";
  const lines   = slide.title.split("\n");

  const textW  = slide.ratio === "3:7" ? "md:w-[30%]" : slide.ratio === "4:6" ? "md:w-[40%]" : "md:w-1/2";
  const mediaW = slide.ratio === "3:7" ? "md:w-[70%]" : slide.ratio === "4:6" ? "md:w-[60%]" : "md:w-1/2";

  const mediaBg: Record<string, string> = {
    dark: "bg-[#0A0A0A]", navy: "bg-[#1A2744]", forest: "bg-[#1B2B1B]", lime: "bg-[#0A0A0A]", warm: "bg-[#EDE9E0]",
  };
  const palette = slide.mediaPalette ?? (slide.dark ? "dark" : "warm");

  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] overflow-hidden ${bg}`}>
      <motion.div className={`relative z-10 flex flex-col justify-center px-8 py-20 ${textW} md:px-12`} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} ${eyeCol}`}>{slide.eyebrow}</motion.p>
        {slide.note && (
          <motion.p variants={fadeUp} className={`mt-4 border-l-2 border-current/20 pl-4 font-sans text-[12px] italic leading-relaxed ${noteCol}`}>{slide.note}</motion.p>
        )}
        <motion.h2 variants={fadeUp} className={`mt-5 ${TITLE_LG} ${textP}`} style={{ fontSize: "clamp(1.35rem,3vw,2.4rem)" }}>
          {lines.map((ln, i) => <span key={i} className="block">{ln}</span>)}
        </motion.h2>
        <motion.div variants={fadeUp} className="mt-7 space-y-4">
          {slide.body.split("\n\n").map((para, i) => (
            <p key={i} className={`${BODY_P} ${textS}`}>{para}</p>
          ))}
        </motion.div>
        {slide.plugins?.length ? <PluginPills items={slide.plugins} dark={slide.dark} /> : null}
      </motion.div>
      <div className={`hidden ${mediaW} relative overflow-hidden md:block`}>
        {slide.mediaSrc ? (
          (() => {
            const isVideo = slide.mediaSrc.endsWith(".mp4") || slide.mediaSrc.endsWith(".mov");
            return (
              <div className={`absolute inset-0 ${mediaBg[palette] ?? mediaBg.dark} flex items-center justify-center`}>
                {isVideo ? (
                  <video key={slide.mediaSrc} className="h-full w-full object-contain" playsInline preload="metadata" muted autoPlay loop>
                    <source src={slide.mediaSrc} type={slide.mediaSrc.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
                  </video>
                ) : (
                  <img src={slide.mediaSrc} alt={slide.mediaAlt ?? ""} className="h-full w-full object-contain" loading="lazy" />
                )}
              </div>
            );
          })()
        ) : (
          <div className={`absolute inset-0 ${mediaBg[palette] ?? mediaBg.dark}`}>
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function CardsBody({ slide }: { slide: CardsSlide }) {
  return (
    <div className={`${SHELL} bg-[#F5F3EF]`}>
      <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        {slide.title && <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>{slide.title}</motion.h2>}
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.08] md:grid-cols-3">
          {slide.cards.map((card, i) => (
            <motion.div key={card.n} className="bg-white px-7 py-8 transition-colors duration-300 hover:bg-[#FAFAF8]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.09 }}>
              <div className="mb-5 h-[2px] w-6" style={{ background: card.color }} />
              <p className={`${EYE}`} style={{ color: card.color }}>{card.n}</p>
              <p className="mt-4 font-display text-[1.1rem] font-light leading-snug tracking-tight text-[#0F0F0F]">{card.title}</p>
              <p className="mt-3 font-sans text-[13px] leading-[1.72] text-[#6B6B6B]">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DiagramBody({ slide }: { slide: DiagramSlide }) {
  return (
    <div className={`${SHELL} bg-[#F5F3EF]`}>
      <motion.div className="mx-auto w-full max-w-4xl" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>{slide.title}</motion.h2>
        <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="flex min-w-0 flex-1 flex-col">
            {slide.nodes.map((node, i) => (
              <div key={node.label}>
                <div className={`rounded-lg border px-5 py-3.5 ${node.highlight ? "border-[#C8FF47]/60 bg-[#C8FF47]/[0.08]" : "border-black/[0.08] bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`shrink-0 font-mono text-[9px] tabular-nums ${node.highlight ? "text-[#7A9900]" : "text-[#AEAEB2]"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <p className={`font-sans text-[13px] font-medium ${node.highlight ? "text-[#344A00]" : "text-[#0F0F0F]"}`}>{node.label}</p>
                    {node.sub && <p className="ml-auto font-sans text-[11px] text-[#9A9A9A]">{node.sub}</p>}
                  </div>
                </div>
                {i < slide.nodes.length - 1 && (
                  <div className={`my-1 ml-[22px] h-4 w-px ${i === 1 || i === 2 ? "bg-[#C8FF47]/40" : "bg-black/[0.1]"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-black/[0.08] bg-white px-6 py-6 md:w-60">
            <p className="font-sans text-[13px] italic leading-relaxed text-[#6B6B6B]">{slide.annotation}</p>
            <p className={`mt-5 ${EYE} text-[#AEAEB2]`}>{slide.caption}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function TradeoffsBody({ slide }: { slide: TradeoffsSlide }) {
  return (
    <div className={`${SHELL} bg-[#F5F3EF]`}>
      <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>{slide.title}</motion.h2>
        <div className="mt-10 divide-y divide-black/[0.06]">
          {slide.items.map((item, i) => (
            <motion.div key={i} className="py-7" variants={fadeUp}>
              <div className="flex items-baseline gap-4">
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#AEAEB2]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-sans text-[16px] font-semibold text-[#0F0F0F]">
                    {item.constraint}
                    <span className="ml-3 font-sans text-[13px] font-normal italic text-[#6B6B6B]">— {item.rationale}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function RoomsBody({ slide }: { slide: RoomsSlide }) {
  const bg     = slide.dark ? "bg-[#0A0A0A]"  : "bg-[#F5F3EF]";
  const textP  = slide.dark ? "text-white"     : "text-[#0F0F0F]";
  const textS  = slide.dark ? "text-white/50"  : "text-[#6B6B6B]";
  const eyeCol = slide.dark ? "text-[#C8FF47]" : "text-[#9A9A9A]";
  const n      = slide.rooms.length;
  const grid   = n === 4 ? "grid gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.08] md:grid-cols-2" : "grid gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.08] md:grid-cols-3";
  return (
    <div className={`${SHELL} ${bg}`}>
      <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} ${eyeCol}`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} ${textP}`} style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>{slide.title}</motion.h2>
        <div className={`mt-10 ${grid}`}>
          {slide.rooms.map((room, i) => (
            <motion.div key={room.label} className={`${slide.dark ? "bg-[#111111]" : "bg-white"} overflow-hidden`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}>
              <div className={`relative overflow-hidden bg-[#0A0A0A] ${n === 4 ? "h-48 md:h-56" : "h-40"}`}>
                {room.mediaSrc ? (
                  <video key={room.mediaSrc} className="h-full w-full object-contain" playsInline preload="none" muted autoPlay loop>
                    <source src={room.mediaSrc} type="video/mp4" />
                  </video>
                ) : (
                  <div className="h-full w-full" style={{ background: room.color + "1A" }}>
                    <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
                  </div>
                )}
                <div className="absolute bottom-3 left-4">
                  <span className="rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ background: room.color, color: room.color === "#C8FF47" || room.color === "#A8C5A0" ? "#0A0A0A" : "#FFF" }}>
                    {room.label}
                  </span>
                </div>
              </div>
              <div className="px-5 pb-6 pt-4">
                <p className={`font-sans text-[13px] font-medium leading-snug ${textP}`}>{room.cap}</p>
                <p className={`mt-1.5 font-sans text-[12px] leading-relaxed ${textS}`}>{room.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function FeaturesBody({ slide }: { slide: FeaturesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#0A0A0A]">
      {slide.mediaSrc && (
        <div className="relative w-full flex-1 bg-[#0A0A0A]" style={{ minHeight: "45vh", maxHeight: "55vh" }}>
          <video
            key={slide.mediaSrc}
            className="h-full w-full object-contain"
            style={{ maxHeight: "55vh" }}
            controls
            playsInline
            preload="metadata"
            muted
            autoPlay
            loop
          >
            <source src={slide.mediaSrc} type="video/mp4" />
          </video>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>
      )}
      <div className="px-6 pb-10 pt-6 md:px-12">
        <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
          {slide.headline && (
            <motion.h2 variants={fadeUp} className="mt-3 font-display font-light tracking-[-0.02em] text-white" style={{ fontSize: "clamp(1.2rem,2.8vw,1.9rem)" }}>{slide.headline}</motion.h2>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[slide.left, slide.right].map((f, i) => (
              <motion.div key={f.n} className="rounded-xl p-7 md:p-8" style={{ backgroundColor: f.bg, color: f.fg }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.1 }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{f.n}</p>
                <p className="mt-3 font-display text-[1.25rem] font-light leading-snug tracking-tight md:text-[1.4rem]">{f.title}</p>
                <p className="mt-3 font-sans text-[13px] leading-[1.75] opacity-75">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ImpactBody({ slide }: { slide: ImpactSlide }) {
  return (
    <div className={`${SHELL} bg-[#F5F3EF]`}>
      <motion.div className="mx-auto w-full max-w-4xl" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.5rem,3.4vw,2.4rem)" }}>{slide.title}</motion.h2>
        <div className="mt-10 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.08] bg-white">
          {slide.qa.map((item, i) => (
            <motion.div key={i} className="px-7 py-6" variants={fadeUp}>
              <p className="font-sans text-[13px] font-semibold text-[#0F0F0F]">{item.q}</p>
              <p className={`mt-2 ${BODY_P} text-[14px] text-[#6B6B6B]`}>{item.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function OutcomesBody({ slide }: { slide: OutcomesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#0A0A0A] px-8 pb-28 pt-14 text-white md:px-16 md:pt-16">
      <motion.div className={SHELL_CTR} variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-4 ${TITLE_LG} text-white`} style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>{slide.title}</motion.h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
          {slide.metrics.map((m, i) => (
            <motion.div key={m.label} className="bg-[#0A0A0A] px-8 py-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.12 + i * 0.09 }}>
              <div className="mb-3 h-[2px] w-8 bg-[#C8FF47]/60" />
              <p className="font-display font-light leading-none text-[#C8FF47]" style={{ fontSize: "clamp(2.5rem,5.5vw,4rem)" }}>{m.n}</p>
              <p className="mt-3 font-sans text-[13px] font-medium text-white">{m.label}</p>
              <p className="mt-1 font-sans text-[12px] leading-relaxed text-white/40">{m.detail}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const principleColors = ["#C8FF47", "#7B6CF4", "#4ABFBF", "#A8C5A0"];

function PrinciplesBody({ slide }: { slide: PrinciplesSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center bg-[#0A0A0A] px-8 py-20 md:px-16">
      <motion.div className="mx-auto w-full max-w-3xl" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} mb-10 text-white/30`}>Design Principles</motion.p>
        <ol className="space-y-7">
          {slide.items.map((p, i) => (
            <motion.li key={p} className="flex items-start gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.1 }}>
              <span className="mt-1.5 shrink-0 font-mono text-[10px] tabular-nums text-white/20">{String(i + 1).padStart(2, "0")}</span>
              <p className="font-display font-light leading-[1.15] tracking-[-0.02em] text-white transition-colors duration-300"
                style={{ fontSize: "clamp(1.35rem,3.2vw,2.2rem)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = principleColors[i]; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}>
                {p}
              </p>
            </motion.li>
          ))}
        </ol>
        {(slide.closingQuote || slide.closingLine) && (
          <motion.div variants={fadeUp} className="mt-14 border-t border-white/[0.08] pt-10">
            {slide.closingQuote && <p className="font-sans text-[14px] italic leading-relaxed text-white/45">&ldquo;{slide.closingQuote}&rdquo;</p>}
            {slide.closingLine  && <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">{slide.closingLine}</p>}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function ClosingBody({ slide }: { slide: ClosingSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-start justify-center bg-[#F5F3EF] px-8 py-20 md:px-16">
      <motion.div className="mx-auto w-full max-w-2xl" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="mb-8 h-px w-10 bg-[#0F0F0F]" />
        <motion.h2 variants={fadeUp} className={`font-display font-light tracking-[-0.025em] text-[#0F0F0F]`} style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>{slide.title}</motion.h2>
        <motion.p variants={fadeUp} className={`mt-5 ${EYE} text-[#9A9A9A]`}>Product Designer · UW HCDE · Alibaba Cloud</motion.p>
        <motion.p variants={fadeUp} className={`mt-7 max-w-md ${BODY_P} text-[#6B6B6B]`}>{slide.body}</motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4">
          <a href={slide.href} target="_blank" rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0F0F0F] px-6 py-3 font-sans text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#C8FF47] hover:text-[#0A0A0A]">
            {slide.cta}
          </a>
          <Link href="/work/ai-character" className={`${EYE} text-[#9A9A9A] underline underline-offset-4 decoration-black/[0.12] transition-colors hover:text-[#0F0F0F]`}>
            Back to case study
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function CodesnipBody({ slide }: { slide: CodesnipSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#070A0F] px-8 pb-28 pt-14 md:px-16 md:pt-16">
      <motion.div className="mx-auto w-full max-w-3xl" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className="mt-4 font-display font-light tracking-[-0.02em] text-white" style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}>{slide.title}</motion.h2>
        <motion.p variants={fadeUp} className="mt-2 font-sans text-[13px] text-white/40">{slide.body}</motion.p>
        <motion.div variants={fadeUp} className="mt-8 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0D1117]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
            <div className="h-2 w-2 rounded-full bg-white/10" />
            <div className="h-2 w-2 rounded-full bg-white/10" />
            <div className="h-2 w-2 rounded-full bg-white/10" />
            <span className="ml-3 font-mono text-[9px] tracking-[0.15em] text-white/20">framer-motion · TypeScript · production</span>
          </div>
          <pre className="overflow-x-auto px-6 py-6 font-mono text-[12.5px] leading-[1.9] text-[#E2E8F0]">
            <code>{slide.code}</code>
          </pre>
        </motion.div>
      </motion.div>
    </div>
  );
}

function VideoFullBody({ slide }: { slide: VideoFullSlide }) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[#060606]">
      <div className="absolute inset-0">
        <video
          key={slide.mediaSrc}
          className="h-full w-full object-contain"
          playsInline
          preload="metadata"
          muted
          autoPlay
          loop
          poster={slide.posterSrc}
        >
          <source src={slide.mediaSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/80 via-transparent to-[#060606]/30" />
      </div>
      <motion.div
        className="relative z-10 mt-auto px-8 pb-14 pt-8 md:px-16"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {slide.eyebrow && (
          <motion.p variants={fadeUp} className={`${EYE} text-[#C8FF47]`}>{slide.eyebrow}</motion.p>
        )}
        {slide.title && (
          <motion.h2 variants={fadeUp} className="mt-3 font-display font-light tracking-[-0.025em] text-white" style={{ fontSize: "clamp(1.6rem,3.5vw,2.8rem)" }}>
            {slide.title}
          </motion.h2>
        )}
        {slide.caption && (
          <motion.p variants={fadeUp} className="mt-3 max-w-lg font-sans text-[13px] leading-relaxed text-white/45">
            {slide.caption}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function ProtoBody({ slide }: { slide: ProtoSlide }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-[#F5F3EF]">
      <motion.div className="px-8 pb-5 pt-8 md:px-16" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={fadeUp} className={`${EYE} text-[#9A9A9A]`}>{slide.eyebrow}</motion.p>
        <motion.h2 variants={fadeUp} className={`mt-3 ${TITLE_LG} text-[#0F0F0F]`} style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)" }}>{slide.title}</motion.h2>
        <motion.p variants={fadeUp} className={`mt-3 max-w-2xl ${BODY_P} text-[#6B6B6B]`}>{slide.body}</motion.p>
      </motion.div>
      <motion.div
        className="mx-8 mb-8 flex-1 overflow-hidden rounded-2xl border border-black/[0.07] bg-[#060608] shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)] md:mx-16"
        style={{ minHeight: "52vh" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.18 }}
      >
        <iframe
          title={slide.title}
          src={slide.protoSrc}
          className="h-full w-full border-0"
          style={{ minHeight: "52vh" }}
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}

function WorkflowBody({ slide }: { slide: WorkflowSlide }) {
  const bg      = slide.dark ? "bg-[#0A0A0A]"  : "bg-[#F5F3EF]";
  const textP   = slide.dark ? "text-white"     : "text-[#0F0F0F]";
  const textS   = slide.dark ? "text-white/55"  : "text-[#6B6B6B]";
  const eyeCol  = slide.dark ? "text-[#C8FF47]" : "text-[#9A9A9A]";
  const noteCol = slide.dark ? "text-white/35"  : "text-[#8A8A8A]";
  return (
    <div className={`flex min-h-[calc(100vh-3.5rem)] overflow-hidden ${bg}`}>
      <motion.div className="relative z-10 flex w-full flex-col md:flex-row" variants={stagger} initial="hidden" animate="show">
        {/* Left: text column */}
        <div className="flex flex-col justify-center px-8 py-14 md:w-[36%] md:px-12 md:py-20">
          <motion.p variants={fadeUp} className={`${EYE} ${eyeCol}`}>{slide.eyebrow}</motion.p>
          {slide.note && (
            <motion.p variants={fadeUp} className={`mt-4 border-l-2 border-current/20 pl-4 font-sans text-[12px] italic leading-relaxed ${noteCol}`}>{slide.note}</motion.p>
          )}
          <motion.h2 variants={fadeUp} className={`mt-5 font-display font-light leading-[1.1] tracking-[-0.025em] ${textP}`} style={{ fontSize: "clamp(1.3rem,2.8vw,2.2rem)" }}>
            {slide.title}
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-6 space-y-4">
            {slide.body.split("\n\n").map((para, i) => (
              <p key={i} className={`font-sans text-[14px] leading-[1.72] ${textS}`}>{para}</p>
            ))}
          </motion.div>
        </div>
        {/* Right: workflow SVG — full height, contained */}
        <div className={`flex flex-1 items-center justify-center p-6 md:p-10 ${slide.dark ? "bg-[#0D0D0D]" : "bg-white/60"}`}>
          <motion.div
            variants={fadeUp}
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_2px_24px_-8px_rgba(0,0,0,0.08)]"
          >
            <img
              src={slide.workflowSrc}
              alt={`${slide.title} — workflow`}
              className="h-auto w-full"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function SlideRenderer({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "opening":    return <OpeningBody    slide={slide} />;
    case "overview":   return <OverviewBody   slide={slide} />;
    case "bullets":    return <BulletsBody    slide={slide} />;
    case "quote":      return <QuoteBody      slide={slide} />;
    case "thesis":     return <ThesisBody     slide={slide} />;
    case "split":      return <SplitBody      slide={slide} />;
    case "cards":      return <CardsBody      slide={slide} />;
    case "diagram":    return <DiagramBody    slide={slide} />;
    case "tradeoffs":  return <TradeoffsBody  slide={slide} />;
    case "rooms":      return <RoomsBody      slide={slide} />;
    case "features":   return <FeaturesBody   slide={slide} />;
    case "impact":     return <ImpactBody     slide={slide} />;
    case "outcomes":   return <OutcomesBody   slide={slide} />;
    case "principles": return <PrinciplesBody slide={slide} />;
    case "closing":    return <ClosingBody    slide={slide} />;
    case "codesnip":   return <CodesnipBody   slide={slide} />;
    case "video-full": return <VideoFullBody  slide={slide} />;
    case "proto":      return <ProtoBody      slide={slide} />;
    case "workflow":   return <WorkflowBody   slide={slide} />;
    default:           return null;
  }
}

export default function DeckClient() {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;
  const slide = SLIDES[index];
  const dark  = isDark(slide);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const cx = useSpring(mx, { stiffness: 280, damping: 28, mass: 0.5 });
  const cy = useSpring(my, { stiffness: 280, damping: 28, mass: 0.5 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorBig,     setCursorBig]     = useState(false);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(total - 1, i + 1)), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft", "PageUp"].includes(e.key))         { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const onMove  = (e: MouseEvent) => { setCursorVisible(true); mx.set(e.clientX); my.set(e.clientY); };
    const onLeave = () => setCursorVisible(false);
    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  const progress    = total > 1 ? (index / (total - 1)) * 100 : 0;
  const minutesLeft = Math.ceil(((total - 1 - index) * 62) / 60);

  return (
    <div className="relative min-h-screen cursor-none select-none overflow-x-hidden">

      {cursorVisible && (
        <motion.div aria-hidden className="pointer-events-none fixed z-[9999] hidden md:block" style={{ x: cx, y: cy }}>
          <div className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150 ${cursorBig ? "h-11 w-11" : "h-7 w-7"} ${dark ? "border-white/40" : "border-black/30"}`} />
          <div className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C8FF47] transition-all duration-150 ${cursorBig ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
        </motion.div>
      )}

      <header className={`fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10 ${dark ? "border-white/[0.06] bg-black/30" : "border-black/[0.06] bg-white/60"}`}>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character" onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className={`${EYE} transition-colors ${dark ? "text-white/50 hover:text-white" : "text-[#6B6B6B] hover:text-[#0F0F0F]"}`}>
            Back
          </Link>
          <span className={`hidden ${EYE} md:inline ${dark ? "text-white/25" : "text-[#AEAEB2]"}`}>
            {slide.chapter} · {slide.section}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className={`hidden font-mono text-[10px] md:inline ${dark ? "text-white/20" : "text-[#AEAEB2]"}`}>~{minutesLeft} min left</span>
          <span className={`font-mono text-[10px] tabular-nums ${dark ? "text-white/35" : "text-[#AEAEB2]"}`}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      <main className="relative min-h-screen overflow-hidden pt-14">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease }}>
            <SlideRenderer slide={slide} />
          </motion.div>
        </AnimatePresence>
      </main>

      <button type="button" aria-label="Previous slide" onClick={prev} disabled={index === 0}
        className="fixed bottom-14 left-0 top-14 z-30 hidden w-[13%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)} />
      <button type="button" aria-label="Next slide" onClick={next} disabled={index === total - 1}
        className="fixed bottom-14 right-0 top-14 z-30 hidden w-[13%] disabled:pointer-events-none md:block"
        onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)} />

      <footer className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-500 ${dark ? "border-white/[0.06] bg-black/35 backdrop-blur-md" : "border-black/[0.05] bg-white/80 backdrop-blur-md"}`}>
        <div className={`h-[2px] w-full ${dark ? "bg-white/[0.07]" : "bg-black/[0.05]"}`}>
          <motion.div className="h-full bg-[#C8FF47]" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.35, ease }} />
        </div>
        <div className="flex items-center justify-between px-6 py-3 md:px-10">
          <button type="button" onClick={prev} disabled={index === 0}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors disabled:opacity-25 ${dark ? "text-white/50 hover:text-white" : "text-[#6B6B6B] hover:text-[#0F0F0F]"}`}>
            Prev
          </button>
          <div className="flex items-center">
            {SLIDES.map((s, i) => {
              const chapterBreak = i > 0 && s.chapter !== SLIDES[i - 1].chapter;
              return (
                <div key={i} className={`flex items-center ${chapterBreak ? "ml-3" : "ml-1"}`}>
                  <button type="button" onClick={() => setIndex(i)}
                    onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
                    className={`rounded-full transition-all duration-200 ${i === index ? "h-1.5 w-5 bg-[#C8FF47]" : dark ? "h-1 w-1 bg-white/20 hover:bg-white/45" : "h-1 w-1 bg-black/[0.18] hover:bg-black/[0.38]"}`}
                    aria-label={`Slide ${i + 1}`} />
                </div>
              );
            })}
          </div>
          <button type="button" onClick={next} disabled={index === total - 1}
            onMouseEnter={() => setCursorBig(true)} onMouseLeave={() => setCursorBig(false)}
            className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors disabled:opacity-25 ${dark ? "text-white/50 hover:text-white" : "text-[#6B6B6B] hover:text-[#0F0F0F]"}`}>
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
