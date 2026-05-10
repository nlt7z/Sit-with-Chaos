"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenShell } from "./ScreenShell";
import { Placeholder } from "@/components/shared/Placeholder";
import type { RepairOrderData } from "@/lib/chatStore";

const C = {
  ink900: "#1A1A1A",
  ink600: "#666666",
  ink500: "#999999",
  surface0: "#FFFFFF",
  surface100: "#F5F5F5",
  surface150: "#F0F0F0",
  line: "#EEEEEE",
  priceOrange: "#FF6B00",
};

export function PhotoGalleryScreen({
  parts,
  onBack,
}: {
  parts: RepairOrderData["parts"];
  onBack: () => void;
}) {
  const [active, setActive] = useState(0);

  return (
    <ScreenShell title="Reference Photos" onBack={onBack}>
      {/* Main viewer */}
      <div
        style={{
          position: "relative",
          background: C.ink900,
          height: 320,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Placeholder
              width={358}
              height={320}
              label={parts[active]?.label ?? "Photo"}
              tint="gray"
            />
            {parts[active]?.kind === "video" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: "rgba(255,255,255,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                    cursor: "pointer",
                  }}
                >
                  <svg width="20" height="22" viewBox="0 0 20 22" fill={C.ink900}>
                    <path d="M2 2l16 9L2 20V2z" />
                  </svg>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next tap zones */}
        {active > 0 && (
          <button
            onClick={() => setActive((a) => a - 1)}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          />
        )}
        {active < parts.length - 1 && (
          <button
            onClick={() => setActive((a) => a + 1)}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "40%",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          />
        )}

        {/* Counter */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 14,
            background: "rgba(0,0,0,0.45)",
            borderRadius: 12,
            padding: "3px 10px",
            fontSize: 12,
            color: "#FFFFFF",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {active + 1} / {parts.length}
        </div>

        {/* Dot indicators */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 5,
          }}
        >
          {parts.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === active ? 16 : 6, background: i === active ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}
              transition={{ duration: 0.2 }}
              style={{ height: 6, borderRadius: 3 }}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "14px 16px",
          overflowX: "auto",
        }}
      >
        {parts.map((p, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActive(i)}
            style={{
              flexShrink: 0,
              border: i === active ? `2.5px solid ${C.priceOrange}` : `2px solid transparent`,
              borderRadius: 8,
              padding: 0,
              background: "none",
              cursor: "pointer",
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          >
            <Placeholder
              width={64}
              height={64}
              label={p.label}
              tint="gray"
            />
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        style={{ padding: "0 16px" }}
      >
        <div
          style={{
            background: C.surface100,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: parts[active]?.kind === "video" ? "#FFF0E0" : C.surface0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${C.line}`,
              }}
            >
              {parts[active]?.kind === "video" ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill={C.priceOrange}>
                  <path d="M2 2l8 4-8 4V2z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="2" width="10" height="8" rx="1.5" stroke={C.ink600} strokeWidth="1" />
                  <circle cx="4" cy="5" r="1.2" fill={C.ink600} />
                  <path d="M1 9l3-3 2 2 2-2.5 3 3.5" stroke={C.ink600} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.ink900, margin: 0 }}>
                {parts[active]?.label}
              </p>
              <p style={{ fontSize: 11, color: C.ink500, margin: 0 }}>
                {parts[active]?.kind === "video" ? "Video · uploaded by customer" : "Photo · uploaded by customer"}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.ink600, margin: 0, lineHeight: "18px" }}>
            {active === 0
              ? "Shows condition of the toilet flange. Wax residue visible — confirms old seal needs full replacement."
              : active === 1
              ? "Close-up of the wax ring. Cracked and compressed, causing odor leak around the base."
              : active === 2
              ? "Mounting bolts — one is corroded. Needs replacement before reinstalling the toilet."
              : "Video walkthrough of the installation area and existing plumbing connections."}
          </p>
        </div>
      </motion.div>

      <div style={{ height: 24 }} />
    </ScreenShell>
  );
}
