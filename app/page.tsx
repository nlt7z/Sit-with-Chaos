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
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"browse" | "gacha">("browse");

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
          <GachaCabinet onExit={() => setMode("browse")} />
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
