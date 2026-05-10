"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const C = {
  ink900: "#1A1A1A",
  surface0: "#FFFFFF",
  line: "#EEEEEE",
};

export function ScreenShell({
  title,
  onBack,
  rightAction,
  footer,
  noBorderFooter,
  children,
}: {
  title: string;
  onBack: () => void;
  rightAction?: ReactNode;
  footer?: ReactNode;
  noBorderFooter?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: C.surface0,
      }}
    >
      {/* Nav bar — 44px matches ChatHeader */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: C.surface0,
          borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.88, opacity: 0.7 }}
          transition={{ duration: 0.12 }}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: C.ink900,
            minWidth: 40,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: 600,
            color: C.ink900,
            letterSpacing: "-0.2px",
            lineHeight: "24px",
          }}
        >
          {title}
        </span>

        <div style={{ minWidth: 40, display: "flex", justifyContent: "flex-end" }}>
          {rightAction}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {children}
      </div>

      {/* Sticky footer */}
      {footer && (
        <div
          style={{
            flexShrink: 0,
            background: C.surface0,
            borderTop: noBorderFooter ? "none" : `1px solid ${C.line}`,
            padding: "12px 16px 20px",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
