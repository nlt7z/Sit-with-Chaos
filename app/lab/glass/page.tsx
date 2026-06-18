import Link from "next/link";
import { LimeGlassField } from "@/components/LimeGlassField";

export const metadata = {
  title: "Lab — lime glass field",
  robots: { index: false, follow: false },
};

export default function LimeGlassPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#FBFDF2]">
      <LimeGlassField />

      {/* Soft lens vignette over the 3D canvas. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, transparent 62%, rgba(90,122,18,0.07) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
        <header className="flex items-start justify-between">
          <div>
            <Link
              href="/lab"
              className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary transition-colors hover:text-textPrimary"
            >
              ← Lab
            </Link>
            <h1 className="mt-3 font-display text-2xl font-light leading-snug text-textPrimary md:text-3xl">
              Lime glass field
            </h1>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-textSecondary">
              A 3D still life in the signature lime — with a real lens: shallow depth of field
              that racks focus to whatever you point at.
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-nltLime-ink md:block">
            three.js · bokeh DoF
          </span>
        </header>

        <footer className="flex items-end justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary">
            drag — orbit&ensp;·&ensp;hover — refocus&ensp;·&ensp;scroll — dolly
          </p>
          <span className="h-2.5 w-2.5 rounded-full bg-nltLime" aria-hidden />
        </footer>
      </div>
    </main>
  );
}
