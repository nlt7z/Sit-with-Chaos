import { Suspense } from "react";
import DeckPresentClientZh from "./DeckPresentClientZh";

export const metadata = {
  title: "通义千问 Character · Interactive Showrooms 端到端设计 — 演示文稿",
  description:
    "通义千问 Character（阿里云）作品集演示:Interactive Showrooms 如何用『证据』取代『文档』——可见的认知、一个房间一项能力,以及从研究到生产代码的路径。",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060608]">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/20">加载中</span>
    </div>
  );
}

export default function DeckPresentZhPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <DeckPresentClientZh />
    </Suspense>
  );
}
