/** Project facts formerly shown on homepage work cards — surfaced only on case studies. */
export const CASE_STUDY_META = {
  "ai-character": {
    tags: ["ToB", "LLM", "Web"],
    role: "Product Design",
    year: "2025",
  },
  "studio-engine": {
    tags: ["GenAI", "Text-to-Image"],
    role: "UX Design · UX Research",
    year: "2025",
  },
  "meituan-im": {
    tags: ["Mobile Design", "UI Design"],
    role: "Product Design",
    year: "2025",
  },
  "apsara-conference": {
    tags: ["Visual Design", "Event", "Cloud"],
    role: "Visual Design",
    year: "2025",
  },
  ridesharing: {
    tags: ["AI Agent", "Autonomous Driving"],
    role: "UX Research · UX Design",
    year: "2024",
  },
} as const;

export type CaseStudyMetaSlug = keyof typeof CASE_STUDY_META;
