import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HomeMagicGallery } from "@/components/HomeMagicGallery";
import { Nav } from "@/components/Nav";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="relative isolate bg-white">
        {/* Hero + Work share one continuous lime composition.
         *  The image is rendered ONCE on the wrapper so it visually flows from
         *  the top of the hero, past its bottom, into the top of the work
         *  section — then fades to white before the work cards begin. */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] md:h-[1300px] lg:h-[1500px]"
          >
            {/* Vertical opacity mask: lime is fully solid at the top of the hero,
             *  then dissolves to transparent (pure white page) before the work
             *  cards — no white wash, so the visible lime keeps its true color. */}
            <img
              src="/assets/hero-decor.png"
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover object-[80%_top] md:object-[70%_top] lg:object-[right_top]"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 30%, transparent 66%)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 30%, transparent 66%)",
                // Pin this masked layer to its own stable GPU layer. Masked
                // images are a known repaint-on-scroll culprit — without this
                // some browsers leave it un-painted (white hero) until a scroll.
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
            {/* Left scrim — headline legibility only (horizontal, light touch) */}
            <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-white/85 via-white/35 to-transparent md:w-1/2" />
          </div>
          <Hero />
          <Work />
        </div>
        <HomeMagicGallery />
        {/* About + Contact share one continuous lime composition, anchored to
         *  the bottom so it flows from About down into the Contact finale —
         *  the mirror of the Hero + Work backdrop at the top of the page. */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[460px] md:h-[600px] lg:h-[720px]"
          >
            {/* Hero-matched zoom: the image is scaled up like the hero, but the
             *  shorter container crops it so only the BOTTOM HALF of the
             *  composition shows. Mask dissolves the top into white. */}
            <img
              src="/assets/hero-decor.png"
              alt=""
              draggable={false}
              className="absolute inset-x-0 bottom-0 h-[210%] w-full select-none object-cover object-[left_bottom]"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to top, black 0%, black 26%, transparent 62%)",
                maskImage:
                  "linear-gradient(to top, black 0%, black 26%, transparent 62%)",
                // Stable GPU layer — see the hero decor above. Keeps the masked
                // lime backdrop painted during scroll instead of flashing white.
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
          <About />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
