import type { ReactNode } from "react";

type MacBookFrameProps = {
  /** Screen area: screenshots, scroll regions, etc. */
  children: ReactNode;
  className?: string;
};

/**
 * Tablet-inspired device frame: light shell, thin bezel, soft rounded contour (no laptop base/hinge).
 */
export function MacBookFrame({ children, className = "" }: MacBookFrameProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-[1.35rem] border border-black/[0.05] bg-gradient-to-br from-[#fcfcfd] via-[#f2f2f4] to-[#e8e8ec] p-[7px] shadow-[0_22px_48px_-32px_rgba(0,0,0,0.16),0_6px_20px_-12px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.98)]">
        <div className="overflow-hidden rounded-[1.05rem] bg-[#141416] p-[2px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_2px_8px_rgba(0,0,0,0.35)]">
          {children}
        </div>
      </div>
    </div>
  );
}
