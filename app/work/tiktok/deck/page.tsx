import { Suspense } from "react";
import DeckClient from "./DeckClient";

function DeckFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] text-sm text-[#757575]">
      Loading slides…
    </div>
  );
}

export default function TikTokDeckPage() {
  return (
    <Suspense fallback={<DeckFallback />}>
      <DeckClient />
    </Suspense>
  );
}
