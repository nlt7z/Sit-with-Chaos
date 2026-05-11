"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, decimals: number, started: boolean) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      setValue((1 - Math.pow(1 - t, 3)) * target);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, started]);

  return value;
}

const ASSETS = [
  { label: "Stock",  value: "$105.00 Usd" },
  { label: "Crypto", value: "$53.00 Usd"  },
  { label: "Cash",   value: "$23.00 Usd"  },
];

export function PortfolioCard() {
  const [started, setStarted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rawTotal    = useCountUp(35200,   1500, 0, started);
  const rawChange   = useCountUp(3567.99, 1800, 2, started);
  const rawAccounts = useCountUp(28,      1000, 0, started);
  const fmt = (v: number, d: number) => d > 0 ? v.toFixed(d) : Math.round(v).toLocaleString();

  return (
    <div
      ref={cardRef}
      className="relative w-[300px] rounded-[22px] overflow-hidden select-none"
      style={{
        boxShadow: "0 24px 64px rgba(10,20,90,0.30)",
      }}
    >
      {/* ── Blue glass top section ── */}
      <div
        style={{
          background: "rgba(75, 108, 182, 0.52)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.09), transparent)" }}
        />

        <div className="relative p-5 pb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-[18px]">
            <div className="flex items-center gap-[7px]">
              <div className="flex items-end gap-[2px]" style={{ height: 13 }}>
                {[3, 5, 4, 6, 4].map((h, i) => (
                  <div key={i} style={{ height: h * 2, background: "rgba(255,255,255,0.72)" }} className="w-[3px] rounded-[1px]" />
                ))}
              </div>
              <span className="text-white/88 font-medium text-[13px]">Portfolio Overview</span>
            </div>
            <div className="flex gap-[4px] items-center">
              <div className="w-[5px] h-[5px] rounded-full bg-white/28" />
              <div className="w-[5px] h-[5px] rounded-full bg-white/28" />
              <div className="w-[5px] h-[5px] rounded-full bg-white/85" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 mb-5">
            <div>
              <p className="text-white/45 text-[10px] mb-[3px]">Total Value</p>
              <p className="text-white font-semibold text-[17px] tabular-nums">${fmt(rawTotal, 0)}</p>
            </div>
            <div>
              <p className="text-white/45 text-[10px] mb-[3px]">Portfolio ChANGE</p>
              <p className="font-semibold text-[17px] tabular-nums" style={{ color: "#6decc8" }}>
                +{fmt(rawChange, 2)}
              </p>
            </div>
            <div>
              <p className="text-white/45 text-[10px] mb-[3px]">Total Accounts</p>
              <p className="text-white font-semibold text-[17px] tabular-nums">{fmt(rawAccounts, 0)}</p>
            </div>
          </div>

          {/* Bar chart — 2 prominent bars */}
          <div className="relative h-[88px]">
            {/* Left bar: light gradient, tall */}
            <div
              className="absolute bottom-0 left-0"
              style={{
                width: "43%",
                height: started ? "80%" : "0%",
                background: "linear-gradient(to bottom, rgba(230,240,255,0.88) 0%, rgba(155,185,235,0.42) 100%)",
                borderRadius: "4px 4px 2px 2px",
                transition: "height 0.95s cubic-bezier(0.34,1.56,0.64,1) 0ms",
              }}
            />
            {/* Right bar: solid blue, medium */}
            <div
              className="absolute bottom-0"
              style={{
                left: "46%",
                width: "30%",
                height: started ? "55%" : "0%",
                background: "rgba(100, 148, 220, 0.78)",
                borderRadius: "4px 4px 2px 2px",
                transition: "height 0.95s cubic-bezier(0.34,1.56,0.64,1) 80ms",
              }}
            />
            {/* Cursor line */}
            <div
              className="absolute bottom-0"
              style={{
                left: "31%",
                width: "1px",
                height: "100%",
                background: "rgba(255,255,255,0.38)",
              }}
            />
          </div>

          {/* Range axis */}
          <div className="mt-[5px]">
            <div className="relative w-full h-px" style={{ background: "rgba(255,255,255,0.20)" }}>
              {[0, 31, 64, 100].map((pct, i) => (
                <div
                  key={pct}
                  className="absolute top-1/2 rounded-full"
                  style={{
                    left: `${pct}%`,
                    transform: "translate(-50%,-50%)",
                    width: i === 1 ? 7 : 6,
                    height: i === 1 ? 7 : 6,
                    background: i === 1 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.52)",
                    boxShadow: i === 1 ? "0 0 7px rgba(255,255,255,0.65)" : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-[6px]">
              {["2.60", "4.990", "7.508", "8.394"].map((l) => (
                <span key={l} className="text-white/35 text-[9px] font-mono">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── White bottom section ── */}
      <div style={{ background: "rgba(255,255,255,0.94)" }}>
        <div className="px-5 py-[14px] space-y-0">
          {ASSETS.map((item, i) => (
            <div key={item.label}>
              <div className="flex justify-between items-center py-[9px]">
                <span className="text-[#1a2a50]/65 text-[13px]">{item.label}</span>
                <span className="text-[#1a2a50]/75 text-[13px] font-medium tabular-nums">{item.value}</span>
              </div>
              {i < ASSETS.length - 1 && <div className="h-px bg-black/[0.06]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
