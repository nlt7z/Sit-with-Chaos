import { Suspense } from "react";
import DeckClient from "./DeckClient";

function DeckFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-sm text-black/50">
      Loading deck...
    </div>
  );
}

export default function AiCharacterDeckEnPage() {
  return (
    <Suspense fallback={<DeckFallback />}>
      <DeckClient />
    </Suspense>
  );
}
