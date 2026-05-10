"use client";

import { Check } from "lucide-react";

const STEPS = ["诊断", "匹配", "报价", "预约"];

type Props = {
  current: number; // 1-based
};

export function ProgressStrip({ current }: Props) {
  return (
    <div className="flex items-center bg-white border-b border-meituan-border px-4 py-2 shrink-0">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold
                  ${done ? "bg-meituan-success text-white" : active ? "bg-meituan-yellow text-meituan-text-primary" : "bg-meituan-bg-chip text-meituan-text-tertiary"}`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : step}
              </div>
              <span
                className={`text-[10px] ${active ? "text-meituan-text-primary font-medium" : done ? "text-meituan-success" : "text-meituan-text-tertiary"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-1 mb-3">
                <div className="h-[1px] bg-meituan-border" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
