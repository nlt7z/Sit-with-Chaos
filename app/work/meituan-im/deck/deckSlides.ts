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
      /** 同一行三屏 + 手机外框；设备比例 7:12（宽:高） */
      layout?: "stack" | "row";
      phoneFrame?: boolean;
      items: { src: string; alt: string; label?: string }[];
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

export const DECK_SLIDES: Slide[] = [
  {
    kind: "title",
    id: "open",
    eyebrow: "UX 设计作品集 · 美团本地生活",
    title: "美团 IM 询价系统设计",
    kicker: "从“价格不透明”到“决策可托付”",
    subtitle:
      "以一次结构化对话替代碎片咨询：通过流程重构、交互引导与信任信号设计，帮助用户在下单前获得可比较、可理解、可落地的报价体验。",
    speakerNotes: "开场建立命题：我们不是在做聊天功能，而是在重建用户做决策前的信任路径。",
  },
  {
    kind: "meta",
    id: "snapshot",
    eyebrow: "项目快照",
    title: "项目概览",
    fields: [
      { label: "项目", value: "美团 IM 询价咨询系统" },
      { label: "角色", value: "UX 设计师（端到端负责）" },
      { label: "周期", value: "4 周（研究 → 方案 → A/B 验证）" },
      { label: "范围", value: "美团与大众点评双端协同验证" },
      { label: "场景", value: "家修、宴会、母婴等高决策成本服务" },
      { label: "结果", value: "搜索到下单转化 +0.5pp，价格争议下降 50%" },
    ],
    speakerNotes: "用一页交代业务环境、目标场景和可衡量结果，建立可信度。",
  },
  {
    kind: "statement",
    id: "problem",
    eyebrow: "问题定义",
    title: "用户需求强，但信任链路断裂",
    body:
      "在非标本地服务里，用户最关心的不只是“便宜”，而是“最终价格是否可预期”。原链路里，咨询意图很强，但大量用户在站内咨询前后流失：要么转到站外比价，要么因预期不确定放弃决策。问题本质不是入口不足，而是**决策过程缺乏可解释性**。",
    speakerNotes: "强调从行为信号看机会：咨询点击高，不代表咨询体验成立。",
  },
  {
    kind: "quote",
    id: "reframe-quote",
    quote: "我们要解决的不是“更早展示价格”，而是“让用户相信这个价格是如何被得出的”。",
    speakerNotes: "用一句话完成问题重构，为后续方案铺垫。",
  },
  {
    kind: "threeCards",
    id: "strategy",
    eyebrow: "策略框架",
    title: "三段式信任建构路径",
    cards: [
      {
        n: "01",
        title: "官方诊断入口",
        body: "先明确问题边界，减少用户与商家在起点上的信息偏差。",
      },
      {
        n: "02",
        title: "引导式 IM 咨询",
        body: "通过多轮提问把模糊诉求转为结构化需求卡，形成可比较输入。",
      },
      {
        n: "03",
        title: "竞争式透明报价",
        body: "商家基于同一需求上下文报价，并将结果无缝带入下单流程。",
      },
    ],
    speakerNotes: "这页是全案骨架：每一步都在消除一个流失原因。",
  },
  {
    kind: "media",
    id: "flow-map",
    eyebrow: "流程总览",
    title: "一次对话，串联完整决策",
    caption: "用户、平台、商家在统一会话线程中协同，关键状态保持连续可见。",
    media: "image",
    src: "/assets/meituan-im/im_consultation_user_flow_full.svg",
    alt: "美团 IM 询价流程全景图",
    speakerNotes: "讲清“连续性”是体验核心：不让用户在关键决策节点断线。",
  },
  {
    kind: "gridMedia",
    id: "entry-states",
    eyebrow: "关键交互",
    title: "入口状态与询单引导",
    layout: "row",
    phoneFrame: true,
    items: [
      {
        src: "/assets/meituan-im/screen-04-entry-generic.jpg",
        alt: "泛意图入口页",
        label: "Screen 04",
      },
      {
        src: "/assets/meituan-im/screen-05-entry-specific.jpg",
        alt: "具体意图入口页",
        label: "Screen 05",
      },
      {
        src: "/assets/meituan-im/screen-03-offhours-state.jpg",
        alt: "非营业时段状态",
        label: "Screen 03",
      },
    ],
    speakerNotes: "说明同一交互模型如何覆盖不同意图强度与边界时段。",
  },
  {
    kind: "gridMedia",
    id: "diagnosis",
    eyebrow: "关键交互",
    title: "诊断转译：从聊天到结构化需求",
    layout: "row",
    phoneFrame: true,
    items: [
      {
        src: "/assets/meituan-im/screen-07-diagnosis-start.jpg",
        alt: "诊断起始状态",
        label: "Screen 07",
      },
      {
        src: "/assets/meituan-im/screen-08-diagnosis-repair-order.jpg",
        alt: "结构化维修需求卡",
        label: "Screen 08",
      },
      {
        src: "/assets/meituan-im/screen-11-diagnosis-product-rec.jpg",
        alt: "诊断后推荐状态",
        label: "Screen 11",
      },
    ],
    speakerNotes: "核心价值在转译能力：聊天不是终点，结构化信息才是。",
  },
  {
    kind: "gridMedia",
    id: "quoting",
    eyebrow: "关键交互",
    title: "报价引擎与异常兜底",
    layout: "row",
    phoneFrame: true,
    items: [
      {
        src: "/assets/meituan-im/screen-02-live-quoting.jpg",
        alt: "实时报价中状态",
        label: "Screen 02",
      },
      {
        src: "/assets/meituan-im/screen-01-quote-expired-modal.jpg",
        alt: "报价过期弹窗提示",
        label: "Screen 01",
      },
      {
        src: "/assets/meituan-im/screen-10-quote-expired-chat.jpg",
        alt: "报价过期会话态",
        label: "Screen 10",
      },
    ],
    speakerNotes: "讲“信任”的另一面：不仅要成功路径清晰，也要失败路径可恢复。",
  },
  {
    kind: "media",
    id: "video",
    eyebrow: "动态演示",
    title: "端到端体验节奏",
    caption: "从咨询发起、诊断转译、报价竞争到回访闭环，验证叙事连续性。",
    media: "video",
    src: "/assets/meituan-im/im.mp4",
    alt: "美团 IM 询价系统交互演示视频",
    speakerNotes: "视频主要展示节奏和信息层级，不重复细节解释。",
  },
  {
    kind: "outcomes",
    id: "outcomes",
    eyebrow: "结果与验证",
    title: "设计影响（业务 + 体验）",
    items: [
      {
        label: "转化提升",
        text: "A/B 实验显示搜索到下单转化提升 **+0.5pp**，在规模化投放下具备稳定业务增量。",
      },
      {
        label: "信任改善",
        text: "价格争议相关投诉下降 **50%**，说明用户预期与实际履约更一致。",
      },
      {
        label: "决策效率",
        text: "需求信息在会话中逐步结构化，降低反复沟通成本，提升商家回应效率。",
      },
      {
        label: "可扩展性",
        text: "同一“信任优先”框架已可迁移至教育、宴会、母婴等多类非标服务。",
      },
    ],
    speakerNotes: "把结果分成业务、体验、系统三层，更符合面试官评估逻辑。",
  },
  {
    kind: "cta",
    id: "close",
    title: "设计结论",
    body:
      "在高不确定性服务里，用户真正购买的是**确定感**。价格透明很重要，但更关键的是让整个决策过程透明、连续、可解释。这个项目让我进一步验证：好的 IM 体验不是“消息流”，而是“信任流”。",
    href: "/work/meituan-im",
    linkLabel: "查看完整案例长文",
    imageSrc: "/assets/work/im.jpg",
    imageAlt: "美团 IM 项目封面",
    speakerNotes: "收束到设计方法论，体现你作为 UX 设计师的抽象能力。",
  },
];

const SIMPLE_DECK_IDS = [
  "open",
  "snapshot",
  "problem",
  "strategy",
  "entry-states",
  "quoting",
  "outcomes",
  "close",
] as const;

export const DECK_SLIDES_SIMPLE: Slide[] = SIMPLE_DECK_IDS.map((id) => {
  const slide = DECK_SLIDES.find((item) => item.id === id);
  if (!slide) throw new Error(`Missing deck slide id: ${id}`);
  return slide;
});
