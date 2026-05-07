"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const NATURAL_W = 1280;
const NATURAL_H = 860;

const showrooms = [
  {
    id: "romance" as const,
    label: "Romance · Meet with Lucien",
    href: "/work/ai-character/prototype",
    src: "/work/ai-character/prototype?muted=1",
    iframeTitle: "Romance Showroom interactive prototype",
    iframeBg: "bg-[#060608]",
    caseStudy: "/work/ai-character",
  },
  {
    id: "omikuji" as const,
    label: "Omikuji · 御神籤",
    href: "/code/playground/omikuji",
    src: "/code/playground/omikuji?embed=1",
    iframeTitle: "Omikuji Cabinet interactive prototype",
    iframeBg: "bg-[#060608]",
  },
  {
    id: "gacha" as const,
    label: "Magic Lamp · Portfolio Draw",
    href: "/code/playground/gacha",
    src: "/code/playground/gacha?embed=1",
    iframeTitle: "Magic Lamp gacha cabinet interactive prototype",
    iframeBg: "bg-[#070605]",
  },
  {
    id: "therapy" as const,
    label: "Therapy Room",
    href: "/work/ai-character/prototype-psych",
    src: "/work/ai-character/prototype-psych?embed=1",
    iframeTitle: "Therapy Room interactive prototype",
    iframeBg: "bg-[#f8fcff]",
  },
  {
    id: "astro" as const,
    label: "Astrology · Tao Baibai",
    href: "/work/ai-character/prototype-astro",
    src: "/work/ai-character/prototype-astro?embed=1",
    iframeTitle: "Zodiac Showroom interactive prototype",
    iframeBg: "bg-[#fdfaf5]",
  },
] as const;

function ScaledPreview({
  src,
  title,
  iframeBg,
}: {
  src: string;
  title: string;
  iframeBg: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / NATURAL_W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-2xl shadow-sm"
      style={{ height: NATURAL_H * scale }}
    >
      <iframe
        title={title}
        src={src}
        className={`block border-0 ${iframeBg}`}
        style={{
          width: NATURAL_W,
          height: NATURAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        loading="lazy"
      />
    </div>
  );
}

function MobilePreviewCard({
  href,
  title,
  iframeBg,
}: {
  href: string;
  title: string;
  iframeBg: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/[0.07] transition-opacity hover:opacity-90 ${iframeBg}`}
      aria-label={`Open ${title}`}
    >
      <span className="rounded-full bg-black/20 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
        Open prototype →
      </span>
    </Link>
  );
}

export function VibeCodingShowrooms({ lead }: { lead?: React.ReactNode }) {
  const rm = useReducedMotion();
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2">
      {lead && <div>{lead}</div>}
      {lead && <div className="hidden md:block" />}
      {showrooms.map((s, i) => (
        <motion.div
          key={s.id}
          initial={rm ? false : { opacity: 0, y: 20 }}
          whileInView={rm ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.55, ease: easePortfolio, delay: rm ? 0 : i * 0.07 }}
        >
          <div className="sm:hidden">
            <MobilePreviewCard href={s.href} title={s.iframeTitle} iframeBg={s.iframeBg} />
          </div>
          <div className="hidden sm:block">
            <ScaledPreview src={s.src} title={s.iframeTitle} iframeBg={s.iframeBg} />
          </div>

          <div className="mt-3 flex items-center justify-between px-0.5">
            <span className="text-[13px] text-textSecondary">{s.label}</span>
            <div className="flex items-center gap-4">
              {"caseStudy" in s && (
                <Link
                  href={(s as { caseStudy: string }).caseStudy}
                  className="text-[13px] text-textSecondary underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  Case study
                </Link>
              )}
              <Link
                href={s.href}
                className="text-[13px] text-textPrimary underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                Open →
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
