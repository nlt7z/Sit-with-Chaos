import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import CaseStudyContent from "./CaseStudyContent";

export const metadata: Metadata = {
  title: "Xingchen: Designing the AI That Feels Alive — Yuan Fang",
  description:
    "Alibaba Cloud case study: designing TONGYI Xingchen showroom experiences to make model memory and personalization emotionally visible.",
};

export default function AiCharacterPage() {
  return (
    <>
      <Nav />
      <CaseStudyContent />
      <Footer showTopBorder={false} />
    </>
  );
}
