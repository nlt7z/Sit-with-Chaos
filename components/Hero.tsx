import { LivingHero } from "@/components/hero/LivingHero";

/**
 * Hero — the homepage hero shell. The lime backdrop is supplied by the page
 * wrapper (app/page.tsx); this section provides the viewport rhythm and hosts
 * the living hero (headline channels + live demo stage).
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-20 text-textPrimary md:pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-center pb-20 pt-20 md:min-h-[660px] md:pb-24 md:pt-24 lg:min-h-[720px]">
        <LivingHero />
      </div>
    </section>
  );
}
