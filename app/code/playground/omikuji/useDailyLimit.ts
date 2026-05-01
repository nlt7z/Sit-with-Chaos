"use client";

import { useCallback, useEffect, useState } from "react";

const KEY_DATE = "omikuji_cabinet_date";
const KEY_IDS  = "omikuji_cabinet_ids";   // JSON string[]
const KEY_IDXS = "omikuji_cabinet_idxs";  // JSON number[]

export const MAX_DAILY = 3;

function today() { return new Date().toDateString(); }

export function useDailyLimit() {
  const [drawnIds,  setDrawnIds]  = useState<string[]>([]);
  const [drawnIdxs, setDrawnIdxs] = useState<number[]>([]);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY_DATE) === today()) {
        setDrawnIds( JSON.parse(localStorage.getItem(KEY_IDS)  ?? "[]") as string[]);
        setDrawnIdxs(JSON.parse(localStorage.getItem(KEY_IDXS) ?? "[]") as number[]);
      }
    } catch { /* private mode */ }
  }, []);

  const markAsDrawn = useCallback((id: string, idx: number) => {
    setDrawnIds((prev) => {
      const next = [...prev, id];
      try {
        localStorage.setItem(KEY_DATE, today());
        localStorage.setItem(KEY_IDS,  JSON.stringify(next));
      } catch { /* */ }
      return next;
    });
    setDrawnIdxs((prev) => {
      const next = [...prev, idx];
      try { localStorage.setItem(KEY_IDXS, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  }, []);

  const drawCount   = drawnIds.length;
  const remaining   = Math.max(0, MAX_DAILY - drawCount);
  const limitReached = drawCount >= MAX_DAILY;

  return { drawCount, remaining, limitReached, drawnIds, drawnIdxs, markAsDrawn };
}
