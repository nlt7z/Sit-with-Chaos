"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const easePremium = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Context & Signal" },
  { id: "turning-point", label: "Turning Point" },
  { id: "solution", label: "System Design" },
  { id: "chat", label: "IM Experience" },
  { id: "quote", label: "Quoting Engine" },
  { id: "prototype", label: "Interactive Prototype" },
  { id: "scenarios", label: "Framework Extensions" },
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
    <div className="border-l-2 border-black/[0.12] pl-4 sm:pl-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/75">{number}</p>
      <p className="mt-2 text-[16px] leading-snug tracking-tight text-textPrimary">{title}</p>
      {body ? <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">{body}</p> : null}
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
              <motion.div variants={heroVariants} initial="hidden" animate="show" className="max-w-5xl">
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
                  className="mt-6 max-w-2xl text-[16px] leading-[1.75] text-textSecondary"
                >
                  I designed a trust infrastructure that turns uncertain local-service pricing into a guided, comparable, and bookable decision flow.
                </motion.p>
                <motion.div
                  variants={heroItem}
                  className="mt-14 flex flex-col gap-12 lg:flex-row lg:items-start"
                  aria-label="Project summary for recruiters"
                >
                  {/* At a glance */}
                  <section className="flex-1" aria-label="Project summary for recruiters">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">At a glance</p>
                    <div className="mt-8 flex gap-10 lg:gap-12">
                      {/* Left — Role, Context, Timeline stacked */}
                      <div className="flex flex-col gap-8">
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Role</p>
                          <p className="mt-2 text-[16px] tracking-tight text-textPrimary">Product Design</p>
                          <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">End-to-end case ownership</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Context</p>
                          <p className="mt-2 text-[16px] tracking-tight text-textPrimary">Meituan Super App</p>
                          <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">Local services platform architecture</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Timeline</p>
                          <p className="mt-2 text-[16px] tracking-tight text-textPrimary">4 weeks</p>
                        </div>
                      </div>
                      {/* Right — Shipped outcome only */}
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Shipped outcome</p>
                        <div className="mt-4 space-y-1 text-[16px] text-textPrimary/90">
                          <p>+5% conversion</p>
                          <p>~2,000 additional daily orders</p>
                          <p>−50% post-service disputes</p>
                        </div>
                        <p className="mt-1 text-[16px] leading-relaxed text-textSecondary">
                          Validated through user-level randomized A/B on Meituan and Dianping
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Phone prototype — flush with At a glance, no wrapper box */}
                  <div
                    className="hidden lg:block"
                    style={{ width: Math.round(390 * 0.68), height: Math.round(844 * 0.68), flexShrink: 0 }}
                  >
                    <iframe
                      src="/assets/meituan-im/interaction-flow-phone.html"
                      title="FixIt Express interactive prototype"
                      scrolling="no"
                      style={{
                        width: 390,
                        height: 844,
                        border: "none",
                        transform: "scale(0.68)",
                        transformOrigin: "top left",
                      }}
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </header>

        <Section id="problem" eyebrow="Context & Signal" title="Users wanted to ask first, but the platform was not earning trust.">
          <p className="case-lead">
            Meituan is one of China&apos;s largest super apps. This project sits in local services—home repair, banquet booking, maternity care, and other
            categories where price depends on details from consultation.
          </p>

          <FadeIn className="my-2 py-8 md:py-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">User behavior signal</p>
            <p className="mt-5 max-w-3xl text-[16px] leading-[1.75] text-textPrimary/85">
              Before choosing a local service, users visit an average of <span className="text-textPrimary">10 merchants</span> and consult{" "}
              <span className="text-textPrimary">6 of them</span> about their needs and pricing. They spend{" "}
              <span className="text-textPrimary">30 minutes</span> weighing and comparing—yet still do not trust the prices and services merchants offer.
            </p>
          </FadeIn>

          <p>
            The friction was not demand. It was confidence: users needed service but did not trust the bill would match what they expected.
          </p>

          <FadeIn className="grid gap-8 border-t border-black/[0.06] pt-8 md:grid-cols-3 md:gap-8">
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Behavior</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">Consult led bottom-bar taps.</p>
              <p className="mt-4 text-[16px] leading-relaxed text-textSecondary">Across categories, consult outranked book and call.</p>
            </div>
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Conversion</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">In-app consult stayed low.</p>
              <p className="mt-4 text-[16px] leading-relaxed text-textSecondary">Intent was visible; many users left the platform or dropped.</p>
            </div>
            <div className="border-l border-black/[0.1] pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Experience</p>
              <p className="mt-4 text-[16px] tracking-tight text-textPrimary">Price disputes clustered in home repair.</p>
              <p className="mt-4 text-[16px] leading-relaxed text-textSecondary">The consistent theme: final charge disagreed with expectations.</p>
            </div>
          </FadeIn>
        </Section>

        <Section id="turning-point" eyebrow="Turning Point" title="The brief started with price visibility. The evidence pointed to something deeper.">
          <p className="case-lead">
            We first noticed that local services had the longest browse time but the lowest transaction rate—and the highest complaint rate on the platform.
            Much of the friction traced back to pricing: local services are customized, varying by situation and merchant, so even the same service could cost
            significantly differently.
          </p>
          <p>
            The initial ask was to make prices more visible. But when I used AI to analyze dispute reviews at scale, the evidence showed visibility was not
            enough. Users were already seeing prices. The breakdown happened later, when final bills rarely matched what people expected.
          </p>

          <FadeIn>
            <p className="text-[16px] leading-[1.75] tracking-tight text-textPrimary">
              Price was not a number problem. It was a process trust problem.
            </p>
          </FadeIn>

          <FadeIn className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/80">Previous workflow · user journey map</p>
            <div className="mt-5 grid gap-0 border-y border-black/[0.08] md:grid-cols-2">
              <div className="border-b border-r border-black/[0.06] px-6 py-6 md:border-b-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 1</p>
                <p className="mt-2 text-[16px] tracking-tight text-textPrimary">Problem occurs at home</p>
                <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">User finds an issue like toilet repair and opens Meituan to search.</p>
              </div>
              <div className="border-b border-black/[0.06] px-6 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 2</p>
                <p className="mt-2 text-[16px] tracking-tight text-textPrimary">Many local merchants appear</p>
                <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">User sees options, but cannot tell who can diagnose accurately.</p>
              </div>
              <div className="border-r border-black/[0.06] px-6 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 3</p>
                <p className="mt-2 text-[16px] tracking-tight text-textPrimary">One-by-one outreach in chat</p>
                <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">
                  User sends repeated questions: what is the issue, how much will it cost, then waits for replies from different shops.
                </p>
              </div>
              <div className="px-6 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/80">Step 4</p>
                <p className="mt-2 text-[16px] tracking-tight text-textPrimary">Select one merchant for visit</p>
                <p className="mt-2 text-[16px] leading-relaxed text-textSecondary">
                  Most merchants can only promise an arrival fee first; final quote is deferred to on-site inspection.
                </p>
              </div>
            </div>
            <div className="mt-4 border-l-[3px] border-[#C47040] bg-[#FFF8F4] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A4B2A]">Trust break</p>
              <p className="mt-2 text-[16px] leading-relaxed text-[#7A4330]">
                Final price changes with real conditions, materials, and scope. The range becomes wide, so users feel that &quot;quoted price&quot; and
                &quot;actual bill&quot; are disconnected.
              </p>
            </div>
          </FadeIn>
          <p>
          I pushed back on the original direction. For customized services, static prices are often structurally wrong because scope and materials change.
          </p>
          
            <p className="mt-5 max-w-2xl text-[16px] leading-[1.75] text-textPrimary">
              So the product question shifted:
            </p>
            <p className="mt-3 max-w-3xl font-display text-[1.6rem] italic leading-[1.35] tracking-tight text-textPrimary">
              how do we guide users through a credible path to a price they can trust before they commit?
            </p>
          
        </Section>

        <Section id="solution" eyebrow="System Design" title="A three-step consultation system that carries trust into checkout.">
          <SubsectionHeader label="Flow map" />
          <FadeIn>
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
          <FadeIn className="mt-16 grid gap-8 border-t border-black/[0.06] pt-8 md:grid-cols-3">
            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/70">Step 01</p>
              <p className="mt-5 text-[16px] tracking-tight text-textPrimary">
                Diagnose the problem
              </p>
              <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-textSecondary">
                <p><span className="text-textPrimary/90">Function · </span>Certified experts surface from search to define the problem.</p>
                <p><span className="text-textPrimary/90">Goal · </span>Remove ambiguity before comparison begins.</p>
              </div>
            </div>

            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/70">Step 02</p>
              <p className="mt-5 text-[16px] tracking-tight text-textPrimary">
                Structure the intent
              </p>
              <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-textSecondary">
                <p><span className="text-textPrimary/90">Function · </span>Multi-turn chat yields a structured service-order card.</p>
                <p><span className="text-textPrimary/90">Goal · </span>Turn conversation into comparable intent.</p>
              </div>
            </div>

            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/70">Step 03</p>
              <p className="mt-5 text-[16px] tracking-tight text-textPrimary">
                Compare and commit
              </p>
              <div className="mt-5 space-y-3 text-[16px] leading-relaxed text-textSecondary">
                <p><span className="text-textPrimary/90">Function · </span>Vetted merchants quote live; the chosen price threads into checkout.</p>
                <p><span className="text-textPrimary/90">Goal · </span>Transparent competition and lower surprise billing risk.</p>
              </div>
            </div>
          </FadeIn>
        </Section>

        <Section id="chat" eyebrow="IM Experience" title="The interface walkthrough maps every critical state in one coherent conversation flow.">
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

        <Section id="prototype" eyebrow="Interactive Prototype" title="An interactive prototype built with Cursor and Claude Code.">
          <FadeIn className="mt-4">
            <div className="overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
              <iframe
                src="/assets/meituan-im/interaction-flow.html"
                title="FixIt Express interactive consultation flow"
                className="h-[780px] w-full border-0"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </Section>

        <Section
          id="scenarios"
          eyebrow="Framework Extensions"
          title="The same trust-first framework scales to education, banquet booking, and maternity care."
        >
          <div className="space-y-16 md:space-y-20">
            <section className="pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-[1.1rem] leading-tight tracking-tight text-textPrimary">
                  Education consultation
                </h3>
              </div>
              <p className="mt-5 max-w-3xl text-[16px] leading-[1.75] text-textSecondary">
                Adapt entry and questioning to goals, grade level, budget, and schedule before surfacing advisors and course packages.
              </p>
              <p className="mt-4 max-w-3xl text-[16px] leading-[1.75] text-textPrimary/85">
                Parent intent → advisor matching → plan comparison
              </p>
              <p className="mt-4 max-w-3xl border-l-2 border-black/[0.08] pl-5 text-[16px] leading-[1.75] text-textSecondary">
                Story extension: parents first clarify goals and constraints, then compare advisors with consistent context captured in chat. The framework
                keeps recommendation quality visible before any package decision.
              </p>
            </section>

            <section className="border-t border-black/[0.05] pt-16 md:pt-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-[1.1rem] leading-tight tracking-tight text-textPrimary">
                  Banquet booking
                </h3>
              </div>
              <p className="mt-5 max-w-3xl text-[16px] leading-[1.75] text-textSecondary">
                Keep multi-merchant quoting; capture event size, date flexibility, menu tiers, and inclusions so offers compare on equal terms.
              </p>
              <p className="mt-4 max-w-3xl text-[16px] leading-[1.75] text-textPrimary/85">
                Event requirements → venue negotiation → quote lock-in
              </p>
              <p className="mt-4 max-w-3xl border-l-2 border-black/[0.08] pl-5 text-[16px] leading-[1.75] text-textSecondary">
                Story extension: users define non-negotiables early, receive comparable venue offers, and commit only after quote boundaries are explicit.
                Negotiation remains flexible without losing transparency.
              </p>
            </section>

            <section className="border-t border-black/[0.05] pt-16 md:pt-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-[1.1rem] leading-tight tracking-tight text-textPrimary">
                  Maternity care
                </h3>
              </div>
              <p className="mt-5 max-w-3xl text-[16px] leading-[1.75] text-textSecondary">
                Lead with trust and safety—credentials, care scope, postpartum boundaries—before pricing, then preserve continuity for follow-up visits.
              </p>
              <p className="mt-4 max-w-3xl text-[16px] leading-[1.75] text-textPrimary/85">
                Need triage → caregiver trust layer → service package selection
              </p>
              <p className="mt-4 max-w-3xl border-l-2 border-black/[0.08] pl-5 text-[16px] leading-[1.75] text-textSecondary">
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
          <FadeIn className="grid gap-8 border-t border-black/[0.06] pt-8 md:grid-cols-3">
            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Conversion</p>
              <p className="mt-5 text-[16px] tabular-nums tracking-tight text-textPrimary">+0.5pp</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">Search-to-purchase lift at rollout scale.</p>
            </div>
            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Order volume</p>
              <p className="mt-5 text-[16px] tabular-nums tracking-tight text-textPrimary">+2,000</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">Estimated additional daily orders at projected coverage.</p>
            </div>
            <div className="border-l border-black/[0.12] pl-5 sm:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">Disputes</p>
              <p className="mt-5 text-[16px] tabular-nums tracking-tight text-textPrimary">−50%</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">Post-service pricing disputes in this flow.</p>
            </div>
          </FadeIn>
        </Section>

        <Section id="reflection" eyebrow="Reflection" title="What I would improve in the next version.">
          <div className="space-y-6 md:space-y-8">
            <FadeIn className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Merchant experience deserves its own product pass.</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">
                Response quality is a system bottleneck: notification priority, context, and workload need first-class design.
              </p>
            </FadeIn>
            <FadeIn delay={0.06} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Guide pricing should explain variability, not imply a promise.</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">
                Tie each range to concrete drivers so users do not read it as a fixed quote.
              </p>
            </FadeIn>
            <FadeIn delay={0.12} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
              <p className="text-[16px] tracking-tight text-textPrimary">Scale with AI triage, escalate to human experts.</p>
              <p className="mt-3 text-[16px] leading-relaxed text-textSecondary">
                Humans stay essential for ambiguity; high-confidence paths can be automated at the front.
              </p>
            </FadeIn>
          </div>

          <FadeIn className="mt-12 max-w-3xl border-y border-black/[0.08] py-8 md:py-10">
            <p className="text-[16px] leading-relaxed text-textPrimary">Transparent process is often a stronger trust advantage than transparent pricing alone.</p>
          </FadeIn>
        </Section>
          </main>
        </article>
      </div>
      <Footer />
    </>
  );
}
