"use client";

// Spec §6.7 — flex items-center gap-3 p-3 surface.0 rounded-lg shadow.bubble max-w-[78%]

import { Placeholder } from "@/components/shared/Placeholder";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  surface0: "#FFFFFF",
  shadowBubble: "0 1px 2px rgba(0,0,0,0.04)",
};

export function MasterIntroCard({
  name,
  meta,
}: {
  name: string;
  meta: string[];
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "6px 16px",
      }}
    >
      {/* Master avatar — 36x36 radius.md */}
      <Placeholder
        width={36}
        height={36}
        label={name[0]}
        tint="blue-soft"
        className="rounded-[8px] shrink-0"
      />

      {/* Card */}
      <div
        style={{
          background: C.surface0,
          borderRadius: 12,
          padding: 12,
          maxWidth: "78%",
          boxShadow: C.shadowBubble,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Photo placeholder */}
        <Placeholder
          width={40}
          height={40}
          label={name[0]}
          tint="blue-soft"
          className="rounded-[8px] shrink-0"
        />
        {/* Info */}
        <div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: C.ink900,
              lineHeight: "20px",
              margin: 0,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: C.ink600,
              lineHeight: "16px",
              marginTop: 2,
            }}
          >
            {meta.join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
