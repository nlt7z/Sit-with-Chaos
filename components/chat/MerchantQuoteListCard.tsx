"use client";

// Spec §6.9 — 320px, trust.blue spinning ring, orange count animation, 16px row gap

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Placeholder } from "@/components/shared/Placeholder";
import { MerchantQuoteRow } from "./MerchantQuoteRow";
import type { MerchantQuotesData, MerchantQuote } from "@/lib/chatStore";

const C = {
  ink900: "#1A1A1A",
  ink500: "#999999",
  ink400: "#C0C0C0",
  surface0: "#FFFFFF",
  trustBlue: "#1677FF",
  priceOrange: "#FF6B00",
  lineStrong: "#E0E0E0",
  line: "#EEEEEE",
  shadowBubble: "0 1px 2px rgba(0,0,0,0.04)",
};

function SpinningRing({ expired }: { expired?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={expired ? "" : "animate-spin"}
      style={{ flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="6" stroke={expired ? C.ink400 : "rgba(22,119,255,0.15)"} strokeWidth="2" />
      <path
        d="M8 2A6 6 0 0 1 14 8"
        stroke={expired ? C.ink400 : C.trustBlue}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MerchantQuoteListCard({
  data,
  isLive,
  onViewDetail,
  onHowToChoose,
}: {
  data: MerchantQuotesData;
  isLive: boolean;
  onViewDetail?: (quote: MerchantQuote) => void;
  onHowToChoose?: () => void;
}) {
  const total = data.quotes.length;
  const [count, setCount] = useState(isLive ? 0 : total);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isLive || total === 0) return;
    let current = 0;
    const intervalMs = 3000 / total;
    const id = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= total) clearInterval(id);
    }, intervalMs);
    return () => clearInterval(id);
  }, [isLive, total]);

  const visible = expanded ? data.quotes : data.quotes.slice(0, 3);

  return (
    <div style={{ padding: "6px 16px" }}>
      {/* Helmet avatar */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Placeholder
          width={36}
          height={36}
          label="F"
          tint="gray"
          className="rounded-[8px] shrink-0"
        />

        {/* Card — 320px */}
        <div
          style={{
            width: 320,
            background: C.surface0,
            borderRadius: 12,
            padding: 16,
            boxShadow: C.shadowBubble,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <SpinningRing expired={data.expired} />
              <span style={{ fontSize: 14, fontWeight: 500, color: C.ink900, lineHeight: "20px" }}>
                {data.expired ? (
                  "Quote expired — please re-submit."
                ) : (
                  <>
                    Reaching out to nearby pros,{" "}
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: C.priceOrange,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {count}
                    </span>{" "}
                    quotes in...
                  </>
                )}
              </span>
            </div>
            {onHowToChoose && (
              <button
                onClick={onHowToChoose}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  color: C.trustBlue,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke={C.trustBlue} strokeWidth="1" />
                  <path d="M4.5 4.5C4.8 3.5 7.5 3.5 7.5 5c0 1-1 1.5-1.5 1.5v.75" stroke={C.trustBlue} strokeWidth="1" strokeLinecap="round" />
                  <circle cx="6" cy="8.5" r="0.5" fill={C.trustBlue} />
                </svg>
                How to choose a merchant?
              </button>
            )}
          </div>

          {/* Merchant rows — 16px gap, no divider */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visible.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.25, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <MerchantQuoteRow
                  quote={q}
                  index={i}
                  buttonLabel={data.expired ? "Buy Now" : "View Details"}
                  onViewDetail={onViewDetail}
                />
              </motion.div>
            ))}
          </div>

          {/* Show more */}
          {!expanded && total > 3 && (
            <button
              onClick={() => setExpanded(true)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 12,
                fontSize: 12,
                fontWeight: 400,
                color: C.ink500,
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Show more ↓
            </button>
          )}
        </div>
      </div>

      {/* Stop Searching pill — below the card, centered */}
      {!data.expired && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16, paddingLeft: 44 }}>
          <button
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: 9999,
              border: `1px solid ${C.lineStrong}`,
              background: C.surface0,
              color: C.ink900,
              fontSize: 13,
              fontWeight: 400,
              cursor: "pointer",
            }}
          >
            Stop Searching
          </button>
        </div>
      )}
    </div>
  );
}
