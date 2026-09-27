import { RAIL_CLEARANCE } from "@/components/bento/railClearance";
import { SideRail } from "@/components/bento/SideRail";
import { WorkShowcase } from "@/components/WorkShowcase";

export const metadata = {
  title: "Work — Yuan Fang",
  description: "Selected product design work by Yuan Fang.",
};

/**
 * /work — every project on one page (WorkShowcase): three full-width features,
 * then two smaller ones side by side, with the section rail on the left.
 */
export default function WorkPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-white">
      {/* ambient lime glow + halftone dot corners, matching the home bento.
          Fixed so the corner decoration stays pinned to the viewport while the
          page scrolls beneath it (top-right + bottom-left, like the homepage). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 35% at 80% 0%, rgba(210,255,0,0.08), rgba(10,11,12,0) 60%)",
        }}
      />
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

      <main className={`relative z-10 overflow-x-clip ${RAIL_CLEARANCE}`}>
        <WorkShowcase />
      </main>
    </div>
  );
}
