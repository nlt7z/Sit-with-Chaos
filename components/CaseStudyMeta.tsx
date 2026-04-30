type CaseStudyMetaProps = {
  tags: readonly string[];
  role: string;
  year: string;
  className?: string;
};

/** Single compact line: tags · role · year (matches former work card facts). */
export function CaseStudyMeta({ tags, role, year, className = "" }: CaseStudyMetaProps) {
  return (
    <p className={`font-mono text-[11px] leading-relaxed tracking-[0.06em] text-textSecondary/80 ${className}`}>
      <span>{tags.join(" · ")}</span>
      <span className="mx-2 select-none text-black/[0.22]" aria-hidden>
        ·
      </span>
      <span>{role}</span>
      <span className="mx-2 select-none text-black/[0.22]" aria-hidden>
        ·
      </span>
      <span>{year}</span>
    </p>
  );
}
