import { Suspense } from "react";
import DeckPresentClient from "./DeckPresentClient";

export const metadata = {
  title: "Designing Trust Before the Bill — Presentation Deck",
  description:
    "Portfolio deck for Meituan IM Consultation: a 0-to-1 in-message quotation system that turns uncertain local-service pricing into a guided, comparable, bookable decision — walked through the live prototype, one workflow per slide.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060608]">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/20">Loading</span>
    </div>
  );
}

export default function MeituanDeckPresentPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <DeckPresentClient />
    </Suspense>
  );
}
