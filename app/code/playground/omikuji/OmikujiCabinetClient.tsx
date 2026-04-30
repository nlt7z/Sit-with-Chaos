"use client";

import { motion } from "framer-motion";
import { Noto_Serif_JP, Shippori_Mincho } from "next/font/google";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FORTUNES, shuffleDrawerOrder, type Fortune, type ParticleKind } from "./fortunes";
import { ParticleCanvas } from "./ParticleCanvas";
import { useDailyLimit } from "./useDailyLimit";

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const colors = {
  bg: "#1a1208",
  cabinet: "#3d2b1a",
  drawer: "#5c3d22",
  drawerEdge: "#7a5230",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  paper: "#f4ead5",
  ink: "#1e1410",
  seal: "#c0392b",
} as const;

function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-tight text-[#c9a84c]" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < n ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

const FortuneCard = memo(function FortuneCard({ fortune, onClose }: { fortune: Fortune; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-4 pb-10 sm:items-center sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="omikuji-fortune-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close overlay"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-[1] w-full max-w-md rounded-sm border-2 border-[#c9a84c]/35 bg-[#f4ead5] px-7 py-8 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] sm:max-w-lg ${notoSerif.className}`}
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.22), transparent 38%), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 6px)",
        }}
      >
        <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#c9a84c]/55 to-transparent" />
        <p
          id="omikuji-fortune-title"
          className={`mt-6 text-center text-3xl font-bold tracking-[0.18em] text-[#c9a84c] ${shippori.className}`}
        >
          {fortune.levelLabel}
        </p>
        <p className="mt-4 text-center text-xs font-light tracking-[0.35em] text-[#1e1410]/70">Today&apos;s omikuji</p>
        <div
          className="mx-auto mt-6 max-h-[200px] text-[1.05rem] font-normal leading-[2.05] tracking-[0.22em] text-[#1e1410]"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {fortune.poem.split("\n").map((line) => (
            <span key={line} className="mr-4 inline-block max-w-[12rem]">
              {line}
            </span>
          ))}
        </div>
        <p className="mt-8 text-center text-sm leading-relaxed text-[#1e1410]/85">{fortune.summary}</p>

        <div className="mt-6 space-y-2 rounded-md border border-[#1e1410]/10 bg-[#1e1410]/[0.03] px-4 py-3 text-sm text-[#1e1410]">
          <p>
            Love <Stars n={fortune.love} />
          </p>
          <p>
            Career <Stars n={fortune.career} />
          </p>
          <p>
            Wealth <Stars n={fortune.wealth} />
          </p>
          <p>
            Health <Stars n={fortune.health} />
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#1e1410]">
          <p>
            <span className="font-medium text-[#7a5230]">Favorable · </span>
            {fortune.lucky.join(" · ")}
          </p>
          <p>
            <span className="font-medium text-[#7a5230]">Unfavorable · </span>
            {fortune.unlucky.join(" · ")}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-[#c0392b] text-lg text-[#c0392b] opacity-85 ${shippori.className}`}
            style={{ transform: "rotate(-8deg)" }}
            aria-hidden
          >
            御
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#1e1410]/20 bg-white/70 px-6 py-2 text-sm font-medium text-[#1e1410] transition hover:bg-white"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
});

function Drawer({
  label,
  disabled,
  isOpen,
  onClick,
}: {
  label: string;
  disabled: boolean;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative aspect-[3/4] w-full rounded-[2px] border border-[#7a5230] bg-[#5c3d22] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-2px_4px_rgba(0,0,0,0.4)] transition-[transform,box-shadow,opacity] duration-300 ease-out ${
        disabled
          ? "cursor-not-allowed opacity-35"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_14px_rgba(0,0,0,0.35)]"
      } ${isOpen ? "translate-y-3 opacity-60" : ""}`}
    >
      <span className="absolute left-1.5 top-1.5 font-mono text-[10px] font-light tracking-wide text-[#e8c97a]/80">
        {label}
      </span>
      <span
        className="absolute bottom-[25%] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        style={{
          background: "radial-gradient(circle at 35% 35%, #e8c97a, #c9a84c)",
        }}
      />
      {isOpen ? (
        <span
          className="absolute left-1/2 top-[42%] h-5 w-3 -translate-x-1/2 rounded-sm border border-[#c9a84c]/40 bg-[#f4ead5]/90 shadow-inner"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

export function OmikujiCabinetClient({ embed = false }: { embed?: boolean }) {
  const { alreadyDrawn, lastFortuneId, lastDrawerIndex, markAsDrawn } = useDailyLimit();
  const [drawerOrder, setDrawerOrder] = useState<number[] | null>(null);
  const [selectedFortune, setSelectedFortune] = useState<Fortune | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [particleType, setParticleType] = useState<ParticleKind | null>(null);
  const [particleDense, setParticleDense] = useState(false);
  const [particleKey, setParticleKey] = useState(0);
  const [openDrawerIndex, setOpenDrawerIndex] = useState<number | null>(null);
  const cardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDrawerOrder(shuffleDrawerOrder(Date.now()));
  }, []);

  useEffect(() => {
    if (alreadyDrawn && lastDrawerIndex != null) {
      setOpenDrawerIndex(lastDrawerIndex);
    }
  }, [alreadyDrawn, lastDrawerIndex]);

  useEffect(() => {
    return () => {
      if (cardTimer.current) clearTimeout(cardTimer.current);
    };
  }, []);

  const lastFortune = useMemo(
    () => (lastFortuneId ? FORTUNES.find((f) => f.id === lastFortuneId) ?? null : null),
    [lastFortuneId],
  );

  const onParticleComplete = useCallback(() => {
    setParticleType(null);
  }, []);

  const handleDrawerClick = useCallback(
    (drawerIndex: number) => {
      if (!drawerOrder) return;

      if (alreadyDrawn) {
        if (lastDrawerIndex === drawerIndex && lastFortune) {
          setSelectedFortune(lastFortune);
          setShowCard(true);
        }
        return;
      }

      const fortune = FORTUNES[drawerOrder[drawerIndex]];
      setOpenDrawerIndex(drawerIndex);
      setSelectedFortune(fortune);
      setParticleKey((k) => k + 1);
      setParticleType(fortune.particleType);
      setParticleDense(!!fortune.particleDense);
      markAsDrawn(fortune.id, drawerIndex);

      if (cardTimer.current) clearTimeout(cardTimer.current);
      cardTimer.current = setTimeout(() => setShowCard(true), 800);
    },
    [alreadyDrawn, drawerOrder, lastDrawerIndex, lastFortune, markAsDrawn],
  );

  const closeCard = useCallback(() => {
    setShowCard(false);
  }, []);

  const cabinetWidthClass = embed
    ? "max-w-[min(100%,30rem)]"
    : "max-w-[min(100%,31rem)] md:max-w-[min(100%,35rem)] lg:max-w-[min(100%,39rem)] xl:max-w-[min(100%,43rem)]";

  return (
    <div
      className={`${
        embed ? "px-1.5 pb-2 pt-1.5 md:px-2 md:pt-2" : "min-h-screen px-4 pb-12 pt-28 md:px-8 md:pb-14 md:pt-32"
      } text-[#f4ead5] ${notoSerif.className}`}
      style={{
        backgroundColor: colors.bg,
        backgroundImage:
          "radial-gradient(120% 80% at 20% 10%, rgba(201,168,76,0.07), transparent 55%), radial-gradient(90% 70% at 80% 30%, rgba(0,0,0,0.35), transparent 60%)",
      }}
    >
      <div className="mx-auto max-w-content">
        {embed ? null : (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/playground"
              className="text-sm text-[#e8c97a]/80 underline decoration-[#c9a84c]/30 underline-offset-4 transition hover:text-[#e8c97a]"
            >
              ← Playground
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]/70">Interactive demo</p>
          </div>
        )}

        {embed ? null : (
          <header className="mb-6 max-w-2xl md:mb-8">
            <h1 className={`text-2xl font-bold tracking-[0.12em] text-[#e8c97a] md:text-3xl ${shippori.className}`}>
              Omikuji Cabinet
            </h1>
            <p className={`mt-3 max-w-xl text-[13px] leading-relaxed text-[#f0ddb8]/78 md:text-sm ${notoSerif.className}`}>
              Twenty-four drawers; three omikuji per day with a quiet reminder on each slip.
            </p>
          </header>
        )}

        {alreadyDrawn && !embed ? (
          <p className="mb-6 text-center text-sm text-[#e8c97a]/90">
            Today&apos;s fortune has already been drawn. Open the same drawer again to reread it — return tomorrow for
            a new draw.
          </p>
        ) : null}

        {!drawerOrder ? (
          <p className="text-center text-sm text-[#f4ead5]/60">Preparing the cabinet…</p>
        ) : (
          <div
            className={`mx-auto rounded border-[3px] p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.6),0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_#7a5230] md:p-5 ${cabinetWidthClass}`}
            style={{
              backgroundColor: colors.cabinet,
              borderColor: colors.gold,
            }}
          >
            <div
              className={`mb-4 border px-6 py-2 text-center text-sm font-bold tracking-[0.45em] text-[#c9a84c] ${shippori.className}`}
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.gold,
              }}
            >
              Omikuji Cabinet
            </div>

            <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 lg:grid-cols-6 lg:gap-2 lg:p-4">
              {drawerOrder.map((_, drawerIdx) => {
                const disabled = alreadyDrawn && lastDrawerIndex !== drawerIdx;
                const isOpen = openDrawerIndex === drawerIdx;
                return (
                  <Drawer
                    key={drawerIdx}
                    label={String(drawerIdx + 1).padStart(2, "0")}
                    disabled={disabled}
                    isOpen={isOpen}
                    onClick={() => handleDrawerClick(drawerIdx)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {particleType ? (
        <ParticleCanvas key={particleKey} type={particleType} dense={particleDense} onComplete={onParticleComplete} />
      ) : null}

      {showCard && selectedFortune ? <FortuneCard fortune={selectedFortune} onClose={closeCard} /> : null}
    </div>
  );
}

export default OmikujiCabinetClient;
