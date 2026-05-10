"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DiagnosisState = {
  symptoms: string[];
  detail: string | null;
  abnormalSound: boolean | null;
  timePreference: string | null;
  address: string;
  hasPhoto: boolean;
};

type QuoteState = {
  arrivedQuoteIds: string[];
  selectedQuoteId: string | null;
};

type PrototypeStore = DiagnosisState &
  QuoteState & {
    setSymptoms: (symptoms: string[]) => void;
    setDetail: (detail: string) => void;
    setAbnormalSound: (v: boolean) => void;
    setTimePreference: (t: string) => void;
    setHasPhoto: (v: boolean) => void;
    addArrivedQuote: (id: string) => void;
    setSelectedQuote: (id: string) => void;
    reset: () => void;
  };

const initialState: DiagnosisState & QuoteState = {
  symptoms: [],
  detail: null,
  abnormalSound: null,
  timePreference: null,
  address: "朝阳区朝京SOHO T1",
  hasPhoto: false,
  arrivedQuoteIds: [],
  selectedQuoteId: null,
};

export const usePrototypeStore = create<PrototypeStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSymptoms: (symptoms) => set({ symptoms }),
      setDetail: (detail) => set({ detail }),
      setAbnormalSound: (abnormalSound) => set({ abnormalSound }),
      setTimePreference: (timePreference) => set({ timePreference }),
      setHasPhoto: (hasPhoto) => set({ hasPhoto }),
      addArrivedQuote: (id) =>
        set((s) => ({
          arrivedQuoteIds: s.arrivedQuoteIds.includes(id)
            ? s.arrivedQuoteIds
            : [...s.arrivedQuoteIds, id],
        })),
      setSelectedQuote: (selectedQuoteId) => set({ selectedQuoteId }),
      reset: () => set(initialState),
    }),
    { name: "meituan-proto-v1" }
  )
);
