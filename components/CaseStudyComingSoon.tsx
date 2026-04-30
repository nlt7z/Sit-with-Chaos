import Link from "next/link";

type CaseStudyComingSoonProps = {
  eyebrow: string;
  title: string;
};

/**
 * Placeholder for work routes where the full case study is not published yet.
 */
export function CaseStudyComingSoon({ eyebrow, title }: CaseStudyComingSoonProps) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white">
      <section
        className="mx-auto max-w-content px-6 pb-24 pt-32 md:pb-32 md:pt-40"
        aria-labelledby="coming-soon-heading"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">{eyebrow}</p>
          <h1
            id="coming-soon-heading"
            className="mt-6 font-display text-3xl font-light leading-tight text-textPrimary md:text-4xl"
          >
            {title}
          </h1>
          <p className="mx-auto mt-10 max-w-md rounded-2xl border border-black/[0.06] bg-surfaceAlt/50 px-7 py-8 text-[17px] leading-relaxed text-textSecondary shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            Case study in progress. Full write-up coming soon.
          </p>
          <Link
            href="/#work"
            className="group mt-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary transition-colors duration-500 hover:text-textPrimary"
          >
            <span className="transition-transform duration-500 ease-out group-hover:-translate-x-0.5" aria-hidden>
              ←
            </span>
            Back to selected work
          </Link>
        </div>
      </section>
    </main>
  );
}
