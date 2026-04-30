import type { Metadata } from "next";
import PsychV2Client from "./PsychV2Client";

export const metadata: Metadata = {
  title: "Therapy Space — Yuan Fang",
  description:
    "A polished AI therapy consultation showroom with transparent real-time analysis.",
};

export default async function PsychV2Page({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const params = await searchParams;
  return <PsychV2Client embed={params.embed === "1"} />;
}
