"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Uber Base · light tokens (mirror the live prototype's MT palette) ─────────
//   Black primary, mono neutral ramp, Base blue as the single restrained accent.
//   No lime, no warm surfaces — the deck and the embedded prototype share a system.
const U = {
  ink:        "#000000", // contentPrimary
  inkSoft:    "#141414",
  inkLight:   "#545454", // contentSecondary
  muted:      "#757575", // contentTertiary (mono700)
  mutedSoft:  "#AFAFAF", // mono600
  hairline:   "#E2E2E2", // borderOpaque (mono400)
  divider:    "#EBEBEB",
  bg:         "#F6F6F6", // mono200 — light canvas
  surface:    "#FFFFFF", // mono100
  surfaceDeep:"#EEEEEE", // mono300
  dark:       "#000000", // Uber black — dark slides
  accent:     "#FFD100", // Meituan yellow — the single accent
  accentInk:  "#3D2E00", // text/icon sitting ON the yellow accent
};

const FONT =
  "var(--font-manrope), -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

// ─── Easings & variants ───────────────────────────────────────────────────────
const E    = [0.22, 1, 0.36, 1] as const;
const EMSK = [0.76, 0, 0.24, 1] as const;

const STG  = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
const UP   = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.82, ease: E } } };
const FADE = { hidden: { opacity: 0 },        show: { opacity: 1,       transition: { duration: 0.55, ease: E } } };

// ─── Slide registry — follows the case study narrative ────────────────────────
//   Opening → Context → System → The Flow (one workflow per slide, deep-linked
//   into the live prototype) → Extensions → Impact → Reflection → Closing
const SLIDES = [
  { id: "cover",               chapter: "开篇",     dark: true  },
  { id: "context",             chapter: "开篇",     dark: false },
  { id: "overview",            chapter: "开篇",     dark: false },
  { id: "signal",              chapter: "背景",     dark: true  },
  { id: "first-try",           chapter: "背景",     dark: false },
  { id: "before-after",        chapter: "背景",     dark: false },
  { id: "flow-standard",       chapter: "流程",    dark: false },
  { id: "txn-flow",            chapter: "流程",    dark: false },
  { id: "flow-selfserve",      chapter: "流程",    dark: false },
  { id: "flow-offhours",       chapter: "流程",    dark: false },
  { id: "flow-expired-before", chapter: "流程",    dark: false },
  { id: "flow-expired-after",  chapter: "流程",    dark: false },
  { id: "flow-return",         chapter: "流程",    dark: false },
  { id: "merchant",            chapter: "流程",    dark: false },
  { id: "prototype-full",      chapter: "流程",    dark: false },
  { id: "entry-states",        chapter: "流程",    dark: false },
  { id: "extensions",          chapter: "延展",  dark: false },
  { id: "impact",              chapter: "成效",      dark: true  },
  { id: "reflection",          chapter: "复盘",  dark: false },
  { id: "closing",             chapter: "结语",     dark: false },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Mask reveal ──────────────────────────────────────────────────────────────
function Mask({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div initial={{ y: "106%" }} animate={{ y: "0%" }} transition={{ duration: 0.88, ease: EMSK, delay }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({
  to, suffix = "", prefix = "", startDelay = 220, duration = 1100, format,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number; format?: (n: number) => string }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    // Reduced motion (and SSR/headless edge cases): show the final value outright
    // so the metric never reads as a stuck "0".
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
    // Safety net: some browsers throttle requestAnimationFrame (reduced-motion
    // settings, background throttling, iframes) so the rAF tick may never fire and
    // the number would sit at 0. This timeout guarantees it lands on the final value.
    const guard = window.setTimeout(finish, startDelay + duration + 400);
    return () => { clearTimeout(tid); clearTimeout(guard); cancelAnimationFrame(frame); };
  }, [to, startDelay, duration, reduced]);
  return <>{prefix}{format ? format(n) : Math.round(n)}{suffix}</>;
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
function Eye({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.24em]"
      style={{ color: dark ? "rgba(255,255,255,0.6)" : U.muted }}>
      {children}
    </p>
  );
}

// ─── Yellow highlighter mark — reads on light or dark slides alike ────────────
function Mark({ children }: { children: ReactNode }) {
  return (
    <span style={{
      background: U.accent, color: U.accentInk,
      padding: "0.02em 0.2em", borderRadius: 3,
      boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone",
    }}>
      {children}
    </span>
  );
}

// Defer heavy iframe (1.27MB bundle that boots a React app) mounting until the
// slide-enter transition has settled, so the animation runs on a light
// placeholder instead of janking while the bundle compiles. Returns false during
// the transition window, then true.
function useAfterEnter(delay = 480) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

// ─── Live phone — deep-links the LATEST bundled prototype into ONE flow ────────
//   `Repair Flow.html#flow=<scenario>&rail=0` boots the Uber Base build straight
//   into a single scenario with its switcher rail hidden, so each slide shows
//   exactly the workflow it's narrating. The bundle hints a 480×1000 canvas.
//   Only the active slide is mounted, so one heavy iframe is alive at a time.
function DeckPhone({ flow, caption, seek = true }: { flow: string; caption?: string; seek?: boolean }) {
  const PW = 480, PH = 1000;
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / PW, h / PH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <figure className="flex h-full min-h-0 flex-col">
      <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden">
        {scale > 0 && ready ? (
          <iframe
            src={`/assets/meituan-im/Repair%20Flow.html#flow=${flow}&rail=0&seek=${seek ? 1 : 0}`}
            title={`${flow} flow — live prototype`}
            loading="lazy"
            style={{
              position: "absolute", left: "50%", top: "50%", width: PW, height: PH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>原型加载中…</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 flex shrink-0 items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em]"
          style={{ color: U.muted }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: U.accent }} />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 Cover
function SlideCover() {
  const meta = [
    { k: "公司",  v: "美团 · 本地生活" },
    { k: "角色",     v: "唯一设计师 · 搭档 2 名 PM + 2 名工程师" },
    { k: "周期", v: "4 周 · 2025" },
    { k: "成果",  v: "诊断渠道转化 +30% · 整体净增 +0.5pp(实测)" },
  ];
  return (
    <section className="relative flex h-full min-h-0 items-stretch overflow-hidden" style={{ background: U.dark }}>
      {/* subtle, flat top wash — no colored glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)" }} aria-hidden />
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-5xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE}><Eye dark>美团 · 本地生活 · IM 咨询 · 2025</Eye></motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["账单之前,", "先建信任。"].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className="font-extralight leading-[1.02] tracking-[-0.04em] text-white"
                    style={{ fontSize: "clamp(2.35rem, 5.2vw + 0.5rem, 4.75rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className="mt-5 max-w-xl text-[14px] font-light leading-[1.65] md:mt-6 md:text-[15px]"
              style={{ color: "rgba(255,255,255,0.72)" }}>
              一套从 0 到 1 的 IM 内报价系统,覆盖美团 7.7 亿年度用户与 1450 万商家——把不确定的本地服务定价,变成一个有引导、可对比、可下单的决策。
            </motion.p>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
            <motion.dl variants={UP}
              className="mt-6 grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
              style={{ borderColor: "rgba(255,255,255,0.14)" }}>
              {meta.map(({ k, v }) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>{k}</dt>
                  <dd className="mt-1 text-[12px] font-light leading-snug text-white sm:text-[13px]">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// §01 Overview
function SlideOverview() {
  const pillars = [
    { stat: "+30%", label: "渠道转化",   detail: "诊断渠道意向→交易,约为原路径 1.3×;整体净增 +0.5pp" },
    { stat: "~2k",  label: "每日新增订单", detail: "按推广覆盖推算的增量(预测)" },
    { stat: "−50%", label: "价格纠纷",   detail: "该流程内售后投诉的预计下降" },
  ];
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE} className="flex items-center gap-4">
          <img src="/assets/meituan-im/meituan-logo.png" alt="Meituan"
            className="h-6 w-auto max-w-[9rem] object-contain object-left opacity-90" decoding="async" />
          <span className="h-3.5 w-px" style={{ background: U.hairline }} />
          <Eye>概览 · IM 咨询</Eye>
        </motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className="font-light leading-[1.08] tracking-[-0.032em]" style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.8rem)", color: U.ink }}>
            把不确定的价格,变成有引导、可下单的决策。
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-5 max-w-2xl text-[13.5px] font-light leading-[1.72]" style={{ color: U.inkLight }}>
          范围说明:本次试点先<Mark>只聚焦马桶维修与管道疏通</Mark>两个高频维修品类——把信任闭环在这里跑通,再向更多本地服务延展。
        </motion.p>
        {/* Three results, de-tabled: simple stat blocks split by hairlines */}
        <motion.div variants={UP} className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div key={p.label} className={`sm:pl-8 ${i > 0 ? "sm:border-l" : ""}`}
              style={{ borderColor: U.divider }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-light tracking-[-0.02em]" style={{ fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)", color: U.ink }}>{p.stat}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.inkLight }}>{p.label}</p>
              <p className="mt-1.5 text-[12.5px] font-light leading-relaxed" style={{ color: U.muted }}>{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={UP} className="mt-9 border-l-2 pl-4" style={{ borderColor: U.ink }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.muted }}>设计原则</p>
          <p className="mt-1.5 text-[14px] font-light leading-relaxed" style={{ color: U.inkSoft }}>
            透明的<em className="font-medium not-italic" style={{ color: U.ink }}>过程</em>胜过透明的价格——我让信任在每一步累积。
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §01b What is this surface — context for a cold reader
function SlideContext() {
  const analogy = [
    { icon: "/assets/meituan-im/logos/uber-icon.png",       name: "Uber",       v: "即时上门" },
    { icon: "/assets/meituan-im/logos/yelp-icon.png",       name: "Yelp",       v: "发现并对比商家" },
    { icon: "/assets/meituan-im/logos/taskrabbit-icon.png", name: "TaskRabbit", v: "真人上门服务" },
  ];
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>背景 · 产品</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className="mt-5 max-w-3xl font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)", color: U.ink }}>
            美团本地生活是一个超级 App 市场——而交易在对话里完成。
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {analogy.map((a, i) => (
            <div key={a.name} className={`sm:pl-7 ${i > 0 ? "sm:border-l" : ""}`} style={{ borderColor: U.divider }}>
              <div className="flex items-center gap-2.5">
                <img src={a.icon} alt={`${a.name} logo`} className="h-[22px] w-[22px] shrink-0 rounded-[5px] object-contain"
                  loading="lazy" decoding="async" />
                <p className="text-[15px] font-medium tracking-tight" style={{ color: U.ink }}>{a.name}</p>
              </div>
              <p className="mt-2 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>{a.v}</p>
            </div>
          ))}
        </motion.div>
        <motion.p variants={UP} className="mt-8 max-w-2xl text-[15px] font-light leading-[1.76]" style={{ color: U.inkLight }}>
          它的核心交互是 <span style={{ color: U.ink }}>IM — 站内消息</span>。我的项目把整段旅程——诊断、对比、下单、付款、评价——都放进一段对话里完成。
        </motion.p>
      </motion.div>
    </section>
  );
}

// §02 Context · the signal — told as a story, not a table
function SlideSignal() {
  return (
    <section className="relative flex h-full items-center overflow-hidden px-12 md:px-20" style={{ background: U.dark }}>
      <motion.div className="relative z-10 w-full max-w-4xl" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye dark>背景 · 信号</Eye></motion.div>
        <Mask delay={0.12} className="mt-7">
          <p className="font-extralight leading-[1.32] tracking-[-0.02em] text-white" style={{ fontSize: "clamp(1.45rem, 3vw, 2.35rem)" }}>
            &ldquo;我私信了 10 家店,真正聊了 6 家,花了 30 分钟对比——还是不知道到底要花多少钱。每个报价都像是上门后还会变的。&rdquo;
          </p>
        </Mask>
        <motion.p variants={UP} className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.5)" }}>
          来自用户研究——也来自我自己的经历
        </motion.p>
        <motion.p variants={UP} className="mt-8 font-light leading-[1.4] tracking-[-0.018em] text-white" style={{ fontSize: "clamp(1.1rem,2vw,1.5rem)" }}>
          价格不是数字问题,而是<Mark>过程信任</Mark>问题。
        </motion.p>
      </motion.div>
    </section>
  );
}

// §02b The first attempt that failed — the turn
function SlideFirstTry() {
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-4xl">
        <motion.div variants={FADE}><Eye>背景 · 第一次尝试</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            我们先做了最显而易见的方案——结果毫无变化。
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.muted }}>v1 · 独立报价页</p>
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>— 无可测提升</span>
          </div>
          <p className="mt-3 text-[15px] font-light leading-[1.75]" style={{ color: U.inkLight }}>
            在独立页面上把价格直接摆出来。转化纹丝不动——因为这个报价往往不是最终价,用户不信,商家也不维护。是装饰,不是信任。
          </p>
        </motion.div>
        <motion.p variants={UP} className="mt-7 font-light leading-[1.4] tracking-[-0.02em]" style={{ fontSize: "clamp(1.15rem, 2.1vw, 1.6rem)", color: U.ink }}>
          那次失败本身就是洞察:信任无法在页面上<span style={{ color: U.muted }}>声明</span>——只能在对话里<Mark>建立</Mark>。
        </motion.p>
      </motion.div>
    </section>
  );
}

// §03 Before → After
function SlideBeforeAfter() {
  const before = ["问题发生", "涌现大量商家", "逐家私信咨询", "挑一家上门"];
  const after  = ["诊断问题", "结构化需求", "对比并下单"];
  return (
    <section className="flex h-full items-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>重构 · 线性旅程 → 信任闭环</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light leading-[1.1] tracking-[-0.03em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            从破坏信任的 4 步旅程,到建立信任的 3 步闭环。
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-9 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* BEFORE — muted */}
          <div className="flex flex-col rounded-2xl px-6 py-6 md:px-7 md:py-7"
            style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.muted }}>之前 · 线性</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>破坏信任</p>
            </div>
            <ol className="flex-1">
              {before.map((t, i) => (
                <li key={i} className={`flex items-baseline gap-3 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: U.divider }}>
                  <span className="text-[10px] tabular-nums" style={{ color: U.mutedSoft }}>0{i + 1}</span>
                  <p className="text-[14.5px] font-light tracking-tight" style={{ color: U.inkLight }}>{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t pt-4" style={{ borderColor: U.divider }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: U.muted }}>→ 信任断裂</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>报价 ≠ 实际账单。</p>
            </div>
          </div>
          {/* AFTER — black-accented */}
          <div className="flex flex-col rounded-2xl px-6 py-6 md:px-7 md:py-7"
            style={{ background: U.surface, border: `1.5px solid ${U.ink}` }}>
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: U.ink }}>之后 · 信任闭环</p>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>建立信任</p>
            </div>
            <ol className="flex-1">
              {after.map((t, i) => (
                <li key={i} className={`flex items-baseline gap-3 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: U.divider }}>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: U.ink }}>0{i + 1}</span>
                  <p className="text-[14.5px] tracking-tight" style={{ color: U.ink }}>{t}</p>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t pt-4" style={{ borderColor: U.divider }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: U.ink }}>→ 信任重建</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>每一步都为下一步赢得信任。</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §04 交易蓝图 —— 平台 / 用户 / 商家三方的完整询价报价交易链路。
//   自包含的 Uber Base 流程图(自带标题与图例),在同色浅灰底上全幅展示,
//   横版泳道居中、上下留白与底色无缝衔接。
function SlideTxnFlow() {
  return (
    <section className="relative h-full min-h-0 overflow-hidden" style={{ background: U.bg }}>
      <iframe
        src="/assets/meituan-im/quote-to-service-flow-zh.html"
        title="询价报价 · 上门服务交易流程"
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
      />
    </section>
  );
}

// §05 Entry states
function SlideEntryStates() {
  const shots = [
    { src: "/assets/meituan-im/screen-04-entry-generic.jpg",  label: "通用入口",  note: "开放式『哪里出问题了?』——模型开始诊断。" },
    { src: "/assets/meituan-im/screen-05-entry-specific.jpg", label: "指定入口", note: "从具体服务深链进入——上下文预填,问得更少。" },
    { src: "/assets/meituan-im/screen-03-offhours-state.jpg", label: "非营业时间入口", note: "非营业状态先设定预期,并让对话保持温度。" },
  ];
  return (
    <section className="flex h-full flex-col justify-center px-10 pb-6 pt-7 md:px-14" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>IM 体验</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 font-light tracking-[-0.026em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
            三种进入状态,一套交互模型。
          </h2>
        </Mask>
      </motion.div>
      <div className="mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-3 md:gap-4" style={{ maxHeight: "62vh" }}>
        {shots.map((s, i) => (
          <motion.article key={s.label} className="flex min-h-0 flex-col overflow-hidden rounded-2xl"
            style={{ background: U.surface, border: `1px solid ${U.hairline}` }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: U.surfaceDeep }}>
              <img src={s.src} alt={s.label} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
            </div>
            <div className="shrink-0 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: U.ink }}>{s.label}</p>
              <p className="mt-2 text-[12px] font-light leading-relaxed" style={{ color: U.muted }}>{s.note}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── Flow slide template: copy left, live deep-linked phone right ──────────────
function FlowSlide({
  eye, title, points, flow, caption, seek,
}: {
  eye: string; title: string;
  points?: { k: string; v: string }[];
  flow: string; caption: string; seek?: boolean;
}) {
  return (
    <section className="flex h-full items-center px-10 md:px-14" style={{ background: U.surface }}>
      <div className="mx-auto grid w-full max-w-[80rem] items-center gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className="mt-5 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
              {title}
            </h2>
          </Mask>
          {points && (
            <motion.div variants={UP} className="mt-6 space-y-3.5">
              {points.map((p, i) => (
                <div key={p.k} className="border-l-2 pl-3" style={{ borderColor: i === 0 ? U.ink : U.hairline }}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: U.ink }}>{p.k}</p>
                  <p className="mt-1 text-[13px] font-light" style={{ color: U.inkLight }}>{p.v}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
        <motion.div className="h-[min(74vh,42rem)] min-w-0"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E, delay: 0.22 }}>
          <DeckPhone flow={flow} caption={caption} seek={seek} />
        </motion.div>
      </div>
    </section>
  );
}

function SlideFlowStandard() {
  return (
    <FlowSlide
      eye="维修流程 · 标准 · 预约师傅"
      title="对话变成一份契约。"
      points={[
        { k: "诊断", v: "模糊问题 → 结构化需求,先于任何价格。" },
        { k: "先给进度,再给价格", v: "实时竞价让等待变得可读。" },
      ]}
      flow="default"
      seek={false}
      caption="实时 · 默认流程"
    />
  );
}
function SlideFlowSelfserve() {
  return (
    <FlowSlide
      eye="维修流程 · 自助解决"
      title="不是每个问题都需要师傅。"
      points={[
        { k: "判断", v: "诊断也可以得出『你不需要我们』。" },
        { k: "信任红利", v: "诚实的『劝退』正是用户回头的原因。" },
      ]}
      flow="cat-litter"
      seek={false}
      caption="实时 · 自助流程"
    />
  );
}
function SlideFlowOffhours() {
  return (
    <FlowSlide
      eye="维修流程 · 非营业时间"
      title="打烊之后,依然有回应。"
      points={[
        { k: "设定预期", v: "告诉用户真实报价何时到达。" },
        { k: "连续性", v: "师傅上线后,对话原地续上。" },
      ]}
      flow="off-hours"
      caption="实时 · 非营业时间流程"
    />
  );
}
function SlideFlowExpiredBefore() {
  return (
    <FlowSlide
      eye="维修流程 · 报价过期 · 操作前"
      title="硬过期,在你操作之前。"
      points={[
        { k: "安全优先", v: "绝不让过期价格进入账单。" },
        { k: "恢复,而非重来", v: "重新报价,诊断保持不变。" },
      ]}
      flow="expired-modal"
      caption="实时 · 过期(操作前)"
    />
  );
}
function SlideFlowExpiredAfter() {
  return (
    <FlowSlide
      eye="维修流程 · 报价过期 · 操作后"
      title="软延续,只重置时间档。"
      points={[
        { k: "硬过期,软延续", v: "对话仍在,只需重新确认时间档。" },
        { k: "可读性", v: "置灰可见,胜过直接消失。" },
      ]}
      flow="expired-chat"
      caption="实时 · 过期(操作后)"
    />
  );
}
function SlideFlowReturn() {
  return (
    <FlowSlide
      eye="维修流程 · 售后跟进"
      title="信任闭环,回到起点收束。"
      points={[
        { k: "同一对话", v: "跟进不是又一次冷启动。" },
        { k: "一键复购", v: "复购自动回流给信任的师傅。" },
      ]}
      flow="return-visit"
      caption="实时 · 回访流程"
    />
  );
}

// Full prototype, embedded DIRECTLY (not via the /prototype Next route). Loading
// that route in an iframe re-booted the entire site shell and then nested the
// 1.27MB bundle inside it — a triple load that could crash / reload on mobile,
// which remounts the deck back to slide 0. Here we scale the bundle's native
// 1200×1080 canvas (phone + scenario rail) to fit the card, centered — same
// interactive prototype, a fraction of the weight.
function FullPrototypeEmbed() {
  const NW = 1200, NH = 1080;
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / NW, h / NH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative min-h-0 w-full flex-1 overflow-hidden" style={{ background: U.surface }}>
      {scale > 0 && ready ? (
        <iframe
          src="/assets/meituan-im/Repair%20Flow.html"
          title="Repair flow — full interactive prototype"
          loading="lazy"
          style={{
            position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
            transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>原型加载中…</span>
        </div>
      )}
    </div>
  );
}

// §11b Merchant side — the landscape "Quote Desk" console, scaled to fit
function MerchantConsoleEmbed() {
  const NW = 1110, NH = 820; // the 1062×758 console + the bundle's centering padding
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const ready = useAfterEnter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && h > 0) setScale(Math.min(w / NW, h / NH));
    };
    apply();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative min-h-0 w-full flex-1 basis-0 overflow-hidden" style={{ background: U.surface }}>
      {scale > 0 && ready ? (
        <iframe
          src="/assets/meituan-im/Repair%20Flow.html#flow=merchant&rail=0"
          title="Merchant quote desk — live prototype"
          loading="lazy"
          style={{
            position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
            transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: U.mutedSoft }}>商家视图加载中…</span>
        </div>
      )}
    </div>
  );
}

function SlideMerchant() {
  return (
    <section className="flex h-full min-h-0 flex-col px-10 pb-4 pt-7 md:px-14" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="shrink-0">
        <motion.div variants={FADE}><Eye>另一侧 · 商家</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-3 max-w-4xl font-light tracking-[-0.026em]" style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: U.ink }}>
            商家针对同一份工单报价——在同一起跑线上。
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-3 max-w-3xl text-[13.5px] font-light leading-[1.7]" style={{ color: U.inkLight }}>
          每个商家拿到同一份结构化工单,只提交一个报价——一口价,或一个严格受限的区间。他们看不到彼此的数字,所以比的是对工单的理解,而不是互相压价。
        </motion.p>
      </motion.div>
      <motion.div variants={FADE} initial="hidden" animate="show" className="mt-4 flex min-h-0 flex-1 basis-0 flex-col">
        <MerchantConsoleEmbed />
      </motion.div>
    </section>
  );
}

// §12 Full interactive prototype
function SlidePrototypeFull() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: U.surface }}>
      <div className="flex shrink-0 items-center justify-between gap-4 border-b px-6 py-2.5 md:px-10 md:py-3" style={{ borderColor: U.divider }}>
        <Eye>可交互原型 · 可切换任意场景</Eye>
        <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
          className="text-[10px] font-medium uppercase tracking-[0.18em] transition-colors"
          style={{ color: U.muted }}>
          打开整页 ↗
        </a>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2 md:p-3" style={{ background: U.bg }}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg" style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
          <FullPrototypeEmbed />
        </div>
      </div>
      <div className="shrink-0 border-t px-6 py-2 md:px-10" style={{ borderColor: U.divider }}>
        <p className="text-[10px] font-light leading-relaxed md:text-[11px]" style={{ color: U.inkLight }}>
          用手机下方的切换栏切换场景,或点击建议回复把一条流程走完。
          <span style={{ color: U.muted }}> 此处展示的是英文 / 美元的重制版原型——线上产品为中文 / 人民币。</span>
        </p>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: U.mutedSoft }}>点击内部可交互 · 点击原型外可恢复键盘翻页</p>
      </div>
    </section>
  );
}

// §13 Framework extensions — cards, not a matrix
function SlideExtensions() {
  const rows = [
    { domain: "教育",      tag: "家长 · 顾问 · 方案",      d: "目标、年级、预算。",          s: "约束 → 学习需求单。",     c: "方案对比。" },
    { domain: "宴会",        tag: "活动 · 场地 · 锁价",         d: "人数、日期、菜单、硬性要求。",  s: "不可妥协项 → 需求卡片。", c: "场地在同一标准下报价。" },
    { domain: "月子护理", tag: "家庭 · 护理员 · 连续性", d: "需求与风险;先看资质。", s: "护理范围 → 服务需求单。",     c: "在信任语境下打包。" },
  ];
  const steps = ["01 · 诊断", "02 · 结构化", "03 · 下单"] as const;
  return (
    <section className="flex h-full flex-col justify-center px-10 md:px-14" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>框架延展</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-4 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)", color: U.ink }}>
            同一套闭环可以复用:教育、宴会、月子护理。
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-4 max-w-2xl text-[13.5px] font-light leading-[1.7]" style={{ color: U.inkLight }}>
          诊断 → 结构化 → 下单 与领域无关——同样的三步可迁移到任何高决策成本的本地服务。
        </motion.p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {rows.map((row, i) => (
            <motion.div key={row.domain} className="flex flex-col rounded-2xl px-5 py-5"
              style={{ background: U.bg, border: `1px solid ${U.hairline}` }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="text-[15px] font-medium tracking-tight" style={{ color: U.ink }}>{row.domain}</p>
              <p className="mt-0.5 text-[11px] font-light leading-snug" style={{ color: U.muted }}>{row.tag}</p>
              <div className="mt-4 space-y-3">
                {[row.d, row.s, row.c].map((v, j) => (
                  <div key={j} className="border-l-2 pl-3" style={{ borderColor: j === 0 ? U.ink : U.hairline }}>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: U.muted }}>{steps[j]}</p>
                    <p className="mt-0.5 text-[12.5px] font-light leading-relaxed" style={{ color: U.inkLight }}>{v}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// §14 Impact
function SlideImpact() {
  const stats = [
    { to: 30,   suffix: "%", prefix: "+", label: "渠道转化",   tag: "实测",  detail: "诊断渠道意向→交易,约为原路径 1.3×;整体净增 +0.5pp", key: true },
    { to: 2000, suffix: "",  prefix: "~", label: "每日新增订单", tag: "预测", detail: "按更大范围推广建模的增量", fmt: (n: number) => Math.round(n / 1000) + "k" },
    { to: 50,   suffix: "%", prefix: "−", label: "价格纠纷",   tag: "预测",  detail: "该流程内售后投诉的预计下降" },
  ];
  const T_TITLE = 0.0, T_SUB = 0.3, T_STATS = 0.7, T_OUTRO = 1.3;
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20" style={{ background: U.dark }}>
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye dark>成效与验证 · 用户级随机 A/B</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className="mt-4 font-light tracking-[-0.03em] text-white" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.7rem)" }}>
            信任优先,赢下了 A/B。
          </h2>
        </Mask>
        <div className="mt-9 grid grid-cols-1 md:grid-cols-3">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.14;
            return (
              <motion.div key={s.label} className={`px-2 py-4 md:px-7 ${i > 0 ? "md:border-l" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.14)" }}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <p className="font-light leading-none" style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", color: s.key ? U.accent : "#FFFFFF" }}>
                  <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} format={s.fmt} startDelay={260 + i * 140} duration={1200} />
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <p className="text-[12px] font-medium text-white">{s.label}</p>
                  <span className="rounded-full px-1.5 py-[1px] text-[8.5px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.22)" }}>{s.tag}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: E, delay: T_OUTRO }}
          className="mt-7 max-w-2xl text-[13px] font-light leading-[1.76]" style={{ color: "rgba(255,255,255,0.7)" }}>
          它是搜索时触发的浮窗,试点上线于杭州及浙江部分城市。转化是 6–8 月的真实 A/B;订单量与纠纷数据则是据此向更大范围外推的预测。
        </motion.p>
      </div>
    </section>
  );
}

// §15 Reflection
function SlideReflection() {
  const fronts = [
    { n: "01", t: "商家侧太薄——除了报价,还需要哪些动作和激励,让报价又快又诚实?" },
    { n: "02", t: "用 AI 替代人类专家这个瓶颈——专家供给正是当下限制开城的关键。" },
    { n: "03", t: "当诊断出错时,把成本归属讲清楚——让信任在不顺利的路径上也成立。" },
  ];
  return (
    <section className="flex h-full flex-col justify-center px-12 md:px-20" style={{ background: U.bg }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-5xl">
        <motion.div variants={FADE}><Eye>复盘</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className="mt-5 font-light tracking-[-0.028em]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)", color: U.ink }}>
            下一次,我会在三个方向上继续推进。
          </h2>
        </Mask>
        <motion.div variants={UP} className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
          {fronts.map((f, i) => (
            <motion.div key={f.n}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex gap-4 rounded-xl px-5 py-5"
              style={{ background: U.surface, border: `1px solid ${U.hairline}` }}>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: U.ink }}>{f.n}</span>
              <p className="text-[14px] font-light leading-[1.6] tracking-tight" style={{ color: U.inkSoft }}>{f.t}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §16 Closing
function SlideClosing() {
  return (
    <section className="flex h-full flex-col items-start justify-center px-12 md:px-20" style={{ background: U.surface }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-3xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12" style={{ background: U.ink }} />
        <Mask delay={0.08}>
          <h2 className="font-light leading-[1.18] tracking-[-0.03em]" style={{ fontSize: "clamp(1.7rem, 4vw, 3rem)", color: U.ink }}>
            透明的<Mark>过程</Mark>,比单纯透明的<span className="line-through" style={{ textDecorationColor: U.mutedSoft, color: U.muted }}>价格</span>是更强的信任优势。
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: U.muted }}>
          Yuan Fang · 产品设计师 · 普瑞特艺术学院
        </motion.p>
        <motion.div variants={UP} className="mt-9 flex flex-wrap items-center gap-5">
          <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[13px] font-medium text-white transition-colors duration-300"
            style={{ background: U.ink }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1F1F1F")}
            onMouseLeave={(e) => (e.currentTarget.style.background = U.ink)}>
            体验原型
            <span className="transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/meituan-im"
            className="text-[10px] font-semibold uppercase tracking-[0.24em] underline underline-offset-4 transition-colors"
            style={{ color: U.muted, textDecorationColor: U.hairline }}>
            案例研究
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Slide renderer ───────────────────────────────────────────────────────────
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":               return <SlideCover />;
    case "context":             return <SlideContext />;
    case "overview":            return <SlideOverview />;
    case "signal":              return <SlideSignal />;
    case "first-try":           return <SlideFirstTry />;
    case "before-after":        return <SlideBeforeAfter />;
    case "txn-flow":            return <SlideTxnFlow />;
    case "entry-states":        return <SlideEntryStates />;
    case "flow-standard":       return <SlideFlowStandard />;
    case "flow-selfserve":      return <SlideFlowSelfserve />;
    case "flow-offhours":       return <SlideFlowOffhours />;
    case "flow-expired-before": return <SlideFlowExpiredBefore />;
    case "flow-expired-after":  return <SlideFlowExpiredAfter />;
    case "flow-return":         return <SlideFlowReturn />;
    case "merchant":            return <SlideMerchant />;
    case "prototype-full":      return <SlidePrototypeFull />;
    case "extensions":          return <SlideExtensions />;
    case "impact":              return <SlideImpact />;
    case "reflection":          return <SlideReflection />;
    case "closing":             return <SlideClosing />;
    default:                    return null;
  }
}

// ─── Chapter pill nav ─────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function DeckSlideScrubber({
  idx, total, dark, onChange,
}: { idx: number; total: number; dark: boolean; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full" aria-hidden
        style={{ background: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: U.accent }} />
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
              on
                ? "px-3 py-[3px] text-[9px] font-semibold uppercase tracking-[0.18em]"
                : "h-1.5 w-1.5"
            }`}
            style={on
              ? { background: U.accent, color: U.accentInk }
              : { background: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.18)" }}
            aria-label={`跳转到章节:${ch}`}>
            {on ? ch : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── Directional slide transition ─────────────────────────────────────────────
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
  const minsLeft = Math.max(1, Math.ceil(((total - 1 - idx) * 50) / 60));

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

  const chromeBg     = dark ? "rgba(0,0,0,0.96)" : "rgba(255,255,255,0.78)";
  const chromeBorder = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.07)";
  const navStrong    = dark ? "rgba(255,255,255,0.92)" : U.inkLight;
  const navMeta      = dark ? "rgba(255,255,255,0.6)"  : U.mutedSoft;

  return (
    <div className="relative h-screen overflow-hidden" style={{ fontFamily: FONT, background: dark ? U.dark : U.surface }}>
      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full" style={{ background: U.accent }}
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md transition-colors duration-500 md:px-10"
        style={{ background: chromeBg, borderColor: chromeBorder }}>
        <div className="flex items-center gap-5">
          <Link href="/work/meituan-im"
            className="text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors"
            style={{ color: navStrong }}>
            ← 案例研究
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

      {/* Slide area — overlapping directional transition */}
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

      {/* Edge click-zones removed so they never sit over (and block selecting)
          slide text. Navigation: arrow keys, footer Prev/Next, scrubber, pills. */}

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
