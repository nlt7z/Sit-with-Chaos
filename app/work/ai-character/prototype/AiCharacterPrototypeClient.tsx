"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";

const romanticDisplay = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"] });
const romanticBody = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"] });
const uiFont = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const F = { display: romanticDisplay.style.fontFamily, body: romanticBody.style.fontFamily, ui: uiFont.style.fontFamily };

/** Alternate-universe card hero — dedicated portrait for the “new world” timeline */
const AU_HERO_IMG = "/assets/ai-character/alternate-universe-hero.png";
const AU_CARD_BG_VIDEO = "/assets/ai-character/newworld.mp4";
const AU_CARD_VIDEO_RATE = 0.52;
/** Full-bleed scene behind Lucien — default timeline vs alternate world */
const SCENE_VIDEO_DEFAULT = "/assets/ai-character/newmove.mp4" as const;
const SCENE_VIDEO_ALTERNATE = "/assets/ai-character/newworld.mp4" as const;
const PORTRAIT_VIDEO_PLAYLIST = [SCENE_VIDEO_DEFAULT] as const;
const VIDEO_PLAYBACK_SLOW = 0.42;
const BG_MUSIC = "/assets/ai-character/background.MP3";

const T = {
  bg: { void: "#050507", deep: "#08080d", card: "#0d0d16" },
  gold: { p: "#d4a853", l: "#f2da90", d: "#8a7038", dk: "#5a4e28" },
  rose: { p: "#c87878", l: "#e8a8a8", d: "#7e4444" },
  txt: { p: "#f0ece2", s: "#a8a098", d: "#625e5a", m: "#3e3a36" },
  bdr: { f: "rgba(212,168,83,0.09)", s: "rgba(212,168,83,0.18)", g: "rgba(212,168,83,0.32)", gs: "rgba(212,168,83,0.55)" },
  glow: { g: "rgba(212,168,83,0.11)", gm: "rgba(212,168,83,0.22)", gs: "rgba(212,168,83,0.40)" },
  au: { accent: "#6090d8", border: "rgba(96,144,216,0.24)", text: "#ccd8f4" },
};

const CHAT_COLUMN_MAX_PX = 760;
const SIDEBAR_LEFT_PX = 216;
const SIDEBAR_RIGHT_PX = 288;
const CHAT_DOCK_MAX_VH = 54;
const CHAT_MESSAGES_MAX_VH = 32;
/** When an Alternate Universe card is in-thread, give the transcript more height so the card fits */
const CHAT_MESSAGES_MAX_VH_WITH_AU = 44;
const CHAR_NAME = "Lucien Ashford";
/** Header controls — rounded-square “cube” shells, compact */
const HUD_BTN_PX = 32;
const HUD_ICON_PX = 15;
const HUD_RADIUS = 7;
const FEATURE_ICON_PX = 17;

const CHARACTER_CODE = `role: lucien_ashford
voice: restrained_warmth, dry_humor, vulnerability_gated
constraints:
  - stay_in_scene; no fourth_wall
  - heartbeat_lines: italic_inner_voice only when flagged
  - romance: consent-forward; power_imbalance_acknowledged
safety: refuse_real_world_instructions; fictional_frame only

system_stub:
  "You are Lucien Ashford in Eternal Vow. Speak in first person.
   Keep turns concise unless the player asks for depth."`;

const CHARACTER_STORY_BLURB = `Heir to a legacy that demands perfection — yet drawn to the one who sees past the mask. His bond with you is the one thread he cannot strategize away.`;

const STORY_UNLOCK_POSTS = [
  {
    id: 1,
    title: "The First Lie",
    chapter: "Memory Fragment \u00b7 Ch. IV",
    text: "The first time he lied to you, he didn't even realize it. His pen had been still for three minutes — long enough for you to notice.",
    likes: 31, relates: 18,
  },
  {
    id: 2,
    title: "The Portrait Room",
    chapter: "Secret Unlocked \u00b7 Ch. VII",
    text: "He visits the east wing alone. Every year, same date. The portrait watches him in silence — the only room where his composure ever fully fails.",
    likes: 67, relates: 44,
  },
];

const CLONE_SNIPPET = `git clone https://github.com/eternal-vow/lucien-template
cd lucien-template && npm install
# Customize in character.config.json
# Deploy: npm run build && npm start`;

const DEMO_STEPS = [
  { step: 1, time: "0:00", label: "Opening",     hint: "Scene opens. Lucien greets you. Notice ambient music + animated portrait." },
  { step: 2, time: "0:15", label: "Heartbeat",   hint: "Tap the glowing tarot card below his message — reveal his hidden inner thought." },
  { step: 3, time: "0:35", label: "Inspire",     hint: "Click Inspire in the action bar. Choose 'Flirtatious' from the 3 candidate replies." },
  { step: 4, time: "0:55", label: "Heartbeat 2", hint: "Lucien responds. A new tarot card appears. Flip it to hear what he cannot say aloud." },
  { step: 5, time: "1:15", label: "Continue",    hint: "Click Continue below his reply. No retype needed — story extends naturally." },
  { step: 6, time: "1:35", label: "Story",       hint: "Click Story in the action bar. Browse unlocked moments in the right panel." },
  { step: 7, time: "1:55", label: "Alt Universe",hint: "Click Alt Universe. Explore the rain-day alternate timeline." },
  { step: 8, time: "2:15", label: "Moments",     hint: "Click Moments. Scroll his private feed and like what resonates." },
  { step: 9, time: "2:30", label: "Developer",   hint: "Click </> in the top-right. View Source, One-Click Clone, Config sliders." },
];

const GREETING = {
  text: "You're here. I was starting to think you forgot about me \u2014 though I suppose I'd deserve that, given how long that meeting dragged on.",
  narration: "He leans back, the faintest smile crossing his lips as his amber eyes find yours.",
  heartbeat: "She came back. Every time the door opens, I hold my breath. I hate that I've become someone who waits \u2014 but only for her.",
};

const INSPIRATION_RESPONSES = [
  { label: "Flirtatious", emotion: "playful warmth",
    text: "Forget about you? That's physically impossible. I tried once \u2014 lasted about forty seconds before something reminded me of you.",
    action: "leans closer, tilting her head with a teasing smile" },
  { label: "Caring", emotion: "gentle concern",
    text: "You look exhausted, Lucien. When was the last time you actually slept? And don't say 'I'm fine.'",
    action: "reaches out and lightly touches his wrist" },
  { label: "Playful", emotion: "amused defiance",
    text: "Oh? Is that concern I hear, Mr. Ashford? The man who once called attachment 'strategically inadvisable'?",
    action: "crosses her arms, eyebrow raised, fighting a grin" },
];

const CHAR_REPLIES: Record<number, { text: string; narration: string; heartbeat: string }> = {
  0: {
    text: "Forty seconds? I'm flattered. Though I confess, my own record is considerably worse. I stopped counting after the first hour.",
    narration: "His composure cracks \u2014 just barely. A breath of laughter, quiet and real. He reaches across and tucks a strand of hair behind your ear, his fingertips barely grazing your temple.",
    heartbeat: "She says things like that so easily. Does she know what it does to me? My chest hasn't felt this tight since the night I almost told her everything.",
  },
  1: {
    text: "Six hours. Don't look at me like that. I had three continent calls and a board that doesn't understand time zones. But\u2026 I saved you dinner. It's still warm.",
    narration: "He goes still. For a moment, the mask slips \u2014 and beneath it, something raw and unguarded flickers across his face.",
    heartbeat: "No one asks me that. No one looks close enough to notice. But she does. Every time. And I don't know how to be someone who deserves that kind of attention.",
  },
  2: {
    text: "Strategically inadvisable. Yes. I stand by the principle \u2014 in general. You, however, have always been the exception I never budgeted for.",
    narration: "A low laugh \u2014 genuine, unguarded. The kind he only lets you hear. He tilts his head, studying you with something warmer than amusement.",
    heartbeat: "She remembers everything. Every careless word I've ever said, she holds like evidence. And somehow that terrifies me more than it should.",
  },
};

const CONTINUE_RESPONSE = {
  text: "There's something I've been meaning to tell you. About the night we first met \u2014 I wasn't at that gallery by accident. I'd been following your photography for months. Your eye for forgotten places\u2026 I wanted to see who could capture that kind of loneliness so precisely. And then I saw you, and I understood.",
  narration: "He pauses, as though surprised by his own honesty. His gaze drops to the glass in his hand, then rises to meet yours with an intensity that makes the air between you feel thinner.",
  heartbeat: "I've kept this secret for two years. The words feel strange leaving my mouth \u2014 like releasing something I've held too tightly for too long. But if anyone deserves to know, it's her.",
};

const AU_EVENT = {
  title: "What If We Met in the Rain",
  intro: "Alternate Universe \u2014 Memory Fragment #7",
  appearanceNote: "A softer silhouette \u2014 the same soul in another weather.",
  text: `No gala. No cameras. Just a downpour on a Tuesday evening. You're running for the same awning as a stranger in a black coat. He offers half an umbrella. You notice his hands first \u2014 steady, deliberate. He notices your camera.
Neither of you leaves when the rain stops.
"You photograph absences," he says. "The chair no one sits in. The window left open."
"And you?" you ask. "What do you see?"
A pause. Rain drips from the awning edge.
"Right now? Someone who sees what I've been trying to hide."`,
  narration: "The scene shimmers. He blinks, and for a moment looks at you as though seeing you for the very first time.",
};

const MOMENTS = [
  { time: "2h ago",     text: "Finished the quarterly report. The view from the 47th floor is wasted on spreadsheets.", mood: "contemplative", likes: 12 },
  { time: "5h ago",     text: "Found a coffee shop that does pour-over the way you like it. Saved the address. No reason.", mood: "tender", likes: 24 },
  { time: "Yesterday",  text: "The rain hasn't stopped. I keep thinking about your silhouette against the window that night.", mood: "longing", likes: 38 },
  { time: "2 days ago", text: "Board meeting. Fourteen people in the room and I could only think about one who wasn't there.", mood: "devoted", likes: 45 },
];

/* ─── Shared decoration ──────────────────────────────────────────────────── */

function OrnamentRule({ opacity = 0.45 }: { opacity?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, opacity, userSelect: "none" }} aria-hidden>
      <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right, transparent, ${T.gold.dk})` }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1 L8.2 5.5 L13 7 L8.2 8.5 L7 13 L5.8 8.5 L1 7 L5.8 5.5 Z" stroke={T.gold.p} strokeWidth="0.6" fill="none" />
        <circle cx="7" cy="7" r="1.2" fill={T.gold.p} opacity="0.7" />
      </svg>
      <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to left, transparent, ${T.gold.dk})` }} />
    </div>
  );
}

/** Thin compass / celestial mark — consistent stroke weight for precision */
function CelestialMark({ size = 24 }: { size?: number }) {
  const r1 = size * 0.14, r2 = size * 0.26, r3 = size * 0.4, cx = size / 2, cy = size / 2;
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  const sw = 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      <circle cx={cx} cy={cy} r={r1} stroke={T.gold.p} strokeWidth={sw} opacity="0.55" />
      <circle cx={cx} cy={cy} r={r2} stroke={T.gold.p} strokeWidth={sw * 0.85} opacity="0.38" />
      <circle cx={cx} cy={cy} r={r3} stroke={T.gold.p} strokeWidth={sw * 0.65} opacity="0.22" />
      {spokes.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line key={i}
            x1={cx + (r2 + 0.5) * Math.cos(rad)} y1={cy + (r2 + 0.5) * Math.sin(rad)}
            x2={cx + (r3 + size * 0.06) * Math.cos(rad)} y2={cy + (r3 + size * 0.06) * Math.sin(rad)}
            stroke={T.gold.p} strokeWidth={sw} strokeLinecap="round" opacity="0.4"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={1.1} fill={T.gold.p} opacity="0.5" />
    </svg>
  );
}

/* ─── Video ──────────────────────────────────────────────────────────────── */
function PortraitVideoPlaylist({ sources, playbackRate = VIDEO_PLAYBACK_SLOW }: { sources: readonly string[]; playbackRate?: number }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const safeLen = Math.max(1, sources.length);
  const src = sources[index % safeLen];
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const apply = () => { try { v.playbackRate = playbackRate; } catch { /**/ } };
    apply(); v.addEventListener("loadedmetadata", apply); void v.play().catch(() => {});
    return () => { v.removeEventListener("loadedmetadata", apply); };
  }, [src, playbackRate]);
  return (
    <>
      <span className="ai-proto-sr-only">Ambient character scene video, muted.</span>
      <video ref={ref} src={src} autoPlay loop muted playsInline preload="auto" aria-hidden tabIndex={-1}
        onEnded={() => setIndex((i) => (i + 1) % safeLen)}
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 8%",
          filter: "brightness(0.72) contrast(1.05) saturate(0.82)",
          animation: "slowZoom 60s ease-in-out infinite alternate", transformOrigin: "center 10%" }}
      />
    </>
  );
}

/* ─── Developer Sidebar ──────────────────────────────────────────────────── */
function DeveloperSidebar({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<"source" | "clone" | "config">("source");
  const [temp, setTemp] = useState(0.85);
  const [tokens, setTokens] = useState(1024);
  const [model, setModel] = useState("qwen-qwq");
  const [copied, setCopied] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShow(true), 30); return () => clearTimeout(id); }, []);
  const close = () => { setShow(false); setTimeout(onClose, 360); };
  const copyClone = () => { navigator.clipboard.writeText(CLONE_SNIPPET).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const TAB = (a: boolean) => ({ flex: 1, padding: "9px 4px", border: "none", background: a ? T.glow.g : "transparent", color: a ? T.gold.l : T.txt.d, fontSize: 12, fontFamily: F.ui, fontWeight: a ? 500 : 400, cursor: "pointer", borderBottom: `1.5px solid ${a ? T.gold.p : "transparent"}`, transition: "all 0.2s ease" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", justifyContent: "flex-end", background: show ? "rgba(4,4,8,0.4)" : "transparent", transition: "background 0.35s ease" }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 390, height: "100%", background: "rgba(8,8,13,0.97)", backdropFilter: "blur(40px)", borderLeft: `1px solid ${T.bdr.s}`, transform: show ? "translateX(0)" : "translateX(100%)", transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "22px 20px 14px", borderBottom: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden style={{ color: T.gold.p }}>
                <path d="M7 5L3 10l4 5M13 5l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 16, fontWeight: 500, color: T.txt.p }}>Developer Tools</span>
            </div>
            <div style={{ fontSize: 11, color: T.txt.d, letterSpacing: 1.5, textTransform: "uppercase" }}>Inspect \u00b7 Clone \u00b7 Configure</div>
          </div>
          <button type="button" onClick={close} aria-label="Close developer tools" style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${T.bdr.f}`, background: "transparent", color: T.txt.d, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>&#215;</button>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.bdr.f}` }}>
          {(["source", "clone", "config"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={TAB(tab === t)}>
              {t === "source" ? "Source" : t === "clone" ? "Clone" : "Config"}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {tab === "source" && (
            <div style={{ animation: "fadeIn 0.3s ease both" }}>
              <p style={{ fontSize: 12, color: T.txt.d, lineHeight: 1.7, marginBottom: 14 }}>The YAML spec defining Lucien's voice, constraints, and system prompt stub.</p>
              <div style={{ borderRadius: 10, border: `1px solid ${T.bdr.s}`, background: "rgba(6,6,10,0.9)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px 7px", borderBottom: `1px solid ${T.bdr.f}` }}>
                  {["#d05","#d80","#4a4"].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: T.txt.d, marginLeft: 6 }}>character.config.yaml</span>
                </div>
                <pre style={{ margin: 0, padding: "14px 16px", fontFamily: "ui-monospace,SFMono-Regular,monospace", fontSize: 11.5, lineHeight: 1.75, color: T.txt.s, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{CHARACTER_CODE}</pre>
              </div>
            </div>
          )}
          {tab === "clone" && (
            <div style={{ animation: "fadeIn 0.3s ease both" }}>
              <p style={{ fontSize: 12, color: T.txt.d, lineHeight: 1.7, marginBottom: 16 }}>Fork this template to build your own character. Includes the spec, UI shell, and prompt runtime.</p>
              <div style={{ borderRadius: 10, border: `1px solid ${T.bdr.s}`, background: "rgba(6,6,10,0.9)", overflow: "hidden", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px 7px", borderBottom: `1px solid ${T.bdr.f}` }}>
                  {["#d05","#d80","#4a4"].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: T.txt.d, marginLeft: 6 }}>Terminal</span>
                </div>
                <pre style={{ margin: 0, padding: "14px 16px", fontFamily: "ui-monospace,monospace", fontSize: 11.5, lineHeight: 1.9, color: "#72c472", whiteSpace: "pre-wrap" }}>{CLONE_SNIPPET}</pre>
              </div>
              <button onClick={copyClone} style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: `1px solid ${copied ? T.gold.p : T.bdr.g}`, background: copied ? T.glow.gm : "transparent", color: copied ? T.gold.l : T.gold.p, fontFamily: F.ui, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.25s ease" }}>
                {copied ? "Copied" : "Copy command"}
              </button>
            </div>
          )}
          {tab === "config" && (
            <div style={{ animation: "fadeIn 0.3s ease both" }}>
              {[
                { label: "Model", content: (
                  <select value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${T.bdr.s}`, background: T.bg.card, color: T.txt.p, fontFamily: F.ui, fontSize: 12, cursor: "pointer", outline: "none" }}>
                    <option value="qwen-qwq">qwen-qwq — Deep Reasoning</option>
                    <option value="qwen-plus">qwen-plus — Balanced</option>
                    <option value="qwen-turbo">qwen-turbo — Fastest</option>
                  </select>
                )},
                { label: `Temperature — ${temp.toFixed(2)}`, content: (
                  <input type="range" min={0} max={1} step={0.01} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} style={{ width: "100%", accentColor: T.gold.p }} />
                )},
                { label: `Max tokens — ${tokens}`, content: (
                  <input type="range" min={128} max={4096} step={128} value={tokens} onChange={(e) => setTokens(parseInt(e.target.value))} style={{ width: "100%", accentColor: T.gold.p }} />
                )},
              ].map((row) => (
                <div key={row.label} style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 9, border: `1px solid ${T.bdr.f}`, background: "rgba(12,12,20,0.5)" }}>
                  <div style={{ fontSize: 10, color: T.txt.d, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 9 }}>{row.label}</div>
                  {row.content}
                </div>
              ))}
              <div style={{ padding: "12px 14px", borderRadius: 9, border: `1px solid ${T.bdr.f}`, background: "rgba(12,12,20,0.5)" }}>
                <div style={{ fontSize: 10, color: T.txt.d, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Feature flags</div>
                {[{ label: "Heartbeat injection", on: true }, { label: "Emotion cues", on: true }, { label: "Alternate universe", on: true }, { label: "Long-context memory", on: false }].map((f) => (
                  <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.bdr.f}` }}>
                    <span style={{ fontSize: 12, color: T.txt.s }}>{f.label}</span>
                    <div style={{ width: 26, height: 14, borderRadius: 7, background: f.on ? "rgba(201,160,90,0.45)" : "rgba(78,74,70,0.35)", position: "relative" }}>
                      <div style={{ position: "absolute", top: 2, left: f.on ? 13 : 2, width: 10, height: 10, borderRadius: "50%", background: f.on ? T.gold.l : T.txt.d, transition: "left 0.22s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tarot ambient stars ────────────────────────────────────────────────── */
const TAROT_SYMS = ["\u2726", "\u2727", "\u22c6", "\u00b7"] as const;
function TarotStars({ topInset = 0 }: { topInset?: number }) {
  const [stars, setStars] = useState<{ id: number; sym: string; x: string; y: string; s: number; o: number; d: number; du: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 9 }, (_, i) => ({
      id: i, sym: TAROT_SYMS[i % TAROT_SYMS.length],
      x: `${12 + Math.random() * 76}%`, y: `${10 + Math.random() * 68}%`,
      s: 0.45 + Math.random() * 0.65, o: 0.05 + Math.random() * 0.1,
      d: 20 + Math.random() * 22, du: 8 + Math.random() * 9,
    })));
  }, []);
  return (
    <div aria-hidden style={{ position: "fixed", top: topInset, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
      {stars.map((st) => (
        <span key={st.id} style={{ position: "absolute", left: st.x, top: st.y, transform: "translate(-50%,-50%)", fontVariant: "normal" as const }}>
          <span style={{ display: "block", transform: `scale(${st.s})`, color: `rgba(201,160,90,${st.o})`, fontSize: 10, fontFamily: "'Segoe UI Symbol','Apple Symbols','Noto Sans Symbols',sans-serif", animation: `tarotDrift ${st.d}s ease-in-out infinite, tarotFade ${st.du}s ease-in-out infinite`, animationDelay: `${st.id * 0.7}s` }}>
            {st.sym}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ─── Tarot frame — thin rules, zodiac ring, precise corners ─────────────── */
function TarotCardFrame({ w, h, gradId }: { w: number; h: number; gradId: string }) {
  const gid = `url(#${gradId})`;
  const cx = w / 2, cy = h / 2;
  const rz = Math.min(w, h) * 0.31;
  const corners = [[10, 10, 0], [w - 10, 10, 90], [w - 10, h - 10, 180], [10, h - 10, 270]] as const;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e4d49a" /><stop offset="52%" stopColor="#c9a05a" /><stop offset="100%" stopColor="#6b5a32" />
        </linearGradient>
      </defs>
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={1.5} fill="none" stroke={gid} strokeWidth={0.38} opacity={0.52} />
      <rect x={7} y={7} width={w - 14} height={h - 14} rx={1} fill="none" stroke={gid} strokeWidth={0.22} opacity={0.28} />
      <circle cx={cx} cy={cy} r={rz} fill="none" stroke={gid} strokeWidth={0.2} opacity={0.14} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        const x1 = cx + (rz - 1.8) * Math.cos(a), y1 = cy + (rz - 1.8) * Math.sin(a);
        const x2 = cx + rz * Math.cos(a), y2 = cy + rz * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gid} strokeWidth={0.32} strokeLinecap="round" opacity={0.38} />;
      })}
      {corners.map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <path d="M0,0 L0,-9 M0,0 L9,0" fill="none" stroke={gid} strokeWidth={0.35} strokeLinecap="round" opacity={0.42} />
        </g>
      ))}
    </svg>
  );
}

/** Alternate-universe tarot frame — gold + moonlight blue, same geometry as {@link TarotCardFrame} */
function AuUniverseTarotFrame({ w, h, gradId }: { w: number; h: number; gradId: string }) {
  const gid = `url(#${gradId})`;
  const cx = w / 2, cy = h / 2;
  const rz = Math.min(w, h) * 0.31;
  const corners = [[10, 10, 0], [w - 10, 10, 90], [w - 10, h - 10, 180], [10, h - 10, 270]] as const;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4d2f0" /><stop offset="42%" stopColor="#d8c48a" /><stop offset="100%" stopColor="#5a6fa8" />
        </linearGradient>
      </defs>
      <rect x={3} y={3} width={w - 6} height={h - 6} rx={1.5} fill="none" stroke={gid} strokeWidth={0.38} opacity={0.5} />
      <rect x={7} y={7} width={w - 14} height={h - 14} rx={1} fill="none" stroke={gid} strokeWidth={0.22} opacity={0.3} />
      <circle cx={cx} cy={cy} r={rz} fill="none" stroke={gid} strokeWidth={0.2} opacity={0.16} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        const x1 = cx + (rz - 1.8) * Math.cos(a), y1 = cy + (rz - 1.8) * Math.sin(a);
        const x2 = cx + rz * Math.cos(a), y2 = cy + rz * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gid} strokeWidth={0.32} strokeLinecap="round" opacity={0.36} />;
      })}
      {corners.map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <path d="M0,0 L0,-9 M0,0 L9,0" fill="none" stroke={gid} strokeWidth={0.35} strokeLinecap="round" opacity={0.4} />
        </g>
      ))}
    </svg>
  );
}

/** Sparse dots + micro-stars — AU palette (moonlight + gold) */
function AuUniverseMysteryLayer({ w, h }: { w: number; h: number }) {
  const gridDots = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 3 !== 0) continue;
      const x = 18 + col * 29 + (row % 2) * 7;
      const y = 16 + row * 24;
      if (x < w - 10 && y < h - 10) {
        gridDots.push(<circle key={`au-g-${row}-${col}`} cx={x} cy={y} r={0.42} fill="rgba(140,170,230,0.5)" opacity={0.22} />);
      }
    }
  }
  const microStar = (id: string, tx: number, ty: number, sc: number, op: number, stroke: string) => (
    <path
      key={id}
      transform={`translate(${tx},${ty}) scale(${sc})`}
      d="M0,-4 L0.85,-0.85 L4,0 L0.85,0.85 L0,4 L-0.85,0.85 L-4,0 L-0.85,-0.85 Z"
      fill="none"
      stroke={stroke}
      strokeWidth={0.3}
      strokeLinejoin="round"
      opacity={op}
    />
  );
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      {gridDots}
      {microStar("au-s1", 22, 20, 0.82, 0.32, "rgba(180,195,235,0.75)")}
      {microStar("au-s2", w - 22, 20, 0.82, 0.32, "rgba(201,160,90,0.55)")}
      {microStar("au-s3", 22, h - 22, 0.82, 0.28, "rgba(140,170,230,0.6)")}
      {microStar("au-s4", w - 22, h - 22, 0.82, 0.28, "rgba(201,160,90,0.5)")}
      {microStar("au-s5", w / 2, 14, 0.6, 0.24, "rgba(200,210,245,0.5)")}
      <circle cx={w / 2} cy={h - 16} r={0.45} fill="rgba(201,160,90,0.65)" opacity={0.28} />
    </svg>
  );
}

function AuSideRails({ side }: { side?: "left" | "right" } = {}) {
  const n = 14;
  const make = (side: "left" | "right") => (
    <div
      key={side}
      aria-hidden
      style={{
        position: "absolute",
        [side]: 4,
        top: "11%",
        bottom: "18%",
        width: 11,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Array.from({ length: n }, (_, i) => {
        const star = i % 4 === 1;
        const delay = `${(i * 0.12).toFixed(2)}s`;
        return (
          <span
            key={i}
            style={{
              fontSize: star ? 9 : 5,
              lineHeight: 1,
              color: star ? "rgba(200,185,130,0.75)" : "rgba(130,160,220,0.45)",
              fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif",
              animation: `auRailTwinkle ${2.8 + (i % 5) * 0.35}s ease-in-out infinite`,
              animationDelay: delay,
              textShadow: star ? "0 0 8px rgba(201,160,90,0.45)" : "0 0 4px rgba(130,160,220,0.35)",
            }}
          >
            {star ? "\u2726" : "\u00b7"}
          </span>
        );
      })}
    </div>
  );
  return side ? make(side) : <>{make("left")}{make("right")}</>;
}

/** Sparse dots, micro-stars — vector only, uniform stroke weights */
function HeartbeatMysteryLayer({ w, h }: { w: number; h: number }) {
  const gridDots = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 9; col++) {
      if ((row + col) % 3 !== 0) continue;
      const x = 22 + col * 31 + (row % 2) * 8;
      const y = 18 + row * 26;
      if (x < w - 12 && y < h - 12) {
        gridDots.push(<circle key={`g-${row}-${col}`} cx={x} cy={y} r={0.45} fill="rgba(201,160,90,0.55)" opacity={0.2} />);
      }
    }
  }
  const microStar = (id: string, tx: number, ty: number, sc: number, op: number) => (
    <path
      key={id}
      transform={`translate(${tx},${ty}) scale(${sc})`}
      d="M0,-4 L0.85,-0.85 L4,0 L0.85,0.85 L0,4 L-0.85,0.85 L-4,0 L-0.85,-0.85 Z"
      fill="none"
      stroke="rgba(201,160,90,0.7)"
      strokeWidth={0.32}
      strokeLinejoin="round"
      opacity={op}
    />
  );
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      {gridDots}
      {microStar("s1", 24, 22, 0.85, 0.34)}
      {microStar("s2", w - 24, 22, 0.85, 0.34)}
      {microStar("s3", 24, h - 22, 0.85, 0.3)}
      {microStar("s4", w - 24, h - 22, 0.85, 0.3)}
      {microStar("s5", w / 2, 16, 0.65, 0.26)}
      <circle cx={w / 2} cy={h - 18} r={0.5} fill="rgba(201,160,90,0.55)" opacity={0.26} />
    </svg>
  );
}

function HeartbeatTarotCard({ text, hidden }: { text: string; hidden: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const gF = useId();
  const gB = `${gF}-b`;
  const hintId = `${gF}-hint`;
  if (hidden) return null;
  const cw = 304, ch = 152;
  const markSize = 22;
  return (
    <div style={{ width: "100%", maxWidth: "min(100%,360px)", marginTop: 14, perspective: 1300 }} role="region" aria-label="Heartbeat inner thought card">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        aria-describedby={hintId}
        aria-label={flipped ? "Inner thought shown. Activate to hide." : "Inner thought hidden. Activate to reveal."}
        style={{
          position: "relative",
          width: "100%",
          height: ch,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          borderRadius: 10,
          animation: "cardPulse 3.8s ease-in-out infinite",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.85s cubic-bezier(0.25,0.46,0.45,0.94)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>

          {/* Front */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              borderRadius: 10,
              overflow: "hidden",
              background: "linear-gradient(118deg, rgba(12,11,20,0.98) 0%, rgba(6,6,11,0.995) 55%, rgba(8,7,14,0.98) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(201,160,90,0.07)",
            }}
          >
            <HeartbeatMysteryLayer w={cw} h={ch} />
            <TarotCardFrame w={cw} h={ch} gradId={gF} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 22px", gap: 7 }}>
              <CelestialMark size={markSize} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(201,160,90,0.22))" }} />
                <div style={{ fontFamily: F.display, fontSize: 9, letterSpacing: 3.5, textTransform: "uppercase", color: T.gold.l, opacity: 0.88 }}>Heartbeat</div>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(201,160,90,0.22))" }} />
              </div>
              <p id={hintId} style={{ fontSize: 11.5, color: "rgba(232,226,216,0.72)", letterSpacing: 0.15, textAlign: "center", lineHeight: 1.5, margin: 0, fontFamily: F.ui, fontWeight: 300 }}>
                Tap to reveal a thought he never says aloud
              </p>
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 10,
              overflow: "hidden",
              background: "linear-gradient(118deg, rgba(9,8,16,0.99) 0%, rgba(4,4,8,0.995) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(201,160,90,0.06)",
            }}
          >
            <HeartbeatMysteryLayer w={cw} h={ch} />
            <TarotCardFrame w={cw} h={ch} gradId={gB} />
            <div style={{ position: "absolute", inset: 0, padding: "16px 20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 8.5, color: T.gold.l, letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 10, opacity: 0.85, display: "flex", alignItems: "center", gap: 8, fontFamily: F.ui, fontWeight: 500 }}>
                <span>Inner voice</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(201,160,90,0.26), transparent)" }} />
              </div>
              <blockquote style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.86, color: "rgba(238,232,222,0.94)", fontStyle: "italic", margin: 0, border: "none", padding: 0 }}>
                &ldquo;{text}&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ─── Header HUD icon buttons (rounded square + hover tooltip) ───────────── */
function HudToolButton({ ariaLabel, explanation, onClick, children, wide = false }: { ariaLabel: string; explanation: string; onClick: () => void; children: ReactNode; wide?: boolean }) {
  const [tip, setTip] = useState(false);
  const tipId = useId();
  const show = () => setTip(true);
  const hide = () => setTip(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }} onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={onClick}
        onFocus={show}
        onBlur={hide}
        aria-label={ariaLabel}
        aria-describedby={tip ? tipId : undefined}
        style={{
          width: wide ? 52 : HUD_BTN_PX,
          height: HUD_BTN_PX,
          borderRadius: HUD_RADIUS,
          border: `1px solid ${tip ? "rgba(201,160,90,0.42)" : "rgba(201,160,90,0.2)"}`,
          background: tip ? "rgba(14,14,22,0.72)" : "rgba(8,8,14,0.58)",
          backdropFilter: "blur(18px)",
          boxShadow: tip ? "0 0 0 1px rgba(201,160,90,0.08), 0 6px 20px rgba(0,0,0,0.35)" : "0 1px 0 rgba(255,255,255,0.04) inset",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.gold.l,
          transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {children}
      </button>
      {tip ? (
        <div
          id={tipId}
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 60,
            width: "max-content",
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${T.bdr.s}`,
            background: "rgba(10,10,18,0.96)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            fontFamily: F.ui,
            fontSize: 10.5,
            lineHeight: 1.45,
            color: T.txt.s,
            fontWeight: 400,
            pointerEvents: "none",
            textAlign: "left",
            animation: "fadeIn 0.15s ease both",
          }}
        >
          {explanation}
        </div>
      ) : null}
    </div>
  );
}

function VinylGlyph({ playing }: { playing: boolean }) {
  const gid = useId();
  const sz = HUD_BTN_PX - 10;
  return (
    <svg width={sz} height={sz} viewBox="0 0 36 36" style={{ animation: playing ? "vinylSpin 12s linear infinite" : "none" }} aria-hidden>
      <defs><radialGradient id={gid} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#101018" /><stop offset="100%" stopColor="#050508" /></radialGradient></defs>
      <circle cx="18" cy="18" r="17" fill={`url(#${gid})`} stroke="rgba(201,160,90,0.2)" strokeWidth="0.55" />
      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(201,160,90,0.1)" strokeWidth="0.32" />
      <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(201,160,90,0.08)" strokeWidth="0.28" />
      <circle cx="18" cy="18" r="3.2" fill="rgba(201,160,90,0.88)" />
      <circle cx="18" cy="18" r="1.1" fill="#070710" />
    </svg>
  );
}

/* ─── Click FX + cursor trail ────────────────────────────────────────────── */
function useClickFx() {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      ["\u2726", "\u00b7", "\u2727"].forEach((sym, i) => {
        const el = document.createElement("span");
        el.textContent = sym;
        Object.assign(el.style, { position: "fixed", left: `${e.clientX + (Math.random() - 0.5) * 22}px`, top: `${e.clientY + (Math.random() - 0.5) * 22}px`, pointerEvents: "none", zIndex: "99999", fontSize: "9px", color: T.gold.l, animation: "cStar 0.55s ease-out forwards", animationDelay: `${i * 40}ms`, fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif" });
        document.body.appendChild(el); setTimeout(() => el.remove(), 650);
      });
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);
}
function useCursorTrail() {
  useEffect(() => {
    let t = 0;
    const h = (e: MouseEvent) => {
      t++; if (t % 6 !== 0) return;
      const d = document.createElement("div");
      const sz = 1.5 + Math.random() * 1.5;
      Object.assign(d.style, { position: "fixed", left: `${e.clientX}px`, top: `${e.clientY}px`, width: `${sz}px`, height: `${sz}px`, borderRadius: "50%", background: T.gold.p, pointerEvents: "none", zIndex: "99997", animation: "tFade 0.65s ease-out forwards", opacity: "0.4" });
      document.body.appendChild(d); setTimeout(() => d.remove(), 750);
    };
    document.addEventListener("mousemove", h);
    return () => document.removeEventListener("mousemove", h);
  }, []);
}

/* ─── Share character (prototype flow) ───────────────────────────────────── */
function ShareCharacterModal({ characterName, onClose }: { characterName: string; onClose: () => void }) {
  const [on, setOn] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 30);
    return () => clearTimeout(id);
  }, []);
  const close = () => {
    setOn(false);
    setTimeout(onClose, 320);
  };
  const link = typeof window !== "undefined" ? window.location.href : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); } catch {}
    setCopied(true);
    setTimeout(() => { setCopied(false); close(); }, 1400);
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="share-char-title"
      style={{ position: "fixed", inset: 0, zIndex: 520, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: on ? "rgba(4,4,10,0.78)" : "transparent", backdropFilter: on ? "blur(14px)" : "none", transition: "background 0.35s ease" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(400px, 100%)",
          borderRadius: 20,
          border: `1px solid ${T.bdr.s}`,
          background: "rgba(10,10,18,0.97)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          opacity: on ? 1 : 0,
          transform: on ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 id="share-char-title" style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: T.txt.p, margin: 0, lineHeight: 1.3 }}>Share {characterName}</h2>
            <p style={{ margin: "5px 0 0", fontSize: 10.5, color: T.txt.d, lineHeight: 1.5 }}>Copy this link and share with anyone.</p>
          </div>
          <button type="button" aria-label="Close" onClick={close} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.bdr.f}`, background: "transparent", color: T.txt.d, cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>&times;</button>
        </div>

        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.bdr.f}`, background: "rgba(6,6,12,0.85)", fontFamily: "ui-monospace,Menlo,monospace", fontSize: 10, color: T.txt.s, wordBreak: "break-all", lineHeight: 1.6, marginBottom: 12 }}>{link}</div>
          <button
            type="button"
            onClick={() => void copy()}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 10,
              border: `1px solid ${copied ? "rgba(100,180,80,0.5)" : T.bdr.g}`,
              background: copied ? "rgba(80,160,60,0.22)" : T.glow.g,
              color: copied ? "rgba(140,220,100,0.95)" : T.gold.l,
              fontFamily: F.ui, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
              transition: "all 0.25s ease",
            }}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>

        </div>
      </div>
    </div>
  );
}

function ResetMemoryModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 30);
    return () => clearTimeout(id);
  }, []);
  const close = () => {
    setOn(false);
    setTimeout(onCancel, 280);
  };
  const confirm = () => {
    setOn(false);
    setTimeout(onConfirm, 220);
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="reset-memory-title"
      style={{ position: "fixed", inset: 0, zIndex: 520, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: on ? "rgba(4,4,10,0.78)" : "transparent", backdropFilter: on ? "blur(14px)" : "none", transition: "background 0.35s ease" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          borderRadius: 16,
          border: `1px solid ${T.bdr.s}`,
          background: "rgba(10,10,18,0.96)",
          boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
          opacity: on ? 1 : 0,
          transform: on ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
          transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}
      >
        <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${T.bdr.f}` }}>
          <div style={{ fontSize: 10, color: T.gold.d, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Warning</div>
          <h2 id="reset-memory-title" style={{ margin: 0, fontFamily: F.display, fontSize: 18, fontWeight: 600, color: T.txt.p, lineHeight: 1.35 }}>
            Reset memory and restart?
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: T.txt.d, lineHeight: 1.6 }}>
            This will clear the current conversation state and return to the opening line.
          </p>
        </div>
        <div style={{ padding: "14px 20px 20px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={close} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.bdr.f}`, background: "transparent", color: T.txt.s, fontFamily: F.ui, fontSize: 12.5, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={confirm} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.bdr.g}`, background: T.glow.g, color: T.gold.l, fontFamily: F.ui, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AU Overlay ─────────────────────────────────────────────────────────── */
function AUOverlay({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState(false);
  useEffect(() => { const id = setTimeout(() => setS(true), 40); return () => clearTimeout(id); }, []);
  const close = () => { setS(false); setTimeout(onClose, 380); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: s ? "rgba(4,5,10,0.93)" : "transparent", backdropFilter: s ? "blur(24px)" : "none", transition: "all 0.45s ease" }}>
      <div style={{ maxWidth: 740, width: "90%", background: "rgba(5,7,14,0.97)", border: `1px solid ${T.au.border}`, borderRadius: 18, overflow: "hidden", opacity: s ? 1 : 0, transform: s ? "scale(1) translateY(0)" : "scale(0.94) translateY(18px)", transition: "all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)", boxShadow: "0 0 60px rgba(85,128,200,0.1),0 40px 100px rgba(0,0,0,0.7)", display: "flex" }}>
        <div style={{ flex: 1, padding: "36px 30px 30px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: T.au.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, opacity: 0.75 }}>Alternate Universe Event</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: T.au.text, lineHeight: 1.25, marginBottom: 6 }}>{AU_EVENT.title}</div>
            <div style={{ fontSize: 11, color: "rgba(85,128,200,0.45)", letterSpacing: 1.5, textTransform: "uppercase" }}>{AU_EVENT.intro}</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: 18 }}>
            <div style={{ fontSize: 14, lineHeight: 2.05, color: "rgba(188,204,232,0.75)", whiteSpace: "pre-line" }}>{AU_EVENT.text}</div>
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(85,128,200,0.4)", marginBottom: 20, lineHeight: 1.7 }}>{AU_EVENT.narration}</div>
          <button onClick={close} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(85,128,200,0.08)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            style={{ padding: "11px 0", borderRadius: 10, border: `1px solid ${T.au.border}`, background: "transparent", color: T.au.text, fontSize: 13, cursor: "pointer", fontFamily: F.ui, transition: "all 0.25s ease", letterSpacing: 0.8 }}>
            &larr; Return to reality
          </button>
        </div>
        <div style={{ width: 268, flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src={AU_HERO_IMG} alt="Alternate Lucien" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%", filter: "brightness(0.94) contrast(1.03) saturate(0.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(5,7,14,0.82) 0%,rgba(5,7,14,0.12) 48%,transparent 78%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(5,7,14,0.75) 0%,transparent 50%)" }} />
          <div style={{ position: "absolute", inset: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
            <div style={{ fontSize: 9, color: "rgba(160,185,230,0.75)", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 5 }}>New appearance</div>
            <div style={{ fontSize: 12.5, color: T.au.text, lineHeight: 1.5, opacity: 0.92, fontStyle: "italic", fontFamily: F.body }}>{AU_EVENT.appearanceNote}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Story Pane (inside right sidebar) ─────────────────────────────────── */
/* ─── Story Overlay (full-screen) ───────────────────────────────────────── */
function StoryOverlay({ onClose, liked, setLiked, related, setRelated }: {
  onClose: () => void;
  liked: Record<number, boolean>; setLiked: (fn: (p: Record<number, boolean>) => Record<number, boolean>) => void;
  related: Record<number, boolean>; setRelated: (fn: (p: Record<number, boolean>) => Record<number, boolean>) => void;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 20); return () => clearTimeout(t); }, []);
  const close = () => { setVis(false); setTimeout(onClose, 400); };
  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center",
        background: vis ? "rgba(4,4,8,0.82)" : "transparent",
        transition: "background 0.4s ease", backdropFilter: vis ? "blur(18px)" : "none" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "min(720px,92vw)", maxHeight: "82vh", background: "rgba(8,8,14,0.97)", border: `1px solid ${T.bdr.s}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,83,0.06)",
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 18px", borderBottom: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <CelestialMark size={22} />
              <div style={{ fontSize: 9, color: T.gold.d, letterSpacing: 4, textTransform: "uppercase", fontFamily: F.ui }}>Story Unlocks</div>
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: T.txt.p, letterSpacing: 0.3 }}>Hidden Moments</div>
            <div style={{ fontSize: 11, color: T.txt.d, marginTop: 4 }}>Unlock fragments of Lucien&apos;s past as your bond deepens.</div>
          </div>
          <PaneCloseBtn onClick={close} ariaLabel="Close story" />
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, alignContent: "start" }}>
          {STORY_UNLOCK_POSTS.slice(0, 1).map((post, i) => (
            <div key={post.id} style={{ borderRadius: 13, border: `1px solid ${T.bdr.f}`, background: "rgba(10,10,18,0.6)", overflow: "hidden", animation: `slideUp 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.08}s both` }}>
              <div style={{ padding: "20px 20px 15px", textAlign: "center", borderBottom: `0.5px solid rgba(212,168,83,0.08)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right,transparent,rgba(212,168,83,0.25))` }} />
                  <CelestialMark size={26} />
                  <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to left,transparent,rgba(212,168,83,0.25))` }} />
                </div>
                <div style={{ fontSize: 10, color: T.txt.d, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 6 }}>{post.chapter}</div>
                <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 500, color: T.txt.p, lineHeight: 1.3 }}>{post.title}</div>
              </div>
              <div style={{ padding: "16px 20px 14px" }}>
                <div style={{ fontFamily: F.body, fontSize: 14, lineHeight: 1.88, color: T.txt.s }}>{post.text}</div>
                <div style={{ marginTop: 14 }}><OrnamentRule opacity={0.22} /></div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                  <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: "none", border: "none", color: liked[post.id] ? T.rose.p : T.txt.d, fontSize: 15, cursor: "pointer", fontFamily: F.ui, transition: "color 0.2s ease, transform 0.15s ease", display: "flex", alignItems: "center", gap: 5, transform: liked[post.id] ? "scale(1.12)" : "scale(1)" }}>
                    <span style={{ fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif" }}>{liked[post.id] ? "♥" : "♡"}</span>
                  </button>
                  <button onClick={() => setRelated(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: "none", border: "none", color: related[post.id] ? T.gold.p : T.txt.d, fontSize: 12, cursor: "pointer", fontFamily: F.ui, transition: "color 0.2s ease", padding: 0 }}>
                    Relate
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Locked fragments */}
          {[{ title: "Letters to No One", chapter: "Locked · Bond Lv 3" }, { title: "The East Wing", chapter: "Locked · Bond Lv 5" }].map((locked, i) => (
            <div key={i} style={{ borderRadius: 13, border: `1px solid ${T.bdr.f}`, background: "rgba(8,8,14,0.5)", overflow: "hidden", opacity: 0.45, animation: `slideUp 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${(i + 1) * 0.1}s both` }}>
              <div style={{ padding: "20px 20px 15px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: T.txt.m, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{locked.chapter}</div>
                <div style={{ fontFamily: F.display, fontSize: 16, color: T.txt.d }}>{locked.title}</div>
                <div style={{ marginTop: 14, fontSize: 20, opacity: 0.3 }}>&#128274;</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Story Pane (kept for compatibility) ────────────────────────────────── */
function StoryPane({ onBack, liked, setLiked, related, setRelated }: {
  onBack: () => void;
  liked: Record<number, boolean>; setLiked: (fn: (p: Record<number, boolean>) => Record<number, boolean>) => void;
  related: Record<number, boolean>; setRelated: (fn: (p: Record<number, boolean>) => Record<number, boolean>) => void;
}) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 13px", borderBottom: `1px solid ${T.bdr.f}` }}>
        <PaneCloseBtn onClick={onBack} ariaLabel="Close story panel" />
        <OrnamentRule opacity={0.35} />
        <div style={{ marginTop: 11, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.gold.d, letterSpacing: 3, textTransform: "uppercase", marginBottom: 3 }}>Story Unlocks</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: T.txt.p }}>Hidden Moments</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>
        {STORY_UNLOCK_POSTS.slice(0, 1).map((post, i) => (
          <div key={post.id} style={{ marginBottom: 14, borderRadius: 11, border: `1px solid ${T.bdr.f}`, background: "rgba(10,10,18,0.6)", overflow: "hidden", animation: `paneIn 0.45s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.08}s both` }}>
            {/* Ornamental header */}
            <div style={{ padding: "16px 16px 12px", textAlign: "center", borderBottom: `0.5px solid rgba(201,160,90,0.08)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right,transparent,rgba(201,160,90,0.22))` }} />
                <CelestialMark size={24} />
                <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to left,transparent,rgba(201,160,90,0.22))` }} />
              </div>
              <div style={{ fontSize: 10, color: T.txt.d, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{post.chapter}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.txt.p, lineHeight: 1.3 }}>{post.title}</div>
            </div>
            {/* Body */}
            <div style={{ padding: "13px 16px 11px" }}>
              <div style={{ fontSize: 13, lineHeight: 1.85, color: T.txt.s }}>{post.text}</div>
              <OrnamentRule opacity={0.2} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 3 }}>
                <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: "none", border: "none", color: liked[post.id] ? T.rose.p : T.txt.d, fontSize: 12, cursor: "pointer", fontFamily: F.ui, transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif" }}>{liked[post.id] ? "\u2665" : "\u2661"}</span>
                </button>
                <button onClick={() => setRelated(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: "none", border: "none", color: related[post.id] ? T.gold.p : T.txt.d, fontSize: 12, cursor: "pointer", fontFamily: F.ui, transition: "color 0.2s ease" }}>
                  Relate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Moments Pane ───────────────────────────────────────────────────────── */
function MomentsPane({ onBack, liked, setLiked }: {
  onBack: () => void;
  liked: Record<number, boolean>; setLiked: (fn: (p: Record<number, boolean>) => Record<number, boolean>) => void;
}) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Cover header wrapper — relative container so avatar can overflow */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Cover image — overflow hidden for the bg image/gradients */}
        <div style={{ height: 136, overflow: "hidden", background: T.bg.deep }}>
          <img src="/assets/ai-character/character.PNG" alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.42) saturate(0.68)" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,7,12,1) 0%, rgba(7,7,12,0.45) 52%, transparent 100%)" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(7,7,12,0.62) 0%, transparent 60%)" }} />
          <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 288 136" preserveAspectRatio="none" fill="none">
            <path d="M6,22 L6,8 L20,8" stroke="rgba(212,168,83,0.35)" strokeWidth="0.7" strokeLinecap="round" />
            <path d="M282,22 L282,8 L268,8" stroke="rgba(212,168,83,0.35)" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", top: 10, right: 10 }}><PaneCloseBtn onClick={onBack} /></div>
        </div>
        {/* Avatar — outside overflow:hidden so it shows above the section below */}
        <div style={{ position: "absolute", bottom: -24, left: 16, zIndex: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${T.gold.p}`, overflow: "hidden", boxShadow: `0 0 20px rgba(212,168,83,0.38), 0 4px 14px rgba(0,0,0,0.6)` }}>
            <img src="/assets/ai-character/character.PNG" alt={CHAR_NAME} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
          </div>
        </div>
      </div>

      {/* Name + ornament */}
      <div style={{ padding: "34px 16px 10px", borderBottom: `0.5px solid ${T.bdr.f}` }}>
        <div style={{ fontFamily: F.display, fontSize: 14, fontWeight: 600, color: T.txt.p, marginBottom: 1 }}>{CHAR_NAME}</div>
        <div style={{ fontSize: 10, color: T.gold.d, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>Private moments</div>
        <OrnamentRule opacity={0.22} />
      </div>

      {/* Posts */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {MOMENTS.slice(0, 1).map((m, i) => (
          <div key={i} style={{ padding: "16px 16px 14px", borderBottom: `0.5px solid rgba(212,168,83,0.07)`, animation: `paneIn 0.4s ease ${i * 0.08}s both` }}>
            {/* Row: avatar + name + mood tag */}
            <div style={{ display: "flex", gap: 9, marginBottom: 10, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `1px solid ${T.bdr.g}` }}>
                <img src="/assets/ai-character/character.PNG" alt={CHAR_NAME} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: T.txt.p, flex: 1 }}>{CHAR_NAME}</div>
              <div style={{ fontSize: 8, padding: "2px 6px", borderRadius: 6, border: `0.5px solid ${T.bdr.s}`, color: T.gold.d, letterSpacing: 1, textTransform: "uppercase" }}>{m.mood}</div>
            </div>
            {/* Quote */}
            <div style={{ fontFamily: F.body, fontSize: 13.5, lineHeight: 1.95, color: T.txt.s, paddingLeft: 37, marginBottom: 4 }}>&ldquo;{m.text}&rdquo;</div>
            {/* Ornament divider */}
            <div style={{ paddingLeft: 37, paddingRight: 4, marginBottom: 8, marginTop: 10 }}>
              <div style={{ height: "0.5px", background: `linear-gradient(to right, transparent, rgba(212,168,83,0.18), transparent)` }} />
            </div>
            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 37 }}>
              <div style={{ fontSize: 9.5, color: T.txt.m, letterSpacing: 0.3 }}>{m.time}</div>
              <button onClick={() => setLiked(p => ({ ...p, [i]: !p[i] }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: liked[i] ? T.rose.p : "rgba(255,255,255,0.25)", fontSize: 15, display: "flex", alignItems: "center", transition: "color 0.2s ease, transform 0.15s ease", transform: liked[i] ? "scale(1.18)" : "scale(1)" }}>
                <span style={{ fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif" }}>{liked[i] ? "♥" : "♡"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ─── Character Pane (default right panel) ───────────────────────────────── */
function CharacterPane() {
  return (
    <>
      <div style={{ padding: "20px 18px 14px", borderBottom: `1px solid ${T.bdr.f}` }}>
        <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: T.txt.p, letterSpacing: 0.3, lineHeight: 1.25, marginBottom: 4 }}>{CHAR_NAME}</div>
        <div style={{ fontSize: 11, color: T.txt.d, letterSpacing: 0.8 }}>Heir to the Ashford Legacy</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 22px" }}>
        <div style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.85, color: T.txt.d, marginBottom: 20 }}>{CHARACTER_STORY_BLURB}</div>

        <div style={{ fontSize: 9, color: T.txt.m, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 12 }}>Getting Started</div>
        {[
          { num: "01", label: "Inspire", desc: "Choose from 3 candidate replies, each with a distinct emotional tone" },
          { num: "02", label: "Heartbeat", desc: "Flip the tarot card to hear the thought he won't say aloud" },
          { num: "03", label: "Continue", desc: "Extend the scene naturally — no retyping, just one click" },
          { num: "04", label: "Alt Universe", desc: "Step into another timeline — same soul, different world" },
        ].map((item, i) => (
          <div key={item.num} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: i < 3 ? `0.5px solid rgba(201,160,90,0.06)` : "none", alignItems: "flex-start" }}>
            <div style={{ fontSize: 9, color: T.gold.dk, fontFamily: "ui-monospace,monospace", letterSpacing: 1, marginTop: 2, minWidth: 20, flexShrink: 0 }}>{item.num}</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: T.txt.s, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: T.txt.d, lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 18 }}><OrnamentRule opacity={0.2} /></div>

        <div style={{ marginTop: 16, padding: "15px 16px", borderRadius: 12, border: `1px solid ${T.bdr.f}`, background: "rgba(201,160,90,0.03)" }}>
          <div style={{ fontSize: 8.5, color: T.gold.d, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>His words</div>
          <div style={{ fontFamily: F.body, fontSize: 13.5, lineHeight: 1.95, color: T.txt.s, fontStyle: "italic" }}>
            &ldquo;I have worn a thousand masks. But when I look at you, I forget every line I ever rehearsed.&rdquo;
          </div>
        </div>

        <div style={{ marginTop: 14, textAlign: "center", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.015)", border: `0.5px solid ${T.bdr.f}` }}>
          <div style={{ fontSize: 11, color: T.txt.d, lineHeight: 1.6 }}>Click <span style={{ color: T.gold.l, fontWeight: 500 }}>Inspire</span> below to begin</div>
        </div>
      </div>
    </>
  );
}

/* ─── Feature Button ─────────────────────────────────────────────────────── */
function FeatureBtn({ icon, label, desc, onClick, active }: { icon: string; label: string; desc: string; onClick: () => void; active: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} aria-current={active ? "true" : undefined} aria-label={`${label}. ${desc}`}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 11px", borderRadius: 9, cursor: "pointer", border: "1px solid transparent", background: "transparent", boxShadow: "none", transition: "all 0.28s cubic-bezier(0.25,0.46,0.45,0.94)", transform: h ? "translateY(-1px)" : "none", position: "relative", minWidth: 58 }}>
      <span aria-hidden style={{ width: FEATURE_ICON_PX, height: FEATURE_ICON_PX, display: "flex", alignItems: "center", justifyContent: "center", fontSize: FEATURE_ICON_PX, lineHeight: 1, color: active ? T.gold.l : h ? T.gold.l : T.txt.d, textShadow: active ? "0 0 12px rgba(242,218,144,0.72), 0 0 28px rgba(212,168,83,0.34)" : "none", transition: "color 0.22s ease, text-shadow 0.22s ease", opacity: h || active ? 1 : 0.68, fontFamily: "'Segoe UI Symbol','Apple Symbols',sans-serif" }}>{icon}</span>
      <span style={{ fontSize: 10, color: active ? T.gold.l : h ? T.txt.p : T.txt.d, textShadow: active ? "0 0 12px rgba(242,218,144,0.52), 0 0 24px rgba(96,144,216,0.2)" : "none", fontWeight: active ? 500 : 300, letterSpacing: 0.45, transition: "color 0.22s ease, text-shadow 0.22s ease", textAlign: "center", fontFamily: F.ui, whiteSpace: "nowrap" }}>{label}</span>
      {h && !active && (
        <div style={{ position: "absolute", bottom: "calc(100% + 7px)", left: "50%", transform: "translateX(-50%)", width: "max-content", maxWidth: "min(420px, calc(100vw - 32px))", padding: "10px 12px", borderRadius: 7, background: "rgba(8,8,14,0.96)", border: `1px solid ${T.bdr.s}`, fontSize: 10.5, lineHeight: 1.45, color: T.txt.s, boxShadow: "0 6px 24px rgba(0,0,0,0.5)", animation: "fadeIn 0.15s ease both", zIndex: 10, pointerEvents: "none", fontFamily: F.ui, textAlign: "center" }}>
          {desc}
        </div>
      )}
    </button>
  );
}

function AlternateUniverseMessageCard({ onEnterNewWorld }: { onEnterNewWorld: () => void }) {
  const CW = 320;
  const CH = 520;
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = bgVideoRef.current;
    if (!v) return;
    const apply = () => {
      try {
        v.playbackRate = AU_CARD_VIDEO_RATE;
      } catch {
        /* ignore */
      }
    };
    apply();
    v.addEventListener("loadedmetadata", apply);
    void v.play().catch(() => {});
    return () => v.removeEventListener("loadedmetadata", apply);
  }, []);
  return (
    <div style={{ width: "100%", margin: 0, position: "relative" }}>
      <div
        role="article"
        aria-label={`${AU_EVENT.title}. Alternate universe event.`}
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          height: "min(38vh, 360px)",
          minHeight: 306,
          display: "flex",
          background: "linear-gradient(90deg, rgba(2,3,9,1) 0%, rgba(2,3,9,0.99) 48%, rgba(4,10,24,0.98) 68%, rgba(2,5,15,0.96) 100%)",
          boxShadow: "0 18px 52px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(96,144,216,0.12)",
          animation: "auCardGlow 4.2s ease-in-out infinite",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "52%", zIndex: 0, overflow: "hidden" }}>
          <video
            ref={bgVideoRef}
            src={AU_CARD_BG_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              filter: "brightness(0.7) contrast(1.06) saturate(0.9)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(2,3,9,1) 0%, rgba(2,3,9,0.94) 18%, rgba(2,5,14,0.74) 34%, rgba(4,10,24,0.2) 66%, rgba(2,3,9,0.38) 100%), radial-gradient(ellipse 72% 120% at 0% 50%, rgba(0,0,0,0.82), transparent 72%), radial-gradient(ellipse 82% 92% at 42% 50%, rgba(42,74,132,0.14), transparent 74%), linear-gradient(to top, rgba(2,3,9,0.88), transparent 58%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
            <AuUniverseMysteryLayer w={CW} h={CH} />
            <AuSideRails side="right" />
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 120% 95% at 50% 50%, transparent 54%, rgba(0,0,0,0.34) 100%), linear-gradient(125deg, transparent 38%, rgba(255,255,255,0.045) 50%, transparent 64%)",
            animation: "auShimmerSlide 6.5s ease-in-out infinite",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: 0.85,
          }}
        />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", width: "54%", minHeight: 0, height: "100%", padding: "20px 24px 18px 24px", isolation: "isolate" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12, flexShrink: 0 }}>
            <CelestialMark size={18} />
            <span style={{ fontFamily: F.ui, fontSize: 9.5, letterSpacing: 2.8, textTransform: "uppercase", color: T.gold.l, opacity: 0.78, whiteSpace: "nowrap" }}>New world</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,160,90,0.34), rgba(130,160,220,0.28), transparent)" }} />
          </div>

          <div style={{ flexShrink: 0, marginBottom: 12 }}>
            <div style={{ fontSize: 9.5, letterSpacing: 2.1, textTransform: "uppercase", color: "rgba(116,156,226,0.68)", marginBottom: 6, fontFamily: F.ui }}>{AU_EVENT.intro}</div>
            <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: T.au.text, lineHeight: 1.14, textShadow: "0 0 24px rgba(96,144,216,0.22)" }}>{AU_EVENT.title}</div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              paddingRight: 0,
              marginBottom: 0,
            }}
          >
            <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "rgba(218,226,246,0.94)", whiteSpace: "pre-line", fontFamily: F.body, marginBottom: 9 }}>{AU_EVENT.text}</div>
            <div style={{ fontSize: 12, color: "rgba(148,176,230,0.62)", lineHeight: 1.45, fontStyle: "italic", paddingLeft: 11, borderLeft: `2px solid rgba(130,160,220,0.35)` }}>{AU_EVENT.narration}</div>
          </div>

          <div style={{ flexShrink: 0, marginTop: 16, paddingTop: 13, borderTop: "1px solid rgba(130,160,220,0.16)" }}>
            <button
              type="button"
              onClick={onEnterNewWorld}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(244,236,214,0.98)";
                e.currentTarget.style.textShadow = "0 0 28px rgba(201,160,90,0.45), 0 0 48px rgba(85,128,200,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(214,222,242,0.94)";
                e.currentTarget.style.textShadow = "none";
              }}
              style={{
                width: "max-content",
                padding: 0,
                margin: 0,
                border: "none",
                borderRadius: 0,
                background: "transparent",
                color: "rgba(214,222,242,0.94)",
                fontSize: 15.5,
                lineHeight: 1.35,
                cursor: "pointer",
                fontFamily: F.body,
                fontWeight: 600,
                fontStyle: "italic",
                letterSpacing: "0.07em",
                transition: "color 0.28s ease, text-shadow 0.28s ease",
              }}
            >
              Enter New World &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Inspiration Panel ──────────────────────────────────────────────────── */
function InspirationPanel({ onSelect, disabled }: { onSelect: (i: number) => void; disabled: boolean }) {
  return (
    <div style={{ animation: "slideUp 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <div style={{ fontSize: 10, color: T.txt.d, letterSpacing: 1.8, textTransform: "uppercase" }}>Suggested replies</div>
        <div style={{ height: "0.5px", flex: 1, background: `linear-gradient(90deg,${T.bdr.s},transparent)` }} />
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        {INSPIRATION_RESPONSES.map((r, i) => (
          <InspirationCard key={r.label} data={r} onSelect={() => onSelect(i)} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

function InspirationCard({ data, onSelect, disabled }: { data: { label: string; emotion: string; text: string; action: string }; onSelect: () => void; disabled: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={disabled ? undefined : onSelect} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ flex: 1, padding: "14px 15px", borderRadius: 14, border: `1px solid ${h && !disabled ? T.bdr.s : T.bdr.f}`, background: h && !disabled ? "rgba(14,14,24,0.88)" : "rgba(10,10,18,0.56)", backdropFilter: "blur(20px)", cursor: disabled ? "default" : "pointer", transition: "all 0.26s cubic-bezier(0.25,0.46,0.45,0.94)", opacity: disabled ? 0.35 : 1, transform: h && !disabled ? "translateY(-2px)" : "none", boxShadow: h && !disabled ? `0 12px 32px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(212,168,83,0.12) inset` : "none" }}>
      <div style={{ fontSize: 12.5, fontWeight: 500, color: T.gold.l, marginBottom: 7, letterSpacing: 0.2 }}>{data.label}</div>
      <div style={{ fontSize: 12, color: T.txt.s, lineHeight: 1.75, marginBottom: 7 }}>{data.text}</div>
      <div style={{ fontSize: 10.5, color: T.txt.d, lineHeight: 1.5, fontStyle: "italic" }}>{data.action}</div>
      <div style={{ marginTop: 9, paddingTop: 7, borderTop: `0.5px solid rgba(201,160,90,0.07)`, display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 3.5, height: 3.5, borderRadius: 2, background: T.gold.dk }} />
        <span style={{ fontSize: 9.5, color: T.txt.m, letterSpacing: 0.7 }}>{data.emotion}</span>
      </div>
    </div>
  );
}

/* ─── Demo Guide ─────────────────────────────────────────────────────────── */
function DemoGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  return (
    <div style={{ position: "fixed", bottom: 22, left: 20, zIndex: 400, fontFamily: F.ui }}>
      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, width: 300, background: "rgba(7,7,12,0.97)", border: `1px solid ${T.bdr.s}`, borderRadius: 13, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", animation: "slideUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.txt.p }}>Demo Script</div>
              <div style={{ fontSize: 10.5, color: T.txt.d, marginTop: 2 }}>2-min walkthrough</div>
            </div>
            <div style={{ fontSize: 10.5, color: T.txt.d }}>{step + 1} / {DEMO_STEPS.length}</div>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {DEMO_STEPS.map((ds, i) => (
              <div key={ds.step} onClick={() => setStep(i)} style={{ padding: "9px 16px", cursor: "pointer", background: i === step ? T.glow.g : "transparent", borderLeft: `2px solid ${i === step ? T.gold.p : "transparent"}`, transition: "all 0.18s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i === step ? 4 : 0 }}>
                  <div style={{ fontSize: 10, color: T.txt.d, minWidth: 32, fontFamily: "ui-monospace,monospace" }}>{ds.time}</div>
                  <div style={{ fontSize: 12, fontWeight: i === step ? 500 : 400, color: i === step ? T.gold.l : T.txt.s }}>{ds.label}</div>
                  {i < step && <div style={{ marginLeft: "auto", fontSize: 10, color: "#62a872" }}>&#10003;</div>}
                </div>
                {i === step && <div style={{ fontSize: 11.5, color: T.txt.s, lineHeight: 1.65, paddingLeft: 39 }}>{ds.hint}</div>}
              </div>
            ))}
          </div>
          <div style={{ padding: "9px 14px", borderTop: `1px solid ${T.bdr.f}`, display: "flex", gap: 7 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${T.bdr.f}`, background: "transparent", color: step === 0 ? T.txt.m : T.txt.s, fontSize: 11, cursor: step === 0 ? "default" : "pointer", fontFamily: F.ui, opacity: step === 0 ? 0.4 : 1 }}>&larr; Prev</button>
            <button onClick={() => setStep(s => Math.min(DEMO_STEPS.length - 1, s + 1))} disabled={step === DEMO_STEPS.length - 1} style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: `1px solid ${step < DEMO_STEPS.length - 1 ? T.bdr.g : T.bdr.f}`, background: step < DEMO_STEPS.length - 1 ? T.glow.g : "transparent", color: step < DEMO_STEPS.length - 1 ? T.gold.l : T.txt.m, fontSize: 11, cursor: step === DEMO_STEPS.length - 1 ? "default" : "pointer", fontFamily: F.ui }}>Next &rarr;</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)} style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${open ? T.bdr.g : T.bdr.s}`, background: open ? T.glow.g : "rgba(8,8,14,0.82)", backdropFilter: "blur(16px)", color: open ? T.gold.l : T.txt.d, cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.4)", transition: "all 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, fontFamily: F.ui }}>
        <div style={{ fontSize: 10 }}>&#9658;</div>
        <div style={{ fontSize: 7, letterSpacing: 0.3, opacity: 0.7 }}>DEMO</div>
      </button>
    </div>
  );
}

/* ─── Pane Close Button — shared system ────────────────────────────────── */
function PaneCloseBtn({ onClick, ariaLabel = "Close panel" }: { onClick: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.bdr.f}`, background: "transparent", color: T.txt.d, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, transition: "all 0.2s ease" }}
      onMouseEnter={e => { e.currentTarget.style.color = T.txt.p; e.currentTarget.style.borderColor = T.bdr.s; e.currentTarget.style.background = T.glow.g; }}
      onMouseLeave={e => { e.currentTarget.style.color = T.txt.d; e.currentTarget.style.borderColor = T.bdr.f; e.currentTarget.style.background = "transparent"; }}
    >
      &#215;
    </button>
  );
}

/* ─── Demo Pane (right sidebar) ─────────────────────────────────────────── */
type DemoAction = (() => void) | null;

const DEMO_STEP_META: Record<number, { cta: string }> = {
  1: { cta: "" },
  2: { cta: "" },
  3: { cta: "Open Inspire →" },
  4: { cta: "" },
  5: { cta: "" },
  6: { cta: "Open Story →" },
  7: { cta: "Alt Universe →" },
  8: { cta: "Open Moments →" },
  9: { cta: "Open </> Code →" },
};

function DemoPane({ onBack, onActionMap }: {
  onBack: () => void;
  onActionMap: Record<number, DemoAction>;
}) {
  const [step, setStep] = useState(0);
  const current = DEMO_STEPS[step];
  const ctaLabel = DEMO_STEP_META[current.step]?.cta ?? "";
  const action = onActionMap[current.step] ?? null;
  const canNext = step < DEMO_STEPS.length - 1;
  const canPrev = step > 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: T.gold.l, letterSpacing: 1.5 }}>Demo Script</div>
          <div style={{ fontSize: 10, color: T.txt.d, marginTop: 2 }}>Step {step + 1} of {DEMO_STEPS.length}</div>
        </div>
        <PaneCloseBtn onClick={onBack} ariaLabel="Close demo guide" />
      </div>

      {/* Progress segments */}
      <div style={{ padding: "10px 16px 0", display: "flex", gap: 3, flexShrink: 0 }}>
        {DEMO_STEPS.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{ flex: 1, height: 2, borderRadius: 1, background: i < step ? T.gold.d : i === step ? T.gold.p : "rgba(212,168,83,0.12)", cursor: "pointer", transition: "background 0.3s ease" }} />
        ))}
      </div>

      {/* Current step — focused view */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 12px" }}>
        <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: T.glow.gm, border: `1px solid ${T.bdr.g}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.gold.l, fontFamily: "ui-monospace,monospace", fontWeight: 600 }}>{current.step}</div>
          <div style={{ fontSize: 9, color: T.txt.m, fontFamily: "ui-monospace,monospace", letterSpacing: 0.5 }}>{current.time}</div>
        </div>

        <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 500, color: T.txt.p, lineHeight: 1.3, marginBottom: 12 }}>{current.label}</div>
        <div style={{ fontSize: 12, color: T.txt.s, lineHeight: 1.8, marginBottom: 16 }}>{current.hint}</div>

        {/* CTA button — shown when there's an action for this step */}
        {(action && ctaLabel) && (
          <button
            type="button"
            onClick={action}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 9, border: `1px solid ${T.bdr.g}`, background: T.glow.g, color: T.gold.l, fontFamily: F.ui, fontSize: 12, fontWeight: 500, letterSpacing: 0.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.22s ease" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.glow.gm; e.currentTarget.style.borderColor = T.bdr.gs; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.glow.g; e.currentTarget.style.borderColor = T.bdr.g; }}
          >
            {ctaLabel}
          </button>
        )}

        {/* Ornament divider */}
        <div style={{ marginTop: 20 }}><OrnamentRule opacity={0.18} /></div>

        {/* All steps mini-list */}
        <div style={{ marginTop: 12 }}>
          {DEMO_STEPS.map((ds, i) => {
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div key={ds.step} onClick={() => setStep(i)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: isActive ? T.glow.g : "transparent", transition: "background 0.18s ease", marginBottom: 1 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, border: `1px solid ${isDone ? T.bdr.g : isActive ? T.gold.p : T.bdr.f}`, background: isDone ? "rgba(212,168,83,0.18)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: isDone ? T.gold.p : isActive ? T.gold.l : T.txt.m }}>
                  {isDone ? "✓" : ""}
                </div>
                <span style={{ fontSize: 11, color: isActive ? T.gold.l : isDone ? T.txt.s : T.txt.d, fontWeight: isActive ? 500 : 400 }}>{ds.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 9, color: T.txt.m, fontFamily: "ui-monospace,monospace" }}>{ds.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next */}
      <div style={{ padding: "10px 14px 16px", borderTop: `1px solid ${T.bdr.f}`, display: "flex", gap: 7, flexShrink: 0 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={!canPrev} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${T.bdr.f}`, background: "transparent", color: canPrev ? T.txt.s : T.txt.m, fontSize: 11, cursor: canPrev ? "pointer" : "default", fontFamily: F.ui, opacity: canPrev ? 1 : 0.35, transition: "all 0.2s ease" }}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(DEMO_STEPS.length - 1, s + 1))} disabled={!canNext} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${canNext ? T.bdr.g : T.bdr.f}`, background: canNext ? T.glow.g : "transparent", color: canNext ? T.gold.l : T.txt.m, fontSize: 11, cursor: canNext ? "pointer" : "default", fontFamily: F.ui, transition: "all 0.2s ease" }}>Next →</button>
      </div>
    </div>
  );
}

/* ─── Particles ──────────────────────────────────────────────────────────── */
function Particles({ topInset = 0 }: { topInset?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const resize = () => { c.width = window.innerWidth; c.height = Math.max(0, window.innerHeight - topInset); };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 50 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, s: Math.random() * 0.85 + 0.1, sx: (Math.random() - 0.5) * 0.09, sy: (Math.random() - 0.5) * 0.06 - 0.03, o: Math.random() * 0.2 + 0.04, p: Math.random() * Math.PI * 2, ps: Math.random() * 0.006 + 0.002 }));
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(pt => {
        pt.x += pt.sx; pt.y += pt.sy; pt.p += pt.ps;
        if (pt.x < -5 || pt.x > c.width + 5 || pt.y < -5 || pt.y > c.height + 5) { pt.x = Math.random() * c.width; pt.y = c.height + 5; }
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,160,90,${pt.o * (0.4 + 0.6 * Math.sin(pt.p))})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [topInset]);
  return <canvas ref={ref} style={{ position: "fixed", top: topInset, left: 0, right: 0, bottom: 0, zIndex: 3, pointerEvents: "none" }} />;
}

/* ─── Start Button ───────────────────────────────────────────────────────── */
function GothicStar({ size = 7, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M5 0L5.8 4.2L10 5L5.8 5.8L5 10L4.2 5.8L0 5L4.2 4.2Z" fill={color} />
    </svg>
  );
}

function FancyStartButton({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const c = hov ? T.gold.l : T.gold.p;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div
        style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, justifyContent: "flex-start" }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        <button
          type="button"
          onClick={onClick}
          style={{
            background: "none",
            border: "none",
            padding: "8px 0",
            margin: 0,
            cursor: "pointer",
            fontFamily: F.display,
            fontSize: 15,
            letterSpacing: 4.5,
            textTransform: "uppercase",
            color: c,
            textAlign: "left",
            textShadow: hov ? "0 0 22px rgba(212,168,83,0.5)" : "0 0 10px rgba(212,168,83,0.1)",
            transition: "color 0.3s ease, text-shadow 0.3s ease",
          }}
        >
          Enter his world
        </button>
        <div
          style={{
            height: 1,
            width: 28,
            background: `linear-gradient(90deg, ${c}30, ${c}55)`,
            borderRadius: 1,
            opacity: 0.75,
            flexShrink: 0,
          }}
        />
        <GothicStar size={6} color={c} />
        <div style={{ fontSize: 6, color: c, letterSpacing: 1.5, opacity: 0.5 }}>✦</div>
        <div
          style={{
            height: 1,
            width: 20,
            background: `linear-gradient(90deg, ${c}25, ${c}40, ${c}25)`,
            opacity: 0.6,
            flexShrink: 0,
          }}
        />
        <GothicStar size={6} color={c} />
        <div
          style={{
            height: 1,
            width: 36,
            background: `linear-gradient(90deg, transparent, ${c}28, ${c}50)`,
            borderRadius: 1,
            opacity: 0.9,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Splash Screen ─────────────────────────────────────────────────────── */
function SplashScreen({ onStart }: { onStart: () => void }) {
  const [vis, setVis] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);
  const handleStart = () => { setLeaving(true); setTimeout(onStart, 850); };
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: T.bg.void, display: "flex", overflow: "hidden",
      opacity: leaving ? 0 : vis ? 1 : 0,
      transition: leaving ? "opacity 0.85s ease" : "opacity 1.1s ease",
    }}>
      <Particles topInset={0} />
      <TarotStars topInset={0} />
      {/* Background video */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <PortraitVideoPlaylist sources={PORTRAIT_VIDEO_PLAYLIST} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,8,0.97) 0%, rgba(5,5,8,0.82) 38%, rgba(5,5,8,0.22) 68%, transparent 100%)" }} />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,8,0.92) 0%, transparent 48%)" }} />
      </div>
      {/* Content left column */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "min(560px, 52%)", padding: "0 7vw",
        display: "flex", flexDirection: "column", justifyContent: "center",
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 1.1s ease 0.28s, transform 1.1s ease 0.28s",
      }}>
        <div style={{ fontSize: 8.5, color: T.gold.p, letterSpacing: 7, textTransform: "uppercase", marginBottom: 36, fontFamily: F.ui, fontWeight: 400, opacity: 0.66 }}>
          Eternal Vow
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: F.display, fontSize: "clamp(48px,6vw,72px)", fontWeight: 600, color: T.gold.l, lineHeight: 0.9, letterSpacing: -1.5 }}>Lucien</div>
          <div style={{ fontFamily: F.display, fontSize: "clamp(48px,6vw,72px)", fontWeight: 600, color: T.txt.p, lineHeight: 1.0, letterSpacing: -1.5 }}>Ashford</div>
        </div>
        <div style={{ fontSize: 9, color: `rgba(201,160,90,0.52)`, letterSpacing: 5.5, textTransform: "uppercase", marginBottom: 38, fontFamily: F.display }}>
          Chapter VII · The Silent Oath
        </div>
        <div style={{ width: "min(300px,80%)", marginBottom: 30 }}><OrnamentRule opacity={0.38} /></div>
        <div style={{ display: "flex", marginBottom: 36 }}>
          {[{ l: "Age", v: "28" }, { l: "Height", v: "187 cm" }, { l: "Sign", v: "Leo" }, { l: "Role", v: "Physician" }].map((s, i) => (
            <div key={s.l} style={{ paddingRight: 22, marginRight: 22, borderRight: i < 3 ? "0.5px solid rgba(201,160,90,0.24)" : "none" }}>
              <div style={{ fontSize: 7.5, color: T.txt.s, letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 6, fontFamily: F.ui }}>{s.l}</div>
              <div style={{ fontSize: 14.5, color: T.txt.p, fontWeight: 400, fontFamily: F.ui }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 14.5, lineHeight: 2.05, color: "rgba(232,226,216,0.68)", maxWidth: 390, marginBottom: 56 }}>
          {CHARACTER_STORY_BLURB}
        </div>
        <FancyStartButton onClick={handleStart} />
      </div>
      <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 3, fontSize: 8, color: T.txt.m, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: F.ui, opacity: 0.55 }}>
        AI · Prototype
      </div>
    </div>
  );
}

type Msg = { id: number; type: "char" | "user" | "au-event"; text: string; narration?: string; heartbeat?: string; action?: string };
type RightPane = "moments" | "demo" | null;

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function AiCharacterPrototypeClient({ embed = false, muted = false }: { embed?: boolean; muted?: boolean }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [messages, setMessages] = useState<Msg[]>([{ id: 1, type: "char", text: GREETING.text, narration: GREETING.narration, heartbeat: GREETING.heartbeat }]);
  const [phase, setPhase] = useState("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [auCardShown, setAuCardShown] = useState(false);
  const [heartbeatHidden, setHeartbeatHidden] = useState(false);
  const [affection, setAffection] = useState(58);
  const [hovMsg, setHovMsg] = useState<number | null>(null);
  const [showSplash, setShowSplash] = useState(!embed);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightPane, setRightPane] = useState<RightPane>(null);
  const [storyOpen, setStoryOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [resetMemoryOpen, setResetMemoryOpen] = useState(false);
  const [storyLiked, setStoryLiked] = useState<Record<number, boolean>>({});
  const [storyRelated, setStoryRelated] = useState<Record<number, boolean>>({});
  const [momentsLiked, setMomentsLiked] = useState<Record<number, boolean>>({});
  const [inputVal, setInputVal] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const chatInitialOpenRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicOn, setIsMusicOn] = useState(!muted);
  const [sceneVideoSrc, setSceneVideoSrc] = useState<string>(SCENE_VIDEO_DEFAULT);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (chatInitialOpenRef.current) {
      chatInitialOpenRef.current = false;
      el.scrollTop = 0;
      prevScrollHeightRef.current = el.scrollHeight;
      return;
    }
    // Scroll so the new message's top aligns to the viewport top
    el.scrollTop = prevScrollHeightRef.current;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const m = musicRef.current; if (!m) return;
    m.loop = true; m.volume = 0.3;
    const onPlay = () => setIsMusicOn(true); const onPause = () => setIsMusicOn(false);
    m.addEventListener("play", onPlay); m.addEventListener("pause", onPause);
    if (!muted) {
      const p = m.play(); if (p) p.catch(() => setIsMusicOn(false));
    } else {
      m.pause();
      setIsMusicOn(false);
    }
    return () => { m.removeEventListener("play", onPlay); m.removeEventListener("pause", onPause); };
  }, [muted]);

  const toggleMusic = () => {
    const m = musicRef.current; if (!m) return;
    if (isMusicOn) { m.pause(); return; }
    const p = m.play(); if (p) p.then(() => setIsMusicOn(true)).catch(() => setIsMusicOn(false));
  };

  const showInspiration = () => {
    if (phase === "inspiration") { setPhase("idle"); setHeartbeatHidden(true); return; }
    if (phase !== "idle") return;
    setHeartbeatHidden(false); setPhase("inspiration");
  };

  const selectInspiration = (idx: number) => {
    if (phase !== "inspiration") return;
    const r = INSPIRATION_RESPONSES[idx];
    setMessages(p => [...p, { id: Date.now(), type: "user", text: r.text, action: r.action }]);
    setPhase("replying"); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = CHAR_REPLIES[idx];
      setMessages(p => [...p, { id: Date.now() + 1, type: "char", text: reply.text, narration: reply.narration, heartbeat: reply.heartbeat }]);
      setPhase("replied"); setHeartbeatHidden(false); setAffection(p => Math.min(p + 12, 100));
    }, 2400);
  };

  const doContinue = () => {
    if (phase !== "replied") return;
    setIsTyping(true); setPhase("continuing");
    setTimeout(() => {
      setIsTyping(false);
      setMessages(p => [...p, { id: Date.now(), type: "char", text: CONTINUE_RESPONSE.text, narration: CONTINUE_RESPONSE.narration, heartbeat: CONTINUE_RESPONSE.heartbeat }]);
      setPhase("continued"); setHeartbeatHidden(false); setAffection(p => Math.min(p + 8, 100));
    }, 2800);
  };

  const returnToMainScene = () => {
    setSceneVideoSrc(SCENE_VIDEO_DEFAULT);
  };

  const enterAlternateWorld = () => {
    setSceneVideoSrc(SCENE_VIDEO_ALTERNATE);
    setMessages([{ id: Date.now(), type: "char", text: GREETING.text, narration: GREETING.narration, heartbeat: GREETING.heartbeat }]);
    setPhase("idle");
    setIsTyping(false);
    setHeartbeatHidden(false);
    setAuCardShown(false);
    setAffection(58);
    setRightPane(null);
    setStoryOpen(false);
  };

  const restartStory = () => {
    setSceneVideoSrc(SCENE_VIDEO_DEFAULT);
    setMessages([{ id: Date.now(), type: "char", text: GREETING.text, narration: GREETING.narration, heartbeat: GREETING.heartbeat }]);
    setPhase("idle");
    setIsTyping(false);
    setHeartbeatHidden(false);
    setAuCardShown(false);
    setAffection(58);
    setRightPane(null);
    setStoryOpen(false);
  };

  const features = [
    { icon: "\u2726", label: "Inspire",      desc: "Candidate replies",        action: showInspiration,                                                    isActive: phase === "inspiration" },
    { icon: "\u25c8", label: "Alt Universe", desc: "Alternate timeline",        action: () => { if (!auCardShown) { setAuCardShown(true); setMessages(p => [...p, { id: Date.now(), type: "au-event", text: "" }]); } }, isActive: auCardShown },
    { icon: "\u25c6", label: "Story",        desc: "Unlocked story moments",    action: () => setStoryOpen(v => !v),                                       isActive: storyOpen },
    { icon: "\u25ce", label: "Moments",      desc: "His private feed",          action: () => setRightPane(p => p === "moments" ? null : "moments"),       isActive: rightPane === "moments" },
  ];

  const chatMessagesMaxVh = messages.some((m) => m.type === "au-event") ? CHAT_MESSAGES_MAX_VH_WITH_AU : CHAT_MESSAGES_MAX_VH;

  return (
    <div style={{ height: "100vh", minHeight: "100vh", overflow: "hidden", background: T.bg.void, fontFamily: F.ui }}>
      <audio ref={musicRef} src={BG_MUSIC} preload="auto" />
      <style>{`
        @keyframes cStar{0%{opacity:1;transform:scale(0)}60%{opacity:.7;transform:scale(1.1) translateY(-8px)}100%{opacity:0;transform:scale(.6) translateY(-22px)}}
        @keyframes tFade{0%{opacity:.45}100%{opacity:0;transform:scale(0)}}
        @keyframes vinylSpin{to{transform:rotate(360deg)}}
        @keyframes slowZoom{from{transform:scale(1)}to{transform:scale(1.06)}}
        @keyframes fadeIn{from{opacity:0}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}}
        @keyframes msgIn{from{opacity:0;transform:translateY(10px)}}
        @keyframes tarotDrift{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes tarotFade{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes continuePulse{0%,100%{opacity:.85;transform:scale(1)}50%{opacity:1;transform:scale(1.01)}}
        @keyframes cardPulse{0%,100%{box-shadow:0 0 10px rgba(201,160,90,0.08)}50%{box-shadow:0 0 22px rgba(201,160,90,0.22)}}
        @keyframes affDot{0%,100%{opacity:.5;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes panelIn{from{opacity:0;transform:translateX(-16px)}}
        @keyframes panelInR{from{opacity:0;transform:translateX(16px)}}
        @keyframes paneIn{from{opacity:0;transform:translateX(8px)}}
        @keyframes shellIn{from{opacity:0;transform:translateY(10px)}}
        @keyframes typePulse{0%,100%{opacity:.22;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
        @keyframes auCardGlow{0%,100%{box-shadow:0 0 0 1px rgba(201,160,90,0.12),0 0 24px rgba(85,128,200,0.18),0 0 56px rgba(201,160,90,0.08),inset 0 0 48px rgba(85,128,200,0.06)}50%{box-shadow:0 0 0 1px rgba(201,160,90,0.24),0 0 38px rgba(85,128,200,0.3),0 0 78px rgba(201,160,90,0.14),inset 0 0 72px rgba(85,128,200,0.1)}}
        @keyframes auShimmerSlide{0%{transform:translateX(-140%) skewX(-16deg);opacity:0}20%{opacity:.45}55%{opacity:.28}100%{transform:translateX(160%) skewX(-16deg);opacity:0}}
        @keyframes auPortraitSheen{0%,100%{opacity:.12}50%{opacity:.28}}
        @keyframes auRailTwinkle{0%,100%{opacity:.32;transform:scale(.86)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes splashRingRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes splashStarBlink{0%,100%{opacity:.12;transform:scale(0.55)}45%{opacity:1;transform:scale(1.15)}55%{opacity:.85;transform:scale(1.05)}}
        @keyframes splashCompassSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        *::-webkit-scrollbar{width:2px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:${T.gold.dk};border-radius:4px}
        *{margin:0;padding:0;box-sizing:border-box}textarea::placeholder{color:${T.txt.d}}
        input[type=range]{-webkit-appearance:none;appearance:none;height:3px;background:rgba(201,160,90,0.18);border-radius:2px;outline:none;display:block}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${T.gold.p};cursor:pointer;box-shadow:0 0 6px rgba(201,160,90,0.35)}
        select{-webkit-appearance:none;appearance:none}
        *{font-variant-emoji:text}
        .ai-proto-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        button:focus-visible,[role="button"]:focus-visible{outline:2px solid rgba(224,200,140,0.95);outline-offset:2px}
        @media (prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}
        }
      `}</style>

      {showSplash ? (
        <SplashScreen onStart={() => setShowSplash(false)} />
      ) : (
        <>
          <Particles topInset={0} />
          <TarotStars topInset={0} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", overflow: "hidden", animation: "shellIn 0.85s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
        <div style={{ display: "flex", height: "100%" }}>

          {/* ── Left sidebar ──────────────────────────────────────────── */}
          <aside aria-label="Eternal Vow navigation" style={{ width: leftOpen ? SIDEBAR_LEFT_PX : 0, flexShrink: 0, transition: "width 0.42s cubic-bezier(0.25,0.46,0.45,0.94)", overflow: "hidden", borderRight: leftOpen ? `1px solid ${T.bdr.f}` : "none", display: "flex", flexDirection: "column", background: "rgba(7,7,12,0.72)", backdropFilter: "blur(40px) saturate(120%)" }}>
            <div style={{ width: SIDEBAR_LEFT_PX, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 18px 15px", borderBottom: `1px solid ${T.bdr.f}` }}>
              <div style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: T.gold.l, letterSpacing: 1.5 }}>Eternal Vow</div>
            </div>
            <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
              <div style={{ fontSize: 10, color: T.txt.m, letterSpacing: 2.2, textTransform: "uppercase", padding: "8px 10px 6px" }}>Stories</div>
              {[{ l: "The Silent Oath", b: "Ch.7", a: true }, { l: "Crimson Letters" }, { l: "Midnight Garden" }].map((n) => (
                <div key={n.l} style={{ display: "flex", alignItems: "center", padding: "9px 10px", borderRadius: 7, marginBottom: 1, background: n.a ? T.glow.g : "transparent", borderLeft: `2px solid ${n.a ? T.gold.p : "transparent"}`, paddingLeft: 10, cursor: "pointer", transition: "all 0.2s ease" }}>
                  <span style={{ fontSize: 13, fontWeight: n.a ? 400 : 300, color: n.a ? T.txt.p : T.txt.s, flex: 1 }}>{n.l}</span>
                  {n.b && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 5, background: T.gold.dk, color: T.gold.l, fontWeight: 500 }}>{n.b}</span>}
                </div>
              ))}
              <div style={{ fontSize: 10, color: T.txt.m, letterSpacing: 2.2, textTransform: "uppercase", padding: "16px 10px 6px" }}>Collection</div>
              {[{ l: "Gallery" }, { l: "Memory Album" }].map((n) => (
                <div key={n.l} style={{ padding: "9px 10px", borderRadius: 7, marginBottom: 1, cursor: "pointer" }}>
                  <span style={{ fontSize: 13, color: T.txt.d }}>{n.l}</span>
                </div>
              ))}
            </nav>
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.bdr.f}`, display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.bdr.g}`, background: `linear-gradient(135deg,${T.rose.d},${T.gold.dk})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.gold.l, flexShrink: 0 }}>S</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.txt.p, lineHeight: 1.3 }}>Selene</div>
                <div style={{ fontSize: 10, color: T.gold.d, letterSpacing: 0.8 }}>Premium</div>
              </div>
            </div>
            </div>
          </aside>

          {/* ── Center ────────────────────────────────────────────────── */}
          <main role="main" aria-label="Character scene, dialogue, and controls" style={{ position: "relative", flex: 1, minWidth: 0, height: "100%", overflow: "hidden", animation: "shellIn 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s both" }}>
            {/* ── Left pull tab ── */}
            <button
              type="button"
              onClick={() => setLeftOpen(v => !v)}
              aria-label={leftOpen ? "Close navigation" : "Open navigation"}
              style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 50, width: 18, height: 52, background: "rgba(8,8,13,0.78)", border: `1px solid ${T.bdr.s}`, borderLeft: "none", borderRadius: "0 8px 8px 0", color: T.gold.d, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", fontSize: 11, transition: "background 0.2s ease, color 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(12,12,22,0.9)"; e.currentTarget.style.color = T.gold.l; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(8,8,13,0.78)"; e.currentTarget.style.color = T.gold.d; }}
            >
              {leftOpen ? "‹" : "›"}
            </button>

            {/* Video — shrunk and centered so character face clears chat dock */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "68%", bottom: "44%", zIndex: 1, overflow: "hidden", background: "#04040a", borderRadius: "0 0 10px 10px" }}>
              <PortraitVideoPlaylist
                key={sceneVideoSrc}
                sources={[sceneVideoSrc]}
                playbackRate={sceneVideoSrc === SCENE_VIDEO_ALTERNATE ? AU_CARD_VIDEO_RATE : VIDEO_PLAYBACK_SLOW}
              />
              {/* 4-edge dark vignette */}
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "radial-gradient(ellipse 88% 88% at 50% 44%, transparent 44%, rgba(5,5,8,0.72) 100%)" }} />
              <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", pointerEvents: "none", zIndex: 2, background: "linear-gradient(to bottom, rgba(5,5,8,0.88) 0%, rgba(5,5,8,0.42) 55%, transparent 100%)" }} />
              <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", pointerEvents: "none", zIndex: 2, background: "linear-gradient(to top, rgba(5,5,8,1) 0%, rgba(5,5,8,0.72) 35%, transparent 100%)" }} />
              <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "22%", pointerEvents: "none", zIndex: 2, background: "linear-gradient(to right, rgba(5,5,8,0.88) 0%, transparent 100%)" }} />
              <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "22%", pointerEvents: "none", zIndex: 2, background: "linear-gradient(to left, rgba(5,5,8,0.88) 0%, transparent 100%)" }} />
            </div>

            {/* Top gradient — strong dark band for header legibility */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "28%", zIndex: 2, pointerEvents: "none",
              background: "linear-gradient(180deg, rgba(5,5,8,0.82) 0%, rgba(5,5,8,0.55) 40%, rgba(5,5,8,0.18) 72%, rgba(5,5,8,0.0) 100%)"
            }} />
            {/* Bottom gradient — chat dock readability */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "62%", zIndex: 2, pointerEvents: "none",
              background: "linear-gradient(0deg, rgba(5,5,8,0.99) 0%, rgba(5,5,8,0.92) 22%, rgba(5,5,8,0.55) 48%, rgba(5,5,8,0.0) 100%)"
            }} />
            {/* Edge vignette */}
            <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse 90% 94% at 50% 38%, transparent 56%, rgba(5,5,8,0.26) 100%)" }} />

            {/* Header HUD */}
            <header style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "22px 34px", pointerEvents: "none" }}>
              <div style={{ pointerEvents: "auto" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 500, color: T.txt.p, letterSpacing: 0.5 }}>{CHAR_NAME}</div>
                <div style={{ fontSize: 9.5, color: "rgba(232,226,216,0.48)", marginTop: 5, letterSpacing: 3, textTransform: "uppercase", fontWeight: 300 }}>Chapter VII · The Silent Oath</div>
                {sceneVideoSrc === SCENE_VIDEO_ALTERNATE && (
                  <button
                    type="button"
                    onClick={returnToMainScene}
                    style={{
                      marginTop: 10,
                      padding: 0,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: F.body,
                      fontSize: 12.5,
                      fontStyle: "italic",
                      fontWeight: 500,
                      color: "rgba(220,210,190,0.88)",
                      letterSpacing: "0.06em",
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                      textDecorationColor: "rgba(201,160,90,0.45)",
                    }}
                  >
                    &larr; Back
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }} role="toolbar" aria-label="Scene tools">
                <HudToolButton
                  ariaLabel={isMusicOn ? "Pause background music" : "Play background music"}
                  explanation={isMusicOn ? "Pause the ambient soundtrack." : "Play the ambient soundtrack."}
                  onClick={toggleMusic}
                >
                  <VinylGlyph playing={isMusicOn} />
                </HudToolButton>
                <HudToolButton
                  ariaLabel="Open developer tools"
                  explanation="View character spec, clone template, and model settings."
                  onClick={() => setDevOpen(true)}
                >
                  <svg width={HUD_ICON_PX} height={HUD_ICON_PX} viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M7 5L3 10l4 5M13 5l4 5-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </HudToolButton>
                <HudToolButton ariaLabel="Share character" explanation="Open a short flow to copy a profile link or preview sharing (prototype only)." onClick={() => setShareOpen(true)}>
                  <svg width={HUD_ICON_PX} height={HUD_ICON_PX} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="18" cy="5" r="2.5" />
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="19" r="2.5" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </HudToolButton>
                <HudToolButton
                  ariaLabel="Refresh memory"
                  explanation="Restart the scene from the opening line and clear this session’s story state (prototype)."
                  onClick={() => setResetMemoryOpen(true)}
                >
                  <svg width={HUD_ICON_PX} height={HUD_ICON_PX} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4" />
                    <path d="M21 4v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20" />
                    <path d="M3 20v-5h5" />
                  </svg>
                </HudToolButton>
                <HudToolButton ariaLabel="Open demo guide" explanation="Step-by-step demo walkthrough with direct feature access." onClick={() => setRightPane(p => p === "demo" ? null : "demo")} wide>
                  <span style={{ fontFamily: F.ui, fontSize: 8.5, fontWeight: 600, letterSpacing: 0.9, textTransform: "uppercase", lineHeight: 1 }}>GUIDE</span>
                </HudToolButton>
              </div>
            </header>

            {/* Chat dock */}
            <div role="region" aria-label="Conversation" style={{ position: "absolute", left: 28, right: 28, bottom: 0, zIndex: 25, display: "flex", flexDirection: "column", alignItems: "center", maxHeight: `${CHAT_DOCK_MAX_VH}vh`, pointerEvents: "auto" }}>
              <div style={{ width: "min(52vw, 100%)", maxWidth: CHAT_COLUMN_MAX_PX, display: "flex", flexDirection: "column", flex: "0 1 auto", minHeight: 0, maxHeight: "100%" }}>

                {/* Messages */}
                <div ref={chatRef} style={{ flex: "0 1 auto", overflowY: "auto", padding: "18px 18px 8px", minHeight: 0, maxHeight: `${chatMessagesMaxVh}vh`, WebkitMaskImage: "linear-gradient(to bottom,transparent 0%,black 10%)", maskImage: "linear-gradient(to bottom,transparent 0%,black 10%)" }}>
                  {(() => {
                    const tail = messages[messages.length - 1];
                    const continueId = phase === "replied" && tail?.type === "char" ? tail.id : null;
                    const firstCharMsgId = messages.find((m) => m.type === "char")?.id ?? null;
                    return messages.map((msg) => {
                      if (msg.type === "au-event") return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 18, animation: "msgIn 0.55s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
                          <AlternateUniverseMessageCard onEnterNewWorld={enterAlternateWorld} />
                        </div>
                      );
                      if (msg.type === "user") return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, animation: "msgIn 0.55s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
                          <div style={{ maxWidth: "84%" }}>
                            <div style={{ padding: "13px 20px", borderRadius: 18, background: "rgba(201,160,90,0.11)", border: `1px solid rgba(201,160,90,0.16)`, boxShadow: "0 0 18px rgba(212,168,83,0.1), 0 6px 22px rgba(0,0,0,0.22)" }}>
                              <div style={{ fontSize: 14.5, lineHeight: 1.88, color: T.txt.p }}>{msg.text}</div>
                              {msg.action && <div style={{ fontSize: 12, color: T.txt.s, marginTop: 9, lineHeight: 1.62, fontStyle: "italic", opacity: 0.74, borderTop: "1px solid rgba(212,168,83,0.1)", paddingTop: 9 }}>{msg.action}</div>}
                            </div>
                          </div>
                        </div>
                      );
                      return (
                        <div key={msg.id} style={{ display: "flex", justifyContent: "flex-start", marginBottom: 18, animation: "msgIn 0.55s cubic-bezier(0.25,0.46,0.45,0.94) both" }} onMouseEnter={() => setHovMsg(msg.id)} onMouseLeave={() => setHovMsg(null)}>
                          <div style={{ maxWidth: "88%", position: "relative" }}>
                            <div style={{ padding: "16px 22px", borderRadius: 18, background: "rgba(12,12,20,0.86)", border: `1px solid ${hovMsg === msg.id ? T.bdr.s : "rgba(201,160,90,0.08)"}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 12px 40px rgba(0,0,0,0.32), 0 0 0 0.5px rgba(255,255,255,0.03) inset", transition: "border-color 0.3s ease" }}>
                              <div style={{ fontFamily: F.body, fontSize: 16.5, lineHeight: 1.92, color: T.txt.p, fontWeight: 400 }}>{msg.text}</div>
                              {msg.narration && <div style={{ fontSize: 12, color: T.txt.s, marginTop: 11, lineHeight: 1.65, fontStyle: "italic", opacity: 0.72, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>{msg.narration}</div>}
                            </div>
                            <div style={{ display: "flex", gap: 14, marginTop: 8, paddingLeft: 2, alignItems: "center" }}>
                              <button type="button" aria-label="Play" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0, display: "flex", alignItems: "center", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" aria-hidden><polygon points="5,3 19,12 5,21" /></svg>
                              </button>
                              <button type="button" aria-label="Regenerate" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0, display: "flex", alignItems: "center", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
                              </button>
                              <button type="button" aria-label="Like" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0, display: "flex", alignItems: "center", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              </button>
                              <button type="button" aria-label="Dislike" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0, display: "flex", alignItems: "center", transition: "color 0.2s ease" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                              </button>
                            </div>
                            {continueId === msg.id && (
                              <div style={{ marginTop: 10 }}>
                                <button type="button" onClick={doContinue} style={{ padding: "9px 20px", borderRadius: 999, border: `1px solid ${T.bdr.g}`, background: "rgba(12,12,20,0.78)", backdropFilter: "blur(16px)", color: T.gold.l, fontFamily: F.ui, fontSize: 12, fontWeight: 400, letterSpacing: 0.9, cursor: "pointer", animation: "continuePulse 3.2s ease-in-out infinite", transition: "all 0.2s ease" }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(20,18,28,0.88)"; e.currentTarget.style.borderColor = T.bdr.gs; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(12,12,20,0.78)"; e.currentTarget.style.borderColor = T.bdr.g; }}>
                                  Continue &rarr;
                                </button>
                              </div>
                            )}
                            {msg.heartbeat && msg.id === firstCharMsgId && <HeartbeatTarotCard text={msg.heartbeat} hidden={heartbeatHidden} />}
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {isTyping && (
                    <div style={{ display: "flex", marginBottom: 10, animation: "msgIn 0.4s ease both" }}>
                      <div style={{ display: "flex", gap: 5, padding: "13px 18px", borderRadius: 18, background: "rgba(12,12,20,0.84)", border: `1px solid ${T.bdr.f}`, backdropFilter: "blur(20px)" }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold.d, animation: `typePulse 1.6s ease-in-out infinite ${i * 0.22}s` }} />)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inspiration panel */}
                {phase === "inspiration" && (
                  <div style={{ padding: "3px 18px 0" }}>
                    <InspirationPanel onSelect={selectInspiration} disabled={false} />
                  </div>
                )}

                {/* Feature bar */}
                <div style={{ padding: "6px 16px 7px", display: "flex", gap: 3, justifyContent: "center", background: "rgba(6,6,10,0.78)", backdropFilter: "blur(28px)", borderTop: `1px solid rgba(212,168,83,0.08)` }}>
                  {features.map(f => (
                    <FeatureBtn key={f.label} icon={f.icon} label={f.label} desc={f.desc} onClick={f.action} active={f.isActive} />
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding: "8px 18px 18px", background: "rgba(6,6,10,0.68)", backdropFilter: "blur(28px)" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                    <textarea
                      value={inputVal}
                      onChange={e => setInputVal(e.target.value)}
                      placeholder="Say something…"
                      rows={1}
                      aria-label="Message to the character"
                      style={{ flex: 1, minHeight: 48, maxHeight: 96, padding: "13px 18px", borderRadius: 22, border: `1px solid ${T.bdr.f}`, background: "linear-gradient(145deg, rgba(14,14,24,0.62), rgba(10,10,18,0.42))", color: T.txt.p, fontFamily: F.ui, fontSize: 14.5, fontWeight: 300, resize: "none", outline: "none", transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease", lineHeight: 1.58, backdropFilter: "blur(16px)" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(242,218,144,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(212,168,83,0.07), 0 0 28px rgba(212,168,83,0.1)"; e.currentTarget.style.background = "linear-gradient(145deg, rgba(22,18,26,0.74), rgba(12,12,22,0.58))"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = T.bdr.f; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "linear-gradient(145deg, rgba(14,14,24,0.62), rgba(10,10,18,0.42))"; }}
                    />
                    <button
                      type="button"
                      aria-label="Send message"
                      disabled={!inputVal.trim()}
                      style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: inputVal.trim() ? `linear-gradient(150deg,${T.gold.p},${T.gold.d})` : "rgba(255,255,255,0.06)", color: inputVal.trim() ? T.bg.void : "rgba(255,255,255,0.2)", fontSize: 16, cursor: inputVal.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: inputVal.trim() ? `0 4px 18px ${T.glow.gm}` : "none", transition: "all 0.25s ease" }}
                      onMouseEnter={e => { if (inputVal.trim()) e.currentTarget.style.filter = "brightness(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
                    >&uarr;</button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ── Right sidebar — shown only when a pane is active ── */}
          {rightPane && (
            <aside aria-label="Character and story panel" style={{ width: SIDEBAR_RIGHT_PX, flexShrink: 0, borderLeft: `1px solid rgba(212,168,83,0.1)`, display: "flex", flexDirection: "column", background: "rgba(6,6,11,0.82)", backdropFilter: "blur(40px) saturate(120%)", overflow: "hidden", animation: "panelInR 0.42s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
              <div key={rightPane} style={{ height: "100%", display: "flex", flexDirection: "column", animation: "paneIn 0.38s cubic-bezier(0.25,0.46,0.45,0.94) both" }}>
                {rightPane === "moments" && <MomentsPane onBack={() => setRightPane(null)} liked={momentsLiked} setLiked={setMomentsLiked} />}
                {rightPane === "demo" && <DemoPane onBack={() => setRightPane(null)} onActionMap={{
                  3: showInspiration,
                  6: () => setStoryOpen(true),
                  7: () => { if (!auCardShown) { setAuCardShown(true); setMessages(p => [...p, { id: Date.now(), type: "au-event", text: "" }]); } },
                  8: () => setRightPane("moments"),
                  9: () => { setDevOpen(true); },
                }} />}
              </div>
            </aside>
          )}

        </div>
      </div>

          <DemoGuide />
          {shareOpen && <ShareCharacterModal characterName={CHAR_NAME} onClose={() => setShareOpen(false)} />}
          {devOpen && <DeveloperSidebar onClose={() => setDevOpen(false)} />}
          {storyOpen && <StoryOverlay onClose={() => setStoryOpen(false)} liked={storyLiked} setLiked={setStoryLiked} related={storyRelated} setRelated={setStoryRelated} />}
          {resetMemoryOpen && (
            <ResetMemoryModal
              onCancel={() => setResetMemoryOpen(false)}
              onConfirm={() => {
                setResetMemoryOpen(false);
                restartStory();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
