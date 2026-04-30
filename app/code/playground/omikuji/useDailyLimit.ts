"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_DRAWS_PER_DAY = 3;
const KEY_V3 = "omikuji_cabinet_draws_v3";
/** Legacy single-draw keys (migrated once) */
const KEY_DATE = "omikuji_cabinet_last_date";
const KEY_ID = "omikuji_cabinet_last_fortune_id";
const KEY_DRAWER = "omikuji_cabinet_last_drawer";

export type DayDrawRecord = {
  fortuneId: string;
  drawerIndex: number;
};

type StoredDay = {
  date: string;
  draws: DayDrawRecord[];
};

function todayStr() {
  return new Date().toDateString();
}

function readStored(): StoredDay | null {
  try {
    const raw = localStorage.getItem(KEY_V3);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredDay;
      if (parsed?.date === todayStr() && Array.isArray(parsed.draws)) {
        return { date: parsed.date, draws: parsed.draws.slice(0, MAX_DRAWS_PER_DAY) };
      }
    }
    const d = localStorage.getItem(KEY_DATE);
    const id = localStorage.getItem(KEY_ID);
    const dr = localStorage.getItem(KEY_DRAWER);
    if (d === todayStr() && id && dr != null) {
      const drawerIndex = Number.parseInt(dr, 10);
      if (!Number.isNaN(drawerIndex)) {
        return { date: d, draws: [{ fortuneId: id, drawerIndex }] };
      }
    }
  } catch {
    /* private mode */
  }
  return null;
}

function writeStored(state: StoredDay) {
  try {
    localStorage.setItem(KEY_V3, JSON.stringify(state));
  } catch {
    /* */
  }
}

/** Reminder copy for each completed draw (1-based count). */
export function drawReminderLines(drawNumber: number): { en: string; jp: string } {
  switch (drawNumber) {
    case 1:
      return {
        en: "First omikuji of the day — let this thread guide your morning.",
        jp: "本日一巡目のおみくじです",
      };
    case 2:
      return {
        en: "Second counsel from the shelf — listen as softly as before.",
        jp: "二巡目 — 心を静めてお受け取りください",
      };
    case 3:
      return {
        en: "Final draw for today — carry all three whispers until the stars turn.",
        jp: "本日最後のおみくじとなります",
      };
    default:
      return { en: "", jp: "" };
  }
}

export function useDailyLimit() {
  const [stored, setStored] = useState<StoredDay | null>(null);

  useEffect(() => {
    setStored(readStored());
  }, []);

  const drawsToday = stored?.date === todayStr() ? stored.draws.length : 0;
  const drawsRemaining = Math.max(0, MAX_DRAWS_PER_DAY - drawsToday);
  const allDrawsUsed = drawsToday >= MAX_DRAWS_PER_DAY;
  const todaysDraws = stored?.date === todayStr() ? stored.draws : [];

  const usedDrawerIndices = useMemo(
    () => new Set(todaysDraws.map((d) => d.drawerIndex)),
    [todaysDraws],
  );

  const fortuneIdForDrawer = useCallback(
    (drawerIndex: number) => todaysDraws.find((d) => d.drawerIndex === drawerIndex)?.fortuneId ?? null,
    [todaysDraws],
  );

  const recordNewDraw = useCallback((fortuneId: string, drawerIndex: number) => {
    const today = todayStr();
    setStored((prev) => {
      const base =
        prev?.date === today
          ? { date: today, draws: [...prev.draws] }
          : { date: today, draws: [] as DayDrawRecord[] };
      if (base.draws.length >= MAX_DRAWS_PER_DAY) return base;
      if (base.draws.some((d) => d.drawerIndex === drawerIndex)) return base;
      base.draws.push({ fortuneId, drawerIndex });
      writeStored(base);
      return base;
    });
  }, []);

  return {
    drawsToday,
    drawsRemaining,
    maxDrawsPerDay: MAX_DRAWS_PER_DAY,
    allDrawsUsed,
    todaysDraws,
    usedDrawerIndices,
    fortuneIdForDrawer,
    recordNewDraw,
  };
}
