import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground — Yuan Fang",
  description:
    "A curated space for coding experiments and visual explorations.",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
