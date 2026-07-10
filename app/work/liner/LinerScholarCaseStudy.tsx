"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaseStudyMobileToc } from "@/components/CaseStudyMobileToc";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "background", label: "Background" },
  { id: "research", label: "Research" },
  { id: "findings", label: "Findings" },
  { id: "goal", label: "The question" },
  { id: "concept", label: "Journey Design" },
  { id: "iterations", label: "Ideation" },
  { id: "prototype", label: "Final build" },
  { id: "impact", label: "Impact" },
] as const;

function CaseNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && navItems.some((i) => i.id === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const els = navItems.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Case study sections"
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-full w-[11rem] lg:block"
    >
      <div className="pointer-events-auto sticky top-[calc(50vh-9rem)] px-6 pt-28">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-nltLime">On this page</p>
        <ul className="mt-5 space-y-0">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(id);
                }}
                className={`block border-l border-transparent py-2 pl-4 text-left text-[13px] leading-snug transition-[color,border-color] duration-500 ease-out ${
                  active === id
                    ? "border-nltLime font-medium text-nltLime"
                    : "text-white/65 hover:border-nltLime/40 hover:text-white"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: reduce ? 0.01 : 0.85, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/* in-view autoplay video (muted, looping), loads its source near the viewport */
function AutoVideo({ src, poster, className = "" }: { src: string; poster?: string; className?: string }) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = src;
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={vref} muted loop playsInline controls preload="none" poster={poster} className={className} />;
}

/* Scrollytelling: a sticky live prototype on the left that deep-links to the
 * scene the reader has scrolled to on the right (driven via postMessage). */
type Scene = { scene: string; label: string; title: string; body: string; why?: string; stage?: string };

function SceneBlock({
  s,
  index,
  isActive,
  onActivate,
}: {
  s: Scene;
  index: number;
  isActive: boolean;
  onActivate: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onActivate(index), {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActivate]);
  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 lg:flex lg:min-h-screen lg:flex-col lg:justify-center ${
        isActive ? "opacity-100" : "lg:opacity-30"
      }`}
    >
      <div className="flex items-baseline gap-2.5">
        <span className="font-mono text-[12px] tabular-nums text-nltLime">{String(index + 1).padStart(2, "0")}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{s.label}</span>
      </div>
      <h3 className="mt-2.5 font-display text-[1.3rem] font-normal leading-snug text-white">{s.title}</h3>
      <p className="mt-3 text-[16px] leading-[1.65] text-white/75">{s.body}</p>
      {s.why ? (
        <p className="mt-3 text-[16px] leading-[1.65] text-white/50">
          <span className="text-nltLime">Why · </span>
          {s.why}
        </p>
      ) : null}
    </div>
  );
}

function PrototypeWalkthrough({ src, scenes, title = "Liner prototype" }: { src: string; scenes: Scene[]; title?: string }) {
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const NW = 1440;
  const NH = 900;

  // On phones the scaled-down desktop prototype is unreadable, so we skip the inline
  // frame entirely and offer a full-screen link. This also means the heavy live
  // iframes never load on mobile, keeping the page smooth.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener?.("change", upd);
    return () => mq.removeEventListener?.("change", upd);
  }, []);

  const mounted = near && !isMobile;

  useEffect(() => {
    const el = frameWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      setNear(true);
      return;
    }
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w > 0) setScale(Math.min(1, w / NW));
    });
    ro.observe(el);
    // Mount this walkthrough's live iframe only while it's near the viewport, and
    // unmount it once it's scrolled well away. The page carries five heavy prototype
    // iframes; keeping every one alive at once is what would eventually exhaust
    // memory and jank (or crash) low-end / Safari sessions. Capping to the one or two
    // the reader is actually near keeps it stable no matter how far they scroll.
    const io = new IntersectionObserver(
      ([e]) => {
        setNear(e.isIntersecting);
        if (!e.isIntersecting) setReady(false); // force a fresh handshake on remount
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // only accept the ready signal from THIS walkthrough's own iframe
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "liner-ready" && e.source === iframeRef.current?.contentWindow) setReady(true);
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // drive the prototype to whichever scene is in view
  useEffect(() => {
    if (!ready) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "liner-goto", scene: scenes[active].scene }, "*");
  }, [active, ready, scenes]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
      {/* sticky live prototype — left, pinned and vertically centered for the whole narrative */}
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:self-start">
        <div className="w-full">
          <div
            ref={frameWrapRef}
            className="relative w-full overflow-hidden rounded-xl bg-[#141416] ring-1 ring-white/10"
            style={{ aspectRatio: `${NW} / ${NH}` }}
          >
            {mounted ? (
              <iframe
                ref={iframeRef}
                src={src}
                title={title}
                loading="lazy"
                onLoad={() => setReady(true)}
                style={{
                  width: NW,
                  height: NH,
                  border: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                className="absolute left-0 top-0 block bg-[#141416]"
              />
            ) : isMobile ? (
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 grid place-items-center bg-[#141416] px-4 text-center"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#141416]">
                  Open prototype ↗
                </span>
              </a>
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">Loading…</span>
              </div>
            )}
          </div>
          <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
            {isMobile ? "Interactive prototype" : "Live · follows the text as you scroll"} ·{" "}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-nltLime underline decoration-nltLime/40 underline-offset-4 hover:decoration-nltLime"
            >
              open full-screen ↗
            </a>
          </p>
        </div>
      </div>

      {/* the narrative that drives it — right; each scene fills a screen so the pinned frame stays centered.
       * When a scene opens a new journey stage, a stage marker precedes it so the walkthrough reads as
       * four chapters (Set up · Explore · Curate · Align), not one flat list of features. */}
      <div className="space-y-16 lg:space-y-0">
        {scenes.map((s, i) => {
          const opensStage = s.stage && s.stage !== scenes[i - 1]?.stage;
          return (
            // scene ids can repeat within a walkthrough (v2 pins three beats on the "group" scene),
            // so the key must include the index to stay unique.
            <div key={`${s.scene}-${i}`}>
              {opensStage ? (
                <div className="flex items-center gap-3 pt-10 lg:pt-24">
                  <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-nltLime">{s.stage}</span>
                  <span className="h-px flex-1 bg-nltLime/25" />
                </div>
              ) : null}
              <SceneBlock s={s} index={i} isActive={active === i} onActivate={setActive} />
            </div>
          );
        })}
        {/* tail room so the last scene can reach center before the frame unpins */}
        <div aria-hidden className="hidden lg:block lg:h-[55vh]" />
      </div>
    </div>
  );
}

// ── Type scale — serif on titles only, everything else sans ─────────────────────
function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-nltLime">{children}</p>;
}
function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`max-w-3xl font-display text-[1.9rem] font-light leading-[1.15] tracking-[-0.02em] text-white ${className}`}>
      {children}
    </h2>
  );
}
function Subhead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-display text-[1.2rem] font-normal leading-snug text-white ${className}`}>{children}</h3>;
}
function Lead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-2xl space-y-3 text-[16px] leading-[1.7] text-white/70 ${className}`}>{children}</div>;
}
function Body({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-2xl space-y-3 text-[16px] leading-[1.65] text-white/70 ${className}`}>{children}</div>;
}

const SECTION = "scroll-mt-28 pt-16 md:pt-24 lg:pt-28";
const HAIR = "border-t border-white/10";

// ── Content data ────────────────────────────────────────────────────────────────

const FACTS = [
  ["Role", "User research · interaction & UI design"],
  ["Timeline", "6 months · Jan to Jun 2026"],
  ["Team", "2 PMs · 2 supervisors · 4 designers"],
] as const;

const BRIEF = [
  "Liner is an AI-powered research tool that supports deep research. It helps you discover, analyze, and organize scholarly content through AI-assisted search, citation, and synthesis. It has 12M+ users and ranks in the top 20 web AIs (a16z), but it’s built for one person. Research rarely happens alone, so Liner briefed us to design that collaborative layer — a business bet with three goals: introduce a new interaction pattern, open a new team audience, and give existing users a broader reason to stay — all without diluting the fast, private AI experience people already rely on.",
  "In the early phase, the questions we most wanted to answer were: how are researchers actually using AI today? Where does collaboration break down? And how do people want to work together? To answer them, I ran an expert interview, a competitive analysis, and 2 rounds of user interviews.",
] as const;

const FINDINGS = [
  {
    title: "Fact-checking stays human",
    body: "AI supports drafting, but interpretation and fact-checking stay human-owned, and the repeated re-checking is time-consuming.",
    pain: "AI results aren’t trusted as “final,” so verification piles up. Some users drop AI entirely after one major error.",
    quote: "I don’t trust it as a final output, but it helps me get the thinking going.",
    cite: "P5",
    img: "/assets/liner/insight fact checking.png",
    alt: "AI drafts and suggests, but a human keeps ownership of interpretation and fact-checking.",
  },
  {
    title: "Sharing has boundaries",
    body: "Teams share outputs, not private AI logs, and they want a signal that a human reviewed the result.",
    pain: "People want to share outputs while keeping their AI work private.",
    quote:
      "AI prompts are helpful, but I don’t want the prompts or logs shared with teammates. Files, information, and activity history should be fully transparent. Those two should be clearly separated.",
    cite: "P4, P5, P6",
    img: "/assets/liner/insight sharing boundaries.png",
    alt: "A private AI copilot drafts key points and follow-up questions beside a source, the exploratory work people keep to themselves.",
  },
  {
    title: "The workflow is fragmented",
    body: "A project moves data across many tools, all disconnected and slow.",
    pain: "Reference links break between Word and Google Docs, synthesis needs screenshots and copy-paste, and large figure files get emailed around into version chaos.",
    quote: "When I move it to Google Docs for team sharing, all the citation links break.",
    cite: "P4, P5, P6",
    img: "/assets/liner/insight1.png",
    alt: "Citation markers and a 20-source list in a Word document with EndNote, links that break the moment the doc moves.",
  },
  {
    title: "Revision is a state-management problem, with an editing problem",
    body: "Drafting is solo, but revision goes fully collaborative, and it turns into a problem of tracking who reviewed what.",
    pain: "With multiple direct editors, teams lose track of who reviewed which section. Rework grows because reviewers re-read the whole document, and cycles slow because “review state” is invisible.",
    quote:
      "Drafting is independent, but revision goes to 100% collaboration, and direct edits quickly raise the question: ‘who reviewed this part already?’",
    cite: "P6",
    img: "/assets/liner/insight revision.png",
    alt: "A literature review loops through review states that stay invisible to the team.",
  },
  {
    title: "Coordination falls on one person",
    body: "Nudging, follow-ups, and accountability are where team collaboration actually stalls — and it all lands on whoever volunteers to coordinate.",
    pain: "Chasing people, tracking who owes what, and keeping status current happens off-platform, so one person carries it and momentum stalls between meetings. This is the load we later hand to AI.",
    quote: "",
    cite: "",
    img: "/assets/liner/insight social friction.png",
    alt: "Google Docs review comments and per-reviewer feedback threads, with notifications muted.",
  },
  {
    title: "Liner is a personal tool in a team workflow",
    body: "People reach for Liner on their own. It isn’t the primary place a team collaborates, yet.",
    pain: "The team’s shared context lives elsewhere, so Liner’s value stays individual and never compounds across the group.",
    quote: "",
    cite: "",
    img: "/assets/liner/liner insight.png",
    alt: "Liner used as a personal reading and search tool, off to the side of the team’s shared workflow.",
  },
] as const;

// Liner Collective Intelligence — the four-stage proposal
const CONCEPT_STAGES = [
  ["01", "Set up", "Start a project, then pull in teammates, files, and a reference manager."],
  ["02", "Explore", "Work alone: read, highlight, and ask Liner AI inside a private workspace."],
  ["03", "Curate", "Promote a conclusion you can stand behind into the shared space, its source attached."],
  ["04", "Align", "Teammates verify, question, or revise the claim while AI checks every citation resolves."],
] as const;

const ITERATIONS = [
  {
    id: "v1",
    tag: "v1",
    frame: "/assets/liner/prototypes/v1-dark.html",
    poster: "/assets/liner/ideation/v1-dark.png",
    manual: true,
    title: "A personal reading room vs. a team group chat",
    body: "v1 keeps Liner solo. The right rail is a tabbed AI chat. You spin up as many private chats as you want, with a single shared Group Chat, and you slide any private answer into Group. We didn’t focus on the editor, since we assumed it was no different from Google Docs. We turned out to be wrong.",
    show: "Watch the flow from a private AI chat into the shared Group Chat.",
    call: "The call here: keep Liner personal and get the AI conversation right first, rather than bolting a team feed on top of it.",
  },
  {
    id: "v2",
    tag: "v2",
    frame: "/assets/liner/prototypes/v2-group-topbar.html",
    poster: "/assets/liner/ideation/v2-group-topbar.png",
    manual: true,
    title: "Group gets its own panel",
    body: "User-testing v1 surfaced the problem that drove v2: a team doesn’t want another chat stream, it wants reviewed knowledge. So v2 brings the team in — the Group Chat moves out to its own far-right panel, and it fills with structured knowledge cards, not chat. Each card carries its content, its citation, and a confidence signal, and teammates react and reply on it. Files, Editor, AI Chat, and Group open together.",
    show: "Open the Group panel to see the knowledge cards.",
    call: "The call here: make Group a space for reviewed knowledge. We took it too far — cards-only left no room to talk — and later brought a team conversation back alongside the cards.",
  },
  {
    id: "v3",
    tag: "v3",
    frame: "/assets/liner/prototypes/v3-workspace.html",
    manual: false,
    title: "A workspace, and composable editor modes",
    body: "v3 adds the workspace you land on before any doc, with milestones, tasks, teammates, and connected tools. In the editor, Citation ties each paragraph to its source, and Focus clears the panels for writing. That same select-to-reveal idea shaped the chat, which I explored as 3 layouts. Up to here, v1 and v2 were about direction, not craft — rough, vibe-coded prototypes to see whether an idea held. v3 is where I shifted to polish: I connected Figma MCP and generated this prototype straight from Liner’s design system, so it matches the real product instead of approximating it.",
    show: "Try switching editor modes, then the workspace and chat layouts.",
    call: "The call here: a workspace before the doc, and a hard split between private and shared, rather than one feed with a privacy toggle.",
  },
] as const;

const CHAT_PLANS = [
  {
    tag: "Plan A",
    img: "/assets/liner/ideation/v3-plan a-1.jpg",
    text: "Both threads stacked in 1 adjustable column. In testing, people felt it showed too little content, and the 2 input boxes read as visually repetitive.",
  },
  {
    tag: "Plan B",
    img: "/assets/liner/ideation/v3-plan b.jpg",
    text: "1 column you switch between. Clean, but sharing from private to team loses its continuity.",
  },
  {
    tag: "Plan C",
    img: "/assets/liner/ideation/v3-plan c-2.jpg",
    text: "Select a panel to see it solo, or both side by side in a 2-column view.",
  },
] as const;

const USABILITY_STATS = [
  ["14+", "Participants, UW master’s students across a range of academic research experience."],
  ["3 yr+", "Average research experience, in academia and professional practice."],
  ["~20 min", "Average length of each moderated testing session."],
] as const;

// Per-version feature walkthroughs. Each scene deep-links the version's prototype.
const WALK_V1: Scene[] = [
  {
    scene: "newchat",
    label: "Chat",
    title: "AI Chat and Group Chat",
    body: "Open as many private AI chats as you like, tabbed side by side, while the Group Chat stays the single shared space. Here, starting a new chat.",
  },
  {
    scene: "share",
    label: "Chat",
    title: "Share a message to Group",
    body: "From a private chat, hit Share to team, pick the shared chat, and confirm. The answer becomes shared work the team can build on.",
  },
];
const WALK_V2: Scene[] = [
  {
    scene: "group",
    label: "Group",
    title: "The Group Chat has updates",
    body: "The Group Chat surfaces updates: what changed, what needs a reply, and what teammates added while you were away.",
  },
  {
    scene: "group",
    label: "Group",
    title: "Shared knowledge cards",
    body: "You share a finding as a card with a fixed structure: the content, its citation, and a confidence signal. Teammates react and reply on the card.",
  },
  {
    scene: "group",
    label: "Group",
    title: "Cards only — the bet we revised",
    body: "v2 went all-in on structure: no free-text box, so the team could only post cards and never see raw AI output. It kept knowledge clean, but it also cut the ordinary back-and-forth teams live on. We brought the conversation back in the final build.",
  },
];
const WALK_V3: Scene[] = [
  {
    scene: "workspace",
    label: "Workspace",
    title: "The project workspace",
    body: "Milestones, tasks, teammates, and connected tools, before you open any doc.",
  },
  {
    scene: "authors",
    label: "Author mode",
    title: "See who wrote what",
    body: "Author mode colours the text by teammate, so you can see who is editing which part, live.",
  },
  {
    scene: "focus",
    label: "Focus mode",
    title: "Focus mode",
    body: "Selected on its own, Focus clears the side panels for distraction-free writing.",
  },
  {
    scene: "group",
    label: "Group",
    title: "The group’s AI: only the updates that touch you",
    body: "The update cards above are every card and message in the group thread — the team view. The Liner AI bot, meanwhile, briefs you in the thread with just the updates relevant to you — the personalized view. Team and individual, layered in one Group line.",
  },
];
const WALKS: Record<string, Scene[]> = { v1: WALK_V1, v2: WALK_V2, v3: WALK_V3 };

const PROTO_SRC = "/assets/liner/liner-ai-yuan.html";

// The final build, walked feature by feature. The prototype deep-links to each,
// and actually performs the action (opens a citation, a comment, the share sheet).
const CHAT_SWITCH: Scene[] = [
  {
    scene: "aichat",
    label: "Private only",
    title: "AI chat on its own",
    body: "Select just your private AI chat to explore and draft, with nothing shared yet.",
  },
  {
    scene: "group",
    label: "Shared only",
    title: "Group Chat on its own",
    body: "Select just the Group Chat to focus on the team’s reviewed, shared knowledge.",
  },
  {
    scene: "both",
    label: "Both",
    title: "Both, side by side",
    body: "Select both to move an answer across without losing your place. Exactly the Plan B + C behaviour.",
  },
];

// The final build, walked along the four-stage journey rather than as a flat feature list —
// Set up → Explore → Curate → Align. The prototype deep-links each scene and performs the action.
const WALKTHROUGH: Scene[] = [
  // ── 01 · Set up ──────────────────────────────────────────────
  {
    scene: "project",
    stage: "01 · Set up",
    label: "Workspace",
    title: "The project workspace",
    body: "Every project opens on a workspace: tasks, teammates, and connected resources like Google Drive and Zotero. Liner AI assigns the task cards across the team — and takes some itself, quietly owning citation-checking and keeping the group digest current.",
    why: "Coordination used to fall on one person. Here AI carries it in the background, so nobody has to chase status — and the workspace makes Liner the team’s shared home, not a tool off to the side.",
  },
  // ── 02 · Explore (work alone) ────────────────────────────────
  {
    scene: "files",
    stage: "02 · Explore",
    label: "Left · sources",
    title: "Every source in one panel",
    body: "The papers you’ve saved sit in the left panel. Open one and read it right beside your draft.",
    why: "The workflow was fragmented, so reading and writing now share one surface.",
  },
  {
    scene: "tldr",
    label: "Left · sources",
    title: "TLDR on each source",
    body: "Hover any source and its TLDR pops inline, so you can triage what deserves a full read without opening a thing.",
    why: "Explore means fast triage — decide which paper is worth the time first.",
  },
  {
    scene: "selection",
    label: "Editor · inline AI",
    title: "Select text, act on it",
    body: "Highlight a line and a popover offers Cite, Comment, Improve, or Ask AI. The assistant meets you in the text.",
    why: "AI assists, and you decide. It never acts on its own.",
  },
  {
    scene: "focus",
    label: "Editor · focus",
    title: "Focus mode for writing",
    body: "One click clears the panels for distraction-free drafting. The citation and comment layers stay composable.",
    why: "Exploration is solo work — so drafting gets its own quiet room, borrowed from the reading modes.",
  },
  // ── 03 · Curate (promote a conclusion you stand behind) ──────
  {
    scene: "citation",
    stage: "03 · Curate",
    label: "Editor · citations",
    title: "Every claim traces to its source",
    body: "Turn citations on and each claim carries a marker. Hover to see the quote and source; click through to open the original and land on the exact passage — the claim in its full context, not a stripped snippet.",
    why: "Curation means promoting a conclusion you can stand behind — so its source travels with it, checkable in place, not taken on faith.",
  },
  {
    scene: "share",
    label: "Right · the chat",
    title: "Private AI, then share to Group",
    body: "Your private AI chat sits beside the Group Chat. Share a curated answer across, and its source and citation travel with it. You choose whether to share your prompt, so your chat log stays yours by default.",
    why: "Teams share outputs, not private AI logs. The private → shared handoff is the whole move.",
  },
  // ── 04 · Align (verify, question, revise together) ───────────
  {
    scene: "comments",
    stage: "04 · Align",
    label: "Editor · review",
    title: "Verify, question, or revise",
    body: "Verification stays human. Open a margin comment, read the claim against the passage it came from, and mark it Verified — a named, visible state that means “I checked this against its source and I stand behind sharing it.” The click-through makes that cheap to do.",
    why: "Teams asked for a signal that a human reviewed the output — “I don’t trust it as a final output, but it helps me get the thinking going” (P5) — so a person, not the model, owns Verified.",
  },
  {
    scene: "group",
    label: "Right · the group",
    title: "Cards and conversation, together",
    body: "The Group Chat mixes reviewed knowledge cards with a real conversation, plus the AI’s background digest that walks in to brief you on what changed while you were away — which sections were edited, where your review is needed, and what new sources have landed for you to read. Two input boxes, two intents: the AI box is for prompting the assistant; the group box is for talking to your teammates.",
    why: "v2’s cards-only was too rigid. Teams need to talk — so structure and conversation live side by side, aligning on what’s been reviewed.",
  },
];

// The small map: every pain we found in research, and the move in the build that answers it.
const FINDING_ANSWERS = [
  ["Sharing has boundaries", "A private AI chat, then a deliberate Share-to-group — your prompt stays yours by default."],
  ["The workflow is fragmented", "Sources, your draft, and the AI all live on one surface, so nothing has to move between tools."],
  ["Revision state is invisible", "Margin Comments plus a human-owned Verified state, and author colours showing who wrote what."],
  ["Coordination falls on one person", "AI runs in the background — it assigns tasks, checks every citation, and keeps the group digest current."],
  ["Liner is a personal tool", "A project workspace makes Liner the team’s shared home, not a tool off to the side."],
] as const;

// How we'd know the collaboration bet paid off — the metrics I'd instrument.
const METRICS = [
  ["Share-to-group rate", "New interaction pattern", "Share of private AI answers a person curates into the shared space. The single clearest signal that the private → shared handoff is working."],
  ["Invite rate", "New team audience", "Share of projects where someone pulls a teammate in — the product’s own growth loop, and the path to the new audience."],
  ["Team activation", "New team audience", "Projects created with more than one member. Does collaboration actually get switched on, or does Liner stay a solo tool?"],
  ["Feature-led upgrades", "A reason to stay", "Subscriptions and upgrades attributable to the collaboration features. Whether the new pattern converts, not just engages."],
] as const;

const FUTURE = [
  [
    "Close the loop back to the doc",
    "Testing surfaced the question I keep returning to: if I share a new idea into the group thread, how does it get back into the paper — and who does it? Sharing to Group can’t be the endpoint. The real goal is the shared insight acting back on the original text, and that flow is the next thing to design.",
  ],
  [
    "Onboard the split",
    "The private and shared boundary is the whole idea, but it needs teaching. I’d add first-run guidance so no one shares the wrong thing.",
  ],
  [
    "Concurrent AI edits",
    "Several people editing with AI at once needs a section-allocation, branch-and-merge model, like a pull request. I scoped it, but didn’t build it.",
  ],
  [
    "Beyond research, to consumer scale",
    "The private → curate → shared boundary isn’t specific to papers. It’s the same shape as draft → post: a personal space to explore, a deliberate moment of curation, and provenance that travels with anything AI helped make. That’s how this idea would move from a research tool to a billion-user feed.",
  ],
  [
    "Deeper integrations",
    "Google Drive and Zotero connect today. Next is 2-way sync with reference managers, the step users ranked highest.",
  ],
] as const;

export default function LinerScholarCaseStudy() {
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-white">
      {/* dot-matrix + lime wash — mirrors the homepage's dark canvas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.10) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 88% 1%, black 0%, transparent 58%)",
          maskImage: "radial-gradient(120% 90% at 88% 1%, black 0%, transparent 58%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(48% 38% at 5% 0%, rgba(210,255,0,0.06), transparent 70%)" }}
      />
      <CaseNav />
      <CaseStudyMobileToc items={navItems} variant="dark" />
      <article className="relative z-10 mx-auto max-w-content px-6 pb-20 pt-20 text-left md:px-10 md:pb-36 md:pt-28 lg:pl-32 lg:pr-10 lg:pt-32">
        {/* 1 · Overview — hero */}
        <header id="overview" className="scroll-mt-28">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/liner/linerlogo.png" alt="" className="h-6 w-auto" />
              <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-white/70">Liner AI</span>
            </div>

            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.3rem,6vw,4rem)] font-light leading-[1.03] tracking-[-0.03em] text-white">
              Collaborative deep-research workflow
            </h1>

            <div className="mt-7 max-w-2xl space-y-3.5 text-[17px] leading-[1.6] text-white/70">
              <p>
                Liner’s AI is built for one person, but deep research is a team effort. Papers, reviews, whole studies
                are run by groups, so shared work is where the product is headed.
              </p>
              <p>
                The catch: AI today is mostly private, while a team needs a{" "}
                <span className="text-white">shared intelligence</span> where every source stays traceable, a higher
                bar than solo use. This project designs how to keep the two in balance.
              </p>
            </div>

            {/* the shape of the project up front */}
            <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-white/10 pt-7 sm:grid-cols-3 sm:gap-y-0">
              {FACTS.map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-nltLime">{label}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.5] text-white/75">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* the product, framed */}
          <motion.figure
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: reduce ? 0 : 0.12, ease: easeOut }}
            className="mt-12 md:mt-16"
          >
            <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
              <AutoVideo
                src="/assets/liner/liner-product-video.mp4"
                poster="/assets/work/liner-hero-v2.png"
                className="aspect-video h-auto w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
              Product showcase
            </figcaption>
          </motion.figure>
        </header>

        {/* 2 · The brief */}
        <section id="background" className={`${SECTION} space-y-8`}>
          <Reveal>
            <Kicker>Background</Kicker>
            <Title className="mt-5">Liner today, and where it’s headed</Title>
          </Reveal>
          <Reveal delay={0.04}>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              {/* image left */}
              <figure className="overflow-hidden rounded-xl bg-white ring-1 ring-white/10">
                <Image
                  src="/assets/liner/liner introduction.png"
                  alt="Liner AI, an AI-powered research tool for discovering, analyzing, and organizing scholarly content."
                  width={1400}
                  height={1000}
                  className="h-auto w-full"
                />
              </figure>
              {/* text right */}
              <div className="space-y-3 text-[16px] leading-[1.65] text-white/70">
                {BRIEF.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* 3 · Research */}
        <section id="research" className={`${SECTION} space-y-8`}>
          <Reveal>
            <Kicker>Research</Kicker>
            <Title className="mt-5">Where collaboration actually breaks</Title>
          </Reveal>

          {/* competitive analysis — image left, text right */}
          <Reveal delay={0.04}>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <figure className="overflow-hidden rounded-xl bg-white ring-1 ring-white/10">
                <Image
                  src="/assets/liner/competitiveanalysis.jpg"
                  alt="Competitive scan across the research lifecycle: Research Rabbit, Google Scholar, Granola, and Elicit"
                  width={1764}
                  height={1622}
                  className="h-auto w-full"
                />
              </figure>
              <div>
                <Subhead>Competitive analysis</Subhead>
                <div className="mt-3 space-y-3 text-[16px] leading-[1.65] text-white/70">
                  <p>
                    Academic collaboration isn’t co-editing a document. It moves through stages: discovering
                    literature, interpreting it together, drafting arguments, revising on feedback. So I mapped tools
                    across that lifecycle to see how collaboration and AI support actually work.
                  </p>
                  <p>
                    <span className="text-white">Collaboration is most active in writing and review</span>, and turns
                    individual at interpretation and AI-assisted revision. That gap is where we saw a possible design
                    opportunity for Liner’s future collaboration workflow.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* interviews */}
          <Reveal delay={0.06}>
            <div className="max-w-2xl">
              <Subhead>Expert &amp; user interviews</Subhead>
              <div className="mt-3 space-y-3 text-[16px] leading-[1.65] text-white/70">
                <p>
                  We interviewed 11 researchers in 2 waves. The first 7, recruited through our own networks, showed
                  us <span className="text-white">how researchers actually work and where collaboration breaks</span>.
                  The next 4, active Liner users, told us{" "}
                  <span className="text-white">what still breaks once you’re fluent</span> and helped us rank what to
                  build next.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 4 · Findings — one at a time */}
        <section id="findings" className={`${SECTION} space-y-8`}>
          <Reveal>
            <Kicker>Synthesis</Kicker>
            <Title className="mt-5">What we found</Title>
          </Reveal>
          <div className="mt-4">
            {FINDINGS.filter((f) => f.title !== "Fact-checking stays human").map((f, i) => (
              <Reveal key={f.title} delay={i * 0.02}>
                <div className={`py-8 ${HAIR} first:border-t-0`}>
                  <div
                    className={
                      f.img ? "grid items-center gap-8 lg:grid-cols-2 lg:gap-12 lg:[&>figure]:order-first" : ""
                    }
                  >
                    <div className="max-w-2xl">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[13px] tabular-nums text-nltLime">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-[18px] font-medium leading-snug text-white">{f.title}</h3>
                      </div>
                      <p className="mt-3 text-[16px] leading-[1.65] text-white/70">{f.body}</p>
                      {f.pain ? (
                        <p className="mt-2.5 text-[15px] leading-[1.6] text-white/55">
                          <span className="text-nltLime">Pain · </span>
                          {f.pain}
                        </p>
                      ) : null}
                      {f.quote ? (
                        <p className="mt-2.5 text-[15px] leading-[1.6] text-white/80">
                          “{f.quote}”{" "}
                          <span className="ml-1 font-mono text-[12px] uppercase tracking-[0.08em] text-white/40">
                            {f.cite}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {f.img ? (
                      <figure className="mt-1 lg:mt-0">
                        {/* Uniform plate for all five findings: same aspect box + faint surface + corners,
                         * no ring and no shadow, so the mismatched transparent PNGs share one edge rhythm. */}
                        <div className="mx-auto flex aspect-[4/3] w-full max-w-[20rem] items-center justify-center overflow-hidden rounded-2xl bg-white/[0.03] p-5 lg:max-w-[26rem]">
                          <Image
                            src={f.img}
                            alt={f.alt}
                            width={1400}
                            height={1300}
                            className="max-h-full w-auto max-w-full object-contain"
                          />
                        </div>
                      </figure>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4.5 · The reframed problem */}
        <section id="goal" className={`${SECTION} pb-4`}>
          <Reveal>
            <Kicker>The question</Kicker>
            <p className="mt-6 max-w-4xl border-l-2 border-nltLime pl-5 font-display text-[1.7rem] font-light leading-[1.3] text-white md:text-[2.1rem]">
              How might AI research tools support private, exploratory thinking while enabling transparent, accountable
              team collaboration?
            </p>
          </Reveal>
        </section>

        {/* 5 · The concept + the journey it maps, merged */}
        <section id="concept" className={`${SECTION} space-y-8`}>
          <Reveal>
            <Kicker>Journey Design</Kicker>
            <Title className="mt-5">Liner Collective Intelligence</Title>
            <Lead className="mt-6">
              <p>
                Today, everything Liner’s AI generates already traces back to its cited sources — the AI is
                accountable on its own. In a team, that isn’t enough.
              </p>
              <p>
                Researchers don’t want to share their thinking. They want to share conclusions they can stand behind.
                Today that handoff means leaving the tool: paste into Google Docs, drop a link in Slack, and the
                citations break while no one can tell what was verified. So instead of a chat room, I designed the
                boundary between a private workspace and a shared one: one journey, in four stages.
              </p>
              <p>
                This reframe was mine to make, and it came straight from the research: the real friction in a team
                isn’t the work itself — it’s that one person always ends up doing the glue work, the invisible
                coordination labour that holds the group together. So in the team context, I recast AI’s role: it’s no
                longer a chat partner or a teammate persona — it’s a <span className="text-white">background</span>. It
                posts the group digest, keeps every citation checked, and takes over the coordination that used to fall
                on one person. It never drafts or decides in your place; it absorbs the busywork so the humans can do
                the judgment.
              </p>
            </Lead>
          </Reveal>
          <Reveal delay={0.05}>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CONCEPT_STAGES.map(([n, name, text]) => (
                <li key={name} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="font-mono text-[12px] tabular-nums text-nltLime">{n}</span>
                  <p className="mt-2 font-display text-[1.15rem] font-normal text-white">{name}</p>
                  <p className="mt-2 text-[14px] leading-[1.55] text-white/65">{text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* 6 · Iterations & the decision — v1 / v2 / v3, each its own anchor */}
        <section id="iterations" className={`${SECTION} space-y-12`}>
          <Reveal>
            <Kicker>Ideation &amp; the decision</Kicker>
            <Title className="mt-5">From a personal tool to a team workflow</Title>
            <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-white/50">
              Each version is the real, running prototype, walked feature by feature. As you scroll, the live window
              jumps to the feature the text is describing.
            </p>
          </Reveal>

          {ITERATIONS.map((it) => (
            <div key={it.id} id={it.id} className="scroll-mt-28">
              <Reveal>
                {/* intro to the version */}
                <div className="max-w-2xl">
                  <span className="font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-white/55">
                    {it.tag}
                  </span>
                  <Subhead className="mt-1.5">{it.title}</Subhead>
                  <p className="mt-3 text-[16px] leading-[1.65] text-white/70">{it.body}</p>
                  <p className="mt-4 text-[15px] leading-[1.6] text-white">{it.call}</p>
                </div>
              </Reveal>

              {/* feature-by-feature walkthrough of this version */}
              <div className="mt-8">
                <PrototypeWalkthrough src={it.frame} scenes={WALKS[it.id]} title={`${it.tag} · ${it.title}`} />
                <a
                  href={it.frame}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-nltLime underline decoration-nltLime/40 underline-offset-4 transition-colors hover:decoration-nltLime"
                >
                  Open {it.tag} full-screen ↗
                </a>
              </div>

              {/* v3 · the 3 chat layouts — why we explored them, labelled, and the final pick */}
              <Reveal>
                {it.id === "v3" ? (
                  <div className="mt-12">
                    <Subhead>Why 3 chat layouts?</Subhead>
                    <p className="mt-3 max-w-2xl text-[15px] leading-[1.65] text-white/70">
                      The chat is where private and shared meet, so its arrangement decides how easily an idea crosses
                      over. Each option trades simplicity against continuity. I built all 3 to see which one kept the
                      share-to-group move fluid.
                    </p>
                    <div className="mt-6 space-y-6">
                      {CHAT_PLANS.map((p) => (
                        <div key={p.tag} className="grid items-center gap-4 sm:grid-cols-[2fr_1fr] sm:gap-8">
                          <div className="relative overflow-hidden rounded-lg ring-1 ring-white/10">
                            <span className="absolute left-3 top-3 z-10 rounded-md bg-black/70 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur">
                              {p.tag}
                            </span>
                            <Image src={p.img} alt={p.tag} width={1400} height={980} className="h-auto w-full" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{p.tag}</p>
                            <p className="mt-1.5 text-[15px] leading-[1.55] text-white/70">{p.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* usability testing — who we validated with */}
                    <div className="mt-10">
                      <Subhead>Usability testing</Subhead>
                      <dl className="mt-4 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-3 sm:gap-8">
                        {USABILITY_STATS.map(([n, t]) => (
                          <div key={n}>
                            <dt className="font-display text-[1.9rem] font-light leading-none text-nltLime">{n}</dt>
                            <dd className="mt-2 text-[14px] leading-[1.5] text-white/65">{t}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="mt-8 max-w-2xl">
                      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-nltLime">Final pick · Plan B + C</p>
                      <p className="mt-2 text-[15px] leading-[1.65] text-white/70">
                        The AI-and-Group Chat was mine to own, and I designed it by carrying the editor’s own gesture
                        across: the same select-to-reveal from v3’s Focus and Citation modes now drives the chat — you
                        select one panel or both. Testing settled it. People wanted both threads readable at once, since
                        the content comes from the left and they wanted to see more of it. Selecting either panel on its
                        own, or both side by side, kept the private-to-shared move continuous instead of a hard switch.
                        Letting people choose the state also makes the process visible when sharing, which keeps it
                        accurate and traceable back to the source.
                      </p>
                    </div>

                    {/* live demo: AI Chat / Group Chat switching */}
                    <div className="mt-8">
                      <PrototypeWalkthrough
                        src={PROTO_SRC}
                        scenes={CHAT_SWITCH}
                        title="Liner — AI Chat and Group Chat switching"
                      />
                    </div>
                  </div>
                ) : null}
              </Reveal>
            </div>
          ))}
        </section>

        {/* 7 · Final build — the live prototype, walked feature by feature */}
        <section id="prototype" className={`${SECTION} space-y-8 pb-8`}>
          <Reveal>
            <Kicker>Final build</Kicker>
            <Title className="mt-5">The decisions, made real</Title>
            <Lead className="mt-6">
              <p>
                The editor is the part I owned. We refused to build “Google Docs with comments” — the industry default
                answers none of the pains researchers named. So every pain got a direct move, and the build runs them in
                the order the journey does: <span className="text-white">set up, explore, curate, align</span>.
              </p>
            </Lead>
          </Reveal>

          {/* ask #1 · the small map — every research pain, and the move that answers it */}
          <Reveal delay={0.02}>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="hidden border-b border-white/10 px-5 py-3 sm:grid sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">What broke (research)</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">How the build answers it</p>
              </div>
              {FINDING_ANSWERS.map(([pain, answer], i) => (
                <div
                  key={pain}
                  className={`grid gap-1 px-5 py-4 sm:grid-cols-[1fr_1.4fr] sm:gap-8 ${i > 0 ? "border-t border-white/10" : ""}`}
                >
                  <p className="text-[14px] leading-[1.5] text-white/55">
                    <span className="text-nltLime sm:hidden">Pain · </span>
                    {pain}
                  </p>
                  <p className="text-[15px] leading-[1.55] text-white/85">{answer}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* the money shot — the whole system in one frame, before we walk it stage by stage */}
          <Reveal delay={0.03}>
            <figure className="mt-2">
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(210,255,0,0.18)]">
                <Image
                  src="/assets/liner/ideation/v4-final.png"
                  alt="The final build in one screen: the editor with live citations and margin comments, an author tag on the text, and the private AI chat beside the Group Chat of reviewed knowledge cards."
                  width={1160}
                  height={725}
                  priority
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
                <span className="text-white/55">Everything composed —</span>
                {["Citation", "Comments", "Authors", "Focus", "Share-to-group"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-nltLime/25 bg-nltLime/[0.06] px-2.5 py-1 tracking-[0.1em] text-nltLime"
                  >
                    {t}
                  </span>
                ))}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.04}>
            <p className="mt-10 max-w-2xl text-[13px] leading-relaxed text-white/50">
              Walked along the four journey stages, not as a feature list. As you scroll each stage, the live window
              jumps to the feature the text is describing.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <PrototypeWalkthrough src={PROTO_SRC} scenes={WALKTHROUGH} />
          </Reveal>

          {/* validation & refinement */}
          <Reveal delay={0.045}>
            <div className={`pt-10 ${HAIR}`}>
              <Subhead>Validated, then refined</Subhead>
              <div className="mt-5 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                <figure className="overflow-hidden rounded-xl ring-1 ring-white/10">
                  <Image
                    src="/assets/liner/Screenshot 2026-07-05 at 01.57.00.png"
                    alt="Section A Capstone Award — Feature integration and platform evolution with AI, Team North4Studio."
                    width={1305}
                    height={1329}
                    className="h-auto w-full"
                  />
                </figure>
                <div className="space-y-3 text-[16px] leading-[1.65] text-white/70">
                  <p>
                    We validated the flow through usability testing — and it also handed us the finding I didn’t want to
                    hear: once people shared a new idea into the group, they immediately asked how it gets back into the
                    paper, and who does it. Sharing wasn’t the finish line they’d assumed it was. That reframed a whole
                    future direction rather than a detail, and I’d rather show it than hide it.
                  </p>
                  <p>
                    Refinement was as much craft as concept. The team produced many separate options; my job was to fold
                    them into one coherent system — which meant holding the whole thing in view at once (how Citation,
                    Comments, Authors, and Focus compose, and where they’d collide) while restoring each screen to the
                    pixel. I connected Figma MCP and generated the prototype straight from Liner’s design system — the
                    serif display, highlighter accents, the dotted-line citation motif — so it reads as part of the
                    product, not a mock beside it.
                  </p>
                  <p>It shipped as a working prototype with a feature-level specification.</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* what I'd do next */}
          <Reveal delay={0.05}>
            <div className={`pt-10 ${HAIR}`}>
              <Subhead>If I had more time</Subhead>
              <div className="mt-4 max-w-3xl">
                {FUTURE.map(([h, b]) => (
                  <div key={h} className={`flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-8 ${HAIR} first:border-t-0`}>
                    <p className="font-medium text-white sm:w-[26%] sm:shrink-0">{h}</p>
                    <p className="text-[15px] leading-[1.6] text-white/70 sm:flex-1">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

        </section>

        {/* 8 · Impact — where it landed and what’s next */}
        <section id="impact" className={`${SECTION} space-y-8 pb-8`}>
          <Reveal>
            <Kicker>Impact</Kicker>
            <Title className="mt-5">Where it landed</Title>
          </Reveal>

          {/* results first — the three signals stated big, before any caveat */}
          <Reveal delay={0.02}>
            <dl className="grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-10">
              {([
                ["Jul 2026", "On the roadmap", "Liner is taking the collaborative workflow into the product — launch expected July 2026."],
                ["3 features", "Chosen to carry forward", "Focus mode, citations, and share-to-group — the collaboration-native ones stakeholders kept."],
                ["Capstone Award", "Section A", "Jury recognition for feature integration and platform evolution with AI."],
              ] as const).map(([v, label, text]) => (
                <div key={label}>
                  <dt className="font-display text-[1.7rem] font-light leading-[1.05] tracking-[-0.01em] text-nltLime">{v}</dt>
                  <dd className="mt-2.5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">{label}</p>
                    <p className="mt-1.5 text-[14px] leading-[1.5] text-white/60">{text}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.04}>
            <figure className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
              <AutoVideo
                src="/assets/liner/liner-product-video.mp4"
                poster="/assets/work/liner-hero-v2.png"
                className="aspect-video h-auto w-full object-cover"
              />
            </figure>
          </Reveal>
          <Reveal delay={0.045}>
            <div className={`pt-10 ${HAIR}`}>
              <Subhead>How we’d know it worked</Subhead>
              <p className="mt-3 max-w-2xl text-[15px] leading-[1.65] text-white/60">
                It shipped as a prototype, so these are the metrics I’d instrument at launch rather than results. Each
                maps back to a goal in the brief — a new interaction pattern, a new team audience, a broader reason to
                stay — because the bet is only real if it moves them, not just demos well.
              </p>
              <dl className="mt-6 grid gap-x-8 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-2">
                {METRICS.map(([label, goal, text]) => (
                  <div key={label}>
                    <dt className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-nltLime">{label}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">↳ {goal}</span>
                    </dt>
                    <dd className="mt-2 text-[15px] leading-[1.55] text-white/70">{text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className={`pt-10 ${HAIR}`}>
              <Link
                href="/work/liner/deck-mono-zh"
                className="group inline-flex items-center gap-2 rounded-full border border-nltLime/40 bg-nltLime/[0.06] px-6 py-3 text-[14px] font-medium text-nltLime transition-colors hover:border-nltLime/70 hover:bg-nltLime/[0.12]"
              >
                View the deck
                <span className="transition-transform group-hover:translate-x-0.5">↗</span>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className={`pt-8 ${HAIR}`}>
              <Link
                href="/#work"
                className="inline-block text-[16px] text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
              >
                ← Back to selected work
              </Link>
            </div>
          </Reveal>
        </section>
      </article>
    </div>
  );
}
