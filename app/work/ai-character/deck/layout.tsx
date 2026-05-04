import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slides — Xingchen AI Character",
  description:
    "Case-study deck: memory, showroom craft, and a reusable framing for enterprise character experiences.",
};

export default function AiCharacterDeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
