import { Suspense } from "react";
import { Source_Serif_4, Inter } from "next/font/google";
import DeckPresentClientZh from "./DeckPresentClientZh";

// Liner 品牌的排版根基:衬线承担展示标题(英文字形 + CJK 走系统衬线回退),
// Inter 承担正文与 UI chrome。中文标题落到 Songti / Noto Serif 系统衬线,
// 与拉丁衬线一同营造「读论文」的研究质感。
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "让 AI 研究协作可被信任 — Liner 演示文稿",
  description:
    "Liner AI Scholar 作品集演示:学术研究者没有协作问题,他们有的是上下文传递问题。从六场访谈的研究综合,到『连接组织』的产品方向与三种交互模式——一页一条线地讲清楚。",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#FAFAF7" }}>
      <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(60,50,30,0.4)" }}>
        加载中
      </span>
    </div>
  );
}

export default function LinerDeckPresentZhPage() {
  return (
    <div className={`${serif.variable} ${sans.variable}`}>
      <Suspense fallback={<Fallback />}>
        <DeckPresentClientZh />
      </Suspense>
    </div>
  );
}
