import type { Metadata } from "next";
import { DesktopExperienceGate } from "@/components/DesktopExperienceGate";
import AiCharacterPrototypeClient from "./AiCharacterPrototypeClient";

export const metadata: Metadata = {
  title: "AI-Character Interactive Prototype — Yuan Fang",
  description:
    "Interactive desktop prototype for AI-Character with one-round chat and centered character presence.",
};

export default async function AiCharacterPrototypePage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string; muted?: string }>;
}) {
  const params = await searchParams;
  const embed = params.embed === "1";
  const embedMuted = params.muted === "1";

  return (
    <DesktopExperienceGate
      disabled={embed}
      embedPath="/work/ai-character/prototype?muted=1"
      title="Romance companion prototype"
      description="A one-round chat experience with a centered character presence."
      backHref="/work/ai-character"
    >
      <AiCharacterPrototypeClient embed={embed} muted={embedMuted} />
    </DesktopExperienceGate>
  );
}
