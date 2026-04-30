import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import ApsaraConferenceShowcase from "./ApsaraConferenceShowcase";

export const metadata: Metadata = {
  title: "Apsara Conference — Alibaba AI on Cloud — Yuan Fang",
  description:
    "Visual design for Alibaba’s Apsara Conference: a flagship global summit for cloud computing and AI, with cohesive keynote and digital storytelling.",
};

export default function ApsaraConferencePage() {
  return (
    <>
      <Nav />
      <ApsaraConferenceShowcase />
      <Footer />
    </>
  );
}
