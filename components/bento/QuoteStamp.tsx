"use client";

/**
 * QuoteStamp — the opening quote as a lime sticker pressed onto the corner of
 * the identity photo: two solid marks, one ink outline around both, a soft
 * shadow, and a single stamp-down on mount (flat under reduced motion).
 */

import { motion } from "framer-motion";
import { useId } from "react";

export function QuoteStamp({ reduced, className = "" }: { reduced: boolean; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <motion.svg
      aria-hidden
      viewBox="-6 -6 104 76"
      className={`pointer-events-none overflow-visible ${className}`}
      initial={reduced ? false : { scale: 1.35, opacity: 0, rotate: -16 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
    >
      <defs>
        <filter id={`${id}-sticker`} x="-25%" y="-25%" width="150%" height="160%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="thick" />
          <feFlood floodColor="#0a0b0c" result="ink" />
          <feComposite in="ink" in2="thick" operator="in" result="outline" />
          <feMerge result="sticker">
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
          <feDropShadow in="sticker" dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter={`url(#${id}-sticker)`} fill="#d2ff00">
        {[0, 46].map((dx) => (
          <g key={dx} transform={`translate(${dx} 0)`}>
            <circle cx="22" cy="44" r="16.5" />
            <path d="M6 45 C5 26 16 10 35 3 L38.5 10 C27 16 21.5 25 21.5 31 Z" />
          </g>
        ))}
      </g>
    </motion.svg>
  );
}
