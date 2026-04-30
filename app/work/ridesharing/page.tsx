import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import RidesharingCaseStudy from "./RidesharingCaseStudy";

export const metadata: Metadata = {
  title: "AI Ride — In-Cabin Experience for Autonomous Ride-Sharing — Yuan Fang",
  description:
    "Case study: a moving private room, three emotional layers, RITE iterations, Brooklyn as city-aware AI, and voice-first trust in the cabin.",
};

export default function RidesharingPage() {
  return (
    <>
      <Nav />
      <RidesharingCaseStudy />
      <Footer />
    </>
  );
}
