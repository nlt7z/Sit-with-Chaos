"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// ─── Easings & variants ───────────────────────────────────────────────────────
const E    = [0.22, 1, 0.36, 1] as const;
const EMSK = [0.76, 0, 0.24, 1] as const;

const STG  = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
const UP   = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.82, ease: E } } };
const FADE = { hidden: { opacity: 0 },        show: { opacity: 1,       transition: { duration: 0.55, ease: E } } };

// ─── Linear-flavored dark tokens(与英文版完全一致的视觉语言) ──────────────────
const CANVAS = "bg-[#08090A]";
const HEAD   = "text-[#F7F8F8]";
const HAIR   = "border-white/[0.08]";
const INSET  = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";
// 唯一的强调色是 lime (#FF6A00),其余皆为留白 + 发丝线。

const SPLIT =
  "relative z-10 flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 md:flex-row md:items-stretch md:gap-12";

// ─── Live prototype deep-links — 与英文版一致,直接内嵌真实可交互原型 ──────────
const PROTO = {
  romanceFull:     "/work/ai-character/prototype?embed=1&muted=1",
  heartbeat:       "/work/ai-character/prototype?embed=1&muted=1&focus=heartbeat",
  story:           "/work/ai-character/prototype?embed=1&muted=1&focus=story",
  moments:         "/work/ai-character/prototype?embed=1&muted=1&focus=moments",
  altUniverse:     "/work/ai-character/prototype?embed=1&muted=1&focus=alt-universe",
  inspire:         "/work/ai-character/prototype?embed=1&muted=1&focus=inspire",
  code:            "/work/ai-character/prototype?embed=1&muted=1&focus=code",
  astroProfile:    "/work/ai-character/prototype-astro?embed=1&focus=profile",
  therapyAnalysis: "/work/ai-character/prototype-psych?embed=1&focus=analysis",
} as const;

// ─── Slide registry ───────────────────────────────────────────────────────────
const SLIDES = [
  { id: "cover",            chapter: "开场"     },
  { id: "overview",         chapter: "开场"     },
  { id: "problem",          chapter: "问题"     },
  { id: "hmw",              chapter: "问题"     },
  { id: "howmightwe",       chapter: "问题"     },
  { id: "d1-title",         chapter: "决策 01"  },
  { id: "d1-showrooms",     chapter: "决策 01"  },
  { id: "d2-title",         chapter: "决策 02"  },
  { id: "d2-map",           chapter: "决策 02"  },
  { id: "heartbeat",        chapter: "决策 02"  },
  { id: "heartbeat-logic",  chapter: "决策 02"  },
  { id: "story",            chapter: "决策 02"  },
  { id: "story-logic",      chapter: "决策 02"  },
  { id: "moments",          chapter: "决策 02"  },
  { id: "moments-logic",    chapter: "决策 02"  },
  { id: "altuniv",          chapter: "决策 02"  },
  { id: "altuniv-logic",    chapter: "决策 02"  },
  { id: "astro-profile",    chapter: "决策 02"  },
  { id: "therapy-analysis", chapter: "决策 02"  },
  { id: "d3-title",         chapter: "决策 03"  },
  { id: "inspire-continue", chapter: "决策 03"  },
  { id: "code-drawer",      chapter: "决策 03"  },
  { id: "exploration",      chapter: "方法"     },
  { id: "process",          chapter: "方法"     },
  { id: "how-i-worked",     chapter: "方法"     },
  { id: "showrooms",        chapter: "产品展示" },
  { id: "showcase-live",    chapter: "产品展示" },
  { id: "backend-before",   chapter: "额外贡献" },
  { id: "backend",          chapter: "额外贡献" },
  { id: "spark-design",     chapter: "额外贡献" },
  { id: "metrics",          chapter: "成效"     },
  { id: "metrics-method",   chapter: "成效"     },
  { id: "principles",       chapter: "总结"     },
  { id: "takeaways",        chapter: "总结"     },
  { id: "closing",          chapter: "结束"     },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Living glow ──────────────────────────────────────────────────────────────
// 静态光晕 —— 把 lime 氛围烘焙进 CSS 渐变里。原来给模糊色块做 scale/opacity 动画,
// 而对一个 blur 元素做动画会让浏览器每帧重新栅格化模糊,导致翻页卡顿。静态 = GPU
// 只栅格化一次,切换就顺滑了。
function LivingAura({ reduced: _reduced }: { reduced: boolean | null }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
      style={{
        background:
          "radial-gradient(46rem 30rem at 50% -8%, rgba(255,106,0,0.07), transparent 60%)," +
          "radial-gradient(24rem 24rem at 94% 108%, rgba(255,106,0,0.045), transparent 66%)",
      }}
    />
  );
}

// ─── Spotlight (cover bg) ─────────────────────────────────────────────────────
function Spotlight({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState({ x: "50%", y: "40%" });
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      setPos({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px` });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [containerRef]);
  return (
    <div className="pointer-events-none absolute inset-0"
      style={{ background: `radial-gradient(820px circle at ${pos.x} ${pos.y}, rgba(255,106,0,0.06), transparent 72%)` }} />
  );
}

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
  to, suffix = "", prefix = "", startDelay = 320, duration = 1100,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame: number;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setN(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const tid = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, startDelay);
    return () => { clearTimeout(tid); cancelAnimationFrame(frame); };
  }, [to, startDelay, duration]);
  return <>{prefix}{n}{suffix}</>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const EYE  = "font-mono text-[10px] uppercase tracking-[0.24em]";
const BODY = "font-sans leading-[1.85]";

function Eye({ children }: { children: ReactNode }) {
  return <p className={`${EYE} text-white/[0.42]`}>{children}</p>;
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-white/[0.12] bg-white/[0.04] px-1 font-mono text-[10px] leading-none text-white/55 ${INSET}`}>
      {children}
    </span>
  );
}

// ─── Live prototype, scaled to fit ────────────────────────────────────────────
const PROTO_W = 1440;
const PROTO_H = 810;

function DeckPrototype({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = box.w > 0 && box.h > 0 ? Math.min(box.w / PROTO_W, box.h / PROTO_H) : 0;
  return (
    <div ref={ref} className="relative flex min-h-0 w-full flex-1 basis-0 items-center justify-center">
      {scale > 0 ? (
        <div
          className="relative overflow-hidden rounded-lg bg-[#0b0b10] shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]"
          style={{ width: PROTO_W * scale, height: PROTO_H * scale }}
        >
          <iframe
            src={src}
            title={label}
            loading="lazy"
            className="absolute left-0 top-0 border-0"
            style={{ width: PROTO_W, height: PROTO_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
            onLoad={(e) => {
              // 原型与本页同源,把方向键 / 空格 / 翻页键从 iframe 里转发出去——
              // 否则一旦 iframe 抢走焦点,deck 的键盘翻页就失灵了。输入时跳过。
              try {
                const doc = (e.currentTarget as HTMLIFrameElement).contentDocument;
                if (!doc) return;
                doc.addEventListener("keydown", (ev) => {
                  const t = ev.target as HTMLElement | null;
                  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
                  if (["ArrowRight", " ", "PageDown"].includes(ev.key)) { ev.preventDefault(); window.dispatchEvent(new CustomEvent("deck-nav", { detail: 1 })); }
                  else if (["ArrowLeft", "PageUp"].includes(ev.key)) { ev.preventDefault(); window.dispatchEvent(new CustomEvent("deck-nav", { detail: -1 })); }
                });
              } catch { /* 跨域 / 不可用 — 忽略 */ }
            }}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center" aria-hidden>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">原型加载中…</span>
        </div>
      )}
    </div>
  );
}

// ─── Workflow SVG viewer ──────────────────────────────────────────────────────
function WorkflowImg({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 basis-0 flex-col">
      <div className="relative box-border min-h-0 w-full max-w-[min(80rem,100%)] flex-1 self-center">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 box-border block h-full w-full object-contain object-center p-1"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 封面
function SlideCover({ reduced }: { reduced: boolean | null }) {
  const ref = useRef<HTMLElement>(null);
  const meta = [
    { k: "角色", v: "唯一 UX 设计师,从调研一路做到生产代码" },
    { k: "周期", v: "4 周 · 2025 年 7–8 月" },
    { k: "团队", v: "我 · 2 位导师 · 2 位产品 · 1 位工程师" },
    { k: "负责", v: "UX 策略 · 4 个 showroom · 设计系统模板" },
  ];
  return (
    <section ref={ref} className={`relative flex h-full min-h-0 items-stretch overflow-hidden ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <Spotlight containerRef={ref} />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] select-none lg:block">
        <motion.img
          src="/assets/ai-character/eternal-vow-character.png" alt="" aria-hidden
          className="h-full w-full object-cover object-top"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 22%, rgba(0,0,0,0.75) 55%)", opacity: 0.55 }}
          initial={reduced ? false : { scale: 1.06, opacity: 0 }}
          animate={reduced ? undefined : { scale: 1, opacity: 0.55 }}
          transition={{ duration: 2.2, ease: E }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #08090A 0%, #08090Abb 20%, transparent 55%)" }} />
      </div>
      <motion.div className="relative z-10 flex min-h-0 w-full max-w-6xl flex-col justify-center px-8 py-6 sm:px-12 md:px-16 lg:px-20"
        variants={STG} initial="hidden" animate="show">
        <div className="min-h-0 shrink-0 space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-12 lg:space-y-0">
          <div className="min-w-0">
            <motion.div variants={FADE} className="flex items-center gap-4">
              <img src="/assets/ai-character/alibaba-cloud-logo-new.png" alt="阿里云"
                className="h-6 w-auto max-w-[10rem] object-contain object-left opacity-95" decoding="async" />
              <span className="h-3.5 w-px bg-white/15" />
              <Eye>Qwen Character · 2025</Eye>
            </motion.div>
            <div className="mt-5 space-y-0.5 md:mt-6">
              {["Interactive Showrooms", "端到端设计"].map((line, i) => (
                <Mask key={i} delay={0.1 + i * 0.12}>
                  <h1 className={`text-balance font-display font-light leading-[1.1] tracking-[-0.01em] ${HEAD}`}
                    style={{ fontSize: "clamp(1.9rem, 3.8vw + 0.4rem, 3.5rem)" }}>{line}</h1>
                </Mask>
              ))}
            </div>
            <motion.p variants={UP} className={`mt-5 max-w-xl ${BODY} text-[14px] leading-[1.8] text-white/[0.62] md:mt-6 md:text-[15px]`}>
              独立主导并交付了 Interactive Showrooms 的端到端设计——通义千问 Character 大模型的 MVP 功能,服务数百万企业客户;并用 4 个能上手的 Demo,带动模型 API 调用量增长了 200%。
            </motion.p>
          </div>
          <div className="min-w-0 lg:flex lg:flex-col lg:justify-end">
            <motion.dl variants={UP}
              className={`mt-6 grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 border-t ${HAIR} pt-5 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0`}>
              {meta.map(({ k, v }) => (
                <div key={k} className="min-w-0">
                  <dt className={`${EYE} text-white/[0.42]`}>{k}</dt>
                  <dd className="mt-1 font-sans text-[12px] leading-relaxed text-white/[0.8] sm:text-[13px]">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// §01 概览
function SlideOverview({ reduced }: { reduced: boolean | null }) {
  const pillars = [
    { stat: "数小时 → 几分钟", label: "首次感受到价值的耗时", detail: "从翻文档,到第一次真正被打动 · 观测值" },
    { stat: "~2×",            label: "模型 API 调用量",     detail: "相比上线前 4 周基线" },
    { stat: "4 个 Demo",      label: "能上手的 showroom",   detail: "一个房间,讲透一项模型能力" },
  ];
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>概览 · Interactive Showrooms</Eye></motion.div>
        <Mask delay={0.12} className="mt-6">
          <h2 className={`text-balance font-display font-light leading-[1.2] tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)" }}>
            终于,能看见别人用这个模型做出了什么。
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[15px] text-white/[0.68]`}>
          通义千问 Character 是一个大模型 API——企业、开发者、游戏团队在它之上做自己的角色产品,就像在 Claude 上做开发一样。我重做了它的官网和里面的 showroom:这是一个门店,让那些原本看不见的产品,第一次变得可见、可玩。每个房间聚焦模型的一项能力,配上提示词指南和在线代码编辑器。
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} sm:grid-cols-3`}>
          {pillars.map((p, i) => (
            <motion.div key={p.label}
              className={`py-6 sm:px-6 ${i > 0 ? `border-t ${HAIR} sm:border-l sm:border-t-0` : "sm:pl-0"}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.28 + i * 0.1 }}>
              <p className="font-display font-light tracking-[-0.02em] text-[#FF6A00]"
                style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)" }}>{p.stat}</p>
              <p className="mt-3 font-sans text-[12px] font-medium text-white/[0.74]">{p.label}</p>
              <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-white/[0.5]">{p.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §02 问题
function SlideProblem({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10 grid w-full max-w-6xl gap-10 md:grid-cols-2 md:gap-x-16" variants={STG} initial="hidden" animate="show">
        <div>
          <motion.div variants={FADE}><Eye>问题</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-6 font-display font-light leading-[1.2] tracking-[-0.018em] ${HEAD}`}
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.7rem)" }}>
              头一个小时,就劝退了大半试用用户。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-7 ${BODY} text-[15px] text-white/[0.72]`}>
            文档把一切都写清楚了,可要真正「感受」到模型,用户得自己配置、跑样例、再解读结果——这一圈下来常常一个多小时。大多数人还没等到价值出现,就已经走了。
          </motion.p>
          <motion.p variants={UP} className="mt-6 font-display text-[15px] font-light leading-relaxed text-[#FF6A00]/90">
            所以我把产品的重心,从「讲清楚」转向「证明给你看」。
          </motion.p>
        </div>
        <motion.div variants={UP} className="flex flex-col gap-4 self-center">
          <figure className="overflow-hidden rounded-lg bg-black shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]">
            <video className="block w-full" autoPlay muted loop playsInline preload="metadata">
              <source src="/assets/ai-character/before.mp4" type="video/mp4" />
            </video>
            <figcaption className={`border-t ${HAIR} px-4 py-2.5 ${EYE} text-white/45 tracking-[0.08em]`}>之前 — 通用聊天 &amp; 静态文档</figcaption>
          </figure>
          <div className="border-l-2 border-[#FF6A00]/40 pl-5">
            <p className={`${EYE} text-white/[0.42]`}>企业侧同样卡住</p>
            <p className="mt-2 font-sans text-[13px] leading-[1.8] text-white/[0.78]">给企业客户的也只是一份罗列能力的 PPT——能说明,却说服不了人。没有任何东西能缩短建立信任的时间,更别说用看得见的证据替代那漫长的第一个小时。</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §03 How Might We
function SlideHmw({ reduced }: { reduced: boolean | null }) {
  const rows = [
    { finding: "记忆和节奏,用户根本看不见",   evidence: "还没感受到差异,人就走了" },
    { finding: "信任,来自更快拿到价值",       evidence: "试用用户在第一小时内流失" },
    { finding: "企业侧:能说,不能试",         evidence: "PPT 只能描述,说服不了人" },
  ];
  return (
    <section className={`relative flex h-full items-center justify-center overflow-hidden px-10 md:px-16 lg:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)] md:gap-x-16 lg:gap-x-24"
        variants={STG} initial="hidden" animate="show">
        <div className="min-w-0 max-w-xl md:max-w-none">
          <motion.div variants={FADE}><Eye>用户洞察</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-6 font-display font-light leading-[1.2] tracking-[-0.018em] ${HEAD}`}
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
              用户想亲自感受 AI,而不是读它的说明书。
            </h2>
          </Mask>
        </div>
        <motion.div variants={UP} className="min-w-0 self-center">
          <p className={`${EYE} text-white/[0.42]`}>调研告诉我们什么</p>
          <div className={`mt-4 divide-y divide-white/[0.08] border-t ${HAIR}`}>
            {rows.map((row, i) => (
              <motion.div key={i} className="flex items-baseline justify-between gap-4 py-3.5"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: E, delay: 0.3 + i * 0.08 }}>
                <p className="font-sans text-[13.5px] font-medium text-white/[0.86]">{row.finding}</p>
                <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-white/[0.4]">{row.evidence}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §03.5 How Might We — 单独成页(放在调研之后)
function SlideHmwStatement({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-10 md:px-16 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show"
        className="relative z-10 mx-auto w-full max-w-6xl border-l-2 border-[#FF6A00] pl-6 md:pl-8">
        <motion.div variants={FADE}><Eye>我们如何能</Eye></motion.div>
        <Mask delay={0.12} className="mt-5">
          <h2 className={`text-balance font-display font-light leading-[1.3] tracking-[-0.01em] ${HEAD}`}
            style={{ fontSize: "clamp(1.7rem, 3.8vw, 3rem)" }}>
            在几分钟内,就让模型的能力变得<em className="not-italic text-[#FF6A00]">看得见</em>、<em className="not-italic text-[#FF6A00]">试得到</em>、<em className="not-italic text-[#FF6A00]">信得过</em>?
          </h2>
        </Mask>
      </motion.div>
    </section>
  );
}

// ─── 决策标题模板 ─────────────────────────────────────────────────────────────
function TitleSlide({
  reduced, chapter, title, body, kicker,
}: { reduced: boolean | null; chapter: string; title: string; body: string; kicker: string }) {
  return (
    <section className={`relative flex h-full items-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-6xl">
        <motion.div variants={FADE}><Eye>{chapter}</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-6 font-display font-light leading-[1.18] tracking-[-0.02em] ${HEAD}`}
            style={{ fontSize: "clamp(1.8rem, 3.8vw, 3rem)" }}>
            {title}
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-8 max-w-2xl ${BODY} text-[15.5px] text-white/[0.72]`}>
          {body}
        </motion.p>
        <motion.p variants={UP} className="mt-5 font-display text-[15px] font-light leading-relaxed text-[#FF6A00]/90">
          {kicker}
        </motion.p>
      </motion.div>
    </section>
  );
}

// §05 决策 01 — showroom(右侧内嵌实时恋爱原型作为「之后」)
function SlideD1Showrooms({ reduced }: { reduced: boolean | null }) {
  const verticals = ["情感陪伴", "心理咨询", "角色克隆", "IP 授权"];
  const showrooms = [
    { src: PROTO.romanceFull,     label: "恋爱 showroom — 实时原型", caption: "实时恋爱房间 · 长期记忆与情感节奏" },
    { src: PROTO.astroProfile,    label: "星座 showroom — 实时原型", caption: "实时星座房间 · 星盘档案实时更新" },
    { src: PROTO.therapyAnalysis, label: "心理 showroom — 实时原型", caption: "实时心理房间 · 对话主题实时分析" },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduced) return; // 减少动态时不自动轮换,但仍可点击切换
    const t = setInterval(() => setActive((i) => (i + 1) % showrooms.length), 9000);
    return () => clearInterval(t);
  }, [reduced, showrooms.length]);
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>之前 → 之后 · 从文档到上手</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.25] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.85rem)" }}>
              一个房间,对应一个行业——为正身处其中的评估者而做。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            答案是分场景的 showroom——每一个,都是某位真实客户产品的可用版本,而不是又一个通用聊天框。
          </motion.p>
          <motion.div variants={UP} className="mt-5 flex flex-wrap gap-2">
            {verticals.map((v) => (
              <span key={v} className="rounded-full bg-white/[0.06] px-3 py-1.5 font-sans text-[11.5px] font-medium text-white/[0.78]">
                {v}
              </span>
            ))}
          </motion.div>
          <motion.p variants={UP} className="mt-5 font-display text-[13px] font-light leading-relaxed text-[#FF6A00]/90">
            之前:60+ 分钟的通用聊天和文档。之后:真实的房间,就在右边 →
          </motion.p>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={showrooms[active].src} label={showrooms[active].label} />
          <div className="mt-2.5 flex shrink-0 items-center justify-between gap-3">
            <p className={`${EYE} text-white/40 tracking-[0.08em]`}>{showrooms[active].caption}</p>
            <div className="flex items-center gap-1.5">
              {showrooms.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  aria-label={s.label}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[#FF6A00]" : "w-1.5 bg-white/25 hover:bg-white/45"}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §06 决策 02 标题
function SlideD2Title({ reduced }: { reduced: boolean | null }) {
  const visibilities = [
    { type: "记忆", detail: "对话里,系统记住并更新了关于你的哪些信息。" },
    { type: "分析", detail: "你边聊,系统边把它理解到的东西呈现出来。" },
    { type: "实现", detail: "提示词、YAML 和约束,就摆在 Demo 旁边。" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>决策 02</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-5 font-display font-light leading-[1.2] tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.5rem)" }}>
            我让每个房间,用 60 秒证明一项能力。
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-6 max-w-2xl ${BODY} text-[14.5px] text-white/[0.68]`}>
          三项模型能力挤在一个聊天窗里,结果一项都没让人记住。于是我把它们拆进不同房间,每个房间都围绕一个社交产品赖以生存的留存杠杆来设计(亲密感、进度感、离线存在感、不确定奖励):一个房间一个证明时刻,60 秒看懂,同时把看不见的模型行为变成看得见的界面。
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-3`}>
          {visibilities.map((it, i) => (
            <motion.div key={it.type}
              className={`py-6 md:px-6 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: E, delay: 0.26 + i * 0.1 }}>
              <p className={`${EYE} text-[#FF6A00]`}>{String(i + 1).padStart(2, "0")}</p>
              <p className={`mt-3 font-display text-[1.1rem] font-light ${HEAD}`}>{it.type}可见</p>
              <p className="mt-2.5 font-sans text-[13px] leading-[1.8] text-white/[0.6]">{it.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §07 决策 02 — 能力地图
function SlideD2Map({ reduced }: { reduced: boolean | null }) {
  const rooms = [
    { tab: "恋爱", cap: "长期记忆",     feel: "跨会话,角色仍记得聊过的细节",   src: "/assets/ai-character/ux-strategy-romance-proof.png" },
    { tab: "星座", cap: "实时记忆更新", feel: "聊天时,星盘档案实时更新",       src: "/assets/ai-character/ux-strategy-astrology-proof.png" },
    { tab: "心理", cap: "实时分析",     feel: "你聊着,专家面板就浮现出对话主题", src: "/assets/ai-character/ux-strategy-therapy-proof.png" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 pb-6 pt-7 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>Showroom → 一个证明 → 产品里的行为</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.016em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            每个房间,让一种「认知」变得看得见。
          </h2>
        </Mask>
      </motion.div>
      <div className="relative z-10 mx-auto mt-5 grid w-full max-w-6xl flex-1 grid-cols-3 gap-4" style={{ maxHeight: "62vh" }}>
        {rooms.map((r, i) => (
          <motion.article key={r.tab}
            className={`flex min-h-0 flex-col overflow-hidden rounded-lg bg-white/[0.02]`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.1 }}>
            <div className="relative min-h-0 flex-1 overflow-hidden bg-black/40">
              <img src={r.src} alt={`${r.tab} 证明`} className="h-full w-full object-cover object-left-top" loading="lazy" decoding="async" />
            </div>
            <div className={`shrink-0 border-t ${HAIR} px-4 py-4`}>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/[0.4]">{r.tab}房间</p>
              <p className={`mt-2 font-display text-[1.02rem] font-light leading-snug ${HEAD}`}>{r.cap}</p>
              <p className="mt-2 font-sans text-[11.5px] leading-relaxed text-white/[0.58]">{r.feel}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

// ── 功能模板:左文案 + 右实时原型 ─────────────────────────────────────────────
function ProtoFeatureSlide({
  reduced, eye, title, lead, src, caption, notShipped = false, note,
}: {
  reduced: boolean | null;
  eye: string; title: string; lead: string;
  src: string; caption: string; notShipped?: boolean; note?: string;
}) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE} className="flex items-center gap-2.5">
            <Eye>{eye}</Eye>
            {notShipped && (
              <span className="rounded-[4px] border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">
                未上线
              </span>
            )}
          </motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.25] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.85rem)" }}>
              {title}
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-5 ${BODY} text-[14px] text-white/[0.72]`}>{lead}</motion.p>
          {note && (
            <motion.p variants={UP} className={`mt-3.5 border-l-2 border-white/[0.12] pl-3 ${BODY} text-[12.5px] leading-relaxed text-white/[0.5]`}>
              {note}
            </motion.p>
          )}
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={src} label={title} />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>{caption}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── 模型工作流图 ──────────────────────────────────────────────────────────────
function LogicSlide({ reduced, eye, title, src, alt }: { reduced: boolean | null; eye: string; title: string; src: string; alt: string }) {
  return (
    <section className={`relative flex h-full min-h-0 flex-col overflow-hidden px-10 py-4 md:px-14 md:py-5 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.65rem)" }}>
              {title}
            </h2>
          </Mask>
        </div>
        <motion.div variants={FADE} className="mt-2 flex min-h-0 flex-1 basis-0 flex-col md:mt-3">
          <WorkflowImg src={src} alt={alt} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// §08–17 决策 02 功能页
function SlideHeartbeat({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="恋爱 · 1/4 · Heartbeat Power"
      title="翻开角色的内心独白。"
      lead="好奇缺口 + 情感特权——窥见角色的内心,像是『被允许靠近』。这正是把聊天变成依恋的亲密钩子。"
      src={PROTO.heartbeat}
      caption="实时恋爱房间 · 点一下爱心,看见它的心里话"
    />
  );
}
function SlideHeartbeatLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Heartbeat Power · 模型工作流" title="实时生成 + 角色深度建模"
    src="/assets/ai-character/interaction/heartbeat_power_workflow_zh.svg" alt="Heartbeat Power — LLM 工作流图" />;
}

function SlideStoryUnlock({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="恋爱 · 2/4 · Story Unlock"
      title="聊得越深,背景故事越解锁。"
      lead="未闭合的故事 + 进度感——没讲完的背景牵着你往前,于是『深度』本身成了奖励,把每次会话拉长。"
      src={PROTO.story}
      caption="实时恋爱房间 · 聊得越深,角色越敞开"
    />
  );
}
function SlideStoryUnlockLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Story Unlock · 模型工作流" title="渐进式上下文构建"
    src="/assets/ai-character/interaction/story_unlock_workflow_zh.svg" alt="Story Unlock — LLM 工作流图" />;
}

function SlideMoments({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="恋爱 · 3/4 · Moments Feed"
      title="角色的朋友圈,记得你们聊过的一切。"
      lead="右边的朋友圈会根据你们之前的对话实时生成新的 moments——让你真切感到,Ta 是真的记住了你。"
      src={PROTO.moments}
      caption="实时恋爱房间 · 由你们的共同记忆生成的动态"
    />
  );
}
function SlideMomentsLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Moments Feed · 模型工作流" title="从记忆到生成内容"
    src="/assets/ai-character/interaction/moments_feed_workflow_zh.svg" alt="Moments Feed — LLM 工作流图" />;
}

function SlideAltUniv({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="恋爱 · 4/4 · Alternate Universe"
      title="只有你的经历才能触发的剧情。"
      notShipped
      lead="不确定奖励——不可预期、又专属于你的回报,是习惯回路里最强的那根杠杆。剧情由用户行为触发:只要你一小段时间没回复,系统就会自动弹出一段新剧情,始终保有新鲜感。"
      note="为什么没上线:要做到逐人实时生成剧情,技术上太难、模型推理成本也太高;加上我们也不想把体验堆得太花哨。原型已完成,作为方向验证保留。"
      src={PROTO.altUniverse}
      caption="实时原型 · 一段由记忆触发的剧情"
    />
  );
}
function SlideAltUnivLogic({ reduced }: { reduced: boolean | null }) {
  return <LogicSlide reduced={reduced} eye="Alternate Universe · 模型工作流" title="从共同经历到分支叙事"
    src="/assets/ai-character/interaction/alternate_universe_events_workflow_zh.svg" alt="Alternate Universe Events — LLM 工作流图" />;
}

function SlideAstroProfile({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="星座 · 实时记忆更新"
      title="你说的每句话,都在更新它对你的认知。"
      lead="自我相关——看着模型把『你』一点点拼出来本身就很上头,而可见的记忆会悄悄转化成信任。"
      src={PROTO.astroProfile}
      caption="实时星座房间 · 你的档案,实时改写"
    />
  );
}

function SlideTherapyAnalysis({ reduced }: { reduced: boolean | null }) {
  return (
    <ProtoFeatureSlide
      reduced={reduced}
      eye="心理 · 实时分析"
      title="你看到的,是它「听懂」了什么,而不只是它「说」了什么。"
      lead="被看见的感觉——可见的推理让用户觉得被理解,而『被理解』正是建立信任、让人回来的原因。(这是分析演示,不代表任何临床诊断。)"
      src={PROTO.therapyAnalysis}
      caption="实时心理房间 · 模型的理解,就在你的话旁边"
    />
  );
}

// §18 决策 03 标题
function SlideD3Title({ reduced }: { reduced: boolean | null }) {
  return (
    <TitleSlide
      reduced={reduced}
      chapter="决策 03"
      title="我让 Demo 对用户有情感,对开发者可检视。"
      body="Inspiration 和 Continue Response 把用户一步步带到惊艳时刻;一个抽屉式面板,把 YAML 和提示词就放在实时 Demo 旁边。"
      kicker="问题从「你的模型能不能做到」,变成了「我们多快能上线」。"
    />
  );
}

// §19 Inspire / Continue
function SlideInspireContinue({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>通往惊艳时刻的两个小助推</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.25] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.85rem)" }}>
              在用户还没意识到该看哪儿之前,先让模型变得可读。
            </h2>
          </Mask>
          <motion.dl variants={UP} className={`mt-6 divide-y divide-white/[0.08] border-t ${HAIR}`}>
            {[
              { t: "Inspiration Response", b: "三个回复选项——动作、情绪、表达——不打断心流地给出引导。像在玩游戏,而不是发消息。" },
              { t: "Continue Response",    b: "轻点一下,故事就顺着上下文继续——长上下文推理,用户毫不费力。" },
            ].map((f) => (
              <div key={f.t} className="py-3.5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.42]">{f.t}</dt>
                <dd className="mt-1.5 font-sans text-[13px] leading-relaxed text-white/[0.74]">{f.b}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={PROTO.inspire} label="恋爱 showroom — Inspiration & Continue" />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>实时恋爱房间 · 点一个回复选项,或者让故事继续</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §20 代码抽屉
function SlideCodeDrawer({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>代码抽屉,而非控制台</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.25] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.85rem)" }}>
              YAML、提示词和约束,就在实时 Demo 边上滑出来。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            评估者当场就能查看实现,不用切走;再把模板克隆下来,作为自己产品的可复用起点。这个房间本身,就是可交付的代码。
          </motion.p>
          <motion.div variants={UP} className="mt-6 space-y-2">
            <div className={`flex items-baseline gap-3 border-t ${HAIR} pt-3`}>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/[0.38]">放弃</span>
              <p className="font-sans text-[12.5px] leading-snug text-white/[0.55]">另开一个开发者控制台——打断 Demo 心流,还得切标签页。</p>
            </div>
            <div className="flex items-baseline gap-3 border-t border-[#FF6A00]/30 pt-3">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[#FF6A00]">选用</span>
              <p className="font-sans text-[12.5px] leading-snug text-white/[0.84]">在实时 Demo 旁滑出的抽屉——演示到审阅,一气呵成。</p>
            </div>
          </motion.div>
        </div>
        <motion.div variants={FADE} className="flex h-full min-h-0 flex-1 flex-col justify-center">
          <DeckPrototype src={PROTO.code} label="恋爱 showroom — 代码抽屉" />
          <p className={`mt-2.5 shrink-0 ${EYE} text-white/40 tracking-[0.08em]`}>实时恋爱房间 · Demo 背后的 YAML 和提示词,就在这儿展开</p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §20.5 早期过程 — 早期探索素材的占位页(待补充)
function SlideExploration({ reduced }: { reduced: boolean | null }) {
  const earlyWork = [
    { src: "/assets/ai-character/previous/previous-version.jpg",    alt: "早期版本 — 调研与方向探索 01" },
    { src: "/assets/ai-character/previous/previous--version-2.jpg", alt: "早期版本 — 调研与方向探索 02" },
    { src: "/assets/ai-character/previous/previous-version-3.png",  alt: "早期版本 — 调研与方向探索 03" },
  ];
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>早期过程 · 探索</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.2] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              四个房间之前——那些粗糙的早期工作。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            调研、草图,以及我在通往 showroom 路上否决掉的方向。
          </motion.p>
        </div>
        <motion.div variants={UP} className="grid min-h-0 flex-1 grid-cols-3 content-center gap-3">
          {earlyWork.map((img) => (
            <div key={img.src} className="relative aspect-[16/9] min-h-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.015]">
              <img src={img.src} alt={img.alt}
                className="absolute inset-0 h-full w-full object-contain object-center" loading="lazy" decoding="async" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §21 我如何工作 — 四阶段 AI 矩阵
const WORK_STAGES = [
  { n: "01", phase: "研究",            tools: "Notion · Memo · ChatGPT · Claude",          body: "把零散的调研——6 款应用、40+ 条评论——一个回合就归纳成策略模式。" },
  { n: "02", phase: "UX 策略",         tools: "Qwen · ChatGPT · Figma",                    body: "把彼此冲突的设计决策当成结构化论证来反复推敲,在评审会之前就把分歧解决掉。" },
  { n: "03", phase: "视觉识别 & UI",   tools: "Figma · MasterGo · Midjourney · Dreamnia · Wan · Kling", body: "生成角色原画、场景背景和循环动效——这些原本得靠一支 3D 团队才能做出来。" },
  { n: "04", phase: "动效 & 生产代码", tools: "CodePen · ChatGPT · Cursor · Claude Code",  body: "在没有专职前端的情况下,交付了动效、状态逻辑和可交互的设计。当时 vibe design 还不成熟,所以后来我又用 Cursor 和 Claude Code 把 showroom 的页面重新设计了一遍。" },
] as const;

function SlideHowIWorked({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>我如何工作</Eye></motion.div>
        <Mask delay={0.1}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            AI 改变的不只是我做素材的方式,更是我交付的方式。
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-4 max-w-3xl ${BODY} text-[14px] text-white/[0.68]`}>
          AI 把策略、视觉、动效到实现之间的距离压短了——一个设计师就能交付接近生产水准的界面,工程师几乎不用改就能合入。
        </motion.p>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-4`}>
          {WORK_STAGES.map((s, i) => (
            <motion.div key={s.n}
              className={`flex flex-col py-6 md:px-5 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.22 + i * 0.1 }}>
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[12px] text-[#FF6A00]">{s.n}</span>
                <span className={`text-[13.5px] font-medium leading-tight ${HEAD}`}>{s.phase}</span>
              </div>
              <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">工具</p>
              <p className="mt-1.5 font-sans text-[12px] leading-snug text-white/[0.82]">{s.tools}</p>
              <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40">产出</p>
              <p className="mt-1.5 font-sans text-[12px] leading-[1.7] text-white/[0.6]">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §22 过程
function SlideProcess({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 items-stretch overflow-hidden px-8 py-6 md:px-12 md:py-7 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className={SPLIT} variants={STG} initial="hidden" animate="show">
        <div className="flex min-w-0 flex-col justify-center md:w-[34%] md:shrink-0">
          <motion.div variants={FADE}><Eye>过程一瞥</Eye></motion.div>
          <Mask delay={0.1}>
            <h2 className={`text-balance mt-5 font-display font-light leading-[1.2] tracking-[-0.016em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              四周。<br />从调研到上线。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-4 ${BODY} text-[13.5px] text-white/[0.66]`}>
            灵感来自《恋与深空》和《恋与制作人》。视觉部分用 Wan、Kling、Dreamnia 完成。
          </motion.p>
          <motion.div variants={UP} className="mt-5 border-l-2 border-[#FF6A00]/40 pl-4">
            <p className="font-sans text-[12px] leading-relaxed text-white/[0.58]">
              3D 形象在交互中途崩了 → 改用 AI 循环视频。一个眨眼、一次点头这样的小动作,反而比复杂的骨骼动画更显鲜活。
            </p>
          </motion.div>
        </div>
        <motion.div variants={UP} className="grid min-h-0 flex-1 grid-cols-2 content-center gap-3">
          {[
            { src: "/assets/ai-character/design.jpg",             label: "角色方向探索" },
            { src: "/assets/ai-character/uivisual.jpg",           label: "UI 视觉系统" },
            { src: "/assets/ai-character/characterdirection.jpg", label: "角色方向" },
            { src: "/assets/ai-character/innovation.jpg",         label: "场景、音乐与动效概念" },
          ].map(({ src, label }, i) => (
            <motion.div key={src} className={`group aspect-[16/9] min-h-0 overflow-hidden rounded-lg bg-white/[0.02]`}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: E, delay: 0.3 + i * 0.08 }}>
              <img src={src} alt={label} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §23 Showroom 2×2 — 产品展示集锦
function SlideShowrooms({ reduced }: { reduced: boolean | null }) {
  const rooms = [
    { label: "恋爱", cap: "长期记忆",     src: "/assets/ai-character/new-cover.mp4"   },
    { label: "星座", cap: "实时记忆更新", src: "/assets/ai-character/taobaibai-1.mp4" },
    { label: "心理", cap: "实时分析",     src: "/assets/ai-character/therapy-1.mp4"   },
    { label: "角色", cap: "多智能体协同", src: "/assets/ai-character/pre-1.mp4"       },
  ];
  return (
    <section className={`relative flex h-full flex-col overflow-hidden px-8 pb-6 pt-8 md:px-12 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div className="relative z-10" variants={STG} initial="hidden" animate="show">
        <motion.div variants={FADE}><Eye>产品展示 · 4 个 Showroom · 1 套模板</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-3 font-display font-light tracking-[-0.016em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.8vw, 2.1rem)" }}>
            每个房间,都把一项模型能力变成一条有引导的工作流。
          </h2>
        </Mask>
      </motion.div>
      <div className="relative z-10 mt-5 grid min-h-0 flex-1 grid-cols-2 gap-3" style={{ maxHeight: "72vh" }}>
        {rooms.map((r, i) => (
          <motion.div key={r.label} className={`relative overflow-hidden rounded-lg bg-[#0A0A0A]`}
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.18 + i * 0.1 }}>
            <video className="h-full w-full object-contain" playsInline muted autoPlay loop preload="none">
              <source src={r.src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#FF6A00]">{r.label}</p>
              <p className="mt-1 font-sans text-[11.5px] text-white/[0.88]">{r.cap}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// §24 产品展示 — 完整实时恋爱原型
function SlideShowcaseLive({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full min-h-0 flex-col overflow-hidden px-8 py-5 md:px-12 md:py-6 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <div className="relative z-10 shrink-0">
        <Eye>产品展示 · 实时原型 · 恋爱</Eye>
        <h2 className={`text-balance mt-2 font-display font-light tracking-[-0.016em] ${HEAD}`}
          style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)" }}>
          用 React 做的真实 showroom——此刻就在这里跑着。
        </h2>
      </div>
      <div className="relative z-10 mt-4 flex min-h-0 flex-1 flex-col">
        <DeckPrototype src={PROTO.romanceFull} label="恋爱 showroom — 完整实时原型" />
      </div>
    </section>
  );
}

// §25 额外贡献 — SaaS 控制台焕新
function SlideBackendBefore({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>额外贡献 · B2B 控制台 · 改版前</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              我接手时的样子:旧版控制台。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-3 max-w-3xl ${BODY} text-[13.5px] text-white/[0.66]`}>
            原本的控制台信息密集、层级混乱,空状态和错误态几乎没有设计——这是我重做之前的起点。
          </motion.p>
        </div>
        <motion.div variants={UP} className="mt-6 grid grid-cols-3 gap-3">
          {[
            { src: "/assets/ai-character/previous-api/previous-api-1.png", label: "知识库列表",   tag: "改版前" },
            { src: "/assets/ai-character/previous-api/previous-api-2.png", label: "新建知识仓库", tag: "改版前" },
            { src: "/assets/ai-character/previous-api/previous-api-3.png", label: "知识库模板",   tag: "改版前" },
          ].map(({ src, label, tag }, i) => (
            <motion.div key={src} className={`group overflow-hidden rounded-lg`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.3 + i * 0.09 }}>
              <div className="relative overflow-hidden bg-black/40">
                <img src={src} alt={label} loading="lazy"
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <div className={`flex items-center gap-2 border-t ${HAIR} px-3 py-2`}>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{tag}</span>
                <span className="font-sans text-[11px] text-white/[0.66]">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function SlideBackend({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="shrink-0">
          <motion.div variants={FADE}><Eye>额外贡献 · B2B 控制台</Eye></motion.div>
          <Mask delay={0.08}>
            <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
              通义千问 Character SaaS 控制台的全面焕新。
            </h2>
          </Mask>
          <motion.p variants={UP} className={`mt-3 max-w-3xl ${BODY} text-[13.5px] text-white/[0.66]`}>
            一次端到端的改版,覆盖 API 界面、Studio(应用、工作流、知识库、角色),以及下面的各级流程:空状态、错误态,还有调用指标和调用量的数据看板。
          </motion.p>
        </div>
        <motion.div variants={UP} className="mt-6 grid grid-cols-3 gap-3">
          {[
            { src: "/assets/ai-character/updateddesign1.jpg", label: "Studio 界面", tag: "Studio" },
            { src: "/assets/ai-character/updateddesign2.jpg", label: "多级流程",    tag: "流程" },
            { src: "/assets/ai-character/updatedesign3.jpg",  label: "知识库",      tag: "知识库" },
          ].map(({ src, label, tag }, i) => (
            <motion.div key={src} className={`group overflow-hidden rounded-lg`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.3 + i * 0.09 }}>
              <div className="relative overflow-hidden bg-black/40">
                <img src={src} alt={label} loading="lazy"
                  className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <div className={`flex items-center gap-2 border-t ${HAIR} px-3 py-2`}>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#FF6A00]">{tag}</span>
                <span className="font-sans text-[11px] text-white/[0.66]">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §26 Spark Design — 被采用
function SlideSparkDesign({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>被采用 · Spark Design</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}>
            Showroom 这套体系,最后成了对外发布的 B2B 设计框架。
          </h2>
        </Mask>
        <motion.div variants={UP} className={`mt-6 overflow-hidden rounded-lg`}>
          <div className={`flex items-center justify-between gap-3 border-b ${HAIR} bg-white/[0.02] px-4 py-3 md:px-5`}>
            <div>
              <p className={`${EYE} text-white/[0.42]`}>采用</p>
              <p className={`mt-1.5 font-sans text-[12.5px] font-medium ${HEAD}`}>Spark Design templates — Agentscope</p>
            </div>
            <a href="https://sparkdesign.agentscope.io/#/templates" target="_blank" rel="noopener noreferrer"
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/[0.55] underline decoration-white/[0.18] underline-offset-[5px] transition-colors hover:text-white">
              打开 ↗
            </a>
          </div>
          <iframe title="Spark Design templates" src="https://sparkdesign.agentscope.io/#/templates" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[min(56vh,540px)] min-h-[320px] w-full border-0 bg-white" />
          <p className={`border-t ${HAIR} bg-white/[0.02] px-4 py-2 font-sans text-[10.5px] leading-relaxed text-white/40 md:px-5`}>
            如果下面是空白,说明站点不允许内嵌——请在浏览器里打开。
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §27 成效 — 分阶段揭示
function DataStreamBg() {
  const lines = [
    { top: "8%",  width: "32%", dur: 5.4, delay: 0.0, opacity: 0.16 },
    { top: "19%", width: "26%", dur: 6.2, delay: 1.1, opacity: 0.12 },
    { top: "33%", width: "38%", dur: 4.8, delay: 0.4, opacity: 0.2  },
    { top: "47%", width: "22%", dur: 7.0, delay: 2.0, opacity: 0.09 },
    { top: "61%", width: "30%", dur: 5.6, delay: 0.8, opacity: 0.16 },
    { top: "74%", width: "28%", dur: 6.4, delay: 1.6, opacity: 0.1  },
    { top: "88%", width: "34%", dur: 5.0, delay: 0.2, opacity: 0.14 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {lines.map((l, i) => (
        <motion.div key={i} className="absolute h-px"
          style={{ top: l.top, width: l.width, left: 0,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,106,0,${l.opacity}) 50%, transparent 100%)` }}
          initial={{ x: "-30%" }} animate={{ x: "360%" }}
          transition={{ duration: l.dur, repeat: Infinity, delay: l.delay, ease: "linear" }} />
      ))}
    </div>
  );
}

function TimeBar({
  label, value, pct, delay, highlight,
}: { label: string; value: string; pct: number; delay: number; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.75, ease: E, delay }} className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`${EYE} ${highlight ? "text-[#FF6A00]" : "text-white/55"}`}>{label}</p>
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: E, delay: delay + 0.7 }}
          className="font-display font-light tabular-nums tracking-tight"
          style={{ fontSize: "clamp(1.2rem, 2.1vw, 1.7rem)",
            color: highlight ? "#FF6A00" : "rgba(255,255,255,0.55)",
            textShadow: highlight ? "0 0 18px rgba(255,106,0,0.22)" : "none" }}>
          {value}
        </motion.span>
      </div>
      <div className="relative mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: "0%" }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1.05, ease: E, delay: delay + 0.15 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: highlight
              ? "linear-gradient(90deg, #FF6A00 0%, #FF9A4D 100%)"
              : "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.34) 100%)",
            boxShadow: highlight ? "0 0 14px rgba(255,106,0,0.35)" : "none" }} />
        <motion.div className="pointer-events-none absolute inset-y-0 w-12 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)" }}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: ["-100%", `${pct * 4}%`], opacity: [0, 1, 0] }}
          transition={{ duration: 1.05, ease: E, delay: delay + 0.15, times: [0, 0.6, 1] }} />
      </div>
    </motion.div>
  );
}

function SlideMetrics() {
  const stats = [
    { to: 4,   suffix: "",  prefix: "",  label: "上线 showroom",     detail: "恋爱 · 星座 · 心理 · 角色" },
    { to: 100, suffix: "%", prefix: "+", label: "模型 API 调用量",   detail: "约为上线前 4 周基线的 2 倍" },
    { to: 87,  suffix: "%", prefix: "",  label: "克隆即试的步骤减少", detail: "从规格 + 配置一长串,缩成模板入口" },
    { to: 60,  suffix: "%", prefix: "",  label: "交付提速",          detail: "工程估算 · 规格与代码一起交付" },
  ];
  const T_TITLE = 0.0, T_SUB = 0.3, T_CHART = 0.6, T_STATS = 0.9, T_OUTRO = 1.4;
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <DataStreamBg />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: E, delay: T_TITLE }}>
          <Eye>成效 · 已上线 · 已转化 · 被采用</Eye>
        </motion.div>
        <Mask delay={T_SUB}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.6rem)" }}>
            交付了什么。改变了什么。
          </h2>
        </Mask>
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: E, delay: T_CHART }}
          className={`mt-7 rounded-lg bg-white/[0.02] px-5 py-5 md:px-7 md:py-6`}>
          <div className="flex items-baseline justify-between gap-6">
            <p className={`${EYE} text-white/55`}>首次感受到价值的耗时</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF6A00]/85">测试中的观测</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-x-10">
            <TimeBar label="之前 · 文档式上手"      value="60+ 分钟" pct={100} delay={T_CHART + 0.2} />
            <TimeBar label="之后 · 交互式 showroom" value="几分钟"   pct={10}  delay={T_CHART + 0.45} highlight />
          </div>
        </motion.div>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/[0.06] md:grid-cols-4">
          {stats.map((s, i) => {
            const cardDelay = T_STATS + i * 0.12;
            const isKey = s.label === "模型 API 调用量";
            return (
              <motion.div key={s.label} className="relative bg-[#08090A] px-6 py-6"
                initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: E, delay: cardDelay }}>
                <motion.div className="mb-3 h-[1.5px] bg-[#FF6A00]/65"
                  initial={{ width: 0 }} animate={{ width: "1.5rem" }}
                  transition={{ duration: 0.55, ease: E, delay: cardDelay + 0.15 }} />
                <p className="relative font-display font-light leading-none text-[#FF6A00]"
                  style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.9rem)" }}>
                  <motion.span
                    animate={isKey
                      ? { textShadow: ["0 0 0px rgba(255,106,0,0)", "0 0 26px rgba(255,106,0,0.55)", "0 0 10px rgba(255,106,0,0.22)"] }
                      : { textShadow: ["0 0 0px rgba(255,106,0,0)", "0 0 14px rgba(255,106,0,0.3)",  "0 0 0px rgba(255,106,0,0)"] }}
                    transition={{ duration: 2.2, ease: "easeOut", delay: cardDelay + 0.55, times: [0, 0.55, 1],
                      repeat: isKey ? Infinity : 0, repeatDelay: isKey ? 2.4 : 0 }}>
                    <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} startDelay={cardDelay * 1000 + 350} duration={1100} />
                  </motion.span>
                </p>
                <p className="mt-3 font-sans text-[12px] font-medium text-white/[0.9]">{s.label}</p>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-white/[0.55]">{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// §28 成效口径
function SlideMetricsMethod() {
  const rows = [
    { metric: "+100% / ~2×", label: "模型 API 调用量",
      baseline: "showroom 上线前,内部产品分析的 4 周滚动平均值。",
      result: "上线后的 4 周滚动平均值,口径、管线都不变。",
      note: "也就是 +100% / 约 2× 的简写。同一管线上线前后的对比,不是第三方基准。" },
    { metric: "87%", label: "配置步骤缩减",
      baseline: "内部「克隆即试」清单里约 7 步——从看仓库一直到接好接口。",
      result: "预置模板 + 可直接复制的 YAML,配置缩成短短一份清单。",
      note: "统计的是配置动作,不含实时 Demo 里的点击。" },
    { metric: "60%", label: "交付提速",
      baseline: "只把规格交给工程师。",
      result: "规格和代码一起交付。",
      note: "来自 3 次 showroom 发布中工程师的口头估算,不是周期看板的数据。" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-10 md:px-14 ${CANVAS}`}>
      <motion.div variants={STG} initial="hidden" animate="show" className="mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>这些数字是怎么算出来的</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-4 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.2rem)" }}>
            把基线讲清楚。
          </h2>
        </Mask>
        <motion.div variants={UP} className={`mt-7 border-t ${HAIR}`}>
          <div className={`hidden border-b ${HAIR} px-1 py-2.5 md:grid md:grid-cols-[10rem_1fr_1fr_1fr] md:gap-x-6`}>
            {["指标", "基线", "结果", "说明"].map(h => (
              <p key={h} className={`${EYE} text-white/[0.42]`}>{h}</p>
            ))}
          </div>
          <div className="divide-y divide-white/[0.08]">
            {rows.map((row, i) => (
              <motion.div key={row.metric}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: E, delay: 0.24 + i * 0.08 }}
                className="grid grid-cols-1 gap-2 px-1 py-4 md:grid-cols-[10rem_1fr_1fr_1fr] md:items-start md:gap-x-6">
                <div>
                  <p className="font-display text-[1.5rem] font-light tracking-tight text-[#FF6A00]">{row.metric}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/[0.5]">{row.label}</p>
                </div>
                <p className="font-sans text-[12.5px] leading-relaxed text-white/[0.72]">{row.baseline}</p>
                <p className="font-sans text-[12.5px] leading-relaxed text-white/[0.88]">{row.result}</p>
                <p className="font-sans text-[12px] leading-relaxed text-white/[0.55]">{row.note}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §29 设计原则
function SlidePrinciples({ reduced }: { reduced: boolean | null }) {
  const principles = [
    { n: "01", t: "设计,是那层翻译。",
      body: "在 AI 产品里,最难的从来不是模型,而是帮人想清楚:拿它能做出什么。" },
    { n: "02", t: "最好的 Demo,是「未来的你」的证据。",
      body: "先把他们产品的可用版本摆出来,再让他们直接克隆走。" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>总结 · 设计原则</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            AI 产品,不会靠一张能力清单就卖出去。
          </h2>
        </Mask>
        <motion.div variants={UP} className={`mt-9 grid border-t ${HAIR} md:grid-cols-2`}>
          {principles.map((p, i) => (
            <motion.div key={p.n}
              className={`py-8 md:px-8 ${i > 0 ? `border-t ${HAIR} md:border-l md:border-t-0` : "md:pl-0"}`}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: E, delay: 0.24 + i * 0.12 }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FF6A00]">原则 {p.n}</p>
              <p className={`mt-4 font-display text-[1.2rem] font-light leading-[1.35] tracking-[-0.01em] ${HEAD} md:text-[1.34rem]`}>{p.t}</p>
              <p className="mt-4 font-sans text-[14.5px] leading-[1.8] text-white/[0.64]">{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §30 我学到了什么
function SlideTakeaways({ reduced }: { reduced: boolean | null }) {
  const items = [
    { label: "记忆透明",     note: "星盘档案让记忆变得可读,而不是一个闷声的黑箱。" },
    { label: "分析可见",     note: "心理分析栏让你看见模型理解了什么,而不只是它说了什么。" },
    { label: "开发者可检视", note: "代码抽屉里摊开 YAML 和提示词——先看明白,再动手搭。" },
    { label: "情感边界",     note: "心理房间只是分析演示,不代表任何临床结论。" },
  ];
  return (
    <section className={`relative flex h-full flex-col justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">
        <motion.div variants={FADE}><Eye>我学到了什么</Eye></motion.div>
        <Mask delay={0.08}>
          <h2 className={`text-balance mt-5 font-display font-light tracking-[-0.018em] ${HEAD}`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.3rem)" }}>
            可见的认知,胜过能力清单。
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-5 max-w-2xl ${BODY} text-[14px] text-white/[0.68]`}>
          AI 产品真正需要的,是能打动人的时刻、看得见的认知,和可检视的系统。设计师要做的,是把模型的行为,翻译成人们能感受、能信任、也能照着搭建的体验。
        </motion.p>
        <motion.div variants={UP} className={`mt-8 grid border-t ${HAIR} sm:grid-cols-2`}>
          {items.map((it, i) => (
            <motion.div key={it.label}
              className={`border-white/[0.08] py-5 sm:px-6 ${i > 0 ? "border-t" : ""} ${i === 1 ? "sm:border-l sm:border-t-0" : ""} ${i === 3 ? "sm:border-l" : ""}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.2 + i * 0.08 }}>
              <p className={`font-sans text-[13.5px] font-medium ${HEAD}`}>{it.label}</p>
              <p className="mt-2 font-sans text-[13px] leading-[1.75] text-white/[0.62]">{it.note}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// §31 结束
function SlideClosing({ reduced }: { reduced: boolean | null }) {
  return (
    <section className={`relative flex h-full flex-col items-start justify-center overflow-hidden px-12 md:px-20 ${CANVAS}`}>
      <LivingAura reduced={reduced} />
      <motion.div variants={STG} initial="hidden" animate="show" className="relative z-10 max-w-2xl">
        <motion.div variants={FADE} className="mb-8 h-px w-12 bg-[#FF6A00]" />
        <Mask delay={0.08}>
          <h2 className={`font-display font-light tracking-[-0.02em] ${HEAD}`}
            style={{ fontSize: "clamp(2.4rem, 5.6vw, 4.6rem)" }}>
            Yuan Fang
          </h2>
        </Mask>
        <motion.p variants={UP} className={`mt-3 ${EYE} text-white/45`}>
          产品设计师 · Pratt 普瑞特艺术学院 · UW 华盛顿大学
        </motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-wrap items-center gap-5">
          <a href="https://tongyi.aliyun.com/character" target="_blank" rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-[6px] bg-[#FF6A00] px-7 py-3.5 font-sans text-[13px] font-medium text-[#0A0A0A] transition-all duration-150 hover:bg-white">
            查看线上 showroom
            <span className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/ai-character"
            className={`${EYE} text-white/45 underline underline-offset-4 decoration-white/[0.18] transition-colors hover:text-white`}>
            案例研究
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Slide renderer ───────────────────────────────────────────────────────────
function SlideRenderer({ id, reduced }: { id: SlideId; reduced: boolean | null }) {
  switch (id) {
    case "cover":            return <SlideCover reduced={reduced} />;
    case "overview":         return <SlideOverview reduced={reduced} />;
    case "problem":          return <SlideProblem reduced={reduced} />;
    case "hmw":              return <SlideHmw reduced={reduced} />;
    case "howmightwe":       return <SlideHmwStatement reduced={reduced} />;
    case "d1-title":         return <TitleSlide reduced={reduced} chapter="决策 01"
                                      title="把体验置于文档之上——并做到极致。"
                                      body="showroom 这个策略是 PM 提的——一个常见的 C 端打法。这四个房间不是随意划分的——我们选取了市场上角色模型被应用最广的四个主题:情感陪伴、心理咨询、角色克隆、IP 授权,基于此设计专属的 showroom,每个房间里的功能决策都由我来定。"
                                      kicker="用户不会因为描述就相信你——第一句话就得证明能力。" />;
    case "d1-showrooms":     return <SlideD1Showrooms reduced={reduced} />;
    case "d2-title":         return <SlideD2Title reduced={reduced} />;
    case "d2-map":           return <SlideD2Map reduced={reduced} />;
    case "heartbeat":        return <SlideHeartbeat reduced={reduced} />;
    case "heartbeat-logic":  return <SlideHeartbeatLogic reduced={reduced} />;
    case "story":            return <SlideStoryUnlock reduced={reduced} />;
    case "story-logic":      return <SlideStoryUnlockLogic reduced={reduced} />;
    case "moments":          return <SlideMoments reduced={reduced} />;
    case "moments-logic":    return <SlideMomentsLogic reduced={reduced} />;
    case "altuniv":          return <SlideAltUniv reduced={reduced} />;
    case "altuniv-logic":    return <SlideAltUnivLogic reduced={reduced} />;
    case "astro-profile":    return <SlideAstroProfile reduced={reduced} />;
    case "therapy-analysis": return <SlideTherapyAnalysis reduced={reduced} />;
    case "d3-title":         return <SlideD3Title reduced={reduced} />;
    case "inspire-continue": return <SlideInspireContinue reduced={reduced} />;
    case "code-drawer":      return <SlideCodeDrawer reduced={reduced} />;
    case "exploration":      return <SlideExploration reduced={reduced} />;
    case "how-i-worked":     return <SlideHowIWorked reduced={reduced} />;
    case "process":          return <SlideProcess reduced={reduced} />;
    case "showrooms":        return <SlideShowrooms reduced={reduced} />;
    case "showcase-live":    return <SlideShowcaseLive reduced={reduced} />;
    case "backend-before":   return <SlideBackendBefore reduced={reduced} />;
    case "backend":          return <SlideBackend reduced={reduced} />;
    case "spark-design":     return <SlideSparkDesign reduced={reduced} />;
    case "metrics":          return <SlideMetrics />;
    case "metrics-method":   return <SlideMetricsMethod />;
    case "principles":       return <SlidePrinciples reduced={reduced} />;
    case "takeaways":        return <SlideTakeaways reduced={reduced} />;
    case "closing":          return <SlideClosing reduced={reduced} />;
    default:                 return null;
  }
}

// ─── Chapter pill nav ─────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function DeckSlideScrubber({
  idx, total, onChange,
}: { idx: number; total: number; onChange: (i: number) => void }) {
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.1]" aria-hidden>
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#FF6A00]" style={{ width: `${pct}%` }} />
      </div>
      <input type="range" min={0} max={max} step={1} value={idx}
        aria-label="幻灯片位置" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ChapterPills({ current, onJump }: { current: string; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-300 ease-out ${
              on
                ? "bg-[#FF6A00] px-3 py-[3px] font-mono text-[10px] tracking-[0.1em] text-[#0A0A0A]"
                : "h-1.5 w-1.5 bg-white/[0.32] hover:bg-white/60"
            }`}
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
  enter:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  // 退出只淡出(不平移)—— 平移一个挂着实时原型 iframe 的页面最卡;纯淡出合成更便宜。
  exit:   { opacity: 0, x: 0 },
};

// ─── 竖屏提示(移动端竖屏时引导横屏)──────────────────────────────────────────
function RotateOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex h-screen flex-col items-center justify-center gap-7 bg-[#08090A] px-10 text-center">
      <svg width="78" height="78" viewBox="0 0 78 78" fill="none" aria-hidden>
        <g transform="rotate(-20 39 39)">
          <rect x="28" y="17" width="22" height="44" rx="5" stroke="#FF6A00" strokeWidth="2.5" />
          <line x1="35" y1="55" x2="43" y2="55" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <path d="M58 21 A 28 28 0 0 1 64 46" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 46 L59 44.5 M64 46 L65.7 41" stroke="#FF6A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div>
        <p className="font-display text-[1.5rem] font-light tracking-[-0.02em] text-[#F7F8F8]">请横屏观看</p>
        <p className="mx-auto mt-2.5 max-w-xs font-sans text-[13.5px] leading-relaxed text-white/55">
          这份演示是为宽屏设计的 —— 把手机横过来,体验最佳。
        </p>
      </div>
      <button type="button" onClick={onDismiss}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/80">
        仍要竖屏查看 →
      </button>
    </div>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckPresentClientZh() {
  const reduced = useReducedMotion();
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const total    = SLIDES.length;
  const slide    = SLIDES[idx];
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
    // 从聚焦的原型 iframe 里转发出来的翻页键,会以这个事件到达。
    const nav = (e: Event) => paginate((e as CustomEvent<number>).detail);
    window.addEventListener("keydown", h);
    window.addEventListener("deck-nav", nav as EventListener);
    return () => {
      window.removeEventListener("keydown", h);
      window.removeEventListener("deck-nav", nav as EventListener);
    };
  }, [next, prev, paginate]);

  // 移动端竖屏 → 引导横屏(deck 是宽屏格式)。
  const [portrait, setPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 820px) and (pointer: coarse)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const navChrome = "text-white/[0.82] hover:text-white";
  const navMeta   = "text-white/[0.5]";

  if (portrait && !dismissed) return <RotateOverlay onDismiss={() => setDismissed(true)} />;

  return (
    <div className="font-alibaba relative h-screen select-none overflow-hidden bg-[#08090A]">

      {/* Progress line */}
      <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
        <motion.div className="h-full bg-[#FF6A00]"
          initial={false} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: E }} />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090A]/95 px-6 md:px-10">
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character"
            className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-150 ${navChrome}`}>
            ← 案例研究
          </Link>
          <span className={`hidden font-mono text-[10px] uppercase tracking-[0.16em] md:inline ${navMeta}`}>
            {slide.chapter}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/work/ai-character/deck-present"
            className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-150 md:inline ${navChrome}`}>
            EN
          </Link>
          <span className={`hidden font-mono text-[10px] md:inline ${navMeta}`}>剩余约 {minsLeft} 分钟</span>
          <span className={`font-mono text-[10px] tabular-nums ${navMeta}`}>
            {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide area */}
      <main className="relative h-full min-h-0 select-text overflow-hidden">
        <AnimatePresence custom={dir} initial={false} mode="wait">
          <motion.div key={slide.id} custom={dir}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : "enter"}
            animate={reduced ? undefined : "center"}
            exit={reduced ? undefined : "exit"}
            transition={{ duration: 0.3, ease: E }}
            className="absolute inset-x-0 bottom-14 top-14 will-change-[opacity,transform]">
            <SlideRenderer id={slide.id} reduced={reduced} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Click zones */}
      <button type="button" aria-label="上一页" onClick={prev} disabled={idx === 0}
        className="fixed bottom-14 left-0 top-14 z-30 hidden w-[10%] cursor-w-resize disabled:pointer-events-none md:block" />
      <button type="button" aria-label="下一页" onClick={next} disabled={idx === total - 1}
        className="fixed bottom-14 right-0 top-14 z-30 hidden w-[10%] cursor-e-resize disabled:pointer-events-none md:block" />

      {/* Footer */}
      <footer className="absolute inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#08090A]/95">
        <div className="flex items-center gap-3 px-4 py-3 md:gap-5 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0}
            className={`flex shrink-0 items-center gap-1.5 rounded-[6px] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-150 disabled:opacity-20 md:px-3 ${navChrome}`}>
            <Kbd>←</Kbd> 上一页
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-stretch justify-center gap-2.5">
            <DeckSlideScrubber idx={idx} total={total} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} onJump={jump} />
            </div>
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1}
            className={`flex shrink-0 items-center gap-1.5 rounded-[6px] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-150 disabled:opacity-20 md:px-3 ${navChrome}`}>
            下一页 <Kbd>→</Kbd>
          </button>
        </div>
      </footer>
    </div>
  );
}
