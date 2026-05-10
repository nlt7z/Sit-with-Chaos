"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/lib/chatStore";
import type { MerchantQuote } from "@/lib/chatStore";
import { getScript } from "@/lib/scenarios";
import { DeviceFrame } from "@/components/device/DeviceFrame";
import { DemoPanel } from "@/components/demo/DemoPanel";
import { merchantQuotes, defaultRepairOrder } from "@/lib/mockData";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ProgressStrip } from "@/components/chat/ProgressStrip";
import { ExpertBanner } from "@/components/chat/ExpertBanner";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { MessageRenderer } from "@/components/chat/MessageRenderer";
import { MerchantDetailScreen } from "@/components/screens/MerchantDetailScreen";
import { HowToChooseScreen } from "@/components/screens/HowToChooseScreen";
import { TimePickerScreen } from "@/components/screens/TimePickerScreen";
import { AddressScreen } from "@/components/screens/AddressScreen";
import { PhotoGalleryScreen } from "@/components/screens/PhotoGalleryScreen";

type NavScreen =
  | { id: "merchant-detail"; quote: MerchantQuote }
  | { id: "how-to-choose" }
  | { id: "time-picker" }
  | { id: "address" }
  | { id: "photo-gallery" };

// surface.100 per design spec
const CHAT_BG = "#F5F5F5";

export default function ChatPage() {
  const scenario = useChatStore((s) => s.scenario);
  const stage = useChatStore((s) => s.stage);
  const messages = useChatStore((s) => s.messages);
  const showBanner = useChatStore((s) => s.showBanner);

  const [navStack, setNavStack] = useState<NavScreen[]>([]);
  const pushScreen = useCallback((screen: NavScreen) => setNavStack((s) => [...s, screen]), []);
  const popScreen = useCallback(() => setNavStack((s) => s.slice(0, -1)), []);
  const topScreen = navStack[navStack.length - 1] ?? null;

  const scriptIdxRef = useRef(0);
  const waitingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const runRef = useRef<() => void>();

  const run = useCallback(() => {
    const script = getScript(scenario);
    if (scriptIdxRef.current >= script.length) return;
    const step = script[scriptIdxRef.current];
    scriptIdxRef.current++;
    timerRef.current = setTimeout(() => {
      step.act(useChatStore.getState());
      if (step.waitForUser) {
        waitingRef.current = true;
      } else {
        runRef.current?.();
      }
    }, step.delay);
  }, [scenario]);

  runRef.current = run;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    useChatStore.getState().reset();
    scriptIdxRef.current = 0;
    waitingRef.current = false;
    const t = setTimeout(() => runRef.current?.(), 80);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scenario]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSuggestionTap = useCallback((text: string) => {
    useChatStore.getState().appendMessage({
      id: `user-${Date.now()}`,
      type: "user-text",
      text,
    });
    if (waitingRef.current) {
      waitingRef.current = false;
      setTimeout(() => runRef.current?.(), 200);
    }
  }, []);

  const handleFindMerchants = useCallback(() => {
    const s = useChatStore.getState();
    s.advanceStage(4);
    setTimeout(() => {
      useChatStore.getState().appendMessage({
        id: `mq-${Date.now()}`,
        type: "merchant-quotes",
        isLive: true,
        data: { quotes: merchantQuotes },
      });
    }, 800);
  }, []);

  const handleViewDetail = useCallback((quote: MerchantQuote) => {
    pushScreen({ id: "merchant-detail", quote });
  }, [pushScreen]);

  const handleHowToChoose = useCallback(() => {
    pushScreen({ id: "how-to-choose" });
  }, [pushScreen]);

  const handlePickTime = useCallback(() => {
    pushScreen({ id: "time-picker" });
  }, [pushScreen]);

  const handleEditAddress = useCallback(() => {
    pushScreen({ id: "address" });
  }, [pushScreen]);

  const handleViewPhotos = useCallback(() => {
    pushScreen({ id: "photo-gallery" });
  }, [pushScreen]);

  return (
    <div className="flex items-start justify-center gap-8 min-h-screen py-12 px-6">
      <DeviceFrame>
        {/* Base chat layer */}
        <ChatHeader />
        <ProgressStrip currentStage={stage} />
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ background: CHAT_BG }}
        >
          {showBanner && <ExpertBanner />}
          <div style={{ padding: "16px 0 16px" }}>
            {messages.length === 0 && (
              <p style={{ textAlign: "center", color: "#999999", fontSize: 12, marginTop: 24 }}>
                Starting conversation...
              </p>
            )}
            {messages.map((msg) => (
              <MessageRenderer
                key={msg.id}
                message={msg}
                onSuggestionTap={handleSuggestionTap}
                onFindMerchants={handleFindMerchants}
                onPickTime={handlePickTime}
                onEditAddress={handleEditAddress}
                onViewPhotos={handleViewPhotos}
                onViewDetail={handleViewDetail}
                onHowToChoose={handleHowToChoose}
              />
            ))}
          </div>
        </div>
        <ChatInputBar />

        {/* Navigation overlay — slides over the chat */}
        <AnimatePresence>
          {topScreen && (
            <motion.div
              key={topScreen.id + (topScreen.id === "merchant-detail" ? topScreen.quote.id : "")}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                background: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {topScreen.id === "merchant-detail" && (
                <MerchantDetailScreen
                  quote={topScreen.quote}
                  onBack={popScreen}
                  onBook={popScreen}
                />
              )}
              {topScreen.id === "how-to-choose" && (
                <HowToChooseScreen onBack={popScreen} />
              )}
              {topScreen.id === "time-picker" && (
                <TimePickerScreen
                  onBack={popScreen}
                  onConfirm={popScreen}
                />
              )}
              {topScreen.id === "address" && (
                <AddressScreen
                  onBack={popScreen}
                  onSave={popScreen}
                />
              )}
              {topScreen.id === "photo-gallery" && (
                <PhotoGalleryScreen
                  parts={defaultRepairOrder.parts}
                  onBack={popScreen}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DeviceFrame>

      <div className="sticky top-12">
        <DemoPanel />
      </div>
    </div>
  );
}
