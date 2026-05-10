"use client";

import { useState } from "react";
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
  lineStrong: "#E0E0E0",
  brandYellow: "#FFD500",
  trustBlue: "#1677FF",
  blueBg: "#F0F6FF",
};

const recentAddresses = [
  { label: "Home", addr: "820 W Ridge Ln, Apt 4B, San Francisco, CA 94102", icon: "home" },
  { label: "Work", addr: "555 Market St, Floor 8, San Francisco, CA 94105", icon: "work" },
];

function AddressIcon({ type }: { type: string }) {
  if (type === "home") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 7l6-5 6 5v7H2V7z" stroke={C.trustBlue} strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="6" y="10" width="4" height="4" rx="0.5" stroke={C.trustBlue} strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="10" rx="1.5" stroke={C.trustBlue} strokeWidth="1.2" />
      <path d="M5 4V3a3 3 0 016 0v1" stroke={C.trustBlue} strokeWidth="1.2" />
      <circle cx="8" cy="9.5" r="1.5" fill={C.trustBlue} />
    </svg>
  );
}

export function AddressScreen({
  currentAddress,
  onBack,
  onSave,
}: {
  currentAddress?: string;
  onBack: () => void;
  onSave?: (address: string) => void;
}) {
  const [street, setStreet] = useState("820 W Ridge Ln");
  const [apt, setApt] = useState("Apt 4B");
  const [city, setCity] = useState("San Francisco");
  const [zip, setZip] = useState("94102");
  const [note, setNote] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const fullAddress = `${street}${apt ? ", " + apt : ""}, ${city}, CA ${zip}`;

  function Field({
    id,
    label,
    value,
    onChange,
    placeholder,
    half,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    half?: boolean;
  }) {
    const isFocused = focused === id;
    return (
      <div style={{ flex: half ? "0 0 calc(50% - 4px)" : "1 1 100%" }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: C.ink500, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" }}>
          {label}
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused(null)}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 8,
            border: `1.5px solid ${isFocused ? C.trustBlue : C.lineStrong}`,
            background: C.surface0,
            padding: "0 12px",
            fontSize: 14,
            color: C.ink900,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
        />
      </div>
    );
  }

  return (
    <ScreenShell
      title="Service Address"
      onBack={onBack}
      footer={
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave?.(fullAddress)}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 9999,
            border: "none",
            background: C.brandYellow,
            color: C.ink900,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.1px",
          }}
        >
          Save Address
        </motion.button>
      }
    >
      {/* Map preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height: 140, background: C.surface100, position: "relative", overflow: "hidden" }}
      >
        <svg viewBox="0 0 390 140" width="100%" height="100%" style={{ opacity: 0.6 }}>
          <rect width="390" height="140" fill="#EEF4FF" />
          {/* Grid lines */}
          <line x1="0" y1="50" x2="390" y2="50" stroke="#C8D9F0" strokeWidth="1" />
          <line x1="0" y1="90" x2="390" y2="90" stroke="#C8D9F0" strokeWidth="1" />
          <line x1="78" y1="0" x2="78" y2="140" stroke="#C8D9F0" strokeWidth="1" />
          <line x1="156" y1="0" x2="156" y2="140" stroke="#C8D9F0" strokeWidth="1" />
          <line x1="234" y1="0" x2="234" y2="140" stroke="#C8D9F0" strokeWidth="1" />
          <line x1="312" y1="0" x2="312" y2="140" stroke="#C8D9F0" strokeWidth="1" />
          {/* Streets */}
          <rect x="60" y="42" width="90" height="16" rx="2" fill="#D9E7F8" />
          <rect x="200" y="80" width="110" height="16" rx="2" fill="#D9E7F8" />
          <rect x="140" y="20" width="16" height="80" rx="2" fill="#D9E7F8" />
          <rect x="260" y="30" width="16" height="80" rx="2" fill="#D9E7F8" />
          {/* Pin */}
          <circle cx="195" cy="70" r="14" fill="rgba(22,119,255,0.15)" />
          <circle cx="195" cy="70" r="7" fill={C.trustBlue} />
          <circle cx="195" cy="70" r="3" fill="#fff" />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: C.surface0,
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            color: C.trustBlue,
            fontWeight: 500,
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
        >
          820 W Ridge Ln
        </div>
      </motion.div>

      {/* Saved addresses */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.25 }}
        style={{ padding: "16px 16px 0" }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: C.ink500, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          Saved Addresses
        </p>
        {recentAddresses.map((a, i) => (
          <button
            key={i}
            onClick={() => {
              if (a.icon === "home") { setStreet("820 W Ridge Ln"); setApt("Apt 4B"); setCity("San Francisco"); setZip("94102"); }
              else { setStreet("555 Market St"); setApt("Floor 8"); setCity("San Francisco"); setZip("94105"); }
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: i < recentAddresses.length - 1 ? `1px solid ${C.line}` : "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.blueBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AddressIcon type={a.icon} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.ink900, margin: 0 }}>{a.label}</p>
              <p style={{ fontSize: 11, color: C.ink500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.addr}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke={C.ink500} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </motion.div>

      {/* Divider */}
      <div style={{ height: 1, background: C.line, margin: "12px 16px 0" }} />

      {/* Manual form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        style={{ padding: "16px 16px 0" }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: C.ink500, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          Edit Address
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Field id="street" label="Street" value={street} onChange={setStreet} placeholder="123 Main St" />
          <Field id="apt" label="Unit / Apt" value={apt} onChange={setApt} placeholder="Apt 1A" half />
          <Field id="city" label="City" value={city} onChange={setCity} placeholder="San Francisco" half />
          <Field id="zip" label="ZIP Code" value={zip} onChange={setZip} placeholder="94102" half />
          <div style={{ flex: "1 1 100%" }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: C.ink500, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Entry Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Ring doorbell, gate code #2204"
              onFocus={() => setFocused("note")}
              onBlur={() => setFocused(null)}
              rows={2}
              style={{
                width: "100%",
                borderRadius: 8,
                border: `1.5px solid ${focused === "note" ? C.trustBlue : C.lineStrong}`,
                background: C.surface0,
                padding: "10px 12px",
                fontSize: 13,
                color: C.ink900,
                outline: "none",
                boxSizing: "border-box",
                resize: "none",
                lineHeight: "20px",
                transition: "border-color 0.15s",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </motion.div>

      <div style={{ height: 24 }} />
    </ScreenShell>
  );
}
