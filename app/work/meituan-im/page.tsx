"use client";

import { CaseStudyMeta } from "@/components/CaseStudyMeta";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { CASE_STUDY_META } from "@/lib/caseStudyMeta";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const easePremium = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem Signals" },
  { id: "turning-point", label: "Turning Point" },
  { id: "reframe", label: "Core Insight" },
  { id: "solution", label: "Solution System" },
  { id: "chat", label: "IM Experience" },
  { id: "quote", label: "Quoting Engine" },
  { id: "scenarios", label: "Scenario Extensions" },
  { id: "impact", label: "Impact & Validation" },
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
                    ? "border-textPrimary font-medium text-textPrimary"
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
    <section id={id} className="scroll-mt-28 border-t border-black/[0.04] py-32 md:py-40 lg:py-44">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-textSecondary/85">{eyebrow}</p>
        <h2 className="mt-6 max-w-4xl font-display text-[2rem] font-light leading-[1.08] tracking-tight text-textPrimary md:text-[2.75rem] md:leading-[1.06] lg:text-[3.1rem]">
          {title}
        </h2>
        <div className="mt-14 space-y-10 text-[17px] leading-[1.75] text-textSecondary [&>p]:max-w-[40rem] [&_.case-lead]:text-[1.05rem] [&_.case-lead]:leading-[1.65] [&_.case-lead]:text-textPrimary/88 md:[&_.case-lead]:text-[1.125rem] [&>div]:max-w-none [&>ul]:max-w-[40rem]">
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
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">{label}</p>
      <div className="mx-auto h-[648px] w-[300px] rounded-[2rem] bg-gradient-to-b from-black/[0.04] to-black/[0.08] p-[3px] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]">
        <div className="h-full overflow-y-auto rounded-[1.8125rem] border border-black/[0.06] bg-white shadow-inner">
          <Image src={src} alt={alt} width={390} height={1900} className="h-auto w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

function AnnotationCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white/80 px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-sm transition-shadow duration-500 ease-portfolio hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.12)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">{number}</p>
      <p className="mt-2 text-[15px] font-medium leading-snug tracking-tight text-textPrimary">{title}</p>
      {body ? <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">{body}</p> : null}
    </div>
  );
}

function SubsectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-textSecondary/85">{label}</p>
      {hint ? <p className="max-w-lg text-[15px] leading-relaxed text-textSecondary">{hint}</p> : null}
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
              <motion.div variants={heroVariants} initial="hidden" animate="show" className="max-w-5xl">
                <motion.p variants={heroItem} className="font-mono text-[11px] uppercase tracking-[0.24em] text-textSecondary/85">
                  Meituan · Local Services · IM Consultation
                </motion.p>
                <motion.div variants={heroItem}>
                  <CaseStudyMeta className="mt-4" {...CASE_STUDY_META["meituan-im"]} />
                </motion.div>
                <motion.h1
                  variants={heroItem}
                  className="mt-8 max-w-[18ch] font-display text-[2.65rem] font-light leading-[1.03] tracking-tight text-textPrimary sm:max-w-4xl md:text-[4rem] md:leading-[1.02]"
                >
                  IM Pricing Consultation System
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="mt-8 max-w-2xl text-[1.2rem] font-normal leading-[1.45] tracking-tight text-textPrimary/78 md:text-[1.35rem] md:leading-[1.42]"
                >
                  Turning price opacity into booking confidence through one guided conversation.
                </motion.p>
                <motion.section
                  variants={heroItem}
                  className="mt-14 rounded-3xl border border-black/[0.06] bg-gradient-to-b from-surfaceAlt/60 to-white px-8 py-10 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:px-10 md:py-12"
                  aria-label="Project summary for recruiters"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">At a glance</p>
                  <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-textSecondary">Role</p>
                      <p className="mt-2 text-[17px] font-medium tracking-tight text-textPrimary">Product Design</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">End-to-end case ownership</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-textSecondary">Context</p>
                      <p className="mt-2 text-[17px] font-medium tracking-tight text-textPrimary">Meituan super app</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">Local services platform architecture</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-textSecondary">Timeline</p>
                      <p className="mt-2 text-[17px] font-medium tracking-tight text-textPrimary">4 weeks</p>
                      <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">Research through A/B validation</p>
                    </div>
                    <div className="min-w-0 rounded-2xl bg-white/90 px-5 py-5 ring-1 ring-black/[0.05] sm:col-span-2 lg:col-span-1">
                      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-textSecondary">Shipped outcome</p>
                      <p className="mt-3 font-display text-[2.25rem] font-light tabular-nums tracking-tight text-textPrimary md:text-[2.5rem]">
                        +5%
                      </p>
                      <p className="mt-1 text-[14px] leading-snug text-textSecondary">Search-to-purchase conversion</p>
                    </div>
                  </div>
                  <p className="mt-10 max-w-3xl border-t border-black/[0.06] pt-8 text-[15px] leading-relaxed text-textSecondary">
                    <span className="font-medium text-textPrimary/90">Scope · </span>
                    Research, strategy, interaction design, and statistically rigorous A/B testing on Meituan and Dianping.
                  </p>
                </motion.section>
              </motion.div>
            </header>

        <Section id="problem" eyebrow="Context & Signal" title="Users wanted to ask first, but the platform was not earning trust.">
          <p className="case-lead">
            Meituan is one of China&apos;s largest super apps. This project sits in local services—home repair, banquet booking, maternity care, and other
            categories where price depends on details from consultation.
          </p>
          <p>
            The friction was not demand. It was confidence: users needed service but did not trust the bill would match what they expected.
          </p>

          <FadeIn className="grid gap-6 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl bg-surfaceAlt/50 px-7 py-8 transition-transform duration-500 ease-portfolio md:hover:-translate-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Behavior</p>
              <p className="mt-4 text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">Consult led bottom-bar taps.</p>
              <p className="mt-4 text-[14px] leading-relaxed text-textSecondary">Across categories, consult outranked book and call.</p>
            </div>
            <div className="rounded-2xl bg-surfaceAlt/50 px-7 py-8 transition-transform duration-500 ease-portfolio md:hover:-translate-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Conversion</p>
              <p className="mt-4 text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">In-app consult stayed low.</p>
              <p className="mt-4 text-[14px] leading-relaxed text-textSecondary">Intent was visible; many users left the platform or dropped.</p>
            </div>
            <div className="rounded-2xl bg-surfaceAlt/50 px-7 py-8 transition-transform duration-500 ease-portfolio md:hover:-translate-y-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Experience</p>
              <p className="mt-4 text-[1.35rem] font-light leading-snug tracking-tight text-textPrimary">Price disputes clustered in home repair.</p>
              <p className="mt-4 text-[14px] leading-relaxed text-textSecondary">The consistent theme: final charge disagreed with expectations.</p>
            </div>
          </FadeIn>
        </Section>

        <Section id="turning-point" eyebrow="Turning Point" title="The brief started with price visibility. The evidence pointed to expectation mismatch.">
          <p className="case-lead">
            The team came to me with a brief: users were confused about pricing in local services and we should add package cards to show prices earlier.
          </p>
          <p>
            But dispute data and user reviews told a different story. Users were already seeing prices. The breakdown happened later, when final bills rarely
            matched what people expected. That is not a display issue. It is a trust issue.
          </p>

          <FadeIn className="mt-6 rounded-3xl border border-black/[0.05] bg-white px-8 py-9 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.25)] md:px-10 md:py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Previous workflow · user journey map</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surfaceAlt/45 px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 1</p>
                <p className="mt-2 text-[16px] font-medium tracking-tight text-textPrimary">Problem occurs at home</p>
                <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">User finds an issue like toilet repair and opens Meituan to search.</p>
              </div>
              <div className="rounded-2xl bg-surfaceAlt/45 px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 2</p>
                <p className="mt-2 text-[16px] font-medium tracking-tight text-textPrimary">Many local merchants appear</p>
                <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">User sees options, but cannot tell who can diagnose accurately.</p>
              </div>
              <div className="rounded-2xl bg-surfaceAlt/45 px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 3</p>
                <p className="mt-2 text-[16px] font-medium tracking-tight text-textPrimary">One-by-one outreach in chat</p>
                <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">
                  User sends repeated questions: what is the issue, how much will it cost, then waits for replies from different shops.
                </p>
              </div>
              <div className="rounded-2xl bg-surfaceAlt/45 px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 4</p>
                <p className="mt-2 text-[16px] font-medium tracking-tight text-textPrimary">Select one merchant for visit</p>
                <p className="mt-2 text-[14px] leading-relaxed text-textSecondary">
                  Most merchants can only promise an arrival fee first; final quote is deferred to on-site inspection.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#FFF8F4] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A4B2A]">Trust break</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[#7A4330]">
                Final price changes with real conditions, materials, and scope. The range becomes wide, so users feel that &quot;quoted price&quot; and
                &quot;actual bill&quot; are disconnected.
              </p>
            </div>
          </FadeIn>
          <p>
          I pushed back on the original direction. For customized services, static prices are often structurally wrong because scope and materials change.
          </p>
          
            <p className="mt-5 max-w-4xl text-[17px] font-medium leading-[1.65] tracking-[-0.01em] text-textPrimary md:text-[1.2rem]">
              So the product question shifted: how do we guide users through a credible path to a price they can trust before they commit?
            </p>
          
        </Section>

        <Section id="reframe" eyebrow="Core Insight" title="This is not a static pricing issue. This is a process trust issue.">
          <p className="case-lead">
            For customized services, static ranges are often too wide or wrong. An earlier number does not build confidence if users do not trust how it was
            produced.
          </p>

          <FadeIn className="mt-4 rounded-3xl border border-black/[0.05] bg-white px-8 py-10 shadow-[0_24px_64px_-48px_rgba(0,0,0,0.2)] md:px-12 md:py-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Reframe</p>
            <p className="mt-6 text-[16px] text-textSecondary">From</p>
            <p className="mt-2 max-w-2xl text-[17px] text-textPrimary/80">&quot;How can we show a price earlier?&quot;</p>
            <p className="mt-8 text-[16px] text-textSecondary">To</p>
            <p className="font-display mt-3 max-w-4xl text-[1.5rem] font-light italic leading-[1.35] tracking-tight text-textPrimary md:text-[1.85rem]">
              &quot;How can we guide users through a credible path to a price they can trust before booking?&quot;
            </p>
          </FadeIn>
        </Section>

        <Section id="solution" eyebrow="System Design" title="A three-step consultation system that carries trust into checkout.">
          <p className="case-lead">
            The solution is a connected flow: each step closes a drop-off reason and passes structured context forward.
          </p>

          <FadeIn className="relative mx-auto max-w-4xl space-y-0 pt-4">
            <div aria-hidden className="absolute bottom-8 left-[1.125rem] top-8 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent md:left-[1.25rem]" />
            <div className="relative space-y-12 pl-10 md:pl-12">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Step one</p>
                <p className="mt-3 text-[1.35rem] font-medium tracking-tight text-textPrimary">Official diagnosis entry</p>
                <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-textSecondary">
                  <li>
                    <span className="font-medium text-textPrimary/90">Function · </span>Certified experts surface from search to define the problem.
                  </li>
                  <li>
                    <span className="font-medium text-textPrimary/90">Goal · </span>Remove ambiguity before comparison begins.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Step two</p>
                <p className="mt-3 text-[1.35rem] font-medium tracking-tight text-textPrimary">Guided IM chat</p>
                <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-textSecondary">
                  <li>
                    <span className="font-medium text-textPrimary/90">Function · </span>Multi-turn chat yields a structured service-order card.
                  </li>
                  <li>
                    <span className="font-medium text-textPrimary/90">Goal · </span>Turn conversation into comparable intent.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Step three</p>
                <p className="mt-3 text-[1.35rem] font-medium tracking-tight text-textPrimary">Competitive quoting</p>
                <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-textSecondary">
                  <li>
                    <span className="font-medium text-textPrimary/90">Function · </span>Vetted merchants quote live; the chosen price threads into checkout.
                  </li>
                  <li>
                    <span className="font-medium text-textPrimary/90">Goal · </span>Transparent competition and lower surprise billing risk.
                  </li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section id="chat" eyebrow="IM Experience" title="The interface walkthrough maps every critical state in one coherent conversation flow.">
          <p className="case-lead">
            Visual first: swimlane map, then screen groups, with short notes on the key design moves.
          </p>

          <FadeIn>
            <SubsectionHeader label="Flow map" hint="Five stages across user, platform, and merchant lanes." />
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

          <section className="mt-20 md:mt-24">
            <SubsectionHeader label="The conversation flow" hint="Three entry states, one interaction model." />

            <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              <PhoneFrame src="/assets/meituan-im/screen-04-entry-generic.jpg" alt="Generic search entry screen" label="Screen 4 · Generic intent" />
              <PhoneFrame src="/assets/meituan-im/screen-05-entry-specific.jpg" alt="Specific search entry screen" label="Screen 5 · Specific intent" />
              <PhoneFrame src="/assets/meituan-im/screen-03-offhours-state.jpg" alt="Off-hours edge case screen" label="Screen 3 · Off-hours edge case" />
            </div>

            <div className="mt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Interaction highlights</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <AnnotationCard number="①" title="Symptom chips compress triage" />
                <AnnotationCard number="②" title="Trust card frames expert identity" />
                <AnnotationCard number="③" title="Text progress strip keeps status explicit" />
              </div>
            </div>

            
            
          </section>
        </Section>

        <Section id="quote" eyebrow="Quoting Engine" title="Diagnosis output becomes structured intent, then drives transparent competitive quotes.">
          <p className="case-lead">
            Structured diagnosis feeds quoting: evidence becomes intent, intent becomes comparable offers, offers become checkout.
          </p>

          <section>
            <SubsectionHeader label="Diagnosis in action" hint="From evidence capture to structured intent." />
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              <PhoneFrame src="/assets/meituan-im/screen-07-diagnosis-start.jpg" alt="Diagnosis start in chat" label="Screen 7 · Diagnosis starts" />
              <PhoneFrame src="/assets/meituan-im/screen-11-diagnosis-product-rec.jpg" alt="Post diagnosis recommendation state" label="Screen 11 · Product recommendation" />
            </div>
            <div className="mt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Interaction highlights</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <AnnotationCard number="①" title="Conversation captures evidence quickly" />
                <AnnotationCard number="②" title="Diagnosis becomes structured intent" />
                <AnnotationCard number="③" title="Recommendations appear after confidence" />
              </div>
            </div>
          </section>

          <section className="mt-20 md:mt-28">
            <SubsectionHeader label="Competitive quoting" hint="Live bidding, expiry handling, and re-quote continuity." />
            <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
              <PhoneFrame src="/assets/meituan-im/screen-02-live-quoting.jpg" alt="Live quoting state" label="Screen 2 · Live quoting state" />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Active quoting</p>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <AnnotationCard number="①" title="Live updates make waiting legible" />
                  <AnnotationCard number="②" title="Trust signals appear before price" />
                  <AnnotationCard number="③" title="Price range sets realistic expectations" />
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
              <PhoneFrame src="/assets/meituan-im/screen-10-quote-expired-chat.jpg" alt="Quote expired in chat state" label="Screen 10 · Expired in chat" />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Re-quote</p>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <AnnotationCard number="①" title="Expired quotes remain visible but disabled" />
                  <AnnotationCard number="②" title="Only time slot is reset on re-quote" />
                  <AnnotationCard number="③" title="Safety and convenience stay balanced" />
                </div>
              </div>
            </div>
            
          </section>

          <section className="mt-20 md:mt-28">
            <SubsectionHeader label="Closing the loop" hint="Post-service continuity and return behavior." />
            <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
              <PhoneFrame src="/assets/meituan-im/screen-09-return-visit.jpg" alt="Return visit and rating state" label="Screen 9 · Return visit" />
              <div className="flex flex-col justify-center pt-2 md:pt-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Highlights</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <AnnotationCard number="①" title="Return flow stays in same thread" />
                  <AnnotationCard number="②" title="Re-engagement is one tap" />
                </div>
              </div>
            </div>
           
          </section>
        </Section>

        <Section
          id="scenarios"
          eyebrow="Framework Extensions"
          title="The same trust-first framework scales to education, banquet booking, and maternity care."
        >
          <p className="case-lead">
            The same sequence applies across adjacent categories: clarify intent, structure consultation, then route to transparent comparison and checkout.
          </p>

          <div className="space-y-16 md:space-y-20">
            <section className="pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="font-display text-[1.65rem] font-light leading-tight tracking-tight text-textPrimary md:text-[2.1rem]">
                  Education consultation
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">
                  Parent intent → advisor matching → plan comparison
                </p>
              </div>
              <p className="mt-5 max-w-3xl text-[15px] leading-[1.7] text-textSecondary">
                Adapt entry and questioning to goals, grade level, budget, and schedule before surfacing advisors and course packages.
              </p>
              <p className="mt-4 max-w-3xl rounded-2xl bg-surfaceAlt/35 px-6 py-5 text-[15px] leading-[1.75] text-textSecondary">
                Story extension: parents first clarify goals and constraints, then compare advisors with consistent context captured in chat. The framework
                keeps recommendation quality visible before any package decision.
              </p>
            </section>

            <section className="border-t border-black/[0.05] pt-16 md:pt-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="font-display text-[1.65rem] font-light leading-tight tracking-tight text-textPrimary md:text-[2.1rem]">
                  Banquet booking
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">
                  Event requirements → venue negotiation → quote lock-in
                </p>
              </div>
              <p className="mt-5 max-w-3xl text-[15px] leading-[1.7] text-textSecondary">
                Keep multi-merchant quoting; capture event size, date flexibility, menu tiers, and inclusions so offers compare on equal terms.
              </p>
              <p className="mt-4 max-w-3xl rounded-2xl bg-surfaceAlt/35 px-6 py-5 text-[15px] leading-[1.75] text-textSecondary">
                Story extension: users define non-negotiables early, receive comparable venue offers, and commit only after quote boundaries are explicit.
                Negotiation remains flexible without losing transparency.
              </p>
            </section>

            <section className="border-t border-black/[0.05] pt-16 md:pt-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="font-display text-[1.65rem] font-light leading-tight tracking-tight text-textPrimary md:text-[2.1rem]">
                  Maternity care
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">
                  Need triage → caregiver trust layer → service package selection
                </p>
              </div>
              <p className="mt-5 max-w-3xl text-[15px] leading-[1.7] text-textSecondary">
                Lead with trust and safety—credentials, care scope, postpartum boundaries—before pricing, then preserve continuity for follow-up visits.
              </p>
              <p className="mt-4 max-w-3xl rounded-2xl bg-surfaceAlt/35 px-6 py-5 text-[15px] leading-[1.75] text-textSecondary">
                Story extension: families build trust through caregiver credentials and scoped care plans first, then review pricing in that context.
                Follow-up stays in one thread to support continuity and confidence.
              </p>
            </section>
          </div>
        </Section>

        <Section id="impact" eyebrow="Impact & Validation" title="Higher conversion and fewer disputes validated the trust-first direction.">
          <p className="case-lead">
            Experiment design: user-level randomization, merchant whitelisting, and parallel runs on Meituan and Dianping in test and production.
          </p>
          <FadeIn className="grid gap-6 md:grid-cols-3 md:gap-5">
            <div className="rounded-2xl bg-surfaceAlt/45 px-7 py-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Conversion</p>
              <p className="mt-5 font-display text-[2.25rem] font-light tabular-nums tracking-tight text-textPrimary md:text-[2.5rem]">+0.5pp</p>
              <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">Search-to-purchase lift at rollout scale.</p>
            </div>
            <div className="rounded-2xl bg-surfaceAlt/45 px-7 py-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Order volume</p>
              <p className="mt-5 font-display text-[2.25rem] font-light tabular-nums tracking-tight text-textPrimary md:text-[2.5rem]">+2,000</p>
              <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">Estimated additional daily orders at projected coverage.</p>
            </div>
            <div className="rounded-2xl bg-surfaceAlt/45 px-7 py-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Disputes</p>
              <p className="mt-5 font-display text-[2.25rem] font-light tabular-nums tracking-tight text-textPrimary md:text-[2.5rem]">−50%</p>
              <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">Post-service pricing disputes in this flow.</p>
            </div>
          </FadeIn>
        </Section>

        <Section id="reflection" eyebrow="Reflection" title="What I would improve in the next version.">
          <div className="space-y-6 md:space-y-8">
            <FadeIn className="rounded-2xl border border-black/[0.06] bg-white px-7 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:px-9">
              <p className="text-[17px] font-medium tracking-tight text-textPrimary">Merchant experience deserves its own product pass.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">
                Response quality is a system bottleneck: notification priority, context, and workload need first-class design.
              </p>
            </FadeIn>
            <FadeIn delay={0.06} className="rounded-2xl border border-black/[0.06] bg-white px-7 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:px-9">
              <p className="text-[17px] font-medium tracking-tight text-textPrimary">Guide pricing should explain variability, not imply a promise.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">
                Tie each range to concrete drivers so users do not read it as a fixed quote.
              </p>
            </FadeIn>
            <FadeIn delay={0.12} className="rounded-2xl border border-black/[0.06] bg-white px-7 py-8 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:px-9">
              <p className="text-[17px] font-medium tracking-tight text-textPrimary">Scale with AI triage, escalate to human experts.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-textSecondary">
                Humans stay essential for ambiguity; high-confidence paths can be automated at the front.
              </p>
            </FadeIn>
          </div>

          <FadeIn className="mt-12 max-w-3xl rounded-2xl bg-surfaceAlt/40 px-7 py-8 text-[17px] leading-relaxed text-textPrimary md:px-9 md:py-10">
            Transparent process is often a stronger trust advantage than transparent pricing alone.
          </FadeIn>
        </Section>
          </main>
        </article>
      </div>
      <Footer />
    </>
  );
}
