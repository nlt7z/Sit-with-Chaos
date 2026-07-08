"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// ─── Uber-Base tokens · white canvas, near-black ink, Liner dark-green accent ───
const C = {
  page:       "#FFFFFF",
  ink:        "#0A0A0A", // headlines
  body:       "#2E2E2E", // body
  muted:      "#6E6E6E", // metadata
  subtle:     "#9A9A9A", // labels / eyebrow
  faint:      "#C4C4C4",
  line:       "rgba(0,0,0,0.10)",
  lineMid:    "rgba(0,0,0,0.14)",
  lineStrong: "rgba(0,0,0,0.22)",
  green:      "#14532D", // Liner dark-green accent
} as const;

const SANS =
  "var(--font-inter), 'PingFang SC', 'Hiragino Sans GB', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const E = [0.16, 1, 0.3, 1] as const;
const LOGO = "/assets/liner/linerlogo.png";

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 44 : -44 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -44 : 44 }),
};

// ─── Slide registry ────────────────────────────────────────────────────────────
const SLIDES = [
  { id: "cover",         chapter: "封面" },
  { id: "background",    chapter: "背景" },
  { id: "competitive",   chapter: "研究" },
  { id: "interviews",    chapter: "研究" },
  { id: "f-factcheck",   chapter: "洞察" },
  { id: "f-sharing",     chapter: "洞察" },
  { id: "f-fragmented",  chapter: "洞察" },
  { id: "f-revision",    chapter: "洞察" },
  { id: "f-coordination",chapter: "洞察" },
  { id: "f-personal",    chapter: "洞察" },
  { id: "synthesis",     chapter: "洞察" },
  { id: "reframe",       chapter: "问题" },
  { id: "concept",       chapter: "策略" },
  { id: "concept-ai",    chapter: "策略" },
  { id: "stages",        chapter: "策略" },
  { id: "iter-intro",    chapter: "迭代" },
  { id: "v1",            chapter: "迭代" },
  { id: "v2",            chapter: "迭代" },
  { id: "v3",            chapter: "迭代" },
  { id: "chat-layouts",  chapter: "迭代" },
  { id: "usability",     chapter: "迭代" },
  { id: "final-pick",    chapter: "迭代" },
  { id: "final-setup",   chapter: "成品" },
  { id: "final-explore", chapter: "成品" },
  { id: "final-curate",  chapter: "成品" },
  { id: "final-align",   chapter: "成品" },
  { id: "validated",     chapter: "成品" },
  { id: "future",        chapter: "成品" },
  { id: "impact",        chapter: "成效" },
  { id: "metrics",       chapter: "成效" },
  { id: "closing",       chapter: "结语" },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─── Primitives (typographic only — no cards, no filled boxes) ─────────────────
function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: E, delay }}
    >
      {children}
    </motion.div>
  );
}

function Eye({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="block h-[6px] w-[6px] shrink-0" style={{ background: C.green }} />
      <span aria-hidden className="block h-px w-6 shrink-0" style={{ background: C.lineStrong }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: C.subtle }}>{children}</p>
    </div>
  );
}

function G({ children }: { children: ReactNode }) {
  return <span style={{ color: C.green, fontWeight: 600 }}>{children}</span>;
}

function Rule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={className} style={{ height: 1, background: C.line }} />;
}

function Slide({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col justify-center px-8 py-10 md:px-16">
        {children}
      </div>
    </div>
  );
}

function H({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-semibold leading-[1.14] tracking-[-0.02em] ${className}`} style={{ color: C.ink, fontFamily: SANS, fontSize: "clamp(1.6rem, 3.1vw, 2.4rem)" }}>
      {children}
    </h2>
  );
}

function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[15px] leading-[1.8] md:text-[16px] ${className}`} style={{ color: C.body }}>{children}</p>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.green }}>{children}</p>;
}

function Quote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: C.green }}>
      <p className="text-[14px] leading-[1.75] md:text-[15px]" style={{ color: C.body }}>「{children}」</p>
      {cite ? <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.subtle }}>{cite}</p> : null}
    </div>
  );
}

function Shot({ src, alt, bg = "#FFFFFF" }: { src: string; alt: string; bg?: string }) {
  return (
    <figure className="overflow-hidden rounded-md" style={{ background: bg }}>
      <Image src={src} alt={alt} width={1600} height={1100} className="h-auto w-full" />
    </figure>
  );
}

function DeckVideo({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="overflow-hidden rounded-md border" style={{ borderColor: C.line, background: "#000" }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video src={src} poster={poster} controls muted loop autoPlay playsInline className="block h-auto w-full" />
    </div>
  );
}

// A live prototype (left) whose scene is deep-linked (via postMessage) by the
// feature you click on the right — the same walkthrough the case study uses.
type PScene = { scene: string; label: string; title: string; body: string; why?: string };

function PrototypeWalk({ src, scenes }: { src: string; scenes: PScene[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.42);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const NW = 1440;
  const NH = 900;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w > 0) setScale(Math.min(1, w / NW));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "liner-ready" && e.source === iframeRef.current?.contentWindow) setReady(true);
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    if (!ready) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "liner-goto", scene: scenes[active].scene }, "*");
  }, [active, ready, scenes]);

  const s = scenes[active];
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[2fr_0.82fr] lg:gap-8">
      {/* live prototype — always on the left */}
      <div>
        <div ref={wrapRef} className="relative w-full overflow-hidden rounded-md border" style={{ borderColor: C.line, background: "#141416", aspectRatio: `${NW} / ${NH}` }}>
          <iframe
            ref={iframeRef}
            src={src}
            title="Liner 原型"
            loading="lazy"
            onLoad={() => setReady(true)}
            style={{ width: NW, height: NH, border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
            className="absolute left-0 top-0 block"
          />
        </div>
      </div>

      {/* feature stepper — click to drive the prototype */}
      <div>
        <div className="divide-y" style={{ borderColor: C.line }}>
          {scenes.map((sc, i) => (
            <button key={i} type="button" onClick={() => setActive(i)} className="block w-full py-2.5 text-left transition-opacity" style={{ borderColor: C.line, opacity: i === active ? 1 : 0.5 }}>
              <div className="flex items-baseline gap-2.5">
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: C.green }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.subtle }}>{sc.label}</span>
              </div>
              <p className="mt-1 text-[14px] font-medium leading-snug" style={{ color: C.ink }}>{sc.title}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 border-l-2 pl-4" style={{ borderColor: C.green }}>
          <p className="text-[13.5px] leading-[1.7]" style={{ color: C.body }}>{s.body}</p>
          {s.why ? <p className="mt-2 text-[12.5px] leading-[1.6]" style={{ color: C.muted }}><span className="font-semibold" style={{ color: C.green }}>为什么 · </span>{s.why}</p> : null}
        </div>
      </div>
    </div>
  );
}

const FINDING_IMG: Record<string, string> = {
  "f-factcheck": "/assets/liner/insight fact checking.png",
  "f-sharing": "/assets/liner/insight sharing boundaries.png",
  "f-fragmented": "/assets/liner/insight1.png",
  "f-revision": "/assets/liner/insight revision.png",
  "f-coordination": "/assets/liner/insight social friction.png",
  "f-personal": "/assets/liner/liner insight.png",
};

const WALK_V1: PScene[] = [
  { scene: "chat", label: "Chat", title: "AI 私聊与 Group Chat,同屏", body: "私密的 AI 聊天(可开多个标签页)与唯一的一条 Group Chat 并排出现,个人探索与团队共享同时在场。" },
  { scene: "share", label: "Chat", title: "把一条消息分享到 Group", body: "在私密聊天里点『分享到团队』,选中 Group Chat 并确认,这个回答就成了团队能接力的共享工作。" },
];

const WALK_V2: PScene[] = [
  { scene: "group", label: "Group", title: "Group Chat 有更新", body: "Group Chat 浮现更新:改了什么、什么需要回复,以及你离开时队友加了什么。" },
  { scene: "group", label: "Group", title: "共享知识卡片", body: "你把一个发现作为卡片分享,结构固定:内容、它的引用,以及它的置信度。队友在卡上回应与回复。" },
  { scene: "group", label: "Group", title: "只有卡片:我们后来修正的一个判断", body: "v2 全押结构:没有自由文本框,团队只能发卡片、看不到原始 AI 输出。它让知识保持干净,却也切掉了团队赖以生存的日常来回。最终版把对话带了回来。" },
];

const WALK_V3: PScene[] = [
  { scene: "workspace", label: "Workspace", title: "项目工作区", body: "里程碑、任务、队友与已连接工具,在你打开任何文档之前。" },
  { scene: "authors", label: "Author", title: "看谁写了什么", body: "作者模式按队友给文本上色,你能实时看到谁在编辑哪一部分。" },
  { scene: "focus", label: "Focus", title: "Focus 模式", body: "单独选中它,Focus 清空侧边面板,进入无干扰写作。" },
  { scene: "group", label: "Group", title: "Group Chat 里的两层:私人更新 + 团队摘要", body: "上面的 update 卡片是私人的——Liner AI 只挑出与你相关的更新,只有你看得见(个人化视角);下面 Liner AI bot 发的是团队的——定时更新的群组摘要,所有人都看得见(团队视角)。个人与团队,在同一个 Group Chat 里分层。" },
];

// 成品按用户旅程分四段来讲;每段的功能可以跨阶段重复,同一个功能在不同阶段承担不同意义。
const WALK_SETUP: PScene[] = [
  { scene: "project", label: "工作区", title: "项目工作区", body: "每个项目都从一个工作区打开:任务、队友,以及 Google Drive、Zotero 等已连接资源。Liner AI 把任务卡分给团队,也自己领走一些——默默负责引用核查、让群组摘要保持最新。", why: "协调过去落在一个人身上;这里 AI 在幕后扛着,没人需要追状态。" },
  { scene: "files", label: "左 · 来源", title: "接入来源与文献", body: "开项目时,就把已保存的论文、Google Drive 与 Zotero 里的资料接进左侧面板,材料一次就位。", why: "Set up 就是把人、文件、文献管理器都拉到同一处。" },
];

const WALK_EXPLORE: PScene[] = [
  { scene: "files", label: "左 · 来源", title: "所有来源在一个面板", body: "你保存的论文都待在左侧面板。打开一篇,就在你的草稿旁边读它。", why: "工作流曾是碎裂的,所以阅读与写作如今共用同一个界面。" },
  { scene: "tldr", label: "左 · 来源", title: "每个来源的 TLDR", body: "悬停任一来源,内联弹出它的 TLDR,让你不打开论文就能筛选该不该细读。", why: "探索要快速分流:先判断哪一篇值得花时间。" },
  { scene: "selection", label: "Editor · 内联 AI", title: "选中文本,就地行动", body: "高亮一行,弹出的浮层给出 Cite、Comment、Improve 或 Ask AI。助手就在文本里响应你。", why: "AI 只做辅助,由你来决定;它从不擅自行动。" },
  { scene: "aichat", label: "右 · AI 私聊", title: "私密 AI,独自探索", body: "只用你的私密 AI 私聊来阅读、追问与起草,此刻什么都还没共享——这就是向 Liner AI 提问的地方。", why: "探索是独自的:先在私密空间里把想法跑通。" },
  { scene: "focus", label: "Editor · Focus", title: "Focus 专注写作", body: "一键清空侧边面板,进入无干扰起草;引用与评论图层保持可组合。", why: "探索是独自的工作,所以起草也有自己的一间安静房间。" },
];

const WALK_CURATE: PScene[] = [
  { scene: "citation", label: "Editor · 引用", title: "每个论断追溯到来源", body: "开启引用,每个论断都带上标记。悬停能看到引文与来源;点进去精确落到那一段,在完整语境里看它,而不是被剥离的片段。", why: "提炼,是把一个你能站得住的结论提上去,所以来源要始终跟着结论、且能就地核查。" },
  { scene: "share", label: "右 · Chat", title: "私密 AI,再分享到 Group", body: "你的私密 AI 聊天就在 Group Chat 旁边。把一个提炼过的回答分享过去,它的来源与引用会一并带过去。是否分享你的提示由你决定。", why: "团队分享的是产出,不是私密 AI 记录;Liner 因此成为共享的场所。" },
  { scene: "both", label: "右 · 两栏", title: "两栏并排,把结论平移过去", body: "AI 私聊与 Group Chat 并排,选中两个,把一个提炼过的回答平移到共享一侧,而不丢失你的位置。", why: "提炼的关键动作,就是这一步『私密 → 共享』的平移。" },
];

const WALK_ALIGN: PScene[] = [
  { scene: "comments", label: "Editor · 审阅", title: "验证、质疑或修订", body: "验证仍由人来做。打开一条边注,把论断对着它出处的段落读,并标记为 Verified,一个具名、可见、由人负责的状态。", why: "回应「谁写了、谁审了」的问责,团队要一个『有人审阅过』的信号,所以由人、而非模型,拥有 Verified。" },
  { scene: "citation", label: "Editor · 核对引用", title: "点开引用,回到原文核对", body: "审阅者点任意标记,回到被引用的原文那一段核对;AI 也在后台核对每一条引用是否仍然成立。", why: "对齐要靠证据:结论对着来源被验证,而不是凭信任。" },
  { scene: "group", label: "右 · 群组", title: "卡片与对话并存", body: "Group Chat 把审阅过的知识卡片、一场真实的对话,以及 AI 关于「你离开时改了什么」的幕后摘要混在一起。两个输入框,两种意图。", why: "v2 的「只有卡片」太僵;团队需要交谈,所以结构与对话并肩而立。" },
];

const CHAT_SWITCH: PScene[] = [
  { scene: "aichat", label: "私密", title: "只选 AI 私聊", body: "单独选中你的私密 AI 聊天,用来探索与起草,此刻什么都还没共享。" },
  { scene: "group", label: "共享", title: "只选 Group Chat", body: "单独选中 Group Chat,专注于团队已审阅、已共享的知识。" },
  { scene: "both", label: "两者", title: "两个并排,同时看", body: "两个都选,把一个回答平移过去而不丢失位置,正是 Plan B + C 的行为。" },
];

// ─── Content data ──────────────────────────────────────────────────────────────
const FACTS: [string, string][] = [
  ["角色", "用户研究 · 交互与 UI 设计"],
  ["周期", "6 个月 · 2026 年 1–6 月"],
  ["团队", "2 PM · 2 导师 · 4 设计师"],
];

const FINDINGS: { n: string; title: string; body: ReactNode; pain: string; quote?: string; cite?: string; id: SlideId; first?: boolean }[] = [
  {
    id: "f-factcheck", n: "01", first: true,
    title: "事实核查,始终由人来做",
    body: <>AI 支持起草,但<G>解读与事实核查始终归人所有</G>,但是反复核查很耗时。</>,
    pain: "AI 的结果不被当作『最终』,于是核查不断累积;有人在一次严重错误后就彻底弃用了 AI。",
    quote: "我不会把它当成最终产出,但它帮我把思路带起来。",
    cite: "P5",
  },
  {
    id: "f-sharing", n: "02",
    title: "分享是有边界的",
    body: <>团队分享的是<G>产出</G>,而不是私密的 AI 记录;并且他们想要一个「有人审阅过」的信号。人们希望把结果分享出去,同时把自己摸索的 AI 过程留给自己。</>,
    pain: "人们想分享结果,却要让 AI 过程保持私密,这两者必须清楚地分开。",
    quote: "AI 提示很有用,但我不想把提示或记录分享给队友。文件、信息、活动历史应当完全透明。这两者要清楚地分开。",
    cite: "P4, P5, P6",
  },
  {
    id: "f-fragmented", n: "03",
    title: "工作流是碎裂的",
    body: <>一个项目要在<G>许多互不相通、而且缓慢的工具</G>之间搬运数据。引用链接在 Word 与 Google Docs 之间断裂,综合要靠截图与复制粘贴,大图文件靠邮件传来传去、陷入版本混乱。</>,
    pain: "在工具之间搬运,是研究者每天都在付出的隐性成本。",
    quote: "当我把它挪到 Google Docs 给团队共享时,所有引用链接都断了。",
    cite: "P4, P5, P6",
  },
  {
    id: "f-revision", n: "04",
    title: "修订是「状态管理」问题,还带着编辑问题",
    body: <>起草是独自的,修订却<G>完全走向协作</G>,于是它变成了追踪「谁审了哪一部分」的问题。多人直接编辑时,团队会弄不清谁审过哪段;返工增多,因为审阅者要重读整份文档,而「审阅状态」不可见,让周期变慢。</>,
    pain: "「审阅状态」不可见,是拖慢协作周期的根源。",
    quote: "起草是独立的,但修订会 100% 变成协作,直接编辑很快就带出一个问题:『这部分谁已经审过了?』",
    cite: "P6",
  },
  {
    id: "f-coordination", n: "05",
    title: "协调落在一个人身上",
    body: <>催促、跟进、问责,团队协作真正卡住的地方,全压在那个<G>自愿协调的人</G>身上。追人、记谁欠什么、让状态保持最新,都发生在平台之外;于是一个人扛着,会议之间动力就停滞。</>,
    pain: "这份隐形的协调负担,后来正是我们交给 AI 去扛的那一份。",
  },
  {
    id: "f-personal", n: "06",
    title: "Liner 是团队工作流里的个人工具",
    body: <>人们各自打开 Liner。它<G>还不是团队协作的主场</G>。团队的共享上下文在别处,于是 Liner 的价值停留在个人层面,无法在群体之间累积。</>,
    pain: "在 Liner 里产生的内容停留在 Liner 里,用户不会主动把它分享出去,于是价值无法在群体之间累积。",
  },
];

const STAGES: [string, string, string][] = [
  ["01", "建立 · Set up", "开一个项目,然后拉进队友、文件与文献管理器。"],
  ["02", "探索 · Explore", "独自工作:在一个私密工作区里阅读、高亮,并向 Liner AI 提问。"],
  ["03", "提炼 · Curate", "把一个你能站得住的结论,连同它的来源一起,提升到共享空间。"],
  ["04", "对齐 · Align", "队友验证、质疑或修订这个论断,AI 则核对每一条引用是否成立。"],
];

const CHAT_PLANS: [string, string, string][] = [
  ["Plan A", "/assets/liner/ideation/v3-plan a-1.jpg", "两条线堆在 1 个可调节的列里。测试中人们觉得内容显示太少,而两个输入框读起来视觉重复。"],
  ["Plan B", "/assets/liner/ideation/v3-plan b.jpg", "两个面板同时显示。但四个 column 会有些多余、看起来很复杂,研究人员天生抗拒这样的排版。"],
  ["Plan C", "/assets/liner/ideation/v3-plan c-2.jpg", "在两个面板之间切换,选中一个面板单独看。但这样在分享时会失去连续性。"],
];

const USABILITY: [string, string][] = [
  ["14+", "参与者,华盛顿大学硕士生,研究经验各异。"],
  ["3 年+", "平均研究经验,横跨学界与业界。"],
  ["~20 分钟", "每场有主持的测试平均时长。"],
];

const FUTURE: [string, string][] = [
  ["把闭环接回文档", "让共享的洞察能反作用于原文:谁、在什么时机,把 group 里的结论写回论文,这条回流,是我接下来要设计的流程。"],
  ["为「分割」做引导", "私密与共享的边界是整个想法的核心,但它需要被教会。我会加入首次使用引导,免得有人分享错了东西。"],
  ["并发的 AI 编辑", "多人同时用 AI 编辑,需要一套分区、分支再合并的模型,像 pull request。我界定了范围,但没有构建。"],
  ["超越研究,走向消费级规模", "私密 → 提炼 → 共享 的边界并不专属论文。它和「草稿 → 发布」同形。这就是这个想法从研究工具走向十亿用户信息流的方式。"],
  ["更深的集成", "今天已经连接了 Google Drive 与 Zotero。下一步是与文献管理器的双向同步,用户排名最高的一项。"],
];

const METRICS: { label: string; goal: string; text: string; group: "leading" | "lagging"; north?: boolean }[] = [
  { label: "分享到 Group 率", goal: "新交互模式", group: "leading", north: true, text: "私密 AI 回答里,被人提炼进共享空间的比例。这是「私密 → 共享」交接是否奏效的、最清晰的单一信号。" },
  { label: "邀请率", goal: "新团队受众", group: "leading", text: "有人把队友拉进来的项目比例,产品自身的增长回路,也是通往新受众的路径。" },
  { label: "团队激活", goal: "新团队受众", group: "lagging", text: "拥有超过一名成员的项目数。协作到底有没有被真正打开,还是 Liner 仍旧是个单人工具?" },
  { label: "功能驱动的升级", goal: "留下来的理由", group: "lagging", text: "可归因于协作功能的订阅与升级。新模式是否在转化,而不只是被使用。" },
];

// 四阶段旅程指示条 — 让「成品」四页读成一张 user journey map
function JourneyBar({ active }: { active: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      {STAGES.map(([n, name], i) => (
        <span key={n} className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold tracking-[0.06em]" style={{ color: i === active ? C.green : C.faint }}>
            {n} {name}
          </span>
          {i < STAGES.length - 1 ? <span aria-hidden style={{ color: C.faint }}>→</span> : null}
        </span>
      ))}
    </div>
  );
}

// ─── Slide renderer ────────────────────────────────────────────────────────────
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":
      return (
        <Slide>
          <Rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Liner" className="h-7 w-auto" />
          </Rise>
          <Rise delay={0.08} className="mt-8"><Eye>Liner · AI Scholar · 案例研究</Eye></Rise>
          <Rise delay={0.14} className="mt-5">
            <h1 className="font-semibold leading-[1.08] tracking-[-0.03em]" style={{ color: C.ink, fontFamily: SANS, fontSize: "clamp(2.2rem, 5vw, 3.7rem)" }}>
              为深度研究打造的<G>协作工作流</G>
            </h1>
          </Rise>
          <Rise delay={0.22} className="mt-6">
            <P className="max-w-2xl">Liner 的 AI 为单人而建,但深度研究是团队协作,论文、综述、整个研究,都由群体推进。难点在于:今天的 AI 大多是私密的,而团队需要一层<G>每条来源都可追溯的共享智能</G>。这个项目,设计的正是如何让两者保持平衡。</P>
          </Rise>
          <Rise delay={0.3} className="mt-9">
            <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-5 border-t pt-6 sm:grid-cols-3" style={{ borderColor: C.line }}>
              {FACTS.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.green }}>{k}</dt>
                  <dd className="mt-2 text-[13px] leading-[1.5]" style={{ color: C.body }}>{v}</dd>
                </div>
              ))}
            </dl>
          </Rise>
        </Slide>
      );

    case "background":
      return (
        <Slide>
          <Rise><Eye>背景 · Liner 今天,以及它的走向</Eye></Rise>
          <Rise delay={0.06} className="mt-5"><H className="max-w-3xl">一个为单人而建的工具</H></Rise>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            <Rise delay={0.12}>
              <figure className="overflow-hidden rounded-md" style={{ background: "#FFFFFF" }}>
                <Image src="/assets/liner/liner introduction.png" alt="Liner AI,用于发现、分析与组织学术内容的 AI 研究工具" width={1400} height={1000} className="mx-auto h-auto max-h-[46vh] w-auto max-w-full" />
              </figure>
            </Rise>
            <Rise delay={0.18}>
              <div className="space-y-4">
                <P>Liner 是一款支持深度研究的 AI 工具,通过 AI 检索、引用与综合,帮助用户发现、分析并组织学术内容。它拥有 <G>1200 万+ 用户</G>,位列 web AI 前 20(a16z),但它为一个人而建。研究很少独自发生,于是 Liner 委托我们设计这层协作,一次商业押注,三个目标:<G>引入新的交互模式</G>、<G>打开新的团队受众</G>、<G>给现有用户更多留下来的理由</G>;而且不能稀释人们已经依赖的、快速而私密的 AI 体验。</P>
                <P>早期我们最想知道的是:研究者今天到底怎么用 AI?协作在哪里崩坏?人们又想如何一起工作?为回答它们,我做了一次专家访谈、一份竞品分析,以及两轮用户访谈。</P>
              </div>
            </Rise>
          </div>
        </Slide>
      );

    case "competitive":
      return (
        <Slide>
          <Rise><Eye>研究 · 竞品分析</Eye></Rise>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <Rise delay={0.08}>
              <figure className="overflow-hidden rounded-md">
                <Image src="/assets/liner/competitiveanalysis.jpg" alt="沿研究生命周期铺开的竞品扫描" width={1764} height={1622} className="mx-auto h-auto max-h-[48vh] w-auto max-w-full" />
              </figure>
            </Rise>
            <Rise delay={0.16}>
              <div className="space-y-4">
                <H>协作在写作与评审最活跃</H>
                <P>学术协作不是共同编辑一份文档。它流经若干阶段:发现文献、共同解读、起草论点、按反馈修订。所以我把工具铺在这条研究生命周期上,观察协作与 AI 支持究竟如何运作。</P>
                <P>结论是:协作在写作与评审最活跃,而在解读与 AI 辅助修订处<G>转为个体化</G>。那道缝隙,正是我们看到的、为 Liner 未来协作工作流而存在的设计机会。</P>
              </div>
            </Rise>
          </div>
        </Slide>
      );

    case "interviews":
      return (
        <Slide>
          <Rise><Eye>研究 · 专家与用户访谈</Eye></Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">两轮访谈,11 位研究者</H></Rise>
          <div className="mt-7 max-w-3xl">
            <Rise delay={0.14}>
              <Label>访谈</Label>
              <Rule className="my-3" />
              <P>我们分两轮访谈了 11 位研究者。前 7 位通过自有人脉招募,让我们看见研究者<G>真实的工作方式,以及协作在哪里断裂</G>;后 4 位是 Liner 活跃用户,告诉我们上手之后仍会卡壳的地方,并帮我们排出接下来该做什么。</P>
            </Rise>
            {/* 两类目标用户 — 暂时隐藏,保留以便日后恢复
            <Rise delay={0.2} className="mt-8">
              <Label>两类目标用户</Label>
              <Rule className="my-3" />
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[15px] font-semibold md:text-[16px]" style={{ color: C.green }}>学术研究团队</span>
                    <span className="rounded-full border px-2 py-[2px] text-[10px] font-semibold tracking-[0.08em]" style={{ borderColor: C.green, color: C.green }}>新用户</span>
                  </div>
                  <P className="mt-1.5">与导师一起写论文,需要清晰的来源归属,以及从收集来源到写作的顺畅路径。</P>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="text-[15px] font-semibold md:text-[16px]" style={{ color: C.green }}>研究型知识工作者</span>
                    <span className="rounded-full border px-2 py-[2px] text-[10px] font-semibold tracking-[0.08em]" style={{ borderColor: C.green, color: C.green }}>原有用户 · 用 Liner 读文献</span>
                  </div>
                  <P className="mt-1.5">硕博生或实验室成员,想要一个存放零散材料与 AI 产出、且可信可分享的共享空间。</P>
                </div>
              </div>
            </Rise>
            */}
          </div>
        </Slide>
      );

    case "f-factcheck":
    case "f-sharing":
    case "f-fragmented":
    case "f-revision":
    case "f-coordination":
    case "f-personal": {
      const f = FINDINGS.find((x) => x.id === id)!;
      const fImg = FINDING_IMG[f.id];
      return (
        <Slide>
          <Rise>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.green }}>{f.n}</span>
              <Eye>{f.first ? "综合 · 我们发现了什么" : "洞察"}</Eye>
            </div>
          </Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">{f.title}</H></Rise>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <Rise delay={0.16}>
              <figure className="mx-auto overflow-hidden rounded-md" style={{ background: "#FFFFFF" }}>
                <Image src={fImg} alt={f.title} width={1400} height={1300} className="mx-auto h-auto max-h-[46vh] w-auto max-w-full" />
              </figure>
            </Rise>
            <Rise delay={0.22}>
              <div className="space-y-5">
                <P className="!text-[16px] md:!text-[17px]">{f.body}</P>
                <p className="text-[13.5px] leading-[1.7]" style={{ color: C.muted }}>
                  <span className="font-semibold" style={{ color: C.green }}>痛点 · </span>{f.pain}
                </p>
                {f.quote ? <Quote cite={f.cite}>{f.quote}</Quote> : null}
              </div>
            </Rise>
          </div>
        </Slide>
      );
    }

    case "synthesis":
      return (
        <Slide>
          <Rise><Eye>综合 · 从六条观察,到一个判断</Eye></Rise>
          <Rise delay={0.08} className="mt-5">
            <div className="flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1.5">
              {FINDINGS.map((f, i) => (
                <span key={f.id} className="flex items-center gap-2">
                  <span className="text-[12px] leading-snug" style={{ color: C.muted }}>{f.title}</span>
                  {i < FINDINGS.length - 1 ? <span aria-hidden style={{ color: C.faint }}>·</span> : null}
                </span>
              ))}
            </div>
          </Rise>
          <Rise delay={0.16} className="mt-7">
            <p className="max-w-4xl font-medium leading-[1.4] tracking-[-0.01em]" style={{ color: C.ink, fontSize: "clamp(1.3rem,2.8vw,1.9rem)" }}>
              六条痛点其实在说同一件事:研究者的<G>私密探索</G>与团队的<G>问责协作</G>纠缠在了一起,AI 把思考留给个人,团队却需要一层可追溯、可问责的共享知识。
            </p>
          </Rise>
          <Rise delay={0.26} className="mt-6">
            <P className="max-w-2xl">所以问题不是「再加一个团队功能」,而是<G>设计那条边界</G>,这把我们带到了下一页。</P>
          </Rise>
        </Slide>
      );

    case "reframe":
      return (
        <Slide>
          <Rise><Eye>问题 · 重构</Eye></Rise>
          <Rise delay={0.1} className="mt-8">
            <p className="max-w-4xl border-l-2 pl-6 font-medium leading-[1.32] tracking-[-0.01em]" style={{ borderColor: C.green, color: C.ink, fontSize: "clamp(1.5rem,3.4vw,2.3rem)" }}>
              如何让 AI 研究工具既支持<G>私密、探索式</G>的思考,又能实现<G>透明、可问责</G>的团队协作?
            </p>
          </Rise>
        </Slide>
      );

    case "concept":
      return (
        <Slide>
          <Rise><Eye>旅程设计 · Liner Collective Intelligence</Eye></Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">不是聊天室,而是私密与共享之间的一道边界</H></Rise>
          <Rise delay={0.16} className="mt-6">
            <div className="max-w-3xl space-y-4">
              <P>今天,Liner 里所有 AI 生成的内容都能对应到它所引用的文献,<G>AI 已经是可追溯的</G>。但在团队里,这还不够。</P>
              <P>研究者不想分享他们的思考。他们想分享的,是<G>自己能站得住的结论</G>。今天这个交接意味着离开工具:粘进 Google Docs、在 Slack 丢个链接,引用就断了,也没人说得清什么被验证过。</P>
              <P>所以我设计的不是一个聊天室,而是一个私密工作区与一个共享工作区之间的<G>那道边界</G>,一段旅程,分成四个阶段。</P>
            </div>
          </Rise>
        </Slide>
      );

    case "concept-ai":
      return (
        <Slide>
          <Rise><Eye>旅程设计 · AI 的角色</Eye></Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">在团队里,AI 不再是队友,而是一个<G>幕后角色</G></H></Rise>
          <Rise delay={0.16} className="mt-6">
            <div className="max-w-3xl space-y-4">
              <P>这个重新定义由我提出,而且直接来自研究:团队真正的摩擦不在工作本身,而在于<G>总有一个人在做 glue work</G>,那份把群体黏合在一起、却又隐形的协调劳动。</P>
              <P>所以在团队语境里,我把 AI 重塑成一个幕后角色:它整合资源、发布任务与团队摘要,并接管原本压在一个人身上的协调。它<G>从不替你起草或做决定</G>;它承担那些繁琐,好让人类专注去做判断。</P>
            </div>
          </Rise>
        </Slide>
      );

    case "stages":
      return (
        <Slide>
          <Rise><Eye>旅程设计 · 四个阶段</Eye></Rise>
          <Rise delay={0.1} className="mt-6">
            <div className="max-w-3xl divide-y" style={{ borderColor: C.line }}>
              {STAGES.map(([n, name, text]) => (
                <div key={name} className="flex items-baseline gap-5 py-4" style={{ borderColor: C.line }}>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.green }}>{n}</span>
                  <div>
                    <p className="text-[16px] font-semibold" style={{ color: C.ink }}>{name}</p>
                    <p className="mt-1 text-[14px] leading-[1.65]" style={{ color: C.body }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rise>
        </Slide>
      );

    case "iter-intro":
      return (
        <Slide>
          <Rise><Eye>迭代与决策</Eye></Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">从个人工具,到团队工作流</H></Rise>
          <Rise delay={0.16} className="mt-6">
            <div className="max-w-3xl space-y-4">
              <P>v1 与 v2 更多是<G>方向探索</G>,粗糙的、vibe coding 的原型,用来验证一个想法是否成立;到 v3 我才<G>连上 Figma MCP</G>,直接从 Liner 的设计系统生成原型,开始打磨 UI。</P>
            </div>
          </Rise>
          <Rise delay={0.24} className="mt-5">
            <div className="max-w-3xl divide-y" style={{ borderColor: C.line }}>
              {[
                ["v1", "Explore · 探索", "AI 应当是私人的;分享给团队的,是内容本身。"],
                ["v2", "Align · 对齐", "共享一侧做成知识卡片:带置信度,团队一起讨论、审阅。"],
                ["v3", "Set up + Curate · 建立与提炼", "关注工作区,并让「私密→共享」的提炼交接(选中即展开)成形。"],
              ].map(([v, stage, text]) => (
                <div key={v} className="flex items-baseline gap-4 py-2.5" style={{ borderColor: C.line }}>
                  <span className="w-7 shrink-0 text-[12px] font-semibold" style={{ color: C.green }}>{v}</span>
                  <span className="w-[34%] shrink-0 text-[13px] font-medium" style={{ color: C.ink }}>{stage}</span>
                  <span className="flex-1 text-[13px] leading-[1.6]" style={{ color: C.body }}>{text}</span>
                </div>
              ))}
            </div>
          </Rise>
        </Slide>
      );

    case "v1":
      return (
        <Slide>
          <Rise><Label>v1 · 私人阅览室 vs 团队 Group Chat</Label></Rise>
          <Rise delay={0.05} className="mt-2.5">
            <P className="max-w-3xl !text-[14.5px]">v1 让 Liner 保持单人:带标签页的私密 AI 聊天 + 唯一的一条 Group Chat。<G>取舍 · </G>先把 AI 对话本身做对,而不是硬贴一个团队信息流。</P>
          </Rise>
          <Rise delay={0.12} className="mt-5"><PrototypeWalk src="/assets/liner/prototypes/v1-dark.html" scenes={WALK_V1} /></Rise>
        </Slide>
      );

    case "v2":
      return (
        <Slide>
          <Rise><Label>v2 · Group Chat 拥有了自己的面板</Label></Rise>
          <Rise delay={0.05} className="mt-2.5">
            <P className="max-w-3xl !text-[14.5px]"><G>v1 的用户测试</G>暴露出问题:团队要的不是又一条聊天流,而是被审阅过的知识,于是 v2 把 Group Chat 移到最右侧独立面板,装成结构化的知识卡片。<G>取舍 · </G>把 Group Chat 做成「被审阅过的知识」的空间;我们一度做过了头,只有卡片、没有对话,后来又把团队对话放了回来。</P>
          </Rise>
          <Rise delay={0.12} className="mt-5"><PrototypeWalk src="/assets/liner/prototypes/v2-group-topbar.html" scenes={WALK_V2} /></Rise>
        </Slide>
      );

    case "v3":
      return (
        <Slide>
          <Rise><Label>v3 · 工作区与可组合的编辑器模式</Label></Rise>
          <Rise delay={0.05} className="mt-2.5">
            <P className="max-w-3xl !text-[14.5px]">在打开任何文档之前先有一个工作区;编辑器里 Citation、Focus 等模式「选中即展开」。<G>取舍 · </G>私密与共享硬性分开,而不是一个带隐私开关的信息流。</P>
          </Rise>
          <Rise delay={0.12} className="mt-5"><PrototypeWalk src="/assets/liner/prototypes/v3-workspace.html" scenes={WALK_V3} /></Rise>
        </Slide>
      );

    case "chat-layouts":
      return (
        <Slide>
          <Rise><Eye>迭代 · 为什么是 3 种聊天布局</Eye></Rise>
          <Rise delay={0.08} className="mt-5">
            <P className="max-w-3xl">聊天是私密与共享相遇的地方,它的排布决定了一个想法跨越过去有多容易。每个方案都在简洁与连续之间权衡,所以我把 3 个都做了出来,看哪一个能让「分享到 Group」这一步保持流畅。</P>
          </Rise>
          <Rise delay={0.16} className="mt-7">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
              {CHAT_PLANS.map(([tag, img, text]) => (
                <div key={tag}>
                  <figure className="overflow-hidden rounded-md" style={{ background: "#141416" }}>
                    <Image src={img} alt={`${tag} 聊天布局`} width={1600} height={1100} className="h-[190px] w-full object-cover object-top" />
                  </figure>
                  <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.green }}>{tag}</p>
                  <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: C.body }}>{text}</p>
                </div>
              ))}
            </div>
          </Rise>
        </Slide>
      );

    case "usability":
      return (
        <Slide>
          <Rise><Eye>迭代 · 可用性测试</Eye></Rise>
          <Rise delay={0.1} className="mt-7">
            <dl className="grid max-w-3xl grid-cols-1 gap-6 border-y py-6 sm:grid-cols-3" style={{ borderColor: C.line }}>
              {USABILITY.map(([n, t]) => (
                <div key={n}>
                  <dt className="font-semibold leading-none tabular-nums" style={{ color: C.green, fontSize: "clamp(1.6rem,3.6vw,2.2rem)" }}>{n}</dt>
                  <dd className="mt-2.5 text-[13px] leading-[1.55]" style={{ color: C.body }}>{t}</dd>
                </div>
              ))}
            </dl>
          </Rise>
        </Slide>
      );

    case "final-pick":
      return (
        <Slide>
          <Rise><Label>最终选择 · Plan B + C</Label></Rise>
          <Rise delay={0.05} className="mt-2.5">
            <P className="max-w-3xl !text-[14.5px]">这个「AI Chat 与 Group Chat」的交互由我负责,我把编辑器自身的手势迁移过来:与 v3 的 Focus、Citation 同样的「选中即展开」现在驱动着聊天,你选一个面板,或两个都选。测试给了定论:人们想同时读到两条线;单选或并排,都让私密到共享的移动保持连续,也让分享时的过程可见、可回溯到来源。</P>
          </Rise>
          <Rise delay={0.12} className="mt-5"><PrototypeWalk src="/assets/liner/liner-ai-yuan.html" scenes={CHAT_SWITCH} /></Rise>
        </Slide>
      );

    case "final-setup":
      return (
        <Slide>
          <Rise><Label>成品 · 由我负责整合与最终设计(可交互)</Label></Rise>
          <Rise delay={0.05} className="mt-2.5">
            <P className="max-w-3xl !text-[14.5px]">团队产出许多分散方案,由<G>我负责把它们 merge 成一个连贯系统、并完成最终设计</G>。我们拒绝做「带 AI 的 Google Docs」,而是顺着<G>用户旅程</G>把功能分成四段来讲。</P>
          </Rise>
          <Rise delay={0.12} className="mt-5"><JourneyBar active={0} /></Rise>
          <Rise delay={0.16} className="mt-4">
            <H className="max-w-3xl">01 建立 · Set up</H>
            <P className="mt-2.5 max-w-3xl !text-[14.5px]">开一个项目,然后拉进队友、文件与文献管理器。</P>
          </Rise>
          <Rise delay={0.22} className="mt-5"><PrototypeWalk src="/assets/liner/liner-ai-yuan.html" scenes={WALK_SETUP} /></Rise>
        </Slide>
      );

    case "final-explore":
      return (
        <Slide>
          <Rise><Eye>成品 · 用户旅程</Eye></Rise>
          <Rise delay={0.06} className="mt-4"><JourneyBar active={1} /></Rise>
          <Rise delay={0.12} className="mt-4">
            <H className="max-w-3xl">02 探索 · Explore</H>
            <P className="mt-2.5 max-w-3xl !text-[14.5px]">独自工作:在一个私密工作区里阅读、高亮,并向 Liner AI 提问。</P>
          </Rise>
          <Rise delay={0.18} className="mt-5"><PrototypeWalk src="/assets/liner/liner-ai-yuan.html" scenes={WALK_EXPLORE} /></Rise>
        </Slide>
      );

    case "final-curate":
      return (
        <Slide>
          <Rise><Eye>成品 · 用户旅程</Eye></Rise>
          <Rise delay={0.06} className="mt-4"><JourneyBar active={2} /></Rise>
          <Rise delay={0.12} className="mt-4">
            <H className="max-w-3xl">03 提炼 · Curate</H>
            <P className="mt-2.5 max-w-3xl !text-[14.5px]">把一个你能站得住的结论,连同它的来源一起,提升到共享空间。</P>
          </Rise>
          <Rise delay={0.18} className="mt-5"><PrototypeWalk src="/assets/liner/liner-ai-yuan.html" scenes={WALK_CURATE} /></Rise>
        </Slide>
      );

    case "final-align":
      return (
        <Slide>
          <Rise><Eye>成品 · 用户旅程</Eye></Rise>
          <Rise delay={0.06} className="mt-4"><JourneyBar active={3} /></Rise>
          <Rise delay={0.12} className="mt-4">
            <H className="max-w-3xl">04 对齐 · Align</H>
            <P className="mt-2.5 max-w-3xl !text-[14.5px]">队友验证、质疑或修订这个论断,AI 则核对每一条引用是否成立。</P>
          </Rise>
          <Rise delay={0.18} className="mt-5"><PrototypeWalk src="/assets/liner/liner-ai-yuan.html" scenes={WALK_ALIGN} /></Rise>
        </Slide>
      );

    case "validated":
      return (
        <Slide>
          <Rise><Eye>成品 · 验证,然后打磨</Eye></Rise>
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <Rise delay={0.08}>
              <figure className="overflow-hidden rounded-md">
                <Image src="/assets/liner/Screenshot 2026-07-05 at 01.57.00.png" alt="Section A Capstone Award · Team North4Studio" width={1305} height={1329} className="mx-auto h-auto max-h-[46vh] w-auto max-w-full" />
              </figure>
            </Rise>
            <Rise delay={0.16}>
              <div className="space-y-4">
                <P>我们用可用性测试验证了这条流程,也把它的开放问题看得更清楚:现在,人们通过点击卡片回到原文去修改、追溯内容,这是我们给用户设定的路线。但它一定是<G>最优解</G>吗?用户也许想先经过<G>多方验证</G>、再动手修改;而卡片里被分享的对话,又该怎样进一步<G>辅助论文写作</G>?这<G>远远不是终点</G>。</P>
                <P>打磨既是概念也是手艺。我的工作是把团队产出的许多分散方案,折叠成一个连贯的系统,同时把每一屏还原到像素。我连上 Figma MCP,直接从 Liner 的设计系统生成原型,让它读起来是产品的一部分。</P>
              </div>
            </Rise>
          </div>
        </Slide>
      );

    case "future":
      return (
        <Slide>
          <Rise><Eye>成品 · 如果我有更多时间</Eye></Rise>
          <Rise delay={0.1} className="mt-6">
            <div className="max-w-3xl divide-y" style={{ borderColor: C.line }}>
              {FUTURE.map(([h, b]) => (
                <div key={h} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-8" style={{ borderColor: C.line }}>
                  <p className="text-[14px] font-semibold sm:w-[28%] sm:shrink-0" style={{ color: C.ink }}>{h}</p>
                  <p className="text-[13px] leading-[1.65] sm:flex-1" style={{ color: C.body }}>{b}</p>
                </div>
              ))}
            </div>
          </Rise>
        </Slide>
      );

    case "impact":
      return (
        <Slide>
          <Rise><Eye>成效 · 它落在了哪里</Eye></Rise>
          <Rise delay={0.08} className="mt-5"><H className="max-w-3xl">被挑出来继续推进,并进入产品路线图</H></Rise>
          <Rise delay={0.16} className="mt-6">
            <P className="max-w-3xl">在展示与利益相关者评审里,团队把那些「让协作感觉是原生的」功能,挑成了值得继续推进的:<G>Focus 模式</G>、<G>引用</G>,以及<G>分享到 Group</G>。</P>
          </Rise>
          <Rise delay={0.24} className="mt-7">
            <div className="max-w-3xl border-l-2 pl-5" style={{ borderColor: C.green }}>
              <Label>已进入路线图</Label>
              <p className="mt-2 text-[17px] leading-[1.55]" style={{ color: C.ink }}>Liner 正在把这套协作工作流并入产品,预计 <G>2026 年 7 月</G> 上线。</p>
            </div>
          </Rise>
        </Slide>
      );

    case "metrics":
      return (
        <Slide>
          <Rise><Eye>成效 · 我们如何知道它奏效</Eye></Rise>
          <Rise delay={0.08} className="mt-5">
            <P className="max-w-3xl">它以原型交付,所以这些是我会在上线时埋点的指标,而非结果。<G>每一条都回连到 brief 里的一个目标</G>,因为这次押注只有真正推动它们,才算成立,而不只是演示得好看。</P>
          </Rise>
          <Rise delay={0.16} className="mt-7">
            <div className="grid max-w-3xl gap-x-10 gap-y-8 border-t pt-6 sm:grid-cols-2" style={{ borderColor: C.line }}>
              {([
                ["leading", "领先指标 · Leading", "早期信号,先动"],
                ["lagging", "结果指标 · Lagging", "最终结果,后到"],
              ] as const).map(([g, title, sub]) => (
                <div key={g}>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <Label>{title}</Label>
                    <span className="text-[10px]" style={{ color: C.subtle }}>{sub}</span>
                  </div>
                  <Rule className="my-3" />
                  <div className="space-y-5">
                    {METRICS.filter((m) => m.group === g).map((m) => (
                      <div key={m.label}>
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-[14px] font-semibold" style={{ color: C.ink }}>{m.label}</span>
                          {m.north ? (
                            <span className="rounded-full px-2 py-[2px] text-[10px] font-semibold tracking-[0.08em]" style={{ background: C.green, color: "#fff" }}>★ North Star</span>
                          ) : null}
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.green }}>↳ {m.goal}</span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: C.muted }}>{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Rise>
        </Slide>
      );

    case "closing":
      return (
        <Slide>
          <Rise>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Liner" className="h-7 w-auto" />
          </Rise>
          <Rise delay={0.1} className="mt-8">
            <h2 className="font-semibold leading-[1.1] tracking-[-0.03em]" style={{ color: C.ink, fontFamily: SANS, fontSize: "clamp(2rem,4.6vw,3.2rem)" }}>
              让 AI 研究协作,<G>可被信任。</G>
            </h2>
          </Rise>
          <Rise delay={0.2} className="mt-6">
            <P className="max-w-xl">从十一场访谈的研究综合,到私密与共享之间的那道边界,这是设计如何让 Liner 从单人工具,长成一个团队能够信任的共享空间。</P>
          </Rise>
          <Rise delay={0.3} className="mt-10">
            <Link href="/work/liner" className="text-[13px] font-semibold underline underline-offset-4" style={{ color: C.green }}>← 回到 Liner 案例研究</Link>
          </Rise>
        </Slide>
      );

    default:
      return null;
  }
}

// ─── Shell ─────────────────────────────────────────────────────────────────────
export default function DeckMonoClientZh() {
  const reduced = useReducedMotion();
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const total = SLIDES.length;
  const slide = SLIDES[idx];
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;

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
  const next = useCallback(() => paginate(1), [paginate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const chrome = "rgba(255,255,255,0.9)";

  return (
    <div className="relative h-screen overflow-hidden" style={{ fontFamily: SANS, background: C.page }}>
      <div className="absolute inset-x-0 top-0 z-50 h-[2px] bg-transparent">
        <motion.div className="h-full" style={{ background: C.green }} initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: E }} />
      </div>

      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-6 backdrop-blur-md md:px-10" style={{ background: chrome, borderColor: C.line }}>
        <div className="flex items-center gap-4">
          <Link href="/work/liner" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Liner" className="h-4 w-auto" />
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] sm:inline" style={{ color: C.muted }}>案例</span>
          </Link>
          <span className="h-3 w-px" style={{ background: C.lineMid }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.subtle }}>{slide.chapter}</span>
        </div>
        <span className="text-[10px] font-semibold tabular-nums" style={{ color: C.subtle }}>
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      <main className="relative h-full min-h-0 overflow-hidden">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={slide.id}
            custom={dir}
            variants={reduced ? undefined : slideVariants}
            initial={reduced ? false : "enter"}
            animate={reduced ? undefined : "center"}
            exit={reduced ? undefined : "exit"}
            transition={{ duration: 0.5, ease: E }}
            className="absolute inset-x-0 bottom-16 top-14"
          >
            <SlideRenderer id={slide.id} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-40 border-t backdrop-blur-md" style={{ background: chrome, borderColor: C.line }}>
        <div className="flex items-center gap-4 px-6 py-3 md:px-10">
          <button type="button" onClick={prev} disabled={idx === 0} className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-opacity disabled:opacity-20" style={{ color: C.body }}>上一页</button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-x-auto">
            {SLIDES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => jump(i)} aria-label={`第 ${i + 1} 页`} className="shrink-0 rounded-full transition-all" style={{ height: 4, width: i === idx ? 18 : 4, background: i === idx ? C.green : C.faint }} />
            ))}
          </div>
          <button type="button" onClick={next} disabled={idx === total - 1} className="shrink-0 rounded px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-opacity disabled:opacity-20" style={{ color: C.body }}>下一页</button>
        </div>
      </footer>
    </div>
  );
}
