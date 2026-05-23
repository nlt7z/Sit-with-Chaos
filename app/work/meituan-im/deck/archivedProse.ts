/**
 * Archived long-form English prose from the Meituan IM case study page.
 *
 * The page was trimmed to ~40% of its original copy to lean visual-first.
 * This file preserves the cut prose, organized by section id, so it can be
 * reused as deck speaker notes, interview talking points, or restored later
 * if the page direction changes.
 *
 * Last archived: 2026-05-22
 */

export type ArchivedSection = {
  /** Matches the section id on the case study page */
  sectionId: string;
  /** Eyebrow shown on the page when this prose was live */
  eyebrow: string;
  /** Section heading (display title) */
  title: string;
  /** Paragraphs that used to sit in the live page */
  paragraphs: string[];
};

export const ARCHIVED_PROSE: ArchivedSection[] = [
  {
    sectionId: "overview",
    eyebrow: "Meituan · Local Services · IM Consultation",
    title: "Designing Trust Before the Bill",
    paragraphs: [
      "I designed a trust infrastructure that turns uncertain local-service pricing into a guided, comparable, and bookable decision flow.",
    ],
  },
  {
    sectionId: "problem",
    eyebrow: "Context & Signal",
    title: "Users wanted to ask first, but the platform was not earning trust.",
    paragraphs: [
      "Meituan is one of China's largest super apps. This project sits in local services — home repair, banquet booking, maternity care, and other categories where price depends on details from consultation.",
      "The friction was not demand. It was confidence: users needed service but did not trust the bill would match what they expected.",
    ],
  },
  {
    sectionId: "turning-point",
    eyebrow: "Turning Point",
    title: "The brief started with price visibility. The evidence pointed to something deeper.",
    paragraphs: [
      "We first noticed that local services had the longest browse time but the lowest transaction rate — and the highest complaint rate on the platform. Much of the friction traced back to pricing: local services are customized, varying by situation and merchant, so even the same service could cost significantly differently.",
      "The initial ask was to make prices more visible. But when I used AI to analyze dispute reviews at scale, the evidence showed visibility was not enough. Users were already seeing prices. The breakdown happened later, when final bills rarely matched what people expected.",
      "I pushed back on the original direction. For customized services, static prices are often structurally wrong because scope and materials change.",
      "So the product question shifted: how do we guide users through a credible path to a price they can trust before they commit?",
    ],
  },
  {
    sectionId: "solution",
    eyebrow: "System Design",
    title: "The end-to-end flow that carries trust from search into checkout.",
    paragraphs: [
      "The architecture shows the three stages — Diagnose, Structure, Commit — extended across user entry, merchant participation, and post-service continuity. Each stage hands off structured context to the next, so trust compounds instead of resetting.",
      "Step 01 · Diagnose the problem — Function: Certified experts surface from search to define the problem. Goal: Remove ambiguity before comparison begins.",
      "Step 02 · Structure the intent — Function: Multi-turn chat yields a structured service-order card. Goal: Turn conversation into comparable intent.",
      "Step 03 · Compare and commit — Function: Vetted merchants quote live; the chosen price threads into checkout. Goal: Transparent competition and lower surprise billing risk.",
    ],
  },
  {
    sectionId: "chat",
    eyebrow: "IM Experience",
    title: "The interface walkthrough maps every critical state in one coherent conversation flow.",
    paragraphs: [
      "Three entry states, one interaction model. Whether intent arrives generic, specific, or after-hours, the conversation surface shapes itself to the user — not the other way around.",
    ],
  },
  {
    sectionId: "quote",
    eyebrow: "Quoting Engine",
    title: "Diagnosis output becomes structured intent, then drives transparent competitive quotes.",
    paragraphs: [
      "The diagnosis surface converts a vague problem into a structured service-order card. That card then becomes the contract merchants quote against — so every offer compares on equal terms.",
      "Active quoting · Live updates make waiting legible: a visible timer + counter so the user knows the platform is working for them. Trust signals appear before price: credentials, distance, and ratings render first, so price isn't the only variable. Price range sets realistic expectations: range, not a single number — primes the user for variability without disclaiming.",
      "Re-quote · Expired quotes stay visible but disabled — users can still compare prior offers; history is context, not noise. Only the time slot resets on re-quote — price re-validates with current availability; everything else carries through. Safety and convenience stay balanced — hard expiry on stale prices, soft continuity on intent and merchant choice.",
      "Continuity · Return flow stays in the same thread — post-service follow-up reuses context; no fresh consultation needed. Re-engagement is one tap — reorder, rate, or escalate without leaving the conversation.",
    ],
  },
  {
    sectionId: "scenarios",
    eyebrow: "Framework Extensions",
    title: "The same trust-first framework scales to education, banquet booking, and maternity care.",
    paragraphs: [
      "Three stages — Diagnose, Structure, Commit — stay constant. What changes is the substrate: what gets diagnosed, what intent looks like, what 'commit' means in context.",
      "The framework holds because the bottleneck is the same in every category: commitment without confidence. Substitute the inputs, the loop continues to work.",
    ],
  },
  {
    sectionId: "impact",
    eyebrow: "Impact & Validation",
    title: "Higher conversion and fewer disputes validated the trust-first direction.",
    paragraphs: [
      "Experiment design: user-level randomization, merchant whitelisting, and parallel runs on Meituan and Dianping in test and production.",
      "Conversion lift: search-to-purchase, validated via user-level A/B.",
      "Additional daily orders: incremental volume at projected rollout coverage.",
      "Pricing disputes: post-service complaints in this flow.",
    ],
  },
  {
    sectionId: "reflection",
    eyebrow: "Reflection",
    title: "What I would improve in the next version.",
    paragraphs: [
      "Merchant experience deserves its own product pass. Response quality is a system bottleneck: notification priority, context, and workload need first-class design.",
      "Guide pricing should explain variability, not imply a promise. Tie each range to concrete drivers so users do not read it as a fixed quote.",
      "Scale with AI triage, escalate to human experts. Humans stay essential for ambiguity; high-confidence paths can be automated at the front.",
    ],
  },
];
