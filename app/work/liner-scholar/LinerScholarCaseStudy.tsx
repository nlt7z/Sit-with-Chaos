"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "strategy", label: "Research strategy" },
  { id: "expert", label: "Expert input" },
  { id: "landscape", label: "Landscape" },
  { id: "insights", label: "Five insights" },
  { id: "direction", label: "Direction" },
  { id: "process", label: "How I work" },
  { id: "status", label: "Status" },
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

function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <figure className="my-14 border-l-2 border-black/[0.08] pl-6 md:my-20 md:pl-8">
      <blockquote className="font-display text-[1.15rem] font-light italic leading-snug text-textPrimary md:text-xl md:leading-snug">
        {children}
      </blockquote>
      {cite ? <figcaption className="mt-3 font-mono text-[11px] text-textSecondary/75">{cite}</figcaption> : null}
    </figure>
  );
}

const TENSION_ROWS = [
  ["Rapid private experimentation", "Transparent collaboration"],
  ["Iterative prompting and idea testing", "Clear authorship and ownership"],
  ["Early-stage cognitive sensemaking", "High-quality, accountable outputs"],
] as const;

const TOOL_ROWS = [
  ["Literature discovery", "Google Scholar, SciSpace, Research Rabbit"],
  ["Reference management", "Zotero, EndNote, Paperpile"],
  ["Collaborative writing", "Google Docs, Word, Notion"],
  ["Data and analysis", "Excel, MATLAB, Prism"],
  ["Brainstorming", "FigJam"],
  ["Communication", "Zoom, Granola"],
  ["AI assistants", "ChatGPT, NotebookLM"],
] as const;

const STRUCTURAL_GAPS = [
  {
    title: "Fragmented context",
    body: "Researchers move across search, reference managers, writing tools, and meetings, and context does not persist across those transitions.",
  },
  {
    title: "Feedback not linked to evidence",
    body: "Comments in documents are not structurally tied to citations, datasets, or AI reasoning. Traceability stays manual.",
  },
  {
    title: "AI is individual-centric",
    body: "Most assistants answer one user, lack shared memory, and do not track collaborative intent.",
  },
] as const;

const INSIGHTS = [
  {
    n: "01",
    title: "The tool stack is fragmented and costly",
    body: "Researchers move data across incompatible tools constantly. Each transition creates friction or error: citation links break from Word to Google Docs, large files get emailed into version chaos, cross-platform synthesis leans on screenshots and copy-paste.",
    quote: "When I move it to Google Docs for team sharing, all the citation links break.",
    cite: "P4, P5, P6",
    implication:
      "Liner should not try to replace every tool. It can own the transition layer: preserving context when work moves from private AI exploration to shared team artifacts.",
  },
  {
    n: "02",
    title: "AI helps people start, not finish",
    body: "Researchers use AI generatively for drafts and momentum, but they will not hand off final outputs. Trust collapses in a binary way after a serious error. Verification adds workload instead of removing it.",
    quote: "I don't trust it as a final output, but it helps me get the thinking going.",
    cite: "P5",
    implication:
      'Design for the handoff from AI-assisted drafting to human verification. Make the "I reviewed this" signal explicit and visible to teammates.',
  },
  {
    n: "03",
    title: "Social friction is an invisible bottleneck",
    body: "Researchers avoid nudging teammates because it feels awkward, so they wait. Action items get lost in email and Slack. There is no clear answer to who is waiting on what.",
    quote: "Professors and teammates juggle so many projects that follow-ups often slip.",
    cite: "P4",
    implication:
      "Accountability features need to feel like coordination, not surveillance. Framing matters as much as functionality.",
  },
  {
    n: "04",
    title: "Teams share outputs, not process",
    body: "There is a consistent privacy boundary: AI prompts and reasoning logs stay private, while outputs (files, activity history, verified content) should be transparent to the team.",
    quote:
      "AI prompts are helpful, but I don't want the prompts/logs transparently shared with my teammates. I want files, information, and activity history fully transparent. Those two should be clearly separated.",
    cite: "P4, P5, P6",
    implication:
      "This is not a settings toggle problem. It needs an architectural distinction between private AI workspace and shared team context. Getting it wrong erodes trust faster than any missing feature.",
  },
  {
    n: "05",
    title: "Revision is a state-management problem",
    body: 'Teams lose track of who reviewed which section. Reviewers re-read whole documents because "review state" is invisible. Revision cycles slow when no one knows what is already checked.',
    quote:
      "Drafting is independent, but revision goes to 100% collaboration, and direct edits quickly raise the question: who reviewed this part already?",
    cite: "P6",
    implication:
      "Liner needs a concept of review state: not only version history, but a visible record of what has been human-verified, by whom, and when.",
  },
] as const;

export default function LinerScholarCaseStudy() {
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
            <Eyebrow>Capstone · Sponsored research · 2025</Eyebrow>
            <h1 className="mt-8 max-w-4xl font-display text-[clamp(2rem,5.5vw,3.5rem)] font-light leading-[1.08] tracking-[-0.03em] text-textPrimary">
              Liner AI Scholar: collaborative deep-research workflow
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-light leading-snug tracking-[-0.02em] text-textPrimary/80 md:text-2xl">
              Academic researchers do not have a collaboration problem. They have a{" "}
              <span className="font-medium text-textPrimary">context-transfer</span> problem. I led research synthesis
              to uncover why, and translated findings into clear product direction for Liner&apos;s next design cycle.
            </p>
            <p className="mt-8 max-w-2xl border-l-2 border-textPrimary/12 pl-5 text-[15px] leading-relaxed text-textSecondary md:text-base">
              <span className="font-medium text-textPrimary">My lens going in:</span> I treat AI not as a feature layer,
              but as a capability that reshapes how the whole workflow should be structured. That framing shaped how I
              read every interview.
            </p>
            <dl className="mt-14 grid gap-y-5 border-t border-black/[0.06] pt-10 sm:grid-cols-2 sm:gap-x-12">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Program</dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">UW HCDE Capstone · North4 Studio</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">Sponsor</dt>
                <dd className="mt-1.5 text-[15px] text-textPrimary">Liner AI</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary/60">My role</dt>
                <dd className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-textPrimary">
                  Research strategy, semi-structured interviews, synthesis across six participants, and actionable
                  design criteria. Part of a four-person UX team embedded in the capstone.
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
            <Image
              src="/assets/work/liner-scholar-cover.svg"
              alt="Liner AI Scholar capstone — research collaboration"
              width={1600}
              height={900}
              className="h-auto w-full"
              priority
            />
          </motion.div>
        </header>

        <section id="problem" className="scroll-mt-28 space-y-10 pt-24 md:space-y-12 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>The problem we framed</Eyebrow>
            <SectionTitle className="mt-6">From solo AI research to team collaboration</SectionTitle>
            <Prose className="mt-10">
              <p>
                Liner had already built a strong AI-powered solo research experience (12M+ cumulative users, strong U.S.
                academic adoption). The strategic bet was to evolve it into something teams could use together.
              </p>
              <p>
                The brief was genuinely ambiguous:{" "}
                <span className="font-medium text-textPrimary">how do you add collaboration</span> to a tool built
                around private, exploratory AI reasoning? When AI-generated artifacts move from private to shared team
                contexts, breakdowns happen. Our job was to understand exactly where, and why.
              </p>
            </Prose>
          </Reveal>

          <Reveal delay={0.04}>
            <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
              <table className="w-full min-w-[32rem] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                    <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textSecondary">
                      AI tools enable
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textSecondary">
                      Academic research requires
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TENSION_ROWS.map(([a, b]) => (
                    <tr key={a} className="border-b border-black/[0.04]">
                      <td className="px-4 py-3.5 text-textSecondary leading-relaxed">{a}</td>
                      <td className="px-4 py-3.5 text-textPrimary/90 leading-relaxed">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        <section id="strategy" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Research strategy</Eyebrow>
            <SectionTitle className="mt-6">Three phases before conclusions</SectionTitle>
            <Prose className="mt-10">
              <p>
                Rather than jumping straight into user interviews, I structured the work in three phases so we could
                triangulate before drawing conclusions.
              </p>
            </Prose>
            <ol className="mt-10 max-w-2xl list-decimal space-y-6 pl-5 text-[17px] leading-[1.65] text-textSecondary marker:text-textPrimary/40 md:text-lg">
              <li>
                <span className="font-medium text-textPrimary">Phase 1 — Industry framing.</span> Expert interview
                with Liner&apos;s PM plus competitive landscape analysis across the full academic research lifecycle
                (discovery to annotation to writing to revision).
              </li>
              <li>
                <span className="font-medium text-textPrimary">Phase 2 — User discovery.</span> Six semi-structured
                60-minute interviews with academic researchers (2 PostDocs, 2 PhDs, 2 Master&apos;s students) across
                Biology, Health Data Science, Protein Design, Environmental Health, and HCDE. Each session included a
                workflow walkthrough to reconstruct real collaboration moments.
              </li>
              <li>
                <span className="font-medium text-textPrimary">Phase 3 — Concept validation (upcoming).</span>{" "}
                Low-fidelity evaluative sessions and usability testing against early design directions.
              </li>
            </ol>
            <Prose className="mt-10">
              <p>
                One decision I pushed for: we recruited across disciplines{" "}
                <span className="font-medium text-textPrimary">and</span> seniority on purpose. The dynamics between a
                PhD student and their PI are not the same as co-author dynamics between two PostDocs. Talking to only
                one type would have meant designing for only one type.
              </p>
            </Prose>
          </Reveal>
        </section>

        <section id="expert" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Expert interview</Eyebrow>
            <SectionTitle className="mt-6">What the PM conversation changed early</SectionTitle>
            <ul className="mt-10 max-w-2xl list-disc space-y-4 pl-5 text-[17px] leading-relaxed text-textSecondary marker:text-textPrimary/35 md:text-lg">
              <li>
                <span className="font-medium text-textPrimary">Deprioritize LaTeX workflows.</span> Focus on reasoning
                and review, not formatting.
              </li>
              <li>
                <span className="font-medium text-textPrimary">Narrow to medical and life-science students first,</span>{" "}
                with STEM as secondary, aligned with conversion data.
              </li>
              <li>
                <span className="font-medium text-textPrimary">Key Scholar differentiator:</span> deep reasoning and
                artifact generation, not search alone.
              </li>
            </ul>
            <Prose className="mt-8">
              <p>Acting on this input early saved weeks of mis-targeted research.</p>
            </Prose>
          </Reveal>
        </section>

        <section id="landscape" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Competitive landscape</Eyebrow>
            <SectionTitle className="mt-6">The ecosystem is fragmented by stage</SectionTitle>
            <Prose className="mt-10">
              <p>
                Before user interviews, we mapped tools researchers actually use at each stage. Collaboration is
                strongest at writing and review. It is almost nonexistent at the interpretation layer, where AI is most
                active.
              </p>
            </Prose>
          </Reveal>
          <Reveal delay={0.04}>
            <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
              <table className="w-full min-w-[28rem] border-collapse text-left text-[14px]">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02]">
                    <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textSecondary">
                      Stage
                    </th>
                    <th className="px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-textSecondary">
                      Representative tools
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TOOL_ROWS.map(([stage, tools]) => (
                    <tr key={stage} className="border-b border-black/[0.04]">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-textPrimary">{stage}</td>
                      <td className="px-4 py-3 text-textSecondary">{tools}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h3 className="mt-4 font-display text-xl font-light text-textPrimary md:text-2xl">Three structural gaps</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
              {STRUCTURAL_GAPS.map((g) => (
                <div
                  key={g.title}
                  className="rounded-xl border border-black/[0.06] bg-white px-5 py-6 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-textSecondary/80">Gap</p>
                  <p className="mt-2 font-display text-lg font-light text-textPrimary">{g.title}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">{g.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="insights" className="scroll-mt-28 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Synthesis</Eyebrow>
            <SectionTitle className="mt-6">Five insights from six interviews</SectionTitle>
            <Prose className="mt-10">
              <p>Patterns surfaced consistently enough to anchor design decisions. Each insight ends with a product implication by design.</p>
            </Prose>
          </Reveal>
          <div className="mt-16 space-y-20 md:space-y-24">
            {INSIGHTS.map((ins, i) => (
              <Reveal key={ins.n} delay={i * 0.03}>
                <div className="flex flex-col gap-6 border-t border-black/[0.06] pt-12 first:border-t-0 first:pt-0 md:flex-row md:items-start md:gap-10">
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-textSecondary/70">{ins.n}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[1.35rem] font-light leading-snug text-textPrimary md:text-2xl">
                      {ins.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-textSecondary md:text-[17px]">{ins.body}</p>
                    <PullQuote cite={ins.cite}>&ldquo;{ins.quote}&rdquo;</PullQuote>
                    <p className="max-w-2xl border-l-2 border-textPrimary/15 pl-5 text-[16px] font-medium leading-relaxed text-textPrimary/95 md:text-[17px]">
                      <span className="font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-textSecondary">
                        Design implication ·{" "}
                      </span>
                      {ins.implication}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="direction" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>From research to direction</Eyebrow>
            <SectionTitle className="mt-6">Liner as connective tissue</SectionTitle>
            <Prose className="mt-10">
              <p>
                These five insights did not only describe pain. They pointed to a coherent design space. Liner&apos;s
                opportunity is not to build another collaborative editor. It is to become the layer that makes
                AI-assisted research <span className="font-medium text-textPrimary">legible to a team</span>: preserving
                context, signaling trust, and managing state across the messy middle of collaborative research.
              </p>
              <p className="text-textPrimary">
                Framing: <strong className="font-medium">Liner as connective tissue between private AI reasoning and shared team accountability.</strong> That became the foundation for design criteria development and concept generation.
              </p>
            </Prose>
          </Reveal>
        </section>

        <section id="process" className="scroll-mt-28 space-y-10 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>How I work</Eyebrow>
            <SectionTitle className="mt-6">What this project demonstrates</SectionTitle>
            <ul className="mt-10 max-w-2xl space-y-8 text-[17px] leading-relaxed text-textSecondary md:text-lg">
              <li>
                <span className="font-medium text-textPrimary">I use AI as a research accelerator, not a shortcut.</span>{" "}
                During synthesis, I used AI to cross-reference interview patterns, generate competing interpretations, and
                pressure-test framings, then made editorial calls on what was signal.
              </li>
              <li>
                <span className="font-medium text-textPrimary">I structure ambiguity before I solve it.</span> The brief
                was open-ended. I helped build a research architecture (three phases, cross-disciplinary recruiting, expert
                interview before users) so conclusions had a defensible foundation.
              </li>
              <li>
                <span className="font-medium text-textPrimary">I translate research into product language.</span> Every
                insight above ends with a design implication on purpose. Research that does not connect to decisions is
                wallpaper.
              </li>
              <li>
                <span className="font-medium text-textPrimary">I design for the system, not the screen.</span>{" "}
                Competitive analysis, structural gap mapping, and the privacy architecture insight do not show up in a
                single UI, but they are why a UI built on this research can hold together.
              </li>
            </ul>
          </Reveal>
        </section>

        <section id="status" className="scroll-mt-28 space-y-10 pb-8 pt-24 md:pt-32 lg:pt-40">
          <Reveal>
            <Eyebrow>Status</Eyebrow>
            <SectionTitle className="mt-6">Where the work stands</SectionTitle>
            <Prose className="mt-10">
              <p>
                Research synthesis is complete. The team is moving into design criteria and exploratory concept
                development with Liner&apos;s product team.
              </p>
            </Prose>
            <p className="mt-14 max-w-2xl font-mono text-[11px] leading-relaxed text-textSecondary/80">
              North4 Studio — Monica Zhang, Jenn Koh, Jen Zhang, Yuan Fang
              <br />
              UW HCDE Capstone · Spring 2025
            </p>
            <Link
              href="/#work"
              className="mt-10 inline-block text-sm text-textSecondary underline decoration-black/15 underline-offset-4 transition-colors hover:text-textPrimary"
            >
              ← Back to selected work
            </Link>
          </Reveal>
        </section>
      </article>
    </div>
  );
}
