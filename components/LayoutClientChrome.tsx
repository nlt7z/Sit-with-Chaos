"use client";

import type { ReactNode } from "react";
import { ScrollToTop } from "@/components/ScrollToTop";

export function LayoutClientChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <div className="relative z-[2]">{children}</div>
    </>
  );
}
