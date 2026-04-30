import { Suspense } from "react";
import DeckClient from "./DeckClient";

function DeckFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans text-sm text-textSecondary">
      加载演示稿...
    </div>
  );
}

export default function MeituanImDeckPage() {
  return (
    <Suspense fallback={<DeckFallback />}>
      <DeckClient />
    </Suspense>
  );
}
