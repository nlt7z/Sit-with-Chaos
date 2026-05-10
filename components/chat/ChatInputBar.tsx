"use client";

// Spec §6.13 — 56px height, surface.100 input bg, icon buttons

const C = {
  ink600: "#666666",
  surface0: "#FFFFFF",
  surface100: "#F5F5F5",
  line: "#EEEEEE",
  lineStrong: "#E0E0E0",
  ink900: "#1A1A1A",
};

export function ChatInputBar({ showServiceChip }: { showServiceChip?: boolean }) {
  return (
    <div
      style={{
        background: C.surface0,
        borderTop: `1px solid ${C.line}`,
        flexShrink: 0,
      }}
    >
      {showServiceChip && (
        <div style={{ padding: "8px 12px 0" }}>
          <button
            style={{
              border: `1px solid ${C.lineStrong}`,
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 12,
              color: C.ink600,
              background: C.surface0,
              cursor: "pointer",
            }}
          >
            Rate Service
          </button>
        </div>
      )}

      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
        }}
      >
        {/* Voice */}
        <button
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: C.ink600 }}
          aria-label="Voice input"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="10" y="3" width="8" height="14" rx="4" />
            <path d="M5 14c0 5 4 9 9 9s9-4 9-9" />
            <line x1="14" y1="23" x2="14" y2="27" />
            <line x1="10" y1="27" x2="18" y2="27" />
          </svg>
        </button>

        {/* Text input field */}
        <div
          style={{
            flex: 1,
            height: 36,
            background: C.surface100,
            borderRadius: 8,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
          }}
        />

        {/* Emoji */}
        <button
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: C.ink600 }}
          aria-label="Emoji"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="14" cy="14" r="10" />
            <path d="M10 17s1.5 2.5 4 2.5 4-2.5 4-2.5" />
            <circle cx="11" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="17" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {/* Plus */}
        <button
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", color: C.ink600 }}
          aria-label="Add attachment"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="14" cy="14" r="10" />
            <line x1="14" y1="9" x2="14" y2="19" />
            <line x1="9" y1="14" x2="19" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
