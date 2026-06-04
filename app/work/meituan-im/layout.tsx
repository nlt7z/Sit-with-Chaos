import type { Metadata } from "next";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

// `page.tsx` is a client component (uses framer-motion + hooks heavily), so
// metadata + JSON-LD live here in the server-rendered layout instead.

const PATH = "/work/meituan-im";
const TITLE = "Meituan — Designing Trust Before the Bill";
const DESCRIPTION =
  "A 0-to-1 in-message quotation system across Meituan's 770M+ annual users and 14.5M merchants — A/B-validated +5% conversion and −50% pricing disputes by reframing from price transparency to process trust.";
const OG_IMAGE = "/assets/og/meituan-im.jpg";

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

export default function MeituanImLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArticleJsonLd
        url={PATH}
        headline={TITLE}
        description={DESCRIPTION}
        image={OG_IMAGE}
        datePublished="2025-07-15"
      />
      {children}
    </>
  );
}
