"use client";

// Spec §6.4 — white bubble, 12px radius, shadow.bubble, blue suggested-question links

import type { ReactNode } from "react";
import { Placeholder } from "@/components/shared/Placeholder";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  surface0: "#FFFFFF",
  surface150: "#F0F0F0",
  trustBlue: "#1677FF",
  line: "#EEEEEE",
  shadowBubble: "0 1px 2px rgba(0,0,0,0.04)",
};

function Avatar({ variant }: { variant: "helmet" | "master" }) {
  return (
    <Placeholder
      width={36}
      height={36}
      label={variant === "master" ? "MC" : "F"}
      tint={variant === "master" ? "blue-soft" : "gray"}
      className="rounded-[8px] shrink-0"
    />
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: C.surface0,
        borderRadius: 12,
        padding: "12px 16px",
        maxWidth: "78%",
        boxShadow: C.shadowBubble,
        fontSize: 15,
        lineHeight: "22px",
        color: C.ink900,
      }}
    >
      {children}
    </div>
  );
}

export function ExpertBubble({
  text,
  suggestedQuestions,
  expertVariant = "helmet",
  onSuggestionTap,
}: {
  text: string;
  suggestedQuestions?: string[];
  expertVariant?: "helmet" | "master";
  onSuggestionTap?: (text: string) => void;
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
      <Avatar variant={expertVariant} />
      <Bubble>
        <span>{text}</span>
        {suggestedQuestions && suggestedQuestions.length > 0 && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSuggestionTap?.(q)}
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: C.trustBlue,
                  lineHeight: "22px",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  opacity: 1,
                  transition: "opacity 0.1s",
                }}
                onMouseDown={(e) => { (e.currentTarget.style.opacity = "0.6"); }}
                onMouseUp={(e) => { (e.currentTarget.style.opacity = "1"); }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </Bubble>
    </div>
  );
}
