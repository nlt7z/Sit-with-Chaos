import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok · Shared with You — Feed Design — Yuan Fang",
  description:
    "A product case study reimagining how content friends share with you surfaces on TikTok — Smart Reactions, a Shared Feed tab, and reply-value ranking, with an interactive prototype.",
};

/**
 * /work/tiktok — the standalone "Shared with You" case study (a self-contained
 * static site under public/assets/TikTok) mounted full-bleed. The page is fully
 * responsive and scrolls internally, so we hand it the whole viewport rather
 * than scaling a fixed frame.
 */
export default function TikTokCaseStudyPage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050507",
      }}
    >
      <iframe
        src="/assets/TikTok/case-study.html"
        title="TikTok · Shared with You — Feed Design case study"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
      />

      {/* back chip — bottom-left, unobtrusive over the dark canvas */}
      <a
        href="/work"
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
          textDecoration: "none",
          padding: "6px 10px",
          background: "rgba(8,9,10,0.72)",
          borderRadius: 6,
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          zIndex: 10,
        }}
      >
        ← Back
      </a>
    </div>
  );
}
