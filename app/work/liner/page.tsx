import type { Metadata } from "next";
import LinerCaseStudy from "./LinerCaseStudy";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

const PATH = "/work/liner";
const TITLE = "Liner — Research-driven AI collaboration workflow";
const DESCRIPTION =
  "Led research and design for an AI-native collaborative research experience on Liner — used by 10M+ academic users and ranked a top-20 web AI by a16z. Three core interaction patterns reframe AI from a feature add into a collaborative-trust layer.";
const OG_IMAGE = "/assets/og/liner.jpg";

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

export default function LinerPage() {
  return (
    <>
      <ArticleJsonLd
        url={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        image={OG_IMAGE}
        datePublished="2026-05-01"
      />
      <LinerCaseStudy />
    </>
  );
}
