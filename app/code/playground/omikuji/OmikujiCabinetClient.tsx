"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Noto_Serif_JP, Shippori_Mincho } from "next/font/google";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { drawerKanjiFromIndex, FORTUNES, shuffleDrawerOrder, type Fortune, type ParticleKind } from "./fortunes";
import { ParticleCanvas } from "./ParticleCanvas";
import { MAX_DAILY, useDailyLimit } from "./useDailyLimit";

const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["300", "400", "700"], display: "swap" });
const shippori  = Shippori_Mincho({ subsets: ["latin"], weight: ["400", "700", "800"], display: "swap" });

// ── Palette (black lacquer + gold) ────────────────────────────────────────────
const C = {
  bg:          "#050505",
  cabinet:     "#0c0c0c",      // deep black lacquer
  cabinetFace: "#141414",      // dark charcoal
  drawer:      "#191714",      // near-black with faint warmth
  drawerLit:   "#222018",      // top highlight — slightly lifted
  drawerShadow:"#060504",      // very dark recess shadow
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

const SHRINE_BG = "/assets/Playground/omikuji-bg.png";

const shrineBgStyle = {
  backgroundImage: `url("${SHRINE_BG}")`,
  backgroundSize: "cover" as const,
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat" as const,
};

// ── Level → kanji + color ──────────────────────────────────────────────────────
const LEVEL_MAP: Record<string, { kanji: string; color: string }> = {
  "GREAT BLESSING": { kanji: "大吉", color: C.vermillion },
  "BLESSING":       { kanji: "中吉", color: "#b07a20" },
  "SMALL BLESSING": { kanji: "小吉", color: "#6a8040" },
  "FAINT BLESSING": { kanji: "末吉", color: "#4a7080" },
};

// ── Kamon ornament ─────────────────────────────────────────────────────────────
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

          <div style={{ display: "flex", height: 180, padding: "14px 16px" }}>
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

            <div style={{
              width: 1, flexShrink: 0,
              background: `linear-gradient(180deg, transparent, ${C.gold}50, transparent)`,
              margin: "4px 0",
            }} />

            <div style={{ flex: 1, paddingLeft: 16, display: "flex", flexDirection: "column" }}>
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

              <div style={{ height: 1, background: `linear-gradient(90deg, ${C.gold}40, transparent)`, margin: "8px 0 7px" }} />

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
                <span style={{ display: "block", fontSize: 7, letterSpacing: "0.08em", opacity: 0.82, marginTop: 1 }}>Keep</span>
              </button>
            )}
            <button type="button" onClick={onClose} className={shippori.className}
              style={{
                fontSize: 9, letterSpacing: "0.3em", padding: "5px 18px",
                border: `1px solid ${C.ink}18`, borderRadius: 2,
                background: "rgba(0,0,0,0.03)", color: C.inkMid, cursor: "pointer",
              }}>
              <span style={{ display: "block", lineHeight: 1.2 }}>閉 じ る</span>
              <span style={{ display: "block", fontSize: 7, letterSpacing: "0.08em", opacity: 0.82, marginTop: 1 }}>Close</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// ── Single drawer (5×5 cabinet) — black lacquer + gold ────────────────────────
function Drawer({ label, disabled, isOpen, onClick }: {
  label: string; disabled: boolean; isOpen: boolean; onClick: () => void;
}) {
  return (
    <div style={{ perspective: "260px", position: "relative", width: "100%", height: "100%" }}>
      {/* Recess */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 2,
        background: "#010101",
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

      {/* Drawer face — black lacquer */}
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
          background: [
            `linear-gradient(170deg,`,
            `${C.drawerLit} 0%,`,
            `${C.drawer} 45%,`,
            `${C.drawerShadow} 100%)`,
          ].join(" "),
          border: `1px solid ${C.gold}3a`,
          boxShadow: [
            `inset 0 1px 0 ${C.goldFaint}`,
            "inset 0 -2px 5px rgba(0,0,0,0.7)",
            `0 1px 0 rgba(0,0,0,0.8)`,
            `0 2px 6px rgba(0,0,0,0.5)`,
          ].join(", "),
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Cabinet image overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/Playground/cab.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
      </motion.button>
    </div>
  );
}

// ── Decorative center slot ─────────────────────────────────────────────────────
function CabinetCrest() {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%", borderRadius: 2,
      background: `linear-gradient(155deg, #1a1a1a, #080808)`,
      border: `1px solid ${C.gold}44`,
      boxShadow: `inset 0 0 14px rgba(0,0,0,0.9), inset 0 0 0 1px ${C.gold}10`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", inset: 3, borderRadius: 1, border: `1px solid ${C.gold}28` }} />
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
          background: `linear-gradient(155deg, ${C.drawerLit}, ${C.drawer}, #080808)`,
          border: `1px solid ${C.gold}44`,
          boxShadow: "2px 4px 10px rgba(0,0,0,0.7), inset 1px 0 0 rgba(255,255,255,0.03)",
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

// ── Shrine hotspot — pulsing glow + hover ripple waves ────────────────────────
const RIPPLE_DELAYS = [0, 0.32, 0.64] as const;

// ── Orbiting stars around a center point ──────────────────────────────────────
// The parent motion.div rotates continuously; each star is a static div at
// its orbital position with a motion.span inside for twinkling — no transform
// conflicts because positioning (parent) and twinkling (child) are separate.
function OrbitStars({
  radius,
  items,
  duration,
  reverse = false,
  hovered,
}: {
  radius: number;
  items: { char: string; size: number; color: string }[];
  duration: number;
  reverse?: boolean;
  hovered: boolean;
}) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "74%",
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
      animate={{ rotate: reverse ? [0, -360] : [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" as const }}
    >
      {items.map(({ char, size, color }, i) => {
        // Evenly distribute; start from top (−π/2 offset)
        const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        return (
          // Static div — handles x/y position without framer-motion transform clash
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.span
              style={{ display: "block", fontSize: size, color, lineHeight: 1, userSelect: "none" }}
              animate={{
                opacity: hovered ? [0.7, 1, 0.7] : [0.22, 0.72, 0.22],
                scale:   hovered ? [0.9, 1.5, 0.9] : [0.7, 1.15, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i / items.length) * 2,
              }}
            >
              {char}
            </motion.span>
          </div>
        );
      })}
    </motion.div>
  );
}

// calc()-based centering — no CSS transform means no framer-motion scale conflict
const ringAt = (size: number): React.CSSProperties => ({
  position: "absolute",
  left:  `calc(50% - ${size / 2}px)`,
  top:   `calc(74% - ${size / 2}px)`,
  width: size,
  height: size,
  borderRadius: "50%",
  pointerEvents: "none",
});

function ShrineHotspot({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false);

  // Inner orbit: 6 small gold stars CW
  const innerStars = [
    { char: "✦", size: 6,  color: C.goldBright },
    { char: "✧", size: 5,  color: C.gold       },
    { char: "✦", size: 6,  color: C.goldLight  },
    { char: "✧", size: 4,  color: C.gold       },
    { char: "✦", size: 6,  color: C.goldBright },
    { char: "✧", size: 5,  color: C.goldLight  },
  ];

  // Outer orbit: 4 floral stars CCW
  const outerStars = [
    { char: "✿", size: 8,  color: C.goldLight  },
    { char: "✦", size: 6,  color: C.gold       },
    { char: "✿", size: 7,  color: C.goldBright },
    { char: "✦", size: 5,  color: C.gold       },
  ];

  return (
    <>
      {/* ── Hover ripple waves — hairline ── */}
      {RIPPLE_DELAYS.map((delay, i) => (
        <motion.div
          key={i}
          style={{ ...ringAt(46), border: `0.5px solid ${C.goldLight}` }}
          animate={hovered ? { scale: [1, 3.6], opacity: [0.5, 0] } : { scale: 1, opacity: 0 }}
          transition={hovered
            ? { duration: 1.2, delay, repeat: Infinity, ease: "easeOut" }
            : { duration: 0.2 }
          }
        />
      ))}

      {/* ── Outer breathe ring — hairline ── */}
      <motion.div
        style={{ ...ringAt(86), border: `0.4px solid ${C.gold}44` }}
        animate={hovered
          ? { opacity: 0.18, scale: 1 }
          : { scale: [0.9, 1.42, 0.9], opacity: [0.38, 0, 0.38] }
        }
        transition={hovered ? { duration: 0.35 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Mid ring — appears on hover only ── */}
      <motion.div
        style={{ ...ringAt(64), border: `0.4px solid ${C.gold}` }}
        animate={hovered
          ? { opacity: [0.25, 0.55, 0.25], scale: [0.97, 1.03, 0.97] }
          : { opacity: 0 }
        }
        transition={hovered
          ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.25 }
        }
      />

      {/* ── Inner ring — hairline glow on hover ── */}
      <motion.div
        style={{ ...ringAt(46), border: `0.75px solid ${C.gold}` }}
        animate={hovered
          ? { scale: 1.12, opacity: 1, boxShadow: `0 0 18px 6px ${C.gold}38, 0 0 44px 14px ${C.gold}14` }
          : { scale: [1, 1.08, 1], opacity: [0.7, 0.38, 0.7], boxShadow: `0 0 8px 2px ${C.gold}22` }
        }
        transition={hovered ? { duration: 0.35 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Innermost static hairline ── */}
      <motion.div
        style={{ ...ringAt(30), border: `0.4px solid ${C.gold}30` }}
        animate={hovered
          ? { opacity: [0.4, 0.7, 0.4] }
          : { opacity: [0.15, 0.35, 0.15] }
        }
        transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Orbiting stars ── */}
      <OrbitStars radius={32} items={innerStars} duration={16} hovered={hovered} />
      <OrbitStars radius={54} items={outerStars} duration={24} reverse hovered={hovered} />

      {/* ── Center dot — refined ── */}
      <motion.div
        style={{ ...ringAt(7), background: C.goldBright, borderRadius: "50%" }}
        animate={hovered
          ? { scale: 1.6, opacity: 1, boxShadow: `0 0 16px 5px ${C.gold}70, 0 0 36px 12px ${C.gold}30` }
          : { scale: [0.88, 1.08, 0.88], opacity: [0.65, 1, 0.65], boxShadow: `0 0 8px 2px ${C.gold}55` }
        }
        transition={hovered ? { duration: 0.3 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Invisible clickable / hover zone */}
      <button
        type="button"
        onClick={onEnter}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Click the shrine to draw your fortune"
        style={{
          position: "absolute",
          left: "18%", right: "18%",
          top: "6%", bottom: "4%",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          zIndex: 15,
        }}
      />

      {/* Hint text */}
      <motion.p
        className={`${notoSerif.className} pointer-events-none absolute bottom-5 left-0 right-0 text-center`}
        style={{
          fontSize: 8.5,
          letterSpacing: "0.28em",
          color: "rgba(245,228,200,0.82)",
          textShadow: "0 2px 20px rgba(0,0,0,0.95)",
          zIndex: 16,
        }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        click the shrine · draw your fortune
      </motion.p>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function OmikujiCabinetClient({ embed = false }: { embed?: boolean }) {
  const { remaining, limitReached, drawnIds, drawnIdxs, markAsDrawn } = useDailyLimit();
  const [drawerOrder,     setDrawerOrder]     = useState<number[] | null>(null);
  const [selectedFortune, setSelectedFortune] = useState<Fortune | null>(null);
  const [showSlip,        setShowSlip]        = useState(false);
  const [particleType,    setParticleType]    = useState<ParticleKind | null>(null);
  const [particleDense,   setParticleDense]   = useState(false);
  const [particleKey,     setParticleKey]     = useState(0);
  const [collectedCount,  setCollectedCount]  = useState(0);
  const [cabinetVisible,  setCabinetVisible]  = useState(false);
  const slipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDrawerOrder(shuffleDrawerOrder(Date.now()));
    try {
      const n = localStorage.getItem("omikuji_collected_count");
      if (n) setCollectedCount(Number.parseInt(n, 10));
    } catch { /* */ }
  }, []);

  useEffect(() => () => {
    if (slipTimer.current) clearTimeout(slipTimer.current);
  }, []);

  const openCabinet  = useCallback(() => setCabinetVisible(true),  []);
  const closeCabinet = useCallback(() => setCabinetVisible(false), []);

  const fortuneAtDrawer = useCallback(
    (drawerIdx: number): Fortune | null => {
      if (!drawerOrder) return null;
      return FORTUNES[drawerOrder[drawerIdx]] ?? null;
    },
    [drawerOrder],
  );

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

      const alreadyDrawnFortune = drawnFortuneAtDrawer(drawerIdx);
      if (alreadyDrawnFortune) {
        setSelectedFortune(alreadyDrawnFortune);
        setShowSlip(true);
        return;
      }

      if (limitReached) return;

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

  const closeSlip     = useCallback(() => setShowSlip(false), []);
  const handleCollect = useCallback(() => {
    const next = collectedCount + 1;
    setCollectedCount(next);
    try { localStorage.setItem("omikuji_collected_count", String(next)); } catch { /* */ }
    setShowSlip(false);
  }, [collectedCount]);

  const pageInk = { color: C.washi } as const;

  // ── Shared render body ─────────────────────────────────────────────────────
  const content = (
    <>
      {/* Solid dark backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: C.bg }} />

      {/* Centered shrine image — ~80% of screen, 4:3, with vignette fade */}
      <div
        className="absolute z-[1]"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          // Width-constrained on mobile, height-constrained on desktop landscape
          width: "min(90vw, calc(84vh * 4 / 3))",
          aspectRatio: "4 / 3",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: [
            `0 0 0 1px ${C.gold}18`,
            "0 12px 60px 16px rgba(0,0,0,0.65)",
            "0 0 80px 24px rgba(0,0,0,0.38)",
          ].join(", "),
        }}
      >
        {/* Image fill */}
        <div className="pointer-events-none absolute inset-0" style={shrineBgStyle} />

        {/* Vignette: light edge fade — keeps center image bright */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background: [
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 35%, rgba(5,5,5,0.22) 65%, rgba(5,5,5,0.62) 100%)",
              // subtle bottom strip so hint text stays legible
              "linear-gradient(180deg, transparent 72%, rgba(5,5,5,0.48) 100%)",
            ].join(", "),
          }}
        />

        {/* Shrine hotspot lives inside the image so it's always aligned */}
        <AnimatePresence>
          {!cabinetVisible && (
            <motion.div
              key="shrine-hotspot"
              className="absolute inset-0"
              style={{ zIndex: 3 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShrineHotspot onEnter={openCabinet} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cabinet modal — floats in from below */}
      <AnimatePresence>
        {cabinetVisible && (
          <motion.div
            key="cabinet-overlay"
            className="absolute inset-0 z-[20] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
            onClick={closeCabinet}
            style={{
              // Dark tint preserves the shrine image underneath — not pure black
              background: "rgba(3,5,8,0.58)",
              backdropFilter: "blur(5px) brightness(0.65)",
              cursor: "pointer",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeCabinet}
              className={`${shippori.className} absolute`}
              style={{
                top: embed ? 12 : 16,
                right: embed ? 14 : 20,
                fontSize: 9,
                letterSpacing: "0.26em",
                color: `${C.gold}66`,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                zIndex: 5,
              }}
            >
              ← 返 回
            </button>

            {/* Floating cabinet — stop propagation so clicks inside don't close */}
            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.91 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 35, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 210, damping: 28, mass: 0.85 }}
              className="flex flex-col items-center"
              style={{ gap: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <div className="flex flex-col items-center" style={{ gap: 3 }}>
                <h1
                  className={shippori.className}
                  style={{
                    fontSize: embed ? 17 : 21,
                    fontWeight: 800,
                    letterSpacing: "0.5em",
                    color: C.goldLight,
                    lineHeight: 1,
                    textAlign: "center",
                    textShadow: "0 2px 28px rgba(0,0,0,0.8), 0 0 48px rgba(0,0,0,0.5)",
                  }}
                >
                  御　神　籤　箱
                </h1>
                <p
                  className={notoSerif.className}
                  style={{
                    fontSize: 7.5,
                    letterSpacing: "0.32em",
                    color: `${C.gold}77`,
                    textAlign: "center",
                  }}
                >
                  OMIKUJI CABINET
                </p>
                {limitReached && (
                  <p className={shippori.className} style={{
                    fontSize: 8.5, letterSpacing: "0.2em",
                    color: `${C.goldLight}55`, marginTop: 2, textAlign: "center",
                  }}>
                    本日の御神籤は引き終えました　·　同じ引き出しを再度開けると再読できます
                  </p>
                )}
              </div>

              <DrawsRemaining remaining={remaining} />

              <CabinetBox
                drawerOrder={drawerOrder}
                limitReached={limitReached}
                drawnIdxs={drawnIdxs}
                handleDrawerClick={handleDrawerClick}
                isEmbed={embed}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles */}
      {particleType && (
        <ParticleCanvas key={particleKey} type={particleType} dense={particleDense} onComplete={onParticleComplete} />
      )}

      {/* Fortune slip */}
      <AnimatePresence>
        {showSlip && selectedFortune && (
          <FortuneSlip fortune={selectedFortune} onClose={closeSlip} onCollect={handleCollect} collected={false} />
        )}
      </AnimatePresence>

      {collectedCount > 0 && <KujiTube count={collectedCount} />}
    </>
  );

  if (embed) {
    return (
      <div
        className={`relative ${notoSerif.className}`}
        style={{
          boxSizing: "border-box",
          minHeight: "100dvh",
          width: "100%",
          backgroundColor: "#050505",
          ...pageInk,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col overflow-hidden ${notoSerif.className}`}
      style={{ height: "100dvh", backgroundColor: "#050505", ...pageInk }}
    >
      {/* Nav bar */}
      <div
        className="relative z-[40] flex flex-none items-center justify-end px-6 py-3"
        style={{
          borderBottom: `1px solid ${C.gold}10`,
          background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <DrawsRemaining remaining={remaining} />
      </div>

      {/* Main area */}
      <div className="relative z-[5] flex min-h-0 flex-1 overflow-hidden">
        {content}
      </div>
    </div>
  );
}

// ── Cabinet box ────────────────────────────────────────────────────────────────
function CabinetBox({
  drawerOrder, limitReached, drawnIdxs, handleDrawerClick, isEmbed = false,
}: {
  drawerOrder: number[] | null;
  limitReached: boolean;
  drawnIdxs: number[];
  handleDrawerClick: (i: number) => void;
  isEmbed?: boolean;
}) {
  const CREST_SLOT  = 12;
  const TOTAL_SLOTS = 25;
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
      width: "min(90vw, 520px)",
      background: `linear-gradient(170deg, ${C.cabinetFace} 0%, ${C.cabinet} 100%)`,
      border: `2px solid ${C.gold}3c`,
      borderRadius: 6,
      padding: isEmbed ? 10 : 13,
      boxShadow: [
        `0 0 0 3px ${C.bg}`,
        `0 0 0 4px ${C.gold}18`,
        "0 32px 80px -8px rgba(0,0,0,0.98)",
        `inset 0 1px 0 ${C.gold}18`,
        "inset 0 -1px 0 rgba(0,0,0,0.6)",
      ].join(", "),
    }}>
      {/* Top gold highlight */}
      <div style={{ height: 1, marginBottom: 10, background: `linear-gradient(90deg, transparent, ${C.gold}44 50%, transparent)` }} />

      {/* Nameplate */}
      <div className="flex items-center justify-center" style={{
        marginBottom: 10, padding: "6px 20px",
        background: `linear-gradient(180deg, ${C.cabinetFace}, ${C.cabinet})`,
        border: `1px solid ${C.gold}44`,
        borderRadius: 2,
        boxShadow: `inset 0 1px 0 ${C.gold}10`,
      }}>
        <div style={{ height: 1, width: 20, background: `linear-gradient(90deg, transparent, ${C.gold}50)`, marginRight: 10 }} />
        <p className={shippori.className} style={{
          fontSize: isEmbed ? 11 : 13,
          letterSpacing: "0.55em", color: C.goldLight, fontWeight: 700,
        }}>
          御　神　籤　箱
        </p>
        <div style={{ height: 1, width: 20, background: `linear-gradient(90deg, ${C.gold}50, transparent)`, marginLeft: 10 }} />
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
          gap: isEmbed ? 5 : 6,
          aspectRatio: "1 / 1",
        }}>
          {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
            const drawerIdx = slotToDrawer[slotIdx];
            if (drawerIdx === null) return <CabinetCrest key="crest" />;
            const isOpen   = drawnIdxs.includes(drawerIdx);
            const disabled = limitReached && !isOpen;
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
      <div style={{ height: 1, marginTop: 10, background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.6) 50%, transparent)" }} />
    </div>
  );
}

export default OmikujiCabinetClient;
