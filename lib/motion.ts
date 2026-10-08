/**
 * Motion tokens — one scroll reveal for the whole site.
 *
 *   reveal    — everything that fades in on scroll: 24px up, 0.8s.
 *   emphasis  — the one hero media moment per page (a prototype, a cover
 *               film): longer travel and a slight scale, still no blur.
 *   stagger   — siblings revealed as a group.
 *
 * Hover timing lives in Tailwind: colour changes `duration-150`, transform /
 * shadow `duration-300`, both `ease-portfolio` (the same curve as EASE).
 */

/** cubic-bezier(0.25, 0.1, 0.25, 1) — Tailwind's `ease-portfolio`. */
export const EASE = [0.25, 0.1, 0.25, 1] as const;

export const REVEAL = { y: 24, duration: 0.8 } as const;
export const EMPHASIS = { y: 40, scale: 0.98, duration: 1 } as const;
export const STAGGER = 0.08;

/** Reveal once, when the element is 10% into the viewport. */
export const REVEAL_VIEWPORT = { once: true, margin: "-10% 0px" } as const;

/** Variants for `initial="hidden" whileInView="visible"` trees. */
export const revealVariants = {
  hidden: { opacity: 0, y: REVEAL.y },
  visible: { opacity: 1, y: 0, transition: { duration: REVEAL.duration, ease: EASE } },
};

export const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

/** Spread onto a motion element to give it the site reveal. */
export function revealProps(reduced: boolean, delay = 0) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: REVEAL.y },
    whileInView: { opacity: 1, y: 0 },
    viewport: REVEAL_VIEWPORT,
    transition: { duration: REVEAL.duration, ease: EASE, delay },
  };
}
