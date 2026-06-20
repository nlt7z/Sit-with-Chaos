import type { Metadata } from "next";
import StudioEngineCaseStudy from "./StudioEngineCaseStudy";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

const PATH = "/work/studio-engine";
const TITLE = "StudioEngine — Designing Control Into AI Video Creation";
const DESCRIPTION =
  "Restructured a one-shot Gen-2 text-to-video tool into a four-stage creative workspace — basics, outline, script, visuals — with checkpoints and version history so creators iterate instead of re-generating.";
const OG_IMAGE = "/assets/og/studio-engine.jpg";

export const metadata: Metadata = {
  title: `${TITLE} — Yuan Fang`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Yuan Fang — Product Design Builder",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function StudioEnginePage() {
  return (
    <>
      <ArticleJsonLd
        url={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        image={OG_IMAGE}
        datePublished="2025-04-01"
      />
      <StudioEngineCaseStudy />
    </>
  );
}
