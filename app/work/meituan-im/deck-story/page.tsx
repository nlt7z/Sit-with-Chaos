import { Suspense } from "react";
import { Manrope } from "next/font/google";
import DeckStoryClient from "./DeckStoryClient";

// 与其他 deck 一致:Manrope 承担拉丁字形与数字,中文走系统字体回退。
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "重构黑盒 — 演示文稿",
  description:
    "从“价格透明”到“诊断可信”的本地生活服务体验设计:平台前置诊断、结构化需求单、商家实时竞价的信任对话架构,以真实可交互原型逐页讲述。",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="text-[10px] uppercase tracking-[0.22em] text-black/30">加载中</span>
    </div>
  );
}

export default function MeituanDeckStoryPage() {
  return (
    <div className={manrope.variable}>
      <Suspense fallback={<Fallback />}>
        <DeckStoryClient />
      </Suspense>
    </div>
  );
}
