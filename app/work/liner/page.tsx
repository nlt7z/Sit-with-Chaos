import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import LinerScholarCaseStudy from "./LinerScholarCaseStudy";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

const PATH = "/work/liner";
const TITLE = "Liner AI Scholar — Collaborative Deep-Research Workflow";
const DESCRIPTION =
  "A collaborative deep-research workflow for Liner AI: research strategy, 11 researcher interviews, synthesis findings, and the product decisions that shaped a team-based scholarly research workflow.";
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
      <Nav variant="dark" />
      <LinerScholarCaseStudy />
      <Footer variant="dark" />
    </>
  );
}
