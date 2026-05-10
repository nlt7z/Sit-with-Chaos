"use client";

// Spec §6.3 — 108px, blue gradient, lightning, 3 trust rows with shields

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  trustBlue: "#1677FF",
  priceOrange: "#FF6B00",
  blueBgFrom: "#F0F6FF",
  blueBgTo: "#E8F1FF",
};

function ShieldCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5L2 3.5v3.5c0 2.9 2.1 5.5 5 6.2 2.9-.7 5-3.3 5-6.2V3.5L7 1.5z"
        fill="rgba(22,119,255,0.1)"
        stroke={C.trustBlue}
        strokeWidth="0.9"
      />
      <path
        d="M5 7l1.5 1.5L9.5 5"
        stroke={C.trustBlue}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TRUST = [
  { label: "Vetted Merchants", desc: "Pro service, no referral fees" },
  { label: "Free Diagnosis", desc: "Find the issue before quoting" },
  { label: "Open Pricing", desc: "Official guide + multi-quote" },
];

export function ExpertBanner() {
  return (
    <div
      style={{
        margin: "12px 16px 0",
        height: 108,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.6)",
        background: `linear-gradient(95deg, ${C.blueBgFrom} 0%, ${C.blueBgTo} 100%)`,
        display: "flex",
        flexShrink: 0,
      }}
    >
      {/* Left column — 60% */}
      <div
        style={{
          width: "60%",
          padding: "14px 0 14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.ink900,
              letterSpacing: "-0.1px",
            }}
          >
            Meituan Repair Diagnosis
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Lightning */}
            <svg width="11" height="14" viewBox="0 0 11 14" fill={C.priceOrange}>
              <path d="M6.5 0L0 8h5L4.5 14l6.5-8H6L6.5 0z" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.priceOrange }}>
              30s reply
            </span>
          </span>
        </div>

        {/* Trust rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {TRUST.map((t) => (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ShieldCheck />
              <span style={{ fontSize: 11, fontWeight: 600, color: C.trustBlue, flexShrink: 0 }}>
                {t.label}
              </span>
              <span style={{ fontSize: 11, color: C.ink600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                · {t.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column — 40%, expert portrait placeholder */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: "rgba(22,119,255,0.05)",
          paddingBottom: 0,
        }}
      >
        <div
          style={{
            width: 76,
            height: 90,
            borderRadius: "8px 8px 0 0",
            background: "rgba(22,119,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="7" stroke={C.trustBlue} strokeWidth="1.5" />
            <path d="M4 29c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke={C.trustBlue} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
