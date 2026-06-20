import { BentoHome } from "@/components/bento/BentoHome";

export const metadata = {
  title: "Bento — Yuan Fang",
  robots: { index: false, follow: false },
};

/** Mirror of the homepage bento (kept as an internal /lab route). */
export default function BentoLabPage() {
  return <BentoHome />;
}
