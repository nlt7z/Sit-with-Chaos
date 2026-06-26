"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CaseStudyMobileToc } from "@/components/CaseStudyMobileToc";

// useLayoutEffect warns during SSR in React 18; both run pre-paint on the client.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const easePremium = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "turning-point", label: "Context" },
  { id: "solution", label: "System" },
  { id: "chat", label: "Chat" },
  { id: "quote", label: "Quote" },
  { id: "merchant", label: "Merchant" },
  { id: "prototype", label: "Prototype" },
  { id: "scenarios", label: "Extensions" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Reflection" },
] as const;

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.85, delay, ease: easePremium }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Special reveal used once on the page — for the full interactive prototype.
 * Heavier than FadeIn (longer duration, blur clear, slight rotate-tilt) because
 * this is the case study's visual high point and deserves the announcement.
 */
function PrototypeReveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.965, rotate: -0.8, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-20% 0px -12% 0px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "50% 100%" }}
    >
      {children}
    </motion.div>
  );
}

function CaseNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const els = navItems.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top?.target.id) setActive(top.target.id);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav aria-label="Case study sections" className="pointer-events-none fixed left-0 top-0 z-20 hidden h-full w-[12rem] lg:block">
      <div className="pointer-events-auto sticky top-[calc(50vh-12rem)] px-7 pt-32">
        <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-textSecondary/60">On this page</p>
        <ul className="mt-5 space-y-0">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(id);
                }}
                className={`block border-l-[1.5px] border-transparent py-1.5 pl-4 text-left text-[12px] leading-snug transition-[color,border-color,opacity,transform] duration-500 ease-out ${
                  active === id
                    ? "border-nltLime font-medium text-textPrimary"
                    : "text-textSecondary/90 hover:translate-x-0.5 hover:border-nltLime/40 hover:text-textPrimary"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-black/[0.06] py-14 md:py-28 lg:py-36">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-textSecondary/75">{eyebrow}</p>
        <h2 className="mt-5 max-w-4xl font-display text-[2rem] font-light leading-[1.08] tracking-tight text-textPrimary md:text-[2.6rem] md:leading-[1.06] lg:text-[2.95rem]">
          {title}
        </h2>
        <div className="mt-12 space-y-10 text-[16px] leading-[1.75] text-textSecondary [&>p]:max-w-[40rem] [&_.case-lead]:text-[16px] [&_.case-lead]:leading-[1.75] [&_.case-lead]:text-textPrimary/88 [&>div]:max-w-none [&>ul]:max-w-[40rem]">
          {children}
        </div>
      </div>
    </section>
  );
}

/** Renders the FixIt Express prototype iframe at its natural design size
 *  (≈800×940 — a 390 phone + 280 side rail + padding) and CSS-scales it down
 *  to fit narrow viewports, so the phone + side rail never get squeezed or
 *  clipped horizontally. Above `naturalWidth` we stop scaling and the iframe
 *  sits at its natural size, centered in the wrapper. The outer box is
 *  capped to `naturalWidth` and uses an aspect-ratio lock so its height
 *  is correct on the very first paint — no SSR → measured layout shift. */
function ScaledPrototypeFrame({
  src,
  title,
  naturalWidth = 800,
  naturalHeight = 1180,
  displayMaxWidth,
}: {
  src: string;
  title: string;
  naturalWidth?: number;
  naturalHeight?: number;
  displayMaxWidth?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const effectiveMax = displayMaxWidth ?? naturalWidth;

  useIsomorphicLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = (w: number) => {
      if (w > 0) setScale(Math.min(1, w / naturalWidth));
    };
    apply(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth]);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: effectiveMax }}>
      <div
        ref={wrapperRef}
        // overflow-hidden clips the scaled iframe AND keeps the wrapper's
        // measured width bounded by its column — without it a not-yet-scaled
        // 1200px iframe widens the whole document, which then feeds back into
        // the width measurement and the scale never recovers (the page renders
        // at desktop width on mobile). Mirrors the homepage ScaledPrototype.
        className="relative w-full overflow-hidden"
        style={{ height: naturalHeight * scale }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          style={{
            width: naturalWidth,
            height: naturalHeight,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="absolute left-0 top-0 block"
        />
      </div>
    </div>
  );
}

/**
 * Showcase video that lazy-loads and autoplays only once scrolled into view —
 * mirrors the homepage work-card video behavior so the heavy clip never loads
 * until it nears the viewport. Muted + looped, pauses when scrolled away.
 */
function ShowcaseVideo({ src, title }: { src: string; title: string }) {
  const vref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) {
            v.src = src;
            v.load();
          }
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={vref}
      title={title}
      muted
      loop
      playsInline
      preload="none"
      className="block aspect-video w-full object-cover"
    />
  );
}

function PhoneFrame({
  src,
  alt,
  label,
  caption,
  naturalWidth = 2250,
  naturalHeight = 4872,
}: {
  src: string;
  alt: string;
  label: string;
  caption?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}) {
  // Phone canvas: ≈ 9:19.5 ratio. The frame's width is fluid (capped at 320),
  // and the visible screen height is locked to that ratio so the device never
  // overflows narrow viewports. Long images crop to the top ("above the fold")
  // with a fade + "view full" affordance.
  const FRAME_W = 320;
  const ASPECT = 693 / 320; // height ÷ width
  const ratio = naturalHeight / naturalWidth; // > ASPECT means image is taller than frame
  const isLong = ratio > ASPECT + 0.02;

  return (
    <figure className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">{label}</p>
        {isLong ? (
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70 transition-colors hover:text-nltLime-ink"
          >
            View full →
          </a>
        ) : null}
      </div>

      <div
        className="relative mx-auto w-full rounded-[2rem] bg-gradient-to-br from-black/[0.05] via-black/[0.02] to-black/[0.08] p-[4px] shadow-[0_28px_56px_-28px_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(0,0,0,0.1)]"
        style={{ maxWidth: FRAME_W, aspectRatio: `${1} / ${ASPECT}` }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.78rem] border border-black/[0.06] bg-white">
          <Image
            src={src}
            alt={alt}
            width={naturalWidth}
            height={naturalHeight}
            className="block w-full"
            style={{ height: "auto" }}
            sizes="(max-width: 360px) 88vw, 320px"
          />
          {isLong ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-white/0 via-white/70 to-white" />
          ) : null}
        </div>
      </div>

      {caption ? (
        <figcaption className="mx-auto max-w-[300px] text-center text-[13px] leading-relaxed text-textSecondary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * A single prototype flow embedded live — deep-linked to one scenario
 * (`#flow=…&rail=0`) so the bundle boots straight into that flow with its
 * scenario rail hidden, reading as a self-contained interactive phone. The
 * HTML renders its own dark bezel, so we just scale it to fit the column the
 * same way ScaledPrototypeFrame does. Lazy-loaded so the heavy React+Babel
 * bundle only compiles as each phone nears the viewport.
 */
function LiveFlowPhone({
  flow,
  label,
  caption,
}: {
  flow: string;
  label: string;
  caption?: string;
}) {
  // Phone-only canvas: the 432-wide bezel + 24px gutters = 480; the height
  // clears the 924-tall device with a little breathing room.
  const NATURAL_W = 480;
  const NATURAL_H = 1010;
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Start at 1 to match the server-rendered HTML; measured before first paint.
  const [scale, setScale] = useState(1);

  useIsomorphicLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = (w: number) => {
      if (w > 0) setScale(Math.min(1, w / NATURAL_W));
    };
    apply(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <figure className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">{label}</p>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">
          Live
        </span>
      </div>

      <div className="mx-auto w-full" style={{ maxWidth: NATURAL_W }}>
        <div
          ref={wrapperRef}
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${NATURAL_W} / ${NATURAL_H}` }}
        >
          <iframe
            src={`/assets/meituan-im/interaction-flow-phone.html#flow=${flow}&rail=0`}
            title={`${label} — live interactive flow`}
            loading="lazy"
            style={{
              width: NATURAL_W,
              height: NATURAL_H,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="absolute left-0 top-0 block"
          />
        </div>
      </div>

      {caption ? (
        <figcaption className="mx-auto max-w-[300px] text-center text-[13px] leading-relaxed text-textSecondary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Callout({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body?: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-[2px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-nltLime-ink/30 bg-nltLime-soft font-mono text-[11px] tabular-nums text-nltLime-ink">
        {index.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug tracking-tight text-textPrimary">{title}</p>
        {body ? <p className="mt-1.5 text-[14px] leading-relaxed text-textSecondary">{body}</p> : null}
      </div>
    </div>
  );
}

/**
 * Animated number that springs from 0 to the target value when first scrolled
 * into view. The integer portion uses tabular-nums so the column doesn't shift
 * mid-tween. Respects prefers-reduced-motion — falls back to the static target.
 */
function CountUp({
  to,
  format = (n) => n.toFixed(0),
  durationMs = 1400,
}: {
  to: number;
  format?: (n: number) => string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const reduce = useReducedMotion();
  // Stash format in a ref so the rAF loop sees the latest function without
  // re-running the effect — otherwise an inline `format={...}` prop would
  // create a new ref every render, restart the tween from 0, and the number
  // would visibly jitter forever.
  const formatRef = useRef(format);
  formatRef.current = format;
  const [text, setText] = useState(() => format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setText(formatRef.current(to));
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const e = 1 - Math.pow(1 - p, 3);
      setText(formatRef.current(e * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, durationMs, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}

function SubsectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/85">{label}</p>
      {hint ? <p className="max-w-lg text-[16px] leading-relaxed text-textSecondary">{hint}</p> : null}
    </div>
  );
}

export default function MeituanImCaseStudyPage() {
  const reduceMotion = useReducedMotion();

  const heroVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.09, delayChildren: reduceMotion ? 0 : 0.06 },
    },
  };
  const heroItem = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: reduceMotion ? { duration: 0 } : { duration: 0.75, ease: easePremium } },
  };

  return (
    <>
      <Nav />
      <div className="relative min-h-screen bg-white">
        <CaseNav />
        <CaseStudyMobileToc items={navItems} />
        <article className="relative z-[1] mx-auto max-w-content bg-white px-6 pb-24 pt-24 text-left md:px-12 md:pb-56 md:pt-40 lg:pl-36 lg:pr-14 lg:pb-80 lg:pt-44">
          <main className="relative min-h-screen">
            <header id="overview" className="scroll-mt-28 pb-16 md:pb-24">
              <motion.div variants={heroVariants} initial="hidden" animate="show">
                <motion.div variants={heroItem} className="mb-7 flex items-center">
                  <Image
                    src="/assets/meituan-im/meituan-logo.png"
                    alt="Meituan"
                    width={200}
                    height={48}
                    className="h-7 w-auto object-contain object-left md:h-8"
                  />
                </motion.div>
                <motion.p variants={heroItem} className="font-mono text-[11px] uppercase tracking-[0.24em] text-textSecondary/85">
                  Meituan · Local Services · IM Consultation
                </motion.p>
                <motion.h1
                  variants={heroItem}
                  className="mt-8 max-w-[18ch] font-display text-[2rem] font-light leading-[1.05] tracking-tight text-textPrimary sm:max-w-4xl sm:text-[2.65rem] md:text-[4rem] md:leading-[1.02]"
                >
                  Designing Trust Before the Bill
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="mt-6 max-w-xl text-[16px] leading-[1.6] text-textSecondary"
                >
                  A 0-to-1 in-message quotation system across Meituan&apos;s 770M+ annual users and
                  14.5M merchants — turning uncertain local-service pricing into a guided,
                  comparable, bookable decision.
                </motion.p>
                <motion.p
                  variants={heroItem}
                  className="mt-5 max-w-xl text-[14px] leading-[1.7] text-textSecondary/80"
                >
                  <span className="text-textPrimary/80">For context:</span> it&apos;s a super-app marketplace — Uber, Yelp and TaskRabbit in one — where deals close inside in-app chat (<span className="text-textPrimary/80">IM</span>). This project ran the whole journey there: diagnose, compare, book, pay, review.
                </motion.p>

                <motion.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="/work/meituan-im/deck-present"
                    className="inline-flex rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-[0_12px_28px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                  >
                    View Presentation Deck
                  </a>
                  <a
                    href="/work/meituan-im/prototype"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-medium text-textPrimary ring-1 ring-black/[0.12] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                  >
                    Try Prototype ↗
                  </a>
                </motion.div>

                <motion.div
                  variants={heroItem}
                  className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-20 md:mt-14 md:gap-14"
                  aria-label="Project summary"
                >
                  {/* Left — hero metric + shared meta */}
                  <div className="space-y-10">
                    {/* Hero metric — slightly smaller so the prototype on the right
                        can carry equal visual weight. */}
                    <div>
                      <p className="font-display text-[2.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[3.75rem] lg:text-[5rem]">
                        +30<span className="text-[0.5em] text-textPrimary/70">%</span>
                      </p>
                      <p className="mt-4 max-w-md text-[15px] leading-[1.55] text-textSecondary">
                        Intent→order conversion on the diagnostic channel — ~1.3× the old path. Routing price-anxious users into it lifted overall search conversion <span className="text-textPrimary">+0.5pp</span>.
                      </p>
                    </div>

                    {/* Project facts as a divider-grid — same pattern as the
                        ai-character case study. Three columns: timeline, ownership,
                        impact. Each cell has a hairline rule on the left. */}
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-black/[0.08] pt-7 sm:grid-cols-3 sm:gap-y-0">
                      {[
                        { label: "Timeline", value: "4 weeks · 2025" },
                        { label: "Team", value: "Sole designer · 2 PMs · 2 engineers" },
                        { label: "Impact", value: "+30% channel conversion · +0.5pp overall (A/B with the team)" },
                      ].map(({ label, value }) => (
                        <div key={label} className="min-w-0">
                          <dt className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-textSecondary/70">{label}</dt>
                          <dd className="mt-2 font-sans text-[13px] leading-snug text-textSecondary/80">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Right — product walkthrough video (shown on mobile too). */}
                  <div className="flex flex-col items-start">
                    <div
                      className="relative w-full max-w-[500px] overflow-hidden rounded-2xl shadow-[0_28px_60px_-26px_rgba(0,0,0,0.35)]"
                    >
                      <video
                        src="/assets/meituan-im/meituan-present/meituan-present-1.mp4"
                        title="Repair flow — product walkthrough"
                        className="block aspect-video w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    </div>
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">
                      Product walkthrough
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </header>

        <Section id="turning-point" eyebrow="Context · Signal" title="The brief asked for price visibility. The evidence pointed deeper.">
          <FadeIn>
            <figure className="relative max-w-3xl">
              <span aria-hidden className="absolute -left-2 -top-7 font-display text-[6rem] font-light leading-none text-nltLime-ink/15 md:text-[8rem]">
                &ldquo;
              </span>
              <blockquote className="relative font-display text-[1.5rem] font-light leading-[1.3] tracking-tight text-textPrimary md:text-[1.9rem] md:leading-[1.28]">
                I needed a plumber. I messaged ten shops, actually talked to six, and spent half an hour
                comparing — and I still had no idea what it would cost. Every number felt like something
                they&apos;d change once they showed up.
              </blockquote>
              <figcaption className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/70">
                A pattern from user research — and my own experience
              </figcaption>
            </figure>
          </FadeIn>

          <FadeIn className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">The first attempt</p>
            <p className="mt-4 max-w-3xl text-[17px] leading-[1.6] tracking-tight text-textPrimary">
              The obvious fix was to show price up front — so we shipped a standalone quote page first. Conversion didn&apos;t budge: the quote was rarely the final price, so users didn&apos;t believe it and merchants didn&apos;t maintain it.
            </p>
            <p className="mt-7 max-w-3xl text-[18px] leading-[1.55] tracking-tight text-textPrimary">
              That failure was the insight. Price wasn&apos;t a <span className="text-textSecondary line-through decoration-textSecondary/40">number</span> problem — it was a <span className="text-nltLime-ink">process-trust</span> problem. Trust can&apos;t be declared on a page; it&apos;s built in the conversation.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              {/* BEFORE — old workflow, muted */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">Before · 4-step linear journey</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">grayscale</p>
                </div>
                <ol className="flex-1 divide-y divide-black/[0.06]">
                  {[
                    "Problem occurs",
                    "Many merchants appear",
                    "One-by-one outreach",
                    "Pick one for visit",
                  ].map((t, i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-textSecondary/60">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary/85">{t}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 border-t border-black/[0.07] pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">→ Trust break</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-textSecondary">
                    Quoted price ≠ actual bill.
                  </p>
                </div>
              </div>

              {/* AFTER — redesigned, warm accent */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">After · 3-step trust loop</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">redesigned</p>
                </div>
                <ol className="flex-1 divide-y divide-black/[0.06]">
                  {[
                    "Diagnose the problem",
                    "Structure the intent",
                    "Compare and commit",
                  ].map((t, i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-nltLime-ink">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary">{t}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 border-t border-black/[0.07] pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime-ink/80">→ Trust restored</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section id="solution" eyebrow="System Design" title="One end-to-end flow. Trust compounds across every stage.">
          <FadeIn className="mt-2">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
              <div className="relative w-full aspect-[17/23]">
                <iframe
                  src="/assets/meituan-im/im_consultation_flow_redesign.html"
                  title="IM consultation user flow map"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <SubsectionHeader
              label="Transaction blueprint"
              hint="Zoom out from the conversation to the whole deal — how a quote request becomes a booking, an on-site service, and a settled order across platform, user and merchant."
            />
            <FadeIn>
              <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
                <div className="relative w-full aspect-[3/2] sm:aspect-[12/5]">
                  <iframe
                    src="/assets/meituan-im/quote-to-service-flow-en.html"
                    title="Quote-to-service transaction flow"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </FadeIn>
            <p className="mt-3 text-right">
              <a
                href="/assets/meituan-im/quote-to-service-flow-en.html"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80 underline-offset-4 hover:underline"
              >
                Open full diagram ↗
              </a>
            </p>
          </div>

        </Section>

        <Section id="chat" eyebrow="IM Experience" title="Three entry states, one interaction model.">
          <FadeIn className="mt-2">
            <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-2xl border border-black/[0.08] bg-[#141416] shadow-[0_28px_60px_-26px_rgba(0,0,0,0.35)]">
              <ShowcaseVideo
                src="/assets/meituan-im/meituan-present/meituan-present-1.mp4"
                title="IM experience — three entry states walkthrough"
              />
            </div>
          </FadeIn>
        </Section>

        <Section id="quote" eyebrow="Quoting Engine" title="Conversation becomes a contract. Merchants quote against it.">
          <div>
            <SubsectionHeader label="Diagnosis in action" />
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              <PhoneFrame
                src="/assets/meituan-im/screen-07-diagnosis-start.jpg"
                alt="Diagnosis start in chat"
                label="04 · Diagnosis starts"
                caption="Vague problem → structured intent."
                naturalHeight={9090}
              />
              <PhoneFrame
                src="/assets/meituan-im/screen-11-diagnosis-product-rec.jpg"
                alt="Post diagnosis recommendation state"
                label="05 · Product recommendation"
                caption="Recommendations only after confidence."
                naturalHeight={10032}
              />
            </div>
          </div>

          <div className="mt-20 md:mt-28">
            <SubsectionHeader
              label="Competitive quoting"
              hint="Each merchant receives the diagnosis and quotes independently — they never see each other's prices. So what you compare is each merchant's own guide price against the same service order, not a platform-set final number."
            />
            <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
              <PhoneFrame
                src="/assets/meituan-im/screen-02-live-quoting.jpg"
                alt="Live quoting state"
                label="06 · Live quoting"
                naturalHeight={5388}
              />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <h4 className="max-w-md font-display text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">
                  Show progress before price.
                </h4>
                <div className="mt-6 space-y-3.5">
                  <Callout index={1} title="Live updates make waiting legible" />
                  <Callout index={2} title="Trust signals appear before price" />
                  <Callout index={3} title="A guide range, not a locked final" />
                </div>
              </div>
            </div>

            <div className="mt-20 grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
              <PhoneFrame
                src="/assets/meituan-im/screen-10-quote-expired-chat.jpg"
                alt="Quote expired in chat state"
                label="07 · Expired in chat"
                naturalHeight={7113}
              />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <h4 className="max-w-md font-display text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">
                  Reset only what is unsafe to assume.
                </h4>
                <div className="mt-6 space-y-3.5">
                  <Callout index={1} title="Expired quotes stay visible but disabled" />
                  <Callout index={2} title="Only the time slot resets" />
                  <Callout index={3} title="Hard expiry, soft continuity" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-28">
            <SubsectionHeader label="Closing the loop" />
            <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
              <PhoneFrame
                src="/assets/meituan-im/screen-09-return-visit.jpg"
                alt="Return visit and rating state"
                label="08 · Return visit"
                naturalHeight={5457}
              />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <h4 className="max-w-md font-display text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">
                  The trust loop closes where it began.
                </h4>
                <div className="mt-6 space-y-3.5">
                  <Callout index={1} title="Return flow stays in the same thread" />
                  <Callout index={2} title="Re-engagement is one tap" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="merchant" eyebrow="The Other Side" title="Merchants quote against the same order — on equal footing.">
          <FadeIn>
            <p className="max-w-[42rem] text-[16px] leading-[1.7] text-textSecondary">
              Every merchant receives the same structured service order and submits one quote — a fixed price, or a
              strictly-bounded guide range that varies only by parts, never open-ended. Because they never see each
              other&apos;s numbers, they compete on the same brief instead of undercutting. For local repair, an exact
              price usually isn&apos;t knowable until the on-site visit, so a bounded range is the honest unit — not a
              number that breaks at the door.
            </p>
          </FadeIn>
          <FadeIn className="mt-10">
            <ScaledPrototypeFrame
              src="/assets/meituan-im/Repair%20Flow.html#flow=merchant&rail=0"
              title="Merchant quote desk — interactive prototype"
              naturalWidth={1110}
              naturalHeight={820}
              displayMaxWidth={1000}
            />
          </FadeIn>
        </Section>

        <Section id="prototype" eyebrow="Interactive Prototype" title="Try the full flow.">
          <p className="mb-4 max-w-[40rem] text-[14px] leading-relaxed text-textSecondary">
            Switch scenarios from the rail, or tap the suggested replies to play a flow through.
            <span className="text-textSecondary/65"> Re-skinned in English with USD placeholders; shipped in Chinese with RMB.</span>
          </p>
          <div className="mb-10 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/70">
              End-to-end build · interaction design, visual design & code
            </p>
            <a
              href="/work/meituan-im/prototype"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/60 transition-colors hover:text-nltLime-ink"
            >
              Open in new window ↗
            </a>
          </div>
          {/* Custom entrance — the prototype is the case's high point, so it
              gets a bigger, slightly delayed reveal: blur clears, the device
              settles down ~1deg, and a soft amber wash brushes through. */}
          <PrototypeReveal>
            <ScaledPrototypeFrame
              src="/assets/meituan-im/Repair%20Flow.html"
              title="Repair flow — interactive prototype"
              naturalWidth={480}
              naturalHeight={1080}
              displayMaxWidth={480}
            />
          </PrototypeReveal>
        </Section>

        <Section
          id="scenarios"
          eyebrow="Framework Extensions"
          title="The same loop scales: education, banquet, maternity care."
        >
          <FadeIn className="mt-2">
            <p className="max-w-2xl text-[17px] leading-[1.6] tracking-tight text-textPrimary">
              Home repair was the reference build. The same{" "}
              <span className="text-nltLime-ink">Diagnose → Structure → Commit</span> loop maps cleanly onto other
              high-stakes, non-standard services — the substrate changes, the trust mechanics don&apos;t.
            </p>
            <dl className="mt-8 max-w-2xl divide-y divide-black/[0.07] border-t border-black/[0.07]">
              {[
                { d: "Education", t: "Goals & constraints → learning brief → compare plans." },
                { d: "Banquet", t: "Size, date, must-haves → requirement card → venues quote on equal terms." },
                { d: "Maternity care", t: "Need & credentials → care brief → package in trust context." },
              ].map(({ d, t }) => (
                <div key={d} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8">
                  <dt className="w-44 shrink-0 text-[15px] tracking-tight text-textPrimary">{d}</dt>
                  <dd className="text-[14px] leading-relaxed text-textSecondary">{t}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </Section>

        <Section id="impact" eyebrow="Impact & Validation" title="Trust-first won the A/B.">
          {/* Hero metric — +30% diagnostic-channel conversion is the headline. Lime-tinted
              so the primary result reads first; the projected outcomes step down below. */}
          <FadeIn className="border-t border-black/[0.06] pt-12 md:pt-16">
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
              <p className="font-display text-[3.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-nltLime-ink md:text-[5.5rem] lg:text-[8rem]">
                +<CountUp to={30} />
                <span className="text-[0.5em] text-nltLime-ink/70">%</span>
              </p>
              <div className="max-w-md">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">Conversion lift · diagnostic channel</p>
                  <span className="rounded-full border border-nltLime-ink/30 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-nltLime-ink/80">Measured</span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-textSecondary">
                  ~60% of users ask about price before buying, so I routed them through a diagnose → quote → order flow. On that channel, intent→order converted ~1.3× the old path (9%→11.7% on toilet repair, 17%→22% on pipe clearing) — pulling the whole search entry up +0.5pp. User-level randomized A/B.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Supporting metrics — sit below at smaller scale, sharing a hairline
              with the hero number above so they read as "and also". */}
          <FadeIn delay={0.1} className="mt-14 grid gap-10 border-t border-black/[0.06] pt-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-display text-[2rem] font-light leading-[0.95] tracking-[-0.01em] tabular-nums text-textPrimary md:text-[3.25rem]">
                ~<CountUp to={2000} format={(n) => Math.round(n / 1000).toString() + "k"} />
              </p>
              <div className="mt-3 flex items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/80">Additional daily orders</p>
                <span className="rounded-full border border-black/15 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-textSecondary/70">Projected</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-textSecondary">Incremental volume modeled for wider rollout.</p>
            </div>
            <div>
              <p className="font-display text-[2rem] font-light leading-[0.95] tracking-[-0.01em] tabular-nums text-textPrimary md:text-[3.25rem]">
                −<CountUp to={50} />
                <span className="text-[0.55em] text-textPrimary/70">%</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/80">Pricing disputes</p>
                <span className="rounded-full border border-black/15 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-textSecondary/70">Projected</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-textSecondary">Modeled reduction in post-service complaints for this flow.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-10 max-w-2xl text-[13.5px] leading-relaxed text-textSecondary/80">
              The flow is a floating window triggered on search, so every searcher in the piloted categories was in the sample. We piloted two repair categories — toilet repair and pipe clearing — in Hangzhou and select Zhejiang cities, bounded by where our certified-expert supply was. The conversion figures are real June–August numbers from a user-level randomized A/B; the daily-orders and disputes figures above are modeled forward from them for a wider rollout.
            </p>
          </FadeIn>
        </Section>

        <Section id="reflection" eyebrow="Reflection" title="Next time, I would push on four fronts.">
          <div className="space-y-5 md:space-y-6">
            <FadeIn>
              <p className="text-[16px] tracking-tight text-textPrimary">Merchant experience deserves its own product pass.</p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <p className="text-[16px] tracking-tight text-textPrimary">Guide pricing should explain variability, not imply a promise.</p>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="text-[16px] tracking-tight text-textPrimary">Scale with AI triage, escalate to human experts.</p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <p className="text-[16px] tracking-tight text-textPrimary">When a diagnosis is wrong, make cost ownership explicit — who pays, who re-dispatches — so trust holds on the unhappy path, not just the happy one.</p>
            </FadeIn>
          </div>

          <FadeIn className="mt-20 md:mt-28">
            <div className="relative">
              <span aria-hidden className="absolute -left-2 -top-6 font-display text-[7rem] font-light leading-none text-nltLime-ink/15 md:text-[9rem]">
                &ldquo;
              </span>
              <p className="relative max-w-4xl font-display text-[1.75rem] font-light leading-[1.25] tracking-tight text-textPrimary md:text-[2.5rem] md:leading-[1.18]">
                Transparent <span className="text-nltLime-ink">process</span> is often a stronger trust advantage than transparent <span className="line-through decoration-textSecondary/40">pricing</span> alone.
              </p>
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/70">
                Designing trust before the bill · 2025
              </p>
            </div>
          </FadeIn>
        </Section>
          </main>
        </article>
      </div>
      <Footer />
    </>
  );
}
