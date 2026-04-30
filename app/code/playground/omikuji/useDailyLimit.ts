"use client";

import { useCallback, useEffect, useState } from "react";

const KEY_DATE = "omikuji_cabinet_last_date";
const KEY_ID = "omikuji_cabinet_last_fortune_id";
const KEY_DRAWER = "omikuji_cabinet_last_drawer";

function todayStr() {
  return new Date().toDateString();
}

export function useDailyLimit() {
  const [alreadyDrawn, setAlreadyDrawn] = useState(false);
  const [lastFortuneId, setLastFortuneId] = useState<string | null>(null);
  const [lastDrawerIndex, setLastDrawerIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const d = localStorage.getItem(KEY_DATE);
      const id = localStorage.getItem(KEY_ID);
      const dr = localStorage.getItem(KEY_DRAWER);
      if (d === todayStr() && id) {
        setAlreadyDrawn(true);
        setLastFortuneId(id);
        setLastDrawerIndex(dr != null ? Number.parseInt(dr, 10) : null);
      }
    } catch {
      /* private mode */
    }
  }, []);

  const markAsDrawn = useCallback((fortuneId: string, drawerIndex: number) => {
    try {
      localStorage.setItem(KEY_DATE, todayStr());
      localStorage.setItem(KEY_ID, fortuneId);
      localStorage.setItem(KEY_DRAWER, String(drawerIndex));
    } catch {
      /* */
    }
    setAlreadyDrawn(true);
    setLastFortuneId(fortuneId);
    setLastDrawerIndex(drawerIndex);
  }, []);

  return { alreadyDrawn, lastFortuneId, lastDrawerIndex, markAsDrawn };
}
