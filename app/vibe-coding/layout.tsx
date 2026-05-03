import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe coding — Yuan Fang",
  description: "Interactive prototypes and coded experiments — the things I build to think.",
};

export default function VibeCodingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
