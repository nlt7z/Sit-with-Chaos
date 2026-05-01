"use client";

import { AboutArtGallery } from "@/components/AboutArtGallery";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { experienceEntries } from "@/lib/experience";
import { visualExperimentImages, type VisualExperimentImage } from "@/lib/visualExperimentImages";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useRef } from "react";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

// ── Data ──────────────────────────────────────────────────────────────────────

type StoryBeat = {
  title: string;
  body: string;
  period: string;
  image?: string;
  hideImage?: boolean;
  /** Playground-style visual carousel (e.g. under Pratt / NY chapter) */
  visualGallery?: readonly VisualExperimentImage[];
};

const storyBeats: StoryBeat[] = [
  {
    title: "It started with drawing.",
    body: "My first sketch was a character from Code Geass, done in primary school. By junior high I had a tablet. By high school I was experimenting with portraits, landscapes, and mixed-media installations. Making things — figuring out what they meant — was always the point.",
    image: "/assets/about/journey/school.jpg",
    period: "Primary school to high school",
  },
  {
    title: "Then it became something bigger.",
    body: "At Pratt in New York, the medium expanded: 3D rendering, Unity VR, TouchDesigner, physical computing. I built installations for New York Fashion Week. The real shift came when I worked on a mobile classroom for a Brooklyn environmental organization — taking something from a pencil sketch to a physical structure. That was the first time I felt what design actually does.",
    image: "/assets/about/journey/uni.jpg",
    period: "Pratt, New York",
  },
  {
    title: "That led me to UX.",
    body: "My first UX project was a Design-a-thon: helping local artists sell their work. On-site interviews with small businesses, an AR platform that let them try artworks for free. For the first time, the thing I was designing was shaped entirely by listening. I wanted more of that.",
    image: "/assets/about/journey/artus11.gif",
    period: "First UX project",
  },
  {
    title: "So I followed it to Seattle.",
    body: "I graduated with four years on the president's list, moved from New York to LA to Seattle, and enrolled at UW HCDE — building the vocabulary to do this work precisely: qualitative research, usability testing, accessibility, service design, visual communication.",
    visualGallery: visualExperimentImages,
    period: "UW HCDE, Seattle",
    hideImage: true,
  },
];

const educationEntries = [
  {
    level: "Graduate",
    degree: "MS, Human Centered Design & Engineering",
    school: "University of Washington",
    detail: "Seattle",
  },
  {
    level: "Undergraduate",
    degree: "BFA, Interactive Arts",
    school: "Pratt Institute",
    detail: "New York City · President's List ×4",
  },
] as const;

const workPrinciples = [
  {
    number: "01",
    title: "Clarity before output.",
    body: "Ground in users, data, and constraints first—then align with PMs and engineers so the first frames answer the right question.",
    stack: "Research · Data · Cross-functional alignment",
  },
  {
    number: "02",
    title: "Move fast, validate often.",
    body: "Sketch early, prototype in tight loops, and slice ambiguity into testable pieces. Velocity and craft only clash when process gets fuzzy.",
    stack: "Sketch · Prototype · Validate",
  },
  {
    number: "03",
    title: "AI is the medium.",
    body: "Models synthesize research and pressure-test directions; coding agents turn structure into UI; Figma is where the narrative ships.",
    stack: "Claude · Cursor · Figma · Midjourney · Stable Diffusion",
  },
];

const showrooms = [
  {
    id: "astro" as const,
    label: "Astrology",
    title: "Astro Showroom · Tao Baibai",
    tagline: "Constellation profile updates live while you chat.",
    href: "/work/ai-character/prototype-astro",
    src: "/work/ai-character/prototype-astro?embed=1",
    iframeTitle: "Zodiac Showroom interactive prototype",
    iframeBg: "bg-[#fdfaf5]",
  },
  {
    id: "therapy" as const,
    label: "Therapy",
    title: "Therapy Room · Therapy Space",
    tagline: "Analysis rail beside the thread — what the model understood, visible.",
    href: "/work/ai-character/prototype-psych",
    src: "/work/ai-character/prototype-psych?embed=1",
    iframeTitle: "Therapy Room interactive prototype",
    iframeBg: "bg-[#f8fcff]",
  },
  {
    id: "romance" as const,
    label: "Romance",
    title: "Meet with Lucien",
    tagline: "Long-term memory and emotional pacing in one flow.",
    href: "/work/ai-character/prototype",
    src: "/work/ai-character/prototype?muted=1",
    iframeTitle: "Romance Showroom interactive prototype",
    iframeBg: "bg-[#060608]",
  },
];

const showroomStyle = {
  astro: {
    card: "border-[#ece7d6] bg-[linear-gradient(156deg,#fffdf8_0%,#fff7f3_34%,#f7f8ef_66%,#fff8e9_100%)] ring-1 ring-[#d8d19a]/22",
    tabOn: "bg-[#7f6e42] border-transparent text-white shadow-md shadow-[#7f6e42]/24",
    tabOff: "border-[#e6ddbc] bg-white/90 text-[#796a44] hover:border-[#d5ca9d] hover:bg-white hover:text-[#5f5130]",
    eyebrow: "text-[#8a7a52]",
    link: "text-[#7b6a3f] hover:text-[#5f5130]",
    iframeBorder: "border-[#e4dbb9]",
  },
  therapy: {
    card: "border-[#d8e8f6] bg-[linear-gradient(158deg,#f7fbff_0%,#eff7ff_42%,#e9f4ff_100%)] ring-1 ring-[#73b7ee]/16",
    tabOn: "bg-[#10679f] border-transparent text-white shadow-md shadow-[#10679f]/24",
    tabOff: "border-[#c9deef] bg-white/88 text-[#3b6d90] hover:border-[#9fc9e5] hover:bg-white hover:text-[#1f5a84]",
    eyebrow: "text-[#2f75aa]",
    link: "text-[#1f6ea8] hover:text-[#18557f]",
    iframeBorder: "border-[#cbe0ef]",
  },
  romance: {
    card: "border-[#dfe3ea] bg-[linear-gradient(160deg,#fafbfc_0%,#f3f5f8_40%,#eceff4_100%)] ring-1 ring-[#a7b0be]/18",
    tabOn: "bg-[#1f2937] border-transparent text-white shadow-[0_8px_20px_-10px_rgba(31,41,55,0.45)] ring-1 ring-[#475467]/40",
    tabOff: "border-[#d0d5dd] bg-white/88 text-[#475467] hover:border-[#98a2b3] hover:bg-white hover:text-[#1d2939]",
    eyebrow: "text-[#667085]",
    link: "text-[#344054] hover:text-[#1d2939]",
    iframeBorder: "border-[#c8d0da]",
  },
};

// ── Shared utility ────────────────────────────────────────────────────────────

function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const rm = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={rm ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: easePortfolio, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Showroom stack (one per scroll) ──────────────────────────────────────────

function AboutShowrooms({ rm }: { rm: boolean }) {
  return (
    <div className="flex flex-col gap-8">{showrooms.map((s, i) => {
      const st = showroomStyle[s.id];
      return (
        <motion.div
          key={s.id}
          initial={rm ? false : { opacity: 0, y: 28 }}
          whileInView={rm ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 0.65, ease: easePortfolio, delay: rm ? 0 : i * 0.06 }}
          className={`overflow-hidden rounded-3xl border ${st.card}`}
        >
          {/* Chrome header */}
          <div className="border-b border-black/[0.08] px-5 py-5 md:px-6 md:py-6">
            {/* Authorship badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${st.eyebrow}`}>
                {String(i + 1).padStart(2, "0")} / 03
              </span>
              <span className="rounded-full border border-black/[0.08] bg-white/80 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary">
                End-to-End Design · Prototype
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
              <div className="min-w-0 flex-1">
                <p className={`font-display text-xl font-light leading-snug text-[#111827] md:text-[1.35rem]`}>
                  {s.title}
                </p>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#475467]">
                  {s.tagline}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                <Link
                  href={s.href}
                  className={`text-[13px] font-medium underline underline-offset-4 transition-opacity hover:opacity-70 ${st.link}`}
                >
                  Open prototype
                </Link>
                {s.id === "romance" && (
                  <Link
                    href="/work/ai-character"
                    className="text-[13px] font-medium text-[#344054] underline underline-offset-4 transition-opacity hover:opacity-70"
                  >
                    Case study
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Iframe */}
          <div className={`border-t ${st.iframeBorder}`}>
            <iframe
              key={s.src}
              title={s.iframeTitle}
              src={s.src}
              className={`block h-[min(72vh,780px)] min-h-[480px] w-full md:min-h-[560px] ${s.iframeBg}`}
              loading="lazy"
            />
          </div>
        </motion.div>
      );
    })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const rm = useReducedMotion();
  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-10% 0px" });
  const expRef = useRef(null);
  const expInView = useInView(expRef, { once: true, margin: "-10% 0px" });
  const eduRef = useRef(null);
  const eduInView = useInView(eduRef, { once: true, margin: "-10% 0px" });

  return (
    <>
      <Nav />
      <main className="bg-white">

        {/* ── 1. Identity ─────────────────────────────────────────────────── */}
        <section className="border-b border-[rgba(0,0,0,0.08)] px-6 py-24 md:py-32">
          <div className="mx-auto grid max-w-content gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionReveal>
                <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Identity</p>
                <h1 className="mt-4 font-display text-4xl font-light leading-tight text-textPrimary md:text-5xl lg:text-6xl">
                  Designer, thinker, craftsperson.
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-textSecondary md:text-xl">
                  I&apos;m Yuan Fang, a UX designer focused on AI-native workflows, rapid iteration, and turning
                  ambiguous problems into coherent product direction.
                </p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-textSecondary">
                  My name literally means &ldquo;Square and Circle.&rdquo; In Chinese culture it represents balance —
                  the square is logic, systems, and structure; the circle is empathy, flow, and the human experience.
                  I bridge the gap between rigid technology and soft human needs.
                </p>
                <p className="mt-6 font-mono text-sm text-textSecondary">
                  MS @ UW HCDE &nbsp;·&nbsp; UX Designer @ Alibaba
                </p>
              </SectionReveal>
            </div>
            <div className="lg:col-span-5">
              <SectionReveal className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.08)] bg-neutral-100 lg:ml-auto">
                <Image
                  src="/assets/about/profile.jpg"
                  alt="Yuan Fang"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 48rem, 90vw"
                  priority
                />
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* ── 2. How I Work ───────────────────────────────────────────────── */}
        <section className="bg-surfaceAlt px-6 py-24 md:py-32">
          <div className="mx-auto max-w-content">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Workflow</p>
              <h2 className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl">How I work</h2>
            </SectionReveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3 md:items-stretch md:gap-6">
              {workPrinciples.map((p, i) => (
                <SectionReveal key={p.number} delay={rm ? 0 : i * 0.08}>
                  <article className="flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] md:p-7">
                    <h3 className="font-display text-lg font-light leading-snug text-textPrimary md:text-xl">
                      {p.title}
                    </h3>

                    <p className="mt-4 text-pretty text-[15px] leading-[1.62] text-textSecondary md:text-[15px]">
                      {p.body}
                    </p>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Design Journey ───────────────────────────────────────────── */}
        <section ref={storyRef} className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-content">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Story</p>
              <h2 className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Design Journey
              </h2>
            </SectionReveal>

            <div className="relative mt-16 max-w-3xl pl-6 md:pl-10">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-[rgba(0,0,0,0.12)] md:left-[11px]"
                aria-hidden
              />
              <ol className="space-y-14">
                {storyBeats.map((beat, i) => (
                  <motion.li
                    key={beat.title}
                    className="relative pl-6 md:pl-8"
                    initial={rm ? false : { opacity: 0, x: -12 }}
                    animate={storyInView ? { opacity: 1, x: 0 } : rm ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: rm ? 0 : 0.08 * i, ease: easePortfolio }}
                  >
                    <span
                      className="absolute left-0 top-2 size-3.5 rounded-full border-2 border-textPrimary bg-white md:top-2.5"
                      aria-hidden
                    />
                    <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
                      {String(i + 1).padStart(2, "0")} / 04
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-light text-textPrimary md:text-3xl">
                      {beat.title}
                    </h3>
                    <p className="mt-4 leading-relaxed text-textSecondary">{beat.body}</p>
                    {(beat.image && !beat.hideImage) || beat.visualGallery?.length ? (
                      <div className="mt-8 w-full space-y-10">
                        {beat.visualGallery && beat.visualGallery.length > 0 ? (
                          <div className="w-full">
                            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-textSecondary md:text-xs">
                              Visual experiments
                            </p>
                            <div
                              className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7"
                              aria-label="Visual experiment thumbnails"
                            >
                              {beat.visualGallery.map((image, thumbI) => (
                                <div
                                  key={`${image.src}-${thumbI}`}
                                  className="relative aspect-[5/4] w-full overflow-hidden bg-neutral-100 ring-1 ring-black/[0.06]"
                                  title={image.alt}
                                >
                                  <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 18vw, 120px"
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {beat.image && !beat.hideImage ? (
                          <div className="w-full">
                            <div className="flex min-h-[min(46vh,500px)] w-full items-center justify-start md:min-h-[min(52vh,560px)]">
                              <Image
                                src={beat.image}
                                alt={`${beat.title} — visual`}
                                width={1920}
                                height={1080}
                                className="max-h-[min(46vh,500px)] w-auto max-w-full object-contain md:max-h-[min(52vh,560px)]"
                                sizes="(min-width: 768px) 48rem, 100vw"
                              />
                            </div>
                          </div>
                        ) : null}
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-textSecondary md:text-xs">
                          {beat.period}
                        </p>
                      </div>
                    ) : null}
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 4. Current Playground ───────────────────────────────────────── */}
        <section
          id="about-playground"
          className="border-t border-[rgba(0,0,0,0.08)] bg-surfaceAlt px-6 py-24 md:py-32"
        >
          <div className="mx-auto max-w-content">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
                experiments
              </p>
              <h2 className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Current Playground
              </h2>
              <p className="mt-4 max-w-2xl text-textSecondary">
                Interactive prototypes and coded experiments — the things I build to think.
              </p>
            </SectionReveal>

            {/* Showrooms */}
            <div className="mt-14">
              <AboutShowrooms rm={!!rm} />
            </div>

            {/* Omikuji Cabinet */}
            <motion.div
              initial={rm ? false : { opacity: 0, y: 20 }}
              whileInView={rm ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="relative isolate mt-8 overflow-hidden rounded-3xl border border-[#c9a030]/45 shadow-[0_20px_64px_-20px_rgba(0,0,0,0.42)] ring-1 ring-[#d4af37]/20"
            >
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 50% at 15% 85%, rgba(201,160,48,0.14) 0%, transparent 55%), radial-gradient(ellipse 45% 45% at 90% 10%, rgba(60,45,30,0.4) 0%, transparent 55%), linear-gradient(170deg, #121a22 0%, #0f1410 45%, #1a1510 100%)",
                }}
                aria-hidden
              />
              <div className="p-6 md:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#c9a030]/75">御神籤</p>
                <h3 className="mt-2.5 font-display text-2xl font-light leading-tight text-[#f0ddb8] md:text-3xl">
                  Omikuji Cabinet
                </h3>
                <div className="mt-5">
                  <Link
                    href="/code/playground/omikuji"
                    className="inline-flex items-center justify-center rounded-xl border border-[#c9a030]/55 bg-[#261e18] px-5 py-2 text-[13px] font-medium text-[#e8c84a] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#e8c84a]/90 hover:bg-[#32261c] hover:text-[#fdf6e8]"
                  >
                    Open Omikuji
                  </Link>
                </div>
                <div className="mt-7 overflow-hidden rounded-2xl border border-[#c9a030]/50 bg-[#141210] shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(232,200,74,0.08)]">
                  <div className="flex items-center justify-between border-b border-[#c9a030]/35 px-4 py-3 md:px-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c9a030]/75">
                      Interactive prototype
                    </p>
                    <Link
                      href="/code/playground/omikuji"
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#f0ddb8]/80 underline decoration-[#c9a030]/35 underline-offset-[4px] transition-colors hover:text-[#fdf6e8] hover:decoration-[#e8c84a]/55"
                    >
                      Open full page
                    </Link>
                  </div>
                  <iframe
                    title="Omikuji Cabinet interactive preview"
                    src="/code/playground/omikuji?embed=1"
                    className="h-[min(66vh,720px)] min-h-[420px] w-full bg-[#060608] md:min-h-[500px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

            <div className="mt-8 flex justify-end">
              <Link
                href="/playground"
                className="font-mono text-xs uppercase tracking-widest text-textSecondary underline decoration-[rgba(0,0,0,0.2)] underline-offset-4 transition-opacity hover:opacity-60"
              >
                View full playground →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. Previous Artwork ─────────────────────────────────────────── */}
        <section className="px-6 pt-24 md:pt-32">
          <div className="mx-auto max-w-content">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Archive</p>
              <h2 className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Previous Artwork
              </h2>
              <p className="mt-4 max-w-2xl text-textSecondary">
                Drawing, installation, and spatial experiments that shaped how I think about people and media.
              </p>
            </SectionReveal>
          </div>
        </section>

        {/* Gallery carousel (includes Alessa Design slides) */}
        <AboutArtGallery noTopBorder noHeading />

        {/* ── 6. Path ─────────────────────────────────────────────────────── */}
        <section
          ref={expRef}
          className="border-t border-[rgba(0,0,0,0.08)] bg-surfaceAlt px-6 py-24 md:py-32"
          aria-labelledby="about-path-heading"
        >
          <div className="mx-auto max-w-content">
            <motion.div
              initial={rm ? false : { opacity: 0, y: 24 }}
              animate={expInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: easePortfolio }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Experience</p>
              <h2
                id="about-path-heading"
                className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl"
              >
                Path and craft.
              </h2>
            </motion.div>

            <div className="relative mt-16 pl-6 md:pl-10">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-[rgba(0,0,0,0.08)] md:left-[11px]"
                aria-hidden
              />
              <ul className="space-y-10">
                {experienceEntries.map((item, i) => (
                  <motion.li
                    key={`${item.company}-${item.period}`}
                    className="relative grid grid-cols-1 gap-2 pl-6 sm:grid-cols-[1fr_auto] sm:items-baseline md:pl-8"
                    initial={rm ? false : { opacity: 0, x: -16 }}
                    animate={expInView ? { opacity: 1, x: 0 } : rm ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: rm ? 0 : 0.08 * i, ease: easePortfolio }}
                  >
                    <span
                      className={`absolute left-0 top-2 size-3.5 rounded-full border-2 md:top-2.5 ${
                        item.current
                          ? "border-textPrimary bg-textPrimary"
                          : "border-textPrimary bg-white"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className="font-medium text-textPrimary">{item.company}</p>
                      <p className="text-sm text-textSecondary">{item.role}</p>
                    </div>
                    <p className="font-mono text-sm text-textSecondary sm:text-right">{item.period}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── 7. Education (timeline — matches Path, no cards) ───────────── */}
        <section
          ref={eduRef}
          className="border-t border-[rgba(0,0,0,0.08)] px-6 py-24 md:py-32"
          aria-labelledby="about-education-heading"
        >
          <div className="mx-auto max-w-content">
            <motion.div
              initial={rm ? false : { opacity: 0, y: 24 }}
              animate={eduInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: easePortfolio }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Education</p>
              <h2
                id="about-education-heading"
                className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl"
              >
                Education
              </h2>
            </motion.div>

            <div className="relative mt-16 pl-6 md:pl-10">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-[rgba(0,0,0,0.08)] md:left-[11px]"
                aria-hidden
              />
              <ul className="space-y-10">
                {educationEntries.map((item, i) => (
                  <motion.li
                    key={`${item.level}-${item.school}`}
                    className="relative grid grid-cols-1 gap-1 pl-6 md:pl-8"
                    initial={rm ? false : { opacity: 0, x: -16 }}
                    animate={eduInView ? { opacity: 1, x: 0 } : rm ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: rm ? 0 : 0.08 * i, ease: easePortfolio }}
                  >
                    <span
                      className="absolute left-0 top-2 size-3.5 rounded-full border-2 border-textPrimary bg-white md:top-2.5"
                      aria-hidden
                    />
                    <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">{item.level}</p>
                    <p className="font-display text-xl font-light leading-snug text-textPrimary md:text-2xl">
                      {item.degree}
                    </p>
                    <p className="text-sm text-textSecondary">{item.school}</p>
                    <p className="text-sm text-textSecondary">{item.detail}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="border-t border-[rgba(0,0,0,0.08)] bg-surfaceAlt px-6 py-24 md:py-32">
          <div className="mx-auto max-w-content text-center">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Next</p>
              <h2 className="mt-4 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Want to see the work?
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#work"
                  className="rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-sm transition-transform duration-500 ease-portfolio hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  View Projects →
                </Link>
                <Link
                  href="/#contact"
                  className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-8 py-3 text-sm font-medium text-textPrimary shadow-sm transition-transform duration-500 ease-portfolio hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  Get in Touch →
                </Link>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
