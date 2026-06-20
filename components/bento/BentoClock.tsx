"use client";

/**
 * BentoClock — a live analog clock widget, echoing the reference site's clock.
 * Hands are CSS-rotated wrappers (pivot at the dial center); ticks the same way.
 * Renders blank until mounted so SSR and the client agree on the first frame.
 */

import { useEffect, useState } from "react";

function Hand({ deg, length, width, color, z = 10 }: { deg: number; length: string; width: number; color: string; z?: number }) {
  return (
    <div className="absolute inset-0" style={{ transform: `rotate(${deg}deg)`, zIndex: z }}>
      <div
        className="absolute bottom-1/2 left-1/2 -translate-x-1/2 rounded-full"
        style={{ height: length, width, background: color }}
      />
    </div>
  );
}

export function BentoClock() {
  const [t, setT] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({ h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const s = t?.s ?? 0;
  const m = t?.m ?? 0;
  const h = t?.h ?? 0;
  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hrDeg = (h % 12) * 30 + m * 0.5;
  const label = t
    ? `${String(((h + 11) % 12) + 1).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
    : "--:--";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="relative aspect-square w-full max-w-[6.5rem] rounded-full border border-white/10 bg-[#131416] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <span
              className="absolute left-1/2 top-[6px] -translate-x-1/2 rounded-full bg-white/25"
              style={{ height: i % 3 === 0 ? 6 : 3, width: i % 3 === 0 ? 2 : 1 }}
            />
          </div>
        ))}
        <Hand deg={hrDeg} length="26%" width={3} color="#ededed" z={12} />
        <Hand deg={minDeg} length="36%" width={2} color="#ededed" z={11} />
        <Hand deg={secDeg} length="40%" width={1.5} color="#d2ff00" z={13} />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>
      <span className="font-mono text-[10px] tracking-wider text-white/55">{label}</span>
    </div>
  );
}
