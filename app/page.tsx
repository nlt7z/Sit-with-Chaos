"use client";

import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { GachaCabinet } from "@/components/GachaCabinet";
import { Hero } from "@/components/Hero";
import { HomeMagicGallery } from "@/components/HomeMagicGallery";
import { Nav } from "@/components/Nav";
import { Work } from "@/components/Work";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

/** Once set, `/` always opens the main page; gacha only on the visitor’s first landing. */
const GACHA_INTRO_SEEN_KEY = "home-gacha-intro-seen";

function HomeContent() {
  const searchParams = useSearchParams();
  const forceMainPage = searchParams.get("view") === "main";
  const [mode, setMode] = useState<"browse" | "gacha" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (forceMainPage) {
      localStorage.setItem(GACHA_INTRO_SEEN_KEY, "1");
      setMode("browse");
      return;
    }

    if (localStorage.getItem(GACHA_INTRO_SEEN_KEY) === "1") {
      setMode("browse");
      return;
    }

    setMode("gacha");
  }, [forceMainPage]);

  const lockToMainPage = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(GACHA_INTRO_SEEN_KEY, "1");
    }
    setMode("browse");
  }, []);

  const openGachaFromHero = useCallback(() => {
    setMode("gacha");
  }, []);

  if (mode === null) {
    return <div className="min-h-screen bg-[#070605]" aria-hidden />;
  }

  return (
    <AnimatePresence mode="wait">
      {mode === "gacha" ? (
        <motion.div
          key="gacha"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <GachaCabinet onExit={lockToMainPage} onNavigateMain={lockToMainPage} />
        </motion.div>
      ) : (
        <motion.div
          key="browse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Nav />
          <main>
            <Hero onGachaToggle={openGachaFromHero} />
            <Work />
            <About />
            <HomeMagicGallery />
            <Contact />
          </main>
          <Footer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
