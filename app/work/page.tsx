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
      {/* ambient lime glow + halftone dot corners, matching the home bento.
          Fixed so the corner decoration stays pinned to the viewport as the
          deck scrolls beneath it (top-right + bottom-left, like the homepage). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 35% at 80% 0%, rgba(210,255,0,0.08), rgba(10,11,12,0) 60%)",
        }}
      />
      {/* top-right halftone dot-matrix */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
          maskImage: "radial-gradient(120% 90% at 85% 4%, black 0%, transparent 62%)",
        }}
      />
      {/* mirrored corner — faint lime wash + dot-matrix anchored bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(58% 48% at 6% 100%, rgba(210,255,0,0.06), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(210,255,0,0.13) 1px, transparent 1.5px)",
          backgroundSize: "13px 13px",
          WebkitMaskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
          maskImage: "radial-gradient(110% 85% at 8% 97%, black 0%, transparent 60%)",
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
