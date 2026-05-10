"use client";

type Props = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export function SymptomChip({ label, selected, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-xl text-[14px] border transition-all active:scale-[0.96]
        ${selected
          ? "bg-meituan-yellow-soft border-meituan-yellow text-meituan-text-primary font-medium"
          : "bg-meituan-bg-chip border-transparent text-meituan-text-secondary"
        }`}
    >
      {label}
    </button>
  );
}
