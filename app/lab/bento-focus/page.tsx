import { BentoHomeFocus } from "@/components/bento/BentoHomeFocus";

export const metadata = {
  title: "Bento (Focus) — Yuan Fang",
  robots: { index: false, follow: false },
};

/** Hierarchy-first rework of the homepage bento — an A/B against /. */
export default function BentoFocusLabPage() {
  return <BentoHomeFocus />;
}
