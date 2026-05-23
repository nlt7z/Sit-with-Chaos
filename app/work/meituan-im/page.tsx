"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const easePremium = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Context" },
  { id: "turning-point", label: "Turn" },
  { id: "solution", label: "System" },
  { id: "chat", label: "Chat" },
  { id: "quote", label: "Quote" },
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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/70">On this page</p>
        <ul className="mt-6 space-y-0.5">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(id);
                }}
                className={`block border-l-[1.5px] py-2 pl-5 text-[13px] leading-snug transition-all duration-500 ease-portfolio ${
                  active === id
                    ? "border-[#C47040] font-medium text-textPrimary"
                    : "border-transparent text-textSecondary/90 hover:border-black/[0.12] hover:text-textPrimary"
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
    <section id={id} className="scroll-mt-28 border-t border-black/[0.06] py-28 md:py-36 lg:py-40">
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
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70 transition-colors hover:text-[#C47040]"
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
      <span className="mt-[2px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C47040]/30 bg-[#FFF8F4] font-mono text-[11px] tabular-nums text-[#8A4B2A]">
        {index.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug tracking-tight text-textPrimary">{title}</p>
        {body ? <p className="mt-1.5 text-[14px] leading-relaxed text-textSecondary">{body}</p> : null}
      </div>
    </div>
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
        <article className="relative z-[1] mx-auto max-w-content bg-white px-6 pb-56 pt-32 text-left md:px-12 md:pb-72 md:pt-40 lg:pl-36 lg:pr-14 lg:pb-80 lg:pt-44">
          <main className="relative min-h-screen">
            <header id="overview" className="scroll-mt-28 pb-24 md:pb-32">
              <motion.div variants={heroVariants} initial="hidden" animate="show">
                <motion.p variants={heroItem} className="font-mono text-[11px] uppercase tracking-[0.24em] text-textSecondary/85">
                  Meituan · Local Services · IM Consultation
                </motion.p>
                <motion.h1
                  variants={heroItem}
                  className="mt-8 max-w-[18ch] font-display text-[2.65rem] font-light leading-[1.03] tracking-tight text-textPrimary sm:max-w-4xl md:text-[4rem] md:leading-[1.02]"
                >
                  Designing Trust Before the Bill
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="mt-6 max-w-xl text-[16px] leading-[1.6] text-textSecondary"
                >
                  Turning uncertain local-service pricing into a guided, comparable, bookable decision.
                </motion.p>

                <motion.div
                  variants={heroItem}
                  className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-20"
                  aria-label="Project summary"
                >
                  {/* Left — meta + hero metric */}
                  <div className="space-y-12">
                    {/* Hero metric */}
                    <div>
                      <p className="font-display text-[4.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[6rem] lg:text-[6.5rem]">
                        +5<span className="text-[0.5em] text-textPrimary/70">%</span>
                      </p>
                      <p className="mt-4 max-w-md text-[15px] leading-[1.55] text-textSecondary">
                        Conversion lift · ~2k extra daily orders · −50% disputes.
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-6 border-t border-black/[0.08] pt-8 sm:gap-10">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/75">Role</p>
                        <p className="mt-3 text-[15px] tracking-tight text-textPrimary">Product Design</p>
                        <p className="mt-1 text-[14px] leading-snug text-textSecondary">End-to-end ownership</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/75">Context</p>
                        <p className="mt-3 text-[15px] tracking-tight text-textPrimary">Meituan super app</p>
                        <p className="mt-1 text-[14px] leading-snug text-textSecondary">Local services</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/75">Timeline</p>
                        <p className="mt-3 text-[15px] tracking-tight text-textPrimary">4 weeks</p>
                        <p className="mt-1 text-[14px] leading-snug text-textSecondary">Shipped</p>
                      </div>
                    </div>
                  </div>

                  {/* Right — live prototype (FixIt Express · Saffron).
                      The HTML renders its own Cosmic Orange titanium bezel + scenario rail,
                      so we don't wrap it in another device frame. Scaled to fit the column. */}
                  <div className="hidden lg:flex lg:flex-col lg:items-start">
                    <div
                      className="relative overflow-hidden"
                      style={{ width: 340, height: 800 }}
                    >
                      <iframe
                        src="/assets/meituan-im/interaction-flow-phone.html"
                        title="FixIt Express · Saffron — interactive prototype"
                        style={{
                          width: 500,
                          height: 1176,
                          border: 0,
                          display: "block",
                          transform: "scale(0.68)",
                          transformOrigin: "top left",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#C47040]" />
                      Live prototype · interact above
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </header>

        <Section id="problem" eyebrow="Context & Signal" title="Users wanted to ask first, but the platform was not earning trust.">
          <FadeIn className="my-2 py-6 md:py-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">User behavior signal</p>
            <p className="mt-5 max-w-3xl text-[16px] leading-[1.6] text-textPrimary/85">
              Users visit <span className="text-textPrimary">10 merchants</span>, consult{" "}
              <span className="text-textPrimary">6</span>, spend <span className="text-textPrimary">30 minutes</span> comparing — and still don&apos;t trust the price.
            </p>
          </FadeIn>

          <FadeIn className="grid gap-8 border-t border-black/[0.06] pt-8 md:grid-cols-3 md:gap-8">
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Behavior</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">Consult outranked book and call.</p>
            </div>
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Conversion</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">In-app consult stayed low.</p>
            </div>
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Experience</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">Disputes clustered in home repair.</p>
            </div>
          </FadeIn>
        </Section>

        <Section id="turning-point" eyebrow="Turning Point" title="The brief asked for price visibility. The evidence pointed deeper.">
          <FadeIn>
            <p className="text-[18px] leading-[1.55] tracking-tight text-textPrimary">
              Price was not a number problem. It was a <span className="text-[#C47040]">process trust</span> problem.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              {/* BEFORE — old workflow, muted */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">Before · 4-step linear journey</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/55">grayscale</p>
                </div>
                <ol className="flex-1 space-y-px overflow-hidden rounded-lg bg-black/[0.04]">
                  {[
                    ["Problem occurs", "User finds an issue like toilet repair and opens Meituan to search."],
                    ["Many merchants appear", "User sees options but cannot tell who can diagnose accurately."],
                    ["One-by-one outreach", "Repeats the same questions across shops; waits in fragmented threads."],
                    ["Pick one for visit", "Merchants only promise an arrival fee; final quote deferred to on-site."],
                  ].map(([t, b], i) => (
                    <li key={i} className="bg-white px-5 py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-textSecondary/60">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary/85">{t}</p>
                      </div>
                      <p className="mt-1.5 pl-[26px] text-[13.5px] leading-relaxed text-textSecondary">{b}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 rounded-md border border-[#C47040]/30 bg-[#FFF8F4] px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A4B2A]">→ Trust break</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#7A4330]">
                    Quoted price ≠ actual bill. Scope, materials, and conditions widen the range. Users feel the system did not warn them.
                  </p>
                </div>
              </div>

              {/* AFTER — redesigned, warm accent */}
              <div className="flex flex-col">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#C47040]">After · 3-step trust loop</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/55">redesigned</p>
                </div>
                <ol className="flex-1 space-y-px overflow-hidden rounded-lg bg-[#C47040]/[0.08]">
                  {[
                    ["Diagnose the problem", "Certified experts surface from search to define the issue — remove ambiguity before comparison."],
                    ["Structure the intent", "Multi-turn chat yields a service-order card so quotes compare on equal terms."],
                    ["Compare and commit", "Vetted merchants quote live; the chosen price threads into checkout, locked."],
                  ].map(([t, b], i) => (
                    <li key={i} className="bg-white px-5 py-4">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] tabular-nums text-[#C47040]">0{i + 1}</span>
                        <p className="text-[15px] tracking-tight text-textPrimary">{t}</p>
                      </div>
                      <p className="mt-1.5 pl-[26px] text-[13.5px] leading-relaxed text-textSecondary">{b}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 rounded-md border border-emerald-700/20 bg-emerald-50/60 px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-800/80">→ Trust restored</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-emerald-900/75">
                    Price is the output of a credible process. Range is explained by structured intent — what the user agreed to is what they pay.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          <p className="mt-2 max-w-3xl font-display text-[1.6rem] italic leading-[1.35] tracking-tight text-textPrimary">
            How do we guide users through a credible path to a price they can trust before they commit?
          </p>
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
        </Section>

        <Section id="chat" eyebrow="IM Experience" title="Three entry states, one interaction model.">
          <div className="mt-4">
            <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              <PhoneFrame
                src="/assets/meituan-im/screen-04-entry-generic.jpg"
                alt="Generic search entry screen"
                label="01 · Generic intent"
                caption="Symptom chips compress triage."
                naturalHeight={4872}
              />
              <PhoneFrame
                src="/assets/meituan-im/screen-05-entry-specific.jpg"
                alt="Specific search entry screen"
                label="02 · Specific intent"
                caption="Trust card frames expert identity."
                naturalHeight={4872}
              />
              <PhoneFrame
                src="/assets/meituan-im/screen-03-offhours-state.jpg"
                alt="Off-hours edge case screen"
                label="03 · Off-hours edge case"
                caption="Status stays explicit."
                naturalHeight={4872}
              />
            </div>

          </div>
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
            <SubsectionHeader label="Competitive quoting" />
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
                <div className="mt-6 space-y-3.5 border-l border-black/[0.06] pl-6">
                  <Callout index={1} title="Live updates make waiting legible" />
                  <Callout index={2} title="Trust signals appear before price" />
                  <Callout index={3} title="Range, not a single number" />
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
                <div className="mt-6 space-y-3.5 border-l border-black/[0.06] pl-6">
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
                <div className="mt-6 space-y-3.5 border-l border-black/[0.06] pl-6">
                  <Callout index={1} title="Return flow stays in the same thread" />
                  <Callout index={2} title="Re-engagement is one tap" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="prototype" eyebrow="Interactive Prototype" title="Try the full flow.">
          <FadeIn className="mt-2">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
              <iframe
                src="/assets/meituan-im/interaction-flow.html"
                title="FixIt Express interactive consultation flow"
                className="h-[640px] w-full border-0 sm:h-[720px] md:h-[780px]"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </Section>

        <Section
          id="scenarios"
          eyebrow="Framework Extensions"
          title="The same loop scales: education, banquet, maternity care."
        >
          <FadeIn className="mt-2">
            {/* Desktop / tablet — 4-column matrix */}
            <div className="hidden overflow-hidden rounded-2xl border border-black/[0.08] sm:block">
              <div className="grid grid-cols-[1.1fr_1fr_1fr_1.05fr] bg-black/[0.025] text-[12px]">
                <div className="border-r border-black/[0.06] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/75">
                  Domain
                </div>
                <div className="border-r border-black/[0.06] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C47040]">
                  01 · Diagnose
                </div>
                <div className="border-r border-black/[0.06] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C47040]">
                  02 · Structure
                </div>
                <div className="px-5 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C47040]">
                  03 · Commit
                </div>
              </div>

              <div className="grid grid-cols-[1.1fr_1fr_1fr_1.05fr] border-t border-black/[0.06] bg-[#FFF8F4]/40">
                <div className="border-r border-black/[0.06] px-5 py-5">
                  <p className="text-[15px] tracking-tight text-[#8A4B2A]">Home repair</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C47040]/80">Reference case</p>
                </div>
                <div className="border-r border-black/[0.06] px-5 py-5 text-[14px] leading-relaxed text-textSecondary">
                  Certified expert defines the issue.
                </div>
                <div className="border-r border-black/[0.06] px-5 py-5 text-[14px] leading-relaxed text-textSecondary">
                  Chat → structured service-order card.
                </div>
                <div className="px-5 py-5 text-[14px] leading-relaxed text-textSecondary">
                  Live competitive quote → checkout.
                </div>
              </div>

              {[
                {
                  domain: "Education consultation",
                  tagline: "Parents · advisors · plans",
                  d: "Advisor clarifies goals, grade, budget, schedule.",
                  s: "Constraints → structured learning brief.",
                  c: "Plan comparison with visible recommendation quality.",
                },
                {
                  domain: "Banquet booking",
                  tagline: "Event · venue · quote lock-in",
                  d: "Capture event size, date flex, menu tier, must-haves.",
                  s: "Non-negotiables → comparable requirement card.",
                  c: "Venue offers on equal terms; explicit quote boundaries.",
                },
                {
                  domain: "Maternity care",
                  tagline: "Family · caregiver · continuity",
                  d: "Triage need and risk; surface caregiver credentials first.",
                  s: "Care scope, boundaries, schedule → service brief.",
                  c: "Package selection in trust context; follow-up in same thread.",
                },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-[1.1fr_1fr_1fr_1.05fr] border-t border-black/[0.06]">
                  <div className="border-r border-black/[0.06] px-5 py-5">
                    <p className="text-[15px] tracking-tight text-textPrimary">{row.domain}</p>
                    <p className="mt-1 text-[12px] leading-snug text-textSecondary">{row.tagline}</p>
                  </div>
                  <div className="border-r border-black/[0.06] px-5 py-5 text-[14px] leading-relaxed text-textSecondary">{row.d}</div>
                  <div className="border-r border-black/[0.06] px-5 py-5 text-[14px] leading-relaxed text-textSecondary">{row.s}</div>
                  <div className="px-5 py-5 text-[14px] leading-relaxed text-textSecondary">{row.c}</div>
                </div>
              ))}
            </div>

            {/* Mobile — stacked cards: each domain becomes a definition list */}
            <div className="space-y-4 sm:hidden">
              {[
                {
                  domain: "Home repair",
                  tagline: "Reference case",
                  ref: true,
                  d: "Certified expert defines the issue.",
                  s: "Chat → structured service-order card.",
                  c: "Live competitive quote → checkout.",
                },
                {
                  domain: "Education consultation",
                  tagline: "Parents · advisors · plans",
                  d: "Advisor clarifies goals, grade, budget, schedule.",
                  s: "Constraints → structured learning brief.",
                  c: "Plan comparison with visible recommendation quality.",
                },
                {
                  domain: "Banquet booking",
                  tagline: "Event · venue · quote lock-in",
                  d: "Capture event size, date flex, menu tier, must-haves.",
                  s: "Non-negotiables → comparable requirement card.",
                  c: "Venue offers on equal terms; explicit quote boundaries.",
                },
                {
                  domain: "Maternity care",
                  tagline: "Family · caregiver · continuity",
                  d: "Triage need and risk; surface caregiver credentials first.",
                  s: "Care scope, boundaries, schedule → service brief.",
                  c: "Package selection in trust context; follow-up in same thread.",
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`overflow-hidden rounded-xl border border-black/[0.08] ${
                    row.ref ? "bg-[#FFF8F4]/60" : "bg-white"
                  }`}
                >
                  <div className="border-b border-black/[0.06] px-4 py-3">
                    <p className={`text-[15px] tracking-tight ${row.ref ? "text-[#8A4B2A]" : "text-textPrimary"}`}>
                      {row.domain}
                    </p>
                    <p className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${row.ref ? "text-[#C47040]/80" : "text-textSecondary/70"}`}>
                      {row.tagline}
                    </p>
                  </div>
                  <dl className="divide-y divide-black/[0.05] text-[13.5px] leading-relaxed">
                    {(
                      [
                        ["01 · Diagnose", row.d],
                        ["02 · Structure", row.s],
                        ["03 · Commit", row.c],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="px-4 py-3">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C47040]">{k}</dt>
                        <dd className="mt-1 text-textSecondary">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </FadeIn>
        </Section>

        <Section id="impact" eyebrow="Impact & Validation" title="Trust-first won the A/B.">
          <FadeIn className="grid gap-12 border-t border-black/[0.06] pt-12 md:grid-cols-3 md:gap-8 md:pt-16">
            <div>
              <p className="font-display text-[3.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[5rem] lg:text-[5.75rem]">
                +5<span className="text-[0.55em] text-textPrimary/70">%</span>
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C47040]">Conversion lift</p>
            </div>
            <div>
              <p className="font-display text-[3.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[5rem] lg:text-[5.75rem]">
                ~2k
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/80">Additional daily orders</p>
            </div>
            <div>
              <p className="font-display text-[3.5rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[5rem] lg:text-[5.75rem]">
                −50<span className="text-[0.55em] text-textPrimary/70">%</span>
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/80">Pricing disputes</p>
            </div>
          </FadeIn>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/65">
            User-level randomized A/B · Meituan + Dianping
          </p>
        </Section>

        <Section id="reflection" eyebrow="Reflection" title="Next time, I would push on three fronts.">
          <div className="space-y-5 md:space-y-6">
            <FadeIn className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Merchant experience deserves its own product pass.</p>
            </FadeIn>
            <FadeIn delay={0.06} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Guide pricing should explain variability, not imply a promise.</p>
            </FadeIn>
            <FadeIn delay={0.12} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Scale with AI triage, escalate to human experts.</p>
            </FadeIn>
          </div>

          <FadeIn className="mt-20 md:mt-28">
            <div className="relative">
              <span aria-hidden className="absolute -left-2 -top-6 font-display text-[7rem] font-light leading-none text-[#C47040]/15 md:text-[9rem]">
                &ldquo;
              </span>
              <p className="relative max-w-4xl font-display text-[1.75rem] font-light leading-[1.25] tracking-tight text-textPrimary md:text-[2.5rem] md:leading-[1.18]">
                Transparent <span className="text-[#C47040]">process</span> is often a stronger trust advantage than transparent <span className="line-through decoration-textSecondary/40">pricing</span> alone.
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
