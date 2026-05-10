// Spec §6.16 — TimestampDivider, centered caption-tertiary

const C = {
  ink500: "#999999",
};

export function TimestampDivider({
  time,
  subtitle,
}: {
  time: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "12px 0 4px",
      }}
    >
      <span style={{ fontSize: 11, color: C.ink500, lineHeight: "14px" }}>{time}</span>
      {subtitle && (
        <span style={{ fontSize: 11, color: C.ink500, lineHeight: "14px", textAlign: "center", maxWidth: 240 }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
