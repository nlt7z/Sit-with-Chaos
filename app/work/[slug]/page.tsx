import type { Metadata } from "next";
import Link from "next/link";

const projects: Record<string, string> = {
  "liner-scholar": "Liner AI Scholar — Collaborative Deep-Research Workflow",
  "ai-character": "New Experience for Alibaba AI Character",
  "apsara-conference": "Apsara Conference — Alibaba AI on Cloud",
  qoder: "Agentic Coding Platform for Real Software",
  "meituan-im": "Expert Analysis and Multi-round Quotation for IM System",
  "studio-engine": "Studio Engine.ai — GenAI Filmmaking Solution",
  ridesharing: "AI Ride — Autonomous Ridesharing Experience",
};

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const title = projects[params.slug] ?? "Project";
  return {
    title: `${title} — Yuan Fang`,
    description: "Case study — full content coming soon.",
  };
}

/**
 * Fallback for unknown slugs only. Known projects use dedicated routes under app/work/.
 */
export default function CaseStudyPage({ params }: PageProps) {
  const title = projects[params.slug] ?? "Project";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <p className="mb-4 font-mono text-sm uppercase tracking-wider text-neutral-400">Case Study</p>
        <h1 className="mb-8 max-w-lg text-3xl font-light text-neutral-900">{title}</h1>
        <p className="mb-8 text-sm text-neutral-400">Full case study coming soon.</p>
        <Link
          href="/#work"
          className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
        >
          ← Back to work
        </Link>
      </div>
    </main>
  );
}
