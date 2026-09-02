"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type MutableRefObject, type ReactNode, type RefObject,
} from "react";

// ─── Uber Base · tokens (mirror the live prototype's MT palette) ───────────────
const U = {
  ink:        "#000000",
  inkSoft:    "#141414",
  inkLight:   "#545454",
  muted:      "#757575",
  mutedSoft:  "#AFAFAF",
  hairline:   "#E2E2E2",
  divider:    "#EBEBEB",
  bg:         "#F6F6F6",
  surface:    "#FFFFFF",
  surfaceDeep:"#EEEEEE",
  dark:       "#000000",
  accent:     "#FFD100",
  accentInk:  "#3D2E00",
};

const FONT =
  "var(--font-manrope), -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif";

// ─── 16:9 基准画布(允许小幅伸缩贴合窗口) ─────────────────────────────────────
const SW = 1280;
const SH = 720;

// ─── Easings & variants ───────────────────────────────────────────────────────
const E    = [0.22, 1, 0.36, 1] as const;
const EMSK = [0.76, 0, 0.24, 1] as const;

const STG  = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const UP   = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: E } } };
const FADE = { hidden: { opacity: 0 },        show: { opacity: 1,       transition: { duration: 0.6, ease: E } } };

// ─── Slide registry — bg:整页背景色,余白与它同色,无“卡片框” ─────────────────
// 顶栏“编辑”入口开关(编辑面板与 localStorage 覆盖逻辑保留,仅隐藏入口)
const SHOW_EDIT = false;

const SLIDES = [
  { id: "cover",      chapter: "开场", dark: true,  bg: U.dark    },
  { id: "context",    chapter: "开场", dark: false, bg: U.surface },
  { id: "role",       chapter: "开场", dark: false, bg: U.surface },
  { id: "voice",      chapter: "断裂", dark: true,  bg: U.dark    },
  { id: "broken",     chapter: "断裂", dark: false, bg: U.surface },
  { id: "firsttry",   chapter: "断裂", dark: false, bg: U.surface },
  { id: "optionsAB",  chapter: "方案", dark: false, bg: U.surface },
  { id: "optionC",    chapter: "方案", dark: false, bg: U.bg      },
  { id: "blueprint",  chapter: "方案", dark: false, bg: U.surface },
  { id: "txn",        chapter: "方案", dark: true,  bg: U.dark    },
  { id: "diagnose",   chapter: "交互", dark: false, bg: U.surface },
  { id: "order",      chapter: "交互", dark: false, bg: U.surface },
  { id: "quoting",    chapter: "交互", dark: false, bg: U.surface },
  { id: "dialogflow", chapter: "交互", dark: false, bg: U.surface },
  { id: "states",     chapter: "交互", dark: false, bg: U.surface },
  { id: "merchant",   chapter: "交互", dark: false, bg: U.surface },
  { id: "selfserve",  chapter: "边缘", dark: false, bg: U.surface },
  { id: "redesign",   chapter: "重构", dark: false, bg: U.surface },
  { id: "aiagent",    chapter: "重构", dark: false, bg: U.surface },
  { id: "ada1",       chapter: "重构", dark: false, bg: U.surface },
  { id: "ada2",       chapter: "重构", dark: false, bg: U.surface },
  { id: "ada3",       chapter: "重构", dark: false, bg: U.surface },
  { id: "tokens",     chapter: "重构", dark: false, bg: U.bg      },
  { id: "impact",     chapter: "数据", dark: true,  bg: U.dark    },
  { id: "ai",         chapter: "展望", dark: false, bg: U.surface },
  { id: "risk",       chapter: "展望", dark: false, bg: U.surface },
  { id: "proto",      chapter: "收尾", dark: false, bg: U.surface },
  { id: "closing",    chapter: "收尾", dark: false, bg: U.surface },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

// ─────────────────────────────────────────────────────────────────────────────
// 文案系统 — 全部文案集中于此;==文字== 渲染为黄色荧光,换行即分行。
// 每页右上角“编辑”可改,存在浏览器本地,即时生效。
// ─────────────────────────────────────────────────────────────────────────────
const COPY: Record<string, Record<string, string>> = {
  cover: {
    eye: "美团 · 本地生活服务 · IM 询价咨询 · 2025",
    title: "重构==黑盒==",
    sub: "从“价格透明”到“诊断可信”的本地生活服务体验设计",
    credit: "平台架构组 · C 端本地生活服务(Home Services)UX 与 UI",
    name: "Yuan Fang",
  },
  context: {
    eye: "背景 · 产品是什么",
    title: "Meituan local services is a super-app marketplace.",
    u: "on-demand, on-site",
    y: "discover & compare merchants",
    t: "real people do the work",
  },
  role: {
    eye: "我的职责与角色",
    title: "平台架构组,负责核心 C 端本地生活服务的 UX 与 UI 设计。",
    body: "此次项目:在 C 端,为用户降低高决策成本服务中的**不确定性与焦虑感**;在平台端,通过**标准化对话架构**降低交易摩擦,提升履约效率与**订单转化率**。",
  },
  voice: {
    eye: "信任断裂 · 用户原声",
    l1: "“家里管道堵了,我花了 **30 分钟**,问了 **10 家店**,",
    l2: "都不肯给价格,都说**要上门看看才知道**。",
    l3: "师傅只要一上门,==报价肯定更高==。”",
    src: "本地生活服务调研中,不同用户反复提及的相似体验",
  },
  broken: {
    eye: "信任断裂",
    title: "为何“晒价格”救不了转化?\n交易真正发生的地方,是==IM 聊天框==。",
    body: "用户习惯在下单前先进行咨询,但信任恰恰在这里断裂:诊断往往在**上门之后**发生,而现有规则则要求用户在此**之前**做出决定,商家“**上门看菜下碟**”。",
    panel: "现状 · 线性旅程",
    steps: "问题发生\n海量商家出现\n逐家重复描述、询价\n半随机选一家上门",
    breakT: "→ 信任断裂",
    breakN: "报价 ≠ 实际账单,以“惊喜”账单和差评收场。",
  },
  firsttry: {
    eye: "失败的前置尝试与深层洞察",
    title: "独立报价页上线,转化率纹丝不动。",
    body: "通过增加商品细分品类把价格晒出来。未经过诊断的价格只是**一句空话**,用户不信,商家也懒得维护。",
    insight: "用户问的从来不是“多少钱”,而是“**这个价格是怎么算出来的,到底算不算数**”。价格不是数字问题,而是==过程信任==问题。",
    revLabel: "PRD 对应的用户真实评价",
    review: "“之前在商品页看的是 50 块,师傅上门说情况特殊要加收 200,完全是坑人!”",
    revNote: "满屏皆是:双方的信息不对等,让用户觉得这个价格不合理。",
  },
  optionsAB: {
    eye: "方案探索与权衡",
    title: "为了解决“信任”的难题,我们先探讨了两个方向,都被否掉。",
    aT: "让信息提前出现:明码标价上门诊断费",
    aB: "用户支付上门费用请师傅**先上门诊断**,再确定是否继续维修。",
    aP: "痛点:先行商家已在用,用户**仍不信任诊断结果**,认为商家有把事情说得更严重的嫌疑;上门属于**高风险决策**,不修还要重新找人过流程。",
    bT: "保住用户的退出权",
    bB: "用户可以在上门后**随时选择取消**,所有加价需经过线上审批。",
    bP: "痛点:平台需要支付上门费,**成本过高**,且对商家端并不有利。",
  },
  optionC: {
    eye: "方案 C · 最终选定",
    title: "保留用户习惯的 IM 咨询心智,将后置的“上门诊断”提前为平台级==“标准诊断”==,实现一表多报。",
    note: "关键判断:问题还是出在最开始的**诊断阶段**,因为不标准无法统一,那么后期再去加保障措施也**无法挽回**。",
  },
  blueprint: {
    eye: "服务蓝图",
    title: "五步闭环:把后置的上门诊断,提前到对话里。",
    steps: "用户发起咨询\n平台前置诊断\n生成结构化需求单\n商家实时竞价\n==一键确认下单==",
  },
  txn: {
    eye: "O2O · Quote-based On-demand Service",
    title: "Quote-to-Service:报价到履约的完整交易流",
  },
  diagnose: {
    eye: "服务蓝图 · 01 前置诊断(统一标准)",
    title: "用户无需向 10 个商家重复描述。",
    body: "平台在对话流中统一承接“询问-诊断”工作流,引入**本地真人专家**在聊天里实时对话,通过视频和图片进行诊断,前期平均花费时间 **5 分钟**。更高的运营成本,对于建立**平台信任壁垒**完全值得验证。",
    capZh: "上线版 · 中文",
    capEn: "重构版 · English · Live",
  },
  order: {
    eye: "服务蓝图 · 02 结构化需求单(标准化转译)",
    title: "把“马桶水箱一直响”,\n转译为==标准化的维修需求单==。",
    body: "需求单同时保留用户**原始图片与叙述**,为商家判断提供双重参考。",
    capZh: "上线版 · 中文",
    capEn: "重构版 · English · Live",
  },
  quoting: {
    eye: "服务蓝图 · 03 实时询价(同标比价)",
    title: "3 分钟内,5 家附近商家,同一张需求单。",
    body: "商家基于完全相同的标准需求单提交**固定价或严格封顶的区间价**(如 $80-$120)。用户无需逐家询价,只需在**统一标准**下对比价格与时效。",
    capZh: "上线版 · 中文",
    capEn: "重构版 · English · Live",
  },
  dialogflow: {
    eye: "核心交互 · 有反馈的对话流",
    title: "让用户永远知道:\n自己在哪儿,下一步是什么。",
    body: "卡片顶部增加**常驻的阶段向导栏**,清晰标记 诊断中 ➔ 生成需求单 ➔ 商家报价中 ➔ 锁定下单 的全流程进度;对话内部卡片**实时展示状态**,询价中,还是寻找中。",
    cap: "实时原型 · 英文重构版",
  },
  states: {
    eye: "核心交互 · 报价卡片的 5 种微状态",
    title: "针对 24 小时全天候场景的严密状态演进。",
    body: "所有商家的报价都会随 **AI 总结标签**与商家信息一起展示给用户,可点进详情页查看具体信息,不满意还可以继续**寻找新报价**。点击下方任一状态,右侧原型即切换到对应场景:",
    chips: "竞价中\n已锁定\n报价过期\n夜间预估\n已取消",
    expiredNote: "==“看得见但不可点”==,把**掌控感**交还给用户。当报价超时失效,传统的“卡片消失”会导致严重的认知断层。过期的价格**强制锁定不可点**,绝对无法进入结算账单;诊断结果与上下文**完整保留**,卡片置灰呈现。重续时**无需重新做诊断**,仅重新发起时间段比价。",
  },
  merchant: {
    eye: "核心交互 · 商家端如何报价",
    title: "商家看到完全相同的需求单,用户按价格和时效挑。",
    body: "商家会收到**专家诊断 + 用户的素材**(图片、视频、描述等)。商家也是**节省时间**,免去无用聊天,直接切入主题。",
  },
  selfserve: {
    eye: "反向信任 · “劝退与自助”路径",
    title: "主动把小额订单“推出去”,\n赚取最长远的信任。",
    body: "如果诊断发现故障**极小且可量化**(如仅需更换水龙头垫圈),系统会直接推荐**标准化微型商品与视频教程**,跳过询价环节,告知用户可自行解决。",
    cap: "实时原型 · 自助解决路径",
  },
  redesign: {
    eye: "设计系统升级 · 从美团到 US 北美本地化重构",
    title: "用 Claude Code 与 Claude Design\n重构英文版原型。",
    body: "验证这套“信任对话架构”在海外**高人力成本市场**(如北美 TaskRabbit / Thumbtack 场景)的普适性;专业诊断人力成本过高,改成 **AI 诊断**。",
    capA: "早期版本 · Live",
    capB: "初版 Repair Flow · Live",
  },
  aiagent: {
    eye: "北美重构 · AI Agent 诊断",
    title: "预设未来:\n用 ==AI Agent== 替代人工专家。",
    body: "北美重构版里,第一个接待用户的是 AI Agent 而不是真人专家:**凌晨 2 点也能应答**,能看图识视频,给出**置信度**,并生成同一张结构化需求单。真人师傅始终**一键可达**,后续询价闭环保持不变。",
    cap: "实时原型 · AI Agent 工作流",
  },
  ada1: {
    eye: "信息层级与无障碍设计(ADA Compliance)· 01",
    title: "降低信息密度",
    body: "删除冗余的营销挂件与高饱和度色块,**大幅增加留白**,突出**核心诊断信息**。",
    capZh: "上线版 · 高密度",
    capEn: "重构版 · 大幅留白",
  },
  ada2: {
    eye: "信息层级与无障碍设计(ADA Compliance)· 02",
    title: "无障碍适配",
    body: "全线放大点击热区(44×44pt),取消低于 12px 的微型字号与暗色低对比度图标,全卡片支持屏幕阅读器朗读。",
  },
  ada3: {
    eye: "信息层级与无障碍设计(ADA Compliance)· 03",
    title: "北美本地化视觉与数据格式适配",
    body: "MM/DD/YYYY;英制;文案语境转译为地道表达。",
  },
  tokens: {
    eye: "设计系统 · 通用组件",
    title: "将这套对话流结构化卡片抽取成通用组件(Design System Tokens),具备直接迁移至==母婴护理、宴会预订==等高决策成本服务场景的能力。",
  },
  impact: {
    eye: "灰度实测数据 · 用户级随机 A/B",
    title: "7 月至 8 月 · 杭州及浙江部分城市 · 马桶维修与管道疏通品类",
    s1: "诊断渠道内整体:意向到成交转化达老路径 1.3 倍",
    s2: "搜索入口全量:整体搜索入口转化净增",
    s3: "全量推算:每日预计净增约 2000 单",
    s4: "价格纠纷类客诉:预计下降 50%",
    note: "实验组会在搜索关键字之后弹出我们的专家诊断、统一询价的 pop 入口。",
  },
  ai: {
    eye: "风险应对与 AI 未来演进 · 多模态 AI 替诊(AI Evolution)",
    title: "庞大的用户数据,\n未来必然是训练我们自己的 AI 模型。",
    body: "平台沉淀了庞大的用户咨询与真实履约数据,这是训练诊断模型独有的语料。针对专家诊断的产能瓶颈,下一步我们将引入多模态 AI 诊断助手,用初期人工诊断积累的数据集训练模型。",
    pipe: "图片\n文本\n需求单\n实际履约:做了什么、换了什么件、收了多少",
  },
  risk: {
    eye: "风险应对 · 机制的反选问题",
    title: "让用户不是在比价格,\n是在比==价格除以可信度==。",
    body: "这个机制会系统性选出三类商家:最缺单的、最不会估的、最打算低报后现场加价的。低报是占优策略,除非违约成本高于低报收益。报价旁边必须挂履约分,也就是这家店历史上“最终账单落在报价内”的比例。",
    noteT: "客诉处理",
    noteB: "取消“人工拉扯”,推行“差价极速先赔”。",
  },
  proto: {
    eye: "完整可交互原型 · 任意切换场景",
    note: "在手机下方的场景栏切换任意流程,或点击建议回复把流程走完。英文 / USD 为北美本地化重构版;实际上线产品为中文与人民币。",
  },
  closing: {
    title: "重构黑盒:从“价格透明”,到==“诊断可信”==。",
    credit: "Yuan Fang · Product Designer · Pratt Institute",
  },
};

// ─── 英文版文案 — 最直白的短句;结构与中文版一一对应 ───────────────────────────
const COPY_EN: Record<string, Record<string, string>> = {
  cover: {
    eye: "Meituan · Local Services · IM Consultation · 2025",
    title: "Rebuilding the ==Black Box==",
    sub: "From “price transparency” to “trusted diagnosis” in local home services.",
    credit: "Platform Architecture Team · Consumer Home Services UX & UI",
    name: "Yuan Fang",
  },
  context: {
    eye: "Context · The Product",
    title: "Meituan local services is a super-app marketplace.",
    u: "on-demand, on-site",
    y: "discover & compare merchants",
    t: "real people do the work",
  },
  role: {
    eye: "My Role",
    title: "Platform Architecture team.\nI own UX and UI for consumer Home Services.",
    body: "This project had two goals. For users: make high-stakes services feel **less uncertain and less stressful**. For the platform: **standardize the conversation**, cut friction, and lift **order conversion**.",
  },
  voice: {
    eye: "Broken Trust · A User's Words",
    l1: "“My drain was clogged. I spent **30 minutes** and asked **10 shops**.",
    l2: "None would give a price. They all said **‘we have to see it first’**.",
    l3: "And once the guy shows up, ==the price only goes up==.”",
    src: "A pattern we heard again and again in user research",
  },
  broken: {
    eye: "Broken Trust",
    title: "Why showing prices didn't help:\ndeals actually close in the ==chat==.",
    body: "Users chat before they book. That is exactly where **trust breaks**: the diagnosis happens **after the visit**, but the rules force users to decide **before it**. Merchants price on the spot. Both sides close a **half-random deal**.",
    panel: "Today · A linear journey",
    steps: "A problem happens\nA wall of merchants appears\nRepeat the story to each one\nPick one, half at random",
    breakT: "→ Trust breaks",
    breakN: "Quote ≠ final bill. It ends in a surprise bill and a bad review.",
  },
  firsttry: {
    eye: "The First Attempt, and the Real Insight",
    title: "We shipped a standalone price page. Nothing moved.",
    body: "We listed prices by service category. A price without a diagnosis is **just a claim**: users didn't believe it, and merchants didn't maintain it.",
    insight: "Users never asked “how much”. They asked **“how was this number made, and will it hold”**. Price is not a number problem. It is a ==process-trust== problem.",
    revLabel: "A real user review behind the PRD",
    review: "“The page said $50. On site he added $200 for a ‘special case’. A total rip-off!”",
    revNote: "Reviews like this were everywhere. The information gap made every price feel unfair.",
  },
  optionsAB: {
    eye: "Options We Weighed",
    title: "We explored two directions first. Both got killed.",
    aT: "Option A: a priced diagnosis visit",
    aB: "The user pays a **visit fee**. A pro comes, diagnoses, then they decide whether to repair.",
    aP: "Why it failed: competitors already do this, and users **still don't trust the verdict** — the shop has every reason to make it sound worse. A visit is a **heavy commitment**; if you don't repair, you start all over.",
    bT: "Option B: protect the user's exit",
    bB: "The user can **cancel any time** after the visit. Every add-on charge needs online approval.",
    bP: "Why it failed: the platform **eats the visit cost**. Too expensive, and bad for merchants.",
  },
  optionC: {
    eye: "Option C · What We Built",
    title: "Keep the chat habit. Move the on-site diagnosis up front, as a platform-level ==standard diagnosis==. One order, many quotes.",
    note: "The key call: the problem lives at the **diagnosis step**. If the diagnosis isn't standardized, **nothing downstream can patch it**.",
  },
  blueprint: {
    eye: "Service Blueprint",
    title: "Five steps. The diagnosis moves into the conversation.",
    steps: "User starts a chat\nPlatform diagnoses first\nA structured repair order\nMerchants bid in real time\n==One tap to book==",
  },
  txn: {
    eye: "O2O · Quote-based On-demand Service",
    title: "Quote-to-Service: the full transaction flow",
  },
  diagnose: {
    eye: "Blueprint · 01 Diagnose First (One Standard)",
    title: "No more repeating yourself to 10 shops.",
    body: "The platform owns the ask-and-diagnose step inside the chat. A **local human expert** talks to the user live, diagnoses from photos and video, and it takes about **5 minutes**. It costs more to run — and it is worth it, because it builds a **trust moat**.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  order: {
    eye: "Blueprint · 02 A Structured Repair Order",
    title: "“My toilet keeps hissing” becomes\na ==standardized repair order==.",
    body: "The order keeps the user's **original photos and words**, so merchants can judge with both.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  quoting: {
    eye: "Blueprint · 03 Live Quotes, One Standard",
    title: "Within 3 minutes: 5 nearby shops, one order.",
    body: "Merchants quote against the **exact same order** — a fixed price or a **hard-capped range** (like $80-$120). The user compares **price and speed on one standard**, instead of asking shop by shop.",
    capZh: "Shipped version · Chinese",
    capEn: "Rebuilt version · English · Live",
  },
  dialogflow: {
    eye: "Core Interaction · A Conversation That Answers Back",
    title: "The user always knows:\nwhere am I, and what happens next.",
    body: "A **stage guide** sits on top of the thread: Diagnosing ➔ Building the order ➔ Collecting quotes ➔ Locked. Cards inside the chat show their **live state** — quoting, or still searching.",
    cap: "Live prototype · English rebuild",
  },
  states: {
    eye: "Core Interaction · 5 States of the Quote Card",
    title: "A tight state machine for a 24-hour service.",
    body: "Every quote arrives with an **AI summary tag** and the merchant's info. Users can open the details, or keep collecting **new quotes**. Tap a state below — the prototype switches to that scene:",
    chips: "Bidding\nLocked\nExpired\nAfter-hours\nCancelled",
    expiredNote: "==“Visible but not clickable”== gives control back to the user. When a quote times out, making the card vanish breaks the user's mental thread. So the expired price **locks hard** and can never reach the bill; the **diagnosis and context stay**; the card just grays out. To resume, **no re-diagnosis** — only the time slot is re-quoted.",
  },
  merchant: {
    eye: "Core Interaction · How Merchants Quote",
    title: "Every merchant sees the same order. Users pick on price and speed.",
    body: "Merchants receive the **expert diagnosis** plus the user's materials — photos, video, description. They **save time** too: no idle chat, straight to the point.",
  },
  selfserve: {
    eye: "Reverse Trust · The “You Don't Need Us” Path",
    title: "Pushing small orders away\nearns the longest-lasting trust.",
    body: "If the diagnosis finds a **tiny, fixable problem** (like a worn washer), the system skips quoting and recommends a **standard part and a how-to video**: you can do this yourself.",
    cap: "Live prototype · self-serve path",
  },
  redesign: {
    eye: "Design System · Rebuilt for the US",
    title: "Rebuilt in English,\nwith Claude Code and Claude Design.",
    body: "To test this “trust conversation” in **high-labor-cost markets** (think TaskRabbit / Thumbtack), I rebuilt the Meituan-based design for US users. Expert diagnosis is too expensive there, so it becomes **AI diagnosis**.",
    capA: "Early version · Live",
    capB: "Repair Flow v1 · Live",
  },
  aiagent: {
    eye: "US Rebuild · AI Agent Diagnosis",
    title: "Planning ahead:\nan ==AI agent== replaces the human expert.",
    body: "In the US rebuild the first responder is an AI agent, not a human expert. It **answers at 2 AM**, reads photos and video, **states its confidence**, and drafts the same structured order. A human pro stays **one tap away**, and the quoting loop after it stays the same.",
    cap: "Live prototype · AI-agent workflow",
  },
  ada1: {
    eye: "Hierarchy & Accessibility (ADA) · 01",
    title: "Lower the information density",
    body: "Remove the marketing widgets and loud color blocks. **Add whitespace**. Let the **diagnosis lead**.",
    capZh: "Shipped version · dense",
    capEn: "Rebuild · whitespace",
  },
  ada2: {
    eye: "Hierarchy & Accessibility (ADA) · 02",
    title: "Accessibility",
    body: "Touch targets grow to **44×44pt**. No type under **12px**, no dark low-contrast icons. Every card reads aloud with a **screen reader**.",
  },
  ada3: {
    eye: "Hierarchy & Accessibility (ADA) · 03",
    title: "US formats and native copy",
    body: "**MM/DD/YYYY**; **imperial units**; copy rewritten to **sound native**.",
  },
  tokens: {
    eye: "Design System · Shared Components",
    title: "The conversation cards are now shared components (Design System Tokens) — ready to carry into ==maternity care, banquets== and other high-stakes services.",
  },
  impact: {
    eye: "Pilot Results · User-level Randomized A/B",
    title: "July-August · Hangzhou + parts of Zhejiang · toilet repair & drain clearing",
    s1: "**Diagnostic channel**: intent-to-order converts at 1.3× the old path",
    s2: "**Search overall**: net conversion gain",
    s3: "Projected at full rollout: about **2,000 extra orders a day**",
    s4: "**Pricing complaints**: projected to drop 50%",
    note: "The test group saw our expert-diagnosis, one-order-many-quotes popup right after searching a keyword.",
  },
  ai: {
    eye: "Risk & AI Evolution · Multimodal AI Diagnosis",
    title: "Huge user data.\nTraining our own AI model is the obvious next step.",
    body: "The platform holds a huge corpus of **real consultations and real fulfilment records** — training data no one else has. To break the **expert bottleneck**, the next step is a **multimodal AI assistant**, trained on the early human-diagnosis dataset.",
    pipe: "Photos\nText\nRepair orders\nActual fulfilment: what was done, what was replaced, what was charged",
  },
  risk: {
    eye: "Risk · Adverse Selection",
    title: "Users shouldn't compare price.\nThey should compare ==price divided by trust==.",
    body: "This mechanism systematically selects three kinds of merchants: the desperate, the bad estimators, and the **lowball-then-upsell** players. Lowballing is the **dominant strategy** — unless breaking your quote costs more than it earns. So every quote must carry a **fulfilment score**: how often this shop's final bill lands inside its quote.",
    noteT: "Complaints",
    noteB: "No more haggling with support. The price gap is refunded first, instantly.",
  },
  proto: {
    eye: "Full Interactive Prototype · Switch Any Scene",
    note: "Switch flows from the rail under the phone, or tap the suggested replies. English / USD is the US rebuild; the shipped product is Chinese with RMB.",
  },
  closing: {
    title: "Rebuilding the black box: from “price transparency” to ==“trusted diagnosis”==.",
    credit: "Yuan Fang · Product Designer · Pratt Institute",
  },
};

// ─── 界面与图表的双语字符串 ───────────────────────────────────────────────────
type Lang = "zh" | "en";
const UI = {
  back:      { zh: "← 返回案例", en: "← Case Study" },
  edit:      { zh: "编辑", en: "Edit" },
  editing:   { zh: "编辑中", en: "Editing" },
  loading:   { zh: "原型加载中…", en: "Loading prototype…" },
  livePrefix:{ zh: "实时原型 · ", en: "Live · " },
  users:     { zh: "年服务用户", en: "Annual users" },
  merchants: { zh: "合作商家", en: "Merchants" },
  openFull:  { zh: "打开完整页面 ↗", en: "Open full page ↗" },
  tryProto:  { zh: "试玩原型", en: "Try the prototype" },
  caseLink:  { zh: "查看完整案例", en: "Full case study" },
  pipeline:  { zh: "训练数据管线", en: "Training data pipeline" },
  bpMeta:    { zh: "5 阶段 · 3 泳道", en: "5 stages · 3 lanes" },
  txnNote:   { zh: "用户唯一的决策点 · 其余环节由平台与商家在同一订单上下文中自动衔接", en: "The user's only decision point. Everything else hands off automatically in one order context." },
} as const;

const CHAPTER_EN: Record<string, string> = {
  "开场": "Opening", "断裂": "Break", "方案": "Approach", "交互": "Interaction",
  "边缘": "Edge", "重构": "Rebuild", "数据": "Results", "展望": "Next", "收尾": "Close",
};

// 编辑面板里每个字段的显示名与行数
const FIELDS: Record<string, { k: string; label: string; rows?: number }[]> = {
  cover:      [{ k: "eye", label: "眉标" }, { k: "title", label: "主标题" }, { k: "sub", label: "副标题" }, { k: "credit", label: "署名行 · 左" }, { k: "name", label: "署名行 · 右" }],
  context:    [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "u", label: "Uber 说明" }, { k: "y", label: "Yelp 说明" }, { k: "t", label: "TaskRabbit 说明" }],
  role:       [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 4 }],
  voice:      [{ k: "eye", label: "眉标" }, { k: "l1", label: "引言 · 第一行" }, { k: "l2", label: "引言 · 第二行" }, { k: "l3", label: "引言 · 第三行" }, { k: "src", label: "注脚" }],
  broken:     [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 4 }, { k: "panel", label: "面板标题" }, { k: "steps", label: "旧旅程步骤(每行一步)", rows: 4 }, { k: "breakT", label: "断裂 · 标题" }, { k: "breakN", label: "断裂 · 说明" }],
  firsttry:   [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 3 }, { k: "insight", label: "洞察(引用块)", rows: 3 }, { k: "revLabel", label: "评价面板 · 标题" }, { k: "review", label: "评价内容", rows: 3 }, { k: "revNote", label: "评价注脚", rows: 2 }],
  optionsAB:  [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "aT", label: "方案 A · 标题" }, { k: "aB", label: "方案 A · 内容", rows: 2 }, { k: "aP", label: "方案 A · 痛点", rows: 3 }, { k: "bT", label: "方案 B · 标题" }, { k: "bB", label: "方案 B · 内容", rows: 2 }, { k: "bP", label: "方案 B · 痛点", rows: 2 }],
  optionC:    [{ k: "eye", label: "眉标" }, { k: "title", label: "陈述", rows: 3 }, { k: "note", label: "关键判断", rows: 3 }],
  blueprint:  [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "steps", label: "五步(每行一步)", rows: 5 }],
  txn:        [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }],
  diagnose:   [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 4 }, { k: "capZh", label: "左图说明(中文版)" }, { k: "capEn", label: "右图说明(英文版)" }],
  order:      [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 2 }, { k: "capZh", label: "左图说明(中文版)" }, { k: "capEn", label: "右图说明(英文版)" }],
  quoting:    [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 3 }, { k: "capZh", label: "左图说明(中文版)" }, { k: "capEn", label: "右图说明(英文版)" }],
  dialogflow: [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 4 }, { k: "cap", label: "配图说明" }],
  states:     [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 3 }, { k: "chips", label: "状态标签(每行一个)", rows: 5 }, { k: "expiredNote", label: "报价过期 · 展开说明", rows: 4 }],
  merchant:   [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 2 }],
  selfserve:  [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 3 }, { k: "cap", label: "配图说明" }],
  redesign:   [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 3 }, { k: "capA", label: "左图说明" }, { k: "capB", label: "右图说明" }],
  aiagent:    [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 4 }, { k: "cap", label: "配图说明" }],
  ada1:       [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 2 }, { k: "capZh", label: "左图说明" }, { k: "capEn", label: "右图说明" }],
  ada2:       [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 3 }],
  ada3:       [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "body", label: "正文", rows: 2 }],
  tokens:     [{ k: "eye", label: "眉标" }, { k: "title", label: "陈述", rows: 3 }],
  impact:     [{ k: "eye", label: "眉标" }, { k: "title", label: "标题" }, { k: "s1", label: "指标 1 说明" }, { k: "s2", label: "指标 2 说明" }, { k: "s3", label: "指标 3 说明" }, { k: "s4", label: "指标 4 说明" }, { k: "note", label: "脚注", rows: 2 }],
  ai:         [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 2 }, { k: "pipe", label: "管线步骤(每行一步)", rows: 4 }],
  risk:       [{ k: "eye", label: "眉标" }, { k: "title", label: "标题", rows: 2 }, { k: "body", label: "正文", rows: 4 }, { k: "noteT", label: "客诉 · 标题" }, { k: "noteB", label: "客诉 · 内容" }],
  proto:      [{ k: "eye", label: "眉标" }, { k: "note", label: "底部说明", rows: 3 }],
  closing:    [{ k: "title", label: "结语", rows: 2 }, { k: "credit", label: "署名" }],
};

// ─── 文案覆盖(localStorage 持久化,按语言分开存)────────────────────────────────
type Overrides = Record<string, string>;

const CopyCtx = createContext<{ ov: Overrides; lang: Lang }>({ ov: {}, lang: "zh" });

function dictOf(lang: Lang) {
  return lang === "en" ? COPY_EN : COPY;
}

function useLang(): Lang {
  return useContext(CopyCtx).lang;
}

function useT() {
  const lang = useLang();
  return useCallback(<K extends keyof typeof UI>(k: K) => UI[k][lang], [lang]);
}

function useC(slide: string) {
  const { ov, lang } = useContext(CopyCtx);
  return useCallback(
    (field: string) => ov[`${slide}.${field}`] ?? dictOf(lang)[slide]?.[field] ?? "",
    [ov, lang, slide],
  );
}

// ─── Mask reveal ──────────────────────────────────────────────────────────────
function Mask({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div initial={{ y: "108%" }} animate={{ y: "0%" }} transition={{ duration: 0.92, ease: EMSK, delay }}>
        {children}
      </motion.div>
    </div>
  );
}

// ─── 黄色荧光笔 ────────────────────────────────────────────────────────────────
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

// ─── 黄色荧光笔 — 划入动效 ─────────────────────────────────────────────────────
function MarkWipe({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="relative inline-block" style={{ padding: "0.02em 0.2em" }}>
      <motion.span
        aria-hidden
        className="absolute inset-0"
        style={{ background: U.accent, borderRadius: 3, transformOrigin: "0% 50%" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: EMSK, delay }}
      />
      <motion.span
        className="relative"
        style={{ color: U.accentInk }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: E, delay: delay + 0.3 }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// ─── 富文本渲染:==文字== → 荧光;换行 → <br/> ────────────────────────────────
function Rich({ text, wipe = false, wipeDelay = 1.1 }: { text: string; wipe?: boolean; wipeDelay?: number }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((ln, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {ln.split(/(==[^=]+==|\*\*[^*]+\*\*)/g).map((seg, i) =>
            seg.startsWith("==") && seg.endsWith("==") ? (
              wipe
                ? <MarkWipe key={i} delay={wipeDelay}>{seg.slice(2, -2)}</MarkWipe>
                : <Mark key={i}>{seg.slice(2, -2)}</Mark>
            ) : seg.startsWith("**") && seg.endsWith("**") ? (
              <strong key={i} style={{ fontWeight: 600, color: "inherit" }}>{seg.slice(2, -2)}</strong>
            ) : (
              <span key={i}>{seg}</span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

// 纯文本(去掉 == 标记),用于不支持高亮的位置
function plain(text: string) {
  return text.replace(/==|\*\*/g, "");
}

// ─── 眉标(纯文字,无装饰线) ──────────────────────────────────────────────────
function Eye({ children, dark, delay = 0 }: { children: ReactNode; dark?: boolean; delay?: number }) {
  return (
    <motion.p
      className="text-[10px] font-semibold tracking-[0.26em]"
      style={{ color: dark ? "rgba(255,255,255,0.62)" : U.muted }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: E, delay: delay + 0.1 }}
    >
      {children}
    </motion.p>
  );
}

// ─── Count-up ─────────────────────────────────────────────────────────────────
function CountUp({
  to, suffix = "", prefix = "", startDelay = 220, duration = 1100, format,
}: { to: number; suffix?: string; prefix?: string; startDelay?: number; duration?: number; format?: (n: number) => string }) {
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
  return <>{prefix}{format ? format(n) : Math.round(n)}{suffix}</>;
}

// ─── 延迟挂载重 iframe ────────────────────────────────────────────────────────
function useAfterEnter(delay = 520) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return ready;
}

// ─── 实时原型手机:深链进单一 workflow ─────────────────────────────────────────
function DeckPhone({ flow, caption, boxW = 300, boxH = 560, seek = 1, fill = false, src }: { flow: string; caption?: string; boxW?: number; boxH?: number; seek?: number; fill?: boolean; src?: string }) {
  const PW = 480, PH = 1000;
  const t = useT();
  // fill:按机身高度(~930 含微边距)缩放,裁掉画布上下呼吸空白,
  // 让手机与并排的整屏截图等高,对比更直观。
  const scale = fill ? boxH / 930 : Math.min(boxW / PW, boxH / PH);
  const ready = useAfterEnter();
  // 防闪烁:iframe 保持透明,onLoad 后再等 shell 完成开机才淡入,占位文字持续兜底
  const [loaded, setLoaded] = useState(false);
  const base = src ?? "/assets/meituan-im/Revised%20Repair%20Flow.html";
  return (
    <figure className="flex h-full flex-col items-center justify-center">
      <div className="relative overflow-hidden" style={{ width: boxW, height: boxH }}>
        {ready && (
          <iframe
            src={`${base}#flow=${flow}&rail=0&seek=${seek}`}
            title={`${flow} flow — live prototype`}
            loading="lazy"
            onLoad={() => setTimeout(() => setLoaded(true), 420)}
            style={{
              position: "absolute", left: "50%", top: "50%", width: PW, height: PH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
              opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
            }}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] tracking-[0.2em]" style={{ color: U.mutedSoft }}>{t("loading")}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 flex shrink-0 items-center justify-center gap-2 text-[10px] tracking-[0.18em]"
          style={{ color: U.muted }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: U.accent }} />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── 通用缩放嵌入:把任意尺寸的 HTML 画布等比缩放进指定盒子 ────────────────────
function ScaledEmbed({
  src, title, natW, natH, boxW, boxH, caption, fit = "contain",
}: { src: string; title: string; natW: number; natH: number; boxW: number; boxH: number; caption?: string; fit?: "contain" | "cover" }) {
  const t = useT();
  const ready = useAfterEnter();
  const [loaded, setLoaded] = useState(false);
  const scale = fit === "cover"
    ? Math.max(boxW / natW, boxH / natH)
    : Math.min(boxW / natW, boxH / natH);
  return (
    <figure className="flex h-full flex-col items-center justify-center">
      <div className="relative overflow-hidden" style={{ width: boxW, height: Math.min(boxH, natH * scale + 2) }}>
        {ready && (
          <iframe
            src={src} title={title} loading="lazy"
            onLoad={() => setTimeout(() => setLoaded(true), 420)}
            style={{
              position: "absolute", left: "50%", top: "50%", width: natW, height: natH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
              opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
            }}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] tracking-[0.2em]" style={{ color: U.mutedSoft }}>{t("loading")}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 flex shrink-0 items-center justify-center gap-2 text-[10px] tracking-[0.18em]"
          style={{ color: U.muted }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: U.accent }} />
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── 泳道图连线:按交接顺序画箭头,竖线走列间空隙,标出谁影响谁 ─────────────────
function SwimlaneArrows({
  wrapRef, cellRefs, seq, id, dep, delay = 1.5,
}: {
  wrapRef: RefObject<HTMLDivElement | null>;
  cellRefs: MutableRefObject<Record<string, HTMLElement | null>>;
  seq: [number, number][];
  id: string;
  dep?: unknown;
  delay?: number;
}) {
  const [d, setD] = useState<{ w: number; h: number; paths: string[] } | null>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = (p: [number, number]) => {
      const el = cellRefs.current[`${p[0]}-${p[1]}`];
      if (!el) return null;
      return { left: el.offsetLeft, right: el.offsetLeft + el.offsetWidth, cy: el.offsetTop + el.offsetHeight / 2 };
    };
    const paths: string[] = [];
    for (let i = 0; i < seq.length - 1; i++) {
      const a = box(seq[i]);
      const b = box(seq[i + 1]);
      if (!a || !b) continue;
      if (seq[i][1] === seq[i + 1][1]) {
        // 同一列:从左侧列间空隙绕行
        const gx = Math.min(a.left, b.left) - 7 - (i % 2) * 5;
        paths.push(`M ${a.left} ${a.cy} L ${gx} ${a.cy} L ${gx} ${b.cy} L ${b.left - 3} ${b.cy}`);
      } else {
        // 跨列:竖线落在两列之间的空隙里
        const mx = (a.right + b.left) / 2;
        paths.push(`M ${a.right} ${a.cy} L ${mx} ${a.cy} L ${mx} ${b.cy} L ${b.left - 3} ${b.cy}`);
      }
    }
    setD({ w: wrap.offsetWidth, h: wrap.offsetHeight, paths });
  }, [wrapRef, cellRefs, seq, dep]);
  if (!d) return null;
  return (
    <motion.svg
      className="pointer-events-none absolute left-0 top-0"
      style={{ overflow: "visible" }}
      width={d.w} height={d.h} viewBox={`0 0 ${d.w} ${d.h}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: E, delay }}
      aria-hidden>
      <defs>
        <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={U.accent} />
        </marker>
      </defs>
      {d.paths.map((p, i) => (
        <path key={i} d={p} fill="none" stroke={U.accent} strokeWidth={1.5} strokeOpacity={0.85}
          strokeLinejoin="round" markerEnd={`url(#${id})`} />
      ))}
    </motion.svg>
  );
}

// ─── 黑色 Service Blueprint(蓝图页右侧,块状卡片,非细条) ─────────────────────
const BP_DATA: Record<Lang, { stages: string[]; lanes: { name: string; cells: string[]; decision?: number }[] }> = {
  zh: {
    stages: ["发现", "咨询诊断", "竞价匹配", "履约", "反馈"],
    lanes: [
      { name: "用户", cells: ["搜索维修意图", "描述问题", "对比并选定商家", "服务后支付", "评价打标"], decision: 2 },
      { name: "平台 · 前台", cells: ["", "专家对话诊断", "商家实时竞价", "上门服务完成", ""] },
      { name: "平台 · 后台", cells: ["露出诊断入口", "生成结构化需求单", "排序并推送报价", "绑定定金与尾款", "更新排序模型"] },
    ],
  },
  en: {
    stages: ["Discovery", "Diagnose", "Bidding", "Fulfilment", "Feedback"],
    lanes: [
      { name: "User", cells: ["Search repair intent", "Describe the problem", "Compare and pick", "Pay after service", "Rate and tag"], decision: 2 },
      { name: "Platform · Frontstage", cells: ["", "Expert diagnoses in chat", "Merchants bid live", "On-site service done", ""] },
      { name: "Platform · Backstage", cells: ["Surface the entry", "Generate the order", "Rank and stream bids", "Bind deposit and balance", "Update the ranking model"] },
    ],
  },
};

// 交接顺序:[泳道, 列] — 用户搜索 → 后台露出入口 → 用户描述 → 前台诊断 → 后台生成需求单
// → 前台竞价 → 后台推送报价 → 用户选定 → 后台绑定定金 → 前台上门 → 用户支付 → 评价 → 更新模型
const BP_FLOW: [number, number][] = [
  [0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2], [0, 2], [2, 3], [1, 3], [0, 3], [0, 4], [2, 4],
];

function ServiceBlueprint() {
  const lang = useLang();
  const t = useT();
  const BP_STAGES = BP_DATA[lang].stages;
  const BP_LANES = BP_DATA[lang].lanes;
  const wrapRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLElement | null>>({});
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="rounded-2xl px-7 py-7" style={{ background: U.dark }}>
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-semibold tracking-[0.26em]" style={{ color: "rgba(255,255,255,0.55)" }}>
            SERVICE BLUEPRINT
          </p>
          <p className="text-[9.5px] tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.35)" }}>{t("bpMeta")}</p>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {BP_STAGES.map((s, i) => (
            <motion.div key={s} className="flex items-baseline gap-1.5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: E, delay: 0.35 + i * 0.07 }}>
              <span className="text-[9px] tabular-nums" style={{ color: U.accent }}>0{i + 1}</span>
              <span className="text-[11px] font-medium tracking-tight text-white">{s}</span>
            </motion.div>
          ))}
        </div>
        <div className="relative" ref={wrapRef}>
        {BP_LANES.map((lane, li) => (
          <div key={lane.name} className="mt-3.5">
            <p className="mb-1.5 text-[9px] font-semibold tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {lane.name}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {lane.cells.map((cell, ci) => (
                <motion.div key={ci}
                  ref={(el) => { cellRefs.current[`${li}-${ci}`] = el; }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: E, delay: 0.5 + li * 0.12 + ci * 0.06 }}
                  className="flex min-h-[72px] items-start rounded-xl px-3 py-2.5"
                  style={cell === ""
                    ? { background: "transparent" }
                    : lane.decision === ci
                      ? { background: U.accent }
                      : { background: "#1D1D1D" }}>
                  {cell !== "" && (
                    <p className="text-[11px] font-light leading-[1.5] tracking-tight"
                      style={{ color: lane.decision === ci ? U.accentInk : "rgba(255,255,255,0.85)" }}>
                      {cell}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        <SwimlaneArrows wrapRef={wrapRef} cellRefs={cellRefs} seq={BP_FLOW} id="bp-arrow" dep={lang} />
        </div>
      </div>
    </div>
  );
}

// ─── 整屏截图:无外框,缓慢自动滚动展示完整界面 ────────────────────────────────
function ScrollShot({
  src, alt, label, natW = 2250, natH, boxW = 300, boxH = 580, still = false, focus = 0.5,
}: { src: string; alt: string; label?: string; natW?: number; natH: number; boxW?: number; boxH?: number; still?: boolean; focus?: number }) {
  const reduced = useReducedMotion();
  const imgH = boxW * (natH / natW);
  const dist = Math.max(0, imgH - boxH);
  const duration = Math.max(12, dist / 42);
  // still 模式:不滚动,直接定位到 focus(0-1,图像高度上的锚点)
  const stillY = -Math.min(dist, Math.max(0, imgH * focus - boxH / 2));
  return (
    <figure className="flex h-full flex-col items-center justify-center">
      <div className="overflow-hidden rounded-[14px]" style={{ width: boxW, height: boxH }}>
        <motion.img
          src={src} alt={alt} decoding="async"
          style={{ width: boxW, height: imgH, display: "block" }}
          initial={{ y: still ? stillY : 0 }}
          animate={still || reduced || dist === 0 ? { y: still ? stillY : 0 } : { y: [0, -dist, 0] }}
          transition={still
            ? { duration: 0 }
            : { duration: duration * 2, times: [0, 0.5, 1], repeat: Infinity, ease: "linear", delay: 1.4 }}
        />
      </div>
      {label && (
        <figcaption className="mt-3 flex shrink-0 items-center justify-center gap-2 text-[10px] tracking-[0.18em]"
          style={{ color: U.muted }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: U.accent }} />
          {label}
        </figcaption>
      )}
    </figure>
  );
}

// ─── 左文右图分栏页(文字单栏) ────────────────────────────────────────────────
function Split({
  eye, title, body, extras, media, titleWipeDelay = 1.1, mediaW = 420,
}: {
  eye: string; title: string; body?: string; extras?: ReactNode; media: ReactNode; titleWipeDelay?: number; mediaW?: number;
}) {
  return (
    <section className="flex h-full items-center" style={{ padding: "0 72px" }}>
      <div className="grid h-full w-full items-center gap-12" style={{ gridTemplateColumns: `minmax(0,1fr) ${mediaW}px` }}>
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{eye}</Eye></motion.div>
          <Mask delay={0.12}>
            <h2 className="mt-6 font-light leading-[1.35] tracking-[-0.015em]"
              style={{ fontSize: 29, color: U.ink }}>
              <Rich text={title} wipe wipeDelay={titleWipeDelay} />
            </h2>
          </Mask>
          {body && (
            <motion.p variants={UP} className="mt-5 max-w-[560px] text-[14.5px] font-light leading-[2]"
              style={{ color: U.inkLight }}>
              <Rich text={body} />
            </motion.p>
          )}
          {extras}
        </motion.div>
        <motion.div className="h-[600px] min-w-0"
          initial={{ opacity: 0, y: 24, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: E, delay: 0.3 }}>
          {media}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────────────────────

// §00 封面
function SlideCover() {
  const c = useC("cover");
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden" style={{ padding: "0 88px" }}>
      <motion.span aria-hidden className="absolute right-[88px] top-[64px] block h-2.5 w-2.5"
        style={{ background: U.accent }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: E, delay: 1.9 }} />

      <div className="relative z-10">
        <Eye dark delay={0.15}>{c("eye")}</Eye>
        <div className="mt-10">
          <Mask delay={0.4}>
            <h1 className="font-extralight leading-[1.05] tracking-[-0.01em] text-white" style={{ fontSize: 92 }}>
              <Rich text={c("title")} wipe wipeDelay={1.35} />
            </h1>
          </Mask>
        </div>
        <div className="mt-7">
          <Mask delay={0.62}>
            <p className="font-extralight leading-[1.5] tracking-[0.01em]" style={{ fontSize: 24, color: "rgba(255,255,255,0.78)" }}>
              <Rich text={c("sub")} />
            </p>
          </Mask>
        </div>
      </div>

      <motion.div
        className="absolute inset-x-[88px] bottom-[48px] z-10 flex items-center justify-between"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: E, delay: 1.7 }}>
        <span className="text-[11.5px] font-light tracking-[0.06em]" style={{ color: "rgba(255,255,255,0.62)" }}>
          {plain(c("credit"))}
        </span>
        <span className="text-[11.5px] font-light tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.62)" }}>
          {plain(c("name"))}
        </span>
      </motion.div>
    </section>
  );
}

// §00b 背景:超级应用类比(Uber + Yelp + TaskRabbit)
function SlideContext() {
  const c = useC("context");
  const analogy = [
    { icon: "/assets/meituan-im/logos/uber-icon.png",       name: "Uber",       key: "u" },
    { icon: "/assets/meituan-im/logos/yelp-icon.png",       name: "Yelp",       key: "y" },
    { icon: "/assets/meituan-im/logos/taskrabbit-icon.png", name: "TaskRabbit", key: "t" },
  ];
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="w-full max-w-[1000px]">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.12}>
          <h2 className="mt-6 font-light leading-[1.35] tracking-[-0.015em]" style={{ fontSize: 34, color: U.ink }}>
            <Rich text={c("title")} wipe />
          </h2>
        </Mask>
        <div className="mt-12 grid max-w-[880px] grid-cols-3 gap-4">
          {analogy.map((a, i) => (
            <motion.div key={a.name} className="rounded-2xl px-7 py-7" style={{ background: U.bg }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.5 + i * 0.14 }}>
              <div className="flex items-center gap-3">
                <img src={a.icon} alt={`${a.name} logo`} className="h-[26px] w-[26px] shrink-0 rounded-[6px] object-contain"
                  loading="lazy" decoding="async" />
                <p className="text-[16px] font-medium tracking-tight" style={{ color: U.ink }}>{a.name}</p>
              </div>
              <p className="mt-3 text-[13.5px] font-light leading-relaxed" style={{ color: U.inkLight }}>{plain(c(a.key))}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// §01 我的职责与角色
function SlideRole() {
  const c = useC("role");
  const t = useT();
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))}
      title={c("title")}
      body={c("body")}
      media={
        <div className="flex h-full flex-col justify-center">
          <div className="flex flex-col rounded-2xl px-10 py-12" style={{ background: U.bg }}>
            <img src="/assets/meituan-im/meituan-logo.png" alt="Meituan"
              className="h-7 w-auto self-start object-contain object-left" decoding="async" />
            <div className="mt-10">
              <p className="font-light leading-none tracking-[-0.02em]" style={{ fontSize: 52, color: U.ink }}>
                {lang === "en"
                  ? <CountUp to={770} suffix="M+" format={(n) => String(Math.round(n))} startDelay={600} />
                  : <CountUp to={7.7} suffix=" 亿+" format={(n) => n.toFixed(1)} startDelay={600} />}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.14em]" style={{ color: U.muted }}>{t("users")}</p>
            </div>
            <div className="mt-9">
              <p className="font-light leading-none tracking-[-0.02em]" style={{ fontSize: 52, color: U.ink }}>
                {lang === "en"
                  ? <CountUp to={14.5} suffix="M" format={(n) => n.toFixed(1)} startDelay={800} />
                  : <CountUp to={1450} suffix=" 万" startDelay={800} />}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.14em]" style={{ color: U.muted }}>{t("merchants")}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

// §02 用户原声(深色引言页)
function SlideVoice() {
  const c = useC("voice");
  return (
    <section className="relative flex h-full flex-col justify-center overflow-hidden" style={{ padding: "0 88px" }}>
      <motion.span aria-hidden className="absolute left-[72px] top-[96px] font-extralight leading-none"
        style={{ fontSize: 160, color: "rgba(255,209,0,0.14)" }}
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: E, delay: 0.2 }}>
        “
      </motion.span>
      <div className="relative z-10">
        <Eye dark delay={0.1}>{plain(c("eye"))}</Eye>
        <div className="mt-9 max-w-[1000px]">
          {(["l1", "l2", "l3"] as const).map((k, i) => (
            <Mask key={k} delay={0.35 + i * 0.2}>
              <p className="font-extralight leading-[1.7] tracking-[0.005em] text-white" style={{ fontSize: 30 }}>
                <Rich text={c(k)} wipe wipeDelay={1.6} />
              </p>
            </Mask>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: E, delay: 1.4 }}
          className="mt-10 text-[11px] font-semibold tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.5)" }}>
          {plain(c("src"))}
        </motion.p>
      </div>
    </section>
  );
}

// §03 信任断裂
function SlideBroken() {
  const c = useC("broken");
  const steps = plain(c("steps")).split("\n").filter(Boolean);
  return (
    <Split
      eye={plain(c("eye"))}
      title={c("title")}
      body={c("body")}
      media={
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl px-9 py-9" style={{ background: U.bg }}>
            <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: U.muted }}>{plain(c("panel"))}</p>
            <ol className="mt-4">
              {steps.map((t, i) => (
                <motion.li key={`${t}-${i}`} className="flex items-baseline gap-4 py-3"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: E, delay: 0.5 + i * 0.12 }}>
                  <span className="text-[10px] tabular-nums" style={{ color: U.mutedSoft }}>0{i + 1}</span>
                  <p className="text-[14.5px] font-light tracking-tight" style={{ color: U.inkLight }}>{t}</p>
                </motion.li>
              ))}
            </ol>
            <motion.div className="mt-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: E, delay: 1.1 }}>
              <p className="text-[10px] font-semibold tracking-[0.18em]" style={{ color: U.ink }}>{plain(c("breakT"))}</p>
              <p className="mt-1.5 text-[13px] font-light leading-relaxed" style={{ color: U.muted }}>{plain(c("breakN"))}</p>
            </motion.div>
          </div>
        </div>
      }
    />
  );
}

// §04 失败的前置尝试
function SlideFirstTry() {
  const c = useC("firsttry");
  return (
    <Split
      eye={plain(c("eye"))}
      title={c("title")}
      body={c("body")}
      extras={
        <motion.div variants={UP} className="mt-7 max-w-[560px] border-l-2 pl-5" style={{ borderColor: U.ink }}>
          <p className="text-[14px] font-light leading-[1.95]" style={{ color: U.inkSoft }}>
            <Rich text={c("insight")} />
          </p>
        </motion.div>
      }
      media={
        <div className="flex h-full flex-col justify-center">
          <motion.div className="rounded-2xl px-9 py-10"
            style={{ background: U.bg }}
            initial={{ opacity: 0, rotate: 1.2 }} animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: E, delay: 0.45 }}>
            <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: U.muted }}>{plain(c("revLabel"))}</p>
            <div className="mt-5 flex items-center gap-1 text-[15px]" aria-hidden>
              <motion.span style={{ color: U.accent }}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: E, delay: 0.9 }}>★</motion.span>
              <span style={{ color: U.hairline }}>★★★★</span>
            </div>
            <p className="mt-4 text-[16px] font-light leading-[2]" style={{ color: U.ink }}>
              <Rich text={c("review")} />
            </p>
            <p className="mt-5 text-[11.5px] font-light leading-relaxed" style={{ color: U.muted }}>{plain(c("revNote"))}</p>
          </motion.div>
        </div>
      }
    />
  );
}

// §05 方案探索 A/B
function SlideOptionsAB() {
  const c = useC("optionsAB");
  const lang = useLang();
  const options = [
    { tag: lang === "en" ? "Option A" : "方案 A", title: c("aT"), body: c("aB"), pain: c("aP") },
    { tag: lang === "en" ? "Option B" : "方案 B", title: c("bT"), body: c("bB"), pain: c("bP") },
  ];
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="w-full">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.12}>
          <h2 className="mt-6 font-light tracking-[-0.02em]" style={{ fontSize: 30, color: U.ink }}>
            <Rich text={c("title")} wipe />
          </h2>
        </Mask>
        <div className="mt-8 max-w-[980px]">
          {options.map((o, i) => (
            <motion.div key={o.tag} className="py-6"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: E, delay: 0.4 + i * 0.18 }}>
              <div className="flex items-baseline gap-4">
                <span className="rounded-full px-2.5 py-[3px] text-[10px] font-semibold tracking-[0.14em]"
                  style={{ background: U.bg, color: U.muted }}>
                  {o.tag}
                </span>
                <p className="text-[17px] font-medium tracking-tight" style={{ color: U.ink }}>{plain(o.title)}</p>
              </div>
              <p className="mt-3 text-[13.5px] font-light leading-[1.9]" style={{ color: U.inkLight }}><Rich text={o.body} /></p>
              <p className="mt-1.5 text-[13px] font-light leading-[1.85]" style={{ color: U.muted }}><Rich text={o.pain} /></p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// §06 方案 C — 最终选定
function SlideOptionC() {
  const c = useC("optionC");
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="w-full max-w-[1000px]">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.15}>
          <h2 className="mt-8 font-light leading-[1.6] tracking-[-0.01em]" style={{ fontSize: 34, color: U.ink }}>
            <Rich text={c("title")} wipe wipeDelay={1.1} />
          </h2>
        </Mask>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: E, delay: 1.5 }}
          className="mt-12 max-w-[760px] border-l-2 pl-5" style={{ borderColor: U.ink }}>
          <p className="text-[14px] font-light leading-[1.95]" style={{ color: U.inkSoft }}>
            <Rich text={c("note")} />
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §07 服务蓝图
function SlideBlueprint() {
  const c = useC("blueprint");
  const steps = c("steps").split("\n").filter(Boolean);
  return (
    <section className="flex h-full items-center" style={{ padding: "0 72px" }}>
      <div className="grid h-full w-full items-center gap-12" style={{ gridTemplateColumns: "minmax(0,1fr) 640px" }}>
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
          <Mask delay={0.12}>
            <h2 className="mt-6 font-light leading-[1.35] tracking-[-0.015em]" style={{ fontSize: 27, color: U.ink }}>
              <Rich text={c("title")} wipe />
            </h2>
          </Mask>
          <ol className="mt-8 max-w-[440px]">
            {steps.map((t, i) => (
              <motion.li key={`${t}-${i}`} className="flex items-baseline gap-4 py-[11px]"
                initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: E, delay: 0.5 + i * 0.14 }}>
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: U.ink }}>
                  0{i + 1}
                </span>
                <p className="text-[15px] font-light tracking-tight" style={{ color: U.ink }}>
                  <Rich text={t} />
                </p>
                {i < steps.length - 1 && <span className="ml-auto text-[13px]" style={{ color: U.mutedSoft }} aria-hidden>➔</span>}
              </motion.li>
            ))}
          </ol>
        </motion.div>
        <motion.div className="min-w-0"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: E, delay: 0.35 }}>
          <ServiceBlueprint />
        </motion.div>
      </div>
    </section>
  );
}

// §08 报价到履约的完整交易流 — 深色整页重绘:6 阶段 × 3 泳道,块状卡片
const TXN_DATA: Record<Lang, { phases: string[]; lanes: { name: string; cells: string[]; decision?: number }[] }> = {
  zh: {
    phases: ["上架", "询价匹配", "预订报价", "选定下单", "履约", "尾款核销"],
    lanes: [
      { name: "用户", cells: ["", "发起询价(RFQ)", "", "查看报价,选定商家并下单", "", "在线支付尾款"], decision: 3 },
      { name: "平台", cells: ["定义并上架商品", "匹配商品与需求单", "创建预订", "创建订单,绑定商家门店", "", "创建尾款订单"] },
      { name: "商家", cells: ["", "", "接收预订,接受并报价", "收到下单确认", "上门完成服务", "确认核销"] },
    ],
  },
  en: {
    phases: ["Listing", "Inquiry & match", "Booking & quote", "Pick & order", "Fulfilment", "Balance & redeem"],
    lanes: [
      { name: "User", cells: ["", "Start a quote request", "", "See quotes, pick one, order", "", "Pay the balance online"], decision: 3 },
      { name: "Platform", cells: ["List the service", "Match it to the request", "Create the booking", "Create the order, bind the store", "", "Create the balance order"] },
      { name: "Merchant", cells: ["", "", "Receive and quote", "Get the confirmation", "Do the on-site service", "Confirm redemption"] },
    ],
  },
};

// 交接顺序:[泳道, 列] — 平台上架 → 用户询价 → 平台匹配 → 平台创建预订 → 商家接受报价
// → 用户选定下单 → 平台创建订单 → 商家收到确认 → 商家上门 → 平台创建尾款单 → 用户支付 → 商家核销
const TXN_FLOW: [number, number][] = [
  [1, 0], [0, 1], [1, 1], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3], [2, 4], [1, 5], [0, 5], [2, 5],
];

function SlideTxn() {
  const c = useC("txn");
  const lang = useLang();
  const t = useT();
  const TXN_PHASES = TXN_DATA[lang].phases;
  const TXN_LANES = TXN_DATA[lang].lanes;
  const wrapRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLElement | null>>({});
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 72px" }}>
      <div className="w-full">
        <Eye dark delay={0.05}>{plain(c("eye"))}</Eye>
        <Mask delay={0.2}>
          <h2 className="mt-4 font-light tracking-[-0.015em] text-white" style={{ fontSize: 27 }}>
            <Rich text={c("title")} />
          </h2>
        </Mask>
        {/* 阶段时间轴 */}
        <div className="mt-8 grid grid-cols-6 gap-2.5">
          {TXN_PHASES.map((s, i) => (
            <motion.div key={s} className="flex items-baseline gap-1.5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: E, delay: 0.4 + i * 0.07 }}>
              <span className="text-[10px] tabular-nums" style={{ color: U.accent }}>0{i + 1}</span>
              <span className="text-[12.5px] font-medium tracking-tight text-white">{s}</span>
            </motion.div>
          ))}
        </div>
        {/* 三条泳道,块状卡片 + 交接箭头 */}
        <div className="relative" ref={wrapRef}>
        {TXN_LANES.map((lane, li) => (
          <div key={lane.name} className="mt-4">
            <p className="mb-2 text-[9.5px] font-semibold tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.42)" }}>
              {lane.name}
            </p>
            <div className="grid grid-cols-6 gap-2.5">
              {lane.cells.map((cell, ci) => (
                <motion.div key={ci}
                  ref={(el) => { cellRefs.current[`${li}-${ci}`] = el; }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: E, delay: 0.55 + li * 0.14 + ci * 0.06 }}
                  className="flex min-h-[84px] items-start rounded-xl px-3.5 py-3"
                  style={cell === ""
                    ? { background: "rgba(255,255,255,0.03)" }
                    : lane.decision === ci
                      ? { background: U.accent }
                      : { background: "#1D1D1D" }}>
                  {cell !== "" && (
                    <p className="text-[12px] font-light leading-[1.55] tracking-tight"
                      style={{ color: lane.decision === ci ? U.accentInk : "rgba(255,255,255,0.87)" }}>
                      {cell}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        <SwimlaneArrows wrapRef={wrapRef} cellRefs={cellRefs} seq={TXN_FLOW} id="txn-arrow" dep={lang} />
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-6 text-[10.5px] font-light tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.42)" }}>
          <span className="mr-2 inline-block h-2 w-2 rounded-[3px] align-middle" style={{ background: U.accent }} />
          {t("txnNote")}
        </motion.p>
      </div>
    </section>
  );
}

// §09 前置诊断 — 中文上线版 + 英文重构版并排
function SlideDiagnose() {
  const c = useC("diagnose");
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={620}
      media={
        <div className="grid h-full grid-cols-2 gap-4">
          <ScrollShot src="/assets/meituan-im/screen-07-diagnosis-start.jpg" alt={lang === "en" ? "Diagnosis start (Chinese shipped version)" : "诊断起始状态(中文)"} label={plain(c("capZh"))} natH={9090} boxW={290} boxH={560} />
          {/* seek=13 停在专家给出诊断结论的对话时刻 */}
          <DeckPhone flow="default" seek={13} caption={plain(c("capEn"))} boxW={290} boxH={560} fill />
        </div>
      }
    />
  );
}

// §10 结构化需求单 — 中文上线版 + 英文重构版并排
function SlideOrder() {
  const c = useC("order");
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={620}
      media={
        <div className="grid h-full grid-cols-2 gap-4">
          <ScrollShot src="/assets/meituan-im/screen-11-diagnosis-product-rec.jpg" alt={lang === "en" ? "Structured repair order (Chinese shipped version)" : "结构化维修需求单(中文)"} label={plain(c("capZh"))} natH={10032} boxW={290} boxH={560} still focus={0.86} />
          <DeckPhone flow="default" caption={plain(c("capEn"))} boxW={290} boxH={560} fill />
        </div>
      }
    />
  );
}

// §11 实时询价 — 中文上线版 + 英文重构版并排
function SlideQuoting() {
  const c = useC("quoting");
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={620}
      media={
        <div className="grid h-full grid-cols-2 gap-4">
          <ScrollShot src="/assets/meituan-im/screen-02-live-quoting.jpg" alt={lang === "en" ? "Live quoting state (Chinese shipped version)" : "实时报价中状态(中文)"} label={plain(c("capZh"))} natH={5388} boxW={290} boxH={560} />
          {/* seek=20 直接落在实时报价卡(revised 脚本 quotes 在第 19 步) */}
          <DeckPhone flow="default" seek={20} caption={plain(c("capEn"))} boxW={290} boxH={560} fill />
        </div>
      }
    />
  );
}

// §12 有反馈的对话流
function SlideDialogflow() {
  const c = useC("dialogflow");
  return (
    <section className="flex h-full items-center" style={{ padding: "0 72px" }}>
      <div className="grid h-full w-full items-center gap-14" style={{ gridTemplateColumns: "minmax(0,1fr) 520px" }}>
        <motion.div variants={STG} initial="hidden" animate="show" className="flex min-w-0 flex-col justify-center">
          <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
          <Mask delay={0.12}>
            <h2 className="mt-6 font-light leading-[1.4] tracking-[-0.015em]" style={{ fontSize: 28, color: U.ink }}>
              <Rich text={c("title")} wipe />
            </h2>
          </Mask>
          <motion.p variants={UP} className="mt-5 max-w-[560px] text-[14.5px] font-light leading-[2]" style={{ color: U.inkLight }}>
            <Rich text={c("body")} />
          </motion.p>
        </motion.div>
        <motion.div className="h-[600px] min-w-0"
          initial={{ opacity: 0, y: 24, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: E, delay: 0.3 }}>
          <DeckPhone flow="default" caption={plain(c("cap"))} boxW={320} boxH={560} />
        </motion.div>
      </div>
    </section>
  );
}

// §13 报价卡片的 5 种微状态 — 标签可点击,右侧原型切到对应场景;
//     选中“报价过期”时,下方展开“硬过期,软延续”的叙述
const STATE_FLOWS = ["default", "return-visit", "expired-chat", "off-hours", "cat-litter"];
const EXPIRED_IDX = 2;
function SlideStates() {
  const c = useC("states");
  const t = useT();
  const chips = plain(c("chips")).split("\n").filter(Boolean);
  const [active, setActive] = useState(EXPIRED_IDX); // 默认展示“报价过期”
  const flow = STATE_FLOWS[Math.min(active, STATE_FLOWS.length - 1)] ?? "default";
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")}
      extras={
        <>
          <div className="mt-6 flex max-w-[520px] flex-wrap gap-2.5">
            {chips.map((s, i) => {
              const on = i === active;
              return (
                <motion.button key={`${s}-${i}`} type="button" onClick={() => setActive(i)}
                  className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-300"
                  style={on
                    ? { background: U.accent, color: U.accentInk }
                    : { background: U.bg, color: U.inkSoft }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: E, delay: 0.9 + i * 0.08 }}
                  whileTap={{ scale: 0.96 }}>
                  {s}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {active === EXPIRED_IDX && (
              <motion.div key="expired-note"
                className="max-w-[540px] overflow-hidden border-l-2 pl-4"
                style={{ borderColor: U.ink }}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 22 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.5, ease: E }}>
                <p className="text-[13px] font-light leading-[1.9]" style={{ color: U.inkSoft }}>
                  <Rich text={c("expiredNote")} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      }
      media={<DeckPhone key={flow} flow={flow} caption={`${t("livePrefix")}${chips[active] ?? ""}`} />}
    />
  );
}

// §14 商家端如何报价
function SlideMerchant() {
  const c = useC("merchant");
  const t = useT();
  const lang = useLang();
  const ready = useAfterEnter();
  const [loaded, setLoaded] = useState(false);
  const NW = 1110, NH = 820;
  const boxW = 1136, boxH = 520;
  const scale = Math.min(boxW / NW, boxH / NH);
  return (
    <section className="flex h-full flex-col" style={{ padding: "44px 72px 28px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="shrink-0">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.12}>
          <h2 className="mt-4 max-w-4xl font-light tracking-[-0.015em]" style={{ fontSize: 27, color: U.ink }}>
            <Rich text={c("title")} wipe />
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-3 max-w-[760px] text-[13.5px] font-light leading-[1.8]" style={{ color: U.inkLight }}>
          <Rich text={c("body")} />
        </motion.p>
      </motion.div>
      <motion.div className="relative mt-3 min-h-0 flex-1 overflow-hidden"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: E, delay: 0.35 }}>
        {ready && (
          <iframe
            src="/assets/meituan-im/Revised%20Repair%20Flow.html#flow=merchant&rail=0"
            title={lang === "en" ? "Merchant quoting workbench — live prototype" : "商家报价工作台 — 实时原型"}
            loading="lazy"
            onLoad={() => setTimeout(() => setLoaded(true), 420)}
            style={{
              position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
              opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
            }}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] tracking-[0.2em]" style={{ color: U.mutedSoft }}>{t("loading")}</span>
          </div>
        )}
      </motion.div>
    </section>
  );
}

// §15 反向信任:劝退与自助
function SlideSelfserve() {
  const c = useC("selfserve");
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")}
      media={<DeckPhone flow="cat-litter" caption={plain(c("cap"))} />}
    />
  );
}

// §17 设计系统升级:北美本地化重构 — 展示此前的几款原型尝试
function SlideRedesign() {
  const c = useC("redesign");
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={640}
      media={
        <div className="grid h-full grid-cols-2 gap-4">
          <ScaledEmbed
            src="/assets/meituan-im/interaction-flow-phone.html#flow=default&rail=0"
            title={lang === "en" ? "Early prototype version" : "早期版本原型"} natW={480} natH={1010} boxW={290} boxH={560} fit="cover"
            caption={plain(c("capA"))} />
          {/* 右侧:最开始的 Repair Flow(v1 bundle),迭代叙事的第二步 */}
          <DeckPhone flow="default" src="/assets/meituan-im/Repair%20Flow.html" caption={plain(c("capB"))} boxW={290} boxH={560} fill />
        </div>
      }
    />
  );
}

// §17b 预设未来:AI Agent 替代人工专家 — 左文右原型,深链 ai-agent workflow
function SlideAiAgent() {
  const c = useC("aiagent");
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")}
      media={<DeckPhone flow="ai-agent" caption={plain(c("cap"))} boxW={320} boxH={560} />}
    />
  );
}

// §18a ADA · 01 降低信息密度 — 上线版高密度 vs 重构版留白,直接对比
function SlideAda1() {
  const c = useC("ada1");
  const lang = useLang();
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={620}
      media={
        <div className="grid h-full grid-cols-2 gap-4">
          <ScrollShot src="/assets/meituan-im/screen-07-diagnosis-start.jpg" alt={lang === "en" ? "Shipped version (dense)" : "上线版(高密度)"} label={plain(c("capZh"))} natH={9090} boxW={290} boxH={560} still focus={0.04} />
          <DeckPhone flow="default" caption={plain(c("capEn"))} boxW={290} boxH={560} fill />
        </div>
      }
    />
  );
}

// §18b ADA · 02 无障碍适配 — 规格面板
function SlideAda2() {
  const c = useC("ada2");
  const lang = useLang();
  const specs = lang === "en"
    ? [
        { n: "44×44", unit: "pt", d: "Minimum touch target" },
        { n: "≥12", unit: "px", d: "Minimum type size" },
        { n: "100", unit: "%", d: "Cards readable by screen reader" },
      ]
    : [
        { n: "44×44", unit: "pt", d: "最小点击热区" },
        { n: "≥12", unit: "px", d: "最小可用字号" },
        { n: "100", unit: "%", d: "卡片支持屏幕阅读器朗读" },
      ];
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")}
      media={
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl px-10 py-8" style={{ background: U.bg }}>
            {specs.map((s, i) => (
              <motion.div key={s.d} className="py-5"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: E, delay: 0.6 + i * 0.16 }}>
                <p className="font-light leading-none tracking-[-0.02em]" style={{ fontSize: 44, color: U.ink }}>
                  {s.n}<span className="text-[0.45em]" style={{ color: U.muted }}> {s.unit}</span>
                </p>
                <p className="mt-2 text-[11px] tracking-[0.14em]" style={{ color: U.muted }}>{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      }
    />
  );
}

// §18c ADA · 03 北美本地化 — 转换前 → 转换后 格式面板
function SlideAda3() {
  const c = useC("ada3");
  const lang = useLang();
  const rows = lang === "en"
    ? [
        { k: "Dates", a: "2025-08-12", b: "08/12/2025" },
        { k: "Units & currency", a: "¥200 · 5 km", b: "$45-60 · 3.1 mi" },
        { k: "Copy tone", a: "师傅已接单", b: "A pro's on it" },
      ]
    : [
        { k: "日期格式", a: "2025-08-12", b: "08/12/2025" },
        { k: "单位与货币", a: "¥200 · 5 公里", b: "$45-60 · 3.1 mi" },
        { k: "文案语境", a: "师傅已接单", b: "A pro's on it" },
      ];
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")} mediaW={460}
      media={
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl px-9 py-6" style={{ background: U.bg }}>
            {rows.map((r, i) => (
              <motion.div key={r.k} className="py-5"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: E, delay: 0.55 + i * 0.16 }}>
                <p className="text-[10px] font-semibold tracking-[0.18em]" style={{ color: U.muted }}>{r.k}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[15px] font-light tracking-tight" style={{ color: U.mutedSoft, textDecoration: "line-through", textDecorationColor: U.mutedSoft }}>
                    {r.a}
                  </span>
                  <span className="text-[13px]" style={{ color: U.accentInk }} aria-hidden>➔</span>
                  <span className="text-[16px] font-medium tracking-tight" style={{ color: U.ink }}>{r.b}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      }
    />
  );
}

// §19 通用组件迁移
function SlideTokens() {
  const c = useC("tokens");
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="w-full max-w-[1000px]">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.15}>
          <h2 className="mt-8 font-light leading-[1.6] tracking-[-0.01em]" style={{ fontSize: 32, color: U.ink }}>
            <Rich text={c("title")} wipe wipeDelay={1.1} />
          </h2>
        </Mask>
      </motion.div>
    </section>
  );
}

// §20 灰度实测数据(深色)
function SlideImpact() {
  const c = useC("impact");
  const lang = useLang();
  const headers = lang === "en"
    ? ["Category", "Before", "After", "Lift"]
    : ["灰度品类", "灰度前转化率", "灰度后转化率", "提升表现"];
  const rows = lang === "en"
    ? [
        { cat: "Toilet repair",   before: "9%",  after: "11.7%", lift: "+30% relative" },
        { cat: "Drain clearing",  before: "17%", after: "22%",   lift: "+29.4% relative" },
      ]
    : [
        { cat: "马桶维修", before: "9%",  after: "11.7%", lift: "相对提升 30%" },
        { cat: "通管道",   before: "17%", after: "22%",   lift: "相对提升 29.4%" },
      ];
  const stats = [
    { v: <CountUp to={1.3} suffix="×" format={(n) => n.toFixed(1)} startDelay={1400} />, d: c("s1"), key: true },
    { v: <CountUp to={0.5} prefix="+" suffix="pp" format={(n) => n.toFixed(1)} startDelay={1550} />, d: c("s2") },
    { v: <CountUp to={2000} prefix="~" startDelay={1700} format={(n) => String(Math.round(n))} />, d: c("s3") },
    { v: <CountUp to={50} prefix="−" suffix="%" startDelay={1850} />, d: c("s4") },
  ];
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <div className="w-full max-w-[1050px]">
        <Eye dark delay={0.05}>{plain(c("eye"))}</Eye>
        <Mask delay={0.25}>
          <h2 className="mt-5 font-light tracking-[-0.015em] text-white" style={{ fontSize: 27 }}>
            <Rich text={c("title")} />
          </h2>
        </Mask>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: E, delay: 0.55 }}
          className="mt-7 overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-4 px-6 py-2.5 text-[10px] font-semibold tracking-[0.14em]"
            style={{ color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            {headers.map((h) => <span key={h}>{h}</span>)}
          </div>
          {rows.map((r, i) => (
            <motion.div key={r.cat} className="grid grid-cols-4 px-6 py-3 text-[14px] font-light text-white"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}>
              <span className="font-medium">{r.cat}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{r.before}</span>
              <span>{r.after}</span>
              <span style={{ color: U.accent }}>{r.lift}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6">
          {stats.map((s, i) => (
            <motion.div key={i} className="flex items-baseline gap-6 py-[10px]"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 1.15 + i * 0.14 }}>
              <p className="w-[130px] shrink-0 text-right font-light leading-none tabular-nums"
                style={{ fontSize: 30, color: s.key ? U.accent : "#FFFFFF" }}>
                {s.v}
              </p>
              <p className="text-[13px] font-light" style={{ color: "rgba(255,255,255,0.72)" }}><Rich text={s.d} /></p>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.9 }}
          className="mt-5 text-[11px] font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
          {plain(c("note"))}
        </motion.p>
      </div>
    </section>
  );
}

// §21 多模态 AI 替诊
function SlideAi() {
  const c = useC("ai");
  const t = useT();
  const pipe = plain(c("pipe")).split("\n").filter(Boolean);
  return (
    <Split
      eye={plain(c("eye"))} title={c("title")} body={c("body")}
      media={
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl px-9 py-9" style={{ background: U.bg }}>
            <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: U.muted }}>{t("pipeline")}</p>
            <div className="mt-6">
              {pipe.map((t, i) => (
                <motion.div key={`${t}-${i}`} className="relative pl-7 pb-7 last:pb-0"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: E, delay: 0.55 + i * 0.16 }}>
                  {i < pipe.length - 1 && (
                    <span aria-hidden className="absolute left-[5px] top-4 w-px"
                      style={{ background: U.mutedSoft, height: "calc(100% - 8px)" }} />
                  )}
                  <span className="absolute left-0 top-[5px] block h-[11px] w-[11px] rounded-full"
                    style={{ background: i === pipe.length - 1 ? U.accent : U.surface, border: `2px solid ${i === pipe.length - 1 ? U.accent : U.mutedSoft}` }} />
                  <p className="text-[14px] font-light leading-relaxed tracking-tight" style={{ color: U.inkSoft }}>{t}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}

// §22 机制风险:履约分 — 纯文字陈述页(右侧暂不配素材)
function SlideRisk() {
  const c = useC("risk");
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="w-full max-w-[880px]">
        <motion.div variants={FADE}><Eye>{plain(c("eye"))}</Eye></motion.div>
        <Mask delay={0.12}>
          <h2 className="mt-6 font-light leading-[1.4] tracking-[-0.015em]" style={{ fontSize: 34, color: U.ink }}>
            <Rich text={c("title")} wipe wipeDelay={1.1} />
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-7 max-w-[760px] text-[14.5px] font-light leading-[2]" style={{ color: U.inkLight }}>
          <Rich text={c("body")} />
        </motion.p>
        <motion.div variants={UP} className="mt-9 max-w-[640px] border-l-2 pl-5" style={{ borderColor: U.ink }}>
          <p className="text-[11.5px] font-semibold tracking-[0.08em]" style={{ color: U.ink }}>{plain(c("noteT"))}</p>
          <p className="mt-1.5 text-[13.5px] font-light leading-[1.9]" style={{ color: U.inkLight }}>
            <Rich text={c("noteB")} />
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

// §23 完整可交互原型
function SlideProto() {
  const c = useC("proto");
  const t = useT();
  const lang = useLang();
  const ready = useAfterEnter();
  const [loaded, setLoaded] = useState(false);
  const NW = 1200, NH = 1080;
  const boxW = 1136, boxH = 560;
  const scale = Math.min(boxW / NW, boxH / NH);
  return (
    <section className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 px-10 py-4">
        <Eye>{plain(c("eye"))}</Eye>
        <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
          className="text-[10px] font-medium tracking-[0.18em] transition-colors"
          style={{ color: U.muted }}>
          {t("openFull")}
        </a>
      </div>
      <motion.div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: U.bg }}
        initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
        {ready && (
          <iframe
            src="/assets/meituan-im/Revised%20Repair%20Flow.html"
            title={lang === "en" ? "Full interactive prototype" : "完整可交互原型"}
            loading="lazy"
            onLoad={() => setTimeout(() => setLoaded(true), 420)}
            style={{
              position: "absolute", left: "50%", top: "50%", width: NW, height: NH, border: 0,
              transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
              opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease",
            }}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="text-[10px] tracking-[0.2em]" style={{ color: U.mutedSoft }}>{t("loading")}</span>
          </div>
        )}
      </motion.div>
      <div className="shrink-0 px-10 py-2.5">
        <p className="text-[11px] font-light leading-relaxed" style={{ color: U.inkLight }}>{plain(c("note"))}</p>
      </div>
    </section>
  );
}

// §24 收尾
function SlideClosing() {
  const c = useC("closing");
  const t = useT();
  return (
    <section className="flex h-full flex-col justify-center" style={{ padding: "0 88px" }}>
      <motion.div variants={STG} initial="hidden" animate="show" className="max-w-[900px]">
        <motion.div variants={FADE} className="mb-10 h-px w-12" style={{ background: U.ink }} />
        <Mask delay={0.12}>
          <h2 className="font-light leading-[1.4] tracking-[-0.015em]" style={{ fontSize: 44, color: U.ink }}>
            <Rich text={c("title")} wipe wipeDelay={1.1} />
          </h2>
        </Mask>
        <motion.p variants={UP} className="mt-10 text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: U.muted }}>
          {plain(c("credit"))}
        </motion.p>
        <motion.div variants={UP} className="mt-10 flex flex-wrap items-center gap-6">
          <a href="/work/meituan-im/prototype" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[13px] font-medium text-white transition-colors duration-300"
            style={{ background: U.ink }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1F1F1F")}
            onMouseLeave={(e) => (e.currentTarget.style.background = U.ink)}>
            {t("tryProto")}
            <span className="transition-transform duration-500 group-hover:translate-x-0.5" aria-hidden>→</span>
          </a>
          <Link href="/work/meituan-im"
            className="text-[10px] font-semibold uppercase tracking-[0.24em] underline underline-offset-4 transition-colors"
            style={{ color: U.muted, textDecorationColor: U.hairline }}>
            {t("caseLink")}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Slide renderer ───────────────────────────────────────────────────────────
function SlideRenderer({ id }: { id: SlideId }) {
  switch (id) {
    case "cover":      return <SlideCover />;
    case "context":    return <SlideContext />;
    case "role":       return <SlideRole />;
    case "voice":      return <SlideVoice />;
    case "broken":     return <SlideBroken />;
    case "firsttry":   return <SlideFirstTry />;
    case "optionsAB":  return <SlideOptionsAB />;
    case "optionC":    return <SlideOptionC />;
    case "blueprint":  return <SlideBlueprint />;
    case "txn":        return <SlideTxn />;
    case "diagnose":   return <SlideDiagnose />;
    case "order":      return <SlideOrder />;
    case "quoting":    return <SlideQuoting />;
    case "dialogflow": return <SlideDialogflow />;
    case "states":     return <SlideStates />;
    case "merchant":   return <SlideMerchant />;
    case "selfserve":  return <SlideSelfserve />;
    case "redesign":   return <SlideRedesign />;
    case "aiagent":    return <SlideAiAgent />;
    case "ada1":       return <SlideAda1 />;
    case "ada2":       return <SlideAda2 />;
    case "ada3":       return <SlideAda3 />;
    case "tokens":     return <SlideTokens />;
    case "impact":     return <SlideImpact />;
    case "ai":         return <SlideAi />;
    case "risk":       return <SlideRisk />;
    case "proto":      return <SlideProto />;
    case "closing":    return <SlideClosing />;
    default:           return null;
  }
}

// ─── Chapter pill nav ─────────────────────────────────────────────────────────
const CHAPTERS = [...new Set(SLIDES.map(s => s.chapter))];
const CH_START = CHAPTERS.map(ch => SLIDES.findIndex(s => s.chapter === ch));

function DeckSlideScrubber({
  idx, total, dark, onChange,
}: { idx: number; total: number; dark: boolean; onChange: (i: number) => void }) {
  const lang = useLang();
  if (total <= 1) return null;
  const max = total - 1;
  const pct = max > 0 ? (idx / max) * 100 : 100;
  return (
    <div className="relative mx-auto min-h-[1.75rem] w-full max-w-md px-1 py-1.5">
      <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full" aria-hidden
        style={{ background: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.1)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: U.accent }} />
      </div>
      <input type="range" min={0} max={max} step={1} value={idx}
        aria-label={lang === "en" ? "Slide position" : "幻灯片位置"} aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1}
        className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function ChapterPills({ current, dark, lang, onJump }: { current: string; dark: boolean; lang: Lang; onJump: (i: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {CHAPTERS.map((ch, i) => {
        const on = ch === current;
        const label = lang === "en" ? CHAPTER_EN[ch] ?? ch : ch;
        return (
          <button key={ch} type="button" onClick={() => onJump(CH_START[i])}
            className={`rounded-full transition-all duration-500 ease-out ${
              on
                ? "px-3 py-[3px] text-[9px] font-semibold tracking-[0.18em]"
                : "h-1.5 w-1.5"
            }`}
            style={on
              ? { background: U.accent, color: U.accentInk }
              : { background: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.16)" }}
            aria-label={lang === "en" ? `Jump to chapter: ${label}` : `跳到章节:${label}`}>
            {on ? label : null}
          </button>
        );
      })}
    </div>
  );
}

// ─── 编辑面板 ─────────────────────────────────────────────────────────────────
function EditPanel({
  slideId, ov, setOv, onClose, lang,
}: {
  slideId: string;
  ov: Overrides;
  setOv: (fn: (prev: Overrides) => Overrides) => void;
  onClose: () => void;
  lang: Lang;
}) {
  const DICT = dictOf(lang);
  const fields = FIELDS[slideId] ?? [];
  const [copied, setCopied] = useState(false);
  const changedKeys = Object.keys(ov);
  const resetPage = () => {
    setOv((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (k.startsWith(`${slideId}.`)) delete next[k];
      return next;
    });
  };
  const copyAll = async () => {
    const out: Record<string, string> = {};
    for (const k of changedKeys) out[k] = ov[k];
    try {
      await navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="absolute right-4 top-14 z-50 flex max-h-[calc(100vh-8rem)] w-[360px] flex-col overflow-hidden rounded-xl bg-white"
      style={{ boxShadow: "0 24px 64px -16px rgba(0,0,0,0.35)", fontFamily: FONT }}>
      <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
        <p className="text-[12px] font-semibold tracking-[0.06em]" style={{ color: U.ink }}>编辑本页文案</p>
        <button type="button" onClick={onClose}
          className="rounded-full px-3 py-1 text-[11px] font-medium"
          style={{ background: U.ink, color: "#fff" }}>
          完成
        </button>
      </div>
      <p className="shrink-0 px-5 pb-3 text-[10.5px] leading-relaxed" style={{ color: U.muted }}>
        改动即时生效,保存在本浏览器。==文字== 会渲染为黄色荧光;列表字段每行一条。
      </p>
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 pb-4">
        {fields.length === 0 && (
          <p className="text-[12px]" style={{ color: U.muted }}>该页没有可编辑的文案(整页为图表 / 原型)。</p>
        )}
        {fields.map((f) => {
          const key = `${slideId}.${f.k}`;
          const val = ov[key] ?? DICT[slideId]?.[f.k] ?? "";
          const changed = key in ov;
          return (
            <label key={f.k} className="block">
              <span className="mb-1 flex items-center gap-2 text-[10px] font-semibold tracking-[0.12em]"
                style={{ color: changed ? U.accentInk : U.muted }}>
                {f.label}
                {changed && <span className="rounded-full px-1.5 text-[9px]" style={{ background: U.accent, color: U.accentInk }}>已改</span>}
              </span>
              <textarea
                value={val}
                rows={f.rows ?? 2}
                onChange={(e) => {
                  const v = e.target.value;
                  setOv((prev) => {
                    const next = { ...prev };
                    if (v === (DICT[slideId]?.[f.k] ?? "")) delete next[key];
                    else next[key] = v;
                    return next;
                  });
                }}
                className="w-full resize-y rounded-lg px-3 py-2 text-[12.5px] leading-relaxed outline-none"
                style={{ background: U.bg, color: U.inkSoft, border: `1px solid ${changed ? U.accent : "transparent"}` }}
              />
            </label>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3" style={{ background: U.bg }}>
        <button type="button" onClick={resetPage}
          className="text-[11px] font-medium underline underline-offset-2" style={{ color: U.muted }}>
          重置本页
        </button>
        <button type="button" onClick={copyAll}
          className="rounded-full px-3.5 py-1.5 text-[11px] font-medium"
          style={{ background: U.surfaceDeep, color: U.inkSoft }}>
          {copied ? "已复制 ✓" : `复制全部修改(${changedKeys.length})`}
        </button>
      </div>
    </div>
  );
}

// ─── Directional slide transition ─────────────────────────────────────────────
const slideVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? 72 : -72, scale: 0.988 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit:   (dir: number) => ({ opacity: 0, x: dir >= 0 ? -72 : 72, scale: 0.988 }),
};

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function DeckStoryClient({ lang = "zh" }: { lang?: Lang }) {
  const reduced = useReducedMotion();
  const [[idx, dir], setState] = useState<[number, number]>([0, 0]);
  const [stage, setStage] = useState({ scale: 0, w: SW, h: SH });
  const [ov, setOvState] = useState<Overrides>({});
  const [editOpen, setEditOpen] = useState(false);
  const ovLoaded = useRef(false);
  const total    = SLIDES.length;
  const slide    = SLIDES[idx];
  const progress = total > 1 ? (idx / (total - 1)) * 100 : 0;
  const OKEY = lang === "en" ? "deck-story-copy-overrides-en" : "deck-story-copy-overrides";

  // 文案覆盖:挂载后从 localStorage 读入,此后每次变化写回
  useEffect(() => {
    try {
      const raw = localStorage.getItem(OKEY);
      if (raw) setOvState(JSON.parse(raw));
    } catch { /* ignore */ }
    ovLoaded.current = true;
  }, [OKEY]);
  useEffect(() => {
    if (!ovLoaded.current) return;
    try { localStorage.setItem(OKEY, JSON.stringify(ov)); } catch { /* ignore */ }
  }, [ov, OKEY]);
  const setOv = useCallback((fn: (prev: Overrides) => Overrides) => setOvState(fn), []);
  const copyCtx = useMemo(() => ({ ov, lang }), [ov, lang]);

  // 16:9 基准,允许 ~14% 伸缩贴合窗口;余白与页面同色
  useEffect(() => {
    const apply = () => {
      const availW = window.innerWidth;
      const availH = window.innerHeight - 56 - 78;
      const scale = Math.max(0.1, Math.min(availW / SW, availH / SH));
      const w = Math.min(availW / scale, SW * 1.14);
      const h = Math.min(availH / scale, SH * 1.14);
      setStage({ scale, w, h });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

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

  // 深链:?s=N 直接打开第 N 页(1 起)
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("s"));
    if (Number.isFinite(p) && p >= 1 && p <= total) {
      setState([Math.round(p) - 1, 0]);
    }
  }, [total]);

  // 键盘翻页 — 输入框聚焦时不拦截,编辑不受影响
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); next(); }
      if (["ArrowLeft",  "PageUp"].includes(e.key))        { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const dark      = slide.dark;
  const navStrong = dark ? "rgba(255,255,255,0.92)" : U.inkLight;
  const navMeta   = dark ? "rgba(255,255,255,0.55)" : U.mutedSoft;

  return (
    <CopyCtx.Provider value={copyCtx}>
      <div className="deck-story relative flex h-screen flex-col overflow-hidden"
        style={{ fontFamily: FONT, background: slide.bg, transition: "background 0.5s ease" }}>
        <style>{`.deck-story ::selection { background: ${U.accent}; color: ${U.accentInk}; }`}</style>
        {/* Progress line */}
        <div className="absolute inset-x-0 top-0 z-50 h-[1.5px] bg-transparent">
          <motion.div className="h-full" style={{ background: U.accent }}
            initial={false} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: E }} />
        </div>

        {/* Header — 无边框,融入页面 */}
        <header className="z-40 flex h-14 shrink-0 items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-5">
            <Link href="/work/meituan-im"
              className="text-[10px] font-semibold tracking-[0.22em] transition-colors"
              style={{ color: navStrong }}>
              {UI.back[lang]}
            </Link>
            <span className="hidden text-[10px] font-medium tracking-[0.18em] md:inline" style={{ color: navMeta }}>
              {lang === "en" ? CHAPTER_EN[slide.chapter] ?? slide.chapter : slide.chapter}
            </span>
          </div>
          {/* 编辑入口暂时隐藏;SHOW_EDIT 改回 true 即恢复 */}
          {SHOW_EDIT && (
            <button type="button" onClick={() => setEditOpen((v) => !v)}
              className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] transition-colors"
              style={editOpen
                ? { background: U.accent, color: U.accentInk }
                : { color: navMeta }}>
              {editOpen ? UI.editing[lang] : UI.edit[lang]}
            </button>
          )}
        </header>

        {/* 编辑面板 */}
        {editOpen && (
          <EditPanel slideId={slide.id} ov={ov} setOv={setOv} onClose={() => setEditOpen(false)} lang={lang} />
        )}

        {/* Stage — 16:9 基准画布,余白与页面同色 */}
        <main className="relative flex min-h-0 flex-1 items-center justify-center">
          {stage.scale > 0 && (
            <div style={{ width: stage.w * stage.scale, height: stage.h * stage.scale }}>
              <div className="relative overflow-hidden"
                style={{
                  width: stage.w, height: stage.h,
                  transform: `scale(${stage.scale})`, transformOrigin: "top left",
                }}>
                <AnimatePresence custom={dir} initial={false}>
                  <motion.div key={slide.id} custom={dir}
                    variants={reduced ? undefined : slideVariants}
                    initial={reduced ? false : "enter"}
                    animate={reduced ? undefined : "center"}
                    exit={reduced ? undefined : "exit"}
                    transition={{ duration: 0.55, ease: E }}
                    className="absolute inset-0">
                    <SlideRenderer id={slide.id} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>

        {/* Footer — 翻页靠键盘(←/→/空格),此处只留进度与章节 */}
        <footer className="z-40 shrink-0">
          <div className="flex flex-col items-stretch justify-center gap-2.5 px-4 py-3 md:px-10">
            <DeckSlideScrubber idx={idx} total={total} dark={dark} onChange={jump} />
            <div className="flex justify-center overflow-x-auto">
              <ChapterPills current={slide.chapter} dark={dark} lang={lang} onJump={jump} />
            </div>
          </div>
        </footer>
      </div>
    </CopyCtx.Provider>
  );
}
