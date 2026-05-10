"use client";

import React from "react";

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: 375, height: 812 }}
    >
      {/* Bezel */}
      <div
        className="absolute inset-0 rounded-[48px] shadow-2xl overflow-hidden"
        style={{
          background: "#1A1A1A",
          boxShadow:
            "0 0 0 2px #3a3a3a, 0 0 0 4px #1a1a1a, 0 32px 80px rgba(0,0,0,0.45)",
        }}
      >
        {/* Screen area */}
        <div
          className="absolute rounded-[44px] overflow-hidden bg-meituan-bg-page"
          style={{ inset: 4 }}
        >
          {/* Notch / Dynamic Island */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 rounded-full"
            style={{ width: 120, height: 34, background: "#1A1A1A" }}
          />

          {/* Status bar */}
          <div
            className="absolute top-0 left-0 right-0 z-40 flex items-end justify-between px-8 pb-1"
            style={{ height: 54, color: "#1A1A1A" }}
          >
            <span className="text-[13px] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
              9:41
            </span>
            <div className="flex items-center gap-1.5 text-[13px]">
              {/* Signal */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                <rect x="0" y="7" width="3" height="5" rx="0.5" />
                <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
                <rect x="9" y="2.5" width="3" height="9.5" rx="0.5" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                <path d="M8 6.5C6.07 6.5 4.32 7.27 3.03 8.53l1.42 1.41A5.47 5.47 0 018 8.5c1.5 0 2.86.6 3.85 1.57l1.42-1.41A7.46 7.46 0 008 6.5z" />
                <path d="M8 3C5.12 3 2.53 4.11.64 5.96l1.41 1.41C3.52 5.87 5.66 5 8 5s4.48.87 5.95 2.37l1.41-1.41A10.94 10.94 0 008 3z" />
              </svg>
              {/* Battery */}
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
                <rect x="0" y="1" width="21" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <rect x="1.5" y="2.5" width="17" height="7" rx="1" fill="currentColor" />
                <path d="M22.5 4v4a2 2 0 000-4z" />
              </svg>
            </div>
          </div>

          {/* Content area */}
          <div className="absolute inset-0" style={{ paddingTop: 54 }}>
            {children}
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: 134, height: 5, background: "rgba(0,0,0,0.2)" }}
          />
        </div>
      </div>
    </div>
  );
}
