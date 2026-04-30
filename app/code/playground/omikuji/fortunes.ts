export type FortuneLevel = "daikichi" | "chukichi" | "shokichi" | "suekichi" | "kyo" | "daikyo";

export type ParticleKind = "sakura" | "gold" | "water" | "firefly" | "leaf";

export type Fortune = {
  id: string;
  level: FortuneLevel;
  levelLabel: string;
  /** e.g. 大吉 — spec FortuneCard */
  levelKanji: string;
  poem: string;
  summary: string;
  lucky: string[];
  unlucky: string[];
  love: number;
  career: number;
  wealth: number;
  health: number;
  particleType: ParticleKind;
  /** Extra density for great misfortune (same leaf type as kyo) */
  particleDense?: boolean;
  /** Kanji drawer index from build order (fortune metadata) */
  drawerLabel: string;
};

const LEVEL_META: Record<
  FortuneLevel,
  { label: string; kanji: string; particle: ParticleKind; dense?: boolean }
> = {
  daikichi: { label: "GREAT BLESSING", kanji: "大吉", particle: "sakura" },
  chukichi: { label: "BLESSING", kanji: "中吉", particle: "gold" },
  shokichi: { label: "SMALL BLESSING", kanji: "小吉", particle: "water" },
  suekichi: { label: "FAINT BLESSING", kanji: "末吉", particle: "firefly" },
  kyo: { label: "CAUTION", kanji: "凶", particle: "leaf" },
  daikyo: { label: "GREAT CAUTION", kanji: "大凶", particle: "leaf", dense: true },
};

/** Drawer face labels 壱 … 二十四 (24-draw cabinet) */
export function drawerKanjiFromIndex(indexZeroBased: number): string {
  const n = indexZeroBased + 1;
  const formal1to9 = ["壱", "弐", "参", "四", "五", "六", "七", "八", "九"];
  const digit = "〇一二三四五六七八九";
  if (n <= 9) return formal1to9[n - 1];
  if (n === 10) return "十";
  if (n < 20) {
    const u = n % 10;
    return u === 0 ? "十" : "十" + digit[u];
  }
  if (n === 20) return "二十";
  if (n < 30) {
    const u = n % 10;
    return u === 0 ? "二十" : "二十" + digit[u];
  }
  return "二十四";
}

const POEMS: Record<FortuneLevel, [string, string][]> = {
  daikichi: [
    ["Mountains rise — travelers still find a road", "Rivers run deep — boats still find a ford"],
    ["Spring wind returns; buds remember the light", "Quiet work ripens where patience is kept"],
    ["A guest arrives bearing one honest word", "The door you open becomes a wider room"],
    ["Ink dries slowly; the hand stays steady", "What you tend with care will not betray you"],
    ["Clouds part above the old courtyard", "Footsteps echo where kindness was planted"],
    ["The lamp you lit still warms the table", "Tonight favors courage wrapped in calm"],
  ],
  chukichi: [
    ["Warm rain softens the hardened path", "Small gains stack when you refuse to rush"],
    ["A letter arrives — not loud, but sure", "Trust the rhythm that favors preparation"],
    ["The market hums; your place is steady", "Keep promises small and finish them well"],
    ["Two roads meet; neither is wrong", "Choose with clarity, then walk without looking back"],
    ["Wood seasons slowly in the shed", "Your craft improves while others chase noise"],
    ["Tea steams; the room listens better", "Speak less, mean more — doors will open"],
    ["A map creases where thumbs have traveled", "Experience is the compass you already own"],
    ["Stars are faint but countable tonight", "Progress prefers honest accounting"],
    ["The bridge holds because stones were fitted", "Systems reward the patient assembler"],
    ["Morning light finds the desk you cleared", "Order invites opportunity"],
  ],
  shokichi: [
    ["Ripples widen from a single pebble", "A modest plan can still reach the far shore"],
    ["The kettle sings; the day agrees", "Routine is a friend when ambition needs rest"],
    ["Footprints overlap on the riverbank", "Community appears where you show up twice"],
    ["Paper folds into a useful shape", "Constraints can teach a clever design"],
    ["Wind turns the weather vane slowly", "Signals arrive — read them without panic"],
    ["Seeds sleep under last year's leaves", "Rest is not absence; it is preparation"],
    ["A lantern swings in a patient arc", "Timing rewards the watcher, not the gambler"],
    ["The path bends; the view improves", "Detours sometimes correct the destination"],
    ["Rain taps the roof like a metronome", "Steady effort outlasts loud intentions"],
    ["The harbor is quiet but not empty", "Safety is a kind of wealth"],
    ["Ink fades where drafts were erased", "Revision is how clarity is earned"],
    ["Footsteps return before dark", "Small returns compound when you stay consistent"],
  ],
  suekichi: [
    ["Mist hides the next ridge until you climb", "Curiosity is safer than certainty"],
    ["A cricket repeats one humble note", "Repetition teaches what talent forgets"],
    ["The well is low but not dry", "Measure resources before you promise"],
    ["Shadows lengthen; lamps are lit", "Evening favors rest and honest review"],
    ["A thread frays where tension gathers", "Release pressure before it snaps"],
    ["Pages stick in the damp season", "Some delays are environmental, not personal"],
    ["The bell is distant but still true", "Listen for guidance outside your echo"],
    ["Footprints fade in afternoon heat", "Not every sign must be permanent"],
    ["The boat drifts; the oar is near", "You are not helpless — only paused"],
    ["Clouds return; the roof still holds", "Weather changes; foundations remain"],
  ],
  kyo: [
    ["The mirror fogs when breath is hurried", "Slow down before you choose a door"],
    ["Stones shift under careless feet", "Risk rises when attention thins"],
    ["Thunder speaks; the field empties", "Not every battle is yours to fight today"],
    ["The ink blot spreads where the hand shook", "Imprecision has downstream costs"],
    ["Branches cross where the wind argues", "Conflict grows where listening stops"],
    ["The path narrows between two walls", "Choose carefully — retreat is honorable"],
    ["Ash falls where the fire leapt", "After intensity, inspect what remains"],
    ["The clock skips when wound too tight", "Overwork breaks more than rest fixes"],
  ],
  daikyo: [
    ["The river turns back on itself tonight", "Wait — do not force the crossing"],
    ["Black ice where moonlight lies", "Assume danger until proven otherwise"],
  ],
};

function clampStars(n: number) {
  return Math.min(5, Math.max(1, Math.round(n)));
}

function buildFortunes(): Fortune[] {
  /** 24 drawers — half of classic 48 distribution */
  const sequence: FortuneLevel[] = [
    ...Array.from({ length: 3 }, () => "daikichi" as const),
    ...Array.from({ length: 5 }, () => "chukichi" as const),
    ...Array.from({ length: 6 }, () => "shokichi" as const),
    ...Array.from({ length: 5 }, () => "suekichi" as const),
    ...Array.from({ length: 4 }, () => "kyo" as const),
    ...Array.from({ length: 1 }, () => "daikyo" as const),
  ];

  const counts: Record<FortuneLevel, number> = {
    daikichi: 0,
    chukichi: 0,
    shokichi: 0,
    suekichi: 0,
    kyo: 0,
    daikyo: 0,
  };

  return sequence.map((level, i) => {
    const meta = LEVEL_META[level];
    const idx = counts[level]++;
    const [a, b] = POEMS[level][idx % POEMS[level].length];
    const baseLove = level === "daikichi" ? 5 : level === "daikyo" ? 1 : 3 + (i % 3);
    const id = `f${String(i + 1).padStart(3, "0")}`;
    const drawerLabel = drawerKanjiFromIndex(i);

    return {
      id,
      drawerLabel,
      level,
      levelLabel: meta.label,
      levelKanji: meta.kanji,
      poem: `${a}\n${b}`,
      summary:
        level === "daikichi"
          ? "Momentum and goodwill align — act with grace and generosity."
          : level === "chukichi"
            ? "Steady progress; refine details and keep your promises modest."
            : level === "shokichi"
              ? "Small openings favor patient work and gentle persistence."
              : level === "suekichi"
                ? "Mixed signals — verify facts, shorten commitments, and rest."
                : level === "kyo"
                  ? "Friction is likely — protect boundaries and postpone big bets."
                  : "A heavy fog — conserve energy, seek counsel, and wait for clarity.",
      lucky:
        level === "daikyo"
          ? ["Rest", "Seek counsel", "Simplify plans"]
          : level === "kyo"
            ? ["Quiet reflection", "Organize your desk", "Walk outdoors"]
            : ["Travel short distances", "Meet a mentor", "Finish one small task"],
      unlucky:
        level === "daikichi"
          ? ["Arrogance", "Overpromising"]
          : level === "daikyo"
            ? ["Major decisions", "Risky investments", "Sharp conflict"]
            : ["Impulsive spending", "Late-night debates"],
      love: clampStars(baseLove + (i % 2)),
      career: clampStars(baseLove + ((i + 1) % 3)),
      wealth: clampStars(baseLove + ((i + 2) % 2)),
      health: clampStars(baseLove),
      particleType: meta.particle,
      particleDense: meta.dense,
    };
  });
}

export const FORTUNES: Fortune[] = buildFortunes();

export function shuffleDrawerOrder(seed: number): number[] {
  const arr = FORTUNES.map((_, i) => i);
  let s = seed % 2147483647 || 1;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
