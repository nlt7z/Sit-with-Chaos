import { Nav } from "@/components/Nav";
import type { Metadata } from "next";
import { OmikujiCabinetClient } from "./OmikujiCabinetClient";

export const metadata: Metadata = {
  title: "Omikuji Cabinet — Interactive demo — Yuan Fang",
  description:
    "Handcrafted omikuji cabinet: up to three draws per day with gentle reminders, candlelit walnut aesthetic, particle omens, and a parchment fortune card — English UI.",
};

export default async function OmikujiCabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;
  const isEmbed = embed === "1";

  return (
    <>
      {isEmbed ? null : <Nav />}
      <OmikujiCabinetClient embed={isEmbed} />
    </>
  );
}
