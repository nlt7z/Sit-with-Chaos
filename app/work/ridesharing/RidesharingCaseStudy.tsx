"use client";

import {
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { CaseStudyMeta } from "@/components/CaseStudyMeta";
import { CASE_STUDY_META } from "@/lib/caseStudyMeta";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Calm editorial ease */
const easeOut = [0.25, 0.1, 0.25, 1] as const;
/** Slightly slower, premium ease */
const easePremium = [0.16, 1, 0.3, 1] as const;

function AmbientCursorGlow({ reduceMotion }: { reduceMotion: boolean }) {
  const mouseX = useSpring(48, { stiffness: reduceMotion ? 400 : 38, damping: reduceMotion ? 80 : 28 });
  const mouseY = useSpring(42, { stiffness: reduceMotion ? 400 : 38, damping: reduceMotion ? 80 : 28 });

  const wash = useMotionTemplate`radial-gradient(52rem at ${mouseX}% ${mouseY}%, rgba(255, 255, 255, 0.78) 0%, rgba(250, 250, 252, 0.42) 42%, rgba(250, 250, 252, 0) 68%)`;
  const tint = useMotionTemplate`radial-gradient(36rem at ${mouseX}% ${mouseY}%, rgba(120, 145, 255, 0.07) 0%, rgba(255, 200, 170, 0.04) 38%, transparent 58%)`;

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / Math.max(window.innerWidth, 1)) * 100;
      const y = (e.clientY / Math.max(window.innerHeight, 1)) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, mouseX, mouseY]);

  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(100%_70%_at_50%_-10%,rgba(255,255,255,0.9),rgba(250,250,252,0.96)_55%,#fafafa_100%)]"
      />
    );
  }

  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#fafafa]" style={{ backgroundImage: wash }} />
      <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: tint }} />
    </>
  );
}

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "framework", label: "Framework" },
  { id: "iterations", label: "Iterations" },
  { id: "companion", label: "Brooklyn" },
  { id: "insights", label: "Insights" },
  { id: "next", label: "Next" },
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
      <div className="pointer-events-auto sticky top-[calc(50vh-9rem)] px-6 pt-32">
        <p className="font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-textSecondary/60">
          On this page
        </p>
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
                className={`block border-l border-transparent py-2 pl-4 text-left text-[12px] leading-snug transition-[color,border-color,opacity] duration-500 ease-out ${
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
      transition={{ duration: reduce ? 0.01 : 1.05, delay, ease: easePremium }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-textSecondary/65">
      {children}
    </p>
  );
}

function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-2xl space-y-8 text-[17px] font-normal leading-[1.68] tracking-[-0.015em] text-textSecondary md:text-[1.125rem] md:leading-[1.72] ${className}`}
    >
      {children}
    </div>
  );
}

function ProseP({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function PullQuote({ children }: { children: ReactNode }) {
  return (
    <figure className="my-24 md:my-36 lg:my-44">
      <blockquote className="max-w-3xl border-l border-black/[0.06] pl-9 md:pl-12">
        <p className="font-display text-[1.4rem] font-light leading-[1.35] tracking-[-0.025em] text-textPrimary md:text-[1.75rem] md:leading-snug lg:text-[1.85rem]">
          {children}
        </p>
      </blockquote>
    </figure>
  );
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`max-w-[40rem] font-display text-[1.85rem] font-light leading-[1.12] tracking-[-0.03em] text-textPrimary md:text-[2.25rem] md:leading-[1.1] lg:text-[2.375rem] ${className}`}
    >
      {children}
    </h2>
  );
}

function Subheading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mt-14 max-w-2xl font-display text-[1.2rem] font-light tracking-[-0.025em] text-textPrimary first:mt-0 md:mt-16 md:text-xl ${className}`}
    >
      {children}
    </h3>
  );
}

function MediaFigure({
  src,
  alt,
  width,
  height,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const isGif = src.endsWith(".gif");
  const isPng = src.endsWith(".png");

  return (
    <motion.figure
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: reduce ? 0.01 : 1.1, ease: easePremium }}
    >
      <div
        className={`overflow-hidden rounded-[1.25rem] md:rounded-[1.5rem] ${isPng ? "bg-transparent" : "bg-white/50 shadow-[0_1px_0_rgba(0,0,0,0.04),0_32px_64px_-40px_rgba(0,0,0,0.12)]"}`}
      >
        <motion.div
          transition={{ duration: 0.7, ease: easePremium }}
          whileHover={
            reduce ? undefined : { boxShadow: "0 40px 80px -48px rgba(0,0,0,0.14)" }
          }
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized={isGif}
            sizes="(max-width: 1024px) 100vw, min(1200px, 88vw)"
            className="h-auto w-full"
            priority={src.includes("heroshowcase")}
          />
        </motion.div>
      </div>
      {caption ? (
        <figcaption className="mt-6 max-w-xl text-[13px] leading-relaxed tracking-[-0.01em] text-textSecondary/80 md:text-[0.9375rem]">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}

function DesignQuestionCallout() {
  const reduce = useReducedMotion();

  return (
    <motion.figure
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: easePremium }}
      className="my-20 md:my-28"
    >
      <p className="font-mono text-[10px] font-normal uppercase tracking-[0.22em] text-textSecondary/65">
        The design question
      </p>
      <blockquote className="mt-8 max-w-3xl border-l border-black/[0.06] pl-9 md:pl-12">
        <p className="font-display text-[1.4rem] font-light italic leading-[1.3] tracking-[-0.03em] text-textPrimary md:text-[1.85rem] md:leading-snug">
          “In a driverless context, how do passengers regain a sense of control and emotional connection through the
          HMI — and turn the cabin into a space worth being in?”
        </p>
      </blockquote>
      <p className="mt-8 max-w-2xl text-[15px] leading-relaxed tracking-[-0.01em] text-textSecondary md:text-[1.0625rem] md:leading-relaxed">
        <span className="font-medium text-textPrimary">Control</span> and{" "}
        <span className="font-medium text-textPrimary">emotional connection</span> were deliberate: control because
        unfamiliar vehicles in unfamiliar cities feel exposing, and trust is built through small moments of agency.
        Emotional connection because transportation without presence is only transit — and transit is a commodity.
      </p>
    </motion.figure>
  );
}

export default function RidesharingCaseStudy() {
  const reduceMotion = useReducedMotion();
  const prototypeUrl =
    "https://www.figma.com/proto/Af2owjqGXaZlt8Sl4cuTdb/518---Assignments?page-id=484%3A11169&node-id=849-72496&t=VTU94grvbi8EoLzL-0&scaling=scaledown&content-scaling=fixed&starting-point-node-id=776%3A32784";
  const prototypeEmbedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 48]);
  const heroImgScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.02]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 20]);

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.14,
          delayChildren: reduceMotion ? 0 : 0.08,
        },
      },
    }),
    [reduceMotion],
  );

  const insightCard = useMemo(
    () => ({
      hidden: { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: easePremium },
      },
    }),
    [],
  );

  return (
    <div className="relative min-h-screen bg-white">
      <CaseNav />
      <article className="relative z-[1] mx-auto max-w-content bg-white px-6 pb-52 pt-28 text-left md:px-10 md:pb-64 md:pt-36 lg:pl-32 lg:pr-10 lg:pb-72 lg:pt-40">
        {/* —— Overview —— */}
        <header id="overview" ref={heroRef} className="scroll-mt-28">
          <motion.div style={{ y: heroTextY }} className="max-w-4xl will-change-transform">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: easePremium }}
            >
              <Eyebrow>Case study · Automotive HMI · Autonomous ride-sharing</Eyebrow>
            </motion.p>
            <CaseStudyMeta className="mt-5" {...CASE_STUDY_META.ridesharing} />
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: reduceMotion ? 0 : 0.05, ease: easePremium }}
              className="mt-10 font-display text-[clamp(2.5rem,6.2vw,4rem)] font-light leading-[1.04] tracking-[-0.035em] text-textPrimary"
            >
              AI Agentic Autonomous Ridesharing Experience
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: reduceMotion ? 0 : 0.1, ease: easePremium }}
              className="mt-7 max-w-2xl text-xl font-light leading-snug tracking-[-0.022em] text-textPrimary/72 md:mt-8 md:text-2xl md:leading-[1.35]"
            >
              Designing an empathetic in-cabin experience for autonomous ride-sharing.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.14, ease: easePremium }}
              className="mt-10 max-w-4xl overflow-hidden rounded-[1.15rem] border border-black/[0.1] bg-white/80 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-center justify-between border-b border-black/[0.08] px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/78">
                  Product Preview · Interactive Prototype
                </p>
                <a
                  href={prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary transition-colors hover:text-textPrimary"
                >
                  Open ↗
                </a>
              </div>
              <div className="aspect-[16/9] w-full bg-neutral-100">
                <iframe
                  title="Autonomous ridesharing prototype preview"
                  src={prototypeEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </motion.div>
            <motion.dl
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.16, ease: easePremium }}
              className="mt-16 grid gap-y-6 border-t border-black/[0.06] pt-12 sm:grid-cols-2 sm:gap-x-16"
            >
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Role</dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">UX Research · UX Design</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">
                  Timeline
                </dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">10 weeks · 2024</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Team</dt>
                <dd className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-textPrimary">
                  1 supervisor · 1 PM · 1 UX researcher · 2 UX designers
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Domain</dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">
                  Automotive HMI · Autonomous vehicles · AI interaction design
                </dd>
              </div>
            </motion.dl>
          </motion.div>

          

          <Reveal className="mt-28 max-w-2xl md:mt-40 lg:mt-48">
            <Eyebrow>A space that&apos;s finally yours</Eyebrow>
            <SectionTitle className="mt-8">A moving private room</SectionTitle>
            <Prose className="mt-12 !max-w-2xl">
              <ProseP>
                Picture landing in a city you have never been to. You get into a car — and there is no one there. No
                driver glancing in the mirror, no obligation to make conversation, no one else&apos;s music. For a
                moment, before most people catch themselves, that can feel surprisingly good.
              </ProseP>
              <ProseP>
                In 2024, autonomous-vehicle research almost always framed the problem as{" "}
                <span className="text-textPrimary">loss</span>: the loss of the driver, of reassurance, of human
                presence. The more we listened to riders, the less that framing matched what they described wanting
                from their best rides. They did not want a replacement for the driver. They wanted the unhurried,
                private, genuinely enjoyable time the city rarely gives you.
              </ProseP>
              <ProseP>
                Autonomous ride-sharing is not only removing a person from a car. It is creating something new:{" "}
                <span className="font-medium text-textPrimary">a moving private room</span>. A private room deserves
                to be designed like one.
              </ProseP>
            </Prose>
          </Reveal>

          <Reveal className="mt-28 max-w-2xl md:mt-36">
            <Eyebrow>A note on timing</Eyebrow>
            <SectionTitle className="mt-8">Built in 2024, read with 2026 in mind</SectionTitle>
            <Prose className="mt-12 !max-w-2xl">
              <ProseP>
                Since this project, the landscape has shifted — Waymo at scale in multiple U.S. cities, Zoox testing
                inward-facing cabins, in-cabin AI moving from research to live product. Some of what we sketched has
                already shipped; some of it was ahead of what hardware could support at the time.
              </ProseP>
              <ProseP>
                I am sharing the story with that context intact. Design work is dated; what matters is whether the
                reasoning underneath still holds.
              </ProseP>
            </Prose>
            <MediaFigure
              className="mt-14 max-w-3xl"
              src="/assets/ridesharing/waymo.jpg"
              alt="Waymo autonomous ride-sharing vehicle in live city operation"
              width={3000}
              height={2000}
              //caption="Waymo in 2026"
            />
          </Reveal>
        </header>

        {/* —— Research —— */}
        <section id="research" className="scroll-mt-28 space-y-32 pt-32 md:space-y-40 md:pt-44 lg:space-y-48 lg:pt-52">
          <Reveal>
            <Eyebrow>What passengers were actually missing</Eyebrow>
            <SectionTitle className="mt-8">The &ldquo;during&rdquo; barely existed</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                Before touching a design tool, we mapped the full ride-sharing experience across Uber, Lyft — every touchpoint from app open to walk-away. The pattern was consistent: almost all product
                effort goes into the <span className="text-textPrimary">before</span> (booking, pickup) and a
                meaningful amount into the <span className="text-textPrimary">after</span> (receipts, ratings,
                support). The <span className="text-textPrimary">during</span> — the minutes inside the vehicle —
                barely existed as a designed experience, because the driver fills that space by default.
              </ProseP>
              <ProseP>
                Drivers fill it inconsistently. We surveyed fifty-plus frequent riders: about half enjoy spontaneous
                conversation, a third prefer none, and the rest only when necessary. That looked impossible to design
                for — until we reframed it. Passengers were not choosing &ldquo;chatty vs. quiet.&rdquo; They wanted{" "}
                <span className="font-medium text-textPrimary">choice</span>: engagement on their own terms, without
                asking permission.
              </ProseP>
              <ProseP>
                In deeper interviews, travel — not the commute, but the{" "}
                <span className="text-textPrimary">arrival</span> — kept surfacing: landing somewhere new and wanting
                to feel oriented, not just transported. The best drivers offer local intelligence; most do not. A
                driverless vehicle with a well-designed AI could reliably offer what great drivers offer only
                sometimes.
              </ProseP>
            </Prose>
          </Reveal>

          

          

          <Reveal>
            <Eyebrow>Who we were designing for</Eyebrow>
            <SectionTitle className="mt-8">Willing skeptics, not true believers</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                We chose to design for people curious enough to try autonomy once — where a single ride either earns
                trust or loses it. Our anchor persona was Michelle: twenty-five, marketing, Seattle, a frequent
                traveler who uses rides as transition time between meetings and hotels. She likes good conversation when
                it happens, but she has had enough awkward or silent rides to know it is not guaranteed. She wants to
                feel she is <span className="text-textPrimary">arriving</span> somewhere, not only being dropped at
                coordinates.
              </ProseP>
            </Prose>
          </Reveal>

          <PullQuote>
            I want to enjoy the ride. Sometimes I want to see the scenery, and sometimes I want to chat about the
            history of a pass-by building. But what I do in the car actually depends on the driver. And I&apos;m
            always very passive.
          </PullQuote>

          <Reveal>
            <Prose>
              <ProseP>
                That sentence reframed the problem. We had treated the driverless car as a space{" "}
                <span className="text-textPrimary">missing a person</span>. Michelle described a space with{" "}
                <span className="text-textPrimary">untapped potential</span> — one that could be more knowledgeable,
                more curious, and more reliably present than any single human driver. Designed well, it could be better,
                not worse, than having a driver.
              </ProseP>
            </Prose>
          </Reveal>

          <Reveal>
            <DesignQuestionCallout />
          </Reveal>
        </section>

        {/* —— Framework —— */}
        <section id="framework" className="scroll-mt-28 space-y-32 pt-32 md:space-y-40 md:pt-44 lg:space-y-48 lg:pt-52">
          <Reveal>
            <Eyebrow>Structuring the experience</Eyebrow>
            <SectionTitle className="mt-8">Three emotional layers</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                I mapped how features should function emotionally — not only what they do, but what they are for —
                before opening a design tool. Everything sorted into three layers, with a hard rule: lower layers are
                never sacrificed for higher ones. The joy layer is what riders talk about afterward — the delta
                between acceptable and memorable.
              </ProseP>
            </Prose>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
              <div className="grid gap-4 py-6 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/65 md:grid-cols-[1fr_1.15fr_1.25fr] md:gap-8 md:py-7">
                <span>Layer</span>
                <span className="hidden md:inline">Role</span>
                <span className="hidden md:inline">What it answers</span>
              </div>
              {[
                {
                  layer: "Safety + Control",
                  goal: "Foundation — navigation, climate, emergency support.",
                  ans: "Can I change something if I need to? Without that, passengers never relax enough to enjoy anything else.",
                },
                {
                  layer: "Comfort + Trust",
                  goal: "Middle layer — AI assistant, feedback, seat, vehicle information.",
                  ans: "Does this system know I am here? Awareness of the individual, not the passenger as a category.",
                },
                {
                  layer: "Joy + Personalization",
                  goal: "Surface — Ride & Discover, Zen modes, entertainment, memory.",
                  ans: "Is this ride worth having? Not only safe and comfortable — actually good.",
                },
              ].map((row) => (
                <div
                  key={row.layer}
                  className="grid gap-3 py-7 text-[15px] leading-relaxed md:grid-cols-[1fr_1.15fr_1.25fr] md:gap-8 md:py-8"
                >
                  <p className="font-medium text-textPrimary">{row.layer}</p>
                  <p className="text-textSecondary">{row.goal}</p>
                  <p className="text-textSecondary/90">{row.ans}</p>
                </div>
              ))}
            </div>
          </Reveal>

         

          <Reveal delay={0.06}>
            <Eyebrow>Feature prioritization</Eyebrow>
            <SectionTitle className="mt-8">Sequencing across the sprint</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                With the framework in place, we ran a formal prioritization exercise to sequence design and prototype
                work.
              </ProseP>
            </Prose>
            <ul className="mt-10 max-w-2xl space-y-6 border-l border-black/[0.08] pl-8 text-[17px] leading-[1.65] text-textSecondary md:text-lg md:leading-[1.7]">
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">P1 — Core</p>
                <p className="mt-2 text-textSecondary">
                  <span className="text-textPrimary">Landing and onboarding, map and navigation, personalized voice AI.</span>{" "}
                  The trust floor — without these, the product does not function.
                </p>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">P2 — Usability</p>
                <p className="mt-2 text-textSecondary">
                  <span className="text-textPrimary">Climate (AC/HVAC), Ride & Discover.</span> Makes the experience
                  tolerable and differentiated.
                </p>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">P3 — Enhancement</p>
                <p className="mt-2 text-textSecondary">
                  <span className="text-textPrimary">
                    Entertainment, seat adjustments, contact support and emergency features.
                  </span>{" "}
                  High safety significance but lower frequency — visible enough to reassure, not loud enough to alarm.
                </p>
              </li>
              <li>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/70">P4 — Depth</p>
                <p className="mt-2 text-textSecondary">
                  <span className="text-textPrimary">Vehicle information, extended AI conversation</span> — for
                  passengers who want more, without burdening those who do not.
                </p>
              </li>
            </ul>
          </Reveal>

          
        </section>

        {/* —— Iterations —— */}
        <section id="iterations" className="scroll-mt-28 space-y-32 pt-32 md:space-y-40 md:pt-44 lg:space-y-48 lg:pt-52">
          <Reveal>
            <Eyebrow>Design iterations</Eyebrow>
            <SectionTitle className="mt-8">Three rounds of RITE in ten weeks</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                Rapid Iterative Testing and Evaluation — each round with a more refined prototype and a different user
                segment. What follows is what broke, what surprised us, and what we changed.
              </ProseP>
            </Prose>
          </Reveal>

          <Reveal>
            <Eyebrow>Iteration 1</Eyebrow>
            <SectionTitle className="mt-8">Wireframes to low-fi prototype</SectionTitle>
            <p className="mt-4 font-mono text-[11px] text-textSecondary/80">
              Testing with: friends and classmates (personal network)
            </p>
            <Prose className="mt-8">
              <ProseP>
                The first build used a five-tab bottom bar: Ride & Discover, Navigation, Climate, Entertainment, and
                Support. The AI assistant lived inside a tab as its own section.
              </ProseP>
            </Prose>
            <Subheading className="!mt-10">What broke immediately</Subheading>
            <Prose className="mt-6">
              <ProseP>
                Five tabs on a seatback screen, for someone in motion and possibly in low light, was too many.
                Participants hesitated before every tap. Nobody failed tasks; nobody felt confident. We cut to four,
                then moved away from tabs as primary navigation.
              </ProseP>
              <ProseP>
                Labels like &ldquo;Climate Control,&rdquo; read as
                professional, we actually get this term from Tesla, but it's hard to understand for most users. We changed it to &ldquo;AC Control,&rdquo; which is more intuitive, and audited every string against a plain-language standard.
              </ProseP>
              <ProseP>
                The AI buried in a tab was the biggest structural miss: people forgot it existed or found it by
                accident. Placement said &ldquo;secondary feature,&rdquo; not primary way to talk to the car.
              </ProseP>
            </Prose>
            <Subheading>Changes made</Subheading>
            <Prose className="mt-6">
              <ProseP>
                Reduced tabs and planned a navigation restructure; replaced jargon with contextually intuitive labels;
                surfaced the AI as a persistent, always-visible element instead of a tabbed sub-feature.
              </ProseP>
            </Prose>
            <div className="mt-14 grid gap-10 lg:grid-cols-1 lg:gap-12">
              <MediaFigure
                src="/assets/ridesharing/first-prototype.png"
                alt="Early intelligent companion layout with modular cards"
                width={2481}
                height={990}
                caption="Early structure onborading: tabs, cards, and the assistant still finding its hierarchy."
              />
              <MediaFigure
                src="/assets/ridesharing/first-prototype-2.svg"
                alt="Low-fi wireframe variant — tab and card relationships"
                width={1040}
                height={415}
                caption="Reducing cognitive load before visual polish."
              />
            </div>
          </Reveal>

          <Reveal delay={0.04}>
            <Eyebrow>Iteration 2</Eyebrow>
            <SectionTitle className="mt-8">Low-fi to mid-fi prototype</SectionTitle>
            <p className="mt-4 font-mono text-[11px] text-textSecondary/80">
              Testing with: frequent ride-sharing users (had experience of 3+ rides in a week)
            </p>
            <Prose className="mt-8">
              <ProseP>
                The AI became a persistent floating presence — avatar plus chat bubble, tappable or voice-activated. The
                direction felt right; execution created new problems.
              </ProseP>
            </Prose>
            <Subheading className="!mt-10">What broke</Subheading>
            <Prose className="mt-6">
              <ProseP>
                The avatar and bottom feature cards competed visually. Eyes bounced between map, character, and cards.
                One participant said it felt like &ldquo;a lot of things trying to talk to me at once.&rdquo;
              </ProseP>
              <ProseP>
                The character was the same visual weight as a climate card, so people treated it like any other card —
                tap when you want a chatbot, ignore it otherwise. That is the wrong behavior for an assistant.
              </ProseP>
              
            </Prose>
            <Subheading>Changes made</Subheading>
            <Prose className="mt-6">
              <ProseP>
                Scaled the AI for priority over cards; redesigned cards so affordance reads as tappable without a
                tutorial; added onboarding for first-time vs. returning riders; made voice the default path with a
                persistent mic in the header, tap-to-type as fallback.
              </ProseP>
            </Prose>
            <div className="mt-14 space-y-14">
              <MediaFigure
                src="/assets/ridesharing/onboarding.gif"
                alt="Onboarding flow for first-time versus returning riders"
                width={1920}
                height={1080}
                caption="Onboarding — orienting riders before they hit the main dashboard."
              />
              <MediaFigure
                src="/assets/ridesharing/ai-assistant-prototype.png"
                alt="AI assistant mode prototype"
                width={3498}
                height={944}
                caption="From feature tab to persistent assistant."
              />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <Eyebrow>Iteration 3</Eyebrow>
            <SectionTitle className="mt-8">High-fidelity prototype</SectionTitle>
            <p className="mt-4 font-mono text-[11px] text-textSecondary/80">
              Testing with: passengers who had already ridden in an autonomous vehicle
            </p>
            <Prose className="mt-8">
              <ProseP>
                This group had the sharpest eye and the most useful feedback — a concrete reference for what felt
                missing in commercial experiences.
              </ProseP>
            </Prose>
            <Subheading className="!mt-10">What broke (and what surprised us)</Subheading>
            <Prose className="mt-6">
              <ProseP>
                A participant talked to Brooklyn mid-ride while the full dashboard was visible — map in motion, status
                bar, all cards. They struggled to stay in the conversation. We had not designed active voice as its own mode.
              </ProseP>
              <ProseP>
                We redesigned the active AI state as a <span className="text-textPrimary">full-screen takeover</span>:
                when Brooklyn listens or talks, and the screen belongs to the
                conversation. When the session ends, the dashboard returns. In later tests, people described that as
                the moment the AI felt &ldquo;real.&rdquo;
              </ProseP>
              <ProseP>
                Preset modes were not optional. A heavy user said they wanted the car to know they were in work mode —
                to match their energy. We had deprioritized Zen modes as complex; we built four in two days: Default,
                Calm, Work, Party — coordinated lighting, audio, seat, and AI tone. They became the most-mentioned feature
                in debriefs.
              </ProseP>
              <ProseP>
                Entertainment needed a clearer reason to exist beyond music and video. A selfie / photo mode inside the
                panel landed unexpectedly well: riders already take photos on their phones but feel awkward with a
                driver present. The autonomous cabin removes that friction; &ldquo;Create Memories&rdquo; formalized a
                behavior people had been suppressing.
              </ProseP>
              <ProseP>
                Contact support was redesigned so emergency pull-over and call support are available through layered
                disclosure &mdash; prominent when needed, not anxiety-inducing by default.
              </ProseP>
            </Prose>
            
            <div className="mt-16 space-y-16">
              <MediaFigure
                src="/assets/ridesharing/ai-voice-interaction.png"
                alt="Full-screen voice interaction state"
                width={1777}
                height={400}
                caption="Before and After Voice-active state: focused conversation."
              />
             
              
            </div>
            <div className="mt-16 grid gap-10 lg:grid-cols-1 lg:gap-12">
            <MediaFigure
                src="/assets/ridesharing/safety-drop-off.gif"
                alt="Support and emergency flows with layered disclosure"
                width={1440}
                height={1044}
                caption="Support & safety — reachable escalation without ambient anxiety."
              />
              </div>
            <div className="mt-16 border-t border-black/[0.06] pt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/68">Ride-explore module</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary">
                This sits closest to trip utility: map-first orientation, local guide overlays, and frictionless stop planning.
              </p>
              <MediaFigure
                className="mt-7"
                src="/assets/ridesharing/final-feature-1.png"
                alt="High-fidelity cabin UI — ride-explore module"
                width={1500}
                height={719}
                caption="Ride-explore: interactive map, city guide, add stops, and share route context."
              />
            </div>

            
          </Reveal>
        </section>

        {/* —— Brooklyn —— */}
        <section id="companion" className="scroll-mt-28 space-y-28 pt-32 md:space-y-36 md:pt-44 lg:space-y-40 lg:pt-52">
          <Reveal>
            <Eyebrow>Brooklyn</Eyebrow>
            <SectionTitle className="mt-8">The AI that belongs here</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                The assistant persona was a late addition and became the most significant design decision. Each city
                gets a character rooted in that place: accent, slang, cultural knowledge, humor. Brooklyn is hip-hop
                and hustle and knowing where the real slice is. Tokyo would know tourist Shibuya vs. local Shimokitazawa;
                New Orleans might talk second lines and po&apos;boy shops that do not tourist-price you.
              </ProseP>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <MediaFigure
                src="/assets/ridesharing/localization1.jpg"
                alt="Localization and voice character exploration"
                width={1980}
                height={1320}
              />
            </Reveal>
            <Reveal delay={0.08}>
              <MediaFigure
                src="/assets/ridesharing/localization2.jpg"
                alt="Brooklyn voice and content direction"
                width={799}
                height={600}
              />
            </Reveal>
          </div>
              <ProseP>
                The technical prototype paired ChatGPT for dialogue with ElevenLabs for voice. The goal was not to demo
                technology — it was to test whether a designed persona could make the cabin feel inhabited: local
                knowledge, curiosity, unhurried presence.
              </ProseP>
              <ProseP>In every session, Brooklyn was the only thing participants wanted to talk about afterward.</ProseP>
            </Prose>
          </Reveal>

          <Reveal delay={0.05}>
            <MediaFigure
              src="/assets/ridesharing/brooklyn.gif"
              alt="Brooklyn AI assistant in conversation with animated presence"
              width={600}
              height={338}
              caption="Motion study — Brooklyn as a present, conversational layer in the cabin."
            />
          </Reveal>

          

          <PullQuote>
            Let&apos;s turn up the NYC vibes with Jay-Z and Alicia Keys &mdash; &lsquo;Empire State of Mind.&rsquo; A
            perfect anthem for the city that never sleeps.
          </PullQuote>
        </section>

        {/* —— Insights —— */}
        <section id="insights" className="scroll-mt-28 space-y-32 pt-32 md:space-y-40 md:pt-44 lg:space-y-48 lg:pt-52">
          <Reveal>
            <Eyebrow>What testing confirmed</Eyebrow>
            <SectionTitle className="mt-8">Three findings, every round</SectionTitle>
          </Reveal>

          <motion.div
            className="grid gap-6 md:grid-cols-3 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
          >
            {[
              {
                title: "Voice is the interaction",
                body: "In motion, riders do not want to hunt menus. The AI is not a feature inside the product — it is the product. Cards and controls exist in service of a voice-first passenger who should reach anything by speaking.",
              },
              {
                title: "Agency builds trust",
                body: "Everyone who changed even one thing — temperature, a Zen mode, a question to Brooklyn — reported feeling more comfortable with autonomy. Changing something makes the environment feel yours.",
              },
              {
                title: "Emotional moments are remembered",
                body: "When asked to describe the product to a friend, people said “the car with Party Mode” and “Brooklyn.” Nobody led with navigation. Personal moments are how products spread.",
              },
            ].map((c) => (
              <motion.article
                key={c.title}
                variants={insightCard}
                className="group rounded-2xl border border-black/[0.05] bg-white/80 px-8 py-10 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[border-color,box-shadow,background-color,transform] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-black/[0.08] hover:bg-white hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.08)] md:px-10 md:py-12"
              >
                <h3 className="font-display text-lg font-light tracking-[-0.02em] text-textPrimary md:text-xl">
                  {c.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-textSecondary md:text-[15px]">{c.body}</p>
              </motion.article>
            ))}
          </motion.div>

          <Reveal className="max-w-2xl">
            <Eyebrow>What I carried out</Eyebrow>
            <SectionTitle className="mt-8">From missing driver to moving room</SectionTitle>
            <Prose className="mt-12 !max-w-2xl">
              <ProseP>
                I went in thinking about drivers and what happens when you remove them. I came out thinking about
                something else: the driverless cabin is the first form of transportation that is structurally private —
                no one else&apos;s agenda, no social performance. That is less a problem to fix than an opportunity
                barely touched.
              </ProseP>
              <ProseP>
                Brooklyn, Zen modes, Create Memories, voice-first layout, full-screen AI state — each decision returned
                to one question:{" "}
                <span className="text-textPrimary">
                  does this help the passenger actually be somewhere — not only transported, but present and oriented?
                </span>
              </ProseP>
            </Prose>
            
          </Reveal>
        </section>

        {/* —— Next —— */}
        <section id="next" className="scroll-mt-28 space-y-24 pt-32 md:space-y-28 md:pt-44 lg:space-y-32 lg:pt-52">
          <Reveal>
            <Eyebrow>Looking forward</Eyebrow>
            <SectionTitle className="mt-8">It is 2026</SectionTitle>
            <Prose className="mt-12">
              <ProseP>
                Waymo is in cities I did not expect this quickly. Navigation transparency, real-time awareness, calm
                signaling of vehicle behavior — much of what we imagined at the interaction layer is now product. The
                gap between the 2024 concept and today feels smaller than I expected.
              </ProseP>
              <ProseP>
                What has not closed: the cabin. The screen is still a center-console layer on a body not designed for
                it; the passenger experience is still downstream of the driving stack. The next phase opens when
                inward-facing interiors, integrated ambient systems, and AI with memory across rides are standard — when
                cabin and AI are conceived together from the start.
              </ProseP>
            </Prose>
          </Reveal>

          <Reveal>
            <Eyebrow>Three questions worth returning to</Eyebrow>
            <SectionTitle className="mt-8">Still open</SectionTitle>
            <ul className="mt-14 max-w-2xl space-y-10 text-[17px] leading-[1.65] text-textSecondary md:text-lg md:leading-[1.7]">
              {[
                {
                  title: "Memory that accumulates meaning",
                  text: "Saving a temperature is a feature. An AI that learns you prefer quiet on Monday mornings, that you ask for local food over tourist traps, that you got anxious on an unusual route — that edges toward a relationship. The space between settings and knowing you as a passenger is still barely explored.",
                },
                {
                  title: "Accessibility as first-class",
                  text: "Voice-first helped motion-sensitive riders look at the screen less — but voice-first also excludes. Speech- and hearing-diverse passengers need a touch layer that is equally capable and equally considered, not a degraded fallback.",
                },
                {
                  title: "Designing for uncertain moments",
                  text: "Trust is not only built in smooth stretches. It is maintained or broken in sudden braking, odd routes, sensor hesitation. We know where passengers start; designing the exact moments when trust wavers is the most interesting open problem in this space.",
                },
              ].map((item) => (
                <li key={item.title} className="border-l border-black/[0.08] pl-8">
                  <p className="font-medium text-textPrimary">{item.title}</p>
                  <p className="mt-2 text-textSecondary">{item.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.05}>
            <a
              href={prototypeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white/90 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-textPrimary shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,background-color,box-shadow,transform] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-black/[0.16] hover:bg-white hover:shadow-[0_20px_48px_-28px_rgba(0,0,0,0.1)] active:scale-[0.99]"
            >
              View interactive prototype
              <span aria-hidden className="text-sm opacity-60">
                ↗
              </span>
            </a>
          </Reveal>

          <Reveal className="pt-8 md:pt-12">
            <Link
              href="/#work"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary transition-colors duration-500 hover:text-textPrimary"
            >
              <span className="transition-transform duration-500 ease-out group-hover:-translate-x-0.5">←</span>
              Back to selected work
            </Link>
          </Reveal>
        </section>
      </article>
    </div>
  );
}
