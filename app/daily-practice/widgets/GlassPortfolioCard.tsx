"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { BarChart3, MoreHorizontal, TrendingUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/* ── easing ──────────────────────────────────────────────────── */
const APPLE = [0.32, 0.72, 0, 1] as const;
const EXPO  = [0.16, 1, 0.3, 1] as const;

/* ── shadow tokens ───────────────────────────────────────────── */
const SHADOW_REST = [
  "inset 0 1px 0 rgba(255,255,255,0.30)",
  "inset 1px 0 0 rgba(255,255,255,0.15)",
  "inset 0 -1px 0 rgba(255,255,255,0.03)",
  "inset -1px 0 0 rgba(255,255,255,0.03)",
  "0 8px 32px rgba(0,0,0,0.22)",
].join(", ");

const SHADOW_HOVER = [
  "inset 0 1px 0 rgba(255,255,255,0.50)",
  "inset 1px 0 0 rgba(255,255,255,0.24)",
  "inset 0 -1px 0 rgba(255,255,255,0.04)",
  "inset -1px 0 0 rgba(255,255,255,0.04)",
  "0 16px 48px rgba(0,0,0,0.30)",
].join(", ");

/* ── shared divider styles ───────────────────────────────────── */
const DIVIDER: React.CSSProperties = {
  height: 1,
  background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent 100%)",
};

const DIVIDER_LIST: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.06)",
};

/* ── count-up ────────────────────────────────────────────────── */
function useCountUp(target: number, decimals: number, delay: number, started: boolean) {
  const [display, setDisplay] = useState("0");
  const valRef = useRef(0);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      const ctrl = animate(valRef.current, target, {
        duration: 1.2,
        ease: EXPO,
        onUpdate(v) {
          setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString());
        },
      });
      return () => ctrl.stop();
    }, delay);
    return () => clearTimeout(t);
  }, [started, target, decimals, delay]);

  return display;
}

/* ── data ────────────────────────────────────────────────────── */
const BAR_DATA = [
  { value: 2.6,   month: "Jan", label: "2.6k"  },
  { value: 4.99,  month: "Feb", label: "4.99k" },
  { value: 7.938, month: "Mar", label: "7.93k" },
  { value: 8.394, month: "Apr", label: "8.39k" },
];
const BAR_MAX = Math.max(...BAR_DATA.map((b) => b.value));

const ASSETS = [
  { label: "Stock",  amount: "105.00", pct: 57, dot: "rgba(255,255,255,1.00)" },
  { label: "Crypto", amount: "53.00",  pct: 29, dot: "rgba(255,255,255,0.60)" },
  { label: "Cash",   amount: "23.00",  pct: 14, dot: "rgba(255,255,255,0.35)" },
];

/* sparkline — 30 fake data points trending up */
const SPARKLINE = [
  28,24,26,22,25,27,23,26,29,28,
  31,30,29,33,32,35,34,36,33,35,
  37,36,38,35,39,38,40,42,41,44,
];


/* ── bar ─────────────────────────────────────────────────────── */
function Bar({ heightPct, delay, month, tooltip, isLatest, started }: {
  heightPct: number; delay: number; month: string; tooltip: string;
  isLatest: boolean; started: boolean;
}) {
  const [dotVisible, setDotVisible]   = useState(false);
  const [hovered, setHovered]         = useState(false);
  const springH = useSpring(0, { stiffness: 100, damping: 20, mass: 1 });
  const heightStyle = useTransform(springH, (v) => `${v}%`);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      springH.set(heightPct);
      if (isLatest) {
        const t2 = setTimeout(() => setDotVisible(true), 500);
        return () => clearTimeout(t2);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [started, heightPct, delay, springH, isLatest]);

  const topPct = 100 - heightPct;
  const barAlpha = isLatest ? 0.52 : 0.22;

  return (
    <div
      className="flex-1 flex flex-col items-center justify-end relative"
      style={{ height: 120, overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip — only on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: `calc(${topPct}% - 28px)`,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            padding: "3px 7px",
            whiteSpace: "nowrap",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 600, fontFeatureSettings: '"tnum"' }}>
            {tooltip}
          </span>
        </div>
      )}

      {/* Dashed line + dot — only on latest bar */}
      {isLatest && (
        <>
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            top: `calc(${topPct}% + 5px)`, bottom: 0, width: 1,
            opacity: dotVisible ? 1 : 0,
            transition: `opacity 0.35s cubic-bezier(${APPLE.join(",")})`,
            background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.42) 0px, rgba(255,255,255,0.42) 3px, transparent 3px, transparent 7px)",
          }} />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={dotVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: APPLE }}
            style={{ position: "absolute", left: "50%", bottom: `${heightPct}%`, transform: "translate(-50%, 50%)", zIndex: 2, width: 8, height: 8 }}
          >
            <div className="w-2 h-2 rounded-full bg-white" style={{
              boxShadow: "0 0 0 3px rgba(255,255,255,0.22), 0 0 10px rgba(255,255,255,0.55)"
            }} />
          </motion.div>
        </>
      )}

      {/* Bar */}
      <motion.div className="w-full rounded-t-[4px]" style={{
        height: heightStyle,
        background: `linear-gradient(to bottom, rgba(255,255,255,${barAlpha + 0.15}), rgba(255,255,255,${barAlpha - 0.1}))`,
        minHeight: 2,
      }} />

      {/* Month label */}
      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 7, fontWeight: isLatest ? 600 : 400 }}>
        {month}
      </span>
    </div>
  );
}

/* ── noise ───────────────────────────────────────────────────── */
function NoiseSVG() {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      borderRadius: 24, opacity: 0.04, mixBlendMode: "overlay", pointerEvents: "none",
    }}>
      <defs>
        <filter id={`noise-${id}`} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#noise-${id})`} />
    </svg>
  );
}

/* ── sparkline ───────────────────────────────────────────────── */
function Sparkline({ data, width = 120, height = 20 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const xs = data.map((_, i) => (i / (data.length - 1)) * width);
  const ys = data.map((v) => height - ((v - min) / (max - min)) * height);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(52,211,153,0.08)" />
          <stop offset="100%" stopColor="rgba(52,211,153,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="#34d399" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── asymmetric stats block ──────────────────────────────────── */
function StatsBlock({ started }: { started: boolean }) {
  const totalVal    = useCountUp(35200,   0, 200, started);
  const changeVal   = useCountUp(3567.99, 2, 300, started);
  const accountsVal = useCountUp(28,      0, 400, started);

  const labelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
  };
  const numBase: React.CSSProperties = {
    fontFeatureSettings: '"tnum", "ss01"', letterSpacing: "-0.02em",
    lineHeight: 1, fontWeight: 600,
  };

  return (
    <motion.div
      className="flex gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.5, ease: APPLE, delay: 0.18 }}
    >
      {/* Left 50% — Total Value (主角) */}
      <div style={{ flex: "0 0 50%" }}>
        <p style={labelStyle}>Total Value</p>
        <p style={{ ...numBase, color: "#fff", fontSize: 36 }}>${totalVal}</p>
        <div style={{ marginTop: 12 }}>
          <Sparkline data={SPARKLINE} width={92} height={20} />
        </div>
      </div>

      {/* Right 50% — Change + Accounts stacked */}
      <div className="flex flex-col justify-between" style={{ flex: "1 1 0" }}>
        {/* Change */}
        <div>
          <p style={labelStyle}>Change</p>
          <div className="flex items-center gap-1">
            <TrendingUp size={13} style={{ color: "#34d399", flexShrink: 0, marginTop: 1 }} />
            <p style={{ ...numBase, color: "#34d399", fontSize: 20, fontWeight: 500 }}>+{changeVal}</p>
          </div>
        </div>
        {/* Accounts */}
        <div style={{ marginTop: 10 }}>
          <p style={labelStyle}>Accounts</p>
          <p style={{ ...numBase, color: "rgba(255,255,255,0.80)", fontSize: 16, fontWeight: 500 }}>{accountsVal}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── main card ───────────────────────────────────────────────── */
export function GlassPortfolioCard({ isActive }: { isActive: boolean }) {
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    /* container entrance = 600ms, then stagger starts */
    const t = setTimeout(() => setStarted(true), 650);
    return () => clearTimeout(t);
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isActive
        ? { opacity: 1, y: hovered ? -2 : 0, scale: hovered ? 0.505 : 0.5, boxShadow: hovered ? SHADOW_HOVER : SHADOW_REST }
        : { opacity: 0, y: 20, scale: 0.5, boxShadow: SHADOW_REST }
      }
      transition={{
        opacity:   { duration: 0.6, ease: APPLE },
        y:         { duration: 0.4, ease: APPLE },
        scale:     { duration: 0.4, ease: APPLE },
        boxShadow: { duration: 0.4, ease: APPLE },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        width: 400, borderRadius: 24, position: "relative",
        backgroundColor: "rgba(255,255,255,0.03)",
        backdropFilter: hovered
          ? "blur(44px) saturate(200%) brightness(1.08) contrast(1.04)"
          : "blur(54px) saturate(200%) brightness(1.08) contrast(1.04)",
        WebkitBackdropFilter: hovered
          ? "blur(44px) saturate(200%) brightness(1.08) contrast(1.04)"
          : "blur(54px) saturate(200%) brightness(1.08) contrast(1.04)",
        padding: 24,
        transition: "backdrop-filter 400ms cubic-bezier(0.32,0.72,0,1), -webkit-backdrop-filter 400ms cubic-bezier(0.32,0.72,0,1)",
      }}
      className="select-none"
    >
      {/* env light */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)" }} />
      <NoiseSVG />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* 1 — Header: first to appear (delay 0 from started) */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: APPLE, delay: 0 }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: "rgba(255,255,255,0.70)" }} />
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>Portfolio Overview</span>
          </div>
          <MoreHorizontal size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
        </motion.div>

        {/* 2 — Stats: asymmetric layout */}
        <StatsBlock started={started} />

        {/* Divider between stats and bars */}
        <div style={{ ...DIVIDER, marginBottom: 16 }} />

        {/* 3 — Bars: same start time as stats (200ms) → synchronized "data loading" feel */}
        <motion.div
          className="flex gap-2 mb-1"
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, ease: APPLE, delay: 0.18 }}
        >
          {BAR_DATA.map((b, i) => (
            <Bar
              key={i}
              heightPct={(b.value / BAR_MAX) * 100}
              delay={200 + i * 100}
              month={b.month}
              tooltip={b.label}
              isLatest={i === BAR_DATA.length - 1}
              started={started}
            />
          ))}
        </motion.div>

        {/* Divider */}
        <div style={{ ...DIVIDER, margin: "20px 0" }} />

        {/* 4 — Asset list */}
        <div>
          {ASSETS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={started ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, ease: APPLE, delay: 0.45 + i * 0.08 }}
            >
              <div className="flex items-center justify-between" style={{ paddingTop: 9, paddingBottom: 9 }}>
                {/* Left: dot + label + progress bar */}
                <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
                  <div>
                    <span style={{ color: "#fff", fontSize: 13 }}>{item.label}</span>
                    {/* Mini progress bar */}
                    <div style={{ width: 64, height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 1, marginTop: 3 }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: "#ffffff", borderRadius: 1, opacity: item.pct === 57 ? 1 : item.pct === 29 ? 0.6 : 0.35 }} />
                    </div>
                  </div>
                </div>
                {/* Right: amount + pct */}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFeatureSettings: '"tnum"' }}>
                    <span style={{ color: "#fff", fontSize: 13 }}>${item.amount} </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 400 }}>USD</span>
                  </span>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 2 }}>{item.pct}%</div>
                </div>
              </div>
              {i < ASSETS.length - 1 && <div style={DIVIDER_LIST} />}
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
