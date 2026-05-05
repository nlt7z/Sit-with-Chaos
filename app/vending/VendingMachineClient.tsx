"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

const KEYS: Record<number, { label: string; href: string; lines: string[] }> = {
  1: { label: "AI Character",  href: "/work/ai-character",      lines: ["AI NPC",   "ROLEPLAY"] },
  2: { label: "StudioEngine",  href: "/work/studio-engine",     lines: ["3D GAME",  "STUDIO"]   },
  3: { label: "Meituan IM",    href: "/work/meituan-im",        lines: ["IM +",     "QUOTATION"] },
  4: { label: "AI Ride",       href: "/work/ridesharing",       lines: ["AI",       "RIDESHARE"] },
  5: { label: "Apsara",        href: "/work/apsara-conference", lines: ["ALIBABA",  "CLOUD"]    },
  6: { label: "About",         href: "/about",                  lines: ["ABOUT",    "ME"]       },
  7: { label: "Vibe Coding",   href: "/vibe-coding",            lines: ["CREATIVE", "CODE"]     },
  8: { label: "My Journey",    href: "/resume",                 lines: ["MY",       "JOURNEY"]  },
  9: { label: "Random",        href: "/work/ai-character",      lines: ["???",      "LUCKY"]    },
};

const COIN_COUNT = 5;

// ── Pixel Keyboard ──────────────────────────────────────────────────────────
function PixelKeyboard({
  hoveredKey,
  displayText,
  onKeyHover,
  onKeyLeave,
  onKeyClick,
  isMobile,
}: {
  hoveredKey: number | null;
  displayText: string;
  onKeyHover: (n: number) => void;
  onKeyLeave: () => void;
  onKeyClick: (n: number) => void;
  isMobile?: boolean;
}) {
  const px = pixel.style.fontFamily;
  const ledLabel = hoveredKey ? KEYS[hoveredKey].label.toUpperCase() : displayText;

  return (
    <div
      style={{
        background: "#c42020",
        border: "5px solid #000",
        boxShadow: [
          "inset 5px 5px 0 #e85454",
          "inset -5px -5px 0 #880808",
          "10px 10px 0 #000",
        ].join(", "),
        padding: isMobile ? "16px 14px 14px" : "24px 22px 20px",
        position: "relative",
        width: isMobile ? "min(calc(100vw - 48px), 400px)" : 480,
        boxSizing: "border-box" as const,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Gold + corner decorations */}
      {[
        { top: 6,    left:  10 },
        { top: 6,    right: 10 },
        { bottom: 6, left:  10 },
        { bottom: 6, right: 10 },
      ].map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            ...pos,
            fontFamily: px,
            fontSize: 14,
            color: "#f0c030",
            lineHeight: 1,
            textShadow: "1px 1px 0 #8a6800",
            pointerEvents: "none",
          }}
        >
          +
        </span>
      ))}

      {/* LED display */}
      <div
        style={{
          background: "#060e06",
          border: "3px solid #1a0808",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.9), 2px 2px 0 #000",
          padding: "12px 18px",
          marginBottom: 18,
          width: "100%",
          boxSizing: "border-box" as const,
          textAlign: "center",
          fontFamily: px,
          fontSize: isMobile ? 9 : 11,
          letterSpacing: "0.20em",
          color: hoveredKey ? "#ffffff" : "#44ff44",
          textShadow: hoveredKey
            ? "0 0 12px #fff, 0 0 30px #fffc"
            : "0 0 10px #44ff44, 0 0 24px #44ff4466",
          transition: "color 0.08s, text-shadow 0.08s",
          lineHeight: 1.6,
        }}
      >
        {ledLabel}
      </div>

      {/* 3×3 key grid — square keys, text on top, number below */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 8 : 12, width: "100%" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
          const active = hoveredKey === n;
          return (
            <button
              key={n}
              onClick={() => onKeyClick(n)}
              onMouseEnter={() => onKeyHover(n)}
              onMouseLeave={onKeyLeave}
              style={{
                cursor:        isMobile ? "pointer" : "none",
                fontFamily:    px,
                aspectRatio:   "1 / 1",
                background:    active ? "#e8d898" : "#f8edca",
                border:        "3px solid #2a1a0a",
                boxShadow:     active
                  ? "inset 2px 2px 0 #c0a870, inset -1px -1px 0 #f0e0a0"
                  : "inset 3px 3px 0 #fffae8, inset -3px -3px 0 #c0a860, 3px 3px 0 #2a1a0a",
                padding:        isMobile ? "6px 4px" : "10px 6px",
                textAlign:      "center" as const,
                transform:      active ? "translateY(2px) translateX(1px)" : "none",
                transition:     "all 0.05s",
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            isMobile ? 4 : 8,
              }}
            >
              {/* Project text */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 3 : 6 }}>
                {KEYS[n].lines.map((line, li) => (
                  <span
                    key={li}
                    style={{
                      fontSize:      isMobile ? 9 : 13,
                      color:         active ? "#2a1000" : "#3a2008",
                      lineHeight:    1,
                      letterSpacing: "0.04em",
                      whiteSpace:    "nowrap",
                    }}
                  >
                    {line}
                  </span>
                ))}
              </div>

              {/* Thin divider */}
              <div style={{ width: "65%", height: 2, background: "#2a1a0a28" }} />

              {/* Number */}
              <div style={{ fontSize: isMobile ? 9 : 11, color: "#7a5030", lineHeight: 1 }}>
                {n}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 9, marginTop: 18 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              width:      9,
              height:     9,
              background: i === 2 ? "#f0c030" : "#880808",
              border:     "2px solid #000",
              boxShadow:  i === 2 ? "0 0 6px #f0c030" : "inset 0 0 3px rgba(0,0,0,0.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Pixel stars around the music icon ───────────────────────────────────────
const PIXEL_STARS = [
  { id: 0, x: -18, y: -18, char: "★", size: 13, delay: 0.00, color: "#f0c030" },
  { id: 1, x:  88, y: -22, char: "+",  size: 15, delay: 0.22, color: "#fffbe0" },
  { id: 2, x: 205, y: -16, char: "★", size: 11, delay: 0.40, color: "#f0c030" },
  { id: 3, x: 214, y:  58, char: "+",  size: 13, delay: 0.58, color: "#ffd0ee" },
  { id: 4, x: 198, y: 148, char: "★", size: 12, delay: 0.16, color: "#aaddff" },
  { id: 5, x:  72, y: 158, char: "+",  size: 14, delay: 0.46, color: "#f0c030" },
  { id: 6, x: -22, y:  68, char: "★", size: 11, delay: 0.32, color: "#fffbe0" },
];

// ── Main component ──────────────────────────────────────────────────────────
export function VendingMachineClient() {
  const router = useRouter();
  const px = pixel.style.fontFamily;

  // mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // cursor
  const [mouse, setMouse] = useState({ x: -200, y: -200 });

  // music
  const audioRef               = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(
      "/assets/mainpage-vending machine/backgroundmusicmaster-pixel-adventure-382649.mp3",
    );
    audio.loop   = true;
    audio.volume = 0.45;
    audioRef.current = audio;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
    return () => { audio.pause(); };
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
  }, [isPlaying]);

  // drag
  const [draggedCoin, setDraggedCoin]     = useState<number | null>(null);
  const [dragPos, setDragPos]             = useState({ x: 0, y: 0 });
  const [isOverVending, setIsOverVending] = useState(false);
  const dragOffRef    = useRef({ x: 0, y: 0 });
  const dragCoinRef   = useRef<number | null>(null);
  const touchMovedRef = useRef(false);
  const vendingRef    = useRef<HTMLDivElement>(null);

  // keyboard
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [usedCoins, setUsedCoins]       = useState<Set<number>>(new Set());
  const [hoveredKey, setHoveredKey]     = useState<number | null>(null);
  const [displayText, setDisplayText]   = useState("INSERT COIN");
  const [blinkOn, setBlinkOn]           = useState(true);

  // blink idle LED
  useEffect(() => {
    if (showKeyboard) return;
    const id = setInterval(() => setBlinkOn(v => !v), 600);
    return () => clearInterval(id);
  }, [showKeyboard]);

  const insertCoin = useCallback((coinIdx: number) => {
    setUsedCoins(prev => { const s = new Set(prev); s.add(coinIdx); return s; });
    setShowKeyboard(true);
    setDisplayText("SELECT  1-9");
  }, []);

  // global mouse events
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
      if (dragCoinRef.current === null) return;
      setDragPos({
        x: e.clientX - dragOffRef.current.x,
        y: e.clientY - dragOffRef.current.y,
      });
      const rect = vendingRef.current?.getBoundingClientRect();
      setIsOverVending(
        !!rect &&
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom,
      );
    };
    const onUp = (e: MouseEvent) => {
      const coinIdx = dragCoinRef.current;
      if (coinIdx === null) return;
      dragCoinRef.current = null;
      setDraggedCoin(null);
      setIsOverVending(false);
      const rect = vendingRef.current?.getBoundingClientRect();
      const hit  =
        !!rect &&
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom;
      if (hit) insertCoin(coinIdx);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [insertCoin]);

  // global touch events
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (dragCoinRef.current === null) return;
      touchMovedRef.current = true;
      const touch = e.touches[0];
      setDragPos({
        x: touch.clientX - dragOffRef.current.x,
        y: touch.clientY - dragOffRef.current.y,
      });
      const rect = vendingRef.current?.getBoundingClientRect();
      setIsOverVending(
        !!rect &&
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top  && touch.clientY <= rect.bottom,
      );
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const coinIdx = dragCoinRef.current;
      if (coinIdx === null) return;
      const touch = e.changedTouches[0];
      dragCoinRef.current = null;
      setDraggedCoin(null);
      setIsOverVending(false);

      if (!touchMovedRef.current) {
        // Tap — insert directly without needing to drag onto machine
        insertCoin(coinIdx);
        return;
      }

      const rect = vendingRef.current?.getBoundingClientRect();
      const hit  =
        !!rect &&
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top  && touch.clientY <= rect.bottom;
      if (hit) insertCoin(coinIdx);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend",  onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend",  onTouchEnd);
    };
  }, [insertCoin]);

  const navigate = useCallback(
    (n: number) => {
      const dest = KEYS[n];
      if (!dest) return;
      setDisplayText(dest.label.toUpperCase());
      setHoveredKey(null);
      setTimeout(() => {
        setShowKeyboard(false);
        setDisplayText("INSERT COIN");
        router.push(dest.href);
      }, 280);
    },
    [router],
  );

  useEffect(() => {
    if (!showKeyboard) return;
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) navigate(n);
      if (e.key === "Escape") { setShowKeyboard(false); setDisplayText("INSERT COIN"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showKeyboard, navigate]);

  const startDrag = (idx: number, e: React.MouseEvent) => {
    if (usedCoins.has(idx)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffRef.current  = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragCoinRef.current = idx;
    setDragPos({ x: rect.left, y: rect.top });
    setDraggedCoin(idx);
    e.preventDefault();
  };

  const startTouchDrag = (idx: number, e: React.TouchEvent) => {
    if (usedCoins.has(idx)) return;
    const touch = e.touches[0];
    const rect  = (e.currentTarget as HTMLElement).getBoundingClientRect();
    touchMovedRef.current = false;
    dragOffRef.current    = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    dragCoinRef.current   = idx;
    setDragPos({ x: rect.left, y: rect.top });
    setDraggedCoin(idx);
  };

  const ledText    = hoveredKey ? KEYS[hoveredKey].label.toUpperCase() : displayText;
  const ledVisible = showKeyboard ? true : blinkOn;
  const coinSize   = isMobile ? 60 : 96;

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-white"
      style={{
        cursor: isMobile ? "auto" : "none",
        userSelect: "none",
        backgroundImage: "radial-gradient(circle, #d8d8d8 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        ...(isMobile
          ? {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: "100vh",
              padding: "70px 16px 32px",
              boxSizing: "border-box",
              gap: 0,
            }
          : {
              display: "grid",
              gridTemplateColumns: "220px 1fr 180px",
              gridTemplateRows: "1fr",
              minHeight: "100vh",
              padding: "28px 40px",
              boxSizing: "border-box",
              alignItems: "center",
            }),
      }}
    >
      {/* ── pixel cursor (desktop only) ───────────────── */}
      {!isMobile && (
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ left: mouse.x - 4, top: mouse.y - 4 }}
        >
          <Image
            src="/assets/mainpage-vending machine/cursor.png"
            alt="" width={72} height={72}
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </div>
      )}

      {/* ── top-right: portfolio toggle ───────────────── */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: 20,
          right: isMobile ? 16 : 28,
          zIndex: 80,
          fontFamily: pixel.style.fontFamily,
          fontSize: isMobile ? 7 : 8,
          letterSpacing: "0.18em",
          color: "#555",
          background: "#f4f0e8",
          border: "2px solid #aaa",
          boxShadow: "2px 2px 0 #888",
          padding: isMobile ? "6px 10px" : "8px 14px",
          cursor: isMobile ? "pointer" : "none",
          textDecoration: "none",
          display: "inline-block",
          transition: "background 0.1s, color 0.1s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "#222";
          (e.currentTarget as HTMLElement).style.color = "#44ff44";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "#f4f0e8";
          (e.currentTarget as HTMLElement).style.color = "#555";
        }}
      >
        PORTFOLIO →
      </Link>

      {/* ── music icon ──────────────────────────────────── */}
      {isMobile ? (
        /* Mobile: fixed top-left, compact */
        <motion.button
          type="button"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 30,
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          title={isPlaying ? "Pause music" : "Play music"}
        >
          <Image
            src="/assets/mainpage-vending machine/music.png"
            alt={isPlaying ? "Now playing — tap to pause" : "Tap to play music"}
            width={72} height={55}
            style={{ imageRendering: "pixelated", opacity: isPlaying ? 1 : 0.6, display: "block" }}
          />
        </motion.button>
      ) : (
        /* Desktop: left column */
        <motion.div
          style={{ alignSelf: "start", zIndex: 30, cursor: "none", position: "relative", display: "inline-block" }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={toggleMusic}
          title={isPlaying ? "Pause music" : "Play music"}
        >
          {PIXEL_STARS.map(s => (
            <motion.span
              key={s.id}
              style={{
                position:      "absolute",
                left:          s.x,
                top:           s.y,
                fontSize:      s.size,
                color:         s.color,
                fontFamily:    `${px}, monospace`,
                lineHeight:    1,
                pointerEvents: "none",
                zIndex:        2,
                display:       "block",
              }}
              animate={isPlaying
                ? { y: [0, -10, 2, -6, 0], scale: [1, 1.5, 0.9, 1.3, 1], opacity: [0.5, 1, 0.7, 1, 0.5] }
                : { scale: 0, opacity: 0 }
              }
              transition={isPlaying
                ? { duration: 0.9 + s.delay * 0.4, repeat: Infinity, ease: "easeInOut", delay: s.delay }
                : { duration: 0.2 }
              }
            >
              {s.char}
            </motion.span>
          ))}

          <Image
            src="/assets/mainpage-vending machine/music.png"
            alt={isPlaying ? "Now playing — click to pause" : "Click to play music"}
            width={200} height={152}
            style={{ imageRendering: "pixelated", opacity: isPlaying ? 1 : 0.7, display: "block" }}
          />

          <AnimatePresence>
            {!isPlaying && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position:   "absolute",
                  bottom:     -20,
                  left:       "50%",
                  transform:  "translateX(-50%)",
                  fontFamily: px,
                  fontSize:   7,
                  color:      "#999",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                ▶ PLAY
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── center column: LED + vending machine ─────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          zIndex: 10,
          ...(isMobile ? { width: "100%", marginTop: 8 } : {}),
        }}
      >
        {/* LED strip above machine */}
        <div
          style={{
            background: "#060f06",
            border: "3px solid #111",
            boxShadow: "4px 4px 0 #000, inset 0 0 8px rgba(0,0,0,0.8)",
            padding: "9px 24px",
            minWidth: isMobile ? 180 : 260,
            textAlign: "center",
            fontFamily: px,
            fontSize: isMobile ? 8 : 9,
            letterSpacing: "0.26em",
            color: ledVisible ? "#44ff44" : "#1a3a1a",
            textShadow: ledVisible ? "0 0 8px #44ff44, 0 0 20px #44ff4466" : "none",
            transition: "color 0.08s, text-shadow 0.08s",
          }}
        >
          {ledText}
        </div>

        {/* Vending machine */}
        <motion.div
          ref={vendingRef}
          animate={
            isOverVending
              ? { filter: "brightness(1.1) drop-shadow(0 0 28px rgba(240,185,40,0.9))" }
              : { filter: "brightness(1)  drop-shadow(0 0 0px transparent)" }
          }
          transition={{ duration: 0.16 }}
        >
          <Image
            src="/assets/mainpage-vending machine/vending-machine.png"
            alt="Vending Machine" width={520} height={779}
            style={{
              imageRendering: "pixelated",
              maxHeight: isMobile ? "52vh" : "78vh",
              width: "auto",
              maxWidth: isMobile ? "min(260px, 70vw)" : undefined,
            }}
            priority
          />
        </motion.div>
      </div>

      {/* ── coins: vertical column (desktop) / horizontal row (mobile) ─── */}
      {isMobile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
            width: "100%",
          }}
        >
          <p style={{ fontFamily: px, fontSize: 7, letterSpacing: "0.2em", color: "#aaa" }}>
            TAP A COIN TO INSERT
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: COIN_COUNT }, (_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: usedCoins.has(i) ? 0.12 : draggedCoin === i ? 0.18 : 1 }}
                transition={{ duration: 0.12 }}
                onMouseDown={e => startDrag(i, e)}
                onTouchStart={e => startTouchDrag(i, e)}
                style={{
                  cursor: usedCoins.has(i) ? "default" : "pointer",
                  flexShrink: 0,
                  touchAction: "none",
                }}
              >
                <Image
                  src="/assets/mainpage-vending machine/coin.png"
                  alt={`Coin ${i + 1}`} width={coinSize} height={coinSize}
                  draggable={false}
                  style={{ imageRendering: "pixelated", pointerEvents: "none", display: "block" }}
                />
              </motion.div>
            ))}
          </div>
          <p style={{ fontFamily: px, fontSize: 7, letterSpacing: "0.1em", color: "#bbb" }}>
            OR DRAG ONTO MACHINE ↑
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            alignSelf: "center",
          }}
        >
          <p style={{ fontFamily: px, fontSize: 7, letterSpacing: "0.2em", color: "#aaa", marginBottom: 8 }}>
            COINS
          </p>
          {Array.from({ length: COIN_COUNT }, (_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: usedCoins.has(i) ? 0.12 : draggedCoin === i ? 0.18 : 1 }}
              transition={{ duration: 0.12 }}
              onMouseDown={e => startDrag(i, e)}
              style={{ cursor: "none", flexShrink: 0 }}
            >
              <Image
                src="/assets/mainpage-vending machine/coin.png"
                alt={`Coin ${i + 1}`} width={96} height={96}
                draggable={false}
                style={{ imageRendering: "pixelated", pointerEvents: "none", display: "block" }}
              />
            </motion.div>
          ))}
          <p style={{ fontFamily: px, fontSize: 7, letterSpacing: "0.1em", color: "#bbb", marginTop: 8 }}>
            ← DRAG
          </p>
        </div>
      )}

      {/* ── dragged coin ghost ───────────────────────── */}
      {draggedCoin !== null && (
        <div className="pointer-events-none fixed z-50" style={{ left: dragPos.x, top: dragPos.y }}>
          <motion.div
            animate={{ scale: isOverVending ? 1.22 : 1, rotate: isOverVending ? 20 : 0 }}
            transition={{ duration: 0.14 }}
          >
            <Image
              src="/assets/mainpage-vending machine/coin.png"
              alt="" width={coinSize} height={coinSize}
              draggable={false}
              style={{ imageRendering: "pixelated" }}
            />
          </motion.div>
        </div>
      )}

      {/* ── pixel keyboard modal ─────────────────────── */}
      <AnimatePresence>
        {showKeyboard && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            onClick={() => { setShowKeyboard(false); setDisplayText("INSERT COIN"); }}
          >
            <motion.div
              initial={{ scale: 0.78, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.86,    opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              onClick={e => e.stopPropagation()}
            >
              <PixelKeyboard
                hoveredKey={hoveredKey}
                displayText={displayText}
                onKeyHover={setHoveredKey}
                onKeyLeave={() => setHoveredKey(null)}
                onKeyClick={navigate}
                isMobile={isMobile}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
