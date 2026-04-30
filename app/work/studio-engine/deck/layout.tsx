import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Engine.ai · 中文演示稿",
  description:
    "幻灯片：调研、可用性任务、渐进式脚手架与 Gen-2 方案。精简版加参数 simple=1；讲者模式 speaker=1。",
};

export default function StudioEngineDeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
