"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Liner · light tokens (mirror the liner-ui design language) ────────────────
//   Warm paper canvas, cream surfaces, ink-on-paper type, the lime highlighter as
//   the single restrained accent, dotted-line citation motif. The few "dark"
//   slides use a warm near-black as dramatic punctuation, not a dark-mode theme.
const L = {
  page:       "#FAFAF7", // warm paper
  canvas:     "#F7F5EE",
  card:       "#FFFFFF",
  cream:      "#F4EFE6", // signature cream surface
  creamDeep:  "#ECDFCA",
  tint:       "#F0EDE4",
  ink:        "#1A1A1A", // headlines, primary
  body:       "#3A3A38", // body text
  muted:      "#6B6864", // metadata
  subtle:     "#9A958D", // labels, eyebrow
  faint:      "#C4BFB6",
  lime:       "#D4E84A", // the signature lime-yellow
  limeSoft:   "#E8F0A8",
  limeDeep:   "#B8CC2A",
  creamHl:    "#F7ECC6",
  orange:     "#F0A868",
  orangeSoft: "#FBD9B8",
  bSubtle:    "rgba(60,50,30,0.08)",
  bDefault:   "rgba(60,50,30,0.12)",
  bStrong:    "rgba(60,50,30,0.2)",
  dotted:     "rgba(60,50,30,0.32)",
  dottedStr:  "rgba(26,26,26,0.5)",
  dark:       "#17150F", // warm near-black — punctuation slides
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
  { id: "cover",      chapter: "开篇", dark: true  },
  { id: "snapshot",   chapter: "开篇", dark: false },
  { id: "context",    chapter: "背景", dark: false },
  { id: "tension",    chapter: "背景", dark: false },
  { id: "reframe",    chapter: "背景", dark: true  },
  { id: "strategy",   chapter: "研究", dark: false },
  { id: "expert",     chapter: "研究", dark: false },
  { id: "landscape",  chapter: "研究", dark: false },
  { id: "insights",   chapter: "洞察", dark: false },
  { id: "spotlight",  chapter: "洞察", dark: true  },
  { id: "direction",  chapter: "产品", dark: false },
  { id: "patterns",   chapter: "产品", dark: false },
  { id: "prototype",  chapter: "产品", dark: false },
  { id: "video",      chapter: "产品", dark: false },
  { id: "impact",     chapter: "成效", dark: true  },
  { id: "reflection", chapter: "结语", dark: false },
  { id: "closing",    chapter: "结语", dark: true  },
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

// ─── Eyebrow with dotted lead line ────────────────────────────────────────────
function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  const col = dark ? "rgba(255,255,255,0.6)" : L.subtle;
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="block h-px w-7 shrink-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${dark ? "rgba(255,255,255,0.45)" : L.dotted} 50%, transparent 50%)`,
          backgroundSize: "5px 1px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: col, fontFamily: SANS }}>
        {children}
      </p>
    </div>
  );
}

// ─── Highlighter swatch (light) / lime ink (dark) ─────────────────────────────
function Hl({ children, dark, tone = "lime" }: { children: ReactNode; dark?: boolean; tone?: "lime" | "cream" }) {
  if (dark) {
    return <span style={{ color: L.lime }}>{children}</span>;
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

// ─── Dotted divider ───────────────────────────────────────────────────────────
function Dotted({ className = "", dark }: { className?: string; dark?: boolean }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        height: 1,
        backgroundImage: `linear-gradient(to right, ${dark ? "rgba(255,255,255,0.28)" : L.dotted} 50%, transparent 50%)`,
        backgroundSize: "6px 1px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

// ─── Citation chip + dotted-underline phrase ──────────────────────────────────
function Cite({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className="ml-1 inline-flex h-4 items-center justify-center rounded-[4px] px-1 align-[2px] text-[9.5px] font-semibold tabular-nums"
      style={{
        fontFamily: SANS,
        color: dark ? "rgba(255,255,255,0.8)" : L.ink,
        background: dark ? "rgba(255,255,255,0.1)" : L.cream,
        border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : L.bDefault}`,
      }}
    >
      {children}
    </span>
  );
}

function Cited({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <span style={{ borderBottom: `1px dotted ${dark ? "rgba(255,255,255,0.6)" : L.dottedStr}`, paddingBottom: 1 }}>
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

// ─── Landscape prototype frame — scales the 1440×900 editor to fit the slide ───
function ScaledProto({ src, title }: { src: string; title: string }) {
  const W = 1440, H = 900;
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const apply = () => { const w = el.clientWidth; if (w > 0) setScale(w / W); };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
      <div
        ref={boxRef}
        className="relative overflow-hidden"
        style={{
          aspectRatio: `${W} / ${H}`,
          height: "100%",
          maxWidth: "100%",
          borderRadius: 14,
          border: `1px solid ${L.bDefault}`,
          boxShadow: "0 24px 60px rgba(60,50,30,0.10), 0 6px 16px rgba(60,50,30,0.05)",
          background: L.card,
        }}
      >
        {scale > 0 && ready ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            className="absolute left-0 top-0 block bg-white"
            style={{ width: W, height: H, border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: L.subtle }}>原型加载中…</span>
          </div>
        )}
      </div>
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
  { k: "研究",   v: "6 场 60 分钟半结构化访谈(2 博后 / 2 博士 / 2 硕士)" },
  { k: "范围",   v: "生物、健康数据科学、蛋白设计、环境健康、HCDE" },
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
  { n: "02", title: "用户发现", body: "6 场 60 分钟半结构化访谈,跨学科 + 跨资历招募,每场含工作流走查,重建真实的协作时刻。" },
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
  { n: "01", t: "工具链碎片化,且代价高昂", imp: "Liner 不必替代每个工具,而是占住「迁移层」——在私密 AI 探索 → 团队共享产物之间保住上下文。" },
  { n: "02", t: "AI 帮你开始,而非收尾", imp: "为「AI 起草 → 人工核验」的交接而设计,把「我已审阅」变成对队友可见的显式信号。" },
  { n: "03", t: "社交摩擦是隐形瓶颈", imp: "问责要像「协调」而非「监视」——措辞和功能一样重要。" },
  { n: "04", t: "团队共享的是产出,不是过程", imp: "在架构上区分「私密 AI 工作区」与「共享团队上下文」;做错,比缺功能更快摧毁信任。" },
  { n: "05", t: "修订是状态管理问题", imp: "Liner 需要「审阅状态」概念:谁、在何时、核验了哪一部分。" },
] as const;

const PATTERNS = [
  { tag: "chat-switch", t: "对话切换", b: "在私密 AI 推理与共享团队视图之间无缝切换——prompt 留在私域,产物进入共享。" },
  { tag: "multi-user editor", t: "多人编辑器", b: "把审阅状态、署名与信任信号织进协作写作:谁审过哪一段,一眼可见。" },
  { tag: "shared library", t: "共享文献库", b: "团队级的来源与证据库,引用跨工具迁移不再断链。" },
] as const;

const REFLECTION = [
  { h: "把 AI 当研究加速器,而非捷径", b: "综合阶段用 AI 交叉比对访谈模式、生成相互竞争的解读、压力测试 framing——再由我做编辑判断,定夺什么是信号。" },
  { h: "先把模糊结构化,再去解它", b: "brief 很开放。我帮忙搭起研究架构(三段式、跨学科招募、先专家后用户),让结论有可被检验的地基。" },
  { h: "把研究翻译成产品语言", b: "上面每一条洞察都刻意落到一个设计启示。不连向决策的研究,只是墙纸。" },
  { h: "为系统设计,而非屏幕", b: "竞品分析、结构性缺口、隐私架构——它们不出现在某一个 UI 里,却是 UI 能立得住的原因。" },
] as const;

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
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
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
          <span className="text-[15px] font-medium tracking-tight text-white" style={{ fontFamily: SERIF }}>Liner</span>
          <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>
            AI Scholar
          </span>
        </motion.div>

        <div className="mt-9">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.1 }}>
            <Eye dark>UX 研究 × 产品设计 · 2025 – 2026</Eye>
          </motion.div>
          <Mask delay={0.24} className="mt-6">
            <h1
              className="font-light text-white"
              style={{ fontFamily: SERIF, fontSize: "clamp(2.1rem, 5.4vw, 4rem)", lineHeight: 1.06, letterSpacing: "-0.02em", textWrap: "balance" }}
            >
              让 AI 研究协作,<Hl dark>可被信任</Hl>。
            </h1>
          </Mask>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: E, delay: 0.5 }}
          className="mt-8 max-w-2xl text-[15px] font-light leading-[1.8]"
          style={{ color: "rgba(255,255,255,0.74)" }}
        >
          学术研究者没有「协作」问题。他们有的是「<span style={{ color: "#fff" }}>上下文传递</span>」问题。我主导研究综合,
          找出断点在哪、为什么,并把发现翻译成 Liner 下一轮的产品方向。
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-12 flex items-center gap-4"
        >
          <Dotted dark className="w-10" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>
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
                  style={{ borderRight: `1px solid ${L.bSubtle}`, borderTop: i ? `1px dotted ${L.dotted}` : undefined, color: L.muted }}
                >
                  {a}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: E, delay: 0.26 + i * 0.1 }}
                  className="px-6 py-5 text-[15px] font-medium leading-snug"
                  style={{ borderTop: i ? `1px dotted ${L.dotted}` : undefined, color: L.ink }}
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
          <Eye dark>问题重构</Eye>
        </motion.div>
        <Mask delay={0.2} className="mt-8">
          <p
            className="font-light text-white"
            style={{ fontFamily: SERIF, fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.24, letterSpacing: "-0.015em", textWrap: "balance" }}
          >
            学术研究者没有「协作」问题。
          </p>
        </Mask>
        <Mask delay={0.4} className="mt-1">
          <p
            className="font-light"
            style={{ fontFamily: SERIF, color: "rgba(255,255,255,0.92)", fontSize: "clamp(1.7rem, 4.2vw, 3.1rem)", lineHeight: 1.24, letterSpacing: "-0.015em", textWrap: "balance" }}
          >
            他们有的,是「<Hl dark>上下文传递</Hl>」问题。
          </p>
        </Mask>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-10 flex items-center gap-4"
        >
          <Dotted dark className="w-10" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>
            六场访谈综合后,锁定的真问题
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
              <Dotted className="mt-4 w-full" />
              <p className="mt-4 text-[13.5px] font-light leading-[1.7]" style={{ color: L.body }}>{p.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.55 }}
          className="mt-8 max-w-3xl text-[14px] font-light leading-[1.75]" style={{ color: L.muted }}
        >
          我坚持的一点:<Hl>刻意跨学科 + 跨资历招募</Hl>。博士与导师之间的动态,和两个博后合著时的动态,不是一回事——
          只聊一类人,就只会为一类人设计。
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
              style={{ borderTop: `1px dotted ${L.dotted}` }}
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
                <div key={stage} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i ? `1px dotted ${L.dotted}` : undefined }}>
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
        <Eye>综合 · 六场访谈 → 五条洞察</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.5rem, 3.2vw, 2.3rem)", letterSpacing: "-0.018em", textWrap: "balance" }}>
            五条洞察,每条都落到一个产品启示。
          </h2>
        </Mask>

        <div className="mt-8 space-y-0">
          {INSIGHTS.map((ins, i) => (
            <motion.div
              key={ins.n}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: E, delay: 0.16 + i * 0.07 }}
              className="grid grid-cols-[2rem_1fr] items-start gap-x-4 gap-y-1 py-3.5 md:grid-cols-[2.2rem_0.9fr_1.2fr]"
              style={{ borderTop: `1px dotted ${L.dotted}` }}
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

// §09 Spotlight — insight 04 (dark)
function SlideSpotlight() {
  return (
    <Shell bg={L.dark}>
      <div className="mx-auto w-full max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>洞察 04 · 隐私边界</Eye>
        </motion.div>

        <Mask delay={0.2} className="mt-8">
          <blockquote
            className="font-light text-white"
            style={{ fontFamily: SERIF, fontSize: "clamp(1.25rem, 2.9vw, 2.05rem)", lineHeight: 1.42, letterSpacing: "-0.01em", textWrap: "balance" }}
          >
            「AI 的 prompt 很有用,但我不想把 <Hl dark>prompt / 日志</Hl> 透明地共享给队友。
            我要的是文件、信息、活动历史<span style={{ color: "#fff" }}>完全透明</span>。这两者,必须被清楚地分开。」
          </blockquote>
        </Mask>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: E, delay: 0.6 }}
          className="mt-5 text-[12px] font-medium uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.5)" }}
        >
          — P4 · P5 · P6
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: E, delay: 0.75 }}
          className="mt-9 rounded-xl px-6 py-5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-[14.5px] font-light leading-[1.75]" style={{ color: "rgba(255,255,255,0.86)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: L.lime }}>设计启示 ·&nbsp;</span>
            这不是一个「设置开关」问题,而是一条<span style={{ color: "#fff", fontWeight: 500 }}>架构分界线</span>——把私密 AI 工作区与共享团队上下文从底层分开。做错,比缺任何功能都更快摧毁信任。
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
            这五条洞察不只描述痛点,它们指向一个连贯的设计空间。Liner 的机会,不是再做一个协作编辑器,
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
function SlidePatterns() {
  return (
    <Shell bg={L.canvas}>
      <div className="mx-auto w-full max-w-5xl">
        <Eye>产品方向 · 三种交互模式</Eye>
        <Mask delay={0.08} className="mt-5">
          <h2 className="font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.55rem, 3.3vw, 2.4rem)", letterSpacing: "-0.018em" }}>
            把「连接组织」落成可触摸的交互。
          </h2>
        </Mask>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PATTERNS.map((p, i) => (
            <motion.div
              key={p.tag}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: E, delay: 0.18 + i * 0.1 }}
              className="relative rounded-xl px-6 py-7"
              style={{ background: L.card, border: `1px solid ${L.bSubtle}` }}
            >
              <span
                aria-hidden
                className="absolute left-6 right-6 top-0 block"
                style={{ height: 2, backgroundImage: `linear-gradient(to right, ${L.dotted} 50%, transparent 50%)`, backgroundSize: "4px 2px", backgroundRepeat: "repeat-x" }}
              />
              <span className="font-light tabular-nums" style={{ fontFamily: SERIF, color: L.limeDeep, fontSize: "1.4rem" }}>0{i + 1}</span>
              <p className="mt-3 text-[16px] font-semibold" style={{ color: L.ink }}>{p.t}</p>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: L.subtle }}>{p.tag}</p>
              <p className="mt-4 text-[13px] font-light leading-[1.7]" style={{ color: L.body }}>{p.b}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// §12 Live prototype
function SlidePrototype() {
  return (
    <Shell bg={L.page} className="!justify-start">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col pb-3 pt-8 md:pt-10">
        <div className="flex shrink-0 items-end justify-between">
          <div>
            <Eye>可交互原型</Eye>
            <h2 className="mt-3 font-light" style={{ fontFamily: SERIF, color: L.ink, fontSize: "clamp(1.3rem, 2.8vw, 2rem)", letterSpacing: "-0.018em" }}>
              上手试试这个编辑器。
            </h2>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] md:inline" style={{ color: L.subtle }}>
            Claude Code + Figma MCP
          </span>
        </div>
        <div className="mt-5 flex min-h-0 flex-1">
          <ScaledProto src="/assets/liner/liner-ai-yuan.html" title="Liner AI — 可交互编辑器原型" />
        </div>
      </div>
    </Shell>
  );
}

// §13 Product video
function SlideVideo() {
  const ready = useAfterEnter(360);
  return (
    <Shell bg={L.dark} className="!justify-start">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col pb-3 pt-8 md:pt-10">
        <div className="flex shrink-0 items-end justify-between">
          <div>
            <Eye dark>产品视频</Eye>
            <h2 className="mt-3 font-light text-white" style={{ fontFamily: SERIF, fontSize: "clamp(1.3rem, 2.8vw, 2rem)", letterSpacing: "-0.018em" }}>
              端到端体验。
            </h2>
          </div>
        </div>
        <div className="mt-5 flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative flex h-full items-center justify-center overflow-hidden rounded-xl"
            style={{ aspectRatio: "16 / 9", maxWidth: "100%", maxHeight: "100%", border: "1px solid rgba(255,255,255,0.12)", background: "#000" }}
          >
            {ready ? (
              <AutoplayVideo src="/assets/liner/liner-product-video.mp4" />
            ) : (
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>视频加载中…</span>
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
          <h2 className="font-light text-white" style={{ fontFamily: SERIF, fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "-0.02em" }}>
            研究综合,建在真实规模之上。
          </h2>
        </Mask>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E, delay: 0.4 + i * 0.14 }}
              className={`px-2 py-3 md:px-8 ${i > 0 ? "md:border-l" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.14)" }}
            >
              <p className="font-light leading-none" style={{ fontFamily: SERIF, fontSize: "clamp(2.4rem, 5vw, 3.9rem)", color: s.key ? L.lime : "#fff" }}>
                <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} startDelay={300 + i * 140} duration={1200} />
              </p>
              <p className="mt-3 text-[13px] font-medium text-white">{s.label}</p>
              <p className="mt-1.5 text-[11.5px] font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{s.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: E, delay: 0.9 }}
          className="mt-9 max-w-2xl text-[13px] font-light leading-[1.78]" style={{ color: "rgba(255,255,255,0.7)" }}
        >
          研究综合已完成,团队正与 Liner 产品团队推进设计标准(design criteria)与探索性概念。
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
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: E }}>
          <Eye dark>设计结论</Eye>
        </motion.div>
        <Mask delay={0.2} className="mt-7">
          <p
            className="font-light text-white"
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
          <Link
            href="/work/liner-scholar"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            研究全文
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: E, delay: 0.8 }}
          className="mt-11 text-[11px] font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}
        >
          North4 Studio — Monica Zhang · Jenn Koh · Jen Zhang · Yuan Fang
          <br />
          UW HCDE Capstone · Liner AI
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
    case "insights":   return <SlideInsights />;
    case "spotlight":  return <SlideSpotlight />;
    case "direction":  return <SlideDirection />;
    case "patterns":   return <SlidePatterns />;
    case "prototype":  return <SlidePrototype />;
    case "video":      return <SlideVideo />;
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
        style={{ background: dark ? "rgba(255,255,255,0.18)" : "rgba(60,50,30,0.12)" }}>
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
              : { background: dark ? "rgba(255,255,255,0.38)" : "rgba(60,50,30,0.2)" }}
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

  const chromeBg     = dark ? "rgba(23,21,15,0.94)" : "rgba(250,250,247,0.8)";
  const chromeBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(60,50,30,0.08)";
  const navStrong    = dark ? "rgba(255,255,255,0.92)" : L.body;
  const navMeta      = dark ? "rgba(255,255,255,0.55)" : L.subtle;

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
