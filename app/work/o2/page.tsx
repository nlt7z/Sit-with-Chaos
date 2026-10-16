import type { Metadata } from "next";

import { SideRail } from "@/components/bento/SideRail";
import { CaseHero } from "@/components/CaseHero";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const TITLE = "Human-in-the-loop BOM sourcing";
const DESCRIPTION =
  "A brief case study of O2 Tech AI, the AI workforce for electronics manufacturing: a human-in-the-loop flow that makes heavy supply chain data visible, trusted and usable.";

export const metadata: Metadata = {
  title: `O2 Tech AI: ${TITLE} · Yuan Fang`,
  description: DESCRIPTION,
  alternates: { canonical: "/work/o2" },
};

const FACTS = [
  ["Role", "Product Designer"],
  ["Year", "2026"],
  ["Focus", "Human-in-the-loop workflow"],
] as const;

// the four stages, in the words of the earlier O2 draft and the film narration
const STAGES = [
  {
    name: "Setup",
    body: "The buyer or engineer enters the hard rules. AVL policy, hard or soft. A target price ceiling. Packaging and a distributor allowlist.",
  },
  {
    name: "Confirm Parts",
    body: "The core HITL gate. The agent parses the BOM, extracts standard parts, then pauses itself and asks a human to review and correct.",
  },
  {
    name: "Source & Price",
    body: "Every part is sourced, priced, and checked for risk. O2 cross-checks supplier offers, investigates exceptions, and verifies the evidence.",
  },
  {
    name: "Build Quotes",
    body: "Export it directly into the customer's original workbook. Their format, ready to send.",
  },
] as const;

/**
 * /work/o2 — a brief intro to the O2 Tech AI work: the dark CaseHero with the
 * full product film (v6, with sound and subtitles), then the four stages on
 * white. The full case study (drafts/o2-case-study.html) stays offline.
 */
export default function O2CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SideRail active="work" tone="auto" />
      <CaseHero
        logo="/assets/logos/o2.svg"
        company="O2 Tech AI"
        kicker="Product case study"
        title={
          <>
            <span className="whitespace-nowrap">Human-in-the-loop</span> BOM sourcing
          </>
        }
        lead="In hardware supply chain data, mistakes are expensive and full automation is unrealistic."
        intro={
          <p>
            The real work is the balance between the AI agent and the human expert: a human-in-the-loop flow that
            makes heavy data visible, trusted and usable.
          </p>
        }
      >
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
          {FACTS.map(([label, value]) => (
            <div key={label} className="min-w-0 border-l border-white/15 pl-3">
              <dt className="text-[13px] font-medium tracking-[-0.005em] text-white/60">{label}</dt>
              <dd className="mt-2 text-[14px] leading-[1.5] text-white/80">{value}</dd>
            </div>
          ))}
        </dl>

        <figure className="mt-12 md:mt-16">
          <div className="overflow-hidden rounded-[14px] bg-black ring-1 ring-white/10">
            <video
              src="/assets/o2/o2-full-film-sound.mp4"
              poster="/assets/o2/o2-film-still.jpg"
              controls
              playsInline
              preload="metadata"
              aria-label="O2 Tech AI product film"
              className="aspect-video h-auto w-full bg-black object-cover"
            />
          </div>
          <figcaption className="mt-3 text-[13px] font-medium tracking-[-0.005em] text-white/60">
            O2 product film · 3:15
          </figcaption>
        </figure>
      </CaseHero>

      <main className="mx-auto max-w-content px-6 pb-24 md:px-[84px] md:pb-32">
        <section id="workflow" className="scroll-mt-28 pt-16 md:pt-24 lg:pt-28">
          <Reveal>
            <p className="text-[13px] font-medium tracking-[-0.005em] text-textSecondary">Workflow</p>
            <h2 className="mt-5 max-w-3xl font-display text-[1.9rem] font-light leading-[1.15] tracking-[-0.02em] text-textPrimary">
              O2 Tech AI processes a BOM in four stages
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {STAGES.map((s, i) => (
              <li key={s.name}>
                <Reveal delay={i * 0.04}>
                  <p className="font-mono text-[13px] tabular-nums text-textSecondary">0{i + 1}</p>
                  <h3 className="mt-3 font-display text-[1.2rem] font-normal leading-snug text-textPrimary">{s.name}</h3>
                  <p className="mt-2 text-[16px] leading-[1.65] text-textSecondary">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}
