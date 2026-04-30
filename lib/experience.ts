export type ExperienceEntry = {
  company: string;
  role: string;
  period: string;
  current: boolean;
};

/** Keep in sync with homepage Experience section */
export const experienceEntries: ExperienceEntry[] = [
  { company: "Alibaba Cloud", role: "UX Design Intern", period: "2025", current: false },
  { company: "Meituan", role: "UX Design Intern", period: "2025", current: false },
  {
    company: "White Noise Design Studio",
    role: "Interior Designer",
    period: "2024",
    current: false,
  },
  {
    company: "Pratt Institute",
    role: "Teaching Assistant of Art and Technology",
    period: "2023",
    current: false,
  },
];
