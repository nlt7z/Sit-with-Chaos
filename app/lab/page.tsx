import Link from "next/link";
import { Nav } from "@/components/Nav";

export const metadata = {
  title: "Lab — wow-moment prototypes",
  robots: { index: false, follow: false },
};

const EXPERIMENTS = [
  {
    id: "①",
    href: "/hero-lab",
    title: "Living hero",
    blurb:
      "The headline's three words — research / motion / code — are channel switches. Each one proves itself in a live demo. Auto-cycles at rest.",
    proves: "the whole pitch, in 5 seconds",
  },
  {
    id: "⑦",
    href: "/lab/gallery",
    title: "Dark gallery scroll",
    blurb:
      "Full-screen sticky horizontal gallery — scroll vertically to drive the track sideways. Five work cards, each with a unique abstract SVG visual and lime accents.",
    proves: "dark editorial UI",
  },
  {
    id: "③",
    href: "/lab/lime",
    title: "Lime as signature",
    blurb:
      "Three candidate treatments — scroll line, reading highlighter, cursor companion. The highlighter (B) shipped to the live site.",
    proves: "an ownable brand colour",
  },
  {
    id: "⑥",
    href: "/lab/glass",
    title: "Lime glass field",
    blurb:
      "An interactive 3D still life in the signature lime — glass spheres, discs and arcs under a real lens. Hover racks the depth-of-field focus; drag orbits; scroll dollies.",
    proves: "the palette can hold a whole 3D world",
  },
];

export default function LabIndexPage() {
  return (
    <>
      <Nav />
      <main className="relative min-h-screen bg-white pt-28 md:pt-32">
        <div className="mx-auto max-w-content px-6 pb-24">
          <p className="font-mono text-xs uppercase tracking-widest text-textSecondary">
            Internal · prototypes
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-light leading-snug text-textPrimary md:text-4xl">
            Wow-moment prototypes.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-textSecondary">
            Each is isolated from the live homepage. Idea ⑤ (kill the dark preloader, pour that
            energy into the entrance) is folded into ① — the headline + stage now play a staggered
            spring reveal on load, no gate.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {EXPERIMENTS.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group flex flex-col rounded-2xl border border-black/[0.08] bg-white p-6 transition-[border-color,box-shadow] duration-500 hover:border-transparent hover:shadow-[0_22px_50px_-30px_rgba(0,0,0,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-nltLime focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-light text-textPrimary">{e.id}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nltLime-ink">
                    {e.proves}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-light leading-snug text-textPrimary">
                  {e.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-textSecondary">{e.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-textSecondary opacity-70 transition-opacity group-hover:opacity-100">
                  Open prototype
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
