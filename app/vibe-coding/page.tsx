"use client";

import { SideRail } from "@/components/bento/SideRail";
import { VibeCodingPageContent } from "./VibeCodingPageContent";

export default function VibeCodingPage() {
  return (
    <>
      <SideRail active="lab" />
      <main className="min-h-screen bg-[#111116] pt-10 md:h-screen md:overflow-hidden md:pt-12">
        <VibeCodingPageContent />
      </main>
    </>
  );
}
