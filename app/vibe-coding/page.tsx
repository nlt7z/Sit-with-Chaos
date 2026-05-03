"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { VibeCodingPageContent } from "./VibeCodingPageContent";

export default function VibeCodingPage() {
  return (
    <>
      <Nav />
      <main className="bg-white px-6 pb-20 pt-32 md:pt-40">
        <VibeCodingPageContent />
      </main>
      <Footer />
    </>
  );
}
