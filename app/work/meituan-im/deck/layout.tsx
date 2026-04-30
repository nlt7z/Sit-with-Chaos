import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "美团 IM · 中文作品集演示稿",
  description: "美团 IM 询价系统 UX 设计案例演示稿；支持 ?simple=1 精简版。",
};

export default function MeituanImDeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
