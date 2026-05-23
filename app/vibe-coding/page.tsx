"use client";

import { Nav } from "@/components/Nav";
import { VibeCodingPageContent } from "./VibeCodingPageContent";

export default function VibeCodingPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white pt-20 md:h-screen md:overflow-hidden md:pt-24">
        <VibeCodingPageContent />
      </main>
    </>
  );
}
