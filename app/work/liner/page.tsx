import type { Metadata } from "next";
import LinerCaseStudy from "./LinerCaseStudy";

export const metadata: Metadata = {
  title: "Liner — Research-driven AI collaboration workflow — Yuan Fang",
  description:
    "Product video and interactive prototype from the UW HCDE × Liner AI capstone. Full case study in progress.",
};

export default function LinerPage() {
  return <LinerCaseStudy />;
}
