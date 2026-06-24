import { Suspense } from "react";
import DeckPresentClient from "./DeckPresentClient";

export const metadata = {
  title: "Qwen Character — Interactive Showrooms · End-to-End Design",
  description:
    "Portfolio deck for Qwen Character (Alibaba Cloud): how Interactive Showrooms replaced documentation with proof — visible cognition, one capability per room, and a path from research to production code.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060608]">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/20">Loading</span>
    </div>
  );
}

export default function DeckPresentPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <DeckPresentClient />
    </Suspense>
  );
}
