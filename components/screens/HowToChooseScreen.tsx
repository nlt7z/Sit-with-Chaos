"use client";

import { motion } from "framer-motion";
import { ScreenShell } from "./ScreenShell";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  ink500: "#999999",
  surface0: "#FFFFFF",
  surface100: "#F5F5F5",
  surface150: "#F0F0F0",
  line: "#EEEEEE",
  brandYellow: "#FFD500",
  priceOrange: "#FF6B00",
  orangeSoft: "#FFEFE0",
  orangeDeep: "#E55A00",
  trustBlue: "#1677FF",
  blueBg: "#F0F6FF",
  greenSoft: "#EDFBF3",
  green: "#00B578",
};

const criteria = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2l2.2 4.5 5 .7-3.6 3.5.85 4.95L11 13.35l-4.45 2.35.85-4.95L3.8 7.2l5-.7L11 2z" fill={C.priceOrange} />
      </svg>
    ),
    title: "Rating & Reviews",
    desc: "Look for 4.8+ stars with at least 500 reviews. High volume means consistent quality, not just a few lucky jobs.",
    tip: "Sort by 'Most reviews' to find proven pros.",
    tipColor: C.trustBlue,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke={C.trustBlue} strokeWidth="1.5" />
        <path d="M11 6v5l3.5 2" stroke={C.trustBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Response Time",
    desc: "Under 30 min means a tech is nearby. Longer wait times often signal the provider is overbooked.",
    tip: "Aim for < 30 min — urgent repairs can't wait.",
    tipColor: C.priceOrange,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7.13 3 4 6.13 4 10c0 3.11 2.02 5.77 4.82 6.72.35.07.48-.15.48-.34 0-.17-.01-.63-.01-1.22-1.96.43-2.37-.95-2.37-.95-.32-.82-.78-1.04-.78-1.04-.64-.44.05-.43.05-.43.71.05 1.08.73 1.08.73.63 1.08 1.65.77 2.05.59.06-.46.25-.77.45-.95-1.57-.18-3.22-.78-3.22-3.49 0-.77.28-1.4.73-1.89-.07-.18-.32-.9.07-1.87 0 0 .59-.19 1.94.72.56-.16 1.16-.24 1.76-.24s1.2.08 1.76.24c1.35-.91 1.94-.72 1.94-.72.39.97.14 1.69.07 1.87.46.49.73 1.12.73 1.89 0 2.72-1.65 3.31-3.23 3.48.25.22.47.65.47 1.31 0 .95-.01 1.71-.01 1.94 0 .19.13.41.49.34A7 7 0 0 0 18 10c0-3.87-3.13-7-7-7z" fill={C.green} />
      </svg>
    ),
    title: "Warranty Coverage",
    desc: "A 90-day warranty on parts and labor is the gold standard. It protects you if the fix doesn't hold.",
    tip: "No warranty = no accountability.",
    tipColor: C.green,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke={C.ink900} strokeWidth="1.5" />
        <path d="M3 9h16" stroke={C.ink900} strokeWidth="1.5" />
        <circle cx="7" cy="13.5" r="1" fill={C.ink900} />
        <circle cx="11" cy="13.5" r="1" fill={C.ink900} />
      </svg>
    ),
    title: "Transparent Pricing",
    desc: 'Free diagnosis + itemized labor quote before work begins. Avoid providers with vague "starting from" ranges.',
    tip: "Always ask: Is diagnosis free?",
    tipColor: C.ink600,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7.69 3 5 5.69 5 9c0 3.87 6 11 6 11s6-7.13 6-11c0-3.31-2.69-6-6-6z" stroke={C.trustBlue} strokeWidth="1.5" />
        <circle cx="11" cy="9" r="2" fill={C.trustBlue} />
      </svg>
    ),
    title: "Service Area",
    desc: "Check that your neighborhood is within their primary zone — not a surcharge zone. Outer areas often cost $15–$30 more.",
    tip: "Type your zip code to filter by area.",
    tipColor: C.trustBlue,
  },
];

const redFlags = [
  "No reviews or fewer than 50 reviews",
  "Unclear or hidden pricing structure",
  "No mention of insurance or license",
  "Pushes upgrades before diagnosing",
  "No physical business address listed",
];

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export function HowToChooseScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="How to Choose" onBack={onBack}>
      {/* Hero strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          margin: "16px 16px 0",
          borderRadius: 14,
          background: `linear-gradient(115deg, ${C.blueBg} 0%, #E8F1FF 100%)`,
          padding: "18px 20px",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: C.ink900, margin: "0 0 4px", letterSpacing: "-0.2px" }}>
          5 things to look for
        </p>
        <p style={{ fontSize: 13, color: C.ink600, margin: 0, lineHeight: "18px" }}>
          Use these criteria to pick a pro you can trust.
        </p>
      </motion.div>

      {/* Criteria list */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}
      >
        {criteria.map((c, i) => (
          <motion.div
            key={i}
            variants={item}
            style={{
              background: C.surface0,
              borderRadius: 12,
              padding: "14px 16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: C.surface100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.ink900, margin: "0 0 4px", letterSpacing: "-0.1px" }}>
                  {c.title}
                </p>
                <p style={{ fontSize: 13, color: C.ink600, margin: "0 0 8px", lineHeight: "18px" }}>
                  {c.desc}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: C.surface100,
                    borderRadius: 6,
                    padding: "4px 8px",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <circle cx="5.5" cy="5.5" r="4.5" stroke={c.tipColor} strokeWidth="1" />
                    <path d="M5.5 4.5v3" stroke={c.tipColor} strokeWidth="1" strokeLinecap="round" />
                    <circle cx="5.5" cy="3.5" r="0.6" fill={c.tipColor} />
                  </svg>
                  <span style={{ fontSize: 11, color: c.tipColor, fontWeight: 500 }}>{c.tip}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Divider */}
      <div style={{ height: 1, background: C.line, margin: "20px 16px 0" }} />

      {/* Red flags */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3 }}
        style={{ padding: "16px 16px 0" }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: C.ink900, margin: "0 0 12px", letterSpacing: "-0.2px" }}>
          Red flags to avoid
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {redFlags.map((flag, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "#FFECEC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="#FA5151" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: C.ink600, lineHeight: "20px" }}>{flag}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick summary card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.3 }}
        style={{ margin: "20px 16px 0" }}
      >
        <div
          style={{
            background: C.orangeSoft,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: C.orangeDeep, margin: "0 0 6px" }}>
            Quick checklist before booking
          </p>
          {["4.8+ rating with 500+ reviews", "< 30 min response", "90-day warranty", "Free diagnosis", "Serves your zip code"].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill={C.orangeDeep} opacity="0.15" />
                <path d="M4.5 7l1.8 1.8 3.2-3.6" stroke={C.orangeDeep} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 12, color: C.orangeDeep }}>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ height: 32 }} />
    </ScreenShell>
  );
}
