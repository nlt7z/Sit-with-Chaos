/**
 * 演示稿文案（中文）—— 与案例长文 CaseStudyContent 对应。
 * speakerNotes 仅供讲者模式使用。
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
      kind: "twoVideos";
      id: string;
      eyebrow: string;
      title: string;
      left: { src: string; poster?: string; alt: string; caption: string };
      right: { src: string; poster?: string; alt: string; caption: string };
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
    eyebrow: "阿里云 · 2025",
    title: "让 AI 角色，真正「活」起来",
    subtitle:
      "四周内，把模型能力做成可感知、可沉浸的 C 端展厅体验。我负责通义星尘展厅的端到端体验设计。",
    kicker: "通义星尘 · AI 角色（TONGYI Xingchen）",
    speakerNotes:
      "开场：实习身份、展厅由你主笔。重点不是「聊天 UI」，而是长期记忆如何被用户感知。尽早点出已上线与 B 端复用，建立交付可信度。",
  },
  {
    kind: "meta",
    id: "snapshot",
    eyebrow: "项目一览",
    title: "范围、团队与结果",
    fields: [
      { label: "公司", value: "阿里云" },
      { label: "产品", value: "通义星尘 AI 角色（TONGYI Xingchen）" },
      { label: "角色", value: "UX 设计实习生 · C 端展厅端到端" },
      { label: "周期", value: "4 周 · 2025 年 7–8 月" },
      { label: "团队", value: "1 导师 · 2 UX · 2 PM · 4 前端工程" },
      { label: "结果", value: "已上线；转化向好；B 端可复用框架被采纳" },
    ],
    speakerNotes:
      "逐项带过即可。强调「端到端」与跨职能配比，为后面的问题与方案铺垫。",
  },
  {
    kind: "media",
    id: "showcase-hero",
    eyebrow: "产品演示",
    title: "已上线展厅 · 主流程录屏",
    caption: "展厅体验与关键界面一览",
    media: "video",
    src: "/assets/ai-character/heroshowcase.mp4",
    poster: "/assets/ai-character/showcase.jpg",
    alt: "通义星尘展厅主流程录屏",
    speakerNotes:
      "可留白让画面说话。引导观众看：进入世界、记忆显性化、情绪递进。时间紧时，可在第一次关键交互后暂停。",
  },
  {
    kind: "twoVideos",
    id: "showcase-more",
    eyebrow: "产品演示",
    title: "更多上线片段 · 入场与记忆节奏",
    left: {
      src: "/assets/ai-character/pre-1.mp4",
      alt: "展厅片段：建立世界观与主聊天界面",
      caption: "片段一 · 世界与主界面",
    },
    right: {
      src: "/assets/ai-character/pre-2.mp4",
      alt: "展厅片段：记忆驱动与情绪递进",
      caption: "片段二 · 记忆与递进",
    },
    speakerNotes:
      "主片已放过时，用两支短片补质感，避免重复同一支 hero 文件。",
  },
  {
    kind: "statement",
    id: "problem",
    eyebrow: "问题",
    title: "长期记忆是核心优势，却几乎无人「感受得到」",
    body: "星尘在模型层有真实深度：跨会话的持久记忆。但产品侧长期只有文档说明，缺少被设计过的体验，最强能力等于「隐形」。需求很明确：做官方展厅，把智能讲清楚，更要让用户在情绪上「摸得到」。",
    speakerNotes:
      "从能力到设计命题：优势不可感，就无法转化。展厅同时服务拉新、教育与 B 端说服。",
  },
  {
    kind: "quote",
    id: "problem-quote",
    quote: "怎样让「记忆」与「个性化」，像一段完整关系那样被感知？",
    speakerNotes:
      "可停顿。这是后文研究、策略与交互的北极星。",
  },
  {
    kind: "statement",
    id: "research",
    eyebrow: "研究",
    title: "从「聊天界面」转向「情感留存」",
    body: "我追问：用户为何约两周就会离开 AI 陪伴类产品。横向看了六款产品，整理四十余条公开评价。共性是「剧本感天花板」——用户要的不是更顺的句子，而是「只被我一个人懂得」的感觉。",
    speakerNotes:
      "不必展开工具细节，记住两个词：剧本感天花板、被懂得。",
  },
  {
    kind: "threeCards",
    id: "strategy",
    eyebrow: "策略",
    title: "从演示场到「模型之家」：在能力之内，设计用户想象的生活",
    cards: [
      {
        n: "01",
        title: "明确人群",
        body: "首个 playground 面向女性向、16+、追求情绪深度的体验诉求。",
      },
      {
        n: "02",
        title: "能力可证",
        body: "每一处交互都能对应到可经 API 复现的模型行为，方便 B 端采信。",
      },
      {
        n: "03",
        title: "叙事闭环",
        body: "有开端、情绪递进，以及可反复回来的触发点。",
      },
    ],
    speakerNotes:
      "三根支柱，控制节奏。点一次「模型之家 / playground」隐喻即可，让卡片承载细节。",
  },
  {
    kind: "gridMedia",
    id: "process",
    eyebrow: "设计过程",
    title: "人设方向、视觉语言，再到交互机制",
    items: [
      {
        src: "/assets/ai-character/characterdirection.jpg",
        alt: "角色方案 V1/V2/V3 探索",
      },
      { src: "/assets/ai-character/uivisual.jpg", alt: "视觉语言系统" },
      { src: "/assets/ai-character/innovation.jpg", alt: "场景音乐与动效概念" },
    ],
    speakerNotes:
      "强调你也是受众之一：拆解市面参考，与团队多轮迭代，收敛到纪云斐与黑金浪漫向视觉，配合 Live2D 与氛围音乐。",
  },
  {
    kind: "innovations",
    id: "interactions",
    eyebrow: "核心交互",
    title: "四项创新：让记忆被看见、被记住",
    items: [
      {
        id: "alternate-universe",
        name: "平行宇宙事件",
        capability: "长期记忆 + 生成式叙事",
        line: "结合个人历史的记忆触发场景，重写关系语境，形成可变奖励。",
        workflowSrc: "/assets/ai-character/interaction/alternate_universe_events_workflow.svg",
        workflowAlt: "平行宇宙事件 · 大模型流程图",
      },
      {
        id: "heartbeat-power",
        name: "心动能量",
        capability: "实时生成 + 角色深度",
        line: "轻点展开内心独白卡，露出脆弱潜台词，制造「情绪特权」感。",
        workflowSrc: "/assets/ai-character/interaction/heartbeat_power_workflow.svg",
        workflowAlt: "心动能量 · 大模型流程图",
      },
      {
        id: "story-unlock",
        name: "故事解锁",
        capability: "渐进式记忆沉淀",
        line: "随着对话深度解锁背景里程碑，延长新鲜感，缓解剧本感天花板。",
        workflowSrc: "/assets/ai-character/interaction/story_unlock_workflow.svg",
        workflowAlt: "故事解锁 · 大模型流程图",
      },
      {
        id: "moments-feed",
        name: "动态精选",
        capability: "基于记忆的实时生成",
        line: "类动态精选的内容，承接过往互动，维持离开会话后的在场感。",
        workflowSrc: "/assets/ai-character/interaction/moments_feed_workflow.svg",
        workflowAlt: "动态精选 · 大模型流程图",
      },
    ],
    speakerNotes:
      "与长文案例一致：先概览，再按需展开完整流程图。手机上单列卡片，更易读大图。",
  },
  {
    kind: "media",
    id: "interaction-video",
    title: "Live2D · 声音、动作与在场感",
    caption: "Live2D 语音与动作联动",
    media: "video",
    src: "/assets/ai-character/interaction.mp4",
    alt: "Live2D 语音与动作联动演示",
    speakerNotes:
      "「像真的一样」的直观证据。现场注意音量；可对比纯文本聊天缺了什么。",
  },
  {
    kind: "twoVideos",
    id: "b2b",
    eyebrow: "B 端框架",
    title: "一套展厅，沉淀为可复用模板",
    left: {
      src: "/assets/ai-character/taobaibai-1.mp4",
      alt: "星座展厅 · 陶白白",
      caption: "星座 · 陶白白",
    },
    right: {
      src: "/assets/ai-character/therapy-1.mp4",
      alt: "心理咨询展厅 · 专业咨询师",
      caption: "心理 · 专业场景",
    },
    speakerNotes:
      "换皮：IP、品牌吉祥物、名人、领域专家。此处用星座与心理两条线验证同一框架。",
  },
  {
    kind: "media",
    id: "actor-validation",
    eyebrow: "B 端验证",
    title: "多人与专业演员场景",
    caption: "延展展厅形态 · 群体与演员主导的体验",
    media: "video",
    src: "/assets/ai-character/actor-1.mp4",
    alt: "展厅片段：多人与演员场景",
    speakerNotes:
      "若听众关心「不止双人聊天」，用此片说明同一框架可换阵容与场景。",
  },
  {
    kind: "statement",
    id: "replication",
    eyebrow: "开发者复用",
    title: "查看源码、一键克隆、受控配置面板",
    body: "为降低 B 端接入成本，开发者在产品内即可查看提示词与配置结构——若无法复现，再炫的演示也没有商业价值。",
    speakerNotes:
      "回扣「能力可证」：克制本身也是功能，复现优先于 spectacle。",
  },
  {
    kind: "gridMedia",
    id: "replication-ui",
    eyebrow: "开发者复用",
    title: "查看源码与一键克隆 · 产品内检视",
    items: [
      {
        src: "/assets/ai-character/replica-1.jpg",
        alt: "展厅：查看源码与配置检视",
      },
      {
        src: "/assets/ai-character/replica-2.jpg",
        alt: "展厅：一键克隆与受控配置面板",
      },
    ],
    speakerNotes:
      "指给现场看真实界面：离开页面也能看懂如何改，是对「只演示不交付」的回应。",
  },
  {
    kind: "media",
    id: "backend",
    eyebrow: "平台与控制台",
    title: "并行改版 · B 端控制台与官网首页",
    caption: "首页改版 · 信息扫读与上手路径",
    media: "video",
    src: "/assets/ai-character/homepage.mov",
    alt: "通义星尘角色平台首页改版录屏",
    speakerNotes:
      "可提 P0–P3 在 24 小时内对齐：知识库、扩展能力、API 中心与文档结构。原则：好试、好找、好改、好跟进。",
  },
  {
    kind: "gridMedia",
    id: "console",
    eyebrow: "控制台界面",
    title: "知识库与扩展能力",
    items: [
      { src: "/assets/ai-character/updateddesign1.jpg", alt: "知识库控制台改版" },
      { src: "/assets/ai-character/updateddesign2.jpg", alt: "扩展能力控制台改版" },
    ],
    speakerNotes:
      "时间紧可略讲 verbal，画面一带而过，进入结果页。",
  },
  {
    kind: "outcomes",
    id: "outcome",
    eyebrow: "结果",
    title: "四周交付 · 框架被采纳 · 平台更清晰",
    items: [
      { label: "交付", text: "四套完整展厅。" },
      { label: "规模", text: "可复用的 B 端框架，覆盖 IP、角色扮演与咨询等场景。" },
      { label: "平台", text: "后台改版提升扫读效率与上手体验。" },
      { label: "流程", text: "跨职能优先级管理，避免排期失控。" },
    ],
    speakerNotes:
      "用「四周」收口节奏。下一页给线上入口，方便想亲自点的人。",
  },
  {
    kind: "cta",
    id: "close",
    title: "设计原则",
    body: "让能力被看见——设计是模型强度与「可感知价值」之间的翻译层。为复现而设计，不为炫技——每一条交互，都应是上层客户能落地的能力。",
    href: "https://tongyi.aliyun.com/character",
    linkLabel: "查看线上展厅",
    imageSrc: "/assets/ai-character/showcase.jpg",
    imageAlt: "产品主视觉静帧",
    speakerNotes:
      "致谢并开放提问：记忆体验、B 端模板或实习期排期取舍。完整叙事见作品集案例长文。",
  },
];
