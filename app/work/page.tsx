import { SideRail } from "@/components/bento/SideRail";
import { Work } from "@/components/Work";

export const metadata = {
  title: "Work — Yuan Fang",
  description: "Selected product design work by Yuan Fang.",
};

/**
 * /work — a dark gallery of the five featured case studies (the same project
 * cards the previous homepage used), with the section rail on the left.
 */
export default function WorkPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-white">
      {/* ambient lime glow + dot field, matching the home bento */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 35% at 80% 0%, rgba(210,255,0,0.08), rgba(10,11,12,0) 60%)",
        }}
      />
      <SideRail active="work" />

      {/* Eyebrow stays fixed at the top while the deck scrolls beneath it. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 pt-16 md:pt-20">
        <div className="mx-auto max-w-content px-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-nltLime">Selected work</p>
        </div>
      </div>

      <div className="relative z-10">
        <Work stack />
      </div>
    </div>
  );
}
