/**
 * SplitTextChars — per-character stagger slide on hover.
 *
 * Wrap any button/link with `group` class, then use this as children.
 * Include the arrow character (↗ or →) in the text string.
 *
 * Works in both Server and Client components; hover is pure CSS.
 */
export function SplitTextChars({
  text,
  stagger = 18,
}: {
  text: string;
  stagger?: number;
}) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden leading-[1.1]">
          <span
            className="block translate-y-0 transition-transform duration-300 ease-portfolio group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 translate-y-full transition-transform duration-300 ease-portfolio group-hover:translate-y-0"
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </>
  );
}
