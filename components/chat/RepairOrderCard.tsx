"use client";

// Spec §6.8 — 300px fixed, 96px label col, yellow CTA, orange price

import { Placeholder } from "@/components/shared/Placeholder";
import type { RepairOrderData } from "@/lib/chatStore";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  ink500: "#999999",
  surface0: "#FFFFFF",
  surface150: "#F0F0F0",
  line: "#EEEEEE",
  brandYellow: "#FFD500",
  priceOrange: "#FF6B00",
  shadowBubble: "0 1px 2px rgba(0,0,0,0.04)",
};

function PhotoStrip({ parts }: { parts: RepairOrderData["parts"] }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {parts.map((p, i) => (
        <div key={i} style={{ position: "relative", flexShrink: 0 }}>
          <Placeholder
            width={56}
            height={56}
            label={p.label}
            tint="gray"
            className="rounded-[6px]"
          />
          {p.kind === "video" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              >
                <svg width="8" height="9" viewBox="0 0 8 9" fill={C.ink900}>
                  <path d="M1 1l6 3.5L1 8V1z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke={C.ink500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Row({
  label,
  chevron,
  onClick,
  children,
}: {
  label: string;
  chevron?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          width: 96,
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 400,
          color: C.ink600,
          lineHeight: "20px",
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.ink900, lineHeight: "20px", flex: 1 }}>
          {children}
        </div>
        {chevron && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 4, flexShrink: 0 }}>
            <path d="M4 2l4 4-4 4" stroke={C.ink500} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

export function RepairOrderCard({
  data,
  onFindMerchants,
  onPickTime,
  onEditAddress,
  onViewPhotos,
}: {
  data: RepairOrderData;
  onFindMerchants?: () => void;
  onPickTime?: () => void;
  onEditAddress?: () => void;
  onViewPhotos?: () => void;
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
      <Placeholder
        width={36}
        height={36}
        label="MC"
        tint="blue-soft"
        className="rounded-[8px] shrink-0"
      />

      <div
        style={{
          width: 300,
          background: C.surface0,
          borderRadius: 12,
          padding: 16,
          boxShadow: C.shadowBubble,
        }}
      >
        {/* Title */}
        <p
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: C.ink900,
            lineHeight: "24px",
            margin: "0 0 12px",
            letterSpacing: "-0.2px",
          }}
        >
          Your Repair Order
        </p>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Row label="Issue">{data.faultProblem}</Row>
          <Row label="Reference" onClick={onViewPhotos}>
            <PhotoStrip parts={data.parts} />
          </Row>
          <Row label="Recommended fix">
            <div>
              <span>{data.plan}, </span>
              <span
                style={{ fontSize: 16, fontWeight: 600, color: C.priceOrange, fontVariantNumeric: "tabular-nums" }}
              >
                {data.planPrice}
              </span>
              <p
                style={{ fontSize: 12, fontWeight: 400, color: C.ink500, margin: "2px 0 0" }}
              >
                {data.planNote}
              </p>
            </div>
          </Row>
          <Row label="Visit time" chevron onClick={onPickTime}>{data.time}</Row>
          <Row label="Address" chevron onClick={onEditAddress}>{data.address}</Row>
        </div>

        {/* CTA */}
        <button
          onClick={onFindMerchants}
          style={{
            marginTop: 16,
            width: "100%",
            height: 44,
            borderRadius: 8,
            border: "none",
            background: C.brandYellow,
            color: C.ink900,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.1px",
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Find Merchants & Get Quotes
        </button>
      </div>
    </div>
  );
}
