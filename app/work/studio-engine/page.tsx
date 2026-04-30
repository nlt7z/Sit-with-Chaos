import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Engine.ai — Text-to-Video UX — Yuan Fang",
  description:
    "Case study — UX research and design for Studio Engine.ai at Interco.AI: usability study, SUS baseline, progressive scaffolding, and Gen-2 pre-production for filmmakers and creators.",
};

/** Re-export default so bundler maps `/work/studio-engine` → client chunk cleanly (avoids stale split / undefined chunk id issues). */
export { default } from "./StudioEngineCaseStudy";
