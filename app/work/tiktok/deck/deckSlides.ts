// TikTok · "Shared with You" — presentation deck content.
// Rendered by DeckClient.tsx in the Uber Base (light) design language.

export type Slide =
  | {
      kind: "title";
      id: string;
      eyebrow: string;
      title: string;
      kicker: string;
      subtitle: string;
    }
  | {
      kind: "meta";
      id: string;
      eyebrow: string;
      title: string;
      fields: { label: string; value: string }[];
    }
  | {
      kind: "statement";
      id: string;
      eyebrow: string;
      title: string;
      body: string;
    }
  | {
      kind: "quote";
      id: string;
      quote: string;
    }
  | {
      kind: "cards";
      id: string;
      eyebrow: string;
      title: string;
      cards: { n: string; title: string; body: string; tag?: string }[];
    }
  | {
      kind: "loop";
      id: string;
      eyebrow: string;
      title: string;
      intro: string;
      steps: { role: string; title: string; desc: string }[];
      close: string;
    }
  | {
      kind: "outcomes";
      id: string;
      eyebrow: string;
      title: string;
      items: { label: string; text: string }[];
      note: string;
    }
  | {
      kind: "cta";
      id: string;
      title: string;
      body: string;
      links: { label: string; href: string }[];
    };

export const DECK_SLIDES: Slide[] = [
  {
    kind: "title",
    id: "open",
    eyebrow: "Product Case Study · TikTok",
    title: "Shared with You",
    kicker: "把好友分享从「批奏折」,重做成转得起来的双边循环",
    subtitle:
      "重新设计 TikTok 好友分享的接收与回应体验：Shared Feed 降低「看」的成本,Smart Reactions 降低「回」的成本,让分享形成 A↔B 的循环。",
  },
  {
    kind: "meta",
    id: "snapshot",
    eyebrow: "项目快照",
    title: "概览",
    fields: [
      { label: "角色", value: "Product Designer · 端到端" },
      { label: "周期", value: "约 1 天研究 + 4 小时设计" },
      { label: "平台", value: "iOS / Android" },
      { label: "工具", value: "Claude · Gemini · ChatGPT" },
      { label: "类型", value: "概念探索（自驱）" },
      { label: "交付", value: "可交互原型 + 案例长文" },
    ],
  },
  {
    kind: "statement",
    id: "problem",
    eyebrow: "场景与问题",
    title: "分享零成本,接收却像「批奏折」",
    body:
      "在 TikTok 给互关好友分享视频几乎零成本,一条能一键群发 9 人。但接收方打开 Inbox 看到 20 条红点,看视频还附带一项「回应的任务」——看、判断意图、再打字回复,是一条链条而不是一个动作。结果:A 分享 20 条,B 往往只看 2 条。",
  },
  {
    kind: "cards",
    id: "causes",
    eyebrow: "为什么会这样",
    title: "三个根因",
    cards: [
      { n: "01", title: "交互成本不对等", body: "发送方顺手就发,接收方却要点开 DM、看、判断意图、再打字回复。" },
      { n: "02", title: "心智模型错位", body: "为「划」而生的视频,被装进一个要逆着回溯、逐条回复的 DM 容器。" },
      { n: "03", title: "没有优先级", body: "朋友的分享按时间无差别堆叠,不像 FYP 被算法组织,看着看着就失去耐心。" },
    ],
  },
  {
    kind: "quote",
    id: "insight",
    quote: "一段为「划」而生的内容,被装进了一个要求「回」的容器里。",
  },
  {
    kind: "statement",
    id: "reframe",
    eyebrow: "重塑目标",
    title: "真正的目标不是「让 B 看更多」",
    body:
      "「看更多」是能被玩坏的代理指标,盲目优化只会加重接收方的负担。往上追一层:分享是已被验证的留存驱动,真目标是让社交关系图更强、从而留住用户;而 A 分享,是因为想连接、想被看见。所以重新定义——把分享从单向的任务,变成 A↔B 都成立、能转起来的双边循环。",
  },
  {
    kind: "cards",
    id: "goals",
    eyebrow: "四个方向",
    title: "把目标拆成可验证的杠杆",
    cards: [
      { n: "01", title: "降低「看」的成本", body: "把分享从收件箱变回内容流。", tag: "P0" },
      { n: "02", title: "降低「回」的成本", body: "让「收到 / 被看见」不再绑定打字。", tag: "P0" },
      { n: "03", title: "统一双方心理定位", body: "发送方被接收,接收方在发现。", tag: "P0" },
      { n: "04", title: "让值得看的更早出现", body: "按目的性、互动性、时效性排序。", tag: "P1" },
    ],
  },
  {
    kind: "cards",
    id: "hmw",
    eyebrow: "How Might We",
    title: "四个 HMW 问题",
    cards: [
      { n: "01", title: "降低「看」的成本", body: "如何把埋在聊天里的待办,变成一条能顺畅刷下去的内容流?" },
      { n: "02", title: "降低「回」的成本", body: "如何让「我看到了 / 我感受到了」不靠打字就能传达?" },
      { n: "03", title: "统一心理定位", body: "如何让发送方被接收、接收方在发现,让分享成为循环而非任务?" },
      { n: "04", title: "更早被看见", body: "如何按目的性、互动性、时效性重排,让最值得看的先出现?" },
    ],
  },
  {
    kind: "statement",
    id: "decision",
    eyebrow: "最终决策",
    title: "先做 Shared Feed + Smart Reactions",
    body:
      "Shared Feed 把好友分享整合成一条以社交关系驱动的视频流,沿用刷 FYP 的习惯,把往上「回溯」变成往下「刷」,看的成本大幅降低;Smart Reactions 按视频 tag 和发送方评论生成一点即发的语境反应,让发送方感受到被看见。一个补「看」、一个补「回」,正好把循环转起来。",
  },
  {
    kind: "loop",
    id: "loop",
    eyebrow: "它如何成立",
    title: "双边循环:从 A 分享到 B 也分享",
    intro:
      "发送方的分享被低成本看到、回应;接收方在发现、发送方被看见;接收方刷爽之后又回到 FYP 成为新的发送方。",
    steps: [
      { role: "发送方 A", title: "分享", desc: "带一点意图,发给互关好友" },
      { role: "接收方 B", title: "发现", desc: "在 Shared Feed 顺着往下刷" },
      { role: "接收方 B", title: "回应", desc: "Smart Reactions 一点即发" },
      { role: "发送方 A", title: "被看见", desc: "收到贴合语境的反馈" },
      { role: "B 成为发送方", title: "再分享", desc: "回到 FYP 分享新内容" },
    ],
    close: "接收方成为发送方,循环重新开始",
  },
  {
    kind: "outcomes",
    id: "metrics",
    eyebrow: "怎么算成功",
    title: "先定义信号,再验证",
    items: [
      { label: "分享回应率", text: "接收方愿意做出轻量回应的比例。" },
      { label: "刷入深度", text: "好友那一叠分享,用户能顺着往下刷多深。" },
      { label: "「被看见」感", text: "发送方是否终于感知到自己的分享被看见。" },
    ],
    note:
      "这些目前基于自身体验推理,还未经真实用户验证——下一步是拿真实数据来验证,并配一组护栏指标（举报、屏蔽、未成年安全）。",
  },
  {
    kind: "statement",
    id: "reflection",
    eyebrow: "反思与展望",
    title: "改到多大,和一条安全底线",
    body:
      "方案里有小改动（Smart Reactions 塞进现成回复栏),也有动结构的（全新的 Shared Feed),我一直在权衡「改到多大」。一条不破的底线:发送方能看到的唯一信号,只能是接收方主动做出的动作,绝不外泄「看过 / 在线」。接下来——找真实用户验证、把最终方案做深、补上 T&S 与工程成本的评估。",
  },
  {
    kind: "cta",
    id: "end",
    title: "谢谢观看",
    body: "完整的问题拆解、九个候选方案与可交互原型,都在案例长文里。",
    links: [
      { label: "看案例长文", href: "/work/tiktok" },
      { label: "Portfolio", href: "/work" },
    ],
  },
];
