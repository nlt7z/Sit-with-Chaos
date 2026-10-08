import type { Metadata } from "next";
import { SideRail } from "@/components/bento/SideRail";
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
 * page scrolls as one document. The site chrome is the standard SideRail (left)
 * + SectionRail (right, fed from the iframe's sections) + dark Footer, like
 * every other case study; the standalone build's own chrome has been removed.
 *
 * NOTE: this serves the English narrative (`case-study-en.html`). The original
 * Chinese-narrative build (`case-study.html`) still lives on disk but is no longer
 * linked from anywhere — swap the iframe src in TikTokCaseStudyFrame to bring it back.
 */
export default function TikTokCaseStudyPage() {
  return (
    <div style={{ background: "#0a0b0c", minHeight: "100vh" }}>
      <SideRail active="work" />
      <TikTokCaseStudyFrame />
      <Footer variant="dark" />
    </div>
  );
}
