"use client";

import { Nav } from "@/components/Nav";
import { VibeCodingPageContent } from "./VibeCodingPageContent";

export default function VibeCodingPage() {
  return (
    <>
      <Nav />
      <main className="h-screen overflow-hidden bg-white pt-20 md:pt-24">
        <VibeCodingPageContent />
      </main>
    </>
  );
}
