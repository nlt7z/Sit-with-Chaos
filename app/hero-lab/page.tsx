import { LivingHero } from "@/components/hero/LivingHero";
import { Nav } from "@/components/Nav";

export const metadata = {
  title: "Hero Lab — living hero prototype",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  return (
    <>
      <Nav />
      <main className="relative isolate min-h-screen overflow-hidden bg-white">
        {/* Real hero backdrop — the same masked lime composition as the live site. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] md:h-[1300px] lg:h-[1500px]"
        >
          <img
            src="/assets/hero-decor.png"
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover object-[80%_top] md:object-[70%_top] lg:object-[right_top]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 66%)",
              maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 66%)",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
          <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-white/85 via-white/35 to-transparent md:w-1/2" />
        </div>

        <span className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full border border-black/[0.08] bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary backdrop-blur">
          prototype · idea ①
        </span>

        <div className="relative z-10 flex min-h-screen flex-col justify-center pb-24 pt-28">
          <LivingHero />
        </div>
      </main>
    </>
  );
}
