import type { Metadata } from "next";
import { DesktopExperienceGate } from "@/components/DesktopExperienceGate";
import PsychShowroomPrototypeClient from "./PsychShowroomPrototypeClient";

export const metadata: Metadata = {
  title: "Psychology Expert Showroom Prototype — Yuan Fang",
  description:
    "Interactive psychology consultation showroom with visible analysis steps before response.",
};

export default async function PsychShowroomPrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const params = await searchParams;
  const embed = params.embed === "1";

  return (
    <DesktopExperienceGate
      disabled={embed}
      embedPath="/work/ai-character/prototype-psych"
      title="Therapy companion prototype"
      description="An ambient room interface — chat with the analysis steps made visible before each reply."
      backHref="/work/ai-character"
    >
      <PsychShowroomPrototypeClient embed={embed} />
    </DesktopExperienceGate>
  );
}
