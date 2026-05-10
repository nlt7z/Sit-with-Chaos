"use client";

export function SuggestedQuestion({
  text,
  onTap,
}: {
  text: string;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="text-left text-[14px] text-meituan-blue leading-snug active:opacity-50 transition-opacity"
    >
      {text}
    </button>
  );
}
