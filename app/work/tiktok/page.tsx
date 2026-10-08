import type { Metadata } from "next";
import { SideRail } from "@/components/bento/SideRail";
import { CaseHero } from "@/components/CaseHero";
import { Footer } from "@/components/Footer";
import { TikTokCaseStudyFrame } from "./TikTokCaseStudyFrame";

export const metadata: Metadata = {
  title: "TikTok · Shared with You — Feed Design — Yuan Fang",
  description:
    "A product case study reimagining how content friends share with you surfaces on TikTok — Smart Reactions, a Shared Feed tab, and reply-value ranking, with an interactive prototype.",
};

/**
 * /work/tiktok — the standalone "Shared with You" case study (a self-contained
 * static site under public/assets/TikTok) mounted in an auto-height iframe so the
 * page scrolls as one document. Like every case study it opens on the shared
 * dark CaseHero and reads light: the iframe loads with ?embed, which hides the
 * build's own hero and switches its palette to light. Chrome: SideRail (left),
 * SectionRail (right, fed from the iframe's sections), Footer.
 *
 * NOTE: this serves the English narrative (`case-study-en.html`). The original
 * Chinese-narrative build (`case-study.html`) still lives on disk but is no longer
 * linked from anywhere — swap the iframe src in TikTokCaseStudyFrame to bring it back.
 */
export default function TikTokCaseStudyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SideRail active="work" tone="auto" />
      <CaseHero logo="/assets/work/logos/tiktok.svg" company="TikTok" kicker="Product case study" title="Shared with You">
        <div className="overflow-hidden rounded-[14px] bg-black ring-1 ring-white/10">
          <video
            src="/assets/TikTok/showcase.mp4"
            poster="/assets/work/posters/tiktok.webp"
            autoPlay
            muted
            loop
            playsInline
            className="aspect-video h-auto w-full object-cover"
          />
        </div>
      </CaseHero>
      <TikTokCaseStudyFrame />
      <Footer />
    </div>
  );
}
