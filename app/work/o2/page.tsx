import type { Metadata } from "next";

import { SideRail } from "@/components/bento/SideRail";
import { CaseHero } from "@/components/CaseHero";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { SiteWindow } from "@/components/SiteWindow";

// O2's own tagline, as the film says it
const TAGLINE = "The AI workforce for electronics manufacturing.";

export const metadata: Metadata = {
  title: "O2 Tech AI · Yuan Fang",
  description: `O2 Tech AI. ${TAGLINE}`,
  alternates: { canonical: "/work/o2" },
};

// the working products, live; names are the products' own
const PRODUCTS = [
  { name: "BOM V2", href: "https://bom.o2tech.ai/welcome", url: "bom.o2tech.ai", poster: "/assets/o2/live/bom-o2tech-still.jpg" },
  { name: "Electronics Innovation Network", href: "https://net.ui.o2tech.ai/", url: "net.ui.o2tech.ai", poster: "/assets/o2/live/network-still.jpg" },
  { name: "PCB DFM Workbench", href: "https://dfm.ui.o2tech.ai/#/", url: "dfm.ui.o2tech.ai", poster: "/assets/o2/live/dfm-still.jpg" },
  { name: "BesTek", href: "https://bestek.ui.o2tech.ai/client/#workbench", url: "bestek.ui.o2tech.ai", poster: "/assets/o2/live/bestek-still.jpg" },
] as const;

/**
 * /work/o2 — the product film (original quality, with sound) in the dark hero,
 * then the working products as live preview windows. No narrative copy on purpose.
 */
export default function O2CaseStudyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SideRail active="work" tone="auto" />
      <CaseHero logo="/assets/logos/o2.svg" company="O2 Tech AI" kicker="Product Designer · 2026" title={TAGLINE}>
        <div className="overflow-hidden rounded-[14px] bg-black ring-1 ring-white/10">
          <video
            src="/assets/o2/o2-full-film-v8.mp4"
            poster="/assets/o2/o2-full-film-v8-still.jpg"
            controls
            playsInline
            preload="metadata"
            aria-label="O2 Tech AI product film"
            className="aspect-video h-auto w-full bg-black object-cover"
          />
        </div>
      </CaseHero>

      <main className="mx-auto max-w-content px-6 pb-24 md:px-[84px] md:pb-32">
        <section id="products" className="scroll-mt-28 pt-16 md:pt-24">
          <Reveal>
            <p className="text-[13px] font-medium tracking-[-0.005em] text-textSecondary">Live products</p>
          </Reveal>
          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-8">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.href} delay={i * 0.06}>
                <SiteWindow href={p.href} url={p.url} label={p.name} poster={p.poster} />
                <p className="mt-4 font-display text-[1.2rem] font-normal leading-snug text-textPrimary">{p.name}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
