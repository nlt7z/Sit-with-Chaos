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

const HOME_MODE_KEY = "home-entry-mode";

function HomeContent() {
  // #region agent log
  fetch("http://127.0.0.1:7434/ingest/ab7b4951-6649-467a-92da-e89e00c6a2c0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "afa6c4",
    },
    body: JSON.stringify({
      sessionId: "afa6c4",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "app/page.tsx:18",
      message: "Home render entry",
      data: { hasWindow: typeof window !== "undefined" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const searchParams = useSearchParams();
  // #region agent log
  fetch("http://127.0.0.1:7434/ingest/ab7b4951-6649-467a-92da-e89e00c6a2c0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "afa6c4",
    },
    body: JSON.stringify({
      sessionId: "afa6c4",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/page.tsx:33",
      message: "useSearchParams read",
      data: { hasSearchParams: !!searchParams, view: searchParams.get("view") },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const forceMainPage = searchParams.get("view") === "main";
  const [mode, setMode] = useState<"browse" | "gacha">("browse");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navEntry?.type === "reload") {
      sessionStorage.removeItem(HOME_MODE_KEY);
    }

    if (forceMainPage) {
      sessionStorage.setItem(HOME_MODE_KEY, "browse");
      setMode("browse");
      return;
    }

    const savedMode = sessionStorage.getItem(HOME_MODE_KEY);
    setMode(savedMode === "gacha" ? "gacha" : "browse");
  }, [forceMainPage]);

  const lockToMainPage = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(HOME_MODE_KEY, "browse");
    }
    setMode("browse");
  }, []);

  // #region agent log
  fetch("http://127.0.0.1:7434/ingest/ab7b4951-6649-467a-92da-e89e00c6a2c0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "afa6c4",
    },
    body: JSON.stringify({
      sessionId: "afa6c4",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "app/page.tsx:71",
      message: "Render branch decision",
      data: { mode, forceMainPage },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
            <Hero onGachaToggle={() => setMode("gacha")} />
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
