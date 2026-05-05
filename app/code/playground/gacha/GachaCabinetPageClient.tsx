"use client";

import { GachaCabinet } from "@/components/GachaCabinet";
import { useRouter } from "next/navigation";

export function GachaCabinetPageClient({ embed }: { embed: boolean }) {
  const router = useRouter();
  return (
    <GachaCabinet
      embed={embed}
      onExit={() => {
        if (!embed) router.push("/");
      }}
      onNavigateMain={() => {
        if (!embed) router.push("/");
      }}
    />
  );
}
