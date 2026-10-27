import type { Metadata } from "next";

import { safeNext } from "@/lib/siteGate";

import { UnlockGate } from "./UnlockGate";

export const metadata: Metadata = {
  robots: { index: false },
};

/** /unlock — the site's front door (see proxy.ts). */
export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <UnlockGate next={safeNext(Array.isArray(next) ? next[0] : next)} />;
}
