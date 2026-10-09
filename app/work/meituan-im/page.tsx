import { SideRail } from "@/components/bento/SideRail";
import { Action } from "@/components/Action";
import { CaseHero } from "@/components/CaseHero";
import { Footer } from "@/components/Footer";
import { CaseStudyToc } from "@/components/SectionRail";

import { COPY } from "./story/copy";
import { MeituanStory, STORY_TOC } from "./story/MeituanStory";
import { Phone, Rich } from "./story/visuals";

/**
 * /work/meituan-im: the case study told page by page like the presentation
 * deck (deck-story). The hero is the deck's cover; MeituanStory renders the
 * rest, one deck slide per spread.
 */
export default function MeituanImCaseStudyPage() {
  const c = COPY.cover;
  return (
    <>
      <SideRail active="work" tone="auto" />
      <div className="relative min-h-screen bg-white">
        <CaseStudyToc items={STORY_TOC} />
        <CaseHero
          logo="/assets/work/logos/meituan.png"
          company="Meituan"
          kicker={c.kicker}
          title={c.title}
          lead={<Rich text={c.sub} dark />}
          actions={
            <>
              <Action href="/work/meituan-im/deck-story-en" tone="dark">
                View Presentation Deck
              </Action>
              <Action href="/work/meituan-im/prototype" variant="secondary" tone="dark" newTab>
                Try Prototype
              </Action>
            </>
          }
          aside={
            <div className="mx-auto w-[300px] max-w-full">
              <Phone flow="default" maxH={620} />
            </div>
          }
        />
        <main>
          <MeituanStory />
        </main>
      </div>
      <Footer />
    </>
  );
}
