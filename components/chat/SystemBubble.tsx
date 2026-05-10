// Spec §6.6 — centered caption-tertiary, orange highlight for name, 16px v-margin

const C = {
  ink500: "#999999",
  priceOrange: "#FF6B00",
};

export function SystemBubble({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) {
  const parts = highlight ? text.split(highlight) : [text];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        margin: "16px 0",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: C.ink500,
          lineHeight: "16px",
          textAlign: "center",
        }}
      >
        {highlight ? (
          <>
            {parts[0]}
            <span style={{ fontWeight: 500, color: C.priceOrange }}>{highlight}</span>
            {parts[1]}
          </>
        ) : (
          text
        )}
      </span>
    </div>
  );
}
