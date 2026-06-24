import { Suspense } from "react";
import { Manrope } from "next/font/google";
import DeckPresentClientZh from "./DeckPresentClientZh";

// 与英文版一致:Manrope 承担拉丁字形(品牌名、数字、IM 等),中文走系统字体回退。
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "账单之前,先建信任 — 演示文稿",
  description:
    "美团 IM 咨询作品集演示:一套从 0 到 1 的 IM 内报价系统,把不确定的本地服务定价变成有引导、可对比、可下单的决策——以真实可交互原型,一页一条流程地讲清楚。",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="text-[10px] uppercase tracking-[0.22em] text-black/30">加载中</span>
    </div>
  );
}

export default function MeituanDeckPresentZhPage() {
  return (
    <div className={manrope.variable}>
      <Suspense fallback={<Fallback />}>
        <DeckPresentClientZh />
      </Suspense>
    </div>
  );
}
