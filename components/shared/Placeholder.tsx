const TINT_BG: Record<string, string> = {
  blue: "rgba(22, 119, 255, 0.10)",
  "blue-soft": "rgba(22, 119, 255, 0.05)",
  yellow: "rgba(255, 195, 0, 0.14)",
  "yellow-soft": "rgba(255, 248, 224, 0.90)",
  orange: "rgba(255, 105, 0, 0.10)",
  warm: "rgba(255, 241, 232, 0.90)",
  gray: "rgba(242, 242, 242, 1)",
  default: "rgba(245, 245, 245, 1)",
};

export function Placeholder({
  width,
  height,
  label,
  tint = "default",
  className = "",
}: {
  width: number | string;
  height: number | string;
  label: string;
  tint?: string;
  className?: string;
}) {
  const bg = TINT_BG[tint] ?? "rgba(245, 245, 245, 1)";

  return (
    <div
      className={`rounded-md border border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width, height, backgroundColor: bg }}
    >
      <span className="text-[11px] font-medium text-[#C0C0C0] text-center px-1 leading-tight">
        {label}
      </span>
    </div>
  );
}
