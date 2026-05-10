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
  brandYellow: "#FFD500",
  trustBlue: "#1677FF",
  blueBg: "#F0F6FF",
  priceOrange: "#FF6B00",
};

const days = [
  { label: "Today", sub: "May 10", value: "today" },
  { label: "Tomorrow", sub: "May 11", value: "tomorrow" },
  { label: "Mon", sub: "May 12", value: "mon" },
  { label: "Tue", sub: "May 13", value: "tue" },
  { label: "Wed", sub: "May 14", value: "wed" },
];

const slots = [
  "8:00–10:00 AM",
  "10:00 AM–12:00 PM",
  "12:00–2:00 PM",
  "2:00–4:00 PM",
  "4:00–6:00 PM",
  "6:00–8:00 PM",
];

const bookedSlots = new Set(["8:00–10:00 AM", "10:00 AM–12:00 PM"]);

export function TimePickerScreen({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm?: (day: string, slot: string) => void;
}) {
  const [selectedDay, setSelectedDay] = useState("today");
  const [selectedSlot, setSelectedSlot] = useState("2:00–4:00 PM");

  const dayLabel = days.find((d) => d.value === selectedDay)?.label ?? "";

  return (
    <ScreenShell
      title="Choose Visit Time"
      onBack={onBack}
      footer={
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onConfirm?.(selectedDay, selectedSlot)}
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
          Confirm — {dayLabel}, {selectedSlot}
        </motion.button>
      }
    >
      {/* Notice strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          margin: "16px 16px 0",
          background: C.blueBg,
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke={C.trustBlue} strokeWidth="1.2" />
          <path d="M8 5v3.5" stroke={C.trustBlue} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.7" fill={C.trustBlue} />
        </svg>
        <span style={{ fontSize: 12, color: C.trustBlue }}>
          Technician arrives within the window you select.
        </span>
      </motion.div>

      {/* Day selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.25 }}
        style={{ padding: "20px 16px 0" }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: C.ink500, margin: "0 0 10px", letterSpacing: "0.2px", textTransform: "uppercase" }}>
          Select Date
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map((d) => {
            const active = d.value === selectedDay;
            return (
              <motion.button
                key={d.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(d.value)}
                style={{
                  flex: 1,
                  height: 60,
                  borderRadius: 10,
                  border: active ? `2px solid ${C.trustBlue}` : `1px solid ${C.line}`,
                  background: active ? C.blueBg : C.surface0,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? C.trustBlue : C.ink900 }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 10, color: active ? C.trustBlue : C.ink500 }}>{d.sub}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Time slots */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.25 }}
        style={{ padding: "20px 16px 0" }}
      >
        <p style={{ fontSize: 11, fontWeight: 500, color: C.ink500, margin: "0 0 10px", letterSpacing: "0.2px", textTransform: "uppercase" }}>
          Select Time Window
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slots.map((slot) => {
            const booked = bookedSlots.has(slot);
            const active = slot === selectedSlot && !booked;
            return (
              <motion.button
                key={slot}
                whileTap={booked ? {} : { scale: 0.99 }}
                onClick={() => !booked && setSelectedSlot(slot)}
                style={{
                  height: 52,
                  borderRadius: 10,
                  border: active ? `2px solid ${C.trustBlue}` : `1px solid ${C.line}`,
                  background: booked ? C.surface100 : active ? C.blueBg : C.surface0,
                  cursor: booked ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: booked ? C.ink500 : active ? C.trustBlue : C.ink900,
                  }}
                >
                  {slot}
                </span>
                {booked ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: C.ink500,
                      background: C.surface150,
                      borderRadius: 4,
                      padding: "2px 7px",
                    }}
                  >
                    Full
                  </span>
                ) : active ? (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: C.trustBlue,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2.5 5.5l2.2 2.5 3.8-4.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      border: `1.5px solid ${C.line}`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        style={{ padding: "16px 16px 0", display: "flex", alignItems: "flex-start", gap: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke={C.priceOrange} strokeWidth="1" />
          <path d="M7 4.5v3" stroke={C.priceOrange} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="7" cy="9.5" r="0.6" fill={C.priceOrange} />
        </svg>
        <span style={{ fontSize: 12, color: C.ink500, lineHeight: "18px" }}>
          The exact arrival time will be confirmed via SMS 30 minutes before the window.
        </span>
      </motion.div>

      <div style={{ height: 24 }} />
    </ScreenShell>
  );
}
