import type { Metadata } from "next";
import AstroShowroomPrototypeClient from "./AstroShowroomPrototypeClient";

export const metadata: Metadata = {
  title: "Astro Showroom Prototype — Yuan Fang",
  description: "Interactive astrology consultation showroom prototype.",
};

export default async function AstroShowroomPrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const params = await searchParams;
  return <AstroShowroomPrototypeClient embed={params.embed === "1"} />;
}
