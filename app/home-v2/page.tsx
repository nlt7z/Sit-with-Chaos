import type { Metadata } from "next";

import { HomeV2 } from "@/components/home-v2/HomeV2";

/**
 * /home-v2 — the sentence homepage, side by side with the bento home at /.
 * Kept out of search while it is a draft. To make it the homepage, render
 * <HomeV2 /> from app/page.tsx instead of <BentoHome />.
 */
export const metadata: Metadata = {
  title: "Yuan Fang Creative Builder",
  robots: { index: false, follow: false },
};

export default function HomeV2Page() {
  return <HomeV2 />;
}
