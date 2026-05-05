"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const RESUME_PDF = "/assets/resume/may%20resume.pdf";
const RESUME_PAGE_BG = "/assets/resume/resume-page-bg.png";

export default function ResumePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Nav />
      {/* One scroll column: art + gradient span main + footer (no solid footer crop). */}
      <div className="relative bg-white text-textPrimary">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-neutral-100 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${RESUME_PAGE_BG})` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/78 to-white/88"
        />
        <main className="relative z-10 min-h-[calc(100vh-5rem)]">
          <section
            className="mx-auto max-w-content px-6 pb-16 pt-28 md:pb-20 md:pt-36"
            aria-labelledby="resume-heading"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: easePortfolio }}
              className="mx-auto w-full max-w-3xl text-center"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">Resume</p>
              <h1
                id="resume-heading"
                className="mt-4 font-display text-3xl font-light leading-tight text-textPrimary md:mt-5 md:text-4xl"
              >
                Build with AI
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-textSecondary md:mt-5 md:text-lg">
                I design AI-native products that feel clear, alive, and trustworthy.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-9 md:gap-4">
                <a
                  href={RESUME_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] bg-textPrimary px-7 font-mono text-xs font-medium uppercase tracking-wider text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  Open PDF in new tab
                </a>
                <a
                  href={RESUME_PDF}
                  download
                  className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] bg-white px-7 font-mono text-xs font-medium uppercase tracking-wider text-textPrimary transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  Download PDF
                </a>
              </div>
            </motion.div>

            <div
              id="resume-preview"
              className="mx-auto mt-6 w-full max-w-[min(100%,72rem)] overflow-hidden rounded-2xl border border-black/[0.1] bg-white/90 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.14)] ring-1 ring-white/70 backdrop-blur-sm md:mt-8"
            >
              <iframe
                title="Yuan Fang resume preview"
                src={RESUME_PDF}
                className="block h-[calc(100dvh-14rem)] w-full bg-white sm:h-[calc(100dvh-13rem)] md:h-[calc(100dvh-11.5rem)] md:min-h-[620px]"
              />
            </div>

            <Link
              href="/#work"
              className="mx-auto mt-8 block w-fit text-sm text-textSecondary underline decoration-[rgba(0,0,0,0.12)] underline-offset-4 transition-colors hover:text-textPrimary md:mt-10"
            >
              ← Back to selected work
            </Link>
          </section>
        </main>
        <Footer blendBackground />
      </div>
    </>
  );
}
