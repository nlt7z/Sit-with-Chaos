import type { Metadata } from "next";
import { DesktopExperienceGate } from "@/components/DesktopExperienceGate";
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
  const embed = params.embed === "1";

  return (
    <DesktopExperienceGate
      disabled={embed}
      embedPath="/work/ai-character/prototype-astro"
      title="Astrology character prototype"
      description="A consultation showroom — chat, card draw, and a memory archive."
      backHref="/work/ai-character"
    >
      <AstroShowroomPrototypeClient embed={embed} />
    </DesktopExperienceGate>
  );
}
