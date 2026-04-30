"use client";

import { useReducedMotion } from "framer-motion";
import { useMemo, type ComponentPropsWithoutRef } from "react";

export type AnimatedGradientConfig = {
  /** Prism: soft color drift · Silver: Apple-like pale metal + optional pointer focal */
  preset?: "Prism" | "Silver";
};

export type AnimatedGradientProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  config?: AnimatedGradientConfig;
  /** Normalised focus [0–1]; used mainly for preset Silver — drives shear + highlight apex */
  focal?: { nx: number; ny: number };
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Full-bleed animated wash. Prism = chromatic drift; Silver = cool grey / silver shimmer,
 * steered through `focal` (pointer on parent section).
 */
export default function AnimatedGradient({
  className = "",
  style,
  config,
  focal,
  ...props
}: AnimatedGradientProps) {
  const preset = config?.preset ?? "Prism";
  const reduced = useReducedMotion();

  const fx = clamp01(focal?.nx ?? 0.5);
  const fy = clamp01(focal?.ny ?? 0.42);

  const silverDynamics = useMemo(() => {
    if (preset !== "Silver") return null;
    // Pointer tilts dominant linear & shifts specular arcs (Apple-esque cool silver)
    const angle = 118 + fx * 34 - fy * 22;
    const angleB = angle + 118 + fy * 8;
    const hx = fx * 100;
    const hy = fy * 100;

    const base = `#fbfbfc`;
    const mid = "#ecedf1";
    const deep = `#dde1e9`;

    return {
      base,
      washes: `
        radial-gradient(ellipse ${78 + fx * 18}% ${68 + fy * 22}% at ${hx}% ${hy}%, rgba(255,255,255,0.94) 0%, rgba(246,246,249,0.38) 38%, transparent 72%),
        radial-gradient(${120 + fx * 40}px circle at ${clamp01(fx + 0.08) * 100}% ${clamp01(fy + 0.05) * 100}%, rgba(255,255,255,0.55), transparent 58%),
        linear-gradient(${angle}deg, ${base} 0%, ${mid} 52%, ${deep} 100%),
        linear-gradient(${angleB}deg, rgba(120,138,164,0.07) 0%, transparent 38%, rgba(228,231,239,0.35) 100%)
      `,
    };
  }, [preset, fx, fy]);

  if (preset === "Silver" && silverDynamics) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#fafafc] ${className}`.trim()}
        style={style}
        {...props}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: silverDynamics.washes }} />

        {/* Metallic film — faint cool sheen; pointer nudges conic */}
        <div
          className={`absolute -inset-[48%] mix-blend-soft-light blur-[30px] ${
            reduced ? "opacity-[0.35]" : "animate-[spin_138s_linear_infinite] opacity-[0.52]"
          }`}
          aria-hidden
          style={{
            background: `conic-gradient(from calc(186deg + ${fx * 40}deg - ${fy * 26}deg) at ${fx * 100}% ${fy * 100}%,
              rgba(200,209,226,0.14),
              rgba(168,174,188,0.08),
              rgba(225,229,239,0.12),
              rgba(200,209,226,0.14))`,
          }}
        />

        {/* Floating silver mist — anchored roughly opposite cursor for contrast */}
        <div
          className={`absolute h-[72vmin] w-[72vmin] max-w-[720px] -translate-x-[6%] -translate-y-[8%] rounded-full bg-[radial-gradient(circle_at_42%_40%,rgba(160,174,192,0.18),transparent_62%)] blur-[88px] mix-blend-multiply opacity-[0.85] ${
            reduced ? "" : "animate-spell-silver-a"
          }`}
          style={{
            left: `${clamp01(1 - fx * 0.85) * 42}%`,
            top: `${clamp01(1 - fy * 0.75) * 18}%`,
          }}
          aria-hidden
        />

        <div
          className={`absolute bottom-[-8%] left-[28%] h-[62vmin] w-[72vmin] max-w-[760px] rounded-full bg-[radial-gradient(circle_at_62%_38%,rgba(210,217,229,0.22),transparent_60%)] blur-[92px] mix-blend-multiply opacity-[0.75] ${
            reduced ? "" : "animate-spell-silver-b"
          }`}
          style={{
            left: `${18 + fx * 22}%`,
          }}
          aria-hidden
        />

        {/* Readable veil */}
        <div
          className="absolute inset-0 bg-[radial-gradient(96%_88%_at_50%_48%,transparent_0%,rgba(255,255,255,0.52)_74%,rgba(252,253,254,0.88)_100%)]"
          aria-hidden
        />
      </div>
    );
  }

  if (preset !== "Prism") {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#f7f5ff] ${className}`.trim()}
      style={style}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(118%_78%_at_52%_-8%,rgba(255,255,255,0.88),transparent_46%),linear-gradient(168deg,#e8ddfd_0%,#dbf3ff_45%,#ffefe2_100%)]" />

      <div
        className={`absolute -inset-[55%] bg-[conic-gradient(from_205deg_at_50%_50%,rgba(168,85,247,0.22),rgba(34,211,238,0.2),rgba(251,191,72,0.2),rgba(244,171,217,0.18),rgba(168,85,247,0.22))] mix-blend-soft-light blur-[40px] ${
          reduced ? "opacity-55" : "animate-[spin_160s_linear_infinite] opacity-[0.72]"
        }`}
        aria-hidden
      />

      <div
        className={`absolute -left-[18%] -top-[8%] h-[62vmin] w-[62vmin] max-w-[720px] rounded-full bg-[radial-gradient(circle_at_38%_35%,rgba(192,152,246,0.78),transparent_58%)] blur-[68px] mix-blend-multiply dark:mix-blend-screen ${reduced ? "translate-x-[2%] translate-y-[1%]" : "animate-spell-prism-a"}`}
        aria-hidden
      />

      <div
        className={`absolute -right-[12%] top-[6%] h-[56vmin] w-[56vmin] max-w-[640px] rounded-full bg-[radial-gradient(circle_at_62%_40%,rgba(125,226,246,0.78),transparent_58%)] blur-[74px] mix-blend-multiply dark:mix-blend-screen ${reduced ? "-translate-x-[2%]" : "animate-spell-prism-b"}`}
        aria-hidden
      />

      <div
        className={`absolute -bottom-[16%] left-[14%] h-[54vmin] w-[62vmin] max-w-[700px] rounded-full bg-[radial-gradient(circle_at_42%_60%,rgba(253,216,154,0.72),transparent_60%)] blur-[76px] mix-blend-multiply dark:mix-blend-screen ${reduced ? "translate-y-[2%]" : "animate-spell-prism-c"}`}
        aria-hidden
      />

      <div
        className="absolute inset-0 bg-[radial-gradient(92%_72%_at_50%_44%,transparent_0%,rgba(255,255,255,0.18)_62%,rgba(251,251,253,0.58)_100%)]"
        aria-hidden
      />
    </div>
  );
}
