import type { Metadata } from "next";
import { GachaCabinetPageClient } from "./GachaCabinetPageClient";

export const metadata: Metadata = {
  title: "Magic Lamp · Fortune Draw — Yuan Fang",
  description: "Rub the lamp and draw a fortune card — a playful gacha-style portfolio navigator.",
};

export default async function GachaCabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;
  const isEmbed = embed === "1";
  return <GachaCabinetPageClient embed={isEmbed} />;
}
