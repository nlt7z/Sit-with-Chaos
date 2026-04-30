import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import LinerScholarCaseStudy from "./LinerScholarCaseStudy";

export const metadata: Metadata = {
  title: "Liner AI Scholar — Collaborative Deep-Research Workflow — Yuan Fang",
  description:
    "UW HCDE Capstone with Liner AI: research strategy, six academic interviews, five synthesis insights, and product direction for team-based scholarly research.",
};

export default function LinerScholarPage() {
  return (
    <>
      <Nav />
      <LinerScholarCaseStudy />
      <Footer />
    </>
  );
}
