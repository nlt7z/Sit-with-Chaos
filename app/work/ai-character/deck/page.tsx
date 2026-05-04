import { Suspense } from "react";
import DeckClient from "./DeckClient";

function DeckFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans text-sm text-textSecondary">
      Loading slides…
    </div>
  );
}

export default function AiCharacterDeckPage() {
  return (
    <Suspense fallback={<DeckFallback />}>
      <DeckClient />
    </Suspense>
  );
}
