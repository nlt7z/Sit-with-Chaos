import Link from "next/link";
import type { ReactNode } from "react";

import { SplitTextChars } from "@/components/SplitBtn";

/**
 * Action — every button-like link on the site, in three levels.
 *
 *   primary    solid pill (lime on dark, ink on light); hover: the letter roll,
 *              a soft shadow and the arrow nudging out. One per view.
 *   secondary  same pill, outlined; hover: the letter roll and a faint fill.
 *   text       a standalone underlined link; hover darkens the underline.
 *   label      the small mono utility link ("open full diagram"); hover
 *              brightens it and draws the underline.
 *
 * Arrows follow one rule: ↗ means it opens in a new tab (other sites, files
 * such as PDFs and /assets pages, or `newTab` for a full-screen prototype);
 * → means it navigates in place. Pass `arrow={false}` to drop it, or `back`
 * for a ← link that leads the label.
 */

type Variant = "primary" | "secondary" | "text" | "label";
type Tone = "dark" | "light";

const PILL =
  "group inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14px] font-medium transition-[box-shadow,background-color,transform] duration-300 ease-portfolio focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]";

const STYLE: Record<Variant, Record<Tone, string>> = {
  primary: {
    dark: `${PILL} bg-nltLime text-[#0a0b0c] hover:shadow-[0_8px_28px_-6px_rgba(210,255,0,0.55)] focus-visible:ring-nltLime/70 focus-visible:ring-offset-[#0a0b0c]`,
    light: `${PILL} bg-textPrimary text-white hover:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.45)] focus-visible:ring-textPrimary`,
  },
  secondary: {
    dark: `${PILL} text-white ring-1 ring-inset ring-white/20 hover:bg-white/[0.06] focus-visible:ring-nltLime/70 focus-visible:ring-offset-[#0a0b0c]`,
    light: `${PILL} text-textPrimary ring-1 ring-inset ring-black/15 hover:bg-black/[0.04] focus-visible:ring-textPrimary`,
  },
  text: {
    dark: "group inline-flex items-center gap-1.5 text-[14px] text-white/80 underline decoration-white/25 underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70",
    light: "group inline-flex items-center gap-1.5 text-[14px] text-textPrimary underline decoration-black/20 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary",
  },
  label: {
    dark: "group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-white hover:decoration-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70",
    light: "group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-150 hover:text-textPrimary hover:decoration-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary",
  },
};

export function isExternal(href: string) {
  return /^(https?:|mailto:|\/assets\/)/.test(href) || /\.pdf($|[?#])/i.test(href);
}

export function Action({
  href,
  children,
  variant = "primary",
  tone = "light",
  arrow = true,
  back = false,
  newTab = false,
  tabIndex,
  className = "",
}: {
  href: string;
  /** A plain string gets the letter roll on primary and secondary. */
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  arrow?: boolean;
  back?: boolean;
  /** Open a page on this site in a new tab (a full-screen prototype). */
  newTab?: boolean;
  tabIndex?: number;
  className?: string;
}) {
  const external = newTab || isExternal(href);
  const glyph = back ? "←" : external ? "↗" : "→";
  const cls = `${STYLE[variant][tone]} ${className}`;
  const nudge = back
    ? "group-hover:-translate-x-0.5"
    : external
      ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      : "group-hover:translate-x-0.5";
  const mark = <span aria-hidden className={`leading-none transition-transform duration-300 ease-portfolio ${nudge}`}>{glyph}</span>;
  const label =
    (variant === "primary" || variant === "secondary") && typeof children === "string" ? (
      <>
        <span className="sr-only">{children}</span>
        <span aria-hidden className="flex items-center leading-[1.1]">
          <SplitTextChars text={children} />
        </span>
      </>
    ) : (
      children
    );
  const body = (
    <>
      {back ? mark : null}
      {label}
      {arrow && !back ? mark : null}
    </>
  );

  if (external) {
    return (
      <a href={href} className={cls} tabIndex={tabIndex} {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} tabIndex={tabIndex}>
      {body}
    </Link>
  );
}
