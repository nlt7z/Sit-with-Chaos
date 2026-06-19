"use client";

import { AboutArtGallery } from "@/components/AboutArtGallery";
import { FloatingDecor } from "@/components/FloatingDecor";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { experienceEntries } from "@/lib/experience";
import { visualExperimentImages, type VisualExperimentImage } from "@/lib/visualExperimentImages";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";
import { SplitTextChars } from "@/components/SplitBtn";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const credentialLinkClass =
  "underline decoration-black/[0.18] underline-offset-[3px] transition-[color,text-decoration-color] hover:text-textPrimary hover:decoration-black/[0.35] focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2";

// ── Data ──────────────────────────────────────────────────────────────────────

type StoryBeat = {
  title: string;
  body: string;
  period: string;
  image?: string;
  hideImage?: boolean;
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
    period: "UW HCDE",
    hideImage: true,
  },
];

const educationEntries = [
  {
    level: "Graduate",
    degree: "MS, Human Centered Design & Engineering",
    school: "University of Washington",
    detail: "",
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
    title: "AI as a velocity multiplier.",
    body: "After user interviews, I synthesize insights in hours rather than days, and move a loose idea into a working, coded prototype within the same day — so decisions rest on something real, sooner.",
    stack: "Synthesis · Prototype · Velocity",
  },
  {
    number: "02",
    title: "Taste decides the direction.",
    body: "When AI returns dozens of directions, I can tell which one is right and refine it until the craft holds. A decade of fine art lets me translate abstract calls for 'creative' or 'beautiful' into concrete, finished work.",
    stack: "Visual craft · Polish · Art direction",
  },
  {
    number: "03",
    title: "Whatever it takes to ship.",
    body: "When I hit a technical wall, I learn my way through it — often with AI as a tutor — until I can build it myself. That path took me from non-coder to shipping full web and mobile apps, and keeps me ahead on new tools.",
    stack: "Relentless · Curious by default · Ship",
  },
];

// ── Version toggle ────────────────────────────────────────────────────────────

function VersionToggle({
  long,
  onChange,
}: {
  long: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-[#f2f2f4] p-1"
      role="group"
      aria-label="Page version"
    >
      {(["Short", "Long"] as const).map((label) => {
        const active = (label === "Long") === long;
        return (
          <button
            key={label}
            onClick={() => onChange(label === "Long")}
            className="relative rounded-full px-5 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-1"
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId="toggle-bg"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span
              className={`relative z-10 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
                active ? "text-textPrimary" : "text-textSecondary"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [longVersion, setLongVersion] = useState(false);
  const rm = useReducedMotion();
  const storyRef = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-10% 0px" });
  const expRef = useRef(null);
  const expInView = useInView(expRef, { once: true, margin: "-10% 0px" });
  const workRef = useRef(null);
  const workInView = useInView(workRef, { once: true, margin: "-10% 0px" });

  return (
    <>
      <Nav />
      <main className="bg-white">

        {/* ── Sticky toggle bar ───────────────────────────────────────────── */}
        <div className="sticky top-14 z-20 border-b border-black/[0.06] bg-white/90 px-6 py-2.5 backdrop-blur-sm md:top-16">
          <div className="mx-auto flex max-w-content items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-textSecondary">
              About
            </span>
            <VersionToggle long={longVersion} onChange={setLongVersion} />
          </div>
        </div>

        {/* ── 1. Identity ─────────────────────────────────────────────────── */}
        <section
          id="about-identity"
          className="relative overflow-hidden scroll-mt-24 border-b border-[rgba(0,0,0,0.08)] px-6 py-24 md:scroll-mt-28 md:py-32"
        >
          <div className="relative z-10 mx-auto grid max-w-content gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionReveal>
                <div aria-hidden className="relative mb-5 w-[92px] md:w-[108px]">
                  <div className="absolute -inset-[28%] rounded-full bg-[radial-gradient(circle,rgba(210,255,0,0.42)_0%,rgba(210,255,0,0.16)_42%,transparent_72%)] blur-2xl" />
                  <motion.div
                    animate={rm ? undefined : { y: [0, -9, 0] }}
                    transition={rm ? undefined : { duration: 8.5, ease: "easeInOut", repeat: Infinity }}
                  >
                    <Image
                      src="/assets/main-page-decor/decor2.png"
                      alt=""
                      width={1122}
                      height={955}
                      sizes="108px"
                      className="h-auto w-full"
                    />
                  </motion.div>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Identity</p>
                <h1 className="mt-4 font-display text-4xl font-light leading-snug text-textPrimary md:text-5xl lg:text-6xl">
                  Designer, thinker, craftsperson.
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-[1.72] text-textSecondary md:mt-9 md:text-xl md:leading-[1.7]">
                  I&apos;m Yuan Fang, a UX designer working at the intersection of three strengths: AI-native speed, a fine-art command of craft built over 10+ years, and a relentless drive to build whatever a project needs.
                </p>

                {/* Long version — name meaning paragraph */}
                <AnimatePresence>
                  {longVersion && (
                    <motion.div
                      key="identity-long"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: easePortfolio }}
                      className="overflow-hidden"
                    >
                      <p className="mt-6 max-w-2xl text-base leading-[1.72] text-textSecondary md:leading-[1.7]">
                        My name literally means &ldquo;Square and Circle.&rdquo; In Chinese culture it represents balance —
                        the square is logic, systems, and structure; the circle is empathy, flow, and the human experience.
                        I bridge the gap between rigid technology and soft human needs.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="mt-7 font-mono text-sm leading-relaxed text-textSecondary">
                  MS @{" "}
                  <a
                    href="https://www.hcde.washington.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={credentialLinkClass}
                  >
                    UW HCDE
                  </a>
                  &nbsp;·&nbsp; UX Designer @{" "}
                  <a
                    href="https://www.alibabacloud.com/en?_p_lc=5&utm_content=se_1016865603&gclid=Cj0KCQjwh-HPBhCIARIsAC0p3cdFPZetcbRsE45aW3HtGIhQErVmw69gjQ65dhIasOASijh7Pp-WmckaAjc6EALw_wcB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={credentialLinkClass}
                  >
                    Alibaba
                  </a>
                </p>
              </SectionReveal>
            </div>

            {/* Photo */}
            <div className="lg:col-span-5">
              <SectionReveal className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.08)] bg-neutral-100 lg:ml-auto">
                <Image
                  src="/assets/about/IMG_3830%203.JPG"
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

        {/* ── 2. Manifesto / How I Work ────────────────────────────────────── */}
        <section
          id="about-workflow"
          ref={workRef}
          className="relative overflow-hidden scroll-mt-24 px-6 py-24 md:scroll-mt-28 md:py-32"
          aria-labelledby="about-workflow-heading"
        >
          <div className="relative z-10 mx-auto max-w-content">
            <motion.div
              initial={rm ? false : { opacity: 0, y: 20 }}
              animate={workInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: easePortfolio }}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Manifesto</p>
              <h2
                id="about-workflow-heading"
                className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl"
              >
                How I work
              </h2>
            </motion.div>

            <div className="mt-14 divide-y divide-black/[0.08] border-t border-black/[0.08]">
              {workPrinciples.map((p, i) => (
                <motion.article
                  key={p.number}
                  className="grid gap-4 py-10 md:grid-cols-[10rem_1fr] md:gap-12 md:py-12"
                  initial={rm ? false : { opacity: 0, y: 18 }}
                  animate={workInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: rm ? 0 : 0.1 * i, ease: easePortfolio }}
                >
                  <div>
                    <p className="font-display text-3xl font-light leading-none tabular-nums text-nltLime-ink md:text-4xl">
                      {p.number}
                    </p>
                    {p.stack ? (
                      <ul className="mt-4 hidden flex-col gap-1.5 md:flex">
                        {p.stack.split(" · ").map((tag) => (
                          <li
                            key={tag}
                            className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-light leading-snug text-textPrimary md:text-2xl">
                      {p.title}
                    </h3>

                    {/* Long version — body paragraph */}
                    <AnimatePresence>
                      {longVersion && (
                        <motion.div
                          key={`principle-body-${p.number}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.38, ease: easePortfolio, delay: 0.04 * i }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-textSecondary md:text-[17px]">
                            {p.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {p.stack ? (
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary md:hidden">
                        {p.stack}
                      </p>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Design Journey ───────────────────────────────────────────── */}
        <section
          id="about-story"
          ref={storyRef}
          className="relative overflow-hidden scroll-mt-24 px-6 py-24 md:scroll-mt-28 md:py-32"
        >
          <FloatingDecor
            src="/assets/main-page-decor/decor6.png"
            className="left-[26%] top-[1%] w-[160px] xl:left-[29%] xl:w-[195px]"
            parallax={38}
            rotate={[6, -6]}
            sizes="195px"
            floatDuration={11}
            floatDistance={12}
            maxOpacity={0.85}
          />
          <div className="relative z-10 mx-auto max-w-content">
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
                      className="absolute left-0 top-2 size-3.5 rounded-full border-2 border-nltLime bg-white md:top-2.5"
                      aria-hidden
                    />
                    <p className="font-mono text-xs uppercase tracking-widest text-nltLime-ink">
                      {String(i + 1).padStart(2, "0")} / 04
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-light text-textPrimary md:text-3xl">
                      {beat.title}
                    </h3>

                    {/* Long version — story body */}
                    <AnimatePresence>
                      {longVersion && (
                        <motion.div
                          key={`beat-body-${i}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: easePortfolio, delay: 0.05 * i }}
                          className="overflow-hidden"
                        >
                          <p className="mt-4 leading-relaxed text-textSecondary">{beat.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {(beat.image && !beat.hideImage) || beat.visualGallery?.length ? (
                      <div className="mt-8 w-full space-y-10">
                        {beat.visualGallery && beat.visualGallery.length > 0 ? (
                          <div className="w-full">
                            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-textSecondary md:text-xs">
                              Visual experiments
                            </p>
                            <div
                              className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
                              aria-label="Visual experiments thumbnails"
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

        {/* ── 4. Previous Artwork ─────────────────────────────────────────── */}
        <section id="about-archive" className="scroll-mt-24 px-6 pt-24 md:scroll-mt-28 md:pt-32">
          <div className="mx-auto max-w-content">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Archive</p>
              <h2 className="mt-3 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Previous Artwork
              </h2>
            </SectionReveal>
          </div>
        </section>

        <AboutArtGallery noTopBorder noHeading />

        {/* ── 5. Background ───────────────────────────────────────────────── */}
        <section
          id="about-background"
          ref={expRef}
          className="relative overflow-hidden scroll-mt-24 border-t border-[rgba(0,0,0,0.08)] px-6 py-14 md:scroll-mt-28 md:py-16"
          aria-label="Experience and education"
        >
          <div className="relative z-10 mx-auto max-w-content">
            <div className="grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-x-16">
              <div>
                <motion.div
                  initial={rm ? false : { opacity: 0, y: 16 }}
                  animate={expInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, ease: easePortfolio }}
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Experience</p>
                </motion.div>
                <div className="mt-6 divide-y divide-black/[0.06] border-t border-black/[0.06]">
                  {experienceEntries.map((item, i) => (
                    <motion.div
                      key={`${item.company}-${item.period}`}
                      className="grid grid-cols-1 gap-y-0.5 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-6"
                      initial={rm ? false : { opacity: 0, y: 10 }}
                      animate={expInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.45, delay: rm ? 0 : 0.05 * i, ease: easePortfolio }}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                          <p className="text-[15px] font-medium leading-snug text-textPrimary md:text-base">
                            {item.company}
                          </p>
                          {item.current ? (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-nltLime-ink">
                              <span className="inline-block size-1.5 animate-pulse rounded-full bg-nltLime" />
                              now
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-textSecondary">{item.role}</p>
                      </div>
                      <p className="font-mono text-[12px] text-nltLime-ink sm:text-right">{item.period}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <motion.div
                  initial={rm ? false : { opacity: 0, y: 16 }}
                  animate={expInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, ease: easePortfolio, delay: rm ? 0 : 0.08 }}
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Education</p>
                </motion.div>
                <div className="mt-6 divide-y divide-black/[0.06] border-t border-black/[0.06]">
                  {educationEntries.map((item, i) => (
                    <motion.div
                      key={`${item.level}-${item.school}`}
                      className="py-4"
                      initial={rm ? false : { opacity: 0, y: 10 }}
                      animate={expInView ? { opacity: 1, y: 0 } : rm ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.45, delay: rm ? 0 : 0.12 + 0.06 * i, ease: easePortfolio }}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-nltLime-ink">
                        {item.level}
                      </p>
                      <p className="mt-1.5 text-[15px] font-medium leading-snug text-textPrimary md:text-base">
                        {item.degree}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-textSecondary">
                        {item.detail ? `${item.school} · ${item.detail}` : item.school}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section
          id="about-next"
          className="relative isolate scroll-mt-24 overflow-hidden border-t border-[rgba(0,0,0,0.08)] px-6 py-24 md:scroll-mt-28 md:py-32"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <img
              src="/assets/hero-decor.png"
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover object-center"
            />
            <div className="absolute inset-0 bg-white/45" />
          </div>
          <div className="relative z-10 mx-auto max-w-content text-center">
            <SectionReveal>
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Next</p>
              <h2 className="mt-4 font-display text-3xl font-light text-textPrimary md:text-4xl">
                Want to see the work?
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#work"
                  className="group inline-flex items-center rounded-full bg-textPrimary px-8 py-3 text-sm font-medium text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  <SplitTextChars text="View Projects ↗" />
                </Link>
                <Link
                  href="/#contact"
                  className="group inline-flex items-center rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-8 py-3 text-sm font-medium text-textPrimary shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  <SplitTextChars text="Get in Touch ↗" />
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
