import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import LinerScholarCaseStudy from "./LinerScholarCaseStudy";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

const PATH = "/work/liner-scholar";
const TITLE = "Liner AI Scholar — Collaborative Deep-Research Workflow";
const DESCRIPTION =
  "UW HCDE Capstone with Liner AI: research strategy, six academic interviews, five synthesis insights, and product direction for team-based scholarly research.";
const OG_IMAGE = "/assets/og/liner-scholar.jpg";

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

export default function LinerScholarPage() {
  return (
    <>
      <ArticleJsonLd
        url={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        image={OG_IMAGE}
        datePublished="2026-05-01"
      />
      <Nav />
      <LinerScholarCaseStudy />
      <Footer />
    </>
  );
}
