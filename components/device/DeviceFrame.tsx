"use client";

import type { ReactNode } from "react";

const ink = "#1A1A1A";

function StatusBar() {
  return (
    <div
      style={{
        height: 44,
        padding: "12px 24px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: 600,
        fontSize: 15,
        color: ink,
        fontVariantNumeric: "tabular-nums",
        background: "#FFFFFF",
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="6.5" width="3" height="4.5" rx="0.7" fill={ink} />
          <rect x="4.5" y="4.2" width="3" height="6.8" rx="0.7" fill={ink} />
          <rect x="9" y="2" width="3" height="9" rx="0.7" fill={ink} />
          <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill={ink} />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path d="M8 3.4C10.1 3.4 12 4.2 13.4 5.6L14.4 4.6C12.7 2.9 10.4 1.9 8 1.9C5.6 1.9 3.3 2.9 1.6 4.6L2.6 5.6C4 4.2 5.9 3.4 8 3.4Z" fill={ink} />
          <path d="M8 6.7C9.2 6.7 10.3 7.1 11.2 8L12.2 7C10.9 5.9 9.5 5.2 8 5.2C6.5 5.2 5.1 5.9 3.8 7L4.8 8C5.7 7.1 6.8 6.7 8 6.7Z" fill={ink} />
          <circle cx="8" cy="9.6" r="1.4" fill={ink} />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={ink} strokeOpacity="0.35" fill="none" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill={ink} />
          <rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill={ink} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative shrink-0"
      style={{
        width: 390,
        height: 844,
        background: "#1A1A1A",
        borderRadius: 44,
        boxShadow: "0 0 0 1.5px #3a3a3a, 0 40px 80px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className="absolute overflow-hidden flex flex-col"
        style={{ inset: 10, borderRadius: 35, background: "#FFFFFF" }}
      >
        <StatusBar />

        {/* Dynamic island */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 126,
            height: 34,
            background: "#1A1A1A",
            borderRadius: "0 0 20px 20px",
            zIndex: 20,
          }}
        />

        <div className="relative flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            height: 26,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: 6,
            background: "#FFFFFF",
          }}
        >
          <div style={{ width: 134, height: 5, borderRadius: 100, background: "rgba(0,0,0,0.18)" }} />
        </div>
      </div>
    </div>
  );
}
