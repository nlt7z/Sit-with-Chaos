"use client";

// Spec §6.1 — 44px height, title + verified badge, back + menu icons

const C = {
  ink900: "#1A1A1A",
  surface0: "#FFFFFF",
  line: "#EEEEEE",
  brandYellow: "#FFD500",
};

export function ChatHeader() {
  return (
    <div
      style={{
        height: 44,
        background: C.surface0,
        borderBottom: `1px solid ${C.line}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 8,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Back chevron */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke={C.ink900} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Title + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: C.ink900,
            letterSpacing: "-0.2px",
            lineHeight: "24px",
          }}
        >
          Repair Expert · Instant Diagnosis
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: C.ink900,
            background: C.brandYellow,
            padding: "2px 6px",
            borderRadius: 4,
            lineHeight: "14px",
            letterSpacing: "0.2px",
            flexShrink: 0,
          }}
        >
          Official
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Three-dot menu */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill={C.ink900}>
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    </div>
  );
}
