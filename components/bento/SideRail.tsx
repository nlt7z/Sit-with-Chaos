import Link from "next/link";

/**
 * SideRail — the fixed vertical switch on the far-left edge, shown on the three
 * top-level surfaces: Home (the bento), Work (the work cards) and Lab (the
 * vibe-coding showcase). The active section is highlighted in lime.
 */

const ITEMS = [
  { key: "home", label: "Home", href: "/" },
  { key: "work", label: "Work", href: "/work" },
  { key: "lab", label: "Lab", href: "/vibe-coding" },
] as const;

export function SideRail({ active }: { active: "home" | "work" | "lab" }) {
  return (
    <nav aria-label="Sections" className="fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 md:block">
      <div className="flex flex-col gap-1.5 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {ITEMS.map((it) => {
          const on = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-label={it.label}
              aria-current={on ? "page" : undefined}
              className={`flex items-center justify-center rounded-full px-2 py-5 transition-colors ${
                on ? "bg-nltLime text-[#1d1d1f]" : "text-white/45 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="rotate-180 font-mono text-[10px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
