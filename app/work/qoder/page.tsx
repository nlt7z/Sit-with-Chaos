import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { WorkPasswordGate } from "@/components/WorkPasswordGate";
import type { Metadata } from "next";
import QoderPresentation from "./QoderPresentation";

export const metadata: Metadata = {
  title: "Qoder — Agentic Coding Platform for Real Software — Yuan Fang",
  description:
    "Product design for Alibaba Qoder: context engineering, autonomous agents, and IDE experiences for shipping real software.",
};

export default function QoderPage() {
  return (
    <>
      <Nav />
      <WorkPasswordGate storageKey="work-gate-qoder" workTitle="Alibaba · Qoder">
        <QoderPresentation />
      </WorkPasswordGate>
      <Footer />
    </>
  );
}
