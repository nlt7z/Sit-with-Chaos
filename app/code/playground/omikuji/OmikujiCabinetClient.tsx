"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Noto_Serif_JP, Shippori_Mincho } from "next/font/google";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawerKanjiFromIndex, FORTUNES, shuffleDrawerOrder, type Fortune, type ParticleKind } from "./fortunes";
import { ParticleCanvas } from "./ParticleCanvas";
import { MAX_DAILY, useDailyLimit } from "./useDailyLimit";

const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["300", "400", "700"], display: "swap" });
const shippori  = Shippori_Mincho({ subsets: ["latin"], weight: ["400", "700", "800"], display: "swap" });

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  bg:          "#060302",
  cabinet:     "#1e1008",
  cabinetFace: "#281608",
  drawer:      "#3e2212",  // lighter so visible
  drawerLit:   "#52301a",  // top highlight
  drawerShadow:"#1c0e06",
  gold:        "#c8a23a",
  goldLight:   "#e0b84a",
  goldBright:  "#f0cc5a",
  goldDim:     "#7a6028",
  goldFaint:   "rgba(200,162,58,0.15)",
  washi:       "#f5ecd8",
  washiMid:    "#edddc4",
  washiDark:   "#e2ceae",
  ink:         "#180c04",
  inkMid:      "#3a1e0e",
  vermillion:  "#c41800",
} as const;

// ── Seigaiha tiling background ─────────────────────────────────────────────────
const seigaihaSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
  <defs>
    <clipPath id='a'><rect width='64' height='32'/></clipPath>
    <clipPath id='b'><rect y='32' width='64' height='32'/></clipPath>
  </defs>
  <g clip-path='url(#a)' fill='none' stroke='rgba(200,162,58,0.10)' stroke-width='0.8'>
    <circle cx='0'  cy='32' r='32'/><circle cx='0'  cy='32' r='21'/><circle cx='0'  cy='32' r='10'/>
    <circle cx='64' cy='32' r='32'/><circle cx='64' cy='32' r='21'/><circle cx='64' cy='32' r='10'/>
  </g>
  <g clip-path='url(#b)' fill='none' stroke='rgba(200,162,58,0.10)' stroke-width='0.8'>
    <circle cx='32' cy='64' r='32'/><circle cx='32' cy='64' r='21'/><circle cx='32' cy='64' r='10'/>
  </g>
</svg>`;
const seigaihaUrl = `url("data:image/svg+xml,${encodeURIComponent(seigaihaSvg)}")`;

// ── Level → kanji + color ──────────────────────────────────────────────────────
const LEVEL_MAP: Record<string, { kanji: string; color: string }> = {
  "GREAT BLESSING": { kanji: "大吉", color: C.vermillion },
  "BLESSING":       { kanji: "中吉", color: "#b07a20" },
  "SMALL BLESSING": { kanji: "小吉", color: "#6a8040" },
  "FAINT BLESSING": { kanji: "末吉", color: "#4a7080" },
  "CAUTION":        { kanji: "凶",   color: "#6a5a8a" },
  "GREAT CAUTION":  { kanji: "大凶", color: "#383060" },
};

// ── Kamon (家紋) ornament ──────────────────────────────────────────────────────
function Kamon({ size = 40 }: { size?: number }) {
  const cx = size / 2, r1 = size * 0.46, r2 = size * 0.32;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      <circle cx={cx} cy={cx} r={r1} stroke={C.gold} strokeWidth="0.8" opacity="0.55" />
      <circle cx={cx} cy={cx} r={r2} stroke={C.gold} strokeWidth="0.5" opacity="0.38" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line key={deg}
            x1={cx + r2 * Math.cos(a)} y1={cx + r2 * Math.sin(a)}
            x2={cx + r1 * Math.cos(a)} y2={cx + r1 * Math.sin(a)}
            stroke={C.gold} strokeWidth="0.5" opacity="0.42" />
        );
      })}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const a = (deg * Math.PI) / 180, r = size * 0.20;
        return <circle key={deg} cx={cx + r * Math.cos(a)} cy={cx + r * Math.sin(a)}
          r={size * 0.05} stroke={C.gold} strokeWidth="0.5" opacity="0.48" />;
      })}
      <circle cx={cx} cy={cx} r={size * 0.07} stroke={C.gold} strokeWidth="0.6" opacity="0.6" />
    </svg>
  );
}

// ── Horizontal slip border ─────────────────────────────────────────────────────
function SlipBorderH() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 480 220" preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      <rect x="4" y="4" width="472" height="212" fill="none" stroke={C.gold} strokeWidth="0.9" opacity="0.42" />
      <rect x="9" y="9" width="462" height="202" fill="none" stroke={C.gold} strokeWidth="0.4" opacity="0.22" />
      {[[4,4],[476,4],[4,216],[476,216]].map(([x,y],i) => (
        <rect key={i} x={x-3} y={y-3} width="6" height="6"
          transform={`rotate(45 ${x} ${y})`} fill={C.gold} opacity="0.48" />
      ))}
      {[[4,110],[476,110]].map(([x,y],i) => (
        <rect key={i} x={x-2} y={y-2} width="4" height="4"
          transform={`rotate(45 ${x} ${y})`} fill={C.gold} opacity="0.32" />
      ))}
      {/* left panel divider */}
      <line x1="144" y1="12" x2="144" y2="208" stroke={C.gold} strokeWidth="0.5" opacity="0.28" />
      <rect x="141" y="107" width="6" height="6" transform="rotate(45 144 110)" fill={C.gold} opacity="0.38" />
    </svg>
  );
}

// ── Fortune slip ──────────────────────────────────────────────────────────────
const FortuneSlip = memo(function FortuneSlip({
  fortune, onClose, onCollect, collected,
}: {
  fortune: Fortune; onClose: () => void; onCollect: () => void; collected: boolean;
}) {
  const lvl   = LEVEL_MAP[fortune.levelLabel] ?? { kanji: fortune.levelLabel, color: C.ink };
  const lines = fortune.poem.split("\n");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      role="dialog" aria-modal="true" aria-labelledby="slip-title"
      style={{ background: "rgba(4,2,1,0.9)", backdropFilter: "blur(7px)" }}
    >
      <button type="button" className="absolute inset-0 cursor-default" aria-label="閉じる" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.84 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.91 }}
        transition={{ type: "spring", stiffness: 270, damping: 26, mass: 0.72 }}
        className="relative z-10 select-none"
        style={{ width: 480, maxWidth: "calc(100vw - 32px)" }}
      >
        {/* Paper body */}
        <div className="relative overflow-hidden" style={{
          borderRadius: 3,
          background: [
            `linear-gradient(162deg, ${C.washi} 0%, ${C.washiMid} 50%, ${C.washiDark} 100%)`,
            "repeating-linear-gradient(0deg,rgba(0,0,0,0.015) 0 1px,transparent 1px 5px)",
            "repeating-linear-gradient(90deg,rgba(0,0,0,0.01) 0 1px,transparent 1px 7px)",
          ].join(", "),
          boxShadow: [
            "0 28px 72px -8px rgba(0,0,0,0.9)",
            `0 0 0 1px ${C.gold}40`,
            "inset 0 1px 0 rgba(255,255,255,0.55)",
          ].join(", "),
        }}>
          <SlipBorderH />

          {/* Content row */}
          <div style={{ display: "flex", height: 180, padding: "14px 16px" }}>

            {/* LEFT — fortune level */}
            <div style={{
              width: 112, flexShrink: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "space-between",
              paddingRight: 12,
            }}>
              <Kamon size={28} />

              <div style={{ textAlign: "center" }}>
                <p id="slip-title" className={shippori.className} style={{
                  fontSize: 58, fontWeight: 800, lineHeight: 1,
                  color: lvl.color, textShadow: `0 3px 16px ${lvl.color}44`,
                  letterSpacing: "0.03em",
                }}>
                  {lvl.kanji}
                </p>
                <p className={shippori.className} style={{
                  fontSize: 7.5, letterSpacing: "0.38em",
                  color: C.inkMid, opacity: 0.5, marginTop: 4,
                }}>
                  御 神 籤
                </p>
              </div>

              {/* Seal stamp */}
              <div className={`${shippori.className} flex items-center justify-center rounded-full`}
                style={{
                  width: 32, height: 32,
                  border: `1.5px solid ${C.vermillion}88`,
                  color: C.vermillion, fontSize: 11, opacity: 0.72,
                  transform: "rotate(-10deg)",
                }}>
                御
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: 1, flexShrink: 0,
              background: `linear-gradient(180deg, transparent, ${C.gold}50, transparent)`,
              margin: "4px 0",
            }} />

            {/* RIGHT — poem + info */}
            <div style={{ flex: 1, paddingLeft: 16, display: "flex", flexDirection: "column" }}>

              {/* Horizontal poem */}
              <div className={notoSerif.className} style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                justifyContent: "center",
                writingMode: "horizontal-tb",
                gap: 6,
                overflow: "hidden",
              }}>
                {lines.map((line, i) => (
                  <span key={i} style={{
                    fontSize: 11.5, letterSpacing: "0.24em",
                    color: C.ink, lineHeight: 1.85,
                  }}>
                    {line}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(90deg, ${C.gold}40, transparent)`, margin: "8px 0 7px" }} />

              {/* Lucky / unlucky */}
              <div className={notoSerif.className} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ fontSize: 9, color: C.inkMid, display: "flex", gap: 6, alignItems: "baseline" }}>
                  <span className={shippori.className} style={{ color: C.goldDim, fontSize: 8, letterSpacing: "0.1em", flexShrink: 0 }}>吉</span>
                  <span style={{ letterSpacing: "0.04em", opacity: 0.85 }}>{fortune.lucky.join("　")}</span>
                </div>
                <div style={{ fontSize: 9, color: C.inkMid, display: "flex", gap: 6, alignItems: "baseline" }}>
                  <span className={shippori.className} style={{ color: "#8a5050", fontSize: 8, letterSpacing: "0.1em", flexShrink: 0 }}>凶</span>
                  <span style={{ letterSpacing: "0.04em", opacity: 0.85 }}>{fortune.unlucky.join("　")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            borderTop: `1px solid ${C.gold}24`,
            padding: "8px 16px",
            background: "rgba(0,0,0,0.025)",
          }}>
            {!collected && (
              <button type="button" onClick={onCollect} className={shippori.className}
                style={{
                  fontSize: 9, letterSpacing: "0.3em", padding: "5px 18px",
                  border: `1px solid ${C.gold}50`, borderRadius: 2,
                  background: `rgba(200,162,58,0.09)`, color: C.goldDim, cursor: "pointer",
                }}>
                <span style={{ display: "block", lineHeight: 1.2 }}>し ま う</span>
                <span style={{ display: "block", fontSize: 7, letterSpacing: "0.08em", opacity: 0.82, marginTop: 1 }}>
                  Keep
                </span>
              </button>
            )}
            <button type="button" onClick={onClose} className={shippori.className}
              style={{
                fontSize: 9, letterSpacing: "0.3em", padding: "5px 18px",
                border: `1px solid ${C.ink}18`, borderRadius: 2,
                background: "rgba(0,0,0,0.03)", color: C.inkMid, cursor: "pointer",
              }}>
              <span style={{ display: "block", lineHeight: 1.2 }}>閉 じ る</span>
              <span style={{ display: "block", fontSize: 7, letterSpacing: "0.08em", opacity: 0.82, marginTop: 1 }}>
                Close
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// ── Single drawer (5×5 cabinet) ────────────────────────────────────────────────
function Drawer({ label, disabled, isOpen, onClick }: {
  label: string; disabled: boolean; isOpen: boolean; onClick: () => void;
}) {
  return (
    <div style={{ perspective: "260px", position: "relative", width: "100%", height: "100%" }}>
      {/* Recess */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 2,
        background: "#020101",
        boxShadow: "inset 0 4px 14px rgba(0,0,0,0.99), inset 1px 1px 6px rgba(0,0,0,0.9)",
      }}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.35 }}
              style={{
                position: "absolute", top: "12%", left: "18%", width: "64%", height: "68%",
                borderRadius: 1,
                background: `linear-gradient(175deg, ${C.washi}, ${C.washiMid})`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                border: `0.5px solid ${C.gold}50`,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Drawer face */}
      <motion.button
        type="button" disabled={disabled} onClick={onClick}
        aria-label={`引き出し ${label}${isOpen ? "（開）" : ""}${disabled ? "（使用不可）" : ""}`}
        animate={
          isOpen
            ? { rotateX: -11, y: 9, z: 20, opacity: 0.4 }
            : { rotateX: 0,   y: 0, z: 0,  opacity: disabled ? 0.22 : 1 }
        }
        whileHover={disabled || isOpen ? {} : { z: 8, y: -2 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        style={{
          position: "absolute", inset: 0, borderRadius: 2,
          transformOrigin: "50% 84%",
          // Lighter gradient = more visible
          background: [
            `linear-gradient(170deg,`,
            `${C.drawerLit} 0%,`,
            `${C.drawer} 45%,`,
            `${C.drawerShadow} 100%)`,
          ].join(" "),
          border: `1px solid ${C.gold}38`,
          boxShadow: [
            `inset 0 1px 0 ${C.goldFaint}`,
            "inset 0 -2px 5px rgba(0,0,0,0.55)",
            `0 1px 0 rgba(0,0,0,0.7)`,
            `0 2px 5px rgba(0,0,0,0.45)`,
          ].join(", "),
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Label — larger and brighter */}
        <span className={shippori.className} style={{
          position: "absolute", top: 5, left: 0, right: 0, textAlign: "center",
          fontSize: 8.5, letterSpacing: "0.08em",
          color: isOpen ? `${C.goldLight}aa` : `${C.goldLight}88`,
          pointerEvents: "none",
        }}>
          {label}
        </span>

        {/* Top gold bevel stripe */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${C.gold}28 30%, ${C.gold}44 50%, ${C.gold}28 70%, transparent)`,
          borderRadius: "2px 2px 0 0",
        }} />

        {/* Knob plate */}
        <div style={{
          position: "absolute", bottom: "30%", left: "50%", transform: "translateX(-50%)",
          width: 20, height: 6, borderRadius: 3,
          background: `linear-gradient(180deg, ${C.goldDim} 0%, #3e2406 100%)`,
          boxShadow: `0 2px 4px rgba(0,0,0,0.7), inset 0 1px 0 ${C.gold}44`,
        }} />
        {/* Knob ring */}
        <div style={{
          position: "absolute", bottom: "22%", left: "50%", transform: "translateX(-50%)",
          width: 13, height: 7, borderRadius: "7px 7px 0 0",
          border: `1.5px solid ${C.goldDim}cc`, borderBottom: "none",
          boxShadow: `0 1px 4px rgba(0,0,0,0.6), inset 0 1px 0 ${C.gold}22`,
        }} />

        {/* Subtle grain lines */}
        {[42, 60].map((p) => (
          <div key={p} style={{
            position: "absolute", top: `${p}%`, left: "12%", right: "12%",
            height: 1, background: "rgba(0,0,0,0.14)", borderRadius: 1,
          }} />
        ))}
      </motion.button>
    </div>
  );
}

// ── Decorative center slot (25th) ──────────────────────────────────────────────
function CabinetCrest() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%", borderRadius: 2,
      background: `linear-gradient(155deg, #241408, #160a04)`,
      border: `1px solid ${C.gold}44`,
      boxShadow: `inset 0 0 12px rgba(0,0,0,0.8), inset 0 0 0 1px ${C.gold}14`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Outer gold border inset */}
      <div style={{
        position: "absolute", inset: 3, borderRadius: 1,
        border: `1px solid ${C.gold}28`,
      }} />
      <Kamon size={36} />
    </div>
  );
}

// ── Kuji tube ─────────────────────────────────────────────────────────────────
function KujiTube({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", bottom: 22, right: 22, zIndex: 50,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      }}
    >
      <div style={{ position: "relative", width: 26, height: 48 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "13px 13px 3px 3px",
          background: `linear-gradient(155deg, ${C.drawerLit}, ${C.drawer}, #110800)`,
          border: `1px solid ${C.goldDim}55`,
          boxShadow: "2px 4px 10px rgba(0,0,0,0.7), inset 1px 0 0 rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", top: -3, left: -2, right: -2, height: 6, borderRadius: "50%",
          background: `linear-gradient(180deg, ${C.goldDim}, ${C.drawer})`,
          border: `1px solid ${C.gold}44`,
        }} />
        {count > 0 && (
          <div style={{
            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
            width: 9, height: 12, borderRadius: "1px 1px 0 0",
            background: `linear-gradient(180deg, ${C.washi}, ${C.washiMid})`,
            border: `0.5px solid ${C.gold}44`,
          }} />
        )}
        <div style={{
          position: "absolute", top: 13, left: 2, right: 2, height: 3, borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${C.goldDim}77, transparent)`,
        }} />
      </div>
      {count > 0 && (
        <span className={shippori.className}
          style={{ fontSize: 7.5, color: `${C.gold}99`, letterSpacing: "0.1em" }}>
          {count}枚
        </span>
      )}
    </motion.div>
  );
}

// ── Draws remaining indicator ──────────────────────────────────────────────────
function DrawsRemaining({ remaining }: { remaining: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: MAX_DAILY }, (_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: i < remaining ? C.gold : `${C.gold}22`,
              boxShadow: i < remaining ? `0 0 5px ${C.gold}88` : "none",
              transition: "background 0.4s, box-shadow 0.4s",
            }}
          />
        ))}
      </div>
      <span className={shippori.className} style={{
        fontSize: 8.5, letterSpacing: "0.18em",
        color: remaining > 0 ? `${C.goldLight}99` : `${C.gold}44`,
      }}>
        残り {remaining} 回
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function OmikujiCabinetClient({ embed = false }: { embed?: boolean }) {
  const { remaining, limitReached, drawnIds, drawnIdxs, markAsDrawn } = useDailyLimit();
  const [drawerOrder,    setDrawerOrder]    = useState<number[] | null>(null);
  const [selectedFortune,setSelectedFortune]= useState<Fortune | null>(null);
  const [showSlip,       setShowSlip]       = useState(false);
  const [particleType,   setParticleType]   = useState<ParticleKind | null>(null);
  const [particleDense,  setParticleDense]  = useState(false);
  const [particleKey,    setParticleKey]    = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const slipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDrawerOrder(shuffleDrawerOrder(Date.now()));
    try {
      const n = localStorage.getItem("omikuji_collected_count");
      if (n) setCollectedCount(Number.parseInt(n, 10));
    } catch { /* */ }
  }, []);

  useEffect(() => () => { if (slipTimer.current) clearTimeout(slipTimer.current); }, []);

  // Map drawerIdx → fortune it holds today
  const fortuneAtDrawer = useCallback(
    (drawerIdx: number): Fortune | null => {
      if (!drawerOrder) return null;
      return FORTUNES[drawerOrder[drawerIdx]] ?? null;
    },
    [drawerOrder],
  );

  // Fortune already drawn at this drawer (if any)
  const drawnFortuneAtDrawer = useCallback(
    (drawerIdx: number): Fortune | null => {
      const pos = drawnIdxs.indexOf(drawerIdx);
      if (pos === -1) return null;
      const id = drawnIds[pos];
      return FORTUNES.find((f) => f.id === id) ?? null;
    },
    [drawnIds, drawnIdxs],
  );

  const onParticleComplete = useCallback(() => setParticleType(null), []);

  const handleDrawerClick = useCallback(
    (drawerIdx: number) => {
      if (!drawerOrder) return;

      // Re-open already-drawn drawer
      const alreadyDrawnFortune = drawnFortuneAtDrawer(drawerIdx);
      if (alreadyDrawnFortune) {
        setSelectedFortune(alreadyDrawnFortune);
        setShowSlip(true);
        return;
      }

      if (limitReached) return;

      // New draw
      const fortune = fortuneAtDrawer(drawerIdx);
      if (!fortune) return;

      setSelectedFortune(fortune);
      markAsDrawn(fortune.id, drawerIdx);
      setParticleKey((k) => k + 1);
      setParticleType(fortune.particleType);
      setParticleDense(!!fortune.particleDense);

      if (slipTimer.current) clearTimeout(slipTimer.current);
      slipTimer.current = setTimeout(() => setShowSlip(true), 860);
    },
    [drawerOrder, drawnFortuneAtDrawer, fortuneAtDrawer, limitReached, markAsDrawn],
  );

  const closeSlip    = useCallback(() => setShowSlip(false), []);
  const handleCollect = useCallback(() => {
    const next = collectedCount + 1;
    setCollectedCount(next);
    try { localStorage.setItem("omikuji_collected_count", String(next)); } catch { /* */ }
    setShowSlip(false);
  }, [collectedCount]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const bgStyle = useMemo(() => ({
    backgroundColor: C.bg,
    backgroundImage: [seigaihaUrl, "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,162,58,0.07), transparent 60%)"].join(", "),
    backgroundSize: "64px 64px, auto",
    color: C.washi,
  }), []);

  if (embed) {
    return (
      <div className={notoSerif.className} style={{ ...bgStyle, padding: 10 }}>
        <CabinetBox
          drawerOrder={drawerOrder}
          limitReached={limitReached}
          drawnIdxs={drawnIdxs}
          handleDrawerClick={handleDrawerClick}
          isEmbed
        />
        {particleType && <ParticleCanvas key={particleKey} type={particleType} dense={particleDense} onComplete={onParticleComplete} />}
        <AnimatePresence>
          {showSlip && selectedFortune && (
            <FortuneSlip fortune={selectedFortune} onClose={closeSlip} onCollect={handleCollect} collected={false} />
          )}
        </AnimatePresence>
        {collectedCount > 0 && <KujiTube count={collectedCount} />}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${notoSerif.className}`}
      style={{ height: "100dvh", overflow: "hidden", ...bgStyle }}>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between px-6 py-3"
        style={{ borderBottom: `1px solid ${C.gold}14` }}>
        <Link href="/playground" className={`${shippori.className} text-[10px] tracking-[0.22em]`}
          style={{ color: `${C.goldLight}70`, textDecoration: "none" }}>
          ← Playground
        </Link>
        <DrawsRemaining remaining={remaining} />
      </div>

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4 py-3" style={{ gap: 14 }}>

        {/* Title — between nav and cabinet */}
        <div className="flex flex-col items-center" style={{ gap: 4 }}>
          <h1 className={shippori.className} style={{
            fontSize: 22, fontWeight: 800,
            letterSpacing: "0.5em", color: C.goldLight,
            lineHeight: 1, textAlign: "center",
          }}>
            御　神　籤　箱
          </h1>
          <p className={notoSerif.className} style={{
            fontSize: 8, letterSpacing: "0.32em",
            color: `${C.gold}60`, textAlign: "center",
          }}>
            OMIKUJI CABINET
          </p>
          {limitReached && (
            <p className={shippori.className} style={{
              fontSize: 8.5, letterSpacing: "0.2em",
              color: `${C.goldLight}60`, marginTop: 2,
            }}>
              本日の御神籤は引き終えました　·　同じ引き出しを再度開けると再読できます
            </p>
          )}
        </div>

        {/* Cabinet */}
        <CabinetBox
          drawerOrder={drawerOrder}
          limitReached={limitReached}
          drawnIdxs={drawnIdxs}
          handleDrawerClick={handleDrawerClick}
        />
      </div>

      {/* Particles */}
      {particleType && (
        <ParticleCanvas key={particleKey} type={particleType} dense={particleDense} onComplete={onParticleComplete} />
      )}

      {/* Fortune slip */}
      <AnimatePresence>
        {showSlip && selectedFortune && (
          <FortuneSlip
            fortune={selectedFortune}
            onClose={closeSlip}
            onCollect={handleCollect}
            collected={false}
          />
        )}
      </AnimatePresence>

      {collectedCount > 0 && <KujiTube count={collectedCount} />}
    </div>
  );
}

// ── Cabinet box (shared between embed + full page) ─────────────────────────────
function CabinetBox({
  drawerOrder, limitReached, drawnIdxs, handleDrawerClick, isEmbed = false,
}: {
  drawerOrder: number[] | null;
  limitReached: boolean;
  drawnIdxs: number[];
  handleDrawerClick: (i: number) => void;
  isEmbed?: boolean;
}) {
  // 5 cols × 5 rows = 25 slots; slot 12 (center) = decorative crest
  const CREST_SLOT = 12;
  const TOTAL_SLOTS = 25;
  // Map slot → drawerIdx (skip crest slot)
  const slotToDrawer = useMemo(() => {
    const map: (number | null)[] = [];
    let drawerIdx = 0;
    for (let s = 0; s < TOTAL_SLOTS; s++) {
      if (s === CREST_SLOT) { map.push(null); }
      else { map.push(drawerIdx++); }
    }
    return map;
  }, []);

  return (
    <div style={{
      width: "min(90vw, 560px)",
      background: `linear-gradient(170deg, ${C.cabinetFace} 0%, ${C.cabinet} 100%)`,
      border: `2px solid ${C.gold}40`,
      borderRadius: 6,
      padding: isEmbed ? 10 : 14,
      boxShadow: [
        `0 0 0 3px ${C.bg}`,
        `0 0 0 4px ${C.gold}1c`,
        "0 28px 70px -8px rgba(0,0,0,0.95)",
        `inset 0 1px 0 ${C.gold}1c`,
        "inset 0 -1px 0 rgba(0,0,0,0.55)",
      ].join(", "),
    }}>
      {/* Top highlight */}
      <div style={{ height: 1, marginBottom: 10, background: `linear-gradient(90deg, transparent, ${C.gold}48 50%, transparent)` }} />

      {/* Nameplate */}
      <div className="flex items-center justify-center" style={{
        marginBottom: 10, padding: "6px 20px",
        background: `linear-gradient(180deg, ${C.cabinetFace}, ${C.cabinet})`,
        border: `1px solid ${C.gold}48`,
        borderRadius: 2,
        boxShadow: `inset 0 1px 0 ${C.gold}14`,
      }}>
        <div style={{ height: 1, width: 20, background: `linear-gradient(90deg, transparent, ${C.gold}55)`, marginRight: 10 }} />
        <p className={shippori.className} style={{
          fontSize: isEmbed ? 11 : 13,
          letterSpacing: "0.55em", color: C.goldLight, fontWeight: 700,
        }}>
          御　神　籤　箱
        </p>
        <div style={{ height: 1, width: 20, background: `linear-gradient(90deg, ${C.gold}55, transparent)`, marginLeft: 10 }} />
      </div>

      {/* 5×5 drawer grid */}
      {!drawerOrder ? (
        <p style={{ textAlign: "center", fontSize: 9, color: `${C.washi}38`, letterSpacing: "0.3em", padding: "24px 0" }}>
          箱を準備中…
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          gap: isEmbed ? 5 : 7,
          aspectRatio: "1 / 1",
        }}>
          {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
            const drawerIdx = slotToDrawer[slotIdx];
            if (drawerIdx === null) return <CabinetCrest key="crest" />;
            const isOpen    = drawnIdxs.includes(drawerIdx);
            const disabled  = limitReached && !isOpen;
            return (
              <Drawer
                key={drawerIdx}
                label={drawerKanjiFromIndex(drawerIdx)}
                disabled={disabled}
                isOpen={isOpen}
                onClick={() => handleDrawerClick(drawerIdx)}
              />
            );
          })}
        </div>
      )}

      {/* Bottom shadow strip */}
      <div style={{ height: 1, marginTop: 10, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.5) 50%, transparent)" }} />
    </div>
  );
}

// Need useMemo in CabinetBox — add it to imports check
// (useMemo is already imported at the top)

export default OmikujiCabinetClient;
