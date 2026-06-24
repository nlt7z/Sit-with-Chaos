import { Suspense } from "react";
import { Manrope } from "next/font/google";
import DeckPresentClient from "./DeckPresentClient";

// Uber Base type — Manrope stands in for Uber Move. Loaded only on the deck
// route so the rest of the portfolio keeps its own type system.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "Designing Trust Before the Bill — Presentation Deck",
  description:
    "Portfolio deck for Meituan IM Consultation: a 0-to-1 in-message quotation system that turns uncertain local-service pricing into a guided, comparable, bookable decision — walked through the live prototype, one workflow per slide.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="text-[10px] uppercase tracking-[0.22em] text-black/30">Loading</span>
    </div>
  );
}

export default function MeituanDeckPresentPage() {
  return (
    <div className={manrope.variable}>
      <Suspense fallback={<Fallback />}>
        <DeckPresentClient />
      </Suspense>
    </div>
  );
}
