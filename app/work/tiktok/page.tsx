import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
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
 * page scrolls as one document. The top nav and bottom footer are the SITE-STANDARD
 * <Nav>/<Footer> (dark variant), matching every other case study — the case study's
 * own standalone chrome (side rail, progress bar, footer) has been removed.
 *
 * NOTE: this serves the English narrative (`case-study-en.html`). The original
 * Chinese-narrative build (`case-study.html`) still lives on disk but is no longer
 * linked from anywhere — swap the iframe src in TikTokCaseStudyFrame to bring it back.
 */
export default function TikTokCaseStudyPage() {
  return (
    <div style={{ background: "#050507", minHeight: "100vh" }}>
      <Nav variant="dark" floating />
      {/* clear the floating capsule nav so the hero doesn't sit under it */}
      <div style={{ paddingTop: 84 }}>
        <TikTokCaseStudyFrame />
      </div>
      <Footer variant="dark" />
    </div>
  );
}
