"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Liner · light tokens (mirror the liner-ui design language) ────────────────
//   Warm paper canvas, cream surfaces, ink-on-paper type, the lime highlighter as
//   the single restrained accent. Dividers are solid warm hairlines (no dotted
//   lines, per direction). The few "dark" slides use a warm near-black as dramatic
//   punctuation, not a dark-mode theme.
const L = {
  page:       "#FFFFFF", // clean white
  canvas:     "#F7F7F6", // neutral section surface
  card:       "#FFFFFF",
  cream:      "#F4F4F3", // neutral light card
  creamDeep:  "#EAEAE8",
  tint:       "#F1F1F0",
  ink:        "#1A1A1A", // headlines, primary
  body:       "#3A3A3A", // body text
  muted:      "#6B6B6B", // metadata
  subtle:     "#9B9B9B", // labels, eyebrow
  faint:      "#C6C6C6",
  lime:       "#B8E532", // the single green accent (dots, ticks, bars)
  limeSoft:   "#E9F5C0", // faint green highlight swatch
  limeDeep:   "#7E9E1C", // readable green for text accents on white
  creamHl:    "#EEEEED", // neutral second highlight
  orange:     "#B4B4B4", // neutralized secondary dot
  orangeSoft: "#E6E6E6",
  bSubtle:    "rgba(0,0,0,0.07)",
  bDefault:   "rgba(0,0,0,0.11)",
  bStrong:    "rgba(0,0,0,0.17)",
  dark:       "#F3F3F1", // soft neutral EMPHASIS surface (was near-black)
};

const SERIF =
  "var(--font-source-serif), 'Songti SC', 'Noto Serif SC', 'STSong', Georgia, 'Times New Roman', serif";
const SANS =
  "var(--font-inter), 'PingFang SC', 'Hiragino Sans GB', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Easings & motion ─────────────────────────────────────────────────────────
const E    = [0.16, 1, 0.3, 1] as const;   // calm, scholarly out-ease
const EMSK = [0.65, 0, 0.35, 1] as const;

// ─── Slide registry — research → insight → product narrative ──────────────────
const SLIDES = [
  { id: "cover",         chapter: "开篇", dark: false  },
  { id: "snapshot",      chapter: "开篇", dark: false },
  { id: "context",       chapter: "场景", dark: false },
  { id: "landscape",     chapter: "场景", dark: false },
  { id: "users",         chapter: "场景", dark: false },
  { id: "tension",       chapter: "问题", dark: false },
  { id: "reframe",       chapter: "问题", dark: false  },
  { id: "strategy",      chapter: "研究", dark: false },
  { id: "expert",        chapter: "研究", dark: false },
  { id: "insights",      chapter: "研究", dark: false },
  { id: "spotlight",     chapter: "研究", dark: false  },
  { id: "core-decision", chapter: "决策", dark: false  },
  { id: "decisions",     chapter: "决策", dark: false },
  { id: "routes",        chapter: "方向", dark: false },
  { id: "iteration",     chapter: "方向", dark: false },
  { id: "direction",     chapter: "方向", dark: false },
  { id: "feat-editor",   chapter: "精细", dark: false },
  { id: "feat-group",    chapter: "精细", dark: false },
  { id: "feat-library",  chapter: "精细", dark: false },
  { id: "video",         chapter: "精细", dark: false },
  { id: "impact",        chapter: "成效", dark: false  },
  { id: "reflection",    chapter: "结语", dark: false },
  { id: "closing",       chapter: "结语", dark: false  },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Mask reveal ──────────────────────────────────────────────────────────────
function Mask({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div initial={{ y: "108%" }} animate={{ y: "0%" }} transition={{ duration: 0.9, ease: EMSK, delay }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({
  to, suffix = "", prefix = "", startDelay = 220, duration = 1100,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) { setN(to); return; }
    let frame = 0;
    let start = 0;
    let done = false;
    const finish = () => { if (!done) { done = true; setN(to); } };
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setN((1 - Math.pow(1 - t, 3)) * to);
      if (t < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    const tid = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, startDelay);
    const guard = window.setTimeout(finish, startDelay + duration + 400);
    return () => { clearTimeout(tid); clearTimeout(guard); cancelAnimationFrame(frame); };
  }, [to, startDelay, duration, reduced]);
  return <>{prefix}{Math.round(n)}{suffix}</>;
}

// ─── Eyebrow with a small lime tick + solid lead rule ─────────────────────────
function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const col = dark ? "rgba(0,0,0,0.6)" : L.subtle;
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="block h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: L.lime }} />
      <span aria-hidden className="block h-px w-6 shrink-0" style={{ background: dark ? "rgba(0,0,0,0.32)" : L.bStrong }} />
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: col, fontFamily: SANS }}>
        {children}
      </p>
    </div>
  );
}

// ─── Highlighter swatch (light) / lime ink (dark) ─────────────────────────────
function Hl({ children, dark, tone = "lime" }: { children: ReactNode; dark?: boolean; tone?: "lime" | "cream" }) {
  if (dark) {
    return <span style={{ color: L.limeDeep, fontWeight: 500 }}>{children}</span>;
  }
  const swatch = tone === "cream" ? L.creamHl : L.limeSoft;
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(120deg, transparent 0%, ${swatch} 8%, ${swatch} 92%, transparent 100%)`,
        backgroundSize: "100% 62%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 82%",
        padding: "0 0.12em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

// ─── Solid hairline rule ──────────────────────────────────────────────────────
function Rule({ className = "", dark }: { className?: string; dark?: boolean }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{ height: 1, background: dark ? "rgba(0,0,0,0.2)" : L.bDefault }}
    />
  );
}

// ─── Citation chip + cited phrase (solid underline) ───────────────────────────
function Cite({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className="ml-1 inline-flex h-4 items-center justify-center rounded-[4px] px-1 align-[2px] text-[9.5px] font-semibold tabular-nums"
      style={{
        fontFamily: SANS,
        color: dark ? "rgba(0,0,0,0.8)" : L.ink,
        background: dark ? "rgba(0,0,0,0.1)" : L.cream,
        border: `1px solid ${dark ? "rgba(0,0,0,0.18)" : L.bDefault}`,
      }}
    >
      {children}
    </span>
  );
}

function Cited({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span style={{ borderBottom: `1px solid ${dark ? "rgba(0,0,0,0.4)" : L.bStrong}`, paddingBottom: 1 }}>
      {children}
    </span>
  );
}

// Defer the heavy prototype iframe until the slide-enter transition has settled,
// so the transition animates on a light placeholder instead of janking.
function useAfterEnter(delay = 460) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

// ─── Feature-focused live embed ───────────────────────────────────────────────
//   Boots the bundled Liner prototype, drives it into one feature's view via its
//   own controls (the File/Editor/Chat segmented switch + the Group toggle +
//   file→TL;DR hover), and crops/scales the 1440×900 canvas to that feature's
//   region — so each slide frames exactly the part of the product it narrates.
//   Same-origin, so we operate on the iframe document directly after it boots.
const PROTO_SRC = "/assets/liner/liner-ai-yuan.html";
const PW = 1440, PH = 900;

type Feature = "editor" | "group" | "library";

// Focus rectangles measured in the prototype's 1440×900 canvas, per driven state.
const FEATURE_FOCUS: Record<Feature, { x: number; y: number; w: number; h: number }> = {
  editor:  { x: 0,    y: 0,   w: 1440, h: 900 }, // editor fills the canvas (Chat off)
  group:   { x: 1096, y: 52,  w: 344,  h: 838 }, // the Group chat column (3-col view)
  library: { x: 44,   y: 296, w: 524,  h: 470 }, // Files sidebar + the TL;DR popover
};

function segSet(doc: Document, label: string, want: boolean) {
  const el = Array.from(doc.querySelectorAll<HTMLElement>(".seg > *")).find((e) => e.textContent?.trim() === label);
  if (el && el.className.includes("on") !== want) el.click();
}

function driveFeature(doc: Document, feature: Feature) {
  try {
    if (feature === "editor") {
      segSet(doc, "File", false); segSet(doc, "Editor", true); segSet(doc, "Chat", false);
    } else if (feature === "group") {
      segSet(doc, "File", false); segSet(doc, "Editor", true); segSet(doc, "Chat", true);
      const g = doc.querySelector<HTMLElement>('.chat-mode-btn[data-mode="group"]');
      if (g && !g.className.includes("on")) g.click();
    } else {
      segSet(doc, "File", true);
      const view = doc.defaultView;
      const row = Array.from(doc.querySelectorAll<HTMLElement>(".file-row")).find((e) => /Rando|Carone/.test(e.textContent || ""));
      if (row && view) {
        const r = row.getBoundingClientRect();
        const opts = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, view };
        row.dispatchEvent(new view.PointerEvent("pointerover", opts));
        row.dispatchEvent(new view.MouseEvent("mouseover", opts));
        row.dispatchEvent(new view.MouseEvent("mouseenter", opts));
        row.dispatchEvent(new view.MouseEvent("mousemove", opts));
      }
    }
  } catch {
    /* prototype not booted yet or its shape changed — leave the default view */
  }
}

function LinerFeatureFrame({ feature, label }: { feature: Feature; label?: string }) {
  const focus = FEATURE_FOCUS[feature];
  const slotRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter(520);

  // Fit the focus region (contain) inside the available slot.
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const apply = () => {
      const cw = el.clientWidth, ch = el.clientHeight;
      if (cw > 0 && ch > 0) setScale(Math.min(cw / focus.w, ch / focus.h));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [focus.w, focus.h]);

  // Drive the prototype into the feature view once its app has mounted.
  const onLoad = useCallback(() => {
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      const doc = iframeRef.current?.contentDocument;
      const booted = doc && doc.querySelector(".seg");
      if (booted) driveFeature(doc, feature);
      if (booted || n > 40) window.clearInterval(id); // poll up to ~6s
    }, 150);
  }, [feature]);

  const dw = focus.w * scale, dh = focus.h * scale;

  return (
    <div ref={slotRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
      <figure className="flex max-h-full max-w-full flex-col items-center">
        <div
          className="relative overflow-hidden"
          style={{
            width: dw || "auto", height: dh || "auto",
            borderRadius: 14,
            boxShadow: "0 24px 60px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.05)",
            background: L.card,
          }}
        >
          {ready && scale > 0 ? (
            <iframe
              ref={iframeRef}
              src={PROTO_SRC}
              title={label || "Liner 原型"}
              loading="lazy"
              onLoad={onLoad}
              className="absolute left-0 top-0 block bg-white"
              style={{
                width: PW, height: PH, border: 0,
                transform: `scale(${scale}) translate(${-focus.x}px, ${-focus.y}px)`,
                transformOrigin: "top left",
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden style={{ width: dw || 280, height: dh || 360 }}>
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: L.subtle }}>原型加载中…</span>
            </div>
          )}
        </div>
        {label ? (
          <figcaption className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: L.muted }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: L.lime }} />
            {label}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}

// ─── Autoplay-on-view video ───────────────────────────────────────────────────
function AutoplayVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.play().catch(() => {}); else el.pause(); },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="block h-full w-full object-contain" src={src} muted loop controls playsInline preload="metadata" />;
}

// ─── Shared slide shell ───────────────────────────────────────────────────────
function Shell({ children, bg, className = "" }: { children: ReactNode; bg: string; className?: string }) {
  return (
    <section
      className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-20 ${className}`}
      style={{ background: bg, fontFamily: SANS }}
    >
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const SNAPSHOT_META = [
  { k: "项目",   v: "Liner AI Scholar — AI 原生研究协作" },
  { k: "角色",   v: "研究策略 + 产品设计(端到端)" },
  { k: "周期",   v: "2025 – 2026 · 进行中" },
  { k: "合作方", v: "Liner AI · UW HCDE Capstone · North4 Studio" },
  { k: "研究",   v: "11 场访谈 · 7 位目标研究者(跨学科招募)+ 4 位活跃 Liner 用户" },
  { k: "范围",   v: "蛋白设计、公共卫生、健康数据科学、人机交互(HCI)" },
] as const;

const SNAPSHOT_STATS = [
  { n: "12M+", label: "累计用户" },
  { n: "Top 20", label: "a16z 消费级 AI" },
  { n: "10M+", label: "学术用户" },
] as const;

const TENSION = [
  ["快速、私密的试探",       "透明的协作"],
  ["反复 prompt、试想法",    "清晰的署名与归属"],
  ["早期的认知梳理(sensemaking)", "高质量、可追责的产出"],
] as const;

const PHASES = [
  { n: "01", title: "行业框定", body: "与 Liner PM 的专家访谈,叠加覆盖研究全生命周期(发现 → 标注 → 写作 → 修订)的竞品分析。" },
  { n: "02", title: "用户发现", body: "11 场访谈:7 位跨学科目标研究者 + 4 位活跃 Liner 用户,每场含工作流走查,重建真实的协作时刻。" },
  { n: "03", title: "概念验证", body: "低保真评估与可用性测试,把早期设计方向放回研究者面前。(进行中)" },
] as const;

const EXPERT = [
  { h: "降优先级:LaTeX 工作流", b: "聚焦推理与审阅,而非排版。" },
  { h: "先窄化:医学 / 生命科学学生", b: "STEM 次之,与转化数据对齐。" },
  { h: "Scholar 的关键差异点", b: "深度推理与产物生成,而不仅是搜索。" },
] as const;

const TOOLS = [
  ["文献发现", "Google Scholar · SciSpace · Research Rabbit"],
  ["引用管理", "Zotero · EndNote · Paperpile"],
  ["协作写作", "Google Docs · Word · Notion"],
  ["数据分析", "Excel · MATLAB · Prism"],
  ["AI 助手",  "ChatGPT · NotebookLM"],
] as const;

const GAPS = [
  { t: "上下文碎片化", b: "研究者在搜索、引用管理、写作、会议间穿梭,上下文无法在切换中延续。" },
  { t: "反馈未与证据关联", b: "文档里的评论没有结构性地连到引用、数据或 AI 推理,可追溯全靠手动。" },
  { t: "AI 以个人为中心", b: "多数助手只服务单个用户,没有共享记忆,也不追踪协作意图。" },
] as const;

const INSIGHTS = [
  { n: "01", t: "工具链碎片化,逼出大量手工搬运", imp: "一个项目横跨五个以上工具,引用与来源无法互通——全部 11 场访谈里最一致的痛点。Liner 应占住「迁移层」,让上下文不在切换中丢失。" },
  { n: "02", t: "AI 负责协助,人来拍板", imp: "AI 的改写与摘要,只有挨着「人工确认」那一步才被信任;系统永不替你发送或署名。把「我已审阅」做成对队友可见的显式状态。" },
  { n: "03", t: "分享的是结论,不是过程", imp: "交给团队的是核验过的来源与干净摘要,不是原始聊天记录。私密探索与共享记录,是两种心智模型,必须在架构上分开。" },
  { n: "04", t: "信任,来自可追溯的出处", imp: "一条共享主张要有用,就得带着它从哪来——引用、来源、审阅状态,都要随产物一起进入团队空间。" },
  { n: "05", t: "共享工作上,状态是隐形的", imp: "没人看得出改了什么、审过没有、哪句还是 AI 生成。Liner 需要「审阅状态」:谁、何时、核验了哪一部分,无需重读全文。" },
  { n: "06", t: "Liner 是团队流程里的个人工具", imp: "用户用它发现与阅读,再切到别处写作协作。协作要叠加在个人工作流之上,而不是强加其上。" },
] as const;

const FEATURES: {
  feature: Feature; eyebrow: string; title: ReactNode; tag: string;
  desc: ReactNode; chip: string; frameLabel: string;
}[] = [
  {
    feature: "editor",
    eyebrow: "产品方向 · 多人编辑器",
    title: "把审阅状态,织进协作写作",
    tag: "multi-user editor",
    desc: <>署名、评论与「谁审过哪一段」的信任信号直接长在文档里:引用 <Cite>1</Cite><Cite>2</Cite> 内联可溯,Dr. Chen 的评论锚定到具体句子,多人光标实时可见——正是洞察 04、05 的落点。</>,
    chip: "实时多人光标 · 句级评论 · 内联引用",
    frameLabel: "Editor · multi-user",
  },
  {
    feature: "group",
    eyebrow: "产品方向 · 群组协作",
    title: "把团队上下文,留在群聊里",
    tag: "group chat",
    desc: <>私密的 AI 推理留在「AI Chat」,团队共享的产物进入「Group」群聊:在群里分享文档、机器人推送更新、@成员跟进——<Hl>产出透明,过程私密</Hl>,正是洞察 03 的隐私边界。</>,
    chip: "AI Chat ↔ Group · 文档卡片 · 机器人更新",
    frameLabel: "Group chat",
  },
  {
    feature: "library",
    eyebrow: "产品方向 · 共享文献库",
    title: "团队级来源,引用不再断链",
    tag: "shared library",
    desc: <>1 份文档 + 6 篇来源 + Zotero,团队共享同一证据库。悬停任一来源即弹出 AI 生成的 <Hl tone="cream">TL;DR 摘要</Hl>——把缺失的「迁移层」补上,正是洞察 01 的产品启示。</>,
    chip: "悬停来源 → TL;DR 摘要",
    frameLabel: "Shared library · TL;DR",
  },
];

const REFLECTION = [
  { h: "把 AI 当研究加速器,而非捷径", b: "综合阶段用 AI 交叉比对访谈模式、生成相互竞争的解读、压力测试 framing——再由我做编辑判断,定夺什么是信号。" },
  { h: "先把模糊结构化,再去解它", b: "brief 很开放。我帮忙搭起研究架构(三段式、跨学科招募、先专家后用户),让结论有可被检验的地基。" },
  { h: "把研究翻译成产品语言", b: "上面每一条洞察都刻意落到一个设计启示。不连向决策的研究,只是墙纸。" },
  { h: "为系统设计,而非屏幕", b: "竞品分析、结构性缺口、隐私架构——它们不出现在某一个 UI 里,却是 UI 能立得住的原因。" },
] as const;

// §users — the user & how research works today (report §03)
const PERSONA = {
  name: "Maya",
  role: "社会学 · 三年级博士候选人 · 综合画像",
  quote: "「找来源我信 AI;但框架,必须是我的。」",
  team: "1 位导师 · 2 位合著者 · 1 位研究助理",
  goals: ["文献综述要快", "只共享核验过、打磨好的来源,不暴露探索过程", "团队决策可追溯"],
  frictions: ["AI 摘要漏掉审稿人会抓的学科细节", "一分享就暴露私密聊天与半成型的查询", "没法追踪队友已经读过什么"],
  stack: "Liner Scholar · Zotero · Overleaf · Google Docs · NVivo · Slack",
} as const;

const JOURNEY = [
  { n: "01", stage: "Set up",  zh: "建项目",  body: "建项目、加成员与文件、接入引用管理。", out: "统一工作区" },
  { n: "02", stage: "Explore", zh: "私密探索", body: "找来源、阅读标注、私下问 AI、看来源 TL;DR。", out: "安全的试探" },
  { n: "03", stage: "Curate",  zh: "核验分享", body: "精炼并加引用、事实核查、把精炼卡片分享给团队。", out: "可信的产出" },
  { n: "04", stage: "Align",   zh: "团队对齐", body: "读更新摘要、在线程里评论、记录决策。", out: "审阅可见" },
] as const;

// §core-decision — the central product decision (report CORE MECHANISM)
const CORE = {
  problem: "私密 AI 聊天里的好答案,常常就埋在那里。想把一条洞见搬进团队协作、又不丢上下文与信任,却没有顺畅的路径。",
  approach: [
    "一个动作:Share to group——把私密 AI 答案发进团队线程,它从此成为全队可操作的共享对象。",
    "一个闭环:对任一共享主张,队友可 Verify(对源核实并标记)、Question(存疑但不删除)、Revise(修改并留痕)。",
    "并行:Liner AI 校验每条引用都能解析到真实来源。",
  ],
  why: "「已验证」因此是一个具体、可见、由具名的人产生的状态——谁、何时、对着哪个来源核实过,全队都看得见。信任来自「协调」,而非「监视」。",
} as const;

// §decisions — key decisions & trade-offs on the record (report §05)
const DECISIONS = [
  { d: "共享精炼产物,而非原始记录", why: "研究者分享的是结论,不是过程(洞察 03)。", tradeoff: "分享那一刻更费事——这是信任的代价,接受。" },
  { d: "私密与共享,架构上分离", why: "两者是不同的心智模型(洞察 03)。", tradeoff: "要维护两个空间,而非一个统一信息流。" },
  { d: "每个 AI 动作都需人工确认", why: "AI 负责协助,人来拍板(洞察 02)。", tradeoff: "没有完全自动的捷径——这是刻意的。" },
  { d: "场景锚定文献综述,而非手稿协同", why: "研究者在 Liner 发现与阅读,再去别处写作。", tradeoff: "协作收益不如手稿直观——用「把发现延伸进共享编辑器」回答。" },
  { d: "集成能力划到下一阶段", why: "研究把「与现有工具集成」排为最紧急,但本季度聚焦核心协作 UX。", tradeoff: "最被需要的能力被推迟,而非否决。" },
] as const;

// §routes — the forks: options considered, chosen, why (report PM checkpoint + design review)
const ROUTES = [
  { fork: "协作锚点", a: "手稿协同(更直观)", b: "文献综述(真实入口)", why: "研究者本就从发现开始;把同一条流程延伸进共享编辑器,收益出现在 PM 期待的地方。" },
  { fork: "私密 ↔ 共享", a: "两个独立功能 / 标签", b: "一条连续动作 · 并排面板", why: "接缝本身就是要设计的体验;设计评审印证——别让它读起来像两个界面之间的交接。" },
  { fork: "面板布局", a: "固定并排", b: "可切换 + A/B 测试", why: "布局偏好因人而异;可切换面板 + Focus 模式,再用 A/B 测两种版式(并排 vs 上下)。" },
] as const;

// §iteration — the versions I explored → the chosen final (screenshots from real prototypes)
const ITERATION: { tag: string; src: string; title: string; note: string; win?: boolean }[] = [
  { tag: "v1", src: "/assets/liner/ideation/v1-dark.png", title: "暗色 · 个人 AI 面板", note: "AI 作为右栏快捷动作(找相关 / 头脑风暴 / 写草稿 / 加引用)。个人工具,还没有团队。" },
  { tag: "v2", src: "/assets/liner/ideation/v2-group-topbar.png", title: "Group 放进顶部标签", note: "把共享做成 Files / Editor / Chat / Group 并列的独立标签——结果它读起来像「又一个功能」。" },
  { tag: "v3", src: "/assets/liner/ideation/v3-workspace.png", title: "项目工作区", note: "补上管理层:状态、来源 / 引用 / 字数、里程碑时间线——让团队一眼读到项目状态。" },
  { tag: "最终", src: "/assets/liner/ideation/v4-final.png", title: "私密与共享,并排的一条流", note: "AI Chat 与 Group 收进并排侧栏:从私密聊天到团队线程是「一条连续动作」,而非两屏之间的交接。", win: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 Cover (dark)
function SlideCover() {
  return (
    <Shell bg={L.dark}>
      {/* subtle dotted grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E }}
          className="flex items-center gap-2.5"
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: L.lime }} />
          <span className="text-[15px] font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: SERIF }}>Liner</span>
          <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(0,0,0,0.5)" }}>
            AI Scholar
          </span>
        </motion.div>

        <div className="mt-9">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.1 }}>
            <Eye dark>UX 研究 × 产品设计 · 2025 – 2026</Eye>
          </motion.div>
          <Mask delay={0.24} className="mt-6">
            <h1
              className="font-light text-[#1A1A1A]"
              style={{ fontFamily: SERIF, fontSize: "clamp(2.1rem, 5.4vw, 4rem)", lineHeight: 1.06, letterSpacing: "-0.02em", textWrap: "balance" }}
            >
              让 AI 研究协作,<Hl dark>可被信任</Hl>。
            </h1>
          </Mask>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: E, delay: 0.5 }}
          className="mt-8 max-w-2xl text-[15px] font-light leading-[1.8]"
          style={{ color: "rgba(0,0,0,0.74)" }}
        >
          研究本是团队协作,工具却只为单人设计。我主导研究综合,找出<span style={{ color: "#1A1A1A" }}>上下文与信任</span>
          在从私密到共享的交接中,断在哪、为什么,再把它变成一连串写明「为什么」与「取舍」的产品决策。
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-12 flex items-center gap-4"
        >
          <Rule dark className="w-10" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "rgba(0,0,0,0.5)" }}>
            Liner AI · UW HCDE Capstone · North4 Studio
          </span>
        </motion.div>
      </div>
    </Shell>
  );
}

// §01 Snapshot
function SlideSnapshot() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>项目快照</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)", letterSpacing: "-0.018em" }}>
            一页讲清:谁、做什么、有多大。
          </h2>
        </Mask>

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
          {SNAPSHOT_META.map(({ k, v }, i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.14 + i * 0.05 }}
              className="flex gap-4 border-t pt-3.5"
              style={{ borderColor: L.bSubtle }}
            >
              <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>{k}</span>
              <span className="text-[14px] leading-snug" style={{ color: L.body }}>{v}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-end gap-x-12 gap-y-6 rounded-xl px-7 py-6"
          style={{ background: L.cream }}
        >
          {SNAPSHOT_STATS.map((s) => (
            <div key={s.label}>
              <p className="font-light leading-none" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)" }}>{s.n}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: L.muted }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Shell>
  );
}

// §02 Context
function SlideContext() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-4xl">
        <Eye>背景 · 战略下注</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.7rem, 3.8vw, 2.8rem)", lineHeight: 1.12, letterSpacing: "-0.018em", textWrap: "balance" }}>
            从<Hl>单人 AI 研究</Hl>,到<Hl tone="cream">团队协作</Hl>。
          </h2>
        </Mask>
        <div className="mt-9 max-w-2xl space-y-6 text-[15.5px] font-light leading-[1.8]" style={{ color: L.body }}>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.2 }}>
            Liner 已经做出很强的单人 AI 研究体验:<Cited>12M+ 累计用户</Cited><Cite>1</Cite>、被 a16z 列为消费级 AI Top 20、
            在美国学术圈渗透率很高。战略下注是——把它进化成团队能一起用的产品。
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.34 }}>
            但 brief 本身是模糊的:当 AI 生成的产物从私密走向共享,断裂就发生了。
            我们的任务,是搞清楚它<span style={{ color: L.ink, fontWeight: 500 }}>断在哪、为什么</span>。
          </motion.p>
        </div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: E, delay: 0.55 }}
          className="mt-8 text-[11px] font-medium leading-relaxed" style={{ fontFamily: SANS, color: L.subtle }}
        >
          [1] Liner 官方 / a16z「Top 100 Gen-AI Consumer Apps」公开数据
        </motion.p>
      </div>
    </Shell>
  );
}

// §03 Tension table
function SlideTension() {
  return (
    <Shell bg={L.canvas}>
      <div className="mx-auto w-full max-w-4xl">
        <Eye>核心张力</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", letterSpacing: "-0.018em", textWrap: "balance" }}>
            AI 擅长的,恰恰是学术研究最警惕的。
          </h2>
        </Mask>

        <div className="mt-10 overflow-hidden rounded-xl" style={{ border: `1px solid ${L.bSubtle}`, background: L.card }}>
          <div className="grid grid-cols-2">
            <div className="px-6 py-3.5" style={{ borderRight: `1px solid ${L.bSubtle}`, borderBottom: `1px solid ${L.bSubtle}`, background: L.cream }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.muted }}>AI 工具带来</span>
            </div>
            <div className="px-6 py-3.5" style={{ borderBottom: `1px solid ${L.bSubtle}`, background: L.cream }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.ink }}>学术研究要求</span>
            </div>
            {TENSION.map(([a, b], i) => (
              <Fragment2 key={a}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.2 + i * 0.1 }}
                  className="px-6 py-5 text-[15px] leading-snug"
                  style={{ borderRight: `1px solid ${L.bSubtle}`, borderTop: i ? `1px solid ${L.bSubtle}` : undefined, color: L.muted }}
                >
                  {a}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.26 + i * 0.1 }}
                  className="px-6 py-5 text-[15px] font-medium leading-snug"
                  style={{ borderTop: i ? `1px solid ${L.bSubtle}` : undefined, color: L.ink }}
                >
                  {b}
                </motion.div>
              </Fragment2>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// tiny fragment helper to keep the grid flat
function Fragment2({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// §04 Reframe (dark)
function SlideReframe() {
  return (
    <Shell bg={L.dark}>
      <div className="mx-auto w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>核心问题</Eye>
        </motion.div>
        <Mask delay={0.2} className="mt-8">
          <p
            className="font-light text-[#1A1A1A]"
            style={{ fontFamily: SERIF, fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.24, letterSpacing: "-0.015em", textWrap: "balance" }}
          >
            研究本是团队协作,工具却只为单人。
          </p>
        </Mask>
        <Mask delay={0.4} className="mt-1">
          <p
            className="font-light"
            style={{ fontFamily: SERIF, color: "rgba(0,0,0,0.92)", fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.24, letterSpacing: "-0.015em", textWrap: "balance" }}
          >
            上下文与信任,就断在私密与共享的<Hl dark>接缝</Hl>处。
          </p>
        </Mask>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-10 flex items-center gap-4"
        >
          <Rule dark className="w-10" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "rgba(0,0,0,0.5)" }}>
            十一场访谈综合后,锁定的真问题
          </span>
        </motion.div>
      </div>
    </Shell>
  );
}

// §05 Strategy
function SlideStrategy() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>研究策略</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", letterSpacing: "-0.018em" }}>
            下结论之前,先做三段式三角验证。
          </h2>
        </Mask>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.18 + i * 0.1 }}
              className="rounded-xl px-6 py-6"
              style={{ background: i === 2 ? L.cream : L.card, border: `1px solid ${L.bSubtle}` }}
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-light tabular-nums" style={{ fontFamily: SERIF, color: L.limeDeep, fontSize: "1.7rem" }}>{p.n}</span>
                <span className="text-[15px] font-semibold" style={{ color: L.ink }}>{p.title}</span>
              </div>
              <Rule className="mt-4 w-full" />
              <p className="mt-4 text-[13.5px] font-light leading-[1.7]" style={{ color: L.body }}>{p.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.55 }}
          className="mt-8 max-w-3xl text-[14px] font-light leading-[1.75]" style={{ color: L.muted }}
        >
          我坚持的一点:<Hl>两组并行招募</Hl>——7 位跨学科目标研究者,外加 4 位活跃 Liner 用户。
          「我们为谁设计」与「谁已经在用」是两回事;只聊一类人,就只会为一类人设计。
        </motion.p>
      </div>
    </Shell>
  );
}

// §06 Expert interview
function SlideExpert() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-4xl">
        <Eye>专家访谈 · Liner PM</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", letterSpacing: "-0.018em" }}>
            PM 对话,早早改变了方向。
          </h2>
        </Mask>

        <div className="mt-10 space-y-0">
          {EXPERT.map((e, i) => (
            <motion.div
              key={e.h}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.18 + i * 0.1 }}
              className="flex items-start gap-5 py-5"
              style={{ borderTop: `1px solid ${L.bSubtle}` }}
            >
              <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: L.lime }} />
              <div>
                <p className="text-[16px] font-semibold leading-snug" style={{ color: L.ink }}>{e.h}</p>
                <p className="mt-1 text-[14px] font-light leading-relaxed" style={{ color: L.body }}>{e.b}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: E, delay: 0.55 }}
          className="mt-7 text-[14px] font-light italic" style={{ fontFamily: SERIF, color: L.muted }}
        >
          早一步据此调整,省下了数周的错向研究。
        </motion.p>
      </div>
    </Shell>
  );
}

// §07 Competitive landscape
function SlideLandscape() {
  return (
    <Shell bg={L.canvas}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>竞争格局</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.5rem, 3.2vw, 2.3rem)", letterSpacing: "-0.018em", textWrap: "balance" }}>
            生态按阶段割裂,协作恰恰缺在 AI 最活跃处。
          </h2>
        </Mask>

        <div className="mt-9 grid grid-cols-1 gap-8 md:grid-cols-[0.9fr_1.1fr]">
          {/* tools by stage */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.2 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>各阶段的真实工具栈</p>
            <div className="mt-4 overflow-hidden rounded-xl" style={{ border: `1px solid ${L.bSubtle}`, background: L.card }}>
              {TOOLS.map(([stage, tools], i) => (
                <div key={stage} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i ? `1px solid ${L.bSubtle}` : undefined }}>
                  <span className="w-16 shrink-0 text-[12.5px] font-semibold" style={{ color: L.ink }}>{stage}</span>
                  <span className="text-[12px] font-light" style={{ color: L.muted }}>{tools}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* structural gaps */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.32 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>三处结构性缺口</p>
            <div className="mt-4 space-y-3">
              {GAPS.map((g) => (
                <div key={g.t} className="rounded-xl px-5 py-4" style={{ background: L.cream }}>
                  <p className="text-[14px] font-semibold" style={{ color: L.ink }}>{g.t}</p>
                  <p className="mt-1.5 text-[12.5px] font-light leading-[1.65]" style={{ color: L.body }}>{g.b}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}

// §08 Insights overview
function SlideInsights() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>综合 · 十一场访谈 → 六条洞察</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.5rem, 3.2vw, 2.3rem)", letterSpacing: "-0.018em", textWrap: "balance" }}>
            六条洞察,每条都落到一个产品启示。
          </h2>
        </Mask>

        <div className="mt-8 space-y-0">
          {INSIGHTS.map((ins, i) => (
            <motion.div
              key={ins.n}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: E, delay: 0.16 + i * 0.07 }}
              className="grid grid-cols-[2rem_1fr] items-start gap-x-4 gap-y-1 py-3.5 md:grid-cols-[2.2rem_0.9fr_1.2fr]"
              style={{ borderTop: `1px solid ${L.bSubtle}` }}
            >
              <span className="font-light tabular-nums" style={{ fontFamily: SERIF, color: L.limeDeep, fontSize: "1.25rem" }}>{ins.n}</span>
              <p className="text-[14.5px] font-semibold leading-snug" style={{ color: L.ink }}>{ins.t}</p>
              <p className="col-span-2 pl-12 text-[13px] font-light leading-[1.6] md:col-span-1 md:pl-0" style={{ color: L.body }}>
                <span className="mr-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: L.subtle }}>启示 →</span>
                {ins.imp}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// §09 Spotlight — insight 03 (dark)
function SlideSpotlight() {
  return (
    <Shell bg={L.dark}>
      <div className="mx-auto w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>洞察 03 · 隐私边界</Eye>
        </motion.div>

        <Mask delay={0.2} className="mt-8">
          <blockquote
            className="font-light text-[#1A1A1A]"
            style={{ fontFamily: SERIF, fontSize: "clamp(1.25rem, 2.9vw, 2.05rem)", lineHeight: 1.42, letterSpacing: "-0.01em", textWrap: "balance" }}
          >
            「AI 的 prompt 很有用,但我不想把 <Hl dark>prompt / 日志</Hl> 透明地共享给队友。
            我要的是文件、信息、活动历史<span style={{ color: "#1A1A1A" }}>完全透明</span>。这两者,必须被清楚地分开。」
          </blockquote>
        </Mask>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: E, delay: 0.6 }}
          className="mt-5 text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "rgba(0,0,0,0.5)" }}
        >
          — 综合自受访研究者
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: E, delay: 0.75 }}
          className="mt-9 rounded-xl px-6 py-5"
          style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)" }}
        >
          <p className="text-[14.5px] font-light leading-[1.75]" style={{ color: "rgba(0,0,0,0.86)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: L.limeDeep }}>设计启示 ·&nbsp;</span>
            这不是一个「设置开关」问题,而是一条<span style={{ color: "#1A1A1A", fontWeight: 500 }}>架构分界线</span>——把私密 AI 工作区与共享团队上下文从底层分开。做错,比缺任何功能都更快摧毁信任。
          </p>
        </motion.div>
      </div>
    </Shell>
  );
}

// §10 Direction
function SlideDirection() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-4xl">
        <Eye>从研究到方向</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.55rem, 3.4vw, 2.5rem)", lineHeight: 1.16, letterSpacing: "-0.018em", textWrap: "balance" }}>
            Liner = 私密 AI 推理与共享团队问责之间的<Hl>「连接组织」</Hl>。
          </h2>
        </Mask>
        <div className="mt-9 max-w-2xl space-y-6 text-[15.5px] font-light leading-[1.8]" style={{ color: L.body }}>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.2 }}>
            这六条洞察不只描述痛点,它们指向一个连贯的设计空间。Liner 的机会,不是再做一个协作编辑器,
            而是成为那一层——让 AI 辅助的研究<span style={{ color: L.ink, fontWeight: 500 }}>对团队「可读」</span>:
            保住上下文、传递信任、在协作混乱的中段管理状态。
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.34 }}>
            这条 framing,直接转译成<span style={{ color: L.ink, fontWeight: 500 }}>三种交互模式</span>。
          </motion.p>
        </div>
      </div>
    </Shell>
  );
}

// §11 Three interaction patterns
// §11–13 Feature slides — each frames the live prototype on the feature it narrates.
function FeatureSlide({ data, index }: { data: (typeof FEATURES)[number]; index: number }) {
  return (
    <Shell bg={L.canvas} className="!justify-start">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 items-center gap-6 pb-3 pt-7 md:grid-cols-[0.74fr_1.26fr] md:gap-10 md:pb-4 md:pt-9">
        {/* narrative */}
        <div className="min-w-0">
          <Eye>{data.eyebrow}</Eye>
          <Mask delay={0.08} className="mt-4">
            <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.45rem, 2.9vw, 2.2rem)", lineHeight: 1.18, letterSpacing: "-0.018em" }}>
              {data.title}
            </h2>
          </Mask>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: L.subtle }}>{data.tag}</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.25 }}
            className="mt-6 max-w-md text-[14.5px] font-light leading-[1.78]" style={{ color: L.body }}
          >
            {data.desc}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.4 }}
            className="mt-7 inline-flex items-center gap-2 rounded-full px-3.5 py-2" style={{ background: L.cream }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: L.limeDeep }} />
            <span className="text-[12px] font-medium" style={{ color: L.ink }}>{data.chip}</span>
          </motion.div>
        </div>
        {/* live embed framed to this feature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: E, delay: 0.18 }}
          className="flex h-full min-h-0"
        >
          <LinerFeatureFrame feature={data.feature} label={`${String(index + 1).padStart(2, "0")} · ${data.frameLabel}`} />
        </motion.div>
      </div>
    </Shell>
  );
}

function SlideFeatEditor()  { return <FeatureSlide data={FEATURES[0]} index={0} />; }
function SlideFeatGroup()   { return <FeatureSlide data={FEATURES[1]} index={1} />; }
function SlideFeatLibrary() { return <FeatureSlide data={FEATURES[2]} index={2} />; }

// §13 Product video
function SlideVideo() {
  const ready = useAfterEnter(360);
  return (
    <Shell bg={L.dark} className="!justify-start">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col pb-3 pt-8 md:pt-10">
        <div className="flex shrink-0 items-end justify-between">
          <div>
            <Eye dark>产品视频</Eye>
            <h2 className="mt-3 font-light text-[#1A1A1A]" style={{ fontFamily: SERIF, fontSize: "clamp(1.3rem, 2.8vw, 2rem)", letterSpacing: "-0.018em" }}>
              端到端体验。
            </h2>
          </div>
        </div>
        <div className="mt-5 flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative flex h-full items-center justify-center overflow-hidden rounded-xl"
            style={{ aspectRatio: "16 / 9", maxWidth: "100%", maxHeight: "100%", background: "#000" }}
          >
            {ready ? (
              <AutoplayVideo src="/assets/liner/liner-product-video.mp4" />
            ) : (
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(0,0,0,0.5)" }}>视频加载中…</span>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// §14 Impact (dark)
function SlideImpact() {
  const stats = [
    { to: 12, suffix: "M+", label: "累计用户",        detail: "Liner 全平台累计注册", key: true },
    { to: 20, prefix: "Top ", suffix: "", label: "a16z 消费级 AI", detail: "上榜 a16z Gen-AI 消费应用榜" },
    { to: 10, suffix: "M+", label: "学术用户",        detail: "研究与学习场景的核心受众" },
  ];
  return (
    <Shell bg={L.dark}>
      <div className="mx-auto w-full max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>成效与规模</Eye>
        </motion.div>
        <Mask delay={0.2} className="mt-5">
          <h2 className="font-light text-[#1A1A1A]" style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "-0.02em" }}>
            研究综合,建在真实规模之上。
          </h2>
        </Mask>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.4 + i * 0.14 }}
              className={`px-2 py-3 md:px-8 ${i > 0 ? "md:border-l" : ""}`}
              style={{ borderColor: "rgba(0,0,0,0.14)" }}
            >
              <p className="font-light leading-none" style={{ fontFamily: SERIF, fontSize: "clamp(2.4rem, 5vw, 3.9rem)", color: s.key ? L.lime : "#1A1A1A" }}>
                <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} startDelay={300 + i * 140} duration={1200} />
              </p>
              <p className="mt-3 text-[13px] font-medium text-[#1A1A1A]">{s.label}</p>
              <p className="mt-1.5 text-[11.5px] font-light leading-relaxed" style={{ color: "rgba(0,0,0,0.6)" }}>{s.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: E, delay: 0.9 }}
          className="mt-9 max-w-2xl text-[13px] font-light leading-[1.78]" style={{ color: "rgba(0,0,0,0.7)" }}
        >
          研究记录与高保真原型已交付 Liner;Liner 已确认将协作式「共审 + 共写」流程落地产品,概念验证(PoC)于 2026 年 6 月启动。
        </motion.p>
      </div>
    </Shell>
  );
}

// §15 Reflection
function SlideReflection() {
  return (
    <Shell bg={L.page}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>我如何工作</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.6rem, 3.4vw, 2.5rem)", letterSpacing: "-0.018em" }}>
            这个项目证明了什么。
          </h2>
        </Mask>

        <div className="mt-9 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          {REFLECTION.map((r, i) => (
            <motion.div
              key={r.h}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.16 + i * 0.08 }}
              className="border-t pt-4"
              style={{ borderColor: L.bSubtle }}
            >
              <div className="flex items-start gap-3">
                <span className="font-light tabular-nums" style={{ fontFamily: SERIF, color: L.limeDeep, fontSize: "1.1rem" }}>0{i + 1}</span>
                <div>
                  <p className="text-[15px] font-semibold leading-snug" style={{ color: L.ink }}>{r.h}</p>
                  <p className="mt-2 text-[13px] font-light leading-[1.7]" style={{ color: L.body }}>{r.b}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// §16 Closing (dark)
function SlideClosing() {
  return (
    <Shell bg={L.dark}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>设计结论</Eye>
        </motion.div>
        <Mask delay={0.2} className="mt-7">
          <p
            className="font-light text-[#1A1A1A]"
            style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 3.6vw, 2.6rem)", lineHeight: 1.3, letterSpacing: "-0.018em", textWrap: "balance" }}
          >
            团队要的不是又一个编辑器,而是一层让 AI 工作<Hl dark>可被信任、可被看见、可被交接</Hl>的连接组织。
          </p>
        </Mask>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: E, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/work/liner"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-transform hover:-translate-y-px"
            style={{ background: L.lime, color: L.ink }}
          >
            查看完整案例 <span aria-hidden>→</span>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-11 text-[11px] font-medium leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}
        >
          North4 Studio — Monica Zhang · Jenn Koh · Jen Zhang · Yuan Fang
          <br />
          UW HCDE Capstone · Liner AI
        </motion.p>
      </div>
    </Shell>
  );
}

// §users — the user & how research works today
function SlideUsers() {
  return (
    <Shell bg={L.page} className="!justify-start">
      <div className="mx-auto w-full max-w-6xl pt-8 md:pt-10">
        <Eye>用户 · 我们为谁设计</Eye>
        <Mask delay={0.08} className="mt-4">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.45rem, 3vw, 2.2rem)", letterSpacing: "-0.018em" }}>
            一个人思考,却要和团队一起发表。
          </h2>
        </Mask>

        <div className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-[0.82fr_1.18fr]">
          {/* persona card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.18 }}
            className="rounded-2xl px-6 py-5" style={{ background: L.cream }}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-semibold" style={{ background: L.ink, color: L.page, fontFamily: SERIF }}>M</span>
              <div>
                <p className="text-[15.5px] font-semibold" style={{ color: L.ink }}>{PERSONA.name}</p>
                <p className="text-[11px]" style={{ color: L.muted }}>{PERSONA.role}</p>
              </div>
            </div>
            <p className="mt-3.5 text-[13.5px] font-light italic leading-relaxed" style={{ fontFamily: SERIF, color: L.body }}>{PERSONA.quote}</p>
            <p className="mt-2 text-[10.5px]" style={{ color: L.subtle }}>{PERSONA.team}</p>
            <Rule className="mt-3.5 w-full" />
            <p className="mt-3.5 text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>目标</p>
            <ul className="mt-1.5 space-y-1">
              {PERSONA.goals.map((g) => (
                <li key={g} className="flex gap-2 text-[12px] font-light leading-snug" style={{ color: L.body }}>
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ background: L.limeDeep }} />{g}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>摩擦</p>
            <ul className="mt-1.5 space-y-1">
              {PERSONA.frictions.map((g) => (
                <li key={g} className="flex gap-2 text-[12px] font-light leading-snug" style={{ color: L.body }}>
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ background: L.orange }} />{g}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[9.5px] leading-relaxed" style={{ color: L.subtle }}>{PERSONA.stack}</p>
          </motion.div>

          {/* four-stage journey */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.3 }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.subtle }}>Maya 的端到端旅程 · 从散落工具到一个可核验的共享工作区</p>
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {JOURNEY.map((j) => (
                <div key={j.n} className="rounded-xl px-5 py-4" style={{ background: L.card, border: `1px solid ${L.bSubtle}` }}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-light tabular-nums" style={{ fontFamily: SERIF, color: L.limeDeep, fontSize: "1.15rem" }}>{j.n}</span>
                    <span className="text-[13px] font-semibold" style={{ color: L.ink }}>{j.zh}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: L.subtle }}>{j.stage}</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] font-light leading-[1.55]" style={{ color: L.body }}>{j.body}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium" style={{ color: L.ink }}>
                    <span aria-hidden style={{ color: L.limeDeep }}>→</span>{j.out}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3.5 text-[12px] font-light leading-relaxed" style={{ color: L.muted }}>
              共同节奏:<Hl>独自探索、起草 → 汇合来审阅、对齐、定稿</Hl>。设计把这一「汇合时刻」搬进 Liner。
            </p>
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}

// §core-decision — the central product decision (dark)
function SlideCoreDecision() {
  const cols: { k: string; body?: string; list?: readonly string[]; tone?: "lime" }[] = [
    { k: "问题是什么", body: CORE.problem },
    { k: "我的思路", list: CORE.approach },
    { k: "为什么能成立", body: CORE.why, tone: "lime" },
  ];
  return (
    <Shell bg={L.dark} className="!justify-start">
      <div className="mx-auto w-full max-w-5xl pt-9 md:pt-11">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>核心决策 · 一个动作,一个闭环</Eye>
        </motion.div>
        <Mask delay={0.16} className="mt-5">
          <h2 className="font-light text-[#1A1A1A]" style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 3.4vw, 2.5rem)", letterSpacing: "-0.018em", textWrap: "balance" }}>
            Share to group,然后 <Hl dark>Verify · Question · Revise</Hl>。
          </h2>
        </Mask>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cols.map((c, i) => (
            <motion.div key={c.k}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.28 + i * 0.12 }}
              className="rounded-xl px-5 py-5" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.1)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: L.limeDeep }}>{c.k}</p>
              <Rule dark className="mt-3 w-full" />
              {c.list ? (
                <ul className="mt-3.5 space-y-2.5">
                  {c.list.map((x, j) => (
                    <li key={j} className="flex gap-2 text-[12.5px] font-light leading-[1.6]" style={{ color: "rgba(0,0,0,0.82)" }}>
                      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full" style={{ background: L.lime }} />{x}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3.5 text-[13px] font-light leading-[1.72]" style={{ color: c.tone === "lime" ? "#1A1A1A" : "rgba(0,0,0,0.78)" }}>{c.body}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// §decisions — key decisions & trade-offs ledger
function SlideDecisions() {
  return (
    <Shell bg={L.canvas} className="!justify-start">
      <div className="mx-auto w-full max-w-5xl pt-8 md:pt-10">
        <Eye>决策台账 · 记录在案</Eye>
        <Mask delay={0.08} className="mt-4">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.45rem, 3vw, 2.2rem)", letterSpacing: "-0.018em" }}>
            每个决定,都写明为什么、以及代价。
          </h2>
        </Mask>
        <div className="mt-6 overflow-hidden rounded-xl" style={{ border: `1px solid ${L.bSubtle}`, background: L.card }}>
          <div className="grid grid-cols-[1.05fr_1fr_1fr] px-5 py-2.5" style={{ background: L.cream }}>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.ink }}>决策</span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.muted }}>为什么</span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.muted }}>取舍</span>
          </div>
          {DECISIONS.map((d, i) => (
            <motion.div key={d.d}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: E, delay: 0.16 + i * 0.07 }}
              className="grid grid-cols-[1.05fr_1fr_1fr] gap-3 px-5 py-3" style={{ borderTop: `1px solid ${L.bSubtle}` }}>
              <span className="text-[12.5px] font-semibold leading-snug" style={{ color: L.ink }}>{d.d}</span>
              <span className="text-[11.5px] font-light leading-[1.5]" style={{ color: L.body }}>{d.why}</span>
              <span className="text-[11.5px] font-light leading-[1.5]" style={{ color: L.muted }}>{d.tradeoff}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// §routes — options considered → chosen → why best
function SlideRoutes() {
  return (
    <Shell bg={L.page} className="!justify-start">
      <div className="mx-auto w-full max-w-5xl pt-8 md:pt-10">
        <Eye>方向抉择 · 基于方案</Eye>
        <Mask delay={0.08} className="mt-4">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.45rem, 3vw, 2.2rem)", letterSpacing: "-0.018em" }}>
            每个岔路,我选了哪条、为什么最好。
          </h2>
        </Mask>
        <div className="mt-6 space-y-3">
          {ROUTES.map((r, i) => (
            <motion.div key={r.fork}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: E, delay: 0.16 + i * 0.09 }}
              className="grid grid-cols-1 items-center gap-3 rounded-xl px-5 py-4 md:grid-cols-[0.62fr_1.5fr_1.7fr]"
              style={{ background: L.card, border: `1px solid ${L.bSubtle}` }}>
              <span className="text-[12px] font-semibold" style={{ color: L.subtle }}>{r.fork}</span>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="rounded-md px-2 py-1 line-through" style={{ background: L.tint, color: L.muted }}>{r.a}</span>
                <span aria-hidden style={{ color: L.faint }}>vs</span>
                <span className="rounded-md px-2 py-1 font-semibold" style={{ background: L.limeSoft, color: L.ink }}>{r.b}</span>
              </div>
              <p className="text-[12px] font-light leading-[1.6]" style={{ color: L.body }}>
                <span className="mr-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: L.limeDeep }}>为什么 →</span>{r.why}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: E, delay: 0.5 }}
          className="mt-5 text-[12px] font-light leading-relaxed" style={{ color: L.muted }}>
          还有一条留给工程:并发 AI 编辑用「区块分配 + 分支合并确认(类似 PR)」避免冲突——已随交接进入下一阶段。
        </motion.p>
      </div>
    </Shell>
  );
}

// §iteration — the versions I explored → the chosen final (real prototype captures)
function SlideIteration() {
  const ready = useAfterEnter(280);
  return (
    <Shell bg={L.canvas} className="!justify-start">
      <div className="mx-auto w-full max-w-6xl pt-8 md:pt-10">
        <Eye>方向 · 迭代演进</Eye>
        <Mask delay={0.08} className="mt-4">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.45rem, 3vw, 2.2rem)", letterSpacing: "-0.018em" }}>
            我试过的版本,和我为什么选了最后一个。
          </h2>
        </Mask>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {ITERATION.map((it, i) => (
            <motion.figure key={it.tag}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.2 + i * 0.1 }}
              className="flex flex-col">
              <div className="relative overflow-hidden rounded-xl"
                style={{ border: `1px solid ${it.win ? L.limeDeep : "transparent"}`, boxShadow: it.win ? "0 12px 30px rgba(0,0,0,0.13)" : "0 4px 12px rgba(0,0,0,0.05)", aspectRatio: "1440 / 900", background: L.card }}>
                {ready ? (
                  <img src={it.src} alt={it.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : null}
                <span className="absolute left-2 top-2 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{ background: it.win ? L.lime : "rgba(255,255,255,0.92)", color: L.ink }}>
                  {it.win ? "✓ 我选的" : it.tag}
                </span>
              </div>
              <figcaption className="mt-2.5">
                <p className="text-[12.5px] font-semibold leading-snug" style={{ color: it.win ? L.ink : L.body }}>{it.title}</p>
                <p className="mt-1 text-[10.5px] font-light leading-[1.5]" style={{ color: L.muted }}>{it.note}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: E, delay: 0.6 }}
          className="mt-5 text-[12px] font-light leading-relaxed" style={{ color: L.muted }}>
          演进呼应报告的四个阶段:<Hl>聊天先行 → 工作流展开 → 编辑器成型 → 验证定稿</Hl>。真正的转折,是设计评审后把「私密 ↔ 共享」从两个标签,收成一条连续动作。
        </motion.p>
      </div>
    </Shell>
  );
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":      return <SlideCover />;
    case "snapshot":   return <SlideSnapshot />;
    case "context":    return <SlideContext />;
    case "tension":    return <SlideTension />;
    case "reframe":    return <SlideReframe />;
    case "strategy":   return <SlideStrategy />;
    case "expert":     return <SlideExpert />;
    case "landscape":  return <SlideLandscape />;
    case "users":      return <SlideUsers />;
    case "insights":   return <SlideInsights />;
    case "spotlight":     return <SlideSpotlight />;
    case "core-decision": return <SlideCoreDecision />;
    case "decisions":     return <SlideDecisions />;
    case "routes":        return <SlideRoutes />;
    case "iteration":     return <SlideIteration />;
    case "direction":     return <SlideDirection />;
    case "feat-editor":  return <SlideFeatEditor />;
    case "feat-group":   return <SlideFeatGroup />;
    case "feat-library": return <SlideFeatLibrary />;
    case "video":        return <SlideVideo />;
    case "impact":     return <SlideImpact />;
    case "reflection": return <SlideReflection />;
    case "closing":    return <SlideClosing />;
    default:           return null;
  }
}

// ─── Chapter nav ──────────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map((s) => s.chapter))];
const CH_START = CHAPTERS.map((ch) => SLIDES.findIndex((s) => s.chapter === ch));

function DeckSlideScrubber({ idx, total, dark, onChange }: { idx: number; total: number; dark: boolean; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full" aria-hidden
        style={{ background: dark ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.12)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: L.lime }} />
      </div>
      <input type="range" min={0} max={max} step={1} value={idx}
        aria-label="幻灯片位置" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ChapterPills({ current, dark, onJump }: { current: string; dark: boolean; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-500 ease-out ${
              on ? "px-3 py-[3px] text-[9px] font-semibold uppercase tracking-[0.18em]" : "h-1.5 w-1.5"
            }`}
            style={on
              ? { background: L.lime, color: L.ink }
              : { background: dark ? "rgba(0,0,0,0.38)" : "rgba(0,0,0,0.2)" }}
            aria-label={`跳转到章节:${ch}`}>
            {on ? ch : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Directional transition ───────────────────────────────────────────────────
const slideVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir >= 0 ? -56 : 56 }),
};

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClientZh() {
  const reduced = useReducedMotion();
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const total    = SLIDES.length;
  const slide    = SLIDES[idx];
  const dark     = slide.dark;
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;
  const minsLeft = Math.max(1, Math.ceil(((total - 1 - idx) * 45) / 60));

  const paginate = useCallback((step: number) => {
    setState(([i]) => {
      const n = Math.min(total - 1, Math.max(0, i + step));
      return [n, n === i ? 0 : n > i ? 1 : -1];
    });
  }, [total]);

  const jump = useCallback((target: number) => {
    setState(([i]) => {
      const n = Math.min(total - 1, Math.max(0, target));
      return [n, n === i ? 0 : n > i ? 1 : -1];
    });
  }, [total]);

  const prev = useCallback(() => paginate(-1), [paginate]);
  const next = useCallback(() => paginate(1),  [paginate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft",  "PageUp"].includes(e.key))        { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const chromeBg     = "rgba(255,255,255,0.85)";
  const chromeBorder = "rgba(0,0,0,0.07)";
  const navStrong    = L.body;
  const navMeta      = L.subtle;

  return (
    <div className="relative h-screen overflow-hidden" style={{ fontFamily: SANS, background: dark ? L.dark : L.page }}>
      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full" style={{ background: L.lime }}
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10"
        style={{ background: chromeBg, borderColor: chromeBorder }}>
        <div className="flex items-center gap-5">
          <Link href="/work/liner"
            className="text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors"
            style={{ color: navStrong }}>
            ← Liner 案例
          </Link>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] md:inline" style={{ color: navMeta }}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden text-[10px] font-medium md:inline" style={{ color: navMeta }}>~{minsLeft} 分钟</span>
          <span className="text-[10px] font-medium tabular-nums" style={{ color: navMeta }}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide area */}
      <main className="relative h-full min-h-0 overflow-hidden">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div key={slide.id} custom={dir}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : "enter"}
            animate={reduced ? undefined : "center"}
            exit={reduced ? undefined : "exit"}
            transition={{ duration: 0.5, ease: E }}
            className="absolute inset-x-0 bottom-14 top-14">
            <SlideRenderer id={slide.id} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-40 border-t backdrop-blur-md transition-colors duration-500"
        style={{ background: chromeBg, borderColor: chromeBorder }}>
        <div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3"
            style={{ color: navStrong }}>
            上一页
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-2.5">
            <DeckSlideScrubber idx={idx} total={total} dark={dark} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} dark={dark} onJump={jump} />
            </div>
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1}
            className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors disabled:opacity-20 md:px-3"
            style={{ color: navStrong }}>
            下一页
          </button>
        </div>
      </footer>
    </div>
  );
}
