import { Suspense } from "react";
import DeckClient from "./DeckClient";

function DeckFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans text-sm text-textSecondary">
      加载幻灯片…
    </div>
  );
}

export default function StudioEngineDeckPage() {
  return (
    <Suspense fallback={<DeckFallback />}>
      <DeckClient />
    </Suspense>
  );
}
