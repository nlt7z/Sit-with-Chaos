"use client";

import { usePathname, useRouter } from "next/navigation";
import { getNextRoute, getPrevRoute, getRouteInfo } from "@/lib/flow";
import { usePrototypeStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export function DemoNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const reset = usePrototypeStore((s) => s.reset);

  const next = getNextRoute(pathname);
  const prev = getPrevRoute(pathname);
  const info = getRouteInfo(pathname);

  if (!info) return null;

  function handleReset() {
    reset();
    router.push("/prototype/search");
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 select-none">
      <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md text-white rounded-full px-4 py-2 shadow-xl text-[13px]">
        <button
          onClick={() => prev && router.push(prev)}
          disabled={!prev}
          className="flex items-center gap-1 disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <span className="opacity-30 mx-1">|</span>

        <span className="opacity-70 text-[12px] font-medium">
          {info.step}/8 · {info.label}
        </span>

        <span className="opacity-30 mx-1">|</span>

        <button
          onClick={() => next && router.push(next)}
          disabled={!next}
          className="flex items-center gap-1 disabled:opacity-30 hover:opacity-80 transition-opacity"
        >
          Next
          <ChevronRight size={15} />
        </button>

        <span className="opacity-30 mx-1">|</span>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          title="Reset prototype"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
}
