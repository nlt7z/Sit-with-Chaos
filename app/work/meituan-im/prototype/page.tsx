"use client";

import { useEffect, useState } from "react";

const NATURAL_W = 1200;
const NATURAL_H = 1080;

export default function PrototypeFullscreenPage() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const scaleX = window.innerWidth / NATURAL_W;
      const scaleY = window.innerHeight / NATURAL_H;
      setScale(Math.min(scaleX, scaleY, 1));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <iframe
          src="/assets/meituan-im/Repair%20Flow.html"
          title="Repair flow — interactive prototype"
          style={{
            width: NATURAL_W,
            height: NATURAL_H,
            border: 0,
            display: "block",
          }}
        />
      </div>

      {/* back chip — bottom-left, unobtrusive */}
      <a
        href="/work/meituan-im"
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.4)",
          textDecoration: "none",
          padding: "6px 10px",
          background: "rgba(255,255,255,0.8)",
          borderRadius: 6,
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0,0,0,0.08)",
          transition: "color 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.75)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.4)")}
      >
        ← Back
      </a>
    </div>
  );
}
