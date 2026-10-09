import type { Metadata } from "next";
import { manrope } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "TikTok · Shared with You: Deck · Yuan Fang",
  description:
    "Presentation deck for the TikTok “Shared with You” friend-sharing case study, in the Uber Base design language.",
};

export default function TikTokDeckLayout({ children }: { children: React.ReactNode }) {
  return <div className={manrope.variable}>{children}</div>;
}
