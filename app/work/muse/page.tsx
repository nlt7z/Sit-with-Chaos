"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const easePremium = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "thesis", label: "Thesis" },
  { id: "gap", label: "Gap" },
  { id: "reframe", label: "Reframe" },
  { id: "system", label: "System" },
  { id: "hardware", label: "Hardware" },
  { id: "mapping", label: "Mapping" },
  { id: "scenes", label: "Scenes" },
  { id: "modes", label: "Modes" },
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

/** Media card for stills or short loops — used for glove photos and scene reels.
 *  The wrapper provides a soft warm-paper frame consistent with the portfolio's
 *  light surface, and locks aspect ratio so layout doesn't shift while assets load. */
function MediaCard({
  src,
  alt,
  label,
  caption,
  kind = "image",
  aspect = "4 / 3",
}: {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
  kind?: "image" | "video";
  aspect?: string;
}) {
  return (
    <figure className="space-y-3">
      {label ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-textSecondary/85">{label}</p>
      ) : null}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-black/[0.06] bg-nltLime-soft/40"
        style={{ aspectRatio: aspect }}
      >
        {kind === "video" ? (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            aria-label={alt}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        )}
      </div>
      {caption ? (
        <figcaption className="text-[13px] leading-relaxed text-textSecondary">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export default function MuseCaseStudyPage() {
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
                  Muse · Wearable Instrument · Independent Research
                </motion.p>
                <motion.h1
                  variants={heroItem}
                  className="mt-8 max-w-[20ch] font-display text-[2.65rem] font-light leading-[1.03] tracking-tight text-textPrimary sm:max-w-4xl md:text-[4rem] md:leading-[1.02]"
                >
                  Two senses, one song.
                </motion.h1>
                <motion.p
                  variants={heroItem}
                  className="mt-6 max-w-xl text-[16px] leading-[1.6] text-textSecondary"
                >
                  A sensor glove and a generative engine that let hearing aid users and their friends share music through different sensory channels — neither has to listen the way the other does.
                </motion.p>

                <motion.div
                  variants={heroItem}
                  className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-20"
                  aria-label="Project summary"
                >
                  <div className="space-y-10">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                        <p className="font-display text-[3.75rem] font-light leading-[0.95] tracking-[-0.02em] tabular-nums text-textPrimary md:text-[4.5rem] lg:text-[5rem]">
                          5<span className="text-[0.5em] text-textPrimary/70">ch</span>
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">
                          one hand
                        </p>
                      </div>
                      <p className="mt-4 max-w-md text-[15px] leading-[1.55] text-textSecondary">
                        Four bend + one pressure channel from the glove modulate color, motion, and scene. Audio analysis drives the base signal — gesture shapes it.
                      </p>
                    </div>

                    <dl className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-black/[0.08] pt-7 sm:grid-cols-3 sm:gap-y-0">
                      {[
                        { label: "Timeline", value: "2022.3 – 2022.5 · revisited 2023.9 – 2023.11" },
                        { label: "Role", value: "UX research · hardware · generative system" },
                        { label: "Stack", value: "Arduino · TouchDesigner · OSC · Python" },
                      ].map(({ label, value }) => (
                        <div key={label} className="min-w-0 border-l border-black/[0.1] pl-3">
                          <dt className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-textSecondary/50">{label}</dt>
                          <dd className="mt-2 font-sans text-[13px] leading-snug text-textSecondary/80">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Right — hero media (glove or share-mode demo). Drop the file
                      at /assets/muse/hero.mp4 (or .jpg) and it renders here. */}
                  <div className="hidden lg:flex lg:flex-col lg:items-start">
                    <div
                      className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-nltLime-soft/40 shadow-[0_28px_56px_-28px_rgba(0,0,0,0.18)]"
                      style={{ width: 340, height: 460 }}
                    >
                      <video
                        src="/assets/muse/hero.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/assets/muse/hero-poster.jpg"
                        className="absolute inset-0 h-full w-full object-cover"
                        aria-label="Muse glove driving a generative scene"
                      />
                    </div>
                    <p className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-nltLime" />
                      Glove → TouchDesigner · live capture
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </header>

            <Section id="thesis" eyebrow="Thesis" title="Most assistive audio assumes the wrong target experience.">
              <FadeIn>
                <p className="text-[17px] leading-[1.6] tracking-tight text-textPrimary/90">
                  Hearing aids are built to make music sound the way it sounds to hearing people. After nine interviews — hearing aid and cochlear implant users, family members, an ENT specialist — that assumption did not hold. The users I spoke with did not want a clearer copy of someone else&apos;s experience. They wanted music inside their own sensory vocabulary, and a way to share it with people whose taste differs from theirs.
                </p>
              </FadeIn>
              <FadeIn delay={0.08} className="mt-8 border-l-2 border-nltLime-ink/40 pl-5 sm:pl-6">
                <p className="text-[15px] leading-relaxed text-textSecondary">
                  Muse is a study in three questions that apply to any multi-modal interface:
                </p>
                <ol className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-textPrimary/85">
                  <li><span className="font-mono text-[10px] tracking-[0.18em] text-nltLime-ink">Q1.</span>  When the dominant sensory channel is unreliable, what becomes the new ground truth?</li>
                  <li><span className="font-mono text-[10px] tracking-[0.18em] text-nltLime-ink">Q2.</span>  How do you design a hardware mapping that feels like an instrument, not a remote control?</li>
                  <li><span className="font-mono text-[10px] tracking-[0.18em] text-nltLime-ink">Q3.</span>  How do two people share an experience without forcing them through the same sensory pipeline?</li>
                </ol>
              </FadeIn>
            </Section>

            <Section id="gap" eyebrow="Perception Gap" title="Two failure modes stack on top of each other.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  My friend wears hearing aids. She told me music sounds like noise to her, and she has stopped trying to understand why anyone enjoys it. I assumed this was a hardware problem. It is not — or at least not only. From the interview with Dr. L, an otolaryngologist specializing in deafness and tinnitus, the gap pieces together from two sides.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-12">
                <SubsectionHeader label="Side A · Human" hint="Many users lost hearing in childhood, before the window for music education. Specialized lessons exist but are not widely accessible. The sensory channel works for speech; the framework for music never developed." />
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.06] sm:grid-cols-3">
                  {[
                    ["No music education", "Cost-restricted access · piano / violin lessons are clinically recommended but not subsidized."],
                    ["Grow up", "Adult user has a channel that handles speech but has no framework for music."],
                    ["Music registers as noise", "Not a hardware artifact — a missing perceptual schema."],
                  ].map(([head, body], i) => (
                    <div key={i} className="bg-white px-5 py-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime-ink">
                        Step 0{i + 1}
                      </p>
                      <p className="mt-3 text-[15px] tracking-tight text-textPrimary">{head}</p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-textSecondary">{body}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.14} className="mt-16">
                <SubsectionHeader label="Side B · Hardware" hint="Hearing aids are tuned for speech. Speech sits in a narrow dynamic range and a predictable frequency band. Music does not." />
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.06] md:grid-cols-2">
                  {[
                    {
                      n: "Failure 01",
                      name: "Dynamic range compression",
                      body: "Music&apos;s loud-to-quiet swings get flattened. Tuned for speech, which sits in a narrow band.",
                    },
                    {
                      n: "Failure 02",
                      name: "Frequency cutoff",
                      body: "High and low extremes that give music its texture are clipped at the filter boundaries.",
                    },
                    {
                      n: "Failure 03",
                      name: "Slow transient response",
                      body: "Percussion and rapid attacks arrive smoothed instead of sharp.",
                    },
                    {
                      n: "Failure 04",
                      name: "Anti-feedback suppression",
                      body: "Suppresses sustained tones — which is exactly what melody is made of.",
                    },
                  ].map(({ n, name, body }) => (
                    <div key={n} className="bg-white px-5 py-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">{n}</p>
                      <p className="mt-3 text-[15px] tracking-tight text-textPrimary">{name}</p>
                      <p
                        className="mt-2 text-[13.5px] leading-relaxed text-textSecondary"
                        dangerouslySetInnerHTML={{ __html: body }}
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.18} className="mt-10">
                <p className="max-w-3xl text-[16px] leading-relaxed text-textPrimary/85">
                  The output reaching the cochlea is a degraded signal processed by a brain that never learned to read music. <span className="text-nltLime-ink">I had been thinking about Muse as a translation problem.</span> But translation assumes the target experience is the right one. What if the target experience was wrong for everyone?
                </p>
              </FadeIn>
            </Section>

            <Section id="reframe" eyebrow="Reframe" title="Stop translating. Start meeting in the middle.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  I ran nine semi-structured interviews across three groups: hearing aid and cochlear implant users, their family and partners, and hearing peers with strong music preferences. The deep dive was with Wendy, 25 — cochlear implants since childhood. Three findings from her reshaped the project.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  {
                    head: "Music is not binary",
                    body: "Wendy loves the guzheng. Hearing aids distort it, but the association is intact — the sound triggers a memory of mountains in childhood. Fidelity is not what makes music meaningful to her.",
                  },
                  {
                    head: "The hand is already an interface",
                    body: "She uses sign language with close friends and speech-to-text apps daily. Her hands are already doing the work of interpreting and producing language. A gesture-based music interface is an extension, not a new modality.",
                  },
                  {
                    head: "The goal is not normalization",
                    body: "After implant surgery the world became unfilterable — insect sounds especially. She has stopped trying to suppress them. She does not want to be normal. She wants tools that respect how she experiences the world.",
                  },
                ].map(({ head, body }, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.08] bg-white px-5 py-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">
                      Finding 0{i + 1}
                    </p>
                    <p className="mt-3 text-[15px] tracking-tight text-textPrimary">{head}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-textSecondary">{body}</p>
                  </div>
                ))}
              </FadeIn>

              <FadeIn delay={0.14} className="mt-12">
                <p className="text-[15px] leading-relaxed text-textSecondary">
                  From the hearing-peer side the pattern was different but related: people with strong music taste get rejected when they try to share it. The act of sharing music is more fragile than I had assumed. Headphones force everyone through one channel, and if the friend hates the genre, the shared moment collapses.
                </p>
              </FadeIn>

              <FadeIn delay={0.18} className="mt-12">
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-10">
                  <div className="rounded-xl border border-black/[0.08] bg-black/[0.03] px-6 py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/65">Initial framing</p>
                    <p className="mt-4 font-display text-[1.25rem] font-light italic leading-[1.4] tracking-tight text-textSecondary/65 line-through decoration-textSecondary/30">
                      How might we help people with hearing aids hear music more clearly?
                    </p>
                  </div>
                  <div className="hidden self-center font-mono text-[11px] tracking-[0.16em] text-textSecondary/60 lg:block">→</div>
                  <div className="rounded-xl border border-nltLime-ink/30 bg-nltLime-soft px-6 py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">Reframed problem</p>
                    <p className="mt-4 font-display text-[1.4rem] font-light leading-[1.35] tracking-tight text-nltLime-ink">
                      How might two people share a song through different sensory channels, so neither has to listen the way the other does?
                    </p>
                  </div>
                </div>
              </FadeIn>
            </Section>

            <Section id="system" eyebrow="System Architecture" title="Four components. Each solves one part of the problem.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  The system splits into an input layer, a processing layer, an OSC bridge, and a dual-display output. Audio drives the base signal; gesture modulates it. The bridge is what makes the share mode possible — both surfaces render from the same parameter stream, not from a mirrored frame.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-12">
                <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                  <svg viewBox="0 0 880 360" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <marker id="muse-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#5A7A12" />
                      </marker>
                      <pattern id="muse-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                        <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#000" strokeOpacity="0.04" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="880" height="360" fill="url(#muse-grid)" />

                    {/* Layer labels */}
                    <text x="40" y="36" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" letterSpacing="2" fill="#7a8466">INPUT</text>
                    <line x1="40" y1="44" x2="200" y2="44" stroke="#e5e7da" />
                    <text x="290" y="36" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" letterSpacing="2" fill="#7a8466">PROCESSING</text>
                    <line x1="290" y1="44" x2="450" y2="44" stroke="#e5e7da" />
                    <text x="530" y="36" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" letterSpacing="2" fill="#7a8466">BRIDGE</text>
                    <line x1="530" y1="44" x2="680" y2="44" stroke="#e5e7da" />
                    <text x="730" y="36" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" letterSpacing="2" fill="#7a8466">OUTPUT</text>
                    <line x1="730" y1="44" x2="840" y2="44" stroke="#e5e7da" />

                    {/* Input boxes */}
                    <rect x="40" y="68" width="160" height="68" fill="#ffffff" stroke="#d9dcc7" />
                    <text x="120" y="96" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">Sound</text>
                    <text x="120" y="116" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">.wav / live audio</text>

                    <rect x="40" y="232" width="160" height="86" fill="#fafdee" stroke="#5A7A12" strokeWidth="1" />
                    <text x="120" y="262" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">Glove</text>
                    <text x="120" y="282" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#5A7A12">FSR × 1</text>
                    <text x="120" y="298" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#5A7A12">BEND × 4</text>

                    {/* Processing boxes */}
                    <rect x="290" y="68" width="160" height="68" fill="#ffffff" stroke="#d9dcc7" />
                    <text x="370" y="96" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">TouchDesigner</text>
                    <text x="370" y="116" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">audio analysis</text>

                    <rect x="290" y="232" width="160" height="86" fill="#ffffff" stroke="#d9dcc7" />
                    <text x="370" y="262" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">Arduino Nano</text>
                    <text x="370" y="282" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">5ch analog @ 100Hz</text>
                    <text x="370" y="298" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">→ BT (HC-05)</text>

                    {/* Bridge */}
                    <rect x="540" y="148" width="160" height="80" fill="#fafdee" stroke="#5A7A12" strokeDasharray="3 3" />
                    <text x="620" y="178" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#5A7A12">OSC bridge</text>
                    <text x="620" y="198" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">Python parser</text>
                    <text x="620" y="213" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">→ TD channels</text>

                    {/* Outputs */}
                    <rect x="740" y="68" width="120" height="68" fill="#ffffff" stroke="#d9dcc7" />
                    <text x="800" y="96" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="13" fill="#1a1a1a">Laptop</text>
                    <text x="800" y="116" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">primary visual</text>

                    <rect x="740" y="232" width="120" height="68" fill="#ffffff" stroke="#d9dcc7" />
                    <text x="800" y="262" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="13" fill="#1a1a1a">Phone</text>
                    <text x="800" y="282" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#7a8466">shared view</text>

                    {/* Connections */}
                    <line x1="200" y1="102" x2="285" y2="102" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />
                    <line x1="200" y1="275" x2="285" y2="275" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />
                    <path d="M 450 102 Q 495 102 540 168" fill="none" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />
                    <path d="M 450 275 Q 495 275 540 208" fill="none" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />
                    <path d="M 620 148 L 620 118 Q 620 102 735 102" fill="none" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />
                    <path d="M 620 228 L 620 268 Q 620 266 735 266" fill="none" stroke="#5A7A12" strokeWidth="1" markerEnd="url(#muse-arr)" />

                    <text x="242" y="96" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" letterSpacing="1" fill="#7a8466">audio</text>
                    <text x="225" y="270" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" letterSpacing="1" fill="#7a8466">gesture data</text>
                    <text x="645" y="138" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" letterSpacing="1" fill="#7a8466">render</text>
                    <text x="645" y="248" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" letterSpacing="1" fill="#7a8466">OSC stream</text>
                  </svg>
                </div>
              </FadeIn>

              <FadeIn delay={0.14} className="mt-14">
                <SubsectionHeader label="Component choices" hint="Each decision traces back to a research finding or to the share-mode constraint." />
                <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  <Callout
                    index={1}
                    title="Glove, not controller."
                    body="Wendy&apos;s hands already carry meaning — sign, speech-to-text. The glove extends an existing vocabulary, and keeps both hands free so it feels like playing, not operating a device."
                  />
                  <Callout
                    index={2}
                    title="TouchDesigner, not a custom shader pipeline."
                    body="The interesting work is not the renderer. It is the mapping. TD lets me iterate the mapping layer fast — which is where the project lives or dies."
                  />
                  <Callout
                    index={3}
                    title="OSC, not screen mirroring."
                    body="Mirroring locks both viewers into one frame. OSC sends parameters — so the phone can render a simpler or different view of the same gesture. This is what the share mode requires."
                  />
                  <Callout
                    index={4}
                    title="Two sensor types, not one."
                    body="FSR captures pressure — continuous but coarse. Bend sensors capture articulated flexion. Together: five independent channels plus a binary mode-switch from the thumb FSR."
                  />
                </div>
              </FadeIn>
            </Section>

            <Section id="hardware" eyebrow="Hardware · Build" title="Schematic, mechanical, firmware. Every layer earns its place.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  Every layer of a wearable is coupled to the one below it. When V2&apos;s bend sensors broke at the solder joints, the mechanical redesign changed what gestures the firmware could read, which changed the mapping, which changed the visual grammar. The rest of this section is the engineering substrate: electrical topology, mechanical failure analysis, firmware, and the latency budget that determines whether the whole thing feels live.
                </p>
              </FadeIn>

              {/* ────────────── 06.1 · ELECTRICAL ────────────── */}
              <div className="mt-16">
                <SubsectionHeader
                  label="06.1 · Electrical"
                  hint="Five resistive sensors → voltage dividers → ATmega328P ADCs → level-shifted UART → HC-05 SPP. Topology is unremarkable; choosing it deliberately is the point."
                />

                <FadeIn>
                  <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                    <svg viewBox="0 0 880 460" className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="schem-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeOpacity="0.035" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="880" height="460" fill="url(#schem-grid)" />

                      {/* Power + GND rails */}
                      <line x1="40" y1="60" x2="840" y2="60" stroke="#5A7A12" strokeWidth="1.2" />
                      <text x="40" y="50" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#5A7A12">+5V</text>
                      <line x1="40" y1="400" x2="840" y2="400" stroke="#5A7A12" strokeWidth="1.2" />
                      <text x="40" y="418" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#5A7A12">GND</text>

                      {/* Section label — sensor channel */}
                      <text x="40" y="100" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1.5" fill="#7a8466">SENSOR CHANNEL · A0 (FSR)</text>

                      {/* Top wire from 5V rail */}
                      <line x1="100" y1="60" x2="100" y2="140" stroke="#1a1a1a" strokeWidth="1" />

                      {/* FSR symbol */}
                      <rect x="80" y="140" width="40" height="60" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="100" y="170" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="12" fill="#1a1a1a">FSR</text>
                      <text x="100" y="186" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" fill="#7a8466">Interlink 402</text>

                      {/* Wire to junction */}
                      <line x1="100" y1="200" x2="100" y2="260" stroke="#1a1a1a" strokeWidth="1" />
                      <circle cx="100" cy="260" r="3" fill="#1a1a1a" />
                      <text x="60" y="264" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#7a8466">node</text>

                      {/* Pull-down resistor */}
                      <line x1="100" y1="260" x2="100" y2="290" stroke="#1a1a1a" strokeWidth="1" />
                      <rect x="80" y="290" width="40" height="50" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="100" y="316" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#1a1a1a">10k</text>
                      <text x="100" y="332" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" fill="#7a8466">pull-down</text>
                      <line x1="100" y1="340" x2="100" y2="400" stroke="#1a1a1a" strokeWidth="1" />

                      {/* Tap to ADC */}
                      <line x1="100" y1="260" x2="280" y2="260" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="190" y="252" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">→ ADC A0</text>

                      {/* Repeat note — bend × 4 */}
                      <rect x="160" y="356" width="180" height="34" fill="#fafdee" stroke="#d9dcc7" strokeDasharray="3 2" />
                      <text x="172" y="372" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1" fill="#5A7A12">+ BEND × 4 · A1–A4</text>
                      <text x="172" y="384" fontFamily="ui-serif, Georgia, serif" fontSize="10" fontStyle="italic" fill="#7a8466">same divider topology, R_pull = 10k</text>

                      {/* Arduino Nano box */}
                      <rect x="300" y="180" width="180" height="160" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
                      <text x="390" y="208" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">Arduino Nano</text>
                      <text x="390" y="225" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#7a8466">ATmega328P · 16MHz</text>
                      <line x1="320" y1="240" x2="460" y2="240" stroke="#d9dcc7" />
                      <text x="312" y="264" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">A0</text>
                      <text x="312" y="278" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">A1–A4</text>
                      <text x="312" y="304" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">5V</text>
                      <text x="312" y="318" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">GND</text>
                      <text x="468" y="264" textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">D1 (TX)</text>
                      <text x="468" y="278" textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">D0 (RX)</text>

                      {/* ADC trace into Nano */}
                      <line x1="280" y1="260" x2="300" y2="260" stroke="#1a1a1a" strokeWidth="1" />

                      {/* Level shifter label */}
                      <text x="565" y="200" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" letterSpacing="1.5" fill="#7a8466">5V → 3.3V LEVEL SHIFT</text>

                      {/* TX leaves Nano */}
                      <line x1="480" y1="264" x2="520" y2="264" stroke="#1a1a1a" strokeWidth="1" />

                      {/* 1k series resistor */}
                      <rect x="520" y="244" width="40" height="40" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="540" y="269" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#1a1a1a">1k</text>

                      {/* Wire to junction */}
                      <line x1="560" y1="264" x2="640" y2="264" stroke="#1a1a1a" strokeWidth="1" />
                      <circle cx="610" cy="264" r="3" fill="#1a1a1a" />

                      {/* 2k pull-down at junction */}
                      <line x1="610" y1="264" x2="610" y2="300" stroke="#1a1a1a" strokeWidth="1" />
                      <rect x="590" y="300" width="40" height="40" fill="white" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="610" y="325" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fill="#1a1a1a">2k</text>
                      <line x1="610" y1="340" x2="610" y2="400" stroke="#1a1a1a" strokeWidth="1" />

                      {/* HC-05 box */}
                      <rect x="680" y="180" width="160" height="160" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
                      <text x="760" y="208" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontSize="14" fill="#1a1a1a">HC-05</text>
                      <text x="760" y="225" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#7a8466">BT Classic · SPP</text>
                      <line x1="700" y1="240" x2="820" y2="240" stroke="#d9dcc7" />
                      <text x="690" y="264" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">RX</text>
                      <text x="690" y="278" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">TX</text>
                      <text x="690" y="304" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">VCC</text>
                      <text x="690" y="318" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#5A7A12">GND</text>

                      {/* Level-shifted line into HC-05 RX */}
                      <line x1="640" y1="264" x2="680" y2="264" stroke="#1a1a1a" strokeWidth="1" />

                      {/* HC-05 TX → Nano RX (direct, 3.3V-on-5V is fine) */}
                      <line x1="680" y1="278" x2="660" y2="278" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="660" y1="278" x2="660" y2="360" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="660" y1="360" x2="480" y2="360" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="480" y1="360" x2="480" y2="278" stroke="#1a1a1a" strokeWidth="1" />
                      <text x="570" y="354" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="8" fill="#7a8466">3.3V → 5V tolerant · no shift</text>

                      {/* HC-05 power */}
                      <line x1="680" y1="304" x2="650" y2="304" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="650" y1="304" x2="650" y2="60" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="680" y1="318" x2="630" y2="318" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="630" y1="318" x2="630" y2="400" stroke="#1a1a1a" strokeWidth="1" />

                      {/* Nano power */}
                      <line x1="300" y1="304" x2="270" y2="304" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="270" y1="304" x2="270" y2="60" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="300" y1="318" x2="250" y2="318" stroke="#1a1a1a" strokeWidth="1" />
                      <line x1="250" y1="318" x2="250" y2="400" stroke="#1a1a1a" strokeWidth="1" />

                      {/* BT out */}
                      <text x="850" y="200" textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="10" fill="#7a8466">((·))</text>
                      <text x="850" y="216" textAnchor="end" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fill="#7a8466">→ host</text>
                    </svg>
                  </div>
                </FadeIn>

                {/* BOM */}
                <FadeIn delay={0.1} className="mt-12">
                  <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">BOM · Selection rationale</h4>
                  <div className="overflow-hidden rounded-2xl border border-black/[0.08]">
                    <div className="grid grid-cols-[120px_1.3fr_2fr] bg-black/[0.04] text-[10px]">
                      {["Role", "Part", "Why this part"].map((h, i) => (
                        <div key={h} className={`px-4 py-3 font-mono uppercase tracking-[0.18em] text-textSecondary/75 ${i < 2 ? "border-r border-black/[0.06]" : ""}`}>{h}</div>
                      ))}
                    </div>
                    {[
                      ["Palm sensor", "Interlink FSR 402", "Continuous pressure → discrete-feel switch. Capacitive can only give binary, and binary would not give the wearer headroom to feel the threshold approaching."],
                      ["Finger sensor × 4", "Spectra Symbol 2.2\" bend", "2.2\" length matches the MCP→PIP joint span on an adult hand. The 4.5\" version overshoots the finger and reads forearm motion as gesture."],
                      ["MCU", "Arduino Nano · ATmega328P", "8 ADCs, hardware UART, USB programming. Teensy LC was overkill at 100Hz; ESP32 added a power problem I didn't need yet."],
                      ["Wireless", "HC-05 · Bluetooth Classic SPP", "On-hand, serial-byte protocol, no pairing UX work needed. Known bottleneck — V4 should be BLE / nRF52 for the latency win."],
                      ["Power", "USB tethered · 5V / ~180mA", "V3 is a bench prototype. Battery + 3.3V LDO + power-path is V4 work; current draw measured to size that."],
                      ["Divider × 5", "10kΩ 1/4W carbon", "Sensor neutral resistance sits near 10k — divider centers the ADC sweep around mid-rail for max sensitivity."],
                      ["Level shift", "1kΩ + 2kΩ on TX → HC-05 RX", "Cheap resistor divider over a logic-level IC. One-way TX path; HC-05 TX is 3.3V into a 5V-tolerant Nano D0, so no shift needed coming back."],
                    ].map(([role, part, why], i) => (
                      <div key={i} className="grid grid-cols-[120px_1.3fr_2fr] border-t border-black/[0.06] bg-white">
                        <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/85">{role}</div>
                        <div className="border-r border-black/[0.06] px-4 py-4 text-[13.5px] text-textPrimary">{part}</div>
                        <div className="px-4 py-4 text-[13px] leading-relaxed text-textSecondary">{why}</div>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>

              {/* ────────────── 06.2 · MECHANICAL ────────────── */}
              <div className="mt-20 md:mt-24">
                <SubsectionHeader
                  label="06.2 · Mechanical"
                  hint="Three builds. V2 → V3 was a strain-relief problem, not a styling change — and the structural fix became part of the interaction language."
                />

                <FadeIn>
                  <div className="relative grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-black/[0.06] md:grid-cols-3">
                    {[
                      {
                        tag: "V1 · Sketch",
                        title: "Sensor layout",
                        body: "Five bend sensors mapped to five fingers, one FSR on the palm. Layout follows natural finger curl, not a uniform grid.",
                        state: "Design only",
                      },
                      {
                        tag: "V2 · Soft glove",
                        title: "First wearable build",
                        body: "Functional but fragile. Solid-core lead wire flexed at one point near the solder joint; bend sensors stopped reading after ~200 cycles.",
                        state: "Failure mode: solder-joint fatigue",
                      },
                      {
                        tag: "V3 · Final",
                        title: "Rigid finger guides",
                        body: "3D-printed PLA shells house each bend sensor and relocate the solder joint outside the flex zone. Stranded pigtails + heat-shrink boots replace the solid leads.",
                        state: "Shipped",
                      },
                    ].map(({ tag, title, body, state }) => (
                      <div key={tag} className="bg-white px-6 py-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">{tag}</p>
                        <p className="mt-3 text-[16px] tracking-tight text-textPrimary">{title}</p>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-textSecondary">{body}</p>
                        <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/70">
                          → {state}
                        </p>
                      </div>
                    ))}
                  </div>
                </FadeIn>

                <FadeIn delay={0.12} className="mt-10">
                  <div className="grid gap-6 md:grid-cols-3">
                    <MediaCard
                      src="/assets/muse/glove-v1-sketch.jpg"
                      alt="Sensor layout sketch on hand"
                      label="V1 · Sketch"
                      aspect="4 / 5"
                    />
                    <MediaCard
                      src="/assets/muse/glove-v2-soft.jpg"
                      alt="V2 soft glove prototype"
                      label="V2 · Soft glove"
                      aspect="4 / 5"
                    />
                    <MediaCard
                      src="/assets/muse/glove-v3-final.jpg"
                      alt="V3 final rigid glove"
                      label="V3 · Final"
                      aspect="4 / 5"
                    />
                  </div>
                </FadeIn>

                {/* Failure-mode breakdown — the engineering proof */}
                <FadeIn delay={0.18} className="mt-12">
                  <div className="rounded-2xl border border-black/[0.08] bg-black/[0.02] p-6 md:p-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">V2 → V3 · Root-cause analysis</p>
                    <div className="mt-6 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-4">
                      {[
                        { k: "Symptom", v: "Bend sensor reads frozen after ~200 flex cycles. Continuity check shows open circuit at proximal lead." },
                        { k: "Root cause", v: "Solid-core lead wire fatigues at a single bend point right at the solder fillet. Classic stress-concentration failure." },
                        { k: "V3 fix", v: "Stranded 26AWG pigtails with heat-shrink boots. Solder joint relocated 4mm into the rigid finger guide — outside the flex zone." },
                        { k: "Side effect", v: "Rigid guide constrained bend-sensor travel to a repeatable range. Gesture became more reproducible across hand sizes." },
                      ].map(({ k, v }) => (
                        <div key={k}>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-nltLime-ink">{k}</p>
                          <p className="mt-2 text-[13.5px] leading-relaxed text-textPrimary/85">{v}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-7 border-t border-black/[0.08] pt-5 text-[13px] leading-relaxed text-textSecondary">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Lesson · </span>
                      The mechanical fix did not just keep the sensors alive. By constraining travel, it made the gesture vocabulary inter-user repeatable — which only then made the mapping work for someone other than me.
                    </p>
                  </div>
                </FadeIn>
              </div>

              {/* ────────────── 06.3 · FIRMWARE ────────────── */}
              <div className="mt-20 md:mt-24">
                <SubsectionHeader
                  label="06.3 · Firmware"
                  hint="ATmega328P · 5-channel ADC · EMA filter · busy-wait paced at 100Hz · comma-separated UART frames."
                />

                <FadeIn>
                  <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d1117] shadow-[0_24px_48px_-32px_rgba(0,0,0,0.4)]">
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">muse.ino · main loop</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">Arduino · C++</p>
                    </div>
                    <pre className="overflow-x-auto px-5 py-5 font-mono text-[12px] leading-[1.65] text-white/85">
{`// muse · 100Hz 5-channel sensor stream over HC-05 SPP
const uint8_t PINS[5] = {A0, A1, A2, A3, A4};   // thumb FSR, idx, mid, ring, little
float ema[5] = {0};
const float ALPHA = 0.25;                        // EMA — 30ms settle, 100Hz sample
const int   LOW[5]  = { 60,  90,  90,  90,  90 }; // measured per-channel deadband
const int   HIGH[5] = {940, 920, 920, 920, 920};  // never reaches rail-to-rail

void setup() {
  Serial.begin(9600);                            // HC-05 default; 38400 drops packets every ~30s
  for (int i = 0; i < 5; i++) pinMode(PINS[i], INPUT);
}

void loop() {
  uint32_t t0 = millis();
  for (int i = 0; i < 5; i++) {
    int raw  = analogRead(PINS[i]);              // 0–1023
    ema[i]   = ALPHA * raw + (1 - ALPHA) * ema[i];
    int norm = constrain(map(ema[i], LOW[i], HIGH[i], 0, 100), 0, 100);
    Serial.print(norm);
    Serial.print(i < 4 ? ',' : '\\n');           // CSV frame, \\n delimits
  }
  while (millis() - t0 < 10) { /* pace to 100Hz · ~6ms slack on a 328P @ 16MHz */ }
}`}
                    </pre>
                  </div>
                </FadeIn>

                <FadeIn delay={0.1} className="mt-10">
                  <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                    <Callout
                      index={1}
                      title="EMA over Kalman."
                      body="Kalman is the textbook answer for noisy 1D sensors, but a 328P at 16MHz running five channels at 100Hz has no headroom for matrix math. EMA with α = 0.25 gives a 30ms settle — perceptually live, plus immune to single-sample spikes."
                    />
                    <Callout
                      index={2}
                      title="Per-channel deadband, not min=0/max=1023."
                      body="FSR and bend sensors never reach rail-to-rail in the gesture range that's actually achievable on a hand. Measured the working window per channel and locked the map() bounds to that — gives the full 0–100 over the part of the curve the wearer can actually reach."
                    />
                    <Callout
                      index={3}
                      title="CSV over binary framing."
                      body="At 5 channels × 3 bytes × 100Hz the bandwidth (~12kbps) is well under 9600 baud. Human-readable wins for bench debugging; a binary protocol would have shaved ~30% off the BT stage but added a packet parser on both sides."
                    />
                    <Callout
                      index={4}
                      title="Busy-wait over Timer1."
                      body="100Hz with no other work happening doesn't justify the interrupt setup. Busy-wait keeps loop ordering deterministic — every frame's ADC samples are taken at the same offset from frame-start, which simplifies any downstream cross-channel analysis."
                    />
                  </div>
                </FadeIn>
              </div>

              {/* ────────────── 06.4 · LATENCY ────────────── */}
              <div className="mt-20 md:mt-24">
                <SubsectionHeader
                  label="06.4 · Latency budget"
                  hint="Target was <100ms gesture-to-pixel — the threshold where interaction stops feeling live. HC-05 baud rate was the bottleneck, and the reason V4 would move to BLE."
                />

                <FadeIn>
                  <div className="overflow-hidden rounded-2xl border border-black/[0.08]">
                    <div className="grid grid-cols-[1.6fr_120px_2fr] bg-black/[0.04] text-[10px]">
                      {["Stage", "Time", "Notes"].map((h, i) => (
                        <div key={h} className={`px-4 py-3 font-mono uppercase tracking-[0.18em] text-textSecondary/75 ${i < 2 ? "border-r border-black/[0.06]" : ""}`}>{h}</div>
                      ))}
                    </div>
                    {[
                      ["ADC sample · 5ch sequential", "~0.5 ms", "analogRead() at 9.6kHz ADC clock"],
                      ["Loop pacing @ 100Hz", "10 ms", "Busy-wait — locks frame interval"],
                      ["HC-05 SPP serial @ 9600 baud", "20–60 ms", "Bottleneck. CSV frame is ~20 bytes; latency varies with BT scheduling"],
                      ["Python parse + OSC dispatch", "1–5 ms", "Local-network UDP, single hop"],
                      ["TouchDesigner frame @ 60fps", "16 ms", "One frame of render lag"],
                    ].map(([stage, time, notes], i) => (
                      <div key={i} className="grid grid-cols-[1.6fr_120px_2fr] border-t border-black/[0.06] bg-white">
                        <div className="border-r border-black/[0.06] px-4 py-4 text-[13.5px] text-textPrimary/85">{stage}</div>
                        <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[12px] tabular-nums text-textPrimary">{time}</div>
                        <div className="px-4 py-4 text-[13px] leading-relaxed text-textSecondary">{notes}</div>
                      </div>
                    ))}
                    <div className="grid grid-cols-[1.6fr_120px_2fr] border-t-2 border-nltLime-ink/40 bg-nltLime-soft/60">
                      <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-nltLime-ink">Gesture → pixel · total</div>
                      <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[13px] tabular-nums text-nltLime-ink">~50–90 ms</div>
                      <div className="px-4 py-4 text-[13px] leading-relaxed text-nltLime-ink">Under the 100ms feels-live ceiling — but only because TD is local. Adding 30ms of BLE in V4 would still leave headroom.</div>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.1} className="mt-8">
                  <p className="max-w-3xl text-[14px] leading-relaxed text-textSecondary">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-textSecondary/70">Note · </span>
                    9600 baud is HC-05&apos;s default and the most stable rate I measured. 38400 worked in bursts but dropped a frame roughly every 30 seconds — unusable for a musical interface where consistency matters more than peak speed.
                  </p>
                </FadeIn>
              </div>
            </Section>

            <Section id="mapping" eyebrow="Mapping · The Design Centerpiece" title="Five channels, one rule: dominant finger drives the dominant property.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  A naive mapping assigns each finger to a visual property in order — thumb to hue, index to saturation, and so on. I built this. It felt like operating five sliders at once. Nothing about it was musical. The mapping that worked treats the hand as an instrument with a single primary action and four modifiers.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-12">
                <div className="overflow-hidden rounded-2xl border border-black/[0.08]">
                  <div className="grid grid-cols-[56px_1.1fr_1.2fr_1fr_1.4fr] bg-black/[0.04] text-[11px]">
                    {["CH", "Sensor", "Finger", "Input", "Visual output"].map((h, i) => (
                      <div
                        key={h}
                        className={`px-4 py-3 font-mono uppercase tracking-[0.18em] text-textSecondary/75 ${i < 4 ? "border-r border-black/[0.06]" : ""}`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Thumb row — tinted, marks the discrete scene-switch channel */}
                  <div className="grid grid-cols-[56px_1.1fr_1.2fr_1fr_1.4fr] border-t border-black/[0.06] bg-nltLime-soft/60">
                    <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] tabular-nums text-nltLime-ink">00</div>
                    <div className="border-r border-black/[0.06] px-4 py-4 text-[14px] text-nltLime-ink">FSR</div>
                    <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-nltLime-ink">Thumb / palm</div>
                    <div className="border-r border-black/[0.06] px-4 py-4 text-[14px] text-nltLime-ink">Pressure</div>
                    <div className="px-4 py-4 font-display text-[14px] italic text-nltLime-ink">Scene switch (discrete)</div>
                  </div>

                  {[
                    ["01", "Bend 1", "Index", "Flexion angle", "Color palette"],
                    ["02", "Bend 2", "Middle", "Flexion angle", "Color temperature"],
                    ["03", "Bend 3", "Ring", "Flexion angle", "Color contrast"],
                    ["04", "Bend 4", "Little", "Flexion angle", "Color saturation"],
                  ].map(([ch, sensor, finger, input, out], i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[56px_1.1fr_1.2fr_1fr_1.4fr] border-t border-black/[0.06] bg-white"
                    >
                      <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] tabular-nums text-textSecondary/70">{ch}</div>
                      <div className="border-r border-black/[0.06] px-4 py-4 text-[14px] text-textPrimary/85">{sensor}</div>
                      <div className="border-r border-black/[0.06] px-4 py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-textSecondary/80">{finger}</div>
                      <div className="border-r border-black/[0.06] px-4 py-4 text-[14px] text-textPrimary/85">{input}</div>
                      <div className="px-4 py-4 font-display text-[14px] italic text-textPrimary">{out}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.16} className="mt-12">
                <SubsectionHeader label="Two principles" hint="Both are about matching the resolution of the input to the resolution of the output." />
                <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                  <div className="rounded-xl border border-black/[0.08] bg-white px-6 py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">Principle 01</p>
                    <p className="mt-3 text-[16px] tracking-tight text-textPrimary">Discrete for big changes, continuous for small ones.</p>
                    <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">
                      The palm FSR is binary in feel, even though its signal is analog. Pressing the palm switches scenes — a category change. Bend sensors are articulated, so they shape color properties — a magnitude change.
                    </p>
                  </div>
                  <div className="rounded-xl border border-black/[0.08] bg-white px-6 py-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">Principle 02</p>
                    <p className="mt-3 text-[16px] tracking-tight text-textPrimary">Dominant finger drives the dominant property.</p>
                    <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">
                      The index finger has the most articulation in everyday gesture and controls the most expressive property — palette. The little finger has the smallest range and controls saturation, which stays perceptually safe within a smaller window.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.22} className="mt-12">
                <div className="border-l-2 border-nltLime-ink/40 pl-5 sm:pl-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-nltLime-ink">Underneath all of this</p>
                  <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-textPrimary/85">
                    A low-pass / high-pass split runs underneath the gesture layer. The bass band drives the size and density of visual elements; treble band drives motion. Gestures modulate this base signal — so the wearer is never generating the visual from nothing. They are <span className="text-nltLime-ink">shaping the music&apos;s own visual signature</span>.
                  </p>
                </div>
              </FadeIn>
            </Section>

            <Section id="scenes" eyebrow="Generative Grammar" title="Ten scenes, one composition pipeline.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  Each scene shares the same four-layer pipeline. Audio and gesture are common infrastructure; only the final visual grammar differentiates. The mood pulled from generative art with two constraints — organic over geometric, nature-derived color over screen-native — so the visuals would feel like part of the wearer&apos;s physical world, not a separate digital layer.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-12">
                <div className="space-y-2">
                  {[
                    { l: "L1", name: "Audio analysis", flow: ["audiofilein", "audiofilter", "audiospect", "analyze"] },
                    { l: "L2", name: "Gesture parsing", flow: ["serialin", "select", "convert", "DAT_to", "rename"] },
                    { l: "L3", name: "Math / remap", flow: ["math", "scale", "clamp", "multiply"] },
                    { l: "L4", name: "Visual grammar", flow: ["particle", "raymarch", "geo_shader", "fluid_sim"], terminal: true },
                  ].map(({ l, name, flow, terminal }) => (
                    <div
                      key={l}
                      className={`grid grid-cols-[48px_minmax(160px,200px)_1fr] items-center gap-4 rounded-lg border bg-white px-5 py-4 ${
                        terminal ? "border-nltLime-ink/40" : "border-black/[0.08]"
                      }`}
                    >
                      <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${terminal ? "text-nltLime-ink" : "text-textSecondary/70"}`}>{l}</p>
                      <p className="text-[15px] tracking-tight text-textPrimary">{name}</p>
                      <p className="font-mono text-[11px] tracking-[0.04em] text-textSecondary">
                        {flow.map((op, i) => (
                          <span key={op}>
                            <span className={terminal ? "text-nltLime-ink" : "text-textPrimary/75"}>{op}</span>
                            {i < flow.length - 1 ? <span className="px-2 text-textSecondary/50">{terminal ? "·" : "→"}</span> : null}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.14} className="mt-14">
                <SubsectionHeader label="Scene reels" hint="Each scene runs the same pipeline; the grammar layer is where they diverge." />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { name: "Particle field", src: "/assets/muse/scene-01.mp4" },
                    { name: "Raymarched form", src: "/assets/muse/scene-02.mp4" },
                    { name: "Geo shader", src: "/assets/muse/scene-03.mp4" },
                    { name: "Fluid sim", src: "/assets/muse/scene-04.mp4" },
                  ].map(({ name, src }, i) => (
                    <MediaCard
                      key={name}
                      src={src}
                      alt={`${name} — generative scene driven by glove gesture`}
                      label={`Scene ${(i + 1).toString().padStart(2, "0")}`}
                      caption={name}
                      kind="video"
                      aspect="3 / 4"
                    />
                  ))}
                </div>
              </FadeIn>
            </Section>

            <Section id="modes" eyebrow="Operational Modes" title="See, Interact, Share.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary">
                  The final system runs in three modes that map back to the three research questions. The first two are about building a personal visual vocabulary. The third — Share — is the answer to the reframed problem.
                </p>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-12">
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.06] md:grid-cols-3">
                  {[
                    {
                      n: "01",
                      name: "See",
                      sub: "Solo · Discovery",
                      body: "The wearer puts on the glove, plays a piece of music, and uses gesture to shape the visual. The mode for building your own visual vocabulary.",
                      highlight: false,
                    },
                    {
                      n: "02",
                      name: "Interact",
                      sub: "Solo · Compose",
                      body: "Record a gesture sequence and play it back against the same piece, or a different one. Muse becomes a compositional tool, not just a performance one.",
                      highlight: false,
                    },
                    {
                      n: "03",
                      name: "Share",
                      sub: "Dyad · Co-experience",
                      body: "Wearer drives the laptop visual. A second person holds a phone receiving the same gesture stream over OSC. Two sensory channels, one piece of music.",
                      highlight: true,
                    },
                  ].map(({ n, name, sub, body, highlight }) => (
                    <div
                      key={n}
                      className={`px-7 py-7 ${highlight ? "bg-nltLime-soft" : "bg-white"}`}
                    >
                      <p className={`font-display text-[3rem] font-light leading-none ${highlight ? "text-nltLime-ink" : "text-black/[0.12]"}`}>
                        {n}
                      </p>
                      <p className={`mt-5 font-display text-[1.6rem] font-light leading-tight tracking-tight ${highlight ? "text-nltLime-ink" : "text-textPrimary"}`}>
                        {name}
                      </p>
                      <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.2em] ${highlight ? "text-nltLime-ink/80" : "text-textSecondary/70"}`}>
                        {sub}
                      </p>
                      <p className="mt-5 text-[13.5px] leading-relaxed text-textSecondary">{body}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.16} className="mt-14">
                <SubsectionHeader label="Share mode · Two-screen demo" hint="Laptop carries the wearer&apos;s rich visual; phone carries a peer&apos;s parameter-driven companion view. Same gesture stream, two surfaces." />
                <div className="grid gap-6 md:grid-cols-2">
                  <MediaCard
                    src="/assets/muse/share-laptop.mp4"
                    alt="Laptop view in share mode"
                    label="Wearer · Laptop"
                    caption="Primary visual rendered from full audio + gesture pipeline."
                    kind="video"
                    aspect="16 / 10"
                  />
                  <MediaCard
                    src="/assets/muse/share-phone.mp4"
                    alt="Phone view in share mode"
                    label="Peer · Phone"
                    caption="Companion view rendered from the OSC parameter stream."
                    kind="video"
                    aspect="16 / 10"
                  />
                </div>
              </FadeIn>

              <FadeIn delay={0.22} className="mt-12">
                <p className="max-w-3xl text-[16px] leading-relaxed text-textPrimary/85">
                  Share mode does not try to give the hearing aid user a hearing-person experience. It gives both people <span className="text-nltLime-ink">a shared experience that neither would have had otherwise</span>.
                </p>
              </FadeIn>
            </Section>

            <Section id="reflection" eyebrow="Reflection" title="Three lessons I carry into every hardware project after this.">
              <div className="space-y-5 md:space-y-6">
                <FadeIn className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">01 · Mapping is the design.</p>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-textPrimary/90">
                    I spent most of the schedule on sensors, circuits, and the rendering pipeline. The week I spent on the sensor-to-visual mapping was the week the project became coherent. For any wearable or multi-modal interface, the mapping layer is not a configuration step. It is the product.
                  </p>
                </FadeIn>
                <FadeIn delay={0.06} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">02 · Accessibility is a design lens, not a constraint.</p>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-textPrimary/90">
                    Designing for Wendy did not narrow the project. It expanded it. The two-person Share mode only exists because I stopped trying to translate music for her and started asking what a shared experience would look like if both people met in the middle. The hearing aid framing surfaced a problem hearing people have too.
                  </p>
                </FadeIn>
                <FadeIn delay={0.12} className="border-l-2 border-black/[0.12] pl-5 sm:pl-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nltLime-ink">03 · Mechanical structure <em className="not-italic underline decoration-nltLime-ink/40 underline-offset-4">is</em> the gesture vocabulary.</p>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-textPrimary/90">
                    V2&apos;s solder-joint failure forced a mechanical redesign. The rigid finger guides in V3 didn&apos;t just keep the sensors alive — they constrained bend travel to a repeatable window, which is what made the mapping work for a hand that wasn&apos;t mine. The strain-relief problem turned out to be the inter-user reproducibility problem in disguise. Every layer of a wearable is downstream of the one below it; the mechanical layer was the hardest to see and the most consequential.
                  </p>
                </FadeIn>
              </div>

              <FadeIn className="mt-20 md:mt-28">
                <div className="relative">
                  <span aria-hidden className="absolute -left-2 -top-6 font-display text-[7rem] font-light leading-none text-nltLime-ink/15 md:text-[9rem]">
                    &ldquo;
                  </span>
                  <p className="relative max-w-4xl font-display text-[1.75rem] font-light leading-[1.25] tracking-tight text-textPrimary md:text-[2.5rem] md:leading-[1.18]">
                    Stop treating sensory difference as a deficit. Treat it as a <span className="text-nltLime-ink">design opportunity</span>.
                  </p>
                  <p className="mt-8 max-w-3xl text-[14px] leading-relaxed text-textSecondary/85">
                    Muse is a research artifact, not a shipped product. The hardware is rough; the mapping is what matters. The work is about what becomes possible when you stop assuming everyone&apos;s sensory channel is the same one — and design from that opening.
                  </p>
                  <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/70">
                    Muse · independent research · 2022 / 2023
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.08} className="mt-20">
                <div className="rounded-2xl border border-black/[0.08] bg-black/[0.02] px-6 py-7 md:px-8 md:py-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">Appendix · Materials & artifacts</p>
                  <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Electrical</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        Arduino Nano (ATmega328P) · HC-05 SPP · 1× Interlink FSR 402 · 4× Spectra Symbol 2.2&quot; bend · 10kΩ × 5 dividers · 1k+2k RX level shift
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Mechanical</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        3D-printed PLA finger guides · 26AWG stranded pigtails · heat-shrink strain relief · USB-tethered (V3); V4 path: LiPo + 3.3V LDO
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Firmware & software</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        Arduino C++ (EMA filter, CSV UART @ 9600 baud) · Python 3 (OpenCV, pydub, NumPy, Pillow) for early CV prototype · TouchDesigner for final pipeline · OSC over local network
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Research</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        9 semi-structured interviews · 1 expert interview (ENT specialist) · 1 longitudinal diary study with Wendy
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Output</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        Live performance · two-screen demo (laptop + phone) · recorded gesture-to-visual reels
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-textSecondary/65">Repo</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-textPrimary/85">
                        Firmware · schematic · TouchDesigner project · Python bridge — available on request.
                      </dd>
                    </div>
                  </dl>
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
