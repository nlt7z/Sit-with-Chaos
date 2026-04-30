import { Suspense } from "react";
import DeckPresentClient from "./DeckPresentClient";

export const metadata = {
  title: "Designing the AI That Feels Alive — Presentation Deck",
  description: "30-minute presentation deck: from model capability to emotionally immersive AI character experience.",
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
