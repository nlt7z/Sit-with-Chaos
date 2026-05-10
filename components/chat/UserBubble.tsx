"use client";

// Spec §6.5 — #FFF8E0 bubble, 12px radius, no shadow, "Read" caption, avatar right

import type { ReactNode } from "react";
import { Placeholder } from "@/components/shared/Placeholder";

const C = {
  ink900: "#1A1A1A",
  ink500: "#999999",
  userBubble: "#FFF8E0",
  line: "#EEEEEE",
};

export function UserBubble({
  text,
  children,
  isMedia,
}: {
  text?: string;
  children?: ReactNode;
  isMedia?: boolean;
}) {
  if (isMedia) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          gap: 8,
          padding: "6px 16px",
        }}
      >
        <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}` }}>
          {children}
        </div>
        <Placeholder width={36} height={36} label="Me" tint="warm" className="rounded-[8px] shrink-0" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        gap: 8,
        padding: "6px 16px",
      }}
    >
      {/* Read caption left of bubble */}
      <span
        style={{
          fontSize: 11,
          color: C.ink500,
          lineHeight: "22px",
          alignSelf: "flex-end",
          marginBottom: 2,
          flexShrink: 0,
        }}
      >
        Read
      </span>

      {/* Bubble */}
      <div
        style={{
          background: C.userBubble,
          borderRadius: 12,
          padding: "12px 16px",
          maxWidth: "78%",
          fontSize: 15,
          lineHeight: "22px",
          color: C.ink900,
        }}
      >
        {text && <span>{text}</span>}
        {children}
      </div>

      {/* Avatar */}
      <Placeholder width={36} height={36} label="Me" tint="warm" className="rounded-[8px] shrink-0" />
    </div>
  );
}
