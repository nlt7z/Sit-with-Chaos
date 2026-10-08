"use client";

import { Footer } from "@/components/Footer";
import { SideRail } from "@/components/bento/SideRail";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Action } from "@/components/Action";
import { CaseHero } from "@/components/CaseHero";
import { Reveal } from "@/components/Reveal";
import { CaseStudyToc } from "@/components/SectionRail";

// useLayoutEffect warns during SSR in React 18; both run pre-paint on the client.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;


const navItems = [
  { id: "overview", label: "Overview" },
  { id: "turning-point", label: "Context" },
  { id: "options", label: "Options" },
  { id: "solution", label: "System" },
  { id: "quote", label: "Quote" },
  { id: "merchant", label: "Merchant" },
  { id: "selfserve", label: "Reverse Trust" },
  { id: "us-rebuild", label: "US Rebuild" },
  { id: "impact", label: "Impact" },
  { id: "reflection", label: "Risk & Next" },
] as const;

// the site's shared scroll reveal (lib/motion); the prototype is this page's
// one emphasis moment
const FadeIn = Reveal;

function PrototypeReveal({ children }: { children: React.ReactNode }) {
  return <Reveal emphasis>{children}</Reveal>;
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
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-black/[0.06] py-14 md:py-28 lg:py-36">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">{eyebrow}</p>
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
  fitViewport,
  clip,
}: {
  src: string;
  title: string;
  naturalWidth?: number;
  naturalHeight?: number;
  displayMaxWidth?: number;
  // When set, cap the scale so the frame's height never exceeds this fraction
  // of the viewport height — the whole prototype stays within one screen
  // instead of overflowing and forcing a page scroll.
  fitViewport?: number;
  /** Show only this box of the canvas (natural px), e.g. the phone bezel, so
   *  the canvas's white margin never shows on a dark band. */
  clip?: { x: number; y: number; w: number; h: number; r: number };
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const boxW = clip ? clip.w : naturalWidth;
  const boxH = clip ? clip.h : naturalHeight;
  const [scale, setScale] = useState(1);
  const effectiveMax = displayMaxWidth ?? naturalWidth;

  useIsomorphicLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      let s = Math.min(1, w / boxW);
      if (fitViewport && typeof window !== "undefined") {
        s = Math.min(s, (window.innerHeight * fitViewport) / boxH);
      }
      setScale(s);
    };
    apply();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(apply);
      ro.observe(el);
    }
    if (typeof window !== "undefined") window.addEventListener("resize", apply);
    return () => {
      ro?.disconnect();
      if (typeof window !== "undefined") window.removeEventListener("resize", apply);
    };
  }, [boxW, boxH, fitViewport]);

  return (
    // measureRef reports the column width (bounded by effectiveMax); the inner
    // box takes the scaled size and is centered — so when the scale is capped by
    // viewport height, the narrower frame still sits centered in the column.
    <div ref={measureRef} className="mx-auto w-full" style={{ maxWidth: effectiveMax }}>
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: boxW * scale, height: boxH * scale, borderRadius: clip ? clip.r * scale : undefined }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          style={{
            width: naturalWidth,
            height: naturalHeight,
            border: 0,
            left: clip ? -clip.x * scale : 0,
            top: clip ? -clip.y * scale : 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="absolute block"
        />
      </div>
    </div>
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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/85">{label}</p>
        {isLong ? (
          <Action href={src} variant="label">
            View full
          </Action>
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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/85">{label}</p>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">
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
            title={`${label}: live interactive flow`}
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
      <span className="mt-[2px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#FFD100] bg-[#FFF7CC] font-mono text-[11px] tabular-nums text-[#8A6A00]">
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

function SubsectionHeader({ label, hint }: { label?: string; hint?: string }) {
  // Only the section eyebrow carries the mono-caps micro-label now; a hint on
  // its own reads as a plain lead paragraph.
  if (!label) {
    return hint ? (
      <p className="mb-8 max-w-lg text-[16px] leading-relaxed text-textSecondary sm:mb-10">{hint}</p>
    ) : null;
  }
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/85">{label}</p>
      {hint ? <p className="max-w-lg text-[16px] leading-relaxed text-textSecondary">{hint}</p> : null}
    </div>
  );
}

export default function MeituanImCaseStudyPage() {

  return (
    <>
      <SideRail active="work" tone="auto" />
      <div className="relative min-h-screen bg-white">
        <CaseStudyToc items={navItems} />
        <CaseHero
          logo="/assets/work/logos/meituan.png"
          company="Meituan"
          kicker="Local Services · IM Consultation"
          title="Rebuilding the Black Box"
          lead={
            <>
              From &ldquo;price transparency&rdquo; to{" "}
              <span className="rounded-[3px] bg-[#FFD100] px-1 text-[#3D2E00]">&ldquo;trusted diagnosis&rdquo;</span>{" "}
              in local home services.
            </>
          }
          intro={
            <p>
              A 0-to-1 in-chat quotation system for Meituan, a super-app (Uber, Yelp and
              TaskRabbit in one) with 770M+ users and 14.5M merchants. Two goals. For users:
              make high-stakes services feel less uncertain and less stressful. For the
              platform: standardize the conversation, cut friction, and lift order conversion.
            </p>
          }
          aside={
            // the live prototype, clipped to the phone, so the hero opens on
            // the real product
            <div className="flex flex-col items-start">
              <ScaledPrototypeFrame
                src="/assets/meituan-im/Revised%20Repair%20Flow.html#flow=default&rail=0"
                title="Repair flow, live prototype"
                naturalWidth={480}
                naturalHeight={1000}
                displayMaxWidth={340}
                fitViewport={0.7}
                clip={{ x: 24, y: 70, w: 432, h: 924, r: 56 }}
              />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
                Live prototype · tap the suggested replies
              </p>
            </div>
          }
          actions={
            <>
              <Action href="/work/meituan-im/deck-story-en" tone="dark">View Presentation Deck</Action>
              <Action href="/work/meituan-im/prototype" variant="secondary" tone="dark" newTab>
                Try Prototype
              </Action>
            </>
          }
        >
          {/* the headline metric */}
          <p className="font-display text-[2.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-white md:text-[3.75rem]">
            +30<span className="text-[0.5em] text-white/70">%</span>
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-[1.55] text-white/65">
            Intent→order conversion in the new channel, about 1.3× the old path. It also lifted overall search conversion <span className="text-white">+0.5pp</span>.
          </p>
        </CaseHero>
        <article className="relative z-[1] mx-auto max-w-content bg-white px-6 pb-24 pt-4 text-left md:px-[84px] md:pb-56 lg:pb-80">
          <main className="relative min-h-screen [&>section:first-of-type]:border-t-0">

        <Section id="turning-point" eyebrow="Context · Signal" title="The brief asked for price visibility. The evidence pointed deeper.">
          <FadeIn>
            <figure className="relative max-w-3xl">
              <span aria-hidden className="absolute -left-2 -top-7 font-display text-[6rem] font-light leading-none text-[#FFD100]/30 md:text-[8rem]">
                &ldquo;
              </span>
              <blockquote className="relative font-display text-[1.5rem] font-light leading-[1.3] tracking-tight text-textPrimary md:text-[1.9rem] md:leading-[1.28]">
                My drain was clogged. I spent 30 minutes and asked 10 shops. None would give a
                certain price. They all said &ldquo;we have to see it first&rdquo;. And once the guy
                shows up, the price only goes up.
              </blockquote>
              <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">
                A pattern we heard again and again in user research
              </figcaption>
            </figure>
          </FadeIn>

          <FadeIn className="mt-12">
            <p className="max-w-3xl text-[18px] leading-[1.55] tracking-tight text-textPrimary">
              Users chat before they book, and that is exactly where trust breaks: the diagnosis
              happens after the visit, but the rules force users to decide before it. We shipped a
              standalone quote page first. Conversion did not move. A price without a diagnosis is
              just a claim: users did not believe it, and merchants did not maintain it. That failure
              was the insight: price was not a <span className="text-textSecondary line-through decoration-textSecondary/40">number</span> problem. It was a <span className="rounded-[3px] bg-[#FFD100] px-1 text-[#3D2E00]">process-trust</span> problem, built in the conversation.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <figure className="max-w-3xl">
              <blockquote className="text-[16px] leading-[1.7] text-textPrimary/90">
                &ldquo;The page said $50. On site he added $200 for a &lsquo;special case&rsquo;. A
                total rip-off!&rdquo;
              </blockquote>
              <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">
                A real user review behind the PRD · reviews like this were everywhere
              </figcaption>
            </figure>
          </FadeIn>

          <FadeIn className="mt-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              {/* BEFORE — old workflow, muted */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Before · Today&apos;s linear journey</p>
                </div>
                <ol className="flex-1 divide-y divide-black/[0.06]">
                  {[
                    "A problem happens",
                    "A wall of merchants appears",
                    "Repeat the story to each one",
                    "Pick one, half at random",
                  ].map((t, i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-textSecondary/60">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary/85">{t}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-[13px] leading-relaxed text-textSecondary">
                  → Trust breaks. Quote ≠ final bill: it ends in a surprise bill and a bad review.
                </p>
              </div>

              {/* AFTER — redesigned, warm accent */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A6A00]">After · Five steps, diagnosis moves into the chat</p>
                </div>
                <ol className="flex-1 divide-y divide-black/[0.06]">
                  {[
                    "User starts a chat",
                    "Platform diagnoses first",
                    "A structured repair order",
                    "Merchants bid in real time",
                    "One tap to book",
                  ].map((t, i) => (
                    <li key={i} className="py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-[#8A6A00]">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary">{t}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section id="options" eyebrow="Options We Weighed" title="Two directions got killed before the one that shipped.">
          <FadeIn>
            <div className="max-w-3xl divide-y divide-black/[0.06]">
              <div className="pb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Option A · A priced diagnosis visit</p>
                <p className="mt-3 text-[15.5px] leading-[1.7] tracking-tight text-textPrimary">
                  The user pays a visit fee. A pro comes, diagnoses, then they decide whether to repair.
                </p>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-textSecondary">
                  Why it failed: competitors already do this, and users still do not trust the
                  verdict; the shop has every reason to make it sound worse. A visit is a heavy
                  commitment, and if you do not repair, you start all over.
                </p>
              </div>
              <div className="pt-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Option B · Protect the user&apos;s exit</p>
                <p className="mt-3 text-[15.5px] leading-[1.7] tracking-tight text-textPrimary">
                  The user can cancel any time after the visit. Every add-on charge needs online approval.
                </p>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-textSecondary">
                  Why it failed: the platform eats the visit cost. Too expensive, and bad for merchants.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn className="mt-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A6A00]">Option C · What we built</p>
            <p className="mt-4 max-w-3xl text-[19px] leading-[1.55] tracking-tight text-textPrimary">
              Keep the chat habit. Move the on-site diagnosis up front, as a platform-level{" "}
              <span className="rounded-[3px] bg-[#FFD100] px-1 text-[#3D2E00]">standard diagnosis</span>. One
              order, many quotes.
            </p>
            <p className="mt-5 max-w-3xl text-[15px] leading-[1.7] text-textSecondary">
              The key call: the problem lives at the diagnosis step. If the diagnosis is not
              standardized, nothing downstream can patch it.
            </p>
          </FadeIn>
        </Section>

        <Section id="solution" eyebrow="System Design" title="One end-to-end flow. Trust compounds across every stage.">
          <FadeIn className="mt-2">
            <div className="overflow-hidden rounded-[14px] ring-1 ring-black/[0.06]">
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
              hint="How a quote request becomes a booking, a visit, and a paid order, across platform, user and merchant."
            />
            <FadeIn>
              <div className="overflow-hidden rounded-[14px] ring-1 ring-black/[0.06]">
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
              <Action href="/assets/meituan-im/quote-to-service-flow-en.html" variant="label">
                Open full diagram
              </Action>
            </p>
          </div>

          {/* The system, playable — the full prototype sits with the system design
              instead of at the end, so the flow above can be tried immediately. */}
          <div className="mt-16 md:mt-24">
            <SubsectionHeader
              hint="The whole system is playable. Switch scenarios from the rail, or tap the suggested replies to play a flow through. Re-skinned in English with USD placeholders; shipped in Chinese with RMB."
            />
            <div className="mb-10 flex items-center justify-end">
              <Action href="/work/meituan-im/prototype" variant="label" newTab>
                Open in new window
              </Action>
            </div>
            <PrototypeReveal>
              <ScaledPrototypeFrame
                src="/assets/meituan-im/Revised%20Repair%20Flow.html"
                title="Repair flow: interactive prototype"
                naturalWidth={480}
                naturalHeight={1080}
                displayMaxWidth={480}
                fitViewport={0.82}
              />
            </PrototypeReveal>
          </div>
        </Section>

        <Section id="quote" eyebrow="Quoting Engine" title="Conversation becomes a contract. Merchants quote against it.">
          <div>
            <SubsectionHeader
              hint="No more repeating yourself to 10 shops. A local human expert diagnoses in the chat, from photos and video, in about 5 minutes. It costs more to run, and it is worth it: it builds a trust moat."
            />
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              <PhoneFrame
                src="/assets/meituan-im/screen-07-diagnosis-start.jpg"
                alt="Diagnosis start in chat"
                label="01 · Diagnose first, one standard"
                caption="The platform owns the ask-and-diagnose step."
                naturalHeight={9090}
              />
              <PhoneFrame
                src="/assets/meituan-im/screen-11-diagnosis-product-rec.jpg"
                alt="Structured repair order after diagnosis"
                label="02 · A structured repair order"
                caption="“My toilet keeps hissing” becomes a standardized repair order."
                naturalHeight={10032}
              />
            </div>
          </div>

          <div className="mt-20 md:mt-28">
            <SubsectionHeader
              hint="Within 3 minutes: 5 nearby shops, one order. Merchants quote a fixed price or a hard-capped range, like $80-$120. You compare price and speed on one standard."
            />
            <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
              <PhoneFrame
                src="/assets/meituan-im/screen-02-live-quoting.jpg"
                alt="Live quoting state"
                label="03 · Live quotes, one standard"
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
                label="04 · Expired in chat"
                naturalHeight={7113}
              />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <h4 className="max-w-md font-display text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">
                  &ldquo;Visible but not clickable.&rdquo;
                </h4>
                <div className="mt-6 space-y-3.5">
                  <Callout index={1} title="Expired prices lock hard, never reach the bill" />
                  <Callout index={2} title="Diagnosis and context stay; only the time slot resets" />
                  <Callout index={3} title="Hard expiry, soft continuity" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-28">
            <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
              <PhoneFrame
                src="/assets/meituan-im/screen-09-return-visit.jpg"
                alt="Return visit and rating state"
                label="05 · Return visit"
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

        <Section id="merchant" eyebrow="The Other Side" title="Merchants quote against the same order, on equal footing.">
          <FadeIn>
            <p className="max-w-[42rem] text-[16px] leading-[1.7] text-textSecondary">
              Every merchant gets the same order and submits one quote: a fixed price or a bounded
              range. They can&apos;t see each other&apos;s numbers, so they compete on the brief, not on
              undercutting. For repair, the real price is unknown until the visit, so a range is
              the honest unit. Merchants save time too: the expert diagnosis and the user&apos;s
              materials arrive together, so there is no idle chat, straight to the point.
            </p>
          </FadeIn>
          <FadeIn className="mt-10">
            <ScaledPrototypeFrame
              src="/assets/meituan-im/Revised%20Repair%20Flow.html#flow=merchant&rail=0"
              title="Merchant quote desk: interactive prototype"
              naturalWidth={1110}
              naturalHeight={820}
              displayMaxWidth={1000}
            />
          </FadeIn>
        </Section>

        <Section id="selfserve" eyebrow="Reverse Trust" title="Pushing small orders away earns the longest-lasting trust.">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-16">
            <FadeIn>
              <p className="max-w-[38rem] text-[16px] leading-[1.7] text-textSecondary">
                If the diagnosis finds a tiny, fixable problem (like a worn washer), the system
                skips quoting and recommends a standard part and a how-to video: you can do this
                yourself. The order walks away; the user comes back for the next one.
              </p>
            </FadeIn>
            <FadeIn>
              <figure>
                <ScaledPrototypeFrame
                  src="/assets/meituan-im/Revised%20Repair%20Flow.html#flow=cat-litter&rail=0&seek=1"
                  title="Self-serve path: live prototype"
                  naturalWidth={480}
                  naturalHeight={1000}
                  displayMaxWidth={360}
                />
                <figcaption className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">
                  Live prototype · self-serve path
                </figcaption>
              </figure>
            </FadeIn>
          </div>
        </Section>

        <Section id="us-rebuild" eyebrow="Design System · Rebuilt for the US" title="Rebuilt in English, with Claude Code and Claude Design.">
          <FadeIn>
            <p className="max-w-[42rem] text-[16px] leading-[1.7] text-textSecondary">
              To test this &ldquo;trust conversation&rdquo; in high-labor-cost markets (think
              TaskRabbit / Thumbtack), I rebuilt the Meituan-based design for US users. Expert
              diagnosis is too expensive there, so it becomes AI diagnosis.
            </p>
          </FadeIn>

          <FadeIn className="mt-12">
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              <figure>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Early version · Live</p>
                <ScaledPrototypeFrame
                  src="/assets/meituan-im/interaction-flow-phone.html#flow=default&rail=0"
                  title="Early prototype version"
                  naturalWidth={480}
                  naturalHeight={1010}
                  displayMaxWidth={340}
                />
              </figure>
              <figure>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Repair Flow v1 · Live</p>
                <ScaledPrototypeFrame
                  src="/assets/meituan-im/Repair%20Flow.html#flow=default&rail=0&seek=1"
                  title="Repair Flow v1"
                  naturalWidth={480}
                  naturalHeight={1000}
                  displayMaxWidth={340}
                />
              </figure>
            </div>
          </FadeIn>

          <div className="mt-20 md:mt-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:gap-16">
              <FadeIn>
                <h4 className="max-w-md font-display text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">
                  Planning ahead: an AI agent replaces the human expert.
                </h4>
                <p className="mt-5 max-w-[36rem] text-[15px] leading-[1.7] text-textSecondary">
                  In the US rebuild the first responder is an AI agent, not a human expert. It
                  answers at 2 AM, reads photos and video, states its confidence, and drafts the
                  same structured order. A human pro stays one tap away, and the quoting loop after
                  it stays the same.
                </p>
              </FadeIn>
              <FadeIn>
                <figure>
                  <ScaledPrototypeFrame
                    src="/assets/meituan-im/Revised%20Repair%20Flow.html#flow=ai-agent&rail=0&seek=1"
                    title="AI-agent workflow: live prototype"
                    naturalWidth={480}
                    naturalHeight={1000}
                    displayMaxWidth={360}
                  />
                  <figcaption className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">
                    Current version · AI-agent workflow · Live
                  </figcaption>
                </figure>
              </FadeIn>
            </div>
          </div>

          <FadeIn className="mt-16 md:mt-20">
            <div className="grid max-w-3xl gap-10 sm:grid-cols-3">
              <div>
                <p className="font-display text-[1.75rem] font-light leading-none tracking-tight tabular-nums text-textPrimary">44×44<span className="text-[0.55em] text-textPrimary/70">pt</span></p>
                <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/80">Minimum touch target</p>
              </div>
              <div>
                <p className="font-display text-[1.75rem] font-light leading-none tracking-tight tabular-nums text-textPrimary">≥12<span className="text-[0.55em] text-textPrimary/70">px</span></p>
                <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/80">Minimum type size</p>
              </div>
              <div>
                <p className="font-display text-[1.75rem] font-light leading-none tracking-tight tabular-nums text-textPrimary">MM/DD</p>
                <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/80">US formats · imperial · native copy</p>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section
          id="scenarios"
          eyebrow="Framework Extensions"
          title="The same loop scales: maternity care, banquets, and beyond."
        >
          <FadeIn className="mt-2">
            <p className="max-w-2xl text-[17px] leading-[1.6] tracking-tight text-textPrimary">
              Home repair was the first build. The conversation cards are now shared components,
              and the same{" "}
              <span className="rounded-[3px] bg-[#FFD100] px-1 text-[#3D2E00]">Diagnose → Structure → Commit</span> loop fits other
              high-stakes, non-standard services. The service changes; the trust mechanics don&apos;t.
            </p>
            <div className="mt-8 flex max-w-2xl flex-wrap gap-x-8 gap-y-3 border-t border-black/[0.07] pt-6">
              {["Maternity care", "Banquets"].map((d) => (
                <span key={d} className="text-[15px] tracking-tight text-textPrimary">{d}</span>
              ))}
            </div>
          </FadeIn>
        </Section>

        <Section id="impact" eyebrow="Impact & Validation" title="Trust-first won the A/B.">
          {/* Hero metric — +30% diagnostic-channel conversion is the headline. Lime-tinted
              so the primary result reads first; the projected outcomes step down below. */}
          <FadeIn className="border-t border-black/[0.06] pt-12 md:pt-16">
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
              <p className="font-display text-[3.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[5.5rem] lg:text-[8rem]">
                <span className="rounded-xl bg-[#FFD100] px-3 pb-1 text-[#1A1400]">
                  +<CountUp to={30} />
                  <span className="text-[0.5em] text-[#1A1400]/70">%</span>
                </span>
              </p>
              <div className="max-w-md">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#8A6A00]">Conversion lift · diagnostic channel</p>
                  <span className="rounded-full border border-[#8A6A00]/40 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-[#8A6A00]">Measured</span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-textSecondary">
                  ~60% of users ask about price before buying. In the new flow, intent→order converted about 1.3× the old path (9%→11.7% toilet repair, 17%→22% pipe clearing).
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
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/80">Additional daily orders</p>
                <span className="rounded-full border border-black/15 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-textSecondary/70">Projected</span>
              </div>
            </div>
            <div>
              <p className="font-display text-[2rem] font-light leading-[0.95] tracking-[-0.01em] tabular-nums text-textPrimary md:text-[3.25rem]">
                −<CountUp to={50} />
                <span className="text-[0.55em] text-textPrimary/70">%</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/80">Pricing disputes</p>
                <span className="rounded-full border border-black/15 px-1.5 py-[1px] font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-textSecondary/70">Projected</span>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-10 max-w-2xl text-[13.5px] leading-relaxed text-textSecondary/80">
              Piloted on two repair categories in Hangzhou and nearby cities, July to August, in a
              user-level randomized A/B. The test group saw the expert-diagnosis, one-order-many-quotes
              popup right after searching a keyword. The conversion lift is measured; daily orders and
              disputes are modeled for wider rollout.
            </p>
          </FadeIn>
        </Section>

        <Section id="reflection" eyebrow="Risk & Next" title="Users shouldn't compare price. They should compare price divided by trust.">
          <FadeIn>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">The mechanism&apos;s adverse selection</p>
            <p className="mt-4 max-w-3xl text-[16px] leading-[1.7] tracking-tight text-textPrimary">
              Left alone, this mechanism systematically selects three kinds of merchants: the
              desperate, the bad estimators, and the lowball-then-upsell players. Lowballing is
              the dominant strategy unless breaking your quote costs more than it earns. So every
              quote carries a <span className="rounded-[3px] bg-[#FFD100] px-1 text-[#3D2E00]">fulfilment score</span>: how
              often this shop&apos;s final bill lands inside its quote. And complaints skip the
              haggling: the price gap is refunded first, instantly.
            </p>
          </FadeIn>

          <FadeIn className="mt-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/75">Next · Multimodal AI diagnosis</p>
            <p className="mt-4 max-w-3xl text-[16px] leading-[1.7] text-textSecondary">
              The platform holds a huge corpus of real consultations and real fulfilment records,
              training data no one else has. To break the expert bottleneck, the next step is a
              multimodal AI assistant trained on the early human-diagnosis dataset: photos, text,
              repair orders, and what was actually done, replaced, and charged.
            </p>
          </FadeIn>

          <FadeIn className="mt-20 md:mt-28">
            <div className="relative">
              <span aria-hidden className="absolute -left-2 -top-6 font-display text-[7rem] font-light leading-none text-[#FFD100]/30 md:text-[9rem]">
                &ldquo;
              </span>
              <p className="relative max-w-4xl font-display text-[1.75rem] font-light leading-[1.25] tracking-tight text-textPrimary md:text-[2.5rem] md:leading-[1.18]">
                Rebuilding the black box: from &ldquo;price transparency&rdquo; to{" "}
                <span className="rounded-[3px] bg-[#FFD100] px-1.5 text-[#3D2E00]">&ldquo;trusted diagnosis&rdquo;</span>.
              </p>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">
                Meituan local services · 2025
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
