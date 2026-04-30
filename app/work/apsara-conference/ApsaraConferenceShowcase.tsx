"use client";

import { CaseStudyMeta } from "@/components/CaseStudyMeta";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { CASE_STUDY_META } from "@/lib/caseStudyMeta";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "conference", label: "About Apsara" },
  { id: "approach", label: "Approach" },
  { id: "system", label: "Visual system" },
] as const;

function CaseNav() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash && navItems.some((i) => i.id === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    const els = navItems.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Case study sections"
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-full w-[11rem] lg:block"
    >
      <div className="pointer-events-auto sticky top-[calc(50vh-9rem)] px-6 pt-28">
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
                className={`block border-l border-transparent py-2 pl-4 text-left text-[12px] leading-snug transition-[color,border-color] duration-500 ease-out ${
                  active === id
                    ? "border-textPrimary/80 font-medium text-textPrimary"
                    : "text-textSecondary/90 hover:border-textPrimary/15 hover:text-textPrimary"
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

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: reduce ? 0.01 : 0.85, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-textSecondary/70">{children}</p>
  );
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`max-w-3xl font-display text-[1.75rem] font-light leading-[1.15] tracking-[-0.02em] text-textPrimary md:text-3xl lg:text-[2.125rem] ${className}`}
    >
      {children}
    </h2>
  );
}

function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-2xl space-y-6 text-[17px] font-normal leading-[1.65] tracking-[-0.01em] text-textSecondary md:text-lg md:leading-[1.7] ${className}`}
    >
      {children}
    </div>
  );
}



export default function ApsaraConferenceShowcase() {
  const reduce = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-white">
      <CaseNav />
      <article className="mx-auto max-w-content bg-white px-6 pb-36 pt-24 text-left md:px-10 md:pb-48 md:pt-28 lg:pl-32 lg:pr-10 lg:pt-32">
        <header id="overview" className="scroll-mt-28">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <Eyebrow>Alibaba Cloud · Event visual design</Eyebrow>
            <CaseStudyMeta className="mt-5" {...CASE_STUDY_META["apsara-conference"]} />
            <h1 className="mt-8 max-w-4xl font-display text-[clamp(2rem,5.5vw,3.5rem)] font-light leading-[1.08] tracking-[-0.03em] text-textPrimary">
              Apsara Conference — Alibaba AI on Cloud
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-light leading-snug tracking-[-0.02em] text-textPrimary/80 md:text-2xl">
              Visual design for Alibaba&apos;s flagship technology summit—crafting a cohesive look and feel for AI and
              cloud storytelling on stage and across digital surfaces.
            </p>
            
            <dl className="mt-14 grid gap-y-5 border-t border-black/[0.06] pt-10 sm:grid-cols-2 sm:gap-x-12">
              
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Focus</dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">Conference visual design</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Role</dt>
                <dd className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-textPrimary">
                  Visual design for the Apsara Conference identity and application across supporting
                  touchpoints.
                </dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: reduce ? 0 : 0.1, ease: easeOut }}
            className="relative mt-16 overflow-hidden rounded-2xl ring-1 ring-black/[0.06] md:mt-20"
          >
            <div className="aspect-video w-full bg-neutral-100">
              <video
                className="h-full w-full object-cover"
                src="/assets/work/apsara.mp4"
                poster="/assets/work/apsara-conference-cover.svg"
                aria-label="Apsara Conference — Alibaba AI on Cloud visual design"
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
              />
            </div>
          </motion.div>
        </header>

        <section id="conference" className="scroll-mt-28 space-y-10 pt-24 md:space-y-12 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>About Apsara Conference</Eyebrow>
            <SectionTitle className="mt-6">A global summit for cloud and AI</SectionTitle>
            <Prose className="mt-10">
              <p>
                The Apsara Conference is a premier event showcasing the latest in technology and innovation, serving as
                a global summit for cutting-edge fields like cloud computing and artificial intelligence. Since its
                launch in 2009, the Apsara Conference has grown into one of the world&apos;s foremost platforms for
                technological exchange, offering a significant stage for Alibaba Group to present its latest
                advancements.
              </p>
              <p>
                It attracts industry experts and academic scholars from around the globe to discuss the future of the
                cloud computing landscape—and, increasingly, how AI and cloud work together as foundational
                infrastructure for the next decade of products and services.
              </p>
            </Prose>
          </Reveal>
        </section>

        <section id="approach" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Design approach</Eyebrow>
            <SectionTitle className="mt-6">Built for live audiences and broadcast</SectionTitle>
            <Prose className="mt-10">
              <p>
                Conference visuals at this scale have to work in three places at once: the room, the screen, and the
                stream. The work prioritized high-contrast typography, disciplined color, and motion that supports
                narrative beats without distracting from speakers and demos.
              </p>
            </Prose>
          </Reveal>

          
        </section>

        <section id="system" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Visual system</Eyebrow>
            <SectionTitle className="mt-6">One thread from opening keynotes to partner halls</SectionTitle>
            <Prose className="mt-10">
              <p>
                The system extends across large-format stage graphics, session titles, and digital collateral—so the
                event feels like one continuous story. 
              </p>
              
            </Prose>
          </Reveal>
        </section>
      </article>
    </div>
  );
}
