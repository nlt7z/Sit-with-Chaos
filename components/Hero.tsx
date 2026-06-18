import { ImmersiveHero } from "@/components/hero/ImmersiveHero";

/**
 * Hero — the homepage hero shell. The section is now a full-bleed 3D backdrop:
 * a lime sculpture that re-forms as the Research / motion / code headline
 * channels switch. The 3D scene supplies its own warm cream field, so this
 * shell only provides the section box and stacking context.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden text-textPrimary"
      aria-labelledby="hero-heading"
    >
      <ImmersiveHero />
    </section>
  );
}
