export function Avatar({
  label = "?",
  size = 36,
}: {
  label?: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-[8px] bg-[rgba(22,119,255,0.08)] border border-dashed border-gray-200 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-[10px] font-medium text-[#C0C0C0] text-center leading-tight px-0.5">
        {label}
      </span>
    </div>
  );
}
