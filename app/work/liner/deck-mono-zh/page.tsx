import { Inter } from "next/font/google";
import DeckMonoClientZh from "./DeckMonoClientZh";

// Uber-Base 极简的排版根基:单一无衬线,拉丁走 Inter、CJK 落 PingFang 系统字,
// 黑白为主、Liner 深绿仅作 accent/eyebrow。刻意不用衬线,与暖白衬线版区分开。
const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Liner · 协作深度研究工作流 — 演示文稿(黑白深绿)",
  description:
    "Liner AI Scholar 作品集演示的极简黑白版本:严格依照案例研究的顺序与节奏,一页一条线地讲清楚从研究综合到产品决策的全过程。",
};

export default function LinerDeckMonoZhPage() {
  return (
    <div className={sans.variable}>
      <DeckMonoClientZh />
    </div>
  );
}
