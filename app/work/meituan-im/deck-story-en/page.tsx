import { Suspense } from "react";
import { Manrope } from "next/font/google";
import DeckStoryClient from "../deck-story/DeckStoryClient";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata = {
  title: "Rebuilding the Black Box — Presentation Deck",
  description:
    "From price transparency to trusted diagnosis: a service design case for Meituan local home services — platform-first diagnosis, one structured order, live merchant quotes, told through a live prototype.",
};

function Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="text-[10px] uppercase tracking-[0.22em] text-black/30">Loading</span>
    </div>
  );
}

export default function MeituanDeckStoryEnPage() {
  return (
    <div className={manrope.variable}>
      <Suspense fallback={<Fallback />}>
        <DeckStoryClient lang="en" />
      </Suspense>
    </div>
  );
}
