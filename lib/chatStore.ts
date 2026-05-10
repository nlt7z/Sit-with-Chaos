"use client";

import { create } from "zustand";

export type Stage = 1 | 2 | 3 | 4;

export type ExpertVariant = "helmet" | "master";

export type RepairOrderData = {
  faultProblem: string;
  parts: { label: string; kind: "photo" | "video" }[];
  plan: string;
  planPrice: string;
  planNote: string;
  time: string;
  address: string;
};

export type ProductRecData = {
  title: string;
  badges: string[];
  priceWhole: number;
  priceFrac: string;
};

export type MerchantQuote = {
  id: string;
  name: string;
  photoLabel: string;
  rating: number;
  reviews: string;
  category: string;
  badges: { text: string; tone: "orange" | "gray" | "red" }[];
  priceLow: number;
  priceHigh: number;
};

export type MerchantQuotesData = {
  quotes: MerchantQuote[];
  headerText?: string;
  expired?: boolean;
};

export type Message =
  | { id: string; type: "expert-text"; text: string; suggestedQuestions?: string[]; expertVariant?: ExpertVariant }
  | { id: string; type: "user-text"; text: string }
  | { id: string; type: "user-media"; mediaKind: "photo" | "video"; label: string; duration?: string }
  | { id: string; type: "system"; text: string; highlight?: string }
  | { id: string; type: "master-intro"; name: string; meta: string[] }
  | { id: string; type: "repair-order"; data: RepairOrderData }
  | { id: string; type: "product-rec"; data: ProductRecData }
  | { id: string; type: "merchant-quotes"; data: MerchantQuotesData; isLive: boolean }
  | { id: string; type: "follow-up-options" }
  | { id: string; type: "review-invite" }
  | { id: string; type: "history-divider" }
  | { id: string; type: "timestamp"; time: string; subtitle?: string };

export type Scenario =
  | "default"
  | "cat-litter"
  | "off-hours"
  | "quote-expired-modal"
  | "quote-expired-chat"
  | "return-visit"
  | "review-sheet";

interface ChatState {
  scenario: Scenario;
  stage: Stage;
  messages: Message[];
  showBanner: boolean;
  modal: "none" | "quote-expired" | "review-sheet";
  autoPlay: boolean;
  slowMotion: boolean;
}

export interface ChatStore extends ChatState {
  setScenario: (s: Scenario) => void;
  appendMessage: (m: Message) => void;
  advanceStage: (s: Stage) => void;
  setShowBanner: (v: boolean) => void;
  setModal: (m: "none" | "quote-expired" | "review-sheet") => void;
  setAutoPlay: (v: boolean) => void;
  setSlowMotion: (v: boolean) => void;
  reset: () => void;
}

const initialState: ChatState = {
  scenario: "default",
  stage: 1,
  messages: [],
  showBanner: true,
  modal: "none",
  autoPlay: false,
  slowMotion: false,
};

export const useChatStore = create<ChatStore>()((set) => ({
  ...initialState,
  setScenario: (scenario) => set({ scenario }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  advanceStage: (stage) => set({ stage }),
  setShowBanner: (showBanner) => set({ showBanner }),
  setModal: (modal) => set({ modal }),
  setAutoPlay: (autoPlay) => set({ autoPlay }),
  setSlowMotion: (slowMotion) => set({ slowMotion }),
  reset: () => set(initialState),
}));
