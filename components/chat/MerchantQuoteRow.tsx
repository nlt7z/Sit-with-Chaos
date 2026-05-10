"use client";

// Spec §6.10 — 70x70 photo, name label-bold, orange price, badge variants, yellow-soft View Details

import { Placeholder } from "@/components/shared/Placeholder";
import type { MerchantQuote } from "@/lib/chatStore";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  ink500: "#999999",
  surface0: "#FFFFFF",
  priceOrange: "#FF6B00",
  orangeSoft: "#FFEFE0",
  orangeDeep: "#E55A00",
  redSoft: "#FFECEC",
  cautionRed: "#FA5151",
  surface150: "#F0F0F0",
  yellowSoft: "#FFF4D1",
};

type BadgeVariant = "orange" | "red" | "gray";

function Badge({ text, variant = "gray" }: { text: string; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, { bg: string; color: string }> = {
    orange: { bg: C.orangeSoft, color: C.orangeDeep },
    red: { bg: C.redSoft, color: C.cautionRed },
    gray: { bg: C.surface150, color: C.ink600 },
  };
  const s = styles[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 6px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: "14px",
        whiteSpace: "nowrap",
        background: s.bg,
        color: s.color,
      }}
    >
      {text}
    </span>
  );
}

const BADGE_TONES: BadgeVariant[] = ["orange", "red", "gray"];

export function MerchantQuoteRow({
  quote,
  index = 0,
  buttonLabel = "View Details",
  onViewDetail,
}: {
  quote: MerchantQuote;
  index?: number;
  buttonLabel?: string;
  onViewDetail?: (quote: MerchantQuote) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {/* Photo 70×70 */}
      <Placeholder
        width={70}
        height={70}
        label={quote.photoLabel ?? quote.name[0]}
        tint="gray"
        className="rounded-[8px] shrink-0"
      />

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name */}
        <p style={{ fontSize: 14, fontWeight: 600, color: C.ink900, lineHeight: "20px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {quote.name}
        </p>

        {/* Rating row */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12, color: C.ink600 }}>
          <span style={{ color: C.priceOrange, fontSize: 13 }}>★</span>
          <span style={{ fontWeight: 500, color: C.ink900 }}>{quote.rating.toFixed(1)}</span>
          <span>·</span>
          <span>{quote.reviews}</span>
          <span>·</span>
          <span>{quote.category}</span>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {quote.badges.slice(0, 3).map((b, bi) => (
            <Badge key={b.text} text={b.text} variant={BADGE_TONES[bi] ?? "gray"} />
          ))}
        </div>

        {/* Price + View Details */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: C.ink600 }}>Quote</span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: C.priceOrange,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.2px",
              }}
            >
              ${quote.priceLow}–${quote.priceHigh}
            </span>
          </div>
          <button
            onClick={() => onViewDetail?.(quote)}
            style={{
              height: 28,
              padding: "0 12px",
              borderRadius: 9999,
              border: "none",
              background: C.yellowSoft,
              color: C.ink900,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
