"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScreenShell } from "./ScreenShell";
import { getMerchantDetail } from "@/lib/mockData";
import type { MerchantQuote } from "@/lib/chatStore";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  ink500: "#999999",
  surface0: "#FFFFFF",
  surface100: "#F5F5F5",
  surface150: "#F0F0F0",
  line: "#EEEEEE",
  lineStrong: "#E0E0E0",
  brandYellow: "#FFD500",
  priceOrange: "#FF6B00",
  orangeSoft: "#FFEFE0",
  orangeDeep: "#E55A00",
  redSoft: "#FFECEC",
  cautionRed: "#FA5151",
  trustBlue: "#1677FF",
  blueBg: "#F0F6FF",
  shadowBubble: "0 1px 2px rgba(0,0,0,0.04)",
  shadowCard: "0 2px 8px rgba(0,0,0,0.06)",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 8.5 3 10.5 3.5 7 1 4.5 4.5 4z"
            fill={i < Math.floor(rating) ? C.priceOrange : C.surface150}
          />
        </svg>
      ))}
    </span>
  );
}

function Badge({ text, tone }: { text: string; tone: "orange" | "red" | "gray" }) {
  const s =
    tone === "orange" ? { bg: C.orangeSoft, color: C.orangeDeep }
    : tone === "red"  ? { bg: C.redSoft, color: C.cautionRed }
    :                   { bg: C.surface150, color: C.ink600 };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 6, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: C.ink900, letterSpacing: "-0.4px" }}>{value}</span>
      <span style={{ fontSize: 11, color: C.ink500 }}>{label}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 16px 12px" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: C.ink900, letterSpacing: "-0.1px" }}>{children}</span>
    </div>
  );
}

export function MerchantDetailScreen({
  quote,
  onBack,
  onBook,
}: {
  quote: MerchantQuote;
  onBack: () => void;
  onBook?: () => void;
}) {
  const detail = getMerchantDetail(quote.id);
  const [booked, setBooked] = useState(false);

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => {
      onBook?.();
      onBack();
    }, 900);
  };

  return (
    <ScreenShell
      title={quote.name}
      onBack={onBack}
      rightAction={
        <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke={C.ink500} strokeWidth="1.2" />
            <path d="M7 8.5C7.5 6.5 12.5 6.5 13 8.5c.5 1.5-1 2.5-3 3v1" stroke={C.ink500} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="10" cy="15" r="0.8" fill={C.ink500} />
          </svg>
        </button>
      }
      footer={
        <motion.button
          onClick={handleBook}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 9999,
            border: "none",
            background: booked ? "#00B578" : C.brandYellow,
            color: booked ? "#FFFFFF" : C.ink900,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.1px",
            transition: "background 0.3s",
          }}
        >
          {booked ? "✓  Booking confirmed" : `Book — $${quote.priceLow}–$${quote.priceHigh}`}
        </motion.button>
      }
    >
      {/* ── Hero ── */}
      <div
        style={{
          height: 220,
          background: C.ink900,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Illustrated background */}
        <svg viewBox="0 0 390 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
          <circle cx="300" cy="60" r="100" fill="#FFFFFF" />
          <circle cx="80" cy="180" r="70" fill="#FFFFFF" />
          <rect x="160" y="40" width="80" height="80" rx="12" fill="none" stroke="#FFD500" strokeWidth="2" />
          <path d="M140 140 Q200 100 280 160" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Shop illustration */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -58%)",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,213,0,0.15)",
            border: "2px solid rgba(255,213,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 28V18L20 10l12 8v10H8z" stroke={C.brandYellow} strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="16" y="20" width="8" height="8" rx="1" stroke={C.brandYellow} strokeWidth="1.2" />
            <path d="M14 18h12" stroke={C.brandYellow} strokeWidth="1" strokeLinecap="round" />
            <path d="M20 10v4" stroke={C.brandYellow} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            background: "linear-gradient(transparent, rgba(26,26,26,0.9))",
          }}
        />

        {/* Text overlay */}
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>
            {quote.category}
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.4px", lineHeight: "24px", marginBottom: 6 }}>
            {quote.name}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
            &ldquo;{detail.tagline}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Rating & badges ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.25 }}
        style={{ padding: "16px 16px 0" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <StarRating rating={quote.rating} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink900 }}>{quote.rating.toFixed(1)}</span>
          <span style={{ fontSize: 13, color: C.ink500 }}>· {quote.reviews}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {quote.badges.map((b) => (
            <Badge key={b.text} text={b.text} tone={b.tone} />
          ))}
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.25 }}
        style={{
          margin: "16px 16px 0",
          background: C.surface100,
          borderRadius: 12,
          padding: "16px 0",
          display: "flex",
        }}
      >
        <StatBox value={detail.responseTime} label="Response time" />
        <div style={{ width: 1, background: C.line, margin: "4px 0" }} />
        <StatBox value={`${(detail.jobsDone / 1000).toFixed(1)}k`} label="Jobs done" />
        <div style={{ width: 1, background: C.line, margin: "4px 0" }} />
        <StatBox value={`${detail.yearsInService} yrs`} label="Experience" />
      </motion.div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.line, margin: "20px 0 0" }} />

      {/* ── About ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <SectionTitle>About</SectionTitle>
        <p style={{ padding: "0 16px", fontSize: 14, lineHeight: "22px", color: C.ink600 }}>
          {detail.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 16px 0" }}>
          {detail.specialties.map((s) => (
            <span key={s} style={{ fontSize: 12, color: C.trustBlue, background: C.blueBg, padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.line, margin: "20px 0 0" }} />

      {/* ── Pricing ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.3 }}
      >
        <SectionTitle>Pricing</SectionTitle>
        <div style={{ margin: "0 16px", border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
          {detail.pricingRows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < detail.pricingRows.length - 1 ? `1px solid ${C.surface150}` : "none",
              }}
            >
              <span style={{ fontSize: 13, color: C.ink600 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: row.value.includes("Free") ? "#00B578" : C.ink900 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.line, margin: "20px 0 0" }} />

      {/* ── Coverage ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <SectionTitle>Service area</SectionTitle>
        <div style={{ margin: "0 16px", padding: "12px 16px", background: C.surface100, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke={C.trustBlue} strokeWidth="1.2" />
            <circle cx="8" cy="6" r="1.5" fill={C.trustBlue} />
          </svg>
          <span style={{ fontSize: 13, color: C.ink600 }}>{detail.coverageArea}</span>
        </div>

        {/* Map placeholder */}
        <div style={{ margin: "12px 16px 0", height: 100, borderRadius: 12, overflow: "hidden", background: C.surface100, position: "relative" }}>
          <svg viewBox="0 0 358 100" width="100%" height="100%" style={{ opacity: 0.5 }}>
            <rect width="358" height="100" fill="#EEF4FF" />
            <path d="M0 60 Q60 40 120 55 Q180 70 240 45 Q300 20 358 50" stroke="#A0BBE0" strokeWidth="2" fill="none" />
            <path d="M0 80 Q80 70 160 78 Q240 86 358 72" stroke="#C0D0E8" strokeWidth="1.5" fill="none" />
            <circle cx="179" cy="50" r="8" fill="rgba(22,119,255,0.2)" />
            <circle cx="179" cy="50" r="4" fill={C.trustBlue} />
            <circle cx="179" cy="50" r="12" fill="none" stroke={C.trustBlue} strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: C.line, margin: "20px 0 0" }} />

      {/* ── Reviews ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22, duration: 0.3 }}
      >
        <SectionTitle>Reviews ({quote.reviews})</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {detail.reviews.map((r, i) => (
            <div
              key={r.name}
              style={{
                padding: "14px 16px",
                borderBottom: i < detail.reviews.length - 1 ? `1px solid ${C.surface150}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: C.surface150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.ink600,
                  }}
                >
                  {r.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink900 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: C.ink500 }}>{r.date}</span>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: "20px", color: C.ink600, margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
        <button
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "none",
            border: "none",
            fontSize: 13,
            color: C.trustBlue,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          See all reviews →
        </button>
      </motion.div>

      {/* Bottom padding for sticky footer */}
      <div style={{ height: 24 }} />
    </ScreenShell>
  );
}
