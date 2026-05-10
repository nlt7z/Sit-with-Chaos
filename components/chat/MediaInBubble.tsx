"use client";

import { Placeholder } from "@/components/shared/Placeholder";

export function MediaInBubble({
  mediaKind,
  label,
  duration,
}: {
  mediaKind: "photo" | "video";
  label: string;
  duration?: string;
}) {
  const w = 180;
  const h = mediaKind === "video" ? 240 : 200;

  return (
    <div className="relative inline-block">
      <Placeholder
        width={w}
        height={h}
        label={label}
        tint="gray"
        className="rounded-[10px]"
      />
      {mediaKind === "video" && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                <path d="M6 3.5l9 5.5-9 5.5V3.5z" />
              </svg>
            </div>
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/50 rounded px-1.5 py-0.5">
              <span className="text-[11px] font-medium text-white tabular-nums">
                {duration}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
