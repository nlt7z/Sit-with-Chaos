import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import CaseStudyContent from "./CaseStudyContent";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

const PATH = "/work/ai-character";
const TITLE = "Qwen Character — Designing the AI That Feels Alive";
const DESCRIPTION =
  "Shipped Interactive Showrooms, the MVP for Qwen Character — cut time-to-first-value from 60+ minutes of docs to under 2 minutes and drove a 200% lift in model API call volume across enterprise users.";
const OG_IMAGE = "/assets/og/ai-character.jpg";

export const metadata: Metadata = {
  title: `${TITLE} — Yuan Fang`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Yuan Fang — UX Designer",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function AiCharacterPage() {
  return (
    <>
      <ArticleJsonLd
        url={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        image={OG_IMAGE}
        datePublished="2025-09-15"
      />
      <Nav />
      <CaseStudyContent />
      <Footer showTopBorder={false} />
    </>
  );
}
