"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const easePortfolio = [0.25, 0.1, 0.25, 1] as const;

const RESUME_PDF = "/assets/resume/latest%20resume%20apr.pdf";

export default function ResumePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Nav />
      <main className="min-h-[calc(100vh-5rem)] bg-white">
        <section
          className="mx-auto max-w-content px-6 pb-24 pt-32 md:pb-32 md:pt-40"
          aria-labelledby="resume-heading"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easePortfolio }}
            className="mx-auto w-full max-w-5xl"
          >
            <p className="text-center font-mono text-xs uppercase tracking-widest text-textSecondary">Resume</p>
            <h1
              id="resume-heading"
              className="mt-6 text-center font-display text-3xl font-light leading-tight text-textPrimary md:text-4xl"
            >
              Build with AI
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-textSecondary md:text-lg">
             Yuan Fang is a product designer focused on AI-native experiences.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
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
            <div className="mt-10 overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.12)] bg-white shadow-sm">
              <iframe
                title="Yuan Fang resume preview"
                src={RESUME_PDF}
                className="h-[75vh] min-h-[680px] w-full"
              />
            </div>
            <Link
              href="/#work"
              className="mx-auto mt-10 block w-fit text-sm text-textSecondary underline decoration-[rgba(0,0,0,0.12)] underline-offset-4 transition-colors hover:text-textPrimary"
            >
              ← Back to selected work
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
