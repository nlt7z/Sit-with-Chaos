/**
 * 简体中文演示稿 — 与 StudioEngineCaseStudy 叙事对齐；术语保持 UX 行业用法。
 */

export type Slide =
  | {
      kind: "title";
      id: string;
      eyebrow: string;
      title: string;
      subtitle: string;
      kicker: string;
      speakerNotes: string;
    }
  | {
      kind: "meta";
      id: string;
      eyebrow: string;
      title: string;
      fields: { label: string; value: string }[];
      speakerNotes: string;
    }
  | {
      kind: "statement";
      id: string;
      eyebrow: string;
      title: string;
      body: string;
      speakerNotes: string;
    }
  | {
      kind: "quote";
      id: string;
      quote: string;
      speakerNotes: string;
    }
  | {
      kind: "threeCards";
      id: string;
      eyebrow: string;
      title: string;
      cards: { n: string; title: string; body: string }[];
      speakerNotes: string;
    }
  | {
      kind: "gridMedia";
      id: string;
      eyebrow: string;
      title: string;
      items: { src: string; alt: string }[];
      speakerNotes: string;
    }
  | {
      kind: "innovations";
      id: string;
      eyebrow: string;
      title: string;
      items: {
        id: string;
        name: string;
        capability: string;
        line: string;
        workflowSrc: string;
        workflowAlt: string;
      }[];
      speakerNotes: string;
    }
  | {
      kind: "media";
      id: string;
      eyebrow?: string;
      title?: string;
      caption?: string;
      media: "video" | "image";
      src: string;
      poster?: string;
      alt: string;
      speakerNotes: string;
    }
  | {
      kind: "prototype";
      id: string;
      eyebrow: string;
      title: string;
      body: string;
      embedPath: string;
      href: string;
      linkLabel: string;
      speakerNotes: string;
    }
  | {
      kind: "outcomes";
      id: string;
      eyebrow: string;
      title: string;
      items: { label: string; text: string }[];
      speakerNotes: string;
    }
  | {
      kind: "cta";
      id: string;
      title: string;
      body: string;
      href: string;
      linkLabel: string;
      imageSrc?: string;
      imageAlt?: string;
      speakerNotes: string;
    };

const IA_IMAGE = "/assets/studio-engine/information%20architecture.jpg";

export const DECK_SLIDES: Slide[] = [
  {
    kind: "title",
    id: "open",
    eyebrow: "UX 研究与设计 · 2025",
    title: "打造高效而直觉化的文本生成视频创作体验",
    kicker: "Studio Engine.ai · VP Genie",
    subtitle:
      "Gen-2 如何在不疏远专业用户的前提下触达新创作者——基于主持式可用性测试与渐进式脚手架的实证设计。",
    speakerNotes:
      "定调：专业级 AI 前期制作能力，与对新手「不友好」的心智模型并存；业务目标（转化 / 留存）与调研驱动的重设计。",
  },
  {
    kind: "meta",
    id: "snapshot",
    eyebrow: "项目快照",
    title: "概览",
    fields: [
      { label: "公司", value: "StudioEngine.AI" },
      { label: "产品", value: "VP Genie" },
      { label: "职责", value: "UX 研究 + UX 设计" },
      { label: "周期", value: "2025 年 1 月 – 4 月" },
      { label: "团队", value: "1 名总监 · 1 名 Lead · 4 名 UX 研究员与设计师" },
      { label: "方法", value: "主持式可用性测试 · SUS · 严重程度分级记录" },
    ],
    speakerNotes: "快速交代背景与范围，再进入问题与调研。",
  },
  {
    kind: "media",
    id: "hero",
    eyebrow: "产品",
    title: "从提示词到剧本、视觉资产与分镜",
    caption: "**主视觉** — 产品内工作流概览。",
    media: "image",
    src: "/assets/studio-engine/hero-1.jpg",
    alt: "Studio Engine.ai 产品与流程概览",
    speakerNotes: "视觉锚点：单一界面串联剧本、视觉与分镜。",
  },
  {
    kind: "statement",
    id: "starting-point",
    eyebrow: "起点",
    title: "能力强，但门槛高",
    body:
      "Studio Engine.ai 将一条提示词展开为完整**前期制作包**——面向专业影棚搭建。交互模型默认用户具备**导演思维**：术语密集、非线性流程，以及隐性的「谁才配用」的门槛。学生、独立创作者与爱好者常感到自己在用一款**尚未够格**使用的行业工具。缺口在**可用性与增长**：扩展受众，而不削弱专业深度。",
    speakerNotes:
      "对比「能力」与「可触达性」，引出 Gen-2 与调研为何对转化、留存关键。",
  },
  {
    kind: "quote",
    id: "quote-professional",
    quote:
      "产品能力毋庸置疑，但交互模型是为专业用户写的。缺口不在 AI，而在每一屏里被固化下来的假设。",
    speakerNotes: "案例长文金句，用于过渡到上下文与目标。",
  },
  {
    kind: "statement",
    id: "context",
    eyebrow: "上下文",
    title: "产品实际在做什么",
    body:
      "创意提示词可生成剧本、角色与道具画面、场景，以及合成后的分镜——直至成片，形成一套**可交付的视觉前期资料包**。难点在于：把多阶段工种压进一套交互里，却**不能**默认用户熟悉前期术语。Gen-2 重新编排旅程：先稳住剧本与确认，再进入视觉——而不是一次生成全部压垮认知。",
    speakerNotes: "同一提示词的前后对比；后续页展示输入 / 输出与嵌入对比稿。",
  },
  {
    kind: "gridMedia",
    id: "workflow-pair",
    eyebrow: "上下文",
    title: "输入 → 输出",
    items: [
      {
        src: "/assets/studio-engine/workflow-1.jpg",
        alt: "创意提示输入",
      },
      {
        src: "/assets/studio-engine/workflow-2-output.jpg",
        alt: "由文字提示生成剧本",
      },
    ],
    speakerNotes: "在嵌入对比之前，用静帧具象「同一提示词」。",
  },
  {
    kind: "threeCards",
    id: "goals",
    eyebrow: "目标",
    title: "我们优化什么",
    cards: [
      {
        n: "01",
        title: "推动付费转化",
        body: "降低「首次成功体验」的门槛，让更多用户愿意尝试付费订阅。",
      },
      {
        n: "02",
        title: "普适可用性",
        body: "仍在学习手艺的人也能用——不只服务五年工龄的资深从业者。",
      },
      {
        n: "03",
        title: "识别体验缺口",
        body: "在前期制作流程中暴露摩擦点，并按用户影响优先级排序。",
      },
    ],
    speakerNotes: "业务指标与体验准则，框定后续研究与设计决策。",
  },
  {
    kind: "threeCards",
    id: "target-users",
    eyebrow: "研究范围",
    title: "目标用户（B 端与新增 C 端）",
    cards: [
      {
        n: "01",
        title: "现有专业用户",
        body: "电影工作室与制作团队，通常具备 5 年以上影视从业经验，追求高强度、可控的生产效率。",
      },
      {
        n: "02",
        title: "新增创作者用户",
        body: "电影/传媒学生、动画与独立创作者、内容创作者与初学者，核心诉求是低门槛上手与可解释反馈。",
      },
      {
        n: "03",
        title: "业务机会人群",
        body: "预算敏感的导演和小团队，需要在时间与成本受限下快速完成前期制作验证。",
      },
    ],
    speakerNotes: "对应 VP 研究部分的用户定义：保留专业深度，同时扩大可触达人群。",
  },
  {
    kind: "statement",
    id: "research-intro",
    eyebrow: "研究",
    title: "三个问题，对应三段流程",
    body:
      "招募前，团队对齐三个研究问题，分别对应 **提示生成剧本与资产**、**对编辑与再生成机制的理解**，以及 **生成与审阅过程中的情绪反应**。六名参与者：从摄影指导到爱好者——既观察新手卡点，也看资深用户是否同样受阻。",
    speakerNotes: "方法：被试内主持式任务、错误记录、SUS；引出三项任务。",
  },
  {
    kind: "threeCards",
    id: "research-questions",
    eyebrow: "研究",
    title: "锚定问题",
    cards: [
      {
        n: "01",
        title: "剧本与资产",
        body: "用户在生成剧本与视觉资产时遇到哪些挑战？",
      },
      {
        n: "02",
        title: "编辑与再生成",
        body: "用户对视觉元素的编辑与再生成理解到什么程度？",
      },
      {
        n: "03",
        title: "情绪",
        body: "在生成与审阅全过程中，用户经历怎样的情绪变化？",
      },
    ],
    speakerNotes: "每张卡片对应研究支柱与可用性协议中的一段。",
  },
  {
    kind: "threeCards",
    id: "methodology",
    eyebrow: "研究方法",
    title: "主持式可用性研究方法",
    cards: [
      {
        n: "01",
        title: "前测访谈与问卷",
        body: "在任务开始前获取基线认知、术语理解与创作流程偏好，校准参与者心智模型。",
      },
      {
        n: "02",
        title: "被试内任务测试",
        body: "围绕脚本生成、视觉编辑、分镜调整三类任务进行主持式可用性测试，记录行为与中断点。",
      },
      {
        n: "03",
        title: "错误与成功评估",
        body: "按任务成功/失败率与错误严重程度（1-5）统计，形成可比的数据证据。",
      },
      {
        n: "04",
        title: "后测访谈与 SUS",
        body: "结合主观反馈与系统可用性量表，验证改版方向是否同时提升可用性与信心。",
      },
    ],
    speakerNotes: "对应 VP 的 Methodology 页面；把定性观察与定量评分放在同一框架。",
  },
  {
    kind: "gridMedia",
    id: "task-01",
    eyebrow: "可用性 · 任务 01",
    title: "由提示生成剧本",
    items: [
      { src: "/assets/studio-engine/task-1-1.jpg", alt: "提示输入" },
      { src: "/assets/studio-engine/task-1-2.jpg", alt: "剧本初稿" },
      { src: "/assets/studio-engine/task-1-3.jpg", alt: "场次与拆解" },
    ],
    speakerNotes: "相对顺畅的路径——与下一页任务 02 对比。",
  },
  {
    kind: "gridMedia",
    id: "task-02",
    eyebrow: "可用性 · 任务 02",
    title: "编辑视觉 — 摩擦最高",
    items: [
      { src: "/assets/studio-engine/task-2-1.jpg", alt: "审阅输出" },
      { src: "/assets/studio-engine/task-2-2.jpg", alt: "角色编辑" },
      { src: "/assets/studio-engine/task-2-3.jpg", alt: "再生成与精修" },
      { src: "/assets/studio-engine/task-2-4.jpg", alt: "摩擦与恢复" },
    ],
    speakerNotes:
      "会话在此处反复崩断：输出不可预期、无撤销、多页跳转打断语境、术语未解释、主 CTA 不清。",
  },
  {
    kind: "gridMedia",
    id: "task-03",
    eyebrow: "可用性 · 任务 03",
    title: "分镜细化",
    items: [
      { src: "/assets/studio-engine/task-3-1.jpg", alt: "看板总览" },
      { src: "/assets/studio-engine/task-3-2.jpg", alt: "镜头排序" },
      { src: "/assets/studio-engine/task-3-3.jpg", alt: "镜头细节" },
    ],
    speakerNotes: "第三阶段仍重要，但严重程度与洞察主要由任务 02 驱动。",
  },
  {
    kind: "statement",
    id: "insights",
    eyebrow: "洞察",
    title: "产品在何处与用户对抗",
    body:
      "数据集中在**视觉编辑**：AI 输出不可预期、**无版本恢复**、多页编辑路径碎片化、「InPainting」等术语未释义、主 **CTA** 层级弱、导出缺少结构。根因是：产品把 AI 当成**一次性神谕**。用户需要的是**可控、可协作**的伙伴——而不是黑箱。",
    speakerNotes: "衔接到设计：渐进脚手架、历史记录、统一编辑面、智能体层。",
  },
  {
    kind: "statement",
    id: "evaluation-summary",
    eyebrow: "评估结论",
    title: "严重度与频次指向同一问题簇",
    body:
      "高频问题集中在 **视觉编辑**：意外生成内容（6/6）、缺少版本恢复（3/6）、编辑路径不直观（6/6）、术语陌生（6/6）、CTA 不易定位（6/6）、导出结构不足（6/6）。这些并非孤立 bug，而是流程结构与反馈机制共同造成的系统性摩擦。",
    speakerNotes: "把 VP 的 severity 表转成可讲述的一页，强化“问题簇”而非点状修补。",
  },
  {
    kind: "quote",
    id: "quote-oracle",
    quote:
      "六名参与者全部撞上同一堵墙。每个问题都是同一根因的症状：产品把 AI 生成当成一锤定音的神谕。",
    speakerNotes: "强调跨参与者模式，而非单点 bug。",
  },
  {
    kind: "statement",
    id: "sus-insight",
    eyebrow: "用户反馈（SUS）",
    title: "AI 辅助，但创作主导权仍在用户",
    body:
      "对新增 C 端用户，理想体验是：**低门槛开始**、**AI 作为辅助而非替代**、可视化支持表达沟通、并持续支持学习成长。设计目标不是简化创作本身，而是把“我不知道下一步做什么”转化为“我知道如何推进”。",
    speakerNotes: "对应 VP 的 SUS 与反馈页，强调胜任感（competence）作为体验核心指标。",
  },
  {
    kind: "statement",
    id: "design-question",
    eyebrow: "设计命题",
    title: "Gen-2 需要同时满足两类价值",
    body:
      "我们如何让 VP Genie Gen-2 对专业创作者与新兴创作者同样可用、同样有价值，同时支持用户规模增长与免费到付费的转化？",
    speakerNotes: "对应 VP Design Question 页面，作为方案段的设计北极星。",
  },
  {
    kind: "prototype",
    id: "workflow-embed",
    eyebrow: "设计",
    title: "渐进式脚手架 — 前后对比",
    body:
      "旧流程在一条提示后瞬间展开全部。Gen-2 分阶段推进：简报、剧本确认、再进入视觉——失败可被定位，恢复路径可想象。",
    embedPath: "/assets/studio-engine/before_after_horizontal_workflow_v2.html",
    href: "/assets/studio-engine/before_after_horizontal_workflow_v2.html",
    linkLabel: "新标签页打开 HTML 对比稿",
    speakerNotes: "配合嵌入横版对比讲解；对齐分阶段与检查点。",
  },
  {
    kind: "quote",
    id: "hmw",
    quote:
      "我们如何让 Studio Engine.ai Gen-2 对专业导演与新兴创作者同样可用、同样有价值——同时支撑从免费到付费的增长与转化？",
    speakerNotes: "设计北极星；宜放在对比稿之后。",
  },
  {
    kind: "gridMedia",
    id: "flow-input",
    eyebrow: "流程",
    title: "输入 — 入口清晰",
    items: [
      { src: "/assets/studio-engine/input-before.jpg", alt: "改版前 · 输入" },
      { src: "/assets/studio-engine/input-after.jpg", alt: "改版后 · 输入" },
    ],
    speakerNotes: "静穆的前后对比——界面自己叙事；渐进披露。",
  },
  {
    kind: "gridMedia",
    id: "flow-basic",
    eyebrow: "流程",
    title: "基础信息 — 分阶段生成",
    items: [
      { src: "/assets/studio-engine/basic-before.jpg", alt: "改版前 · 基础信息" },
      { src: "/assets/studio-engine/basic-after.jpg", alt: "改版后 · 基础信息" },
    ],
    speakerNotes: "在进入下一层 AI 工作前留出审阅空间。",
  },
  {
    kind: "gridMedia",
    id: "flow-edit",
    eyebrow: "流程",
    title: "编辑 — 单一连续面",
    items: [
      { src: "/assets/studio-engine/edit-before.jpg", alt: "改版前 · 编辑" },
      { src: "/assets/studio-engine/edit-after.jpg", alt: "改版后 · 编辑" },
    ],
    speakerNotes: "合并面板：生成、局部重绘、参考与历史同屏完成。",
  },
  {
    kind: "statement",
    id: "solutions-intro",
    eyebrow: "方案",
    title: "从摩擦到协作",
    body:
      "我们将再生成重构为**多方案并行选择**，加入**可见的生成历史**，把编辑收敛到**单一工作面**，并统一 **CTA 与等待态**，让排队过程可感知。以下为案例中的典型问题 / 方案对照。",
    speakerNotes: "过渡到具体界面证据：选项、历史、面、层级。",
  },
  {
    kind: "gridMedia",
    id: "sol-options",
    eyebrow: "方案",
    title: "给选项，而非终局",
    items: [
      { src: "/assets/studio-engine/solution-1-1.jpg", alt: "多方案并行选择" },
      { src: "/assets/studio-engine/solution-1-2.jpg", alt: "语境中的变体网格" },
    ],
    speakerNotes: "「用选项代替单次编辑」—— AI 作为协作者。",
  },
  {
    kind: "gridMedia",
    id: "sol-history",
    eyebrow: "方案",
    title: "版本历史作为安全网",
    items: [
      { src: "/assets/studio-engine/problem-2-1.png", alt: "再生成后版本丢失" },
      { src: "/assets/studio-engine/solution-2.jpg", alt: "修订轨迹与恢复" },
    ],
    speakerNotes: "长文 P4 引语：迭代式 AI 只有可回退时才安全。",
  },
  {
    kind: "gridMedia",
    id: "sol-surface",
    eyebrow: "方案",
    title: "编辑单一工作面",
    items: [
      { src: "/assets/studio-engine/problem-3.png", alt: "跨页面碎片化编辑" },
      { src: "/assets/studio-engine/edit-after.jpg", alt: "合并后的编辑面板" },
    ],
    speakerNotes: "不要让用户离开当前页去完成他来的目的。",
  },
  {
    kind: "gridMedia",
    id: "sol-cta-progress",
    eyebrow: "方案",
    title: "CTA 与等待态",
    items: [
      { src: "/assets/studio-engine/problem-5.jpg", alt: "主操作不一致" },
      { src: "/assets/studio-engine/solution-5.jpg", alt: "层级清晰的主次按钮" },
      { src: "/assets/studio-engine/problem-7.jpg", alt: "静态加载像崩溃" },
      { src: "/assets/studio-engine/solution-7.jpg", alt: "实时进度与连续性" },
    ],
    speakerNotes: "按钮体系统一 + 多资产并行生成时的实时进度。",
  },
  {
    kind: "media",
    id: "system-ia",
    eyebrow: "系统",
    title: "智能体层与信息架构",
    caption: "**输入 → 基础信息 → 视觉 → 编辑 → 管理**，情境化**智能体**贯穿全程。",
    media: "image",
    src: IA_IMAGE,
    alt: "Gen-2 信息架构示意",
    speakerNotes: "智能体贴近任务情境呈现，而非深埋菜单。",
  },
  {
    kind: "outcomes",
    id: "outcomes",
    eyebrow: "结果",
    title: "改版交付了什么",
    items: [
      {
        label: "流程重构",
        text: "渐进四段管线（基础信息 → 大纲 → 剧本 → 视觉），每层进入前可审阅与确认。",
      },
      {
        label: "生成历史",
        text: "跨 AI 资产生效的修订轨迹——可回到任意版本、标星收藏、从意外输出中恢复。",
      },
      {
        label: "统一编辑面",
        text: "生成、局部重绘、绘制与历史审阅同屏完成，无需离页或丢失语境。",
      },
      {
        label: "AI 智能体层",
        text: "在旅程各段提供情境化助手，支撑下一步创作决策。",
      },
    ],
    speakerNotes: "回扣 SUS 与定性主题：赋能感 vs. 拒人感。",
  },
  {
    kind: "media",
    id: "design-language",
    eyebrow: "结果",
    title: "视觉语言",
    caption: "精炼**界面**，支撑**协作**与信息**清晰度**。",
    media: "image",
    src: "/assets/studio-engine/design-projects.jpg",
    alt: "更新后的视觉设计体系",
    speakerNotes: "可选节拍——视觉强化系统叙事。",
  },
  {
    kind: "cta",
    id: "close",
    title: "胜任感，而不只是能力",
    body:
      "设计 AI 产品，核心是让用户感到**自己胜任**。当模型在无可恢复路径下「惊吓」用户时，人们归咎的是**自己**——这是**设计**失败，不只模型失败。**完整叙事、指标与反思**见长文案例。",
    href: "/work/studio-engine",
    linkLabel: "打开完整案例长文",
    imageSrc: "/assets/studio-engine/visual.jpg",
    imageAlt: "产品视觉语言",
    speakerNotes: "以反思收束；引导至长文获取深度与后续研究计划。",
  },
];

const SIMPLE_DECK_IDS = [
  "open",
  "snapshot",
  "hero",
  "starting-point",
  "goals",
  "task-02",
  "insights",
  "workflow-embed",
  "flow-edit",
  "sol-options",
  "outcomes",
  "close",
] as const;

export const DECK_SLIDES_SIMPLE: Slide[] = SIMPLE_DECK_IDS.map((id) => {
  const s = DECK_SLIDES.find((slide) => slide.id === id);
  if (!s) throw new Error(`Missing deck slide id: ${id}`);
  return s;
});
