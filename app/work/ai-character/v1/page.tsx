import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import CaseStudyContent from "./CaseStudyContentOriginal";

export const metadata: Metadata = {
  title: "Xingchen: Case Study v1 — Yuan Fang",
  description: "Original version of the Xingchen case study before restructuring.",
};

export default function AiCharacterV1Page() {
  return (
    <>
      <Nav />
      <CaseStudyContent />
      <Footer showTopBorder={false} />
    </>
  );
}
