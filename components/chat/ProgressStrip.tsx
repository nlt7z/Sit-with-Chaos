"use client";

// Spec §6.2 — 36px, trust.blue underline, chevron separators

import { Fragment } from "react";
import { motion } from "framer-motion";
import type { Stage } from "@/lib/chatStore";

const C = {
  trustBlue: "#1677FF",
  ink500: "#999999",
  ink400: "#C0C0C0",
  surface0: "#FFFFFF",
};

const STAGES: { num: Stage; label: string }[] = [
  { num: 1, label: "Identify Issue" },
  { num: 2, label: "Diagnose" },
  { num: 3, label: "Pricing" },
  { num: 4, label: "Compare" },
];

export function ProgressStrip({ currentStage }: { currentStage: Stage }) {
  return (
    <div
      style={{
        height: 36,
        background: C.surface0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {STAGES.map((s, i) => {
        const active = s.num === currentStage;
        return (
          <Fragment key={s.num}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? C.trustBlue : C.ink500,
                  lineHeight: "18px",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
              >
                {s.num} {s.label}
              </span>
              {active && (
                <motion.div
                  layoutId="progress-underline"
                  style={{
                    position: "absolute",
                    bottom: -9,
                    height: 2,
                    width: "100%",
                    background: C.trustBlue,
                    borderRadius: 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                />
              )}
            </div>
            {i < STAGES.length - 1 && (
              <span
                style={{
                  fontSize: 14,
                  color: C.ink400,
                  margin: "0 4px",
                  userSelect: "none",
                  flexShrink: 0,
                }}
              >
                »
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
